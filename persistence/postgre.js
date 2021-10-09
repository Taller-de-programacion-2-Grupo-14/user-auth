class PG {
    constructor(client) {
        this.client = client;
    }

    async AddUser(userData) {
        let email = userData.email;
        let pswd = userData.password;
        const query = `INSERT INTO user_registry (email, password)
                       VALUES ('${email}', '${pswd}')`
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

    async GetPrivateUserInfo(email) {
        const query = `SELECT *
                       FROM user_registry
                       WHERE email = '${email}'`;
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

    async GetUserInfo(email) {
        const query = `SELECT *
                       FROM profile_user
                       WHERE email = '${email}'`;
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

    async AddUserProfile(userInfo) {
        const query = `INSERT INTO profile_user
                           (user_id, email, first_name, last_name, user_type, interest, location)
                           VALUES (
                              ${userInfo.id}
                              '${userInfo.email}'
                              '${userInfo.firstName}',
                              '${userInfo.lastName}',
                              '${userInfo.userType}',
                              '${userInfo.interest}',
                              '${userInfo.location}')`;
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

    async UpdateUserProfile(userInfo) {
        const query = `UPDATE profile_user
                           SET
                              first_name = '${userInfo.firstName}',
                              last_name = '${userInfo.lastName}',
                              user_type = '${userInfo.userType}',
                              interest = '${userInfo.interest}',
                              location = '${userInfo.location}'
                         WHERE email = '${userInfo.email}'`;
        const client = this.client;
        return await new Promise((resolve, reject) => {
            client.query(query, (err, res) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                resolve();
            });
        });
    }
}

module.exports = PG