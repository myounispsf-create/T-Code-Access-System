<template><TCodeRequestForm :key="route.params.id" :request-id="route.params.id" /></template>
<script setup>
import { useRoute } from 'vue-router'
import TCodeRequestForm from '../components/TCodeRequestForm.vue'
const route = useRoute()
</script>
