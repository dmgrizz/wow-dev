const express = require('express');
const router = express.Router();
const passport = require('passport');


router.get('/logout', (req, res) => {
  req.logout();
  // req.session.destroy();
  // req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});
module.exports = router;
