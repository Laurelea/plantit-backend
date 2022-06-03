import express,  { Router } from "express";
import cors from "cors";
import db from "./db";

const router = Router()
const app = express();

app.use(express.json())
app.use(express.urlencoded({
    extended: true,
}))

const corsOptions = {
    //To allow requests from client
    origin: [
        "http://localhost:3000",
        "http://127.0.1.1:3000",
        "http://127.0.1.1:8080",
    ],
    credentials: true,
    exposedHeaders: ["set-cookie"],
};

app.use("/", cors(corsOptions), router);

router.get("/", async (req, res) => {
    console.info("Server home page")
    res.render("index.html")
})

router.get("/api/show-templates", async (req, res) => {
    const result = await db
        .select()
        .from('treatments_templates')
        .catch(err => {
            console.info('show-templates err', err)
        });
    res.json(result)
})

router.get("/api/show-treatments", async (req, res) => {
    const result = await db
        .select()
        .from('treatments')
        .catch(err => {
            console.info('show-treatments err', err)
        });
    res.json(result)
})

router.get("/api/show-components", async (req, res) => {
    const result = await db
        .select()
        .from('components')
        .catch(err => {
            console.info('show-components err', err)
        });
    res.json(result)
})

router.post("/api/add-component", async (req, res) => {
    const { data } = req
    const result = await db
        .insert({
            ...data
        })
        .into('components')
        .returning('*')
        .then(result => {
            console.info('add-component result', result)
        })
        .catch(err => {
            console.info('add-component err', err)
        });
    res.json(result)
})

export default app
