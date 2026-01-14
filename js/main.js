/**
 * MyRecoveryPlus Main JavaScript
 * Mobile-first, modular implementation
 * Features: Theme toggle, mobile menu, smooth scroll, form validation, booking integration
 */

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Utility helper functions
 */
const Utils = {
  /**
   * Debounce function to limit rate of function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce: (func, wait = 150) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Check if element is in viewport
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} True if element is in viewport
   */
  isInViewport: (element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  /**
   * Get element by selector safely
   * @param {string} selector - CSS selector
   * @returns {HTMLElement|null} Element or null
   */
  getElement: (selector) => {
    return document.querySelector(selector);
  },

  /**
   * Get all elements by selector safely
   * @param {string} selector - CSS selector
   * @returns {NodeList} NodeList of elements
   */
  getElements: (selector) => {
    return document.querySelectorAll(selector);
  },

  /**
   * Create element with properties safely
   * @param {string} tag - HTML tag name
   * @param {Object} props - Element properties
   * @param {string|Array} children - Child elements or text
   * @returns {HTMLElement} Created element
   */
  createElement: (tag, props = {}, children = null) => {
    const element = document.createElement(tag);

    // Set properties
    Object.keys(props).forEach(key => {
      if (key === 'className') {
        element.className = props[key];
      } else if (key === 'dataset') {
        Object.keys(props[key]).forEach(dataKey => {
          element.dataset[dataKey] = props[key][dataKey];
        });
      } else if (key.startsWith('data-')) {
        element.setAttribute(key, props[key]);
      } else {
        element[key] = props[key];
      }
    });

    // Add children
    if (children) {
      if (typeof children === 'string') {
        element.textContent = children;
      } else if (Array.isArray(children)) {
        children.forEach(child => {
          if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
          } else {
            element.appendChild(child);
          }
        });
      } else {
        element.appendChild(children);
      }
    }

    return element;
  }
};

// ============================================================================
// THEME TOGGLE FUNCTIONALITY
// ============================================================================

/**
 * Theme Manager - Handles dark/light mode with localStorage persistence
 */
const ThemeManager = {
  storageKey: 'myrecoveryplus-theme',
  themes: {
    LIGHT: 'light',
    DARK: 'dark'
  },

  /**
   * Initialize theme manager
   */
  init: () => {
    const savedTheme = ThemeManager.getTheme();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Set theme: saved preference > system preference > light
    const initialTheme = savedTheme || (prefersDark ? ThemeManager.themes.DARK : ThemeManager.themes.LIGHT);
    ThemeManager.setTheme(initialTheme, false);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(ThemeManager.storageKey)) {
        ThemeManager.setTheme(e.matches ? ThemeManager.themes.DARK : ThemeManager.themes.LIGHT, false);
      }
    });

    // Attach toggle button listeners
    ThemeManager.attachToggleListeners();
  },

  /**
   * Get current theme from localStorage
   * @returns {string|null} Current theme or null
   */
  getTheme: () => {
    return localStorage.getItem(ThemeManager.storageKey);
  },

  /**
   * Set theme and save to localStorage
   * @param {string} theme - Theme to set (light/dark)
   * @param {boolean} save - Whether to save to localStorage
   */
  setTheme: (theme, save = true) => {
    const root = document.documentElement;
    const body = document.body;

    // Remove existing theme classes
    root.classList.remove(ThemeManager.themes.LIGHT, ThemeManager.themes.DARK);
    body.classList.remove(ThemeManager.themes.LIGHT, ThemeManager.themes.DARK);

    // Add new theme class
    root.classList.add(theme);
    body.classList.add(theme);
    root.setAttribute('data-theme', theme);

    // Save to localStorage
    if (save) {
      localStorage.setItem(ThemeManager.storageKey, theme);
    }

    // Update toggle button icons
    ThemeManager.updateToggleIcons(theme);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  },

  /**
   * Toggle between light and dark themes
   */
  toggle: () => {
    const currentTheme = ThemeManager.getTheme() || ThemeManager.themes.LIGHT;
    const newTheme = currentTheme === ThemeManager.themes.LIGHT
      ? ThemeManager.themes.DARK
      : ThemeManager.themes.LIGHT;

    ThemeManager.setTheme(newTheme);
  },

  /**
   * Attach event listeners to theme toggle buttons
   */
  attachToggleListeners: () => {
    const toggleButtons = Utils.getElements('[data-theme-toggle]');
    toggleButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        ThemeManager.toggle();
      });
    });
  },

  /**
   * Update toggle button icons based on current theme
   * @param {string} theme - Current theme
   */
  updateToggleIcons: (theme) => {
    const toggleButtons = Utils.getElements('[data-theme-toggle]');
    toggleButtons.forEach(button => {
      const icon = button.querySelector('[data-theme-icon]');
      if (icon) {
        // Update icon content or class based on theme
        icon.textContent = theme === ThemeManager.themes.DARK ? '☀️' : '🌙';
        icon.setAttribute('aria-label', theme === ThemeManager.themes.DARK ? 'Switch to light mode' : 'Switch to dark mode');
      }
    });
  }
};

