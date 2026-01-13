<script setup lang="ts">
import { ref } from "vue";
import { editFormRules } from "./utils/rule-edit";
import { EditFormProps } from "./utils/types";

const props = withDefaults(defineProps<EditFormProps>(), {
  formInline: () => ({
    companyName: "",
    tel: "",
    fax: "",
    address: "",
    shortAddress: "",
    bank: "",
    bankAddress: "",
    swiftCode: "",
    accountNo: ""
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
    :rules="editFormRules"
    label-width="82px"
  >
    <el-form-item label="企业名称" prop="companyName">
      <el-input
        v-model="newFormInline.companyName"
        clearable
        placeholder="请输入企业名称"
      />
    </el-form-item>

    <el-form-item label="联系电话" prop="tel">
      <el-input
        v-model="newFormInline.tel"
        clearable
        placeholder="请输入联系电话"
      />
    </el-form-item>
    <el-form-item label="传真" prop="fax">
      <el-input
        v-model="newFormInline.fax"
        clearable
        placeholder="请输入传真"
      />
    </el-form-item>
    <el-form-item label="地址" prop="address">
      <el-input
        v-model="newFormInline.address"
        clearable
        placeholder="请输入地址"
      />
    </el-form-item>
    <el-form-item label="短地址" prop="shortAddress">
      <el-input
        v-model="newFormInline.shortAddress"
        clearable
        placeholder="请输入短地址"
      />
    </el-form-item>
    <el-form-item label="开户行" prop="bank">
      <el-input
        v-model="newFormInline.bank"
        clearable
        placeholder="请输入开户行"
      />
    </el-form-item>
    <el-form-item label="开户行地址" prop="bankAddress">
      <el-input
        v-model="newFormInline.bankAddress"
        clearable
        placeholder="请输入开户行地址"
      />
    </el-form-item>
    <el-form-item label="SWIFT码" prop="swiftCode">
      <el-input
        v-model="newFormInline.swiftCode"
        clearable
        placeholder="请输入SWIFT码"
      />
    </el-form-item>
    <el-form-item label="账号" prop="accountNo">
      <el-input
        v-model="newFormInline.accountNo"
        clearable
        placeholder="请输入账号"
      />
    </el-form-item>
  </el-form>
</template>
