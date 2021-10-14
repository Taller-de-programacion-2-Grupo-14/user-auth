/*global process*/
const jwt = require('jsonwebtoken');
const e = require('express');

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

    async GetUser(username) {
        return this.db.GetUserInfo(username);
    } //Refactor this method

    async LoginUser(values) {
        let user = await this.db.GetPrivateUserInfo(values.email);
        this.throwIfInvalidUser(user, values);
        let userInfo = await this.db.GetUserInfo(values.email);
        let relevantInfo = {
            email: userInfo.email,
            role: userInfo.role
        };
        return jwt.sign(relevantInfo, process.env.secret, {algorithm: process.env.algorithm, expiresIn: '2h'});
    }

    throwIfInvalidUser(user, values, checkPassword=true) {
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
            email: userInfo.email
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
        if (!(userInfo && userInfo.email)) {
            let e = Error('user not found');
            e.status = 400;
            throw e;
        }
        const token = jwt.sign({email: email, canChange: true}, process.env.secret, {algorithm: process.env.algorithm, expiresIn: '15m'});
        let mailOptions = {
            from: process.env.email,
            to: email,
            subject: 'Token de recupero',
            text: `Por favor poner el siguiente token en la aplicacion movil para recuperar su contraseña:\n ${token}`
        };
        await this.sender.sendMail(mailOptions, function(error, info){
            if (error) {
                error.status = 503;
                throw e;
            }
            console.log('Email sent: ' + info.response);
        });
    }

    async ChangePassword(information) {
        await this.db.UpdateUserRegistry(information);
    }
}

module.exports = UserService;