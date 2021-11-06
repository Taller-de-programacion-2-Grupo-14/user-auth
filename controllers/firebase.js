/* global process*/
class Firebase {
    constructor(db) {
        this.db = db;
    }

    async ProcessFirebaseInfoNecessary(req) {
        if (!(req.body.apiKey === process.env.FIREBASE_USER_KEY && req.body.authDomain === process.env.FIREBASE_DOMAIN)) {
            let e = new Error('invalid firebase settings set');
            e.status = 503;
            throw e;
        }
        let fullName = req.body.displayName.split(' ');
        const name = fullName.shift();
        const lastName = fullName.join(' ');
        const email = req.body.email;
        const password = fullName.join('') + email;
        let values = {
            email: req.body.email,
            photoURL: req.body.photoURL,
            first_name: name,
            last_name: lastName,
            password: password,
            location: req.body.location
        };
        let response = await this.db.GetPrivateUserInfo(email);
        if (response) {
            values.password = response.password;
        }
        req.body = values;
        return !response;
    }
}

module.exports = Firebase;