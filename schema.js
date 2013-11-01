var pg = require('pg');
var conString = process.env.DATABASE_URL || "postgress://node:pass@localhost:5432/Library"

pg.connect(conString, function(err, client, done) {
  if (err) {
    return console.error('error fetching client from pool', err);
  }
  client.query('CREATE TABLE customer \
    (account_no int, \      /* customer account number */
     username text, \       /* customer user id */
     password text, \       /* customer password */
     last_name text, \      /* customer last name */
     first_name text, \     /* customer first name */
     street text, \         /* customer street address */
     city text, \           /* customer city */
     state string, \        /* customer state */
     zip int, \             /* customer zip */
     email text, \          /* customer email address */
     admin boolean, \)',    /*  does customer have admin rights */
      function(err, results) {
      //call 'done()' to release the client back to the pool
      done();

      if (err) {
        return console.error('error creating customer table', err);
      }
  });

  client.query('CREATE TABLE book \
    (ispn int, \              /* book id */
     title text, \            /* book title */
     author_last text, \      /* author last name */
     author_first text, \     /* author first name */
     cover string, \          /* address of book cover jpeg */
     sample string, \         /* address of book sample pdf */
     genre text, \            /* book genre */
     total_copies int, \      /* total copies of book */
     avail_copies int)',      /* avail copies of book */
    function(err, results) {
      //call 'done()' to release the client back to the pool
      done();

      if (err) {
        return console.error('error creating book table', err);
      }

  client.query('INSERT INTO customer ( account_no, username, password, admin) \
    VALUES ( 0, "admin", "admin", true)', function(err, results) {
      //call 'done()' to release the client back to the pool
      done();

      if (err) {
        return console.error('error creating admin', err);
      }
  });
  });
});