// ============================================================================
// MOBILE MENU FUNCTIONALITY
// ============================================================================

/**
 * Mobile Menu Manager - Handles mobile navigation menu
 */
const MobileMenu = {
  isOpen: false,

  /**
   * Initialize mobile menu
   */
  init: () => {
    MobileMenu.attachListeners();
    MobileMenu.handleResize();
  },

  /**
   * Attach event listeners
   */
  attachListeners: () => {
    // Mobile menu toggle button
    const toggleBtn = Utils.getElement('[data-mobile-menu-toggle]');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        MobileMenu.toggle();
      });
    }

    // Close button inside mobile menu
    const closeBtn = Utils.getElement('[data-mobile-menu-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        MobileMenu.close();
      });
    }

    // Close menu on overlay click
    const overlay = Utils.getElement('[data-mobile-menu-overlay]');
    if (overlay) {
      overlay.addEventListener('click', () => {
        MobileMenu.close();
      });
    }

    // Close menu when clicking on links
    const menu = Utils.getElement('[data-mobile-menu]');
    if (menu) {
      const links = menu.querySelectorAll('a');
      links.forEach(link => {
        link.addEventListener('click', () => {
          MobileMenu.close();
        });
      });
    }

    // Handle window resize
    window.addEventListener('resize', Utils.debounce(MobileMenu.handleResize, 250));

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && MobileMenu.isOpen) {
        MobileMenu.close();
      }
    });
  },

  /**
   * Toggle mobile menu
   */
  toggle: () => {
    if (MobileMenu.isOpen) {
      MobileMenu.close();
    } else {
      MobileMenu.open();
    }
  },

  /**
   * Open mobile menu
   */
  open: () => {
    const menu = Utils.getElement('[data-mobile-menu]');
    const toggleBtn = Utils.getElement('[data-mobile-menu-toggle]');
    const overlay = Utils.getElement('[data-mobile-menu-overlay]');

    if (menu) {
      menu.classList.add('active', 'open');
      menu.setAttribute('aria-hidden', 'false');
    }

    if (toggleBtn) {
      toggleBtn.classList.add('active');
      toggleBtn.setAttribute('aria-expanded', 'true');
    }

    if (overlay) {
      overlay.classList.add('active');
    }

    // Prevent body scroll on mobile
    document.body.style.overflow = 'hidden';
    MobileMenu.isOpen = true;

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('mobilemenuopen'));
  },

  /**
   * Close mobile menu
   */
  close: () => {
    const menu = Utils.getElement('[data-mobile-menu]');
    const toggleBtn = Utils.getElement('[data-mobile-menu-toggle]');
    const overlay = Utils.getElement('[data-mobile-menu-overlay]');

    if (menu) {
      menu.classList.remove('active', 'open');
      menu.setAttribute('aria-hidden', 'true');
    }

    if (toggleBtn) {
      toggleBtn.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }

    if (overlay) {
      overlay.classList.remove('active');
    }

    // Restore body scroll
    document.body.style.overflow = '';
    MobileMenu.isOpen = false;

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('mobilemenuclose'));
  },

  /**
   * Handle window resize
   */
  handleResize: () => {
    const breakpoint = 768; // Mobile breakpoint in pixels
    if (window.innerWidth >= breakpoint && MobileMenu.isOpen) {
      MobileMenu.close();
    }
  }
};

