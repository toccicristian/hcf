(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  // Global CRT phosphor selector. The HTML/CSS own its structure and layout;
  // JavaScript only manages state, persistence and navigation propagation.
  const phosphorProfiles = {
    green: 'VERDE',
    amber: 'ÁMBAR',
    blue: 'AZUL',
    white: 'BLANCO',
  };
  const validPhosphor = value =>
    Object.prototype.hasOwnProperty.call(phosphorProfiles, value);
  let activePhosphor = validPhosphor(window.__hcfPhosphor) ? window.__hcfPhosphor : 'green';

  const carryPhosphorToLinks = value => {
    $$('a[href]').forEach(link => {
      const raw = link.getAttribute('href');
      const isSkippedLink =
        !raw ||
        raw.startsWith('#') ||
        raw.startsWith('mailto:') ||
        raw.startsWith('tel:') ||
        raw.startsWith('javascript:');

      if (isSkippedLink) return;
      try {
        const url = new URL(raw, location.href);
        if (url.protocol !== 'file:' && url.origin !== location.origin) return;
        if (!/\.html$/i.test(url.pathname)) return;
        url.searchParams.set('phosphor', value);
        link.href = url.href;
      } catch (e) {}
    });
  };

  const phosphorPicker = $('.phosphor-picker');
  const phosphorToggle = $('.phosphor-toggle', phosphorPicker || document);
  const phosphorCurrent = $('.phosphor-current', phosphorPicker || document);
  const syncPhosphorControl = value => {
    if (phosphorCurrent) phosphorCurrent.textContent = phosphorProfiles[value];
    if (!phosphorPicker) return;
    $$('.phosphor-option', phosphorPicker).forEach(btn => {
      const active = btn.dataset.phosphorValue === value;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', String(active));
    });
  };
  const closePhosphorMenu = () => {
    phosphorPicker?.classList.remove('open');
    phosphorToggle?.setAttribute('aria-expanded', 'false');
  };
  const applyPhosphor = value => {
    if (!validPhosphor(value)) return;
    activePhosphor = value;
    document.documentElement.dataset.phosphor = value;
    window.__hcfPhosphor = value;
    window.name = `hcf-phosphor:${value}`;
    try { localStorage.setItem('hcf-phosphor', value); } catch (e) {}
    try {
      const current = new URL(location.href);
      current.searchParams.set('phosphor', value);
      history.replaceState(null, '', current.href);
    } catch (e) {}
    carryPhosphorToLinks(value);
    syncPhosphorControl(value);
  };

  carryPhosphorToLinks(activePhosphor);
  syncPhosphorControl(activePhosphor);
  phosphorToggle?.addEventListener('click', e => {
    e.stopPropagation();
    const open = phosphorPicker.classList.toggle('open');
    phosphorToggle.setAttribute('aria-expanded', String(open));
  });
  $$('.phosphor-option', phosphorPicker || document).forEach(option => {
    option.addEventListener('click', () => {
      applyPhosphor(option.dataset.phosphorValue);
      closePhosphorMenu();
    });
  });

  document.addEventListener('click', e => {
    const link = e.target.closest?.('a[href]');
    if (link) carryPhosphorToLinks(activePhosphor);
    if (phosphorPicker && !phosphorPicker.contains(e.target)) closePhosphorMenu();
  }, true);
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
    toast.classList.add('show');
    toast.innerHTML = [
      '<strong>TRANSMISIÓN COMPLETA</strong>',
      `USUARIO: ${name.replace(/[<>]/g, '')}`,
      'ESTADO: 200 OK',
      'PAQUETE ALMACENADO EN HCF_BBS',
    ].join('<br>');
    form.reset();
    setTimeout(() => toast.classList.remove('show'), 5500);
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
      const command = link.dataset.lightbox || 'FRAME';
      const safeComment = comment.replace(/[<>]/g, '');

      lbCap.innerHTML = [
        `<span class="lb-command">C:\\HCF\\MEDIA&gt; OPEN ${command}</span>`,
        `<span class="lb-comment">${safeComment}</span>`,
      ].join('');
      if (lbCounter) {
        const currentLabel = String(current + 1).padStart(2, '0');
        const totalLabel = String(triggers.length).padStart(2, '0');
        lbCounter.textContent = `${currentLabel} / ${totalLabel}`;
      }
    };
    const open = index => {
      render(index);
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
    };
    const close = () => {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      lbImg.removeAttribute('src');
      document.body.classList.remove('lightbox-open');
    };
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
        progress.className = `boot-progress-step-${line + 1}`;
        status.textContent = line < 2 ? 'ABRIENDO LÍNEA...' : line < 7 ? 'ESTABLECIENDO ENLACE...' : 'NODO DISPONIBLE';
        line++;
        timer=setTimeout(next, line===3 ? 500 : 230);
      } else timer=setTimeout(finish,650);
    };
    next();
  }
})();
