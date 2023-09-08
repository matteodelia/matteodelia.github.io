$(document).ready(function() {
  load();
  cursor();
  change_mouse();
  open_vimeo();
  select_section();
});

function load() {
  setTimeout(function() {
    setTimeout(function() {
      $(".buffering").animate({
        top: "-100vh"
      }, 800);
    }, 1000);
    document.getElementById("V1").pause();
    document.getElementById("V2").pause();
    document.getElementById("V3").pause();
    document.getElementById("V4").pause();
    document.getElementById("V5").pause();
    document.getElementById("V6").pause();
    document.getElementById("V7").pause();
    document.getElementById("V8").pause();
    document.getElementById("V9").pause();
    document.getElementById("V10").pause();
    document.getElementById("V11").pause();
    document.getElementById("V12").pause();
    document.getElementById("V13").pause();
    document.getElementById("V14").pause();
    document.getElementById("V15").pause();
    document.getElementById("V1").currentTime = 0;
    document.getElementById("V2").currentTime = 0;
    document.getElementById("V3").currentTime = 0;
    document.getElementById("V4").currentTime = 0;
    document.getElementById("V5").currentTime = 0;
    document.getElementById("V6").currentTime = 0;
    document.getElementById("V7").currentTime = 0;
    document.getElementById("V8").currentTime = 0;
    document.getElementById("V9").currentTime = 0;
    document.getElementById("V10").currentTime = 0;
    document.getElementById("V11").currentTime = 0;
    document.getElementById("V12").currentTime = 0;
    document.getElementById("V13").currentTime = 0;
    document.getElementById("V14").currentTime = 0;
    document.getElementById("V15").currentTime = 0;
    document.getElementById("V1").play();
    $.scrollify.enable();
  }, 4500);
}

function cursor() {
  jQuery(document).ready(function() {

    var mouseX = 0,
      mouseY = 0;
    var xp = 0,
      yp = 0;
    var xp1 = 0,
      yp1 = 0;

    $(document).mousemove(function(e) {
      mouseX = e.pageX + 20;
      mouseY = e.pageY + 20;
    });

    setInterval(function() {
      xp += (mouseX - xp);
      yp += (mouseY - yp);
      xp1 += ((mouseX - xp1) / 1.5);
      yp1 += ((mouseY - yp1) / 1.5);
      $(".player").css({
        left: xp + 'px',
        top: yp + 'px'
      });
      $(".circle").css({
        left: xp1 + 'px',
        top: yp1 + 'px'
      });
    }, 20);

  });
}

function change_mouse() {
  $(".header").hover(
    function() {
      $("body").css("cursor", "auto");
      $(".cursor").animate({
        "opacity": "0"
      }, 10, 'swing');
    },
    function() {
      $("body").css("cursor", "none");
      $(".cursor").animate({
        "opacity": "1"
      }, 10, 'swing');
    }
  );
}

function open_vimeo() {
  $("#scrollify_section").on("click", function() {
    $(".vimeo_link").css("opacity", "1");
    player.requestFullscreen().then(function() {
      // the player entered fullscreen
    }).catch(function(error) {
      // an error occurred
    });
    player.setQuality('4k').then(function(quality) {
      // quality was successfully set
    }).catch(function(error) {
      switch (error.name) {
        case 'TypeError':
          // the quality selected is not valid
          break;

        default:
          // some other error occurred
          break;
      }
    });
    player.setCurrentTime(0).then(function(seconds) {
      // seconds = the actual time that the player seeked to
    }).catch(function(error) {
      switch (error.name) {
        case 'RangeError':
          // the time was less than 0 or greater than the video’s duration
          break;

        default:
          // some other error occurred
          break;
      }
    });
  });
  player.on('fullscreenchange', function(data) {
    player.getFullscreen().then(function(fullscreen) {
      if (fullscreen) {
        player.play();
      } else {
        $.scrollify.instantMove("#section1");
        player.pause();
        $(".vimeo_link").css("opacity", "0");
      }
    });
  });
}

