$("#logout").click(function() {
  $.get('/logout',
    function(data, textStatus) {
      window.location.href = data.redirect;
    });
});

$("#new_user").click(function() {
  $.get('/new_user', {username : 'test1', password : '1234'},
    function(data, textStatus) {

    })
});