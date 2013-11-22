var searchBarDefault = "Enter query...";
var bookShelfContent;
var searchShowing = false;
var selectedFilter = "";
var searchBarQuery = "";
var bookShelfUpdateLabel = "<div class='updateContainer'>"
                         + "<label id='bookShelfUpdateLabel'></label></div>";

var jcrop_api;
var canSubmitNewBook = true;
var isUpdate = false;

var refreshView = function(type) {
  setTimeout(function() {
    // Perform same search as user so the list of books only shows
    // what the user wanted.
    if (selectedFilter && searchBarQuery) {
      performSearch(selectedFilter, searchBarQuery);
    } else {
      if (type == "book") {
        loadBooks();
      } else {
        loadCustomers();
      }
    }
  }, 1000);
};

var showDetailsHandlerMaker = function(type, identifier) {
  switch(type) {
    case "book":
      return function() {
        $.post('/get_book',
          {isbn: identifier},
          function(data, textStatus) {
            var content = bookShelfUpdateLabel;
            content += "<div class='shelfEntry'>";
            if (data) {
              content += "<img class='bookCover' src='" + data["book0"]["cover"]
                            + "' />";
              for (var info in data["book0"]) {
                switch (info) {
                  case "author":
                    content += "<span class='bookInfo'><strong>By:</strong> " + data["book0"][info] + "</span>";
                    break;
                  case "title":
                    content += "<span class='bookInfo'><strong>Title:</strong> "
                            + data["book0"][info]
                            + "</span>";
                    break;
                  case "isbn":
                    content += "<span class='bookInfo'><strong>ISBN:</strong> "
                                 + data["book0"][info] + "</span>";
                    break;
                  case "genre":
                    content += "<span class='bookInfo'><strong>Genre:</strong> "
                                 + data["book0"][info] + "</span>";
                    break;
                  case "sample":              
                    if (data["book0"][info]  != null
                         && data["book0"][info] != "") {
                      content += "<span class='bookInfo'><strong>Sample:</strong> "
                                   + "<a href='" + data["book0"][info]
                                   + "' target='_blank'>Link</a></span>";
                    }
                    break;
                  case "total_copies":
                    content += "<span class='bookInfo'><strong>Total Copies in Library:</strong> "
                            + data["book0"][info] + "</span>";
                    break;
                  case "avail_copies":
                    content += "<span class='bookInfo'><strong>Available Copies:</strong> "
                            + data["book0"][info] + "</span>";
                    break;
                }
              } 
              content += "<span class='bookInfo'><strong>Description:</strong> </span>"
                      + "<p class='bookDescription'>" + data["book0"]["description"]
                      + "</p>";
              content += "<div id='detailButtonContainer'>";
              if (adminBoolean) {
                content += "<button id='editBook" + data["book0"]["isbn"] + "'"
                        + " class='optionButtons detailButtons'>Edit</button>";
                $("#bookShelf").off("click", "#editBook" + data["book0"]["isbn"]);
                $("#bookShelf").on("click", "#editBook" + data["book0"]["isbn"], function() {
                  clearHiddenForms();
                  isUpdate = true;
                  $("#new_book_form").show();
                  $("#coverLabel").text("Change Cover Image:");
                  $("#sampleLabel").text("Change PDF Sample:");
                  $("#submit_new_book").text("Save Changes");
                  $("form#new_book_form").children().each(
                    function() {
                      if ($(this).attr("id") == "description") {
                        $(this).val(data["book0"]["description"]);
                      }
                    });
                  $("form#new_book_form .inputLines").children().each(
                    function() {
                    if ($(this).attr("name") != "undefined") {
                      if ($(this).attr("name") == "copies") {
                       $(this).val(data["book0"]["total_copies"]);
                      } else if ($(this).attr("name") == "isbn") {
                        $(this).attr("readonly", true);
                        $(this).val(data["book0"][$(this).attr("name")]);
                      } else if ($(this).attr("name") != "cover" 
                                 && $(this).attr("name") != "sample") {
                        $(this).val(data["book0"][$(this).attr("name")]);
                      }
                    }
                  });
                  updateNewBookForm();
                });
              }
              content += "<button id='backBooks'"
                      + " class='optionButtons detailButtons'>Back</button>";

              content += "</div>";
              content += "</div>";
              bookShelfContent = $("#bookShelf").html();
              $("#bookShelf").html(content);
            }
          });
        };
      break;
    case "customer":
      return function() {
        $.post('/get_user',
          {account_no: identifier},
          function(data, textStatus) {
            var content = bookShelfUpdateLabel;
            content += "<div class='shelfEntry'>";
            if (data) {
              for (var info in data["user0"]) {
                switch (info) {
                  case "account_no":
                    content += "<span class='userInfo'><strong>User ID:</strong> "
                                 + data["user0"][info] + "</span>";
                    break;
                  case "username":
                    content += "<span class='userInfo'><strong>Username:</strong> "
                            + data["user0"][info]
                            + "</span>";
                    break;
                  case "last_name":
                    content += "<span class='userInfo'><strong>Last Name:</strong> "
                                 + data["user0"][info] + "</span>";
                    break;
                  case "first_name":
                    content += "<span class='userInfo'><strong>First Name:</strong> "
                                 + data["user0"][info] + "</span>";
                    break;
                  case "street":
                    content += "<span class='userInfo'><strong>Street Address:</strong> "
                                 + data["user0"][info] + "</span>";
                    break;
                  case "city":
                    content += "<span class='userInfo'><strong>City:</strong> "
                                 + data["user0"][info] + "</span>";
                    break;
                  case "state":
                    content += "<span class='userInfo'><strong>State:</strong> "
                                 + data["user0"][info] + "</span>";
                    break;
                  case "zip":
                    content += "<span class='userInfo'><strong>ZIP code:</strong> "
                                 + data["user0"][info] + "</span>";
                    break;
                  case "email":
                    content += "<span class='userInfo'><strong>Email Address:</strong> "
                                 + data["user0"][info] + "</span>";
                    break;
                  case "admin":
                    content += "<span class='userInfo'><strong>Admin:</strong> ";
                    if (data["user0"][info]) {
                      content += "YES";
                    } else {
                      content += "NO";
                    }
                      content += "</span>";
                   break;
                }
              } 
              content += "<div id='detailButtonContainer'>";

              content += "<button id='editUser" + data["user0"]["account_no"] + "'"
                      + " class='optionButtons detailButtons'>Edit</button>";

              $("#bookShelf").off("click", "#editUser" + data["user0"]["account_no"]);
              $("#bookShelf").on("click", "#editUser" + data["user0"]["account_no"], function() {
                clearHiddenForms();
                isUpdate = true;
                $("#new_customer_form").show();
                $("#submit_new_customer").text("Save Changes");
                $("#admin").prop("checked", data["user0"]["admin"]);
                $("#username").attr("readonly", true);
                $("#new_customer_form .inputLines").children().each(
                  function() {
                  if ($(this).attr("id") != "undefined") {
                   $(this).val(data["user0"][$(this).attr("id")]);
                  }
                });
              });

              content += "<button id='backUsers'"
                      + " class='optionButtons detailButtons'>Back</button>";

              content += "</div>";
              content += "</div>";
              bookShelfContent = $("#bookShelf").html();
              $("#bookShelf").html(content);
            }
          });
        };
      break;
  }
};

