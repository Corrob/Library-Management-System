var loginFunc = function() {
  $.post("/login", 
    {'username': $("#username").val(), 'password': $("#password").val()},
    function(data, textStatus) {
      if (data.redirect) {
        window.location.href = data.redirect;
      } else {
        $("#update_label").text(data.form);
      }
    });
}

$(document).keypress(function(e) {
  if(e.which == 13 && $("input").focus()) {
    loginFunc();
  }
});

$(document).ready(function() {
  $("#login").click(loginFunc);
  $("#logo").hide().not(function() {
    return this.complete && $(this).fadeIn(1500);
  }).bind("load", function() {
    $(this).fadeIn(1500);
  });
  $("#username").focus();
});
