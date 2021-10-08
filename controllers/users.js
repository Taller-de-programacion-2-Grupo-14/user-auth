class Users {
    constructor(service) {
        this.service = service;
    }
    async HandleUserPost(req, res) {
        let values = {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
        } //etc
        await this.service.AddUser(values)
        res.status(200)
        let response = {message: `user ${values.username} registered correctly`, status: 200}
        return res.json(response)
    }

    async HandleUserLogin(req, res) {
        let values = {
            username: req.body.username,
            password: req.body.password
        }
        let token = await this.service.LoginUser(values)
        let response = {message: `user ${values.username} is logged correctly`, token: token, status: 200};
        res.status = 200;
        res.json(response)
    }

    async HandleUserGet(req, res) {
        let username = req.query.username;
        let userInfo = await this.service.GetUser(username)
        if (!(userInfo && userInfo.username)) {
            let e = new Error("user not found");
            e.status = 404;
            throw e;
        }
        res.json(userInfo)
    }
}

module.exports = Users