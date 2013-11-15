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
          return console.error('error checking admin username', err);
        }

        if (results.rows.length > 0) {
          callback(results.rows[0].admin);
        } else {
          callback(false);
        }
      });
    });
  },

  addNewCustomer: function(customerData) {
    pg.connect(dbString, function(err, client, done) {
      if (err) {
        return console.error('error fetching client from pool', err);
      }

      console.log(getNewCustomerQuery(customerData));

      client.query(getNewCustomerQuery(customerData), function(err, results) {
        done();
        if (err) {
          return console.error('error adding a user', err);
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

getNewCustomerQuery = function(customerData) {
  var query = "INSERT INTO customer (";

  // Add columns to query
  for (var dataName in customerData) {
    query += dataName + ",";
  }
  query = query.substring(0, query.length - 1); // Remove last comma

  query += ") VALUES (";

  // Add column values to query
  for (var dataName in customerData) {
    query += "'" + customerData[dataName] + "',";
  }
  query = query.substring(0, query.length - 1); // Remove last comma

  query += ");";
  return query;
};