var showFilters = false;

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