// ============================================================================
// SMOOTH SCROLL FUNCTIONALITY
// ============================================================================

/**
 * Smooth Scroll Manager - Handles smooth scrolling for anchor links
 */
const SmoothScroll = {
  /**
   * Initialize smooth scroll
   */
  init: () => {
    SmoothScroll.attachListeners();
  },

  /**
   * Attach event listeners to anchor links
   */
  attachListeners: () => {
    const anchors = Utils.getElements('a[href^="#"]');

    anchors.forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');

        // Ignore empty hash or hash-only links
        if (href === '#' || href === '#!') {
          return;
        }

        const target = Utils.getElement(href);

        if (target) {
          e.preventDefault();
          SmoothScroll.scrollTo(target);

          // Update URL without jumping
          if (history.pushState) {
            history.pushState(null, null, href);
          }
        }
      });
    });
  },

  /**
   * Scroll to element smoothly
   * @param {HTMLElement} element - Target element
   * @param {number} offset - Offset from top (for fixed headers)
   */
  scrollTo: (element, offset = 80) => {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    // Focus the element for accessibility
    element.setAttribute('tabindex', '-1');
    element.focus({ preventScroll: true });
  }
};

// ============================================================================
// HEADER SCROLL BEHAVIOR
// ============================================================================

/**
 * Header Scroll Manager - Adds 'scrolled' class to header on scroll
 */
const HeaderScroll = {
  scrollThreshold: 50, // Pixels scrolled before adding class
  lastScrollTop: 0,

  /**
   * Initialize header scroll behavior
   */
  init: () => {
    HeaderScroll.attachListeners();
    HeaderScroll.checkScroll(); // Check initial state
  },

  /**
   * Attach scroll event listeners
   */
  attachListeners: () => {
    window.addEventListener('scroll', Utils.debounce(HeaderScroll.handleScroll, 10));
  },

  /**
   * Handle scroll event
   */
  handleScroll: () => {
    HeaderScroll.checkScroll();
    HeaderScroll.handleScrollDirection();
  },

  /**
   * Check scroll position and add/remove class
   */
  checkScroll: () => {
    const header = Utils.getElement('[data-header]') || Utils.getElement('header');

    if (!header) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > HeaderScroll.scrollThreshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  },

  /**
   * Handle scroll direction for hide/show header
   */
  handleScrollDirection: () => {
    const header = Utils.getElement('[data-header]') || Utils.getElement('header');

    if (!header) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > HeaderScroll.lastScrollTop && scrollTop > 200) {
      // Scrolling down - hide header
      header.classList.add('scroll-down');
      header.classList.remove('scroll-up');
    } else {
      // Scrolling up - show header
      header.classList.add('scroll-up');
      header.classList.remove('scroll-down');
    }

    HeaderScroll.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }
};

// ============================================================================
// FORM VALIDATION UTILITIES
// ============================================================================

/**
 * Form Validation Manager - Reusable form validation utilities
 */
