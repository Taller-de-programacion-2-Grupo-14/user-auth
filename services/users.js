const jwt = require('jsonwebtoken');
const secret = "Branca me rompio la tele";
const algorithm = "HS256" //FixMe move this to another place
class UserService {
    constructor(db) {
        this.db = db
    }
    async AddUser(values) {
        let userData = await this.db.GetUser(values.username)
        if (!userData || !(userData.username)) {
           await this.db.AddUser(values);
        } else {
            let e = new Error("user already registered");
            e.status = 400;
            throw e;
        }
        return true;
    }

    async GetUser(username) {
        return await this.db.GetUser(username);
    } //ToDo remove this method

    async LoginUser(values) {
        let user = await this.db.GetUser(values.username);
        if (!(user && user.username) || (values.username !== user.username || values.password !== user.password)) {
            let e = new Error("wrong username or password");
            e.status = 400;
            throw e;
        }
        console.log(user);
        return jwt.sign(user, secret, {algorithm: algorithm, expiresIn: '2h'});
    }
}
module.exports = UserService