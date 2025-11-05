import { MysqlConfig } from './mysql.type';
import { registerAs } from '@nestjs/config';

export default registerAs<MysqlConfig>('mysql', () => {
  return {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
  };
});
