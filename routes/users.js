let express = require('express');
let router = express.Router();
const {validateSchema} = require("../validators/middlewareValidator");
const UserService = require("../services/users");
const Users = require("../controllers/users");
const persistence = require("../persistence/postgre");

console.log(process.env.DATABASE_URL || process.env.DB_URL)
const {Client} = require("pg");

let client = new Client({
    connectionString: process.env.DATABASE_URL || process.env.DB_URL,
    query_timeout: 1000,
    statement_timeout: 1000,
    ssl: process.env.DATABASE_URL ? {
        rejectUnauthorized: false,
    } : false,
})

client.connect();

function createTable() {
    const otherQuery = `CREATE TABLE user_registry
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
    const query = 'select * from user_registry limit 1'
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

function errorHandler(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;

    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    let errBody = {error: err.message, status: err.status}
    res.status(err.status || 500);
    res.json(errBody)

}
/* GET users listing. */
userService = new UserService(new persistence(client));
usersContainer = new Users(userService)
router.post('/', validateSchema('new-user'), async (...args) => {
    await doRequest(args, async(...args) => await usersContainer.HandleUserPost(...args))
})

router.post('/login', validateSchema('login-user'), async (...args) => {
    await doRequest(args, async(...args) => await usersContainer.HandleUserLogin(...args))
})

async function doRequest(args, method) {
    try {
        await method(...args)
    } catch (e) {
        console.log(e)
        errorHandler(e, ...args)
    }
}

router.get('/', async (...args) => {
    await doRequest(args, async(...args) => await usersContainer.HandleUserGet(...args));
})

module.exports = router;
