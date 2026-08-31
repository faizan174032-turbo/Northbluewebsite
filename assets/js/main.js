(function () {
  'use strict';

  /* Header scroll state */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
    var toTop = document.querySelector('.to-top');
    if (toTop) toTop.classList.toggle('is-visible', window.scrollY > 600);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile nav */
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (navToggle && mobileNav) {
    var closeEls = mobileNav.querySelectorAll('[data-close-nav]');
    function openNav() {
      mobileNav.classList.add('is-open');
      navToggle.classList.add('is-active');
      navToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeNav() {
      mobileNav.classList.remove('is-open');
      navToggle.classList.remove('is-active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    navToggle.addEventListener('click', function () {
      mobileNav.classList.contains('is-open') ? closeNav() : openNav();
    });
    closeEls.forEach(function (el) { el.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    revealEls.forEach(function (el, i) {
      var group = el.closest('[data-reveal-group]');
      if (group) el.style.setProperty('--i', i % 8);
    });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* FAQ accordions */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      item.closest('.faq-list').querySelectorAll('.faq-item').forEach(function (other) {
        other.classList.remove('is-open');
        var btn = other.querySelector('.faq-q');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* Animated stat counters */
  var counters = document.querySelectorAll('[data-count-to]');
  if ('IntersectionObserver' in window && counters.length) {
    var counterIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var target = parseFloat(el.getAttribute('data-count-to'));
          var suffix = el.getAttribute('data-suffix') || '';
          var prefix = el.getAttribute('data-prefix') || '';
          var duration = 1400;
          var start = null;
          function step(ts) {
            if (!start) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var val = (target * eased);
            el.textContent = prefix + (target % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          counterIO.unobserve(el);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { counterIO.observe(el); });
  }

  /* Contact / quote forms: front-end validation + friendly submit state (backend to be wired on WordPress) */
  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var honeypot = form.querySelector('.form-honeypot input');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (honeypot && honeypot.value) return; // bot trap, silently drop

      var valid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        var value = (field.value || '').trim();
        var wrapper = field.closest('.field');
        if (!value || (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) {
          valid = false;
          if (wrapper) wrapper.querySelector('input,select,textarea').style.borderColor = '#e35a44';
        } else if (wrapper) {
          wrapper.querySelector('input,select,textarea').style.borderColor = '';
        }
      });

      if (!status) return;
      status.classList.remove('is-success', 'is-error');
      if (!valid) {
        status.textContent = 'Please fill in the required fields correctly before sending.';
        status.classList.add('is-error');
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.textContent = 'Sending…'; submitBtn.disabled = true; }

      setTimeout(function () {
        status.textContent = "Thanks — that's through to NorthBlue. Expect a reply within 1 business day.";
        status.classList.add('is-success');
        form.reset();
        if (submitBtn) { submitBtn.textContent = originalText; submitBtn.disabled = false; }
      }, 700);
    });
  });

  /* Radio pill accessible state */
  document.querySelectorAll('.radio-pill input').forEach(function (input) {
    input.addEventListener('change', function () {
      document.querySelectorAll('input[name="' + input.name + '"]').forEach(function (i) {
        i.closest('.radio-pill').setAttribute('aria-pressed', i.checked ? 'true' : 'false');
      });
    });
  });

  /* Hero blob mouse parallax */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduceMotion && canHover) {
    document.querySelectorAll('.hero').forEach(function (hero) {
      hero.addEventListener('mousemove', function (e) {
        var rect = hero.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        var y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        hero.style.setProperty('--px', (x * 18).toFixed(1));
        hero.style.setProperty('--py', (y * 18).toFixed(1));
      });
      hero.addEventListener('mouseleave', function () {
        hero.style.setProperty('--px', 0);
        hero.style.setProperty('--py', 0);
      });
    });
  }

  /* Inquiry modal */
  var inquiryModal = document.querySelector('.inquiry-modal');
  if (inquiryModal) {
    var openInquiryEls = document.querySelectorAll('[data-open-inquiry]');
    var closeInquiryEls = inquiryModal.querySelectorAll('[data-close-inquiry]');
    function openInquiry(e) {
      if (e) e.preventDefault();
      inquiryModal.classList.add('is-open');
      inquiryModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      var firstField = inquiryModal.querySelector('input,textarea');
      if (firstField) firstField.focus({ preventScroll: true });
    }
    function closeInquiry() {
      inquiryModal.classList.remove('is-open');
      inquiryModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    openInquiryEls.forEach(function (el) { el.addEventListener('click', openInquiry); });
    closeInquiryEls.forEach(function (el) { el.addEventListener('click', closeInquiry); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeInquiry();
    });
  }

  /* Back to top */
  var toTopBtn = document.querySelector('.to-top');
  if (toTopBtn) {
    toTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* Current year */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
