$(function() {
//event listeners
//TODO: run a scrape on load

  //wire comment to POST AJAX requests.
  $('#savenote').on('click', function(event){
    event.preventDefault()
    var title =   $('#title-input').val().trim()
    var body = $('#body-input').val().trim()
    var id = $('#id-input').data("value")
    console.log(id)

    //make the note ID dynamic
      $.ajax({
      method: "POST",
      url: `/articles/${id}`,
      data: {
        // Value taken from title input
        title: title,
        // Value taken from note textarea
        body: body
      }
    }).done(function(data){

      console.log('you submitted this: ' + data.note.title )
      $("#title-input").val("");
      $("#body-input").val("");
      console.log(data)
      $("#hbr-note-title").text(title);
      $("#hbr-note-body").text(body);
      location.reload();
    });
  })

    //responsive nav
    var burger = $('.navbar-burger');
    var menu = $('#navbarMenu');
    burger.click(function() {
        // $('nav').toggleClass('is-white', true);
        burger.toggleClass('is-active');
        menu.toggleClass('is-active');
    });
});
