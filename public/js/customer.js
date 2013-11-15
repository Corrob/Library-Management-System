$("#logout").click(function() {
  $.get('/logout',
    function(data, textStatus) {
      window.location.href = data.redirect;
    });
});

$("#new_customer").click(function() {
  clearHiddenForms();
  $("#new_customer_form").show();
});

$("#submit_new_customer").click(function() {
  $.post('/new_customer', {username : $("#username").val(), 
                           password : $("#password").val()},
    function(data, textStatus) {
      clearHiddenForms();
    });
});

$(".cancel").click(function() {
  clearHiddenForms();
});

var clearHiddenForms = function() {
  $("input:text").val("");
  $(".hiddenForm").hide();
};