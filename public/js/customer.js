$("#logout").click(function() {
  $.get('/logout',
    function(data, textStatus) {
      window.location.href = data.redirect;
    });
});

$("#new_user").click(function() {
  $.get('/new_user', {},
    function(data, textStatus) {

    })
});