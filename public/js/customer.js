var searchBarDefault = "Enter query...";
var bookShelfContent;
var searchShowing = false;
var selectedFilter = "";
var bookShelfUpdateLabel = "<div id='bookShelfUpdateContainer'>"
												 + "<label id='bookShelfUpdateLabel'></label></div>";
var jcrop_api;
var canSubmitNewBook = true;

var loadBooks = function() {
  $.post('/get_books',
    {admin: adminBoolean},
    function(data, textStatus) {
      printBookData(data);
    });
};

var loadCustomers = function() {
	$.post('/get_users',
    function(data, textStatus) {
      printUserData(data);
    });
}

var printBookData = function(data) {
  if (!jQuery.isEmptyObject(data)) {
	  var content = bookShelfUpdateLabel;
	  content += "<div id='bookShelfList'>";
	  for (var book in data) {
	    content += "<div class='shelfEntry'>"
	    for (var info in data[book]) {
	      switch (info) {
	        case "title":
	          content += "<a class='bookTitle'>" + data[book][info]
	                  + "</a>";
	          break;
	        case "description":
	          content += "<p class='bookDescription'>" + data[book][info]
	                  + "</p>"
	          break;
	      }
	    }
	    if (adminBoolean) {
	      content += "<button id='delete" + data[book]["isbn"]
	              + "' class='optionButtons'>Delete"
	              + "</button>";
	    } else {
	      content += "<button id='checkout" + data[book]["isbn"] 
	              + "' class='optionButtons'>Check Out"
	              + "</button>";
	    }

	    content += "</div>";
	  }
	  content += "</div>";
	  $("#bookShelf").html(content);
	  searchShowing = false;
	} else {
		$("#bookShelfUpdateLabel").text("No results found!");
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
	          content += "<a class='accountNumber'>ID: " + data[user][info]
	                  + "</a>";
	          break;
	        case "username":
	          content += "<span class='userInfo'>Username: " + data[user][info]
	                  + "</span>";
	          break;
          case "last_name":
	        	content += "<span class='userInfo'>Last Name: " + data[user][info]
	                  + "</span>";
            break;
          case "first_name":
          	content += "<span class='userInfo'>First Name: " + data[user][info]
	                  + "</span>";
	          break;
          case "admin":
	        	content += "<span class='userInfo'>Admin: " + data[user][info]
	                  + "</span>";
	          break;   
	      }
	    }
      content += "<button id='deleteUser" + data[user]["account_no"]
              + "' class='optionButtons'>Delete"
              + "</button>";

	    content += "</div>";
	  }
	  content += "</div>";
	  $("#bookShelf").html(content);
	  searchShowing = false;
	} else {
		$("#bookShelfUpdateLabel").text("No results found!");
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

function checkNewBookForm() {
  if (!isPositiveInt($("#copies").val())) {
    $(".updateLabel").text('Copies field must be an integer.');
    return false;
  } else if (!canSubmitNewBook) {
    $(".updateLabel").text('Cannot submit invalid image. Please upload a valid image (jpg/png and <1 MB).');
    return false;
  } else {
    return true;
  }
}

// Make new book with form ajax
$(document).ready(function() { 
  $('#new_book_form').ajaxForm({
    success: function(data, textStatus) {
        if (data.completed) {
          clearHiddenForms();
        } else {
          $(".updateLabel").text('Failed to submit new book.');
        }
      }
    });
}); 

$(".cancel").click(function() {
  clearHiddenForms();
});

var isPositiveInt = function(str) {
  // Regex check
  return /^[1-9][0-9]*$/.test(str);
}

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
};

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
  searchShowing = false;
});

$("#bookShelf").on("click", "#search", function() {
  switch (selectedFilter) {
    case "byTitle":
      $.post('/get_books',
        {admin: adminBoolean,
         keywords: $("#searchBar").val().toUpperCase(),
         column: "title" 
        },
        function (data, textStatus) {
          printBookData(data);
        });
      break;
    case "byAuthor":
      $.post('/get_books',
        {admin: adminBoolean,
         keywords: $("#searchBar").val().toUpperCase(),
         column: "author" 
        },
        function (data, textStatus) {
          printBookData(data);
        });
      break;

    case "byId":
    	$.post('/get_users',
    		{key: $("#searchBar").val(),
    		 column: "account_no"
    		},
    		function (data, textStatus) {
    			printUserData(data);
    		});
      break;

    case "byName":
    	$.post('/get_users',
    		{key: $("#searchBar").val(),
    		 column: "username"
    		},
    		function (data, textStatus) {
    			printUserData(data);
    		});
      break;
    default:
    	$("#bookShelfUpdateLabel").text("Please select a filter!");
      break;
  }
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

$(document).ready(loadBooks);

