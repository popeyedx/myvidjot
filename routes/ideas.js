const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {ensureAuthenticated} = require('../helpers/auth');

// モデルを読み込む
require('../models/Idea');
const Idea = mongoose.model('ideas');

// GET INDEX
router.get('/', ensureAuthenticated, (req, res) => {
  Idea.find({user: req.user.id})
    .sort({date: 'desc'})
    .then(ideas => {
      res.render('ideas/index', {
        ideas
      });
    });
});

// POST
router.post('/',ensureAuthenticated, (req, res) => {
  let errors = [];
  
  if(!req.body.title) {
    errors.push({text: 'Please add a title'});
  }
  
  if(!req.body.details) {
    errors.push({text: 'Please add some details'});
  }
  
  if(errors.length > 0) {
    res.render('ideas/add', {
      title: req.body.title,
      details: req.body.details,
      errors: errors
    });
  } else {
    const newIdea = new Idea({
      title: req.body.title,
      details: req.body.details,
      user: req.user.id
    });
    newIdea.save()
      .then(idea => {
        req.flash('success_msg', 'Video idea added');
        res.redirect('/ideas');
      });
  }
});

// GET ADD FORM
router.get('/add',ensureAuthenticated, (req, res) => {
  res.render('ideas/add');
});

// GET EDIT FORM
router.get('/edit/:id',ensureAuthenticated, (req, res) => {
  Idea.findOne({_id: req.params.id})
    .then(idea => {
      // 他人のideaを編集しようとした場合
      if(idea.user !== req.user.id) {
        req.flash('error_msg', 'Not Authorized');
        return res.redirect('/users/login');
      }
      
      res.render('ideas/edit', {
        id: idea.id,
        title: idea.title,
        details: idea.details
      });
    });
});

// UPDATE
router.put('/:id',ensureAuthenticated, (req, res) => {
  Idea.findOne({_id: req.params.id})
    .then(idea => {
      idea.title = req.body.title;
      idea.details = req.body.details;
      idea.save()
        .then(idea => {
          req.flash('success_msg', 'Video idea updated');
          res.redirect('/ideas');
        });
    });
});

// DELETE
router.delete('/:id',ensureAuthenticated, (req, res) => {
  Idea.remove({_id: req.params.id})
    .then(() => {
      req.flash('success_msg', 'Video idea removed');
      res.redirect('/ideas');
    });
});

module.exports = router;