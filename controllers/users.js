class Users {
    constructor(service) {
        this.service = service;
    }
    HandleUserPost(req, res) {
        let values = {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email
        } //etc
        this.service.AddUser(values)
        //Todo agregar servicio
        return res.json(req.body)
    }

    HandleUserGet(req, res) {
        let userID = req.query.id
        if (userID < 1) {
            //throw errors
        }
        let userInformation = this.service.FindUser(userID)
        res.json(userInformation)
    }
}

module.exports = Users