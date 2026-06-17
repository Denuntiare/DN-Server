import path from 'path';
import { getDatabaseConfig } from './src/database/config';

module.exports = {
    ...getDatabaseConfig(),

    migrations: {
        directory: path.resolve(__dirname, 'src', 'database', 'migrations'),
    },

    seeds: {
        directory: path.resolve(__dirname, 'src', 'database', 'seeds'),
    },
};
