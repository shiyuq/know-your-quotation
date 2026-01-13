<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    companyName: "",
    email: "",
    initPwd: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-form-item label="企业名称" prop="companyName">
      <el-input
        v-model="newFormInline.companyName"
        clearable
        placeholder="请输入企业名称"
      />
    </el-form-item>

    <el-form-item label="邮箱" prop="email">
      <el-input
        v-model="newFormInline.email"
        clearable
        placeholder="请输入企业管理员邮箱"
      />
    </el-form-item>

    <el-form-item label="初始密码" prop="initPwd">
      <el-input
        type="password"
        v-model="newFormInline.initPwd"
        clearable
        placeholder="请输入初始密码"
      />
    </el-form-item>
  </el-form>
</template>
