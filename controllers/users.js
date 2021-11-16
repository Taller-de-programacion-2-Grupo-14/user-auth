/*global process*/
const jwt = require('jsonwebtoken');

class Users {
    constructor(service) {
        this.service = service;
    }

    async HandleUserPost(req, res) {
        let values = {
            email: req.body.email,
            password: req.body.password,
            firstName: req.body.first_name || '',
            lastName: req.body.last_name || '',
            interest: req.body.interest || '',
            location: req.body.location || '',
            photoURL: req.body.photoURL || ''
        };
        await this.service.AddUser(values);
        res.status(200);
        let response = {message: `user ${values.email} registered correctly`, status: 200};
        return res.json(response);
    }

    async HandleUserLogin(req, res) {
        let values = {
            email: req.body.email,
            password: req.body.password
        };
        let token = await this.service.LoginUser(values);
        let response = {message: `user ${values.email} is logged correctly`, token: token, status: 200};
        res.status = 200;
        res.json(response);
    }

    async HandleUserGet(req, res) {
        let email = req.query.email;
        let id = req.query.id;
        if (id) {
            if (id < 1) {
                let e = new Error('invalid id, can not be less than zero');
                e.status = 400;
                throw e;
            }
            email = email || '';
        } else if (!(email && email !== '')) {
            let token = req.headers['x-access-token'];
            let tokenParsed = await jwt.decode(token, {secret: process.env.secret, algorithm: process.env.algorithm});
            if (!tokenParsed) {
                let e = new Error('invalid or missing token and email');
                e.status = 400;
                throw e;
            }
            email = tokenParsed.email;
        }
        let userInfo = await this.service.GetUser(email, id);
        this.throwIfNotFound(userInfo);
        res.json(userInfo);
    }

    throwIfNotFound(userInfo) {
        if (!(userInfo && userInfo.email)) {
            let e = new Error('user not found');
            e.status = 400;
            throw e;
        }
    }

    async HandleUserPut(req, res) {
        let values = {
            email: req.body.email,
            location: req.body.location,
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            interest: req.body.interest,
            photoURL: req.body.photoURL
        };
        await this.service.ModifyUserInfo(values);
        const status = 200;
        res.status(status);
        let response = {message: `user ${values.email} modified correctly`, status: status};
        res.json(response);
    }

    async HandleUserChangePassword(req, res) {
        let information = {
            email: req.decoded.email,
            role: req.decoded.role,
            password: req.body.password || '',
            newPassword: req.body.newPassword
        };
        await this.service.UpdateUserPassword(information);
        let message = {'message': `${information.email} password updated correctly`, status: 200};
        res.status(200);
        res.json(message);
    }

    async HandleUserDelete(req, res) {
        let information = {
            email: req.decoded.email,
            role: req.decoded.role
        };
        await this.service.RemoveUser(information);
        let message = {'message': `${information.email} deleted correctly`, status: 200};
        res.status(200);
        res.json(message);
    }

    async HandleResendPasswordChange(req, res) {
        let email = req.query.email;
        await this.service.SendTokenToRetry(email);
        let message = {message: 'mail sent successfully', status: 200};
        res.status(200);
        res.json(message);
    }

    async HandleRecreatePassword(req, res) {
        if (!req.decoded.canChange) {
            let e = new Error('invalid token');
            e.status = 400;
            throw e;
        }
        let information = {
            email: req.decoded.email,
            newPassword: req.body.newPassword
        };
        this.service.ChangePassword(information).then(() => res.status(200).json({
            message: 'password modified successfully',
            status: 200
        }));
    }

    async HandleRetrieveGroupUsers(req, res) {
        let ids = req.query.ids;
        if (!ids) {
            let e = Error(`invalid field sent, required ids field with strings separated with commas, ${ids || 'nothing'} received`);
            e.status = 400;
            throw e;
        }
        let idsToGet = ids.split(',').map((v) => {
            let number = parseInt(v);
            if (isNaN(number)) {
                let e = Error(`invalid id received, expected a number ${v} received`);
                e.status = 400;
                throw e;
            }
            return number;
        });
        this.service.GetBatchUsers(idsToGet).then(data => res.json({users: data, total: data.length}));
    }

    async HandleGetAllUsers(req, res) {
        if (!req.decoded.is_admin) {
            let e = new Error('user has no permissions to access this service');
            e.status = 403;
            throw e;
        }
        let query = req.query;
        this.service.GetAllUsers(query).then(data => res.json({
            users: data,
            total: data.length || 0,
            offset: query.offset || 0,
            limit: query.limit || 500,
        }));
    }

    async HandleLoginAdmin(req, res) {
        await this.service.GetUser(req.body.email).then(v => {
            if (!v.is_admin) {
                let e = new Error('invalid email or user is not admin');
                e.status = 401;
                throw e;
            }
        });
        await this.HandleUserLogin(req, res);
    }

    async HandleBlockUser(req, res) {
        let id = this.getIdIfAdmin(req);
        await this.service.GetUser('', id).then(v => this.throwIfNotFound(v));
        this.service.BlockUser(id).then(() => res.json({
            message: `user ${id} was blocked correctly`, status: 200
        }));
    }

    async HandleUnblockUser(req, res) {
        let id = this.getIdIfAdmin(req);
        await this.service.GetUser('', id).then(v => this.throwIfNotFound(v));
        this.service.UnblockUser(id).then(() => res.json({
            message: `user ${id} was unblocked correctly`, status: 200
        }));
    }

    getIdIfAdmin(req) {
        if (!req.decoded.is_admin) {
            let e = new Error('user has no permissions to access this service');
            e.status = 403;
            throw e;
        }
        return req.param('id');
    }
}

module.exports = Users;