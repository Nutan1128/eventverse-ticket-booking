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

    // ==========================================
    // Phase 2: Status Badge Injection
    // ==========================================
    const statusConfig = {
        featured:  { icon: '⭐', label: 'Featured',  cls: 'badge-featured' },
        trending:  { icon: '🔥', label: 'Trending',  cls: 'badge-trending' },
        hot:       { icon: '🚀', label: 'Hot',        cls: 'badge-hot'      },
        popular:   { icon: '💚', label: 'Popular',   cls: 'badge-popular'  },
    };

    document.querySelectorAll('.event-card[data-status]').forEach(card => {
        const status = card.dataset.status;
        const cfg = statusConfig[status];
        if (!cfg) return;

        const badge = document.createElement('div');
        badge.className = `event-status-badge ${cfg.cls}`;
        badge.innerHTML = `${cfg.icon} ${cfg.label}`;

        const imageWrapper = card.querySelector('.event-image-wrapper');
        if (imageWrapper) {
            imageWrapper.appendChild(badge);
        }
    });

    // ==========================================
    // Phase 2: Scroll-Reveal (Discovery Layer)
    // ==========================================
    // Add reveal classes to event cards and section headings
    const revealTargets = [
        ...document.querySelectorAll('.event-card'),
        ...document.querySelectorAll('.section-title'),
        ...document.querySelectorAll('.stats-bar'),
        ...document.querySelectorAll('.booking-section'),
    ];

    revealTargets.forEach((el, i) => {
        el.classList.add('reveal');
        // Stagger event cards only
        if (el.classList.contains('event-card')) {
            const delayClass = `reveal-delay-${(i % 6) + 1}`;
            el.classList.add(delayClass);
        }
    });

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealTargets.forEach(el => revealObserver.observe(el));

});

