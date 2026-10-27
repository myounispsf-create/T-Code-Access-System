const { test, before, after, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const request = require('supertest')
const { MongoMemoryServer } = require('mongodb-memory-server')
const { createApp } = require('../app')
const User = require('../models/User')
const TCodeRequest = require('../models/TCodeRequest')
process.env.JWT_SECRET = 'isolated-test-secret-with-more-than-32-characters'
process.env.CORS_ORIGINS = 'https://demo.example'
let db, app, owner, other, manager, finance, director, outsider, draft
const org = new mongoose.Types.ObjectId()
const content = { requestNumber:'DEMO-1', requesterName:'Demo User', sapUserId:'DEMOUSER', department:'Operations', sapSystem:'QAS', sapClient:'100', businessJustification:'Test access workflow', accessType:'temporary', validFrom:'2026-11-01', validUntil:'2026-11-30', tcodes:['VA03'] }
const token = u => jwt.sign({ id: String(u._id) }, process.env.JWT_SECRET)
const api = (method, url, u = owner) => request(app)[method]('/api/tcode-requests'+url).set('Authorization','Bearer '+token(u))
before(async () => {
  db = await MongoMemoryServer.create()
  await mongoose.connect(db.getUri())
  await Promise.all([User.init(),TCodeRequest.init()])
  app = createApp()
})
after(async () => { await mongoose.disconnect(); if (db) await db.stop() })
beforeEach(async () => {
  await Promise.all([User.deleteMany({}),TCodeRequest.deleteMany({})])
  const make = (username,role,organizationId=org) => User.create({username,role,organizationId,companyName:'Demo',password:'unused'})
  ;[owner,other,manager,finance,director,outsider] = await Promise.all([
    make('owner','creator'), make('other','creator'), make('manager','manager'),make('finance','finance'),make('director','director'),make('outsider','manager',new mongoose.Types.ObjectId())
  ])
  draft = await TCodeRequest.create({...content,user:owner._id,organizationId:org})
})
test('registration ignores role and organization; login rejects object injection',async () => {
  const input = {username:'new',password:'password123',companyName:'Demo',role:'director',organizationId:String(org)}
  assert.equal((await request(app).post('/api/auth/register').send(input)).status,201)
  const user = await User.findOne({username:'new'})
  assert.equal(user.role,'creator'); assert.equal(user.organizationId,null); assert.notEqual(user.password,input.password)
  assert.equal((await request(app).post('/api/auth/register').send(input)).status,409)
  const login = await request(app).post('/api/auth/login').send(input)
  assert.equal(login.status,200); assert.equal(login.body.role,'creator')
  assert.equal((await request(app).post('/api/auth/login').send({username:{$ne:null},password:input.password})).status,400)
})
test('every request operation requires authentication and current account',async () => {
  for(const [method,url] of [['get',''],['get','/'+draft.id],['post',''],['put','/'+draft.id],['delete','/'+draft.id],...['submit','approve','reject'].map(a=>['post','/'+a+'/'+draft.id])]) {
    assert.equal((await request(app)[method]('/api/tcode-requests'+url)).status,401)
  }
  const saved = token(owner); await User.deleteOne({_id:owner._id})
  assert.equal((await request(app).get('/api/tcode-requests').set('Authorization','Bearer '+saved)).status,401)
  assert.equal((await request(app).get('/api/tcode-requests').set('Authorization','Basic '+token(other))).status,401)
  assert.equal((await request(app).get('/api/tcode-requests').set('Authorization','Bearer '+jwt.sign({id:other.id},process.env.JWT_SECRET,{expiresIn:-1}))).status,401)
})
test('creators only list, read, edit, delete and submit their own records',async () => {
  assert.deepEqual((await api('get','',other)).body,[])
  for(const [method,prefix] of [['get','/'],['put','/'],['delete','/'],['post','/submit/']]) assert.equal((await api(method,prefix+draft.id,other).send({requesterName:'stolen'})).status,404)
  assert.equal((await TCodeRequest.findById(draft.id)).status,'draft')
  assert.equal((await api('get','/invalid')).status,400)
  assert.equal((await api('get','/'+new mongoose.Types.ObjectId())).status,404)
})
test('create and update allow only request content, never security/workflow fields or operators',async () => {
  const input = {...content,requestNumber:'DEMO-2',user:other.id,organizationId:String(outsider.organizationId),status:'approved',approvals:[{role:'director'}],requesterName:'Allowed',$set:{status:'approved'}}
  for(const [method,url] of [['post',''],['put','/'+draft.id]]) {
    const res = await api(method,url).send(input)
    assert.equal(res.status,method==='post'?201:200)
    assert.equal(res.body.user,owner.id); assert.equal(res.body.organizationId,String(org)); assert.equal(res.body.status,'draft'); assert.deepEqual(res.body.approvals,[]); assert.equal(res.body.requesterName,'Allowed')
    input.requestNumber = 'DEMO-3'
  }
  assert.equal((await api('put','/'+draft.id).send({sapClient:'invalid-client'})).status,400)
})
test('only creators create, and only drafts can be modified or submitted',async () => {
  assert.equal((await api('post','',manager).send({requestNumber:'NO'})).status,403)
  assert.equal((await api('post','/submit/'+draft.id)).status,200)
  assert.equal((await api('put','/'+draft.id).send({total:1})).status,404)
  assert.equal((await api('delete','/'+draft.id)).status,404)
  assert.equal((await api('post','/submit/'+draft.id)).status,404)
})
test('review scopes enforce organization and stage, and concurrent approvals advance once',async () => {
  await api('post','/submit/'+draft.id)
  for(const actor of [outsider,finance,director]) {
    assert.deepEqual((await api('get','',actor)).body,[])
    assert.equal((await api('get','/'+draft.id,actor)).status,404)
    for(const action of ['approve','reject']) assert.equal((await api('post','/'+action+'/'+draft.id,actor)).status,404)
  }
  assert.equal((await api('get','',manager)).body.length,1)
  assert.equal((await api('post','/approve/'+draft.id)).status,403)
  const results = await Promise.all([api('post','/approve/'+draft.id,manager),api('post','/approve/'+draft.id,manager)])
  assert.deepEqual(results.map(r=>r.status).sort(),[200,404])
  assert.equal((await api('post','/approve/'+draft.id,finance)).status,200)
  const approved = await api('post','/approve/'+draft.id,director)
  assert.equal(approved.status,200); assert.equal(approved.body.request.status,'approved')
  assert.deepEqual(approved.body.request.approvals.map(a=>a.role),['manager','finance','director'])
})
test('rejection clears approvals and returns editable draft to its owner',async () => {
  await api('post','/submit/'+draft.id); await api('post','/approve/'+draft.id,manager)
  const rejected = await api('post','/reject/'+draft.id,finance)
  assert.equal(rejected.status,200); assert.equal(rejected.body.request.status,'draft'); assert.deepEqual(rejected.body.request.approvals,[])
  assert.equal((await api('put','/'+draft.id).send({requesterName:'Corrected'})).status,200)
  assert.equal((await api('post','/submit/'+draft.id)).status,200)
})
test('unassigned accounts, legacy requests and self approval fail closed',async () => {
  owner.organizationId=null; await owner.save()
  assert.equal((await api('post','/submit/'+draft.id)).status,403)
  manager.organizationId=null; await manager.save()
  assert.deepEqual((await api('get','',manager)).body,[])
  assert.equal((await api('post','/approve/'+draft.id,manager)).status,403)
  manager.organizationId=org; await manager.save()
  draft.organizationId=null; draft.status='pending_manager'; await draft.save()
  assert.equal((await api('get','/'+draft.id,manager)).status,404)
  await User.updateOne({_id:owner._id},{$set:{role:'manager',organizationId:org}})
  draft.organizationId=org; await draft.save()
  assert.equal((await api('post','/approve/'+draft.id,owner)).status,404)
})
test('CORS denies unknown origins on both actual requests and preflight',async () => {
  for(const method of ['get','options']) {
    const allowed = await request(app)[method]('/health').set('Origin','https://demo.example').set('Access-Control-Request-Method','POST')
    assert.equal(allowed.headers['access-control-allow-origin'],'https://demo.example'); assert.match(allowed.headers.vary,/Origin/)
    const denied = await request(app)[method]('/health').set('Origin','https://evil.example').set('Access-Control-Request-Method','POST')
    assert.equal(denied.status,403); assert.equal(denied.headers['access-control-allow-origin'],undefined)
  }
  assert.equal((await request(app).get('/health')).status,200)
})

test('SAP request fields enforce required codes, client and valid access dates', async () => {
  for (const invalid of [{sapUserId:''},{sapClient:'10'},{tcodes:[]},{tcodes:['BAD CODE']},{validUntil:null},{validUntil:'2026-10-01'}]) {
    assert.equal((await api('post','').send({...content,requestNumber:'INVALID',...invalid})).status,400)
  }
  assert.equal((await api('put','/'+draft.id).send({validFrom:'2026-12-01'})).status,400)
  const ongoing = await api('post','').send({...content,requestNumber:'ONGOING',accessType:'ongoing',validUntil:null,tcodes:['va03']})
  assert.equal(ongoing.status,201); assert.deepEqual(ongoing.body.tcodes,['VA03'])
  const legacy = await request(app).get('/api/invoices').set('Authorization','Bearer '+token(owner))
  assert.equal(legacy.status,404)
})
