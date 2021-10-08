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
        res.json(this.service.GetUser(req.username))
    }
}

module.exports = Users