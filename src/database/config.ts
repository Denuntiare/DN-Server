import path from 'path';

const sqliteFilename = {
    filename: process.env.DATABASE_URL || path.resolve(__dirname, 'database.sqlite'),
};

export function getDatabaseConfig() {
    const client = process.env.DB || 'sqlite3';
    const isSqlite = client === 'sqlite3';

    return {
        client,
        connection: isSqlite
            ? sqliteFilename
            : process.env.DATABASE_URL,
        useNullAsDefault: isSqlite,
    };
}
