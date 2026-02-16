// ============================================================
// BARBERÍA HABANA — Sistema de Almacenamiento y Gestión
// Capa de persistencia con localStorage
// ============================================================

const HabanaDB = (() => {
    'use strict';

    // ---- Helpers ----
    const generateId = () => '_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    const now = () => new Date().toISOString();
    const today = () => new Date().toISOString().split('T')[0];

    function get(key) {
        try {
            const data = localStorage.getItem('habana_' + key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading ' + key, e);
            return null;
        }
    }

    function set(key, value) {
        try {
            localStorage.setItem('habana_' + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing ' + key, e);
            return false;
        }
    }

    // ---- Inicialización de datos por defecto ----
    function initDefaults() {
        // Admin por defecto
        if (!get('admin')) {
            set('admin', {
                username: 'admin',
                password: btoa('habana2026'),
                name: 'Administrador',
                createdAt: now()
            });
        }

        // Servicios por defecto — datos reales de Habana BarberShop Booksy
        if (!get('services')) {
            set('services', [
                { id: generateId(), name: 'Corte de Pelo', duration: 40, price: 15, icon: 'scissors', description: 'Corte clásico o moderno personalizado', active: true, order: 1 },
                { id: generateId(), name: 'Corte con Diseño', duration: 50, price: 20, icon: 'sparkles', description: 'Corte con diseño artístico personalizado', active: true, order: 2 },
                { id: generateId(), name: 'Corte + Cejas', duration: 50, price: 18, icon: 'eye', description: 'Corte completo con perfilado de cejas', active: true, order: 3 },
                { id: generateId(), name: 'Corte + Barba', duration: 70, price: 22, icon: 'user', description: 'Corte de pelo y arreglo de barba completo', active: true, order: 4 },
                { id: generateId(), name: 'Combo Exclusivo (Rostro, Cejas, Corte)', duration: 60, price: 25, icon: 'star', description: 'Combo exclusivo: rostro, cejas y corte de pelo', active: true, order: 5 },
                { id: generateId(), name: 'Combo Exclusivo Completo (Barba, Corte, Rostro)', duration: 110, price: 35, icon: 'crown', description: 'Combo completo: barba, corte de pelo y tratamiento facial', active: true, order: 6 },
                { id: generateId(), name: 'Rapado', duration: 15, price: 10, icon: 'zap', description: 'Rapado con máquina a medida', active: true, order: 7 },
                { id: generateId(), name: 'Decoloración', duration: 60, price: 35, icon: 'sun', description: 'Decoloración profesional (tiempo variable según cabello)', active: true, order: 8 },
                { id: generateId(), name: 'Cejas', duration: 10, price: 5, icon: 'eye', description: 'Perfilado y diseño de cejas', active: true, order: 9 },
                { id: generateId(), name: 'Arreglo de Barba', duration: 30, price: 10, icon: 'user', description: 'Arreglo y perfilado de barba profesional', active: true, order: 10 }
            ]);
        }

        // Trabajadores por defecto
        if (!get('workers')) {
            set('workers', [
                {
                    id: generateId(),
                    name: 'Andy',
                    phone: '631040925',
                    email: '',
                    color: '#C19A6B',
                    specialties: ['Corte', 'Barba', 'Diseño', 'Decoloración', 'Combo'],
                    schedule: {
                        lunes: { start: '10:00', end: '20:00', active: true },
                        martes: { start: '10:00', end: '20:00', active: true },
                        miércoles: { start: '10:00', end: '20:00', active: true },
                        jueves: { start: '10:00', end: '20:00', active: true },
                        viernes: { start: '10:00', end: '20:00', active: true },
                        sábado: { start: '10:00', end: '20:00', active: true },
                        domingo: { start: '', end: '', active: false }
                    },
                    active: true,
                    createdAt: now()
                },
                {
                    id: generateId(),
                    name: 'Rodrigo',
                    phone: '',
                    email: '',
                    color: '#D4A745',
                    specialties: ['Corte', 'Barba', 'Cejas', 'Rapado'],
                    schedule: {
                        lunes: { start: '10:00', end: '20:00', active: true },
                        martes: { start: '10:00', end: '20:00', active: true },
                        miércoles: { start: '10:00', end: '20:00', active: true },
                        jueves: { start: '10:00', end: '20:00', active: true },
                        viernes: { start: '10:00', end: '20:00', active: true },
                        sábado: { start: '10:00', end: '20:00', active: true },
                        domingo: { start: '', end: '', active: false }
                    },
                    active: true,
                    createdAt: now()
                }
            ]);
        }

        // Configuración por defecto
        if (!get('settings')) {
            set('settings', {
                businessName: 'Habana BarberShop',
                address: "Carrer d'Arcadi Balaguer, 69, 08860 Castelldefels, Barcelona",
                phone: '631 04 09 25',
                email: '',
                openTime: '10:00',
                closeTime: '20:00',
                slotInterval: 30,
                workDays: ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
                socialMedia: {
                    instagram: 'https://instagram.com/habana_barberia',
                    facebook: '',
                    whatsapp: '+34631040925',
                    tiktok: 'https://www.tiktok.com/@habana_barberia'
                },
                bookingMessage: '¡Gracias por reservar en Habana BarberShop!',
                cancellationPolicy: 'Muy pocas cancelaciones — respetamos tu tiempo.',
                updatedAt: now()
            });
        }

        // Inicializar arrays vacíos si no existen
        if (!get('bookings')) set('bookings', []);
        if (!get('clients')) set('clients', []);
        if (!get('transactions')) set('transactions', []);
        if (!get('notifications')) set('notifications', []);
    }

    // ---- MÓDULO: Servicios ----
    const Services = {
        getAll() { return get('services') || []; },
        getActive() { return this.getAll().filter(s => s.active).sort((a, b) => a.order - b.order); },
        getById(id) { return this.getAll().find(s => s.id === id); },
        create(service) {
            const services = this.getAll();
            service.id = generateId();
            service.active = true;
            service.order = services.length + 1;
            services.push(service);
            set('services', services);
            return service;
        },
        update(id, data) {
            const services = this.getAll();
            const idx = services.findIndex(s => s.id === id);
            if (idx === -1) return null;
            services[idx] = { ...services[idx], ...data };
            set('services', services);
            return services[idx];
        },
        delete(id) {
            const services = this.getAll().filter(s => s.id !== id);
            set('services', services);
        }
    };

    // ---- MÓDULO: Trabajadores ----
    const Workers = {
        getAll() { return get('workers') || []; },
        getActive() { return this.getAll().filter(w => w.active); },
        getById(id) { return this.getAll().find(w => w.id === id); },
        create(worker) {
            const workers = this.getAll();
            worker.id = generateId();
            worker.active = true;
            worker.createdAt = now();
            workers.push(worker);
            set('workers', workers);
            return worker;
        },
        update(id, data) {
            const workers = this.getAll();
            const idx = workers.findIndex(w => w.id === id);
            if (idx === -1) return null;
            workers[idx] = { ...workers[idx], ...data };
            set('workers', workers);
            return workers[idx];
        },
        delete(id) {
            const workers = this.getAll().filter(w => w.id !== id);
            set('workers', workers);
        }
    };

    // ---- MÓDULO: Clientes ----
    const Clients = {
        getAll() { return get('clients') || []; },
        getById(id) { return this.getAll().find(c => c.id === id); },
        findByPhone(phone) { return this.getAll().find(c => c.phone === phone); },
        findByName(name) {
            const lower = name.toLowerCase();
            return this.getAll().filter(c => c.name.toLowerCase().includes(lower));
        },
        create(client) {
            const clients = this.getAll();
            client.id = generateId();
            client.visits = 0;
            client.totalSpent = 0;
            client.createdAt = now();
            client.lastVisit = null;
            clients.push(client);
            set('clients', clients);
            return client;
        },
        update(id, data) {
            const clients = this.getAll();
            const idx = clients.findIndex(c => c.id === id);
            if (idx === -1) return null;
            clients[idx] = { ...clients[idx], ...data };
            set('clients', clients);
            return clients[idx];
        },
        addVisit(id, amount) {
            const clients = this.getAll();
            const idx = clients.findIndex(c => c.id === id);
            if (idx === -1) return null;
            clients[idx].visits = (clients[idx].visits || 0) + 1;
            clients[idx].totalSpent = (clients[idx].totalSpent || 0) + amount;
            clients[idx].lastVisit = now();
            set('clients', clients);
            return clients[idx];
        },
        delete(id) {
            const clients = this.getAll().filter(c => c.id !== id);
            set('clients', clients);
        },
        getStats() {
            const clients = this.getAll();
            return {
                total: clients.length,
                totalRevenue: clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
                avgSpent: clients.length ? clients.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / clients.length : 0,
                topClients: [...clients].sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0)).slice(0, 10)
            };
        }
    };

    // ---- MÓDULO: Reservas ----
    const Bookings = {
        getAll() { return get('bookings') || []; },
        getById(id) { return this.getAll().find(b => b.id === id); },
        getByDate(date) { return this.getAll().filter(b => b.date === date); },
        getByWorker(workerId, date) {
            return this.getAll().filter(b => b.workerId === workerId && b.date === date);
        },
        getByStatus(status) { return this.getAll().filter(b => b.status === status); },
        getPending() { return this.getByStatus('pending'); },
        getToday() { return this.getByDate(today()); },
        getUpcoming() {
            const t = today();
            return this.getAll()
                .filter(b => b.date >= t && b.status !== 'cancelled')
                .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
        },
        create(booking) {
            const bookings = this.getAll();
            booking.id = generateId();
            booking.status = booking.status || 'pending';
            booking.createdAt = now();
            bookings.push(booking);
            set('bookings', bookings);
            // Crear notificación
            Notifications.create({
                type: 'new_booking',
                title: 'Nueva Reserva',
                message: `${booking.clientName} ha reservado ${booking.serviceName || 'un servicio'} para el ${booking.date} a las ${booking.time}`,
                bookingId: booking.id
            });
            return booking;
        },
        update(id, data) {
            const bookings = this.getAll();
            const idx = bookings.findIndex(b => b.id === id);
            if (idx === -1) return null;
            bookings[idx] = { ...bookings[idx], ...data, updatedAt: now() };
            set('bookings', bookings);
            return bookings[idx];
        },
        confirm(id) { return this.update(id, { status: 'confirmed' }); },
        complete(id) { return this.update(id, { status: 'completed' }); },
        cancel(id) { return this.update(id, { status: 'cancelled' }); },
        delete(id) {
            const bookings = this.getAll().filter(b => b.id !== id);
            set('bookings', bookings);
        },
        getAvailableSlots(date, workerId, serviceDuration) {
            const settings = Settings.get();
            const worker = Workers.getById(workerId);
            if (!worker) return [];

            const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            const dayOfWeek = dayNames[new Date(date).getDay()];
            const schedule = worker.schedule[dayOfWeek];
            if (!schedule || !schedule.active) return [];

            const existingBookings = this.getByWorker(workerId, date)
                .filter(b => b.status !== 'cancelled');
            const slots = [];
            const interval = settings.slotInterval || 30;

            let [startH, startM] = schedule.start.split(':').map(Number);
            let [endH, endM] = schedule.end.split(':').map(Number);
            let current = startH * 60 + startM;
            const end = endH * 60 + endM;

            while (current + serviceDuration <= end) {
                const h = Math.floor(current / 60).toString().padStart(2, '0');
                const m = (current % 60).toString().padStart(2, '0');
                const timeStr = `${h}:${m}`;

                const isOccupied = existingBookings.some(b => {
                    const bStart = timeToMinutes(b.time);
                    const bEnd = bStart + (b.duration || 30);
                    const slotEnd = current + serviceDuration;
                    return (current < bEnd && slotEnd > bStart);
                });

                if (!isOccupied) {
                    slots.push(timeStr);
                }
                current += interval;
            }
            return slots;
        }
    };

    function timeToMinutes(timeStr) {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    }

    // ---- MÓDULO: Transacciones (TPV) ----
    const Transactions = {
        getAll() { return get('transactions') || []; },
        getById(id) { return this.getAll().find(t => t.id === id); },
        getByDate(date) { return this.getAll().filter(t => t.date === date); },
        getToday() { return this.getByDate(today()); },
        getByDateRange(startDate, endDate) {
            return this.getAll().filter(t => t.date >= startDate && t.date <= endDate);
        },
        create(transaction) {
            const transactions = this.getAll();
            transaction.id = generateId();
            transaction.date = transaction.date || today();
            transaction.createdAt = now();
            transactions.push(transaction);
            set('transactions', transactions);

            // Update client stats if linked
            if (transaction.clientId) {
                Clients.addVisit(transaction.clientId, transaction.total);
            }

            return transaction;
        },
        update(id, data) {
            const transactions = this.getAll();
            const idx = transactions.findIndex(t => t.id === id);
            if (idx === -1) return null;
            transactions[idx] = { ...transactions[idx], ...data };
            set('transactions', transactions);
            return transactions[idx];
        },
        delete(id) {
            const transactions = this.getAll().filter(t => t.id !== id);
            set('transactions', transactions);
        },
        getDailyTotal(date) {
            const dayTx = this.getByDate(date || today());
            return {
                total: dayTx.reduce((sum, t) => sum + t.total, 0),
                count: dayTx.length,
                cash: dayTx.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.total, 0),
                card: dayTx.filter(t => t.paymentMethod === 'card').reduce((sum, t) => sum + t.total, 0),
                bizum: dayTx.filter(t => t.paymentMethod === 'bizum').reduce((sum, t) => sum + t.total, 0)
            };
        }
    };

    // ---- MÓDULO: Notificaciones ----
    const Notifications = {
        getAll() { return get('notifications') || []; },
        getUnread() { return this.getAll().filter(n => !n.read); },
        getUnreadCount() { return this.getUnread().length; },
        create(notification) {
            const notifications = this.getAll();
            notification.id = generateId();
            notification.read = false;
            notification.createdAt = now();
            notifications.unshift(notification); // newest first
            // Keep max 100
            if (notifications.length > 100) notifications.splice(100);
            set('notifications', notifications);
            return notification;
        },
        markRead(id) {
            const notifications = this.getAll();
            const idx = notifications.findIndex(n => n.id === id);
            if (idx === -1) return;
            notifications[idx].read = true;
            set('notifications', notifications);
        },
        markAllRead() {
            const notifications = this.getAll().map(n => ({ ...n, read: true }));
            set('notifications', notifications);
        },
        clear() { set('notifications', []); }
    };

    // ---- MÓDULO: Informes ----
    const Reports = {
        generateDaily(date) {
            const d = date || today();
            const transactions = Transactions.getByDate(d);
            const bookings = Bookings.getByDate(d);
            const services = Services.getAll();
            const workers = Workers.getAll();

            // Service breakdown
            const serviceBreakdown = {};
            transactions.forEach(t => {
                if (t.items) {
                    t.items.forEach(item => {
                        if (!serviceBreakdown[item.name]) {
                            serviceBreakdown[item.name] = { count: 0, revenue: 0 };
                        }
                        serviceBreakdown[item.name].count += 1;
                        serviceBreakdown[item.name].revenue += item.price || 0;
                    });
                }
            });

            // Worker breakdown
            const workerBreakdown = {};
            transactions.forEach(t => {
                const wName = t.workerName || 'Sin asignar';
                if (!workerBreakdown[wName]) {
                    workerBreakdown[wName] = { count: 0, revenue: 0 };
                }
                workerBreakdown[wName].count += 1;
                workerBreakdown[wName].revenue += t.total || 0;
            });

            // Payment method breakdown
            const paymentBreakdown = { cash: 0, card: 0, bizum: 0 };
            transactions.forEach(t => {
                if (paymentBreakdown.hasOwnProperty(t.paymentMethod)) {
                    paymentBreakdown[t.paymentMethod] += t.total || 0;
                }
            });

            const report = {
                date: d,
                totalRevenue: transactions.reduce((sum, t) => sum + (t.total || 0), 0),
                totalTransactions: transactions.length,
                totalBookings: bookings.length,
                completedBookings: bookings.filter(b => b.status === 'completed').length,
                cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
                pendingBookings: bookings.filter(b => b.status === 'pending').length,
                serviceBreakdown,
                workerBreakdown,
                paymentBreakdown,
                averageTicket: transactions.length ? transactions.reduce((sum, t) => sum + (t.total || 0), 0) / transactions.length : 0,
                generatedAt: now()
            };

            return report;
        },
        generateWeekly(startDate) {
            const start = new Date(startDate);
            const days = [];
            let totalRevenue = 0;
            let totalBookings = 0;

            for (let i = 0; i < 7; i++) {
                const d = new Date(start);
                d.setDate(d.getDate() + i);
                const dateStr = d.toISOString().split('T')[0];
                const daily = this.generateDaily(dateStr);
                days.push(daily);
                totalRevenue += daily.totalRevenue;
                totalBookings += daily.totalBookings;
            }

            return {
                startDate,
                endDate: days[6].date,
                days,
                totalRevenue,
                totalBookings,
                avgDailyRevenue: totalRevenue / 7,
                generatedAt: now()
            };
        },
        generateMonthly(year, month) {
            const daysInMonth = new Date(year, month, 0).getDate();
            const days = [];
            let totalRevenue = 0;
            let totalBookings = 0;

            for (let i = 1; i <= daysInMonth; i++) {
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                const daily = this.generateDaily(dateStr);
                days.push(daily);
                totalRevenue += daily.totalRevenue;
                totalBookings += daily.totalBookings;
            }

            return {
                year,
                month,
                days,
                totalRevenue,
                totalBookings,
                avgDailyRevenue: totalRevenue / daysInMonth,
                generatedAt: now()
            };
        }
    };

    // ---- MÓDULO: Configuración ----
    const Settings = {
        get() { return get('settings') || {}; },
        update(data) {
            const settings = this.get();
            const updated = { ...settings, ...data, updatedAt: now() };
            set('settings', updated);
            return updated;
        }
    };

    // ---- MÓDULO: Autenticación ----
    const Auth = {
        login(username, password) {
            const admin = get('admin');
            if (!admin) return false;
            if (admin.username === username && admin.password === btoa(password)) {
                sessionStorage.setItem('habana_auth', 'true');
                sessionStorage.setItem('habana_auth_time', now());
                return true;
            }
            return false;
        },
        isLoggedIn() {
            return sessionStorage.getItem('habana_auth') === 'true';
        },
        logout() {
            sessionStorage.removeItem('habana_auth');
            sessionStorage.removeItem('habana_auth_time');
        },
        changePassword(oldPassword, newPassword) {
            const admin = get('admin');
            if (!admin || admin.password !== btoa(oldPassword)) return false;
            admin.password = btoa(newPassword);
            set('admin', admin);
            return true;
        }
    };

    // ---- Inicializar al cargar ----
    initDefaults();

    // ---- API Pública ----
    return {
        Services,
        Workers,
        Clients,
        Bookings,
        Transactions,
        Notifications,
        Reports,
        Settings,
        Auth,
        utils: { generateId, now, today, timeToMinutes }
    };
})();
