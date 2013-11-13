var pg = require("pg");

var dbString = process.env.DATABASE_URL || "postgres://node:pass@localhost:5432/Library"

module.exports = {
  verifyLogin: function(username, password, callback) {
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
          callback(true);
        } else {
          callback(false);
        }
      });
    });
  },
  isAdmin: function(username, callback) {
    pg.connect(dbString, function(err, client, done) {
      if (err) {
        return console.error('error fetching client from pool', err);
      }

      client.query(getAdminQuery(username), function(err, results) {
        done();
        if (err) {
          return console.error('error checking username and password', err);
        }

        if (results.rows.length > 0) {
          callback(results.rows[0].admin);
        } else {
          callback(false);
        }
      });
    });
  }
};

getLoginQuery = function(username, password) {
  return "SELECT username, password FROM customer WHERE username='" + username + "' AND password='" + password + "'";
};

getAdminQuery = function(username) {
  return "SELECT username, admin FROM customer WHERE username='" + username + "'";
};
