const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { submitReport } = require('../controllers/reportController');

router.post('/:id/report', auth, submitReport);

module.exports = router;
