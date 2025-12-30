<h1>know your quotation（更加了解你的报价系统）</h1>

## 介绍

此系统主要是针对外贸等各个行业报价困难，时间长的问题，针对此类问题做了一个简易的报价系统，通过录入产品信息，选择客户，选择产品，选择价格，生成报价单，然后可以导出为 excel 文件，方便客户查看。

## 本地如何启动项目

1. docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
2. cd backend-end && npm install && npm run start:dev
3. cd front-end && npm install && npm run dev
4. 查看clickhouse: http://127.0.0.1:8123/
5. 查看grafana: http://127.0.0.1:3001/
6. 查看kafka: http://127.0.0.1:8081/

## 本地如何布署项目

1. docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
2. 访问 http://localhost:8080

## 注意事项
1. kafka启动后，需创建topic: logs 用于记录日志
2. quotation_backend 的日志主要由两部分组成，一部分是由 promtail 收集stdout日志并解析日志字段将数据推送到 loki 进行泛查询
3. 另一部分是将日志打到 kafka 的 logs topic，然后由 clickhouse 进行消费，再通过grafana进行精准查询和统计分析
4. clickhouse 启动后，需要创建表信息，具体的可查询根目录下 config-list/kafka/operation.md

## 项目架构
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

## 脚本迁移

```bash
# 生成迁移文件
# git bash command
./autoMigrate.sh

# 将迁移文件应用到数据库
./autoExport.sh

# 导入迁移文件到数据库
docker exec -i quotation_mysql mysql -uroot -pshiyuq know_your_quotation < migration/mysql/all-tables-data.sql
```

## TODO

- [X] 权限控制
- [X] 登录注册
- [X] 产品管理
- [ ] 实时汇率计算 https://api.currencyapi.com/v3/latest?apikey=
- [ ] 客户管理
- [X] 报价管理
- [X] 导出为 excel 文件
- [X] 丰富报价管理功能，而不是简单的字段移植
- [X] 优化代码，减少冗余

## 维护者

[Jack](https://github.com/shiyuq)
