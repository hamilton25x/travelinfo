$(window).on('load', function() {
  $('.spinner-border').fadeOut()
  $('#preloader')
    .delay(350)
    .fadeOut()
})
$(function() {
  $('.famous-accordion').click(function(event) {
    if (event.target.id.split('-')[0] === 'button') {
      $('#collapse-item-1').attr(
        'src',
        'images/collapse-' + event.target.id.split('-')[1] + '-1.jpg'
      )
      $('#collapse-item-2').attr(
        'src',
        'images/collapse-' + event.target.id.split('-')[1] + '-2.jpg'
      )
    }
  })

  lightbox.option({
    wrapAround: true
  })

  $(window).scroll(function() {
    let position = $(this).scrollTop()
    console.log(position)
    if (position >= 800) {
      $('.gallery').addClass('change')
    } else {
      $('.gallery').removeClass('change')
    }
  })

  $('#select').change(function() {
    let sel = $(this).val()
    let len = $('.district').length
    for (let i = 0; i < len; i++) {
      if (
        sel ===
        $('.district')
          .eq(i)
          .text()
      ) {
        $('.cardcol')
          .eq(i)
          .removeClass('d-none')
      } else {
        $('.cardcol')
          .eq(i)
          .addClass('d-none')
      }
    }
  })
})
