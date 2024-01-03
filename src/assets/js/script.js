(function($) {
$(document).ready(function() {
  console.log(21)

    $( '.mobile-hamburguer' ).click(function() {
        $('body').addClass('open');
        $('.menu-mobile').addClass('active');
    });

    $( '.cerrar-menu' ).click(function() {
      $('body').removeClass('open');
      $('.menu-mobile').removeClass('active');
    });

    $( '.abrir-iphone' ).click(function() {
        $('.video_id').removeClass('active');
        $('.link-menu').removeClass('active');
        var ele = $(this).attr('data-rel');
        var text = $(this).attr('data-text');
        $('#' + ele).addClass('active');
        $('#' + text).addClass('active');
        $('#' + ele)[0].play();
    });

    $( '.link-menu' ).click(function() {
        $(this).addClass('active');
    });

    $('a[href*="#"]')
      // Remove links that don't actually link to anything
      .not('[href="#"]')
      .not('[href="#0"]')
      .click(function(event) {
        // On-page links
        if (
          location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '')
          &&
          location.hostname == this.hostname
        ) {
          // Figure out element to scroll to
          var target = $(this.hash);
          target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
          // Does a scroll target exist?
          if (target.length) {
            // Only prevent default if animation is actually gonna happen
            event.preventDefault();
            $('html, body').animate({
              scrollTop: target.offset().top
            }, 1000, function() {
              // Callback after animation
              // Must change focus!
              var $target = $(target);
              $target.focus();
              if ($target.is(":focus")) { // Checking if the target was focused
                return false;
              } else {
                $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
                $target.focus(); // Set focus again
              };
            });
          }
        }
      });

      

});
})(jQuery);

$(function(){
  $('#datepicker').datepicker();
});