var checkoutHandlerMaker = function(bookIsbn) {
  return function() {
    $.post('/checkout_book',
      {username: currentUsername,
       isbn: bookIsbn
      },
      function(data, textStatus) {
        $("#bookShelf").scrollTop(0);
        if (data.checkedout) {
          $("#bookShelfUpdateLabel").text("Book checked out successfully! Updating list...");
          refreshView("book");
        } else {
          $("#bookShelfUpdateLabel").text("Check out unsuccessful: " + data.reason);
        }
      });
  };
};

var returnHandlerMaker = function(bookIsbn) {
  return function() {
    $.post('/return_book',
      {username: currentUsername,
       isbn: bookIsbn
      },
      function(data, textStatus) {
        $("#bookShelf").scrollTop(0);
        if (data.completed) {
          $("#bookShelfUpdateLabel").text("Book returned successfully! Updating list...");
          refreshView("book");
        } else {
          $("#bookShelfUpdateLabel").text("Return unsuccessful: " + data.reason);
        }
      });
  };
};

var deleteHandlerMaker = function(type, identifier) {
  switch(type) {
    case "book":
      return function () {
        $.post('/delete_book',
          {isbn: identifier},
          function(data, textStatus) {
            $("#bookShelf").scrollTop(0);
            if (data) {
              $("#bookShelfUpdateLabel")
              .text("Book was deleted successfully! Updating list...");
              refreshView("book");
            } else {
              $("#bookShelfUpdateLabel").text("Book deletion was unsuccessful!");
            }
          });
      };
      break;
    case "customer":
      return function () {
        $.post('/delete_customer',
        {account_no: identifier},
        function(data, textStatus) {
          $("#bookShelf").scrollTop(0);
          if (data) {
            $("#bookShelfUpdateLabel")
            .text("User was deleted successfully! Updating list...");
            setTimeout(loadCustomers, 1000);
          } else {
            $("#bookShelfUpdateLabel").text("User deletion was unsuccessful!");
          }
        });
      };
      break;
  }
};

