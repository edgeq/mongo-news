(function() {

    var burger = $('.navbar-burger');
    var menu = $('#navbarMenu');

    burger.click(function() {
        // $('nav').toggleClass('is-white', true);
        burger.toggleClass('is-active');
        menu.toggleClass('is-active');
    });
})();
