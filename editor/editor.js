// EDITOR DEI CONTENUTI DI MATTEODELIA.COM
// legge e scrive progetti.json direttamente nel repository GitHub del sito.
// le modifiche restano in bozza su questo dispositivo finché non si preme "Pubblica":
// a quel punto testi, ordine, video e foto nuovi vanno online in un unico aggiornamento.
(function() {
  "use strict";

  var PROPRIETARIO = "matteodelia";
  var REPOSITORY = "matteodelia.github.io";
  var RAMO = "main";
  var FILE_DATI = "progetti.json";
  var CATEGORIE = [{
    chiave: "music",
    nome: "Music"
  }, {
    chiave: "documentary",
    nome: "Documentary"
  }, {
    chiave: "brand",
    nome: "Brand"
  }, {
    chiave: "narrative",
    nome: "Narrative"
  }];
  // per i test si può puntare a un finto GitHub locale
  var API = leggi("editor_api") || "https://api.github.com";

  var chiave = leggi("editor_chiave");
  var base = null; // versione pubblicata: { commit, albero, file }
  var pubblicati = null; // dati pubblicati, per capire cosa è cambiato
  var dati = null; // la bozza
  var nuoviFile = {}; // percorso -> { blob, url, pubblicato } video e foto caricati da qui
  var selezione = null; // { cat, i } progetto aperto nel pannello
  var inPubblicazione = false;

  var $ = function(id) {
    return document.getElementById(id);
  };

  // ---------- MEMORIA DEL DISPOSITIVO ----------

  function leggi(nome) {
    try {
      return localStorage.getItem(nome);
    } catch (e) {
      return null;
    }
  }

  function scrivi(nome, valore) {
    try {
      if (valore === null) localStorage.removeItem(nome);
      else localStorage.setItem(nome, valore);
    } catch (e) {}
  }

  function copia(x) {
    return JSON.parse(JSON.stringify(x));
  }

  function uguali(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  // ---------- GITHUB ----------

  function github(metodo, percorso, corpo, grezzo) {
    var opzioni = {
      method: metodo,
      cache: "no-store",
      headers: {
        "Authorization": "Bearer " + chiave,
        "Accept": grezzo ? "application/vnd.github.raw+json" : "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    };
    if (corpo !== undefined) {
      opzioni.headers["Content-Type"] = "application/json";
      opzioni.body = JSON.stringify(corpo);
    }
    return fetch(API + "/repos/" + PROPRIETARIO + "/" + REPOSITORY + percorso, opzioni).then(function(r) {
      if (!r.ok) {
        var errore = new Error(r.status == 401 ? "Chiave non valida o scaduta." :
          r.status == 403 || r.status == 404 ? "La chiave non ha accesso al repository del sito." :
          "GitHub ha risposto con un errore (" + r.status + ").");
        errore.stato = r.status;
        throw errore;
      }
      return grezzo ? r.text() : r.json();
    });
  }

  // la versione pubblicata: ultimo commit, elenco dei file e progetti.json
  function leggiVersionePubblicata() {
    return github("GET", "/git/ref/heads/" + RAMO).then(function(ref) {
      var commit = ref.object.sha;
      return github("GET", "/git/commits/" + commit).then(function(c) {
        return Promise.all([
          github("GET", "/contents/" + FILE_DATI + "?ref=" + commit, undefined, true),
          github("GET", "/git/trees/" + c.tree.sha + "?recursive=1")
        ]).then(function(r) {
          var file = {};
          r[1].tree.forEach(function(x) {
            if (x.type == "blob") file[x.path] = true;
          });
          return {
            commit: commit,
            albero: c.tree.sha,
            file: file,
            dati: JSON.parse(r[0])
          };
        });
      });
    });
  }

  // ---------- AVVIO E ACCESSO ----------

  function mostraAccesso(errore) {
    $("editor").hidden = true;
    $("accesso").hidden = false;
    $("accesso-errore").hidden = !errore;
    $("accesso-errore").textContent = errore || "";
    setTimeout(function() {
      $("accesso-chiave").focus();
    }, 50);
  }

  $("accesso-form").addEventListener("submit", function(e) {
    e.preventDefault();
    var valore = $("accesso-chiave").value.trim();
    if (!valore) return;
    chiave = valore;
    github("GET", "").then(function() {
      scrivi("editor_chiave", chiave);
      $("accesso-chiave").value = "";
      avvia();
    }).catch(function(err) {
      chiave = null;
      mostraAccesso(err.message);
    });
  });

  function avvia() {
    if (!chiave) return mostraAccesso();
    $("accesso").hidden = true;
    $("editor").hidden = false;
    impostaStato("Caricamento da GitHub…");
    leggiVersionePubblicata().then(function(v) {
      base = {
        commit: v.commit,
        albero: v.albero,
        file: v.file
      };
      pubblicati = v.dati;
      dati = copia(v.dati);
      CATEGORIE.forEach(function(c) {
        if (!dati[c.chiave]) dati[c.chiave] = [];
      });
      var bozza = null;
      try {
        bozza = JSON.parse(leggi("editor_bozza"));
      } catch (e) {}
      if (bozza && bozza.dati && !uguali(bozza.dati, bozza.pubblicati)) {
        if (bozza.base == v.commit) {
          dati = bozza.dati;
          avviso("Bozza ripristinata: le modifiche non ancora pubblicate sono qui.");
          dopoAvvio();
        } else {
          dialogo("Riprendere la bozza?", "Su questo dispositivo ci sono modifiche non pubblicate fatte su una versione precedente del sito. Nel frattempo il sito è stato aggiornato da un'altra parte: se le riprendi, alla pubblicazione sostituiranno quella versione.", {
            ok: "Riprendi la bozza",
            annulla: "Scartala"
          }).then(function(si) {
            if (si) dati = bozza.dati;
            dopoAvvio();
          });
        }
      } else {
        dopoAvvio();
      }
    }).catch(function(err) {
      if (err.stato == 401 || err.stato == 403 || err.stato == 404) {
        scrivi("editor_chiave", null);
        chiave = null;
        mostraAccesso(err.message);
      } else {
        impostaStato("Impossibile leggere da GitHub");
        avviso(err.message + " Controlla la connessione e riprova.", true);
      }
    });
  }

  function dopoAvvio() {
    salvaBozza();
    disegna();
  }

  // ---------- BOZZA ----------

  function haModifiche() {
    return !uguali(dati, pubblicati);
  }

  function salvaBozza() {
    if (!dati) return;
    scrivi("editor_bozza", haModifiche() ? JSON.stringify({
      base: base.commit,
      pubblicati: pubblicati,
      dati: dati
    }) : null);
    aggiornaStato();
  }

  function aggiornaStato() {
    var modificato = haModifiche();
    impostaStato(modificato ? "Modifiche non pubblicate" : "Tutto pubblicato", modificato);
    $("bottone-pubblica").disabled = !modificato || inPubblicazione;
  }

  function impostaStato(testo, modificato) {
    var s = $("stato");
    s.className = "stato" + (modificato ? " modificato" : "");
    s.textContent = "";
    var punto = document.createElement("span");
    punto.className = "punto";
    s.appendChild(punto);
    s.appendChild(document.createTextNode(testo));
  }

  // ---------- UTILITÀ ----------

  function el(tag, classe, testo) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (testo !== undefined) e.textContent = testo;
    return e;
  }

  function nomeCategoria(chiave) {
    for (var k = 0; k < CATEGORIE.length; k++)
      if (CATEGORIE[k].chiave == chiave) return CATEGORIE[k].nome;
    return chiave;
  }

  function urlFile(percorso) {
    if (!percorso) return "";
    if (nuoviFile[percorso]) return nuoviFile[percorso].url;
    return "../" + percorso;
  }

  // il file c'è online o è stato scelto in questa sessione
  function esiste(percorso) {
    return !!(nuoviFile[percorso] || (base && base.file[percorso]));
  }

  function mancanti(p) {
    var m = [];
    if (!p.title) m.push("title");
    if (!p.img.video) m.push("video");
    else if (!esiste(p.img.video)) m.push("video (da ricaricare)");
    if (!p.img.foto) m.push("foto");
    else if (!esiste(p.img.foto)) m.push("foto (da ricaricare)");
    if (!p.vimeo) m.push("Vimeo");
    return m;
  }

  function nuovoProgetto() {
    return {
      title: "",
      subtitle: "",
      description: "",
      role: [],
      img: {
        video: "",
        foto: ""
      },
      vimeo: null
    };
  }

  // tutti i video e le foto usati dai progetti
  function percorsiUsati(d) {
    var usati = {};
    CATEGORIE.forEach(function(c) {
      (d[c.chiave] || []).forEach(function(p) {
        if (p.img.video) usati[p.img.video] = true;
        if (p.img.foto) usati[p.img.foto] = true;
      });
    });
    return usati;
  }

  // nome file pulito e mai già esistente, nella cartella della categoria
  function percorsoNuovo(cat, nomeFile) {
    var punto = nomeFile.lastIndexOf(".");
    var estensione = punto > 0 ? nomeFile.slice(punto + 1).toLowerCase() : "";
    var nome = (punto > 0 ? nomeFile.slice(0, punto) : nomeFile).normalize("NFD").replace(/[̀-ͯ]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "file";
    if (estensione == "jpeg") estensione = "jpg";
    var usati = percorsiUsati(dati);
    var cartella = "img/" + cat + "/";
    var percorso = cartella + nome + "." + estensione;
    var n = 2;
    while (base.file[percorso] || nuoviFile[percorso] || usati[percorso]) {
      percorso = cartella + nome + "_" + n + "." + estensione;
      n++;
    }
    return percorso;
  }

  function idVimeo(testo) {
    testo = String(testo || "").trim();
    var m = testo.match(/vimeo\.com\/(?:.*\/)?(\d+)/) || testo.match(/^(\d+)$/);
    return m ? Number(m[1]) : null;
  }

  function megabyte(byte) {
    return (byte / 1000000).toFixed(1).replace(".", ",") + " MB";
  }

  // ---------- ELENCO ----------

  var SVG_MANIGLIA = '<svg viewBox="0 0 12 20" width="10" height="16"><circle cx="3" cy="4" r="1.5"/><circle cx="9" cy="4" r="1.5"/><circle cx="3" cy="10" r="1.5"/><circle cx="9" cy="10" r="1.5"/><circle cx="3" cy="16" r="1.5"/><circle cx="9" cy="16" r="1.5"/></svg>';
  var SVG_FRECCIA = '<svg viewBox="0 0 8 14" width="7" height="12"><path d="M1 1l6 6-6 6" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function disegna() {
    var indice = $("indice");
    var contenitore = $("categorie");
    indice.textContent = "";
    contenitore.textContent = "";
    CATEGORIE.forEach(function(c) {
      var progetti = dati[c.chiave];

      var voce = el("button", "", c.nome);
      voce.appendChild(el("span", "", String(progetti.length)));
      voce.addEventListener("click", function() {
        $("cat-" + c.chiave).scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
      indice.appendChild(voce);

      var sezione = el("section", "categoria");
      sezione.id = "cat-" + c.chiave;
      var testa = el("div", "categoria-testa");
      testa.appendChild(el("h2", "", c.nome));
      testa.appendChild(el("span", "conta", progetti.length == 1 ? "1 progetto" : progetti.length + " progetti"));
      sezione.appendChild(testa);

      var lista = el("ul", "lista");
      lista.dataset.cat = c.chiave;
      progetti.forEach(function(p, i) {
        lista.appendChild(creaRiga(c.chiave, i, p));
      });
      if (!progetti.length) lista.appendChild(el("li", "lista-vuota", "Nessun progetto"));
      var aggiungi = el("button", "aggiungi", "Aggiungi progetto");
      aggiungi.addEventListener("click", function() {
        dati[c.chiave].push(nuovoProgetto());
        salvaBozza();
        disegna();
        seleziona(c.chiave, dati[c.chiave].length - 1);
        setTimeout(function() {
          $("campo-title").focus();
        }, 50);
      });
      lista.appendChild(aggiungi);
      sezione.appendChild(lista);
      contenitore.appendChild(sezione);
    });
  }

  function creaRiga(cat, i, p) {
    var riga = el("li", "riga");
    if (selezione && selezione.cat == cat && selezione.i == i) riga.classList.add("selezionata");

    var maniglia = el("button", "maniglia");
    maniglia.innerHTML = SVG_MANIGLIA;
    maniglia.setAttribute("aria-label", "Trascina per cambiare l'ordine");
    maniglia.addEventListener("pointerdown", function(e) {
      trascina(e, riga, cat, i);
    });
    maniglia.addEventListener("click", function(e) {
      e.stopPropagation();
    });

    var mini = el("div", "miniatura");
    if (p.img.foto) {
      var img = el("img");
      img.alt = "";
      img.loading = "lazy";
      img.src = urlFile(p.img.foto);
      mini.appendChild(img);
    }
    var video = null;
    if (p.img.video) {
      video = el("video");
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "none";
      mini.appendChild(video);
    }

    var testi = el("div", "testi");
    testi.appendChild(el("div", "titolo", p.title || "Senza titolo"));
    testi.appendChild(el("div", "sotto", [p.subtitle, p.description].filter(Boolean).join(" · ") || " "));

    var destra = el("div", "riga-destra");
    var m = mancanti(p);
    if (m.length) destra.appendChild(el("span", "incompleto", "Manca " + m.join(", ")));
    destra.appendChild(el("span", "numero", String(i + 1)));
    var freccia = el("span");
    freccia.innerHTML = SVG_FRECCIA;
    destra.appendChild(freccia);

    riga.appendChild(maniglia);
    riga.appendChild(mini);
    riga.appendChild(testi);
    riga.appendChild(destra);

    // il loop parte passandoci sopra con il mouse
    riga.addEventListener("mouseenter", function() {
      if (!video) return;
      if (!video.src) {
        video.src = urlFile(p.img.video);
        video.addEventListener("playing", function() {
          video.classList.add("pronto");
        });
      }
      video.play().catch(function() {});
    });
    riga.addEventListener("mouseleave", function() {
      if (video) video.pause();
    });
    riga.addEventListener("click", function() {
      seleziona(cat, i);
    });
    return riga;
  }

  function aggiornaRiga() {
    if (!selezione) return;
    var lista = document.querySelector('.lista[data-cat="' + selezione.cat + '"]');
    var vecchia = lista && lista.querySelectorAll(".riga")[selezione.i];
    if (vecchia) lista.replaceChild(creaRiga(selezione.cat, selezione.i, dati[selezione.cat][selezione.i]), vecchia);
  }

  // ---------- TRASCINAMENTO PER CAMBIARE L'ORDINE ----------

  function trascina(e, riga, cat, da) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    var maniglia = e.currentTarget;
    var righe = Array.prototype.slice.call(riga.parentNode.querySelectorAll(".riga"));
    var altezza = riga.offsetHeight;
    var inizioY = e.clientY;
    var a = da;
    try {
      maniglia.setPointerCapture(e.pointerId);
    } catch (err) {}
    riga.classList.add("trascinata");
    righe.forEach(function(r) {
      if (r !== riga) r.classList.add("si-muove");
    });

    function muovi(ev) {
      var dy = ev.clientY - inizioY;
      var min = -da * altezza - 12;
      var max = (righe.length - 1 - da) * altezza + 12;
      dy = Math.max(min, Math.min(max, dy));
      riga.style.transform = "translateY(" + dy + "px) scale(1.015)";
      a = Math.max(0, Math.min(righe.length - 1, da + Math.round(dy / altezza)));
      righe.forEach(function(r, k) {
        if (r === riga) return;
        var sposta = 0;
        if (da < a && k > da && k <= a) sposta = -altezza;
        if (da > a && k < da && k >= a) sposta = altezza;
        r.style.transform = sposta ? "translateY(" + sposta + "px)" : "";
      });
    }

    function fine() {
      maniglia.removeEventListener("pointermove", muovi);
      maniglia.removeEventListener("pointerup", fine);
      maniglia.removeEventListener("pointercancel", fine);
      riga.style.transition = "transform 0.2s ease";
      riga.style.transform = "translateY(" + (a - da) * altezza + "px)";
      setTimeout(function() {
        if (a !== da) {
          var lista = dati[cat];
          var aperto = selezione && selezione.cat == cat ? lista[selezione.i] : null;
          lista.splice(a, 0, lista.splice(da, 1)[0]);
          if (aperto) selezione.i = lista.indexOf(aperto);
          salvaBozza();
          if (selezione) riempiPannello();
        }
        disegna();
      }, 200);
    }

    maniglia.addEventListener("pointermove", muovi);
    maniglia.addEventListener("pointerup", fine);
    maniglia.addEventListener("pointercancel", fine);
  }

  // ---------- PANNELLO DEL PROGETTO ----------

  function seleziona(cat, i) {
    selezione = {
      cat: cat,
      i: i
    };
    document.querySelectorAll(".riga.selezionata").forEach(function(r) {
      r.classList.remove("selezionata");
    });
    var lista = document.querySelector('.lista[data-cat="' + cat + '"]');
    var riga = lista && lista.querySelectorAll(".riga")[i];
    if (riga) riga.classList.add("selezionata");
    riempiPannello();
    $("pannello").hidden = false;
    document.body.classList.add("con-pannello");
    $("pannello").querySelector(".pannello-corpo").scrollTop = 0;
  }

  function chiudiPannello() {
    selezione = null;
    $("pannello").hidden = true;
    document.body.classList.remove("con-pannello");
    $("campo-video-anteprima").pause();
    document.querySelectorAll(".riga.selezionata").forEach(function(r) {
      r.classList.remove("selezionata");
    });
  }

  function progettoAperto() {
    return selezione ? dati[selezione.cat][selezione.i] : null;
  }

  function riempiPannello() {
    var p = progettoAperto();
    if (!p) return;
    $("pannello-categoria").textContent = nomeCategoria(selezione.cat) + " · " + (selezione.i + 1) + " di " + dati[selezione.cat].length;
    $("pannello-titolo").textContent = p.title || "Nuovo progetto";
    $("campo-title").value = p.title || "";
    $("campo-subtitle").value = p.subtitle || "";
    $("campo-description").value = p.description || "";
    $("campo-role").value = (p.role || []).join("\n");
    $("campo-vimeo").value = p.vimeo || "";
    mostraVideo(p);
    mostraFoto(p);
    controllaVimeo(p.vimeo);
  }

  function mostraVideo(p) {
    var video = $("campo-video-anteprima");
    var url = urlFile(p.img.video);
    $("campo-video-vuoto").hidden = !!url;
    $("campo-video-nome").textContent = p.img.video ? p.img.video.split("/").pop() : "";
    $("campo-foto-fotogramma").disabled = !url;
    if (url) {
      if (video.getAttribute("src") !== url) video.src = url;
      video.play().catch(function() {});
    } else {
      video.removeAttribute("src");
      video.load();
    }
  }

  function mostraFoto(p) {
    var url = urlFile(p.img.foto);
    var img = $("campo-foto-anteprima");
    $("campo-foto-vuoto").hidden = !!url;
    img.hidden = !url;
    $("telefono").classList.toggle("vuoto", !url);
    $("campo-foto-ruota").disabled = $("campo-foto-centra").disabled = !url;
    $("campo-foto-nome").textContent = p.img.foto ? p.img.foto.split("/").pop() : "Si vede al posto del video su telefono.";
    if (url && img.getAttribute("src") !== url) {
      img.onload = function() {
        posizionaFoto();
      };
      img.src = url;
    }
    posizionaFoto();
  }

  // ---------- POSIZIONE E ROTAZIONE DELLA FOTO SU TELEFONO ----------
  // foto_x = parte della foto che si vede (0 sinistra, 50 centro, 100 destra),
  // foto_ruota = 0, 90, 180 o 270. l'anteprima usa le stesse regole del sito

  function posizioneFoto(p) {
    return {
      x: p.img.foto_x == null ? 50 : p.img.foto_x,
      ruota: p.img.foto_ruota || 0
    };
  }

  // di quanti pixel si può spostare la foto dentro il telefono, da un bordo all'altro
  function corsaFoto(p) {
    var telefono = $("telefono");
    var img = $("campo-foto-anteprima");
    var w = telefono.clientWidth;
    var h = telefono.clientHeight;
    if (!img.naturalWidth) return 0;
    var ruota = posizioneFoto(p).ruota;
    if (ruota == 90 || ruota == 270) return h - w;
    return Math.max(0, h * img.naturalWidth / img.naturalHeight - w);
  }

  function posizionaFoto() {
    var p = progettoAperto();
    if (!p) return;
    var img = $("campo-foto-anteprima");
    var w = $("telefono").clientWidth;
    var h = $("telefono").clientHeight;
    var pos = posizioneFoto(p);
    var s = img.style;
    if (pos.ruota == 90 || pos.ruota == 270) {
      s.width = "auto";
      s.height = h + "px";
      s.objectFit = "fill";
      s.objectPosition = "";
      s.left = "calc(50% + " + ((h - w) * (50 - pos.x) / 100) + "px)";
    } else {
      s.width = "100%";
      s.height = "100%";
      s.objectFit = "cover";
      s.objectPosition = (pos.ruota == 180 ? 100 - pos.x : pos.x) + "% 50%";
      s.left = "50%";
    }
    s.transform = "translate(-50%, -50%)" + (pos.ruota ? " rotate(" + pos.ruota + "deg)" : "");
    $("campo-foto-stato").textContent = p.img.foto ? (pos.x == 50 ? "Al centro" : "Posizione " + Math.round(pos.x) + " su 100") + (pos.ruota ? " · ruotata di " + pos.ruota + "°" : "") : "";
  }

  function impostaPosizione(p, x, ruota) {
    x = Math.round(Math.max(0, Math.min(100, x)) * 10) / 10;
    if (x == 50) delete p.img.foto_x;
    else p.img.foto_x = x;
    if (ruota) p.img.foto_ruota = ruota;
    else delete p.img.foto_ruota;
    posizionaFoto();
  }

  // trascinamento della foto dentro il telefono (mouse, trackpad e dito)
  $("telefono").addEventListener("pointerdown", function(e) {
    var p = progettoAperto();
    if (!p || !p.img.foto || e.button > 0) return;
    e.preventDefault();
    var telefono = this;
    var inizioX = e.clientX;
    var partenza = posizioneFoto(p);
    var corsa = corsaFoto(p);
    if (!corsa) return;
    try {
      telefono.setPointerCapture(e.pointerId);
    } catch (err) {}
    telefono.classList.add("trascina");

    function muovi(ev) {
      // trascinando verso destra si scopre la parte sinistra della foto
      impostaPosizione(p, partenza.x - (ev.clientX - inizioX) / corsa * 100, partenza.ruota);
    }

    function fine() {
      telefono.removeEventListener("pointermove", muovi);
      telefono.removeEventListener("pointerup", fine);
      telefono.removeEventListener("pointercancel", fine);
      telefono.classList.remove("trascina");
      salvaBozza();
    }
    telefono.addEventListener("pointermove", muovi);
    telefono.addEventListener("pointerup", fine);
    telefono.addEventListener("pointercancel", fine);
  });

  function centraFoto() {
    var p = progettoAperto();
    if (!p || !p.img.foto) return;
    impostaPosizione(p, 50, posizioneFoto(p).ruota);
    salvaBozza();
  }

  $("telefono").addEventListener("dblclick", centraFoto);
  $("campo-foto-centra").addEventListener("click", centraFoto);

  $("campo-foto-ruota").addEventListener("click", function() {
    var p = progettoAperto();
    if (!p || !p.img.foto) return;
    var pos = posizioneFoto(p);
    impostaPosizione(p, pos.x, (pos.ruota + 90) % 360);
    salvaBozza();
  });

  window.addEventListener("resize", posizionaFoto);

  function modificaTesto(campo, chiaveDato) {
    $(campo).addEventListener("input", function() {
      var p = progettoAperto();
      if (!p) return;
      p[chiaveDato] = this.value;
      if (chiaveDato == "title") $("pannello-titolo").textContent = this.value || "Nuovo progetto";
      salvaBozza();
      aggiornaRiga();
    });
  }

  modificaTesto("campo-title", "title");
  modificaTesto("campo-subtitle", "subtitle");
  modificaTesto("campo-description", "description");

  $("campo-role").addEventListener("input", function() {
    var p = progettoAperto();
    if (!p) return;
    p.role = this.value.split("\n").map(function(r) {
      return r.trim();
    }).filter(Boolean);
    salvaBozza();
  });

  var attesaVimeo = null;
  $("campo-vimeo").addEventListener("input", function() {
    var p = progettoAperto();
    if (!p) return;
    p.vimeo = idVimeo(this.value);
    salvaBozza();
    aggiornaRiga();
    clearTimeout(attesaVimeo);
    attesaVimeo = setTimeout(function() {
      controllaVimeo(p.vimeo);
    }, 500);
  });

  // mostra titolo e copertina del film su vimeo, per controllare che l'id sia giusto
  var richiestaVimeo = 0;

  function controllaVimeo(id) {
    var info = $("campo-vimeo-info");
    var questa = ++richiestaVimeo;
    info.textContent = "";
    if (!id) {
      if ($("campo-vimeo").value.trim()) info.appendChild(el("span", "ko", "Non riconosco questo id o link di Vimeo"));
      return;
    }
    info.appendChild(el("span", "", "Controllo su Vimeo…"));
    fetch("https://vimeo.com/api/oembed.json?url=" + encodeURIComponent("https://vimeo.com/" + id)).then(function(r) {
      if (!r.ok) throw new Error();
      return r.json();
    }).then(function(v) {
      if (questa !== richiestaVimeo) return;
      info.textContent = "";
      if (v.thumbnail_url) {
        var img = el("img");
        img.src = v.thumbnail_url;
        img.alt = "";
        info.appendChild(img);
      }
      var t = el("span");
      t.appendChild(el("span", "ok", "✓ "));
      t.appendChild(document.createTextNode(v.title));
      info.appendChild(t);
    }).catch(function() {
      if (questa !== richiestaVimeo) return;
      info.textContent = "";
      info.appendChild(el("span", "ko", "Video non trovato su Vimeo, o privato"));
    });
  }

  // ---------- VIDEO E FOTO ----------

  function aggiungiFile(cat, nomeFile, blob) {
    var percorso = percorsoNuovo(cat, nomeFile);
    nuoviFile[percorso] = {
      blob: blob,
      url: URL.createObjectURL(blob),
      pubblicato: false
    };
    return percorso;
  }

  $("campo-video-file").addEventListener("change", function() {
    var file = this.files[0];
    this.value = "";
    var p = progettoAperto();
    if (!file || !p) return;
    if (!/\.mp4$/i.test(file.name)) return avviso("Il video deve essere un file .mp4", true);
    var cat = selezione.cat;
    var procedi = file.size > 20000000 ? dialogo("Video pesante", "Questo video pesa " + megabyte(file.size) + ". Il sito lo scarica per intero: sotto i 5 MB si carica molto più in fretta. Vuoi usarlo comunque?", {
      ok: "Usalo"
    }) : Promise.resolve(true);
    procedi.then(function(si) {
      if (!si) return;
      p.img.video = aggiungiFile(cat, file.name, file);
      salvaBozza();
      aggiornaRiga();
      mostraVideo(p);
    });
  });

  $("campo-foto-file").addEventListener("change", function() {
    var file = this.files[0];
    this.value = "";
    var p = progettoAperto();
    if (!file || !p) return;
    if (!/\.(jpe?g|png|webp)$/i.test(file.name)) return avviso("La foto deve essere jpg, png o webp", true);
    p.img.foto = aggiungiFile(selezione.cat, file.name, file);
    delete p.img.foto_x;
    delete p.img.foto_ruota;
    salvaBozza();
    aggiornaRiga();
    mostraFoto(p);
  });

  // la foto per telefono presa dal fotogramma che si vede adesso nel video
  $("campo-foto-fotogramma").addEventListener("click", function() {
    var p = progettoAperto();
    var video = $("campo-video-anteprima");
    if (!p || video.readyState < 2) return avviso("Il video non è ancora pronto, riprova tra un attimo", true);
    var larghezza = Math.min(video.videoWidth, 1920);
    var altezza = Math.round(video.videoHeight * larghezza / video.videoWidth);
    var tela = document.createElement("canvas");
    tela.width = larghezza;
    tela.height = altezza;
    tela.getContext("2d").drawImage(video, 0, 0, larghezza, altezza);
    var cat = selezione.cat;
    var nome = (p.img.video.split("/").pop() || "foto").replace(/\.[^.]+$/, "") + ".jpg";
    tela.toBlob(function(blob) {
      if (!blob) return avviso("Non riesco a prendere il fotogramma", true);
      p.img.foto = aggiungiFile(cat, nome, blob);
      delete p.img.foto_x;
      delete p.img.foto_ruota;
      salvaBozza();
      aggiornaRiga();
      mostraFoto(p);
      avviso("Foto presa dal fotogramma a " + video.currentTime.toFixed(1).replace(".", ",") + " secondi");
    }, "image/jpeg", 0.86);
  });

  $("bottone-elimina").addEventListener("click", function() {
    var p = progettoAperto();
    if (!p) return;
    var cat = selezione.cat;
    var i = selezione.i;
    dialogo("Eliminare questo progetto?", "«" + (p.title || "Senza titolo") + "» sparirà dal sito alla prossima pubblicazione.", {
      ok: "Elimina",
      pericolo: true
    }).then(function(si) {
      if (!si) return;
      dati[cat].splice(i, 1);
      chiudiPannello();
      salvaBozza();
      disegna();
    });
  });

  $("pannello-chiudi").addEventListener("click", chiudiPannello);

  // ---------- PUBBLICAZIONE ----------

  function riepilogo() {
    var righe = [];
    CATEGORIE.forEach(function(c) {
      var prima = pubblicati[c.chiave] || [];
      var dopo = dati[c.chiave];
      if (uguali(prima, dopo)) return;
      var cose = [];
      if (dopo.length > prima.length) cose.push((dopo.length - prima.length) + (dopo.length - prima.length == 1 ? " progetto aggiunto" : " progetti aggiunti"));
      if (dopo.length < prima.length) cose.push((prima.length - dopo.length) + (prima.length - dopo.length == 1 ? " progetto tolto" : " progetti tolti"));
      if (!cose.length) cose.push("testi, ordine o file modificati");
      righe.push(c.nome + ": " + cose.join(", "));
    });
    return righe;
  }

  $("bottone-pubblica").addEventListener("click", function() {
    var incompleti = [];
    CATEGORIE.forEach(function(c) {
      dati[c.chiave].forEach(function(p) {
        var m = mancanti(p);
        if (m.length) incompleti.push(c.nome + " · " + (p.title || "Senza titolo") + ": manca " + m.join(", "));
      });
    });
    if (incompleti.length) {
      return dialogo("Prima completa questi progetti", lista(incompleti), {
        annulla: null
      });
    }
    var usati = percorsiUsati(dati);
    var file = Object.keys(nuoviFile).filter(function(k) {
      return usati[k] && !nuoviFile[k].pubblicato;
    });
    var testo = riepilogo();
    if (file.length) testo.push(file.length + (file.length == 1 ? " file nuovo da caricare" : " file nuovi da caricare"));
    dialogo("Pubblicare su matteodelia.com?", lista(testo), {
      ok: "Pubblica"
    }).then(function(si) {
      if (si) pubblica();
    });
  });

  function lista(voci) {
    var ul = el("ul");
    voci.forEach(function(v) {
      ul.appendChild(el("li", "", v));
    });
    return ul;
  }

  function base64(blob) {
    return new Promise(function(ok, ko) {
      var lettore = new FileReader();
      lettore.onload = function() {
        ok(String(lettore.result).split(",")[1]);
      };
      lettore.onerror = ko;
      lettore.readAsDataURL(blob);
    });
  }

  function pubblica() {
    inPubblicazione = true;
    aggiornaStato();
    var usati = percorsiUsati(dati);
    var usatiPrima = percorsiUsati(pubblicati);
    var daCaricare = Object.keys(nuoviFile).filter(function(k) {
      return usati[k] && !nuoviFile[k].pubblicato;
    });
    // i video e le foto che nessun progetto usa più escono dal sito
    var daTogliere = Object.keys(usatiPrima).filter(function(k) {
      return !usati[k] && base.file[k];
    });
    var caricati = [];
    var catena = Promise.resolve();
    daCaricare.forEach(function(percorso, n) {
      catena = catena.then(function() {
        impostaStato("Caricamento file " + (n + 1) + " di " + daCaricare.length + "…", true);
        return base64(nuoviFile[percorso].blob);
      }).then(function(contenuto) {
        return github("POST", "/git/blobs", {
          content: contenuto,
          encoding: "base64"
        });
      }).then(function(blob) {
        caricati.push({
          path: percorso,
          sha: blob.sha
        });
      });
    });
    var testoDati = JSON.stringify(dati, null, 2) + "\n";
    catena.then(function() {
      impostaStato("Pubblicazione…", true);
      return github("POST", "/git/blobs", {
        content: testoDati,
        encoding: "utf-8"
      });
    }).then(function(blobDati) {
      return creaCommit(base, caricati, blobDati.sha, daTogliere, false);
    }).then(function(esito) {
      base = esito.base;
      Object.keys(nuoviFile).forEach(function(k) {
        if (usati[k]) nuoviFile[k].pubblicato = true;
      });
      pubblicati = copia(dati);
      inPubblicazione = false;
      salvaBozza();
      disegna();
      avviso("Pubblicato. matteodelia.com si aggiorna in circa un minuto.");
    }).catch(function(err) {
      inPubblicazione = false;
      aggiornaStato();
      if (err && err.annullato) return;
      avviso("Pubblicazione non riuscita: " + err.message, true);
    });
  }

  // albero dei file + commit + spostamento del ramo main.
  // se nel frattempo il sito è stato aggiornato da un'altra parte, si riparte da quella versione
  function creaCommit(partenza, caricati, shaDati, daTogliere, riprovato) {
    var voci = caricati.map(function(c) {
      return {
        path: c.path,
        mode: "100644",
        type: "blob",
        sha: c.sha
      };
    });
    voci.push({
      path: FILE_DATI,
      mode: "100644",
      type: "blob",
      sha: shaDati
    });
    daTogliere.forEach(function(p) {
      if (partenza.file[p]) voci.push({
        path: p,
        mode: "100644",
        type: "blob",
        sha: null
      });
    });
    var categorie = riepilogo().map(function(r) {
      return r.split(":")[0];
    });
    var messaggio = "Contenuti aggiornati dall'editor" + (categorie.length ? " (" + categorie.join(", ") + ")" : "");
    var nuovoAlbero;
    return github("POST", "/git/trees", {
      base_tree: partenza.albero,
      tree: voci
    }).then(function(albero) {
      nuovoAlbero = albero.sha;
      return github("POST", "/git/commits", {
        message: messaggio,
        tree: albero.sha,
        parents: [partenza.commit]
      });
    }).then(function(commit) {
      return github("PATCH", "/git/refs/heads/" + RAMO, {
        sha: commit.sha,
        force: false
      }).then(function() {
        var file = copia(partenza.file);
        caricati.forEach(function(c) {
          file[c.path] = true;
        });
        file[FILE_DATI] = true;
        daTogliere.forEach(function(p) {
          delete file[p];
        });
        return {
          base: {
            commit: commit.sha,
            albero: nuovoAlbero,
            file: file
          }
        };
      });
    }).catch(function(err) {
      if (err.stato !== 422 || riprovato) throw err;
      // il ramo è andato avanti: rileggo la versione online e riprovo sopra di essa
      return leggiVersionePubblicata().then(function(v) {
        var nuovaPartenza = {
          commit: v.commit,
          albero: v.albero,
          file: v.file
        };
        if (uguali(v.dati, pubblicati)) return creaCommit(nuovaPartenza, caricati, shaDati, daTogliere, true);
        return dialogo("Il sito è cambiato", "Mentre lavoravi i contenuti sono stati modificati da un altro dispositivo. Pubblicando, la tua versione sostituirà quella.", {
          ok: "Pubblica la mia versione"
        }).then(function(si) {
          if (!si) {
            var annullato = new Error("annullato");
            annullato.annullato = true;
            throw annullato;
          }
          return creaCommit(nuovaPartenza, caricati, shaDati, daTogliere, true);
        });
      });
    });
  }

  // ---------- ANTEPRIMA ----------

  var schermo = "computer";

  function apriAnteprima() {
    salvaBozza();
    $("anteprima").hidden = false;
    ricaricaAnteprima();
  }

  function ricaricaAnteprima() {
    // senza modifiche si vede la versione pubblicata, con modifiche la bozza
    $("anteprima-frame").src = "../index.html" + (haModifiche() ? "?anteprima=" + Date.now() : "?v=" + Date.now());
    adattaAnteprima();
  }

  function adattaAnteprima() {
    var cornice = $("anteprima-cornice");
    var scena = $("anteprima-scena");
    cornice.className = "cornice " + schermo;
    var w = schermo == "computer" ? 1440 : 414;
    var h = schermo == "computer" ? 900 : 868;
    var scala = Math.min((scena.clientWidth - 48) / w, (scena.clientHeight - 32) / h, 1);
    cornice.style.transform = "translate(-50%, -50%) scale(" + scala + ")";
  }

  $("bottone-anteprima").addEventListener("click", apriAnteprima);
  $("anteprima-ricarica").addEventListener("click", ricaricaAnteprima);
  $("anteprima-chiudi").addEventListener("click", function() {
    $("anteprima").hidden = true;
    $("anteprima-frame").src = "about:blank";
  });
  document.querySelectorAll(".segmenti button").forEach(function(b) {
    b.addEventListener("click", function() {
      document.querySelectorAll(".segmenti button").forEach(function(x) {
        x.classList.toggle("attivo", x === b);
      });
      schermo = b.dataset.schermo;
      ricaricaAnteprima();
    });
  });
  window.addEventListener("resize", function() {
    if (!$("anteprima").hidden) adattaAnteprima();
  });

  // ---------- MENU ----------

  $("bottone-menu").addEventListener("click", function(e) {
    e.stopPropagation();
    $("menu").hidden = !$("menu").hidden;
  });
  document.addEventListener("click", function() {
    $("menu").hidden = true;
  });
  $("menu").addEventListener("click", function(e) {
    var azione = e.target.dataset.azione;
    if (!azione) return;
    $("menu").hidden = true;
    if (azione == "annulla-bozza") {
      if (!haModifiche()) return avviso("Non ci sono modifiche da annullare");
      dialogo("Annullare le modifiche?", "Tutto torna com'è adesso su matteodelia.com. Le modifiche non pubblicate vanno perse.", {
        ok: "Annulla le modifiche",
        pericolo: true
      }).then(function(si) {
        if (!si) return;
        dati = copia(pubblicati);
        chiudiPannello();
        salvaBozza();
        disegna();
      });
    }
    if (azione == "ricarica") {
      chiudiPannello();
      avvia();
    }
    if (azione == "esci") {
      dialogo("Scollegare questo dispositivo?", "La chiave GitHub viene tolta da questo dispositivo: per modificare di nuovo andrà incollata.", {
        ok: "Scollega",
        pericolo: true
      }).then(function(si) {
        if (!si) return;
        scrivi("editor_chiave", null);
        chiave = null;
        chiudiPannello();
        mostraAccesso();
      });
    }
  });

  // ---------- DIALOGHI E AVVISI ----------

  function dialogo(titolo, contenuto, opzioni) {
    opzioni = opzioni || {};
    return new Promise(function(risolvi) {
      $("dialogo-titolo").textContent = titolo;
      var testo = $("dialogo-testo");
      testo.textContent = "";
      if (typeof contenuto == "string") testo.textContent = contenuto;
      else testo.appendChild(contenuto);
      var ok = $("dialogo-ok");
      var annulla = $("dialogo-annulla");
      ok.textContent = opzioni.ok || "OK";
      ok.style.background = opzioni.pericolo ? "var(--pericolo)" : "";
      annulla.hidden = opzioni.annulla === null;
      annulla.textContent = opzioni.annulla || "Annulla";
      $("dialogo").hidden = false;
      ok.focus();

      function chiudi(valore) {
        $("dialogo").hidden = true;
        ok.onclick = annulla.onclick = null;
        document.removeEventListener("keydown", tasti);
        risolvi(valore);
      }

      function tasti(e) {
        if (e.key == "Escape") chiudi(false);
      }
      ok.onclick = function() {
        chiudi(true);
      };
      annulla.onclick = function() {
        chiudi(false);
      };
      document.addEventListener("keydown", tasti);
    });
  }

  var attesaAvviso = null;

  function avviso(testo, errore) {
    var a = $("avviso");
    a.textContent = testo;
    a.className = "avviso" + (errore ? " errore" : "");
    a.hidden = false;
    clearTimeout(attesaAvviso);
    attesaAvviso = setTimeout(function() {
      a.hidden = true;
    }, errore ? 6000 : 3500);
  }

  document.addEventListener("keydown", function(e) {
    if (e.key != "Escape" || !$("dialogo").hidden) return;
    if (!$("anteprima").hidden) $("anteprima-chiudi").click();
    else if (selezione) chiudiPannello();
  });

  // video e foto scelti ma non ancora pubblicati esistono solo in questa pagina
  window.addEventListener("beforeunload", function(e) {
    var usati = dati ? percorsiUsati(dati) : {};
    var inSospeso = Object.keys(nuoviFile).some(function(k) {
      return usati[k] && !nuoviFile[k].pubblicato;
    });
    if (inSospeso) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  avvia();
})();
