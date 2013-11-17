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
  database.getMaxAccountNo(function(max) {
    if (max === -1) {
      res.json({completed:false, exists: false});
    } else {
      req.body["account_no"] = max + 1;
      database.checkData({username: req.body.username}, "customer", function(exists, error) {
        if (error) {
          res.json({completed: false, exists: false});
        } else if (exists) {
          res.json({completed: true, exists: true});
        } else { 
          database.addNewData(req.body, "customer", function(success) {
            res.json({completed: success, exists: false});
          });
        }
      });
    }
  });
};

exports.new_book = function(req, res) {
  database.addNewData(req.body, "book", function(success) {
    res.json({completed: success});
  });
};

exports.delete_customer = function(req, res) {
  database.deleteData(req.body, "customer", function(success) {
    res.json({deleted: success});
  });
}

exports.delete_book = function(req, res) {
  database.deleteData(req.body, "book", function(success) {
    res.json({deleted: success});
  });
}