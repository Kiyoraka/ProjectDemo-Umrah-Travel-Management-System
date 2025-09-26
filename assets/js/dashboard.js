// Dashboard JavaScript - Admin Panel Functionality

(function() {
    'use strict';

    // Dashboard configuration
    const config = {
        currentSection: 'main',
        sidebarCollapsed: false,
        isAuthenticated: false
    };

    // Initialize dashboard
    function init() {
        Utils.log('Dashboard.js initialized');

        // Check authentication
        checkAuth();

        // Setup sidebar navigation
        setupSidebar();

        // Setup logout functionality
        setupLogout();

        // Setup sidebar toggle
        setupSidebarToggle();

        // Setup form handlers
        setupForms();

        // Initialize charts/stats if needed
        initializeStats();
    }

    // Check if user is authenticated
    function checkAuth() {
        const isLoggedIn = Utils.storage.get('isLoggedIn');

        if (!isLoggedIn) {
            // Redirect to login page if not authenticated
            Toast.show('Please login to access the dashboard', 'warning');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
            return false;
        }

        config.isAuthenticated = true;
        return true;
    }

    // Setup sidebar navigation
    function setupSidebar() {
        const navItems = Utils.$$('.nav-item');

        navItems.forEach(item => {
            Utils.addEvent(item, 'click', function(e) {
                e.preventDefault();
                const section = this.dataset.section;
                navigateToSection(section);
            });
        });
    }

    // Navigate to dashboard section
    function navigateToSection(sectionName) {
        // Update active nav item
        const navItems = Utils.$$('.nav-item');
        navItems.forEach(item => {
            if (item.dataset.section === sectionName) {
                Utils.addClass(item, 'active');
            } else {
                Utils.removeClass(item, 'active');
            }
        });

        // Hide all sections
        const sections = Utils.$$('.dashboard-section');
        sections.forEach(section => {
            Utils.removeClass(section, 'active');
        });

        // Show selected section
        const targetSection = Utils.$(`#${sectionName}-section`);
        if (targetSection) {
            Utils.addClass(targetSection, 'active');

            // Update page title
            updatePageTitle(sectionName);

            // Store current section
            config.currentSection = sectionName;
        }
    }

    // Update page title
    function updatePageTitle(sectionName) {
        const pageTitle = Utils.$('.page-title');
        if (pageTitle) {
            const titles = {
                main: 'Dashboard',
                content: 'Content Management',
                packages: 'Package Management',
                users: 'User Management',
                messages: 'Messages',
                settings: 'Settings'
            };
            pageTitle.textContent = titles[sectionName] || 'Dashboard';
        }
    }

    // Setup sidebar toggle
    function setupSidebarToggle() {
        const toggleBtn = Utils.$('.sidebar-toggle');
        const sidebar = Utils.$('.sidebar');

        if (toggleBtn && sidebar) {
            Utils.addEvent(toggleBtn, 'click', function() {
                Utils.toggleClass(sidebar, 'collapsed');
                config.sidebarCollapsed = !config.sidebarCollapsed;

                // Store preference
                Utils.storage.set('sidebarCollapsed', config.sidebarCollapsed);
            });

            // Check stored preference
            const storedPreference = Utils.storage.get('sidebarCollapsed');
            if (storedPreference) {
                config.sidebarCollapsed = storedPreference;
                if (config.sidebarCollapsed) {
                    Utils.addClass(sidebar, 'collapsed');
                }
            }
        }
    }

    // Setup logout functionality
    function setupLogout() {
        const logoutBtn = Utils.$('.logout-btn');

        if (logoutBtn) {
            Utils.addEvent(logoutBtn, 'click', function(e) {
                e.preventDefault();
                handleLogout();
            });
        }
    }

    // Handle logout
    function handleLogout() {
        // Clear storage
        Utils.storage.remove('isLoggedIn');
        Utils.storage.remove('userEmail');

        // Show message
        Toast.show('Logging out...', 'info');

        // Redirect to home page
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    }

    // Setup form handlers
    function setupForms() {
        // Settings forms
        const settingsForms = Utils.$$('.settings-form');
        settingsForms.forEach(form => {
            Utils.addEvent(form, 'submit', function(e) {
                e.preventDefault();
                handleSettingsUpdate(this);
            });
        });

        // Add/Edit buttons
        setupCrudButtons();
    }

    // Handle settings update
    function handleSettingsUpdate(form) {
        // Validate form
        if (!Utils.validateForm(form)) {
            return;
        }

        // Show loader
        Loader.show(form);

        // Simulate save
        setTimeout(() => {
            Loader.hide(form);
            Toast.show('Settings saved successfully!', 'success');
        }, 1500);
    }

    // Setup CRUD buttons
    function setupCrudButtons() {
        // Edit buttons
        const editBtns = Utils.$$('.btn-icon.edit');
        editBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();
                const row = this.closest('tr');
                const itemName = row.cells[1].textContent;
                Toast.show(`Edit: ${itemName}`, 'info');
                // Here you would open an edit modal/form
            });
        });

        // Delete buttons
        const deleteBtns = Utils.$$('.btn-icon.delete');
        deleteBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();
                const row = this.closest('tr');
                const itemName = row.cells[1].textContent;

                if (confirm(`Are you sure you want to delete ${itemName}?`)) {
                    row.style.opacity = '0.5';
                    Toast.show(`${itemName} deleted successfully`, 'success');
                    setTimeout(() => {
                        row.remove();
                    }, 1000);
                }
            });
        });

        // Add New buttons
        const addBtns = Utils.$$('button:contains("Add New")');
        addBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();
                Toast.show('Add new item form would open here', 'info');
                // Here you would open an add new modal/form
            });
        });

        // View Message buttons
        const viewBtns = Utils.$$('.message-card button');
        viewBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();
                const card = this.closest('.message-card');
                Utils.removeClass(card, 'unread');
                Toast.show('Opening message...', 'info');
                // Here you would open the full message view
            });
        });

        // Edit Content buttons
        const editContentBtns = Utils.$$('.content-card button');
        editContentBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();
                const card = this.closest('.content-card');
                const contentType = card.querySelector('h4').textContent;
                Toast.show(`Editing ${contentType}`, 'info');
                // Here you would open content editor
            });
        });
    }

    // Initialize statistics
    function initializeStats() {
        // Animate stat values on load
        const statValues = Utils.$$('.stat-value');
        statValues.forEach(stat => {
            const finalValue = stat.textContent;
            const isNumber = /^\d+/.test(finalValue);

            if (isNumber) {
                const number = parseInt(finalValue.replace(/\D/g, ''));
                let current = 0;
                const increment = Math.ceil(number / 30);
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= number) {
                        current = number;
                        clearInterval(timer);
                    }
                    stat.textContent = finalValue.replace(number, current);
                }, 50);
            }
        });

        // Update time stamps
        updateTimeStamps();
    }

    // Update relative time stamps
    function updateTimeStamps() {
        const timeElements = Utils.$$('.activity-time, .message-time');
        // This would normally calculate relative times
        // For demo, we'll leave them as is
    }

    // Mobile sidebar handling
    function setupMobileSidebar() {
        const sidebar = Utils.$('.sidebar');

        // Close sidebar when clicking outside on mobile
        Utils.addEvent(document, 'click', function(e) {
            if (window.innerWidth <= 1024) {
                if (!sidebar.contains(e.target) && !e.target.classList.contains('sidebar-toggle')) {
                    Utils.removeClass(sidebar, 'active');
                }
            }
        });

        // Toggle sidebar on mobile
        const toggleBtn = Utils.$('.sidebar-toggle');
        if (toggleBtn) {
            Utils.addEvent(toggleBtn, 'click', function() {
                if (window.innerWidth <= 1024) {
                    Utils.toggleClass(sidebar, 'active');
                }
            });
        }
    }

    // Add button contains selector helper (jQuery-like)
    function setupButtonContains() {
        const buttons = Utils.$$('button');
        buttons.forEach(btn => {
            if (btn.textContent.includes('Add New')) {
                Utils.addEvent(btn, 'click', function(e) {
                    e.preventDefault();
                    const section = this.closest('.dashboard-section').id.replace('-section', '');
                    Toast.show(`Opening add new ${section} form...`, 'info');
                });
            }
        });
    }

    // Handle window resize
    function handleResize() {
        const sidebar = Utils.$('.sidebar');

        if (window.innerWidth > 1024) {
            Utils.removeClass(sidebar, 'active');
        }
    }

    // Initialize when DOM is ready
    Utils.addEvent(document, 'DOMContentLoaded', function() {
        init();
        setupMobileSidebar();
        setupButtonContains();
    });

    // Handle window resize
    Utils.addEvent(window, 'resize', Utils.debounce(handleResize, 250));

})();