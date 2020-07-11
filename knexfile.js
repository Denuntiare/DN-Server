// import path from 'path';
const path = require('path');

const sqliteFilename = {
    filename: path.resolve(__dirname, 'database.sqlite'),
}
module.exports = {
    client: process.env.DB || 'sqlite3',
    connection: process.env.DATABASE_URL || sqliteFilename,

    migrations: {
        directory: path.resolve(__dirname, 'src', 'database', 'migrations'),
    },

    seeds: {
        directory: path.resolve(__dirname, 'src', 'database', 'seeds'),
    },
};