// 模拟后端动态生成路由
import { defineFakeRoute } from "vite-plugin-fake-server/client";

/**
 * roles：页面级别权限，这里模拟二种 "admin"、"common"
 * admin：管理员角色
 * common：普通角色
 */
const permissionRouter = {
  path: "/permission",
  meta: {
    title: "权限管理",
    icon: "ep:lollipop",
    rank: 10
  },
  children: [
    {
      path: "/permission/page/index",
      name: "PermissionPage",
      meta: {
        title: "页面权限",
        roles: ["boss"]
      }
    },
    {
      path: "/permission/button",
      meta: {
        title: "按钮权限",
        roles: ["boss", "staff"]
      },
      children: [
        {
          path: "/permission/button/router",
          component: "permission/button/index",
          name: "PermissionButtonRouter",
          meta: {
            title: "路由返回按钮权限",
            auths: [
              "permission:btn:add",
              "permission:btn:edit",
              "permission:btn:delete"
            ]
          }
        },
        {
          path: "/permission/button/login",
          component: "permission/button/perms",
          name: "PermissionButtonLogin",
          meta: {
            title: "登录接口返回按钮权限"
          }
        }
      ]
    }
  ]
};

const autoImportRouter = {
  path: "/autoimport",
  meta: {
    title: "自动导入",
    icon: "ep:histogram",
    rank: 11
  },
  children: [
    {
      path: "/autoimport/index",
      name: "AutoImport",
      meta: {
        title: "产品管理",
        roles: ["boss"]
      }
    }
  ]
};

const quotationRouter = {
  path: "/quotation",
  meta: {
    title: "报价管理",
    icon: "ep:price-tag",
    rank: 12
  },
  children: [
    {
      path: "/quotation/index",
      name: "Quotation",
      meta: {
        title: "报价管理",
        roles: ["boss", "staff"]
      }
    }
  ]
};

export default defineFakeRoute([
  {
    url: "/get-async-routes",
    method: "get",
    response: () => {
      return {
        status: 200,
        data: [autoImportRouter, quotationRouter]
      };
    }
  }
]);