var checkBookCheckedoutStatus = function(bookIsbn) {
  var result = false;
  $.ajax({
          url:  "/check_book",
          type: "POST",
          data: {username: currentUsername,
                 isbn: bookIsbn},
          async: false,
          success: function(data){
            result = data.checkedoutState;
          }
       });
  return result;
}

var performSearch = function(filter, query) {
  switch (filter) {
    case "byTitle":
      $.post('/get_books',
        {keywords: query.toUpperCase(),
         column: "title" 
        },
        function (data, textStatus) {
          if (jQuery.isEmptyObject(data)) {
            $("#bookShelfUpdateLabel").text("No results found!");
          } else {
            printBookData(data);
            searchShowing = false;
          }
        });
      break;
    case "byAuthor":
      $.post('/get_books',
        {keywords: query.toUpperCase(),
         column: "author" 
        },
        function (data, textStatus) {
          if (jQuery.isEmptyObject(data)) {
            $("#bookShelfUpdateLabel").text("No results found!");
          } else {
            printBookData(data);
            searchShowing = false;
          }
        });
      break;

    case "byId":
      $.post('/get_users',
        {key: query,
         column: "account_no"
        },
        function (data, textStatus) {
          if (jQuery.isEmptyObject(data)) {
            $("#bookShelfUpdateLabel").text("No results found!");
          } else {
            printUserData(data);
            searchShowing = false;
          }
        });
      break;

    case "byName":
      $.post('/get_users',
        {key: query,
         column: "username"
        },
        function (data, textStatus) {
          if (jQuery.isEmptyObject(data)) {
            $("#bookShelfUpdateLabel").text("No results found!");
          } else {
            printUserData(data);
            searchShowing = false;
          }
        });
      break;
    default:
      $("#bookShelfUpdateLabel").text("Please select a filter!");
      break;
  }
};

var loadBooks = function() {
  $.post('/get_books',
    function(data, textStatus) {
      printBookData(data);
    });
};

var loadCustomers = function() {
  $.post('/get_users',
    function(data, textStatus) {
      printUserData(data);
    });
};

