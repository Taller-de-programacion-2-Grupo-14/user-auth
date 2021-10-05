class PG {
    constructor(client) {
        this.client = client;
    }

    AddUser(userData) {
        let userName = userData.username;
        let password = userData.password;
        const query = `INSERT INTO web_origins (username, password) VALUES (${userName}, ${password})`
        const client = this.client;
        client.query(query, (err, res) => {
            if (err) {
                console.error(err);
                throw err;
            }
            console.log('Data insert successful');
            client.end();
        })
    }
    GetUser(username) {
        let userdata = {};
        const query = `SELECT * FROM web_origins WHERE username = ${username}`
        const client = this.client;
        client.query(query, (err, res) => {
            if (err) {
                console.log(err);
                throw err;
            }
            for (let row of res.rows) {
                userdata = row;
            }
            client.end()
        })
        return userdata;
    }
}

module.exports = PG