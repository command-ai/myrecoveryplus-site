/* ========================================================================
   RECOVERY PLUS - ANIMATIONS
   Smooth scroll-triggered animations and micro-interactions
   ======================================================================== */

// Animation configuration
const ANIMATION_CONFIG = {
    threshold: 0.15,        // Trigger when 15% visible
    rootMargin: '0px 0px -50px 0px',
    staggerDelay: 100,      // Delay between staggered elements (ms)
    mobileSensitivity: 0.1  // More sensitive on mobile
};

// Detect mobile devices
const isMobile = () => window.innerWidth <= 768;

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initHoverEnhancements();
    initPageLoadAnimations();
    initParallaxEffects();
});

/* ========================================================================
   SCROLL-TRIGGERED ANIMATIONS
   ======================================================================== */

function initScrollAnimations() {
    // Get threshold based on device
    const threshold = isMobile() ? ANIMATION_CONFIG.mobileSensitivity : ANIMATION_CONFIG.threshold;

    // Create Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add visible class with stagger delay
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, delay);

                // Unobserve after animation (performance optimization)
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: threshold,
        rootMargin: ANIMATION_CONFIG.rootMargin
    });

    // Observe all elements with animation classes
    observeElements(observer, '[data-animate]');

    // Stagger children in containers
    staggerChildren('.services-grid', '.service-card');
    staggerChildren('.pricing-grid', '.pricing-card');
    staggerChildren('.testimonials-grid', '.testimonial-card');
    staggerChildren('.rewards-grid', '.reward-card');
    staggerChildren('.faq-list', '.faq-item');

    // Observe staggered elements
    observeElements(observer, '.animate-stagger');
}

function observeElements(observer, selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => observer.observe(el));
}

function staggerChildren(containerSelector, childSelector) {
    const containers = document.querySelectorAll(containerSelector);

    containers.forEach(container => {
        const children = container.querySelectorAll(childSelector);
        children.forEach((child, index) => {
            child.classList.add('animate-stagger');
            child.dataset.delay = index * ANIMATION_CONFIG.staggerDelay;
        });
    });
}

/* ========================================================================
   HOVER ENHANCEMENTS
   ======================================================================== */

function initHoverEnhancements() {
    // Enhanced card hover effects
    enhanceCardHovers('.service-card');
    enhanceCardHovers('.pricing-card');
    enhanceCardHovers('.testimonial-card');
    enhanceCardHovers('.reward-card');

    // Button magnetic effect (desktop only)
    if (!isMobile()) {
        addMagneticEffect('.btn');
    }

    // Link hover animations
    enhanceLinkHovers('.nav-link');
    enhanceLinkHovers('.footer-links a');
}

function enhanceCardHovers(selector) {
    const cards = document.querySelectorAll(selector);

    cards.forEach(card => {
        // Add tilt effect on mouse move (desktop only)
        if (!isMobile()) {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        }
    });
}

function addMagneticEffect(selector) {
    const buttons = document.querySelectorAll(selector);

    buttons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });
    });
}

function enhanceLinkHovers(selector) {
    const links = document.querySelectorAll(selector);

    links.forEach(link => {
        // Add underline animation on hover
        link.addEventListener('mouseenter', () => {
            link.style.setProperty('--underline-width', '100%');
        });

        link.addEventListener('mouseleave', () => {
            link.style.setProperty('--underline-width', '0%');
        });
    });
}

/* ========================================================================
   PAGE LOAD ANIMATIONS
   ======================================================================== */

function initPageLoadAnimations() {
    // Animate header on load
    const header = document.querySelector('.header');
    if (header) {
        setTimeout(() => {
            header.classList.add('header-loaded');
        }, 100);
    }

    // Animate hero content
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        const heroElements = heroContent.children;
        Array.from(heroElements).forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('hero-item-loaded');
            }, 200 + (index * 100));
        });
    }

    // Fade in page
    document.body.classList.add('page-loaded');
}

/* ========================================================================
   PARALLAX EFFECTS
   ======================================================================== */

function initParallaxEffects() {
    if (isMobile()) return; // Skip parallax on mobile for performance

    const parallaxElements = document.querySelectorAll('[data-parallax]');

    if (parallaxElements.length === 0) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateParallax(parallaxElements);
                ticking = false;
            });
            ticking = true;
        }
    });
}

function updateParallax(elements) {
    const scrolled = window.pageYOffset;

    elements.forEach(el => {
        const speed = el.dataset.parallax || 0.5;
        const yPos = -(scrolled * speed);
        el.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
}

/* ========================================================================
   UTILITY FUNCTIONS
   ======================================================================== */

// Add animation class to element
function animateElement(element, animationClass) {
    element.classList.add(animationClass);
}

// Remove animation class after completion
function removeAnimationClass(element, animationClass) {
    element.addEventListener('animationend', () => {
        element.classList.remove(animationClass);
    }, { once: true });
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export for use in other scripts if needed
window.RecoveryAnimations = {
    animateElement,
    removeAnimationClass,
    isInViewport,
    debounce
};
