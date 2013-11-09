

exports.login_page = function(req, res) {
  if (req.cookies.username == undefined) {
    res.render('login_page', { title : "Library Management System Log In"});
  } else {
    res.redirect('/customer');
  }
};

// TODO(cory): move database function into own module
exports.process_login = function(pg, dbString) {
	return function(req, res) {
    var username = req.query.username;
    var password = req.query.password;

    pg.connect(dbString, function(err, client, done) {
      if (err) {
        return console.error('error fetching client from pool', err);
      }

      client.query(getLoginQuery(username, password), function(err, results) {
        done();
        if (err) {
          return console.error('error checking username and password', err);
        }

        if (results.rows.length > 0) {
          res.cookie('username', username, { maxAge: 900000, httpOnly: true });
          res.json({redirect : '/customer'})
        } else {
          res.json({form: 'Invalid username/password.'});
        }
      });
    });
	};
};

getLoginQuery = function(username, password) {
  return "SELECT username, password FROM customer WHERE username='" + username + "' AND password='" + password + "'";
}

exports.customer = function(req, res) {
  if (req.cookies.username == undefined) {
    res.redirect('/');
  } else {
    res.render('customer', {title : "Customer"});
  }
};

exports.logout = function(req, res) {
  res.clearCookie('username');
  res.json({redirect : '/'});
};