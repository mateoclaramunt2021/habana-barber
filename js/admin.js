// ============================================================
// BARBERÍA HABANA — Admin Panel JavaScript
// Complete Management System
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ---- Lucide Icons ----
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // =========================================================
    // AUTH / LOGIN
    // =========================================================
    const loginScreen = document.getElementById('loginScreen');
    const adminPanel = document.getElementById('adminPanel');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    function checkAuth() {
        if (HabanaDB.Auth.isLoggedIn()) {
            loginScreen.style.display = 'none';
            adminPanel.style.display = 'flex';
            initAdmin();
        } else {
            loginScreen.style.display = 'flex';
            adminPanel.style.display = 'none';
        }
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('loginUser').value.trim();
        const pass = document.getElementById('loginPass').value;
        if (HabanaDB.Auth.login(user, pass)) {
            loginError.style.display = 'none';
            checkAuth();
        } else {
            loginError.style.display = '';
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        HabanaDB.Auth.logout();
        checkAuth();
    });

    checkAuth();

    // =========================================================
    // INIT ADMIN
    // =========================================================
    function initAdmin() {
        initSidebar();
        initDashboard();
        initNotificationBadges();
        refreshIcons();
        // Auto-refresh every 10s
        setInterval(() => {
            if (HabanaDB.Auth.isLoggedIn()) {
                initNotificationBadges();
                if (currentPage === 'dashboard') loadDashboard();
            }
        }, 10000);
    }

    // =========================================================
    // SIDEBAR NAVIGATION
    // =========================================================
    let currentPage = 'dashboard';
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');

    function initSidebar() {
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                navigateTo(page);
                // Close mobile sidebar
                sidebar.classList.remove('open');
            });
        });

        // Sidebar toggle for mobile
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        // Dashboard links 
        document.querySelectorAll('[data-goto]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(link.dataset.goto);
            });
        });

        // Notification button goes to notifications
        document.getElementById('notifBtn').addEventListener('click', () => {
            navigateTo('notificaciones');
        });
    }

    function navigateTo(page) {
        currentPage = page;
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

        const pageEl = document.getElementById('page-' + page);
        const linkEl = document.querySelector(`.sidebar-link[data-page="${page}"]`);
        if (pageEl) pageEl.classList.add('active');
        if (linkEl) linkEl.classList.add('active');

        // Load page data
        switch (page) {
            case 'dashboard': loadDashboard(); break;
            case 'reservas': loadBookings(); break;
            case 'calendario': loadCalendar(); break;
            case 'clientes': loadClients(); break;
            case 'trabajadores': loadWorkers(); break;
            case 'servicios': loadServicesAdmin(); break;
            case 'tpv': loadTPV(); break;
            case 'informes': loadReportsPage(); break;
            case 'notificaciones': loadNotifications(); break;
            case 'configuracion': loadSettings(); break;
        }

        refreshIcons();
    }

    // =========================================================
    // NOTIFICATION BADGES
    // =========================================================
    function initNotificationBadges() {
        const unread = HabanaDB.Notifications.getUnreadCount();
        const pending = HabanaDB.Bookings.getPending().length;

        setBadge('notifBadge', unread);
        setBadge('topNotifBadge', unread);
        setBadge('reservasBadge', pending);
    }

    function setBadge(id, count) {
        const el = document.getElementById(id);
        if (!el) return;
        if (count > 0) {
            el.style.display = '';
            el.textContent = count > 99 ? '99+' : count;
        } else {
            el.style.display = 'none';
        }
    }

    // =========================================================
    // TOAST
    // =========================================================
    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const iconMap = { success: 'check-circle', error: 'alert-circle', info: 'info' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i data-lucide="${iconMap[type] || 'info'}"></i><span>${message}</span>`;
        container.appendChild(toast);
        refreshIcons();
        setTimeout(() => {
            toast.classList.add('out');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // =========================================================
    // MODAL
    // =========================================================
    const modalOverlay = document.getElementById('modalOverlay');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalFooter = document.getElementById('modalFooter');

    function openModal(title, bodyHTML, footerHTML) {
        modalTitle.textContent = title;
        modalBody.innerHTML = bodyHTML;
        modalFooter.innerHTML = footerHTML || '';
        modalOverlay.style.display = 'flex';
        refreshIcons();
    }

    function closeModal() {
        modalOverlay.style.display = 'none';
    }

    document.getElementById('modalClose').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // =========================================================
    // DASHBOARD
    // =========================================================
    function loadDashboard() {
        const today = HabanaDB.utils.today();
        const todayDate = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        document.getElementById('dashboardDate').textContent = todayDate;

        // Stats
        const todayBookings = HabanaDB.Bookings.getToday();
        const dailyTotals = HabanaDB.Transactions.getDailyTotal();
        const clients = HabanaDB.Clients.getAll();
        const pending = HabanaDB.Bookings.getPending();

        document.getElementById('statBookingsToday').textContent = todayBookings.length;
        document.getElementById('statRevenueToday').textContent = dailyTotals.total.toFixed(2) + '€';
        document.getElementById('statTotalClients').textContent = clients.length;
        document.getElementById('statPending').textContent = pending.length;

        // Upcoming bookings
        const upcoming = HabanaDB.Bookings.getUpcoming().slice(0, 8);
        const upcomingEl = document.getElementById('dashUpcoming');
        if (upcoming.length === 0) {
            upcomingEl.innerHTML = '<p class="empty-state">No hay citas próximas</p>';
        } else {
            upcomingEl.innerHTML = upcoming.map(b => `
                <div class="upcoming-item">
                    <span class="upcoming-time">${b.time}</span>
                    <div class="upcoming-info">
                        <div class="upcoming-name">${b.clientName}</div>
                        <div class="upcoming-service">${b.serviceName} — ${b.workerName} — ${b.date}</div>
                    </div>
                    <span class="upcoming-status status-badge status-${b.status}">${statusLabel(b.status)}</span>
                </div>
            `).join('');
        }

        // Day summary
        const daySummary = document.getElementById('dashDaySummary');
        const todayTx = HabanaDB.Transactions.getToday();
        if (todayBookings.length === 0 && todayTx.length === 0) {
            daySummary.innerHTML = '<p class="empty-state">Sin actividad hoy</p>';
        } else {
            daySummary.innerHTML = `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div style="text-align:center;padding:12px;background:#f8f9fc;border-radius:8px;">
                        <strong style="font-size:1.4rem;color:#C19A6B;">${todayBookings.length}</strong><br>
                        <small style="color:#6b7280;">Citas</small>
                    </div>
                    <div style="text-align:center;padding:12px;background:#f8f9fc;border-radius:8px;">
                        <strong style="font-size:1.4rem;color:#10b981;">${dailyTotals.total.toFixed(2)}€</strong><br>
                        <small style="color:#6b7280;">Ingresos</small>
                    </div>
                    <div style="text-align:center;padding:12px;background:#f8f9fc;border-radius:8px;">
                        <strong style="font-size:1.4rem;">${dailyTotals.count}</strong><br>
                        <small style="color:#6b7280;">Cobros</small>
                    </div>
                    <div style="text-align:center;padding:12px;background:#f8f9fc;border-radius:8px;">
                        <strong style="font-size:1.4rem;">${todayBookings.filter(b => b.status === 'completed').length}</strong><br>
                        <small style="color:#6b7280;">Completadas</small>
                    </div>
                </div>
            `;
        }

        // Notifications 
        const notifs = HabanaDB.Notifications.getAll().slice(0, 5);
        const notifsEl = document.getElementById('dashNotifications');
        if (notifs.length === 0) {
            notifsEl.innerHTML = '<p class="empty-state">Sin notificaciones</p>';
        } else {
            notifsEl.innerHTML = notifs.map(n => `
                <div class="notification-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
                    <div class="notif-icon"><i data-lucide="bell"></i></div>
                    <div class="notif-content">
                        <div class="notif-title">${n.title}</div>
                        <div class="notif-message">${n.message}</div>
                    </div>
                    <span class="notif-time">${timeAgo(n.createdAt)}</span>
                </div>
            `).join('');
        }

        refreshIcons();
    }

    // =========================================================
    // BOOKINGS (RESERVAS)
    // =========================================================
    let bookingFilter = 'all';
    let bookingDateFilter = '';

    function loadBookings() {
        // Filter tabs
        document.querySelectorAll('#bookingFilters .filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('#bookingFilters .filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                bookingFilter = tab.dataset.filter;
                renderBookingsTable();
            });
        });

        document.getElementById('bookingFilterDate').addEventListener('change', (e) => {
            bookingDateFilter = e.target.value;
            renderBookingsTable();
        });

        document.getElementById('newBookingBtn').addEventListener('click', openNewBookingModal);

        renderBookingsTable();
    }

    function renderBookingsTable() {
        let bookings = HabanaDB.Bookings.getAll();

        // Filter by status
        if (bookingFilter !== 'all') {
            bookings = bookings.filter(b => b.status === bookingFilter);
        }
        // Filter by date
        if (bookingDateFilter) {
            bookings = bookings.filter(b => b.date === bookingDateFilter);
        }

        // Sort newest first
        bookings.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

        const body = document.getElementById('bookingsBody');
        if (bookings.length === 0) {
            body.innerHTML = '<tr><td colspan="7" class="empty-state">No hay reservas</td></tr>';
            return;
        }

        body.innerHTML = bookings.map(b => `
            <tr>
                <td><strong>${b.clientName}</strong><br><small style="color:#6b7280;">${b.clientPhone || ''}</small></td>
                <td>${b.serviceName || '-'}</td>
                <td>${b.workerName || '-'}</td>
                <td>${b.date}</td>
                <td>${b.time}</td>
                <td><span class="status-badge status-${b.status}">${statusLabel(b.status)}</span></td>
                <td>
                    <div class="table-actions">
                        ${b.status === 'pending' ? `
                            <button class="table-action confirm" title="Confirmar" onclick="adminActions.confirmBooking('${b.id}')"><i data-lucide="check"></i></button>
                        ` : ''}
                        ${b.status === 'confirmed' ? `
                            <button class="table-action complete" title="Completar" onclick="adminActions.completeBooking('${b.id}')"><i data-lucide="check-check"></i></button>
                        ` : ''}
                        ${b.status !== 'cancelled' && b.status !== 'completed' ? `
                            <button class="table-action cancel" title="Cancelar" onclick="adminActions.cancelBooking('${b.id}')"><i data-lucide="x"></i></button>
                        ` : ''}
                        <button class="table-action delete" title="Eliminar" onclick="adminActions.deleteBooking('${b.id}')"><i data-lucide="trash-2"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');

        refreshIcons();
    }

    function openNewBookingModal() {
        const services = HabanaDB.Services.getActive();
        const workers = HabanaDB.Workers.getActive();
        const today = HabanaDB.utils.today();

        const body = `
            <div class="modal-form-group"><label>Cliente</label><input type="text" id="mBookName" placeholder="Nombre" required></div>
            <div class="modal-form-group"><label>Teléfono</label><input type="tel" id="mBookPhone" placeholder="Teléfono"></div>
            <div class="modal-form-group"><label>Servicio</label>
                <select id="mBookService">${services.map(s => `<option value="${s.id}" data-dur="${s.duration}" data-price="${s.price}" data-name="${s.name}">${s.name} (${s.price}€ — ${s.duration}min)</option>`).join('')}</select>
            </div>
            <div class="modal-form-group"><label>Barbero</label>
                <select id="mBookWorker">${workers.map(w => `<option value="${w.id}" data-name="${w.name}">${w.name}</option>`).join('')}</select>
            </div>
            <div class="modal-form-row">
                <div class="modal-form-group"><label>Fecha</label><input type="date" id="mBookDate" value="${today}" min="${today}"></div>
                <div class="modal-form-group"><label>Hora</label><input type="time" id="mBookTime" value="10:00"></div>
            </div>
            <div class="modal-form-group"><label>Notas</label><textarea id="mBookNotes" rows="2" placeholder="Notas opcionales"></textarea></div>
        `;

        const footer = `
            <button class="btn-admin btn-outline-admin" onclick="document.getElementById('modalOverlay').style.display='none'">Cancelar</button>
            <button class="btn-admin btn-primary-admin" id="mBookSubmit">Crear Reserva</button>
        `;

        openModal('Nueva Reserva', body, footer);

        document.getElementById('mBookSubmit').addEventListener('click', () => {
            const svcSelect = document.getElementById('mBookService');
            const wkrSelect = document.getElementById('mBookWorker');
            const opt = svcSelect.selectedOptions[0];
            const wOpt = wkrSelect.selectedOptions[0];

            const booking = {
                clientName: document.getElementById('mBookName').value.trim(),
                clientPhone: document.getElementById('mBookPhone').value.trim(),
                serviceId: svcSelect.value,
                serviceName: opt.dataset.name,
                servicePrice: parseFloat(opt.dataset.price),
                duration: parseInt(opt.dataset.dur),
                workerId: wkrSelect.value,
                workerName: wOpt.dataset.name,
                date: document.getElementById('mBookDate').value,
                time: document.getElementById('mBookTime').value,
                notes: document.getElementById('mBookNotes').value.trim(),
                status: 'confirmed'
            };

            if (!booking.clientName) { showToast('Nombre del cliente requerido', 'error'); return; }

            // Create or find client
            let client = HabanaDB.Clients.findByPhone(booking.clientPhone);
            if (!client && booking.clientPhone) {
                client = HabanaDB.Clients.create({ name: booking.clientName, phone: booking.clientPhone });
            }
            if (client) booking.clientId = client.id;

            HabanaDB.Bookings.create(booking);
            closeModal();
            showToast('Reserva creada correctamente');
            renderBookingsTable();
            initNotificationBadges();
        });
    }

    // =========================================================
    // CALENDAR
    // =========================================================
    let calDate = new Date();
    let calView = 'month';

    function loadCalendar() {
        // View buttons
        document.querySelectorAll('.cal-view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.cal-view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                calView = btn.dataset.view;
                renderCalendar();
            });
        });

        document.getElementById('calPrev').addEventListener('click', () => {
            if (calView === 'month') calDate.setMonth(calDate.getMonth() - 1);
            else if (calView === 'week') calDate.setDate(calDate.getDate() - 7);
            else calDate.setDate(calDate.getDate() - 1);
            renderCalendar();
        });

        document.getElementById('calNext').addEventListener('click', () => {
            if (calView === 'month') calDate.setMonth(calDate.getMonth() + 1);
            else if (calView === 'week') calDate.setDate(calDate.getDate() + 7);
            else calDate.setDate(calDate.getDate() + 1);
            renderCalendar();
        });

        document.getElementById('calToday').addEventListener('click', () => {
            calDate = new Date();
            renderCalendar();
        });

        renderCalendar();
    }

    function renderCalendar() {
        const container = document.getElementById('calendarContainer');
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        if (calView === 'month') {
            document.getElementById('calTitle').textContent = months[calDate.getMonth()] + ' ' + calDate.getFullYear();
            renderMonthView(container);
        } else if (calView === 'week') {
            const start = new Date(calDate);
            start.setDate(start.getDate() - start.getDay() + 1);
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            document.getElementById('calTitle').textContent = `${start.getDate()} — ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`;
            renderWeekView(container, start);
        } else {
            document.getElementById('calTitle').textContent = calDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            renderDayView(container, calDate);
        }
        refreshIcons();
    }

    function renderMonthView(container) {
        const y = calDate.getFullYear();
        const m = calDate.getMonth();
        const firstDay = new Date(y, m, 1).getDay();
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        const startOffset = (firstDay === 0 ? 6 : firstDay - 1);
        const today = HabanaDB.utils.today();

        const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        let html = '<div class="cal-grid">';
        days.forEach(d => { html += `<div class="cal-header-cell">${d}</div>`; });

        // Previous month days
        const prevMonthDays = new Date(y, m, 0).getDate();
        for (let i = startOffset - 1; i >= 0; i--) {
            const day = prevMonthDays - i;
            html += `<div class="cal-cell other-month"><span class="cal-day">${day}</span></div>`;
        }

        // Current month
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isToday = dateStr === today;
            const bookings = HabanaDB.Bookings.getByDate(dateStr).filter(b => b.status !== 'cancelled');
            
            html += `<div class="cal-cell ${isToday ? 'today' : ''}" data-date="${dateStr}">`;
            html += `<span class="cal-day">${d}</span>`;
            bookings.slice(0, 3).forEach(b => {
                html += `<div class="cal-event ${b.status}">${b.time} ${b.clientName}</div>`;
            });
            if (bookings.length > 3) {
                html += `<div style="font-size:0.6rem;color:#6b7280;">+${bookings.length - 3} más</div>`;
            }
            html += '</div>';
        }

        // Fill remaining
        const totalCells = startOffset + daysInMonth;
        const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 1; i <= remaining; i++) {
            html += `<div class="cal-cell other-month"><span class="cal-day">${i}</span></div>`;
        }

        html += '</div>';
        container.innerHTML = html;

        // Click on day -> day view
        container.querySelectorAll('.cal-cell:not(.other-month)').forEach(cell => {
            cell.addEventListener('click', () => {
                const d = cell.dataset.date;
                if (d) {
                    calDate = new Date(d);
                    calView = 'day';
                    document.querySelectorAll('.cal-view-btn').forEach(b => b.classList.remove('active'));
                    document.querySelector('.cal-view-btn[data-view="day"]').classList.add('active');
                    renderCalendar();
                }
            });
        });
    }

    function renderWeekView(container, startDate) {
        const workers = HabanaDB.Workers.getActive();
        const today = HabanaDB.utils.today();
        const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

        let html = '<div style="overflow-x:auto;"><table class="data-table" style="min-width:700px;"><thead><tr><th>Hora</th>';
        
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const isToday = dateStr === today;
            html += `<th style="${isToday ? 'background:rgba(193,154,107,0.1);' : ''}">${dayNames[i]} ${d.getDate()}</th>`;
        }
        html += '</tr></thead><tbody>';

        for (let h = 10; h < 20; h++) {
            for (let m = 0; m < 60; m += 30) {
                const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                html += `<tr><td style="font-size:0.75rem;color:#6b7280;white-space:nowrap;">${time}</td>`;
                for (let i = 0; i < 7; i++) {
                    const d = new Date(startDate);
                    d.setDate(d.getDate() + i);
                    const dateStr = d.toISOString().split('T')[0];
                    const bookings = HabanaDB.Bookings.getByDate(dateStr).filter(b => b.time === time && b.status !== 'cancelled');
                    
                    html += '<td style="font-size:0.75rem;padding:4px 6px;">';
                    bookings.forEach(b => {
                        html += `<div class="cal-event ${b.status}" style="margin:1px 0;">${b.clientName}<br><small>${b.workerName}</small></div>`;
                    });
                    html += '</td>';
                }
                html += '</tr>';
            }
        }

        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    function renderDayView(container, date) {
        const dateStr = date.toISOString().split('T')[0];
        const workers = HabanaDB.Workers.getActive();
        
        let html = '<div style="overflow-x:auto;"><table class="data-table" style="min-width:500px;"><thead><tr><th style="width:70px;">Hora</th>';
        workers.forEach(w => {
            html += `<th style="text-align:center;">${w.name}</th>`;
        });
        html += '</tr></thead><tbody>';

        for (let h = 10; h < 20; h++) {
            for (let m = 0; m < 60; m += 30) {
                const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                html += `<tr><td style="font-size:0.75rem;color:#6b7280;">${time}</td>`;

                workers.forEach(w => {
                    const booking = HabanaDB.Bookings.getByWorker(w.id, dateStr)
                        .find(b => b.time === time && b.status !== 'cancelled');
                    
                    if (booking) {
                        html += `<td style="padding:4px;"><div class="cal-event ${booking.status}" style="padding:4px 8px;border-radius:6px;">
                            <strong>${booking.clientName}</strong><br>
                            <small>${booking.serviceName}</small>
                        </div></td>`;
                    } else {
                        html += '<td></td>';
                    }
                });

                html += '</tr>';
            }
        }

        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    // =========================================================
    // CLIENTS
    // =========================================================
    function loadClients() {
        renderClientsTable();

        document.getElementById('clientSearch').addEventListener('input', (e) => {
            renderClientsTable(e.target.value);
        });

        document.getElementById('newClientBtn').addEventListener('click', openNewClientModal);
    }

    function renderClientsTable(search = '') {
        let clients = HabanaDB.Clients.getAll();
        if (search) {
            const s = search.toLowerCase();
            clients = clients.filter(c => 
                c.name.toLowerCase().includes(s) || 
                (c.phone && c.phone.includes(s)) ||
                (c.email && c.email.toLowerCase().includes(s))
            );
        }
        clients.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));

        const body = document.getElementById('clientsBody');
        if (clients.length === 0) {
            body.innerHTML = '<tr><td colspan="7" class="empty-state">No hay clientes</td></tr>';
            return;
        }

        body.innerHTML = clients.map(c => `
            <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.phone || '-'}</td>
                <td>${c.email || '-'}</td>
                <td>${c.visits || 0}</td>
                <td><strong>${(c.totalSpent || 0).toFixed(2)}€</strong></td>
                <td>${c.lastVisit ? new Date(c.lastVisit).toLocaleDateString('es-ES') : '-'}</td>
                <td>
                    <div class="table-actions">
                        <button class="table-action edit" title="Editar" onclick="adminActions.editClient('${c.id}')"><i data-lucide="pencil"></i></button>
                        <button class="table-action delete" title="Eliminar" onclick="adminActions.deleteClient('${c.id}')"><i data-lucide="trash-2"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');

        refreshIcons();
    }

    function openNewClientModal() {
        const body = `
            <div class="modal-form-group"><label>Nombre</label><input type="text" id="mClientName" placeholder="Nombre completo"></div>
            <div class="modal-form-group"><label>Teléfono</label><input type="tel" id="mClientPhone" placeholder="Teléfono"></div>
            <div class="modal-form-group"><label>Email</label><input type="email" id="mClientEmail" placeholder="Email (opcional)"></div>
        `;
        const footer = `
            <button class="btn-admin btn-outline-admin" onclick="document.getElementById('modalOverlay').style.display='none'">Cancelar</button>
            <button class="btn-admin btn-primary-admin" id="mClientSubmit">Crear Cliente</button>
        `;
        openModal('Nuevo Cliente', body, footer);
        document.getElementById('mClientSubmit').addEventListener('click', () => {
            const name = document.getElementById('mClientName').value.trim();
            if (!name) { showToast('Nombre requerido', 'error'); return; }
            HabanaDB.Clients.create({
                name,
                phone: document.getElementById('mClientPhone').value.trim(),
                email: document.getElementById('mClientEmail').value.trim()
            });
            closeModal();
            showToast('Cliente creado');
            renderClientsTable();
        });
    }

    // =========================================================
    // WORKERS (TRABAJADORES)
    // =========================================================
    function loadWorkers() {
        renderWorkersGrid();
        document.getElementById('newWorkerBtn').addEventListener('click', openNewWorkerModal);
    }

    function renderWorkersGrid() {
        const workers = HabanaDB.Workers.getAll();
        const grid = document.getElementById('workersGrid');

        if (workers.length === 0) {
            grid.innerHTML = '<p class="empty-state">No hay trabajadores</p>';
            return;
        }

        grid.innerHTML = workers.map(w => `
            <div class="worker-card">
                <div class="worker-card-header">
                    <div class="worker-avatar" style="background:${w.color || '#C19A6B'};">${w.name.charAt(0)}</div>
                    <div>
                        <h3>${w.name} <span class="status-dot ${w.active ? 'active' : 'inactive'}"></span></h3>
                        <small style="color:#6b7280;">${w.phone || ''}</small>
                    </div>
                </div>
                <div class="worker-specialties">
                    ${(w.specialties || []).map(s => `<span class="worker-specialty">${s}</span>`).join('')}
                </div>
                <div class="worker-schedule">
                    ${Object.entries(w.schedule || {}).map(([day, s]) => 
                        s.active ? `<span>${day}: ${s.start} — ${s.end}</span>` : `<span style="text-decoration:line-through;opacity:0.4;">${day}: Libre</span>`
                    ).join('')}
                </div>
                <div class="worker-actions">
                    <button class="btn-admin btn-outline-admin" onclick="adminActions.editWorker('${w.id}')">
                        <i data-lucide="pencil"></i> Editar
                    </button>
                    <button class="btn-admin btn-outline-admin" onclick="adminActions.toggleWorker('${w.id}')">
                        <i data-lucide="${w.active ? 'pause' : 'play'}"></i> ${w.active ? 'Desactivar' : 'Activar'}
                    </button>
                </div>
            </div>
        `).join('');

        refreshIcons();
    }

    function openNewWorkerModal() {
        const body = `
            <div class="modal-form-group"><label>Nombre</label><input type="text" id="mWkrName" placeholder="Nombre"></div>
            <div class="modal-form-group"><label>Teléfono</label><input type="tel" id="mWkrPhone" placeholder="Teléfono"></div>
            <div class="modal-form-group"><label>Color</label><input type="color" id="mWkrColor" value="#C19A6B"></div>
            <div class="modal-form-group"><label>Especialidades (separadas por coma)</label><input type="text" id="mWkrSpec" placeholder="Corte, Barba, ..."></div>
        `;
        const footer = `
            <button class="btn-admin btn-outline-admin" onclick="document.getElementById('modalOverlay').style.display='none'">Cancelar</button>
            <button class="btn-admin btn-primary-admin" id="mWkrSubmit">Crear Trabajador</button>
        `;
        openModal('Nuevo Trabajador', body, footer);
        document.getElementById('mWkrSubmit').addEventListener('click', () => {
            const name = document.getElementById('mWkrName').value.trim();
            if (!name) { showToast('Nombre requerido', 'error'); return; }
            HabanaDB.Workers.create({
                name,
                phone: document.getElementById('mWkrPhone').value.trim(),
                color: document.getElementById('mWkrColor').value,
                specialties: document.getElementById('mWkrSpec').value.split(',').map(s => s.trim()).filter(Boolean),
                schedule: {
                    lunes: { start: '10:00', end: '20:00', active: true },
                    martes: { start: '10:00', end: '20:00', active: true },
                    miércoles: { start: '10:00', end: '20:00', active: true },
                    jueves: { start: '10:00', end: '20:00', active: true },
                    viernes: { start: '10:00', end: '20:00', active: true },
                    sábado: { start: '10:00', end: '20:00', active: true },
                    domingo: { start: '', end: '', active: false }
                }
            });
            closeModal();
            showToast('Trabajador creado');
            renderWorkersGrid();
        });
    }

    // =========================================================
    // SERVICES ADMIN
    // =========================================================
    function loadServicesAdmin() {
        renderServicesAdminGrid();
        document.getElementById('newServiceBtn').addEventListener('click', openNewServiceModal);
    }

    function renderServicesAdminGrid() {
        const services = HabanaDB.Services.getAll().sort((a, b) => a.order - b.order);
        const grid = document.getElementById('servicesAdminGrid');

        grid.innerHTML = services.map(s => `
            <div class="service-admin-card" style="opacity:${s.active ? 1 : 0.5};">
                <div class="service-admin-header">
                    <span class="service-admin-name">${s.name}</span>
                    <span class="service-admin-price">${s.price}€</span>
                </div>
                <div class="service-admin-meta">${s.duration} min • ${s.description || ''}</div>
                <div class="service-admin-actions">
                    <button class="btn-admin btn-outline-admin" onclick="adminActions.editService('${s.id}')"><i data-lucide="pencil"></i> Editar</button>
                    <button class="btn-admin btn-outline-admin" onclick="adminActions.toggleService('${s.id}', ${!s.active})"><i data-lucide="${s.active ? 'eye-off' : 'eye'}"></i> ${s.active ? 'Desactivar' : 'Activar'}</button>
                    <button class="btn-admin btn-danger-admin" onclick="adminActions.deleteService('${s.id}')"><i data-lucide="trash-2"></i></button>
                </div>
            </div>
        `).join('');

        refreshIcons();
    }

    function openNewServiceModal() {
        const body = `
            <div class="modal-form-group"><label>Nombre</label><input type="text" id="mSvcName" placeholder="Nombre del servicio"></div>
            <div class="modal-form-row">
                <div class="modal-form-group"><label>Precio (€)</label><input type="number" id="mSvcPrice" step="0.5" min="0" value="15"></div>
                <div class="modal-form-group"><label>Duración (min)</label><input type="number" id="mSvcDur" min="5" step="5" value="30"></div>
            </div>
            <div class="modal-form-group"><label>Descripción</label><textarea id="mSvcDesc" rows="2" placeholder="Descripción"></textarea></div>
        `;
        const footer = `
            <button class="btn-admin btn-outline-admin" onclick="document.getElementById('modalOverlay').style.display='none'">Cancelar</button>
            <button class="btn-admin btn-primary-admin" id="mSvcSubmit">Crear Servicio</button>
        `;
        openModal('Nuevo Servicio', body, footer);
        document.getElementById('mSvcSubmit').addEventListener('click', () => {
            const name = document.getElementById('mSvcName').value.trim();
            if (!name) { showToast('Nombre requerido', 'error'); return; }
            HabanaDB.Services.create({
                name,
                price: parseFloat(document.getElementById('mSvcPrice').value) || 0,
                duration: parseInt(document.getElementById('mSvcDur').value) || 30,
                description: document.getElementById('mSvcDesc').value.trim(),
                icon: 'scissors'
            });
            closeModal();
            showToast('Servicio creado');
            renderServicesAdminGrid();
        });
    }

    // =========================================================
    // TPV (PUNTO DE VENTA)
    // =========================================================
    let tpvItems = [];

    function loadTPV() {
        renderTPVServices();
        renderTPVTicket();
        renderTPVHistory();
        loadTPVWorkerSelect();

        // Payment buttons
        document.querySelectorAll('.tpv-pay-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                processPayment(btn.dataset.method);
            });
        });
    }

    function renderTPVServices() {
        const services = HabanaDB.Services.getActive();
        const grid = document.getElementById('tpvServices');
        grid.innerHTML = services.map(s => `
            <div class="tpv-service-btn" data-id="${s.id}" data-name="${s.name}" data-price="${s.price}" data-dur="${s.duration}">
                <span class="tpv-svc-name">${s.name}</span>
                <span class="tpv-svc-price">${s.price}€</span>
                <span class="tpv-svc-dur">${s.duration} min</span>
            </div>
        `).join('');

        grid.querySelectorAll('.tpv-service-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                tpvItems.push({
                    id: btn.dataset.id,
                    name: btn.dataset.name,
                    price: parseFloat(btn.dataset.price),
                    duration: parseInt(btn.dataset.dur)
                });
                renderTPVTicket();
            });
        });
    }

    function renderTPVTicket() {
        const ticketEl = document.getElementById('tpvTicket');
        const totalEl = document.getElementById('tpvTotal');

        if (tpvItems.length === 0) {
            ticketEl.innerHTML = '<p class="empty-state">Añade servicios al ticket</p>';
            totalEl.textContent = '0,00€';
            return;
        }

        ticketEl.innerHTML = tpvItems.map((item, idx) => `
            <div class="tpv-ticket-item">
                <span class="tpv-item-name">${item.name}</span>
                <span class="tpv-item-price">${item.price.toFixed(2)}€</span>
                <span class="tpv-item-remove" onclick="adminActions.removeTpvItem(${idx})"><i data-lucide="x"></i></span>
            </div>
        `).join('');

        const total = tpvItems.reduce((sum, i) => sum + i.price, 0);
        totalEl.textContent = total.toFixed(2) + '€';
        refreshIcons();
    }

    function loadTPVWorkerSelect() {
        const workers = HabanaDB.Workers.getActive();
        const select = document.getElementById('tpvWorker');
        select.innerHTML = workers.map(w => `<option value="${w.id}" data-name="${w.name}">${w.name}</option>`).join('');
    }

    function processPayment(method) {
        if (tpvItems.length === 0) { showToast('Añade servicios primero', 'error'); return; }

        const clientName = document.getElementById('tpvClientName').value.trim() || 'Cliente anónimo';
        const clientPhone = document.getElementById('tpvClientPhone').value.trim();
        const workerSelect = document.getElementById('tpvWorker');
        const workerOpt = workerSelect.selectedOptions[0];
        const total = tpvItems.reduce((sum, i) => sum + i.price, 0);

        // Find or create client
        let client = null;
        if (clientPhone) {
            client = HabanaDB.Clients.findByPhone(clientPhone);
            if (!client) {
                client = HabanaDB.Clients.create({ name: clientName, phone: clientPhone });
            }
        }

        const transaction = HabanaDB.Transactions.create({
            clientName,
            clientPhone,
            clientId: client ? client.id : null,
            workerId: workerSelect.value,
            workerName: workerOpt ? workerOpt.dataset.name : '',
            items: [...tpvItems],
            total,
            paymentMethod: method,
            time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        });

        const methodLabels = { cash: 'Efectivo', card: 'Tarjeta', bizum: 'Bizum' };
        showToast(`Cobro de ${total.toFixed(2)}€ (${methodLabels[method]}) registrado`);

        // Reset
        tpvItems = [];
        document.getElementById('tpvClientName').value = '';
        document.getElementById('tpvClientPhone').value = '';
        renderTPVTicket();
        renderTPVHistory();
    }

    function renderTPVHistory() {
        const transactions = HabanaDB.Transactions.getToday().reverse();
        const body = document.getElementById('tpvHistoryBody');
        const methodLabels = { cash: 'Efectivo', card: 'Tarjeta', bizum: 'Bizum' };

        if (transactions.length === 0) {
            body.innerHTML = '<tr><td colspan="6" class="empty-state">Sin transacciones hoy</td></tr>';
            return;
        }

        body.innerHTML = transactions.map(t => `
            <tr>
                <td>${t.time || '-'}</td>
                <td>${t.clientName || '-'}</td>
                <td>${t.workerName || '-'}</td>
                <td>${(t.items || []).map(i => i.name).join(', ')}</td>
                <td><span class="status-badge status-confirmed">${methodLabels[t.paymentMethod] || t.paymentMethod}</span></td>
                <td><strong>${(t.total || 0).toFixed(2)}€</strong></td>
            </tr>
        `).join('');
    }

    // =========================================================
    // REPORTS (INFORMES)
    // =========================================================
    function loadReportsPage() {
        const reportDate = document.getElementById('reportDate');
        reportDate.value = HabanaDB.utils.today();

        document.getElementById('generateReport').addEventListener('click', generateReportUI);
        document.getElementById('printReport').addEventListener('click', () => window.print());
    }

    function generateReportUI() {
        const type = document.getElementById('reportType').value;
        const date = document.getElementById('reportDate').value;
        const container = document.getElementById('reportContent');

        if (!date) { showToast('Selecciona una fecha', 'error'); return; }

        let report;
        let title;

        if (type === 'daily') {
            report = HabanaDB.Reports.generateDaily(date);
            title = `Informe Diario — ${new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
        } else if (type === 'weekly') {
            report = HabanaDB.Reports.generateWeekly(date);
            title = `Informe Semanal — Desde ${date}`;
        } else {
            const d = new Date(date);
            report = HabanaDB.Reports.generateMonthly(d.getFullYear(), d.getMonth() + 1);
            const months = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            title = `Informe Mensual — ${months[d.getMonth() + 1]} ${d.getFullYear()}`;
        }

        if (type === 'daily') {
            renderDailyReport(container, report, title);
        } else {
            renderAggregateReport(container, report, title, type);
        }
    }

    function renderDailyReport(container, r, title) {
        const svcEntries = Object.entries(r.serviceBreakdown);
        const wkrEntries = Object.entries(r.workerBreakdown);
        const maxSvcRevenue = Math.max(...svcEntries.map(([, v]) => v.revenue), 1);
        const maxWkrRevenue = Math.max(...wkrEntries.map(([, v]) => v.revenue), 1);

        container.innerHTML = `
            <div class="report-header">
                <h2>${title}</h2>
                <p>Habana BarberShop — Generado el ${new Date().toLocaleString('es-ES')}</p>
            </div>
            <div class="report-stats">
                <div class="report-stat"><span class="report-stat-value">${r.totalRevenue.toFixed(2)}€</span><span class="report-stat-label">Ingresos</span></div>
                <div class="report-stat"><span class="report-stat-value">${r.totalTransactions}</span><span class="report-stat-label">Transacciones</span></div>
                <div class="report-stat"><span class="report-stat-value">${r.totalBookings}</span><span class="report-stat-label">Citas</span></div>
                <div class="report-stat"><span class="report-stat-value">${r.averageTicket.toFixed(2)}€</span><span class="report-stat-label">Ticket Medio</span></div>
            </div>
            <div class="report-section">
                <h3>Estado de Citas</h3>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;">
                    <div style="padding:12px;background:#f0fdf4;border-radius:8px;"><strong style="color:#10b981;">${r.completedBookings}</strong><br><small>Completadas</small></div>
                    <div style="padding:12px;background:#fefce8;border-radius:8px;"><strong style="color:#f59e0b;">${r.pendingBookings}</strong><br><small>Pendientes</small></div>
                    <div style="padding:12px;background:#fef2f2;border-radius:8px;"><strong style="color:#ef4444;">${r.cancelledBookings}</strong><br><small>Canceladas</small></div>
                    <div style="padding:12px;background:#eff6ff;border-radius:8px;"><strong style="color:#3b82f6;">${r.totalBookings - r.completedBookings - r.pendingBookings - r.cancelledBookings}</strong><br><small>Confirmadas</small></div>
                </div>
            </div>
            <div class="report-section">
                <h3>Desglose por Servicio</h3>
                ${svcEntries.length === 0 ? '<p class="empty-state">Sin datos</p>' : svcEntries.map(([name, data]) => `
                    <div class="report-bar-container">
                        <div class="report-bar-label"><span>${name} (x${data.count})</span><span>${data.revenue.toFixed(2)}€</span></div>
                        <div class="report-bar"><div class="report-bar-fill" style="width:${(data.revenue / maxSvcRevenue * 100)}%;"></div></div>
                    </div>
                `).join('')}
            </div>
            <div class="report-section">
                <h3>Desglose por Barbero</h3>
                ${wkrEntries.length === 0 ? '<p class="empty-state">Sin datos</p>' : wkrEntries.map(([name, data]) => `
                    <div class="report-bar-container">
                        <div class="report-bar-label"><span>${name} (${data.count} servicios)</span><span>${data.revenue.toFixed(2)}€</span></div>
                        <div class="report-bar"><div class="report-bar-fill" style="width:${(data.revenue / maxWkrRevenue * 100)}%;"></div></div>
                    </div>
                `).join('')}
            </div>
            <div class="report-section">
                <h3>Método de Pago</h3>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center;">
                    <div style="padding:16px;background:#f8f9fc;border-radius:8px;"><strong>${(r.paymentBreakdown.cash || 0).toFixed(2)}€</strong><br><small>Efectivo</small></div>
                    <div style="padding:16px;background:#f8f9fc;border-radius:8px;"><strong>${(r.paymentBreakdown.card || 0).toFixed(2)}€</strong><br><small>Tarjeta</small></div>
                    <div style="padding:16px;background:#f8f9fc;border-radius:8px;"><strong>${(r.paymentBreakdown.bizum || 0).toFixed(2)}€</strong><br><small>Bizum</small></div>
                </div>
            </div>
        `;
    }

    function renderAggregateReport(container, r, title, type) {
        container.innerHTML = `
            <div class="report-header">
                <h2>${title}</h2>
                <p>Habana BarberShop — Generado el ${new Date().toLocaleString('es-ES')}</p>
            </div>
            <div class="report-stats">
                <div class="report-stat"><span class="report-stat-value">${r.totalRevenue.toFixed(2)}€</span><span class="report-stat-label">Ingresos Totales</span></div>
                <div class="report-stat"><span class="report-stat-value">${r.totalBookings}</span><span class="report-stat-label">Total Citas</span></div>
                <div class="report-stat"><span class="report-stat-value">${r.avgDailyRevenue.toFixed(2)}€</span><span class="report-stat-label">Media Diaria</span></div>
                <div class="report-stat"><span class="report-stat-value">${r.days.length}</span><span class="report-stat-label">Días</span></div>
            </div>
            <div class="report-section">
                <h3>Ingresos por Día</h3>
                ${r.days.map(d => `
                    <div class="report-bar-container">
                        <div class="report-bar-label"><span>${d.date}</span><span>${d.totalRevenue.toFixed(2)}€ (${d.totalBookings} citas)</span></div>
                        <div class="report-bar"><div class="report-bar-fill" style="width:${Math.max(d.totalRevenue / (r.totalRevenue || 1) * 100 * r.days.length / 2, 2)}%;"></div></div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // =========================================================
    // NOTIFICATIONS
    // =========================================================
    function loadNotifications() {
        const list = document.getElementById('notificationsList');
        const notifs = HabanaDB.Notifications.getAll();

        if (notifs.length === 0) {
            list.innerHTML = '<p class="empty-state">Sin notificaciones</p>';
            return;
        }

        list.innerHTML = notifs.map(n => `
            <div class="notification-item ${n.read ? '' : 'unread'}" data-id="${n.id}" onclick="adminActions.readNotification('${n.id}')">
                <div class="notif-icon"><i data-lucide="bell"></i></div>
                <div class="notif-content">
                    <div class="notif-title">${n.title}</div>
                    <div class="notif-message">${n.message}</div>
                </div>
                <span class="notif-time">${timeAgo(n.createdAt)}</span>
            </div>
        `).join('');

        document.getElementById('markAllReadBtn').addEventListener('click', () => {
            HabanaDB.Notifications.markAllRead();
            loadNotifications();
            initNotificationBadges();
            showToast('Todas marcadas como leídas');
        });

        refreshIcons();
    }

    // =========================================================
    // SETTINGS (CONFIGURACIÓN)
    // =========================================================
    function loadSettings() {
        const settings = HabanaDB.Settings.get();

        document.getElementById('setBizName').value = settings.businessName || '';
        document.getElementById('setBizAddress').value = settings.address || '';
        document.getElementById('setBizPhone').value = settings.phone || '';
        document.getElementById('setBizEmail').value = settings.email || '';
        document.getElementById('setBizOpen').value = settings.openTime || '10:00';
        document.getElementById('setBizClose').value = settings.closeTime || '20:00';
        document.getElementById('setBizSlot').value = settings.slotInterval || 30;

        const social = settings.socialMedia || {};
        document.getElementById('setSocialIG').value = social.instagram || '';
        document.getElementById('setSocialFB').value = social.facebook || '';
        document.getElementById('setSocialWA').value = social.whatsapp || '';
        document.getElementById('setSocialTT').value = social.tiktok || '';

        // Settings form
        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            HabanaDB.Settings.update({
                businessName: document.getElementById('setBizName').value.trim(),
                address: document.getElementById('setBizAddress').value.trim(),
                phone: document.getElementById('setBizPhone').value.trim(),
                email: document.getElementById('setBizEmail').value.trim(),
                openTime: document.getElementById('setBizOpen').value,
                closeTime: document.getElementById('setBizClose').value,
                slotInterval: parseInt(document.getElementById('setBizSlot').value) || 30
            });
            showToast('Configuración guardada');
        });

        // Social form
        document.getElementById('socialForm').addEventListener('submit', (e) => {
            e.preventDefault();
            HabanaDB.Settings.update({
                socialMedia: {
                    instagram: document.getElementById('setSocialIG').value.trim(),
                    facebook: document.getElementById('setSocialFB').value.trim(),
                    whatsapp: document.getElementById('setSocialWA').value.trim(),
                    tiktok: document.getElementById('setSocialTT').value.trim()
                }
            });
            showToast('Redes sociales guardadas');
        });

        // Password form
        document.getElementById('passwordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const oldPass = document.getElementById('setPassOld').value;
            const newPass = document.getElementById('setPassNew').value;
            const confirmPass = document.getElementById('setPassConfirm').value;

            if (newPass !== confirmPass) { showToast('Las contraseñas no coinciden', 'error'); return; }
            if (newPass.length < 4) { showToast('Mínimo 4 caracteres', 'error'); return; }

            if (HabanaDB.Auth.changePassword(oldPass, newPass)) {
                showToast('Contraseña cambiada correctamente');
                document.getElementById('passwordForm').reset();
            } else {
                showToast('Contraseña actual incorrecta', 'error');
            }
        });

        // Export data
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            const data = {};
            const keys = ['services', 'workers', 'clients', 'bookings', 'transactions', 'notifications', 'settings'];
            keys.forEach(k => {
                const val = localStorage.getItem('habana_' + k);
                if (val) data[k] = JSON.parse(val);
            });
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `habana_backup_${HabanaDB.utils.today()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Datos exportados');
        });

        // Reset data
        document.getElementById('resetDataBtn').addEventListener('click', () => {
            if (confirm('⚠️ ¿Estás seguro? Se borrarán TODOS los datos. Esta acción no se puede deshacer.')) {
                if (confirm('Confirma de nuevo para borrar todo.')) {
                    const keys = ['services', 'workers', 'clients', 'bookings', 'transactions', 'notifications', 'settings', 'admin'];
                    keys.forEach(k => localStorage.removeItem('habana_' + k));
                    location.reload();
                }
            }
        });
    }

    // =========================================================
    // GLOBAL ACTIONS (exposed to onclick handlers)
    // =========================================================
    window.adminActions = {
        confirmBooking(id) {
            HabanaDB.Bookings.confirm(id);
            showToast('Reserva confirmada');
            renderBookingsTable();
            initNotificationBadges();
        },
        completeBooking(id) {
            HabanaDB.Bookings.complete(id);
            showToast('Reserva completada');
            renderBookingsTable();
            initNotificationBadges();
        },
        cancelBooking(id) {
            if (confirm('¿Cancelar esta reserva?')) {
                HabanaDB.Bookings.cancel(id);
                showToast('Reserva cancelada');
                renderBookingsTable();
                initNotificationBadges();
            }
        },
        deleteBooking(id) {
            if (confirm('¿Eliminar esta reserva?')) {
                HabanaDB.Bookings.delete(id);
                showToast('Reserva eliminada');
                renderBookingsTable();
            }
        },
        editClient(id) {
            const client = HabanaDB.Clients.getById(id);
            if (!client) return;
            const body = `
                <div class="modal-form-group"><label>Nombre</label><input type="text" id="mEditCName" value="${client.name || ''}"></div>
                <div class="modal-form-group"><label>Teléfono</label><input type="tel" id="mEditCPhone" value="${client.phone || ''}"></div>
                <div class="modal-form-group"><label>Email</label><input type="email" id="mEditCEmail" value="${client.email || ''}"></div>
            `;
            const footer = `
                <button class="btn-admin btn-outline-admin" onclick="document.getElementById('modalOverlay').style.display='none'">Cancelar</button>
                <button class="btn-admin btn-primary-admin" id="mEditCSubmit">Guardar</button>
            `;
            openModal('Editar Cliente', body, footer);
            document.getElementById('mEditCSubmit').addEventListener('click', () => {
                HabanaDB.Clients.update(id, {
                    name: document.getElementById('mEditCName').value.trim(),
                    phone: document.getElementById('mEditCPhone').value.trim(),
                    email: document.getElementById('mEditCEmail').value.trim()
                });
                closeModal();
                showToast('Cliente actualizado');
                renderClientsTable();
            });
        },
        deleteClient(id) {
            if (confirm('¿Eliminar este cliente?')) {
                HabanaDB.Clients.delete(id);
                showToast('Cliente eliminado');
                renderClientsTable();
            }
        },
        editWorker(id) {
            const worker = HabanaDB.Workers.getById(id);
            if (!worker) return;
            const body = `
                <div class="modal-form-group"><label>Nombre</label><input type="text" id="mEditWName" value="${worker.name || ''}"></div>
                <div class="modal-form-group"><label>Teléfono</label><input type="tel" id="mEditWPhone" value="${worker.phone || ''}"></div>
                <div class="modal-form-group"><label>Color</label><input type="color" id="mEditWColor" value="${worker.color || '#C19A6B'}"></div>
                <div class="modal-form-group"><label>Especialidades</label><input type="text" id="mEditWSpec" value="${(worker.specialties || []).join(', ')}"></div>
            `;
            const footer = `
                <button class="btn-admin btn-outline-admin" onclick="document.getElementById('modalOverlay').style.display='none'">Cancelar</button>
                <button class="btn-admin btn-primary-admin" id="mEditWSubmit">Guardar</button>
            `;
            openModal('Editar Trabajador', body, footer);
            document.getElementById('mEditWSubmit').addEventListener('click', () => {
                HabanaDB.Workers.update(id, {
                    name: document.getElementById('mEditWName').value.trim(),
                    phone: document.getElementById('mEditWPhone').value.trim(),
                    color: document.getElementById('mEditWColor').value,
                    specialties: document.getElementById('mEditWSpec').value.split(',').map(s => s.trim()).filter(Boolean)
                });
                closeModal();
                showToast('Trabajador actualizado');
                renderWorkersGrid();
            });
        },
        toggleWorker(id) {
            const worker = HabanaDB.Workers.getById(id);
            if (!worker) return;
            HabanaDB.Workers.update(id, { active: !worker.active });
            showToast(worker.active ? 'Trabajador desactivado' : 'Trabajador activado');
            renderWorkersGrid();
        },
        editService(id) {
            const service = HabanaDB.Services.getById(id);
            if (!service) return;
            const body = `
                <div class="modal-form-group"><label>Nombre</label><input type="text" id="mEditSName" value="${service.name || ''}"></div>
                <div class="modal-form-row">
                    <div class="modal-form-group"><label>Precio (€)</label><input type="number" id="mEditSPrice" step="0.5" value="${service.price}"></div>
                    <div class="modal-form-group"><label>Duración (min)</label><input type="number" id="mEditSDur" step="5" value="${service.duration}"></div>
                </div>
                <div class="modal-form-group"><label>Descripción</label><textarea id="mEditSDesc" rows="2">${service.description || ''}</textarea></div>
            `;
            const footer = `
                <button class="btn-admin btn-outline-admin" onclick="document.getElementById('modalOverlay').style.display='none'">Cancelar</button>
                <button class="btn-admin btn-primary-admin" id="mEditSSubmit">Guardar</button>
            `;
            openModal('Editar Servicio', body, footer);
            document.getElementById('mEditSSubmit').addEventListener('click', () => {
                HabanaDB.Services.update(id, {
                    name: document.getElementById('mEditSName').value.trim(),
                    price: parseFloat(document.getElementById('mEditSPrice').value) || 0,
                    duration: parseInt(document.getElementById('mEditSDur').value) || 30,
                    description: document.getElementById('mEditSDesc').value.trim()
                });
                closeModal();
                showToast('Servicio actualizado');
                renderServicesAdminGrid();
            });
        },
        toggleService(id, active) {
            HabanaDB.Services.update(id, { active });
            showToast(active ? 'Servicio activado' : 'Servicio desactivado');
            renderServicesAdminGrid();
        },
        deleteService(id) {
            if (confirm('¿Eliminar este servicio?')) {
                HabanaDB.Services.delete(id);
                showToast('Servicio eliminado');
                renderServicesAdminGrid();
            }
        },
        removeTpvItem(idx) {
            tpvItems.splice(idx, 1);
            renderTPVTicket();
        },
        readNotification(id) {
            HabanaDB.Notifications.markRead(id);
            loadNotifications();
            initNotificationBadges();
        }
    };

    // =========================================================
    // UTILITIES
    // =========================================================
    function statusLabel(status) {
        const labels = { pending: 'Pendiente', confirmed: 'Confirmada', completed: 'Completada', cancelled: 'Cancelada' };
        return labels[status] || status;
    }

    function timeAgo(isoString) {
        const diff = Date.now() - new Date(isoString).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Ahora';
        if (mins < 60) return mins + ' min';
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return hrs + 'h';
        const days = Math.floor(hrs / 24);
        return days + 'd';
    }

    function refreshIcons() {
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 50);
        }
    }
});
