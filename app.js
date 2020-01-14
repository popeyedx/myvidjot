const path = require('path');
const express = require('express');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const mongoose = require('mongoose');

// expressアプリケーションを生成
const app = express();

// routeを読み込む
const ideas = require('./routes/ideas');
const users = require('./routes/users');

// config
require('./config/passport')(passport);
const db = require('./config/database');

// mongoDBに接続
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI, {
  useMongoClient: true
})
  .then(() => console.log('mongoDB Connected...'))
  .catch(err => console.log(err.message));

// Handlebarsを使用
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// bodyParserを使用
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// sessionを使用
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// passportを使用
app.use(passport.initialize());
app.use(passport.session());

// flashを使用
app.use(flash());

// method-overrideを使用
app.use(methodOverride('_method'));

app.use(express.static(__dirname + '/public'));

// Grobal変数の値を取得
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.user = req.user || null;
  next();
});


app.get('/', (req, res) => {
  res.render('index');
});

app.get('/about', (req, res) => {
  res.render('about');
});

// Routerを使用
app.use('/users', users);
app.use('/ideas', ideas);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});