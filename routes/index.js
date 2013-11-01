
/*
 * GET home page.
 */

exports.login_page = function(req, res){
  res.render('login_page', { title : "Library Management System Log In"});
};