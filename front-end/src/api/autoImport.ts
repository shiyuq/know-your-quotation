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

export const deleteSku = (data?: object) => {
  return http.request<Result>("post", "/api/product/delete-sku", { data });
};

export const offlineSku = (data?: object) => {
  return http.request<Result>("post", "/api/product/offline-sku", { data });
};

export const listTenant = (data?: object) => {
  return http.request<ResultTable>("post", "/api/tenant/list", { data });
};

export const registerTenant = (data?: object) => {
  return http.request<Result>("post", "/api/tenant/register", { data });
};

export const getTenantDetail = (data?: object) => {
  return http.request<Result>("post", "/api/tenant/detail", { data });
};

export const deleteTenant = (data?: object) => {
  return http.request<Result>("post", "/api/tenant/delete", { data });
};

export const enableTenant = (data?: object) => {
  return http.request<Result>("post", "/api/tenant/enable", { data });
};

export const updateTenant = (data?: object) => {
  return http.request<Result>("post", "/api/tenant/update", { data });
};
