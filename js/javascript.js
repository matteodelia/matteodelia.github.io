// tutti i contenuti (testi, crediti, video, foto, id vimeo) stanno in progetti.json.
// con ?anteprima nell'indirizzo il sito mostra invece la bozza aperta nell'editor
$(document).ready(function() {
  loader_reveal();
  statistiche.carica();
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
    load(mobile_src(categorie));
    cursor();
    change_mouse();
    open_vimeo();
    select_section(categorie);
    credits();
    privacy();
  });
});

// le quattro categorie del menu, nell'ordine del sito.
// chiave = nome in progetti.json, classe = classe css dei suoi video
var CATEGORIE = [{
  chiave: "music",
  menu: ".music",
  classe: "music_content"
}, {
  chiave: "documentary",
  menu: ".documentary",
  classe: "documentary_content"
}, {
  chiave: "brand",
  menu: ".adv",
  classe: "adv_content"
}, {
  chiave: "narrative",
  menu: ".narrative",
  classe: ""
}];

// unisce le categorie ai loro progetti e numera i video in ordine:
// V1, V2, ... prima tutti quelli di music, poi documentary, brand, narrative
function prepara_categorie(progetti) {
  var numero = 1;
  return CATEGORIE.map(function(c) {
    var cat = {
      chiave: c.chiave,
      menu: c.menu,
      classe: c.classe,
      contenuto: c.classe ? "." + c.classe : null,
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
        foto_x: p.img.foto_x == null ? 50 : p.img.foto_x,
        foto_ruota: p.img.foto_ruota || 0,
        classe: cat.classe ? "video " + cat.classe : "video",
        posizione: i
      });
    });
  });
  var tutti = media.map(function(m) {
    return m.id;
  });

  // i primi due di ogni categoria: sul computer si caricano per primi,
  // e quando sono pronti il loader può chiudersi (vedi load)
  var primoBlocco = media.filter(function(m) {
    return m.posizione < 2;
  }).map(function(m) {
    return m.id;
  });
  var mancanoAlBlocco = primoBlocco.length;
  var segnaPronto;
  var primoBloccoPronto = new Promise(function(risolvi) {
    segnaPronto = risolvi;
  });
  if (!mancanoAlBlocco) segnaPronto();

  // carica un elemento e chiama done() quando e' pronto (o se va in errore)
  function loadOne(id, done) {
    var el = document.getElementById(id);
    var finished = false;
    function end() {
      if (finished) return;
      finished = true;
      if (primoBlocco.indexOf(id) >= 0 && --mancanoAlBlocco == 0) segnaPronto();
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

  // posizione e rotazione delle foto su telefono in verticale (progetti.json).
  // foto_x è la parte della foto che si vede: 0 = sinistra, 50 = centro, 100 = destra,
  // sempre come la si vede sullo schermo, anche se la foto è ruotata
  var css = "";
  media.forEach(function(m) {
    var x = m.foto_x;
    var selettore = "#video_container #" + m.id;
    if (m.foto_ruota == 90 || m.foto_ruota == 270) {
      // ruotata di lato: il lato corto della foto diventa la larghezza sullo schermo
      css += selettore + " { width: auto; height: 100dvh; left: calc(50% + (100dvh - 100dvw) * " + (50 - x) / 100 + "); transform: translate(-50%, -50%) rotate(" + m.foto_ruota + "deg); }\n";
    } else if (m.foto_ruota == 180) {
      css += selettore + " { object-position: " + (100 - x) + "% 50%; transform: translate(-50%, -50%) rotate(180deg); }\n";
    } else if (x != 50) {
      css += selettore + " { object-position: " + x + "% 50%; }\n";
    }
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
    var resto = tutti.filter(function(id) {
      return primoBlocco.indexOf(id) < 0;
    });
    loadParallel(primoBlocco, function() {
      loadSequence(resto);
    });
  }
  return primoBloccoPronto;
}

// il loader si chiude quando sono passati almeno 3,5 secondi, l'animazione è finita
// (dura 3 secondi) e sono pronti i primi due video di ogni categoria.
// in ogni caso non oltre 7 secondi
function load(primoBloccoPronto) {
  // niente scroll finché c'è il loader
  scroll_sezioni.blocca();
  var videoLoader = document.querySelector(".loader video");
  // l'ultimo fotogramma si carica subito, così è pronto quando serve
  ultimoFotogramma = new Image();
  ultimoFotogramma.alt = "";
  ultimoFotogramma.style.opacity = "1";
  ultimoFotogramma.src = ULTIMO_FOTOGRAMMA_LOADER;
  var minimo = new Promise(function(risolvi) {
    setTimeout(risolvi, 3500);
  });
  // l'animazione parte quando il video è pronto, quindi può finire dopo i 3,5 secondi
  var animazioneFinita = new Promise(function(risolvi) {
    if (videoLoader.ended) {
      congelaLoader();
      return risolvi();
    }
    videoLoader.addEventListener("ended", function() {
      congelaLoader();
      risolvi();
    }, {
      once: true
    });
    // autoplay bloccato (es. risparmio energetico su iPhone): si vede subito l'ultimo fotogramma
    var avvio = videoLoader.play();
    if (avvio) avvio.catch(function(errore) {
      if (errore.name == "NotAllowedError") {
        fermaLoader();
        risolvi();
      }
    });
    // stessa cosa se dopo 1,5 secondi il video è fermo pur avendo già i dati
    setTimeout(function() {
      if (videoLoader.paused && !videoLoader.ended && videoLoader.readyState >= 2) {
        fermaLoader();
        risolvi();
      }
    }, 1500);
  });
  var massimo = new Promise(function(risolvi) {
    setTimeout(risolvi, 7000);
  });
  Promise.race([Promise.all([minimo, animazioneFinita, primoBloccoPronto]), massimo]).then(chiudiLoader);
}

var ULTIMO_FOTOGRAMMA_LOADER = "img/loader-fine.webp";
var ultimoFotogramma;

// a fine animazione il video resta fermo sul suo ultimo fotogramma: alcuni browser (Safari)
// fanno ripartire da capo i video muti in autoplay quando si muovono, ma senza autoplay
// e messo in pausa non ripartono. Se ripartisse lo stesso si passa subito all'immagine
function congelaLoader() {
  var videoLoader = document.querySelector(".loader video");
  videoLoader.removeAttribute("autoplay");
  videoLoader.pause();
  videoLoader.addEventListener("play", fermaLoader);
  videoLoader.addEventListener("seeking", fermaLoader);
}

// al posto del video l'immagine dell'ultimo fotogramma: serve quando il video non è
// partito (risparmio energetico), non ha finito in tempo o ha provato a ripartire
function fermaLoader() {
  var videoLoader = document.querySelector(".loader video");
  videoLoader.removeAttribute("autoplay");
  videoLoader.pause();
  if (videoLoader.dataset.fermo) return;
  videoLoader.dataset.fermo = "1";
  function scambia() {
    videoLoader.parentNode.insertBefore(ultimoFotogramma, videoLoader);
    videoLoader.style.display = "none";
  }
  if (ultimoFotogramma.complete && ultimoFotogramma.naturalWidth) scambia();
  else ultimoFotogramma.onload = scambia;
}

function chiudiLoader() {
  statistiche.pronto();
  // se l'animazione è ancora in corso (connessione lenta) si passa all'ultimo fotogramma
  // prima della salita; se non è mai partita resta com'è, senza cambi durante la salita
  var videoLoader = document.querySelector(".loader video");
  if (!videoLoader.ended && videoLoader.currentTime > 0) fermaLoader();
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
  setTimeout(function() {
    // con la privacy aperta (matteodelia.com/#privacy) lo scroll resta al pannello
    if (!privacyAperta) scroll_sezioni.sblocca();
  }, 500);
}

// CURSORE (solo computer con mouse o trackpad): al posto della freccia un triangolo che segue il
// mouse e un cerchio che lo raggiunge con un piccolo ritardo, a onda.
// si muove con transform (lo fa la scheda grafica, senza ricalcolare la pagina) una volta per
// fotogramma dello schermo, ed è agganciato alla finestra: resta sotto il mouse anche mentre la
// pagina scorre. quando il cerchio ha raggiunto il mouse si ferma, e a mouse fermo non costa niente.
// il ritardo sono due inseguimenti in fila, 12 e 58 ms, tarati per muoversi come il cursore di prima
// (a metà strada in 60 ms, dietro di 75 px a un mouse che corre), uguale a 60 e a 120 Hz
function cursor() {
  if (!window.matchMedia || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  var RITARDO_1 = 12;
  var RITARDO_2 = 58;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) RITARDO_1 = RITARDO_2 = 0.01;
  var contenitore = document.querySelector(".cursor");
  var triangolo = document.querySelector(".player");
  var cerchio = document.querySelector(".circle");
  var mouse = null;
  var meta = null; // a metà dei due inseguimenti
  var pos = null; // dove sta il cerchio
  var ultimo = 0;
  var giro = null;

  function metti(elemento, x, y) {
    elemento.style.transform = "translate3d(" + x + "px, " + y + "px, 0) translate(-50%, -50%)";
  }

  function insegui(da, verso, dt, ritardo) {
    var k = 1 - Math.exp(-dt / ritardo);
    da.x += (verso.x - da.x) * k;
    da.y += (verso.y - da.y) * k;
  }

  function passo(ora) {
    // il tempo passato dall'ultimo fotogramma, a passetti di 4 ms: così il movimento è lo stesso
    // su qualsiasi schermo
    var tempo = Math.min(ora - ultimo, 100);
    ultimo = ora;
    while (tempo > 0) {
      var dt = Math.min(4, tempo);
      tempo -= dt;
      insegui(meta, mouse, dt, RITARDO_1);
      insegui(pos, meta, dt, RITARDO_2);
    }
    metti(triangolo, mouse.x, mouse.y);
    metti(cerchio, pos.x, pos.y);
    if (Math.abs(mouse.x - pos.x) < 0.1 && Math.abs(mouse.y - pos.y) < 0.1) {
      metti(cerchio, mouse.x, mouse.y);
      giro = null;
      return;
    }
    giro = requestAnimationFrame(passo);
  }

  // triangolo e cerchio hanno il centro sulla punta del mouse: si clicca nel centro del cerchio
  document.addEventListener("mousemove", function(e) {
    mouse = {
      x: e.clientX,
      y: e.clientY
    };
    // la prima volta compare già sotto il mouse, senza arrivare dall'angolo
    if (!pos) {
      meta = { x: mouse.x, y: mouse.y };
      pos = { x: mouse.x, y: mouse.y };
    }
    contenitore.classList.add("attivo");
    if (!giro) {
      ultimo = performance.now();
      giro = requestAnimationFrame(passo);
    }
  }, {
    passive: true
  });
  // fuori dalla finestra il cursore sparisce
  document.addEventListener("mouseout", function(e) {
    if (!e.relatedTarget) contenitore.classList.remove("attivo");
  });
}

// sopra all'header torna la freccia normale e il cursore del sito si nasconde
function change_mouse() {
  $(".header").hover(
    function() {
      $("body").css("cursor", "auto");
      $(".cursor").addClass("sopra-header");
    },
    function() {
      $("body").css("cursor", "none");
      $(".cursor").removeClass("sopra-header");
    }
  );
}

// dopo il film: di nuovo sulla sezione di prima, con il suo video in movimento (la prepara select_section)
var riprendiSezione = function() {};

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

  // IL FILM
  // su computer e su telefono si apre dentro la pagina, a tutto schermo su fondo nero, con una
  // dissolvenza, e si chiude uguale: X in alto a destra (al posto della mail) o Esc.
  // niente schermo intero del sistema o player del telefono, che hanno animazioni loro che la
  // pagina non può cambiare (sul telefono il fotogramma restava sopra al sito uscendo).
  // chi vuole lo schermo intero vero ha il pulsante nel player di vimeo
  var iframe = document.querySelector(".vimeo_link");
  // la X la crea il codice (così non dipende da un index.html magari ancora vecchio in memoria)
  var chiudi = document.querySelector(".chiudi_film");
  if (!chiudi) {
    chiudi = document.createElement("button");
    chiudi.className = "chiudi_film";
    chiudi.setAttribute("aria-label", "Chiudi il film");
    chiudi.innerHTML = '<svg viewBox="0 0 102 102"><path d="M4 4 98 98M98 4 4 98" fill="none" stroke="currentColor" stroke-width="7.5" stroke-linecap="round" /></svg>';
    iframe.parentNode.insertBefore(chiudi, iframe.nextSibling);
  }
  var aperto = false;
  var attesa = null;

  function nulla() {}

  function apri() {
    // con i crediti aperti un clic sul progetto non apre il film (vedi credits)
    if (aperto || crediti.aperti) return;
    aperto = true;
    clearTimeout(attesa);
    scroll_sezioni.blocca();
    // parte trasparente, poi sfuma fino a vedersi
    iframe.style.transition = "none";
    iframe.classList.remove("visibile");
    iframe.classList.add("riquadro");
    iframe.offsetWidth;
    iframe.style.transition = "";
    iframe.classList.add("visibile");
    document.body.classList.add("film_aperto");
    statistiche.filmAperto();
    player.setMuted(false).catch(nulla);
    player.setCurrentTime(0).catch(nulla);
    // l'iPhone fa partire con l'audio solo un video toccato dentro il player: il tocco sul sito
    // non basta e vimeo lo fa partire muto. in quel caso il film si ferma all'inizio con l'audio
    // attivo, e un tocco sul play del player lo fa partire con l'audio
    player.play().then(function() {
      qualitaMassima();
      return Promise.all([player.getMuted(), player.getVolume()]);
    }).then(function(r) {
      if (aperto && (r[0] || r[1] === 0)) {
        player.pause().catch(nulla);
        player.setCurrentTime(0).catch(nulla);
        player.setMuted(false).catch(nulla);
        if (r[1] === 0) player.setVolume(1).catch(nulla);
      }
    }).catch(nulla);
    qualitaMassima();
  }

  function chiudiFilm() {
    if (!aperto) return;
    aperto = false;
    iframe.classList.remove("visibile");
    document.body.classList.remove("film_aperto");
    player.pause().catch(nulla);
    statistiche.filmChiuso();
    // sotto al film che sfuma il sito è già sulla sezione da cui lo si è aperto
    riprendiSezione();
    scroll_sezioni.sblocca();
    attesa = setTimeout(function() {
      iframe.classList.remove("riquadro");
      riprendiSezione();
    }, 600);
  }

  $("#scrollify_section").on("click", apri);
  chiudi.addEventListener("click", chiudiFilm);
  document.addEventListener("keydown", function(e) {
    if (aperto && e.key == "Escape") chiudiFilm();
  });
  player.on('timeupdate', function(data) {
    statistiche.filmTempo(data.seconds, data.duration);
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
        '\n    <div class="crediti">' + elencoCrediti(p.role) + '</div>' +
        '\n  </div>' +
        '\n</div>';
    }).join("") + "\n";
  });
  var totale_video = categorie.reduce(function(somma, cat) {
    return somma + cat.progetti.length;
  }, 0);
  var sezione = 0;

  riprendiSezione = function() {
    scroll_sezioni.riallinea();
    var n = categorie[sezione].primo + scroll_sezioni.attuale();
    if (sonoVideo() && video(n) && video(n).paused) video(n).play().catch(function() {});
  };

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

  function soloDesktop(fn) {
    return function() {
      if (larghezza() > 1200) fn();
    };
  }

  // la voce del menu dove va la linea: su computer il riquadro sotto cui corre,
  // su telefono la scritta (la linea le sta sopra, larga quanto lei)
  function voceMenu(i) {
    return document.querySelector(categorie[i].menu + (larghezza() > 1200 ? "" : " p"));
  }
  var muoviLinea = lineaMenu(document.querySelector(".selection_line"), function() {
    return voceMenu(sezione);
  });

  function primaDiScorrere(cat, index) {
    var n = cat.primo + index;
    crediti.chiudi();
    statistiche.progetto(cat.chiave, cat.progetti[index]);
    $(".section").removeClass("selected");
    $($(".section").get(index)).addClass("selected");
    document.getElementById("current_page").innerHTML = index + 1;
    if (index > 0) video(n - 1).style.opacity = "0";
    video(n).style.opacity = "1";
    if (sonoVideo()) video(n).play();
    caricaVimeo(cat.vimeo[index]);
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
    crediti.chiudi();
    statistiche.progetto(cat.chiave, cat.progetti[0]);
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
    muoviLinea(voceMenu(i));
    sezione = i;
  }

  // hover del menu, solo su desktop
  $(".header_title").on("mouseover", soloDesktop(function() {
    $("body").css("cursor", "pointer");
  }));
  categorie.forEach(function(cat, i) {
    $(cat.menu).on("mouseover", soloDesktop(function() {
      $("body").css("cursor", "pointer");
      muoviLinea(voceMenu(i));
    }));
  });

  // contatti cliccati (per le statistiche)
  $(".instagram_hover").on("click", function() {
    statistiche.contatto("instagram");
  });
  $(".vimeo_hover").on("click", function() {
    statistiche.contatto("vimeo");
  });
  $(".contacts_container a[href^='mailto']").on("click", function() {
    statistiche.contatto("mail");
  });

  // hover dei contatti, solo su desktop: passando sulla mail il blocco delle altre icone
  // ruota in vista; ogni icona si illumina quando ci passi sopra
  var icone = ["privacy", "instagram", "vimeo"];
  $(".mail").on("mouseenter", soloDesktop(function() {
    $(".header .contacts_container_image").css("transform", "rotateY(0deg)translate(0, -50%)");
    icone.forEach(function(icona) {
      $("." + icona).css("opacity", "0.5");
      $("." + icona + "_hover").css("display", "initial");
    });
    $(".mail").css("opacity", "1");
  }));
  icone.forEach(function(icona) {
    $("." + icona + "_hover").on("mouseenter", soloDesktop(function() {
      $("." + icona).css("opacity", "1");
    }));
    $("." + icona + "_hover").on("mouseleave", soloDesktop(function() {
      $("." + icona).css("opacity", "0.5");
    }));
  });
  $(".mail").on("mouseleave", soloDesktop(function() {
    $(".mail").css("opacity", "0.5");
  }));
  // (con la privacy aperta il blocco resta com'è: gira lui, e lo rimette a posto la privacy)
  $(".contacts_container").on("mouseleave", soloDesktop(function() {
    if (privacyAperta) return;
    $(".header .contacts_container_image").css("transform", "rotateY(90deg)translate(0, -50%)");
    icone.forEach(function(icona) {
      $("." + icona).css("opacity", "0");
      $("." + icona + "_hover").css("display", "none");
    });
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
    muoviLinea(voceMenu(sezione));
  });
  $(".header").on("mouseleave", function() {
    $("body").css("cursor", "none");
  });

  // all'apertura del sito si parte da music
  attivaSezioni(categorie[0]);
  statistiche.progetto(categorie[0].chiave, categorie[0].progetti[0]);
  document.getElementById("total_page").innerHTML = categorie[0].vimeo.length;
  // l'iframe in index.html parte con un film: se il primo progetto è cambiato, carica quello giusto
  if (document.querySelector(".vimeo_link").src.indexOf("/" + categorie[0].vimeo[0]) < 0) {
    caricaVimeo(categorie[0].vimeo[0]);
  }
}

