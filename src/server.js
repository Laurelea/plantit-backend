import express from 'express';
import db from '../components/db';
import treatments from "../components/treatments";
import dns from 'dns';
import os from 'os';
import http from 'http';
import path from 'path';

const PORT = process.env.PORT || 8080;
const app = express();



app.use(express.static(path.join(__dirname, '../public')));

app.use(express.urlencoded({
    extended: true,
}))
app.use(express.json())
app.use('/', treatments);

const server = http.createServer(app);

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

const start = async () => {
    await db.raw("SELECT 1")
        .then(() => {
            console.info("DB connected success");
            server.listen(PORT, () => {
                console.info(`Server is running on port ${PORT}`)
                dns.lookup(os.hostname(), (err, add, fam) => {
                    console.info('server address: ', add);
                })
            })
        })
        .catch(err => {
            console.error('error connecting to pg databse via knex:', err)
            start()
        })
}
start()

