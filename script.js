/**
 * Bhavya Agarwal Portfolio — Notebook Interactive Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  const navItems = document.querySelectorAll('.nav-item');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('nav-open');
      const isOpen = navLinks.classList.contains('nav-open');
      mobileToggle.innerHTML = isOpen ? '<span class="toggle-icon">[CLOSE]</span>' : '<span class="toggle-icon">[MENU]</span>';
    });

    // Close menu on click of any nav link
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        if (navLinks.classList.contains('nav-open')) {
          navLinks.classList.remove('nav-open');
          mobileToggle.innerHTML = '<span class="toggle-icon">[MENU]</span>';
        }
      });
    });
  }

  // 2. Active Section Tracker on Scroll
  const sections = document.querySelectorAll('section[id], header[id="top"]');
  const navMap = {};
  
  navItems.forEach(item => {
    const hash = item.getAttribute('href');
    if (hash) {
      const id = hash.replace('#', '');
      navMap[id] = item;
    }
  });

  const onScroll = () => {
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navItems.forEach(link => link.classList.remove('active'));
        if (id === 'top' || id === 'home') {
          if (navMap['home']) navMap['home'].classList.add('active');
        } else if (navMap[id]) {
          navMap[id].classList.add('active');
        }
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Run once initially

  // 3. Project Filter Buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active class
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterVal === 'all' || category === filterVal) {
          card.style.display = 'flex';
          card.style.animation = 'fadeInCard 0.3s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 4. Click to Copy Email
  const copyBtn = document.getElementById('copyEmailBtn');
  const emailLink = document.getElementById('emailLink');

  if (copyBtn && emailLink) {
    copyBtn.addEventListener('click', async () => {
      const emailText = emailLink.textContent.trim();
      try {
        await navigator.clipboard.writeText(emailText);
        copyBtn.textContent = '[copied! ✓]';
        setTimeout(() => {
          copyBtn.textContent = '[copy]';
        }, 2200);
      } catch (err) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = emailText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        copyBtn.textContent = '[copied! ✓]';
        setTimeout(() => {
          copyBtn.textContent = '[copy]';
        }, 2200);
      }
    });
  }

  // 5. Contact Form Simulation / Mailto Handler
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');
  const sendBtn = document.getElementById('sendBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('senderName').value.trim();
      const email = document.getElementById('senderEmail').value.trim();
      const subject = document.getElementById('messageSubject').value.trim();
      const body = document.getElementById('messageBody').value.trim();

      if (!name || !email || !body) return;

      if (sendBtn) sendBtn.disabled = true;
      if (formFeedback) {
        formFeedback.textContent = 'Writing note... ✎';
      }

      // Simulate sending feedback and prepare mailto draft
      setTimeout(() => {
        if (formFeedback) {
          formFeedback.textContent = `Note recorded! Thanks, ${name}. Opening mail draft... ✓`;
        }

        // Open mailto with the typed details
        const mailtoUrl = `mailto:bhavya.agarwal@example.com?subject=${encodeURIComponent(
          subject || 'Portfolio Inquiry'
        )}&body=${encodeURIComponent(
          `Hi Bhavya,\n\n${body}\n\nFrom: ${name} (${email})`
        )}`;
        
        window.location.href = mailtoUrl;

        contactForm.reset();
        if (sendBtn) sendBtn.disabled = false;

        setTimeout(() => {
          if (formFeedback) formFeedback.textContent = '';
        }, 6000);
      }, 700);
    });
  }

  // 6. Resume Button check (if sample file is missing, inform gracefully)
  const resumeBtn = document.getElementById('resumeBtn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', (e) => {
      // If the resume PDF doesn't exist yet, we can let user know
      fetch(resumeBtn.getAttribute('href'), { method: 'HEAD' })
        .then(res => {
          if (!res.ok) {
            e.preventDefault();
            alert('Resume note: Place your PDF file at "assets/Bhavya_Agarwal_Resume.pdf" to enable instant download!');
          }
        })
        .catch(() => {
          // Ignore network errors on local file protocol
        });
    });
  }

  // 7. Flip Cards Click/Tap Handler (for mobile & touch devices)
  const flipCards = document.querySelectorAll('.flip-card');
  flipCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('is-flipped');
    });
  });

  // 8. Automatic HEIC support for profile photo (e.g., iPhone photos)
  const profilePhoto = document.getElementById('profilePhoto');
  if (profilePhoto) {
    // Check if profile.heic exists in assets
    fetch('assets/profile.heic')
      .then(res => {
        if (!res.ok) throw new Error('profile.heic not found');
        return res.blob();
      })
      .then(blob => {
        if (window.heic2any) {
          window.heic2any({ blob: blob, toType: 'image/jpeg', quality: 0.9 })
            .then(conversionResult => {
              const objectUrl = URL.createObjectURL(conversionResult);
              profilePhoto.src = objectUrl;
            })
            .catch(err => {
              console.log('HEIC conversion notice:', err);
            });
        }
      })
      .catch(() => {
        // profile.heic not present or failed, keep current src
      });
  }
});

