

exports.login_page = function(req, res) {
  res.render('login_page', { title : "Library Management System Log In"});
};

// TODO(cory): move database function into own module
// TODO(cory): add cookies to verify user
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
  res.render('customer', {title : "Customer"});
};