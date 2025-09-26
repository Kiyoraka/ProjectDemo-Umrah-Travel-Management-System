// Landing Page JavaScript - Animations and Interactions

(function() {
    'use strict';

    // Landing page configuration
    const config = {
        currentSection: 0,
        totalSections: 4,
        isAnimating: false,
        animationDuration: 800
    };

    // Section names for navigation
    const sections = ['home', 'about', 'packages', 'contact'];

    // Initialize landing page
    function init() {
        Utils.log('Landing.js initialized');

        // Setup navigation
        setupVerticalNav();

        // Setup login modal
        setupLoginModal();

        // Setup form handlers
        setupForms();

        // Setup scroll animations
        setupScrollAnimations();

        // Initialize first section
        navigateToSection(0);
    }

    // Setup vertical navigation
    function setupVerticalNav() {
        const navItems = Utils.$$('.nav-item');
        const loginBtn = Utils.$('.nav-login-btn');

        // Navigation dots click handlers
        navItems.forEach((item, index) => {
            Utils.addEvent(item, 'click', function() {
                navigateToSection(index);
            });
        });

        // Login button handler
        if (loginBtn) {
            Utils.addEvent(loginBtn, 'click', function(e) {
                e.preventDefault();
                openLoginModal();
            });
        }

        // Keyboard navigation
        Utils.addEvent(document, 'keydown', function(e) {
            if (config.isAnimating) return;

            switch(e.key) {
                case 'ArrowDown':
                case 'PageDown':
                    navigateToSection(Math.min(config.currentSection + 1, config.totalSections - 1));
                    break;
                case 'ArrowUp':
                case 'PageUp':
                    navigateToSection(Math.max(config.currentSection - 1, 0));
                    break;
                case 'Home':
                    navigateToSection(0);
                    break;
                case 'End':
                    navigateToSection(config.totalSections - 1);
                    break;
            }
        });

        // Mouse wheel navigation
        let wheelTimeout;
        Utils.addEvent(window, 'wheel', function(e) {
            if (config.isAnimating) return;

            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(function() {
                if (e.deltaY > 0) {
                    // Scroll down
                    navigateToSection(Math.min(config.currentSection + 1, config.totalSections - 1));
                } else {
                    // Scroll up
                    navigateToSection(Math.max(config.currentSection - 1, 0));
                }
            }, 50);
        });

        // Touch support for mobile
        let touchStartY = 0;
        let touchEndY = 0;

        Utils.addEvent(document, 'touchstart', function(e) {
            touchStartY = e.touches[0].clientY;
        });

        Utils.addEvent(document, 'touchend', function(e) {
            touchEndY = e.changedTouches[0].clientY;
            handleSwipe();
        });

        function handleSwipe() {
            if (config.isAnimating) return;

            const swipeDistance = touchStartY - touchEndY;
            const minSwipeDistance = 50;

            if (Math.abs(swipeDistance) > minSwipeDistance) {
                if (swipeDistance > 0) {
                    // Swipe up
                    navigateToSection(Math.min(config.currentSection + 1, config.totalSections - 1));
                } else {
                    // Swipe down
                    navigateToSection(Math.max(config.currentSection - 1, 0));
                }
            }
        }
    }

    // Navigate to section with animation
    function navigateToSection(sectionIndex) {
        if (config.isAnimating || sectionIndex === config.currentSection) return;

        config.isAnimating = true;

        // Update current section
        config.currentSection = sectionIndex;

        // Animate sections wrapper
        const wrapper = Utils.$('.sections-wrapper');
        if (wrapper) {
            wrapper.style.transform = `translateX(-${sectionIndex * 100}vw)`;
        }

        // Update navigation dots
        updateNavigation(sectionIndex);

        // Trigger section animations
        animateSection(sectionIndex);

        // Reset animation flag
        setTimeout(() => {
            config.isAnimating = false;
        }, config.animationDuration);
    }

    // Update navigation indicators
    function updateNavigation(sectionIndex) {
        const navItems = Utils.$$('.nav-item');
        const navLine = Utils.$('.nav-line');

        // Update active states
        navItems.forEach((item, index) => {
            if (index === sectionIndex) {
                Utils.addClass(item, 'active');
            } else {
                Utils.removeClass(item, 'active');
            }
        });

        // Update line progress
        if (navLine) {
            const progress = (sectionIndex / (config.totalSections - 1)) * 100;
            navLine.style.setProperty('--progress', progress + '%');
        }

        // Update URL hash
        history.replaceState(null, null, '#' + sections[sectionIndex]);
    }

    // Animate section content
    function animateSection(sectionIndex) {
        const section = Utils.$$(`.page-section`)[sectionIndex];
        if (!section) return;

        // Reset animations
        const animatedElements = section.querySelectorAll('.animate-in');
        animatedElements.forEach(el => {
            Utils.removeClass(el, 'animated');
        });

        // Trigger animations with delay
        setTimeout(() => {
            animatedElements.forEach((el, index) => {
                setTimeout(() => {
                    Utils.addClass(el, 'animated');
                }, index * 100);
            });
        }, 300);
    }

    // Setup login modal
    function setupLoginModal() {
        const modal = Utils.$('.modal');
        const closeBtn = Utils.$('.modal-close');
        const loginForm = Utils.$('#loginForm');

        // Close button
        if (closeBtn) {
            Utils.addEvent(closeBtn, 'click', closeLoginModal);
        }

        // Close on background click
        if (modal) {
            Utils.addEvent(modal, 'click', function(e) {
                if (e.target === modal) {
                    closeLoginModal();
                }
            });
        }

        // Close on ESC key
        Utils.addEvent(document, 'keydown', function(e) {
            if (e.key === 'Escape' && Utils.hasClass(modal, 'active')) {
                closeLoginModal();
            }
        });

        // Handle login form submission
        if (loginForm) {
            Utils.addEvent(loginForm, 'submit', function(e) {
                e.preventDefault();
                handleLogin(this);
            });
        }
    }

    // Open login modal
    function openLoginModal() {
        const modal = Utils.$('.modal');
        if (modal) {
            Utils.addClass(modal, 'active');
            // Focus on email input
            setTimeout(() => {
                const emailInput = Utils.$('#email');
                if (emailInput) emailInput.focus();
            }, 100);
        }
    }

    // Close login modal
    function closeLoginModal() {
        const modal = Utils.$('.modal');
        if (modal) {
            Utils.removeClass(modal, 'active');
        }
    }

    // Handle login
    function handleLogin(form) {
        // Validate form
        if (!Utils.validateForm(form)) {
            return;
        }

        // Get form data
        const email = form.email.value;
        const password = form.password.value;
        const remember = form.remember ? form.remember.checked : false;

        // Check hardcoded credentials
        if (email === 'admin@gmail.com' && password === 'admin123') {
            // Show success message
            Toast.show('Login successful! Redirecting to dashboard...', 'success');

            // Store login state if remember is checked
            if (remember) {
                Utils.storage.set('isLoggedIn', true);
                Utils.storage.set('userEmail', email);
            }

            // Redirect to dashboard after delay
            setTimeout(() => {
                window.location.href = './admin/dashboard.html';
            }, 1500);
        } else {
            // Show error message
            Toast.show('Invalid email or password', 'error');

            // Shake the modal
            const modalContent = Utils.$('.modal-content');
            if (modalContent) {
                Utils.addClass(modalContent, 'shake');
                setTimeout(() => {
                    Utils.removeClass(modalContent, 'shake');
                }, 500);
            }
        }
    }

    // Setup contact form
    function setupForms() {
        const contactForm = Utils.$('#contactForm');

        if (contactForm) {
            Utils.addEvent(contactForm, 'submit', function(e) {
                e.preventDefault();
                handleContactForm(this);
            });
        }
    }

    // Handle contact form submission
    function handleContactForm(form) {
        // Validate form
        if (!Utils.validateForm(form)) {
            return;
        }

        // Show loader
        Loader.show(form);

        // Simulate form submission
        setTimeout(() => {
            Loader.hide(form);
            Toast.show('Message sent successfully! We will get back to you soon.', 'success');
            form.reset();
        }, 1500);
    }

    // Setup scroll animations
    function setupScrollAnimations() {
        // Parallax effect for hero section
        const heroContent = Utils.$('.hero-content');
        if (heroContent) {
            Utils.addEvent(window, 'scroll', Utils.debounce(function() {
                const scrolled = window.pageYOffset;
                heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
                heroContent.style.opacity = 1 - (scrolled * 0.002);
            }, 10));
        }

        // Animate elements on scroll
        const animateOnScroll = () => {
            const elements = Utils.$$('.animate-on-scroll');
            const windowHeight = window.innerHeight;

            elements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;

                if (elementTop < windowHeight - elementVisible) {
                    Utils.addClass(element, 'active');
                }
            });
        };

        Utils.addEvent(window, 'scroll', Utils.debounce(animateOnScroll, 100));
    }

    // Package card interactions
    function setupPackageCards() {
        const packageCards = Utils.$$('.package-card');

        packageCards.forEach(card => {
            const bookBtn = card.querySelector('.btn-book');
            if (bookBtn) {
                Utils.addEvent(bookBtn, 'click', function(e) {
                    e.preventDefault();
                    const packageName = card.querySelector('.package-name').textContent;
                    Toast.show(`Booking ${packageName} - Please login to continue`, 'info');
                    openLoginModal();
                });
            }
        });
    }

    // Add shake animation style
    function addAnimationStyles() {
        if (!Utils.$('#landing-animations')) {
            const style = document.createElement('style');
            style.id = 'landing-animations';
            style.innerHTML = `
                .shake {
                    animation: shake 0.5s;
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
                    20%, 40%, 60%, 80% { transform: translateX(10px); }
                }

                .animate-in {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
                }

                .animate-in.animated {
                    opacity: 1;
                    transform: translateY(0);
                }

                .nav-line::before {
                    height: var(--progress, 0);
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Check for direct navigation via hash
    function checkInitialHash() {
        const hash = window.location.hash.replace('#', '');
        const sectionIndex = sections.indexOf(hash);

        if (sectionIndex !== -1) {
            config.currentSection = -1; // Reset to allow navigation
            setTimeout(() => {
                navigateToSection(sectionIndex);
            }, 100);
        }
    }

    // Initialize when DOM is ready
    Utils.addEvent(document, 'DOMContentLoaded', function() {
        init();
        addAnimationStyles();
        setupPackageCards();
        checkInitialHash();
    });

    // Make navigateToSection globally available
    window.navigateToSection = navigateToSection;

})();