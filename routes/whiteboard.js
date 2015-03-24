var express = require('express');
var router = express.Router();

/* GET whiteboard listing. */
router.get('/', function(req, res, next) {
	res.render('layout', { header: 'header', page: 'whiteboard', title: 'Drawful' });
});

module.exports = router;
