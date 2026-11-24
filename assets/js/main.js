/* assets/js/main.js - Logique interactive Tony Paysagiste */
document.addEventListener('DOMContentLoaded', function () {
  // 1. HEADER STICKY EFFET DE SCROLL
  const header = document.querySelector('.sticky-header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // 2. MENU MOBILE NAVIGATION
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileServicesBtn = document.getElementById('mobile-services-btn');
  const mobileServicesDropdown = document.getElementById('mobile-services-dropdown');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function () {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
      mobileMenu.classList.toggle('hidden');
    });
  }

  if (mobileServicesBtn && mobileServicesDropdown) {
    mobileServicesBtn.addEventListener('click', function (e) {
      e.preventDefault();
      mobileServicesDropdown.classList.toggle('hidden');
      const icon = mobileServicesBtn.querySelector('svg');
      if (icon) {
        icon.classList.toggle('rotate-180');
      }
    });
  }

  // 3. COMPARATEUR AVANT / APRÈS INTERACTIF
  const sliders = document.querySelectorAll('.ba-slider-container');
  sliders.forEach(function (container) {
    const beforeWrapper = container.querySelector('.ba-before-wrapper');
    const handle = container.querySelector('.ba-handle');
    if (!beforeWrapper || !handle) return;

    let isDown = false;

    const setPosition = (clientX) => {
      const rect = container.getBoundingClientRect();
      let offsetX = clientX - rect.left;
      let percentage = (offsetX / rect.width) * 100;
      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;

      beforeWrapper.style.width = percentage + '%';
      handle.style.left = percentage + '%';
    };

    // Souris
    container.addEventListener('mousedown', function (e) {
      isDown = true;
      setPosition(e.clientX);
    });

    window.addEventListener('mouseup', function () {
      isDown = false;
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      setPosition(e.clientX);
    });

    // Touch pour mobile/tablette
    container.addEventListener('touchstart', function (e) {
      isDown = true;
      if (e.touches[0]) setPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', function () {
      isDown = false;
    });

    window.addEventListener('touchmove', function (e) {
      if (!isDown) return;
      if (e.touches[0]) setPosition(e.touches[0].clientX);
    }, { passive: true });
  });

  // 4. FORMULAIRE DEVIS DIRECT SMS / WHATSAPP (100% JS SANS BACKEND)
  const quoteForms = document.querySelectorAll('.quote-form-handler');
  
  quoteForms.forEach(function (form) {
    const serviceInput = form.querySelector('[name="service"]');
    const nameInput = form.querySelector('[name="client_name"]');
    const phoneInput = form.querySelector('[name="client_phone"]');
    const messageInput = form.querySelector('[name="client_message"]');
    const statusMsg = form.querySelector('.quote-status-msg');

    const smsBtn = form.querySelector('.btn-send-sms');
    const waBtn = form.querySelector('.btn-send-wa');
    const copyBtn = form.querySelector('.btn-copy-msg');

    // Détection iOS pour le séparateur SMS (&body= vs ?body=)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    function buildMessage() {
      const service = (serviceInput && serviceInput.value.trim()) || 'Demande générale';
      const name = (nameInput && nameInput.value.trim()) || 'Non renseigné';
      const phone = (phoneInput && phoneInput.value.trim()) || '';
      const details = (messageInput && messageInput.value.trim()) || 'Pas de précision supplémentaire';

      return `Bonjour Tony, je souhaite un devis gratuit pour : ${service}. Nom : ${name}. Mon tél : ${phone}. Détails : ${details}`;
    }

    function validatePhone() {
      if (!phoneInput || !phoneInput.value.trim()) {
        showStatus('Veuillez renseigner votre numéro de téléphone pour être rappelé.', 'error');
        if (phoneInput) phoneInput.focus();
        return false;
      }
      return true;
    }

    function showStatus(text, type = 'info') {
      if (!statusMsg) return;
      statusMsg.textContent = text;
      statusMsg.className = 'quote-status-msg text-sm p-3 rounded-lg mt-3 ' + 
        (type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200');
      statusMsg.classList.remove('hidden');
    }

    if (smsBtn) {
      smsBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (!validatePhone()) return;
        const msg = buildMessage();
        const separator = isIOS ? '&' : '?';
        const smsUrl = `sms:+33641439214${separator}body=${encodeURIComponent(msg)}`;
        window.location.href = smsUrl;
        showStatus('Ouverture de votre application SMS en cours...', 'success');
      });
    }

    if (waBtn) {
      waBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (!validatePhone()) return;
        const msg = buildMessage();
        const waUrl = `https://wa.me/33641439214?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank');
        showStatus('Ouverture de WhatsApp avec votre message pré-rempli...', 'success');
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (!validatePhone()) return;
        const msg = buildMessage();

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(msg).then(() => {
            showStatus('Message copié ! Vous pouvez le coller par SMS au 06 41 43 92 14.', 'success');
          }).catch(() => {
            fallbackCopy(msg);
          });
        } else {
          fallbackCopy(msg);
        }
      });
    }

    function fallbackCopy(text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        showStatus('Message copié ! Vous pouvez le coller par SMS au 06 41 43 92 14.', 'success');
      } catch (err) {
        showStatus('Numéro Tony : 06 41 43 92 14. Veuillez envoyer votre message.', 'info');
      }
      document.body.removeChild(textarea);
    }
  });

  // 5. ACCORDÉONS FAQ
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', function () {
        const isOpen = item.classList.contains('active');
        // Fermer les autres dans le même conteneur si désiré, ou permettre multi-ouvert
        faqItems.forEach(other => {
          if (other !== item) other.classList.remove('active');
        });
        item.classList.toggle('active', !isOpen);
      });
    }
  });
});
