const videos = {
  career: [
    'RbvyP4rAztI','1-mYiR7pf9w','1-AamFg9Ec0','AYt51e6CFGQ','20gsaP4pdyU','ykB0xlwyrI0','zoIM20d8UJg','Lur6-KlYQJs','ebcSO8yqNE4','HL7BXv-Bbj4','FT4amJ27GhY','YVALZIvFaYQ'
  ],
  government: [
    'jIcF7466T6I','2ZA2BZFhfMw','uIkFXWzte_A','E8FaNidJk0M','VzOBUxtWfVQ','hsXB-8jqJBc','6G_PjJe6Uj8','hB43fMbPjas','6h2Fk-1vHjY','BYMG9D78wFY','0-A1etpV0aQ','jikRMGSmEzk'
  ],
  lactose: [
    'NkX-TXkY2is','T_YuJUF0lvk','jGim409GMiM','JeCScQZ_t-s','QNJpDI7_McI','C_7ISX6kDpU','g6WXzRk6aak','J-T5FKLnCdg','A-DmDrm361s','kHSUZUUSh3c','s5jUyGT_uBU'
  ]
};

const labels = { career: 'CareerKaptain', government: 'Govt. Jobs', lactose: 'Lactose' };

Object.entries(videos).forEach(([group, ids]) => {
  const rail = document.getElementById(group);
  rail.innerHTML = ids.map((id, index) => {
    const url = group === 'lactose' ? `https://www.youtube.com/watch?v=${id}` : `https://www.youtube.com/shorts/${id}`;
    const type = group === 'lactose' ? 'Full video' : 'Short';
    return `<article class="video-card">
      <button class="video-preview" type="button" data-video-id="${id}" data-video-url="${url}" data-video-format="${group === 'lactose' ? 'landscape' : 'portrait'}" data-video-title="${labels[group]} video ${index + 1}" aria-label="Play ${labels[group]} video ${index + 1} here">
        <span class="thumb">
          <img src="https://i.ytimg.com/vi/${id}/maxresdefault.jpg" data-fallback="https://i.ytimg.com/vi/${id}/sddefault.jpg" alt="${labels[group]} video ${String(index + 1).padStart(2, '0')} thumbnail" loading="lazy" decoding="async" />
          <span class="play" aria-hidden="true">▶</span>
        </span>
      </button>
      <div class="video-meta"><strong>${String(index + 1).padStart(2, '0')}</strong><a href="${url}" target="_blank" rel="noreferrer" aria-label="Open ${labels[group]} video ${index + 1} on YouTube">${type} ↗</a></div>
    </article>`;
  }).join('');
});

document.querySelectorAll('.video-card img[data-fallback]').forEach(image => {
  image.addEventListener('error', () => {
    if (!image.dataset.fallback) return;
    image.src = image.dataset.fallback;
    delete image.dataset.fallback;
  });
});

const videoModal = document.getElementById('video-modal');
const videoFrame = document.getElementById('video-frame');
const videoModalTitle = document.getElementById('video-modal-title');
const modalYouTubeLink = document.getElementById('modal-youtube-link');

function stopVideo() {
  videoFrame.src = '';
}

document.querySelectorAll('.video-preview').forEach(button => {
  button.addEventListener('click', () => {
    videoFrame.src = `https://www.youtube-nocookie.com/embed/${button.dataset.videoId}?autoplay=1&rel=0&playsinline=1`;
    videoFrame.title = `${button.dataset.videoTitle} embedded player`;
    videoModalTitle.textContent = button.dataset.videoTitle;
    modalYouTubeLink.href = button.dataset.videoUrl;
    videoModal.classList.toggle('portrait', button.dataset.videoFormat === 'portrait');
    videoModal.showModal();
  });
});

videoModal.querySelector('.modal-close').addEventListener('click', () => videoModal.close());
videoModal.addEventListener('click', event => {
  if (event.target === videoModal) videoModal.close();
});
videoModal.addEventListener('close', stopVideo);

document.querySelectorAll('.split-text').forEach(element => {
  const nodes = [...element.childNodes];
  nodes.forEach(node => {
    if (node.nodeType !== Node.TEXT_NODE) return;
    const fragment = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach(part => {
      if (!part.trim()) return fragment.appendChild(document.createTextNode(part));
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = part;
      span.style.transitionDelay = `${element.querySelectorAll('.word').length * 45}ms`;
      fragment.appendChild(span);
    });
    node.replaceWith(fragment);
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    if (entry.target.classList.contains('mini-stats')) runCounters(entry.target);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.14, rootMargin: '0px 0px -5% 0px' });

document.querySelectorAll('.reveal, .split-text, .mini-stats').forEach(item => observer.observe(item));

function runCounters(container) {
  container.querySelectorAll('[data-count]').forEach(counter => {
    const target = Number.parseFloat(counter.dataset.count);
    const suffix = counter.dataset.suffix || '';
    if (!Number.isFinite(target)) {
      counter.textContent = counter.dataset.count;
      return;
    }
    const decimals = Number.isInteger(target) ? 0 : 1;
    const start = performance.now();
    const tick = now => {
      const progress = Math.min((now - start) / 1100, 1);
      const value = target * (1 - Math.pow(1 - progress, 3));
      counter.textContent = `${value.toFixed(decimals)}${progress === 1 ? suffix : ''}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

const progressBar = document.querySelector('.scroll-progress span');
const parallaxItems = [...document.querySelectorAll('.parallax')];
let ticking = false;

function updateOnScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.transform = `scaleX(${max ? scrollY / max : 0})`;
  const allowParallax = innerWidth > 900 && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (allowParallax) {
    parallaxItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      const speed = Number(item.dataset.speed || 0);
      const offset = (innerHeight / 2 - (rect.top + rect.height / 2)) * speed;
      item.style.translate = `0 ${offset}px`;
    });
  } else {
    parallaxItems.forEach(item => { item.style.translate = 'none'; });
  }
  ticking = false;
}

addEventListener('scroll', () => {
  if (!ticking) requestAnimationFrame(updateOnScroll);
  ticking = true;
}, { passive: true });
addEventListener('resize', updateOnScroll, { passive: true });
updateOnScroll();

document.querySelectorAll('[data-rail]').forEach(button => {
  button.addEventListener('click', () => {
    const rail = document.getElementById(button.dataset.rail);
    rail.scrollBy({ left: rail.clientWidth * 0.72 * Number(button.dataset.dir), behavior: 'smooth' });
  });
});

if (matchMedia('(pointer: fine)').matches) {
  const cursor = document.querySelector('.cursor');
  addEventListener('pointermove', event => {
    const suppress = Boolean(event.target.closest('img, .video-card'));
    cursor.classList.toggle('suppressed', suppress);
    cursor.style.opacity = suppress ? '0' : '1';
    cursor.style.transform = `translate(${event.clientX - 9}px, ${event.clientY - 9}px)`;
  });
  document.querySelectorAll('a, button:not(.video-preview), .capability-cloud span').forEach(target => {
    target.addEventListener('pointerenter', () => cursor.classList.add('active'));
    target.addEventListener('pointerleave', () => cursor.classList.remove('active'));
  });
}
