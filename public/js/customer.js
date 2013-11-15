var showFilters = false;

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

$("#filter").click(function() {
  showFilters = !showFilters;

  if (showFilters) {
    var bookshelfContent = $("bookShelf").html();
    var filterHTML = "<form>";
    filterHTML += "<input type='text' id='searchBar' value='Enter query...'>"
               += "<label>Search for books by:</label><br />"
               += "<input type='radio' id='bookTitleOption' value='byTitle'>"
               += "Book Title<br />"
               += "<input type='radio' id='bookAuthorOption' value='byAuthor'>"
               += "Author Name<br />";
    


    filterHTML += "</form>";
  } else {

  }
});

var clearHiddenForms = function() {
  $("input:text").val("");
  $(".hiddenForm").hide();
};
