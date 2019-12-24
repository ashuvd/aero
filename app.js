require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const morgan = require('morgan');
const cors = require('cors');
const config = require('./app/config');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, config.upload)});
const db = require('./app/services/database');
db.sync();
var hookJWTStrategy = require('./app/services/passportStrategy');

const app = express();

app.use(cors()); // Необходимо если запросы идут с одного домена на другой

app.use(morgan('dev'));

app.use(passport.initialize());

hookJWTStrategy(passport);

app.use(express.static(path.join(__dirname, '/public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(upload.any());

app.use('/api', require('./app/routes/api')(passport));

app.use('/api', function(req, res, next) {
  res.status(404).json({ message: "Маршрут не определен", code: 404});
  next();
})

app.use(function(err, req, res, next) {
  res.status(500).json({ message: err.message, code: 500});
})

app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/public', 'index.html'));
});

app.listen(process.env.PORT, '127.0.0.1', function () {
  console.log(`Сервер запущен на порту ${process.env.PORT}`);
});