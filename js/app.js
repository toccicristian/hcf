(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];


  // Global CRT phosphor selector. The selected monitor profile persists across pages.
  const phosphorProfiles = {
    green: 'VERDE',
    amber: 'ÁMBAR',
    blue: 'AZUL',
    white: 'BLANCO'
  };
  const savedPhosphor = (() => {
    try {
      const tabValue = (window.name.match(/^hcf-phosphor:(green|amber|blue|white)$/) || [])[1];
      const value = localStorage.getItem('hcf-phosphor') || tabValue || 'green';
      return phosphorProfiles[value] ? value : 'green';
    } catch (e) {
      const tabValue = (window.name.match(/^hcf-phosphor:(green|amber|blue|white)$/) || [])[1];
      return phosphorProfiles[tabValue] ? tabValue : 'green';
    }
  })();
  document.documentElement.dataset.phosphor = savedPhosphor;
  window.name = `hcf-phosphor:${savedPhosphor}`;

  const phosphorPicker = document.createElement('div');
  phosphorPicker.className = 'phosphor-picker';
  phosphorPicker.setAttribute('aria-label', 'Selector de fósforo CRT');
  phosphorPicker.innerHTML = `
    <button class="phosphor-toggle" type="button" aria-expanded="false">PHOSPHOR: <strong>${phosphorProfiles[savedPhosphor]}</strong> ▾</button>
    <div class="phosphor-menu" role="menu" aria-label="Tipo de fósforo">
      ${Object.entries(phosphorProfiles).map(([key,label]) => `<button class="phosphor-option${key === savedPhosphor ? ' active' : ''}" type="button" role="menuitemradio" aria-checked="${key === savedPhosphor}" data-phosphor-value="${key}"><span class="phosphor-swatch"></span>${label}</button>`).join('')}
      <span class="phosphor-picker-note">MEMORY: LOCAL STORAGE</span>
    </div>`;
  document.body.appendChild(phosphorPicker);

  const phosphorToggle = $('.phosphor-toggle', phosphorPicker);
  const closePhosphorMenu = () => {
    phosphorPicker.classList.remove('open');
    phosphorToggle?.setAttribute('aria-expanded', 'false');
  };
  phosphorToggle?.addEventListener('click', e => {
    e.stopPropagation();
    const open = phosphorPicker.classList.toggle('open');
    phosphorToggle.setAttribute('aria-expanded', String(open));
  });
  $$('.phosphor-option', phosphorPicker).forEach(option => option.addEventListener('click', () => {
    const value = option.dataset.phosphorValue;
    if (!phosphorProfiles[value]) return;
    document.documentElement.dataset.phosphor = value;
    try { localStorage.setItem('hcf-phosphor', value); } catch (e) {}
    window.name = `hcf-phosphor:${value}`;
    $$('.phosphor-option', phosphorPicker).forEach(btn => {
      const active = btn === option;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', String(active));
    });
    phosphorToggle.innerHTML = `PHOSPHOR: <strong>${phosphorProfiles[value]}</strong> ▾`;
    closePhosphorMenu();
  }));
  document.addEventListener('click', e => {
    if (!phosphorPicker.contains(e.target)) closePhosphorMenu();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePhosphorMenu();
  });

  // Mobile terminal menu
  const nav = $('#mainNav');
  const hamb = $('#hamb');
  if (hamb && nav) {
    hamb.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      hamb.classList.toggle('active', open);
      hamb.setAttribute('aria-expanded', String(open));
    });
  }

  // Back to top
  const back = $('#backTop');
  if (back) {
    const toggle = () => back.classList.toggle('show', window.scrollY > 280);
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
    back.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // Terminal typing effects
  $$('[data-boot]').forEach(el => {
    el.textContent = '';
    const text = el.dataset.boot || '';
    let i = 0;
    const tick = () => {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(tick, 18);
      } else {
        el.insertAdjacentHTML('beforeend', '<span class="cursor">&nbsp;</span>');
      }
    };
    tick();
  });

  // Contact terminal response
  const form = $('#contactForm');
  const toast = $('#toast');
  if (form && toast) form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.querySelector('[name=name]')?.value || 'UNKNOWN_USER';
    toast.style.display = 'block';
    toast.innerHTML = `<strong>TRANSMISIÓN COMPLETA</strong><br>USUARIO: ${name.replace(/[<>]/g, '')}<br>ESTADO: 200 OK<br>PAQUETE ALMACENADO EN HCF_BBS`;
    form.reset();
    setTimeout(() => toast.style.display = 'none', 5500);
  });

  // Real uploaded dial-up recording for the BBS connection button
  $$('[data-tone]').forEach(btn => {
    const audio = new Audio('assets/audio/dial-up.ogg');
    audio.preload = 'auto';
    const resetButton = () => {
      btn.textContent = 'CONNECT TO BBS';
      btn.removeAttribute('aria-busy');
      btn.classList.remove('playing');
      btn.setAttribute('aria-label', 'Reproducir sonido de conexión BBS');
    };
    audio.addEventListener('ended', resetButton);
    btn.addEventListener('click', async () => {
      try {
        if (!audio.paused) {
          audio.pause();
          resetButton();
          return;
        }
        audio.currentTime = 0;
        btn.textContent = 'DISCONNECT BBS';
        btn.setAttribute('aria-busy', 'true');
        btn.setAttribute('aria-label', 'Detener sonido de conexión BBS');
        btn.classList.add('playing');
        await audio.play();
      } catch (err) {
        resetButton();
      }
    });
  });

  // CRT lightbox with previous/next navigation
  const lb = $('#lightbox');
  const lbImg = $('#lightboxImage');
  const lbCap = $('#lightboxCaption');
  const lbCounter = $('#lightboxCounter');
  const triggers = $$('.lightbox-trigger');
  if (lb && lbImg && triggers.length) {
    let current = 0;
    const render = index => {
      current = (index + triggers.length) % triggers.length;
      const link = triggers[current];
      const img = $('img', link);
      const figure = link.closest('figure');
      const comment = $('figcaption', figure)?.textContent?.trim() || img?.alt || 'FRAME';
      lbImg.src = link.getAttribute('href');
      lbImg.alt = img?.alt || '';
      lbCap.innerHTML = `<span class="lb-command">C:\\HCF\\MEDIA&gt; OPEN ${link.dataset.lightbox || 'FRAME'}</span><span class="lb-comment">${comment.replace(/[<>]/g,'')}</span>`;
      if (lbCounter) lbCounter.textContent = `${String(current+1).padStart(2,'0')} / ${String(triggers.length).padStart(2,'0')}`;
    };
    const open = index => { render(index); lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; };
    const close = () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); lbImg.removeAttribute('src'); document.body.style.overflow=''; };
    triggers.forEach((link,i)=>link.addEventListener('click',e=>{e.preventDefault();open(i)}));
    $('.lightbox-prev')?.addEventListener('click', e=>{e.stopPropagation();render(current-1)});
    $('.lightbox-next')?.addEventListener('click', e=>{e.stopPropagation();render(current+1)});
    $('.lightbox-close')?.addEventListener('click', close);
    lb.addEventListener('click', e=>{if(e.target===lb || e.target.classList.contains('lightbox-screen')) close()});
    document.addEventListener('keydown',e=>{
      if(!lb.classList.contains('open')) return;
      if(e.key==='Escape') close();
      if(e.key==='ArrowLeft') render(current-1);
      if(e.key==='ArrowRight') render(current+1);
    });
  }

  // Per-page clandestine BBS node connection sequence
  const boot = $('#nodeBoot');
  if (boot) {
    document.body.classList.add('booting');
    const log = $('#bootLog'), progress = $('#bootProgress'), status = $('#bootStatus'), skip = $('#bootSkip');
    const page = document.title.split('//')[0].trim().toUpperCase() || 'HCF_BBS';
    const lines = [
      'HCF_BBS REMOTE ACCESS NODE 1984.11',
      'MODEM: HAYES COMPATIBLE / 2400 BAUD',
      'DIALING: (415) 555-HCFB',
      'CARRIER DETECTED ...',
      'NEGOTIATING PARITY ........ OK',
      'HANDSHAKE PROTOCOL ....... OK',
      'AUTHENTICATING: GUEST@HCF',
      `MOUNTING NODE: ${page}`,
      'ACCESS GRANTED // WELCOME, OPERATOR'
    ];
    let cancelled = false;
    let line = 0;
    let timer;
    const finish = () => {
      if(cancelled) return;
      cancelled = true;
      document.body.classList.remove('booting');
      boot.classList.add('done');
      setTimeout(()=>boot.remove(),500);
    };
    skip?.addEventListener('click', finish);
    const next = () => {
      if(cancelled) return;
      if(line < lines.length){
        log.textContent += (line ? '\n' : '') + lines[line];
        progress.style.width = `${Math.round(((line+1)/lines.length)*100)}%`;
        status.textContent = line < 2 ? 'ABRIENDO LÍNEA...' : line < 7 ? 'ESTABLECIENDO ENLACE...' : 'NODO DISPONIBLE';
        line++;
        timer=setTimeout(next, line===3 ? 500 : 230);
      } else timer=setTimeout(finish,650);
    };
    next();
  }
})();