// CREDITI DI UN PROGETTO: ogni riga di "role" in progetti.json è "ruolo @nome" (o "Ruolo: nome")
// e diventa una riga a due colonne, il ruolo a sinistra e i nomi a destra. una riga senza ruolo
// che segue una finita con "+" (una lista di nomi andata a capo) si attacca a quella.
// i nomi con la @ sono link al loro profilo instagram
function elencoCrediti(righe) {
  var elenco = [];
  (righe || []).forEach(function(r) {
    r = String(r).trim();
    if (!r) return;
    var duepunti = r.indexOf(":");
    var chiocciola = r.indexOf("@");
    var riga = ["", r];
    if (duepunti > 0 && (chiocciola < 0 || duepunti < chiocciola)) {
      riga = [r.slice(0, duepunti).trim(), r.slice(duepunti + 1).trim()];
    } else if (chiocciola > 0) {
      riga = [r.slice(0, chiocciola).trim(), r.slice(chiocciola).trim()];
    }
    var prima = elenco[elenco.length - 1];
    if (!riga[0] && prima && /\+$/.test(prima[1])) prima[1] += " " + riga[1];
    else elenco.push(riga);
  });
  return '<div class="crediti_elenco">' + elenco.map(function(riga) {
    return '<div class="crediti_riga' + (riga[0] ? '' : ' senza_ruolo') + '"><div class="crediti_dentro">' +
      (riga[0] ? '<span class="crediti_ruolo">' + testo(riga[0]) + '</span>' : '') +
      '<span class="crediti_nomi">' + nomiCrediti(riga[1]) + '</span></div></div>';
  }).join("") + '</div>';
}

