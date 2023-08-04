import db from '../components/db';

const capitalizeFirstLetter = str => {
    return str.charAt(0).toUpperCase() + str.substring(1);
}

export default {
    getUser: async email => {
        // console.info('Email to check: ', email)
        return await db.query('SELECT * FROM users WHERE email=$1', [email])
    },
    getUserByUN: async username => {
        console.info('UN to check: ', username)
        return await db.query('SELECT * FROM users WHERE user_name=$1', [username])
    },
    addUser: async (username, password, email) => {
        try {
            const hashedPassword = await bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
            return await db.query(
                'INSERT INTO users(user_name, password, email, true_password) VALUES ($1, $2, $3, $4) RETURNING *', [username, hashedPassword, email, password])
        } catch (e) {
            return e
        }
    },
    showUsersTable: async () => {
        // console.info ("before query")
        return await db.query('SELECT * FROM users')
        // return showUsers
    },
    checkPass: async (password, hashedPassword) => {
        return bcrypt.compareSync(password, hashedPassword)
    },
    editUser: async (id, user_name, email, password) => {
        try {
            const user = await this.getUserByID(id)
            if (user_name.length !== 0 && (user_name !== user.rows[0].user_name)) {
                await db.query(`UPDATE users SET user_name=$1 WHERE id: $2`, [user_name, id])
            }
            if (email.length !== 0 && (email !== user.rows[0].email)) {
                await db.query(`UPDATE users SET email=$1 WHERE id: $2`, [email, id])
            }
            if (password) {
                const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
                if (hashedPassword !== user.rows[0].password) {
                    await db.query(`UPDATE users SET password: $1 WHERE id: $2`, [hashedPassword, id])
                }
            }
        } catch (err) {
            console.info(err)
        }
    },
    deleteUser: async () => {
        try {

        } catch (err) {
            console.info(err)
        }
    },
    getToken: async token => {
        console.info('Token to check: ', token)
        return await db.query('SELECT * FROM sessions WHERE token=$1', [token])
    },
    showDB: async () => {
        return await dbKnex
            .select([
                'sort.id',
                'plant_categories.category_name',
                'plant_categories.id',
                'plant.plant_name',
                'plant.id as plant_id',
                'plant.soil',
                'plant.watering',
                'sort.sort_name as sort_name',
                'producer.producer_name',
                'producer.id as producer_id',
                'users.user_name',
                'plant.rootstock',
                'plant.year_type as yeartype',
                // 'plant.depth_min',
                // 'plant.depth_max',
                'plant.planting_depth',
                // 'sort.height_min',
                // 'sort.height_max',
                'sort.height',
                // 'sort.days_to_seedlings_max',
                // 'sort.days_to_seedlings_min',
                'sort.days_to_seedlings',
                // 'sort.planting_stop_day',
                // 'sort.planting_stop_month',
                // 'sort.planting_start_day',
                // 'sort.planting_start_month',
                'sort.planting_time',
                'plant.sun',
            ])
            .from('sort')
            .leftJoin('producer', 'sort.producer_id', 'producer.id')
            .leftJoin('plant', 'sort.plant_id', 'plant.id')
            .leftJoin('users', 'sort.user_id', 'users.id')
            .leftJoin('categories', 'plant.category', 'plant_categories.id')
            .orderBy('sort.id')
            .catch(err => {
                console.info('125 err', err)
            });
    },
    getCats: async () => {
        return await db
            .select()
            .from('plant_categories')
            .catch(err => {
                console.info('144 err', err)
            });
    },
    getPlants: async () => {
        return await db
            .select()
            .from('plant')
            .catch(err => {
                console.info('151 err', err)
            });
    },
    getProducers: async () => {
        return await db
            .select()
            .from('producer')
            .catch(err => {
                console.info('158 err', err)
            });
    },
    getYearTypes: async () => {
        return await db
            .select(db.raw('unnest(enum_range(NULL::year_type))'))
            .catch(err => {
                console.info('165 err', err)
            });
    },
    getNumberOfPlants: async id => {
        try {
            const plantFound = await db.query('SELECT * FROM sort WHERE user_id=$1', [id])
            console.info("getNumberOfPlants controller id, plantFound.rows.length: ", id, plantFound.rows.length)
            return plantFound.rows.length
        } catch (error) {
            console.info("controller getNumberOfPlants error: ", error)
            return error
        }
    },
    delSession: async sessID => {
        console.info('177 controller sessID', sessID)
        try {
            return await db.query('DELETE from sessions WHERE sid=$1', [sessID])
        } catch (err) {
            console.info('180 controller delSession:', err)
        }
    },
    addProducer: async data => {
        const {producer} = data;
        console.info('controller addProducer producer', producer)
        let success = false;
        let message;
        await db
            .select()
            .from('producer')
            .where({producer_name: capitalizeFirstLetter(producer)})
            .then(async result => {
                console.info('246 check producer result', result)
                if (result.length === 0) {
                    await dbKnex
                        .insert({producer_name: capitalizeFirstLetter(producer)})
                        .into('producer')
                        .returning('*')
                        .then(result => {
                            console.info('252 result', result)
                            if (result[0].id > 0) {
                                success = true;
                                message = 'successfully added';
                                // return { success, message = }
                            }
                        })
                        .catch(err => {
                            console.info('insert err', err)
                        });
                } else {
                    console.info("Producer exists :", result[0].id)
                    message = 'producer exists';
                    // return { success, message =  }
                }
            })
            .catch(err => {
                console.info('check err', err)
            });
        return { success, message }
    },
    addCat: async data => {
        const {category, cat_pic, cat_desc} = data;
        console.info('controller addCat cat', category)
        let success = false;
        let message;
        await dbKnex
            .select()
            .from('plant_categories')
            .where({cat_name: capitalizeFirstLetter(category)})
            .then(async result => {
                // console.info('283 check category result', result)
                if (result.length === 0) {
                    await dbKnex
                        .insert({ category_name: capitalizeFirstLetter(category), description, cat_pic })
                        .into('plant_categories')
                        .returning('*')
                        .then(result => {
                            console.info('290 result', result, result[0].cat_id)
                            if (result[0].id > 0) {
                                console.info('292 ', result[0].cat_id)
                                success = true;
                                message = 'successfully added';
                            }
                        })
                        .catch(err => {
                            console.info('insert err', err)
                        });
                } else {
                    console.info("Cat exists :", result[0].id)
                    message = 'cat exists';
                }
            })
            .catch(err => {
                console.info('check err', err)
            });
        return {success, message}
    },
    addPlant: async data => {
        const {
            category,
            plant_name,
            year_type,
            rootstock,
            // depth_min,
            // depth_max,
            planting_depth,
            watering,
            soil,
            sun
        } = data;
        console.info('controller addProduct product', product)
        let success = false;
        let message;
        await dbKnex
            .select()
            .from('plant')
            .where({ plant_name })
            .then(async result => {
                // console.info('283 check category result', result)
                if (result.length === 0) {
                    await dbKnex
                        .insert({
                            plant_name,
                            category,
                            year_type,
                            rootstock,
                            // depth_min,
                            // depth_max,
                            planting_depth,
                            watering,
                            soil,
                            sun
                        })
                        .into('plant')
                        .returning('*')
                        .then(result => {
                            console.info('325 result', result, result[0].id)
                            if (result[0].id > 0) {
                                console.info('327 ', result[0].id)
                                success = true;
                                message = 'successfully added';
                            }
                        })
                        .catch(err => {
                            console.info('insert err', err)
                        });
                } else {
                    console.info("Product exists :", result[0].id)
                    message = 'product exists';
                }
            })
            .catch(err => {
                console.info('check err', err)
            });
        return {success, message}
    },
    addSort: async data => {
        console.info('292 addPlant data:', data)
        const { producer_id, plant_id, sort_name } = data
        let success = false;
        let message;
        await dbKnex
            .select()
            .from('sort')
            .where({ sort_name, producer_id, plant_id })
            .then(async result => {
                if (result.length === 0) {
                    await dbKnex
                        .insert({
                            ...data
                        })
                        .into('sort')
                        .returning('*')
                        .then(result => {
                            console.info('333 result', result)
                            console.info('334 result', result[0].id)
                            if (result[0].id > 0) {
                                console.info('336 ', result[0].id)
                                success = true;
                                message = 'successfully added';
                            }
                        })
                        .catch(err => {
                            console.info('insert err', err)
                        });
                } else {
                    console.info("Plant exists :", result[0].id)
                    message = 'Plant exists';
                }
            })
            .catch(err => {
                console.info('check err', err)
            });
        return {success, message}
    },
    delSort: async data => {
        console.info('329 data:', data)
        const { id } = data;
        console.info('331 id:', id)
        let success = false;
        let message;
        await dbKnex
            .delete()
            .from('sort')
            .where({ id })
            .then(async result => {
                console.info('337 controller result', result)
                message = 'plant deleted ok';
                success = true;
            })
            .catch(err => {
                console.info('check err', err)
                message = JSON.stringify(err);
            });
        return { success, message }
    },
    editSort: async data => {
        console.info('354 editSort data:', data)
        const {
            id,
            plant_id,
            producer_id,
            sort_name,
            // days_to_seedlings_min,
            // days_to_seedlings_max,
            days_to_seedlings,
            // height_max,
            // height_min,
            height,
            // planting_start_day,
            // planting_start_month,
            // planting_stop_day,
            // planting_stop_month,
            planting_time,
            user_id
        } = data
        let success = false;
        let message;
        await dbKnex('sort')
            .where({ id })
            .update({
                plant_id,
                producer_id,
                sort_name,
                // days_to_seedlings_min,
                // days_to_seedlings_max,
                days_to_seedlings,
                // height_max,
                // height_min,
                height,
                // planting_start_day,
                // planting_start_month,
                // planting_stop_day,
                // planting_stop_month,
                planting_time,
                user_id
            })
            .then(async result => {
                success = true;
                console.info('403 controller editSort result:', result)
            })
            .catch(err => {
                console.info('406 check err', err)
                message = JSON.stringify(err);
            });
        return { success, message }
    }
}


