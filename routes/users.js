/*global process*/
const tracer = require('dd-trace').init();
const logger = require('./Logger');
let express = require('express');
let router = express.Router();
const {validateSchema} = require('../validators/middlewareValidator');
const UserService = require('../services/users');
const Users = require('../controllers/users');
const Firebase = require('../controllers/firebase');
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

let db = new persistence(client);
/* GET users listing. */
let userService = new UserService(db, transporter);
let usersContainer = new Users(userService, new logger(tracer));
let firebase = new Firebase(db);
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

router.post('/recreate-password', validateSchema('change-password'), helper.verify, async (...args) => {
    await doRequest(args, async(...args) => await usersContainer.HandleRecreatePassword(...args));
});

router.post('/login/firebase', async (req, res, next) => {
    try {
        let shouldRegisterUser = await firebase.ProcessFirebaseInfoNecessary(req);
        if (shouldRegisterUser) {
            let copyRes = helper.getNullRes();
            await usersContainer.HandleUserPost(req, copyRes);
        }
        next();
    } catch (e) {
        console.log(e);
        errorHandler(e, req, res, next);
    }
}, async (...args) => {
    await doRequest(args, async(...args) => await usersContainer.HandleUserLogin(...args));
});

router.get('/batch', async (...args) => {
    await doRequest(args, async(...args) => await usersContainer.HandleRetrieveGroupUsers(...args));
});

router.get('/all', helper.verify, validateSchema('query-param'), async (...args) => {
    await doRequest(args, async(...args) => await usersContainer.HandleGetAllUsers(...args));
});

router.post('/login/admin', validateSchema('login-user'), async (...args) => {
    await doRequest(args, async(...args) => await usersContainer.HandleLoginAdmin(...args));
});

router.delete('/:id', helper.verify, async (...args) => {
    await doRequest(args, async(...args) => await usersContainer.HandleBlockUser(...args));
});

router.post('/unblock/:id', helper.verify, async (...args) => {
    await doRequest(args, async(...args) => await usersContainer.HandleUnblockUser(...args));
});

router.post('/add-admin', helper.verify, validateSchema('new-user'), async (req, res, next) => {
    if (!req.decoded.is_admin) {
        res.json({message: 'invalid user, should be admin', status: 401}).status(401);
        return;
    }
    try {
        let copyRes = helper.getNullRes();
        await usersContainer.HandleUserPost(req, copyRes);
        await usersContainer.HandleAddAdmin(req, res);
        await usersContainer.HandleAddAdmin(req, res);
    } catch (e) {
        console.log(e);
        errorHandler(e, req, res, next);
    }
}, async (...args) => {
    await doRequest(args, async(...args) => await usersContainer.HandleUserLogin(...args));
});

router.post('/set-token', helper.verify, validateSchema('token'), async (...args)=> {
    await doRequest(args, async(...args) => await usersContainer.HandleSetToken(...args));
});

router.get('/get-token/:id', async (...args)=> {
    await doRequest(args, async(...args) => await usersContainer.HandleGetToken(...args));
});

router.post('/upgrade-subscription', helper.verify, async (...args) => {
    await doRequest(args, async (...args) => await usersContainer.HandleUpgradeSubscription(...args));
});

router.post('/finish-upgrade', async (...args) => {
    await doRequest(args, async (...args) => await usersContainer.HandleFinishUpgrade(...args));
});

router.post('/give-payment', helper.verify, validateSchema('give-payment'), async (...args)=> {
    await doRequest(args, async(...args) => await usersContainer.HandleSendPayment(...args));
});
module.exports = router;
