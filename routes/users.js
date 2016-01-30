var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('You shouldn\'t be viewing this information...');
});

module.exports = router;
