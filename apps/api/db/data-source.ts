import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm'
import { InitializeDatabase1677126858699 } from './migrations/1677126858699-InitializeDatabase';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: +`${process.env.DATABASE_PORT}`,
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  migrations: [InitializeDatabase1677126858699],
  entities: [path.join(__dirname, '../../../../packages/types/dist/**/*.entity{.ts,.js}')],
  logging: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
