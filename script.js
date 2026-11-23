/**
 * SASIDHAR - Developer Portfolio
 * Vanilla JavaScript Engine
 * Provides:
 *   - 3D Interactive Card Tilt on Mouse Movements
 *   - Interactive Projects Carousel / Slider with auto-rotation & touch support
 *   - Scroll progress indicator tracking
 *   - Sticky navigation & glassmorphic state on scroll
 *   - Intersection Observer fade-in animations
 *   - Mobile menu toggling & outside click handling
 *   - Active navigation item highlighting on scroll
 *   - One-click copy email with visual toast notification
 *   - Dynamic project detail modals with fully editable data
 */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ==================== 1. SCROLL PROGRESS INDICATOR ====================
  const scrollProgressBar = document.getElementById('scroll-progress');
  
  const updateScrollProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${scrollPercentage}%`;
    }
  };

  // ==================== 2. HEADER SCROLL STATE ====================
  const navbar = document.getElementById('navbar');
  
  const handleNavbarScroll = () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', () => {
    updateScrollProgress();
    handleNavbarScroll();
  }, { passive: true });

  updateScrollProgress();
  handleNavbarScroll();

  // ==================== 3. MOBILE MENU TOGGLE ====================
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('open');
      document.body.classList.toggle('no-scroll', !isExpanded);
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
        document.body.classList.remove('no-scroll');
      });
    });

    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && 
          !navMenu.contains(e.target) && 
          !navToggle.contains(e.target)) {
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
        document.body.classList.remove('no-scroll');
      }
    });
  }

  // ==================== 4. ACTIVE NAVIGATION LINK ON SCROLL ====================
  const sections = document.querySelectorAll('section[id]');
  
  const highlightActiveNav = () => {
    const scrollPosition = window.scrollY + 180;

    sections.forEach(currentSection => {
      const sectionHeight = currentSection.offsetHeight;
      const sectionTop = currentSection.offsetTop;
      const sectionId = currentSection.getAttribute('id');
      const matchingLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (matchingLink) {
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          matchingLink.classList.add('active');
        } else {
          matchingLink.classList.remove('active');
        }
      }
    });
  };

  window.addEventListener('scroll', highlightActiveNav, { passive: true });
  highlightActiveNav();

  // ==================== 5. 3D INTERACTIVE TILT ANIMATION ENGINE ====================
  if (!prefersReducedMotion && window.innerWidth > 768) {
    const tiltElements = document.querySelectorAll('[data-tilt]');

    tiltElements.forEach(el => {
      const maxTilt = parseFloat(el.getAttribute('data-tilt-max') || '12');

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within element
        const y = e.clientY - rect.top;  // y position within element
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;

        // Adjust any child 3D layers for parallax depth
        const childLayers = el.querySelectorAll('.3d-layer');
        childLayers.forEach(layer => {
          const zDepth = layer.getAttribute('data-z') || '25';
          layer.style.transform = `translateZ(${zDepth}px)`;
        });
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        const childLayers = el.querySelectorAll('.3d-layer');
        childLayers.forEach(layer => {
          layer.style.transform = 'translateZ(0px)';
        });
      });
    });
  }

  // ==================== 6. PROJECT CAROUSEL / SLIDER ====================
  const carouselTrack = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('slider-prev-btn');
  const nextBtn = document.getElementById('slider-next-btn');
  const dotsContainer = document.getElementById('slider-dots-container');

  if (carouselTrack && prevBtn && nextBtn && dotsContainer) {
    const slides = carouselTrack.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    let currentIndex = 0;
    let autoPlayTimer;

    const getVisibleSlideCount = () => {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    };

    const getMaxIndex = () => {
      const visibleCount = getVisibleSlideCount();
      return Math.max(0, totalSlides - visibleCount);
    };

    // Build pagination dots
    const buildDots = () => {
      dotsContainer.innerHTML = '';
      const maxIndex = getMaxIndex();
      const dotCount = maxIndex + 1;

      for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('span');
        dot.classList.add('slider-dot');
        if (i === currentIndex) dot.classList.add('active');
        dot.addEventListener('click', () => {
          goToSlide(i);
          resetAutoPlay();
        });
        dotsContainer.appendChild(dot);
      }
    };

    const updateSlider = () => {
      const visibleCount = getVisibleSlideCount();
      const slideWidthPercent = 100 / visibleCount;
      const offsetPercent = -(currentIndex * slideWidthPercent);
      carouselTrack.style.transform = `translateX(${offsetPercent}%)`;

      // Update dot active state
      const dots = dotsContainer.querySelectorAll('.slider-dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });
    };

    const goToSlide = (index) => {
      const maxIndex = getMaxIndex();
      currentIndex = Math.max(0, Math.min(index, maxIndex));
      updateSlider();
    };

    const nextSlide = () => {
      const maxIndex = getMaxIndex();
      if (currentIndex >= maxIndex) {
        currentIndex = 0;
      } else {
        currentIndex++;
      }
      updateSlider();
    };

    const prevSlide = () => {
      const maxIndex = getMaxIndex();
      if (currentIndex <= 0) {
        currentIndex = maxIndex;
      } else {
        currentIndex--;
      }
      updateSlider();
    };

    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoPlay();
    });

    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoPlay();
    });

    // Touch Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;

    carouselTrack.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselTrack.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        nextSlide();
        resetAutoPlay();
      } else if (touchEndX - touchStartX > 50) {
        prevSlide();
        resetAutoPlay();
      }
    }, { passive: true });

    // Auto Play with Pause on Hover
    const startAutoPlay = () => {
      autoPlayTimer = setInterval(nextSlide, 5000);
    };

    const resetAutoPlay = () => {
      clearInterval(autoPlayTimer);
      startAutoPlay();
    };

    const carouselWrapper = document.getElementById('projects-carousel');
    if (carouselWrapper) {
      carouselWrapper.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
      carouselWrapper.addEventListener('mouseleave', () => startAutoPlay());
    }

    window.addEventListener('resize', () => {
      buildDots();
      goToSlide(Math.min(currentIndex, getMaxIndex()));
    });

    buildDots();
    updateSlider();
    startAutoPlay();
  }

  // ==================== 7. SECTION SCROLL REVEAL ANIMATIONS ====================
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const fadeElements = document.querySelectorAll('.fade-in, .skill-card, .education-card, .achievement-card');
    
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.12
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    fadeElements.forEach(el => {
      el.classList.add('fade-in');
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
  }

  // ==================== 8. COPY EMAIL WITH TOAST NOTIFICATION ====================
  const copyBtn = document.getElementById('copy-email-btn');
  const toast = document.getElementById('toast');
  let toastTimeout;

  if (copyBtn && toast) {
    copyBtn.addEventListener('click', async () => {
      const email = 'ssasidhar225@gmail.com';

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = email;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          textArea.remove();
        }

        clearTimeout(toastTimeout);
        toast.classList.add('show');
        toastTimeout = setTimeout(() => {
          toast.classList.remove('show');
        }, 3200);

      } catch (err) {
        console.error('Could not copy email:', err);
      }
    });
  }

  // ==================== 9. EDITABLE PROJECT DETAILS MODAL ====================
  const projectRegistry = {
    python: {
      category: 'PYTHON DEVELOPMENT',
      title: 'Python Programming & Algorithm Experiments',
      body: `
        <p><strong>Overview:</strong> A structured exploration of core Python programming by Sasidhar (NIAT College), focusing on clean procedural design, script automation, and algorithmic problem solving.</p>
        <p><strong>Key Focus Areas:</strong></p>
        <ul>
          <li>Algorithm implementation, list comprehensions, and data structures.</li>
          <li>System scripts, file processing, and command-line utilities.</li>
          <li>Clean code architecture adhering to PEP 8 standards.</li>
        </ul>
        <p><strong>Status:</strong> Active student exploration and problem solving repository.</p>
      `,
      github: 'https://github.com/ssasidhar225-spec'
    },
    web: {
      category: 'WEB DEVELOPMENT',
      title: 'Modern Responsive Web Platforms',
      body: `
        <p><strong>Overview:</strong> Crafting responsive, accessible, and high-performance websites utilizing pure web standards: semantic HTML5, 3D CSS transforms, and vanilla JavaScript.</p>
        <p><strong>Key Highlights:</strong></p>
        <ul>
          <li>Zero unnecessary dependencies or bulky frameworks for maximum speed and simplicity.</li>
          <li>Futuristic dark theme blending Midnight Black, Electric Cobalt, Acid Lime, and Cyber Violet.</li>
          <li>Interactive 3D slides and mobile-first architecture validated across all modern devices.</li>
        </ul>
        <p><strong>Status:</strong> Actively building and deploying web projects.</p>
      `,
      github: 'https://github.com/ssasidhar225-spec'
    },
    design: {
      category: 'UI/UX DESIGN',
      title: 'Cyber-Minimalist Interface System',
      body: `
        <p><strong>Overview:</strong> Research and design of contemporary digital interface paradigms combining dark cyberpunk aesthetics with clean, human-centered usability.</p>
        <p><strong>Key Focus Areas:</strong></p>
        <ul>
          <li>High-contrast visual hierarchy with cobalt blue interactions, cyber violet glow, and acid-lime accents.</li>
          <li>Precision spacing, typographic scale, and 3D card tilt interactions.</li>
          <li>Component wireframing and prototyping focused on effortless user journeys.</li>
        </ul>
        <p><strong>Status:</strong> Continuous design exploration.</p>
      `,
      github: 'https://github.com/ssasidhar225-spec'
    }
  };

  const modal = document.getElementById('project-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCategory = document.getElementById('modal-category');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalLink = document.getElementById('modal-link');
  const modalTriggers = document.querySelectorAll('.project-modal-trigger');

  const openModal = (projectId) => {
    const data = projectRegistry[projectId];
    if (!data || !modal) return;

    modalCategory.textContent = data.category;
    modalTitle.textContent = data.title;
    modalBody.innerHTML = data.body;
    if (modalLink) {
      modalLink.setAttribute('href', data.github);
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  modalTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      const projectId = btn.getAttribute('data-project');
      openModal(projectId);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // ==================== 10. SUBTLE MOUSE LIGHTING TRACKER ====================
  if (!prefersReducedMotion && window.innerWidth > 992) {
    const glowCobalt = document.querySelector('.glow-cobalt');
    const glowViolet = document.querySelector('.glow-violet');

    window.addEventListener('mousemove', (e) => {
      const x = e.clientX;
      const y = e.clientY;
      if (glowCobalt) {
        glowCobalt.style.transform = `translate(${x * 0.03}px, ${y * 0.03}px)`;
      }
      if (glowViolet) {
        glowViolet.style.transform = `translate(${x * -0.02}px, ${y * -0.02}px)`;
      }
    }, { passive: true });
  }

});
