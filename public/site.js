(() => {
  const root = document.documentElement; root.classList.add('js');
  const SITE = window.__SITE__ || {};
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const isDark = () => root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);

  /* analytics beacon (no cookies, no personal data) */
  const track = (type, path) => { if (SITE.static) return; try { const body = JSON.stringify({ type, path: path || location.pathname + location.hash, ref: document.referrer || '' });
    if (navigator.sendBeacon) navigator.sendBeacon('/api/event', new Blob([body], { type: 'application/json' })); else fetch('/api/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }); } catch (e) {} };
  track('page_view', location.pathname);

  /* theme */
  $('#themeToggle')?.addEventListener('click', () => { root.dataset.theme = isDark() ? 'light' : 'dark'; try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {} drawAll(); });

  /* generative covers (fallback when a project has no image) */
  const cssVar = n => getComputedStyle(root).getPropertyValue(n).trim();
  const palette = hue => { const a = cssVar('--accent'), s = cssVar('--signal'), ink = cssVar('--ink'), bg = cssVar('--bg-2'); return ({ a: [a, s, bg], b: [ink, a, bg], c: ['#FF7A59', s, bg], d: ['#22C55E', a, bg] })[hue] || [a, s, bg]; };
  const rng = seed => { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; };
  function drawCover(canvas) {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    const seed = +canvas.dataset.seed || 1, hue = canvas.dataset.hue || 'a', dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = r.width * dpr; canvas.height = r.height * dpr;
    const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr); const W = r.width, H = r.height, [c1, c2, c3] = palette(hue), rand = rng(seed);
    ctx.fillStyle = c3; ctx.fillRect(0, 0, W, H);
    const kind = (seed - 1) % 4;
    if (kind === 0) { ctx.lineWidth = Math.max(6, W / 26); for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.strokeStyle = i % 2 ? c1 : c2; ctx.globalAlpha = 1 - i * .08; ctx.arc(W * .72, H * .78, (i + 1) * W / 9, Math.PI, Math.PI * 1.75); ctx.stroke(); } }
    else if (kind === 1) { ctx.fillStyle = c1; const g = Math.max(18, W / 22); for (let x = g / 2; x < W; x += g) for (let y = g / 2; y < H; y += g) { const d = Math.hypot(x - W * .3, y - H * .5) / W; ctx.globalAlpha = .18 + .5 * Math.min(1, d); ctx.beginPath(); ctx.arc(x, y, 2.5, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1; ctx.fillStyle = c2; ctx.beginPath(); ctx.ellipse(W * .32, H * .5, W * .17, H * .26, -.4, 0, 7); ctx.fill(); ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(W * .68, H * .36, W * .06, 0, 7); ctx.fill(); }
    else if (kind === 2) { for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 6) ctx.lineTo(x, H * (.25 + i * .1) + Math.sin(x / W * 6 + i + seed) * H * .05); ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = i % 2 ? c1 : c2; ctx.globalAlpha = .55 + i * .06; ctx.fill(); } }
    else { for (let i = 0; i < 26; i++) { const s = W * (.05 + rand() * .12), x = rand() * W, y = rand() * H; ctx.fillStyle = rand() > .6 ? c2 : c1; ctx.globalAlpha = .35 + rand() * .6; ctx.beginPath(); ctx.roundRect(x, y, s, s, s * .25); ctx.fill(); } }
    ctx.globalAlpha = 1;
  }
  function drawPortrait() {
    const c = $('#portraitCanvas'); if (!c) return; const r = c.getBoundingClientRect(); if (!r.width) return;
    const dpr = Math.min(devicePixelRatio || 1, 2); c.width = r.width * dpr; c.height = r.height * dpr;
    const ctx = c.getContext('2d'); ctx.scale(dpr, dpr); const W = r.width, H = r.height;
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, cssVar('--accent')); g.addColorStop(1, cssVar('--orb-b')); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = cssVar('--signal'); ctx.beginPath(); ctx.arc(W * .5, H * .42, W * .28, 0, 7); ctx.fill();
    ctx.fillStyle = cssVar('--ink'); ctx.globalAlpha = .85; ctx.beginPath(); ctx.ellipse(W * .5, H * 1.05, W * .46, H * .42, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  }
  const drawAll = () => { $$('canvas[data-seed]').forEach(drawCover); drawPortrait(); };
  addEventListener('resize', drawAll);

  /* project modal (home page) */
  let PROJECTS = []; try { PROJECTS = JSON.parse($('#projects-data')?.textContent || '[]'); } catch (e) {}
  const modal = $('#modal'); let lastFocus = null, modalOpen = false;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  function openModal(slug, push = true) {
    const p = PROJECTS.find(x => x.slug === slug); if (!p || !modal) return;
    lastFocus = document.activeElement;
    $('#modalKicker').textContent = [p.kicker, p.year].filter(Boolean).join(' · '); $('#modalTitle').textContent = p.title;
    $('#modalCover').innerHTML = p.cover ? `<img src="${esc(p.cover)}" alt="">` : `<canvas data-seed="${p.seed}" data-hue="${esc(p.hue)}"></canvas>`;
    const facts = [['Role', p.role], ['Team', p.team], ['Duration', p.duration]].filter(([, v]) => v);
    $('#modalFacts').innerHTML = facts.map(([k, v]) => `<div><span class="mono">${k}</span><b>${esc(v)}</b></div>`).join(''); $('#modalFacts').style.display = facts.length ? '' : 'none';
    const L = p.links || {}, links = [['live', 'Live site'], ['repo', 'Source'], ['paper', 'Read the paper']].filter(([k]) => L[k]).map(([k, l]) => `<a class="btn" href="${esc(L[k])}" target="_blank" rel="noopener"><span>${l} &nearr;</span></a>`).join('');
    $('#modalBody').innerHTML = `${p.result_value ? `<div class="result"><b>${esc(p.result_value)}</b><span>${esc(p.result_label)}</span></div>` : ''}<div class="body">${p.bodyHtml || ''}</div>
      ${p.gallery?.length ? `<div class="gallery">${p.gallery.map(g => `<img src="${esc(g)}" alt="" loading="lazy">`).join('')}</div>` : ''}${links ? `<div class="links">${links}</div>` : ''}
      <a class="perma" href="/work/${esc(p.slug)}">Permalink: /work/${esc(p.slug)}</a>`;
    modal.classList.add('open'); modalOpen = true; document.body.style.overflow = 'hidden'; $('.sheet').scrollTop = 0;
    requestAnimationFrame(() => { $$('#modalCover canvas').forEach(drawCover); $('#modalClose').focus(); });
    if (push) history.pushState({ modal: slug }, '', `/work/${slug}`);
    track('project_open', '/work/' + slug);
  }
  function closeModal(pop = true) { if (!modalOpen) return; modal.classList.remove('open'); modalOpen = false; document.body.style.overflow = ''; lastFocus && lastFocus.focus(); if (pop && history.state?.modal) history.back(); }
  if (modal) {
    $$('#workGrid .card').forEach(a => a.addEventListener('click', e => { if (e.metaKey || e.ctrlKey) return; e.preventDefault(); openModal(a.dataset.slug); }));
    $('#modalClose').addEventListener('click', () => closeModal()); modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    addEventListener('popstate', () => { if (modalOpen && !history.state?.modal) closeModal(false); });
  }
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeMenu(); } });

  /* mobile menu */
  const burger = $('#burger'), menu = $('#menu');
  function closeMenu() { document.body.classList.remove('menu-open'); burger?.setAttribute('aria-expanded', 'false'); menu?.setAttribute('aria-hidden', 'true'); }
  burger?.addEventListener('click', () => { const open = document.body.classList.toggle('menu-open'); burger.setAttribute('aria-expanded', open); menu.setAttribute('aria-hidden', !open); });
  $$('#menu a').forEach(a => a.addEventListener('click', closeMenu));

  /* headline word reveal */
  const h1 = $('#headline');
  if (h1) { const wrapWords = node => { [...node.childNodes].forEach(n => { if (n.nodeType === 3) { const frag = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(t => { if (!t) return; if (/^\s+$/.test(t)) frag.append(t); else { const w = document.createElement('span'); w.className = 'w'; const i = document.createElement('span'); i.textContent = t; w.append(i); frag.append(w); } }); n.replaceWith(frag); } else wrapWords(n); }); };
    wrapWords(h1); if (!reduce) { $$('.w > span', h1).forEach((s, i) => s.style.animationDelay = `${.05 + i * .07}s`); h1.classList.add('animate'); } }

  /* rotating roles */
  const slot = $('#roleSlot'); if (slot && !reduce) { const items = $$('span', slot); if (items.length > 1) { let k = 0;
    setInterval(() => { items[k].classList.remove('on'); items[k].classList.add('out'); k = (k + 1) % items.length; const nxt = items[k]; nxt.classList.remove('out'); nxt.classList.add('on'); setTimeout(() => items.forEach(s => !s.classList.contains('on') && s.classList.remove('out')), 650); }, 2600); } }

  /* marquee */
  const trackEl = $('#track'); if (trackEl) trackEl.innerHTML += trackEl.innerHTML;

  /* magnetic buttons, tilt, cursor (desktop only) */
  if (fine && !reduce) {
    $$('.magnet').forEach(b => { b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`; });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; b.style.transition = 'transform .5s var(--ease)'; setTimeout(() => b.style.transition = '', 500); }); });
    $$('#workGrid .card').forEach(card => { const even = card.matches(':nth-child(even)');
      card.addEventListener('pointermove', e => { const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; card.style.transform = `perspective(1000px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg) translateY(${even ? 'clamp(0px,4vw,60px)' : '0px'})`; card.style.transition = 'transform .1s'; });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; card.style.transition = 'transform .6s var(--ease)'; }); });
    const cur = $('#cursor'); if (cur) { let cx = 0, cy = 0, tx = 0, ty = 0;
      addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; cur.style.opacity = 1; }); addEventListener('pointerout', e => { if (!e.relatedTarget) cur.style.opacity = 0; });
      (function loop() { cx += (tx - cx) * .2; cy += (ty - cy) * .2; cur.style.left = cx + 'px'; cur.style.top = cy + 'px'; requestAnimationFrame(loop); })();
      document.addEventListener('pointerover', e => { if (e.target.closest('a,button')) cur.classList.add('big'); }); document.addEventListener('pointerout', e => { if (e.target.closest('a,button')) cur.classList.remove('big'); }); }
  }

  /* reveal + counters */
  let counted = false;
  const countUp = () => { if (counted) return; counted = true; $$('[data-count]').forEach(el => { const end = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length, t0 = performance.now(), dur = reduce ? 1 : 1400;
    (function tick(now) { const p = Math.min(1, (now - t0) / dur); el.textContent = (end * (1 - Math.pow(1 - p, 3))).toFixed(dec); if (p < 1) requestAnimationFrame(tick); })(t0); }); };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); if (e.target.querySelector('[data-count]')) countUp(); } }), { threshold: .12 });
  $$('[data-reveal]').forEach(el => { if (el.getBoundingClientRect().top > innerHeight && !reduce) el.classList.add('pre'); io.observe(el); });

  /* accordion */
  $$('.step-btn').forEach(btn => btn.addEventListener('click', () => { const step = btn.parentElement, open = step.getAttribute('aria-expanded') === 'true'; $$('.step').forEach(s => s.setAttribute('aria-expanded', 'false')); if (!open) step.setAttribute('aria-expanded', 'true'); }));

  /* header, progress, active link */
  const header = $('header'), progress = $('#progress'), links = $$('.links a'), sections = ['work', 'about', 'skills', 'contact'].map(id => $('#' + id)).filter(Boolean);
  const onScroll = () => { const y = scrollY, max = document.documentElement.scrollHeight - innerHeight; header?.classList.toggle('scrolled', y > 20); if (progress) progress.style.transform = `scaleX(${max ? y / max : 0})`;
    let active = null; sections.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * .4) active = s.id; }); links.forEach(a => a.classList.toggle('active', a.getAttribute('href').endsWith('#' + active))); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* copy email */
  const toast = $('#toast'); let tt; const say = m => { if (!toast) return; toast.textContent = m; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), 2000); };
  $('#mailLink')?.addEventListener('click', e => { const mail = SITE.email; if (navigator.clipboard && mail) { e.preventDefault(); navigator.clipboard.writeText(mail).then(() => say('Copied to clipboard')).catch(() => location.href = 'mailto:' + mail); } });
  $$('[data-cta]').forEach(a => a.addEventListener('click', () => track('cta_click', a.dataset.cta)));

  /* contact form */
  const cf = $('#contactForm');
  cf?.addEventListener('submit', async e => { e.preventDefault(); const msg = $('#cfMsg'), btn = cf.querySelector('button[type=submit]'); msg.className = 'msg';
    const data = Object.fromEntries(new FormData(cf).entries());
    if (!data.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.body.trim().length < 10) { msg.textContent = 'Please add your name, a valid email and a message of at least 10 characters.'; msg.className = 'msg err'; return; }
    if (SITE.static) { const subject = data.subject.trim() || `Message from ${data.name.trim()}`; location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(data.body.trim() + '\n\n— ' + data.name.trim() + ' <' + data.email.trim() + '>')}`; msg.textContent = 'Opening your email app with the message filled in.'; msg.className = 'msg ok'; return; }
    btn.disabled = true; try { const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { msg.textContent = `Thanks, ${data.name.trim().split(' ')[0]}. Your message is in. I'll reply soon.`; msg.className = 'msg ok'; cf.reset(); cf.querySelector('[name=t]').value = Date.now(); }
      else { msg.textContent = j.error || 'Could not send right now. Please email me directly.'; msg.className = 'msg err'; } }
    catch { msg.textContent = 'Network error. Please try again or email me directly.'; msg.className = 'msg err'; } btn.disabled = false; });

  /* clock */
  const clock = () => { try { const t = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: SITE.timezone || 'UTC' }).format(new Date()); const c = $('#clock'); if (c) c.textContent = t; const m = $('#menuClock'); if (m) m.textContent = t.slice(0, 5); } catch (e) {} }; clock(); setInterval(clock, 1000);

  /* hero orbs */
  const oc = $('#orbs'); if (oc) { const octx = oc.getContext('2d'); let ow, oh, px = .5, py = .4, tpx = .5, tpy = .4, t = 0;
    const sizeOrbs = () => { const r = oc.getBoundingClientRect(); ow = oc.width = r.width * .5; oh = oc.height = r.height * .5; }; sizeOrbs(); addEventListener('resize', sizeOrbs);
    $('.hero').addEventListener('pointermove', e => { const r = oc.getBoundingClientRect(); tpx = (e.clientX - r.left) / r.width; tpy = (e.clientY - r.top) / r.height; });
    const orbs = [{ v: '--orb-a', r: .42, s: 1, o: .55 }, { v: '--orb-b', r: .34, s: 1.4, o: .35 }, { v: '--orb-c', r: .26, s: .8, o: .3 }];
    (function drawOrbs() { t += .004; px += (tpx - px) * .04; py += (tpy - py) * .04; octx.clearRect(0, 0, ow, oh); const dk = isDark();
      orbs.forEach((o, i) => { const x = ow * (.5 + Math.sin(t * o.s + i * 2) * .22 + (px - .5) * .25 * (i + 1)), y = oh * (.45 + Math.cos(t * o.s * 1.3 + i) * .18 + (py - .5) * .2 * (i + 1)), rad = Math.max(ow, oh) * o.r;
        const g = octx.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, cssVar(o.v)); g.addColorStop(1, 'rgba(0,0,0,0)'); octx.globalAlpha = o.o * (dk ? .8 : 1); octx.fillStyle = g; octx.beginPath(); octx.arc(x, y, rad, 0, 7); octx.fill(); });
      octx.globalAlpha = 1; if (!reduce) requestAnimationFrame(drawOrbs); })(); }

  /* unknown #hash → in-page 404 */
  const nf = $('#notfound');
  const checkHash = () => { if (!nf) return; const h = decodeURIComponent(location.hash || ''); const missing = h.length > 1 && !document.getElementById(h.slice(1)) && !/^#(work|about|skills|contact|top)$/.test(h);
    if (missing) { $('#nfPath').textContent = location.pathname + h; track('not_found', location.pathname + h); } nf.classList.toggle('open', missing); nf.setAttribute('aria-hidden', !missing); document.body.style.overflow = missing ? 'hidden' : (modalOpen ? 'hidden' : ''); };
  $$('[data-nf-close]').forEach(a => a.addEventListener('click', () => { nf.classList.remove('open'); nf.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }));
  addEventListener('hashchange', checkHash); checkHash();

  drawAll(); (document.fonts ? document.fonts.ready : Promise.resolve()).then(drawAll);
})();
