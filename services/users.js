const jwt = require('jsonwebtoken');
const secret = "Branca me rompio la tele";
const algorithm = "HS256" //FixMe move this to another place
class UserService {
    constructor(db) {
        this.db = db
    }

    async AddUser(values) {
        let userData = await this.db.GetPrivateUserInfo(values.email)
        if (!userData || !(userData.email)) {
            await this.db.AddUser(values);
            userData = await this.db.GetPrivateUserInfo(values.email)
            values.id = userData.id;
            await this.db.AddUserProfile(values);
        } else {
            let e = new Error("user already registered");
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
        if (!(user && user.email) || (values.email !== user.email || values.password !== user.password)) {
            let e = new Error("wrong username or password");
            e.status = 400;
            throw e;
        }
        console.log(user);
        return jwt.sign(user, secret, {algorithm: algorithm, expiresIn: '2h'});
    }

    async ModifyUserInfo(userInfo) {
        let user = await this.db.GetUserInfo(userInfo.email);
        if (!(user && user.email)) {
            let e = new Error("user does not exist");
            e.status = 418;
            throw e;
        }
        let values = {
            firstName: userInfo.firstName || user.firstName,
            lastName: userInfo.lastName || user.lastName,
            interest: userInfo.interest || user.interest,
            location: userInfo.location || user.location,
            email: userInfo.email
        }
        await this.db.UpdateUserProfile(values);
    }
}

module.exports = UserService