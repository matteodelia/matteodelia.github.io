// tutti i contenuti (testi, crediti, video, foto, id vimeo) stanno in progetti.json.
// con ?anteprima nell'indirizzo il sito mostra invece la bozza aperta nell'editor
$(document).ready(function() {
  loader_reveal();
  var bozza = null;
  if (location.search.indexOf("anteprima") >= 0) {
    try {
      bozza = JSON.parse(localStorage.getItem("editor_bozza")).dati;
    } catch (e) {}
  }
  (bozza ? Promise.resolve(bozza) : fetch("progetti.json").then(function(risposta) {
    return risposta.json();
  })).then(function(progetti) {
    var categorie = prepara_categorie(progetti);
    mobile_src(categorie);
    load();
    cursor();
    change_mouse();
    open_vimeo();
    select_section(categorie);
    credits();
  });
});

// le quattro categorie del menu, nell'ordine del sito.
// chiave = nome in progetti.json, classe = classe css dei suoi video
var CATEGORIE = [{
  chiave: "music",
  menu: ".music",
  classe: "music_content",
  linea: "36.5vw"
}, {
  chiave: "documentary",
  menu: ".documentary",
  classe: "documentary_content",
  linea: "43.5vw"
}, {
  chiave: "brand",
  menu: ".adv",
  classe: "adv_content",
  linea: "50.5vw"
}, {
  chiave: "narrative",
  menu: ".narrative",
  classe: "",
  linea: "57.5vw"
}];

// unisce le categorie ai loro progetti e numera i video in ordine:
// V1, V2, ... prima tutti quelli di music, poi documentary, brand, narrative
function prepara_categorie(progetti) {
  var numero = 1;
  return CATEGORIE.map(function(c) {
    var cat = {
      menu: c.menu,
      classe: c.classe,
      contenuto: c.classe ? "." + c.classe : null,
      linea: c.linea,
      progetti: progetti[c.chiave] || [],
      primo: numero
    };
    numero += cat.progetti.length;
    return cat;
  });
}

