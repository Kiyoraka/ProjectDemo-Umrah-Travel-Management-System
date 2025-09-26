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

    // Update page title (no longer needed as title is fixed)
    function updatePageTitle(sectionName) {
        // Title is now fixed as "Umrah Travel Management System"
    }

    // Setup sidebar toggle (removed as toggle button is gone)
    function setupSidebarToggle() {
        // Toggle functionality removed as per requirement
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

        // Content forms
        const contentForms = Utils.$$('.content-form');
        contentForms.forEach(form => {
            Utils.addEvent(form, 'submit', function(e) {
                e.preventDefault();
                handleContentUpdate(this);
            });
        });

        // Cancel buttons
        const cancelBtns = Utils.$$('.content-form .btn-glass');
        cancelBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();
                this.closest('form').reset();
                Toast.show('Changes cancelled', 'info');
            });
        });

        // Setup tabs
        setupContentTabs();

        // Add/Edit buttons
        setupCrudButtons();
    }

    // Setup content tabs
    function setupContentTabs() {
        const tabBtns = Utils.$$('.tab-btn');

        tabBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();

                // Remove active from all tabs and panels
                tabBtns.forEach(b => Utils.removeClass(b, 'active'));
                const panels = Utils.$$('.tab-panel');
                panels.forEach(p => Utils.removeClass(p, 'active'));

                // Add active to clicked tab and corresponding panel
                Utils.addClass(btn, 'active');
                const tabName = btn.dataset.tab;
                const targetPanel = Utils.$(`#${tabName}-tab`);
                if (targetPanel) {
                    Utils.addClass(targetPanel, 'active');
                }
            });
        });
    }

    // Handle content update
    function handleContentUpdate(form) {
        // Validate form
        if (!Utils.validateForm(form)) {
            return;
        }

        // Show loader
        Loader.show(form);

        // Simulate save
        setTimeout(() => {
            Loader.hide(form);
            Toast.show('Content updated successfully!', 'success');
        }, 1500);
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

    // Mobile sidebar handling (simplified without toggle button)
    function setupMobileSidebar() {
        const sidebar = Utils.$('.sidebar');

        // Close sidebar when clicking outside on mobile
        Utils.addEvent(document, 'click', function(e) {
            if (window.innerWidth <= 1024) {
                if (!sidebar.contains(e.target)) {
                    Utils.removeClass(sidebar, 'active');
                }
            }
        });
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

    // Setup package management functionality
    function setupPackageManagement() {
        const addBtn = Utils.$('#addPackageBtn');

        // Setup modals
        const addModal = Utils.$('#addPackageModal');
        const editModal = Utils.$('#editPackageModal');
        const deleteModal = Utils.$('#deletePackageModal');

        // Add Package Button
        if (addBtn) {
            Utils.addEvent(addBtn, 'click', function(e) {
                e.preventDefault();
                openModal(addModal);
            });
        }

        // Edit buttons
        const editBtns = Utils.$$('.packages-table .btn-icon.edit');
        editBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();
                const row = this.closest('tr');
                openEditModal(row);
            });
        });

        // Delete buttons
        const deleteBtns = Utils.$$('.packages-table .btn-icon.delete');
        deleteBtns.forEach(btn => {
            Utils.addEvent(btn, 'click', function(e) {
                e.preventDefault();
                const row = this.closest('tr');
                openDeleteModal(row);
            });
        });

        // Modal close buttons
        const closeButtons = Utils.$$('.modal-close, .modal-cancel');
        closeButtons.forEach(btn => {
            Utils.addEvent(btn, 'click', function() {
                const modal = this.closest('.modal');
                closeModal(modal);
            });
        });

        // Close modal when clicking outside
        const modals = Utils.$$('.modal');
        modals.forEach(modal => {
            Utils.addEvent(modal, 'click', function(e) {
                if (e.target === this) {
                    closeModal(this);
                }
            });
        });

        // Form submissions
        const addForm = Utils.$('#addPackageForm');
        if (addForm) {
            Utils.addEvent(addForm, 'submit', function(e) {
                e.preventDefault();
                handleAddPackage(this);
            });
        }

        const editForm = Utils.$('#editPackageForm');
        if (editForm) {
            Utils.addEvent(editForm, 'submit', function(e) {
                e.preventDefault();
                handleEditPackage(this);
            });
        }

        const confirmDeleteBtn = Utils.$('#confirmDelete');
        if (confirmDeleteBtn) {
            Utils.addEvent(confirmDeleteBtn, 'click', function() {
                handleDeletePackage();
            });
        }
    }

    // Open modal
    function openModal(modal) {
        if (modal) {
            Utils.addClass(modal, 'active');
        }
    }

    // Close modal
    function closeModal(modal) {
        if (modal) {
            Utils.removeClass(modal, 'active');
            // Reset form if exists
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    }

    // Open edit modal with data
    function openEditModal(row) {
        const modal = Utils.$('#editPackageModal');
        const form = Utils.$('#editPackageForm');

        if (modal && form) {
            // Store row reference for later update
            modal.dataset.editingRow = Array.from(row.parentNode.children).indexOf(row);

            // Fill form with row data
            form.packageId.value = row.cells[0].textContent;
            form.packageName.value = row.cells[1].textContent;
            form.price.value = row.cells[2].textContent.replace('$', '').replace(',', '');
            form.duration.value = row.cells[3].textContent.replace(' Days', '');

            // Set status
            const statusBadge = row.querySelector('.status-badge');
            if (statusBadge) {
                form.status.value = statusBadge.classList.contains('active') ? 'active' : 'inactive';
            }

            openModal(modal);
        }
    }

    // Open delete modal
    function openDeleteModal(row) {
        const modal = Utils.$('#deletePackageModal');
        const nameElement = Utils.$('#deletePackageName');

        if (modal && nameElement) {
            const packageName = row.cells[1].textContent;
            nameElement.textContent = packageName;
            modal.dataset.packageId = row.cells[0].textContent;
            modal.dataset.deleteRow = Array.from(row.parentNode.children).indexOf(row);
            openModal(modal);
        }
    }

    // Handle add package
    function handleAddPackage(form) {
        if (!Utils.validateForm(form)) {
            return;
        }

        // Get form data
        const formData = new FormData(form);
        const packageData = {
            id: generatePackageId(),
            name: formData.get('packageName'),
            price: formData.get('price'),
            duration: formData.get('duration'),
            status: formData.get('status')
        };

        // Add new row to table
        const tableBody = Utils.$('.packages-table tbody');
        if (tableBody) {
            const newRow = createPackageRow(packageData);
            tableBody.insertAdjacentHTML('beforeend', newRow);

            // Re-attach event listeners for new buttons
            setupPackageRowActions();
        }

        Toast.show('Package added successfully!', 'success');
        closeModal(form.closest('.modal'));
    }

    // Handle edit package
    function handleEditPackage(form) {
        if (!Utils.validateForm(form)) {
            return;
        }

        const modal = form.closest('.modal');
        const rowIndex = modal.dataset.editingRow;
        const tableBody = Utils.$('.packages-table tbody');

        if (tableBody && rowIndex !== undefined) {
            const row = tableBody.children[rowIndex];
            if (row) {
                // Update row data
                const formData = new FormData(form);
                row.cells[0].textContent = formData.get('packageId');
                row.cells[1].textContent = formData.get('packageName');
                row.cells[2].textContent = '$' + formData.get('price');
                row.cells[3].textContent = formData.get('duration') + ' Days';

                // Update status badge
                const statusBadge = row.querySelector('.status-badge');
                if (statusBadge) {
                    const status = formData.get('status');
                    statusBadge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
                    statusBadge.className = 'status-badge ' + status;
                }
            }
        }

        Toast.show('Package updated successfully!', 'success');
        closeModal(modal);
    }

    // Handle delete package
    function handleDeletePackage() {
        const modal = Utils.$('#deletePackageModal');
        const rowIndex = modal.dataset.deleteRow;
        const tableBody = Utils.$('.packages-table tbody');

        if (tableBody && rowIndex !== undefined) {
            const row = tableBody.children[rowIndex];
            if (row) {
                // Fade out and remove
                row.style.transition = 'opacity 0.3s';
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                }, 300);
            }
        }

        Toast.show('Package deleted successfully!', 'success');
        closeModal(modal);
    }

    // Generate package ID
    function generatePackageId() {
        const tableBody = Utils.$('.packages-table tbody');
        if (tableBody) {
            const rows = tableBody.children;
            return rows.length + 1;
        }
        return 1;
    }

    // Create package row HTML
    function createPackageRow(data) {
        const statusClass = data.status === 'active' ? 'active' : 'inactive';
        const statusText = data.status.charAt(0).toUpperCase() + data.status.slice(1);

        return `
            <tr>
                <td>${data.id}</td>
                <td>${data.name}</td>
                <td>$${data.price}</td>
                <td>${data.duration} Days</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td class="action-buttons">
                    <button class="btn-icon edit" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    // Setup package row actions
    function setupPackageRowActions() {
        // Re-attach edit button listeners
        const editBtns = Utils.$$('.packages-table .btn-icon.edit');
        editBtns.forEach(btn => {
            // Remove existing listeners to avoid duplicates
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            Utils.addEvent(newBtn, 'click', function(e) {
                e.preventDefault();
                const row = this.closest('tr');
                openEditModal(row);
            });
        });

        // Re-attach delete button listeners
        const deleteBtns = Utils.$$('.packages-table .btn-icon.delete');
        deleteBtns.forEach(btn => {
            // Remove existing listeners to avoid duplicates
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            Utils.addEvent(newBtn, 'click', function(e) {
                e.preventDefault();
                const row = this.closest('tr');
                openDeleteModal(row);
            });
        });
    }

    // Initialize when DOM is ready
    Utils.addEvent(document, 'DOMContentLoaded', function() {
        init();
        setupMobileSidebar();
        setupButtonContains();
        setupPackageManagement();
    });

    // Handle window resize
    Utils.addEvent(window, 'resize', Utils.debounce(handleResize, 250));

})();