$(document).ready(function() {




  function sortItems() {

    $('#main').isotope({
      masonry: {

      },
      getSortData: {
        name: '.name',
        server: '.server',
        number: '.responseContainerData parseInt'
      },
      sortBy: 'name',
      sortAscending: sortOrder
    });

    if(sortType == "name") {

      $('#main').isotope({
        sortBy: 'name',
        sortAscending: sortOrder
      });
      $('#main').isotope('updateSortData').isotope();
    } else if(sortType == "server") {
      $('#main').isotope({
        sortBy: 'server',
        sortAscending: sortOrder
      });
      $('#main').isotope('updateSortData').isotope();
    } else {

      $('#main').isotope({
      sortBy: 'number',
      sortAscending: sortOrder
      });
      $('#main').isotope('updateSortData').isotope();

    }
  }

  var storedSortType = localStorage.getItem("sortedby");
  var storedSortOrder = localStorage.getItem("sortorder");



  if(storedSortType) {
    var sortType = storedSortType;
    $(".sortingOptions a").removeClass("selected");
    $(".sortingOptions a").each(function() {
      var currentSort = $(this).attr("data-sorttype");
      if(currentSort == sortType) {
        $(this).addClass("selected");
        //sortItems();
      }
    });
  } else {
    var sortType = "name";

  }

  //console.log(storedSortOrder);
  if(storedSortOrder != 'undefined') {
    var sortOrderVal = storedSortOrder;
    if(sortOrderVal == "asc") {
      sortOrder = true;
    } else {
      sortOrder = false;
    }
    $(".sortingOrder a").removeClass("selected");
    $(".sortingOrder a").each(function() {
      var currentSort = $(this).attr("data-sortorder");
      if(currentSort == sortOrderVal) {
        $(this).addClass("selected");
        //console.log(sortOrder);
        //sortItems();
      }
    });
  } else {

    var sortOrder = true;

  }

  sortItems();

  $(".sortingOptions a").click(function() {
    $(".sortingOptions a").removeClass("selected");
    $(this).addClass("selected");
    sortType = $(this).attr("data-sorttype");
    localStorage.setItem("sortedby", sortType);
    sortItems();
    return false;
  });

  $(".sortingOrder a").click(function() {
    $(".sortingOrder a").removeClass("selected");
    $(this).addClass("selected");
    sortOrderVal = $(this).attr("data-sortorder");
    if(sortOrderVal == "asc") {
      sortOrder = true;
    } else {
      sortOrder = false;
    }
    //console.log(sortOrderVal);
    localStorage.setItem("sortorder", sortOrderVal);
    sortItems();
    return false;
  });





  var randMessage = Math.floor((Math.random()*5)+1);

  if(randMessage == 1) {
    $(".subHeading .message").text("I miss my trapper keeper.");
  } else if(randMessage == 2) {
    $(".subHeading .message").text("I knew there was something I had to do...");
  } else if(randMessage == 3) {
    $(".subHeading .message").text("Short term memory?");
  } else if(randMessage == 4) {
    $(".subHeading .message").text("Just imagine how much you would get done if IE didn't exist.");
  }

  $(".subHeading .message").fadeIn();


  $( "a" ).mouseover(function() {
    var text = $(this).attr("data-tooltip");
    if(text) {
      $(this).closest(".cardContainer").find(".screenshot").addClass("blur");
      $(this).closest(".cardContainer").find(".overlay").addClass("darken");
      $(this).closest(".cardContainer").find(".overlaytext").text(text);
    }
  });

  $( "a" ).mouseout(function() {
    var text = $(this).attr("data-tooltip");
    if(text) {
      $(this).closest(".cardContainer").find(".screenshot").removeClass("blur");
      $(this).closest(".cardContainer").find(".overlay").removeClass("darken");
      $(this).closest(".cardContainer").find(".overlaytext").text("");
    }
  });

var cl = 0;
var firstrun = true;

$( ".cardContainer" ).each(function( index ) {

  var siteurl = "http://" + $(this).attr("data-siteurl");
  var screenshoturl = "http://api.thumbalizr.com/?url=http://" + $(this).attr("data-siteurl") + "&width=350";

  //get response times
  pingSite(siteurl,this);


});

setInterval(function() {
$( ".cardContainer" ).each(function( index ) {
    var siteurl = "http://" + $(this).attr("data-siteurl");
    var screenshoturl = "http://api.thumbalizr.com/?url=http://" + $(this).attr("data-siteurl") + "&width=350";
    pingSite(siteurl,this);
});
},10000);

function pingSite(siteurl,obj) {
  var sendDate = (new Date()).getTime();

  $.ajax({
      //type: "GET", //with response body
      type: "HEAD", //only headers
      url: siteurl,
      statusCode: {
        404: function() {
          //alert( "page not found" );
          $(obj).find(".responseContainerStatus").show();
          $(obj).find(".responseContainer").addClass("problem");
          $(obj).find(".responseContainerStatus").text("Error 404");
        },
        500: function() {
          //alert( "page not found" );
          $(obj).find(".responseContainerStatus").show();
          $(obj).find(".responseContainer").addClass("problem");
          $(obj).find(".responseContainerStatus").text("Database Error 500");
        },
        206: function() {
          //alert( "page not found" );
          $(obj).find(".responseContainerStatus").show();
          $(obj).find(".responseContainer").addClass("warning");
          $(obj).find(".responseContainerStatus").text("Partial Error 206");
        },
        401: function() {
          //alert( "page not found" );
          $(obj).find(".responseContainerStatus").show();
          $(obj).find(".responseContainer").addClass("problem");
          $(obj).find(".responseContainerStatus").text("Unauthorized Error 401");
        },
        403: function() {
          //alert( "page not found" );
          $(obj).find(".responseContainerStatus").show();
          $(obj).find(".responseContainer").addClass("problem");
          $(obj).find(".responseContainerStatus").text("Forbidden Error 403");
        },
        200: function() {
          //alert("pagefound");
          $(obj).find(".responseContainerStatus").hide();
          $(obj).find(".responseContainerStatus").text("All is well.");
        }
      },
      success: function(){

          var receiveDate = (new Date()).getTime();

          var responseTimeMs = receiveDate - sendDate;
          var responseTimeMsName = responseTimeMs + "ms";

          $(obj).closest(".cardContainer").attr("data-responsetime",responseTimeMs);

          if(responseTimeMs >= 120 && responseTimeMs < 300) {
              $(obj).find(".responseContainer").addClass("warning");
          } else if(responseTimeMs >= 300) {
              $(obj).find(".responseContainer").addClass("problem");
          } else {
            $(obj).find(".responseContainer").removeClass("problem");
            $(obj).find(".responseContainer").removeClass("warning");
          }
          //console.log(responseTimeMs);
          $(obj).find(".responseContainerData").text(responseTimeMsName);
          //console.log(responseTimeMs);

          cl = cl + 1;
          if(cl == $( ".cardContainer" ).length) {
            //console.log("all done");

          if(sortType == "responseTime") {


            $('#main').isotope('updateSortData').isotope();



          }

            cl = 0;
          }


      }


  });
}

});
