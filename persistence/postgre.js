class PG {
    constructor(client) {
        this.client = client;
    }

    async AddUser(userData) {
        let email = userData.email;
        let pswd = userData.password;
        const query = `INSERT INTO user_registry (email, password)
                       VALUES ('${email}', '${pswd}')`;
        const client = this.client;
        await new Promise((resolve) => {
            client.query(query, (err) => {
                if (err) {
                    console.error(err);
                    throw err;
                }
            });
            resolve();
        });
    }

    async GetPrivateUserInfo(email) {
        const query = `SELECT *
                       FROM user_registry
                       WHERE email = '${email}'`;
        const client = this.client;
        console.log(`user is tried to get with email ${email}`);
        return await new Promise((resolve) => {
            client.query(query, (err, res) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                resolve(res.rows[0]);
            });
        });
    }

    async GetUserInfo(email, id) {
        if (id === undefined) {
            id = 0;
        }
        const query = `SELECT *
                       FROM profile_user
                       WHERE email = '${email}'
                          OR user_id = ${id}`;
        const client = this.client;
        return await new Promise((resolve) => {
            client.query(query, (err, res) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                resolve(res.rows[0]);
            });
        });
    }

    async AddUserProfile(userInfo) {
        const query = `INSERT INTO profile_user
                           (user_id, email, first_name, last_name, photo_url, interest, location)
                       VALUES ('${userInfo.id}',
                               '${userInfo.email}',
                               '${userInfo.firstName}',
                               '${userInfo.lastName}',
                               '${userInfo.photoURL}',
                               '${userInfo.interest}',
                               '${userInfo.location}')`;
        const client = this.client;
        return await new Promise((resolve) => {
            client.query(query, (err, res) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                resolve(res.rows[0]);
            });
        });
    }

    async UpdateUserProfile(userInfo) {
        const query = `UPDATE profile_user
                       SET first_name = '${userInfo.firstName}',
                           last_name  = '${userInfo.lastName}',
                           interest   = '${userInfo.interest}',
                           location   = '${userInfo.location}',
                           photo_url  = '${userInfo.photoURL}'
                       WHERE email = '${userInfo.email}'`;
        const client = this.client;
        return await new Promise((resolve) => {
            client.query(query, (err) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                resolve();
            });
        });
    }

    async UpdateUserRegistry(information) {
        const query = `UPDATE user_registry
                       SET email    = '${information.email}',
                           password = '${information.newPassword}'
                       WHERE email = '${information.email}'`;
        const client = this.client;
        return await new Promise((resolve) => {
            client.query(query, (err) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                resolve();
            });
        });
    }

    async DeleteUser(information) {
        const query = `delete
                       from user_registry
                       where email = '${information.email}'`;
        const client = this.client;
        await new Promise((resolve) => {
            client.query(query, (err) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                resolve();
            });
        });
    }

    async GetBatchUsers(ids) {
        const query = `
            select *
            from profile_user
            where user_id in (${ids});
        `;
        const client = this.client;
        return await new Promise((resolve) => {
            client.query(query, (err, res) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                resolve(res.rows);
            });
        });
    }

    async GetUsers(queryFilters) {
        let whereClause = '';
        let endings = `offset ${queryFilters.find((v) => v[0] === 'offset')[1]} limit ${queryFilters.find((v) => v[0] === 'limit')[1]}`;
        queryFilters = queryFilters.filter(v => v[0] !== 'limit' && v[0] !== 'offset');
        if (queryFilters.length) {
            whereClause = ' WHERE';
            queryFilters.forEach((v) => {
                let filter;
                if (v[0] === 'email') {
                    filter = ` ${v[0]} LIKE '%${v[1]}%'`;
                } else {
                    filter = ` ${v[0]} = '${v[1]}'`;
                }
                if (!whereClause.endsWith('WHERE')) {
                    whereClause += 'AND';
                }
                whereClause += filter;
            });
        }
        let query = `select *
                     from profile_user${whereClause} ${endings};`;
        const client = this.client;
        return await new Promise((resolve) => {
            client.query(query, (err, res) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                resolve(res.rows);
            });
        });
    }

    async SetBlocked(id, block) {
        let query = `UPDATE profile_user
                     SET blocked = ${block}
                     where user_id = ${id}`;
        const client = this.client;
        return await new Promise((resolve) => {
            client.query(query, (err) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                resolve();
            });
        });
    }

    async SetAdmin(id, block) {
        let query = `UPDATE profile_user
                     SET is_admin = ${block}
                     where user_id = ${id}`;
        const client = this.client;
        return await new Promise((resolve) => {
            client.query(query, (err) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                resolve();
            });
        });
    }

    async SetToken(data) {
        let user_id = data.user_id;
        let token = data.token;
        const query = `INSERT INTO user_tokens (user_id, token)
                       VALUES (${user_id}, ${token})`;
        const client = this.client;
        await new Promise((resolve) => {
            client.query(query, (err) => {
                if (err) {
                    console.error(err);
                    throw err;
                }
            });
            resolve();
        });
    }

    async GetToken(id) {
        const query = `SELECT *
                       FROM user_tokens
                       where user_id = '${id}'`;
        const client = this.client;
        return await new Promise((resolve) => {
            client.query(query, (err, res) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                resolve(res.rows[0]);
            });
        });
    }

    async UpdateToken(data) {
        let user_id = data.user_id;
        let token = data.token;
        const query = `UPDATE user_tokens  SET token = '${token}', created_at =now() where user_id = '${user_id}'`;
        const client = this.client;
        await new Promise((resolve) => {
            client.query(query, (err) => {
                if (err) {
                    console.error(err);
                    throw err;
                }
            });
            resolve();
        });
    }

    async SetWaiting(userId, subscription, txn_hash) {
        const query = `INSERT INTO waiting_update (user_id, new_subscription, txn_hash)
                       VALUES ($1, $2, $3)`;
        let values = [userId, subscription, txn_hash];
        const client = this.client;
        await new Promise((resolve) => {
            client.query(query, values, (err) => {
                if (err) {
                    console.error(err);
                    throw err;
                }
            });
            resolve();
        });
    }

    async getSubs(txn_hash) {
        const query = `SELECT *
                       FROM waiting_update
                       where txn_hash = '${txn_hash}'`;
        const client = this.client;
        return await new Promise((resolve) => {
            client.query(query, (err, res) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                resolve(res.rows[0]);
            });
        });
    }

    async removeSubscription(txn_hash) {
        const query = `DELETE
                       FROM waiting_update
                       where txn_hash = '${txn_hash}'`;
        const client = this.client;
        return await new Promise((resolve) => {
            client.query(query, (err) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                resolve();
            });
        });
    }

    async updateSubscription(userId, subscription) {
        const query = `UPDATE profile_user SET subscription = '${subscription}' where user_id = ${userId}`;
        const client = this.client;
        return await new Promise((resolve) => {
            client.query(query, (err) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                resolve();
            });
        });
    }
}

module.exports = PG;