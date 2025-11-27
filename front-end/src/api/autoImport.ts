import { http } from "@/utils/http";

type Result = {
  status: number;
  data?: Array<any>;
};

type ResultTable = {
  /** 列表数据 */
  list: Array<any>;
  /** 总条目数 */
  total?: number;
  /** 每页显示条目个数 */
  pageSize?: number;
  /** 当前页数 */
  currentPage?: number;
};

export const getProductList = (data?: object) => {
  return http.request<ResultTable>("post", "/api/product/list-sku", { data });
};

export const searchProduct = (data?: object) => {
  return http.request<ResultTable>("post", "/api/product/list", { data });
};

export const getSkusByProductId = (data?: object) => {
  return http.request<ResultTable>("post", "/api/product/sku", { data });
};

export const makeQuotation = (data?: object) => {
  return http.request("post", "/api/quotation/make", { data });
};

export const importProduct = (data?: object) => {
  return http.request<Result>(
    "post",
    "/api/product/leadin",
    { data },
    {
      headers: { "Content-Type": "multipart/form-data" }
    }
  );
};
