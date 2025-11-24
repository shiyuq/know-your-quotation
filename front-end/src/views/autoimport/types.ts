// 虽然字段很少 但是抽离出来 后续有扩展字段需求就很方便了

interface FormItemProps {
  /** 角色名称 */
  name: string;
  /** 角色编号 */
  code: string;
  /** 备注 */
  remark: string;
}
interface FormProps {
  formInline: FormItemProps;
}

interface FileUploadProps {
  /** 上传的文件 */
  file: File;
}

export type { FormItemProps, FormProps, FileUploadProps };
