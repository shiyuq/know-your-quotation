// 此文件的目的是为了统一导出配置相关的内容，方便在应用的其他部分进行导入和使用

export * from './config.type';
export { default as appConfig } from './configuraion/configuration';
export { default as mysqlConfig } from './mysql/mysql';
export { default as mongoConfig } from './mongo/mongo';
export { default as kafkaConfig } from './kafka/kafka';
