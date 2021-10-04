var express = require('express');
var router = express.Router();
const {validateSchema} = require("../validators/middlewareValidator");
const UserService = require("../services/user");
const Users = require("../controllers/users");
const db = require("../persistence/local")
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
userService = new UserService(new db())
usersContainer = new Users(userService)
router.post('/', validateSchema('new-user'), (...args) => usersContainer.HandleUserPost(...args))


module.exports = router;