var printBookData = function(data) {
  if (!jQuery.isEmptyObject(data)) {
    var content = bookShelfUpdateLabel;
    content += "<div id='bookShelfList'>";
    for (var book in data) {
      content += "<div class='shelfEntry'>"
      for (var info in data[book]) {
        switch (info) {
          case "cover":
            content += "<img class='bookCover' src='" + data[book][info]
                    + "' />";
            break;
          case "author":
            content += "<span class='bookInfo'><strong>By</strong> " + data[book][info] + "</span>";
            break;
          case "title":
            content += "<a class='bookTitle' id='showBookDetails"  + data[book]["isbn"]
                    + "'>" + data[book][info]
                    + "</a>";
            $("#bookShelf").off("click", "#showBookDetails"
              + data[book]["isbn"]);
            $("#bookShelf").on("click", "#showBookDetails"
              + data[book]["isbn"], 
              showDetailsHandlerMaker("book", data[book]["isbn"]));
            break;
          case "description":
            content += "<p class='bookDescription'>" + data[book][info]
                    + "</p>"
            break;
        }
      }
      if (adminBoolean) {
        content += "<button id='deleteBook" + data[book]["isbn"]
                + "' class='optionButtons'>Delete"
                + "</button>";
        $("#bookShelf").off("click", "#deleteBook" + data[book]["isbn"]);
        $("#bookShelf").on("click", "#deleteBook" + data[book]["isbn"],
          deleteHandlerMaker("book", data[book]["isbn"]));
      } else {
        if (!checkBookCheckedoutStatus(data[book]["isbn"])) {
          if (data[book]["avail_copies"] == 0) {
            content += "<span class='bookInfoUpdate'>All copies are checked out!"
                         + "</span>";
          } else {
            content += "<button id='checkoutBook" + data[book]["isbn"]
                         + "' class='optionButtons'>Check Out"
                         + "</button>";
            $("#bookShelf").off("click", "#checkoutBook" + data[book]["isbn"]);
            $("#bookShelf").on("click", "#checkoutBook" + data[book]["isbn"],
              checkoutHandlerMaker(data[book]["isbn"]));
          }
        } else {
          content += "<button id='returnBook" + data[book]["isbn"]
                  + "' class='optionButtons'>Return"
                  + "</button>";
          $("#bookShelf").off("click", "#returnBook" + data[book]["isbn"]);
          $("#bookShelf").on("click", "#returnBook" + data[book]["isbn"],
            returnHandlerMaker(data[book]["isbn"]));
        }
      }
      content += "</div>";
    }
    content += "</div>";
    $("#bookShelf").html(content);
  } else {
    var content = bookShelfUpdateLabel;
    $("#bookShelf").html(content);
    $("#bookShelfUpdateLabel").text("There are currently no books in the library!");
  }
};

var printUserData = function(data) {
  if (!jQuery.isEmptyObject(data)) {
    var content = bookShelfUpdateLabel;
    content += "<div id='bookShelfList'>";
    for (var user in data) {
      content += "<div class='shelfEntry'>"
      for (var info in data[user]) {
        switch (info) {
          case "account_no":
            content += "<a class='accountNumber' id='showUserDetails"
                    + data[user][info] + "'>ID: " + data[user][info]
                    + "</a>";
            $("#bookShelf").off("click", "#showUserDetails"
              + data[user][info]);
            $("#bookShelf").on("click", "#showUserDetails"
              + data[user][info], 
              showDetailsHandlerMaker("customer", data[user][info]));
            break;
          case "username":
            content += "<span class='userInfo'><strong>Username:</strong> "
                         + data[user][info] + "</span>";
            break;
          case "last_name":
            content += "<span class='userInfo'><strong>Last Name:</strong> "
                         + data[user][info] + "</span>";
            break;
          case "first_name":
            content += "<span class='userInfo'><strong>First Name:</strong> "
                         + data[user][info] + "</span>";
            break;
          case "admin":
            content += "<span class='userInfo'><strong>Admin:</strong> "
                         + data[user][info] + "</span>";
            break;   
        }
      }
      content += "<button id='deleteUser" + data[user]["account_no"]
              + "' class='optionButtons'>Delete"
              + "</button>";

      $("#bookShelf").off("click", "#deleteUser" + data[user]["account_no"]);
      $("#bookShelf").on("click", "#deleteUser" + data[user]["account_no"],
        deleteHandlerMaker("customer", data[user]["account_no"]));
      content += "</div>";
    }
    content += "</div>";
    $("#bookShelf").html(content);
  } else {
    var content = bookShelfUpdateLabel;
    $("#bookShelf").html(content);
    $("#bookShelfUpdateLabel").text("There are currently no users in the database!");
  }
};

