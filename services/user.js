const jwt = require('jsonwebtoken');
const secret = "Branca me rompio la tele";
const algorithm = "HS256" //FixMe move this to another place
class UserService {
    constructor(db) {
        this.db = db
    }
    AddUser(values) {
        if (!this.db.GetUser(values.username)) {
            this.db.AddUser(values);
        } else {
            let e = new Error("user already registered");
            e.status = 400;
            throw e;
        }
        return true;
    }

    GetUser(username) {
        return this.db.GetUser(username);
    } //ToDo remove this method

    LoginUser(values) {
        let user = this.db.GetUser(values.username);
        if (user !== "" && (values.username !== user.username || values.password !== user.password)) {
            let e = new Error("wrong username or password");
            e.status = 400;
            throw e;
        }
        return jwt.sign(user, secret, {algorithm: algorithm, expiresIn: '2h'});
    }
}
module.exports = UserService