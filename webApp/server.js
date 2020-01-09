const express = require('express');
const insRouter = require('./src/insrouter');
const arbitRouter = require('./src/arbitrouter');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

const isDev = process.argv[2] === 'dev' ? true : false;
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'front', 'build')));
if (!isDev){
    app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'front', 'build', 'index.html'));
    });
}
app.use('/insur/api', insRouter);
app.use('/arbit/api', arbitRouter);

app.listen(port, () => console.log(`HomeWork App start on port ${port} ${isDev ? '(DEV Mode)' : ''}`));