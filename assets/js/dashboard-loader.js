// Dashboard Loader - Dynamic Section Loading System

(function() {
    'use strict';

    // Configuration
    const config = {
        currentSection: 'main',
        sectionPaths: {
            main: 'sections/main-dashboard.html',
            content: 'sections/content-management.html',
            packages: 'sections/package-management.html',
            bookings: 'sections/booking-management.html',
            users: 'sections/user-management.html',
            messages: 'sections/messages.html',
            settings: 'sections/settings.html'
        }
    };

    // Initialize dashboard
    function init() {
        console.log('Dashboard Loader initialized');

        // Check authentication
        if (!checkAuth()) return;

        // Setup navigation
        setupNavigation();

        // Setup logout
        setupLogout();

        // Load initial section
        loadSection('main');
    }

    // Check authentication
    function checkAuth() {
        const isLoggedIn = Utils.storage.get('isLoggedIn');

        if (!isLoggedIn) {
            Toast.show('Please login to access the dashboard', 'warning');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
            return false;
        }

        return true;
    }

    // Setup navigation
    function setupNavigation() {
        const navItems = Utils.$$('.nav-item');

        navItems.forEach(item => {
            Utils.addEvent(item, 'click', function(e) {
                e.preventDefault();
                const section = this.dataset.section;

                // Update active nav
                navItems.forEach(nav => Utils.removeClass(nav, 'active'));
                Utils.addClass(this, 'active');

                // Load section
                loadSection(section);
            });
        });
    }

    // Load section dynamically
    async function loadSection(sectionName) {
        const container = Utils.$('#content-container');
        const sectionPath = config.sectionPaths[sectionName];

        if (!sectionPath) {
            console.error(`Section ${sectionName} not found`);
            return;
        }

        // Show loader
        Loader.show(container);

        try {
            // Fetch the HTML content
            const response = await fetch(sectionPath);

            if (!response.ok) {
                throw new Error(`Failed to load section: ${response.status}`);
            }

            const html = await response.text();

            // Update container
            container.innerHTML = html;

            // Store current section
            config.currentSection = sectionName;

            // Initialize section-specific functionality
            initializeSectionFeatures(sectionName);

            // Hide loader
            Loader.hide(container);

            // Animate entry
            animateSection();

        } catch (error) {
            console.error('Error loading section:', error);
            Loader.hide(container);

            container.innerHTML = `
                <div class="error-message glass-card">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error Loading Section</h3>
                    <p>Unable to load ${sectionName} section. Please try again.</p>
                </div>
            `;
        }
    }

    // Initialize section-specific features
    function initializeSectionFeatures(sectionName) {
        switch(sectionName) {
            case 'main':
                initializeMainDashboard();
                break;
            case 'content':
                initializeContentManagement();
                break;
            case 'packages':
                initializePackageManagement();
                break;
            case 'bookings':
                initializeBookingManagement();
                break;
            case 'users':
                initializeUserManagement();
                break;
            case 'messages':
                initializeMessages();
                break;
            case 'settings':
                initializeSettings();
                break;
        }
    }

    // Main Dashboard initialization
    function initializeMainDashboard() {
        // Animate stat cards
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
    }

    // Content Management initialization
    function initializeContentManagement() {
        // Setup tabs
        const tabBtns = Utils.$$('.tab-btn');

        tabBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();

                // Update active tab
                tabBtns.forEach(b => Utils.removeClass(b, 'active'));
                const panels = Utils.$$('.tab-panel');
                panels.forEach(p => Utils.removeClass(p, 'active'));

                // Activate clicked tab
                Utils.addClass(btn, 'active');
                const tabName = btn.dataset.tab;
                const targetPanel = Utils.$(`#${tabName}-tab`);
                if (targetPanel) {
                    Utils.addClass(targetPanel, 'active');
                }
            });
        });

        // Setup forms
        const forms = Utils.$$('.content-form');
        forms.forEach(form => {
            Utils.addEvent(form, 'submit', function(e) {
                e.preventDefault();
                handleFormSubmit(this);
            });
        });
    }

    // Package Management initialization
    function initializePackageManagement() {
        // Add Package button
        const addBtn = Utils.$('#addPackageBtn');
        if (addBtn) {
            Utils.addEvent(addBtn, 'click', function(e) {
                e.preventDefault();
                openAddPackageModal();
            });
        }

        // Edit buttons
        const editBtns = Utils.$$('.btn-icon.edit');
        editBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();
                const row = this.closest('tr');
                openEditPackageModal(row);
            });
        });

        // Delete buttons
        const deleteBtns = Utils.$$('.btn-icon.delete');
        deleteBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();
                const row = this.closest('tr');
                openDeletePackageModal(row);
            });
        });
    }

    // Booking Management initialization
    function initializeBookingManagement() {
        // Search functionality
        const searchInput = Utils.$('#bookingSearch');
        if (searchInput) {
            Utils.addEvent(searchInput, 'input', function() {
                filterBookings(this.value.toLowerCase());
            });
        }

        // Filter buttons
        const filterBtns = Utils.$$('.filter-btn');
        filterBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();

                // Update active filter
                filterBtns.forEach(b => Utils.removeClass(b, 'active'));
                Utils.addClass(btn, 'active');

                // Filter table
                const filter = btn.dataset.filter;
                filterBookingsByStatus(filter);
            });
        });

        // Action buttons
        setupBookingActions();
    }

    // Filter bookings by search
    function filterBookings(searchTerm) {
        const rows = Utils.$$('.bookings-table tbody tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    // Filter bookings by status
    function filterBookingsByStatus(status) {
        const rows = Utils.$$('.bookings-table tbody tr');

        rows.forEach(row => {
            if (status === 'all' || row.dataset.status === status) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    // Setup booking action buttons
    function setupBookingActions() {
        // View buttons
        const viewBtns = Utils.$$('.btn-icon.view');
        viewBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();
                const row = this.closest('tr');
                const bookingId = row.cells[0].textContent;
                Toast.show(`Viewing booking ${bookingId}`, 'info');
            });
        });

        // Edit buttons
        const editBtns = Utils.$$('.btn-icon.edit');
        editBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();
                const row = this.closest('tr');
                const bookingId = row.cells[0].textContent;
                Toast.show(`Editing booking ${bookingId}`, 'info');
            });
        });

        // Cancel/Delete buttons
        const deleteBtns = Utils.$$('.btn-icon.delete');
        deleteBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();
                const row = this.closest('tr');
                const bookingId = row.cells[0].textContent;
                if (confirm(`Cancel booking ${bookingId}?`)) {
                    // Update status to cancelled
                    const statusBadge = row.querySelector('.status-badge');
                    statusBadge.className = 'status-badge cancelled';
                    statusBadge.textContent = 'Cancelled';
                    row.dataset.status = 'cancelled';

                    // Replace action buttons
                    const actions = row.querySelector('.action-buttons');
                    actions.innerHTML = `
                        <button class="btn-icon view" title="View Details"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon restore" title="Restore"><i class="fas fa-undo"></i></button>
                    `;

                    Toast.show(`Booking ${bookingId} cancelled`, 'success');

                    // Re-initialize buttons for this row
                    setupBookingActions();
                }
            });
        });

        // Restore buttons
        const restoreBtns = Utils.$$('.btn-icon.restore');
        restoreBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();
                const row = this.closest('tr');
                const bookingId = row.cells[0].textContent;

                // Update status to confirmed
                const statusBadge = row.querySelector('.status-badge');
                statusBadge.className = 'status-badge confirmed';
                statusBadge.textContent = 'Confirmed';
                row.dataset.status = 'confirmed';

                // Replace action buttons
                const actions = row.querySelector('.action-buttons');
                actions.innerHTML = `
                    <button class="btn-icon view" title="View Details"><i class="fas fa-eye"></i></button>
                    <button class="btn-icon edit" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete" title="Cancel"><i class="fas fa-times"></i></button>
                `;

                Toast.show(`Booking ${bookingId} restored`, 'success');

                // Re-initialize buttons for this row
                setupBookingActions();
            });
        });
    }

    // User Management initialization
    function initializeUserManagement() {
        // Setup user management features
        console.log('User Management initialized');
    }

    // Messages initialization
    function initializeMessages() {
        // Setup message features
        const viewBtns = Utils.$$('.message-card button');
        viewBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();
                const card = this.closest('.message-card');
                Utils.removeClass(card, 'unread');
                Toast.show('Opening message...', 'info');
            });
        });
    }

    // Settings initialization
    function initializeSettings() {
        // Setup settings forms
        const forms = Utils.$$('.settings-form');
        forms.forEach(form => {
            Utils.addEvent(form, 'submit', function(e) {
                e.preventDefault();
                handleFormSubmit(this);
            });
        });
    }

    // Handle form submission
    function handleFormSubmit(form) {
        if (!Utils.validateForm(form)) {
            return;
        }

        Loader.show(form);

        setTimeout(() => {
            Loader.hide(form);
            Toast.show('Changes saved successfully!', 'success');
        }, 1500);
    }

    // Animate section entry
    function animateSection() {
        const elements = Utils.$$('.glass-card, .stat-card');
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';

            setTimeout(() => {
                el.style.transition = 'all 0.5s ease-out';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    // Setup logout
    function setupLogout() {
        const logoutBtn = Utils.$('.logout-btn');

        if (logoutBtn) {
            Utils.addEvent(logoutBtn, 'click', function(e) {
                e.preventDefault();

                // Clear storage
                Utils.storage.remove('isLoggedIn');
                Utils.storage.remove('userEmail');

                // Show message
                Toast.show('Logging out...', 'info');

                // Redirect
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1000);
            });
        }
    }

    // Modal functions (placeholders - will use existing modal system)
    function openAddPackageModal() {
        Toast.show('Add Package modal would open here', 'info');
    }

    function openEditPackageModal(row) {
        const packageName = row.cells[1].textContent;
        Toast.show(`Edit Package: ${packageName}`, 'info');
    }

    function openDeletePackageModal(row) {
        const packageName = row.cells[1].textContent;
        Toast.show(`Delete Package: ${packageName}`, 'info');
    }

    // Initialize when DOM is ready
    Utils.addEvent(document, 'DOMContentLoaded', init);

})();