/* ============================================================
   PHASE 3 — UNEXPECTED PREMIUM FEATURES
   All features are self-contained and non-destructive.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

    // ─────────────────────────────────────────────────────────
    // PHASE 3 STATIC DATA CONFIG
    // ─────────────────────────────────────────────────────────

    // Event titles must match data-title attributes on cards
    const P3_DATA = {
        'Inception: IMAX Re-release': {
            date:         new Date('2026-07-15T20:30:00'),
            availability: 42,  // % sold
            popularity:   { icon: '🎬', label: 'Editor\'s Pick', cls: 'pop-editors-pick' },
        },
        'Arijit Singh Live Concert': {
            date:         new Date('2026-06-25T19:00:00'),
            availability: 73,
            popularity:   { icon: '🔥', label: 'Trending',       cls: 'pop-trending' },
        },
        'India vs Australia T20': {
            date:         new Date('2026-08-02T19:30:00'),
            availability: 88,
            popularity:   { icon: '🏆', label: 'Most Booked',    cls: 'pop-most-booked' },
        },
        'Mumbai City FC vs Mohun Bagan': {
            date:         new Date('2026-08-12T20:00:00'),
            availability: 55,
            popularity:   { icon: '⚽', label: 'Trending',       cls: 'pop-trending' },
        },
        'Sunburn Goa 2026': {
            date:         new Date('2026-12-28T15:00:00'),
            availability: 31,
            popularity:   { icon: '🎵', label: 'Editor\'s Pick', cls: 'pop-editors-pick' },
        },
        'Zakir Khan Live': {
            date:         new Date('2026-09-10T20:00:00'),
            availability: 67,
            popularity:   { icon: '😂', label: 'Most Booked',    cls: 'pop-most-booked' },
        },
    };

    const allEventCards = Array.from(document.querySelectorAll('.event-card'));

    // Helper: get title of a card
    function cardTitle(card) {
        return card.dataset.title || '';
    }

    // Helper: get data for a card
    function cardData(card) {
        return P3_DATA[cardTitle(card)] || null;
    }

    // ─────────────────────────────────────────────────────────
    // FEATURE 1 — LIVE EVENT COUNTDOWN
    // ─────────────────────────────────────────────────────────
    const countdownIntervals = [];

    function buildCountdownHTML(id) {
        return `
            <div class="event-countdown" id="cd-${id}">
                <span class="countdown-label">Starts In</span>
                <div class="countdown-units">
                    <div class="countdown-unit"><span class="cu-num" id="cd-d-${id}">--</span><span class="cu-lbl">Days</span></div>
                    <span class="countdown-sep">:</span>
                    <div class="countdown-unit"><span class="cu-num" id="cd-h-${id}">--</span><span class="cu-lbl">Hrs</span></div>
                    <span class="countdown-sep">:</span>
                    <div class="countdown-unit"><span class="cu-num" id="cd-m-${id}">--</span><span class="cu-lbl">Min</span></div>
                </div>
            </div>`;
    }

    function updateCountdown(targetDate, id) {
        const now  = new Date();
        const diff = targetDate - now;
        if (diff <= 0) {
            document.getElementById(`cd-${id}`)?.remove();
            return;
        }
        const days  = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const mins  = Math.floor((diff % 3600000)  / 60000);

        const dEl = document.getElementById(`cd-d-${id}`);
        const hEl = document.getElementById(`cd-h-${id}`);
        const mEl = document.getElementById(`cd-m-${id}`);
        if (dEl) dEl.textContent = String(days).padStart(2, '0');
        if (hEl) hEl.textContent = String(hours).padStart(2, '0');
        if (mEl) mEl.textContent = String(mins).padStart(2, '0');
    }

    allEventCards.forEach((card, idx) => {
        const data = cardData(card);
        if (!data) return;

        const content = card.querySelector('.event-content');
        const bookBtn = card.querySelector('.btn-book');
        if (!content || !bookBtn) return;

        const id = `ev${idx}`;
        const cdDiv = document.createElement('div');
        cdDiv.innerHTML = buildCountdownHTML(id);

        // Insert just before the Book Ticket button
        content.insertBefore(cdDiv.firstElementChild, bookBtn);

        // Immediate first render + start interval
        updateCountdown(data.date, id);
        const interval = setInterval(() => updateCountdown(data.date, id), 60000);
        countdownIntervals.push(interval);
    });

    // ─────────────────────────────────────────────────────────
    // FEATURE 2 — TICKET AVAILABILITY INDICATOR
    // ─────────────────────────────────────────────────────────
    function getAvailState(pctSold) {
        if (pctSold >= 80) return { cls: 'avail-scarce',  label: '🔴 Almost Sold Out' };
        if (pctSold >= 55) return { cls: 'avail-limited', label: '🟡 Limited Seats'    };
        return                    { cls: 'avail-ok',      label: '🟢 Available'        };
    }

    allEventCards.forEach(card => {
        const data = cardData(card);
        if (!data) return;

        const content   = card.querySelector('.event-content');
        const titleEl   = card.querySelector('.event-title');
        if (!content || !titleEl) return;

        const pct   = data.availability;
        const state = getAvailState(pct);
        const remaining = 100 - pct;

        const wrap = document.createElement('div');
        wrap.className = 'availability-wrap';
        wrap.innerHTML = `
            <div class="availability-row">
                <span class="availability-state ${state.cls}">${state.label}</span>
                <span class="availability-pct">${remaining}% left</span>
            </div>
            <div class="availability-bar-track">
                <div class="availability-bar-fill ${state.cls}" style="width:0%"></div>
            </div>`;

        // Insert right after the title
        titleEl.insertAdjacentElement('afterend', wrap);

        // Animate bar after a brief delay (scroll-reveal friendly)
        setTimeout(() => {
            const fill = wrap.querySelector('.availability-bar-fill');
            if (fill) fill.style.width = remaining + '%';
        }, 300);
    });

    // ─────────────────────────────────────────────────────────
    // FEATURE 3 — FAVORITE EVENTS
    // ─────────────────────────────────────────────────────────
    const LS_FAV_KEY = 'lp_favorites';
    const savedCountBadge = document.getElementById('saved-count-badge');

    function getFavorites() {
        try { return JSON.parse(localStorage.getItem(LS_FAV_KEY)) || []; }
        catch { return []; }
    }

    function saveFavorites(favs) {
        localStorage.setItem(LS_FAV_KEY, JSON.stringify(favs));
    }

    function updateSavedBadge(favs) {
        if (!savedCountBadge) return;
        if (favs.length > 0) {
            savedCountBadge.textContent = favs.length;
            savedCountBadge.style.display = 'inline-block';
        } else {
            savedCountBadge.style.display = 'none';
        }
    }

    allEventCards.forEach(card => {
        const title   = cardTitle(card);
        const content = card.querySelector('.event-content');
        const bookBtn = card.querySelector('.btn-book');
        if (!content || !bookBtn) return;

        // Create a flex wrapper for heart + book button
        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex; gap:0.5rem; margin-top:auto;';

        const heartBtn = document.createElement('button');
        heartBtn.type = 'button';
        heartBtn.className = 'btn-favorite';
        heartBtn.setAttribute('aria-label', 'Save event');
        heartBtn.setAttribute('title', 'Save event');
        heartBtn.textContent = '♡';

        // Restore saved state
        const favs = getFavorites();
        if (favs.includes(title)) {
            heartBtn.classList.add('saved');
            heartBtn.textContent = '❤️';
        }

        heartBtn.addEventListener('click', () => {
            const current = getFavorites();
            const isSaved = current.includes(title);
            if (isSaved) {
                const updated = current.filter(t => t !== title);
                saveFavorites(updated);
                heartBtn.classList.remove('saved');
                heartBtn.textContent = '♡';
                updateSavedBadge(updated);
            } else {
                const updated = [...current, title];
                saveFavorites(updated);
                heartBtn.classList.add('saved');
                heartBtn.textContent = '❤️';
                updateSavedBadge(updated);
            }
        });

        // Move bookBtn into the row
        bookBtn.style.flex = '1';
        bookBtn.style.marginTop = '0';
        btnRow.appendChild(heartBtn);
        btnRow.appendChild(bookBtn);
        content.appendChild(btnRow);
    });

    // Initialize badge on load
    updateSavedBadge(getFavorites());

    // ─────────────────────────────────────────────────────────
    // FEATURE 4 — SURPRISE ME
    // ─────────────────────────────────────────────────────────
    const surpriseBtn = document.getElementById('surprise-me-btn');

    if (surpriseBtn) {
        surpriseBtn.addEventListener('click', () => {
            // Remove previous spotlight
            allEventCards.forEach(c => c.classList.remove('surprised'));

            // Pick a random VISIBLE card
            const visible = allEventCards.filter(c => c.style.display !== 'none');
            if (visible.length === 0) return;

            const pick = visible[Math.floor(Math.random() * visible.length)];
            pick.classList.add('surprised');

            // Smooth scroll to card
            pick.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Remove class after animation completes
            setTimeout(() => pick.classList.remove('surprised'), 2500);
        });
    }

    // ─────────────────────────────────────────────────────────
    // FEATURE 5 — POPULARITY INDICATORS
    // ─────────────────────────────────────────────────────────
    allEventCards.forEach(card => {
        const data = cardData(card);
        if (!data || !data.popularity) return;

        const titleEl = card.querySelector('.event-title');
        if (!titleEl) return;

        const pop = data.popularity;
        const label = document.createElement('div');
        label.className = `popularity-label ${pop.cls}`;
        label.innerHTML = `${pop.icon} ${pop.label}`;

        // Insert before the title
        titleEl.insertAdjacentElement('beforebegin', label);
    });

    // ─────────────────────────────────────────────────────────
    // FEATURE 6 — RECENTLY VIEWED
    // ─────────────────────────────────────────────────────────
    const LS_RV_KEY    = 'lp_recently_viewed';
    const RV_MAX       = 3;
    const rvTray       = document.getElementById('recently-viewed-tray');
    const rvList       = document.getElementById('rv-list');

    function getRV() {
        try { return JSON.parse(localStorage.getItem(LS_RV_KEY)) || []; }
        catch { return []; }
    }

    function saveRV(list) {
        localStorage.setItem(LS_RV_KEY, JSON.stringify(list));
    }

    function renderRVTray() {
        if (!rvTray || !rvList) return;
        const items = getRV();
        if (items.length === 0) {
            rvTray.style.display = 'none';
            return;
        }
        rvTray.style.display = 'block';
        rvList.innerHTML = items.map(title => `
            <div class="rv-item" data-rv-title="${title}">
                <span class="rv-item-dot"></span>
                <span class="rv-item-name">${title}</span>
            </div>`).join('');

        // Clicking an RV item scrolls to that card
        rvList.querySelectorAll('.rv-item').forEach(item => {
            item.addEventListener('click', () => {
                const t = item.dataset.rvTitle;
                const target = allEventCards.find(c => cardTitle(c) === t);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    }

    function trackView(title) {
        let current = getRV();
        current = current.filter(t => t !== title); // deduplicate
        current.unshift(title);
        if (current.length > RV_MAX) current = current.slice(0, RV_MAX);
        saveRV(current);
        renderRVTray();
    }

    // Use IntersectionObserver to detect when a card is actually viewed
    const rvObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                trackView(cardTitle(entry.target));
            }
        });
    }, { threshold: 0.6 });

    allEventCards.forEach(card => rvObserver.observe(card));

    // Render any previously saved RV items on load
    renderRVTray();

    // ─────────────────────────────────────────────────────────
    // FEATURE 7 — FLOATING MINI BOOKING WIDGET
    // ─────────────────────────────────────────────────────────
    const miniWidget      = document.getElementById('mini-widget');
    const miniWidgetClose = document.getElementById('mini-widget-close');
    const miniEventName   = document.getElementById('mini-widget-event');
    const miniQty         = document.getElementById('mini-widget-qty');
    const miniCta         = document.getElementById('mini-widget-cta');

    let widgetDismissed = false;

    function showMiniWidget(eventName, qty) {
        if (!miniWidget || widgetDismissed) return;
        if (miniEventName) miniEventName.textContent = eventName;
        if (miniQty)       miniQty.textContent       = qty || 1;
        miniWidget.style.display = 'block';
    }

    // Trigger widget when a "Book Ticket" card button is clicked
    allEventCards.forEach(card => {
        const bookBtn = card.querySelector('.btn-book');
        if (!bookBtn) return;
        bookBtn.addEventListener('click', () => {
            showMiniWidget(cardTitle(card), 1);
        });
    });

    // Keep widget in sync with the booking form's event select + qty
    const formEventSelect = document.getElementById('event-select');
    const formTicketsInput = document.getElementById('tickets');

    if (formEventSelect) {
        formEventSelect.addEventListener('change', () => {
            const selected = formEventSelect.options[formEventSelect.selectedIndex];
            if (selected && selected.value && miniWidget) {
                showMiniWidget(selected.text, formTicketsInput ? formTicketsInput.value || 1 : 1);
            }
        });
    }

    if (formTicketsInput) {
        formTicketsInput.addEventListener('input', () => {
            if (miniQty && miniWidget.style.display !== 'none') {
                miniQty.textContent = formTicketsInput.value || 1;
            }
        });
    }

    // Close widget
    if (miniWidgetClose) {
        miniWidgetClose.addEventListener('click', () => {
            if (miniWidget) miniWidget.style.display = 'none';
            widgetDismissed = true; // Don't re-open until next page load
        });
    }

    // Clicking CTA also smooth-scrolls to booking & closes widget
    if (miniCta) {
        miniCta.addEventListener('click', () => {
            if (miniWidget) {
                setTimeout(() => { miniWidget.style.display = 'none'; }, 400);
            }
        });
    }

    // Re-enable widget on next "Book Ticket" click even if dismissed once
    allEventCards.forEach(card => {
        const bookBtn = card.querySelector('.btn-book');
        if (!bookBtn) return;
        bookBtn.addEventListener('click', () => {
            widgetDismissed = false; // Reset so widget shows again
        });
    });

});