// i testi di progetti.json vanno nell'html: & < > non devono diventare tag
function testo(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function loader_reveal() {
  const loaderVideo = document.querySelector(".loader video");

  function showLoaderVideo() {
    loaderVideo.style.opacity = "1";
  }

  if (loaderVideo.readyState >= 2) {
    showLoaderVideo();
  } else {
    loaderVideo.addEventListener("loadeddata", showLoaderVideo, {
      once: true
    });
  }
}

function mobile_src(categorie) {
  var width = (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
  var container = document.getElementById("video_container");

  // un video (desktop) o una foto (telefono) per progetto, da V1 in poi
  var media = [];
  categorie.forEach(function(cat) {
    cat.progetti.forEach(function(p, i) {
      media.push({
        id: "V" + (cat.primo + i),
        video: p.img.video,
        foto: p.img.foto,
        foto_css: p.img.foto_css,
        classe: cat.classe ? "video " + cat.classe : "video",
        posizione: i
      });
    });
  });
  var tutti = media.map(function(m) {
    return m.id;
  });

  // carica un elemento e chiama done() quando e' pronto (o se va in errore)
  function loadOne(id, done) {
    var el = document.getElementById(id);
    var finished = false;
    function end() {
      if (finished) return;
      finished = true;
      if (done) done();
    }
    if (el.tagName == "VIDEO") {
      el.addEventListener("canplaythrough", end, { once: true });
      el.addEventListener("error", end, { once: true });
      el.preload = "auto";
      el.src = el.getAttribute("data-src");
      el.load();
    } else {
      el.addEventListener("load", end, { once: true });
      el.addEventListener("error", end, { once: true });
      el.src = el.getAttribute("data-src");
    }
  }

  // carica una lista di id uno dopo l'altro
  function loadSequence(ids, done) {
    var i = 0;
    function next() {
      if (i >= ids.length) {
        if (done) done();
        return;
      }
      loadOne(ids[i++], next);
    }
    next();
  }

  // carica una lista di id tutti insieme, done() quando sono tutti pronti
  function loadParallel(ids, done) {
    var remaining = ids.length;
    if (remaining == 0) {
      if (done) done();
      return;
    }
    ids.forEach(function(id) {
      loadOne(id, function() {
        remaining--;
        if (remaining == 0 && done) done();
      });
    });
  }

  // nel DOM vanno al contrario (l'ultimo per primo): così V1 sta sopra a tutti,
  // V2 sotto V1 e così via, e spegnendo un video si scopre quello dopo
  var html = "";
  media.slice().reverse().forEach(function(m) {
    if (width < 1200) {
      html += '<img data-src="' + m.foto + '" class="' + m.classe + '" id="' + m.id + '">\n';
    } else {
      html += '<video data-src="' + m.video + '" type="video/mp4" class="' + m.classe + '" id="' + m.id + '" preload="none" pause loop muted playsinline></video>\n';
    }
  });
  container.innerHTML = html;

  // centratura delle foto su telefono in verticale (foto_css in progetti.json)
  var css = "";
  media.forEach(function(m) {
    if (m.foto_css) css += "#" + m.id + " { " + m.foto_css + " }\n";
  });
  if (css) {
    var stile = document.createElement("style");
    stile.textContent = "@media only screen and (max-width: 1200px) and (orientation: portrait) {\n" + css + "}";
    document.head.appendChild(stile);
  }

  if (width < 1200) {
    // telefono: foto in ordine da V1 all'ultima
    loadSequence(tutti);
  } else {
    // desktop: prima i primi due video di ogni categoria tutti insieme,
    // poi i rimanenti di music, documentary, brand, narrative in ordine
    var primoBlocco = media.filter(function(m) {
      return m.posizione < 2;
    }).map(function(m) {
      return m.id;
    });
    var resto = tutti.filter(function(id) {
      return primoBlocco.indexOf(id) < 0;
    });
    loadParallel(primoBlocco, function() {
      loadSequence(resto);
    });
  }
}

function load() {
  // niente scroll finché c'è il loader
  scroll_sezioni.blocca();
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
    scroll_sezioni.sblocca();
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
  // mette la qualità più alta che ha il video: 4K ("2160p") se c'è,
  // altrimenti la migliore disponibile (alcuni sono solo 2K o 1080p).
  // attenzione: per vimeo il 4K si chiama "2160p", "4k" non funziona
  function qualitaMassima() {
    return player.getQualities().then(function(qualita) {
      var ids = qualita.map(function(q) {
        return q.id;
      }).filter(function(id) {
        return id != "auto";
      });
      ids.sort(function(a, b) {
        return parseInt(b) - parseInt(a);
      });
      if (ids.length) return player.setQuality(ids[0]);
    }).catch(function() {});
  }

  $("#scrollify_section").on("click", function() {
    player.requestFullscreen().catch(function() {});
    qualitaMassima();
    player.setCurrentTime(0).catch(function() {});
  });
  player.on('fullscreenchange', function(data) {
    player.getFullscreen().then(function(fullscreen) {
      if (fullscreen) {
        // di nuovo dopo il play, nel caso vimeo l'avesse ignorata a video fermo
        player.play().then(qualitaMassima).catch(function() {});
      } else {
        scroll_sezioni.vai(0, true);
        player.pause();
      }
    });
  });
}

function select_section(categorie) {
  // per ogni categoria: gli id vimeo in ordine e l'html delle sue sezioni dei crediti
  categorie.forEach(function(cat) {
    cat.vimeo = cat.progetti.map(function(p) {
      return p.vimeo;
    });
    cat.sezioni = cat.progetti.map(function(p, i) {
      return '\n<div class="section' + (i == 0 ? ' selected' : '') + '" data-section-name="section' + (i + 1) + '">' +
        '\n  <div class="credits_background"></div>' +
        '\n  <div class="text">' +
        '\n    <p class="title">' + testo(p.title) + '</p>' +
        '\n    <p class="subtitle">' + testo(p.subtitle) + '</p>' +
        '\n    <p class="description">' + testo(p.description) + '</p>' +
        '\n    <p class="role">\n      ' + p.role.map(testo).join('<br>\n      ') + '\n    </p>' +
        '\n  </div>' +
        '\n</div>';
    }).join("") + "\n";
  });
  var totale_video = categorie.reduce(function(somma, cat) {
    return somma + cat.progetti.length;
  }, 0);
  var sezione = 0;

  function larghezza() {
    return (window.innerWidth > 0) ? window.innerWidth : document.documentElement.clientWidth;
  }

  function video(n) {
    return document.getElementById("V" + n);
  }

  // su telefono al posto dei video ci sono le foto
  function sonoVideo() {
    return video(1).tagName == "VIDEO";
  }

  function ferma(n) {
    video(n).pause();
    video(n).currentTime = 0;
  }

  function caricaVimeo(id) {
    player.loadVideo(id).catch(function() {});
  }

  function ultimo(cat) {
    return cat.primo + cat.vimeo.length - 1;
  }

  function chiudiCrediti() {
    $(".exit_credits").css("display", "none");
    $(".credits_background").css("display", "none");
    $(".description").css("opacity", "1");
    $(".role").css("opacity", "0");
    $(".credits_background").css("opacity", "0");
    $("#expand").css("display", "initial");
    $(".credits_line").css("width", "1.5dvh");
  }

  function soloDesktop(fn) {
    return function() {
      if (larghezza() > 1200) fn();
    };
  }

  function primaDiScorrere(cat, index) {
    var n = cat.primo + index;
    $(".section").removeClass("selected");
    $($(".section").get(index)).addClass("selected");
    document.getElementById("current_page").innerHTML = index + 1;
    if (index > 0) video(n - 1).style.opacity = "0";
    video(n).style.opacity = "1";
    if (sonoVideo()) video(n).play();
    caricaVimeo(cat.vimeo[index]);
    if (larghezza() < 1200) chiudiCrediti();
  }

  function dopoAverScorso(cat, index) {
    var n = cat.primo + index;
    if (index === 0) {
      for (var k = cat.primo; k <= ultimo(cat); k++) video(k).style.opacity = "1";
    }
    // ferma il video prima e quello dopo
    if (sonoVideo()) {
      if (n - 1 >= cat.primo) ferma(n - 1);
      if (n + 1 <= ultimo(cat)) ferma(n + 1);
    }
  }

  // mette le sezioni dei crediti della categoria e ci attiva lo scroll
  function attivaSezioni(cat) {
    document.getElementById("scrollify_section").innerHTML = cat.sezioni;
    scroll_sezioni.attiva({
      before: function(index) {
        primaDiScorrere(cat, index);
      },
      after: function(index) {
        dopoAverScorso(cat, index);
      }
    });
  }

  function mostraCategoria(i) {
    var cat = categorie[i];
    $(".cursor").css("display", "initial");
    // i video delle categorie precedenti stanno sopra: vanno nascosti
    if (cat.contenuto) $(cat.contenuto).removeClass("hidden");
    for (var j = 0; j < i; j++) $(categorie[j].contenuto).addClass("hidden");
    if (sonoVideo()) video(cat.primo).play();
    for (var n = 1; n <= totale_video; n++) {
      if (n >= cat.primo && n <= ultimo(cat)) continue;
      if (sonoVideo()) ferma(n);
      video(n).style.opacity = "1";
    }
    attivaSezioni(cat);
    document.getElementById("current_page").innerHTML = "1";
    document.getElementById("total_page").innerHTML = cat.vimeo.length;
    caricaVimeo(cat.vimeo[0]);
    scroll_sezioni.vai(0, true);
    categorie.forEach(function(c, j) {
      $(c.menu).css("opacity", j == i ? "1" : "0.3");
    });
    if (larghezza() > 1200) {
      $(".selection_line").css("left", cat.linea);
    } else {
      categorie.forEach(function(c, j) {
        $(c.menu + " p").css("border-top", j == i ? "1px solid white" : "1px solid rgba(250,250,250,0)");
      });
      chiudiCrediti();
    }
    sezione = i;
  }

  // hover del menu, solo su desktop
  $(".header_title").on("mouseover", soloDesktop(function() {
    $("body").css("cursor", "pointer");
  }));
  categorie.forEach(function(cat) {
    $(cat.menu).on("mouseover", soloDesktop(function() {
      $("body").css("cursor", "pointer");
      $(".selection_line").css("left", cat.linea);
    }));
  });

  // hover dei contatti, solo su desktop
  $(".mail").on("mouseenter", soloDesktop(function() {
    $(".contacts_container_image").css("transform", "rotateY(0deg)translate(0, -50%)");
    $(".vimeo").css("opacity", "0.5");
    $(".instagram").css("opacity", "0.5");
    $(".vimeo_hover").css("display", "initial");
    $(".instagram_hover").css("display", "initial");
    $(".mail").css("opacity", "1");
  }));
  $(".instagram_hover").on("mouseenter", soloDesktop(function() {
    $(".instagram").css("opacity", "1");
  }));
  $(".instagram_hover").on("mouseleave", soloDesktop(function() {
    $(".instagram").css("opacity", "0.5");
  }));
  $(".vimeo_hover").on("mouseenter", soloDesktop(function() {
    $(".vimeo").css("opacity", "1");
  }));
  $(".vimeo_hover").on("mouseleave", soloDesktop(function() {
    $(".vimeo").css("opacity", "0.5");
  }));
  $(".mail").on("mouseleave", soloDesktop(function() {
    $(".mail").css("opacity", "0.5");
  }));
  $(".contacts_container").on("mouseleave", soloDesktop(function() {
    $(".contacts_container_image").css("transform", "rotateY(90deg)translate(0, -50%)");
    $(".vimeo").css("opacity", "0");
    $(".instagram").css("opacity", "0");
    $(".vimeo_hover").css("display", "none");
    $(".instagram_hover").css("display", "none");
  }));

  // click sul menu: cambia categoria
  categorie.forEach(function(cat, i) {
    $(cat.menu).on("click", function() {
      mostraCategoria(i);
    });
  });
  $(".header_title").on("click", function() {
    mostraCategoria(0);
  });

  $(".header_title, .header ul").on("mouseleave", function() {
    $("body").css("cursor", "default");
    $(".selection_line").css("left", categorie[sezione].linea);
  });
  $(".header").on("mouseleave", function() {
    $("body").css("cursor", "none");
  });

  // all'apertura del sito si parte da music
  attivaSezioni(categorie[0]);
  document.getElementById("total_page").innerHTML = categorie[0].vimeo.length;
  // l'iframe in index.html parte con un film: se il primo progetto è cambiato, carica quello giusto
  if (document.querySelector(".vimeo_link").src.indexOf("/" + categorie[0].vimeo[0]) < 0) {
    caricaVimeo(categorie[0].vimeo[0]);
  }
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

// SCROLL A SEZIONI (al posto di scrollify)
// rotella, trackpad, touch e tastiera spostano di una sezione alla volta,
// con la stessa animazione di scrollify: 1100ms, curva easeOutExpo.
// si muove lo scroll della pagina (non un transform) perché dentro le sezioni
// ci sono elementi position: fixed che devono restare fermi
var scroll_sezioni = (function() {
  var durata = 1100;
  var sezioni = [];
  var corrente = 0;
  var bloccato = false;
  var inMovimento = false;
  var animazione = null;
  var dopoInSospeso = null;
  var prima = function() {};
  var dopo = function() {};
  var ascoltatoriAttivi = false;

  function curva(t) {
    return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function sistemaAltezze() {
    sezioni.forEach(function(s) {
      s.style.height = window.innerHeight + "px";
    });
  }

  // come scrollify la prima sezione è sempre in cima alla pagina (0),
  // anche se su desktop il margine del body la sposta di 8px.
  // le altre si calcolano (e non si leggono dal layout) perché nel css
  // .section ha "transition: all": dopo un resize l'altezza nuova arriva in ritardo
  function posizione(i) {
    if (i === 0) return 0;
    var inizio = sezioni[0].getBoundingClientRect().top + window.pageYOffset;
    return Math.floor(inizio + i * window.innerHeight);
  }

  // chiude la mossa precedente: se non era finita chiama subito il suo after
  function chiudiMossa() {
    if (animazione) cancelAnimationFrame(animazione);
    animazione = null;
    inMovimento = false;
    if (dopoInSospeso) {
      var fn = dopoInSospeso;
      dopoInSospeso = null;
      fn();
    }
  }

  // come scrollify: se si torna sulla stessa sezione niente before/after
  function vai(i, istantaneo) {
    if (bloccato || !sezioni[i]) return;
    var cambia = i !== corrente;
    chiudiMossa();
    if (cambia) prima(i);
    corrente = i;
    var arrivo = posizione(i);
    if (istantaneo) {
      window.scrollTo(0, arrivo);
      if (cambia) dopo(i);
      return;
    }
    var partenza = window.pageYOffset;
    var inizio = performance.now();
    inMovimento = true;
    if (cambia) dopoInSospeso = function() {
      dopo(i);
    };
    function passo(ora) {
      var t = Math.max(0, Math.min((ora - inizio) / durata, 1));
      window.scrollTo(0, partenza + (arrivo - partenza) * curva(t));
      if (t < 1) {
        animazione = requestAnimationFrame(passo);
      } else {
        animazione = null;
        chiudiMossa();
      }
    }
    animazione = requestAnimationFrame(passo);
  }

  function succ() {
    if (corrente < sezioni.length - 1) vai(corrente + 1);
  }

  function prec() {
    if (corrente > 0) vai(corrente - 1);
  }

  // ROTELLA E TRACKPAD
  // il trackpad dopo il gesto continua a mandare eventi (inerzia) per circa un secondo.
  // come scrollify: si scatta solo se la media degli ultimi 10 movimenti è almeno
  // quella degli ultimi 70, cioè se il gesto sta accelerando e non sfumando
  var storia = [];
  var ultimaRotella = 0;

  function media(n) {
    var ultimi = storia.slice(Math.max(storia.length - n, 1));
    var somma = 0;
    for (var k = 0; k < ultimi.length; k++) somma += ultimi[k];
    return Math.ceil(somma / n);
  }

  function rotella(e) {
    if (bloccato) return;
    e.preventDefault();
    var ora = Date.now();
    var delta = e.wheelDelta || -e.deltaY || -e.detail;
    if (storia.length > 149) storia.shift();
    storia.push(Math.abs(delta));
    // più di 200ms di pausa: è un gesto nuovo
    if (ora - ultimaRotella > 200) storia = [];
    ultimaRotella = ora;
    if (inMovimento || media(70) > media(10)) return;
    if (delta < 0) succ();
    if (delta > 0) prec();
  }

  // TASTIERA: frecce e pagina su/giù
  function tastiera(e) {
    if (bloccato || inMovimento) return;
    if ((e.keyCode == 40 || e.keyCode == 34) && corrente < sezioni.length - 1) {
      e.preventDefault();
      succ();
    }
    if ((e.keyCode == 38 || e.keyCode == 33) && corrente > 0) {
      e.preventDefault();
      prec();
    }
  }

  // TOUCH: uno swipe verticale di più di 30px sposta di una sezione.
  // se il dito resta giù più di 800ms scatta senza aspettare che si stacchi.
  // come scrollify, uno swipe durante l'animazione la reindirizza subito
  var tocco = {
    inizioY: -1,
    inizioX: -1,
    y: -1,
    x: -1,
    tempo: 0,
    fatto: false,
    verticale: false
  };

  function swipe() {
    var dy = tocco.y - tocco.inizioY;
    if (Math.abs(dy) <= 30) return;
    if (dy > 0) prec();
    else succ();
  }

  function touch(e) {
    if (bloccato) return;
    if (e.type == "touchstart") {
      tocco.inizioY = e.touches[0].pageY;
      tocco.inizioX = e.touches[0].pageX;
      tocco.tempo = Date.now();
      tocco.fatto = false;
    }
    if (e.type == "touchstart" || e.type == "touchmove") {
      tocco.y = e.touches[0].pageY;
      tocco.x = e.touches[0].pageX;
      var dy = tocco.y - tocco.inizioY;
      var dx = tocco.x - tocco.inizioX;
      if (dy !== 0 && Math.abs(dy) > Math.abs(dx)) {
        e.preventDefault();
        tocco.verticale = true;
        if (!tocco.fatto && tocco.tempo + 800 < Date.now()) {
          tocco.fatto = true;
          swipe();
        }
      }
    }
    if (e.type == "touchend") {
      if (!tocco.fatto && tocco.verticale && tocco.inizioY > -1) {
        tocco.fatto = true;
        swipe();
      }
      tocco.inizioY = -1;
      tocco.inizioX = -1;
      tocco.verticale = false;
    }
  }

  // RIDIMENSIONAMENTO: sezioni alte quanto la finestra e di nuovo allineate
  var attesaResize = null;

  function ridimensiona() {
    clearTimeout(attesaResize);
    attesaResize = setTimeout(function() {
      sistemaAltezze();
      if (inMovimento) chiudiMossa();
      if (sezioni[corrente]) window.scrollTo(0, posizione(corrente));
    }, 400);
  }

  return {
    // da chiamare ogni volta che cambiano le sezioni (cambio categoria)
    attiva: function(opzioni) {
      prima = opzioni.before;
      dopo = opzioni.after;
      sezioni = Array.prototype.slice.call(document.querySelectorAll("#scrollify_section .section"));
      sistemaAltezze();
      if (ascoltatoriAttivi) return;
      ascoltatoriAttivi = true;
      window.addEventListener("wheel", rotella, {
        passive: false
      });
      document.addEventListener("keydown", tastiera);
      document.addEventListener("touchstart", touch, {
        passive: false
      });
      document.addEventListener("touchmove", touch, {
        passive: false
      });
      document.addEventListener("touchend", touch, {
        passive: false
      });
      window.addEventListener("resize", ridimensiona);
      window.addEventListener("orientationchange", ridimensiona);
    },
    vai: vai,
    blocca: function() {
      bloccato = true;
    },
    sblocca: function() {
      bloccato = false;
    }
  };
})();
