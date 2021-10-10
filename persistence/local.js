const fs = require('fs');
const PATH = 'persistence/localDB.json';
class LocalDB {
    constructor(smt) {
    }
    //ToDO check private methods, now using norm of python
    _getFile() {
        try {
            let buf = fs.readFileSync(PATH, 'utf8');
            return JSON.parse(buf);
        }
        catch (e) {
            console.log('error while getting information of db');
            throw e;
        }
    }

    AddUser(user) {
        let file = this._getFile();

        if (file === JSON.parse('{}')) {
            file = {data: []};
        }
        file.data.forEach((v) => {
            if (v.username === user.username) {
                throw new Error('user already registered with email ' + user.email);
            }
        });
        user.date = new Date();
        file.data.push(user);
        fs.writeFileSync(PATH, JSON.stringify(file));
    }

    GetUser(username) {
        let file = this._getFile();
        let userFounded = '';
        file.data.every((v) => {
            if (v.username === username) {
                userFounded = v;
            }
            return !userFounded;
        });
        return userFounded;
    }
}

module.exports = LocalDB;