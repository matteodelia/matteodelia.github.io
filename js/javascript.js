$(document).ready(function() {
  setTimeout(function() {
    $(".loader video").css("opacity", "1");
  }, 800);
  mobile_src();
  load();
  cursor();
  change_mouse();
  open_vimeo();
  select_section();
  credits();
});

function mobile_src() {
  var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
  if (width < 1200) {
    document.getElementById("video_container").innerHTML =
      `
    <img src="img/personal/tobeornottobe.jpg" class="video" id="V17">
    <img src="img/personal/einfall.jpg" class="video" id="V16">
    <img src="img/personal/confessioni.jpg" class="video" id="V15">
    <img src="img/brand/francia.jpg" class="video adv_content" id="V14">
    <img src="img/brand/mango_home.jpg" class="video adv_content" id="V13">
    <img src="img/brand/puma.jpg" class="video adv_content" id="V12">
    <img src="img/brand/mango_man.jpg" class="video adv_content" id="V11">
    <img src="img/brand/timberland.jpg" class="video adv_content" id="V10">
    <img src="img/brand/stoffa_lookbook.jpg" class="video adv_content" id="V9">
    <img src="img/documentary/iononhopaura.jpg" class="video documentary_content" id="V8">
    <img src="img/documentary/lafuria.jpg" class="video documentary_content" id="V7">
    <img src="img/music/giornoenotte.jpg" class="video music_content" id="V6">
    <img src="img/music/prime.jpg" class="video music_content" id="V5">
    <img src="img/music/habitatcielo.jpg" class="video music_content" id="V4">
    <img src="img/music/chilometri.jpg" class="video music_content" id="V3">
    <img src="img/music/gara7.jpg" class="video music_content" id="V2">
    <img src="img/music/balaclava.jpg" class="video music_content" id="V1">
    `;
  } else {
    document.getElementById("video_container").innerHTML =
      `
    <video src="img/personal/tobeornottobe.mp4" type="video/mp4" class="video" id="V17" preload="auto" pause loop muted playsinline></video>
		<video src="img/personal/einfall.mp4" type="video/mp4" class="video" id="V16" preload="auto" pause loop muted playsinline></video>
		<video src="img/personal/confessioni.mp4" type="video/mp4" class="video" id="V15" preload="auto" pause loop muted playsinline></video>
    <video src="img/brand/francia.mp4" type="video/mp4" class="video adv_content" id="V14" preload="auto" pause loop muted playsinline></video>
		<video src="img/brand/mango_home.mp4" type="video/mp4" class="video adv_content" id="V13" preload="auto" pause loop muted playsinline></video>
		<video src="img/brand/puma.mp4" type="video/mp4" class="video adv_content" id="V12" preload="auto" pause loop muted playsinline></video>
    <video src="img/brand/mango_man.mp4" type="video/mp4" class="video adv_content" id="V11" preload="auto" pause loop muted playsinline></video>
		<video src="img/brand/timberland.mp4" type="video/mp4" class="video adv_content" id="V10" preload="auto" pause loop muted playsinline></video>
    <video src="img/brand/stoffa_lookbook.mp4" type="video/mp4" class="video adv_content" id="V9" preload="auto" pause loop muted playsinline></video>
    <video src="img/documentary/iononhopaura.mp4" type="video/mp4" class="video documentary_content" id="V8" preload="auto" pause loop muted playsinline></video>
    <video src="img/documentary/lafuria.mp4" type="video/mp4" class="video documentary_content" id="V7" preload="auto" pause loop muted playsinline></video>
    <video src="img/music/giornoenotte.mp4" type="video/mp4" class="video music_content" id="V6" preload="auto" pause loop muted playsinline></video>
    <video src="img/music/prime.mp4" type="video/mp4" class="video music_content" id="V5" preload="auto" pause loop muted playsinline></video>
		<video src="img/music/habitatcielo.mp4" type="video/mp4" class="video music_content" id="V4" preload="auto" pause loop muted playsinline></video>
		<video src="img/music/chilometri.mp4" type="video/mp4" class="video music_content" id="V3" preload="auto" pause loop muted playsinline></video>
    <video src="img/music/gara7.mp4" type="video/mp4" class="video music_content" id="V2" preload="auto" pause loop muted playsinline></video>
		<video src="img/music/balaclava.mp4" type="video/mp4" class="video music_content" id="V1" preload="auto" pause loop muted playsinline></video>
    `;
  }
}

function load() {
  setTimeout(function() {
    if (document.getElementById("V1").tagName == "VIDEO") {
      document.getElementById("V1").play();
    };
    var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
    if (width < 1200) {
      $(".loader").animate({
        top: "-100dvh"
      }, 800);
    } else {
      $(".loader").animate({
        top: "-100vh"
      }, 800);
    }
  }, 7000);
  setTimeout(function() {
    $.scrollify.enable();
  }, 7500);
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
      }
    });
  });
}

