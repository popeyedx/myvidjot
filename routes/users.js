const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');

// モデルを読み込む
require('../models/User');
const User = mongoose.model('users');


// Get login form
router.get('/login', (req, res) => {
  res.render('users/login');
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/ideas',
    failureRedirect: '/users/login',
    successFlash: `Welcome!`,
    failureFlash: true
  })(req, res, next);
});

// Get register form
router.get('/register', (req, res) => {
  res.render('users/register');
});


// Register
router.post('/register', (req, res) => {
  let errors =[];
  
  if(!req.body.name) {
    errors.push({text: 'Please add a name'});
  }
  if(!req.body.email) {
    errors.push({text: 'Please add an email'});
  }
  if(!req.body.password) {
    errors.push({text: 'Please add a password'});
  }
  if(!req.body.password2) {
    errors.push({text: 'Please add a confirm password'});
  }
  if(req.body.password !== req.body.password2) {
    errors.push({text: 'Passwords do not match'});
  }
  if(req.body.password.length < 4) {
    errors.push({text: 'Password must be at least 4 characters'});
  }
  
  if(errors.length > 0) {
    res.render('users/register', {
      errors: errors,
      name: req.body.name,
      email: req.body.email
    });
  } else {
    // emailで既存のユーザーを確認
    User.findOne({email: req.body.email})
      .then(user => {
        if(user) {
          req.flash('error_msg', 'Email already registered');
          res.redirect('/users/login');
        } else {
          // 新しいUserを生成
          const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        });
          // passwordをハッシュ化
          bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user => {
                req.flash('success_msg', 'You are now registered and can log in');
                res.redirect('/users/login');
              })
              .catch(err => {
                console.log(err.message);
                return;
              });
          });
        });
        }
      });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are successfully logged out');
  res.redirect('/users/login');
});

module.exports = router;