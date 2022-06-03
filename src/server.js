import express from 'express';
import db from '../components/db';
// import routes from "../components/routes";
import treatments from "../components/treatments";
import dns from 'dns';
import os from 'os';
import http from 'http';
import path from 'path';

const PORT = process.env.PORT || 8080;
// const env = process.env.NODE_ENV || 'production';
// const maxage = env === 'production' ? 86400000 : 0;
const app = express();


// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//     res.header('Access-Control-Allow-Credentials', true);
//     res.header('Access-Control-Expose-Headers', '*');
//     next();
// });

app.use(express.static(path.join(__dirname, '../public')));

app.use(express.urlencoded({
    extended: true,
}))
app.use(express.json())
// app.use('/', express.static(path.resolve(__dirname, '../index.html'), { maxage }));

// app.use('/', routes);
app.use('/', treatments);

const server = http.createServer(app);

app.get("*", (req, res) => {
    // res.sendFile(path.join(__dirname, '../build', 'index.html'))
    res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

const start = async () => {
    await db.raw("SELECT 1")
        .then(() => {
            console.info("DB connected success");
            server.listen(process.env.PORT || 8080, () => {
                console.info(`Server is running on port ${PORT}`)
                dns.lookup(os.hostname(), (err, add, fam) => {
                    console.info('addr: ', add);
                })
            })
        })
        .catch(err => {
            return console.error('error connecting to pg via knex:', err)
        })
}
start()

