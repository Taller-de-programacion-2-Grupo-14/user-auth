/*global process*/
const jwt = require('jsonwebtoken');

class UserService {
    constructor(db, sender) {
        this.sender = sender;
        this.db = db;
    }

    async AddUser(values) {
        let userData = await this.db.GetPrivateUserInfo(values.email);
        if (!userData || !(userData.email)) {
            await this.db.AddUser(values);
            userData = await this.db.GetPrivateUserInfo(values.email);
            values.id = userData.id;
            await this.db.AddUserProfile(values);
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
    }

    async UnblockUser(id) {
        await this.db.SetBlocked(id, false);
    }

    async SetAdmin(id) {
        await this.db.SetAdmin(id, true);
    }
}

module.exports = UserService;
