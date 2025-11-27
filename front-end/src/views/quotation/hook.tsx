import dayjs from "dayjs";
import { computed } from "vue";
import editForm from "./form.vue";
import uploadForm from "./upload-form.vue";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import { transformI18n } from "@/plugins/i18n";

import {
  searchProduct,
  getSkusByProductId,
  makeQuotation
} from "@/api/autoImport";
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
  const columns = [
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
      prop: "count",
      cellRenderer: row => <el-input-number v-model={row.count} min={0} />,
      minWidth: 100
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

  const downloadFromBuffer = (buffer, filename) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportQuotation = async () => {
    if (quotation.value.length === 0) {
      message("报价单内无产品", { type: "warning" });
      return;
    }
    const products = quotation.value
      .map(item =>
        item.skuList
          .map(i => ({
            skuCode: i.skuCode,
            quantity: i.count
          }))
          .filter(i => i.quantity > 0)
      )
      .flat();

    if (products.length === 0) {
      message("请输入规格数量", { type: "warning" });
      return;
    }

    const buffer: any = await makeQuotation({ products });
    downloadFromBuffer(new Uint8Array(buffer.data).buffer, "报价单.xlsx");
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
    exportQuotation,
    transformI18n
  };
}
