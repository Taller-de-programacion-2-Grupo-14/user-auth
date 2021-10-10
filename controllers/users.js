class Users {
    constructor(service) {
        this.service = service;
    }

    async HandleUserPost(req, res) {
        let values = {
            email: req.body.email,
            password: req.body.password,
            userType: req.body.role,
            firstName: req.body.first_name || "",
            lastName: req.body.last_name || "",
            interest: req.body.interest || "",
            location: req.body.location || ""
        }
        await this.service.AddUser(values)
        res.status(200)
        let response = {message: `user ${values.email} registered correctly`, status: 200}
        return res.json(response)
    }

    async HandleUserLogin(req, res) {
        let values = {
            email: req.body.email,
            password: req.body.password
        }
        let token = await this.service.LoginUser(values)
        let response = {message: `user ${values.email} is logged correctly`, token: token, status: 200};
        res.status = 200;
        res.json(response)
    }

    async HandleUserGet(req, res) {
        let email = req.query.email;
        let userInfo = await this.service.GetUser(email)
        if (!(userInfo && userInfo.email)) {
            let e = new Error("user not found");
            e.status = 404;
            throw e;
        }
        res.json(userInfo);
    }

    async HandleUserPut(req, res) {
        let values = {
            email: req.body.email,
            userType: req.body.role,
            firstName: req.body.first_name,
            lastName: req.body.last_name,
            interest: req.body.interest
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
            password: req.body.password,
            newPassword: req.body.newPassword
        }
        await this.service.UpdateUserPassword(information);
        let message = {"message": `${information.email} password updated correctly`, status: 200};
        res.status(200).json(message);
    }

    async HandleUserDelete(req, res) {
        let information = {
            email: req.decoded.email,
            role: req.decoded.role,
            password: req.body.password,
        };
        await this.service.RemoveUser(information);
        let message = {"message": `${information.email} deleted correctly`, status: 200};
        res.status(200).json(message);
    }
}

module.exports = Users