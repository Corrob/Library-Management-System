$("#logout").click(function() {
  $.get('/logout',
    function(data, textStatus) {
      window.location.href = data.redirect;
    });
});

$("#new_customer").click(function() {
  $.get('/new_customer', {username : 'test1', password : '1234'},
    function(data, textStatus) {
    })
});