$("#logout").click(function() {
  $.post('/logout',
    function(data, textStatus) {
      window.location.href = data.redirect;
    });
});

$("#new_customer").click(function() {
  clearHiddenForms();
  isUpdate = false;
  updateNewBookForm();
  $("#new_customer_form").show();
});

$("#new_book").click(function() {
  clearHiddenForms();
  isUpdate = false;
  updateNewBookForm();
  $("#new_book_form").show();
});

$("#submit_new_customer").click(function() {
  $.post('/new_customer', {update: isUpdate,
                           username : $("#username").val(), 
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
          $("#bookShelf").scrollTop(0);
          if (isUpdate) {
            $("#bookShelfUpdateLabel")
            .text("Customer successfully updated! Updating list...");
          } else {
            $("#bookShelfUpdateLabel")
            .text("Customer successfully added! Updating list...");
          }
          refreshView("customer");
        } else {
          $(".updateLabel").text('Username already exists.');
        }
      } else {
        if (isUpdate) {
          $(".updateLabel").text('Failed to update customer.');
        } else {
          $(".updateLabel").text('Failed to submit new customer.');
        }
      }
    });
});

function checkNewBookForm() {
  var sample = $('#sample').val();
  var sampleExtension = sample.split('.').pop();

  if (sample != '' && sampleExtension != 'pdf') {
    $('.updateLabel').text('The sample must be a PDF file.');
    return false;
  } else if (sample != '' && $('#sample')[0].files[0].size > 1000 * 1024) {
    $('.updateLabel').text('The sample PDF is too large (must be < 1 MB).');
    return false;
  } else if (!isPositiveInt($("#copies").val())) {
    $(".updateLabel").text('Copies field must be a positive integer.');
    return false;
  } else if ($("#isbn").val() == '') {
    $(".updateLabel").text('A book must have an ISBN.');
    return false;
  } else if (!canSubmitNewBook) {
    $(".updateLabel").text('Cannot submit invalid image. Please upload a valid image (jpg/png and <1 MB).');
    return false;
  } else if ($('#isbn').val().indexOf("'") != -1 || $('#isbn').val().indexOf('"') != -1) {
    $(".updateLabel").text('ISBN cannot contain quotes.');
    return false;
  } else if ($('#title').val() == '') {
    $(".updateLabel").text('A book msut have a title.');
    return false;
  } else {
    return true;
  }
}

$(".cancel").click(function() {
  clearHiddenForms();
  isUpdate = false;
});

var isPositiveInt = function(str) {
  if (str == null || str == '') {
    return false;
  }
  // Regex check
  return /^[1-9][0-9]*$/.test(str);
}

