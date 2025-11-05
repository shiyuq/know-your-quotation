// 此文件的目的是为了提示类型，避免在代码中使用any类型

import { AppConfig } from './configuraion/configuration.type';
import { MongoConfig } from './mongo/mongo.type';
import { MysqlConfig } from './mysql/mysql.type';

export type AllConfigType = {
  app: AppConfig;
  mysql: MysqlConfig;
  mongo: MongoConfig;
};
