var database = require('./database.js');
var gm = require('gm')
  , imageMagick = gm.subClass({ imageMagick: true });

var makeJSONObject = function(results, type) {
  var jsonObject = new Object();
  for (var i = 0; i < results.length; i++) {
    var row = new Object();
    for (var column in results[i]) {
      row[column] = results[i][column];
    }
    jsonObject[type + i] = row;
  }
  return jsonObject;
};

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
  // Update copies to match database
  if (req.body.copies != null) {
    req.body["avail_copies"] = req.body.copies;
    req.body["total_copies"] = req.body.copies;
    delete req.body.copies;
  }

  if (req.files.cover != null) {
    if (req.body.x1 != '' && req.body.x2 != '' && 
      req.body.y1 != '' && req.body.y2 != '') {
      imageMagick(req.files.cover.path)
        .crop(req.body.x2 - req.body.x1, req.body.y2 - req.body.y1, 
          req.body.x1, req.body.y1)
        .write(req.files.cover.path, function(err) {
          if (err) {
            res.json({completed: false})
          };
        });
    }

    // TODO: add upload to S3
    req.body.cover = "/images/no_cover.png";
  } else {
    req.body.cover = "/images/no_cover.png";
  }

  delete req.body.x1;
  delete req.body.x2;
  delete req.body.y1;
  delete req.body.y2;

  database.addNewData(req.body, "book", function(success) {
    res.json({completed: success});
  });
};

exports.get_books = function(req, res) {
  if (typeof req.body.keywords == "undefined" 
    && typeof req.body.column == "undefined") {
    database.getAllBooks(req.body.admin, function(data) {
      if (data.length > 0) {
        var jsonBooksObject = makeJSONObject(data, "book");
        res.json(jsonBooksObject);
      } else {
        res.json(new Object());
      }
    });
  } else {
    database.getBooksByKeyword(req.body,
      function(data) {
      if (data.length > 0) {
        var jsonBooksObject = makeJSONObject(data, "book");
        res.json(jsonBooksObject);
      } else {
        res.json(new Object());
      }
    });
  }
};

exports.get_users = function(req, res) {
  if (typeof req.body.key == "undefined"
    && typeof req.body.column == "undefined") {
    database.getAllUsers(function(data) {
      if (data.length > 0) {
        var jsonUsersObject = makeJSONObject(data, "user");
        res.json(jsonUsersObject);
      } else {
        res.json(new Object());
      }
    });
  } else {
    database.getUsersByKey(req.body,
      function(data) {
      if (data.length > 0) {
        var jsonUsersObject = makeJSONObject(data, "user");
        res.json(jsonUsersObject);
      } else {
        res.json(new Object());
      }
    });
  }
};

exports.delete_customer = function(req, res) {
  database.deleteData(req.body, "customer", function(success) {
    res.json({deleted: success});
  });
};

exports.delete_book = function(req, res) {
  database.deleteData(req.body, "book", function(success) {
    res.json({deleted: success});
  });
};

exports.checkout_book = function(req, res) {
  database.checkoutBook(req.body, function(success, err) {
    res.json({checkedout: success, reason: err});
  });
};

exports.check_book = function(req, res) {
  database.checkIfCheckedout(req.body, function(bookState) {
    res.json({checkedoutState: bookState});
  });
};