var searchBarDefault = "Enter query...";
var bookShelfContent;
var searchShowing = false;

$("#logout").click(function() {
  $.post('/logout',
    function(data, textStatus) {
      window.location.href = data.redirect;
    });
});

$("#new_customer").click(function() {
  clearHiddenForms();
  $("#new_customer_form").show();
});

$("#new_book").click(function() {
  clearHiddenForms();
  $("#new_book_form").show();
});

$("#submit_new_customer").click(function() {
  $.post('/new_customer', {username : $("#username").val(), 
                           password : $("#password").val(),
                           last_name : $("#last_name").val(),
                           first_name : $("#first_name").val(),
                           street : $("#street").val(),
                           city : $("#city").val(),
                           state : $("#state").val(),
                           zip : $("#zip").val(),
                           email : $("#email").val(),
                           admin: $("#admin").prop("checked")},
    function(data, textStatus) {
      if (data.completed) {
        if (!data.exists) {
          clearHiddenForms();
        } else {
          $(".updateLabel").text('Username already exists.');
        }
      } else {
        $(".updateLabel").text('Failed to submit new customer.');
      }
    });
});

$("#submit_new_book").click(function() {
  if (!isPositiveInt($("#copies").val())) {
    $(".updateLabel").text('Copies field must be an integer.');
  } else {
    $.post('/new_book', {isbn : $("#isbn").val(), 
                         title : $("#title").val(),
                         author: $("#author").val(),
                         description: $("#description").val(),
                         genre: $("#genre").val(),
                         total_copies: $("#copies").val(),
                         avail_copies: $("#copies").val()},
      function(data, textStatus) {
        if (data.completed) {
          clearHiddenForms();
        } else {
          $(".updateLabel").text('Failed to submit new book.');
        }
      });
  }
});

var isPositiveInt = function(str) {
  // Regex check
  return /^[1-9][0-9]*$/.test(str);
}

$(".cancel").click(function() {
  clearHiddenForms();
});

$("#filter").click(function() {
  if (!searchShowing) {
    bookShelfContent = $("#bookShelf").html();
    var filterHtml;
    filterHtml = "<input type='text' id='searchBar'"
               + "value='Enter query...' class='searchBar'>"
               + "<label class='searchLabels'>Search for books by:</label>"
               + "<div class='radioContainer'>"
               + "<input type='radio' name='searchFilters' id='bookTitleOption'"
               + "value='byTitle'>"
               + "<label class='radioLabel' for='bookTitleOption'>"
               + "Book Title</label></div>"
               + "<div class='radioContainer'>"
               + "<input type='radio' name='searchFilters' id='bookAuthorOption'"
               + "value='byAuthor'>"
               + "<label class='radioLabel' for='bookAuthorOption'>"
               + "Author Name</label></div>";
               
    if (adminBoolean) {
      filterHtml += "<label class='searchLabels'>"
                 + "Search for customers by:</label>"
                 + "<div class='radioContainer'>"
                 + "<input type='radio' name='searchFilters' id='userIdOption'"
                 + "value='byId'>"
                 + "<label class='radioLabel' for='userIdOption'>"
                 + "Customer ID</label></div>"
                 + "<div class='radioContainer'>"
                 + "<input type='radio' name='searchFilters' id='userNameOption'"
                 + "value='byName'>"
                 + "<label class='radioLabel' for='userNameOption'>"
                 + "Customer Name</label></div>";
    }

    filterHtml += "<div id='filterButtonsContainer'>"
               + "<button id='search' class='optionButtons filterButtons'>"
               +  "Search</button>"
               +  "<button id='cancelSearch' class='optionButtons filterButtons'>"
               +  "Cancel</button></div>";

    $("#bookShelf").html(filterHtml); 
    searchShowing = true;
  } else {
    $("#bookShelf").html(bookShelfContent);
    searchShowing = false;
  }
});

var clearHiddenForms = function() {
  $(".hiddenForm input[type=text]").each(function() {
    $(this).val("");  
  });
  $(".hiddenForm input[type=checkbox]").each(function() {
    $(this).prop("checked", false);
  });
  $(".hiddenForm textarea").each(function() {
    $(this).val("");  
  });
  $(".hiddenForm .updateLabel").each(function() {
    $(this).text("");
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
  searchShowing = false;
});

$("#bookShelf").on("click", "#search", function() {
  alert("Under Construction :-).");
});
