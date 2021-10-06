var express = require('express');
var router = express.Router();
const {validateSchema} = require("../validators/middlewareValidator");
const UserService = require("../services/user");
const Users = require("../controllers/users");
const persistence = require("../persistence/local");
const { Client } = require('pg');

/*const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
})
client.connect(); ToUse in the future*/
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
userService = new UserService(new persistence());
usersContainer = new Users(userService)
router.post('/', validateSchema('new-user'), (...args) => usersContainer.HandleUserPost(...args))
router.post('/login', validateSchema('login-user'), (...args) => usersContainer.HandleUserLogin(...args))
router.get('/', (...args)=> usersContainer.HandleUserGet(...args))
module.exports = router;
