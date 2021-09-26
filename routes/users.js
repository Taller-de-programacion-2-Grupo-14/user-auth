var express = require('express');
var router = express.Router();
const {validateSchema} = require("../validators/middlewareValidator");
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', validateSchema('new-user'), (req, res, next) => {
  let arr = JSON.parse(req.body)
  console.log(req.body)
  arr.forEach((v) => console.log(v))
  return res.json(req.body)
})


module.exports = router;