const FormValidator = {
  patterns: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\d\s\-\+\(\)]+$/,
    url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    zipCode: /^\d{5}(-\d{4})?$/
  },

  /**
   * Validate single field
   * @param {HTMLElement} field - Input field to validate
   * @returns {Object} Validation result with isValid and message
   */
  validateField: (field) => {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    const pattern = field.getAttribute('pattern');
    const minLength = field.getAttribute('minlength');
    const maxLength = field.getAttribute('maxlength');
    const min = field.getAttribute('min');
    const max = field.getAttribute('max');

    // Check if field is required and empty
    if (required && !value) {
      return {
        isValid: false,
        message: 'This field is required'
      };
    }

    // Skip validation if field is empty and not required
    if (!value && !required) {
      return { isValid: true, message: '' };
    }

    // Email validation
    if (type === 'email' && !FormValidator.patterns.email.test(value)) {
      return {
        isValid: false,
        message: 'Please enter a valid email address'
      };
    }

    // Phone validation
    if (type === 'tel' && !FormValidator.patterns.phone.test(value)) {
      return {
        isValid: false,
        message: 'Please enter a valid phone number'
      };
    }

    // URL validation
    if (type === 'url' && !FormValidator.patterns.url.test(value)) {
      return {
        isValid: false,
        message: 'Please enter a valid URL'
      };
    }

    // Pattern validation
    if (pattern && !new RegExp(pattern).test(value)) {
      return {
        isValid: false,
        message: field.getAttribute('data-pattern-message') || 'Invalid format'
      };
    }

    // Length validation
    if (minLength && value.length < parseInt(minLength)) {
      return {
        isValid: false,
        message: `Minimum length is ${minLength} characters`
      };
    }

    if (maxLength && value.length > parseInt(maxLength)) {
      return {
        isValid: false,
        message: `Maximum length is ${maxLength} characters`
      };
    }

    // Number validation
    if (type === 'number') {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return {
          isValid: false,
          message: 'Please enter a valid number'
        };
      }
      if (min && numValue < parseFloat(min)) {
        return {
          isValid: false,
          message: `Minimum value is ${min}`
        };
      }
      if (max && numValue > parseFloat(max)) {
        return {
          isValid: false,
          message: `Maximum value is ${max}`
        };
      }
    }

    return { isValid: true, message: '' };
  },

  /**
   * Show field error
   * @param {HTMLElement} field - Input field
   * @param {string} message - Error message
   */
  showError: (field, message) => {
    field.classList.add('error', 'invalid');
    field.classList.remove('valid');
    field.setAttribute('aria-invalid', 'true');

    // Find or create error message element
    let errorElement = field.parentElement.querySelector('.error-message');

    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      errorElement.setAttribute('role', 'alert');
      field.parentElement.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.style.display = 'block';
  },

  /**
   * Clear field error
   * @param {HTMLElement} field - Input field
   */
  clearError: (field) => {
    field.classList.remove('error', 'invalid');
    field.classList.add('valid');
    field.setAttribute('aria-invalid', 'false');

    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  },

  /**
   * Validate entire form
   * @param {HTMLFormElement} form - Form element
   * @returns {boolean} True if form is valid
   */
  validateForm: (form) => {
    const fields = form.querySelectorAll('input, textarea, select');
    let isValid = true;

    fields.forEach(field => {
      const validation = FormValidator.validateField(field);

      if (!validation.isValid) {
        FormValidator.showError(field, validation.message);
        isValid = false;
      } else {
        FormValidator.clearError(field);
      }
    });

    return isValid;
  },

  /**
   * Initialize form validation
   * @param {string|HTMLFormElement} form - Form selector or element
   */
  init: (form) => {
    const formElement = typeof form === 'string' ? Utils.getElement(form) : form;

    if (!formElement) return;

    // Real-time validation on blur
    const fields = formElement.querySelectorAll('input, textarea, select');
    fields.forEach(field => {
      field.addEventListener('blur', () => {
        const validation = FormValidator.validateField(field);
        if (!validation.isValid) {
          FormValidator.showError(field, validation.message);
        } else {
          FormValidator.clearError(field);
        }
      });

      // Clear error on input
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) {
          const validation = FormValidator.validateField(field);
          if (validation.isValid) {
            FormValidator.clearError(field);
          }
        }
      });
    });

    // Validate on submit
    formElement.addEventListener('submit', (e) => {
      e.preventDefault();

      if (FormValidator.validateForm(formElement)) {
        // Form is valid - dispatch custom event
        formElement.dispatchEvent(new CustomEvent('formvalid', {
          detail: { form: formElement }
        }));
      } else {
        // Focus first error field
        const firstError = formElement.querySelector('.error');
        if (firstError) {
          firstError.focus();
        }
      }
    });
  }
};

