// LZ Audiovisual — interações do site

// --- JANELA DE CONTATO: abre por qualquer botão com data-contact="open" ---
(function () {
    const modal = document.getElementById('contact-modal');
    if (!modal) return;
    // enquanto a janela está aberta o resto da página fica inerte (sem foco nem clique por teclado)
    const page = [document.getElementById('navbar'), document.querySelector('main'), document.querySelector('footer')].filter(Boolean);
    let opener = null;

    function focusables() {
        return [...modal.querySelectorAll('a[href], button:not([disabled])')].filter((el) => el.offsetParent !== null);
    }

    function open() {
        opener = document.activeElement;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        page.forEach((el) => { el.inert = true; });
        setTimeout(() => modal.querySelector('.cm-close').focus(), 60);
    }

    function close() {
        if (!modal.classList.contains('is-open')) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        page.forEach((el) => { el.inert = false; });
        if (opener && opener.focus) opener.focus();
    }

    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-contact]');
        if (trigger) { trigger.dataset.contact === 'close' ? close() : open(); return; }
        if (e.target === modal) close();
    });

    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('is-open')) return;
        if (e.key === 'Escape') { close(); return; }
        // o Tab circula só dentro da janela
        if (e.key === 'Tab') {
            const items = focusables();
            if (!items.length) return;
            const first = items[0], last = items[items.length - 1];
            if (e.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
        }
    });
})();

