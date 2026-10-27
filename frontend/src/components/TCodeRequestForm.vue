<template>
  <main class="min-h-screen bg-gray-100 p-4">
    <div class="max-w-3xl mx-auto">
      <header class="flex items-center justify-between mb-6 gap-4">
        <div><h1 class="text-2xl font-bold text-blue-900">T-Code Access System</h1><p class="text-gray-600">{{ requestId ? 'Edit access request' : 'New SAP access request' }}</p></div>
        <button type="button" @click="router.push('/')" class="text-blue-700 font-bold">Back</button>
      </header>
      <p v-if="loading" role="status">Loading request…</p>
      <p v-if="error" role="alert" class="text-red-700 mb-4">{{ error }}</p>
      <form v-if="!loading && editable" @submit.prevent="save" class="bg-white rounded-2xl shadow p-6 space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label>Request number<input v-model.trim="form.requestNumber" required maxlength="100" placeholder="REQ-2026-001" /></label>
          <label>Requester name<input v-model.trim="form.requesterName" required maxlength="200" autocomplete="name" /></label>
          <label>SAP user ID<input v-model.trim="form.sapUserId" required maxlength="100" placeholder="SAP user receiving access" /></label>
          <label>Department<input v-model.trim="form.department" maxlength="200" placeholder="e.g. Operations" /></label>
          <label>SAP system<input v-model.trim="form.sapSystem" required maxlength="100" placeholder="e.g. PRD" /></label>
          <label>SAP client<input v-model="form.sapClient" required pattern="[0-9]{3}" maxlength="3" inputmode="numeric" placeholder="e.g. 100" /></label>
          <label>Access duration<select v-model="form.accessType"><option value="temporary">Temporary</option><option value="ongoing">Ongoing</option></select></label>
          <label>Valid from<input v-model="form.validFrom" type="date" required /></label>
          <label v-if="form.accessType === 'temporary'">Valid until<input v-model="form.validUntil" type="date" required :min="form.validFrom" /></label>
        </div>
        <label class="block">Requested T-codes<textarea v-model="tcodeText" required rows="3" placeholder="One per line or separated by commas, e.g. VA01, VA03" /></label>
        <label class="block">Business justification<textarea v-model.trim="form.businessJustification" required maxlength="4000" rows="4" placeholder="Explain the business tasks that require these transactions" /></label>
        <p class="text-sm text-gray-500">Save a draft, then submit it from the request list. Approval records a decision; your SAP administrator provisions access separately.</p>
        <button :disabled="saving" class="bg-blue-700 text-white font-bold px-6 py-3 rounded-lg disabled:opacity-50">{{ saving ? 'Saving…' : 'Save draft' }}</button>
      </form>
    </div>
  </main>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import API_URL from '../config.js'
const props = defineProps({ requestId: { type: String, default: '' } })
const router = useRouter()
const form = ref({ requestNumber: '', requesterName: '', sapUserId: '', department: '', sapSystem: '', sapClient: '', businessJustification: '', accessType: 'temporary', validFrom: '', validUntil: '' })
const tcodeText = ref('')
const error = ref('')
const loading = ref(Boolean(props.requestId))
const saving = ref(false)
const editable = ref(true)
const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }
onMounted(async () => {
  if (!props.requestId) return
  try {
    const res = await fetch(`${API_URL}/api/tcode-requests/${props.requestId}`, { headers })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Unable to load request')
    if (data.status !== 'draft') throw new Error('Only drafts can be edited')
    for (const key of Object.keys(form.value)) form.value[key] = data[key] || ''
    for (const key of ['validFrom', 'validUntil']) form.value[key] = form.value[key]?.slice(0, 10) || ''
    tcodeText.value = (data.tcodes || []).join('\n')
  } catch (e) { error.value = e.message; editable.value = false }
  finally { loading.value = false }
})
async function save() {
  error.value = ''
  const tcodes = [...new Set(tcodeText.value.toUpperCase().split(/[\s,;]+/).filter(Boolean))]
  if (!tcodes.length || tcodes.length > 100 || tcodes.some(code => !/^[A-Z0-9_/]{1,40}$/.test(code))) { error.value = 'Provide 1–100 T-codes using letters, numbers, underscores or slashes'; return }
  saving.value = true
  try {
    const res = await fetch(`${API_URL}/api/tcode-requests${props.requestId ? '/' + props.requestId : ''}`, {
      method: props.requestId ? 'PUT' : 'POST', headers,
      body: JSON.stringify({ ...form.value, validUntil: form.value.accessType === 'temporary' ? form.value.validUntil : null, tcodes })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Unable to save request')
    router.push('/')
  } catch (e) { error.value = e.message }
  finally { saving.value = false }
}
</script>
<style scoped>
label { font-weight: 600; color: #374151; }
input, select, textarea { display: block; width: 100%; border: 1px solid #d1d5db; border-radius: .5rem; padding: .65rem; margin-top: .35rem; font-weight: 400; }
input:focus, select:focus, textarea:focus { outline: 2px solid #2563eb; outline-offset: 1px; }
</style>
