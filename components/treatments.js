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
    const showTemplates = async () => {
        return await db
            .select()
            .from('treatments_templates')
            .catch(err => {
                console.info('showTemplates err', err)
            });
    }
    const result = await showTemplates(req.body)
    res.json(result)
})

export default app
