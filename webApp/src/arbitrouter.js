const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
//const insApi = require('./insur_api');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


module.exports = router;