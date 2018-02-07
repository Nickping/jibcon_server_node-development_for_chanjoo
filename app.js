let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');

let index = require('./routes/index');
let users = require('./routes/users');
let company = require('./routes/companies');
let product = require('./routes/products');
let Device = require('./routes/devices');
let sub = require('./routes/sub');
let timer = require('./routes/timer');
let house = require('./routes/house');
let invitation = require('./routes/invitation');
let weather = require('./routes/weather');
//let mobiusManager = require('./routes/MobiusManager');
let app = express();

let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mongodb', {
    useMongoClient: true
    /* other options */
});
let db = mongoose.connection;
db.on('error', console.error);
db.once('open', function () {
    console.log('connected to mongodb server');
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api', users);
app.use('/api', Device);
app.use('/api', company);
app.use('/api', product);
app.use('/api', sub);
app.use('/api/house',house);
app.use('/api/timer',timer);
app.use('/api/invitation',invitation);
app.use('/api/weather',weather);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
