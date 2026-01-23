<p align="center">
  <img src="/front-end/public/logo.png" width="200" />
  <h1 align="center">KNOW YOUR QUOTATION</h1>
</p>

## 👋 项目介绍

此系统主要是针对传统行业报价方式困难且时间长的问题，针对此类问题做了一个平台性的报价管理系统，通过录入产品信息，维护客户，挑选产品，智能填充价格，快速生成 excel 报价单，提高报价的制作效率。

使用此系统可以从传统的手动报价方式中解放出来，提高报价的制作效率，同时也可以方便地对报价进行管理和分析，从而更好地满足客户的需求，同时也可以对报价进行统计分析，从而更好地了解客户的需求和行为，从而更好地优化产品和服务。

## 🎯 项目目标

提高报价单生成效率：通过系统化的报价单生成流程，将报价单生成时间从以往的两小时缩短至十分钟以内。

指标量化：
1. 报价时间：从客户提交需要购买的产品到客户收到报价单的时间
2. 报价数量：每个月生成的报价单数量
3. 订单数：每个月客户下的订单数量
4. 订单金额：每个月客户下的订单金额
5. 成本节约：通过使用系统节省的时间和人力成本
6. 销售增长：通过提高报价单生成效率带来的销售增长

## 🚀 本地如何启动项目

1. docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
2. 跑下方的脚本迁移内容，将迁移文件中的内容导入至数据库
3. 跑clickhouse的建表语句
4. cd backend-end && npm install && npm run start:dev
5. cd front-end && npm install && npm run dev
6. 查看clickhouse: http://127.0.0.1:8123/
7. 查看grafana: http://127.0.0.1:3001/
8. 查看kafka: http://127.0.0.1:8081/

## 💪 本地如何布署项目

1. docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
2. 访问 http://localhost:8080

## ⚡️ 注意事项
1. kafka启动后，需创建topic: logs 用于记录日志
2. quotation_backend 的日志主要由两部分组成，一部分是由 promtail 收集stdout日志并解析日志字段将数据推送到 loki 进行泛查询
3. 另一部分是将日志打到 kafka 的 logs topic，然后由 clickhouse 进行消费，再通过grafana进行精准查询和统计分析
4. clickhouse 启动后，需要创建表信息，具体的可查询根目录下 config-list/kafka/operation.md

## 🎉 项目架构
1. 前端：vue3 + ts
2. 代理：nginx 转发
3. 后端：nestjs + restful api + graphql
4. 数据库：mysql + mongo + clickhouse
5. 缓存：redis
6. 指标收集：prometheus + grafana
7. 泛日志收集：promtail + loki + grafana
8. 日志分析： kafka + clickhouse + grafana
9. 消息队列：kafka
10. 其他UI相关：kafbat

## 🔥 脚本迁移

```bash
# git bash command
# 将内容同步至数据库
./autoMigrate.sh

# 将数据库内容导出至迁移文件
./autoExport.sh

# 导入迁移文件到数据库
docker exec -i quotation_mysql mysql -uroot -pshiyuq know_your_quotation < migration/mysql/all-tables-data.sql
```

## 🔨 TODO

- [X] 权限控制
- [X] 登录注册
- [X] 产品管理
- [ ] 实时汇率计算 https://api.currencyapi.com/v3/latest?apikey=
- [ ] 客户管理
- [ ] 报价管理
- [X] 导出为 excel 文件
- [X] 丰富报价管理功能，而不是简单的字段移植
- [X] 优化代码，减少冗余
- [ ] 平台区分平台管理员、客户管理员、客户用户
- [ ] 租户基本信息维护
- [X] 租户管理界面
- [ ] 客户用户管理界面
- [ ] 密码重置界面
- [ ] 拆分mysql表的 Repository，将SQL查询内聚到对应的Repository中，service层只负责业务逻辑
- [ ] 报价生成走消息队列异步处理

## 🔧 维护者

[Jack](https://github.com/shiyuq)

## 📄 许可证

本项目采用 MIT 许可证，详情请查看 [LICENSE](LICENSE) 文件。

## 🙋‍♂️ 贡献

欢迎任何形式的贡献，包括但不限于提交 bug 报告、改进建议、代码提交、文档编写等。

## 🙏 鸣谢

* [vue-pure-admin](https://github.com/pure-admin/vue-pure-admin)
* [nestjs](https://github.com/nestjs/nest)