// --- HISTÓRIA NO CELULAR: o progresso da rolagem (0 a 1) define cada momento da cena ---
(function () {
    const section = document.getElementById('phone-story');
    if (!section) return;
    const $ = (sel) => section.querySelector(sel);
    const stage = $('.ps-stage'), phone = $('.ps-phone'), head = $('.ps-head');
    const touch = $('.ps-touch'), end = $('.ps-end'), tile = $('.ps-tile'), photo = $('.ps-photo');
    const reels = [...section.querySelectorAll('.ps-reel-v')];
    const notes = [...section.querySelectorAll('.ps-note')];
    const igPage = $('.ig-page'), igTabs = $('.ig-tabs'), igBarScroll = $('.ig-bar-scroll');
    const warm = $('.ps-warm'), blob = $('.ps-blob'), tongue = $('.ps-tongue');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const PHONE_W = 390, PHONE_H = 800, SCREEN_W = 366, SCREEN_H = 776, HEADER = 88;
    // perfil do Instagram montado numa imagem só (1180 px de largura), que rola dentro da tela
    const IG_W = 1180, IG_H = 6970, IG_BAR = 325, IG_TABS = 1385;
    const K = SCREEN_W / IG_W, IG_END = IG_H - SCREEN_H / K;
    // miniatura da grade tocada no fim da rolagem (o 1º quadro do 1º reel), em pixels da tela do celular
    const TILE = { x: 394 * K, y: (5182 - IG_END) * K, w: 392 * K, h: 521 * K };
    // pedaço do vídeo que aparece na miniatura (frações do quadro): o reel abre a partir desse recorte
    const CROP = { x: 0, y: 180 / 1096 }, CROP_S = TILE.w / ((450 / 540) * SCREEN_W);
    // momentos da cena: o vídeo rola com o scroll, um toque na foto, a foto abre em tela cheia
    // o perfil rola, um toque abre o primeiro reel, e um arrastar para cima passa para o segundo
    const SCRUB = [0.08, 0.46], TAP = [0.45, 0.52], OPEN = [0.51, 0.58], SWIPE = [0.64, 0.71];
    let W = 0, H = 0, portrait = 1, endScale = 1, portraitY = 0, endX = 0, endY = 0;
    let target = 0, current = -1, frame = 0, visible = false;

    const clamp = (v) => Math.min(1, Math.max(0, v));
    const part = (p, a, b) => clamp((p - a) / (b - a));
    const smooth = (t) => t * t * (3 - 2 * t);
    const mix = (a, b, t) => a + (b - a) * t;

    function measure() {
        W = stage.clientWidth; H = stage.clientHeight;
        portrait = Math.min((H - HEADER - 20) / PHONE_H, (W * 0.74) / PHONE_W, 0.82);
        portraitY = HEADER / 2;
        // no celular o aparelho sobe e encosta logo abaixo do menu, para sobrar espaço embaixo para a frase
        if (W < 1024) portraitY = 68 + (PHONE_H * portrait) / 2 - H / 2;
        // no final o celular continua em pé: no computador vai para a esquerda, no celular encolhe para o texto caber embaixo
        const wide = W >= 1024;
        // no computador o celular encolhe se precisar para a faixa marrom caber inteira embaixo dele
        endScale = wide ? Math.min(portrait, (H / 2 - portraitY - 24) / (PHONE_H * (0.5 + 0.11 * 0.45))) : Math.min(portrait, (H * 0.5) / PHONE_H);
        endX = wide ? -Math.min(W * 0.18, 260) : 0;
        endY = wide ? portraitY : HEADER + (PHONE_H * endScale) / 2 - H / 2;
        end.classList.toggle('ps-end-side', wide);
        // as frases ficam sempre abaixo do título, nunca por cima dele
        const headBottom = head.offsetTop + head.offsetHeight;
        notes.forEach((n) => { n.style.top = Math.max(H / 2, headBottom + 32 + n.offsetHeight / 2) + 'px'; });
        if (wide) {
            end.style.left = (W / 2 + endX + (PHONE_W * endScale) / 2 + 56) + 'px';
            end.style.top = (H / 2 + portraitY - end.offsetHeight / 2) + 'px';
        } else {
            end.style.left = '';
            end.style.top = (HEADER + PHONE_H * endScale + 18) + 'px';
        }
        // formas da parede posicionadas em volta do celular parado no final
        const pw = PHONE_W * endScale, ph = PHONE_H * endScale, cx = W / 2 + endX, cy = H / 2 + endY;
        blob.style.width = pw * 1.9 + 'px';
        blob.style.height = (wide ? H : ph * 1.35) + 'px';
        blob.style.left = cx - pw * 0.95 + 'px';
        blob.style.top = (wide ? 0 : cy - ph * 0.675) + 'px';
        tongue.style.width = cx + pw * 0.62 + 'px';
        // o celular fica um pouco acima da base da faixa marrom, como a foto do Sobre
        const th = Math.max(40, ph * 0.11);
        tongue.style.height = th + 'px';
        tongue.style.top = cy + ph / 2 - th * 0.55 + 'px';
    }

    // a seção tem 560 telas de altura; a rolagem do perfil foi encurtada (de 243 para 163) e o resto mantém o ritmo
    function timeline(p) {
        const v = p * 560;
        const old = v <= 51.2 ? v : v <= 214.4 ? 51.2 + (v - 51.2) * (243.2 / 163.2) : v + 80;
        return old / 640;
    }

    function render(p) {
        p = timeline(p);
        const rise = smooth(part(p, 0, 0.08));
        const turn = smooth(part(p, 0.74, 0.86));
        const y = mix(H * 0.72, portraitY, rise);
        phone.style.transform = 'translate(-50%,-50%) translate(' + (endX * turn) + 'px,' + mix(y, endY, turn) + 'px) scale(' + mix(portrait, endScale, turn) + ')';

        head.style.opacity = 1 - smooth(part(p, 0.06, 0.12)) * 0.82 - smooth(part(p, 0.62, 0.72)) * 0.18;
        head.style.transform = 'translateY(' + (-14 * rise) + 'px)';

        // o perfil do Instagram rola junto com o scroll; a barra do nome fica fixa e as abas grudam embaixo dela
        const off = part(p, SCRUB[0], SCRUB[1]) * IG_END;
        igPage.style.transform = 'translate3d(0,' + (-off * K).toFixed(2) + 'px,0)';
        igTabs.style.transform = 'translate3d(0,' + (Math.max(IG_BAR, IG_TABS - off) * K).toFixed(2) + 'px,0)';
        igBarScroll.style.opacity = clamp(off / 200);

        // toque na miniatura do reel
        const tp = part(p, TAP[0], TAP[1]);
        const pressed = Math.sin(Math.PI * part(tp, 0.4, 0.85));
        const cx = TILE.x + TILE.w * 0.45, cy = TILE.y + TILE.h * 0.5;
        Object.assign(tile.style, { left: TILE.x + 'px', top: TILE.y + 'px', width: TILE.w + 'px', height: TILE.h + 'px', opacity: pressed });

        // dedo arrastando de baixo para cima para trocar de reel
        const sp = part(p, SWIPE[0], SWIPE[1]);
        const drag = smooth(part(sp, 0.15, 0.85));
        if (tp > 0 && tp < 1) {
            touch.style.opacity = Math.min(1, Math.sin(Math.PI * tp) * 2.5);
            touch.style.transform = 'translate(' + (cx - (1 - tp) * 60) + 'px,' + (cy + (1 - tp) * 120) + 'px) scale(' + (1 - pressed * 0.28) + ')';
        } else if (sp > 0 && sp < 1) {
            touch.style.opacity = Math.min(1, Math.sin(Math.PI * sp) * 2.5);
            touch.style.transform = 'translate(' + SCREEN_W / 2 + 'px,' + mix(SCREEN_H * 0.78, SCREEN_H * 0.22, drag) + 'px) scale(0.85)';
        } else {
            touch.style.opacity = 0;
        }
        reels[0].style.transform = 'translate3d(0,' + (-drag * 100) + '%,0)';
        reels[1].style.transform = 'translate3d(0,' + ((1 - drag) * 100) + '%,0)';
        if (visible && !reduced) {
            setPlaying(reels[0], p >= OPEN[1] - 0.004 && p < SWIPE[1]);
            if (p < OPEN[0] && reels[0].currentTime > 0) reels[0].currentTime = 0;
            setPlaying(reels[1], p > SWIPE[0]);
        }

        // o primeiro reel abre a partir do quadradinho até ocupar a tela
        const op = smooth(part(p, OPEN[0], OPEN[1]));
        Object.assign(photo.style, {
            left: mix(TILE.x, 0, op) + 'px', top: mix(TILE.y, 0, op) + 'px',
            width: mix(TILE.w, SCREEN_W, op) + 'px', height: mix(TILE.h, SCREEN_H, op) + 'px',
            opacity: p >= OPEN[0] ? 1 : 0
        });
        const vs = mix(CROP_S, 1, op);
        reels.forEach((v) => Object.assign(v.style, {
            width: SCREEN_W * vs + 'px', height: SCREEN_H * vs + 'px',
            left: mix(-CROP.x * SCREEN_W * CROP_S, 0, op) + 'px', top: mix(-CROP.y * SCREEN_H * CROP_S, 0, op) + 'px'
        }));

        [[0.125, 0.3], [0.3, 0.52], [0.52, 0.7]].forEach(([a, b], i) => {
            if (!notes[i]) return;
            const t = smooth(part(p, a, a + 0.04)) * (1 - smooth(part(p, b - 0.04, b)));
            notes[i].style.opacity = t;
            notes[i].style.transform = 'translateY(calc(-50% + ' + (20 * (1 - t)) + 'px))';
        });

        const heat = smooth(part(p, 0.76, 0.86));
        warm.style.opacity = heat;
        blob.style.transform = 'scale(' + mix(0.9, 1, heat) + ')';
        tongue.style.transform = 'translateX(' + (-100 * (1 - smooth(part(p, 0.8, 0.9)))) + '%)';
        const isWarm = heat > 0.5;
        if (section.dataset.warm !== String(isWarm)) {
            section.dataset.warm = String(isWarm);
            window.dispatchEvent(new Event('lz:navcheck'));
        }

        const finish = smooth(part(p, 0.88, 0.95));
        end.style.opacity = finish;
        end.style.transform = 'translateY(' + (18 * (1 - finish)) + 'px)';
        end.classList.toggle('is-on', finish > 0.6);
    }

    function setPlaying(video, on) {
        if (on && video.paused) { const r = video.play(); if (r) r.catch(() => {}); }
        else if (!on && !video.paused) video.pause();
    }

    function readScroll() {
        const box = section.getBoundingClientRect();
        target = clamp(-box.top / Math.max(1, box.height - H));
        if (!frame) frame = requestAnimationFrame(tick);
    }

    function tick() {
        frame = 0;
        current = current < 0 ? target : current + (target - current) * 0.14;
        if (Math.abs(target - current) < 0.0004) current = target;
        render(current);
        if (current !== target) frame = requestAnimationFrame(tick);
    }

    function loadVideos() {
        if (igPage.loading === 'lazy') igPage.loading = 'eager';
        reels.forEach((v) => { if (!v.src) { v.src = v.dataset.src; v.preload = 'auto'; } });
    }

    function refresh() {
        measure();
        // com "reduzir movimento" a cena fica parada no quadro final, sem seguir a rolagem
        if (reduced) { render(1); return; }
        current = -1; readScroll();
    }

    measure();
    window.addEventListener('resize', refresh);
    window.addEventListener('load', refresh);
    document.fonts && document.fonts.ready.then(refresh);
    section.querySelectorAll('img').forEach((img) => img.addEventListener('load', measure));

    if (reduced) {
        section.classList.add('ps-static');
        loadVideos();
        refresh();
        return;
    }

    new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) loadVideos();
    }, { rootMargin: '100% 0px' }).observe(section);

    new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible) { current = -1; readScroll(); }
        else reels.forEach((v) => v.pause());
    }).observe(section);

    document.addEventListener('scroll', readScroll, { passive: true, capture: true });
    readScroll();
})();

