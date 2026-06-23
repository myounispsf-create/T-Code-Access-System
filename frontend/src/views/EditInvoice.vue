<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <div class="bg-blue-800 text-white px-6 py-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold">📄 {{ companyName }}</h1>
      <button
        @click="$router.push('/')"
        class="bg-white text-blue-800 px-4 py-2 rounded-lg font-bold"
      >
        ← Back
      </button>
    </div>

    <div class="max-w-5xl mx-auto p-6">
      <h2 class="text-2xl font-bold text-gray-700 mb-6">Edit Invoice</h2>

      <!-- Master Data -->
      <div class="bg-white rounded-2xl shadow p-6 mb-6">
        <h3 class="text-lg font-bold text-blue-800 mb-4 border-b pb-2">
          Invoice Details
        </h3>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="font-bold text-gray-600">Invoice Number</label>
            <input
              v-model="form.invoiceNumber"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label class="font-bold text-gray-600">Salesperson</label>
            <input
              v-model="form.salesperson"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label class="font-bold text-gray-600">Payment Due</label>
            <input
              v-model="form.paymentDue"
              type="date"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label class="font-bold text-gray-600">Delivery Date</label>
            <input
              v-model="form.deliveryDate"
              type="date"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label class="font-bold text-gray-600">Payment Terms</label>
            <input
              v-model="form.paymentTerms"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label class="font-bold text-gray-600">Shipping Method</label>
            <input
              v-model="form.shippingMethod"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <!-- Bill To and Ship To -->
        <div class="grid grid-cols-2 gap-6">
          <div class="bg-blue-50 p-4 rounded-xl">
            <h4 class="font-bold text-blue-800 mb-3">Bill To</h4>
            <input
              v-model="form.customerName"
              placeholder="Customer Name"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-blue-400"
            />
            <input
              v-model="form.customerId"
              placeholder="Customer ID"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-blue-400"
            />
            <input
              v-model="form.customerAddress"
              placeholder="Address"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-blue-400"
            />
            <input
              v-model="form.customerPhone"
              placeholder="Phone"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div class="bg-blue-50 p-4 rounded-xl">
            <h4 class="font-bold text-blue-800 mb-3">Ship To</h4>
            <input
              v-model="form.recipientName"
              placeholder="Recipient Name"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-blue-400"
            />
            <input
              v-model="form.recipientAddress"
              placeholder="Address"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:border-blue-400"
            />
            <input
              v-model="form.recipientPhone"
              placeholder="Phone"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      <!-- Items -->
      <div class="bg-white rounded-2xl shadow p-6 mb-6">
        <div class="flex justify-between items-center mb-4 border-b pb-2">
          <h3 class="text-lg font-bold text-blue-800">Items</h3>
          <button
            @click="addItem"
            class="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg"
          >
            + Add Item
          </button>
        </div>

        <table class="w-full">
          <thead class="bg-blue-800 text-white">
            <tr>
              <th class="px-3 py-2 text-left">Qty</th>
              <th class="px-3 py-2 text-left">Item #</th>
              <th class="px-3 py-2 text-left">Description</th>
              <th class="px-3 py-2 text-right">Unit Price</th>
              <th class="px-3 py-2 text-right">Discount</th>
              <th class="px-3 py-2 text-right">Line Total</th>
              <th class="px-3 py-2 text-center">Remove</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in form.items" :key="index" class="border-b">
              <td class="px-2 py-2">
                <input
                  v-model.number="item.quantity"
                  @input="calculateItem(index)"
                  type="number"
                  class="w-16 border-2 border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
                />
              </td>
              <td class="px-2 py-2">
                <input
                  v-model="item.itemNumber"
                  class="w-20 border-2 border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
                />
              </td>
              <td class="px-2 py-2">
                <input
                  v-model="item.description"
                  class="w-full border-2 border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
                />
              </td>
              <td class="px-2 py-2">
                <input
                  v-model.number="item.unitPrice"
                  @input="calculateItem(index)"
                  type="number"
                  class="w-24 border-2 border-gray-200 rounded px-2 py-1 text-right focus:outline-none focus:border-blue-400"
                />
              </td>
              <td class="px-2 py-2">
                <input
                  v-model.number="item.discount"
                  @input="calculateItem(index)"
                  type="number"
                  class="w-20 border-2 border-gray-200 rounded px-2 py-1 text-right focus:outline-none focus:border-blue-400"
                />
              </td>
              <td class="px-2 py-2 text-right font-bold">
                {{ item.lineTotal || 0 }}
              </td>
              <td class="px-2 py-2 text-center">
                <button
                  @click="removeItem(index)"
                  class="bg-red-500 text-white px-2 py-1 rounded"
                >
                  ✕
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Totals -->
        <div class="mt-4 flex justify-end">
          <div class="w-64">
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-600">Total Discount:</span>
              <span class="font-bold">{{ totals.totalDiscount }}</span>
            </div>
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-600">Subtotal:</span>
              <span class="font-bold">{{ totals.subtotal }}</span>
            </div>
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-600">Sales Tax (2%):</span>
              <span class="font-bold">{{ totals.salesTax }}</span>
            </div>
            <div class="flex justify-between py-2 bg-blue-800 text-white px-2 rounded-lg mt-1">
              <span class="font-bold">Total:</span>
              <span class="font-bold">{{ totals.total }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Update Button -->
      <button
        @click="updateInvoice"
        class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl text-xl transition"
      >
        💾 Update Invoice
      </button>

      <p v-if="error" class="text-red-500 text-center mt-3">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const error = ref('')
const companyName = ref(localStorage.getItem('companyName') || '')
const token = localStorage.getItem('token')

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}

