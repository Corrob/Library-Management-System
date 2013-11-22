var pg = require("pg");

var dbString = process.env.DATABASE_URL || "postgres://node:pass@localhost:5432/Library"

module.exports = {
  verifyLogin: function(username, password, callback) {
    queryDatabase(getLoginQuery(username, password), function(err, results) {
      if (err) {
        callback(false);
      } else {
        if (results.rows.length > 0) {
          callback(true);
        } else {
          callback(false);
        }
      }
    });
  },

  isAdmin: function(username, callback) {
    queryDatabase(getAdminQuery(username), function(err, results) {
      if (err) {
        callback(false);
      } else {
        if (results.rows.length > 0) {
          callback(results.rows[0].admin);
        } else {
          callback(false);
        }
      }
    });
  },

  checkData: function(data, table, callback) {
    queryDatabase(getCheckDataQuery(data, table), function(err, results) {
      if (err) {
        callback(false, true);
      } else {
        if (results.rows.length > 0) {
          callback(true, false);
        } else {
          callback(false, false);
        }
      }
    });
  },

  deleteData: function(data, table, callback) {
    queryDatabase(getDeleteDataQuery(data, table), function(err, results) {
      if (err) {
        callback(false);
      } else {
        callback(results.rowCount == 1);
      }
    });
  },

  addNewData: function(data, table, callback) {
    queryDatabase(getNewDataQuery(data, table), function(err, results) {
      if (err) {
        callback(false);
      } else {
        callback(true);
      }
    });
  },

  updateBook: function(data, callback) {
    queryDatabase(getUpdateDataQuery(data, data.isbn, "book"), function(err, results) {
      if (err) {
        callback(false);
      } else {
        callback(true);
      }
    });
  },

  updateUser: function(data, callback) {
    queryDatabase(getUpdateDataQuery(data, data.username, "customer"), function(err, results) {
      if (err) {
        callback(false);
      } else {
        callback(true);
      }
    });
  },

  getMaxAccountNo: function(callback) {
    queryDatabase(getMaxAccountNoQuery(), function(err, results) {
      if (err) {
        callback(-1);
      } else {
        if (results.rows.length > 0) {
          callback(results.rows[0].max);
        } else {
          callback(-1);
        }
      }
    });
  },

  getAllBooks: function(callback) {
    queryDatabase(getAllBooksQuery("book"), function(err, results) {
      if (err) {
        callback(new Array());
      } else {
        callback(results.rows);
      }
    });
  },

  getBooksByKeyword: function(data, callback) {
    queryDatabase(getBooksByKeywordQuery("book", data.keywords,
        data.column), function(err, results) {
      if (err) {
        callback(new Array());
      } else {
        callback(results.rows);
      }
    });
  },

  getAllUsers: function(callback) {
    queryDatabase(getAllUsersQuery("customer"), function(err, results) {
      if (err) {
        callback(new Array());
      } else {
        callback(results.rows);
      }
    });
  },

  getUsersByKey: function(data, callback) {
    queryDatabase(getUsersByKeyQuery("customer", data.key, data.column),
        function(err, results) {
      if (err) {
        callback(new Array());
      } else {
        callback(results.rows);
      }
    }); 
  },

  checkIfCheckedout: function(data, callback) {
    queryDatabase(
        getCheckedoutBookQuery("customer", data.username, data.isbn),
        function(err, results) {
      if (err) {
        // TODO: Do something about the error
      } else {
        callback(results.rows.length > 0);
      }
    });
  },

  checkoutBook: function(data, callback) {
    queryDatabase(getCheckoutQuery("book", data.isbn),
        function(err, results) {
      if (err) {
        callback(false, " Error reading database!");  
      }
    });

    queryDatabase(getAddToCheckedoutBooksQuery("customer", data.username,
        data.isbn), function(err, results) {
      if (err) {
        callback(false, " Error reading database!");
      } else {
        callback(true);
      }
    });
  },

  returnBook: function(data, callback) {
    queryDatabase(getReturnQuery("book", data.isbn),
        function(err, results) {
      if (err) {
        callback(false, " Error reading database!");  
      }
    });

    queryDatabase(getRemoveFromCheckoutBooksQuery("customer", data.username,
        data.isbn), function(err, results) {
      if (err) {
        callback(false, " Error reading database!");
      } else {
        callback(true);
      }
    });
  },

  getCoverAndSampleByIsbn: function(data, callback) {
    queryDatabase(getCoverAndSampleByISBNQuery(data),
        function(err, results) {
      if (err) {
        callback(false, "");
      } else {
        if (results.rows.length > 0) {
          callback(true, results.rows[0].cover, results.rows[0].sample);
        } else {
          callback(false, "");
        }
      }
    });
  },

  getBookDetails: function(data, callback) {
    queryDatabase(getBookDetailsQuery("book", data.isbn), function(err, results) {
      if (err) {
        callback(new Array());
      } else {
        callback(results.rows);
      }
    }); 
  },

  getUserDetails: function(data, callback) {
    queryDatabase(getUserDetailsQuery("customer", data.account_no), function(err, results) {
      if (err) {
        callback(new Array());
      } else {
        callback(results.rows);
      }
    });
  }
};

