import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  companyName: [
    { required: true, message: "企业名称为必填项", trigger: "blur" }
  ],
  email: [{ required: true, message: "邮箱为必填项", trigger: "blur" }],
  initPwd: [{ required: true, message: "初始密码为必填项", trigger: "blur" }]
});