// ============================================================================
// BOOKING CALENDAR INTEGRATION
// ============================================================================

/**
 * Booking Calendar Manager - Placeholder for calendar integration
 */
const BookingCalendar = {
  /**
   * Initialize booking calendar
   */
  init: () => {
    const calendarContainers = Utils.getElements('[data-booking-calendar]');

    calendarContainers.forEach(container => {
      BookingCalendar.setupCalendar(container);
    });
  },

  /**
   * Setup individual calendar
   * @param {HTMLElement} container - Calendar container element
   */
  setupCalendar: (container) => {
    const calendarType = container.getAttribute('data-calendar-type') || 'appointment';

    // Create placeholder using safe DOM methods
    const placeholder = Utils.createElement('div', { className: 'booking-calendar-placeholder' });

    const title = Utils.createElement('p', {});
    const titleText = document.createTextNode('Booking calendar integration for: ');
    const titleStrong = Utils.createElement('strong', {}, calendarType);
    title.appendChild(titleText);
    title.appendChild(titleStrong);

    const subtitle = Utils.createElement('p', {}, 'Ready to integrate with:');

    const list = Utils.createElement('ul', {});
    const providers = ['Calendly', 'Acuity Scheduling', 'Square Appointments', 'Custom booking system'];
    providers.forEach(provider => {
      const listItem = Utils.createElement('li', {}, provider);
      list.appendChild(listItem);
    });

    placeholder.appendChild(title);
    placeholder.appendChild(subtitle);
    placeholder.appendChild(list);

    // Clear and append
    container.textContent = '';
    container.appendChild(placeholder);

    // Add initialization method
    BookingCalendar.initializeProvider(container, calendarType);
  },

  /**
   * Initialize specific booking provider
   * @param {HTMLElement} container - Container element
   * @param {string} type - Calendar type
   */
  initializeProvider: (container, type) => {
    // Example: Calendly integration
    // Uncomment and configure when ready to integrate

    /*
    if (window.Calendly) {
      window.Calendly.initInlineWidget({
        url: 'https://calendly.com/your-link',
        parentElement: container,
        prefill: {},
        utm: {}
      });
    }
    */

    // Example: Custom booking system
    container.addEventListener('click', (e) => {
      if (e.target.matches('[data-book-appointment]')) {
        e.preventDefault();
        BookingCalendar.openBookingModal();
      }
    });
  },

  /**
   * Open booking modal
   */
  openBookingModal: () => {
    // Dispatch custom event for booking
    window.dispatchEvent(new CustomEvent('bookingopen', {
      detail: {
        timestamp: new Date().toISOString()
      }
    }));

    console.log('Booking modal would open here');
    // Implement modal logic here
  },

  /**
   * Handle booking submission
   * @param {Object} bookingData - Booking data
   */
  submitBooking: async (bookingData) => {
    try {
      // Placeholder for API call
      console.log('Submitting booking:', bookingData);

      // Example API call structure
      /*
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        const result = await response.json();
        BookingCalendar.handleBookingSuccess(result);
      } else {
        BookingCalendar.handleBookingError('Booking failed');
      }
      */

      return { success: true, message: 'Booking integration ready' };
    } catch (error) {
      console.error('Booking error:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Handle successful booking
   * @param {Object} result - Booking result
   */
  handleBookingSuccess: (result) => {
    window.dispatchEvent(new CustomEvent('bookingsuccess', {
      detail: result
    }));
    console.log('Booking successful:', result);
  },

  /**
   * Handle booking error
   * @param {string} error - Error message
   */
  handleBookingError: (error) => {
    window.dispatchEvent(new CustomEvent('bookingerror', {
      detail: { error }
    }));
    console.error('Booking error:', error);
  }
};

// ============================================================================
// FAQ ACCORDION FUNCTIONALITY
// ============================================================================

/**
 * FAQ Accordion Manager - Handles FAQ accordion toggle functionality
 */
const FAQAccordion = {
  /**
   * Initialize FAQ accordion
   */
  init: () => {
    const faqItems = Utils.getElements('.faq-question');

    faqItems.forEach(button => {
      FAQAccordion.setupAccordionItem(button);
    });
  },

  /**
   * Setup individual FAQ accordion item
   * @param {HTMLElement} button - FAQ question button
   */
  setupAccordionItem: (button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      FAQAccordion.toggle(button);
    });

    // Add keyboard support
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        FAQAccordion.toggle(button);
      }
    });
  },

  /**
   * Toggle FAQ accordion item
   * @param {HTMLElement} button - FAQ question button
   */
  toggle: (button) => {
    const faqItem = button.closest('.faq-item');
    const answer = faqItem.querySelector('.faq-answer');
    const isExpanded = button.getAttribute('aria-expanded') === 'true';

    if (isExpanded) {
      // Close the item
      FAQAccordion.close(button, answer);
    } else {
      // Close all other items (optional - remove this line for multi-open accordion)
      FAQAccordion.closeAll();

      // Open this item
      FAQAccordion.open(button, answer);
    }
  },

  /**
   * Open FAQ accordion item
   * @param {HTMLElement} button - FAQ question button
   * @param {HTMLElement} answer - FAQ answer element
   */
  open: (button, answer) => {
    const faqItem = button.closest('.faq-item');

    button.setAttribute('aria-expanded', 'true');
    faqItem.classList.add('active');
    answer.style.maxHeight = answer.scrollHeight + 'px';

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('faqopen', {
      detail: { button, answer }
    }));
  },

  /**
   * Close FAQ accordion item
   * @param {HTMLElement} button - FAQ question button
   * @param {HTMLElement} answer - FAQ answer element
   */
  close: (button, answer) => {
    const faqItem = button.closest('.faq-item');

    button.setAttribute('aria-expanded', 'false');
    faqItem.classList.remove('active');
    answer.style.maxHeight = null;

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('faqclose', {
      detail: { button, answer }
    }));
  },

  /**
   * Close all FAQ accordion items
   */
  closeAll: () => {
    const faqItems = Utils.getElements('.faq-item.active');

    faqItems.forEach(item => {
      const button = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');

      if (button && answer) {
        FAQAccordion.close(button, answer);
      }
    });
  }
};

