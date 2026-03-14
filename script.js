/* ─────────────────────────────────────────
   LOAD CONTENT & RENDER
───────────────────────────────────────── */
async function loadContent() {
  const res  = await fetch('content.json');
  const data = await res.json();
  render(data);
}

function render(d) {
  /* NAV */
  document.getElementById('navLogo').textContent = d.initials;
  document.title = `${d.name} — ${d.role}`;

  /* HERO */
  document.getElementById('heroTag').textContent = `// ${d.role} · ${d.location} · ${d.year}`;

  const h1 = document.getElementById('heroH1');
  [d.hero.line1, d.hero.line2, d.hero.line3].forEach((line, i) => {
    const wrap = document.createElement('span');
    wrap.className = 'line';
    const inner = document.createElement('span');
    inner.innerHTML = line.replace('\n', '<br>');
    if (i === 2) inner.style.color = 'rgba(255,255,255,0.2)';
    wrap.appendChild(inner);
    h1.appendChild(wrap);
  });

  document.getElementById('heroDesc').textContent = d.hero.description;

  /* MARQUEE — doubled for seamless loop */
  const track = document.getElementById('marqueeTrack');
  const items = [...d.marquee, ...d.marquee];
  items.forEach(item => {
    const span = document.createElement('span');
    span.className = 'marquee-item';
    span.textContent = item;
    track.appendChild(span);
  });

  /* SERVICES */
  const grid = document.getElementById('servicesGrid');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr)';
  d.services.forEach((svc, i) => {
    const div = document.createElement('div');
    div.className = 'svc reveal' + (i > 0 ? ` reveal-d${i}` : '');
    div.innerHTML = `
      <div class="svc-num">${svc.num}</div>
      <div class="svc-title">${svc.title.replace('\n', '<br>')}</div>
      <div class="svc-text">${svc.text}</div>`;
    grid.appendChild(div);
  });

  /* PROJECTS */
  document.getElementById('projectsMeta').textContent = `всего — ${String(d.projects.length).padStart(2, '0')}`;
  const list = document.getElementById('projectsList');
  d.projects.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'proj-row';
    row.innerHTML = `
      <div class="proj-idx">${String(i + 1).padStart(2, '0')}</div>
      <div class="proj-name">${p.name}</div>
      <div class="proj-type">${p.type}</div>
      <div class="proj-arrow">→</div>`;
    if (p.url && p.url !== '#') {
      row.style.cursor = 'none';
      row.addEventListener('click', () => window.open(p.url, '_blank'));
    }
    list.appendChild(row);
  });

  /* ABOUT */
  document.getElementById('aboutName').innerHTML = d.name.replace(' ', '<br>');
  document.getElementById('aboutText').textContent = d.about.text;

  const statsGrid = document.getElementById('statsGrid');
  d.stats.forEach(s => {
    const div = document.createElement('div');
    div.innerHTML = `<div class="stat-num" data-target="${s.value}">0</div><div class="stat-label">${s.label}</div>`;
    statsGrid.appendChild(div);
  });

  const stackTags = document.getElementById('stackTags');
  d.stack.forEach(t => {
    const span = document.createElement('span');
    span.className = 'tag'; span.textContent = t;
    stackTags.appendChild(span);
  });

  const learningTags = document.getElementById('learningTags');
  d.learning.forEach(t => {
    const span = document.createElement('span');
    span.className = 'tag tag-active'; span.textContent = t;
    learningTags.appendChild(span);
  });

  /* CONTACTS */
  const links = document.getElementById('contactLinks');
  const contactItems = [
    { label: 'Telegram', url: d.contacts.telegram },
    { label: 'VK',       url: d.contacts.vk },
    { label: 'Email',    url: `mailto:${d.contacts.email}` }
  ];
  contactItems.forEach(c => {
    const a = document.createElement('a');
    a.href = c.url; a.className = 'contact-link';
    a.textContent = `${c.label} →`;
    links.appendChild(a);
  });

  /* FOOTER */
  document.getElementById('footerLeft').textContent  = `© ${d.year} ${d.name}`;
  document.getElementById('footerRight').textContent = `${d.location} · ${d.role}`;

  /* INIT INTERACTIONS after render */
  initCursor();
  initLoader();
  initReveal();
  initCounters();
  initParallax();
}

/* ─────────────────────────────────────────
   CURSOR
───────────────────────────────────────── */
function initCursor() {
  const dot = document.getElementById('cur-dot');

  document.addEventListener('mousemove', e => {
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
  });

  document.addEventListener('mouseover', e => {
    const hoverEl = e.target.closest('a, .svc, .proj-row, .tag, .btn');
    document.body.classList.toggle('hovering', !!hoverEl);
  });
}

/* ─────────────────────────────────────────
   LOADER
───────────────────────────────────────── */
function initLoader() {
  const num    = document.getElementById('loader-num');
  const bar    = document.getElementById('loader-bar');
  const loader = document.getElementById('loader');
  let prog = 0;

  const iv = setInterval(() => {
    prog += Math.random() * 15 + 3;
    if (prog >= 100) { prog = 100; clearInterval(iv); }
    num.textContent = Math.floor(prog);
    bar.style.width = prog + '%';
    if (prog >= 100) setTimeout(() => {
      loader.classList.add('done');
      setTimeout(() => loader.style.display = 'none', 1000);
    }, 200);
  }, 70);
}

/* ─────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); });
  }, { threshold: 0.07 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ─────────────────────────────────────────
   COUNTERS
───────────────────────────────────────── */
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.target;
      let cur = 0; const step = target / 40;
      const t = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(t); }
        el.textContent = Math.floor(cur) + '+';
      }, 28);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-target]').forEach(el => obs.observe(el));
}

/* ─────────────────────────────────────────
   PARALLAX GRID
───────────────────────────────────────── */
function initParallax() {
  const grid = document.getElementById('heroGrid');
  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 24;
    const y = (e.clientY / window.innerHeight - 0.5) * 24;
    if (grid) grid.style.backgroundPosition = `${x}px ${y}px`;
  });
}

/* ─────────────────────────────────────────
   START
───────────────────────────────────────── */
loadContent().catch(err => {
  console.error('Не удалось загрузить content.json:', err);
  document.body.innerHTML = '<p style="color:white;padding:40px;font-family:monospace">Ошибка: открывай через Live Server или локальный сервер, а не двойным кликом на файл.</p>';
});
