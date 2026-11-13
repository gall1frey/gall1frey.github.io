/* Notebook renderer.
   Content lives in data/*.json, projects/*.md (project journals) and posts/*.md (blog).
   This file only draws it. Needs http(s): GitHub Pages, or `python3 -m http.server` locally. */
(function () {
  'use strict';

  var app = document.getElementById('app');
  var D = { site: null, projects: [], exp: {}, posts: [], cats: [] };
  var view = null, curSlug = null;
  var activeCat = '', activeTag = null, jOrder = 'new', io = null;

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fmtDate(d) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function readTime(t) { return Math.max(1, Math.round(t.split(/\s+/).length / 200)) + ' min read'; }
  function slugify(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function safeUrl(u) {
    return /^(https?:|mailto:|#|\/|\.\/|\.\.\/|[\w-]+\/|[\w.-]+$)/i.test(u) ? u : '#';
  }
  function getJSON(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); });
  }
  function getText(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(url + ' ' + r.status); return r.text(); });
  }
  function paras(x) { return (Array.isArray(x) ? x : x ? [x] : []).map(function (t) { return '<p>' + inline(t) + '</p>'; }).join(''); }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

  /* ---------- tiny markdown ---------- */
  function inline(s) {
    var stash = [];
    s = esc(s).replace(/`([^`]+)`/g, function (_, c) { stash.push('<code>' + c + '</code>'); return '\u0000' + (stash.length - 1) + '\u0000'; });
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, t, u) {
      u = u.replace(/&amp;/g, '&');
      var ext = /^https?:/i.test(u);
      return '<a href="' + esc(safeUrl(u)) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + t + '</a>';
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
    s = s.replace(/==([^=]+)==/g, '<mark>$1</mark>');
    return s.replace(/\u0000(\d+)\u0000/g, function (_, i) { return stash[+i]; });
  }

  /* media helpers: figures, video facades (nothing loads from YouTube/Vimeo until play is pressed) */
  var IMG_RE = /^!\[([^\]]*)\]\(([^)\s]+)\)(?:\{([a-z ]+)\})?\s*$/;
  var VID_RE = /^@\[(youtube|vimeo|video)(?:[: ]\s*([^\]]*))?\]\(([^)\s]+)\)\s*$/;
  var BARE_YT = /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|playlist\?list=|shorts\/)|youtu\.be\/)[\w-]+\S*$/;

  function imgOpts(t) {
    var o = { size: '', align: '' };
    String(t || '').split(/\s+/).forEach(function (w) {
      if (/^(small|medium|wide)$/.test(w)) o.size = w;
      else if (/^(side|left|right)$/.test(w)) o.align = 'side'; /* left/right kept as aliases */
    });
    return o;
  }
  function figure(alt, src, opts) {
    var kind = 'photo', cap = alt, k = alt.match(/^(sketch|photo|diagram|screenshot):\s*(.*)$/i);
    if (k) { kind = k[1].toLowerCase(); cap = k[2]; }
    opts = imgOpts(opts);
    return '<figure class="' + kind + (opts.size ? ' ' + opts.size : '') + (opts.align ? ' ' + opts.align : '') + '"><img src="' + esc(safeUrl(src)) + '" alt="' + esc(cap) + '" loading="lazy">' +
      (cap ? '<figcaption>' + esc(cap) + '</figcaption>' : '') + '</figure>';
  }
  function ytEmbed(s) {
    var m;
    if (/^playlist:/i.test(s)) return 'videoseries?list=' + s.replace(/^playlist:/i, '').replace(/[^\w-]/g, '') + '&autoplay=1';
    if ((m = s.match(/[?&]list=([\w-]+)/)) && !/[?&]v=/.test(s)) return 'videoseries?list=' + m[1] + '&autoplay=1';
    m = s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{6,})/) || s.match(/^([\w-]{6,})$/);
    return m ? m[1] + '?autoplay=1&rel=0' : null;
  }
  function videoBlock(type, cap, ref) {
    var cap_html = cap ? '<p class="cap">' + esc(cap) + '</p>' : '', src = null, label = '';
    if (type === 'video') {
      return '<div class="video"><video controls preload="metadata" playsinline src="' + esc(safeUrl(ref)) + '"></video>' + cap_html + '</div>';
    }
    if (type === 'youtube') {
      var e = ytEmbed(ref); if (e) src = 'https://www.youtube-nocookie.com/embed/' + e; label = 'YouTube';
    } else if (/^\d+$/.test(ref.replace(/^.*vimeo\.com\/(?:video\/)?/, ''))) {
      src = 'https://player.vimeo.com/video/' + ref.replace(/^.*vimeo\.com\/(?:video\/)?/, '') + '?autoplay=1&dnt=1'; label = 'Vimeo';
    }
    if (!src) return '<p><em>Video link not recognised.</em></p>';
    return '<div class="video" data-src="' + esc(src) + '" data-title="' + esc(cap || 'Video') + '">' +
      '<button class="play" type="button"><span aria-hidden="true">&#9654;</span> Play video<small>Loads from ' + label + ' when you press play</small></button>' + cap_html + '</div>';
  }

  function md(src, off) {
    off = off || 0;
    var lines = src.replace(/\r/g, '').split('\n'), out = [], i = 0, para = [];
    function flush() { if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; } }
    while (i < lines.length) {
      var l = lines[i], m;
      if (/^```/.test(l)) {
        flush(); var code = []; i++;
        while (i < lines.length && !/^```/.test(lines[i])) { code.push(lines[i]); i++; }
        i++; out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>'); continue;
      }
      if ((m = l.match(/^(#{1,4})\s+(.*)$/))) { flush(); var lv = Math.min(6, Math.max(2, m[1].length) + off); out.push('<h' + lv + '>' + inline(m[2]) + '</h' + lv + '>'); i++; continue; }
      if (/^---+\s*$/.test(l)) { flush(); out.push('<hr>'); i++; continue; }
      if ((m = l.match(VID_RE))) { flush(); out.push(videoBlock(m[1], (m[2] || '').trim(), m[3])); i++; continue; }
      if (BARE_YT.test(l.trim())) { flush(); out.push(videoBlock('youtube', '', l.trim())); i++; continue; }
      if (IMG_RE.test(l)) {
        flush(); var figs = [];
        for (;;) {
          m = lines[i].match(IMG_RE); figs.push(figure(m[1], m[2], m[3])); i++;
          if (imgOpts(m[3]).align) break; /* floated images stand alone, text wraps beside them */
          var j = i; while (j < lines.length && /^\s*$/.test(lines[j])) j++;
          var nx = j < lines.length && lines[j].match(IMG_RE);
          if (nx && !imgOpts(nx[3]).align) i = j; else break;
        }
        out.push(figs.length > 1 ? '<div class="gallery">' + figs.join('') + '</div>' : figs[0]); continue;
      }
      if (/^>\s?/.test(l)) {
        flush(); var q = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, '')); i++; }
        out.push('<blockquote><p>' + inline(q.join(' ')) + '</p></blockquote>'); continue;
      }
      if (/^[-*]\s+/.test(l) || /^\d+\.\s+/.test(l)) {
        flush(); var ord = /^\d+\./.test(l), items = [], tasks = false, re = ord ? /^\d+\.\s+/ : /^[-*]\s+/;
        while (i < lines.length && re.test(lines[i])) {
          var t = lines[i].replace(re, ''), c = t.match(/^\[( |x|X)\]\s+(.*)$/);
          if (c) {
            tasks = true; var done = c[1] !== ' ';
            items.push('<li class="task' + (done ? ' done' : '') + '"><span class="box" aria-hidden="true">' + (done ? '&#9745;' : '&#9744;') + '</span><span class="sr">' + (done ? 'done: ' : 'to do: ') + '</span>' + inline(c[2]) + '</li>');
          } else items.push('<li>' + inline(t) + '</li>');
          i++;
        }
        out.push((ord ? '<ol>' : '<ul class="' + (tasks ? 'tasks' : 'dash') + '">') + items.join('') + (ord ? '</ol>' : '</ul>')); continue;
      }
      if (/^\s*$/.test(l)) { flush(); i++; continue; }
      para.push(l.trim()); i++;
    }
    flush();
    return out.join('\n');
  }

  /* ---------- journals: "# 2026-11-10 | Title" starts a dated entry ---------- */
  var ENTRY_RE = /^#\s+(\d{4}-\d{2}-\d{2})(?:\s*[|\u00b7:\u2014\u2013-]*\s*(.*))?\s*$/;
  function parseJournal(src) {
    var lines = (src || '').replace(/\r/g, '').split('\n'), entries = [], cur = null, fence = false, seen = {};
    lines.forEach(function (l) {
      if (/^```/.test(l)) fence = !fence;
      var m = !fence && l.match(ENTRY_RE);
      if (m) { cur = { date: m[1], title: (m[2] || '').trim(), body: [] }; entries.push(cur); }
      else {
        if (!cur) { if (/^\s*$/.test(l)) return; cur = { date: null, title: '', body: [] }; entries.push(cur); }
        cur.body.push(l);
      }
    });
    entries.forEach(function (e) {
      e.body = e.body.join('\n').trim();
      var base = 'e-' + (e.date || 'undated'); seen[base] = (seen[base] || 0) + 1;
      e.id = seen[base] > 1 ? base + '-' + seen[base] : base;
    });
    var asc = entries.slice().sort(function (a, b) { return (a.date || '').localeCompare(b.date || ''); });
    asc.forEach(function (e, i) { e.n = i + 1; });
    return entries;
  }
  function sortedEntries(p) {
    var e = p.entries.slice().sort(function (a, b) { return (a.date || '').localeCompare(b.date || '') || a.n - b.n; });
    return jOrder === 'new' ? e.reverse() : e;
  }
  function latestDate(p) {
    return p.entries.reduce(function (m, e) { return e.date && e.date > m ? e.date : m; }, '');
  }

  /* ---------- category doodles (used when a project has no cover image) ---------- */
  // function doodle(cat) {
  //   var c = String(cat || '').toLowerCase(), g;
  //   if (/robot|drone|mech|fly/.test(c)) g = '<rect x="66" y="46" width="28" height="28" rx="4"/><circle cx="80" cy="60" r="5"/><path d="M68 48L42 24M92 48L118 24M68 72L42 96M92 72L118 96"/><circle cx="36" cy="18" r="12"/><circle cx="124" cy="18" r="12"/><circle cx="36" cy="102" r="12"/><circle cx="124" cy="102" r="12"/><path d="M22 18h28M110 18h28M22 102h28M110 102h28"/>';
  //   else if (/camera|film|photo/.test(c)) g = '<rect x="26" y="40" width="108" height="64" rx="8"/><path d="M56 40L62 26H98L104 40"/><circle cx="80" cy="72" r="22"/><circle cx="80" cy="72" r="11"/><circle cx="120" cy="54" r="3"/><path d="M36 54h14"/>';
  //   else if (/secur|hack|ics|pentest/.test(c)) g = '<rect x="46" y="54" width="68" height="52" rx="6"/><path d="M58 54V42a22 22 0 0 1 44 0v12"/><circle cx="80" cy="76" r="6"/><path d="M80 82v12"/>';
  //   else g = '<rect x="20" y="44" width="120" height="32" rx="3"/><path d="M36 44v12M52 44v8M68 44v12M84 44v8M100 44v12M116 44v8M132 44v12"/>';
  //   return '<svg viewBox="0 0 160 120" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + g + '</svg>';
  // }

  /* ---------- building blocks ---------- */
  function tagList(tags, max) {
    tags = (tags || []).slice(0, max || 99);
    return tags.length ? '<ul class="tags">' + tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '';
  }
  function section(id, title, note, inner, num, tools) {
    return '<section class="sec" id="' + id + '"><div class="sec-head"><div><h2>' + (num ? '<span class="num">' + num + '</span>' : '') + esc(title) + '</h2>' +
      (note ? '<p class="note">' + esc(note) + '</p>' : '') + '</div>' + (tools || '') + '</div>' + inner + '</section>';
  }
  function pageHead(title, note) {
    return '<h1 class="ph">' + esc(title) + '</h1>' + (note ? '<p class="note">' + esc(note) + '</p>' : '');
  }
  function tocItem(p) {
    return '<li><div class="toc-line"><a href="#/notes/' + esc(p.slug) + '">' + esc(p.title) + '</a><span class="leader" aria-hidden="true"></span><span class="pg">p. ' + p.page + '</span></div>' +
      '<p>' + esc(p.summary || '') + '</p>' +
      '<p class="meta">' + fmtDate(p.date) + (p.tags && p.tags.length ? ', ' + p.tags.map(esc).join(', ') : '') + '</p></li>';
  }
  function stampFor(p) { return p.status || (p.group === 'bench' ? 'on the bench' : ''); }
  function projectCard(p) {
    var n = p.entries.length, last = latestDate(p), st = stampFor(p);
    var foot = n ? plural(n, 'journal entry').replace('entrys', 'entries') + (last ? ' &middot; ' + esc(fmtDate(last)) : '') : 'Journal opening soon';
    return '<article class="card' + (p.group === 'bench' ? ' bench' : '') + '">' +
      '<div class="card-body"><p class="cat">' + esc(p.category || 'Project') + (p.when ? ' &middot; ' + esc(p.when) : '') + '</p>' +
      '<h3><a href="#/project/' + esc(p.slug) + '">' + esc(p.title) + '</a></h3>' +
      '<p class="sum">' + esc(p.summary || '') + '</p>' + tagList(p.tags, 3) +
      '<p class="card-foot">' + foot + ' <span aria-hidden="true">&rarr;</span></p></div></article>';
  }
  function noteCard(p) {
    return '<article class="icard"><h3><a href="#/notes/' + esc(p.slug) + '">' + esc(p.title) + '</a></h3>' +
      '<p class="sum">' + esc(p.summary || '') + '</p>' +
      '<p class="meta">' + fmtDate(p.date) + (p.tags && p.tags.length ? ' &middot; ' + p.tags.slice(0, 2).map(esc).join(', ') : '') + '</p>' +
      '<span class="pg" aria-hidden="true">p. ' + p.page + '</span></article>';
  }

  /* ---------- views ---------- */
  function drawGrid() {
    var list = D.projects.filter(function (p) { return !activeCat || p.category === activeCat; });
    var g = document.getElementById('cards'); if (!g) return;
    g.innerHTML = list.map(projectCard).join('') || '<p>Nothing filed under that category yet.</p>';
    document.querySelectorAll('.tab').forEach(function (b) { b.setAttribute('aria-pressed', String((b.dataset.cat || '') === activeCat)); });
  }

  function renderHome() {
    var s = D.site, html = '';
    var bench = D.projects.filter(function (p) { return p.group === 'bench'; });

    html += '<section class="cover" id="top"><dl class="titleblock">' +
      (s.titleblock || []).map(function (c) { return '<div><dt>' + esc(c.label) + '</dt><dd>' + esc(c.value) + '</dd></div>'; }).join('') +
      '</dl><div class="cover-grid"><div class="cover-text"><h1>' + esc(s.name) + '</h1><p class="lede">' + inline(s.lede) + '</p>' + paras((s.intro || []).slice(0, 1)) +
      '<p class="ctas"><a class="btn primary" href="#/projects">See the projects</a><a class="btn" href="#/notes">Read the notes</a></p></div>' +
      (bench.length ? '<aside class="sticky" aria-label="On the bench right now"><p class="st-title">On the bench right now</p><ul>' +
        bench.map(function (p) {
          return '<li><a href="#/project/' + esc(p.slug) + '">' + esc(p.short || p.title) + '</a>' + (p.status ? '<span>' + esc(p.status) + '</span>' : '') + '</li>';
        }).join('') + '</ul></aside>' : '') + '</div></section>';

    if (D.projects.length) {
      var tabs = '<div class="tabs" role="group" aria-label="Filter projects by category"><button class="tab" type="button" data-cat="" aria-pressed="' + (!activeCat) + '">All<span class="n">' + D.projects.length + '</span></button>' +
        D.cats.map(function (c) {
          var n = D.projects.filter(function (p) { return p.category === c; }).length;
          return '<button class="tab" type="button" data-cat="' + esc(c) + '" aria-pressed="' + (activeCat === c) + '">' + esc(c) + '<span class="n">' + n + '</span></button>';
        }).join('') + '</div>';
      html += section('projects', 'Projects', 'Pick a category, then open a project to read its journal.', tabs + '<div class="cards" id="cards"></div>', '01');
    }

    if (D.posts.length) {
      var arrows = '<div class="sec-tools"><button class="arrow" type="button" id="rail-prev" aria-label="Scroll notes left">&larr;</button><button class="arrow" type="button" id="rail-next" aria-label="Scroll notes right">&rarr;</button></div>';
      html += section('latest-notes', 'Notes', 'Essays and field notes. Newest first.',
        '<div class="rail" id="rail" tabindex="0" role="region" aria-label="Latest notes">' + D.posts.slice(0, 8).map(noteCard).join('') +
        '<a class="icard end" href="#/notes">All ' + plural(D.posts.length, 'note') + ' <span aria-hidden="true">&rarr;</span></a></div>', '02', arrows);
    }

    html += section('contact', 'Say hello', s.contact_note, '<div class="ctas">' + (s.links || []).map(function (l, i) {
      return '<a class="btn' + (i === 0 ? ' primary' : '') + '" href="' + esc(l.href) + '"' + (/^https?:/.test(l.href) ? ' target="_blank" rel="noopener"' : '') + '>' + esc(l.label) + '</a>';
    }).join('') + '</div>', '03');

    app.innerHTML = '<div class="page">' + html + '</div>';
    document.title = s.title;
    drawGrid(); wireRail();
  }

  function wireRail() {
    var rail = document.getElementById('rail'), prev = document.getElementById('rail-prev'), next = document.getElementById('rail-next');
    if (!rail) return;
    function upd() {
      var more = rail.scrollWidth > rail.clientWidth + 4;
      prev.hidden = next.hidden = !more;
      prev.disabled = rail.scrollLeft <= 4;
      next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
    }
    function step(dir) { var c = rail.querySelector('.icard'); rail.scrollBy({ left: dir * (c.offsetWidth + 28), behavior: 'smooth' }); }
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    rail.addEventListener('scroll', upd); window.addEventListener('resize', upd); upd();
  }

  function renderAbout() {
    var s = D.site, x = D.exp, html = pageHead('About', 'Who keeps this notebook.');
    html += '<div class="prose about-intro"><p class="lede">' + inline(s.lede) + '</p>' + paras(s.intro) + '</div>';
    if ((x.log || []).length) {
      html += section('log', 'Log', "Where I've worked and studied, newest first.", '<div>' + x.log.map(function (r) {
        return '<div class="log-row"><div class="log-when">' + esc(r.when) + '</div><div><h3>' + esc(r.role) + '</h3><p class="log-org">' + esc(r.org) + '</p>' +
          (r.bullets ? '<ul class="dash">' + r.bullets.map(function (b) { return '<li>' + inline(b) + '</li>'; }).join('') + '</ul>' : '') + '</div></div>';
      }).join('') + '</div>');
    }
    var dl = function (items) { return '<dl>' + items.map(function (i) { return '<dt>' + esc(i.title) + '</dt><dd>' + esc(i.detail) + '</dd>'; }).join('') + '</dl>'; };
    var cols = '';
    if ((x.education || []).length) cols += '<div><h3>Education</h3>' + dl(x.education) + '</div>';
    if ((x.certifications || []).length) cols += '<div><h3>Certifications</h3>' + dl(x.certifications) + '</div>';
    var about = cols ? '<div class="two">' + cols + '</div>' : '';
    if ((x.tools || []).length) about += '<div class="toolbox">' + x.tools.map(function (t) { return '<div><h3>' + esc(t.group) + '</h3><p>' + esc(t.items) + '</p></div>'; }).join('') + '</div>';
    if (about) html += section('school-tools', 'School and tools', "The formal bits, and what's in the toolbox.", about);
    app.innerHTML = '<div class="page">' + html + '</div>';
    document.title = 'About | ' + s.title;
  }

  function renderNotes() {
    var tags = [];
    D.posts.forEach(function (p) { (p.tags || []).forEach(function (t) { if (tags.indexOf(t) < 0) tags.push(t); }); });
    var list = D.posts.filter(function (p) { return !activeTag || (p.tags || []).indexOf(activeTag) >= 0; });
    app.innerHTML = '<div class="page"><div class="sec" style="padding-top:56px">' + pageHead('Notes', "Things I'm learning and thinking about. Project progress lives in each project's journal.") +
      '<div class="filters" role="group" aria-label="Filter notes by tag"><button class="chip" type="button" data-tag="" aria-pressed="' + (!activeTag) + '">all</button>' +
      tags.map(function (t) { return '<button class="chip" type="button" data-tag="' + esc(t) + '" aria-pressed="' + (activeTag === t) + '">' + esc(t) + '</button>'; }).join('') + '</div>' +
      '<ul class="toc">' + (list.map(tocItem).join('') || '<li>Nothing filed under that tag yet.</li>') + '</ul>' +
      '<p><a href="#/projects">Looking for project journals? They live with the projects.</a></p></div></div>';
    app.querySelector('.filters').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      activeTag = b.dataset.tag || null; renderNotes();
      var again = app.querySelector('.filters [aria-pressed="true"]'); if (again) again.focus();
    });
    document.title = 'Notes | ' + D.site.title;
  }

  function renderPost(slug) {
    var idx = D.posts.findIndex(function (p) { return p.slug === slug; });
    if (idx < 0) {
      var moved = D.projects.filter(function (p) { return (p.aliases || []).indexOf(slug) >= 0; })[0];
      if (moved) { location.replace('#/project/' + moved.slug); return; }
      app.innerHTML = '<div class="page post"><h1>Page not found</h1><p>That entry isn\'t in the notebook. <a href="#/notes">Back to all notes</a></p></div>';
      document.title = 'Not found | ' + D.site.title; return;
    }
    var p = D.posts[idx], newer = D.posts[idx - 1], older = D.posts[idx + 1];
    app.innerHTML = '<div class="page post"><p>Opening page...</p></div>';
    getText('posts/' + encodeURIComponent(p.slug) + '.md').then(function (body) {
      if (location.hash.indexOf(p.slug) < 0) return;
      app.innerHTML = '<div class="page"><article class="post">' +
        '<a href="#/notes">Back to notes</a><h1>' + esc(p.title) + '</h1>' +
        '<p class="meta">p. ' + p.page + ', ' + fmtDate(p.date) + ', ' + readTime(body) + (p.tags && p.tags.length ? ', ' + p.tags.map(esc).join(', ') : '') + '</p>' +
        '<div class="prose">' + md(body.trim()) + '</div>' +
        '<div class="pager"><span>' + (older ? '<a href="#/notes/' + esc(older.slug) + '">Previous: ' + esc(older.title) + '</a>' : '') + '</span>' +
        '<span>' + (newer ? '<a href="#/notes/' + esc(newer.slug) + '">Next: ' + esc(newer.title) + '</a>' : '') + '</span></div></article></div>';
      document.title = p.title + ' | ' + D.site.title;
    }).catch(function () {
      app.innerHTML = '<div class="page post"><h1>Missing page</h1><p>posts/' + esc(p.slug) + '.md could not be loaded. Check the file name matches the slug in posts/index.json. <a href="#/notes">Back to all notes</a></p></div>';
    });
  }

  /* ---------- project page + journal ---------- */
  function journalHTML(p) {
    var es = sortedEntries(p);
    if (!es.length) return '<div class="blank-page"><p class="hand">This page of the notebook is still blank.</p><p>Entries will show up here as the work happens.</p></div>';
    return es.map(function (e) {
      return '<article class="jentry" id="' + e.id + '"><header class="jhead"><p class="jmeta">Entry ' + e.n + (e.date ? ' &middot; ' + esc(fmtDate(e.date)) : '') + '</p>' +
        '<h2>' + esc(e.title || (e.date ? fmtDate(e.date) : 'Entry ' + e.n)) +
        ' <a class="perma" href="#/project/' + esc(p.slug) + '/' + e.id + '" aria-label="Link to this entry">#</a></h2></header>' +
        '<div class="prose">' + md(e.body, 1) + '</div></article>';
    }).join('');
  }
  function tocHTML(p) {
    var es = sortedEntries(p);
    return es.map(function (e) {
      return '<li><a href="#/project/' + esc(p.slug) + '/' + e.id + '" data-entry="' + e.id + '"><b>' + esc(e.date ? fmtDate(e.date) : 'Entry ' + e.n) + '</b>' + (e.title ? '<span>' + esc(e.title) + '</span>' : '') + '</a></li>';
    }).join('');
  }
  function drawJournal(p) {
    document.getElementById('jentries').innerHTML = journalHTML(p);
    var t = document.getElementById('jtoc-list'); if (t) t.innerHTML = tocHTML(p);
    var b = document.getElementById('jorder'); if (b) b.textContent = jOrder === 'new' ? 'newest first' : 'oldest first';
    watchEntries();
  }
  function watchEntries() {
    if (io) { io.disconnect(); io = null; }
    if (!('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (items) {
      items.forEach(function (it) {
        if (!it.isIntersecting) return;
        document.querySelectorAll('#jtoc-list a').forEach(function (a) {
          if (a.dataset.entry === it.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    document.querySelectorAll('.jentry').forEach(function (el) { io.observe(el); });
  }

  function renderProject(slug) {
    var idx = D.projects.findIndex(function (p) { return p.slug === slug; });
    if (idx < 0) {
      app.innerHTML = '<div class="page post"><h1>Project not found</h1><p>That project isn\'t in the notebook. <a href="#/projects">Back to projects</a></p></div>';
      document.title = 'Not found | ' + D.site.title; return;
    }
    var p = D.projects[idx], prev = D.projects[idx - 1], next = D.projects[idx + 1], n = p.entries.length, last = latestDate(p);
    var st = stampFor(p);
    var cells = [['Category', p.category], ['When', p.when], ['Status', p.status || (p.group === 'bench' ? 'On the bench' : '')], ['Journal', n ? plural(n, 'entry').replace('entrys', 'entries') + (last ? ', latest ' + fmtDate(last) : '') : 'Not started']]
      .filter(function (c) { return c[1]; });
    var links = (p.links || []).concat(p.link ? [p.link] : []);
    var html = '<div class="page proj"><a class="back" href="#/projects">&larr; All projects</a>' +
      '<h1 class="proj-title">' + esc(p.title) + (st ? '<span class="stamp">' + esc(st) + '</span>' : '') + '</h1>' +
      '<dl class="titleblock tb">' + cells.map(function (c) { return '<div><dt>' + esc(c[0]) + '</dt><dd>' + esc(c[1]) + '</dd></div>'; }).join('') + '</dl>' +
      '<div class="proj-brief">' + paras(p.text) + tagList(p.tags) +
      (links.length ? '<p class="ctas">' + links.map(function (l) { var ext = /^https?:/.test(l.href); return '<a class="btn" href="' + esc(safeUrl(l.href)) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + esc(l.label) + (ext ? ' &#8599;' : '') + '</a>'; }).join('') + '</p>' : '') + '</div>' +
      '<section class="journal" id="journal"><div class="sec-head"><div><h2 class="jh"><span class="num">&#9998;</span>Journal</h2><p class="note">Work log for this project.</p></div>' +
      (n > 1 ? '<div class="sec-tools"><span class="hand">Order:</span><button class="chip" type="button" id="jorder">newest first</button></div>' : '') + '</div>' +
      '<div class="jlayout' + (n > 1 ? '' : ' solo') + '">' + (n > 1 ? '<details class="jtoc" open><summary>Entries <span class="n">' + n + '</span></summary><ol id="jtoc-list"></ol></details>' : '') +
      '<div id="jentries"></div></div></section>' +
      '<div class="pager"><span>' + (prev ? '<a href="#/project/' + esc(prev.slug) + '">Previous: ' + esc(prev.title) + '</a>' : '') + '</span>' +
      '<span>' + (next ? '<a href="#/project/' + esc(next.slug) + '">Next: ' + esc(next.title) + '</a>' : '') + '</span></div></div>';
    app.innerHTML = html;
    document.title = p.title + ' | ' + D.site.title;
    var jt = app.querySelector('.jtoc'); if (jt && window.innerWidth <= 860) jt.removeAttribute('open');
    drawJournal(p);
    var ob = document.getElementById('jorder');
    if (ob) ob.addEventListener('click', function () { jOrder = jOrder === 'new' ? 'old' : 'new'; drawJournal(p); });
  }

  /* ---------- router ---------- */
  function setNav(name) {
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      if (a.dataset.nav === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  function route() {
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    var head = parts[0];
    if (io && head !== 'project') { io.disconnect(); io = null; }
    if (head === 'notes') {
      if (parts[1]) renderPost(decodeURIComponent(parts[1])); else renderNotes();
      view = 'notes'; curSlug = null; setNav('notes'); window.scrollTo(0, 0);
    } else if (head === 'about') {
      renderAbout(); view = 'about'; curSlug = null; setNav('about'); window.scrollTo(0, 0);
    } else if (head === 'project' && parts[1]) {
      var slug = decodeURIComponent(parts[1]);
      if (view !== 'project' || curSlug !== slug) renderProject(slug);
      view = 'project'; curSlug = slug; setNav('projects');
      var t = parts[2] && document.getElementById(decodeURIComponent(parts[2]));
      if (t) requestAnimationFrame(function () { t.scrollIntoView(); }); else window.scrollTo(0, 0);
    } else {
      if (view !== 'home') renderHome();
      view = 'home'; curSlug = null;
      var target = head && document.getElementById(head);
      setNav(head === 'projects' || head === 'contact' ? head : '');
      if (target) requestAnimationFrame(function () { target.scrollIntoView(); });
      else window.scrollTo(0, 0);
    }
    document.body.setAttribute('data-view', view || '');
  }

  /* ---------- delegated clicks: category tabs, video play ---------- */
  app.addEventListener('click', function (e) {
    var tab = e.target.closest('.tab');
    if (tab) { activeCat = tab.dataset.cat || ''; drawGrid(); return; }
    var play = e.target.closest('.play');
    if (play) {
      var box = play.closest('.video'), f = document.createElement('iframe');
      f.src = box.dataset.src; f.title = box.dataset.title || 'Video';
      f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.setAttribute('allowfullscreen', ''); f.referrerPolicy = 'strict-origin-when-cross-origin';
      box.replaceChild(f, play);
    }
  });

  /* ---------- theme: paper by default, blueprint on request ---------- */
  var btn = document.getElementById('theme');
  var root = document.documentElement;
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    btn.textContent = t === 'dark' ? 'paper' : 'blueprint';
  }
  var saved = null;
  try { saved = localStorage.getItem('notebook-theme'); } catch (e) {}
  applyTheme(saved === 'dark' ? 'dark' : 'light');
  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('notebook-theme', next); } catch (e) {}
  });

  /* ---------- boot ---------- */
  Promise.all([
    getJSON('data/site.json'), getJSON('data/projects.json'),
    getJSON('data/experience.json'), getJSON('posts/index.json')
  ]).then(function (r) {
    D.site = r[0]; D.exp = r[2];
    D.posts = r[3].slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    D.posts.forEach(function (p, i) { p.page = D.posts.length - i; });
    var all = r[1];
    D.projects = all.filter(function (p) { return p.group === 'bench'; }).concat(all.filter(function (p) { return p.group !== 'bench'; }));
    var order = (D.site.categories || []).slice();
    D.projects.forEach(function (p) { if (p.category && order.indexOf(p.category) < 0) order.push(p.category); });
    D.cats = order.filter(function (c) { return D.projects.some(function (p) { return p.category === c; }); });
    return Promise.all(D.projects.map(function (p) {
      return getText(p.journal || 'projects/' + encodeURIComponent(p.slug) + '.md').catch(function () { return ''; })
        .then(function (t) { p.entries = parseJournal(t); });
    }));
  }).then(function () {
    window.addEventListener('hashchange', route);
    route();
  }).catch(function (err) {
    app.innerHTML = '<div class="page"><h1>Notebook not found</h1><p>Could not load the content files (' + esc(err.message) + '). ' +
      'If you opened index.html directly from disk, serve the folder instead: run <code>python3 -m http.server</code> in it and visit localhost:8000.</p></div>';
  });
})();