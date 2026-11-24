/*
 * HitPay · Build with AI — Manila
 * Renders the page from CONTENT (content.js). No framework, no build step.
 */
(function () {
  "use strict";

  var C = window.CONTENT;
  if (!C) return;

  // ---- tiny helpers -------------------------------------------------------
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k.slice(0, 2) === "on" && typeof attrs[k] === "function") {
          node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else if (attrs[k] != null) node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Render prompt text for display: escape, highlight [placeholders],
  // and bold the "Goal:/Context:/Limits:/Done when:" leads. The raw text is
  // kept separately for copying, so nothing here affects what gets copied.
  function renderPromptHtml(text) {
    return escapeHtml(text)
      .split("\n")
      .map(function (line) {
        var withPh = line.replace(/\[[^\]]+\]/g, function (m) {
          return '<mark class="ph">' + m + "</mark>";
        });
        return withPh.replace(
          /^(Goal|Context|Limits|Done when|Tip):/,
          '<span class="lead">$1:</span>'
        );
      })
      .join("\n");
  }

  // ---- buttons ------------------------------------------------------------
  function fileButton(def) {
    // def: { style:'download'|'open', label, href, placeholder, note }
    if (!def.href) {
      return el("span", { class: "btn btn-ph", title: "Link not set yet" }, [
        el("span", { class: "ico", text: def.style === "open" ? "🔗" : "⬇" }),
        def.label + " ",
        el("span", { class: "ph-tag", text: def.placeholder || "[link]" }),
      ]);
    }
    var isOpen = def.style === "open";
    var attrs = { class: "btn btn-fill", href: def.href };
    if (isOpen) {
      attrs.target = "_blank";
      attrs.rel = "noopener";
    } else {
      attrs.download = "";
    }
    return el("a", attrs, [
      el("span", { class: "ico", text: isOpen ? "🔗" : "⬇" }),
      def.label,
    ]);
  }

  function downloadRow(def) {
    return el("div", { class: "download-row" }, [
      fileButton(def),
      def.note ? el("span", { class: "download-note", text: def.note }) : null,
    ]);
  }

  var copySeq = 0;
  function copyButton(rawText) {
    var btn = el("button", { class: "btn btn-copy", type: "button" }, [
      el("span", { class: "ico", text: "📋" }),
      el("span", { class: "label", text: "Copy prompt" }),
    ]);
    btn.addEventListener("click", function () {
      copyText(rawText).then(function (ok) {
        if (!ok) return;
        var id = ++copySeq;
        btn.classList.add("is-copied");
        btn.querySelector(".ico").textContent = "✓";
        btn.querySelector(".label").textContent = "Copied ✓";
        showToast("Copied ✓");
        setTimeout(function () {
          if (id !== copySeq) return; // a newer copy happened; leave it
          btn.classList.remove("is-copied");
          btn.querySelector(".ico").textContent = "📋";
          btn.querySelector(".label").textContent = "Copy prompt";
        }, 1800);
      });
    });
    return btn;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(
        function () { return true; },
        function () { return legacyCopy(text); }
      );
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  var toastTimer;
  function showToast(msg) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 1600);
  }

  // ---- prompt + step ------------------------------------------------------
  function promptCard(badge, p) {
    var badgeNode = el("span", { class: "badge" }, [
      badge,
      p.tag ? el("span", { class: "tag", text: p.tag }) : null,
    ]);
    return el("div", { class: "card prompt-card" }, [
      p.tip
        ? el("p", { class: "prompt-tip", html: "💡 <strong>Tip:</strong> " + escapeHtml(p.tip) })
        : null,
      p.note ? el("p", { class: "prompt-note", text: p.note }) : null,
      el("div", { class: "prompt-top" }, [badgeNode, copyButton(p.text)]),
      el("pre", { class: "prompt-box", html: renderPromptHtml(p.text) }),
    ]);
  }

  function renderStep(block) {
    var kids = [];
    kids.push(
      el("div", { class: "step-head" }, [
        el("h3", { class: "step-title", text: block.title }),
        block.badgeNote ? el("span", { class: "badge-note", text: block.badgeNote }) : null,
      ])
    );
    (block.downloads || []).forEach(function (d) { kids.push(downloadRow(d)); });
    (block.prompts || []).forEach(function (p) { kids.push(promptCard(block.badge, p)); });

    if (block.warning) {
      kids.push(el("div", { class: "warn" }, [
        el("span", { class: "ico", text: "⚠️" }),
        el("span", { text: block.warning }),
      ]));
    }
    if (block.links && block.links.length) {
      kids.push(el("div", { class: "step-links" }, block.links.map(function (l) {
        return el("a", { href: l.href, target: "_blank", rel: "noopener" }, [l.label + " ↗"]);
      })));
    }
    if (block.footnote) {
      kids.push(el("p", { class: "step-footnote", text: block.footnote }));
    }
    return el("section", { class: "step", id: block.anchor }, kids);
  }

  // ---- other block types --------------------------------------------------
  var STORAGE_KEY = "hbwa-manila-checklist-v1";

  function loadChecks() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveChecks(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function renderChecklist(block) {
    var state = loadChecks();
    var ul = el("ul", { class: "checklist" });
    block.items.forEach(function (item, i) {
      var key = "item-" + i;
      var box = el("input", { type: "checkbox" });
      box.checked = !!state[key];
      var label = el("label", {}, [
        box,
        el("span", {}, [
          el("span", { class: "ci-text", text: item.text }),
          item.href
            ? el("a", { class: "ci-link", href: item.href, target: "_blank", rel: "noopener" },
                [(item.linkLabel || item.href) + " ↗"])
            : null,
          !item.href && item.placeholder
            ? el("span", { class: "ci-ph" }, [
                el("span", { class: "ph-tag", text: item.placeholder })
              ])
            : null,
        ]),
      ]);
      if (box.checked) label.classList.add("done");
      box.addEventListener("change", function () {
        state[key] = box.checked;
        saveChecks(state);
        label.classList.toggle("done", box.checked);
      });
      ul.appendChild(el("li", {}, [label]));
    });
    return el("div", { class: "card" }, [ul]);
  }

  function renderFolders(block) {
    var box = el("pre", { class: "folders-box" });
    block.lines.forEach(function (ln) {
      var indent = "  ".repeat(ln.indent || 0);
      var row = el("div", {}, [
        indent,
        el("span", { class: "fname", text: ln.name }),
      ]);
      if (ln.note) {
        row.appendChild(document.createTextNode("   "));
        row.appendChild(el("span", { class: "fnote", text: ln.note }));
      }
      box.appendChild(row);
    });
    return el("div", { class: "card folders" }, [
      el("h3", { text: block.title || "Your folders" }),
      block.intro ? el("p", { class: "folders-intro", text: block.intro }) : null,
      box,
    ]);
  }

  function renderLinks(block) {
    return el("div", { class: "links-grid" }, block.items.map(function (l) {
      return el("a", { href: l.href, target: "_blank", rel: "noopener" }, [
        el("span", { text: l.label }),
        el("span", { class: "arrow", text: "↗" }),
      ]);
    }));
  }

  function renderBlock(block) {
    switch (block.type) {
      case "step": return renderStep(block);
      case "checklist": return renderChecklist(block);
      case "folders": return renderFolders(block);
      case "download": return downloadRow(block);
      case "links": return renderLinks(block);
      default: return null;
    }
  }

  // ---- sections -----------------------------------------------------------
  function renderSection(sec) {
    var kids = [
      el("div", { class: "section-head" }, [
        el("span", { class: "section-num", text: sec.number }),
        el("h2", { class: "section-title", text: sec.title }),
      ]),
    ];
    if (sec.intro) kids.push(el("p", { class: "section-intro", text: sec.intro }));
    (sec.blocks || []).forEach(function (b) {
      var node = renderBlock(b);
      if (node) kids.push(node);
    });
    return el("section", { class: "section", id: sec.id }, kids);
  }

  // ---- nav ----------------------------------------------------------------
  function renderNav() {
    var tabs = el("div", { class: "tabs" }, C.tabs.map(function (t) {
      var kids = [t.label];
      if (t.comingSoon) kids.push(el("span", { class: "soon", text: "Soon" }));
      return el("button", {
        class: "tab" + (t.active ? " is-active" : ""),
        type: "button",
        disabled: t.active ? null : "",
        "data-tab": t.id,
      }, kids);
    }));

    var subnav = el("nav", { class: "subnav", "aria-label": "Sections" },
      C.nav.map(function (n) {
        return el("a", { href: "#" + n.id, "data-nav": n.id, text: n.label });
      })
    );

    return el("div", { class: "nav-sticky" }, [
      el("div", { class: "wrap" }, [tabs, subnav]),
    ]);
  }

  // ---- scrollspy ----------------------------------------------------------
  function setupScrollspy() {
    var links = {};
    C.nav.forEach(function (n) {
      links[n.id] = document.querySelector('[data-nav="' + n.id + '"]');
    });
    var sections = C.nav
      .map(function (n) { return document.getElementById(n.id); })
      .filter(Boolean);

    function onScroll() {
      var pos = window.scrollY + 140;
      var currentId = sections[0] ? sections[0].id : null;
      sections.forEach(function (s) {
        if (s.offsetTop <= pos) currentId = s.id;
      });
      Object.keys(links).forEach(function (id) {
        if (links[id]) links[id].classList.toggle("is-current", id === currentId);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---- build --------------------------------------------------------------
  function build() {
    var header = el("header", { class: "site-header" }, [
      el("div", { class: "hero-glow" }),
      el("div", { class: "wrap" }, [
        el("div", { class: "brand-lockup" }, [
          el("span", { class: "brand", text: C.meta.brand }),
          C.meta.eyebrow
            ? el("span", { class: "brand-eyebrow" }, [
                el("span", { class: "dot" }),
                C.meta.eyebrow,
              ])
            : null,
        ]),
        el("h1", { class: "site-title", text: C.meta.title }),
        (C.meta.chips && C.meta.chips.length)
          ? el("div", { class: "hero-chips" }, C.meta.chips.map(function (c) {
              return el("span", { class: "chip", text: c });
            }))
          : null,
        C.meta.tagline ? el("p", { class: "site-tagline", text: C.meta.tagline }) : null,
      ]),
    ]);

    var main = el("main", { id: "resources" },
      C.sections.map(renderSection)
    );

    var footer = el("footer", { class: "site-footer" }, [
      C.meta.brand + " · Build with AI — Manila · Keep this tab open during the session.",
    ]);

    var root = document.getElementById("app");
    root.appendChild(header);
    root.appendChild(renderNav());
    root.appendChild(main);
    root.appendChild(footer);
    root.appendChild(el("div", { class: "toast", id: "toast", role: "status", "aria-live": "polite" }));

    setupScrollspy();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
