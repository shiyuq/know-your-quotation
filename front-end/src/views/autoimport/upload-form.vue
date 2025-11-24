<script setup lang="ts">
import { reactive, ref } from "vue";
import type { UploadInstance, UploadProps, UploadRawFile } from "element-plus";
import { genFileId } from "element-plus";
import type { FileUploadProps } from "./types";
import { message } from "@/utils/message";

import UploadIcon from "~icons/ri/upload-2-line?width=26&height=26";

const props = withDefaults(defineProps<{ formInline?: FileUploadProps }>(), {
  formInline: () => ({
    file: null
  })
});

const formRef = ref();
const uploadRef = ref<UploadInstance>();
const validateForm = reactive<FileUploadProps>({
  file: props.formInline.file
});

/**
 * 超出文件限制时，重新选择文件
 */
const handleExceed: UploadProps["onExceed"] = files => {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
};

/**
 * 文件选择后触发（关键）
 */
const handleChange: UploadProps["onChange"] = uploadFile => {
  const raw = uploadFile.raw;
  if (!raw) {
    validateForm.file = null;
    return;
  }

  // 校验文件类型
  if (
    raw.type !==
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    message("只能上传 .xlsx 文件", { type: "error" });
    uploadRef.value!.clearFiles();
    validateForm.file = null;
    return;
  }

  // 校验文件是否为空（0字节）
  if (raw.size === 0) {
    message("文件不能为空", { type: "error" });
    uploadRef.value!.clearFiles();
    validateForm.file = null;
    return;
  }

  validateForm.file = raw;
  props.formInline.file = raw;
};

function getRef() {
  return formRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form ref="formRef" :model="validateForm" label-width="82px">
    <el-form-item
      label="产品文件"
      prop="file"
      :rules="[{ required: true, message: '附件不能为空' }]"
    >
      <el-upload
        ref="uploadRef"
        drag
        :limit="1"
        action="#"
        class="w-[200px]!"
        :auto-upload="false"
        :on-exceed="handleExceed"
        :on-change="handleChange"
        accept=".xlsx"
      >
        <div class="el-upload__text">
          <UploadIcon class="m-auto mb-2" />
          可点击或拖拽上传
        </div>
      </el-upload>
    </el-form-item>
  </el-form>
</template>
