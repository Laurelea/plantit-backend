import express,  { Router } from "express";
import controller  from './treatmentsController';
import cors from "cors";

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
        "http://127.0.1.1:8081",
    ],
    credentials: true,
    exposedHeaders: ["set-cookie"],
};

app.use("/", cors(corsOptions), router);

router.get("/", async (req, res) => {
    console.info("Server home page")
    res.render("index.html")
})

router.get("/api/getbase", async (req, res) => {
    const baseToShow = await controller.showDB()
    res.send(baseToShow)
})

router.post("/api/addProducer", async (req, res) => {
    const { success, message } = await controller.addProducer(req.body)
    res.send({ success, message })
})

router.post("/api/addProduct", async (req, res) => {
    const { success, message } = await controller.addPlant(req.body)
    res.send({ success, message })
})

router.post("/api/getNumberOfPlants", async (req, res) => {
    const result = await controller.getNumberOfPlants(req.body.id)
    res.json(result)
})

router.get("/api/getCats", async (req, res) => {
    const result = await controller.getCats()
    res.json(result)
})

router.get("/api/getProducts", async (req, res) => {
    const result = await controller.getPlants()
    res.json(result)
})

router.get("/api/getProducers", async (req, res) => {
    const result = await controller.getProducers()
    res.json(result)
})

router.get("/api/getYearTypes", async (req, res) => {
    const result = await controller.getYearTypes()
    res.json(result)
})

router.put("/api/delplant", async (req, res) => {
    const result = await controller.delSort(req.body)
    res.json(result)
})



export default app
