// =============================================
// СМЛ ФАСАД — JavaScript v2
// =============================================

// !! ЗАМЕНИТЕ НА ВАШ URL ПОСЛЕ ДЕПЛОЯ Google Apps Script !!
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

document.addEventListener('DOMContentLoaded', function () {

  // ---- STICKY HEADER ----
  const header = document.getElementById('header');
  const scrollTopBtn = document.getElementById('scrollTop');

  const handleScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  // ---- BURGER MENU ----
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  burger.addEventListener('click', () => {
    const isOpen = burger.classList.toggle('open');
    nav.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  nav.querySelectorAll('.nav__link, .nav__phone-mobile').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ---- SCROLL TO TOP ----
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---- REVEAL ON SCROLL ----
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${Math.min(idx * 0.1, 0.4)}s`;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  // ---- TABS ----
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${target}`).classList.add('active');
    });
  });

  // ---- SLIDER ----
  const track = document.getElementById('sliderTrack');
  const cards = track.querySelectorAll('.review-card');
  const dotsContainer = document.getElementById('sliderDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  const isMobile = () => window.innerWidth <= 900;
  let currentSlide = 0;
  const totalCards = cards.length;
  const visibleCount = () => isMobile() ? 1 : 2;
  const maxSlide = () => totalCards - visibleCount();

  const createDots = () => {
    dotsContainer.innerHTML = '';
    const dotCount = maxSlide() + 1;
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider__dot' + (i === currentSlide ? ' active' : '');
      dot.setAttribute('aria-label', `Слайд ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  };

  const updateDots = () => {
    dotsContainer.querySelectorAll('.slider__dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  };

  const goTo = (index) => {
    currentSlide = Math.max(0, Math.min(index, maxSlide()));
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = 24;
    track.style.transform = `translateX(-${currentSlide * (cardWidth + gap)}px)`;
    updateDots();
  };

  prevBtn.addEventListener('click', () => goTo(currentSlide - 1));
  nextBtn.addEventListener('click', () => goTo(currentSlide + 1));

  // Touch/swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? goTo(currentSlide + 1) : goTo(currentSlide - 1);
    }
  });

  createDots();
  let autoplay = setInterval(() => goTo(currentSlide < maxSlide() ? currentSlide + 1 : 0), 5000);

  [prevBtn, nextBtn].forEach(btn => {
    btn.addEventListener('click', () => {
      clearInterval(autoplay);
      autoplay = setInterval(() => goTo(currentSlide < maxSlide() ? currentSlide + 1 : 0), 5000);
    });
  });

  window.addEventListener('resize', () => {
    createDots();
    goTo(Math.min(currentSlide, maxSlide()));
  });

  // ---- MODAL ----
  window.openModal = function () {
    document.getElementById('modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.closeModal = function () {
    document.getElementById('modal').classList.remove('open');
    document.body.style.overflow = '';
  };
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // ---- TOAST ----
  const showToast = (msg) => {
    const toast = document.getElementById('toast');
    if (msg) toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  };

  // ---- GOOGLE SHEETS: ОТПРАВКА ЗАЯВКИ ----
  async function sendToGoogleSheets(data) {
    try {
      const params = new URLSearchParams({
        name:    data.name    || '',
        phone:   data.phone   || '',
        message: data.message || '',
        date:    new Date().toLocaleString('ru-BY', { timeZone: 'Europe/Minsk' }),
        page:    window.location.href
      });

      // Используем no-cors mode — Google Apps Script требует этого для POST с сайта
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      return true;
    } catch (err) {
      console.error('Ошибка отправки в Google Sheets:', err);
      return false;
    }
  }

  // ---- FORM SUBMIT (основная форма) ----
  window.submitForm = async function () {
    const name    = document.getElementById('name').value.trim();
    const phone   = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!phone) {
      shakeInput('phone');
      return;
    }

    const btnText    = document.getElementById('form-btn-text');
    const btnSpinner = document.getElementById('form-btn-spinner');
    btnText.style.display    = 'none';
    btnSpinner.style.display = 'inline';

    await sendToGoogleSheets({ name, phone, message });

    btnText.style.display    = 'inline';
    btnSpinner.style.display = 'none';

    document.getElementById('name').value    = '';
    document.getElementById('phone').value   = '';
    document.getElementById('message').value = '';

    showToast('✓ Заявка принята! Мы позвоним вам скоро.');
  };

  // ---- MODAL SUBMIT ----
  window.submitModal = async function () {
    const name  = document.getElementById('modal-name').value.trim();
    const phone = document.getElementById('modal-phone').value.trim();

    if (!phone) {
      shakeInput('modal-phone');
      return;
    }

    const btnText    = document.getElementById('modal-btn-text');
    const btnSpinner = document.getElementById('modal-btn-spinner');
    btnText.style.display    = 'none';
    btnSpinner.style.display = 'inline';

    await sendToGoogleSheets({ name, phone, message: 'Заявка из модального окна' });

    btnText.style.display    = 'inline';
    btnSpinner.style.display = 'none';

    document.getElementById('modal-name').value  = '';
    document.getElementById('modal-phone').value = '';
    closeModal();
    showToast('✓ Заявка принята! Мы позвоним вам скоро.');
  };

  // ---- SHAKE ANIMATION FOR INVALID INPUT ----
  function shakeInput(id) {
    const input = document.getElementById(id);
    if (!input) return;
    input.focus();
    input.style.borderColor = '#ff3333';
    input.style.animation = 'shake 0.4s ease';
    setTimeout(() => {
      input.style.borderColor = '';
      input.style.animation = '';
    }, 1500);
  }

  // Добавляем CSS-анимацию shake динамически
  if (!document.getElementById('shake-style')) {
    const style = document.createElement('style');
    style.id = 'shake-style';
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%       { transform: translateX(-6px); }
        40%       { transform: translateX(6px); }
        60%       { transform: translateX(-4px); }
        80%       { transform: translateX(4px); }
      }
    `;
    document.head.appendChild(style);
  }

  // ---- SMOOTH SCROLL ----
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = header.offsetHeight + 20;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---- PHONE INPUT FORMATTING (Беларусь) ----
  ['phone', 'modal-phone'].forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('input', function () {
      let val = this.value.replace(/\D/g, '');
      if (val.length === 0) { this.value = ''; return; }
      if (val.startsWith('375')) {
        val = '+' + val;
      } else if (val.startsWith('80') || val.startsWith('8')) {
        val = '+375' + val.slice(1);
      } else if (val.startsWith('0')) {
        val = '+375' + val.slice(1);
      } else if (!val.startsWith('+')) {
        val = '+375' + val;
      }
      this.value = val;
    });
  });

  // ---- LAZY LOAD IMAGES ----
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
    });
  } else {
    // Fallback для браузеров без нативного lazy load
    const lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) { img.src = img.dataset.src; }
          lazyObserver.unobserve(img);
        }
      });
    });
    document.querySelectorAll('img[data-src]').forEach(img => lazyObserver.observe(img));
  }

  // ---- INITIAL SCROLL CHECK ----
  handleScroll();
});