function select_section() {
  var sezione = 1;
  jQuery(document).ready(function() {
    function resizeForm() {
      var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
      if (width > 1200) {
        $(".header_title").on("mouseover", function() {
          $("body").css("cursor", "pointer");
        });
        $(".music").on("mouseover", function() {
          $("body").css("cursor", "pointer");
          $(".selection_line").css("left", "36.5vw");
        });
        $(".documentary").on("mouseover", function() {
          $("body").css("cursor", "pointer");
          $(".selection_line").css("left", "43.5vw");
        });
        $(".adv").on("mouseover", function() {
          $("body").css("cursor", "pointer");
          $(".selection_line").css("left", "50.5vw");
        });
        $(".personal").on("mouseover", function() {
          $("body").css("cursor", "pointer");
          $(".selection_line").css("left", "57.5vw");
        });
        $(".mail").on("mouseenter", function() {
          $(".contacts_container_image").css("transform", "rotateY(0deg)translate(0, -50%)");
          $(".vimeo").css("opacity", "0.5");
          $(".instagram").css("opacity", "0.5");
          $(".vimeo_hover").css("display", "initial");
          $(".instagram_hover").css("display", "initial");
          $(".mail").css("opacity", "1");
        });
        $(".instagram_hover").on("mouseenter", function() {
          $(".instagram").css("opacity", "1");
        });
        $(".instagram_hover").on("mouseleave", function() {
          $(".instagram").css("opacity", "0.5");
        });
        $(".vimeo_hover").on("mouseenter", function() {
          $(".vimeo").css("opacity", "1");
        });
        $(".vimeo_hover").on("mouseleave", function() {
          $(".vimeo").css("opacity", "0.5");
        });
        $(".mail").on("mouseleave", function() {
          $(".mail").css("opacity", "0.5");
        });
        $(".contacts_container").on("mouseleave", function() {
          $(".contacts_container_image").css("transform", "rotateY(90deg)translate(0, -50%)");
          $(".vimeo").css("opacity", "0");
          $(".instagram").css("opacity", "0");
          $(".vimeo_hover").css("display", "none");
          $(".instagram_hover").css("display", "none");
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
    if (document.getElementById("V1").tagName == "VIDEO") {
      document.getElementById("V1").play();
      document.getElementById("V7").pause();
      document.getElementById("V8").pause();
      document.getElementById("V9").pause();
      document.getElementById("V10").pause();
      document.getElementById("V11").pause();
      document.getElementById("V12").pause();
      document.getElementById("V13").pause();
      document.getElementById("V14").pause();
      document.getElementById("V15").pause();
      document.getElementById("V16").pause();
      document.getElementById("V17").pause();
      document.getElementById("V7").currentTime = 0;
      document.getElementById("V8").currentTime = 0;
      document.getElementById("V9").currentTime = 0;
      document.getElementById("V10").currentTime = 0;
      document.getElementById("V11").currentTime = 0;
      document.getElementById("V12").currentTime = 0;
      document.getElementById("V13").currentTime = 0;
      document.getElementById("V14").currentTime = 0;
      document.getElementById("V15").currentTime = 0;
      document.getElementById("V16").currentTime = 0;
      document.getElementById("V17").currentTime = 0;
    } else {};
    document.getElementById("V7").style.opacity = "1";
    document.getElementById("V8").style.opacity = "1";
    document.getElementById("V9").style.opacity = "1";
    document.getElementById("V10").style.opacity = "1";
    document.getElementById("V11").style.opacity = "1";
    document.getElementById("V12").style.opacity = "1";
    document.getElementById("V13").style.opacity = "1";
    document.getElementById("V14").style.opacity = "1";
    document.getElementById("V15").style.opacity = "1";
    document.getElementById("V16").style.opacity = "1";
    document.getElementById("V17").style.opacity = "1";
    document.getElementById("scrollify_section").innerHTML =
      `
      <div class="section selected" data-section-name="section1">
      <div class="credits_background"></div>
  			<div class="text">
  				<p class="title">Angelo Balaclava</p>
  				<p class="subtitle">Silent Bob</p>
  				<p class="description">Album Trailer</p>
          <p class="role">
  					regia @98matteodelia<br>
  					dop @jacopo_ambroggio<br>
  					executive producer @andreayu__<br>
  					producer @irenezaccarini<br>
  					assistant director @riccardosabbattini<br>
  					1ac @_emmamariano_<br>
  					gaffer @jacopolamperti<br>
  					bestboy @amna_shida<br>
  					elettrico @raffaelloparodi.mp4<br>
  					operatore steady @martinoilacqua<br>
  					stylist @emmabrusco<br>
  					mua @mariannamuaa<br>
  					addestratore cane @movie.dog<br>
  					editor @98matteodelia<br>
  					post production + vfx @marco_pericoo<br>
  					color grading @mattia.saggiomo<br>
  					sound design @agit.utlu<br>
  					starring @loganmonterobaez + @matildeconsoli + @martin_francisco_montero + @tommaso.vecce + @berlinerinmilan + @justemaa_ + @mattiacanepazzo + @gabbro_2002 + @federicocavallari_ + @alee.flv + @giacomofeher + @avoltebrillo + @liam_devecchi
  				</p>
  			</div>
  		</div>
      <div class="section" data-section-name="section2">
      <div class="credits_background"></div>
  			<div class="text">
  				<p class="title">Gara 7: Ultimo tiro</p>
  				<p class="subtitle">Johnny Marsiglia</p>
  				<p class="description">Music Film</p>
  				<p class="role">
  					regia @98matteodelia<br>
  					dop @mirkosalcia<br>
  					executive producer @endrikalthi<br>
  					producer @francescareadiamond<br>
  					1ac @reliativo.mp4 + @giulio__rossi<br>
  					elettrico @davide__castagno<br>
  					camera car gaffer @jacopolamperti<br>
  					color @sorbinilorenzo<br>
  					vfx @omtode<br>
  					starring @yu.humm + @de_la_cruz_kevin_prince_ + Norah De Leo
  				</p>
  			</div>
  		</div>
      <div class="section" data-section-name="section3">
      <div class="credits_background"></div>
  			<div class="text">
  				<p class="title">Chilometri</p>
  				<p class="subtitle">Q40</p>
  				<p class="description">Videoclip</p>
  				<p class="role">
  					regia @98matteodelia<br>
  					dop @ale_luisi<br>
  					executive producer @endrikalthi<br>
  					producer @francescareadiamond<br>
  					1ac @zambo.mov<br>
  					elettrico @chri.manzio<br>
  					vfx @marco_pericoo<br>
  					fotografo @mattia_saba_<br>
  					grafiche @lorenzo_crippa_
  				</p>
  			</div>
  		</div>
  		<div class="section" data-section-name="section4">
      <div class="credits_background"></div>
  			<div class="text">
  				<p class="title">Habitat Cielo</p>
  				<p class="subtitle">Silent Bob</p>
  				<p class="description">Album Teaser</p>
  				<p class="role">
  					regia @98matteodelia<br>
  					dop + color @sorbinilorenzo<br>
  					fotografo @ynzloz<br>
  					direzione artistica @98matteodelia + @marco_pericoo
  				</p>
  			</div>
  		</div>
      <div class="section" data-section-name="section5">
  		<div class="credits_background"></div>
  			<div class="text">
  				<p class="title">Prime</p>
  				<p class="subtitle">Johnny Marsiglia</p>
  				<p class="description">Videoclip</p>
  				<p class="role">
  					regia @98matteodelia<br>
  					dop @federico.lomba<br>
  					executive producer @endrikalthi<br>
  					producer @francescareadiamond<br>
  					1ac @davide__castagno<br>
  					montaggio @fede.summo<br>
  					colorist @federico.lomba<br>
  					attori - @antodiecidue + @byisasoz + @_wes_____ + @prince_obeng_ghanaboy + Liam Marley Obeng + @lattemiele_ + @andre_tafel
  				</p>
  			</div>
  		</div>
  		<div class="section" data-section-name="section6">
  		<div class="credits_background"></div>
  			<div class="text">
  				<p class="title">Giorno e Notte</p>
  				<p class="subtitle">Q40</p>
  				<p class="description">Videoclip</p>
  				<p class="role">
  					regia @98matteodelia<br>
  					dop @ale_luisi<br>
  					executive producer @endrikalthi<br>
  					producer @francescareadiamond<br>
  					1ac @doziomatt + @zambo.mov<br>
  					operatore mini dv @_dis.astrid<br>
  					montaggio @fede.summo<br>
  					fotografo @andre_tafel<br>
  					grafiche @lorenzo_crippa_
  				</p>
  			</div>
  		</div>
    `;
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
            if (document.getElementById("V1").tagName == "VIDEO") {
              document.getElementById("V1").play();
            } else {};
            player.loadVideo(1065696659).then(function(id) {
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
            var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
            if (width < 1200) {
              $(".exit_credits").css("display", "none");
              $(".credits_background").css("display", "none");
              $(".description").css("opacity", "1");
              $(".role").css("opacity", "0");
              $(".credits_background").css("opacity", "0");
              $("#expand").css("display", "initial");
              $(".credits_line").css("width", "1.5dvh");
            }
          }
          if (index === 1) {
            document.getElementById("current_page").innerHTML =
              "2";
            document.getElementById("V1").style.opacity = "0";
            document.getElementById("V2").style.opacity = "1";
            if (document.getElementById("V2").tagName == "VIDEO") {
              document.getElementById("V2").play();
            } else {};
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
            var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
            if (width < 1200) {
              $(".exit_credits").css("display", "none");
              $(".credits_background").css("display", "none");
              $(".description").css("opacity", "1");
              $(".role").css("opacity", "0");
              $(".credits_background").css("opacity", "0");
              $("#expand").css("display", "initial");
              $(".credits_line").css("width", "1.5dvh");
            }
          }
          if (index === 2) {
            document.getElementById("current_page").innerHTML =
              "3";
            document.getElementById("V2").style.opacity = "0";
            document.getElementById("V3").style.opacity = "1";
            if (document.getElementById("V3").tagName == "VIDEO") {
              document.getElementById("V3").play();
            } else {};
            player.loadVideo(918010384).then(function(id) {
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
            var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
            if (width < 1200) {
              $(".exit_credits").css("display", "none");
              $(".credits_background").css("display", "none");
              $(".description").css("opacity", "1");
              $(".role").css("opacity", "0");
              $(".credits_background").css("opacity", "0");
              $("#expand").css("display", "initial");
              $(".credits_line").css("width", "1.5dvh");
            }
          }
          if (index === 3) {
            document.getElementById("current_page").innerHTML =
              "4";
            document.getElementById("V3").style.opacity = "0";
            document.getElementById("V4").style.opacity = "1";
            if (document.getElementById("V4").tagName == "VIDEO") {
              document.getElementById("V4").play();
            } else {};
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
            var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
            if (width < 1200) {
              $(".exit_credits").css("display", "none");
              $(".credits_background").css("display", "none");
              $(".description").css("opacity", "1");
              $(".role").css("opacity", "0");
              $(".credits_background").css("opacity", "0");
              $("#expand").css("display", "initial");
              $(".credits_line").css("width", "1.5dvh");
            }
          }
          if (index === 4) {
            document.getElementById("current_page").innerHTML =
              "5";
            document.getElementById("V4").style.opacity = "0";
            document.getElementById("V5").style.opacity = "1";
            if (document.getElementById("V5").tagName == "VIDEO") {
              document.getElementById("V5").play();
            } else {};
            player.loadVideo(873459501).then(function(id) {
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
            var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
            if (width < 1200) {
              $(".exit_credits").css("display", "none");
              $(".credits_background").css("display", "none");
              $(".description").css("opacity", "1");
              $(".role").css("opacity", "0");
              $(".credits_background").css("opacity", "0");
              $("#expand").css("display", "initial");
              $(".credits_line").css("width", "1.5dvh");
            }
          }
          if (index === 5) {
            document.getElementById("current_page").innerHTML =
              "6";
            document.getElementById("V5").style.opacity = "0";
            if (document.getElementById("V6").tagName == "VIDEO") {
              document.getElementById("V6").play();
            } else {};
            player.loadVideo(916233885).then(function(id) {
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
            var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
            if (width < 1200) {
              $(".exit_credits").css("display", "none");
              $(".credits_background").css("display", "none");
              $(".description").css("opacity", "1");
              $(".role").css("opacity", "0");
              $(".credits_background").css("opacity", "0");
              $("#expand").css("display", "initial");
              $(".credits_line").css("width", "1.5dvh");
            }
          }
        },
        after: function(index) {
          if (index === 0) {
            document.getElementById("V2").style.opacity = "1";
            document.getElementById("V3").style.opacity = "1";
            document.getElementById("V4").style.opacity = "1";
            document.getElementById("V5").style.opacity = "1";
            document.getElementById("V6").style.opacity = "1";
            if (document.getElementById("V2").tagName == "VIDEO") {
              document.getElementById("V2").pause();
              document.getElementById("V2").currentTime = 0;
            } else {};
          }
          if (document.getElementById("V1").tagName == "VIDEO") {
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
            }
          } else {};
        },
      });
    });
    document.getElementById("current_page").innerHTML =
      `1`;
    document.getElementById("total_page").innerHTML =
      `6`;
    player.loadVideo(1065696659).then(function(id) {
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
    $(".documentary").css("opacity", "0.3");
    $(".adv").css("opacity", "0.3");
    $(".personal").css("opacity", "0.3");
    var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
    if (width > 1200) {
      $(".selection_line").css("left", "36.5vw");
    } else {
      $(".music p").css("border-top", "1px solid white");
      $(".documentary p").css("border-top", "1px solid rgba(250,250,250,0)");
      $(".adv p").css("border-top", "1px solid rgba(250,250,250,0)");
      $(".personal p").css("border-top", "1px solid rgba(250,250,250,0)");
      $("#expand").css("display", "initial");
      $(".credits_line").css("width", "1.5dvh");
      $(".exit_credits").css("display", "none");
      $(".credits_background").css("display", "none");
    }
    sezione = 1;
  });
  $(".documentary").on("click", function() {
    $(".cursor").css("display", "initial");
    $(".documentary_content").removeClass("hidden");
    $(".music_content").addClass("hidden");
    if (document.getElementById("V1").tagName == "VIDEO") {
      document.getElementById("V7").play();
      document.getElementById("V1").pause();
      document.getElementById("V2").pause();
      document.getElementById("V3").pause();
      document.getElementById("V4").pause();
      document.getElementById("V5").pause();
      document.getElementById("V6").pause();
      document.getElementById("V9").pause();
      document.getElementById("V10").pause();
      document.getElementById("V11").pause();
      document.getElementById("V12").pause();
      document.getElementById("V13").pause();
      document.getElementById("V14").pause();
      document.getElementById("V15").pause();
      document.getElementById("V16").pause();
      document.getElementById("V17").pause();
      document.getElementById("V1").currentTime = 0;
      document.getElementById("V2").currentTime = 0;
      document.getElementById("V3").currentTime = 0;
      document.getElementById("V4").currentTime = 0;
      document.getElementById("V5").currentTime = 0;
      document.getElementById("V6").currentTime = 0;
      document.getElementById("V9").currentTime = 0;
      document.getElementById("V10").currentTime = 0;
      document.getElementById("V11").currentTime = 0;
      document.getElementById("V12").currentTime = 0;
      document.getElementById("V13").currentTime = 0;
      document.getElementById("V14").currentTime = 0;
      document.getElementById("V15").currentTime = 0;
      document.getElementById("V16").currentTime = 0;
      document.getElementById("V17").currentTime = 0;
    } else {};
    document.getElementById("V1").style.opacity = "1";
    document.getElementById("V2").style.opacity = "1";
    document.getElementById("V3").style.opacity = "1";
    document.getElementById("V4").style.opacity = "1";
    document.getElementById("V5").style.opacity = "1";
    document.getElementById("V6").style.opacity = "1";
    document.getElementById("V9").style.opacity = "1";
    document.getElementById("V10").style.opacity = "1";
    document.getElementById("V11").style.opacity = "1";
    document.getElementById("V12").style.opacity = "1";
    document.getElementById("V13").style.opacity = "1";
    document.getElementById("V14").style.opacity = "1";
    document.getElementById("V15").style.opacity = "1";
    document.getElementById("V16").style.opacity = "1";
    document.getElementById("V17").style.opacity = "1";
    document.getElementById("scrollify_section").innerHTML =
      `
      <div class="section selected" data-section-name="section1">
      <div class="credits_background"></div>
        <div class="text">
          <p class="title">La Furia</p>
          <p class="subtitle">Jake la Furia</p>
          <p class="description">Documentary</p>
          <p class="role">
            regia @98matteodelia<br>
            scritto da @_quagli + gabrielebaldassarre_<br>
            dop @federico.lomba<br>
            executive producer @endrikalthi<br>
            line producer @crecker_<br>
            elettrico @amna_shida<br>
            fonico @michele_negro_<br>
            fotografo @andrea_bianchera<br>
            mua @carlottacantonig<br>
            mua - emis killa @mariacarlini.mua<br>
            assistenza editoriale @gianlucamuto14<br>
            intervistatori @joshuaelie22 + @_quagli<br>
            grafiche @_lucarigon<br>
            mixer audio @michele_negro_<br>
            animazioni @marco_pericoo<br>
            starring @thereallafuria + @bigfish12 + @emiskilla + @therealdonjoe + @teoberlin
          </p>
        </div>
      </div>
      <div class="section" data-section-name="section2">
      <div class="credits_background"></div>
        <div class="text">
          <p class="title">Io Non Ho Paura</p>
          <p class="subtitle">Ernia</p>
          <p class="description">Documentary</p>
          <p class="role">
            regia @young_kuda<br>
            scritto da @_quagli + gabrielebaldassarre_<br>
            aiuto regia @98matteodelia<br>
            operatori @young_kuda + @samuelmersi + @_marc_lucas + @98matteodelia<br>
            mua @silviamancuso.mua + Giulia Fortunato<br>
            assistenza editoriale @gianlucamuto14 + @alessandroboila + @enricobrandoli<br>
            montaggio @98matteodelia + @samuelmersi + @young_kuda<br>
            montaggio intro @nikolajcorradinov<br>
            grafiche @_lucarigon + @gianfrancosposato<br>
            artwork @_lucarigon<br>
            fotografo @young_kuda<br>
            color @enry.v<br>
            starring @holyernia + @cirobuccolieri + @fed.cirillo + @prodbysixpm + @juniork + @rosariodross +<br>
            @startuffo + @josiahandthe + @therealgue + @mengonimarcoofficial + @rkomi + @gaiaofficial
          </p>
        </div>
      </div>
    `;
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
            document.getElementById("V7").style.opacity = "1";
            if (document.getElementById("V7").tagName == "VIDEO") {
              document.getElementById("V7").play();
            } else {};
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
            var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
            if (width < 1200) {
              $(".exit_credits").css("display", "none");
              $(".credits_background").css("display", "none");
              $(".description").css("opacity", "1");
              $(".role").css("opacity", "0");
              $(".credits_background").css("opacity", "0");
              $("#expand").css("display", "initial");
              $(".credits_line").css("width", "1.5dvh");
            }
          }
          if (index === 1) {
            document.getElementById("current_page").innerHTML =
              "2";
            document.getElementById("V7").style.opacity = "0";
            document.getElementById("V8").style.opacity = "1";
            if (document.getElementById("V8").tagName == "VIDEO") {
              document.getElementById("V8").play();
            } else {};
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
            var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
            if (width < 1200) {
              $(".exit_credits").css("display", "none");
              $(".credits_background").css("display", "none");
              $(".description").css("opacity", "1");
              $(".role").css("opacity", "0");
              $(".credits_background").css("opacity", "0");
              $("#expand").css("display", "initial");
              $(".credits_line").css("width", "1.5dvh");
            }
          }
        },
        after: function(index) {
          if (index === 0) {
            document.getElementById("V7").style.opacity = "1";
            document.getElementById("V8").style.opacity = "1";
            if (document.getElementById("V1").tagName == "VIDEO") {
              document.getElementById("V8").pause();
              document.getElementById("V8").currentTime = 0;
            } else {};
          }
          if (document.getElementById("V1").tagName == "VIDEO") {
            if (index === 1) {
              document.getElementById("V7").pause();
              document.getElementById("V7").currentTime = 0;
            }
          } else {};
        },
      });
    });
    document.getElementById("current_page").innerHTML =
      `1`;
    document.getElementById("total_page").innerHTML =
      `2`;
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
    $.scrollify.instantMove("#section1");
    $(".music").css("opacity", "0.3");
    $(".documentary").css("opacity", "1");
    $(".adv").css("opacity", "0.3");
    $(".personal").css("opacity", "0.3");
    var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
    if (width > 1200) {
      $(".selection_line").css("left", "43.5vw");
    } else {
      $(".music p").css("border-top", "1px solid rgba(250,250,250,0)");
      $(".documentary p").css("border-top", "1px solid white");
      $(".adv p").css("border-top", "1px solid rgba(250,250,250,0)");
      $(".personal p").css("border-top", "1px solid rgba(250,250,250,0)");
      $("#expand").css("display", "initial");
      $(".credits_line").css("width", "1.5dvh");
      $(".exit_credits").css("display", "none");
      $(".credits_background").css("display", "none");
    }
    sezione = 2;
  });
  $(".adv").on("click", function() {
    $(".cursor").css("display", "initial");
    $(".adv_content").removeClass("hidden");
    $(".music_content, .documentary_content").addClass("hidden");
    if (document.getElementById("V8").tagName == "VIDEO") {
      document.getElementById("V9").play();
      document.getElementById("V1").pause();
      document.getElementById("V2").pause();
      document.getElementById("V3").pause();
      document.getElementById("V4").pause();
      document.getElementById("V5").pause();
      document.getElementById("V6").pause();
      document.getElementById("V7").pause();
      document.getElementById("V8").pause();
      document.getElementById("V15").pause();
      document.getElementById("V16").pause();
      document.getElementById("V17").pause();
      document.getElementById("V1").currentTime = 0;
      document.getElementById("V2").currentTime = 0;
      document.getElementById("V3").currentTime = 0;
      document.getElementById("V4").currentTime = 0;
      document.getElementById("V5").currentTime = 0;
      document.getElementById("V6").currentTime = 0;
      document.getElementById("V7").currentTime = 0;
      document.getElementById("V8").currentTime = 0;
      document.getElementById("V15").currentTime = 0;
      document.getElementById("V16").currentTime = 0;
      document.getElementById("V17").currentTime = 0;
    } else {};
    document.getElementById("V1").style.opacity = "1";
    document.getElementById("V2").style.opacity = "1";
    document.getElementById("V3").style.opacity = "1";
    document.getElementById("V4").style.opacity = "1";
    document.getElementById("V5").style.opacity = "1";
    document.getElementById("V6").style.opacity = "1";
    document.getElementById("V7").style.opacity = "1";
    document.getElementById("V8").style.opacity = "1";
    document.getElementById("V15").style.opacity = "1";
    document.getElementById("V16").style.opacity = "1";
    document.getElementById("V17").style.opacity = "1";
    document.getElementById("scrollify_section").innerHTML =
      `
    <div class="section selected" data-section-name="section1">
    <div class="credits_background"></div>
      <div class="text">
        <p class="title">Lookbook '24</p>
        <p class="subtitle">Stòffa</p>
        <p class="description">Lookbook</p>
        <p class="role">
          regia @98matteodelia<br>
          dop @davide__castagno<br>
          1ac @zambo.mov<br>
          styling @ericjmcneal<br>
          starring Abdoulaye Ka and @takashiyamada0926<br>
          location @anticamera_location<br>
          casting @riccardomln<br>
          grooming @medusa____makeup<br>
          direzione artistica @studiomare.co
        </p>
      </div>
    </div>
    <div class="section" data-section-name="section2">
    <div class="credits_background"></div>
			<div class="text">
				<p class="title">Venture Out Together</p>
				<p class="subtitle">Timberland</p>
				<p class="description">Commercial</p>
        <p class="role">
          regia @davide_vicari<br>
          dop @jon.charles<br>
          direzione artistica @vincenzo__schioppa<br>
          producer nss @_giadatinelli_ + @benedetta.urbini<br>
          producer NYC @alexeyg + @ryancfahey<br>
          1 ac @godfredceasarsedano + Connor Keep<br>
          gaffer @joncois + @davidxdjaco<br>
          stylist @fabipoppy<br>
          mua @mariotti_marta<br>
          montaggio @98matteodelia<br>
          color grading @lorenzoameri<br>
          sound design @agit.utlu<br>
          laboratory @metpostny
        </p>
			</div>
		</div>
    <div class="section" data-section-name="section3">
    <div class="credits_background"></div>
			<div class="text">
				<p class="title">NN Renaissance FW25</p>
				<p class="subtitle">Mango</p>
				<p class="description">Lookbook</p>
        <p class="role">
          regia @98matteodelia<br>
          dop @_ncl_dgn_<br>
          producer @olgaborr<br>
          styling @carmenmeridag<br>
          grooming @danielamagginetti<br>
          starring @leo.cremer<br>
          sound design @paolotocci<br>
          color grading @ikohchung<br>
          direzione artistica @studiomare.co
        </p>
			</div>
		</div>
    <div class="section" data-section-name="section4">
    <div class="credits_background"></div>
			<div class="text">
				<p class="title">Italy Home Kit 22/23</p>
				<p class="subtitle">Puma</p>
				<p class="description">Commercial</p>
        <p class="role">
          regia @davide_vicari<br>
          montaggio @98matteodelia<br>
          direzione artistica @vincenzo__schioppa
        </p>
			</div>
		</div>
    <div class="section" data-section-name="section5">
    <div class="credits_background"></div>
			<div class="text">
				<p class="title">Home Collection FW25</p>
				<p class="subtitle">Mango</p>
				<p class="description">Lookbook</p>
        <p class="role">
          regia @98matteodelia<br>
          dop @jacopo_ambroggio<br>
          set design @danidevito_studio<br>
          styling @mmariammorato<br>
          color grading @lucamoro_<br>
          production @teruteru_prod<br>
          location @anticamera_location<br>
          direzione artistica @studiomare.co
        </p>
			</div>
		</div>
    <div class="section" data-section-name="section6">
    <div class="credits_background"></div>
			<div class="text">
				<p class="title">In Process: The Sole</p>
				<p class="subtitle">Stòffa</p>
				<p class="description">Web Stories</p>
        <p class="role">
          regia @98matteodelia<br>
          sound design @simone_giud<br>
          direzione artistica @studiomare.co
        </p>
			</div>
		</div>
    `;
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
            document.getElementById("V9").style.opacity = "1";
            if (document.getElementById("V9").tagName == "VIDEO") {
              document.getElementById("V9").play();
            } else {};
            player.loadVideo(1054679176).then(function(id) {
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
            var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
            if (width < 1200) {
              $(".exit_credits").css("display", "none");
              $(".credits_background").css("display", "none");
              $(".description").css("opacity", "1");
              $(".role").css("opacity", "0");
              $(".credits_background").css("opacity", "0");
              $("#expand").css("display", "initial");
              $(".credits_line").css("width", "1.5dvh");
            }
          }
          if (index === 1) {
            document.getElementById("current_page").innerHTML =
              "2";
            document.getElementById("V9").style.opacity = "0";
            document.getElementById("V10").style.opacity = "1";
            if (document.getElementById("V10").tagName == "VIDEO") {
              document.getElementById("V10").play();
            } else {};
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
            var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
            if (width < 1200) {
              $(".exit_credits").css("display", "none");
              $(".credits_background").css("display", "none");
              $(".description").css("opacity", "1");
              $(".role").css("opacity", "0");
              $(".credits_background").css("opacity", "0");
              $("#expand").css("display", "initial");
              $(".credits_line").css("width", "1.5dvh");
            }
          }
          if (index === 2) {
            document.getElementById("current_page").innerHTML =
              "3";
            document.getElementById("V10").style.opacity = "0";
            document.getElementById("V11").style.opacity = "1";
            if (document.getElementById("V11").tagName == "VIDEO") {
              document.getElementById("V11").play();
            } else {};
            player.loadVideo(1066381405).then(function(id) {
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
            var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
            if (width < 1200) {
              $(".exit_credits").css("display", "none");
              $(".credits_background").css("display", "none");
              $(".description").css("opacity", "1");
              $(".role").css("opacity", "0");
              $(".credits_background").css("opacity", "0");
              $("#expand").css("display", "initial");
              $(".credits_line").css("width", "1.5dvh");
            }
          }
          if (index === 3) {
            document.getElementById("current_page").innerHTML =
              "4";
            document.getElementById("V11").style.opacity = "0";
            document.getElementById("V12").style.opacity = "1";
            if (document.getElementById("V12").tagName == "VIDEO") {
              document.getElementById("V12").play();
            } else {};
            player.loadVideo(862052892).then(function(id) {
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
            var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
            if (width < 1200) {
              $(".exit_credits").css("display", "none");
              $(".credits_background").css("display", "none");
              $(".description").css("opacity", "1");
              $(".role").css("opacity", "0");
              $(".credits_background").css("opacity", "0");
              $("#expand").css("display", "initial");
              $(".credits_line").css("width", "1.5dvh");
            }
          }
          if (index === 4) {
            document.getElementById("current_page").innerHTML =
              "5";
            document.getElementById("V12").style.opacity = "0";
            document.getElementById("V13").style.opacity = "1";
            if (document.getElementById("V13").tagName == "VIDEO") {
              document.getElementById("V13").play();
            } else {};
            player.loadVideo(1067101075).then(function(id) {
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
            var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
            if (width < 1200) {
              $(".exit_credits").css("display", "none");
              $(".credits_background").css("display", "none");
              $(".description").css("opacity", "1");
              $(".role").css("opacity", "0");
              $(".credits_background").css("opacity", "0");
              $("#expand").css("display", "initial");
              $(".credits_line").css("width", "1.5dvh");
            }
          }
          if (index === 5) {
            document.getElementById("current_page").innerHTML =
              "6";
            document.getElementById("V13").style.opacity = "0";
            if (document.getElementById("V14").tagName == "VIDEO") {
              document.getElementById("V14").play();
            } else {};
            player.loadVideo(848419838).then(function(id) {
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
            var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
            if (width < 1200) {
              $(".exit_credits").css("display", "none");
              $(".credits_background").css("display", "none");
              $(".description").css("opacity", "1");
              $(".role").css("opacity", "0");
              $(".credits_background").css("opacity", "0");
              $("#expand").css("display", "initial");
              $(".credits_line").css("width", "1.5dvh");
            }
          }
        },
        after: function(index) {
          if (index === 0) {
            document.getElementById("V10").style.opacity = "1";
            document.getElementById("V11").style.opacity = "1";
            document.getElementById("V12").style.opacity = "1";
            document.getElementById("V13").style.opacity = "1";
            document.getElementById("V14").style.opacity = "1";
            if (document.getElementById("V1").tagName == "VIDEO") {
              document.getElementById("V10").pause();
              document.getElementById("V10").currentTime = 0;
            } else {};
          }
          if (document.getElementById("V1").tagName == "VIDEO") {
            if (index === 1) {
              document.getElementById("V9").pause();
              document.getElementById("V9").currentTime = 0;
              document.getElementById("V11").pause();
              document.getElementById("V11").currentTime = 0;
            }
            if (index === 2) {
              document.getElementById("V10").pause();
              document.getElementById("V10").currentTime = 0;
              document.getElementById("V12").pause();
              document.getElementById("V12").currentTime = 0;
            }
            if (index === 3) {
              document.getElementById("V11").pause();
              document.getElementById("V11").currentTime = 0;
              document.getElementById("V13").pause();
              document.getElementById("V13").currentTime = 0;
            }
            if (index === 4) {
              document.getElementById("V12").pause();
              document.getElementById("V12").currentTime = 0;
              document.getElementById("V14").pause();
              document.getElementById("V14").currentTime = 0;
            }
            if (index === 5) {
              document.getElementById("V13").pause();
              document.getElementById("V13").currentTime = 0;
            }
          } else {};
        },
      });
    });
    document.getElementById("current_page").innerHTML =
      `1`;
    document.getElementById("total_page").innerHTML =
      `6`;
    player.loadVideo(1054679176).then(function(id) {
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
    $(".documentary").css("opacity", "0.3");
    $(".adv").css("opacity", "1");
    $(".personal").css("opacity", "0.3");
    var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
    if (width > 1200) {
      $(".selection_line").css("left", "50.5vw");
    } else {
      $(".music p").css("border-top", "1px solid rgba(250,250,250,0)");
      $(".documentary p").css("border-top", "1px solid rgba(250,250,250,0)");
      $(".adv p").css("border-top", "1px solid white");
      $(".personal p").css("border-top", "1px solid rgba(250,250,250,0)");
      $("#expand").css("display", "initial");
      $(".credits_line").css("width", "1.5dvh");
      $(".exit_credits").css("display", "none");
      $(".credits_background").css("display", "none");
    }
    sezione = 3;
  });
  $(".personal").on("click", function() {
    $(".cursor").css("display", "initial");
    $(".music_content, .documentary_content, .adv_content").addClass("hidden");
    if (document.getElementById("V13").tagName == "VIDEO") {
      document.getElementById("V15").play();
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
    } else {};
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
    document.getElementById("V13").style.opacity = "1";
    document.getElementById("V14").style.opacity = "1";
    document.getElementById("scrollify_section").innerHTML =
      `
    <div class="section selected" data-section-name="section1">
    <div class="credits_background"></div>
			<div class="text">
				<p class="title">confessioni a una madre</p>
				<p class="subtitle">2022</p>
				<p class="description">Short Film</p>
        <p class="role">
          regia @98matteodelia<br>
          dop @ale_luis<br>
          fonico @nicola_bussei<br>
          starring @asiajayel<br>
          color @leonardo_mareso_colorist
        </p>
			</div>
		</div>
		<div class="section" data-section-name="section2">
    <div class="credits_background"></div>
			<div class="text">
				<p class="title">Einfall</p>
				<p class="subtitle">2021</p>
				<p class="description">Short Film</p>
        <p class="role">
          regia @98matteodelia<br>
          dop @gabriele_broggini<br>
          production assistant @_letiziagallo<br>
          starring @nuriwey + @gabriele_broggini + @elettralastra<br>
          music composer @woody_arden<br>
          sound designer @brogginisimone
        </p>
			</div>
		</div>
    <div class="section" data-section-name="section3">
    <div class="credits_background"></div>
			<div class="text">
				<p class="title">To be, or not to be.</p>
				<p class="subtitle">2019</p>
				<p class="description">Spec Commercial</p>
        <p class="role">
          regia @98matteodelia<br>
          starring @ene_rampa<br>
          voiceover @federicacasieri
        </p>
			</div>
		</div>
    `;
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
            document.getElementById("V15").style.opacity = "1";
            if (document.getElementById("V15").tagName == "VIDEO") {
              document.getElementById("V15").play();
            } else {};
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
            var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
            if (width < 1200) {
              $(".exit_credits").css("display", "none");
              $(".credits_background").css("display", "none");
              $(".description").css("opacity", "1");
              $(".role").css("opacity", "0");
              $(".credits_background").css("opacity", "0");
              $("#expand").css("display", "initial");
              $(".credits_line").css("width", "1.5dvh");
            }
          }
          if (index === 1) {
            document.getElementById("current_page").innerHTML =
              "2";
            document.getElementById("V15").style.opacity = "0";
            document.getElementById("V16").style.opacity = "1";
            if (document.getElementById("V16").tagName == "VIDEO") {
              document.getElementById("V16").play();
            } else {};
            player.loadVideo(514613840).then(function(id) {
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
            var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
            if (width < 1200) {
              $(".exit_credits").css("display", "none");
              $(".credits_background").css("display", "none");
              $(".description").css("opacity", "1");
              $(".role").css("opacity", "0");
              $(".credits_background").css("opacity", "0");
              $("#expand").css("display", "initial");
              $(".credits_line").css("width", "1.5dvh");
            }
          }
          if (index === 2) {
            document.getElementById("current_page").innerHTML =
              "3";
            document.getElementById("V16").style.opacity = "0";
            if (document.getElementById("V17").tagName == "VIDEO") {
              document.getElementById("V17").play();
            } else {};
            player.loadVideo(380613411).then(function(id) {
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
            var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
            if (width < 1200) {
              $(".exit_credits").css("display", "none");
              $(".credits_background").css("display", "none");
              $(".description").css("opacity", "1");
              $(".role").css("opacity", "0");
              $(".credits_background").css("opacity", "0");
              $("#expand").css("display", "initial");
              $(".credits_line").css("width", "1.5dvh");
            }
          }
        },
        after: function(index) {
          if (index === 0) {
            document.getElementById("V15").style.opacity = "1";
            document.getElementById("V16").style.opacity = "1";
            document.getElementById("V17").style.opacity = "1";
            if (document.getElementById("V1").tagName == "VIDEO") {
              document.getElementById("V16").pause();
              document.getElementById("V16").currentTime = 0;
            } else {};
          }
          if (document.getElementById("V1").tagName == "VIDEO") {
            if (index === 1) {
              document.getElementById("V15").pause();
              document.getElementById("V15").currentTime = 0;
              document.getElementById("V17").pause();
              document.getElementById("V17").currentTime = 0;
            }
            if (index === 2) {
              document.getElementById("V16").pause();
              document.getElementById("V16").currentTime = 0;
            }
          } else {};
        },
      });
    });
    document.getElementById("current_page").innerHTML =
      `1`;
    document.getElementById("total_page").innerHTML =
      `3`;
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
    $(".documentary").css("opacity", "0.3");
    $(".adv").css("opacity", "0.3");
    $(".personal").css("opacity", "1");
    var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
    if (width > 1200) {
      $(".selection_line").css("left", "57.5vw");
    } else {
      $(".music p").css("border-top", "1px solid rgba(250,250,250,0)");
      $(".documentary p").css("border-top", "1px solid rgba(250,250,250,0)");
      $(".adv p").css("border-top", "1px solid rgba(250,250,250,0)");
      $(".personal p").css("border-top", "1px solid white");
      $("#expand").css("display", "initial");
      $(".credits_line").css("width", "1.5dvh");
      $(".exit_credits").css("display", "none");
      $(".credits_background").css("display", "none");
    }
    sezione = 4;
  });
  $(".header_title, .header ul").on("mouseleave", function() {
    $("body").css("cursor", "default");
    if (sezione == 1) {
      $(".selection_line").css("left", "36.5vw");
    }
    if (sezione == 3) {
      $(".selection_line").css("left", "50.5vw");
    }
    if (sezione == 4) {
      $(".selection_line").css("left", "57.5vw");
    }
  });
  $(".header").on("mouseleave", function() {
    $("body").css("cursor", "none");
  });
}

function credits() {
  var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
  if (width < 1200) {
    $(".hover_credits").on("click", function() {
      $(".exit_credits").css("display", "initial");
      $(".credits_background").css("display", "initial");
      $(".description").css("opacity", "0");
      $(".role").css("opacity", "1");
      $(".credits_background").css("opacity", "0.75");
      $("#expand").css("display", "none");
      $(".credits_line").css("width", "80dvw");
    });
    $(".exit_credits").on("click", function() {
      $(".exit_credits").css("display", "none");
      $(".credits_background").css("display", "none");
      $(".description").css("opacity", "1");
      $(".role").css("opacity", "0");
      $(".credits_background").css("opacity", "0");
      $("#expand").css("display", "initial");
      $(".credits_line").css("width", "1.5dvh");
    });
  } else {
    $(".hover_credits").on("mouseenter", function() {
      $(".description").css("opacity", "0");
      $(".role").css("opacity", "1");
      $(".credits_background").css("opacity", "0.75");
      $("#expand").css("display", "none");
    });
    $(".hover_credits").on("mouseleave", function() {
      $(".description").css("opacity", "1");
      $(".role").css("opacity", "0");
      $(".credits_background").css("opacity", "0");
      $("#expand").css("display", "initial");
    });
  }
}
