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
      $(this).closest(".cardContainer").find(".overlay").addClass("darken");
      $(this).closest(".cardContainer").find(".overlaytext").text(text);
    }
  });

  $( "a" ).mouseout(function() {
    var text = $(this).attr("data-tooltip");
    if(text) {
      $(this).closest(".cardContainer").find(".overlay").removeClass("darken");
      $(this).closest(".cardContainer").find(".overlaytext").text("");
    }
  });

});
