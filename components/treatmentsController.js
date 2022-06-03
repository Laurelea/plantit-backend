import db from '../components/db';

const capitalizeFirstLetter = str => {
    return str.charAt(0).toUpperCase() + str.substring(1);
}

export default {
    getUser: async email => {
        // console.info('Email to check: ', email)
        return await db.query('SELECT * FROM users WHERE email=$1', [email])
        // console.info(ifUser, ifUser.rows.length)
        // return ifUser
    },
    getUserByUN: async username => {
        console.info('UN to check: ', username)
        return await db.query('SELECT * FROM users WHERE user_name=$1', [username])
        // console.info("ifUser.rows.length: ", ifUser.rows.length)
        // return ifUN
    },
    addUser: async (username, password, email) => {
        try {
            const hashedPassword = await bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
            return await db.query(
                'INSERT INTO users(user_name, password, email, true_password) VALUES ($1, $2, $3, $4) RETURNING *', [username, hashedPassword, email, password])
            // console.info("New User:", newUser)
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
        // console.info("ifUser.rows.length: ", ifUser.rows.length)
        // return ifToken
    },
    showDB: async () => {
        return await dbKnex
            .select([
                'sort.id',
                'categories.cat_name',
                'categories.cat_id',
                'product.product_name',
                'product.id as product_id',
                'product.soil',
                'product.watering',
                'sort.name as name',
                'producer.producer_name',
                'producer.id as producer_id',
                'users.user_name',
                'product.rootstock',
                'yeartypes.name as yeartype',
                'product.depth_min',
                'product.depth_max',
                'sort.height_min',
                'sort.height_max',
                'sort.days_to_seedlings_max',
                'sort.days_to_seedlings_min',
                'sort.planting_stop_day',
                'sort.planting_stop_month',
                'sort.planting_start_day',
                'sort.planting_start_month',
                'product.sun',
            ])
            .from('sort')
            .leftJoin('producer', 'sort.producer_id', 'producer.id')
            .leftJoin('product', 'sort.product_id', 'product.id')
            .leftJoin('users', 'sort.user_id', 'users.user_id')
            .leftJoin('categories', 'product.category', 'categories.cat_id')
            .leftJoin('yeartypes', 'product.yeartype', 'yeartypes.id')
            .orderBy('sort.id')
            .catch(err => {
                console.info('125 err', err)
            });
    },
    getCats: async () => {
        return await dbKnex
            .select()
            .from('categories')
            .catch(err => {
                console.info('144 err', err)
            });
    },
    getProducts: async () => {
        return await dbKnex
            .select()
            .from('product')
            .catch(err => {
                console.info('151 err', err)
            });
    },
    getProducers: async () => {
        return await dbKnex
            .select()
            .from('producer')
            .catch(err => {
                console.info('158 err', err)
            });
    },
    getYearTypes: async () => {
        return await dbKnex
            .select()
            .from('yeartypes')
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
        await dbKnex
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
        return {success, message}
    },
    addCat: async data => {
        const {category, cat_pic, cat_desc} = data;
        console.info('controller addCat cat', category)
        let success = false;
        let message;
        await dbKnex
            .select()
            .from('categories')
            .where({cat_name: capitalizeFirstLetter(category)})
            .then(async result => {
                // console.info('283 check category result', result)
                if (result.length === 0) {
                    await dbKnex
                        .insert({cat_name: capitalizeFirstLetter(category), cat_desc, cat_pic})
                        .into('categories')
                        .returning('*')
                        .then(result => {
                            console.info('290 result', result, result[0].cat_id)
                            if (result[0].cat_id > 0) {
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
    addProduct: async data => {
        const {
            category,
            product,
            yeartype,
            rootstock,
            depth_min,
            depth_max,
            watering,
            soil,
            sun
        } = data;
        console.info('controller addProduct product', product)
        let success = false;
        let message;
        await dbKnex
            .select()
            .from('product')
            .where({product_name: capitalizeFirstLetter(product)})
            .then(async result => {
                // console.info('283 check category result', result)
                if (result.length === 0) {
                    await dbKnex
                        .insert({
                            product_name: capitalizeFirstLetter(product),
                            category,
                            yeartype,
                            rootstock,
                            depth_min,
                            depth_max,
                            watering,
                            soil,
                            sun
                        })
                        .into('product')
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
    addPlant: async data => {
        console.info('292 addPlant data:', data)
        const {producer_id, product_id, name} = data
        let success = false;
        let message;
        await dbKnex
            .select()
            .from('sort')
            .where({name, product_id, producer_id})
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
    delPlant: async data => {
        console.info('329 data:', data)
        const {id} = data;
        console.info('331 id:', id)
        let success = false;
        let message;
        await dbKnex
            .delete()
            .from('sort')
            .where({id})
            .then(async result => {
                console.info('337 controller result', result)
                message = 'plant deleted ok';
                success = true;
            })
            .catch(err => {
                console.info('check err', err)
                message = JSON.stringify(err);
            });
        return {success, message}
    },
    editPlant: async data => {
        console.info('354 editPlant data:', data)
        const {
            id,
            product_id,
            producer_id,
            name,
            days_to_seedlings_min,
            days_to_seedlings_max,
            height_max,
            height_min,
            planting_start_day,
            planting_start_month,
            planting_stop_day,
            planting_stop_month,
            user_id
        } = data
        let success = false;
        let message;
        await dbKnex('sort')
            .where({id})
            .update({
                product_id,
                producer_id,
                name,
                days_to_seedlings_min,
                days_to_seedlings_max,
                height_max,
                height_min,
                planting_start_day,
                planting_start_month,
                planting_stop_day,
                planting_stop_month,
                user_id
            })
            .then(async result => {
                success = true;
                console.info('403 controller editplant result:', result)
            })
            .catch(err => {
                console.info('406 check err', err)
                message = JSON.stringify(err);
            });
        return {success, message}
    }
}