var clearHiddenForms = function() {
  $("#submit_new_book").text("Submit New Book");
  $("#submit_new_customer").text("Submit New Customer");
  $("#coverLabel").text("Cover Image:");
  $("#sampleLabel").text("PDF Sample:");
  $("form#new_book_form #isbn").attr("readonly", false);
  $("#username").attr("readonly", false);

  $(".hiddenForm input[type=text]").each(function() {
    $(this).val("");
  });
  
  $(".hiddenForm input[type=password]").each(function() {
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
  $(".hiddenForm input[type=file]").each(function() {
    $(this).val("");
  });
  $(".hiddenForm").hide();
  $(".imagePreview").hide();
};

// update info by cropping (onChange and onSelect events handler)
function updateInfo(e) {
    $('#x1').val(e.x);
    $('#y1').val(e.y);
    $('#x2').val(e.x2);
    $('#y2').val(e.y2);
}

// Code from http://www.script-tutorials.com/html5-image-uploader-with-jcrop/
function fileSelectHandler() {
  var oFile = $('#cover')[0].files[0];

  $('.updateLabel').text('');
  $('.imagePreview').hide();
  canSubmitNewBook = false;

  // check for image type (jpg and png are allowed)
  var rFilter = /^(image\/jpeg|image\/png)$/i;
  if (! rFilter.test(oFile.type)) {
    $('.updateLabel').text('Please select a valid image file (jpg and png are allowed)');
    return;
  }

  // check for file size, make sure less than 1 MB
  if (oFile.size > 1000 * 1024) {
    $('.updateLabel').text('File must be less than 1 MB');
    return;
  }

  canSubmitNewBook = true;

  // preview element
  var oImage = document.getElementById('preview');

  // prepare HTML5 FileReader
  var oReader = new FileReader();
    oReader.onload = function(e) {

    // e.target.result contains the DataURL which we can use as a source of the image
    oImage.src = e.target.result;
    oImage.onload = function () { // onload event handler
      if (jcrop_api != null) {
        $(oImage).attr('style','');
        jcrop_api.destroy();
      }

      $('.imagePreview').show();
      $('#preview').Jcrop({
        onChange: updateInfo,
        onSelect: updateInfo,
      }, function(){
        jcrop_api = this;
        $('.imagePreview').css('right', getRight($('#bookShelf')));
      });
    };
  };

  // read selected file as DataURL
  oReader.readAsDataURL(oFile);
}

function getRight(el) {
  return ($(window).width() - (el.offset().left + el.outerWidth()));
}

$("#filter").click(function() {
  if (!searchShowing) {
    selectedFilter = "";
    bookShelfContent = $("#bookShelf").html();
    var filterHtml = bookShelfUpdateLabel;
    filterHtml += "<input type='text' id='searchBar'"
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
  searchBarQuery = "";
  searchShowing = false;
});

$("#bookShelf").on("click", "#search", function() {
  searchBarQuery = $("#searchBar").val();
  performSearch(selectedFilter, searchBarQuery);
});

/* Set selectedFilter to the selected filter by user. */
$("#bookShelf").on("change", "input[name='searchFilters']", function() {
  $("#bookShelf").children(".radioContainer").each(function() {
    if ($(this).children("input:radio").prop("checked")) {
      selectedFilter = $(this).children("input:radio").val();
    }
  });
});

$("#list_books").click(function() {
  loadBooks();
});

$("#list_users").click(function() {
  loadCustomers();
});

$("#bookShelf").on("click", "#backBooks", function() {
  if (selectedFilter && searchBarQuery) {
    performSearch(selectedFilter, searchBarQuery);
  } else {
    loadBooks();
  }
});

$("#bookShelf").on("click", "#backUsers", function() {
  if (selectedFilter && searchBarQuery) {
    performSearch(selectedFilter, searchBarQuery);
  } else {
    loadCustomers();
  }
});

var updateNewBookForm = function() {
  // Make new book with form ajax
  $('#new_book_form').ajaxForm({
  data: {update: isUpdate},
  success: function(data, textStatus) {
    if (data.completed) {
      clearHiddenForms();
      $("#bookShelf").scrollTop(0);
      if (isUpdate) {
        $("#bookShelfUpdateLabel")
        .text("Book successfully updated! Updating list...");
      } else {
        $("#bookShelfUpdateLabel")
        .text("Book successfully added to the library! Updating list...");
      }
      refreshView("book");
    } else {
      if (isUpdate) {
        $(".updateLabel").text('Failed to update book.');
      } else {
        $(".updateLabel").text('Failed to submit new book.');
      }
    }
  }});
};

$(document).ready(function() {
  loadBooks();
  updateNewBookForm();
});

