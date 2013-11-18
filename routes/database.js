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
        callback(false, true);
        return console.error('error fetching client from pool', err);
      }

      client.query(getCheckDataQuery(data, table), function(err, results) {
        done();
        if (err) {
          callback(false, true);
          return console.error('error checking data', err);
        }

        if (results.rows.length > 0) {
          callback(true, false);
        } else {
          callback(false, false);
        }
      });
    });
  },

  deleteData: function(data, table, callback) {
    pg.connect(dbString, function(err, client, done) {
      if (err) {
        callback(false);
        return console.error('error fetching client from pool', err);
      }

      client.query(getDeleteDataQuery(data, table), function(err, results) {
        done();
        if (err) {
          callback(false);
          return console.error('error checking data', err);
        }
        
        callback(results.rowCount == 1);
      });
    });
  },

  addNewData: function(data, table, callback) {
    pg.connect(dbString, function(err, client, done) {
      if (err) {
        callback(false);
        return console.error('error fetching client from pool', err);
      }

      console.log(getNewDataQuery(data, table));
      client.query(getNewDataQuery(data, table), function(err, results) {
        done();
        if (err) {
          callback(false);
          return console.error('error adding data', err);
        }

        callback(true);
      });
    });
  },

  getMaxAccountNo: function(callback) {
    pg.connect(dbString, function(err, client, done) {
      if (err) {
        callback(-1);
        return console.error('error fetching client from pool', err);
      }

      client.query(getMaxAccountNoQuery(), function(err, results) {
        done();
        if (err) {
          callback(-1);
          return console.error('error adding data', err);
        }

        if (results.rows.length > 0) {
          callback(results.rows[0].max);
        } else {
          callback(-1);
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

getCheckDataQuery = function(data, table) {
  var query = "SELECT ";

  // Add columns to query
  for (var dataName in data) {
    query += dataName + ",";
  }
  query = query.substring(0, query.length - 1); // Remove last comma

  query += " FROM " + table + " WHERE ";

  // Add column values to query
  for (var dataName in data) {
    query += dataName + "='" + data[dataName] + "' AND ";
  }
  query = query.substring(0, query.length - 5); // Remove last AND

  query += ";";
  return query;
};

getDeleteDataQuery = function(data, table) {
  var query = "DELETE ";

  query += " FROM " + table + " WHERE ";

  // Add column values to query
  for (var dataName in data) {
    query += dataName + "='" + data[dataName] + "' AND ";
  }
  query = query.substring(0, query.length - 5); // Remove last AND

  query += ";";
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

getMaxAccountNoQuery = function() {
  return "SELECT MAX(account_no) FROM customer";
};
