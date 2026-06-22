/**
 * LuminaPass – Event Ticket Booking System
 * JavaScript: Level 4 interactions + new premium features
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // Task 1: Book Ticket Button Interaction
    // ==========================================
    const bookButtons = document.querySelectorAll('.btn-book');

    bookButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Navigate smoothly to the booking section
            document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });

            // Auto-select the corresponding event in the dropdown
            const card = button.closest('.event-card');
            if (card && card.dataset.title) {
                const eventSelect = document.getElementById('event-select');
                const eventTitle = card.dataset.title;
                if (eventSelect) {
                    for (let i = 0; i < eventSelect.options.length; i++) {
                        if (eventSelect.options[i].text === eventTitle) {
                            eventSelect.selectedIndex = i;
                            break;
                        }
                    }
                }
            }
        });
    });

    // ==========================================
    // Task 2: Show / Hide Event Details
    // ==========================================
    const toggleButtons = document.querySelectorAll('.btn-toggle-details');

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const metaContainer = button.closest('.event-details-meta');
            const detailsDiv = metaContainer.querySelector('.extra-details');
            const isShowing = detailsDiv.classList.contains('show');

            if (isShowing) {
                detailsDiv.classList.remove('show');
                button.classList.remove('open');
                button.textContent = 'View Details';
            } else {
                detailsDiv.classList.add('show');
                button.classList.add('open');
                button.textContent = 'Hide Details';
            }
        });
    });

    // ==========================================
    // Task 3: Search & Category Filter
    // ==========================================
    const searchInput = document.getElementById('event-search');
    const filterPills = document.querySelectorAll('.pill');
    const allCards = document.querySelectorAll('.event-card');
    const noResultsMsg = document.getElementById('no-results-msg');

    // Track active category filter
    let activeCategory = 'all';

    /**
     * Filters the event cards based on the search query and active category pill.
     */
    function filterEvents() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        let visibleCount = 0;

        allCards.forEach(card => {
            const title = card.dataset.title ? card.dataset.title.toLowerCase() : '';
            const category = card.dataset.category ? card.dataset.category : '';

            const matchesSearch = title.includes(query);
            const matchesCategory = activeCategory === 'all' || category === activeCategory;

            if (matchesSearch && matchesCategory) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Show/hide "no results" message
        if (noResultsMsg) {
            noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    // Search input listener
    if (searchInput) {
        searchInput.addEventListener('input', filterEvents);
    }

    // Filter pill click listeners
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Update active pill styling
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            // Update active category and re-filter
            activeCategory = pill.dataset.filter;
            filterEvents();
        });
    });

    // ==========================================
    // Task 4: Form Validation + Drawer Booking
    // ==========================================
    const bookingForm = document.getElementById('booking-form');
    const successMessage = document.getElementById('form-success-message');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Hide previous success message
            successMessage.style.display = 'none';

            let isValid = true;

            // Validate Event Selection
            const eventSelect = document.getElementById('event-select');
            const eventError = document.getElementById('error-event');
            if (eventSelect.value === '') {
                setError(eventSelect, eventError);
                isValid = false;
            } else {
                clearError(eventSelect, eventError);
            }

            // Validate Full Name
            const nameInput = document.getElementById('name');
            const nameError = document.getElementById('error-name');
            if (nameInput.value.trim() === '') {
                setError(nameInput, nameError);
                isValid = false;
            } else {
                clearError(nameInput, nameError);
            }

            // Validate Email
            const emailInput = document.getElementById('email');
            const emailError = document.getElementById('error-email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailInput.value.trim() === '' || !emailRegex.test(emailInput.value)) {
                setError(emailInput, emailError);
                isValid = false;
            } else {
                clearError(emailInput, emailError);
            }

            // Validate Ticket Count
            const ticketsInput = document.getElementById('tickets');
            const ticketsError = document.getElementById('error-tickets');
            const ticketsValue = parseInt(ticketsInput.value, 10);
            if (!ticketsInput.value || ticketsValue <= 0 || isNaN(ticketsValue)) {
                setError(ticketsInput, ticketsError);
                isValid = false;
            } else {
                clearError(ticketsInput, ticketsError);
            }

            if (isValid) {
                // Gather booking data
                const selectedEventText = eventSelect.options[eventSelect.selectedIndex].text;
                const selectedTier = document.querySelector('input[name="ticket-tier"]:checked');
                const tierValue = selectedTier ? selectedTier.value : 'standard';
                const tierLabel = tierValue === 'vip' ? 'VIP Access' : 'Standard Pass';

                // Show success message
                successMessage.style.display = 'block';

                // Add ticket to drawer wallet
                addTicketToDrawer({
                    event: selectedEventText,
                    name: nameInput.value.trim(),
                    tickets: ticketsValue,
                    tier: tierLabel,
                    tierValue: tierValue,
                });

                // Reset form
                bookingForm.reset();

                // Hide success after 5 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
            }
        });
    }

    // Helper: set error state
    function setError(inputElement, errorElement) {
        inputElement.classList.add('error');
        errorElement.style.display = 'block';
    }

    // Helper: clear error state
    function clearError(inputElement, errorElement) {
        inputElement.classList.remove('error');
        errorElement.style.display = 'none';
    }

    // ==========================================
    // Feature: Off-Canvas Ticket Drawer
    // ==========================================
    const drawer = document.getElementById('ticket-drawer');
    const overlay = document.getElementById('drawer-overlay');
    const openDrawerBtn = document.getElementById('open-drawer-btn');
    const closeDrawerBtn = document.getElementById('close-drawer');
    const ticketCountBadge = document.getElementById('ticket-count-badge');
    const drawerTicketsList = document.getElementById('drawer-tickets-list');
    const drawerEmptyState = document.getElementById('drawer-empty-state');

    // Track total booked count
    let totalBookedCount = 0;

    /** Opens the drawer */
    function openDrawer() {
        drawer.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    /** Closes the drawer */
    function closeDrawer() {
        drawer.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (openDrawerBtn) {
        openDrawerBtn.addEventListener('click', openDrawer);
    }
    if (closeDrawerBtn) {
        closeDrawerBtn.addEventListener('click', closeDrawer);
    }
    if (overlay) {
        overlay.addEventListener('click', closeDrawer);
    }

    // Close drawer on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('open')) {
            closeDrawer();
        }
    });

    /**
     * Adds a newly booked ticket card into the drawer.
     * @param {Object} booking - Booking details object
     */
    function addTicketToDrawer(booking) {
        totalBookedCount++;

        // Show the count badge on the My Tickets button
        if (ticketCountBadge) {
            ticketCountBadge.textContent = totalBookedCount;
            ticketCountBadge.style.display = 'inline-block';
        }

        // Hide the empty state if it was showing
        if (drawerEmptyState) {
            drawerEmptyState.style.display = 'none';
        }

        // Generate a mock barcode number
        const barcodeNum = 'LP-' + Date.now().toString().slice(-8);

        // Build the barcode bar SVG-style strips (random heights for realism)
        const barHeights = Array.from({ length: 30 }, () => Math.floor(Math.random() * 24) + 8);
        const barcodeHTML = barHeights
            .map(h => `<span style="height:${h}px;"></span>`)
            .join('');

        // Build ticket item HTML
        const ticketEl = document.createElement('div');
        ticketEl.classList.add('drawer-ticket-item');
        ticketEl.innerHTML = `
            <div class="drawer-ticket-info">
                <div class="drawer-ticket-event">${booking.event}</div>
                <div class="drawer-ticket-meta">
                    Holder: ${booking.name}<br>
                    Qty: ${booking.tickets} ticket${booking.tickets > 1 ? 's' : ''}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                    <span class="drawer-ticket-tier ${booking.tierValue === 'vip' ? 'vip' : ''}" style="margin-top: 0;">
                        ${booking.tier}
                    </span>
                    <button type="button" class="btn-cancel-ticket" style="background: transparent; border: 1px solid #f87171; color: #f87171; border-radius: 4px; padding: 0.2rem 0.6rem; font-size: 0.7rem; cursor: pointer; font-weight: bold; font-family: inherit; transition: all 0.2s;">Cancel Ticket</button>
                </div>
            </div>
            <div class="mock-barcode">
                <div class="barcode-lines">${barcodeHTML}</div>
                <span class="barcode-number">${barcodeNum}</span>
            </div>
        `;

        // Add cancel logic
        const cancelBtn = ticketEl.querySelector('.btn-cancel-ticket');
        cancelBtn.addEventListener('click', () => {
            ticketEl.remove();
            totalBookedCount--;
            if (ticketCountBadge) {
                ticketCountBadge.textContent = totalBookedCount;
                if (totalBookedCount === 0) {
                    ticketCountBadge.style.display = 'none';
                    if (drawerEmptyState) {
                        drawerEmptyState.style.display = 'flex';
                    }
                }
            }
        });

        // Append to the list at the top (most recent first)
        drawerTicketsList.prepend(ticketEl);
    }

});
