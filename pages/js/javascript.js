if (screen.width > 1125) {
  $( document ).ready(function() {
    zoom_instagram ();
    zoom_behance ();
    zoom_vimeo ();
    load_pagepiling ();
    load_about_me ();
  });

  function zoom_instagram () {
    $(".instagram").mouseover(function(){
      $(".instagram").removeClass("unhovered");
      $(".instagram").addClass("hovered");
    });
    $(".instagram").mouseout(function(){
      $(".instagram").removeClass("hovered");
      $(".instagram").addClass("unhovered");
    });
  }

  function zoom_behance () {
    $(".behance").mouseover(function(){
      $(".behance").removeClass("unhovered01");
      $(".behance").addClass("hovered01");
    });
    $(".behance").mouseout(function(){
      $(".behance").removeClass("hovered01")
      $(".behance").addClass("unhovered01");
    });
  }

  function zoom_vimeo () {
    $(".vimeo").mouseover(function(){
      $(".vimeo").removeClass("unhovered");
      $(".vimeo").addClass("hovered");
    });
    $(".vimeo").mouseout(function(){
      $(".vimeo").removeClass("hovered")
      $(".vimeo").addClass("unhovered");
    });
  }

  function load_pagepiling () {
    $("#pagepiling").imagesLoaded( function() {
      $("#pagepiling").removeClass("hidden");
    });
  }

  function load_about_me () {
    $("#pic_me").imagesLoaded( function() {
      $("#pic_me").removeClass("hidden");
    });
  }
}

else {
  $( document ).ready(function() {
    load_pagepiling ();
    load_about_me ();
  });

  function load_pagepiling () {
    $("#pagepiling").imagesLoaded( function() {
      $("#pagepiling").removeClass("hidden");
    });
  }

  function load_about_me () {
    $("#pic_me").imagesLoaded( function() {
      $("#pic_me").removeClass("hidden");
    });
  }
}