function nomiCrediti(s) {
  return testo(s).replace(/(^|[\s+(,\/|])@([A-Za-z0-9._]+)/g, function(tutto, prima, nome) {
    // un nome instagram non finisce col punto: quello è punteggiatura
    var profilo = nome.replace(/\.+$/, "");
    return prima + '<a href="https://www.instagram.com/' + profilo + '/" target="_blank" rel="noopener">@' +
      profilo + '</a>' + nome.slice(profilo.length);
  }).replace(/ \+ /g, '&nbsp;<span class="crediti_piu">+</span> '); // il + resta col nome prima
}

// CREDITI: si aprono con un clic su "CREDITS", su computer e su telefono. titolo e sottotitolo
// salgono sotto l'header, il video dietro si scurisce e le righe dei crediti salgono dal basso una
// dopo l'altra (le animazioni sono nel css). i nomi con la @ aprono instagram.
// si chiudono con la X (al posto della mail, come per la privacy e il film), con Esc, con un clic
// fuori dalla lista o di nuovo su "CREDITS"; passando a un altro progetto si chiudono da soli.
// se la lista è più lunga dello spazio, rotella e dito prima la fanno scorrere
var crediti = {
  aperti: false,
  chiudi: function() {}
};

function credits() {
  var etichetta = document.querySelector(".credits");
  // la X la crea il codice, come quella del film: sta nell'header al posto della mail
  var x = document.querySelector(".chiudi_crediti");
  if (!x) {
    x = document.createElement("button");
    x.className = "chiudi_crediti";
    x.setAttribute("aria-label", "Chiudi i crediti");
    x.innerHTML = '<svg viewBox="0 0 102 102"><path d="M4 4 98 98M98 4 4 98" fill="none" stroke="currentColor" stroke-width="7.5" stroke-linecap="round" /></svg>';
    document.querySelector(".header").appendChild(x);
  }
  var attesa = null;

  function computer() {
    return window.innerWidth > 1200;
  }

  // l'altezza su cui il css misura le posizioni: vh su computer, dvh sul telefono. non sempre
  // è window.innerHeight (in alcuni browser dentro le app non lo è): la si chiede al browser
  function altezzaCss(pc) {
    var prova = document.createElement("div");
    prova.style.cssText = "position: fixed; top: 0; width: 0; visibility: hidden; height: 100" + (pc ? "vh" : "dvh");
    document.body.appendChild(prova);
    var h = prova.offsetHeight;
    document.body.removeChild(prova);
    return h || window.innerHeight;
  }

  // le misure per la sezione sullo schermo: di quanto salgono titolo e sottotitolo (--salita),
  // dove comincia e fin dove arriva la lista, quanto è larga la colonna dei ruoli (--ruolo),
  // su computer una o due colonne, e quando parte ogni riga (--entra, dall'alto in basso)
  // e quando scende chiudendo (--esce, dal basso in alto)
  function disponi() {
    var sezione = document.querySelector("#scrollify_section .section.selected");
    var lista = sezione && sezione.querySelector(".crediti");
    if (!lista) return;
    var sotto = sezione.querySelector(".subtitle");
    var elenco = lista.querySelector(".crediti_elenco");
    var righe = Array.prototype.slice.call(lista.querySelectorAll(".crediti_riga"));
    var pc = computer();
    var h = altezzaCss(pc);
    var salita = -Math.round((pc ? 0.22 : 0.18) * h);
    sezione.style.setProperty("--salita", salita + "px");
    var base = sotto.offsetParent.getBoundingClientRect().top;
    var inizio = Math.round(base + sotto.offsetTop + salita + sotto.offsetHeight + (pc ? 0.02 : 0.025) * h);
    var fine = Math.round((pc ? 0.875 : 0.865) * h);
    lista.style.top = inizio + "px";
    lista.style.maxHeight = Math.max(fine - inizio, 0.15 * h) + "px";
    // colonna dei ruoli larga quanto il ruolo più lungo, al massimo il 40% (36% sul telefono)
    lista.classList.remove("due", "scorre");
    lista.style.setProperty("--ruolo", "max-content");
    var ruolo = 0;
    lista.querySelectorAll(".crediti_ruolo").forEach(function(r) {
      ruolo = Math.max(ruolo, r.getBoundingClientRect().width);
    });
    lista.style.setProperty("--ruolo", Math.ceil(Math.min(ruolo, elenco.clientWidth * (pc ? 0.4 : 0.36))) + "px");
    if (pc && elenco.offsetHeight > lista.clientHeight + 1) lista.classList.add("due");
    if (elenco.offsetHeight > lista.clientHeight + 1) lista.classList.add("scorre");
    // l'onda: la prima riga parte quando il sottotitolo che sale le è passato sopra,
    // le altre una dopo l'altra, tutte in poco più di mezzo secondo
    var cima = elenco.getBoundingClientRect().top;
    var linea = parseFloat(getComputedStyle(elenco).lineHeight) || 20;
    var altezze = righe.map(function(r) {
      return (r.getBoundingClientRect().top - cima) / linea;
    });
    var ultima = Math.max.apply(null, altezze.concat([1]));
    var passo = Math.min(40, 600 / ultima);
    var passoUscita = Math.min(10, 120 / ultima);
    righe.forEach(function(r, i) {
      r.style.setProperty("--entra", Math.round(520 + altezze[i] * passo) + "ms");
      r.style.setProperty("--esce", Math.round((ultima - altezze[i]) * passoUscita) + "ms");
    });
  }

  function apri() {
    if (crediti.aperti || privacyAperta) return;
    crediti.aperti = true;
    clearTimeout(attesa);
    disponi();
    document.body.classList.add("crediti_aperti");
    statistiche.crediti();
  }

  function chiudi() {
    if (!crediti.aperti) return;
    crediti.aperti = false;
    document.body.classList.remove("crediti_aperti");
  }
  crediti.chiudi = chiudi;

  $(".hover_credits").on("click", function() {
    if (crediti.aperti) chiudi();
    else apri();
  });
  $(".hover_credits").on("mouseenter", function() {
    etichetta.classList.add("sopra");
  });
  $(".hover_credits").on("mouseleave", function() {
    etichetta.classList.remove("sopra");
  });
  x.addEventListener("click", chiudi);
  // con i crediti aperti un clic sul progetto fuori dalla lista li chiude e basta: si ferma
  // prima che arrivi a open_vimeo. dentro la lista il film non parte perché i crediti sono aperti
  document.addEventListener("click", function(e) {
    if (!crediti.aperti || !e.target.closest) return;
    if (e.target.closest("#scrollify_section") && !e.target.closest(".crediti")) {
      e.stopPropagation();
      chiudi();
    }
  }, true);
  document.addEventListener("keydown", function(e) {
    if (crediti.aperti && !privacyAperta && e.key == "Escape") chiudi();
  });
  // girando il telefono o cambiando la finestra: misure di nuovo, dopo che le sezioni si sono riallineate
  window.addEventListener("resize", function() {
    if (!crediti.aperti) return;
    clearTimeout(attesa);
    attesa = setTimeout(disponi, 450);
  });
  // la lista lunga scorre lei finché può, poi il gesto torna a cambiare progetto
  scroll_sezioni.lasciaScorrere(function(elemento, verso) {
    var lista = crediti.aperti && elemento && elemento.closest ? elemento.closest(".crediti") : null;
    if (!lista) return false;
    if (verso > 0) return lista.scrollTop > 0;
    return lista.scrollTop + lista.clientHeight < lista.scrollHeight - 1;
  });
}

// LINEA DEL MENU: scorre da una voce all'altra (col mouse su computer, col tocco su telefono).
// si muove con transform (niente ricalcolo della pagina a ogni fotogramma) su una curva morbida
// con un arrivo lungo; il bordo davanti parte un attimo prima di quello dietro, così la linea
// si allunga appena mentre corre e torna della sua misura all'arrivo.
// la linea nel css è larga 100px: la misura vera la dà scaleX.
// attuale() = la voce dove deve stare adesso, per rimetterla a posto dopo un resize
function lineaMenu(linea, attuale) {
  var BASE = 100;
  var DURATA = 650;
  var curva = cubicBezier(0.35, 0, 0.1, 1);
  var corsa = null;
  var meta = null;
  var ferma = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function trasforma(sx, dx) {
    return "translateX(" + sx + "px) scaleX(" + Math.max(dx - sx, 0) / BASE + ")";
  }

  // dove sono i bordi adesso, anche a metà corsa
  function bordi() {
    var t = getComputedStyle(linea).transform;
    if (!t || t == "none") return null;
    var m = new DOMMatrixReadOnly(t);
    return {
      sx: m.e,
      dx: m.e + m.a * BASE
    };
  }

  function vai(voce, subito) {
    if (!voce) return;
    var b = voce.getBoundingClientRect();
    var c = linea.offsetParent ? linea.offsetParent.getBoundingClientRect() : {
      left: 0
    };
    var arrivo = {
      sx: b.left - c.left,
      dx: b.right - c.left
    };
    // già lì o già in viaggio verso lì
    if (meta && Math.abs(meta.sx - arrivo.sx) < 0.5 && Math.abs(meta.dx - arrivo.dx) < 0.5 && !subito) return;
    var da = bordi();
    if (corsa) corsa.cancel();
    corsa = null;
    meta = arrivo;
    if (subito || ferma || !da || !linea.animate) {
      linea.style.transform = trasforma(arrivo.sx, arrivo.dx);
      return;
    }
    // quanto parte prima il bordo davanti: poco, e ancora meno sulle distanze lunghe
    var distanza = Math.abs((arrivo.sx + arrivo.dx) - (da.sx + da.dx)) / 2;
    var anticipo = distanza > 0 ? 0.03 * Math.min(1, 100 / distanza) : 0;
    var aDestra = arrivo.sx + arrivo.dx > da.sx + da.dx;
    function davanti(t) {
      return curva(Math.min(1, t / (1 - anticipo)));
    }
    function dietro(t) {
      return curva(Math.max(0, (t - anticipo) / (1 - anticipo)));
    }
    var fotogrammi = [];
    for (var i = 0; i <= 40; i++) {
      var t = i / 40;
      var ps = aDestra ? dietro(t) : davanti(t);
      var pd = aDestra ? davanti(t) : dietro(t);
      fotogrammi.push({
        transform: trasforma(da.sx + (arrivo.sx - da.sx) * ps, da.dx + (arrivo.dx - da.dx) * pd)
      });
    }
    linea.style.transform = trasforma(arrivo.sx, arrivo.dx);
    corsa = linea.animate(fotogrammi, {
      duration: DURATA,
      easing: "linear"
    });
    corsa.onfinish = function() {
      corsa = null;
    };
  }

  var attesa = null;
  function aPosto() {
    meta = null;
    vai(attuale(), true);
  }
  window.addEventListener("resize", function() {
    clearTimeout(attesa);
    attesa = setTimeout(aPosto, 150);
  });
  // le scritte cambiano larghezza quando arriva il font
  if (document.fonts) document.fonts.ready.then(aPosto);
  aPosto();
  vai.aPosto = aPosto;
  return vai;
}

// la curva cubic-bezier del css, in javascript (x = tempo, risultato = avanzamento)
function cubicBezier(x1, y1, x2, y2) {
  function punto(a1, a2, t) {
    return 3 * a1 * t * (1 - t) * (1 - t) + 3 * a2 * t * t * (1 - t) + t * t * t;
  }
  return function(x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    var basso = 0,
      alto = 1,
      t = x;
    for (var i = 0; i < 24; i++) {
      t = (basso + alto) / 2;
      if (punto(x1, x2, t) < x) basso = t;
      else alto = t;
    }
    return punto(y1, y2, t);
  };
}

// PRIVACY: pannello sopra il sito con lo stesso header; i testi stanno in privacy/index.html.
// si apre dall'icona documento o con matteodelia.com/#privacy (ci porta anche matteodelia.com/privacy).
// la X, il titolo, Esc o il tasto indietro lo chiudono e il sito è dove l'avevi lasciato
var privacyAperta = false;

function privacy() {
  var pannello = document.getElementById("privacy_pannello");
  var testi = null;
  var posizione = 0;
  var nascondi = null;

  function caricaTesti() {
    if (!testi) testi = fetch("privacy/").then(function(risposta) {
      return risposta.text();
    }).then(function(html) {
      var main = new DOMParser().parseFromString(html, "text/html").querySelector("main");
      pannello.querySelector(".privacy_corpo").innerHTML = main.innerHTML;
    }).catch(function() {
      testi = null;
    });
    return testi;
  }

  // lingua: quella del browser finché non se ne sceglie un'altra.
  // la linea del menu è la stessa del sito: va sulla lingua scelta (e su computer
  // su quella sotto il mouse), come riquadro su computer e come scritta su telefono
  function lingua() {
    return pannello.getAttribute("data-lingua");
  }

  function voce(l) {
    var computer = window.innerWidth > 1200;
    return pannello.querySelector('.privacy_testa a[data-lingua="' + l + '"]' + (computer ? "" : " p"));
  }
  // il blocco dei contatti del sito gira via e al suo posto arriva la X (css).
  // nella testata del pannello ce n'è una copia nera che gira insieme, così durante la
  // dissolvenza si vede un blocco solo che gira e cambia colore. su computer le icone della
  // copia hanno l'opacità di quelle del sito (gliela dà lo stesso codice del passaggio del mouse)
  var blocco = document.querySelector(".header .contacts_container_image");
  var testa = pannello.querySelector(".privacy_testa");
  if (!testa.querySelector(".privacy_contatti")) {
    var copia = document.createElement("div");
    copia.className = "privacy_contatti";
    copia.setAttribute("aria-hidden", "true");
    copia.innerHTML = '<div class="contacts_container_image">' +
      blocco.innerHTML + '</div>' +
      '<div class="contacts_container"><img src="img/contacts/mail.png" alt="" class="mail"></div>';
    testa.insertBefore(copia, testa.querySelector(".privacy_chiudi"));
  }

  pannello.setAttribute("data-lingua", (navigator.language || "it").slice(0, 2) == "it" ? "it" : "en");
  var linea = lineaMenu(pannello.querySelector(".privacy_linea"), function() {
    return voce(lingua());
  });
  $(".privacy_testa ul a").on("click", function() {
    pannello.setAttribute("data-lingua", this.getAttribute("data-lingua"));
    linea(voce(lingua()));
  });
  $(".privacy_testa ul a").on("mouseover", function() {
    if (window.innerWidth > 1200) linea(voce(this.getAttribute("data-lingua")));
  });
  $(".privacy_testa ul").on("mouseleave", function() {
    linea(voce(lingua()));
  });

  // compare in dissolvenza sul posto (css). subito = senza dissolvenza, quando si arriva
  // da matteodelia.com/#privacy (è già sotto il loader)
  function apri(subito) {
    if (privacyAperta) return;
    privacyAperta = true;
    statistiche.privacy(true);
    caricaTesti();
    posizione = window.pageYOffset;
    scroll_sezioni.blocca();
    clearTimeout(nascondi);
    pannello.hidden = false;
    pannello.scrollTop = 0;
    linea.aPosto();
    // su computer il blocco è aperto (ci si è passati sopra per cliccare la privacy): gli si dà
    // la stessa forma della copia (identico a vederlo), così girano uguali
    if (window.innerWidth > 1200 && blocco.style.transform.indexOf("rotateY(0deg)") === 0) {
      blocco.style.transition = "none";
      blocco.style.transform = "translate(0, -50%) perspective(55vh) rotateY(0deg)";
      blocco.offsetWidth;
      blocco.style.transition = "";
    }
    if (subito) pannello.style.transition = "none";
    pannello.offsetHeight;
    pannello.classList.add("aperto");
    pannello.offsetHeight;
    pannello.style.transition = "";
    document.body.classList.add("privacy_aperta");
    pannello.focus({
      preventScroll: true
    });
  }

  function chiudi() {
    if (!privacyAperta) return;
    privacyAperta = false;
    statistiche.privacy(false);
    pannello.classList.remove("aperto");
    pannello.blur();
    // su computer torna solo la mail, come a riposo: il blocco si richiude di colpo sotto il
    // pannello, senza vedersi (passandoci sopra si riapre come sempre)
    var riposo = window.innerWidth > 1200;
    var icone = $(blocco).find("img");
    if (riposo) {
      blocco.style.transition = "none";
      icone.css("transition", "none");
      blocco.style.transform = "rotateY(90deg)translate(0, -50%)";
      ["privacy", "instagram", "vimeo"].forEach(function(icona) {
        $("." + icona).css("opacity", "0");
        $("." + icona + "_hover").css("display", "none");
      });
    }
    document.body.classList.remove("privacy_aperta");
    if (riposo) {
      blocco.offsetWidth;
      blocco.style.transition = "";
      icone.css("transition", "");
    }
    nascondi = setTimeout(function() {
      pannello.hidden = true;
    }, 500);
    window.scrollTo(0, posizione);
    scroll_sezioni.sblocca();
  }

  // #privacy nell'indirizzo, così il tasto indietro del telefono chiude il pannello
  $(".privacy_hover").on("click", function(e) {
    e.preventDefault();
    apri();
    history.pushState({
      privacy: true
    }, "", "#privacy");
  });

  function esci() {
    if (history.state && history.state.privacy) {
      history.back();
    } else {
      chiudi();
      history.replaceState(null, "", location.pathname + location.search);
    }
  }
  $(".privacy_chiudi, .privacy_titolo").on("click", esci);
  $(document).on("keydown", function(e) {
    if (privacyAperta && e.key == "Escape") esci();
  });
  window.addEventListener("popstate", function() {
    if (location.hash == "#privacy") apri();
    else chiudi();
  });

  if (location.hash == "#privacy") apri(true);
  // i testi si scaricano quando il sito ha finito di caricare, così il pannello si apre già pieno
  else setTimeout(caricaTesti, 7000);
}

// STATISTICHE: senza cookie e senza dati personali. Si contano in forma anonima
// i progetti guardati e per quanto, i film aperti e per quanto vengono guardati, i crediti,
// i contatti e la privacy. Li riceve la raccolta su Cloudflare (repository privato "insight",
// cartella raccolta), l'archivio li copia ogni notte e l'editor li mostra nella sezione Insight.
// Non si conta niente in locale, nell'anteprima dell'editor e dai dispositivi dove si è
// aperto l'editor (lì c'è "statistiche_escludi" nella memoria del browser).
//
// eventi:  progetto { progetto, categoria, secondi, ritorno? }  quando si lascia un progetto
//          film     { progetto, categoria }                     film aperto a schermo intero
//          visione  { progetto, categoria, secondi, durata, percentuale, ritorno? }
//          crediti  { progetto, categoria }
//          contatto { tipo: mail | instagram | vimeo }
//          privacy
// "ritorno" = seguito di una visita già contata (chi era uscito dalla pagina ed è tornato):
// aggiunge tempo ma non un'altra visualizzazione
var RACCOLTA = "https://matteodelia-visite.raccolta-statistiche.workers.dev/e";

var statistiche = (function() {
  var MASSIMO_FERMO = 600; // oltre 10 minuti di fila sullo stesso progetto non si conta
  var attuale = null; // progetto sullo schermo: { progetto, categoria, secondi, da, ritorno }
  var film = null; // film a schermo intero: { progetto, categoria, secondi, ultimo, massimo, durata, ritorno }
  var pause = {
    loader: true
  };
  // codice casuale di questa visita: vive solo in memoria, finché la pagina resta aperta
  var visita = "";
  var cifre = new Uint8Array(12);
  (window.crypto || window.msCrypto).getRandomValues(cifre);
  for (var i = 0; i < cifre.length; i++) visita += ("0" + cifre[i].toString(16)).slice(-2);

  function escluso() {
    try {
      return !!(localStorage.getItem("statistiche_escludi") || localStorage.getItem("umami.disabled"));
    } catch (e) {
      return false;
    }
  }

  function attive() {
    return /(^|\.)matteodelia\.com$/.test(location.hostname) &&
      location.search.indexOf("anteprima") < 0 && !escluso();
  }

  // sendBeacon arriva anche se la pagina si sta chiudendo
  function spedisci(corpo) {
    var testo = JSON.stringify(corpo);
    if (navigator.sendBeacon && navigator.sendBeacon(RACCOLTA, testo)) return;
    fetch(RACCOLTA, {
      method: "POST",
      body: testo,
      keepalive: true,
      mode: "no-cors"
    }).catch(function() {});
  }

  function carica() {
    if (!attive()) return;
    spedisci({
      n: "visita",
      v: visita,
      r: document.referrer,
      s: screen.width + "x" + screen.height,
      l: navigator.language || ""
    });
  }

  function invia(nome, dati) {
    if (!attive()) return;
    spedisci({
      n: nome,
      v: visita,
      d: dati || {}
    });
  }

  // il progetto si riconosce dal nome del suo video (img/music/cometelospiego.mp4 -> cometelospiego):
  // resta uguale anche se nell'editor cambiano titolo o posizione
  function chiave(p) {
    var nome = (p && p.img && p.img.video || "").split("/").pop().replace(/\.[^.]*$/, "");
    if (!nome) nome = String(p && p.title || "senza-titolo").toLowerCase().normalize("NFD")
      .replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return nome;
  }

  function adesso() {
    return Date.now() / 1000;
  }

  function inPausa() {
    for (var motivo in pause)
      if (pause[motivo]) return true;
    return false;
  }

  // il tempo scorre solo con la pagina in vista, senza loader, film o privacy davanti
  function ferma() {
    if (attuale && attuale.da) attuale.secondi += Math.min(adesso() - attuale.da, MASSIMO_FERMO);
    if (attuale) attuale.da = 0;
  }

  function riparti() {
    if (attuale && !attuale.da && !inPausa()) attuale.da = adesso();
  }

  function pausa(motivo, attiva) {
    pause[motivo] = attiva;
    if (inPausa()) ferma();
    else riparti();
  }

  // manda il tempo passato sul progetto; da un secondo in su conta come visualizzazione
  function registraProgetto() {
    ferma();
    if (!attuale || attuale.secondi < 1) return;
    var dati = {
      progetto: attuale.progetto,
      categoria: attuale.categoria,
      secondi: Math.round(attuale.secondi)
    };
    if (attuale.ritorno) dati.ritorno = 1;
    invia("progetto", dati);
    attuale.secondi = 0;
    attuale.ritorno = true;
  }

  function registraVisione() {
    if (!film || film.secondi < 1) return;
    var dati = {
      progetto: film.progetto,
      categoria: film.categoria,
      secondi: Math.round(film.secondi),
      durata: Math.round(film.durata),
      percentuale: film.durata ? Math.min(100, Math.round(film.massimo / film.durata * 100)) : 0
    };
    if (film.ritorno) dati.ritorno = 1;
    invia("visione", dati);
    film.secondi = 0;
    film.ritorno = true;
  }

  // chi esce dalla pagina (cambia app, chiude la scheda) potrebbe non tornare:
  // si manda subito quello che c'è, e se torna si continua come "ritorno"
  document.addEventListener("visibilitychange", function() {
    var nascosta = document.visibilityState == "hidden";
    pausa("nascosta", nascosta);
    if (nascosta) {
      registraProgetto();
      registraVisione();
    }
  });

  return {
    carica: carica,

    // chiamata quando il loader si chiude
    pronto: function() {
      pausa("loader", false);
    },

    // il progetto p della categoria è sullo schermo
    progetto: function(categoria, p) {
      if (!p) return;
      var nome = chiave(p);
      if (attuale && attuale.progetto == nome && attuale.categoria == categoria) return;
      registraProgetto();
      attuale = {
        progetto: nome,
        categoria: categoria,
        secondi: 0,
        da: 0,
        ritorno: false
      };
      riparti();
    },

    filmAperto: function() {
      if (!attuale || film) return;
      pausa("film", true);
      film = {
        progetto: attuale.progetto,
        categoria: attuale.categoria,
        secondi: 0,
        ultimo: null,
        massimo: 0,
        durata: 0,
        ritorno: false
      };
      invia("film", {
        progetto: film.progetto,
        categoria: film.categoria
      });
    },

    // conta solo i secondi davvero guardati: i salti in avanti o indietro non si sommano
    filmTempo: function(secondi, durata) {
      if (!film) return;
      if (film.ultimo !== null) {
        var passo = secondi - film.ultimo;
        if (passo > 0 && passo < 2) film.secondi += passo;
      }
      film.ultimo = secondi;
      film.massimo = Math.max(film.massimo, secondi);
      if (durata) film.durata = durata;
    },

    filmChiuso: function() {
      if (!film) return;
      registraVisione();
      film = null;
      pausa("film", false);
    },

    crediti: function() {
      if (attuale) invia("crediti", {
        progetto: attuale.progetto,
        categoria: attuale.categoria
      });
    },

    contatto: function(tipo) {
      invia("contatto", {
        tipo: tipo
      });
    },

    privacy: function(aperta) {
      if (aperta) invia("privacy");
      pausa("privacy", aperta);
    }
  };
})();

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
  // una lista che scorre dentro la pagina (i crediti) può tenersi rotella e dito:
  // interno(elemento sotto il puntatore, verso) è vero se scorre lei. verso > 0 = in su
  var interno = function() {
    return false;
  };

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
  var gestoInterno = false; // questo gesto ha fatto scorrere la lista dei crediti

  function media(n) {
    var ultimi = storia.slice(Math.max(storia.length - n, 1));
    var somma = 0;
    for (var k = 0; k < ultimi.length; k++) somma += ultimi[k];
    return Math.ceil(somma / n);
  }

  function rotella(e) {
    if (bloccato) return;
    var ora = Date.now();
    var delta = e.wheelDelta || -e.deltaY || -e.detail;
    if (storia.length > 149) storia.shift();
    storia.push(Math.abs(delta));
    // più di 200ms di pausa: è un gesto nuovo
    if (ora - ultimaRotella > 200) {
      storia = [];
      gestoInterno = false;
    }
    ultimaRotella = ora;
    // scorre la lista. un gesto che l'ha fatta scorrere non cambia progetto nemmeno quando
    // arriva in fondo (l'inerzia del trackpad): per andare avanti ci vuole un gesto nuovo
    if (interno(e.target, delta)) {
      gestoInterno = true;
      return;
    }
    e.preventDefault();
    if (gestoInterno || inMovimento || media(70) > media(10)) return;
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
    verticale: false,
    bersaglio: null,
    dentro: null
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
      tocco.bersaglio = e.target;
      tocco.dentro = null;
    }
    if (e.type == "touchstart" || e.type == "touchmove") {
      tocco.y = e.touches[0].pageY;
      tocco.x = e.touches[0].pageX;
      var dy = tocco.y - tocco.inizioY;
      var dx = tocco.x - tocco.inizioX;
      if (dy !== 0 && Math.abs(dy) > Math.abs(dx)) {
        // il primo movimento decide: se la lista può scorrere in quel verso il gesto è suo
        if (tocco.dentro === null) tocco.dentro = interno(tocco.bersaglio, dy);
        if (tocco.dentro) return;
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

  function riallinea() {
    sistemaAltezze();
    if (inMovimento) chiudiMossa();
    if (sezioni[corrente]) window.scrollTo(0, posizione(corrente));
  }

  function ridimensiona() {
    clearTimeout(attesaResize);
    attesaResize = setTimeout(riallinea, 400);
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
    // la sezione sullo schermo (0 = la prima della categoria)
    attuale: function() {
      return corrente;
    },
    // di nuovo esattamente sulla sezione di adesso (dopo il film a schermo intero)
    riallinea: riallinea,
    lasciaScorrere: function(fn) {
      interno = fn;
    },
    blocca: function() {
      bloccato = true;
    },
    sblocca: function() {
      bloccato = false;
    }
  };
})();
