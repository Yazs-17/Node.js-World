<template>
  <div style="padding: 20px">
    <h2>Code Runner Demo</h2>

    <textarea
      v-model="code"
      rows="10"
      style="width: 100%; font-family: monospace"
    />

    <button @click="run" :disabled="loading">
      {{ loading ? 'Running...' : 'Run Code' }}
    </button>

    <h3>Result</h3>
    <pre>{{ result }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const code = ref(`console.log("Hello from Docker")`);
const result = ref('');
const loading = ref(false);

const run = async () => {
  loading.value = true;
  result.value = '';

  try {
    const res = await axios.post('http://localhost:3000/code/run', {
      language: 'js',
      code: code.value,
    });

    result.value = res.data.success
      ? res.data.output
      : res.data.error;
  } catch (e: any) {
    result.value = e.message;
  } finally {
    loading.value = false;
  }
};
</script>
