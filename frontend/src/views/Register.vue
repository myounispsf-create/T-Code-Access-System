<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
      <h1 class="text-3xl font-bold text-center text-blue-800 mb-2">
        📄 Invoice App
      </h1>
      <p class="text-center text-gray-500 mb-6">Create your account</p>

      <input
        v-model="companyName"
        placeholder="Company Name"
        class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 mb-4 text-lg focus:outline-none focus:border-green-400"
      />

      <input
        v-model="username"
        placeholder="Username"
        class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 mb-4 text-lg focus:outline-none focus:border-green-400"
      />

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 mb-4 text-lg focus:outline-none focus:border-green-400"
      />

      <button
        @click="register"
        class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-lg transition"
      >
        Register
      </button>

      <p v-if="error" class="text-red-500 text-center mt-3">{{ error }}</p>
      <p v-if="success" class="text-green-500 text-center mt-3">{{ success }}</p>

      <p class="text-center mt-4 text-gray-600">
        Already have an account?
        <span
          @click="$router.push('/login')"
          class="text-blue-600 font-bold cursor-pointer hover:underline"
        >
          Login
        </span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const companyName = ref('')
const username = ref('')
const password = ref('')
const error = ref('')
const success = ref('')

async function register() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName: companyName.value,
        username: username.value,
        password: password.value
      })
    })
    const data = await res.json()
    if (res.ok) {
      success.value = data.message
      setTimeout(() => router.push('/login'), 1500)
    } else {
      error.value = data.message
    }
  } catch (err) {
    error.value = 'Something went wrong!'
  }
}
</script>