/* ================================================================
   CODLY INDIA — Global JavaScript v2.0
   Handles: Scroll animations, dark mode, accordion, tabs,
            tech stack tabs, scroll progress, WhatsApp CTA,
            counter animations, mobile menu, cookie banner
   ================================================================ */

(function () {
  'use strict';

  /* ============================================================
     1. SCROLL PROGRESS BAR
     ============================================================ */
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ============================================================
     2. NAVBAR — Scroll Glass Effect + Active Link
     ============================================================ */
  const nav = document.querySelector('nav');
  if (nav) {
    nav.classList.add('navbar-glass');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // Active nav link based on current path
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link, nav a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || (href !== '/' && currentPath.startsWith(href)))) {
      link.classList.add('active');
    }
  });

  /* ============================================================
     3. MOBILE MENU TOGGLE
     ============================================================ */
  const mobileBtn  = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen   = document.getElementById('menu-icon-open');
  const iconClose  = document.getElementById('menu-icon-close');

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      iconOpen?.classList.toggle('hidden');
      iconClose?.classList.toggle('hidden');
    });
  }

  /* ============================================================
     4. DARK MODE TOGGLE
     ============================================================ */
  function setDark(on) {
    document.documentElement.classList.toggle('dark', on);
    document.documentElement.setAttribute('data-theme', on ? 'dark' : 'light');
    // Persist via cookie (readable by PHP)
    document.cookie = `codly_dark=${on ? '1' : '0'};path=/;max-age=31536000`;
    const btn = document.getElementById('dark-toggle');
    if (btn) {
      btn.innerHTML = on
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
    }
  }

  const darkToggle = document.getElementById('dark-toggle');
  if (darkToggle) {
    const isDark = document.documentElement.classList.contains('dark');
    setDark(isDark); // Sync icon
    darkToggle.addEventListener('click', () => {
      setDark(!document.documentElement.classList.contains('dark'));
    });
  }

  /* ============================================================
     5. SCROLL-TRIGGERED REVEAL ANIMATIONS (IntersectionObserver)
     ============================================================ */
  const revealClasses = ['.reveal', '.reveal-left', '.reveal-right', '.reveal-scale'];
  const allReveal = document.querySelectorAll(revealClasses.join(','));
  const allStagger = document.querySelectorAll('.stagger');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    allReveal.forEach(el => revealObserver.observe(el));
    allStagger.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: show all immediately
    allReveal.forEach(el => el.classList.add('revealed'));
    allStagger.forEach(el => el.classList.add('revealed'));
  }

  /* ============================================================
     6. ANIMATED NUMBER COUNTERS
     ============================================================ */
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target') || el.innerText.replace(/[^0-9]/g, ''), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = parseInt(el.getAttribute('data-duration') || '2000', 10);
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = prefix + current.toLocaleString('en-IN') + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target.toLocaleString('en-IN') + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = '1';
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }

  /* ============================================================
     7. TYPEWRITER EFFECT
     ============================================================ */
  function typewriter(el) {
    const texts = JSON.parse(el.getAttribute('data-texts') || '[]');
    if (!texts.length) return;
    let i = 0, charIdx = 0, isDeleting = false;
    const speed = { type: 80, delete: 50, pause: 2000 };

    function type() {
      const current = texts[i];
      const displayed = isDeleting
        ? current.substring(0, charIdx--)
        : current.substring(0, charIdx++);

      el.textContent = displayed;

      if (!isDeleting && charIdx > current.length) {
        isDeleting = true;
        setTimeout(type, speed.pause);
        return;
      }
      if (isDeleting && charIdx < 0) {
        isDeleting = false;
        i = (i + 1) % texts.length;
        charIdx = 0;
      }
      setTimeout(type, isDeleting ? speed.delete : speed.type);
    }
    type();
  }

  document.querySelectorAll('[data-typewriter]').forEach(typewriter);

  /* ============================================================
     8. ACCORDION (FAQ) — Smooth Max-Height Animation
     ============================================================ */
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      const targetId = this.getAttribute('aria-controls');
      const content  = targetId ? document.getElementById(targetId) : this.nextElementSibling;

      // Close all siblings
      const parent = this.closest('.space-y-3, #faq-accordion, [data-accordion]');
      if (parent) {
        parent.querySelectorAll('.accordion-trigger').forEach(t => {
          if (t !== this) {
            t.setAttribute('aria-expanded', 'false');
            const sid = t.getAttribute('aria-controls');
            const sib = sid ? document.getElementById(sid) : t.nextElementSibling;
            if (sib) {
              sib.classList.remove('open');
              sib.classList.add('hidden');
            }
          }
        });
      }

      if (content) {
        if (expanded) {
          this.setAttribute('aria-expanded', 'false');
          content.classList.remove('open');
          content.classList.add('hidden');
        } else {
          this.setAttribute('aria-expanded', 'true');
          content.classList.remove('hidden');
          content.classList.add('open');
        }
      }
    });
  });

  /* ============================================================
     9. TECH STACK TABS
     ============================================================ */
  const techData = {
    Frontend:  [
      { name: 'React',      icon: '⚛️' },
      { name: 'Next.js',    icon: '▲' },
      { name: 'Vue.js',     icon: '💚' },
      { name: 'TypeScript', icon: '🔷' },
      { name: 'TailwindCSS',icon: '🌊' },
      { name: 'Flutter Web',icon: '🐦' },
    ],
    Backend:   [
      { name: 'Node.js',    icon: '🟩' },
      { name: 'PHP',        icon: '🐘' },
      { name: 'Laravel',    icon: '🔴' },
      { name: 'Python',     icon: '🐍' },
      { name: 'FastAPI',    icon: '⚡' },
      { name: 'Express.js', icon: '🚂' },
    ],
    AI:        [
      { name: 'OpenAI GPT', icon: '🤖' },
      { name: 'Gemini',     icon: '💎' },
      { name: 'LangChain',  icon: '🔗' },
      { name: 'TensorFlow', icon: '🧠' },
      { name: 'Whisper',    icon: '🎙️' },
      { name: 'Claude AI',  icon: '🌀' },
    ],
    Mobile:    [
      { name: 'Android',    icon: '🤖' },
      { name: 'iOS (Swift)',icon: '🍎' },
      { name: 'Flutter',    icon: '🐦' },
      { name: 'React Native',icon: '📱' },
      { name: 'Kotlin',     icon: '🎯' },
      { name: 'Xcode',      icon: '🔨' },
    ],
    DevOps:    [
      { name: 'Docker',     icon: '🐳' },
      { name: 'GitHub Actions',icon: '⚙️' },
      { name: 'Nginx',      icon: '🌐' },
      { name: 'Linux',      icon: '🐧' },
      { name: 'Redis',      icon: '🔴' },
      { name: 'MySQL',      icon: '🐬' },
    ],
    Cloud:     [
      { name: 'AWS',        icon: '☁️' },
      { name: 'Google Cloud',icon: '🔵' },
      { name: 'Firebase',   icon: '🔥' },
      { name: 'Cloudflare', icon: '🛡️' },
      { name: 'Vercel',     icon: '▲' },
      { name: 'Hostinger',  icon: '💜' },
    ],
  };

  function renderTech(category) {
    const container = document.getElementById('tech-content');
    if (!container) return;
    const items = techData[category] || [];
    container.innerHTML = items.map(item => `
      <div class="feature-card flex flex-col items-center gap-3 py-5 text-center reveal">
        <span class="text-3xl leading-none">${item.icon}</span>
        <span class="text-sm font-semibold" style="color:var(--foreground)">${item.name}</span>
      </div>
    `).join('');

    // Re-observe new elements
    const newReveal = container.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      newReveal.forEach((el, i) => {
        el.style.transitionDelay = (i * 60) + 'ms';
        setTimeout(() => el.classList.add('revealed'), i * 60 + 50);
      });
    } else {
      newReveal.forEach(el => el.classList.add('revealed'));
    }
  }

  const techTabs = document.getElementById('tech-tabs');
  if (techTabs) {
    techTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.tech-tab-btn');
      if (!btn) return;
      techTabs.querySelectorAll('.tech-tab-btn').forEach(b => {
        b.className = 'tech-tab-btn tab-btn';
      });
      btn.className = 'tech-tab-btn tab-btn active';
      renderTech(btn.dataset.target);
    });
    // Initial render
    renderTech('Frontend');
    const firstBtn = techTabs.querySelector('.tech-tab-btn');
    if (firstBtn) firstBtn.className = 'tech-tab-btn tab-btn active';
  }

  /* ============================================================
     10. COOKIE CONSENT BANNER
     ============================================================ */
  const cookieBanner = document.getElementById('cookie-banner');
  const cookieAccept = document.getElementById('cookie-accept');
  const cookieDecline= document.getElementById('cookie-decline');

  if (cookieBanner && !document.cookie.includes('codly_cookie_ok')) {
    setTimeout(() => cookieBanner.classList.add('visible'), 1500);
  }
  cookieAccept?.addEventListener('click', () => {
    document.cookie = 'codly_cookie_ok=1;path=/;max-age=31536000';
    cookieBanner?.classList.remove('visible');
  });
  cookieDecline?.addEventListener('click', () => {
    document.cookie = 'codly_cookie_ok=0;path=/;max-age=31536000';
    cookieBanner?.classList.remove('visible');
  });

  /* ============================================================
     11. SMOOTH ANCHOR SCROLL
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80; // navbar height
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        // Close mobile menu if open
        mobileMenu?.classList.add('hidden');
        iconOpen?.classList.remove('hidden');
        iconClose?.classList.add('hidden');
      }
    });
  });

  /* ============================================================
     12. TESTIMONIAL AUTO-CAROUSEL (if applicable)
     ============================================================ */
  function initCarousel(wrapper) {
    if (!wrapper) return;
    const slides = wrapper.querySelectorAll('[data-slide]');
    const dots = wrapper.querySelectorAll('[data-dot]');
    if (slides.length < 2) return;

    let current = 0;
    let interval;

    function goTo(n) {
      slides[current].classList.add('hidden');
      dots[current]?.classList.remove('active');
      current = (n + slides.length) % slides.length;
      slides[current].classList.remove('hidden');
      dots[current]?.classList.add('active');
    }

    function start() {
      interval = setInterval(() => goTo(current + 1), 5000);
    }
    function stop() { clearInterval(interval); }

    // Init
    slides.forEach((s, i) => i !== 0 && s.classList.add('hidden'));
    dots[0]?.classList.add('active');
    start();

    wrapper.querySelector('[data-prev]')?.addEventListener('click', () => { stop(); goTo(current - 1); start(); });
    wrapper.querySelector('[data-next]')?.addEventListener('click', () => { stop(); goTo(current + 1); start(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { stop(); goTo(i); start(); }));

    // Pause on hover
    wrapper.addEventListener('mouseenter', stop);
    wrapper.addEventListener('mouseleave', start);
  }

  document.querySelectorAll('[data-carousel]').forEach(initCarousel);

  /* ============================================================
     13. GENERIC TAB SWITCHER
     ============================================================ */
  document.querySelectorAll('[data-tab-group]').forEach(group => {
    const tabs = group.querySelectorAll('[data-tab]');
    const panels = group.querySelectorAll('[data-panel]');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => {
          p.classList.toggle('hidden', p.dataset.panel !== target);
        });
        tab.classList.add('active');
      });
    });
  });

  /* ============================================================
     14. FORM VALIDATION HELPERS
     ============================================================ */
  function showError(input, msg) {
    input.classList.add('error');
    let err = input.parentElement.querySelector('.form-error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'form-error text-xs mt-1';
      err.style.color = '#EF4444';
      input.parentElement.appendChild(err);
    }
    err.textContent = msg;
  }
  function clearError(input) {
    input.classList.remove('error');
    input.parentElement.querySelector('.form-error')?.remove();
  }

  // Attach live validation
  document.querySelectorAll('.form-input[required]').forEach(input => {
    input.addEventListener('blur', () => {
      if (!input.value.trim()) {
        showError(input, 'This field is required.');
      } else {
        clearError(input);
      }
    });
    input.addEventListener('input', () => clearError(input));
  });

  /* ============================================================
     15. PRELOADER (optional — add #preloader div to show)
     ============================================================ */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.style.opacity = '0';
      preloader.style.transition = 'opacity 0.4s ease';
      setTimeout(() => preloader.remove(), 400);
    });
  }

  /* ============================================================
     16. LAZY LOAD IMAGES (polyfill for older browsers)
     ============================================================ */
  if (!('loading' in HTMLImageElement.prototype)) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
      const imgObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src || img.src;
            imgObserver.unobserve(img);
          }
        });
      });
      lazyImages.forEach(img => imgObserver.observe(img));
    }
  }

  /* ============================================================
     17. WHATSAPP FLOAT PULSE (auto-expand hint)
     ============================================================ */
  const waFloat = document.querySelector('.whatsapp-float');
  if (waFloat) {
    // Expand the label briefly after 3 seconds
    setTimeout(() => {
      waFloat.style.padding = '0.875rem 1.5rem';
      const text = waFloat.querySelector('.wa-text');
      if (text) {
        text.style.display = 'block';
        text.style.animation = 'fadeIn 0.3s ease';
      }
    }, 3000);
  }

  /* ============================================================
     18. BACK TO TOP BUTTON
     ============================================================ */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('opacity-100', window.scrollY > 500);
      backToTop.classList.toggle('opacity-0', window.scrollY <= 500);
    }, { passive: true });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }


  /* ============================================================
     19. MAGNETIC HOVER EFFECT — Service / Feature cards
     ============================================================ */
  function initMagnetic(el) {
    const strength = parseFloat(el.dataset.magnetic || '0.35');
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      el.style.transform = `translate(${dx}px,${dy}px) scale(1.04)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      el.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      setTimeout(() => { el.style.transition = ''; }, 500);
    });
    el.addEventListener('mouseenter', () => {
      el.style.transition = 'transform 0.12s ease-out';
    });
  }
  // Apply to elements with data-magnetic
  document.querySelectorAll('[data-magnetic]').forEach(initMagnetic);

  /* ============================================================
     20. HERO PARALLAX — Mouse-driven depth
     ============================================================ */
  const heroSection = document.getElementById('home');
  const heroOrbs    = heroSection ? heroSection.querySelectorAll('.glow-orb') : [];
  const heroFloats  = heroSection ? heroSection.querySelectorAll('.product-card-float') : [];
  if (heroSection && window.matchMedia('(hover:hover)').matches) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const cx   = rect.width  / 2;
      const cy   = rect.height / 2;
      const dx   = ((e.clientX - rect.left) - cx) / cx;  // -1 to 1
      const dy   = ((e.clientY - rect.top)  - cy) / cy;  // -1 to 1
      heroOrbs.forEach((orb, i) => {
        const factor = (i + 1) * 12;
        orb.style.transform = `translate(${dx * factor}px,${dy * factor}px)`;
        orb.style.transition = 'transform 0.6s ease-out';
      });
      heroFloats.forEach((card, i) => {
        const factor = (i % 2 === 0 ? 1 : -1) * 6;
        card.style.transform = `translate(${dx * factor}px,${dy * factor * 0.7}px)`;
        card.style.transition = 'transform 0.5s ease-out';
      });
    });
    heroSection.addEventListener('mouseleave', () => {
      heroOrbs.forEach(orb   => { orb.style.transform   = ''; });
      heroFloats.forEach(card => { card.style.transform  = ''; });
    });
  }

  /* ============================================================
     21. STAGGER GROUP — Children reveal in sequence
     ============================================================ */
  if ('IntersectionObserver' in window) {
    const staggerGroups = document.querySelectorAll('[data-stagger-group]');
    const staggerObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const base  = parseInt(entry.target.dataset.staggerBase || '80', 10);
        const items = entry.target.querySelectorAll('[data-stagger-item], .feature-card, .service-card, .pricing-card, .blog-card');
        items.forEach((item, i) => {
          item.style.transitionDelay = (i * base) + 'ms';
          setTimeout(() => {
            item.classList.add('revealed');
            item.style.transitionDelay = '';
          }, i * base);
        });
        staggerObs.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    staggerGroups.forEach(g => staggerObs.observe(g));
  }

  /* ============================================================
     22. MARQUEE — Pause on hover, speed control
     ============================================================ */
  document.querySelectorAll('.brand-marquee').forEach(marquee => {
    const wrap = marquee.closest('.brand-marquee-wrap') || marquee.parentElement;
    wrap.addEventListener('mouseenter', () => {
      marquee.style.animationPlayState = 'paused';
    });
    wrap.addEventListener('mouseleave', () => {
      marquee.style.animationPlayState = 'running';
    });
  });

  /* ============================================================
     23. COUNTER GLOW PULSE — Visual feedback on count completion
     ============================================================ */
  const origAnimate = window._codlyCounterDone;
  document.querySelectorAll('[data-counter]').forEach(el => {
    const obs = new MutationObserver(() => {
      el.style.textShadow = '0 0 20px rgba(30,136,229,0.8)';
      el.style.transition = 'text-shadow 0.3s ease';
      setTimeout(() => {
        el.style.textShadow = '';
      }, 600);
    });
    obs.observe(el, { characterData: true, childList: true, subtree: true });
  });

  /* ============================================================
     24. SECTION SCROLL SPY — Nav link active state via scroll
     ============================================================ */
  const sectionIds  = ['home','about','services','products','portfolio','testimonials','pricing','contact'];
  const navLinks    = document.querySelectorAll('nav a[href]');
  if ('IntersectionObserver' in window && navLinks.length) {
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href') || '';
          const isMatch = href === `#${id}` || href.includes(`#${id}`);
          link.classList.toggle('active', isMatch);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) spyObserver.observe(el);
    });
  }

  /* ============================================================
     25. SCROLL-REVEAL — Enhanced stagger with [data-delay]
     ============================================================ */
  document.querySelectorAll('[data-delay]').forEach(el => {
    el.style.transitionDelay = el.dataset.delay + 'ms';
  });

  /* ============================================================
     26. TILT CARDS — 3D card tilt effect
     ============================================================ */
  function initTilt(el) {
    const max = parseFloat(el.dataset.tilt || '8');
    el.style.transformStyle = 'preserve-3d';
    el.style.willChange     = 'transform';
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x  = (e.clientX - rect.left) / rect.width;   // 0-1
      const y  = (e.clientY - rect.top)  / rect.height;  // 0-1
      const rx = (y - 0.5) * -max * 2;
      const ry = (x - 0.5) *  max * 2;
      el.style.transform  = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.03,1.03,1.03)`;
      el.style.transition = 'transform 0.1s ease-out';
      // Shine layer
      let shine = el.querySelector('.tilt-shine');
      if (!shine) {
        shine = document.createElement('div');
        shine.className = 'tilt-shine';
        shine.style.cssText = 'position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:10;transition:opacity 0.3s';
        el.style.position = el.style.position || 'relative';
        el.appendChild(shine);
      }
      shine.style.background = `radial-gradient(circle at ${x*100}% ${y*100}%, rgba(255,255,255,0.1) 0%, transparent 60%)`;
      shine.style.opacity = '1';
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform  = '';
      el.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      const shine = el.querySelector('.tilt-shine');
      if (shine) shine.style.opacity = '0';
    });
  }
  document.querySelectorAll('[data-tilt]').forEach(initTilt);

  console.log('🚀 Codly India v2.5 — Premium Animations Active');

})();

