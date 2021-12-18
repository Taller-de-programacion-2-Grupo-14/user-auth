/*global process*/
const fetch = require('cross-fetch');
class Courses {
    constructor() {
        this.host = process.env.COURSES_API;
    }

    async sendNotification(info, userId) {
        let data = {
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: info.title,
                body: info.body,
                user_id: userId
            }),
            method: 'POST'
        };
        let res = await fetch(`${this.host}/notification`, data);
        if (res.status > 299 || !res.ok) {
            let e = new Error(res.message);
            e.status = res.statusCode;
            throw e;
        }
        return res.json();
    }
}

module.exports = Courses;