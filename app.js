/*global process*/
/*global __dirname*/
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var usersRouter = require('./routes/users');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerFile = YAML.load('./docs/swagger.yaml');
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//Heroku purposes
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.get('/doc-yml', (req, res) => {
    res.send(swaggerFile);
});

if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
    //
    //aca estaba domo __dirname=...client...
    app.get('*', (req, res) => {
        res.sendfile(path.join('client/build/index.html'));
    });
}
// End heroku purposes

app.use('/users', usersRouter);
module.exports = app;
