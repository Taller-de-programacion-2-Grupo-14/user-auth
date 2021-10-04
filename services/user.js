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
}
module.exports = UserService