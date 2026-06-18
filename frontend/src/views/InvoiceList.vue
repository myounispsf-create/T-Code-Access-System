<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <div class="bg-blue-800 text-white px-6 py-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold">📄 {{ companyName }}</h1>
      <div class="flex gap-3 items-center">
        <span class="text-blue-200">👋 {{ username }}</span>
        <button
          @click="logout"
          class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-5xl mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-700">All Invoices</h2>
        <button
          @click="$router.push('/create')"
          class="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg font-bold transition"
        >
          + New Invoice
        </button>
      </div>

      <!-- Search Box -->
      <div class="mb-4">
        <input
          v-model="search"
          placeholder="🔍 Search by customer name or invoice number..."
          class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-blue-400 bg-white"
        />
      </div>

      <!-- Invoice Table -->
      <div class="bg-white rounded-2xl shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-blue-800 text-white">
            <tr>
              <th class="px-4 py-3 text-left">Invoice #</th>
              <th class="px-4 py-3 text-left">Customer</th>
              <th class="px-4 py-3 text-left">Date</th>
              <th class="px-4 py-3 text-right">Total</th>
              <th class="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="invoice in filteredInvoices"
              :key="invoice._id"
              class="border-b hover:bg-gray-50"
            >
              <td class="px-4 py-3 font-bold text-blue-700">
                #{{ invoice.invoiceNumber }}
              </td>
              <td class="px-4 py-3">{{ invoice.customerName }}</td>
              <td class="px-4 py-3">
                {{ new Date(invoice.createdAt).toLocaleDateString() }}
              </td>
              <td class="px-4 py-3 text-right font-bold">
                ${{ invoice.total }}
              </td>
              <td class="px-4 py-3 text-center">
                <button
                  @click="viewInvoice(invoice._id)"
                  class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg mr-2"
                >
                  👁️ View
                </button>
                <button
                  @click="editInvoice(invoice._id)"
                  class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg mr-2"
                >
                  ✏️ Edit
                </button>
                <button
                  @click="deleteInvoice(invoice._id)"
                  class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                >
                  🗑️ Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="filteredInvoices.length === 0" class="text-center py-10 text-gray-400">
          <p class="text-xl">No invoices found!</p>
          <p v-if="search">Try a different search term</p>
          <p v-else>Click "+ New Invoice" to create one</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const invoices = ref([])
const search = ref('')
const username = ref(localStorage.getItem('username') || '')
const companyName = ref(localStorage.getItem('companyName') || '')
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
  const res = await fetch('https://my-app-production-f607.up.railway.app/api/invoices', { headers })
  invoices.value = await res.json()
})

// Search filter
const filteredInvoices = computed(() => {
  if (!search.value) return invoices.value
  const s = search.value.toLowerCase()
  return invoices.value.filter(i =>
    i.customerName?.toLowerCase().includes(s) ||
    i.invoiceNumber?.toLowerCase().includes(s)
  )
})

function viewInvoice(id) {
  router.push(`/invoice/${id}`)
}

function editInvoice(id) {
  router.push(`/edit/${id}`)
}

async function deleteInvoice(id) {
  if (!confirm('Are you sure you want to delete this invoice?')) return
  await fetch(`https://my-app-production-f607.up.railway.app/api/invoices/${id}`, {
    method: 'DELETE',
    headers
  })
  invoices.value = invoices.value.filter(i => i._id !== id)
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('companyName')
  router.push('/login')
}
</script>