<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header - hidden when printing -->
    <div class="bg-blue-800 text-white px-4 py-3 flex justify-between items-center shadow-lg no-print">
      <div class="flex items-center gap-2">
        <span class="text-xl">📄</span>
        <h1 class="text-lg font-bold truncate max-w-[150px] md:max-w-none">{{ companyName }}</h1>
      </div>
      <div class="flex gap-2">
        <button @click="printInvoice"
          class="bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-lg font-bold transition text-sm">
          🖨️ Print
        </button>
        <button @click="$router.push('/')"
          class="bg-white text-blue-800 px-3 py-1.5 rounded-lg font-bold text-sm">
          ← Back
        </button>
      </div>
    </div>

    <!-- Invoice Content -->
    <div class="max-w-4xl mx-auto p-4" id="invoice-content">

      <!-- Company Name -->
      <div class="mb-4">
        <h1 class="text-2xl md:text-3xl font-bold text-blue-900">{{ companyName }}</h1>
        <p class="text-blue-600 text-sm">{{ new Date().toLocaleDateString('en-US', { year: 'numeric', month:
          'long', day: 'numeric' }) }}</p>
      </div>

      <!-- Invoice Number -->
      <div class="bg-white border-2 border-gray-300 rounded-xl overflow-hidden mb-4">
        <div class="px-4 py-3 border-b-2 border-gray-300">
          <h2 class="text-lg font-bold text-gray-800">INVOICE #{{ invoice.invoiceNumber }}</h2>
        </div>

        <!-- Bill To / Ship To -->
        <div class="grid grid-cols-1 md:grid-cols-2">
          <div class="p-4 border-b md:border-b-0 md:border-r-2 border-gray-300">
            <h4 class="font-bold text-blue-800 mb-2 text-sm bg-blue-50 px-2 py-1 rounded">Bill To</h4>
            <table class="w-full text-sm">
              <tr class="border-b">
                <td class="py-1 font-bold text-gray-600 w-32">Customer</td>
                <td class="py-1">{{ invoice.customerName }}</td>
              </tr>
              <tr class="border-b">
                <td class="py-1 font-bold text-gray-600">Customer ID#</td>
                <td class="py-1">{{ invoice.customerId }}</td>
              </tr>
              <tr class="border-b">
                <td class="py-1 font-bold text-gray-600">Address</td>
                <td class="py-1">{{ invoice.customerAddress }}</td>
              </tr>
              <tr>
                <td class="py-1 font-bold text-gray-600">Phone</td>
                <td class="py-1">{{ invoice.customerPhone }}</td>
              </tr>
            </table>
          </div>
          <div class="p-4">
            <h4 class="font-bold text-blue-800 mb-2 text-sm bg-blue-50 px-2 py-1 rounded">Ship To</h4>
            <table class="w-full text-sm">
              <tr class="border-b">
                <td class="py-1 font-bold text-gray-600 w-32">Recipient</td>
                <td class="py-1">{{ invoice.recipientName }}</td>
              </tr>
              <tr class="border-b">
                <td class="py-1 font-bold text-gray-600">Address</td>
                <td class="py-1">{{ invoice.recipientAddress }}</td>
              </tr>
              <tr>
                <td class="py-1 font-bold text-gray-600">Phone</td>
                <td class="py-1">{{ invoice.recipientPhone }}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Payment / Shipping Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 border-t-2 border-gray-300">
          <div class="p-4 border-b md:border-b-0 md:border-r-2 border-gray-300">
            <table class="w-full text-sm">
              <tr class="border-b">
                <td class="py-1 font-bold text-gray-600 w-32">Payment Due</td>
                <td class="py-1">{{ formatDate(invoice.paymentDue) }}</td>
              </tr>
              <tr class="border-b">
                <td class="py-1 font-bold text-gray-600">Salesperson</td>
                <td class="py-1">{{ invoice.salesperson }}</td>
              </tr>
              <tr>
                <td class="py-1 font-bold text-gray-600">Payment Terms</td>
                <td class="py-1">{{ invoice.paymentTerms }}</td>
              </tr>
            </table>
          </div>
          <div class="p-4">
            <table class="w-full text-sm">
              <tr class="border-b">
                <td class="py-1 font-bold text-gray-600 w-32">Delivery Date</td>
                <td class="py-1">{{ formatDate(invoice.deliveryDate) }}</td>
              </tr>
              <tr class="border-b">
                <td class="py-1 font-bold text-gray-600">Shipping Method</td>
                <td class="py-1">{{ invoice.shippingMethod }}</td>
              </tr>
              <tr>
                <td class="py-1 font-bold text-gray-600">Shipping Terms</td>
                <td class="py-1">{{ invoice.shippingTerms }}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div class="bg-white border-2 border-gray-300 rounded-xl overflow-hidden mb-4">

        <!-- Desktop Items -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-blue-100">
              <tr>
                <th class="px-4 py-2 text-left text-sm border-r border-gray-300">Qty.</th>
                <th class="px-4 py-2 text-left text-sm border-r border-gray-300">Item#</th>
                <th class="px-4 py-2 text-left text-sm border-r border-gray-300">Description</th>
                <th class="px-4 py-2 text-right text-sm border-r border-gray-300">Unit Price</th>
                <th class="px-4 py-2 text-right text-sm border-r border-gray-300">Discount</th>
                <th class="px-4 py-2 text-right text-sm">Line Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in invoice.items" :key="item._id" class="border-t border-gray-300">
                <td class="px-4 py-2 text-sm border-r border-gray-300">{{ item.quantity }}</td>
                <td class="px-4 py-2 text-sm border-r border-gray-300">{{ item.itemNumber }}</td>
                <td class="px-4 py-2 text-sm border-r border-gray-300">{{ item.description }}</td>
                <td class="px-4 py-2 text-sm text-right border-r border-gray-300">{{ item.unitPrice }}</td>
                <td class="px-4 py-2 text-sm text-right border-r border-gray-300">{{ item.discount }}</td>
                <td class="px-4 py-2 text-sm text-right">{{ item.lineTotal }}</td>
              </tr>
              <tr v-for="n in emptyRows" :key="'empty'+n" class="border-t border-gray-300">
                <td class="px-4 py-2 border-r border-gray-300">&nbsp;</td>
                <td class="px-4 py-2 border-r border-gray-300"></td>
                <td class="px-4 py-2 border-r border-gray-300"></td>
                <td class="px-4 py-2 border-r border-gray-300"></td>
                <td class="px-4 py-2 border-r border-gray-300"></td>
                <td class="px-4 py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Items -->
        <div class="md:hidden">
          <div v-for="item in invoice.items" :key="item._id"
            class="p-3 border-b border-gray-200">
            <div class="flex justify-between mb-1">
              <span class="font-bold text-sm text-blue-700">{{ item.itemNumber }}</span>
              <span class="font-bold text-sm">Rs {{ item.lineTotal }}</span>
            </div>
            <p class="text-sm text-gray-600 mb-1">{{ item.description }}</p>
            <div class="flex gap-4 text-xs text-gray-500">
              <span>Qty: {{ item.quantity }}</span>
              <span>Price: {{ item.unitPrice }}</span>
              <span>Discount: {{ item.discount }}</span>
            </div>
          </div>
        </div>

        <!-- Totals -->
        <div class="border-t-2 border-gray-300">
          <div class="flex justify-between px-4 py-2 border-b border-gray-200">
            <span class="text-sm font-bold text-gray-600">Total Discount</span>
            <span class="text-sm">{{ invoice.totalDiscount }}</span>
          </div>
          <div class="flex justify-between px-4 py-2 border-b border-gray-200">
            <span class="text-sm font-bold text-gray-600">Subtotal</span>
            <span class="text-sm">{{ invoice.subtotal }}</span>
          </div>
          <div class="flex justify-between px-4 py-2 border-b border-gray-200">
            <span class="text-sm font-bold text-gray-600">Sales Tax</span>
            <span class="text-sm">{{ invoice.salesTax }}</span>
          </div>
          <div class="flex justify-between px-4 py-3 bg-blue-800 text-white">
            <span class="font-bold">Total</span>
            <span class="font-bold">Rs {{ invoice.total }}</span>
          </div>
        </div>
      </div>

      <!-- Approval History -->
      <div v-if="invoice.approvals && invoice.approvals.length > 0"
        class="bg-white rounded-2xl shadow p-4 mb-4 no-print">
        <h3 class="font-bold text-blue-800 mb-3">✅ Approval History</h3>
        <div v-for="approval in invoice.approvals" :key="approval._id"
          class="flex justify-between items-center py-2 border-b last:border-0">
          <div>
            <span class="font-bold text-sm capitalize">{{ approval.role }}</span>
            <span class="text-gray-500 text-sm ml-2">by {{ approval.approvedBy }}</span>
          </div>
          <span class="text-gray-400 text-xs">{{ formatDate(approval.date) }}</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import API_URL from '../config.js'

const router = useRouter()
const route = useRoute()
const invoice = ref({})
const companyName = ref(localStorage.getItem('companyName') || '')
const token = localStorage.getItem('token')

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}

onMounted(async () => {
  const res = await fetch(`${API_URL}/api/invoices/${route.params.id}`, { headers })
  invoice.value = await res.json()
})

const emptyRows = computed(() => {
  const count = (invoice.value.items || []).length
  return count < 6 ? 6 - count : 0
})

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

function printInvoice() {
  window.print()
}
</script>

<style>
@media print {
  .no-print {
    display: none !important;
  }
  body {
    background: white !important;
  }
}
</style>