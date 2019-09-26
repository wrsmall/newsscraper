$(".save").on("click", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
 console.log(thisId);
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/comments/" + thisId,
    data: {
      // Value taken from title input
      username: $(`.userName-${thisId}`).val(),
      // Value taken from note textarea
      usercomment: $(`.userInput-${thisId}`).val()
    }
  })
    // With that done
    .then(function(comment) {
      // Log the response
      
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $(".userName").val("");
  $(".userInput").val("");
});



