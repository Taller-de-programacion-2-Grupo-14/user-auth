/*global process*/
const jwt = require('jsonwebtoken');

function createTableRegistry(client) {
    const query = `CREATE TABLE user_registry
                   (
                       id       SERIAL,
                       email    varchar(255) NOT NULL,
                       password varchar(255) NOT NULL,
                       PRIMARY KEY (id),
                       UNIQUE (email)
                   );

    CREATE INDEX emailIndex
        ON user_registry (email);`;
    client.query(query, (err) => {
        if (err) {
            console.error(err);
            throw err;
        }
    });
}

async function checkUserRegistry(client) {
    const query = 'select * from user_registry limit 1';
    await new Promise((resolve) => {
        client.query(query, (err) => {
            if (err) {
                createTableRegistry(client);
            }
        });
        resolve();
    });
}

function createTableProfile(client) {
    const query = `CREATE TABLE profile_user
                   (
                       user_id    int          NOT NULL,
                       email      varchar(255),
                       first_name varchar(100) NOT NULL,
                       last_name  varchar(100) NOT NULL,
                       photo_url  varchar(255),
                       interest   varchar(255),
                       location   varchar(255),
                       PRIMARY KEY (user_id),
                       FOREIGN KEY (user_id) REFERENCES user_registry (id) ON DELETE CASCADE,
                       UNIQUE (email)
                   );

    CREATE INDEX emailIndexProfile
        ON profile_user (email);
    `;
    client.query(query, (err) => {
        if (err) {
            console.error(err);
            throw err;
        }
    });
}

async function checkProfileUser(client) {
    const query = 'select * from profile_user limit 1';
    await new Promise((resolve) => {
        client.query(query, (err) => {
            if (err) {
                createTableProfile(client);
            }
        });
        resolve();
    });
}

async function createTableIfNeeded(client) {
    await checkUserRegistry(client);
    await checkProfileUser(client);

}

function verify(req, res, next) {
    var token = req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, process.env.secret,
            {
                algorithm: process.env.algorithm

            }, function (err, decoded) {
                if (err) {
                    let errordata = {
                        message: err.message,
                        expiredAt: err.expiredAt
                    };
                    console.log(errordata);
                    return res.status(401).json({
                        message: 'Unauthorized Access'
                    });
                }
                req.decoded = decoded;
                next();
            });
    } else {
        return res.status(403).json({
            message: 'Forbidden Access'
        });
    }
}

function getNullRes() {
    return {json: (v)=>console.log(`message ${v} was skipped`), status: (s)=>{}};
}

module.exports = {
    createTableIfNeeded: createTableIfNeeded,
    verify: verify,
    getNullRes: getNullRes
};