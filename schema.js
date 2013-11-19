var pg = require('pg');
var conString = process.env.DATABASE_URL || "postgress://node:pass@localhost:5432/Library";

var dropQuery = "DROP TABLE IF EXISTS customer, book";
var tableQuery = "CREATE TABLE customer \
        (account_no int,       /* customer account number */ \
         username text,        /* customer user id */ \
         password text,        /* customer password */ \
         last_name text,       /* customer last name */ \
         first_name text,      /* customer first name */ \
         street text,          /* customer street address */ \
         city text,            /* customer city */ \
         state text,           /* customer state */ \
         zip text,             /* customer zip */ \
         email text,           /* customer email address */ \
         books_checked_out text[], \
                               /* isbn list of books checked out by customer */ \
         admin boolean)";      /*  does customer have admin rights */
var adminQuery = "INSERT INTO customer ( account_no, username, password, admin) \
            VALUES ( 0, 'admin', 'admin', true)";
var bookQuery = "CREATE TABLE book \
        (isbn text,              /* book id */ \
         title text,             /* book title */ \
         author text,            /* author name */ \
         description text,       /* book description */ \
         cover text,             /* address of book cover jpeg */ \
         sample text,            /* address of book sample pdf */ \
         genre text,             /* book genre */ \
         total_copies int,       /* total copies of book */ \
         avail_copies int)";     /* avail copies of book */

console.log("Database connection string: " + conString);

pg.connect(conString, function(err, client, done) {
  if (err) {
    return console.error('error fetching client from pool', err);
  }

  client.query(dropQuery, function(err, results) {
    done();
    if (err) {
      return console.error('error deleting old tables', err);
    }

    client.query(tableQuery, function(err, results) {
      done();
      if (err) {
        return console.error('error creating customer table', err);
      }

      client.query(adminQuery, function(err, results) {
        done();
        if (err) {
          return console.error('error creating admin', err);
        }
        client.query(bookQuery, function(err, results) {
          //call 'done()' to release the client back to the pool
          done();

          if (err) {
            return console.error('error creating book table', err);
          }
          exit();
        });
      });
    });
  });
});

function exit() {
  console.log("Schema completed.");
  process.exit(code=0);
}
