var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('layout', { header: 'header', page: 'index' });
});

router.get('/game', function(req, res, next) {
	res.render('layout', { header: 'header', page: 'game' });
});

router.get('/player', function(req, res, next) {
	res.render('layout', { header: 'header', page: 'player' });
});

module.exports = router;
