/*global process*/
let express = require('express');
let router = express.Router();
const {validateSchema} = require('../validators/middlewareValidator');
const UserService = require('../services/users');
const Users = require('../controllers/users');
const persistence = require('../persistence/postgre');
const helper = require('./helper');
require('jsonwebtoken');
console.log(process.env.DATABASE_URL || process.env.DB_URL);
const {Client} = require('pg');
const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.email,
        pass: process.env.pswd
    }
});

let client = new Client({
    connectionString: process.env.DATABASE_URL || process.env.DB_URL,
    query_timeout: 1000,
    statement_timeout: 1000,
    ssl: process.env.DATABASE_URL ? {
        rejectUnauthorized: false,
    } : false,
});

client.connect();
helper.createTableIfNeeded(client);

function errorHandler(err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;

    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    let errBody = {error: err.message, status: err.status};
    res.status(err.status || 500);
    res.json(errBody);

}

/* GET users listing. */
let userService = new UserService(new persistence(client), transporter);
let usersContainer = new Users(userService);
router.post('/', validateSchema('new-user'), async (...args) => {
    await doRequest(args, async(...args) => await usersContainer.HandleUserPost(...args));
});

router.post('/login', validateSchema('login-user'), async (...args) => {
    await doRequest(args, async(...args) => await usersContainer.HandleUserLogin(...args));
});

async function doRequest(args, method) {
    try {
        await method(...args);
    } catch (e) {
        console.log(e);
        errorHandler(e, ...args);
    }
}

router.get('/', async (...args) => {
    await doRequest(args, async(...args) => await usersContainer.HandleUserGet(...args));
});

router.patch('/', validateSchema('profile-user'), async (...args) => {
    await doRequest(args, async(...args) => await usersContainer.HandleUserPut(...args));
});

router.patch('/change-password', validateSchema('change-password'), helper.verify, async (...args) => {
    await doRequest(args, async(...args) => await usersContainer.HandleUserChangePassword(...args));
});

router.delete('/delete-user', helper.verify, async (...args) => {
    await doRequest(args, async(...args) => await usersContainer.HandleUserDelete(...args));
});

router.post('/send-email-reset-password', async (...args) => {
    await doRequest(args, async(...args) => await usersContainer.HandleResendPasswordChange(...args));
});

module.exports = router;
