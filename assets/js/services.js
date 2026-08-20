/* ============================================================================
   /services — behaviour. Vanilla, no dependencies, progressive enhancement.
   ========================================================================= */
(function () {
  "use strict";

  /* The currency control doubles as an audience control — a local buyer and an
     overseas one need different first reassurances. Two strings carry that. */
  var AUDIENCE = {
    PKR: {
      note: "Replies within 24 hours · Based in Lahore · Happy to meet in person if you are local",
      wa:   "Hi Choudary — I saw your services page and want to discuss a project."
    },
    USD: {
      note: "Replies within 24 hours · Async by default · Overlapping hours for EU and US-East",
      wa:   "Hi Choudary — I found your services page and would like to discuss a project. I'm based outside Pakistan."
    }
  };

  var WA_NUMBER = "923260440692";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- 1 · Mobile nav ---------------------------------------------------- */
  (function () {
    var toggle = $("#nav-toggle"), nav = $("#nav-links");
    if (!toggle || !nav) return;
    function set(open) {
      toggle.setAttribute("aria-expanded", String(open));
      if (open) nav.setAttribute("data-open", ""); else nav.removeAttribute("data-open");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      toggle.textContent = open ? "✕" : "☰";
      document.body.style.overflow = open ? "hidden" : "";
    }
    toggle.addEventListener("click", function () { set(toggle.getAttribute("aria-expanded") !== "true"); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { set(false); toggle.focus(); }
    });
    var mq = window.matchMedia("(min-width: 900px)");
    (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(
      function (e) { if (e.matches) set(false); });
    set(false);
  })();

  /* ---- 2 · Scroll reveals — fire once, 70ms stagger inside a group ------- */
  (function () {
    var targets = $$("[data-reveal]");
    $$("[data-reveal-group]").forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty("--i", i % 6); });
    });
    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        obs.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (el) { io.observe(el); });
  })();

  /* ---- 3 · Announcement ticker -----------------------------------------
     The five items are far narrower than a desktop viewport, so scrolling them
     as-is would drag a long empty gap across the strip. Clone the set until it
     covers the viewport, then duplicate the whole track and translate -50% —
     that lands each cycle on an identical frame, so the loop has no seam.
     Duration is derived from width to keep the speed constant at every
     breakpoint rather than sprinting on mobile. ---------------------------- */
  (function () {
    var row = $("#ticker-row");
    if (!row || reduced) return;                 // static wrapped row is the fallback
    var view = row.parentNode;

    var originals = $$("span", row).map(function (el) { return el.cloneNode(true); });
    if (!originals.length) return;

    function build() {
      // Start from a clean set every time, so a rebuild never compounds.
      row.textContent = "";
      originals.forEach(function (el) { row.appendChild(el.cloneNode(true)); });

      /* Switch to the nowrap track BEFORE measuring. In its default state the
         row is `flex-wrap: wrap`, so scrollWidth is pinned to the container and
         every clone adds height instead of width — the fill loop then runs
         until its guard trips and the duration comes out of a meaningless
         number. */
      view.classList.add("is-marquee");

      // Fill to at least one full viewport before duplicating.
      var guard = 0;
      while (row.scrollWidth < view.clientWidth && guard++ < 40) {
        originals.forEach(function (el) { row.appendChild(el.cloneNode(true)); });
      }

      // Duplicating the filled track makes it exactly two identical halves, so
      // translating -50% always lands on a matching frame — no seam.
      var half = row.scrollWidth;
      $$("span", row).forEach(function (el) { row.appendChild(el.cloneNode(true)); });

      // Everything past the first set is decoration; without this the same five
      // claims get announced a dozen times over.
      $$("span", row).slice(originals.length).forEach(function (el) {
        el.setAttribute("aria-hidden", "true");
      });

      // Constant ~55 px/second whatever width the filled track ended up.
      row.style.setProperty("--ticker-dur", Math.round(half / 55) + "s");
    }

    build();

    /* Re-measure once the webfont lands. The first pass runs against the
       fallback face, so every item is a slightly different width and the speed
       is computed from a stale number. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(build);
    }

    /* A viewport that grows past the track — phone rotated, window dragged
       wider — would otherwise pull a visible gap across the strip. */
    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(build, 200);
    });
  })();

  /* ---- 4 · Tech marquees — two tracks, opposing directions --------------
     Chips are built from the JSON manifests and reference the inline SVG
     sprite via <use>, so each brand mark's path data exists once in the
     document however many times it is shown. The static text list stays as the
     accessible alternative. ------------------------------------------------ */
  (function () {
    /* Relative luminance (sRGB, WCAG). Near-black marks — GitHub, Flask,
       Express — sit heavier on white than everything else, so they are pulled
       to the page ink tone to keep the rows optically even. */
    function tooDark(hex) {
      var c = [1, 3, 5].map(function (i) {
        var v = parseInt(hex.substr(i, 2), 16) / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] < 0.06;
    }

    function chip(rec) {
      var el = document.createElement("span");
      el.className = "tech__chip";
      if (rec.slug) {
        el.style.setProperty("--brand", tooDark(rec.hex) ? "#16233b" : rec.hex);
        el.innerHTML =
          '<svg class="tech__logo" viewBox="0 0 24 24" aria-hidden="true">' +
          '<use href="#ti-' + rec.slug + '"></use></svg>';
      } else {
        el.classList.add("tech__chip--plain");
      }
      el.appendChild(document.createTextNode(rec.label));
      return el;
    }

    function build(rowId, dataId) {
      var row = $(rowId), dataEl = $(dataId);
      if (!row || !dataEl) return;
      var items;
      try { items = JSON.parse(dataEl.textContent); } catch (e) { return; }
      if (!items || !items.length) return;

      if (reduced) {
        /* Static centred wrap. Bailing out entirely would leave an empty band,
           because the plain-text fallback list is .sr. */
        row.classList.add("tech__row--static");
        items.forEach(function (rec) { row.appendChild(chip(rec)); });
        return;
      }
      // duplicated once so the 50% translation loops seamlessly
      items.concat(items).forEach(function (rec) { row.appendChild(chip(rec)); });
    }

    build("#tech-row-a", "#tech-data-a");
    build("#tech-row-b", "#tech-data-b");
  })();

  /* ---- 5 · Packages — tabs, cards, and one reusable modal ----------------
     Card and tab data lives here. The long modal prose deliberately does NOT:
     it sits in the <details> list in the markup, which is this section's no-JS
     view, and the dialog clones its body from there. One copy of the text, so
     the two can never drift apart, and none of it is paid for twice. -------- */
  var BUDGETS = {
    PKR: ["Under PKR 40,000", "PKR 40,000 – 90,000", "PKR 90,000 – 180,000", "PKR 180,000+", "Not sure yet"],
    USD: ["Under $175", "$175 – $375", "$375 – $750", "$750+", "Not sure yet"]
  };

  (function () {
    var DATA = {"tabs":[{"id":"custom","label":"Custom","head":"Custom Web Development","sub":"Written by hand for your business. No templates, so your site loads fast and works exactly how you need it to."},{"id":"shopify","label":"Shopify","head":"Shopify E-commerce Development","sub":"A complete online shop, set up and tested, ready to take orders and payments from the first day."},{"id":"wordpress","label":"WordPress","head":"WordPress Development","sub":"Costs less and takes less time. You change the words and pictures whenever you like, with no coding."},{"id":"automation","label":"Automation","head":"Automation & AI Development","sub":"If someone on your team repeats the same job every day, a program can do it instead."}],"pkgs":[{"id":"landing","tab":"custom","name":"Landing Page","who":"One page, one goal — built to turn ad clicks into enquiries.","pkr":35000,"usd":150,"from":false,"hot":false},{"id":"business","tab":"custom","name":"Business Website","who":"A full company site, designed from scratch rather than themed.","pkr":85000,"usd":350,"from":false,"hot":false},{"id":"fullstack","tab":"custom","name":"Full Stack Website","who":"Accounts, a secure database, and your own control panel.","pkr":175000,"usd":700,"from":false,"hot":true},{"id":"saas","tab":"custom","name":"SaaS Platform","who":"Software your customers pay a monthly or yearly fee to use.","pkr":300000,"usd":1200,"from":true,"hot":false},{"id":"starter","tab":"shopify","name":"Starter Store","who":"Your first online shop, set up and ready to take orders.","pkr":65000,"usd":275,"from":false,"hot":false},{"id":"shopcustom","tab":"shopify","name":"Custom Shopify Store","who":"A coded storefront for brands competing on presentation.","pkr":165000,"usd":650,"from":false,"hot":true},{"id":"migrate","tab":"shopify","name":"Move to Shopify","who":"Move across without losing products, customers, or rankings.","pkr":95000,"usd":395,"from":false,"hot":false},{"id":"integrate","tab":"shopify","name":"Connect Your Tools","who":"Link your store to couriers, WhatsApp, and your accounts.","pkr":45000,"usd":200,"from":true,"hot":false},{"id":"wplanding","tab":"wordpress","name":"Landing Page","who":"A single page you can edit yourself, for less.","pkr":25000,"usd":110,"from":false,"hot":false},{"id":"wpportfolio","tab":"wordpress","name":"Portfolio Website","who":"A gallery for your work that you update yourself.","pkr":40000,"usd":175,"from":false,"hot":false},{"id":"wpbusiness","tab":"wordpress","name":"Business Website","who":"A full company site your staff can edit without code.","pkr":60000,"usd":250,"from":false,"hot":true},{"id":"wpservices","tab":"wordpress","name":"Services Website","who":"A page for each service, built to be found in local search.","pkr":75000,"usd":325,"from":false,"hot":false},{"id":"cms","tab":"automation","name":"Website Control Panel","who":"Change anything on your site yourself, with no developer.","pkr":70000,"usd":290,"from":false,"hot":false},{"id":"bizauto","tab":"automation","name":"Business Automation","who":"Turn a repeated daily task into a program that runs itself.","pkr":90000,"usd":375,"from":true,"hot":false},{"id":"genai","tab":"automation","name":"AI Apps","who":"A chatbot or document assistant built on your own material.","pkr":120000,"usd":500,"from":true,"hot":true}]};

    var grid = $("#pkg-grid"), tabsEl = $("#pkg-tabs"), modal = $("#pkg-modal");
    if (!grid || !tabsEl || !modal) return;

    var mBody = $("#pkgmodal-body");
    var cur = "PKR", tab = DATA.tabs[0].id, opener = null, lastY = 0;

    function tabOf(id) { for (var i = 0; i < DATA.tabs.length; i++) if (DATA.tabs[i].id === id) return DATA.tabs[i]; return null; }
    function pkgOf(id) { for (var i = 0; i < DATA.pkgs.length; i++) if (DATA.pkgs[i].id === id) return DATA.pkgs[i]; return null; }
    function tabIndex(id) { for (var i = 0; i < DATA.tabs.length; i++) if (DATA.tabs[i].id === id) return i; return 0; }

    var ICON = {};
    function icon(id) {
      if (ICON[id] === undefined) {
        var sym = document.getElementById("pk-" + id);
        ICON[id] = sym ? sym.innerHTML : "";
      }
      return ICON[id];
    }

    function fmt(p) {
      var n = cur === "PKR" ? p.pkr : p.usd;
      return (cur === "PKR" ? "PKR " : "$") + n.toLocaleString("en-US");
    }

    /* ---- cards ---- */
    function card(p, i) {
      return '<article class="pkg' + (p.hot ? " pkg--featured" : "") + '" data-pkg="' + p.id +
        '" data-reveal style="--i:' + (i % 6) + '">' +
        (p.hot ? '<span class="pkg__badge">Most popular</span>' : "") +
        '<span class="pkg__plate"><svg class="pkg__art" viewBox="0 0 160 120" aria-hidden="true">' +
        icon(p.id) + "</svg></span>" +
        "<h3>" + p.name + "</h3>" +
        '<p class="pkg__who">' + p.who + "</p>" +
        '<p class="pkg__price"><span class="pkg__from">Starting from</span>' +
        "<span>" + fmt(p) + "</span></p>" +
        '<button class="btn btn--wide ' + (p.hot ? "btn--primary" : "btn--ghost") +
        '" type="button" data-open="' + p.id + '">View more<span class="sr"> about ' + p.name + "</span></button>" +
        "</article>";
    }

    var io = ("IntersectionObserver" in window) && !reduced ? new IntersectionObserver(function (es, ob) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); ob.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }) : null;

    function paint() {
      var list = DATA.pkgs.filter(function (p) { return p.tab === tab; });
      grid.innerHTML = list.map(card).join("");
      grid.classList.toggle("pkgs--3", list.length === 3);
      $$(".pkg", grid).forEach(function (el) {
        if (io) io.observe(el); else el.classList.add("is-in");
      });
    }

    /* ---- tabs ---- */
    tabsEl.innerHTML = DATA.tabs.map(function (t) {
      return '<button class="pkgtab" type="button" role="tab" id="tab-' + t.id +
        '" data-tab="' + t.id + '" aria-controls="pkg-grid" aria-selected="false" tabindex="-1">' +
        t.label + "</button>";
    }).join("");

    function setTab(id, opt) {
      opt = opt || {};
      tab = id;
      var t = tabOf(id);
      $$(".pkgtab", tabsEl).forEach(function (b) {
        var on = b.getAttribute("data-tab") === id;
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
        if (on && opt.focus) b.focus();
      });
      $("#pkg-head").textContent = t.head;
      $("#pkg-sub").textContent = t.sub;
      $("#pkg-wpnote").hidden = id !== "wordpress";
      grid.setAttribute("aria-labelledby", "tab-" + id);

      if (reduced || opt.instant) { paint(); return; }
      grid.classList.add("is-swap");
      setTimeout(function () { paint(); grid.classList.remove("is-swap"); }, 200);
    }

    tabsEl.addEventListener("click", function (e) {
      var b = e.target.closest(".pkgtab");
      if (!b) return;
      setTab(b.getAttribute("data-tab"));
      hash(b.getAttribute("data-tab"));
    });
    tabsEl.addEventListener("keydown", function (e) {
      var i = tabIndex(tab), n = DATA.tabs.length, k;
      if (e.key === "ArrowRight") k = i + 1;
      else if (e.key === "ArrowLeft") k = i - 1;
      else if (e.key === "Home") k = 0;
      else if (e.key === "End") k = n - 1;
      else return;
      e.preventDefault();
      k = (k + n) % n;
      setTab(DATA.tabs[k].id, { focus: true });
      hash(DATA.tabs[k].id);
    });

    /* ---- modal ---- */
    function open(id, btn) {
      var p = pkgOf(id), doc = document.getElementById("doc-" + id);
      if (!p || !doc) return;
      opener = btn || null;
      var price = fmt(p);
      $("#pkgmodal-tab").textContent = tabOf(p.tab).label;
      $("#pkgmodal-title").textContent = p.name;
      $("#pkgmodal-hprice").textContent = price;
      $("#pkgmodal-price").textContent = price;
      mBody.innerHTML = doc.querySelector(".pkgdoc__body").innerHTML;
      mBody.scrollTop = 0;
      modal.setAttribute("data-pkg", id);

      // Pin the page rather than just hiding overflow, so the scroll position
      // survives exactly — plain overflow:hidden jumps to the top on iOS.
      lastY = window.pageYOffset;
      document.body.style.position = "fixed";
      document.body.style.top = -lastY + "px";
      document.body.style.width = "100%";

      modal.hidden = false;
      void modal.offsetWidth;                       // commit the closed state first
      modal.classList.add("is-open");
      hash("pkg-" + id);
      var c = modal.querySelector(".pkgmodal__close");
      if (c) c.focus();
      document.addEventListener("keydown", onKey, true);
    }

    function close() {
      if (modal.hidden) return;
      modal.classList.remove("is-open");
      document.removeEventListener("keydown", onKey, true);
      var done = function () {
        modal.hidden = true;
        mBody.innerHTML = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, lastY);
        if (opener) { try { opener.focus({ preventScroll: true }); } catch (e) { opener.focus(); } }
        opener = null;
      };
      if (reduced) done(); else setTimeout(done, 160);
      hash(tab);
    }

    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      var f = $$("a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex='-1'])", modal)
        .filter(function (el) { return el.offsetWidth || el.offsetHeight; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    grid.addEventListener("click", function (e) {
      var b = e.target.closest("[data-open]");
      if (b) open(b.getAttribute("data-open"), b);
    });
    modal.addEventListener("click", function (e) {
      if (e.target.closest("[data-pkgclose]")) close();
    });

    $("#pkgmodal-cta").addEventListener("click", function () {
      var id = modal.getAttribute("data-pkg");
      close();
      var sel = $("#f-service");
      if (sel) for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].getAttribute("data-id") === id) { sel.selectedIndex = i; break; }
      }
      var c = document.getElementById("contact");
      if (c) setTimeout(function () {
        c.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      }, reduced ? 0 : 180);
    });

    /* ---- the service dropdown is generated from the same list ---- */
    (function () {
      var sel = $("#f-service");
      if (!sel) return;
      var out = '<option value="">Select one</option>';
      DATA.tabs.forEach(function (t) {
        out += '<optgroup label="' + t.label + '">';
        DATA.pkgs.forEach(function (p) {
          if (p.tab !== t.id) return;
          var l = p.name + " · " + t.label;
          out += '<option data-id="' + p.id + '" value="' + l + '">' + l + "</option>";
        });
        out += "</optgroup>";
      });
      sel.innerHTML = out + '<option value="Something else">Something else</option>';
    })();

    /* ---- currency doubles as the audience switch ---- */
    function audience() {
      var sel = $("select[data-budget]");
      if (sel) {
        var keep = sel.selectedIndex;
        sel.innerHTML = '<option value="">Select a range</option>' +
          BUDGETS[cur].map(function (b) { return "<option>" + b + "</option>"; }).join("");
        if (keep > 0 && keep < sel.options.length) sel.selectedIndex = keep;
      }
      var note = $("[data-audience-note]");
      if (note) note.textContent = AUDIENCE[cur].note;
      $$('a[href*="wa.me/"]').forEach(function (a) {
        a.href = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(AUDIENCE[cur].wa);
      });
    }

    $$('input[name="currency"]').forEach(function (r) {
      r.addEventListener("change", function () {
        if (!r.checked) return;
        cur = r.value;
        paint();
        if (!modal.hidden) {                        // keep an open dialog in step
          var p = pkgOf(modal.getAttribute("data-pkg"));
          if (p) {
            $("#pkgmodal-hprice").textContent = fmt(p);
            $("#pkgmodal-price").textContent = fmt(p);
          }
        }
        audience();
        try { localStorage.setItem("currency", cur); } catch (e) {}
      });
    });

    /* ---- deep links: #shopify selects a tab, #pkg-saas opens a package ---- */
    function hash(h) { try { history.replaceState(null, "", "#" + h); } catch (e) {} }

    function fromHash() {
      var h = (location.hash || "").replace(/^#/, "");
      if (!h) return false;
      if (h.indexOf("pkg-") === 0) {
        var p = pkgOf(h.slice(4));
        if (p) { setTab(p.tab, { instant: true }); open(p.id, null); return true; }
      }
      if (tabOf(h)) { setTab(h, { instant: true }); return true; }
      return false;
    }

    try { if (localStorage.getItem("currency") === "USD") cur = "USD"; } catch (e) {}
    $$('input[name="currency"]').forEach(function (r) { r.checked = r.value === cur; });

    if (!fromHash()) setTab(DATA.tabs[0].id, { instant: true });
    audience();
    window.addEventListener("hashchange", fromHash);
  })();

  /* ---- 6 · Form — posts natively without JS; this adds inline states ----- */
  (function () {
    var form = $("#brief");
    if (!form) return;
    var status = $("#form-status");
    var btn = form.querySelector('button[type="submit"]');
    var label = btn ? btn.textContent : "";

    function say(msg, state) {
      if (!status) return;
      status.textContent = msg;
      if (state) status.setAttribute("data-state", state); else status.removeAttribute("data-state");
    }

    form.addEventListener("submit", function (e) {
      if (!form.checkValidity()) return;   // let the browser show its own UI
      e.preventDefault();
      if (btn) { btn.disabled = true; btn.textContent = "Sending"; }
      say("Sending your project details…");

      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          form.reset();
          say("Sent. You will get a reply within 24 hours.", "ok");
        })
        .catch(function () {
          say("That did not send. Email contact@choudaryhussainali.online or message on WhatsApp and it will get through.", "err");
        })
        .finally(function () { if (btn) { btn.disabled = false; btn.textContent = label; } });
    });
  })();

  /* ---- 7 · Hero animation — honour reduced motion ------------------------
     This file is ordered before the player module, so clearing the attribute
     here happens before the custom element upgrades and it never starts. The
     whenDefined branch is a belt-and-braces stop in case that order changes. */
  (function () {
    if (!reduced) return;
    var el = $("dotlottie-wc");
    if (!el) return;
    el.removeAttribute("autoplay");
    if (window.customElements && customElements.whenDefined) {
      customElements.whenDefined("dotlottie-wc").then(function () {
        if (typeof el.pause === "function") el.pause();
      });
    }
  })();

  /* ---- 8 · Comparison band background ----------------------------------
     Mounted only when the band nears the viewport. It is the page's second
     Lottie and the hero's already costs real main-thread time on load, so this
     one is not paid for until it is about to be seen. Under reduced motion the
     element is still mounted but never autoplays, so the band keeps its
     artwork as a still frame rather than going bare. */
  (function () {
    var host = $(".wy__bg");
    if (!host) return;
    var mounted = false;
    function mount() {
      if (mounted) return;
      mounted = true;
      var el = document.createElement("dotlottie-wc");
      el.setAttribute("src", "https://lottie.host/668e2811-cd26-4230-b5af-1e756548b297/t3m4UiJNsv.json");
      el.setAttribute("loop", "");
      if (!reduced) el.setAttribute("autoplay", "");
      el.setAttribute("aria-hidden", "true");
      host.appendChild(el);
    }
    if (!("IntersectionObserver" in window)) { mount(); return; }
    var io = new IntersectionObserver(function (es, ob) {
      es.forEach(function (e) { if (e.isIntersecting) { mount(); ob.disconnect(); } });
    }, { rootMargin: "400px 0px" });
    io.observe(host);
  })();

  /* ---- 9 · What gets built — coverflow carousel --------------------------
     Slides are positioned absolutely and only ever transformed, so moving
     between them costs no layout. Each card's animation is mounted once, when
     the section first comes near the viewport, and only the centre card is left
     playing — four simultaneous players is a lot of main thread for artwork
     nobody is looking at. */
  (function () {
    var stage = $("#cx-stage");
    if (!stage) return;
    var slides = $$(".cx__slide", stage);
    if (slides.length < 2) return;

    var dots = $$(".cx__dot"), live = $("#cx-live");
    var n = slides.length, active = 0;

    function layout() {
      slides.forEach(function (el, i) {
        var off = i - active;
        if (off > n / 2) off -= n;              // take the short way round
        if (off < -n / 2) off += n;
        var abs = Math.abs(off);
        var state = abs === 0 ? "active" : abs === 1 ? "side" : "far";
        el.dataset.state = state;
        el.style.transform =
          "translate3d(calc(-50% + " + (off * 62) + "%),0,0) scale(" + (abs === 0 ? 1 : 0.855) + ")";
        el.style.opacity = abs > 1 ? "0" : abs === 1 ? "0.42" : "1";
        el.style.zIndex = String(10 - abs);
        el.setAttribute("aria-hidden", abs === 0 ? "false" : "true");
        // keep hidden slides out of the tab order
        $$("a, button", el).forEach(function (f) {
          if (abs === 0) f.removeAttribute("tabindex"); else f.setAttribute("tabindex", "-1");
        });
        play(el, abs === 0);       // centre only; see freeze() below
      });
      dots.forEach(function (d, i) {
        // aria-current, not aria-selected: these are buttons, not tabs, and
        // aria-selected is not a permitted attribute on them.
        if (i === active) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
      if (live) live.textContent = "Slide " + (active + 1) + " of " + n;
    }

    /* measure() forces a synchronous layout, so it runs on mount, resize and
       font-load only — calling it here made every slide change stutter. */
    /* Every player is paused for the duration of the slide, then the new centre
       one resumes. dotLottie renders on the main thread, so leaving it running
       through the transition was what made the movement stutter — measured at
       20fps with 19 of 21 frames over 32ms. */
    var thaw = null;
    function freeze(on) {
      slides.forEach(function (el) {
        var wc = el.querySelector("dotlottie-wc");
        if (!wc) return;
        var d = wc.dotLottie;
        if (!d || !d.isLoaded) return;
        try {
          if (on) d.pause();
          else if (el.dataset.state === "active") d.play();
        } catch (e) {}
      });
    }

    function go(i) {
      active = (i % n + n) % n;
      freeze(true);
      layout();
      startAuto();
      clearTimeout(thaw);
      thaw = setTimeout(function () { freeze(false); }, reduced ? 0 : 820);
    }

    /* --- the tallest card decides the stage height, so nothing jumps ------ */
    function measure() {
      var tallest = 0;
      slides.forEach(function (el) {
        var prev = el.style.transform;
        el.style.transform = "translateX(-50%) scale(1)";
        tallest = Math.max(tallest, el.offsetHeight);
        el.style.transform = prev;
      });
      // +96px so the card's drop shadow lands inside the stage box. The stage
      // carries a mask, and a mask clips everything painted outside its own
      // box — which is why the cards looked cut off along the bottom edge.
      if (tallest) stage.style.height = (tallest + 96) + "px";
    }

    /* --- animations: mount once, play only what is on screen --------------
       The custom element itself exposes no play/pause — the only member on its
       prototype is _createDotLottieInstance. The controls live on el.dotLottie,
       which is created asynchronously, so calls made too early are lost. The
       first version called el.play() inside a try/catch and silently did
       nothing: three of the four cards sat frozen on frame 0. */
    function play(slide, on) {
      var el = slide.querySelector("dotlottie-wc");
      if (!el) return;
      var tries = 0;
      (function apply() {
        var d = el.dotLottie;
        if (!d || !d.isLoaded) {
          if (tries++ < 50) setTimeout(apply, 120);
          return;
        }
        try { if (on) d.play(); else d.pause(); } catch (e) {}
      })();
    }

    var mounted = false;
    function mount() {
      if (mounted) return;
      mounted = true;
      slides.forEach(function (s, i) {
        var host = s.querySelector(".cx__media");
        if (!host || !host.dataset.lottie) return;
        var el = document.createElement("dotlottie-wc");
        el.setAttribute("src", host.dataset.lottie);
        el.setAttribute("loop", "");
        if (!reduced) el.setAttribute("autoplay", "");
        el.setAttribute("aria-hidden", "true");
        host.appendChild(el);
      });
      setTimeout(function () { measure(); layout(); }, 400);
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es, ob) {
        es.forEach(function (e) { if (e.isIntersecting) { mount(); ob.disconnect(); } });
      }, { rootMargin: "500px 0px" });
      io.observe(stage);
    } else { mount(); }

    /* --- controls --------------------------------------------------------- */
    $$(".cx__nav").forEach(function (b) {
      b.addEventListener("click", function () { go(active + (+b.dataset.dir)); });
    });
    dots.forEach(function (d) {
      d.addEventListener("click", function () { go(+d.dataset.go); });
    });
    stage.addEventListener("click", function (e) {
      var s = e.target.closest(".cx__slide");
      if (s && s.dataset.state === "side") go(+s.dataset.i);
    });

    var cx = stage.closest(".cx");
    cx.setAttribute("tabindex", "-1");
    cx.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
    });

    /* --- swipe ------------------------------------------------------------ */
    var x0 = null;
    stage.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
    stage.addEventListener("pointerup", function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 45) go(active + (dx < 0 ? 1 : -1));
    });
    stage.addEventListener("pointercancel", function () { x0 = null; });

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt); rt = setTimeout(measure, 200);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

    /* --- auto-advance ------------------------------------------------------
       Pauses on hover, on keyboard focus, while the tab is in the background
       and whenever the carousel is off screen, so it never runs unseen. Off
       entirely under reduced motion. */
    var AUTO = 2500, timer = null, held = false;

    function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }
    function startAuto() {
      if (reduced) return;
      stopAuto();
      timer = setInterval(function () { if (!held) go(active + 1); }, AUTO);
    }

    cx.addEventListener("pointerenter", function () { held = true; });
    cx.addEventListener("pointerleave", function () { held = false; });
    cx.addEventListener("focusin", function () { held = true; });
    cx.addEventListener("focusout", function () { held = false; });
    document.addEventListener("visibilitychange", function () { held = document.hidden; });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { held = !e.isIntersecting; });
      }, { threshold: 0.25 }).observe(stage);
    }

    layout();
    measure();
    startAuto();
  })();

  /* ---- 10 · Work marquee ------------------------------------------------
     The row is rendered as several identical sets and the transform is always
     kept inside the middle one, so there is a full set of cards off-screen to
     the left AND to the right at every moment. That is what removes the empty
     gap on first paint and the blank space that appeared when the arrows moved
     the row faster than it could wrap.

     The earlier version centred the first card with padding-left, but padding
     travels with the track — once it scrolled past, nothing was left behind it. */
  (function () {
    var track = $("#wk-track"), wrap = track && track.closest(".wk");
    if (!track || !wrap) return;

    var SPEED = 39;                            // px per second
    var cards = $$(".wk__card", track);
    if (!cards.length) return;
    var master = cards.map(function (el) { return el.cloneNode(true); });

    var period = 0, pos = 0, target = 0, held = false, last = 0, step = 0;

    function build() {
      track.innerHTML = "";
      track.style.paddingLeft = "";

      // one real set first, so the links in it are the ones a keyboard reaches
      master.forEach(function (el) { track.appendChild(el.cloneNode(true)); });
      period = track.scrollWidth + parseFloat(getComputedStyle(track).columnGap || 24);
      step = master[0].getBoundingClientRect().width +
             parseFloat(getComputedStyle(track).columnGap || 24);

      // enough copies that the window can never see past the ends
      var need = Math.max(3, Math.ceil(wrap.clientWidth / Math.max(period, 1)) + 2);
      for (var s = 1; s < need; s++) {
        master.forEach(function (el) {
          var c = el.cloneNode(true);
          c.setAttribute("data-clone", "");
          c.setAttribute("aria-hidden", "true");
          $$("a", c).forEach(function (a) { a.setAttribute("tabindex", "-1"); });
          track.appendChild(c);
        });
      }

      // start with the first card centred rather than flush to the edge
      var lead = Math.max(0, (wrap.clientWidth - step) / 2);
      pos = target = -lead;
      render();
    }

    function render() {
      // always draw from within the middle set: one full set sits either side
      var m = ((pos % period) + period) % period;
      track.style.transform = "translate3d(" + (-(period + m)).toFixed(1) + "px,0,0)";
    }

    function frame(now) {
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (!held) target += SPEED * dt;
      pos += (target - pos) * Math.min(1, dt * 11);  // arrows glide, but land quickly
      render();
      requestAnimationFrame(frame);
    }

    wrap.addEventListener("pointerenter", function () { held = true; });
    wrap.addEventListener("pointerleave", function () { held = false; });
    wrap.addEventListener("focusin", function () { held = true; });
    wrap.addEventListener("focusout", function () { held = false; });

    var prev = $(".wk__nav--prev"), next = $(".wk__nav--next");
    var JUMP = 3;                                  // cards per click
    if (prev) prev.addEventListener("click", function () { target -= step * JUMP; });
    if (next) next.addEventListener("click", function () { target += step * JUMP; });

    build();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(build, 250); });

    if (!reduced) requestAnimationFrame(frame);
  })();

  /* ---- 10b · Contact artwork, mounted when the form is close ------------- */
  (function () {
    var host = $(".cf__anim");
    if (!host) return;
    var done = false;
    function mount() {
      if (done) return;
      done = true;
      var el = document.createElement("dotlottie-wc");
      el.setAttribute("src", "../assets/lottie/contact.json");
      el.setAttribute("loop", "");
      if (!reduced) el.setAttribute("autoplay", "");
      el.setAttribute("aria-hidden", "true");
      host.appendChild(el);
    }
    if (!("IntersectionObserver" in window)) return mount();
    var io = new IntersectionObserver(function (es, ob) {
      es.forEach(function (e) { if (e.isIntersecting) { mount(); ob.disconnect(); } });
    }, { rootMargin: "400px 0px" });
    io.observe(host);
  })();

  /* ---- 11 · Quote modal --------------------------------------------------
     Every contact CTA opens this instead of scrolling to the bottom of the
     page. Its two selects are filled from the same PACKAGES data the pricing
     section uses, so the options can never drift apart. The inline form at the
     foot of the page stays put as the no-JS route. */
  (function () {
    var modal = $("#quote-modal");
    if (!modal) return;
    var form = $("#quote-form"), status = $("#qm-status"), opener = null, lastY = 0;

    /* --- options come from the pricing data --- */
    (function () {
      var svc = $("#qm-service"), bud = $("#qm-budget"), src = $("#f-service");
      if (svc && src) svc.innerHTML = src.innerHTML;          // same list, same labels
      if (bud) {
        var cur = "PKR";
        try { if (localStorage.getItem("currency") === "USD") cur = "USD"; } catch (e) {}
        bud.innerHTML = '<option value="">Select a range</option>' +
          BUDGETS[cur].map(function (b) { return "<option>" + b + "</option>"; }).join("");
      }
    })();

    function open(trigger, preset) {
      opener = trigger || null;
      if ($("#qm-source")) $("#qm-source").value = preset || (trigger && trigger.dataset.quote) || "cta";
      lastY = window.pageYOffset;
      document.body.style.position = "fixed";
      document.body.style.top = -lastY + "px";
      document.body.style.width = "100%";
      modal.hidden = false;
      void modal.offsetWidth;
      modal.classList.add("is-open");
      var f = $("#qm-name");
      if (f) f.focus();
      document.addEventListener("keydown", onKey, true);
    }

    function close() {
      if (modal.hidden) return;
      modal.classList.remove("is-open");
      document.removeEventListener("keydown", onKey, true);
      var done = function () {
        modal.hidden = true;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, lastY);
        if (opener) { try { opener.focus({ preventScroll: true }); } catch (e) { opener.focus(); } }
        opener = null;
      };
      if (reduced) done(); else setTimeout(done, 180);
    }

    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      var f = $$("a[href],button:not([disabled]),input,select,textarea", modal)
        .filter(function (el) { return el.offsetWidth || el.offsetHeight; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    $$("[data-quote]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        // the package modal's CTA carries its own behaviour; let it run first
        if (b.id === "pkgmodal-cta") { setTimeout(function () { open(b, "package"); }, 260); return; }
        e.preventDefault();
        open(b);
      });
    });
    modal.addEventListener("click", function (e) { if (e.target.closest("[data-qmclose]")) close(); });

    /* --- submit: posts natively without JS, this adds inline states --- */
    if (form) {
      var btn = $(".qm__submit", form), label = btn ? btn.textContent : "";
      form.addEventListener("submit", function (e) {
        if (!form.checkValidity()) return;
        e.preventDefault();
        if (btn) { btn.disabled = true; btn.textContent = "Sending"; }
        if (status) { status.textContent = "Sending your request…"; status.removeAttribute("data-state"); }
        fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
          .then(function (r) {
            if (!r.ok) throw new Error("HTTP " + r.status);
            form.reset();
            if (status) { status.textContent = "Sent. You will get a reply within 24 hours."; status.setAttribute("data-state", "ok"); }
            setTimeout(close, 2200);
          })
          .catch(function () {
            if (status) {
              status.textContent = "That did not send. Email contact@choudaryhussainali.online or message on WhatsApp.";
              status.setAttribute("data-state", "err");
            }
          })
          .finally(function () { if (btn) { btn.disabled = false; btn.textContent = label; } });
      });
    }
  })();

  /* ---- 12 · Testimonial carousel ----------------------------------------
     Rendered from the #ts-data block. It adapts to however many reviews are in
     that array: with one it parks, with two or more it rotates, and the side
     cards only appear once there are at least three. */
  (function () {
    var stage = $("#ts-stage"), data = $("#ts-data");
    if (!stage || !data) return;
    var items;
    try { items = JSON.parse(data.textContent); } catch (e) { return; }
    if (!items || !items.length) return;

    var dots = $("#ts-dots"), live = $("#ts-live"), n = items.length, active = 0;
    var STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m10 1.6 2.47 5.2 5.53.72' +
               '-4.06 3.9 1.03 5.6L10 14.3 5.03 17.02l1.03-5.6L2 7.52l5.53-.72z"/></svg>';

    function esc(x) { return String(x).replace(/[&<>"]/g, function (m) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m]; }); }

    stage.innerHTML = items.map(function (r, i) {
      // a div, not a figure: role=group is not permitted on <figure>
      return '<div class="ts__card" data-i="' + i + '" role="group" ' +
        'aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + n + '">' +
        '<span class="ts__stars" role="img" aria-label="Rated 5 out of 5">' + STAR.repeat(5) + '</span>' +
        "<blockquote>" + esc(r.q) + "</blockquote>" +
        '<div class="ts__cap"><span class="ts__who" aria-hidden="true">' + esc(r.i) + "</span>" +
        '<span class="ts__name">' + esc(r.n) + "</span>" +
        (r.u ? '<a class="ts__site" href="' + esc(r.u) + '" target="_blank" rel="noopener noreferrer"' +
               ' aria-label="Open the site this review is about">' +
               '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4h9v9M16 4 4 16" fill="none"' +
               ' stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg></a>' : "") +
        "</div></div>";
    }).join("");

    if (dots) dots.innerHTML = items.map(function (_r, i) {
      return '<button type="button" class="ts__dot" data-go="' + i + '" aria-label="Review ' + (i + 1) + '"></button>';
    }).join("");

    var cards = $$(".ts__card", stage), dotEls = $$(".ts__dot", dots || document);

    function layout() {
      cards.forEach(function (el, i) {
        var off = i - active;
        if (off > n / 2) off -= n;
        if (off < -n / 2) off += n;
        var abs = Math.abs(off);
        el.dataset.state = abs === 0 ? "active" : abs === 1 ? "side" : "far";
        el.style.transform = "translate3d(calc(-50% + " + (off * 66) + "%),0,0) scale(" + (abs ? 0.88 : 1) + ")";
        el.style.opacity = abs > 1 ? "0" : abs === 1 ? "0.45" : "1";
        el.style.zIndex = String(10 - abs);
        el.setAttribute("aria-hidden", abs === 0 ? "false" : "true");
        $$("a", el).forEach(function (a) {
          if (abs === 0) a.removeAttribute("tabindex"); else a.setAttribute("tabindex", "-1");
        });
      });
      dotEls.forEach(function (d, i) {
        if (i === active) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
      });
      if (live) live.textContent = "Review " + (active + 1) + " of " + n;
    }

    function fit() {
      var tallest = 0;
      cards.forEach(function (el) {
        var t = el.style.transform; el.style.transform = "translate3d(-50%,0,0)";
        tallest = Math.max(tallest, el.offsetHeight);
        el.style.transform = t;
      });
      // +56px so the card shadow lands inside the masked box instead of
      // being sliced off at the bottom edge.
      if (tallest) stage.style.height = (tallest + 56) + "px";
    }

    function go(i) { active = (i % n + n) % n; layout(); restart(); }

    /* --- auto-advance, paused on hover, focus, and off screen --- */
    var timer = null, held = false;
    function restart() {
      if (reduced || n < 2) return;
      clearInterval(timer);
      timer = setInterval(function () { if (!held) go(active + 1); }, 6000);
    }
    var root = stage.closest(".ts");
    root.addEventListener("pointerenter", function () { held = true; });
    root.addEventListener("pointerleave", function () { held = false; });
    root.addEventListener("focusin", function () { held = true; });
    root.addEventListener("focusout", function () { held = false; });
    document.addEventListener("visibilitychange", function () { held = document.hidden; });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { held = !e.isIntersecting; });
      }, { threshold: 0.25 }).observe(stage);
    }

    $$(".ts__nav").forEach(function (b) {
      b.addEventListener("click", function () { go(active + (b.classList.contains("ts__nav--next") ? 1 : -1)); });
    });
    dotEls.forEach(function (d) { d.addEventListener("click", function () { go(+d.dataset.go); }); });
    stage.addEventListener("click", function (e) {
      var card = e.target.closest(".ts__card");
      if (card && card.dataset.state === "side") go(+card.dataset.i);
    });
    root.setAttribute("tabindex", "-1");
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
    });

    var x0 = null;
    stage.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
    stage.addEventListener("pointerup", function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 45) go(active + (dx < 0 ? 1 : -1));
    });

    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(fit, 200); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

    layout(); fit(); restart();
  })();

  /* ---- 13 · Back to top --------------------------------------------------
     The ring doubles as a scroll progress indicator. Progress is read inside a
     rAF so a fast scroll cannot queue up layout reads. */
  (function () {
    var btn = $("#to-top");
    if (!btn) return;
    var bar = $(".totop__bar", btn), LEN = 126, ticking = false;

    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var y = window.pageYOffset;
      var pct = max > 0 ? Math.min(1, y / max) : 0;
      if (bar) bar.style.strokeDashoffset = String(LEN - LEN * pct);
      btn.classList.toggle("is-on", y > 600);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      var nav = $(".nav__brand");
      if (nav) setTimeout(function () { try { nav.focus({ preventScroll: true }); } catch (e) {} }, reduced ? 0 : 420);
    });

    btn.hidden = false;
    update();
  })();

  /* ---- 14 · Showreel -----------------------------------------------------
     The section stays removed until data-src is filled in, so an empty player
     never reaches a visitor. Set data-src to a file path (data-kind="file") or
     a YouTube/Vimeo id (data-kind="youtube" | "vimeo") to switch it on. */
  (function () {
    var sec = $("#showreel");
    if (!sec) return;
    var src = (sec.getAttribute("data-src") || "").trim();
    if (!src) { sec.remove(); return; }
    sec.hidden = false;

    var kind = sec.getAttribute("data-kind") || "file";
    var box = $("#vid-box"), stage = $("#vb-stage"), opener = $("#vid-open"), lastY = 0;
    if (!box || !stage || !opener) return;

    function media() {
      if (kind === "youtube")
        return '<iframe src="https://www.youtube-nocookie.com/embed/' + src +
               '?autoplay=1&rel=0" title="Showreel" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      if (kind === "vimeo")
        return '<iframe src="https://player.vimeo.com/video/' + src +
               '?autoplay=1" title="Showreel" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
      return '<video src="' + src + '" controls autoplay playsinline preload="metadata"></video>';
    }

    function open() {
      lastY = window.pageYOffset;
      document.body.style.position = "fixed";
      document.body.style.top = -lastY + "px";
      document.body.style.width = "100%";
      stage.innerHTML = media();
      box.hidden = false;
      void box.offsetWidth;
      box.classList.add("is-open");
      var c = $(".vb__close", box);
      if (c) c.focus();
      document.addEventListener("keydown", onKey, true);
    }
    function close() {
      if (box.hidden) return;
      box.classList.remove("is-open");
      document.removeEventListener("keydown", onKey, true);
      var done = function () {
        box.hidden = true;
        stage.innerHTML = "";                       // stops playback and its network use
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, lastY);
        try { opener.focus({ preventScroll: true }); } catch (e) { opener.focus(); }
      };
      if (reduced) done(); else setTimeout(done, 200);
    }
    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab") return;
      var f = $$("button,a[href],video,iframe", box).filter(function (el) { return el.offsetWidth || el.offsetHeight; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    opener.addEventListener("click", open);
    box.addEventListener("click", function (e) { if (e.target.closest("[data-vbclose]")) close(); });
  })();

  /* ---- 15 · 3D stage ------------------------------------------------------
     Two inputs, both written to CSS custom properties so the compositor does
     the work: --p is how far the section has crossed the viewport, --mx/--my
     are the pointer. Reads are rAF-batched, and the pointer is ignored on
     coarse-pointer devices where there is nothing to track. */
  (function () {
    var stage = $("#d3");
    if (!stage || reduced) return;

    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var r = stage.getBoundingClientRect();
        var vh = window.innerHeight || 1;
        // 0 when the stage is a full screen below, 1 once it has risen to the middle
        var p = 1 - (r.top - vh * 0.25) / (vh * 0.75);
        stage.style.setProperty("--p", Math.max(0, Math.min(1, p)).toFixed(3));
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    if (window.matchMedia("(pointer: fine)").matches) {
      stage.addEventListener("pointermove", function (e) {
        var r = stage.getBoundingClientRect();
        stage.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        stage.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      }, { passive: true });
      stage.addEventListener("pointerleave", function () {
        stage.style.setProperty("--mx", "0");
        stage.style.setProperty("--my", "0");
      });
    }
  })();

  /* ---- 16 · Year --------------------------------------------------------- */
  (function () {
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  })();
})();
