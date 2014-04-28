$(document).ready(function() {



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

  $.get( "http://host.cals.wisc.edu", function( data ) {
    $( "#invisibleContainer" ).html( data );
    //alert( "Load was performed." );
    setTimeout(function() {
    html2canvas(document.getElementById("invisibleContainer"), {
      onrendered: function(canvas) {
        document.body.appendChild(canvas);
        $("#invisibleContainer").hide();
      }
    });

  },4000);
  });

$( ".cardContainer" ).each(function( index ) {
  var siteurl = "http://" + $(this).attr("data-siteurl");
  var screenshoturl = "http://api.thumbalizr.com/?url=http://" + $(this).attr("data-siteurl") + "&width=350";


    /*$.get( screenshoturl, function( data ) {
      $(this).find(".entry-content").html( data );
    });*/


  //get response times
  pingSite(siteurl,this);
  setInterval(function() {

  /*html2canvas(document.body, {
  onrendered: function(canvas) {
    document.body.appendChild(canvas);
  }
});*/

    pingSite(siteurl,this);
  },10000);
});

function pingSite(siteurl,obj) {
  var sendDate = (new Date()).getTime();

  $.ajax({
      //type: "GET", //with response body
      type: "HEAD", //only headers
      url: siteurl,
      statusCode: {
        404: function() {
          //alert( "page not found" );
          $(obj).find(".responseContainerStatus").text("ruh roh!");
        },
        200: function() {
          //alert("pagefound");
          $(obj).find(".responseContainerStatus").text("All is well.");
        }
      },
      success: function(){

          var receiveDate = (new Date()).getTime();

          var responseTimeMs = receiveDate - sendDate;
          var responseTimeMsName = receiveDate - sendDate + "ms";

          if(responseTimeMs >= 120 && responseTimeMs < 300) {
              $(obj).find(".responseContainer").addClass("warning");
          } else if(responseTimeMs >= 300) {
              $(obj).find(".responseContainer").addClass("problem");
          }
          //console.log(responseTimeMs);
          $(obj).find(".responseContainerData").text(responseTimeMsName);
          //console.log(responseTimeMs);


      }


  });
}

});
