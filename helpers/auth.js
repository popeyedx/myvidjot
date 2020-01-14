module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if(req.isAuthenticated()) {
      return next();
    }
    // passportの認証に失敗している場合
    req.flash('error_msg', 'Not Authorized');
    res.redirect('/users/login');
  }
};
