// Base JavaScript - Core functionality for Umrah Travel Management System

// Global configuration
const APP_CONFIG = {
    name: 'Umrah Travel Management System',
    version: '1.0.0',
    debug: true
};

// Utility functions
const Utils = {
    // Console logging with debug mode
    log: function(message, type = 'info') {
        if (APP_CONFIG.debug) {
            switch(type) {
                case 'error':
                    console.error(`[${APP_CONFIG.name}] ${message}`);
                    break;
                case 'warn':
                    console.warn(`[${APP_CONFIG.name}] ${message}`);
                    break;
                default:
                    console.log(`[${APP_CONFIG.name}] ${message}`);
            }
        }
    },

    // Add event listener with fallback
    addEvent: function(element, event, handler) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + event, handler);
        }
    },

    // Remove event listener
    removeEvent: function(element, event, handler) {
        if (element.removeEventListener) {
            element.removeEventListener(event, handler, false);
        } else if (element.detachEvent) {
            element.detachEvent('on' + event, handler);
        }
    },

    // Query selector wrapper
    $: function(selector, context = document) {
        return context.querySelector(selector);
    },

    // Query selector all wrapper
    $$: function(selector, context = document) {
        return context.querySelectorAll(selector);
    },

    // Add class
    addClass: function(element, className) {
        if (element.classList) {
            element.classList.add(className);
        } else {
            element.className += ' ' + className;
        }
    },

    // Remove class
    removeClass: function(element, className) {
        if (element.classList) {
            element.classList.remove(className);
        } else {
            element.className = element.className.replace(
                new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' '
            );
        }
    },

    // Toggle class
    toggleClass: function(element, className) {
        if (element.classList) {
            element.classList.toggle(className);
        } else {
            if (this.hasClass(element, className)) {
                this.removeClass(element, className);
            } else {
                this.addClass(element, className);
            }
        }
    },

    // Check if has class
    hasClass: function(element, className) {
        if (element.classList) {
            return element.classList.contains(className);
        } else {
            return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
        }
    },

    // Smooth scroll to element
    smoothScroll: function(target, duration = 800) {
        const targetElement = typeof target === 'string' ? this.$(target) : target;
        if (!targetElement) return;

        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    },

    // Debounce function
    debounce: function(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },

    // Form validation
    validateForm: function(formElement) {
        const inputs = formElement.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                this.addClass(input, 'error');
                this.showError(input, 'This field is required');
            } else {
                this.removeClass(input, 'error');
                this.removeError(input);
            }

            // Email validation
            if (input.type === 'email' && input.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    isValid = false;
                    this.addClass(input, 'error');
                    this.showError(input, 'Please enter a valid email address');
                }
            }
        });

        return isValid;
    },

    // Show error message
    showError: function(input, message) {
        const errorElement = input.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
        } else {
            const error = document.createElement('span');
            error.className = 'error-message';
            error.textContent = message;
            error.style.color = 'red';
            error.style.fontSize = '0.85rem';
            error.style.marginTop = '5px';
            error.style.display = 'block';
            input.parentElement.appendChild(error);
        }
    },

    // Remove error message
    removeError: function(input) {
        const errorElement = input.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    },

    // Local storage wrapper
    storage: {
        set: function(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch(e) {
                Utils.log('Storage set error: ' + e, 'error');
                return false;
            }
        },

        get: function(key) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch(e) {
                Utils.log('Storage get error: ' + e, 'error');
                return null;
            }
        },

        remove: function(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch(e) {
                Utils.log('Storage remove error: ' + e, 'error');
                return false;
            }
        },

        clear: function() {
            try {
                localStorage.clear();
                return true;
            } catch(e) {
                Utils.log('Storage clear error: ' + e, 'error');
                return false;
            }
        }
    }
};

// Animation observer for fade-in effects
const AnimationObserver = {
    init: function() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    Utils.addClass(entry.target, 'visible');
                }
            });
        }, observerOptions);

        // Observe all elements with animation classes
        const animatedElements = Utils.$$('.fade-in-on-scroll, .slide-in-on-scroll');
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }
};

// Toast notification system
const Toast = {
    show: function(message, type = 'info', duration = 3000) {
        // Remove existing toast
        const existingToast = Utils.$('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getIcon(type)}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;

        // Style the toast
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '10px',
            backgroundColor: this.getColor(type),
            color: '#fff',
            zIndex: '9999',
            animation: 'slideInRight 0.3s ease-out',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        });

        document.body.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    getIcon: function(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    },

    getColor: function(type) {
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        return colors[type] || colors.info;
    }
};

// Loading indicator
const Loader = {
    show: function(target = document.body) {
        const loader = document.createElement('div');
        loader.className = 'loader-overlay';
        loader.innerHTML = `
            <div class="loader-spinner">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>
        `;

        Object.assign(loader.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '9998'
        });

        target.style.position = 'relative';
        target.appendChild(loader);
    },

    hide: function(target = document.body) {
        const loader = target.querySelector('.loader-overlay');
        if (loader) {
            loader.remove();
        }
    }
};

// Initialize base functionality
document.addEventListener('DOMContentLoaded', function() {
    Utils.log('Base.js initialized');

    // Initialize animation observer
    if ('IntersectionObserver' in window) {
        AnimationObserver.init();
    }

    // Add CSS for animations
    if (!Utils.$('#base-animations')) {
        const style = document.createElement('style');
        style.id = 'base-animations';
        style.innerHTML = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #4CAF50;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .fade-in-on-scroll {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease-out, transform 0.6s ease-out;
            }

            .fade-in-on-scroll.visible {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }
});

// Export for use in other scripts
window.Utils = Utils;
window.Toast = Toast;
window.Loader = Loader;