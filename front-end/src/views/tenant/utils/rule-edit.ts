import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const editFormRules = reactive(<FormRules>{
  companyName: [
    { required: true, message: "企业名称为必填项", trigger: "blur" }
  ],
  tel: [{ required: false }],
  fax: [{ required: false }],
  address: [{ required: false }],
  shortAddress: [{ required: false }],
  bank: [{ required: false }],
  bankAddress: [{ required: false }],
  swiftCode: [{ required: false }],
  accountNo: [{ required: false }]
});