queryDatabase = function(query, callback) {
  pg.connect(dbString, function(err, client, done) {
    if (err) {
      callback(true);
      return console.error('error fetching client from pool', err);
    }

    console.log("Running query to database: " + query);

    client.query(query, function(err, results) {
      done();
      if (err) {
        callback(true);
        return console.error('error running query', err);
      }

      callback(false, results);
    });
  });
}

getLoginQuery = function(username, password) {
  return "SELECT username, password FROM customer WHERE username='" + strEscape(username) + "' AND password='" + strEscape(password) + "'";
};

getAdminQuery = function(username) {
  return "SELECT username, admin FROM customer WHERE username='" + strEscape(username) + "'";
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
    query += dataName + "='" + strEscape(data[dataName]) + "' AND ";
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
    query += dataName + "='" + strEscape(data[dataName]) + "' AND ";
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
    query += "'" + strEscape(data[dataName]) + "',";
  }
  query = query.substring(0, query.length - 1); // Remove last comma

  query += ");";
  return query;
};

getMaxAccountNoQuery = function() {
  return "SELECT MAX(account_no) FROM customer";
};

getAllBooksQuery = function(table) {
  var query = "SELECT cover, isbn, title, author, description, avail_copies FROM "
                  + table;
  
  query += ";";
  return query;
};

getBooksByKeywordQuery = function(table, keywords, column) {
  var query = "SELECT cover, isbn, title, author, description, avail_copies FROM " + table
            + " WHERE position('" + strEscape(keywords) + "' in upper(" + column
            + ")) > 0";

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
            + " WHERE ";
  if (column == "username") {
    query += "position('" + strEscape(key) + "' in upper(" + column
          + ")) > 0";
  } else {
    query += column + " = " + "'" + strEscape(key) + "';";
  }
  return query;
};

getCheckedoutBookQuery = function(table, username, isbn) {
  var query = "SELECT * FROM " + table
            + " WHERE username = '" + strEscape(username) + "' AND '" + strEscape(isbn) + "' = ANY "
            + "(books_checked_out)";
  query += ";";
  return query;
};

getCheckoutQuery = function(table, isbn) {
  var query = "UPDATE " + table + " SET avail_copies = avail_copies - 1 WHERE "
            + "isbn = '" + strEscape(isbn) + "' AND avail_copies > 0";
  query += ";";
  return query;
};

getReturnQuery = function(table, isbn) {
  var query = "UPDATE " + table + " SET avail_copies = avail_copies + 1 WHERE "
            + "isbn = '" + strEscape(isbn) + "' AND avail_copies > 0";
  query += ";";
  return query;
};

getAddToCheckedoutBooksQuery = function(table, username, isbn) {
  var query = "UPDATE " + table + " SET books_checked_out = array_append("
            + "books_checked_out, '" + strEscape(isbn) + "') WHERE username = '" + strEscape(username)
            + "'";
  query += ";";
  return query;
};

getRemoveFromCheckoutBooksQuery = function(table, username, isbn) {
  var query = "UPDATE " + table
      + " SET books_checked_out = array(select x from unnest(books_checked_out) x where x <> '"
      + strEscape(isbn) + "') WHERE username = '" + strEscape(username)
      + "'";
  query += ";";
  return query;
};

getCoverAndSampleByISBNQuery = function(data) {
  return "SELECT cover,sample FROM book WHERE isbn='" + strEscape(data.isbn) + "';";
};

getBookDetailsQuery = function(table, isbn) {
  var query = "SELECT * FROM " + table + " WHERE isbn ='"
            + strEscape(isbn) + "'";
  query += ";";
  return query;
};

getUserDetailsQuery = function(table, accountNumber) {
  var query = "SELECT * FROM " + strEscape(table) + " WHERE account_no ="
            + strEscape(accountNumber);
  query += ";";
  return query;
};

getUpdateDataQuery = function(data, identifier, table) {
  var query = "UPDATE " + table + " SET ";
  for (var column in data) {
    if (column != "isbn" && column != "username") {
      query += column + " = ";
      if (column != "avail_copies" && column != "total_copies") {
        query += "'" + strEscape(data[column]) + "'"; 
      } else {
        query += data[column];
      }
      query += ", ";
    }
  }
  query = query.substring(0, query.length - 2) + " "; // Remove last comma
  query += "WHERE ";
  if (table == "book") {
    query += "isbn =";
  } else {
    query += "username =";
  }
  query += " '" + strEscape(identifier) + "'";
  query += ";";

  return query;
};

function strEscape (str) {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
    switch (char) {
      case "\0":
        return "\\0";
      case "\x08":
        return "\\b";
      case "\x09":
        return "\\t";
      case "\x1a":
        return "\\z";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "'":
        return "''";
      case "\"":
      case "\\":
      case "%":
        return "\\"+char; // prepends a backslash to backslash, percent,
    }
  });
}
