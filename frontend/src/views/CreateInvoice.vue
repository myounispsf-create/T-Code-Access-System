<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <div class="bg-blue-800 text-white px-4 py-3 flex justify-between items-center shadow-lg">
      <div class="flex items-center gap-2">
        <span class="text-xl">📄</span>
        <h1 class="text-lg font-bold truncate max-w-[150px] md:max-w-none">{{ companyName }}</h1>
      </div>
      <button @click="$router.push('/')"
        class="bg-white text-blue-800 px-3 py-1.5 rounded-lg font-bold text-sm">
        ← Back
      </button>
    </div>

    <div class="max-w-5xl mx-auto p-4">
      <h2 class="text-xl font-bold text-gray-700 mb-4">Create New Invoice</h2>

      <!-- Master Data -->
      <div class="bg-white rounded-2xl shadow p-4 mb-4">
        <h3 class="text-lg font-bold text-blue-800 mb-4 border-b pb-2">Invoice Details</h3>

        <!-- Invoice Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="font-bold text-gray-600 text-sm">Invoice Number</label>
            <input v-model="form.invoiceNumber" placeholder="e.g. 1234"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label class="font-bold text-gray-600 text-sm">Salesperson</label>
            <input v-model="form.salesperson" placeholder="Salesperson name"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label class="font-bold text-gray-600 text-sm">Payment Due</label>
            <input v-model="form.paymentDue" type="date"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label class="font-bold text-gray-600 text-sm">Delivery Date</label>
            <input v-model="form.deliveryDate" type="date"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label class="font-bold text-gray-600 text-sm">Payment Terms</label>
            <input v-model="form.paymentTerms" placeholder="e.g. No Terms"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label class="font-bold text-gray-600 text-sm">Shipping Method</label>
            <input v-model="form.shippingMethod" placeholder="e.g. By Air"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:border-blue-400" />
          </div>
        </div>

        <!-- Bill To and Ship To -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-blue-50 p-4 rounded-xl">
            <h4 class="font-bold text-blue-800 mb-3 text-sm">Bill To</h4>
            <input v-model="form.customerName" placeholder="Customer Name"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mb-2 text-sm focus:outline-none focus:border-blue-400" />
            <input v-model="form.customerId" placeholder="Customer ID"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mb-2 text-sm focus:outline-none focus:border-blue-400" />
            <input v-model="form.customerAddress" placeholder="Address"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mb-2 text-sm focus:outline-none focus:border-blue-400" />
            <input v-model="form.customerPhone" placeholder="Phone"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div class="bg-blue-50 p-4 rounded-xl">
            <h4 class="font-bold text-blue-800 mb-3 text-sm">Ship To</h4>
            <input v-model="form.recipientName" placeholder="Recipient Name"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mb-2 text-sm focus:outline-none focus:border-blue-400" />
            <input v-model="form.recipientAddress" placeholder="Address"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 mb-2 text-sm focus:outline-none focus:border-blue-400" />
            <input v-model="form.recipientPhone" placeholder="Phone"
              class="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
          </div>
        </div>
      </div>

      <!-- Items -->
      <div class="bg-white rounded-2xl shadow p-4 mb-4">
        <div class="flex justify-between items-center mb-4 border-b pb-2">
          <h3 class="text-lg font-bold text-blue-800">Items</h3>
          <button @click="addItem"
            class="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm">
            + Add Item
          </button>
        </div>

        <!-- Desktop Items Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-blue-800 text-white">
              <tr>
                <th class="px-3 py-2 text-left text-sm">Qty</th>
                <th class="px-3 py-2 text-left text-sm">Item #</th>
                <th class="px-3 py-2 text-left text-sm">Description</th>
                <th class="px-3 py-2 text-right text-sm">Unit Price</th>
                <th class="px-3 py-2 text-right text-sm">Discount</th>
                <th class="px-3 py-2 text-right text-sm">Line Total</th>
                <th class="px-3 py-2 text-center text-sm">Remove</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in form.items" :key="index" class="border-b">
                <td class="px-2 py-2">
                  <input v-model.number="item.quantity" @input="calculateItem(index)" type="number"
                    class="w-16 border-2 border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400" />
                </td>
                <td class="px-2 py-2">
                  <input v-model="item.itemNumber"
                    class="w-20 border-2 border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400" />
                </td>
                <td class="px-2 py-2">
                  <input v-model="item.description"
                    class="w-full border-2 border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400" />
                </td>
                <td class="px-2 py-2">
                  <input v-model.number="item.unitPrice" @input="calculateItem(index)" type="number"
                    class="w-24 border-2 border-gray-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:border-blue-400" />
                </td>
                <td class="px-2 py-2">
                  <input v-model.number="item.discount" @input="calculateItem(index)" type="number"
                    class="w-20 border-2 border-gray-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:border-blue-400" />
                </td>
                <td class="px-2 py-2 text-right font-bold text-sm">{{ item.lineTotal || 0 }}</td>
                <td class="px-2 py-2 text-center">
                  <button @click="removeItem(index)" class="bg-red-500 text-white px-2 py-1 rounded text-sm">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Items Cards -->
        <div class="md:hidden space-y-3">
          <div v-for="(item, index) in form.items" :key="index"
            class="border-2 border-gray-200 rounded-xl p-3">
            <div class="flex justify-between items-center mb-2">
              <span class="font-bold text-blue-700 text-sm">Item {{ index + 1 }}</span>
              <button @click="removeItem(index)" class="bg-red-500 text-white px-2 py-1 rounded text-xs">✕ Remove</button>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-xs text-gray-500">Item #</label>
                <input v-model="item.itemNumber"
                  class="w-full border-2 border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label class="text-xs text-gray-500">Quantity</label>
                <input v-model.number="item.quantity" @input="calculateItem(index)" type="number"
                  class="w-full border-2 border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div class="col-span-2">
                <label class="text-xs text-gray-500">Description</label>
                <input v-model="item.description"
                  class="w-full border-2 border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label class="text-xs text-gray-500">Unit Price</label>
                <input v-model.number="item.unitPrice" @input="calculateItem(index)" type="number"
                  class="w-full border-2 border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label class="text-xs text-gray-500">Discount</label>
                <input v-model.number="item.discount" @input="calculateItem(index)" type="number"
                  class="w-full border-2 border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div class="col-span-2 text-right">
                <span class="text-xs text-gray-500">Line Total: </span>
                <span class="font-bold text-sm">Rs {{ item.lineTotal || 0 }}</span>
              </div>
            </div>
          </div>
          <div v-if="form.items.length === 0" class="text-center py-4 text-gray-400 text-sm">
            No items added yet. Click "+ Add Item" to add!
          </div>
        </div>

        <!-- Totals -->
        <div class="mt-4 flex justify-end">
          <div class="w-full md:w-64">
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-600 text-sm">Total Discount:</span>
              <span class="font-bold text-sm">{{ totals.totalDiscount }}</span>
            </div>
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-600 text-sm">Subtotal:</span>
              <span class="font-bold text-sm">{{ totals.subtotal }}</span>
            </div>
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-600 text-sm">Sales Tax (2%):</span>
              <span class="font-bold text-sm">{{ totals.salesTax }}</span>
            </div>
            <div class="flex justify-between py-2 bg-blue-800 text-white px-3 rounded-lg mt-1">
              <span class="font-bold text-sm">Total:</span>
              <span class="font-bold text-sm">{{ totals.total }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <button @click="saveInvoice"
        class="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl text-lg transition">
        💾 Save Invoice
      </button>

      <p v-if="error" class="text-red-500 text-center mt-3 text-sm">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import API_URL from '../config.js'

const router = useRouter()
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

function calculateItem(index) {
  const item = form.value.items[index]
  const lineTotal = (item.quantity * item.unitPrice) - item.discount
  item.lineTotal = lineTotal > 0 ? lineTotal : 0
}

const totals = computed(() => {
  const totalDiscount = form.value.items.reduce((sum, item) => sum + (item.discount || 0), 0)
  const subtotal = form.value.items.reduce((sum, item) => sum + (item.lineTotal || 0), 0)
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

async function saveInvoice() {
  if (!form.value.invoiceNumber) {
    error.value = 'Invoice number is required!'
    return
  }
  if (form.value.items.length === 0) {
    error.value = 'Please add at least one item!'
    return
  }
  try {
    const res = await fetch(`${API_URL}/api/invoices`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...form.value, ...totals.value })
    })
    const data = await res.json()
    if (res.ok) {
      router.push('/')
    } else {
      error.value = data.message
    }
  } catch (err) {
    error.value = 'Something went wrong!'
  }
}
</script>