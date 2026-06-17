import knex from 'knex';
import { getDatabaseConfig } from './config';

const connection = knex(getDatabaseConfig());

export default connection;
