import dayjs from "dayjs";
import { computed } from "vue";
import editForm from "./form.vue";
import uploadForm from "./upload-form.vue";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";

import { searchProduct, getSkusByProductId } from "@/api/autoImport";
import { type Ref, reactive, ref, onMounted, h, toRaw, watch } from "vue";

export function useQuotation(treeRef: Ref) {
  const form = reactive({
    productId: ""
  });
  const curRow = ref();
  const dataList = ref([]);
  const isShow = ref(false);
  const loading = ref(true);
  const quotation = ref([]);
  const columns: TableColumnList = [
    {
      label: "规格",
      prop: "skuCode"
    },
    {
      label: "描述",
      prop: "desc"
    },
    {
      label: "重量",
      prop: "weight",
      formatter: ({ weight }) => `${weight}kg`
    },
    {
      label: "数量",
      cellRenderer: scope => (
        <el-input-number v-model={scope.row.count} min={0} />
      ),
      minWidth: 50
    },
    {
      label: "单价",
      prop: "unitPrice",
      formatter: ({ unitPrice, unit }) => `${unitPrice}/${unit}`
    }
  ];

  async function onSearch(query = "") {
    loading.value = true;
    const data = await searchProduct({ productNo: query });
    dataList.value = data.list;

    setTimeout(() => {
      loading.value = false;
    }, 100);
  }

  const remoteMethod = async (query: string) => {
    if (query) {
      onSearch(query);
    } else {
      onSearch();
    }
  };

  const addIntoQuotation = async formRef => {
    if (!form.productId) {
      message("请选择产品", { type: "error" });
      return;
    }
    const isExist = quotation.value.find(
      item => item.productId === form.productId
    );
    if (isExist) {
      message("产品已在报价单内", { type: "warning" });
      return;
    }

    const skuList = await getSkusByProductId({ productId: form.productId });
    const product = dataList.value.find(item => item.id === form.productId);
    quotation.value.push({
      productId: form.productId,
      productName: product.name,
      productDesc: product.desc,
      skuList: skuList.list.map(i => ({
        ...i,
        count: 0
      }))
    });
    resetForm(formRef);
  };

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  const handleRemove = productId => {
    quotation.value = quotation.value.filter(
      item => item.productId !== productId
    );
  };

  onMounted(async () => {
    onSearch();
  });
  return {
    form,
    isShow,
    curRow,
    loading,
    dataList,
    quotation,
    remoteMethod,
    addIntoQuotation,
    handleRemove,
    columns,
    transformI18n
  };
}