function select_section() {
  var sezione = 1;
  jQuery(document).ready(function() {
    function resizeForm() {
      var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
      if (width > 1125) {
        $(".header_title").on("mouseover", function() {
          $("body").css("cursor", "pointer");
        });
        $(".music").on("mouseover", function() {
          $("body").css("cursor", "pointer");
          $(".selection_line").css("left", "41.5vw");
        });
        $(".adv").on("mouseover", function() {
          $("body").css("cursor", "pointer");
          $(".selection_line").css("left", "47.5vw");
        });
        $(".personal").on("mouseover", function() {
          $("body").css("cursor", "pointer");
          $(".selection_line").css("left", "53.5vw");
        });
        $(".instagram").on("mouseenter", function() {
          $(".contacts_container").css("transform", "rotateY(0deg)translate(0, -50%)");
          $(".vimeo").css("opacity", "0.5");
          $(".mail").css("opacity", "0.5");
          $(".vimeo_hover").css("display", "initial");
          $(".mail_hover").css("display", "initial");
        });
        $(".mail_hover").on("mouseenter", function() {
          $(".mail").css("opacity", "1");
        });
        $(".mail_hover").on("mouseleave", function() {
          $(".mail").css("opacity", "0.5");
        });
        $(".vimeo_hover").on("mouseenter", function() {
          $(".vimeo").css("opacity", "1");
        });
        $(".vimeo_hover").on("mouseleave", function() {
          $(".vimeo").css("opacity", "0.5");
        });
        $(".instagram").on("mouseenter", function() {
          $(".instagram").css("opacity", "1");
        });
        $(".instagram").on("mouseleave", function() {
          $(".instagram").css("opacity", "0.5");
        });
        $(".instagram_container").on("mouseleave", function() {
          $(".contacts_container").css("transform", "rotateY(90deg)translate(0, -50%)");
          $(".vimeo").css("opacity", "0");
          $(".mail").css("opacity", "0");
          $(".vimeo_hover").css("display", "none");
          $(".mail_hover").css("display", "none");
        });
      } else {

      }
    }
    window.onresize = resizeForm;
    resizeForm();
  });
  $(".music, .header_title").on("click", function() {
    $(".cursor").css("display", "initial");
    $(".music_content").removeClass("hidden");
    document.getElementById("V1").play();
    document.getElementById("V8").style.opacity = "1";
    document.getElementById("V9").style.opacity = "1";
    document.getElementById("V10").style.opacity = "1";
    document.getElementById("V11").style.opacity = "1";
    document.getElementById("V12").style.opacity = "1";
    document.getElementById("V13").style.opacity = "1";
    document.getElementById("V14").style.opacity = "1";
    document.getElementById("V15").style.opacity = "1";
    document.getElementById("V8").pause();
    document.getElementById("V9").pause();
    document.getElementById("V10").pause();
    document.getElementById("V11").pause();
    document.getElementById("V12").pause();
    document.getElementById("V13").pause();
    document.getElementById("V14").pause();
    document.getElementById("V15").pause();
    document.getElementById("V8").currentTime = 0;
    document.getElementById("V9").currentTime = 0;
    document.getElementById("V10").currentTime = 0;
    document.getElementById("V11").currentTime = 0;
    document.getElementById("V12").currentTime = 0;
    document.getElementById("V13").currentTime = 0;
    document.getElementById("V14").currentTime = 0;
    document.getElementById("V15").currentTime = 0;
    document.getElementById("scrollify_section").innerHTML =
      `
    <div class="section selected" data-section-name="section1">
			<div class="text">
				<p class="title">Gara 7: Ultimo tiro</p>
				<p class="subtitle">Johnny Marsiglia</p>
				<p class="description">Music Film</p>
				<p class="role">REGIA + EDITING</p>
			</div>
		</div>
		<div class="section" data-section-name="section2">
			<div class="text">
				<p class="title">La Furia</p>
				<p class="subtitle">Jake la Furia</p>
				<p class="description">Documentary</p>
				<p class="role">REGIA + EDITING</p>
			</div>
		</div>
		<div class="section" data-section-name="section3">
			<div class="text">
				<p class="title">Io Non Ho Paura</p>
				<p class="subtitle">Ernia</p>
				<p class="description">Documentary</p>
				<p class="role">EDITING</p>
			</div>
		</div>
		<div class="section" data-section-name="section4">
			<div class="text">
				<p class="title">Hamdulillah</p>
				<p class="subtitle">Abby 6ix</p>
				<p class="description">Videoclip</p>
				<p class="role">REGIA + EDITING</p>
			</div>
		</div>
		<div class="section" data-section-name="section5">
			<div class="text">
				<p class="title">Habitat Cielo</p>
				<p class="subtitle">Silent Bob</p>
				<p class="description">Album Teaser</p>
				<p class="role">REGIA + EDITING</p>
			</div>
		</div>
		<div class="section" data-section-name="section6">
			<div class="text">
				<p class="title">Verità</p>
				<p class="subtitle">Johana</p>
				<p class="description">Song Teaser</p>
				<p class="role">REGIA + EDITING</p>
			</div>
		</div>
		<div class="section" data-section-name="section7">
			<div class="text">
				<p class="title">Giorni Sbagliati</p>
				<p class="subtitle">Nashley</p>
				<p class="description">Videoclip</p>
				<p class="role">REGIA + EDITING</p>
			</div>
		</div>
    `;
    document.getElementById("current_page").innerHTML =
      `1`;
    document.getElementById("total_page").innerHTML =
      `7`;
    $(function() {
      $.scrollify({
        section: ".section",
        scrollbars: false,
        updateHash: false,
        before: function(index) {
          var video = document.getElementById('video');
          items = $('.section');
          item = $($('.section').get(index));

          items.removeClass('selected');
          item.addClass('selected');

          if (index === 0) {
            document.getElementById("current_page").innerHTML =
              "1";
            document.getElementById("V1").style.opacity = "1";
            document.getElementById("V1").play();
            player.loadVideo(841863277).then(function(id) {
              // the video successfully loaded
            }).catch(function(error) {
              switch (error.name) {
                case 'TypeError':
                  // the id was not a number
                  break;

                case 'PasswordError':
                  // the video is password-protected and the viewer needs to enter the
                  // password first
                  break;

                case 'PrivacyError':
                  // the video is password-protected or private
                  break;

                default:
                  // some other error occurred
                  break;
              }
            });
          }
          if (index === 1) {
            document.getElementById("current_page").innerHTML =
              "2";
            document.getElementById("V1").style.opacity = "0";
            document.getElementById("V2").style.opacity = "1";
            document.getElementById("V2").play();
            player.loadVideo(843876751).then(function(id) {
              // the video successfully loaded
            }).catch(function(error) {
              switch (error.name) {
                case 'TypeError':
                  // the id was not a number
                  break;

                case 'PasswordError':
                  // the video is password-protected and the viewer needs to enter the
                  // password first
                  break;

                case 'PrivacyError':
                  // the video is password-protected or private
                  break;

                default:
                  // some other error occurred
                  break;
              }
            });
          }
          if (index === 2) {
            document.getElementById("current_page").innerHTML =
              "3";
            document.getElementById("V2").style.opacity = "0";
            document.getElementById("V3").style.opacity = "1";
            document.getElementById("V3").play();
            player.loadVideo(861264157).then(function(id) {
              // the video successfully loaded
            }).catch(function(error) {
              switch (error.name) {
                case 'TypeError':
                  // the id was not a number
                  break;

                case 'PasswordError':
                  // the video is password-protected and the viewer needs to enter the
                  // password first
                  break;

                case 'PrivacyError':
                  // the video is password-protected or private
                  break;

                default:
                  // some other error occurred
                  break;
              }
            });
          }
          if (index === 3) {
            document.getElementById("current_page").innerHTML =
              "4";
            document.getElementById("V3").style.opacity = "0";
            document.getElementById("V4").style.opacity = "1";
            document.getElementById("V4").play();
            player.loadVideo(819906708).then(function(id) {
              // the video successfully loaded
            }).catch(function(error) {
              switch (error.name) {
                case 'TypeError':
                  // the id was not a number
                  break;

                case 'PasswordError':
                  // the video is password-protected and the viewer needs to enter the
                  // password first
                  break;

                case 'PrivacyError':
                  // the video is password-protected or private
                  break;

                default:
                  // some other error occurred
                  break;
              }
            });
          }
          if (index === 4) {
            document.getElementById("current_page").innerHTML =
              "5";
            document.getElementById("V4").style.opacity = "0";
            document.getElementById("V5").style.opacity = "1";
            document.getElementById("V5").play();
            player.loadVideo(813644789).then(function(id) {
              // the video successfully loaded
            }).catch(function(error) {
              switch (error.name) {
                case 'TypeError':
                  // the id was not a number
                  break;

                case 'PasswordError':
                  // the video is password-protected and the viewer needs to enter the
                  // password first
                  break;

                case 'PrivacyError':
                  // the video is password-protected or private
                  break;

                default:
                  // some other error occurred
                  break;
              }
            });
          }
          if (index === 5) {
            document.getElementById("current_page").innerHTML =
              "6";
            document.getElementById("V5").style.opacity = "0";
            document.getElementById("V6").style.opacity = "1";
            document.getElementById("V6").play();
            player.loadVideo(857898207).then(function(id) {
              // the video successfully loaded
            }).catch(function(error) {
              switch (error.name) {
                case 'TypeError':
                  // the id was not a number
                  break;

                case 'PasswordError':
                  // the video is password-protected and the viewer needs to enter the
                  // password first
                  break;

                case 'PrivacyError':
                  // the video is password-protected or private
                  break;

                default:
                  // some other error occurred
                  break;
              }
            });
          }
          if (index === 6) {
            document.getElementById("current_page").innerHTML =
              "7";
            document.getElementById("V6").style.opacity = "0";
            document.getElementById("V7").play();
            player.loadVideo(856899013).then(function(id) {
              // the video successfully loaded
            }).catch(function(error) {
              switch (error.name) {
                case 'TypeError':
                  // the id was not a number
                  break;

                case 'PasswordError':
                  // the video is password-protected and the viewer needs to enter the
                  // password first
                  break;

                case 'PrivacyError':
                  // the video is password-protected or private
                  break;

                default:
                  // some other error occurred
                  break;
              }
            });
          }
        },
        after: function(index) {
          if (index === 0) {
            document.getElementById("V2").style.opacity = "1";
            document.getElementById("V3").style.opacity = "1";
            document.getElementById("V4").style.opacity = "1";
            document.getElementById("V5").style.opacity = "1";
            document.getElementById("V6").style.opacity = "1";
            document.getElementById("V2").pause();
            document.getElementById("V2").currentTime = 0;
          }
          if (index === 1) {
            document.getElementById("V1").pause();
            document.getElementById("V1").currentTime = 0;
            document.getElementById("V3").pause();
            document.getElementById("V3").currentTime = 0;
          }
          if (index === 2) {
            document.getElementById("V2").pause();
            document.getElementById("V2").currentTime = 0;
            document.getElementById("V4").pause();
            document.getElementById("V4").currentTime = 0;
          }
          if (index === 3) {
            document.getElementById("V3").pause();
            document.getElementById("V3").currentTime = 0;
            document.getElementById("V5").pause();
            document.getElementById("V5").currentTime = 0;
          }
          if (index === 4) {
            document.getElementById("V4").pause();
            document.getElementById("V4").currentTime = 0;
            document.getElementById("V6").pause();
            document.getElementById("V6").currentTime = 0;
          }
          if (index === 5) {
            document.getElementById("V5").pause();
            document.getElementById("V5").currentTime = 0;
            document.getElementById("V7").pause();
            document.getElementById("V7").currentTime = 0;
          }
          if (index === 6) {
            document.getElementById("V6").pause();
            document.getElementById("V6").currentTime = 0;
          }
        },
      });
    });
    player.loadVideo(841863277).then(function(id) {
      // the video successfully loaded
    }).catch(function(error) {
      switch (error.name) {
        case 'TypeError':
          // the id was not a number
          break;

        case 'PasswordError':
          // the video is password-protected and the viewer needs to enter the
          // password first
          break;

        case 'PrivacyError':
          // the video is password-protected or private
          break;

        default:
          // some other error occurred
          break;
      }
    });
    $.scrollify.instantMove("#section1");
    $(".music").css("opacity", "1");
    $(".adv").css("opacity", "0.3");
    $(".personal").css("opacity", "0.3");
    $(".contacts").css("opacity", "0.3");
    $(".selection_line").css("left", "41.5vw");
    sezione = 1;
  });
  $(".adv").on("click", function() {
    $(".cursor").css("display", "initial");
    $(".adv_content").removeClass("hidden");
    $(".music_content").addClass("hidden");
    document.getElementById("V8").play();
    document.getElementById("V1").style.opacity = "1";
    document.getElementById("V2").style.opacity = "1";
    document.getElementById("V3").style.opacity = "1";
    document.getElementById("V4").style.opacity = "1";
    document.getElementById("V5").style.opacity = "1";
    document.getElementById("V6").style.opacity = "1";
    document.getElementById("V7").style.opacity = "1";
    document.getElementById("V13").style.opacity = "1";
    document.getElementById("V14").style.opacity = "1";
    document.getElementById("V15").style.opacity = "1";
    document.getElementById("V1").pause();
    document.getElementById("V2").pause();
    document.getElementById("V3").pause();
    document.getElementById("V4").pause();
    document.getElementById("V5").pause();
    document.getElementById("V6").pause();
    document.getElementById("V7").pause();
    document.getElementById("V13").pause();
    document.getElementById("V14").pause();
    document.getElementById("V15").pause();
    document.getElementById("V1").currentTime = 0;
    document.getElementById("V2").currentTime = 0;
    document.getElementById("V3").currentTime = 0;
    document.getElementById("V4").currentTime = 0;
    document.getElementById("V5").currentTime = 0;
    document.getElementById("V6").currentTime = 0;
    document.getElementById("V7").currentTime = 0;
    document.getElementById("V13").currentTime = 0;
    document.getElementById("V14").currentTime = 0;
    document.getElementById("V15").currentTime = 0;
    document.getElementById("scrollify_section").innerHTML =
      `
    <div class="section selected" data-section-name="section1">
			<div class="text">
				<p class="title">Venture Out Together</p>
				<p class="subtitle">Timberland</p>
				<p class="description">Commercial</p>
        <p class="role">EDITING</p>
			</div>
		</div>
    <div class="section" data-section-name="section2">
			<div class="text">
				<p class="title">Italy Home Kit 22/23</p>
				<p class="subtitle">Puma</p>
				<p class="description">Commercial</p>
        <p class="role">EDITING</p>
			</div>
		</div>
    <div class="section" data-section-name="section3">
			<div class="text">
				<p class="title">In Process: xxx</p>
				<p class="subtitle">Stòffa</p>
				<p class="description">Web Stories</p>
        <p class="role">REGIA + EDITING</p>
			</div>
		</div>
    <div class="section" data-section-name="section4">
			<div class="text">
				<p class="title">Antonio Rodriguez</p>
				<p class="subtitle">Zucchetti Kos</p>
				<p class="description">Interview</p>
        <p class="role">REGIA + EDITING</p>
			</div>
		</div>
    <div class="section" data-section-name="section5">
			<div class="text">
				<p class="title">In Process: Hand Framed Sweaters</p>
				<p class="subtitle">Stòffa</p>
				<p class="description">Web Stories</p>
        <p class="role">REGIA + EDITING</p>
			</div>
		</div>
    `;
    document.getElementById("current_page").innerHTML =
      `1`;
    document.getElementById("total_page").innerHTML =
      `5`;
    $(function() {
      $.scrollify({
        section: ".section",
        scrollbars: false,
        updateHash: false,
        before: function(index) {
          var video = document.getElementById('video');
          items = $('.section');
          item = $($('.section').get(index));

          items.removeClass('selected');
          item.addClass('selected');

          if (index === 0) {
            document.getElementById("current_page").innerHTML =
              "1";
            document.getElementById("V8").style.opacity = "1";
            document.getElementById("V8").play();
            player.loadVideo(841863277).then(function(id) {
              // the video successfully loaded
            }).catch(function(error) {
              switch (error.name) {
                case 'TypeError':
                  // the id was not a number
                  break;

                case 'PasswordError':
                  // the video is password-protected and the viewer needs to enter the
                  // password first
                  break;

                case 'PrivacyError':
                  // the video is password-protected or private
                  break;

                default:
                  // some other error occurred
                  break;
              }
            });
          }
          if (index === 1) {
            document.getElementById("current_page").innerHTML =
              "2";
            document.getElementById("V8").style.opacity = "0";
            document.getElementById("V9").style.opacity = "1";
            document.getElementById("V9").play();
            player.loadVideo(843876751).then(function(id) {
              // the video successfully loaded
            }).catch(function(error) {
              switch (error.name) {
                case 'TypeError':
                  // the id was not a number
                  break;

                case 'PasswordError':
                  // the video is password-protected and the viewer needs to enter the
                  // password first
                  break;

                case 'PrivacyError':
                  // the video is password-protected or private
                  break;

                default:
                  // some other error occurred
                  break;
              }
            });
          }
          if (index === 2) {
            document.getElementById("current_page").innerHTML =
              "3";
            document.getElementById("V9").style.opacity = "0";
            document.getElementById("V10").style.opacity = "1";
            document.getElementById("V10").play();
            player.loadVideo(861264157).then(function(id) {
              // the video successfully loaded
            }).catch(function(error) {
              switch (error.name) {
                case 'TypeError':
                  // the id was not a number
                  break;

                case 'PasswordError':
                  // the video is password-protected and the viewer needs to enter the
                  // password first
                  break;

                case 'PrivacyError':
                  // the video is password-protected or private
                  break;

                default:
                  // some other error occurred
                  break;
              }
            });
          }
          if (index === 3) {
            document.getElementById("current_page").innerHTML =
              "4";
            document.getElementById("V10").style.opacity = "0";
            document.getElementById("V11").style.opacity = "1";
            document.getElementById("V11").play();
            player.loadVideo(819906708).then(function(id) {
              // the video successfully loaded
            }).catch(function(error) {
              switch (error.name) {
                case 'TypeError':
                  // the id was not a number
                  break;

                case 'PasswordError':
                  // the video is password-protected and the viewer needs to enter the
                  // password first
                  break;

                case 'PrivacyError':
                  // the video is password-protected or private
                  break;

                default:
                  // some other error occurred
                  break;
              }
            });
          }
          if (index === 4) {
            document.getElementById("current_page").innerHTML =
              "5";
            document.getElementById("V11").style.opacity = "0";
            document.getElementById("V12").play();
            player.loadVideo(813644789).then(function(id) {
              // the video successfully loaded
            }).catch(function(error) {
              switch (error.name) {
                case 'TypeError':
                  // the id was not a number
                  break;

                case 'PasswordError':
                  // the video is password-protected and the viewer needs to enter the
                  // password first
                  break;

                case 'PrivacyError':
                  // the video is password-protected or private
                  break;

                default:
                  // some other error occurred
                  break;
              }
            });
          }
        },
        after: function(index) {
          if (index === 0) {
            document.getElementById("V9").style.opacity = "1";
            document.getElementById("V10").style.opacity = "1";
            document.getElementById("V11").style.opacity = "1";
            document.getElementById("V12").style.opacity = "1";
            document.getElementById("V9").pause();
            document.getElementById("V9").currentTime = 0;
          }
          if (index === 1) {
            document.getElementById("V8").pause();
            document.getElementById("V8").currentTime = 0;
            document.getElementById("V10").pause();
            document.getElementById("V10").currentTime = 0;
          }
          if (index === 2) {
            document.getElementById("V9").pause();
            document.getElementById("V9").currentTime = 0;
            document.getElementById("V11").pause();
            document.getElementById("V11").currentTime = 0;
          }
          if (index === 3) {
            document.getElementById("V10").pause();
            document.getElementById("V10").currentTime = 0;
            document.getElementById("V12").pause();
            document.getElementById("V12").currentTime = 0;
          }
          if (index === 4) {
            document.getElementById("V11").pause();
            document.getElementById("V11").currentTime = 0;
          }
        },
      });
    });
    player.loadVideo(862051371).then(function(id) {
      // the video successfully loaded
    }).catch(function(error) {
      switch (error.name) {
        case 'TypeError':
          // the id was not a number
          break;

        case 'PasswordError':
          // the video is password-protected and the viewer needs to enter the
          // password first
          break;

        case 'PrivacyError':
          // the video is password-protected or private
          break;

        default:
          // some other error occurred
          break;
      }
    });
    $.scrollify.instantMove("#section1");
    $(".music").css("opacity", "0.3");
    $(".adv").css("opacity", "1");
    $(".personal").css("opacity", "0.3");
    $(".contacts").css("opacity", "0.3");
    $(".selection_line").css("left", "47.5vw");
    sezione = 2;
  });
  $(".personal").on("click", function() {
    $(".cursor").css("display", "initial");
    $(".music_content, .adv_content").addClass("hidden");
    document.getElementById("V13").play();
    document.getElementById("V1").style.opacity = "1";
    document.getElementById("V2").style.opacity = "1";
    document.getElementById("V3").style.opacity = "1";
    document.getElementById("V4").style.opacity = "1";
    document.getElementById("V5").style.opacity = "1";
    document.getElementById("V6").style.opacity = "1";
    document.getElementById("V7").style.opacity = "1";
    document.getElementById("V8").style.opacity = "1";
    document.getElementById("V9").style.opacity = "1";
    document.getElementById("V10").style.opacity = "1";
    document.getElementById("V11").style.opacity = "1";
    document.getElementById("V12").style.opacity = "1";
    document.getElementById("V1").pause();
    document.getElementById("V2").pause();
    document.getElementById("V3").pause();
    document.getElementById("V4").pause();
    document.getElementById("V5").pause();
    document.getElementById("V6").pause();
    document.getElementById("V7").pause();
    document.getElementById("V8").pause();
    document.getElementById("V9").pause();
    document.getElementById("V10").pause();
    document.getElementById("V11").pause();
    document.getElementById("V12").pause();
    document.getElementById("V1").currentTime = 0;
    document.getElementById("V2").currentTime = 0;
    document.getElementById("V3").currentTime = 0;
    document.getElementById("V4").currentTime = 0;
    document.getElementById("V5").currentTime = 0;
    document.getElementById("V6").currentTime = 0;
    document.getElementById("V7").currentTime = 0;
    document.getElementById("V8").currentTime = 0;
    document.getElementById("V9").currentTime = 0;
    document.getElementById("V10").currentTime = 0;
    document.getElementById("V11").currentTime = 0;
    document.getElementById("V12").currentTime = 0;
    document.getElementById("scrollify_section").innerHTML =
      `
    <div class="section selected" data-section-name="section1">
			<div class="text">
				<p class="title">confessioni a una madre</p>
				<p class="subtitle">2022</p>
				<p class="description">Short Film</p>
        <p class="role">REGIA + EDITING</p>
			</div>
		</div>
		<div class="section" data-section-name="section2">
			<div class="text">
				<p class="title">Einfall</p>
				<p class="subtitle">2021</p>
				<p class="description">Short Film</p>
        <p class="role">REGIA + EDITING</p>
			</div>
		</div>
    <div class="section" data-section-name="section3">
			<div class="text">
				<p class="title">To be, or not to be.</p>
				<p class="subtitle">2019</p>
				<p class="description">Spec Commercial</p>
        <p class="role">REGIA + EDITING</p>
			</div>
		</div>
    `;
    document.getElementById("current_page").innerHTML =
      `1`;
    document.getElementById("total_page").innerHTML =
      `3`;
    $(function() {
      $.scrollify({
        section: ".section",
        scrollbars: false,
        updateHash: false,
        before: function(index) {
          var video = document.getElementById('video');
          items = $('.section');
          item = $($('.section').get(index));

          items.removeClass('selected');
          item.addClass('selected');

          if (index === 0) {
            document.getElementById("current_page").innerHTML =
              "1";
            document.getElementById("V13").style.opacity = "1";
            document.getElementById("V13").play();
            player.loadVideo(841863277).then(function(id) {
              // the video successfully loaded
            }).catch(function(error) {
              switch (error.name) {
                case 'TypeError':
                  // the id was not a number
                  break;

                case 'PasswordError':
                  // the video is password-protected and the viewer needs to enter the
                  // password first
                  break;

                case 'PrivacyError':
                  // the video is password-protected or private
                  break;

                default:
                  // some other error occurred
                  break;
              }
            });
          }
          if (index === 1) {
            document.getElementById("current_page").innerHTML =
              "2";
            document.getElementById("V13").style.opacity = "0";
            document.getElementById("V14").style.opacity = "1";
            document.getElementById("V14").play();
            player.loadVideo(843876751).then(function(id) {
              // the video successfully loaded
            }).catch(function(error) {
              switch (error.name) {
                case 'TypeError':
                  // the id was not a number
                  break;

                case 'PasswordError':
                  // the video is password-protected and the viewer needs to enter the
                  // password first
                  break;

                case 'PrivacyError':
                  // the video is password-protected or private
                  break;

                default:
                  // some other error occurred
                  break;
              }
            });
          }
          if (index === 2) {
            document.getElementById("current_page").innerHTML =
              "3";
            document.getElementById("V14").style.opacity = "0";
            document.getElementById("V15").play();
            player.loadVideo(861264157).then(function(id) {
              // the video successfully loaded
            }).catch(function(error) {
              switch (error.name) {
                case 'TypeError':
                  // the id was not a number
                  break;

                case 'PasswordError':
                  // the video is password-protected and the viewer needs to enter the
                  // password first
                  break;

                case 'PrivacyError':
                  // the video is password-protected or private
                  break;

                default:
                  // some other error occurred
                  break;
              }
            });
          }
        },
        after: function(index) {
          if (index === 0) {
            document.getElementById("V14").style.opacity = "1";
            document.getElementById("V15").style.opacity = "1";
            document.getElementById("V14").pause();
            document.getElementById("V14").currentTime = 0;
          }
          if (index === 1) {
            document.getElementById("V13").pause();
            document.getElementById("V13").currentTime = 0;
            document.getElementById("V15").pause();
            document.getElementById("V15").currentTime = 0;
          }
          if (index === 2) {
            document.getElementById("V14").pause();
            document.getElementById("V14").currentTime = 0;
          }
        },
      });
    });
    player.loadVideo(737283841).then(function(id) {
      // the video successfully loaded
    }).catch(function(error) {
      switch (error.name) {
        case 'TypeError':
          // the id was not a number
          break;

        case 'PasswordError':
          // the video is password-protected and the viewer needs to enter the
          // password first
          break;

        case 'PrivacyError':
          // the video is password-protected or private
          break;

        default:
          // some other error occurred
          break;
      }
    });
    $.scrollify.instantMove("#section1");
    $(".music").css("opacity", "0.3");
    $(".adv").css("opacity", "0.3");
    $(".personal").css("opacity", "1");
    $(".contacts").css("opacity", "0.3");
    $(".selection_line").css("left", "53.5vw");
    sezione = 3;
  });
  $(".header_title, .header ul").on("mouseleave", function() {
    $("body").css("cursor", "default");
    if (sezione == 1) {
      $(".selection_line").css("left", "41.5vw");
    }
    if (sezione == 2) {
      $(".selection_line").css("left", "47.5vw");
    }
    if (sezione == 3) {
      $(".selection_line").css("left", "53.5vw");
    }
  });
  $(".header").on("mouseleave", function() {
    $("body").css("cursor", "none");
  });
}
