<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from "vue";
import {
  delay,
  subBefore,
  deviceDetection,
  useResizeObserver
} from "@pureadmin/utils";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useQuotation } from "./hook";
import Delete from "~icons/ep/delete";

const formRef = ref();
const treeRef = ref();

defineOptions({
  name: "Quotation"
});

const {
  form,
  isShow,
  loading,
  dataList,
  exportQuotation,
  remoteMethod,
  addIntoQuotation,
  handleRemove,
  quotation,
  columns
} = useQuotation(treeRef);
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px]"
    >
      <el-form-item label="产品型号" prop="productId">
        <el-select
          v-model="form.productId"
          remote
          filterable
          reserve-keyword
          :remote-method="remoteMethod"
          placeholder="请输入产品型号"
          style="width: 240px"
        >
          <el-option
            v-for="item in dataList"
            :key="item.id"
            :label="item.name + '（' + item.desc + '）'"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('ep:plus')"
          :loading="loading"
          @click="addIntoQuotation(formRef)"
        >
          加入报价单
        </el-button>
        <el-button
          color="#626aef"
          :icon="useRenderIcon('ep:tickets')"
          @click="exportQuotation"
        >
          导出报价单为EXCEL
        </el-button>
      </el-form-item>
    </el-form>

    <div class="content bg-bg_color flex-1 mt-2 overflow-auto">
      <div v-if="quotation.length" class="p-4">
        <el-collapse expand-icon-position="right" accordion>
          <el-collapse-item
            v-for="item in quotation"
            :title="item.productName + '（' + item.productDesc + '）'"
            :name="item.productId"
          >
            <template #title="{ isActive }">
              <div :class="['title-wrapper', { 'is-active': isActive }]">
                {{ item.productName }}（{{ item.productDesc }}）
              </div>
            </template>
            <template #icon="{}">
              <el-popconfirm
                :title="`是否确认移除产品型号：${item.productName}`"
                @confirm="handleRemove(item.productId)"
              >
                <template #reference>
                  <el-button
                    class="reset-margin"
                    link
                    type="primary"
                    :icon="useRenderIcon(Delete)"
                    @click.stop
                  >
                    移除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
            <div>
              <el-table
                showOverflowTooltip
                :data="item.skuList"
                :pagination="null"
                :cell-style="{ textAlign: 'center' }"
                :header-cell-style="{
                  background: 'var(--el-fill-color-light)',
                  color: 'var(--el-text-color-primary)',
                  textAlign: 'center'
                }"
              >
                <el-table-column
                  v-for="col in columns"
                  :label="col.label"
                  :prop="col.prop"
                  :min-width="col.minWidth"
                  :formatter="col.formatter"
                >
                  <template #default="{ row }">
                    <component
                      v-if="col.cellRenderer"
                      :is="col.cellRenderer(row)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
      <div v-else class="flex justify-center items-center h-full">
        <el-empty :image-size="200" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content {
  flex: 1;
  overflow: auto;
  max-height: calc(100vh - 225px); /* 根据实际布局调整这个值 */
  min-height: 0;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
}

.title-wrapper.is-active {
  color: var(--el-color-primary);
}
</style>
