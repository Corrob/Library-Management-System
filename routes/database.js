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
  },

  getAllBooks: function(data, callback) {
    pg.connect(dbString, function(err, client, done) {
      if (err) {
        callback(new Array());
        return console.error('error fetching client from pool', err);
      }

      client.query(getAllBooksQuery("book", data), function(err, results) {
        done();
        if (err) {
          callback(new Array());
          return console.error('error reading book table', err);
        }

        callback(results.rows);
      });
    });
  },

  getBooksByKeyword: function(data, callback) {
    pg.connect(dbString, function(err, client, done) {
      if (err) {
        callback(new Array());
        return console.error('error fetching client from pool', err);
      }

      client.query(getBooksByKeywordQuery("book", data.admin, data.keywords,
        data.column), function(err, results) {
        done();
        if (err) {
          callback(new Array());
          return console.error('error reading book table', err);
        }

        callback(results.rows);
      });
    });
  },

  getAllUsers: function(callback) {
    pg.connect(dbString, function(err, client, done) {
      if (err) {
        callback(new Array());
        return console.error('error fetching client from pool', err);
      }

      client.query(getAllUsersQuery("customer"), function(err, results) {
        done();
        if (err) {
          callback(new Array());
          return console.error('error reading customer table', err);
        }

        callback(results.rows);
      });
    });
  },

  getUsersByKey: function(data, callback) {
    pg.connect(dbString, function(err, client, done) {
      if (err) {
        callback(new Array());
        return console.error('error fetching client from pool', err);
      }

      client.query(getUsersByKeyQuery("customer", data.key, data.column),
        function(err, results) {
          done();
          if (err) {
            callback(new Array());
            return console.error('error reading customer table', err);
          }

          callback(results.rows);
        });
    }); 
  },

  checkIfCheckedout: function(data, callback) {
    var checkedoutBooks;
    pg.connect(dbString, function(err, client, done) {
      if (err) {
        return console.error('error fetching client from pool', err);
      }

      client.query(
        getCheckedoutBookQuery("customer", data.username, data.isbn),
        function(err, results) {
          done();
          if (err) {
            return console.error('error reading customer table', err);
          }
          
          callback(results.rows.length > 0);
        });
    });
  },

  checkoutBook: function(data, callback) {
    pg.connect(dbString, function(err, client, done) {
      if (err) {
        callback(false, " Error connecting to database!");
        return console.error('error fetching client from pool', err);
      }

      client.query(getCheckoutQuery("book", data.isbn),
        function(err, results) {
          done();
          if (err) {
            callback(false, " Error reading database!");  
            return console.error('error reading customer table', err);
          }
        });

      client.query(getAddToCheckedoutBooksQuery("customer", data.username,
        data.isbn), function(err, results) {
        done();
        if (err) {
          callback(false, " Error reading database!");
          return console.error('error reading customer table', err);
        }

        callback(true);
      });
    });
  },

  returnBook: function(data, callback) {
    pg.connect(dbString, function(err, client, done) {
      if (err) {
        callback(false, " Error connecting to database!");
        return console.error('error fetching client from pool', err);
      }

      client.query(getReturnQuery("book", data.isbn),
        function(err, results) {
          done();
          if (err) {
            callback(false, " Error reading database!");  
            return console.error('error reading customer table', err);
          }
        });

      client.query(getRemoveFromCheckoutBooksQuery("customer", data.username,
        data.isbn), function(err, results) {
        done();
        if (err) {
          callback(false, " Error reading database!");
          return console.error('error reading customer table', err);
        }

        callback(true);
      });
    });
  },

  getCoverByIsbn: function(data, callback) {
    pg.connect(dbString, function(err, client, done) {
      if (err) {
        callback(false, "");
        return console.error('error fetching client from pool', err);
      }

      client.query(getCoverByISBNQuery(data),
        function(err, results) {
          done();
          if (err) {
            callback(false, "");
            return console.error('error reading book table', err);
          }

          if (results.rows.length > 0) {
            callback(true, results.rows[0].cover);
          } else {
            callback(false, "");
            return console.error('error reading book table', err);
          }
        });
    }); 
  },

  getBookDetails: function(data, callback) {
    pg.connect(dbString, function(err, client, done) {
       if (err) {
        callback(new Array());
        return console.error('error fetching client from pool', err);
      }

      client.query(getBookDetailsQuery("book", data.isbn), function(err, results) {
        done();
        if (err) {
          callback(new Array());
          return console.error('error reading book table', err);
        }

        callback(results.rows);
      }); 
   });
  },

  getUserDetails: function(data, callback) {
    pg.connect(dbString, function(err, client, done) {
       if (err) {
        callback(new Array());
        return console.error('error fetching client from pool', err);
      }
      client.query(getUserDetailsQuery("customer", data.account_no), function(err, results) {
        done();
        if (err) {
          callback(new Array());
          return console.error('error reading customer table', err);
        }

        callback(results.rows);
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
  var query = "DELETE";

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

getAllBooksQuery = function(table, admin) {
  var query = "SELECT cover, isbn, title, author, description FROM " + table;
  
  /*if (admin === "false") {
    query += " WHERE avail_copies > 0";
  }*/
  query += ";";
  return query;
};

getBooksByKeywordQuery = function(table, admin, keywords, column) {
  var query = "SELECT cover, isbn, title, author, description FROM " + table
            + " WHERE position('" + keywords + "' in upper(" + column
            + ")) > 0";

  if (admin === "false") {
    query += " AND avail_copies > 0";
  }

  query += ";";
  return query;
};

getAllUsersQuery = function(table) {
  var query = "SELECT account_no, username, last_name, first_name, admin FROM"
            + " " + table + ";";
  
  return query;
};

getUsersByKeyQuery = function(table, key, column) {
  var query = "SELECT account_no, username, last_name, first_name, admin FROM"
            + " " + table
            + " WHERE " + column + " = " + "'" + key + "';";
  return query;
};

getCheckedoutBookQuery = function(table, username, isbn) {
  var query = "SELECT * FROM " + table
            + " WHERE username = '" + username + "' AND '" + isbn + "' = ANY "
            + "(books_checked_out)";
  query += ";";
  return query;
};

getCheckoutQuery = function(table, isbn) {
  var query = "UPDATE " + table + " SET avail_copies = avail_copies - 1 WHERE "
            + "isbn = '" + isbn + "' AND avail_copies > 0";
  query += ";";
  return query;
};

getReturnQuery = function(table, isbn) {
  var query = "UPDATE " + table + " SET avail_copies = avail_copies + 1 WHERE "
            + "isbn = '" + isbn + "' AND avail_copies > 0";
  query += ";";
  return query;
};

getAddToCheckedoutBooksQuery = function(table, username, isbn) {
  var query = "UPDATE " + table + " SET books_checked_out = array_append("
            + "books_checked_out, '" + isbn + "') WHERE username = '" + username
            + "'";
  query += ";";
  return query;
};

getRemoveFromCheckoutBooksQuery = function(table, username, isbn) {
  var query = "UPDATE " + table
      + " SET books_checked_out = array(select x from unnest(books_checked_out) x where x <> '"
      + isbn + "') WHERE username = '" + username
      + "'";
  query += ";";
  return query;
};

getCoverByISBNQuery = function(data) {
  return "SELECT cover FROM book WHERE isbn='" + data.isbn + "';";
};

getBookDetailsQuery = function(table, isbn) {
  var query = "SELECT * FROM " + table + " WHERE isbn ='"
            + isbn + "'";
  query += ";";
  return query;
};

getUserDetailsQuery = function(table, accountNumber) {
  var query = "SELECT * FROM " + table + " WHERE account_no ="
            + accountNumber;
  query += ";";
  return query;
};