// --- MENU TRANSPARENTE: usa texto escuro quando passa sobre uma seção clara ---
(function () {
    const navbar = document.getElementById('navbar');
    let waiting = false;

    function sectionColor(node) {
        for (; node; node = node.parentElement) {
            const rgba = getComputedStyle(node).backgroundColor.match(/[\d.]+/g).map(Number);
            if (rgba.length < 4 || rgba[3] > 0.5) return rgba;
        }
        return [0, 0, 0];
    }

    function colorAt(y) {
        const under = document.elementsFromPoint(window.innerWidth / 2, y)
            .find((el) => !navbar.contains(el));
        if (!under) return null;
        if (under === document.documentElement || under === document.body) return y > 20 ? colorAt(y - 16) : null;
        const block = under.closest('section, footer') || under;
        return block.dataset.warm === 'true' ? [185, 80, 45] : sectionColor(block);
    }

    function update() {
        waiting = false;
        const top = colorAt(navbar.offsetHeight / 2);
        if (!top) return;
        const [r, g, b] = top;
        navbar.classList.toggle('nav-on-light', 0.299 * r + 0.587 * g + 0.114 * b > 150);
        // sobre terracota a logo terracota sumiria, então ela fica off-white
        navbar.classList.toggle('nav-on-warm', r > 150 && g < 120 && b < 90);
    }

    function schedule() {
        if (waiting) return;
        waiting = true;
        requestAnimationFrame(update);
    }

    document.addEventListener('scroll', schedule, { passive: true, capture: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule);
    window.addEventListener('lz:navcheck', schedule);
    schedule();
})();


// --- ABERTURA: contador de tempo do visor, no formato HH:MM:SS:quadros ---
(function () {
    const time = document.querySelector('.vf-time');
    if (!time) return;
    const start = performance.now();
    const pad = (n) => String(n).padStart(2, '0');
    let timer = 0, onScreen = true;
    function tick() {
        const frames = Math.floor((performance.now() - start) / (1000 / 30));
        const seconds = Math.floor(frames / 30);
        time.textContent = pad(Math.floor(seconds / 3600)) + ':' + pad(Math.floor(seconds / 60) % 60) + ':' + pad(seconds % 60) + ':' + pad(frames % 30);
    }
    // o relógio só roda enquanto a abertura está na tela e a aba está aberta, para não gastar bateria
    function sync() {
        const run = onScreen && !document.hidden;
        if (run && !timer) timer = setInterval(tick, 1000 / 30);
        else if (!run && timer) { clearInterval(timer); timer = 0; }
    }
    new IntersectionObserver((entries) => { onScreen = entries[0].isIntersecting; sync(); }).observe(time.closest('.vf-hero') || time);
    document.addEventListener('visibilitychange', sync);
    sync();
})();

// --- CONTATO FINAL: valida os campos e abre o e-mail com a mensagem pronta ---
(function () {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const status = document.getElementById('ct-status');
    const fields = [
        { el: form.querySelector('#ct-name'), ok: (v) => v.trim().length > 0 },
        { el: form.querySelector('#ct-email'), ok: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
        { el: form.querySelector('#ct-message'), ok: (v) => v.trim().length > 0 }
    ];

    function check(field) {
        const valid = field.ok(field.el.value);
        const error = document.getElementById(field.el.id + '-error');
        field.el.setAttribute('aria-invalid', valid ? 'false' : 'true');
        if (valid) field.el.removeAttribute('aria-describedby');
        else field.el.setAttribute('aria-describedby', error.id);
        error.hidden = valid;
        return valid;
    }

    fields.forEach((field) => field.el.addEventListener('blur', () => {
        if (field.el.getAttribute('aria-invalid') !== null || field.el.value) check(field);
    }));

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const invalid = fields.filter((field) => !check(field));
        if (invalid.length) { invalid[0].el.focus(); status.textContent = ''; return; }
        const [name, email, message] = fields.map((field) => field.el.value.trim());
        const subject = 'Orçamento pelo site — ' + name;
        const body = message + '\n\n' + name + '\n' + email;
        window.location.href = 'mailto:contato@lzaudiovisual.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        status.textContent = 'Abrimos o seu app de e-mail com a mensagem pronta. Se ele não abriu, escreva para contato@lzaudiovisual.com ou chame no WhatsApp.';
    });
})();
