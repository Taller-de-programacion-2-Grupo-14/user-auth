var express = require('express');
var router = express.Router();
const {validateSchema} = require("../validators/middlewareValidator");
const UserService = require("../services/users");
const Users = require("../controllers/users");
const persistence = require("../persistence/postgre");
const {Client} = require('pg');

console.log(process.env.DATABASE_URL)

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost/test_db',
    query_timeout: 1000,
    statement_timeout: 1000,
    ssl: process.env.DATABASE_URL ? {
        rejectUnauthorized: false,
    } : false,
})

function errorHandler(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    let errBody = {error: err.message, status: err.status}
    res.status(err.status || 500);
    res.json(errBody)
}

client.connect();
/* GET users listing. */
userService = new UserService(new persistence(client));
usersContainer = new Users(userService)
router.post('/', validateSchema('new-user'), async (...args) => {
    try {
        await usersContainer.HandleUserPost(...args)
    } catch (e) {
        console.log(e);
        errorHandler(e, ...args)
    }
})
router.post('/login', validateSchema('login-user'), async (...args) => {
    try {
        await usersContainer.HandleUserLogin(...args)
    } catch (e) {
        console.log(e)
        errorHandler(e, ...args)
    }
})
router.get('/', async (...args) => {
    try {
        await usersContainer.HandleUserGet(...args)
    } catch (e) {
        console.log(e)
        errorHandler(e, ...args)
    }
})

function createTable() {
    const otherQuery = `CREATE TABLE web_origins
                            (
                                username varchar(255) NOT NULL,
                                password varchar(255) NOT NULL
                            )`;
    client.query(otherQuery, (err, res) => {
        if (err) {
            console.error(err);
            throw err;
        }
    })
}
async function createTableIfNeeded() {
    const query = 'select * from web_origins limit 1'
    await new Promise(async (resolve, reject) => {
        await client.query(query, (err, res) => {
            if (err) {
                createTable()
            }
        })
        resolve()
    })
}
createTableIfNeeded();

module.exports = router;
