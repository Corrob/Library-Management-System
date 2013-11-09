$("#login").click(function() {
  $.get("/login", 
    {'username': $("#username").val(), 'password': $("#password").val()},
    function(data, textStatus) {
      if (data.redirect) {
        window.location.href = data.redirect;
      } else {
        $("#update_label").text(data.form);
      }
    });
});