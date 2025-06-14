$(document).ready(function() {
  setTimeout(function() {
    $(".content").css("color", "#000");
  }, 1000);

  function t(t) {
    return t && t.__esModule ? t.default : t
  }
  const e = (t, e) => Math.floor(Math.random() * (e - t + 1)) + t;

  function o(t, e, o) {
    return e in t ? Object.defineProperty(t, e, {
      value: o,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }) : t[e] = o, t
  }
  var s, i = {};
  i = function() {
    var t = document,
      e = t.createTextNode.bind(t);

    function o(t, e, o) {
      t.style.setProperty(e, o)
    }

    function s(t, e) {
      return t.appendChild(e)
    }

    function i(e, o, i, n) {
      var r = t.createElement("span");
      return o && (r.className = o), i && (!n && r.setAttribute("data-" + o, i), r.textContent = i), e && s(e, r) || r
    }

    function n(t, e) {
      return t.getAttribute("data-" + e)
    }

    function r(e, o) {
      return e && 0 != e.length ? e.nodeName ? [e] : [].slice.call(e[0].nodeName ? e : (o || t).querySelectorAll(e)) : []
    }

    function l(t) {
      for (var e = []; t--;) e[t] = [];
      return e
    }

    function c(t, e) {
      t && t.some(e)
    }

    function a(t) {
      return function(e) {
        return t[e]
      }
    }

    function h(t, e, s) {
      var i = "--" + e,
        n = i + "-index";
      c(s, (function(t, e) {
        Array.isArray(t) ? c(t, (function(t) {
          o(t, n, e)
        })) : o(t, n, e)
      })), o(t, i + "-total", s.length)
    }
    var u = {};

    function f(t, e, o) {
      var s = o.indexOf(t);
      if (-1 == s) o.unshift(t), c(u[t].depends, (function(e) {
        f(e, t, o)
      }));
      else {
        var i = o.indexOf(e);
        o.splice(s, 1), o.splice(i, 0, t)
      }
      return o
    }

    function m(t, e, o, s) {
      return {
        by: t,
        depends: e,
        key: o,
        split: s
      }
    }

    function d(t) {
      return f(t, 0, []).map(a(u))
    }

    function p(t) {
      u[t.by] = t
    }

    function g(t, o, n, l, a) {
      t.normalize();
      var h = [],
        u = document.createDocumentFragment();
      l && h.push(t.previousSibling);
      var f = [];
      return r(t.childNodes).some((function(t) {
        if (!t.tagName || t.hasChildNodes()) {
          if (t.childNodes && t.childNodes.length) return f.push(t), void h.push.apply(h, g(t, o, n, l, a));
          var s = t.wholeText || "",
            r = s.trim();
          r.length && (" " === s[0] && f.push(e(" ")), c(r.split(n), (function(t, e) {
            e && a && f.push(i(u, "whitespace", " ", a));
            var s = i(u, o, t);
            h.push(s), f.push(s)
          })), " " === s[s.length - 1] && f.push(e(" ")))
        } else f.push(t)
      })), c(f, (function(t) {
        s(u, t)
      })), t.innerHTML = "", s(t, u), h
    }
    var v = 0;

    function C(t, e) {
      for (var o in e) t[o] = e[o];
      return t
    }
    var M = "words",
      y = m(M, v, "word", (function(t) {
        return g(t, "word", /\s+/, 0, 1)
      })),
      b = "chars",
      x = m(b, [M], "char", (function(t, e, o) {
        var s = [];
        return c(o[M], (function(t, o) {
          s.push.apply(s, g(t, "char", "", e.whitespace && o))
        })), s
      }));

    function T(t) {
      var e = (t = t || {}).key;
      return r(t.target || "[data-splitting]").map((function(o) {
        var s = o["🍌"];
        if (!t.force && s) return s;
        s = o["🍌"] = {
          el: o
        };
        var i = d(t.by || n(o, "splitting") || b),
          r = C({}, t);
        return c(i, (function(t) {
          if (t.split) {
            var i = t.by,
              n = (e ? "-" + e : "") + t.key,
              l = t.split(o, r, s);
            n && h(o, n, l), s[i] = l, o.classList.add(i)
          }
        })), o.classList.add("splitting"), s
      }))
    }

    function w(t) {
      var e = (t = t || {}).target = i();
      return e.innerHTML = t.content, T(t), e.outerHTML
    }

    function A(t, e, o) {
      var s = r(e.matching || t.children, t),
        i = {};
      return c(s, (function(t) {
        var e = Math.round(t[o]);
        (i[e] || (i[e] = [])).push(t)
      })), Object.keys(i).map(Number).sort(O).map(a(i))
    }

    function O(t, e) {
      return t - e
    }
    T.html = w, T.add = p;
    var D = m("lines", [M], "line", (function(t, e, o) {
        return A(t, {
          matching: o[M]
        }, "offsetTop")
      })),
      P = m("items", v, "item", (function(t, e) {
        return r(e.matching || t.children, t)
      })),
      S = m("rows", v, "row", (function(t, e) {
        return A(t, e, "offsetTop")
      })),
      L = m("cols", v, "col", (function(t, e) {
        return A(t, e, "offsetLeft")
      })),
      N = m("grid", ["rows", "cols"]),
      R = "layout",
      k = m(R, v, v, (function(t, e) {
        var l = e.rows = +(e.rows || n(t, "rows") || 1),
          c = e.columns = +(e.columns || n(t, "columns") || 1);
        if (e.image = e.image || n(t, "image") || t.currentSrc || t.src, e.image) {
          var a = r("img", t)[0];
          e.image = a && (a.currentSrc || a.src)
        }
        e.image && o(t, "background-image", "url(" + e.image + ")");
        for (var h = l * c, u = [], f = i(v, "cell-grid"); h--;) {
          var m = i(f, "cell");
          i(m, "cell-inner"), u.push(m)
        }
        return s(t, f), u
      })),
      E = m("cellRows", [R], "row", (function(t, e, o) {
        var s = e.rows,
          i = l(s);
        return c(o[R], (function(t, e, o) {
          i[Math.floor(e / (o.length / s))].push(t)
        })), i
      })),
      H = m("cellColumns", [R], "col", (function(t, e, o) {
        var s = e.columns,
          i = l(s);
        return c(o[R], (function(t, e) {
          i[e % s].push(t)
        })), i
      })),
      q = m("cells", ["cellRows", "cellColumns"], "cell", (function(t, e, o) {
        return o[R]
      }));
    return p(y), p(x), p(D), p(P), p(S), p(L), p(N), p(k), p(E), p(H), p(q), T
  }();
  class n {
    constructor(t) {
      o(this, "position", -1), o(this, "cells", []), this.position = t
    }
  }
  class r {
    set(t) {
      this.state = t, this.DOM.el.innerHTML = this.state
    }
    constructor(t, {
      position: e,
      previousCellPosition: s
    } = {}) {
      o(this, "DOM", {
        el: null
      }), o(this, "position", -1), o(this, "previousCellPosition", -1), o(this, "original", void 0), o(this, "state", void 0), o(this, "color", void 0), o(this, "originalColor", void 0), o(this, "cache", void 0), this.DOM.el = t, this.original = this.DOM.el.innerHTML, this.state = this.original, this.color = this.originalColor = getComputedStyle(document.documentElement).getPropertyValue("--color-text"), this.position = e, this.previousCellPosition = s
    }
  }
  class l {
    clearCells() {
      for (const t of this.lines)
        for (const e of t.cells) e.set("&nbsp;")
    }
    getRandomChar() {
      return this.lettersAndSymbols[Math.floor(Math.random() * this.lettersAndSymbols.length)]
    }
    fx1() {
      let t = 0;
      this.clearCells();
      const o = (e, s, i = 0) => {
        9 === i ? (s.set(s.original), ++t, t === this.totalChars && (this.isAnimating = !1)) : s.set(this.getRandomChar()), ++i < 10 && setTimeout((() => o(e, s, i)), 250)
      };
      for (const t of this.lines)
        for (const s of t.cells) setTimeout((() => o(t, s)), e(0, 2e3))
    }
    trigger(t = "fx1") {
      t in this.effects && !this.isAnimating && (this.isAnimating = !0, this.effects[t]())
    }
    constructor(e) {
      o(this, "DOM", {
        el: null
      }), o(this, "lines", []), o(this, "lettersAndSymbols", ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "!", "@", "#", "$", "&", "*", "(", ")", "-", "_", "+", "=", "/", "[", "]", "{", "}", ";", ":", "<", ">", ",", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]), o(this, "effects", {
        fx1: () => this.fx1()
      }), o(this, "totalChars", 0), this.DOM.el = e;
      const s = t(i)({
        target: this.DOM.el,
        by: "lines"
      });
      s.forEach((e => t(i)({
        target: e.words
      })));
      for (const [t, e] of s[0].lines.entries()) {
        const o = new n(t);
        let s = [],
          i = 0;
        for (const t of e)
          for (const e of [...t.querySelectorAll(".char")]) s.push(new r(e, {
            position: i,
            previousCellPosition: 0 === i ? -1 : i - 1
          })), ++i;
        o.cells = s, this.lines.push(o), this.totalChars += i
      }
    }
  }(s = "biu0hfr", new Promise((t => {
    WebFont.load({
      typekit: {
        id: s
      },
      active: t
    })
  }))).then((() => {
    document.body.classList.remove("loading");
    const t = document.querySelector(".content"),
      e = new l(t);
    e.trigger("fx1"), [...document.querySelectorAll(".effects > button")].forEach((t => {
      t.addEventListener("click", (() => {
        e.trigger(`fx${t.dataset.fx}`)
      }))
    }))
  }));

});
