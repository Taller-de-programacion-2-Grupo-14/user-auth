const {rows} = require("pg/lib/defaults");

class PG {
    constructor(client) {
        this.client = client;
    }

    async AddUser(userData) {
        let userName = userData.username;
        let pswd = userData.password;
        const query = `INSERT INTO web_origins (username, password)
                       VALUES ('${userName}', '${pswd}')`
        const client = this.client;
        await new Promise((resolve, reject) => {
            client.query(query, (err, res) => {
                if (err) {
                    console.error(err);
                    throw err;
                }
            })
            resolve()
        })
    }
    async GetUser(userName) {
        const query = `SELECT *
                       FROM web_origins
                       WHERE username = '${userName}'`;
        const client = this.client;
        return await new Promise((resolve, reject) => {
            client.query(query, (err, res) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                resolve(res.rows[0]);
            });
        });
    }
}

module.exports = PG