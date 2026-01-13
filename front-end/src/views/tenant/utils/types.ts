// 虽然字段很少 但是抽离出来 后续有扩展字段需求就很方便了

interface FormItemProps {
  /** 企业名称 */
  companyName: string;
  /** 邮箱 */
  email: string;
  /** 初始密码 */
  initPwd: string;
}
interface FormProps {
  formInline: FormItemProps;
}

interface EditFormItemProps {
  /** 企业名称 */
  companyName: string;
  /** 联系电话 */
  tel: string;
  /** 传真 */
  fax: string;
  /** 地址 */
  address: string;
  /** 短地址 */
  shortAddress: string;
  /** 开户行 */
  bank: string;
  /** 开户行地址 */
  bankAddress: string;
  /** SWIFT 码 */
  swiftCode: string;
  /** 账号 */
  accountNo: string;
}
interface EditFormProps {
  formInline: EditFormItemProps;
}

export type { FormItemProps, FormProps, EditFormItemProps, EditFormProps };
