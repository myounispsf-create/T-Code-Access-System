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
        <h2 class="text-xl font-bold text-gray-700">All Invoices</h2>
        <button @click="$router.push('/create')"
          class="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold transition text-sm">
          + New Invoice
        </button>
      </div>

      <!-- Search -->
      <div class="mb-4">
        <input v-model="search" placeholder="🔍 Search by customer name or invoice number..."
          class="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white shadow-sm" />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-20">
        <div class="text-blue-700 text-xl font-bold animate-pulse">⏳ Loading invoices...</div>
      </div>

      <!-- Desktop Table -->
      <div v-else class="hidden md:block bg-white rounded-2xl shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-blue-800 text-white">
            <tr>
              <th class="px-4 py-3 text-left text-sm">Invoice #</th>
              <th class="px-4 py-3 text-left text-sm">Customer</th>
              <th class="px-4 py-3 text-left text-sm">Date</th>
              <th class="px-4 py-3 text-right text-sm">Total</th>
              <th class="px-4 py-3 text-center text-sm">Status</th>
              <th class="px-4 py-3 text-center text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invoice in filteredInvoices" :key="invoice._id"
              class="border-b hover:bg-gray-50 transition">
              <td class="px-4 py-3 font-bold text-blue-700 text-sm">#{{ invoice.invoiceNumber }}</td>
              <td class="px-4 py-3 text-sm">{{ invoice.customerName }}</td>
              <td class="px-4 py-3 text-sm text-gray-500">
                {{ invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A' }}
              </td>
              <td class="px-4 py-3 text-right font-bold text-sm">Rs {{ invoice.total }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="statusClass(invoice.status)" class="px-2 py-1 rounded-full text-xs font-bold">
                  {{ statusLabel(invoice.status) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-1 justify-center flex-wrap">
                  <button @click="viewInvoice(invoice._id)"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-lg text-xs">
                    👁️ View
                  </button>
                  <template v-if="role === 'creator'">
                    <button @click="editInvoice(invoice._id)"
                      class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-lg text-xs">
                      ✏️ Edit
                    </button>
                    <button v-if="invoice.status === 'draft'" @click="submitInvoice(invoice._id)"
                      class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-lg text-xs">
                      📤 Submit
                    </button>
                    <button @click="deleteInvoice(invoice._id)"
                      class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-xs">
                      🗑️ Delete
                    </button>
                  </template>
                  <template v-if="role === 'manager' || role === 'finance' || role === 'director'">
                    <button @click="approveInvoice(invoice._id)"
                      class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-lg text-xs">
                      ✅ Approve
                    </button>
                    <button @click="rejectInvoice(invoice._id)"
                      class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-xs">
                      ❌ Reject
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredInvoices.length === 0" class="text-center py-10 text-gray-400">
          <p class="text-lg">No invoices found!</p>
          <p class="text-sm mt-1">{{ search ? 'Try a different search term' : 'Click "+ New Invoice" to create one' }}</p>
        </div>
      </div>

      <!-- Mobile Cards -->
      <div v-else class="md:hidden space-y-3">
        <div v-for="invoice in filteredInvoices" :key="invoice._id"
          class="bg-white rounded-2xl shadow-md p-4 border-l-4 border-blue-600">
          
          <!-- Card Header -->
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="font-bold text-blue-700 text-lg">#{{ invoice.invoiceNumber }}</p>
              <p class="text-gray-600 text-sm">{{ invoice.customerName }}</p>
            </div>
            <span :class="statusClass(invoice.status)" class="px-2 py-1 rounded-full text-xs font-bold">
              {{ statusLabel(invoice.status) }}
            </span>
          </div>

          <!-- Card Details -->
          <div class="flex justify-between items-center mb-3 text-sm text-gray-500">
            <span>📅 {{ invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A' }}</span>
            <span class="font-bold text-gray-800">Rs {{ invoice.total }}</span>
          </div>

          <!-- Card Actions -->
          <div class="flex gap-2 flex-wrap">
            <button @click="viewInvoice(invoice._id)"
              class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex-1 text-center">
              👁️ View
            </button>
            <template v-if="role === 'creator'">
              <button @click="editInvoice(invoice._id)"
                class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm flex-1 text-center">
                ✏️ Edit
              </button>
              <button v-if="invoice.status === 'draft'" @click="submitInvoice(invoice._id)"
                class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm flex-1 text-center">
                📤 Submit
              </button>
              <button @click="deleteInvoice(invoice._id)"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm flex-1 text-center">
                🗑️ Delete
              </button>
            </template>
            <template v-if="role === 'manager' || role === 'finance' || role === 'director'">
              <button @click="approveInvoice(invoice._id)"
                class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm flex-1 text-center">
                ✅ Approve
              </button>
              <button @click="rejectInvoice(invoice._id)"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm flex-1 text-center">
                ❌ Reject
              </button>
            </template>
          </div>
        </div>

        <!-- Empty State Mobile -->
        <div v-if="filteredInvoices.length === 0"
          class="text-center py-10 text-gray-400 bg-white rounded-2xl shadow">
          <p class="text-lg">No invoices found!</p>
          <p class="text-sm mt-1">{{ search ? 'Try a different search term' : 'Click "+ New Invoice" to create one' }}</p>
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
const invoices = ref([])
const search = ref('')
const loading = ref(true)
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
  const res = await fetch(`${API_URL}/api/invoices`, { headers })
  invoices.value = await res.json()
  loading.value = false
})

const filteredInvoices = computed(() => {
  if (!search.value) return invoices.value
  const s = search.value.toLowerCase()
  return invoices.value.filter(i =>
    i.customerName?.toLowerCase().includes(s) ||
    i.invoiceNumber?.toLowerCase().includes(s)
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

function viewInvoice(id) { router.push(`/invoice/${id}`) }
function editInvoice(id) { router.push(`/edit/${id}`) }

async function deleteInvoice(id) {
  if (!confirm('Are you sure you want to delete this invoice?')) return
  await fetch(`${API_URL}/api/invoices/${id}`, { method: 'DELETE', headers })
  invoices.value = invoices.value.filter(i => i._id !== id)
}

async function submitInvoice(id) {
  if (!confirm('Submit this invoice for approval?')) return
  await fetch(`${API_URL}/api/invoices/submit/${id}`, { method: 'POST', headers })
  invoices.value = invoices.value.filter(i => i._id !== id)
  alert('Invoice submitted for approval! ✅')
}

async function approveInvoice(id) {
  if (!confirm('Approve this invoice?')) return
  await fetch(`${API_URL}/api/invoices/approve/${id}`, { method: 'POST', headers })
  invoices.value = invoices.value.filter(i => i._id !== id)
  alert('Invoice approved! ✅')
}

async function rejectInvoice(id) {
  if (!confirm('Reject this invoice?')) return
  await fetch(`${API_URL}/api/invoices/reject/${id}`, { method: 'POST', headers })
  invoices.value = invoices.value.filter(i => i._id !== id)
  alert('Invoice rejected! ❌')
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('companyName')
  localStorage.removeItem('role')
  router.push('/login')
}
</script>