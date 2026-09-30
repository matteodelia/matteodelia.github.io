// INSIGHT: le statistiche di matteodelia.com dentro l'editor.
// Umami conta le visite sul sito (senza cookie), ogni notte GitHub le copia nel repository
// privato matteodelia/insight (archivio/AAAA-MM.json e archivio/ultimo.json) e qui si leggono
// da lì, con la stessa chiave GitHub dell'editor. Umami tiene i dati solo 6 mesi, l'archivio per sempre.
(function() {
  "use strict";

  var PROPRIETARIO = "matteodelia";
  var ARCHIVIO = "insight";
  var API = leggi("editor_api") || "https://api.github.com";
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
  var PERIODI = [{
    id: "7",
    nome: "7 giorni",
    giorni: 7
  }, {
    id: "30",
    nome: "30 giorni",
    giorni: 30
  }, {
    id: "90",
    nome: "90 giorni",
    giorni: 90
  }, {
    id: "12m",
    nome: "12 mesi",
    mesi: 12
  }, {
    id: "tutto",
    nome: "Tutto"
  }];
  var GIORNI = ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"];
  var GIORNI_CORTI = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
  var MESI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  var MESI_LUNGHI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto",
    "settembre", "ottobre", "novembre", "dicembre"];
  // Umami scrive le città in inglese
  var CITTA = {
    "Milan": "Milano", "Rome": "Roma", "Turin": "Torino", "Naples": "Napoli", "Florence": "Firenze",
    "Venice": "Venezia", "Genoa": "Genova", "Padua": "Padova", "Syracuse": "Siracusa", "Mantua": "Mantova",
    "London": "Londra", "Paris": "Parigi", "Munich": "Monaco di Baviera", "Lisbon": "Lisbona",
    "Geneva": "Ginevra", "Zurich": "Zurigo", "Vienna": "Vienna", "Brussels": "Bruxelles",
    "Copenhagen": "Copenaghen", "Athens": "Atene", "Warsaw": "Varsavia", "Prague": "Praga",
    "Seville": "Siviglia", "Cologne": "Colonia", "Moscow": "Mosca", "Beijing": "Pechino"
  };
  // da quale sito arrivano: i domini si raggruppano per nome
  var FONTI = [
    [/(^|\.)instagram\.com$/, "Instagram"],
    [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "Facebook"],
    [/(^|\.)google\./, "Google"],
    [/(^|\.)(bing\.com|duckduckgo\.com|ecosia\.org|yahoo\.com)$/, "Altri motori di ricerca"],
    [/(^|\.)vimeo\.com$/, "Vimeo"],
    [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube"],
    [/(^|\.)(linkedin\.com|lnkd\.in)$/, "LinkedIn"],
    [/(^|\.)tiktok\.com$/, "TikTok"],
    [/(^|\.)behance\.net$/, "Behance"],
    [/(^|\.)(t\.co|twitter\.com|x\.com)$/, "X"],
    [/(^|\.)threads\.(net|com)$/, "Threads"],
    [/(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com)$/, "Assistenti AI"]
  ];

  var $ = function(id) {
    return document.getElementById(id);
  };
  var pagina = $("insight");
  var periodo = leggi("insight_periodo") || "30";
  var ordine = {
    colonna: "viste",
    discendente: true
  };
  var filtroCategoria = "tutte";
  var vistaLuoghi = "citta";
  var archivio = {
    ultimo: null,
    elenco: null, // nome file -> sha
    mesi: {}, // "2026-10" -> { sha, dati }
    progetti: null // progetti.json del sito
  };
  var caricamento = null;

  // le visite fatte da un dispositivo dove si usa l'editor non si contano (vale per tutto matteodelia.com)
  scrivi("umami.disabled", "1");

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
      localStorage.setItem(nome, valore);
    } catch (e) {}
  }

  // ---------- LETTURA DELL'ARCHIVIO ----------

  function github(percorso, grezzo) {
    return fetch(API + "/repos/" + PROPRIETARIO + "/" + ARCHIVIO + percorso, {
      cache: "no-cache",
      headers: {
        "Authorization": "Bearer " + leggi("editor_chiave"),
        "Accept": grezzo ? "application/vnd.github.raw+json" : "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    }).then(function(r) {
      if (!r.ok) {
        var errore = new Error("GitHub ha risposto con un errore (" + r.status + ").");
        errore.stato = r.status;
        throw errore;
      }
      return grezzo ? r.text().then(JSON.parse) : r.json();
    });
  }

  // scarica ultimo.json, l'elenco dei mesi e i mesi che servono al periodo scelto
  function carica(forza) {
    if (caricamento && !forza) return caricamento;
    disegnaAttesa();
    caricamento = github("").then(function() {
      return Promise.all([
        github("/contents/archivio"),
        archivio.progetti || fetch("../progetti.json", {
          cache: "no-cache"
        }).then(function(r) {
          return r.json();
        })
      ]);
    }, function(errore) {
      errore.senzaAccesso = errore.stato == 404 || errore.stato == 403;
      throw errore;
    }).then(function(r) {
      archivio.elenco = {};
      r[0].forEach(function(f) {
        archivio.elenco[f.name] = f.sha;
      });
      archivio.progetti = r[1];
      if (!archivio.elenco["ultimo.json"]) return null;
      return github("/contents/archivio/ultimo.json", true);
    }, function(errore) {
      // il repository c'è ma l'archivio no: il primo arriva stanotte
      if (errore.stato == 404 && !errore.senzaAccesso) {
        archivio.elenco = {};
        return null;
      }
      throw errore;
    }).then(function(ultimo) {
      archivio.ultimo = ultimo;
      return caricaMesi();
    }).then(function() {
      disegna();
    }).catch(function(errore) {
      caricamento = null;
      if (errore.senzaAccesso) disegnaSenzaAccesso();
      else disegnaErrore(errore);
    });
    return caricamento;
  }

  function caricaMesi() {
    var intervallo = intervalli();
    if (!intervallo) return Promise.resolve();
    var servono = mesiTra(intervallo.prima.dal < intervallo.dal ? intervallo.prima.dal : intervallo.dal, intervallo.al);
    return Promise.all(servono.map(function(mese) {
      var sha = archivio.elenco[mese + ".json"];
      if (!sha) return null;
      var gia = archivio.mesi[mese];
      if (gia && gia.sha == sha) return null;
      return github("/contents/archivio/" + mese + ".json", true).then(function(dati) {
        archivio.mesi[mese] = {
          sha: sha,
          dati: dati
        };
      });
    }));
  }

  // ---------- DATE ----------

  function data(iso) {
    var p = iso.split("-");
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
  }

  function iso(d) {
    return d.toISOString().slice(0, 10);
  }

  function spostaGiorni(isoData, n) {
    var d = data(isoData);
    d.setUTCDate(d.getUTCDate() + n);
    return iso(d);
  }

  function inizioMese(isoData, indietro) {
    var d = data(isoData);
    return iso(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - (indietro || 0), 1)));
  }

  function mesiTra(dal, al) {
    var elenco = [];
    var m = inizioMese(dal);
    while (m <= al) {
      elenco.push(m.slice(0, 7));
      var d = data(m);
      m = iso(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)));
    }
    return elenco;
  }

  // lunedì = 0
  function giornoSettimana(isoData) {
    return (data(isoData).getUTCDay() + 6) % 7;
  }

  function dataBreve(isoData) {
    var d = data(isoData);
    return d.getUTCDate() + " " + MESI[d.getUTCMonth()];
  }

  function nomeMese(mese, conAnno) {
    var p = mese.split("-");
    return MESI[+p[1] - 1] + (conAnno ? " " + p[0] : "");
  }

  // il periodo scelto e quello subito prima (per il confronto), sempre fino all'ultimo giorno copiato
  function intervalli() {
    var u = archivio.ultimo;
    if (!u || !u.ultimo_giorno) return null;
    var al = u.ultimo_giorno;
    var primo = primoGiorno();
    var p = PERIODI.filter(function(x) {
      return x.id == periodo;
    })[0] || PERIODI[1];
    var dal, prima;
    if (p.giorni) {
      dal = spostaGiorni(al, 1 - p.giorni);
      prima = {
        dal: spostaGiorni(dal, -p.giorni),
        al: spostaGiorni(dal, -1)
      };
    } else if (p.mesi) {
      dal = inizioMese(al, p.mesi - 1);
      prima = {
        dal: inizioMese(al, 2 * p.mesi - 1),
        al: spostaGiorni(dal, -1)
      };
    } else {
      dal = primo;
      prima = {
        dal: primo,
        al: spostaGiorni(primo, -1)
      };
    }
    return {
      periodo: p,
      dal: dal,
      al: al,
      prima: prima,
      mensile: !p.giorni
    };
  }

  function primoGiorno() {
    var mesi = Object.keys(archivio.elenco || {}).filter(function(n) {
      return /^\d{4}-\d{2}\.json$/.test(n);
    }).sort();
    var primo = mesi.length ? mesi[0].slice(0, 7) + "-01" : archivio.ultimo.ultimo_giorno;
    var m = archivio.mesi[primo.slice(0, 7)];
    if (m) {
      var giorni = Object.keys(m.dati.giorni || {}).sort();
      if (giorni.length) primo = giorni[0];
    }
    return primo;
  }

  // ---------- CALCOLI ----------

  function somma(oggetto, dove) {
    Object.keys(oggetto || {}).forEach(function(k) {
      dove[k] = (dove[k] || 0) + oggetto[k];
    });
  }

  // tutti i numeri fra due giorni (compresi), sommati dall'archivio
  function calcola(dal, al) {
    var t = {
      giorni: [],
      persone: 0,
      visite: 0,
      ore: [],
      oreSettimana: [],
      giorniSettimana: [0, 0, 0, 0, 0, 0, 0],
      presenzeSettimana: [0, 0, 0, 0, 0, 0, 0],
      paesi: {},
      citta: {},
      fonti: {},
      canali: {},
      dispositivi: {},
      contatti: {},
      privacy: 0,
      progetti: {},
      secondi: 0,
      film: 0,
      crediti: 0
    };
    for (var g = 0; g < 7; g++) {
      t.oreSettimana.push([]);
      for (var h = 0; h < 24; h++) t.oreSettimana[g].push(0);
    }
    mesiTra(dal, al).forEach(function(mese) {
      var m = archivio.mesi[mese];
      if (!m) return;
      Object.keys(m.dati.giorni || {}).sort().forEach(function(giorno) {
        if (giorno < dal || giorno > al) return;
        var d = m.dati.giorni[giorno];
        t.giorni.push({
          giorno: giorno,
          persone: d.persone || 0,
          visite: d.visite || 0
        });
        t.persone += d.persone || 0;
        t.visite += d.visite || 0;
        var gs = giornoSettimana(giorno);
        t.giorniSettimana[gs] += d.visite || 0;
        t.presenzeSettimana[gs] += 1;
        (d.ore || []).forEach(function(n, ora) {
          t.oreSettimana[gs][ora] += n;
        });
        somma(d.paesi, t.paesi);
        somma(d.citta, t.citta);
        somma(d.fonti, t.fonti);
        somma(d.canali, t.canali);
        somma(d.dispositivi, t.dispositivi);
        somma(d.contatti, t.contatti);
        t.privacy += d.privacy || 0;
        Object.keys(d.progetti || {}).forEach(function(k) {
          var p = t.progetti[k] || (t.progetti[k] = {});
          somma(d.progetti[k], p);
          t.secondi += (d.progetti[k].secondi || 0) + (d.progetti[k].visione_secondi || 0);
          t.film += d.progetti[k].film || 0;
          t.crediti += d.progetti[k].crediti || 0;
        });
      });
    });
    return t;
  }

  // persone e visite esatte: dalle finestre di Umami (7, 30, 90 giorni) o dai totali dei mesi.
  // le persone di più mesi sono la somma dei mesi (chi torna in mesi diversi conta più volte)
  function totaliEsatti(intervallo, calcolati) {
    var u = archivio.ultimo;
    var p = intervallo.periodo;
    if (p.giorni && u.finestre && u.finestre[p.id]) {
      var f = u.finestre[p.id];
      return {
        persone: f.persone,
        visite: f.visite,
        primaPersone: f.prima ? f.prima.persone : null,
        primaVisite: f.prima ? f.prima.visite : null,
        esatto: true
      };
    }
    function daiMesi(dal, al) {
      var r = {
        persone: 0,
        visite: 0,
        mesi: 0
      };
      mesiTra(dal, al).forEach(function(mese) {
        var m = archivio.mesi[mese];
        if (m && m.dati.totali) {
          r.persone += m.dati.totali.persone || 0;
          r.visite += m.dati.totali.visite || 0;
          r.mesi++;
        }
      });
      return r;
    }
    var ora = daiMesi(intervallo.dal, intervallo.al);
    var prima = intervallo.prima.al >= intervallo.prima.dal ? daiMesi(intervallo.prima.dal, intervallo.prima.al) : {
      mesi: 0
    };
    return {
      persone: ora.mesi ? ora.persone : calcolati.persone,
      visite: ora.mesi ? ora.visite : calcolati.visite,
      primaPersone: prima.mesi ? prima.persone : null,
      primaVisite: prima.mesi ? prima.visite : null,
      esatto: ora.mesi <= 1
    };
  }

  // i progetti di adesso sul sito, riconosciuti dal nome del video (come fa il sito)
  function progettiDelSito() {
    var elenco = [];
    CATEGORIE.forEach(function(c) {
      (archivio.progetti && archivio.progetti[c.chiave] || []).forEach(function(p) {
        var nome = (p.img && p.img.video || "").split("/").pop().replace(/\.[^.]*$/, "");
        elenco.push({
          chiave: c.chiave + "/" + nome,
          categoria: c.chiave,
          titolo: p.title || "Senza titolo",
          sottotitolo: [p.subtitle, p.description].filter(Boolean).join(" · "),
          foto: p.img && p.img.foto ? "../" + p.img.foto : ""
        });
      });
    });
    return elenco;
  }

  // una riga per progetto, con anche quelli mai visti e quelli che non sono più sul sito
  function righeProgetti(t) {
    var righe = progettiDelSito();
    var conosciuti = {};
    righe.forEach(function(r) {
      conosciuti[r.chiave] = true;
    });
    Object.keys(t.progetti).forEach(function(k) {
      if (conosciuti[k]) return;
      righe.push({
        chiave: k,
        categoria: k.split("/")[0],
        titolo: k.split("/")[1] || k,
        sottotitolo: "non più sul sito",
        foto: "",
        tolto: true
      });
    });
    righe.forEach(function(r) {
      var p = t.progetti[r.chiave] || {};
      r.viste = p.viste || 0;
      r.secondi = p.secondi || 0;
      r.tempoMedio = r.viste ? r.secondi / r.viste : 0;
      r.film = p.film || 0;
      r.aperturaFilm = r.viste ? r.film / r.viste : 0;
      r.visioni = p.visioni || 0;
      r.visioneMedia = r.visioni ? (p.visione_secondi || 0) / r.visioni : 0;
      r.percentuale = p.visione_persone ? (p.visione_percentuale || 0) / p.visione_persone : 0;
      r.completati = p.completati || 0;
      r.crediti = p.crediti || 0;
    });
    return righe.filter(function(r) {
      return !r.tolto || r.viste || r.film;
    });
  }

  // ---------- NUMERI SCRITTI BENE ----------

  function numero(n) {
    return Math.round(n || 0).toLocaleString("it-IT");
  }

  function durata(s) {
    s = Math.round(s || 0);
    if (s < 60) return s + " s";
    if (s < 3600) return Math.floor(s / 60) + " min" + (s % 60 ? " " + s % 60 + " s" : "");
    return Math.floor(s / 3600) + " h" + (Math.round(s % 3600 / 60) ? " " + Math.round(s % 3600 / 60) + " min" : "");
  }

  function minuti(s) {
    s = Math.round(s || 0);
    return Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2);
  }

  function percento(x) {
    return Math.round((x || 0) * 100) + "%";
  }

  function bandiera(codice) {
    if (!/^[A-Za-z]{2}$/.test(codice || "")) return "";
    return String.fromCodePoint.apply(null, codice.toUpperCase().split("").map(function(c) {
      return 127397 + c.charCodeAt(0);
    }));
  }

  var nomiPaesi = null;
  try {
    nomiPaesi = new Intl.DisplayNames(["it"], {
      type: "region"
    });
  } catch (e) {}

  function nomePaese(codice) {
    try {
      return nomiPaesi ? nomiPaesi.of(codice) : codice;
    } catch (e) {
      return codice || "Sconosciuto";
    }
  }

  function nomeCategoria(chiave) {
    for (var i = 0; i < CATEGORIE.length; i++)
      if (CATEGORIE[i].chiave == chiave) return CATEGORIE[i].nome;
    return chiave;
  }

  function el(tag, classe, testo) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (testo !== undefined) e.textContent = testo;
    return e;
  }

  // ---------- DISEGNO ----------

  function scheda(titolo, sotto) {
    var s = el("section", "scheda");
    if (titolo) s.appendChild(el("h2", "", titolo));
    if (sotto) s.appendChild(el("p", "sotto", sotto));
    return s;
  }

  function segmenti(voci, attiva, scegli, classe) {
    var s = el("div", "segmenti" + (classe ? " " + classe : ""));
    voci.forEach(function(v) {
      var b = el("button", v.id == attiva ? "attivo" : "", v.nome);
      b.addEventListener("click", function() {
        scegli(v.id);
      });
      s.appendChild(b);
    });
    return s;
  }

  function quando(isoOra) {
    if (!isoOra) return "";
    var d = new Date(isoOra);
    var oggi = new Date();
    var ieri = new Date(Date.now() - 864e5);
    var ora = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    if (d.toDateString() == oggi.toDateString()) return "oggi alle " + ora;
    if (d.toDateString() == ieri.toDateString()) return "ieri alle " + ora;
    return d.getDate() + " " + MESI[d.getMonth()] + " alle " + ora;
  }

  function barraInsight() {
    var barra = el("div", "insight-barra");
    barra.appendChild(segmenti(PERIODI, periodo, function(id) {
      periodo = id;
      scrivi("insight_periodo", id);
      caricaMesi().then(disegna);
    }));
    var destra = el("div", "insight-stato");
    var u = archivio.ultimo;
    if (u && u.oggi) {
      var oggi = el("span", "insight-oggi");
      oggi.appendChild(el("span", "punto"));
      oggi.appendChild(document.createTextNode("Oggi finora " + numero(u.oggi.persone) + (u.oggi.persone == 1 ? " persona" : " persone")));
      destra.appendChild(oggi);
    }
    if (u && u.aggiornato) destra.appendChild(el("span", "secondario", "Aggiornato " + quando(u.aggiornato)));
    var aggiorna = el("button", "bottone icona");
    aggiorna.setAttribute("aria-label", "Aggiorna");
    aggiorna.title = "Aggiorna";
    aggiorna.innerHTML = '<svg viewBox="0 0 20 20" width="16" height="16"><path d="M16 10a6 6 0 1 1-1.8-4.3M16 3.5v3.2h-3.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    aggiorna.addEventListener("click", function() {
      carica(true);
    });
    destra.appendChild(aggiorna);
    barra.appendChild(destra);
    return barra;
  }

  function disegnaAttesa() {
    if (pagina.querySelector(".scheda")) return;
    pagina.textContent = "";
    var s = scheda();
    s.classList.add("insight-messaggio");
    s.appendChild(el("div", "secondario", "Carico le statistiche…"));
    pagina.appendChild(s);
  }

  function disegnaSenzaAccesso() {
    pagina.textContent = "";
    var s = scheda("Collega l'archivio delle statistiche", "Le statistiche stanno nel repository privato matteodelia/insight. La chiave GitHub di questo dispositivo deve poterlo leggere:");
    s.classList.add("insight-messaggio");
    var passi = el("ol", "insight-passi");
    [
      ["Apri ", "github.com → Fine-grained tokens", "https://github.com/settings/personal-access-tokens", " e scegli la chiave che usi per l'editor."],
      ["Premi ", "Edit", null, "."],
      ["In Repository access aggiungi ", "matteodelia/insight", null, " (resta anche matteodelia.github.io)."],
      ["Salva in fondo alla pagina: la chiave resta la stessa, non va incollata di nuovo.", null, null, ""]
    ].forEach(function(p) {
      var li = el("li");
      li.appendChild(document.createTextNode(p[0]));
      if (p[1]) {
        var x = p[2] ? el("a", "", p[1]) : el("em", "", p[1]);
        if (p[2]) {
          x.href = p[2];
          x.target = "_blank";
          x.rel = "noopener";
        }
        li.appendChild(x);
      }
      li.appendChild(document.createTextNode(p[3]));
      passi.appendChild(li);
    });
    s.appendChild(passi);
    var riprova = el("button", "bottone primario", "Riprova");
    riprova.addEventListener("click", function() {
      carica(true);
    });
    s.appendChild(riprova);
    pagina.appendChild(s);
  }

  function disegnaErrore(errore) {
    pagina.textContent = "";
    var s = scheda("Statistiche non disponibili", errore.message + " Controlla la connessione e riprova.");
    s.classList.add("insight-messaggio");
    var riprova = el("button", "bottone", "Riprova");
    riprova.addEventListener("click", function() {
      carica(true);
    });
    s.appendChild(riprova);
    pagina.appendChild(s);
  }

  function disegna() {
    pagina.textContent = "";
    pagina.appendChild(barraInsight());
    var intervallo = intervalli();
    if (!intervallo) {
      var vuota = scheda("Ancora nessun dato", "Il conteggio sul sito è partito: ogni notte alle 3:30 le visite del giorno prima vengono copiate nell'archivio e compaiono qui. Il primo giorno arriva stanotte.");
      vuota.classList.add("insight-messaggio");
      pagina.appendChild(vuota);
      return;
    }
    var primo = primoGiorno();
    var t = calcola(intervallo.dal, intervallo.al);
    var tp = intervallo.prima.dal >= primo ? calcola(intervallo.prima.dal, intervallo.prima.al) : null;
    var tot = totaliEsatti(intervallo, t);

    // l'archivio si aggiorna più volte al giorno: se è fermo qualcosa non va
    var aggiornato = archivio.ultimo.aggiornato ? new Date(archivio.ultimo.aggiornato) : null;
    if (aggiornato && Date.now() - aggiornato > 2 * 864e5) {
      var giorniFermo = Math.floor((Date.now() - aggiornato) / 864e5);
      var fermo = el("div", "insight-avviso");
      fermo.appendChild(document.createTextNode("L'archivio non si aggiorna da " + giorniFermo + " giorni. Controlla su GitHub: "));
      var link = el("a", "", "Actions dell'archivio");
      link.href = "https://github.com/" + PROPRIETARIO + "/" + ARCHIVIO + "/actions";
      link.target = "_blank";
      link.rel = "noopener";
      fermo.appendChild(link);
      fermo.appendChild(document.createTextNode(". Umami tiene i dati 6 mesi: c'è tempo per recuperare."));
      pagina.appendChild(fermo);
    }

    function meseLungo(isoData) {
      return MESI_LUNGHI[+isoData.slice(5, 7) - 1] + " " + isoData.slice(0, 4);
    }
    var periodoTesto = intervallo.mensile ?
      "Da " + meseLungo(intervallo.dal) + " a " + meseLungo(intervallo.al) :
      "Dal " + dataBreve(intervallo.dal) + " al " + dataBreve(intervallo.al);
    var titolo = el("p", "insight-periodo secondario", periodoTesto + (intervallo.dal < primo ? " · i dati partono dal " + dataBreve(primo) + " " + primo.slice(0, 4) : ""));
    pagina.appendChild(titolo);

    pagina.appendChild(numeriPrincipali(t, tp, tot));
    pagina.appendChild(andamento(t, intervallo));
    pagina.appendChild(orari(t));
    var due = el("div", "insight-colonne");
    due.appendChild(luoghi(t));
    due.appendChild(fonti(t, tot));
    pagina.appendChild(due);
    pagina.appendChild(dispositivi(t));
    pagina.appendChild(contenuti(t));
    pagina.appendChild(clic(t));
    var nota = el("p", "insight-nota secondario");
    nota.appendChild(document.createTextNode("Dati anonimi raccolti da Umami senza cookie e copiati ogni notte nel tuo archivio privato su GitHub, dove restano per sempre. Le visite fatte da questo dispositivo non vengono contate."));
    pagina.appendChild(nota);
  }

  // ---------- LE SCHEDE ----------

  function variazione(ora, prima, piuEMeglio) {
    if (prima === null || prima === undefined || !isFinite(prima) || prima <= 0) return null;
    var v = (ora - prima) / prima;
    var testo = (v >= 0 ? "▲ " : "▼ ") + Math.abs(Math.round(v * 100)) + "%";
    var classe = Math.round(v * 100) == 0 ? "" : (v > 0) == (piuEMeglio !== false) ? "su" : "giu";
    return {
      testo: testo,
      classe: classe
    };
  }

  function numeriPrincipali(t, tp, tot) {
    var griglia = el("div", "numeri");
    var tempoMedio = t.visite ? t.secondi / t.visite : 0;
    var tempoPrima = tp && tp.visite ? tp.secondi / tp.visite : null;
    [{
      etichetta: "Persone",
      valore: numero(tot.persone),
      v: variazione(tot.persone, tot.primaPersone),
      nota: tot.esatto ? null : "somma dei mesi"
    }, {
      etichetta: "Visite",
      valore: numero(tot.visite),
      v: variazione(tot.visite, tot.primaVisite)
    }, {
      etichetta: "Tempo medio per visita",
      valore: durata(tempoMedio),
      v: tempoPrima === null ? null : variazione(tempoMedio, tempoPrima)
    }, {
      etichetta: "Film aperti",
      valore: numero(t.film),
      v: tp ? variazione(t.film, tp.film) : null,
      nota: t.visite ? percento(t.film / t.visite) + " delle visite" : null
    }].forEach(function(n) {
      var c = el("div", "numero-grande");
      c.appendChild(el("div", "etichetta", n.etichetta));
      c.appendChild(el("div", "valore", n.valore));
      var sotto = el("div", "variazione");
      if (n.v) {
        sotto.appendChild(el("span", n.v.classe, n.v.testo));
        sotto.appendChild(document.createTextNode(" rispetto a prima"));
      } else if (n.nota) {
        sotto.textContent = n.nota;
      } else {
        sotto.innerHTML = "&nbsp;";
      }
      if (n.v && n.nota) sotto.appendChild(document.createTextNode(" · " + n.nota));
      c.appendChild(sotto);
      griglia.appendChild(c);
    });
    return griglia;
  }

  // persone giorno per giorno (o mese per mese per i periodi lunghi)
  function andamento(t, intervallo) {
    var colonne = [];
    if (intervallo.mensile) {
      mesiTra(intervallo.dal, intervallo.al).forEach(function(mese) {
        var m = archivio.mesi[mese];
        var persone = m && m.dati.totali ? m.dati.totali.persone : 0;
        colonne.push({
          valore: persone,
          etichetta: nomeMese(mese, true),
          breve: nomeMese(mese)
        });
      });
    } else {
      var perGiorno = {};
      t.giorni.forEach(function(g) {
        perGiorno[g.giorno] = g.persone;
      });
      for (var g = intervallo.dal; g <= intervallo.al; g = spostaGiorni(g, 1)) {
        colonne.push({
          valore: perGiorno[g] || 0,
          etichetta: GIORNI[giornoSettimana(g)] + " " + dataBreve(g),
          breve: dataBreve(g)
        });
      }
    }
    var s = scheda("Andamento", intervallo.mensile ? "Persone ogni mese" : "Persone ogni giorno");
    var massimo = Math.max.apply(null, colonne.map(function(c) {
      return c.valore;
    }).concat([1]));
    var grafico = el("div", "grafico");
    var suggerimento = el("div", "grafico-suggerimento");
    var barre = el("div", "grafico-barre" + (colonne.length > 45 ? " fitte" : ""));
    colonne.forEach(function(c) {
      var b = el("div", "grafico-colonna");
      var pieno = el("div", "grafico-pieno");
      pieno.style.height = Math.max(c.valore ? 3 : 1, c.valore / massimo * 100) + "%";
      if (!c.valore) pieno.classList.add("zero");
      b.appendChild(pieno);
      var mostra = function() {
        suggerimento.textContent = c.etichetta + " · " + numero(c.valore) + (c.valore == 1 ? " persona" : " persone");
        suggerimento.classList.add("visibile");
      };
      b.addEventListener("mouseenter", mostra);
      b.addEventListener("touchstart", mostra, {
        passive: true
      });
      barre.appendChild(b);
    });
    barre.addEventListener("mouseleave", function() {
      suggerimento.classList.remove("visibile");
    });
    grafico.appendChild(suggerimento);
    grafico.appendChild(barre);
    var assi = el("div", "grafico-assi secondario");
    if (colonne.length) {
      assi.appendChild(el("span", "", colonne[0].breve));
      if (colonne.length > 2) assi.appendChild(el("span", "", colonne[Math.floor(colonne.length / 2)].breve));
      assi.appendChild(el("span", "", colonne[colonne.length - 1].breve));
    }
    grafico.appendChild(assi);
    s.appendChild(grafico);
    return s;
  }

  // quando arrivano: giorni della settimana per ore, come "i momenti più attivi" di Instagram
  function orari(t) {
    var s = scheda("Quando", "Visite per giorno della settimana e ora (ora italiana)");
    var massimo = 0,
      migliore = null;
    t.oreSettimana.forEach(function(riga, g) {
      riga.forEach(function(n, h) {
        if (n > massimo) {
          massimo = n;
          migliore = {
            giorno: g,
            ora: h,
            n: n
          };
        }
      });
    });
    massimo = Math.max(massimo, 1);
    // il giorno migliore è quello con più visite in media (non tutti i giorni compaiono le stesse volte)
    var medie = t.giorniSettimana.map(function(n, g) {
      return t.presenzeSettimana[g] ? n / t.presenzeSettimana[g] : 0;
    });
    var giornoMigliore = medie.indexOf(Math.max.apply(null, medie));
    var perOra = [];
    for (var h = 0; h < 24; h++) perOra.push(t.oreSettimana.reduce(function(tot, riga) {
      return tot + riga[h];
    }, 0));
    var oraMigliore = perOra.indexOf(Math.max.apply(null, perOra));
    if (t.visite) {
      var sintesi = el("div", "orari-sintesi");
      [
        ["Giorno con più visite", GIORNI[giornoMigliore]],
        ["Ora con più visite", oraMigliore + ":00 – " + (oraMigliore + 1) % 24 + ":00"],
        ["Il momento migliore", migliore && migliore.n ? GIORNI[migliore.giorno] + " alle " + migliore.ora + ":00" : "—"]
      ].forEach(function(x) {
        var c = el("div", "orari-voce");
        c.appendChild(el("div", "etichetta", x[0]));
        c.appendChild(el("div", "valore", x[1]));
        sintesi.appendChild(c);
      });
      s.appendChild(sintesi);
    }
    var griglia = el("div", "orari-griglia");
    griglia.appendChild(el("div", ""));
    for (h = 0; h < 24; h++) griglia.appendChild(el("div", "orari-ora secondario", h % 6 == 0 ? String(h) : ""));
    t.oreSettimana.forEach(function(riga, g) {
      griglia.appendChild(el("div", "orari-giorno secondario", GIORNI_CORTI[g]));
      riga.forEach(function(n, h) {
        var c = el("div", "orari-cella");
        if (n) c.style.setProperty("--intensita", (0.15 + 0.85 * n / massimo).toFixed(2));
        else c.classList.add("vuota");
        c.title = GIORNI[g] + " " + h + ":00 · " + numero(n) + (n == 1 ? " visita" : " visite");
        griglia.appendChild(c);
      });
    });
    s.appendChild(griglia);
    return s;
  }

  // un elenco con barre: [{ nome, valore, extra }] su un totale
  function elencoBarre(voci, totale, quanti) {
    var lista = el("div", "barre");
    var massimo = Math.max.apply(null, voci.map(function(v) {
      return v.valore;
    }).concat([1]));
    voci.slice(0, quanti || 8).forEach(function(v) {
      var riga = el("div", "barra-voce");
      var nome = el("div", "barra-nome", v.nome);
      if (v.extra) nome.appendChild(el("span", "secondario", " " + v.extra));
      riga.appendChild(nome);
      var traccia = el("div", "barra-traccia");
      var pieno = el("div", "barra-pieno");
      pieno.style.width = Math.max(2, v.valore / massimo * 100) + "%";
      traccia.appendChild(pieno);
      riga.appendChild(traccia);
      riga.appendChild(el("div", "barra-valore", totale ? percento(v.valore / totale) : numero(v.valore)));
      riga.title = numero(v.valore) + (v.valore == 1 ? " visita" : " visite");
      lista.appendChild(riga);
    });
    if (!voci.length) lista.appendChild(el("p", "secondario", "Nessun dato nel periodo"));
    return lista;
  }

  function ordinati(oggetto) {
    return Object.keys(oggetto).map(function(k) {
      return [k, oggetto[k]];
    }).sort(function(a, b) {
      return b[1] - a[1];
    });
  }

  function luoghi(t) {
    var s = scheda("Da dove");
    var scelta = segmenti([{
      id: "citta",
      nome: "Città"
    }, {
      id: "paesi",
      nome: "Paesi"
    }], vistaLuoghi, function(id) {
      vistaLuoghi = id;
      s.parentNode.replaceChild(luoghi(t), s);
    }, "piccoli");
    s.querySelector("h2").appendChild(scelta);
    var totale = Object.keys(t.paesi).reduce(function(n, k) {
      return n + t.paesi[k];
    }, 0);
    var voci;
    if (vistaLuoghi == "citta") {
      voci = ordinati(t.citta).filter(function(x) {
        return x[0].split("|")[0];
      }).map(function(x) {
        var parti = x[0].split("|");
        return {
          nome: (bandiera(parti[1]) + " " + (CITTA[parti[0]] || parti[0])).trim(),
          valore: x[1]
        };
      });
    } else {
      voci = ordinati(t.paesi).filter(function(x) {
        return x[0];
      }).map(function(x) {
        return {
          nome: (bandiera(x[0]) + " " + nomePaese(x[0])).trim(),
          valore: x[1]
        };
      });
    }
    s.appendChild(elencoBarre(voci, totale));
    return s;
  }

  // come arrivano: i siti da cui vengono, più chi arriva diretto (link in chat, app, indirizzo scritto)
  function fonti(t, tot) {
    var s = scheda("Come arrivano");
    var gruppi = {};
    Object.keys(t.fonti).forEach(function(dominio) {
      if (!dominio || /(^|\.)matteodelia\.com$/.test(dominio)) return;
      var nome = dominio.replace(/^www\./, "");
      for (var i = 0; i < FONTI.length; i++) {
        if (FONTI[i][0].test(dominio)) {
          nome = FONTI[i][1];
          break;
        }
      }
      gruppi[nome] = (gruppi[nome] || 0) + t.fonti[dominio];
    });
    if (t.canali.direct) gruppi["Diretto"] = t.canali.direct;
    var voci = ordinati(gruppi).map(function(x) {
      return {
        nome: x[0],
        valore: x[1]
      };
    });
    s.appendChild(elencoBarre(voci, t.visite || tot.visite));
    s.appendChild(el("p", "nota-piccola secondario", "Diretto: link aperti da WhatsApp e da altre app, indirizzo scritto, preferiti."));
    return s;
  }

  function dispositivi(t) {
    var s = scheda("Con cosa guardano");
    var gruppi = {
      Telefono: (t.dispositivi.mobile || 0),
      Computer: (t.dispositivi.desktop || 0) + (t.dispositivi.laptop || 0),
      Tablet: (t.dispositivi.tablet || 0)
    };
    var totale = gruppi.Telefono + gruppi.Computer + gruppi.Tablet;
    var barra = el("div", "divisa");
    var legenda = el("div", "divisa-legenda");
    ["Telefono", "Computer", "Tablet"].forEach(function(nome, i) {
      if (!gruppi[nome]) return;
      var parte = el("div", "divisa-parte colore-" + i);
      parte.style.flexGrow = gruppi[nome];
      barra.appendChild(parte);
      var voce = el("div", "divisa-voce");
      voce.appendChild(el("span", "divisa-punto colore-" + i));
      voce.appendChild(document.createTextNode(nome + " "));
      voce.appendChild(el("strong", "", percento(gruppi[nome] / totale)));
      legenda.appendChild(voce);
    });
    if (!totale) legenda.appendChild(el("p", "secondario", "Nessun dato nel periodo"));
    s.appendChild(barra);
    s.appendChild(legenda);
    return s;
  }

  var COLONNE = [{
    id: "viste",
    nome: "Visualizzazioni",
    corto: "Viste"
  }, {
    id: "tempoMedio",
    nome: "Tempo medio",
    corto: "Tempo"
  }, {
    id: "film",
    nome: "Film aperti",
    corto: "Film"
  }, {
    id: "visioneMedia",
    nome: "Visione media",
    corto: "Visione"
  }];

  function contenuti(t) {
    var s = scheda("Contenuti", "Ogni progetto: quante volte è stato visto, quanto ci si ferma sopra, quante volte si apre il film e quanto viene guardato.");
    var righe = righeProgetti(t);
    var sulSito = righe.filter(function(r) {
      return !r.tolto;
    });

    // i più e i meno: per il tempo servono almeno qualche visualizzazione, se no un caso solo decide
    var minimo = Math.max(3, Math.round(t.visite * 0.01));
    var conTempo = sulSito.filter(function(r) {
      return r.viste >= minimo;
    });
    var conFilm = sulSito.filter(function(r) {
      return r.visioni >= 2;
    });

    function primo(elenco, valore, alto) {
      return elenco.slice().sort(function(a, b) {
        return alto ? valore(b) - valore(a) : valore(a) - valore(b);
      })[0];
    }
    var evidenze = el("div", "evidenze");
    [
      ["Il più visto", primo(sulSito, function(r) {
        return r.viste;
      }, true), function(r) {
        return numero(r.viste) + " visualizzazioni";
      }],
      ["Il meno visto", primo(sulSito, function(r) {
        return r.viste;
      }, false), function(r) {
        return numero(r.viste) + " visualizzazioni";
      }],
      ["Ci si ferma di più", primo(conTempo, function(r) {
        return r.tempoMedio;
      }, true), function(r) {
        return durata(r.tempoMedio) + " in media";
      }],
      ["Ci si ferma di meno", primo(conTempo, function(r) {
        return r.tempoMedio;
      }, false), function(r) {
        return durata(r.tempoMedio) + " in media";
      }],
      ["Film aperto di più", primo(sulSito, function(r) {
        return r.film;
      }, true), function(r) {
        return numero(r.film) + " volte · " + percento(r.aperturaFilm) + " di chi lo vede";
      }],
      ["Film guardato di più", primo(conFilm, function(r) {
        return r.percentuale;
      }, true), function(r) {
        return Math.round(r.percentuale) + "% in media · " + minuti(r.visioneMedia);
      }]
    ].forEach(function(e) {
      var c = el("div", "evidenza");
      c.appendChild(el("div", "etichetta", e[0]));
      if (e[1] && (e[0].indexOf("meno") >= 0 || e[1].viste || e[1].film)) {
        c.appendChild(el("div", "evidenza-titolo", e[1].titolo));
        c.appendChild(el("div", "secondario", nomeCategoria(e[1].categoria) + " · " + e[2](e[1])));
      } else {
        c.appendChild(el("div", "evidenza-titolo secondario", "Ancora pochi dati"));
      }
      evidenze.appendChild(c);
    });
    s.appendChild(evidenze);

    var filtri = segmenti([{
      id: "tutte",
      nome: "Tutti"
    }].concat(CATEGORIE.map(function(c) {
      return {
        id: c.chiave,
        nome: c.nome
      };
    })), filtroCategoria, function(id) {
      filtroCategoria = id;
      s.parentNode.replaceChild(contenuti(t), s);
    }, "piccoli filtri");
    s.appendChild(filtri);

    // su iPhone la tabella non ha intestazioni: si ordina da qui
    var ordina = el("div", "ordina solo-telefono");
    ordina.appendChild(el("span", "secondario", "Ordina per"));
    ordina.appendChild(segmenti(COLONNE.map(function(c) {
      return {
        id: c.id,
        nome: c.corto
      };
    }), ordine.colonna, function(id) {
      ordine = {
        colonna: id,
        discendente: true
      };
      s.parentNode.replaceChild(contenuti(t), s);
    }, "piccoli"));
    s.appendChild(ordina);

    var visibili = righe.filter(function(r) {
      return filtroCategoria == "tutte" || r.categoria == filtroCategoria;
    }).sort(function(a, b) {
      var d = ordine.discendente ? b[ordine.colonna] - a[ordine.colonna] : a[ordine.colonna] - b[ordine.colonna];
      return d || b.viste - a.viste;
    });
    var massimoViste = Math.max.apply(null, visibili.map(function(r) {
      return r.viste;
    }).concat([1]));

    var tabella = el("table", "tabella-progetti");
    var testa = el("tr");
    testa.appendChild(el("th", "colonna-progetto", "Progetto"));
    COLONNE.forEach(function(c) {
      var th = el("th", "ordinabile" + (ordine.colonna == c.id ? " attiva" : ""), c.nome);
      if (ordine.colonna == c.id) th.appendChild(el("span", "freccia", ordine.discendente ? " ↓" : " ↑"));
      th.addEventListener("click", function() {
        if (ordine.colonna == c.id) ordine.discendente = !ordine.discendente;
        else ordine = {
          colonna: c.id,
          discendente: true
        };
        s.parentNode.replaceChild(contenuti(t), s);
      });
      testa.appendChild(th);
    });
    var thead = el("thead");
    thead.appendChild(testa);
    tabella.appendChild(thead);
    var corpo = el("tbody");
    visibili.forEach(function(r) {
      var tr = el("tr", r.tolto ? "tolto" : "");
      var nome = el("td", "colonna-progetto");
      var miniatura = el("div", "tabella-miniatura");
      if (r.foto) {
        var img = el("img");
        img.src = r.foto;
        img.alt = "";
        img.loading = "lazy";
        miniatura.appendChild(img);
      }
      nome.appendChild(miniatura);
      var testi = el("div", "tabella-testi");
      testi.appendChild(el("div", "tabella-titolo", r.titolo));
      testi.appendChild(el("div", "secondario", nomeCategoria(r.categoria) + (r.sottotitolo ? " · " + r.sottotitolo : "")));
      nome.appendChild(testi);
      tr.appendChild(nome);

      var viste = el("td", "", numero(r.viste));
      var traccia = el("div", "cella-barra");
      traccia.style.width = (r.viste / massimoViste * 100) + "%";
      viste.appendChild(traccia);
      viste.dataset.etichetta = "Visualizzazioni";
      tr.appendChild(viste);

      var tempo = el("td", "", r.viste ? durata(r.tempoMedio) : "—");
      tempo.dataset.etichetta = "Tempo medio";
      tr.appendChild(tempo);

      var film = el("td", "", numero(r.film));
      if (r.viste && r.film) film.appendChild(el("span", "secondario", " · " + percento(r.aperturaFilm)));
      film.dataset.etichetta = "Film aperti";
      tr.appendChild(film);

      var visione = el("td", "", r.visioni ? minuti(r.visioneMedia) : "—");
      if (r.visioni) visione.appendChild(el("span", "secondario", " · " + Math.round(r.percentuale) + "%"));
      visione.dataset.etichetta = "Visione media";
      tr.appendChild(visione);
      corpo.appendChild(tr);
    });
    tabella.appendChild(corpo);
    var contenitore = el("div", "tabella-contenitore");
    contenitore.appendChild(tabella);
    s.appendChild(contenitore);
    s.appendChild(el("p", "nota-piccola secondario", "Tempo medio: quanto si resta sul progetto, film escluso. Film aperti: quante volte si apre a schermo intero, e su quante visualizzazioni. Visione media: minuti guardati ogni volta e fin dove si arriva in media."));
    return s;
  }

  function clic(t) {
    var s = scheda("Clic", "Contatti e sezioni aperte");
    var griglia = el("div", "clic-griglia");
    [
      ["Mail", t.contatti.mail],
      ["Instagram", t.contatti.instagram],
      ["Vimeo", t.contatti.vimeo],
      ["Crediti letti", t.crediti],
      ["Privacy", t.privacy]
    ].forEach(function(x) {
      var c = el("div", "clic-voce");
      c.appendChild(el("div", "valore", numero(x[1])));
      c.appendChild(el("div", "etichetta", x[0]));
      griglia.appendChild(c);
    });
    s.appendChild(griglia);
    return s;
  }

  // ---------- CONTENUTI / INSIGHT ----------

  function mostraVista(vista) {
    var insight = vista == "insight";
    document.body.classList.toggle("vista-insight", insight);
    $("contenuti").hidden = insight;
    pagina.hidden = !insight;
    Array.prototype.forEach.call(document.querySelectorAll(".viste button"), function(b) {
      b.classList.toggle("attivo", b.dataset.vista == vista);
    });
    scrivi("editor_vista", vista);
    if (insight) {
      window.scrollTo(0, 0);
      if (!archivio.ultimo && !caricamento) carica();
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll(".viste button"), function(b) {
    b.addEventListener("click", function() {
      mostraVista(b.dataset.vista);
    });
  });
  if (leggi("editor_vista") == "insight") mostraVista("insight");
})();
