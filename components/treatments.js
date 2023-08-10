import express, { Router } from "express";
import cors from "cors";
import db from "./db";

const router = Router();
const app = express();

app.use(express.json())
app.use(express.urlencoded({
    extended: true,
}))

const corsOptions = {
    //To allow requests from client
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.1.1:3000",
        "http://127.0.1.1:3001",
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

router.get("/api/show-templates", async (req, res) => {
    const fields = `
        tt.id,
        tt.template_name,
        p.plant_name as plant,
        phase_start,
        phase_end,
        frequency,
        treatment_gap,
        special_condition,
        apply_type,
        type,
        dosage,
        volume
    `;
    // const gb = `
    //     tt.id,
    //     p.plant_name,
    //     phase_start,
    //     phase_end,
    //     frequency,
    //     treatment_gap,
    //     special_condition,
    //     apply_type,
    //     type,
    //     dosage,
    //     volume,
    //     contents
    // `;
    const result = await db
        .select(db.raw(fields))
        .from({ tt: 'treatments_templates' })
        .leftJoin({ p: 'plant' }, 'p.id', 'tt.plant_id')
        // .groupBy(db.raw(gb))
        .catch(err => {
            console.info('show-templates err', err)
        });
    res.json(result)
})

router.get("/api/get-plants", async (req, res) => {
    const result = await db
        .select()
        .from('plant')
        .catch(err => {
            console.info('get-plants err', err)
        });
    res.json(result)
})
//
// router.get("/api/get-phases", async (req, res) => {
//     const result = await db
//         .select()
//         .from('phases')
//         .catch(err => {
//             console.info('get-phases err', err)
//         });
//     res.json(result)
// })

// router.get("/api/get-treatment-types", async (req, res) => {
//     const result = await db
//         .select()
//         .from('treatment_types')
//         .catch(err => {
//             console.info('get-treatment-types err', err)
//         });
//     res.json(result)
// })
//
// router.get("/api/get-treatment-apply-types", async (req, res) => {
//     const result = await db
//         .select()
//         .from('treatment_apply_types')
//         .catch(err => {
//             console.info('get-treatment-apply-types err', err)
//         });
//     res.json(result)
// })


router.get("/api/show-treatments", async (req, res) => {
    const fields = `
        t.id,
        t.date_create,
        t.status,
        p.plant_name as plant,
        type,
        apply_type,
        tt.phase_start,
        tt.phase_end,
        t.date_started,
        t.date_finished,
        t.dates_to_do,
        t.dates_done,
        t.number_done,
        tt.frequency,
        tt.treatment_gap,
        tt.special_condition,
        tt.dosage,
        tt.volume,
        tt.contents
      `;
    const gb = `
        t.id,
        t.date_create,
        t.status,
        p.plant_name,
        type,
        apply_type,
        tt.phase_start,
        tt.phase_end,
        t.date_started,
        t.date_finished,
        t.dates_to_do,
        t.dates_done,
        t.number_done,
        tt.frequency,
        tt.treatment_gap,
        tt.special_condition,
        tt.dosage,
        tt.volume,
        tt.contents
      `;
    const result = await db
        .select(db.raw(fields))
        .from({ t: 'treatments' })
        .leftJoin({ tt: 'treatments_templates' }, 't.template_id', 'tt.id')
        .leftJoin({ p: 'plant' }, 'p.id', 'tt.plant_id')
        .groupBy(db.raw(gb))
        .catch(err => {
            console.info('show-treatments err', err)
        });
    res.json(result)
})

router.get("/api/show-components", async (req, res) => {
    const result = await db
        .select(db.raw('c.id, c.component_name, array_agg(s.substance_name) as substances'))
        .from({ c: 'components' })
        .leftJoin(db.raw('substances as s on s.id = any(c.substances)'))
        .groupBy('c.id', 'c.component_name')
        .catch(err => {
            console.info('show-components err', err)
        });
    res.json(result)
})

router.get("/api/show-substances", async (req, res) => {
    const result = await db
        .select('s.id', 's.substance_name')
        .from({ s: 'substances' })
        .catch(err => {
            console.info('show-substances err', err)
        });
    res.json(result)
})

router.post("/api/add-component", async (req, res) => {
    const data = req.body
    const result = {}
    await db
        .select('id')
        .from('components')
        .where({ component_name: data.component_name })
        .then(async res => {
            if (res.length) {
                result.success = false
                result.message = 'component already exists'
            } else {
                await db
                    .insert({
                        ...data
                    })
                    .into('components')
                    .returning('*')
                    .then(res => {
                        console.info('add-component result', res)
                        result.success = true
                        result.message = 'success'
                    })
                    .catch(err => {
                        console.info('add-component err', err)
                        result.success = false
                        result.message = err
                    })
            }
        })
        .catch(err => {
            console.info('check component err', err)
            result.success = false
            result.message = err
        })
        .finally(() => {
            res.json(result)
        });
})

// router.post("/api/add-phase", async (req, res) => {
//     const data = req.body
//     const result = {}
//     await db
//         .select('id')
//         .from('phases')
//         .where({ phase_name: data.phase_name })
//         .then(async res => {
//             if (res.length) {
//                 result.success = false
//                 result.message = 'phase already exists'
//             } else {
//                 await db
//                     .insert({
//                         ...data
//                     })
//                     .into('phases')
//                     .returning('*')
//                     .then(res => {
//                         console.info('add-phase result', res)
//                         result.success = true
//                         result.message = 'success'
//                     })
//                     .catch(err => {
//                         console.info('add-phase err', err)
//                         result.success = false
//                         result.message = err
//                     })
//             }
//         })
//         .catch(err => {
//             console.info('check phase err', err)
//             result.success = false
//             result.message = err
//         })
//         .finally(() => {
//             res.json(result)
//         });
// })

router.post("/api/add-template", async (req, res) => {
    const data = req.body
    const result = {}
    await db
        .insert({
            ...data
        })
        .into('treatments_templates')
        .returning('*')
        .then(res => {
            console.info('add-template result', res)
            result.success = true
            result.message = 'success'
        })
        .catch(err => {
            console.info('add-template err', err)
            result.success = false
            result.message = err
        })
        .finally(() => {
            res.json(result)
        });
})

router.post("/api/add-substance", async (req, res) => {
    const data = req.body
    const result = {}
    await db
        .select('id')
        .from('substances')
        .where({ substance_name: data.substance_name })
        .then(async res => {
            if (res.length) {
                result.success = false
                result.message = 'substance already exists'
            } else {
                await db
                    .insert({
                        ...data
                    })
                    .into('substances')
                    .returning('*')
                    .then(res => {
                        console.info('add-substance result', res)
                        result.success = true
                        result.message = 'success'
                    })
                    .catch(err => {
                        console.info('add-substance err', err)
                        result.success = false
                        result.message = err
                    })
            }
        })
        .catch(err => {
            console.info('check substance err', err)
            result.success = false
            result.message = err
        })
        .finally(() => {
            res.json(result)
        });
})

export default app
