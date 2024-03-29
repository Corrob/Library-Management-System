
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.session({ secret: 'lib-secret-852' }));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.login_page);
app.get('/customer', routes.customer);
app.post('/login', routes.process_login);
app.post('/logout', routes.logout);
app.post('/new_customer', routes.new_customer);
app.post('/new_book', routes.new_book);
app.post('/get_books', routes.get_books);
app.post('/get_users', routes.get_users);
app.post('/delete_customer', routes.delete_customer);
app.post('/delete_book', routes.delete_book);
app.post('/checkout_book', routes.checkout_book);
app.post('/check_book', routes.check_book);
app.post('/return_book', routes.return_book);
app.post('/get_book', routes.get_book);
app.post('/get_user', routes.get_user);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Server listening on port ' + app.get('port'));
});
