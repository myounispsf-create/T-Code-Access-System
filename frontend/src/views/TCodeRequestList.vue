<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <div class="bg-blue-800 text-white px-4 py-3 flex justify-between items-center shadow-lg">
      <div class="flex items-center gap-2">
        <span class="text-xl">📄</span>
        <h1 class="text-lg font-bold truncate max-w-[150px] md:max-w-none">{{ companyName }}</h1>
      </div>
      <div class="flex gap-2 items-center">
        <span class="text-blue-200 text-sm hidden md:block">👋 {{ username }}</span>
        <button @click="logout"
          class="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition text-sm font-medium">
          Logout
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-6xl mx-auto p-4">

      <!-- Top Bar -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-700">All T-Code Requests</h2>
        <button v-if="role === 'creator'" @click="$router.push('/create')"
          class="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold transition text-sm">
          + New T-Code Request
        </button>
      </div>

      <p v-if="error" class="text-red-600 mb-4" role="alert">{{ error }}</p>

      <!-- Search -->
      <div class="mb-4">
        <input v-model="search" placeholder="🔍 Search by SAP user ID or request number..."
          class="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white shadow-sm" />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-20">
        <div class="text-blue-700 text-xl font-bold animate-pulse">⏳ Loading requests...</div>
      </div>

      <!-- Desktop Table -->
      <div v-if="!loading" class="hidden md:block bg-white rounded-2xl shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-blue-800 text-white">
            <tr>
              <th class="px-4 py-3 text-left text-sm">Request #</th>
              <th class="px-4 py-3 text-left text-sm">SAP User</th>
              <th class="px-4 py-3 text-left text-sm">Date</th>
              <th class="px-4 py-3 text-right text-sm">T-codes</th>
              <th class="px-4 py-3 text-center text-sm">Status</th>
              <th class="px-4 py-3 text-center text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in filteredRequests" :key="request._id"
              class="border-b hover:bg-gray-50 transition">
              <td class="px-4 py-3 font-bold text-blue-700 text-sm">#{{ request.requestNumber }}</td>
              <td class="px-4 py-3 text-sm">{{ request.sapUserId }}</td>
              <td class="px-4 py-3 text-sm text-gray-500">
                {{ request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A' }}
              </td>
              <td class="px-4 py-3 text-right font-bold text-sm">{{ request.tcodes?.length || 0 }} T-codes</td>
              <td class="px-4 py-3 text-center">
                <span :class="statusClass(request.status)" class="px-2 py-1 rounded-full text-xs font-bold">
                  {{ statusLabel(request.status) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-1 justify-center flex-wrap">
                  <button @click="viewTCodeRequest(request._id)"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-lg text-xs">
                    👁️ View
                  </button>
                  <template v-if="role === 'creator' && request.status === 'draft'">
                    <button @click="editTCodeRequest(request._id)"
                      class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-lg text-xs">
                      ✏️ Edit
                    </button>
                    <button v-if="request.status === 'draft'" @click="submitTCodeRequest(request._id)"
                      class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-lg text-xs">
                      📤 Submit
                    </button>
                    <button @click="deleteTCodeRequest(request._id)"
                      class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-xs">
                      🗑️ Delete
                    </button>
                  </template>
                  <template v-if="role === 'manager' || role === 'finance' || role === 'director'">
                    <button @click="approveTCodeRequest(request._id)"
                      class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-lg text-xs">
                      ✅ Approve
                    </button>
                    <button @click="rejectTCodeRequest(request._id)"
                      class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-xs">
                      ❌ Reject
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredRequests.length === 0" class="text-center py-10 text-gray-400">
          <p class="text-lg">No requests found!</p>
          <p class="text-sm mt-1">{{ search ? 'Try a different search term' : 'Click "+ New T-Code Request" to create one'
            }}</p>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div v-if="!loading" class="md:hidden space-y-3">
        <div v-for="request in filteredRequests" :key="request._id"
          class="bg-white rounded-2xl shadow-md p-4 border-l-4 border-blue-600">
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="font-bold text-blue-700 text-lg">#{{ request.requestNumber }}</p>
              <p class="text-gray-600 text-sm">{{ request.sapUserId }}</p>
            </div>
            <span :class="statusClass(request.status)" class="px-2 py-1 rounded-full text-xs font-bold">
              {{ statusLabel(request.status) }}
            </span>
          </div>
          <div class="flex justify-between items-center mb-3 text-sm text-gray-500">
            <span>📅 {{ request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A' }}</span>
            <span class="font-bold text-gray-800">{{ request.tcodes?.length || 0 }} T-codes</span>
          </div>
          <div class="flex gap-2 flex-wrap">
            <button @click="viewTCodeRequest(request._id)"
              class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex-1 text-center">
              👁️ View
            </button>
            <template v-if="role === 'creator' && request.status === 'draft'">
              <button @click="editTCodeRequest(request._id)"
                class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm flex-1 text-center">
                ✏️ Edit
              </button>
              <button v-if="request.status === 'draft'" @click="submitTCodeRequest(request._id)"
                class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm flex-1 text-center">
                📤 Submit
              </button>
              <button @click="deleteTCodeRequest(request._id)"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm flex-1 text-center">
                🗑️ Delete
              </button>
            </template>
            <template v-if="role === 'manager' || role === 'finance' || role === 'director'">
              <button @click="approveTCodeRequest(request._id)"
                class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm flex-1 text-center">
                ✅ Approve
              </button>
              <button @click="rejectTCodeRequest(request._id)"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm flex-1 text-center">
                ❌ Reject
              </button>
            </template>
          </div>
        </div>
        <div v-if="filteredRequests.length === 0"
          class="text-center py-10 text-gray-400 bg-white rounded-2xl shadow">
          <p class="text-lg">No requests found!</p>
          <p class="text-sm mt-1">{{ search ? 'Try a different search term' : 'Click "+ New T-Code Request" to create one'
            }}</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import API_URL from '../config.js'

const router = useRouter()
const requests = ref([])
const search = ref('')
const loading = ref(true)
const error = ref('')
const username = ref(localStorage.getItem('username') || '')
const companyName = ref(localStorage.getItem('companyName') || '')
const role = ref(localStorage.getItem('role') || 'creator')
const token = localStorage.getItem('token')

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}

onMounted(async () => {
  if (!token) {
    router.push('/login')
    return
  }
  try {
    const res = await fetch(`${API_URL}/api/tcode-requests`, { headers })
    const data = await res.json()
    if (!res.ok) { error.value = data.message; return }
    requests.value = data
  } catch { error.value = 'Unable to load requests' }
  finally { loading.value = false }
})

const filteredRequests = computed(() => {
  if (!search.value) return requests.value
  const s = search.value.toLowerCase()
  return requests.value.filter(i =>
    i.sapUserId?.toLowerCase().includes(s) ||
    i.requestNumber?.toLowerCase().includes(s)
  )
})

function statusClass(status) {
  return {
    'bg-gray-200 text-gray-700': status === 'draft',
    'bg-yellow-200 text-yellow-700': status === 'pending_manager',
    'bg-blue-200 text-blue-700': status === 'pending_finance',
    'bg-purple-200 text-purple-700': status === 'pending_director',
    'bg-green-200 text-green-700': status === 'approved'
  }
}

function statusLabel(status) {
  const labels = {
    draft: '📝 Draft',
    pending_manager: '⏳ Manager',
    pending_finance: '⏳ Finance',
    pending_director: '⏳ Director',
    approved: '✅ Approved'
  }
  return labels[status] || status
}

function viewTCodeRequest(id) { router.push(`/tcode-request/${id}`) }
function editTCodeRequest(id) { router.push(`/edit/${id}`) }

async function deleteTCodeRequest(id) {
  if (!confirm('Are you sure you want to delete this request?')) return
  if (!await performAction(`${API_URL}/api/tcode-requests/${id}`, 'DELETE')) return
  requests.value = requests.value.filter(i => i._id !== id)
}

async function submitTCodeRequest(id) {
  if (!confirm('Submit this request for approval?')) return
  if (!await performAction(`${API_URL}/api/tcode-requests/submit/${id}`, 'POST')) return
  requests.value = requests.value.map(i => i._id === id ? { ...i, status: 'pending_manager' } : i)
  alert('Request submitted for approval! ✅')
}

async function approveTCodeRequest(id) {
  if (!confirm('Approve this request?')) return
  if (!await performAction(`${API_URL}/api/tcode-requests/approve/${id}`, 'POST')) return
  requests.value = requests.value.filter(i => i._id !== id)
  alert('Request approved! ✅')
}

async function rejectTCodeRequest(id) {
  if (!confirm('Reject this request?')) return
  if (!await performAction(`${API_URL}/api/tcode-requests/reject/${id}`, 'POST')) return
  requests.value = requests.value.filter(i => i._id !== id)
  alert('Request rejected! ❌')
}

async function performAction(url, method) {
  error.value = ''
  try {
    const res = await fetch(url, { method, headers })
    const data = await res.json()
    if (!res.ok) { error.value = data.message; return false }
    return true
  } catch { error.value = 'Unable to reach the server'; return false }
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('companyName')
  localStorage.removeItem('role')
  router.push('/login')
}
</script>