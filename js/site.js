var scrollPos;

// could not simply track the <body> due to webkit bug, hence the .body-scroll element

$('.body-scroll').scroll(function(){
  scrollPos = $('.body-scroll').scrollTop()
    console.log();
  $('.scroller').scrollLeft(scrollPos);
});
