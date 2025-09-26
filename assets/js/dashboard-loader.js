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

            // Execute any scripts in the loaded content
            const scripts = container.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                newScript.textContent = script.textContent;
                document.body.appendChild(newScript);
                document.body.removeChild(newScript);
            });

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
        // Initialize pagination
        initializePagination();

        // Search functionality
        const searchInput = Utils.$('#bookingSearch');
        if (searchInput) {
            Utils.addEvent(searchInput, 'input', function() {
                filterBookings(this.value.toLowerCase());
                resetPagination();
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
                resetPagination();
            });
        });

        // Action buttons
        setupBookingActions();
    }

    // Pagination configuration
    const paginationConfig = {
        currentPage: 1,
        itemsPerPage: 7,
        totalItems: 42,
        totalPages: 6
    };

    // Initialize pagination
    function initializePagination() {
        // Show first page
        showPage(1);

        // Previous button
        const prevBtn = Utils.$('#prevPage');
        if (prevBtn) {
            Utils.addEvent(prevBtn, 'click', function() {
                if (paginationConfig.currentPage > 1) {
                    showPage(paginationConfig.currentPage - 1);
                }
            });
        }

        // Next button
        const nextBtn = Utils.$('#nextPage');
        if (nextBtn) {
            Utils.addEvent(nextBtn, 'click', function() {
                if (paginationConfig.currentPage < paginationConfig.totalPages) {
                    showPage(paginationConfig.currentPage + 1);
                }
            });
        }

        // Page number buttons
        const pageNums = Utils.$$('.page-num');
        pageNums.forEach(btn => {
            Utils.addEvent(btn, 'click', function() {
                const page = parseInt(this.dataset.page);
                showPage(page);
            });
        });
    }

    // Show specific page
    function showPage(pageNum) {
        // Update current page
        paginationConfig.currentPage = pageNum;

        // Get all visible rows (not filtered out)
        const allRows = Utils.$$('.bookings-table tbody tr');
        const visibleRows = Array.from(allRows).filter(row => {
            return row.style.display !== 'none';
        });

        // Calculate start and end
        const start = (pageNum - 1) * paginationConfig.itemsPerPage;
        const end = start + paginationConfig.itemsPerPage;

        // Hide all rows first
        allRows.forEach(row => {
            Utils.removeClass(row, 'visible');
        });

        // Show only rows for current page
        for (let i = start; i < end && i < visibleRows.length; i++) {
            Utils.addClass(visibleRows[i], 'visible');
        }

        // Update pagination info
        updatePaginationInfo(start, Math.min(end, visibleRows.length), visibleRows.length);

        // Update button states
        updatePaginationButtons(pageNum);
    }

    // Update pagination info text
    function updatePaginationInfo(start, end, total) {
        const startEl = Utils.$('#showing-start');
        const endEl = Utils.$('#showing-end');
        const totalEl = Utils.$('#total-bookings');

        if (startEl) startEl.textContent = start + 1;
        if (endEl) endEl.textContent = end;
        if (totalEl) totalEl.textContent = total;
    }

    // Update pagination button states
    function updatePaginationButtons(currentPage) {
        // Previous/Next buttons
        const prevBtn = Utils.$('#prevPage');
        const nextBtn = Utils.$('#nextPage');

        if (prevBtn) {
            prevBtn.disabled = currentPage === 1;
        }

        if (nextBtn) {
            nextBtn.disabled = currentPage === paginationConfig.totalPages;
        }

        // Page number buttons
        const pageNums = Utils.$$('.page-num');
        pageNums.forEach(btn => {
            const page = parseInt(btn.dataset.page);
            if (page === currentPage) {
                Utils.addClass(btn, 'active');
            } else {
                Utils.removeClass(btn, 'active');
            }
        });
    }

    // Reset pagination to first page
    function resetPagination() {
        showPage(1);
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
        // Setup modal close handlers
        setupBookingModalHandlers();

        // View buttons
        const viewBtns = Utils.$$('.btn-icon.view');
        viewBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();
                const row = this.closest('tr');
                openViewBookingModal(row);
            });
        });

        // Edit buttons
        const editBtns = Utils.$$('.btn-icon.edit');
        editBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();
                const row = this.closest('tr');
                openEditBookingModal(row);
            });
        });

        // Cancel/Delete buttons
        const deleteBtns = Utils.$$('.btn-icon.delete');
        deleteBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();
                const row = this.closest('tr');
                openCancelBookingModal(row);
            });
        });

        // Restore buttons
        const restoreBtns = Utils.$$('.btn-icon.restore');
        restoreBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();
                const row = this.closest('tr');
                openRestoreBookingModal(row);
            });
        });
    }

    // Setup booking modal handlers
    function setupBookingModalHandlers() {
        // Modal close buttons
        const closeButtons = Utils.$$('.modal-close, .modal-cancel');
        closeButtons.forEach(btn => {
            Utils.addEvent(btn, 'click', function() {
                const modal = this.closest('.modal');
                closeBookingModal(modal);
            });
        });

        // Close modal when clicking outside
        const modals = Utils.$$('.modal');
        modals.forEach(modal => {
            Utils.addEvent(modal, 'click', function(e) {
                if (e.target === this) {
                    closeBookingModal(this);
                }
            });
        });

        // Edit form submission
        const editForm = Utils.$('#editBookingForm');
        if (editForm) {
            Utils.addEvent(editForm, 'submit', function(e) {
                e.preventDefault();
                handleEditBookingSubmit(this);
            });
        }

        // Cancel booking confirmation
        const confirmCancelBtn = Utils.$('#confirmCancel');
        if (confirmCancelBtn) {
            Utils.addEvent(confirmCancelBtn, 'click', function() {
                handleCancelBooking();
            });
        }

        // Restore booking confirmation
        const confirmRestoreBtn = Utils.$('#confirmRestore');
        if (confirmRestoreBtn) {
            Utils.addEvent(confirmRestoreBtn, 'click', function() {
                handleRestoreBooking();
            });
        }

        // Print booking
        const printBtn = Utils.$('#printBooking');
        if (printBtn) {
            Utils.addEvent(printBtn, 'click', function() {
                window.print();
                Toast.show('Opening print dialog...', 'info');
            });
        }
    }

    // Current booking row reference
    let currentBookingRow = null;

    // Open View Booking Modal
    function openViewBookingModal(row) {
        currentBookingRow = row;
        const modal = Utils.$('#viewBookingModal');

        // Populate modal with row data
        Utils.$('#viewBookingId').textContent = row.cells[0].textContent;
        Utils.$('#viewCustomerName').textContent = row.cells[1].textContent;
        Utils.$('#viewPackageName').textContent = row.cells[2].textContent;
        Utils.$('#viewTravelDate').textContent = row.cells[3].textContent;
        Utils.$('#viewAmount').textContent = row.cells[4].textContent;

        // Set status
        const statusBadge = row.querySelector('.status-badge');
        const viewStatus = Utils.$('#viewStatus');
        viewStatus.textContent = statusBadge.textContent;
        viewStatus.className = statusBadge.className;

        // Mock additional data
        Utils.$('#viewBookingDate').textContent = '2025-09-15';
        Utils.$('#viewCustomerEmail').textContent = 'customer@example.com';
        Utils.$('#viewCustomerPhone').textContent = '+1 234-567-8900';
        Utils.$('#viewPassport').textContent = 'AB' + Math.floor(Math.random() * 1000000);
        Utils.$('#viewDuration').textContent = '21 Days';
        Utils.$('#viewNotes').textContent = 'Customer requested halal meals and wheelchair accessibility.';

        openBookingModal(modal);
    }

    // Open Edit Booking Modal
    function openEditBookingModal(row) {
        currentBookingRow = row;
        const modal = Utils.$('#editBookingModal');

        // Populate form with row data
        Utils.$('#editBookingIdInput').value = row.cells[0].textContent;
        Utils.$('#editCustomerName').value = row.cells[1].textContent;
        Utils.$('#editPackage').value = row.cells[2].textContent;
        Utils.$('#editTravelDate').value = row.cells[3].textContent;

        // Set status
        const statusBadge = row.querySelector('.status-badge');
        Utils.$('#editBookingStatus').value = row.dataset.status;

        // Mock additional data
        Utils.$('#editEmail').value = 'customer@example.com';
        Utils.$('#editPhone').value = '+1 234-567-8900';
        Utils.$('#editPassport').value = 'AB' + Math.floor(Math.random() * 1000000);
        Utils.$('#editNotes').value = 'Customer requested halal meals.';

        openBookingModal(modal);
    }

    // Open Cancel Booking Modal
    function openCancelBookingModal(row) {
        currentBookingRow = row;
        const modal = Utils.$('#cancelBookingModal');
        const bookingId = row.cells[0].textContent;

        Utils.$('#cancelBookingId').textContent = bookingId;
        Utils.$('#cancellationReason').value = '';

        openBookingModal(modal);
    }

    // Open Restore Booking Modal
    function openRestoreBookingModal(row) {
        currentBookingRow = row;
        const modal = Utils.$('#restoreBookingModal');
        const bookingId = row.cells[0].textContent;

        Utils.$('#restoreBookingId').textContent = bookingId;

        openBookingModal(modal);
    }

    // Generic open modal function
    function openBookingModal(modal) {
        if (modal) {
            Utils.addClass(modal, 'active');
        }
    }

    // Generic close modal function
    function closeBookingModal(modal) {
        if (modal) {
            Utils.removeClass(modal, 'active');
            currentBookingRow = null;
        }
    }

    // Handle Edit Booking Submit
    function handleEditBookingSubmit(form) {
        if (!Utils.validateForm(form)) {
            return;
        }

        // Update row with new data
        if (currentBookingRow) {
            const formData = new FormData(form);
            currentBookingRow.cells[1].textContent = formData.get('customerName');
            currentBookingRow.cells[2].textContent = formData.get('package');
            currentBookingRow.cells[3].textContent = formData.get('travelDate');

            // Update status
            const newStatus = formData.get('status');
            const statusBadge = currentBookingRow.querySelector('.status-badge');
            statusBadge.className = `status-badge ${newStatus}`;
            statusBadge.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
            currentBookingRow.dataset.status = newStatus;
        }

        Toast.show('Booking updated successfully!', 'success');
        closeBookingModal(form.closest('.modal'));
    }

    // Handle Cancel Booking
    function handleCancelBooking() {
        if (currentBookingRow) {
            // Update status to cancelled
            const statusBadge = currentBookingRow.querySelector('.status-badge');
            statusBadge.className = 'status-badge cancelled';
            statusBadge.textContent = 'Cancelled';
            currentBookingRow.dataset.status = 'cancelled';

            // Replace action buttons
            const actions = currentBookingRow.querySelector('.action-buttons');
            actions.innerHTML = `
                <button class="btn-icon view" title="View Details"><i class="fas fa-eye"></i></button>
                <button class="btn-icon restore" title="Restore"><i class="fas fa-undo"></i></button>
            `;

            const bookingId = currentBookingRow.cells[0].textContent;
            Toast.show(`Booking ${bookingId} cancelled successfully`, 'success');

            // Re-initialize buttons
            setupBookingActions();
        }

        closeBookingModal(Utils.$('#cancelBookingModal'));
    }

    // Handle Restore Booking
    function handleRestoreBooking() {
        if (currentBookingRow) {
            // Update status to confirmed
            const statusBadge = currentBookingRow.querySelector('.status-badge');
            statusBadge.className = 'status-badge confirmed';
            statusBadge.textContent = 'Confirmed';
            currentBookingRow.dataset.status = 'confirmed';

            // Replace action buttons
            const actions = currentBookingRow.querySelector('.action-buttons');
            actions.innerHTML = `
                <button class="btn-icon view" title="View Details"><i class="fas fa-eye"></i></button>
                <button class="btn-icon edit" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" title="Cancel"><i class="fas fa-times"></i></button>
            `;

            const bookingId = currentBookingRow.cells[0].textContent;
            Toast.show(`Booking ${bookingId} restored successfully`, 'success');

            // Re-initialize buttons
            setupBookingActions();
        }

        closeBookingModal(Utils.$('#restoreBookingModal'));
    }

    // User Management initialization
    function initializeUserManagement() {
        // Initialize user display if the function exists
        if (typeof window.initializeUsersDisplay === 'function') {
            window.initializeUsersDisplay();
        }

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