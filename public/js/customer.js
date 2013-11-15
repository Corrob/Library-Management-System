var searchBarDefault = "Enter query...";
var bookShelfContent;

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

$("#cancel").click(function() {
  clearHiddenForms();
});

$("#filter").click(function() {
  bookShelfContent = $("#bookShelf").html();
  var filterHtml;
  filterHtml = "<input type='text' id='searchBar'"
             + "value='Enter query...' class='searchBar'>"
             + "<label class='searchLabels'>Search for books by:</label>"
             + "<div class='radioContainer'>"
             + "<input type='radio' name='searchFilters' id='bookTitleOption'"
             + "class='radioLabel' value='byTitle'>"
             + "<label class='radioLabel' for='bookTitleOption'>"
             + "Book Title</label></div>"
             + "<div class='radioContainer'>"
             + "<input type='radio' name='searchFilters' id='bookAuthorOption'"
             + "class='radioLabel' value='byAuthor'>"
             + "<label class='radioLabel' for='bookAuthorOption'>"
             + "Author Name</label></div>";
             
  if (adminBoolean) {
    filterHtml += "<label class='searchLabels'>"
               + "Search for customers by:</label>"
               + "<div class='radioContainer'>"
               + "<input type='radio' name='searchFilters' id='userIdOption'"
               + "class='radioLabel' value='byId'>"
               + "<label class='radioLabel' for='userIdOption'>"
               + "Customer ID</label></div>"
               + "<div class='radioContainer'>"
               + "<input type='radio' name='searchFilters' id='userNameOption'"
               + "class='radioLabel' value='byName'>"
               + "<label class='radioLabel' for='userNameOption'>"
               + "Customer Name</label></div>";
  }

  filterHtml += "<div id='filterButtonsContainer'>"
             + "<button id='search' class='optionButtons filterButtons'>"
             +  "Search</button>"
             +  "<button id='cancelSearch' class='optionButtons filterButtons'>"
             +  "Cancel</button></div>";

  $("#bookShelf").html(filterHtml); 
});

var clearHiddenForms = function() {
  $(".hiddenForm input[type=text]").each(function() {
    $(this).val("");  
  });
  $(".hiddenForm").hide();
};

$("#bookShelf").on("focus", "#searchBar", function() {
  $(this).css('color', '#666666');
  $(this).focus(function() {
    if(this.value == searchBarDefault) {
      this.value = "";
      $(this).css("color", "#333333");
    }
  });
  $(this).blur(function() {
    if(this.value == "") {
      $(this).css("color", "#666666");
      this.value = searchBarDefault;
    }
  });
});

$("#bookShelf").on("click", "#cancelSearch", function() {
  $("#bookShelf").html(bookShelfContent);
});

$("#bookShelf").on("click", "#search", function() {
  alert("Under Construction :-).");
});