const form = ref({
  invoiceNumber: '',
  salesperson: '',
  paymentDue: '',
  deliveryDate: '',
  paymentTerms: '',
  shippingMethod: '',
  shippingTerms: '',
  customerName: '',
  customerId: '',
  customerAddress: '',
  customerPhone: '',
  recipientName: '',
  recipientAddress: '',
  recipientPhone: '',
  items: []
})

onMounted(async () => {
  const res = await fetch(
    `http://localhost:5000/api/invoices/${route.params.id}`,
    { headers }
  )
  const data = await res.json()
  form.value = {
    ...data,
    paymentDue: data.paymentDue ? data.paymentDue.split('T')[0] : '',
    deliveryDate: data.deliveryDate ? data.deliveryDate.split('T')[0] : ''
  }
})

function calculateItem(index) {
  const item = form.value.items[index]
  const lineTotal = (item.quantity * item.unitPrice) - item.discount
  item.lineTotal = lineTotal > 0 ? lineTotal : 0
}

const totals = computed(() => {
  const totalDiscount = form.value.items.reduce(
    (sum, item) => sum + (item.discount || 0), 0
  )
  const subtotal = form.value.items.reduce(
    (sum, item) => sum + (item.lineTotal || 0), 0
  )
  const salesTax = Math.round(subtotal * 0.02)
  const total = subtotal - salesTax
  return { totalDiscount, subtotal, salesTax, total }
})

function addItem() {
  form.value.items.push({
    itemNumber: '',
    description: '',
    quantity: 0,
    unitPrice: 0,
    discount: 0,
    lineTotal: 0
  })
}

function removeItem(index) {
  form.value.items.splice(index, 1)
}

async function updateInvoice() {
  try {
    const res = await fetch(
      `https://invoice-backend-5iv0.onrender.com/api/invoices/${route.params.id}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          ...form.value,
          ...totals.value
        })
      }
    )
    if (res.ok) {
      router.push('/')
    } else {
      const data = await res.json()
      error.value = data.message
    }
  } catch (err) {
    error.value = 'Something went wrong!'
  }
}
</script>