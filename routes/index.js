var database = require('./database.js');

exports.login_page = function(req, res) {
  if (req.cookies.username == undefined) {
    res.render('login_page', { title : "Library Management System Log In"});
  } else {
    res.redirect('/customer');
  }
};

exports.process_login = function(req, res) {
  var verified = database.verifyLogin(req.body.username, req.body.password,
    function(verified) {
      if (verified == true) {
        res.cookie('username', req.body.username, { maxAge: 900000, httpOnly: true });
        res.json({redirect : '/customer'});
      } else {
        res.json({form: 'Invalid username/password.'});
      }
    });
};

exports.customer = function(req, res) {
  if (req.cookies.username == undefined) {
    res.redirect('/');
  } else {
    database.isAdmin(req.cookies.username, function(adminValue) {
      res.render('customer', {title : "Customer",
        admin : adminValue, username : req.cookies.username});
    });
  }
};

exports.logout = function(req, res) {
  res.clearCookie('username');
  res.json({redirect : '/'});
};

exports.new_customer = function(req, res) {
  database.addNewData(req.body, "customer");
  res.send(200);
};