// ============================================================================
// NEWSLETTER SIGNUP HANDLER
// ============================================================================

/**
 * Newsletter Manager - Handles newsletter signup forms
 */
const Newsletter = {
  /**
   * Initialize newsletter forms
   */
  init: () => {
    const forms = Utils.getElements('[data-newsletter-form]');

    forms.forEach(form => {
      Newsletter.setupForm(form);
    });
  },

  /**
   * Setup individual newsletter form
   * @param {HTMLFormElement} form - Newsletter form element
   */
  setupForm: (form) => {
    // Initialize validation
    FormValidator.init(form);

    // Listen for valid form submission
    form.addEventListener('formvalid', (e) => {
      Newsletter.handleSubmit(e.detail.form);
    });
  },

  /**
   * Handle newsletter form submission
   * @param {HTMLFormElement} form - Form element
   */
  handleSubmit: async (form) => {
    const submitBtn = form.querySelector('button[type="submit"]');
    const email = form.querySelector('input[type="email"]').value;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Disable submit button
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Subscribing...';
    }

    try {
      const result = await Newsletter.subscribe(data);

      if (result.success) {
        Newsletter.showSuccess(form, result.message);
        form.reset();
      } else {
        Newsletter.showError(form, result.message);
      }
    } catch (error) {
      Newsletter.showError(form, 'An error occurred. Please try again.');
      console.error('Newsletter error:', error);
    } finally {
      // Re-enable submit button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Subscribe';
      }
    }
  },

  /**
   * Subscribe to newsletter
   * @param {Object} data - Form data
   * @returns {Promise<Object>} Subscription result
   */
  subscribe: async (data) => {
    // Placeholder for API integration
    console.log('Newsletter subscription data:', data);

    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Thank you for subscribing to our newsletter!'
        });
      }, 1000);
    });

    // Example: Mailchimp integration
    /*
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        message: 'Subscription failed. Please try again.'
      };
    }
    */
  },

  /**
   * Show success message
   * @param {HTMLFormElement} form - Form element
   * @param {string} message - Success message
   */
  showSuccess: (form, message) => {
    const messageEl = Newsletter.getMessageElement(form);
    messageEl.className = 'newsletter-message success';
    messageEl.textContent = message;
    messageEl.setAttribute('role', 'status');
    messageEl.style.display = 'block';

    // Dispatch success event
    window.dispatchEvent(new CustomEvent('newslettersuccess', {
      detail: { form, message }
    }));

    // Auto-hide after 5 seconds
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 5000);
  },

  /**
   * Show error message
   * @param {HTMLFormElement} form - Form element
   * @param {string} message - Error message
   */
  showError: (form, message) => {
    const messageEl = Newsletter.getMessageElement(form);
    messageEl.className = 'newsletter-message error';
    messageEl.textContent = message;
    messageEl.setAttribute('role', 'alert');
    messageEl.style.display = 'block';

    // Dispatch error event
    window.dispatchEvent(new CustomEvent('newslettererror', {
      detail: { form, message }
    }));

    // Auto-hide after 5 seconds
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 5000);
  },

  /**
   * Get or create message element
   * @param {HTMLFormElement} form - Form element
   * @returns {HTMLElement} Message element
   */
  getMessageElement: (form) => {
    let messageEl = form.querySelector('.newsletter-message');

    if (!messageEl) {
      messageEl = document.createElement('div');
      messageEl.className = 'newsletter-message';
      form.appendChild(messageEl);
    }

    return messageEl;
  }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Main App Initialization
 */
