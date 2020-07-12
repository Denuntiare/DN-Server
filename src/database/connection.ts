import knex from 'knex';
import path from 'path';

const sqliteFilename = {
    filename: path.resolve(__dirname, 'database.sqlite'),
}

const connection = knex({
    client: process.env.DB || 'sqlite3',
    connection: process.env.DATABASE_URL || sqliteFilename,
    useNullAsDefault: true,
});

export default connection;