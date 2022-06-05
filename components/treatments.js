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
    const fields = `
        t.id,
        t.date_create,
        t.status,
        tt.plant,
        tt.type,
        tt.purpose,
        tt.phase_start,
        tt.phase_end,
        t.period_started,
        t.period_ended,
        t.dates_to_do,
        t.dates_done,
        t.number_done,
        tt.frequency,
        tt.treatment_gap,
        tt.special_condition
      `;
    const components = ', array_agg(c.name) as components';
    const result = await db
        .select(db.raw(fields + components))
        .from({t: 'treatments'})
        .leftJoin({ tt: 'treatments_templates' }, 't.template_id', 'tt.id')
        .leftJoin(db.raw('components c on c.id::text = any(t.contents)'))
        .groupBy(db.raw(fields))
        .catch(err => {
            console.info('show-treatments err', err)
        });
    res.json(result)
})

router.get("/api/show-components", async (req, res) => {
    const result = await db
        .select('c.id', 'c.name', 's.name as s_name')
        .from({c: 'components'})
        .leftJoin({s: 'substances'}, 'c.substance', 's.id')
        .catch(err => {
            console.info('show-components err', err)
        });
    res.json(result)
})

router.get("/api/show-substances", async (req, res) => {
    const result = await db
        .select('s.id', 's.name')
        .from({s: 'substances'})
        .catch(err => {
            console.info('show-substances err', err)
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
