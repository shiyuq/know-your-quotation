<h1>know your quotation（更加了解你的报价系统）</h1>

## 介绍

此系统主要是针对外贸等各个行业报价困难，时间长的问题，针对此类问题做了一个简易的报价系统，通过录入产品信息，选择客户，选择产品，选择价格，生成报价单，然后可以导出为 excel 文件，方便客户查看。

## 如何启动项目

1. docker-compose up -d --build
2. cd backend-end && npm install && npm run start:dev
3. cd front-end && npm install && npm run dev

## 脚本迁移

```bash
# 生成迁移文件
# git bash command
./autoMigrate.sh

# 将迁移文件应用到数据库
./autoExport.sh
```

## TODO

- [X] 权限控制
- [X] 登录注册
- [X] 产品管理
- [ ] 实时汇率计算 https://api.currencyapi.com/v3/latest?apikey=
- [ ] 客户管理
- [ ] 报价管理

## 维护者

[Jack](https://github.com/shiyuq)
