function initFooterObserver() {
    const sentinel = document.getElementById('footer-sentinel');
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            document.body.classList.toggle('footer-visible', e.isIntersecting);
        });
    }, { root: null, threshold: 0 });
    obs.observe(sentinel);
}

function showGuide() {
    const modal = document.getElementById('guide-modal');
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function hideGuide() {
    const modal = document.getElementById('guide-modal');
    modal.classList.remove('visible');
    document.body.style.overflow = 'auto';
}

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('nav-toggle');
  const menu   = document.querySelector('.nav-menu');

  toggle.addEventListener('click', () => {
    menu.classList.toggle('active');
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('active');
    });
  });
});
