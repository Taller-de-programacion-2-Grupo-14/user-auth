/*global process*/
const jwt = require('jsonwebtoken');
let StatsD = require('hot-shots');
let dogstatsd = new StatsD();
const USER_CREATED = 'user-auth.user_created';
const USER_CHANGE_SUBS = 'user_upgrade';
const USER_BLOCKED = 'user-auth.user_blocked';
const PASSWORDS_RECOVERED = 'user-auth.passwords_recovered';
const pricing = {
    'free': 0,
    'platinum': 0.0001,
    'black': 0.0002
};

class UserService {
    constructor(db, sender, paymentsClient, coursesClient) {
        this.sender = sender;
        this.db = db;
        this.payments = paymentsClient;
        this.courses = coursesClient;
    }

    async AddUser(values) {
        let userData = await this.db.GetPrivateUserInfo(values.email);
        if (!userData || !(userData.email)) {
            await this.db.AddUser(values);
            userData = await this.db.GetPrivateUserInfo(values.email);
            values.id = userData.id;
            await this.db.AddUserProfile(values);
            dogstatsd.increment(USER_CREATED);
            this.payments.createWallet(userData.id); // This is only because it is a university project, so the wallet should be created automatically
        } else {
            let e = new Error('user already registered');
            e.status = 400;
            throw e;
        }
        return true;
    }

    async GetUser(username, userId) {
        return this.db.GetUserInfo(username, userId);
    }

    async LoginUser(values) {
        let user = await this.db.GetPrivateUserInfo(values.email);
        this.throwIfInvalidUser(user, values);
        let userInfo = await this.db.GetUserInfo(values.email);
        if (userInfo.blocked) {
            let e = new Error('user is blocked, speak with an admin to see how to solve this');
            e.status = 403;
            throw e;
        }
        let relevantInfo = {
            email: userInfo.email,
            id: userInfo.user_id,
            is_admin: userInfo.is_admin
        };
        return jwt.sign(relevantInfo, process.env.secret, {algorithm: process.env.algorithm, expiresIn: '2h'});
    }

    throwIfInvalidUser(user, values, checkPassword = true) {
        if (!(user && user.email) || (checkPassword && (values.email !== user.email || values.password !== user.password))) {
            let e = new Error('wrong username or password');
            e.status = 400;
            throw e;
        }
    }

    async ModifyUserInfo(userInfo) {
        let user = await this.db.GetUserInfo(userInfo.email);
        if (!(user && user.email)) {
            let e = new Error('user does not exist');
            e.status = 418;
            throw e;
        }
        let values = {
            firstName: userInfo.firstName || user.first_name,
            lastName: userInfo.lastName || user.last_name,
            interest: userInfo.interest || user.interest,
            location: userInfo.location || user.location,
            email: userInfo.email,
            photoURL: userInfo.photoURL || user.photoURL
        };
        await this.db.UpdateUserProfile(values);
    }

    async UpdateUserPassword(information) {
        let userInfo = await this.db.GetPrivateUserInfo(information.email);
        this.throwIfInvalidUser(userInfo, information);
        await this.db.UpdateUserRegistry(information);
    }

    async RemoveUser(information) {
        let userInfo = await this.db.GetPrivateUserInfo(information.email);
        this.throwIfInvalidUser(userInfo, information, false);
        await this.db.DeleteUser(information);
        dogstatsd.decrement(USER_CREATED);
    }

    async SendTokenToRetry(email) {
        let userInfo = await this.db.GetUserInfo(email);
        this.throwIfInvalidUser(userInfo, email, false);
        const token = jwt.sign({email: email, canChange: true}, process.env.secret, {
            algorithm: process.env.algorithm,
            expiresIn: '15m'
        });
        let mailOptions = {
            from: process.env.email,
            to: email,
            subject: 'Token de recupero',
            text: `Por favor poner el siguiente token en la aplicacion movil para recuperar su contraseña:\n ${token}`
        };
        await this.sender.sendMail(mailOptions, function (error, info) {
            if (error) {
                let e = Error('could not send email');
                console.log(error, e);
            }
            console.log('Email sent: ' + info.response);
        });
    }

    async ChangePassword(information) {
        await this.db.UpdateUserRegistry(information);
        dogstatsd.increment(PASSWORDS_RECOVERED);
    }

    async GetBatchUsers(ids) {
        return await this.db.GetBatchUsers(ids);
    }

    async GetAllUsers(query) {
        let filters = {
            limit: query.limit || 500,
            offset: query.offset || 0,
            blocked: query.blocked,
            email: query.email,
            subscription: query.subscription
        };
        let queryFilters = Object.entries(filters).filter((v) => v[1] !== undefined);
        return this.db.GetUsers(queryFilters);
    }

    async BlockUser(id) {
        await this.db.SetBlocked(id, true);
        dogstatsd.increment(USER_BLOCKED);
    }

    async UnblockUser(id) {
        await this.db.SetBlocked(id, false);
        dogstatsd.decrement(USER_BLOCKED);
    }

    async SetAdmin(id) {
        await this.db.SetAdmin(id, true);
    }

    async SetToken(body) {
        let wasAdded = await this.db.GetToken(body.user_id);
        if (wasAdded) {
            await this.db.UpdateToken(body);
        } else {
            await this.db.SetToken(body);
        }
    }

    async GetToken(id) {
        return this.db.GetToken(id);
    }

    async UpgradeUser(id, subs) {
        let info = await this.GetUser('', id);
        let price = pricing[subs] - pricing[info.subscription];
        if (info.subscription === subs) {
            let e = new Error(`invalid change from ${info.subscription} to ${subs}`);
            e.status = 400;
            throw e;
        }
        if (price <= 0) {
            await this.db.updateSubscription(id, info.subscription);
            dogstatsd.increment(`${USER_CHANGE_SUBS}.${info.subscription}`);
            this.courses.sendNotification({
                title: 'Modificacion exitosa',
                body: 'tu nueva subscripcion fue agregada correctamente'
            }, id).then(() => console.log('modificacion de estado exitosa'));
            return {hash: 'NOOP'};
        } else {
            let res = await this.payments.deposit(id, price);
            await this.db.SetWaiting(id, subs, res.hash);
            return res;
        }
    }

    async finishUpgrade(status, txn_hash) {
        let data = await this.db.getSubs(txn_hash);
        if (status) {
            this.db.updateSubscription(data.user_id, data.new_subscription).then(() => {
                console.log('status of user updated correctly');
                dogstatsd.increment(`${USER_CHANGE_SUBS}.${data.new_subscription}`);
            });
            this.courses.sendNotification({
                title: 'Compra aceptada',
                body: 'Tu incremento de categoria fue procesada correctamente'
            }, data.user_id).then(() => console.log('subscription increased correctly'));
        } else {
            this.courses.sendNotification({
                title: 'Compra rechazada',
                body: 'Tu incremento de categoria fue rechazado, por favor revise su transaccion para mas informacion'
            }, data.user_id).then(() => console.log('subscription failed to increase'));
        }
        this.db.removeSubscription(txn_hash).then(() => console.log('subscription waiting removed correctly'));
    }

    async SendPayment(info) {
        return this.payments.SendPayment(info);
    }
}

module.exports = UserService;
