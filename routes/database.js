var pg = require("pg");

var dbString = process.env.DATABASE_URL || "postgres://node:pass@localhost:5432/Library"

module.exports = {
  verifyLogin: function(username, password, callback) {
    pg.connect(dbString, function(err, client, done) {
      if (err) {
        callback(false);
        return console.error('error fetching client from pool', err);
      }

      client.query(getLoginQuery(username, password), function(err, results) {
        done();
        if (err) {
          callback(false);
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
        callback(false);
        return console.error('error fetching client from pool', err);
      }

      client.query(getAdminQuery(username), function(err, results) {
        done();
        if (err) {
          callback(false);
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

  checkData: function(data, table, callback) {
    pg.connect(dbString, function(err, client, done) {
      if (err) {
        callback(false);
        return console.error('error fetching client from pool', err);
      }

      client.query(getAdminQuery(username), function(err, results) {
        done();
        if (err) {
          callback(false);
          return console.error('error checking data', err);
        }

        if (results.rows.length > 0) {
          callback(true);
        } else {
          callback(false);
        }
      });
    });
  },

  addNewData: function(data, table, callback) {
    pg.connect(dbString, function(err, client, done) {
      if (err) {
        callback(false);
        return console.error('error fetching client from pool', err);
      }

      client.query(getNewDataQuery(data, table), function(err, results) {
        done();
        if (err) {
          callback(false);
          return console.error('error adding data', err);
        }

        callback(true);
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

getCheckDataQuery = function(data, table) {
  var query = "SELECT ";

  // Add columns to query
  for (var dataName in data) {
    query += dataName + ",";
  }
  query = query.substring(0, query.length - 1); // Remove last comma

  query += " FROM " + table + "WHERE ";

  // Add column values to query
  for (var dataName in data) {
    query += dataName "='" + data[dataName] + "',";
  }
  query = query.substring(0, query.length - 1); // Remove last comma

  query += ");";
  return query;
};

getNewDataQuery = function(data, table) {
  var query = "INSERT INTO " + table + " (";

  // Add columns to query
  for (var dataName in data) {
    query += dataName + ",";
  }
  query = query.substring(0, query.length - 1); // Remove last comma

  query += ") VALUES (";

  // Add column values to query
  for (var dataName in data) {
    query += "'" + data[dataName] + "',";
  }
  query = query.substring(0, query.length - 1); // Remove last comma

  query += ");";
  return query;
};