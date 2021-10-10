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
    client.query(query, (err, res) => {
        if (err) {
            console.error(err);
            throw err;
        }
    })
}

async function checkUserRegistry(client) {
    const query = 'select * from user_registry limit 1'
    await new Promise(async (resolve, reject) => {
        await client.query(query, (err, res) => {
            if (err) {
                createTableRegistry(client)
            }
        })
        resolve()
    })
}

function createTableProfile(client) {
    const query = `CREATE TABLE profile_user
                   (
                       user_id    int          NOT NULL,
                       email      varchar(255),
                       first_name varchar(100) NOT NULL,
                       last_name  varchar(100) NOT NULL,
                       user_type  varchar(20) CHECK (user_type IN ('Student', 'Collaborator', 'Creator')),
                       interest   varchar(255),
                       location   varchar(255),
                       PRIMARY KEY (user_id),
                       FOREIGN KEY (user_id) REFERENCES user_registry (id) ON DELETE CASCADE,
                       UNIQUE (email)
                   );

    CREATE INDEX emailIndexProfile
        ON profile_user (email);
    `;
    client.query(query, (err, res) => {
        if (err) {
            console.error(err);
            throw err;
        }
    })
}

async function checkProfileUser(client) {
    const query = 'select * from profile_user limit 1'
    await new Promise(async (resolve, reject) => {
        await client.query(query, (err, res) => {
            if (err) {
                createTableProfile(client)
            }
        })
        resolve()
    })
}

async function createTableIfNeeded(client) {
    await checkUserRegistry(client);
    await checkProfileUser(client);

}

module.exports = createTableIfNeeded;