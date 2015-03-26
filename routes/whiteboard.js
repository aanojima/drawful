var express = require('express');
var router = express.Router();

/* GET whiteboard listing. */
router.get('/', function(req, res, next) {
	res.render('layout', { header: 'header', page: 'player' });
});

module.exports = router;
