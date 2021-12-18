/*global process*/
const fetch = require('cross-fetch');

class Payments {
    constructor() {
        this.host = process.env.PAYMENTS_API;
    }

    async GetWallet(id) {
        const data = {
            method: 'GET'
        };
        let res = await fetch(`${this.host}/wallet/${id}`, data);
        if (!res.ok || res.status > 299) {
            return {};
        }
        return res.json();
    }

    async deposit(id, price) {
        let data = {
            headers: {
                'x-access-token': process.env.API_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                senderId: id,
                amountInEthers: `${price}`
            }),
            method: 'POST'
        };
        let res = await fetch(`${this.host}/deposit`, data);
        if (res.status > 299 || !res.ok) {
            let e = new Error(res.message);
            e.status = res.statusCode;
            throw e;
        }
        return res.json();
    }

    async SendPayment(info) {
        let data = {
            headers: {
                'x-access-token': info.requested_by,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                receiverId: info.receiver,
                amountInEthers: `${info.amount}`
            }),
            method: 'POST'
        };
        let res = await fetch(`${this.host}/send-payment`, data);
        if (res.status > 299 || !res.ok) {
            let e = new Error(res.message);
            e.status = res.statusCode;
            throw e;
        }
        return res.json();
    }

    async createWallet(id) {
        let data = {
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id
            }),
            method: 'POST'
        };
        let res = await fetch(`${this.host}/wallet`, data);
        if (res.status > 299 || !res.ok) {
            console.log('wallet could not be created');
        }
    }
}

module.exports = Payments;