import knex from 'knex';

const db =  knex(
    {
        client: 'pg',
        connection: {
            user: 'myuser',
            host: '78.24.220.250',
            database: 'myplants',
            password: 'mypass',
            port: 5432,
            ssl: { rejectUnauthorized: false }
        },
        debug: true,
    }
);

export default db;
