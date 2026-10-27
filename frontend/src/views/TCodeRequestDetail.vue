<template>
  <main class="min-h-screen bg-gray-100 p-4">
    <article class="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
      <header class="flex justify-between items-center gap-3 mb-6">
        <div><h1 class="text-2xl font-bold text-blue-900">T-Code Access Request</h1><p class="text-gray-500">SAP user access approval</p></div>
        <div class="flex gap-4 print:hidden"><button @click="printRequest" :disabled="!request" class="text-blue-700">Print</button><button @click="router.push('/')" class="text-blue-700">Back</button></div>
      </header>
      <p v-if="error" role="alert" class="text-red-700">{{ error }}</p>
      <p v-else-if="!request" role="status">Loading request…</p>
      <template v-else>
        <h2 class="text-lg font-bold mb-4">{{ request.requestNumber }}</h2>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="[label, value] in details" :key="label"><dt class="text-sm font-bold text-gray-500">{{ label }}</dt><dd class="break-words">{{ value || '—' }}</dd></div>
        </dl>
        <h3 class="font-bold text-blue-900 mt-6 mb-2">Requested T-codes</h3>
        <ul class="flex gap-2 flex-wrap"><li v-for="code in request.tcodes" :key="code" class="bg-blue-50 rounded px-3 py-2 font-mono">{{ code }}</li></ul>
        <h3 class="font-bold text-blue-900 mt-6 mb-2">Business justification</h3>
        <p class="whitespace-pre-wrap break-words">{{ request.businessJustification }}</p>
        <h3 class="font-bold text-blue-900 mt-6 mb-2">Approval history</h3>
        <p v-if="!request.approvals?.length" class="text-gray-500">No approvals recorded.</p>
        <ul><li v-for="approval in request.approvals" :key="approval._id" class="py-2 border-b capitalize">{{ approval.role }} · {{ approval.approvedBy }} · {{ formatDate(approval.date) }}</li></ul>
        <p class="text-sm text-gray-500 mt-6">Approval does not grant access inside SAP. Provisioning and expiry enforcement require a SAP administrator or a separately configured integration.</p>
      </template>
    </article>
  </main>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import API_URL from '../config.js'
const route = useRoute(), router = useRouter()
const request = ref(null), error = ref('')
const labels = { draft: 'Draft', pending_manager: 'Pending manager', pending_finance: 'Pending finance', pending_director: 'Pending director', approved: 'Approved' }
const formatDate = value => value ? new Date(value).toLocaleDateString() : ''
const details = computed(() => request.value ? [
  ['Requester', request.value.requesterName], ['SAP user ID', request.value.sapUserId], ['Department', request.value.department], ['SAP system', request.value.sapSystem], ['SAP client', request.value.sapClient], ['Status', labels[request.value.status]], ['Access duration', request.value.accessType], ['Valid from', formatDate(request.value.validFrom)], ['Valid until', formatDate(request.value.validUntil)], ['Created', formatDate(request.value.createdAt)]
] : [])
watch(() => route.params.id, async id => {
  request.value = null; error.value = ''
  try {
    const res = await fetch(`${API_URL}/api/tcode-requests/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Unable to load request')
    request.value = data
  } catch (e) { error.value = e.message }
}, { immediate: true })
function printRequest() { window.print() }
</script>