const App = {
  /**
   * Initialize all modules
   */
  init: () => {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', App.initModules);
    } else {
      App.initModules();
    }
  },

  /**
   * Initialize individual modules
   */
  initModules: () => {
    console.log('Initializing MyRecoveryPlus...');

    // Initialize core features
    ThemeManager.init();
    MobileMenu.init();
    SmoothScroll.init();
    HeaderScroll.init();
    BookingCalendar.init();
    FAQAccordion.init();
    Newsletter.init();

    // Initialize all forms with validation
    const forms = Utils.getElements('form:not([data-newsletter-form])');
    forms.forEach(form => {
      FormValidator.init(form);
    });

    // Dispatch ready event
    window.dispatchEvent(new CustomEvent('appready'));
    console.log('MyRecoveryPlus initialized successfully');
  }
};

// ============================================================================
// FONT LOADING - Prevent FOUC
// ============================================================================

const FontLoader = {
  init() {
    // Check if CSS Font Loading API is supported
    if ('fonts' in document) {
      // Load critical fonts
      Promise.all([
        document.fonts.load('400 1em Inter'),
        document.fonts.load('400 1em "Bebas Neue"')
      ]).then(() => {
        document.documentElement.classList.add('fonts-loaded');
      }).catch((error) => {
        console.warn('Font loading failed:', error);
        // Still add the class after a timeout as fallback
        setTimeout(() => {
          document.documentElement.classList.add('fonts-loaded');
        }, 1000);
      });
    } else {
      // Fallback for browsers without Font Loading API
      document.documentElement.classList.add('fonts-loaded');
    }
  }
};

// ============================================================================
// START APPLICATION
// ============================================================================

// Load fonts first to prevent flash
FontLoader.init();

// Initialize the application
App.init();

// ============================================================================
// EXPORT MODULES (for use in other scripts)
// ============================================================================

// Make modules available globally if needed
window.MyRecoveryPlus = {
  Utils,
  ThemeManager,
  MobileMenu,
  SmoothScroll,
  HeaderScroll,
  FormValidator,
  BookingCalendar,
  FAQAccordion,
  Newsletter
};
