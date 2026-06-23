<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header - hidden when printing -->
    <div class="bg-blue-800 text-white px-6 py-4 flex justify-between items-center no-print">
      <h1 class="text-2xl font-bold">📄 {{ invoice.companyName }}</h1>
      <div class="flex gap-3">
        <button
          @click="printInvoice"
          class="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-bold transition"
        >
          🖨️ Print / PDF
        </button>
        <button
          @click="$router.push('/')"
          class="bg-white text-blue-800 px-4 py-2 rounded-lg font-bold"
        >
          ← Back
        </button>
      </div>
    </div>

    <!-- Invoice Content -->
    <div class="max-w-4xl mx-auto p-6" id="invoice-content">

      <!-- Company Name -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-blue-900">{{ companyName }}</h1>
        <p class="text-blue-600">{{ new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
      </div>

      <!-- Invoice Box -->
      <div class="border-2 border-gray-300 rounded-xl overflow-hidden mb-6">

        <!-- Invoice Number -->
        <div class="bg-white px-6 py-4 border-b-2 border-gray-300">
          <h2 class="text-xl font-bold text-gray-800">
            INVOICE #{{ invoice.invoiceNumber }}
          </h2>
        </div>

        <!-- Master Data -->
        <div class="grid grid-cols-2">
          <!-- Bill To -->
          <div class="p-4 border-r-2 border-gray-300">
            <table class="w-full">
              <tr class="bg-blue-100">
                <td colspan="2" class="px-3 py-2 font-bold text-blue-800">
                  Bill To
                </td>
                <td colspan="2" class="px-3 py-2 font-bold text-blue-800">
                  Ship To
                </td>
              </tr>
              <tr class="border-b">
                <td class="px-3 py-2 font-bold text-gray-600 w-32">Customer</td>
                <td class="px-3 py-2">{{ invoice.customerName }}</td>
              </tr>
              <tr class="border-b">
                <td class="px-3 py-2 font-bold text-gray-600">Customer ID#</td>
                <td class="px-3 py-2">{{ invoice.customerId }}</td>
              </tr>
              <tr class="border-b">
                <td class="px-3 py-2 font-bold text-gray-600">Address</td>
                <td class="px-3 py-2">{{ invoice.customerAddress }}</td>
              </tr>
              <tr>
                <td class="px-3 py-2 font-bold text-gray-600">Phone</td>
                <td class="px-3 py-2">{{ invoice.customerPhone }}</td>
              </tr>
            </table>
          </div>

          <!-- Ship To -->
          <div class="p-4">
            <table class="w-full">
              <tr class="border-b">
                <td class="px-3 py-2 font-bold text-gray-600 w-32">Recipient</td>
                <td class="px-3 py-2">{{ invoice.recipientName }}</td>
              </tr>
              <tr class="border-b">
                <td class="px-3 py-2 font-bold text-gray-600">Address</td>
                <td class="px-3 py-2">{{ invoice.recipientAddress }}</td>
              </tr>
              <tr>
                <td class="px-3 py-2 font-bold text-gray-600">Phone</td>
                <td class="px-3 py-2">{{ invoice.recipientPhone }}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Payment and Shipping Info -->
        <div class="grid grid-cols-2 border-t-2 border-gray-300">
          <div class="p-4 border-r-2 border-gray-300">
            <table class="w-full">
              <tr class="border-b">
                <td class="px-3 py-2 font-bold text-gray-600 w-32">Payment Due</td>
                <td class="px-3 py-2">{{ formatDate(invoice.paymentDue) }}</td>
              </tr>
              <tr class="border-b">
                <td class="px-3 py-2 font-bold text-gray-600">Salesperson</td>
                <td class="px-3 py-2">{{ invoice.salesperson }}</td>
              </tr>
              <tr>
                <td class="px-3 py-2 font-bold text-gray-600">Payment Terms</td>
                <td class="px-3 py-2">{{ invoice.paymentTerms }}</td>
              </tr>
            </table>
          </div>
          <div class="p-4">
            <table class="w-full">
              <tr class="border-b">
                <td class="px-3 py-2 font-bold text-gray-600 w-32">Delivery Date</td>
                <td class="px-3 py-2">{{ formatDate(invoice.deliveryDate) }}</td>
              </tr>
              <tr class="border-b">
                <td class="px-3 py-2 font-bold text-gray-600">Shipping Method</td>
                <td class="px-3 py-2">{{ invoice.shippingMethod }}</td>
              </tr>
              <tr>
                <td class="px-3 py-2 font-bold text-gray-600">Shipping Terms</td>
                <td class="px-3 py-2">{{ invoice.shippingTerms }}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div class="border-2 border-gray-300 rounded-xl overflow-hidden">
        <table class="w-full">
          <thead class="bg-blue-100">
            <tr>
              <th class="px-4 py-3 text-left border-r border-gray-300">Qty.</th>
              <th class="px-4 py-3 text-left border-r border-gray-300">Item#</th>
              <th class="px-4 py-3 text-left border-r border-gray-300">Description</th>
              <th class="px-4 py-3 text-right border-r border-gray-300">Unit Price</th>
              <th class="px-4 py-3 text-right border-r border-gray-300">Discount</th>
              <th class="px-4 py-3 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in invoice.items"
              :key="item._id"
              class="border-t border-gray-300"
            >
              <td class="px-4 py-3 border-r border-gray-300">{{ item.quantity }}</td>
              <td class="px-4 py-3 border-r border-gray-300">{{ item.itemNumber }}</td>
              <td class="px-4 py-3 border-r border-gray-300">{{ item.description }}</td>
              <td class="px-4 py-3 text-right border-r border-gray-300">{{ item.unitPrice }}</td>
              <td class="px-4 py-3 text-right border-r border-gray-300">{{ item.discount }}</td>
              <td class="px-4 py-3 text-right">{{ item.lineTotal }}</td>
            </tr>

            <!-- Empty rows -->
            <tr v-for="n in emptyRows" :key="'empty'+n" class="border-t border-gray-300">
              <td class="px-4 py-3 border-r border-gray-300">&nbsp;</td>
              <td class="px-4 py-3 border-r border-gray-300"></td>
              <td class="px-4 py-3 border-r border-gray-300"></td>
              <td class="px-4 py-3 border-r border-gray-300"></td>
              <td class="px-4 py-3 border-r border-gray-300"></td>
              <td class="px-4 py-3"></td>
            </tr>

            <!-- Totals -->
            <tr class="border-t border-gray-300">
              <td colspan="4"></td>
              <td class="px-4 py-2 text-right font-bold border-r border-gray-300">Total Discount</td>
              <td class="px-4 py-2 text-right">{{ invoice.totalDiscount }}</td>
            </tr>
            <tr class="border-t border-gray-300">
              <td colspan="4"></td>
              <td class="px-4 py-2 text-right font-bold border-r border-gray-300">Subtotal</td>
              <td class="px-4 py-2 text-right">{{ invoice.subtotal }}</td>
            </tr>
            <tr class="border-t border-gray-300">
              <td colspan="4"></td>
              <td class="px-4 py-2 text-right font-bold border-r border-gray-300">Sales Tax</td>
              <td class="px-4 py-2 text-right">{{ invoice.salesTax }}</td>
            </tr>
            <tr class="border-t-2 border-gray-300 bg-blue-800 text-white">
              <td colspan="4"></td>
              <td class="px-4 py-3 text-right font-bold border-r border-blue-600">Total</td>
              <td class="px-4 py-3 text-right font-bold">{{ invoice.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

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
  const res = await fetch(
    `https://invoice-backend-5iv0.onrender.com/api/invoices/${route.params.id}`,
    { headers }
  )
  invoice.value = await res.json()
})

// Empty rows to fill table
const emptyRows = computed(() => {
  const count = (invoice.value.items || []).length
  return count < 6 ? 6 - count : 0
})

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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