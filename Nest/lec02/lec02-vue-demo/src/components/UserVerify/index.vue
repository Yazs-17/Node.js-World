<script lang="ts" setup>
import { reactive, ref } from 'vue'

const ruleFormRef = ref()
const ruleForm = reactive({
  user: '',
  pass: '',
  code: null,
})
const codeUrl = ref<string>('/api/users/code')

const resetCode = () => {
  codeUrl.value = `/api/users/code?d=${Date.now()}`
}

const submit = () => {
  fetch('/api/users/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ruleForm),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data)
    })
}
</script>


<template>
  <div class="container">
    <el-form ref="ruleFormRef" style="max-width: 600px" :model="ruleForm" status-icon label-width="auto"
      class="demo-ruleForm">
      <el-form-item label="账号" prop="user">
        <el-input v-model="ruleForm.user" type="text" autocomplete="off" />
      </el-form-item>
      <el-form-item label="密码" prop="pass">
        <el-input v-model="ruleForm.pass" type="password" autocomplete="off" />
      </el-form-item>
      <el-form-item label="验证码" prop="code">
        <div style="display: inline-flex;">
          <el-input v-model="ruleForm.code" />
          <img :src="codeUrl" alt="验证码图片" @click="resetCode" />
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submit">
          Submit
        </el-button>
      </el-form-item>
    </el-form>
  </div>

</template>

<style scoped>
.container {
  height: 100vh;
  width: 100vw;
  display: flex;
  /* flex-direction: column; */
  align-items: center;
  justify-content: center;

}
</style>
