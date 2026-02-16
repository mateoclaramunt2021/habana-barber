// ============================================================
// BARBERÍA HABANA — Landing Page JavaScript
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ---- Loader ----
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 1500);

    // ---- Lucide Icons ----
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // ---- Navbar Scroll ----
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    function handleScroll() {
        const scrollY = window.scrollY;

        // Navbar background
        if (scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active nav link
        sections.forEach(section => {
            const top = section.offsetTop - 150;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollY >= top && scrollY < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // ---- Mobile Nav Toggle ----
    const navToggle = document.getElementById('navToggle');
    const navLinksContainer = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinksContainer.classList.toggle('open');
        document.body.style.overflow = navLinksContainer.classList.contains('open') ? 'hidden' : '';
    });

    navLinksContainer.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinksContainer.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // ---- Scroll Animations (AOS-like) ----
    const animatedElements = document.querySelectorAll('[data-aos]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    animatedElements.forEach(el => observer.observe(el));

    // ---- Counter Animation ----
    const counters = document.querySelectorAll('.stat-number[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                let current = 0;
                const increment = target / 60;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    entry.target.textContent = Math.round(current);
                }, 25);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));

    // ---- Load Services ----
    function loadServices() {
        const grid = document.getElementById('servicesGrid');
        if (!grid) return;

        const services = HabanaDB.Services.getActive();
        const iconMap = {
            'scissors': 'scissors',
            'sparkles': 'sparkles',
            'eye': 'eye',
            'user': 'user',
            'zap': 'zap',
            'sun': 'sun'
        };

        grid.innerHTML = services.map(service => `
            <div class="service-card" data-aos="fade-up">
                <div class="service-icon">
                    <i data-lucide="${iconMap[service.icon] || 'scissors'}"></i>
                </div>
                <h3 class="service-name">${service.name}</h3>
                <p class="service-desc">${service.description}</p>
                <div class="service-meta">
                    <span class="service-duration">
                        <i data-lucide="clock"></i>
                        ${service.duration} min
                    </span>
                    <span class="service-price">
                        ${service.price}€
                    </span>
                </div>
            </div>
        `).join('');

        // Re-init icons and observers
        if (typeof lucide !== 'undefined') lucide.createIcons();
        grid.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));
    }

    loadServices();

    // ---- Booking Form ----
    const bookingForm = document.getElementById('bookingForm');
    const prevBtn = document.getElementById('prevStep');
    const nextBtn = document.getElementById('nextStep');
    const submitBtn = document.getElementById('submitBooking');
    const summaryDiv = document.getElementById('bookingSummary');
    const summaryDetails = document.getElementById('summaryDetails');
    const successDiv = document.getElementById('bookingSuccess');

    let currentStep = 1;
    const totalSteps = 4;
    let selectedService = null;
    let selectedWorker = null;
    let selectedTime = null;

    // Load service selector
    function loadServiceSelector() {
        const container = document.getElementById('serviceSelector');
        if (!container) return;
        const services = HabanaDB.Services.getActive();

        container.innerHTML = services.map(s => `
            <div class="service-option" data-id="${s.id}" data-name="${s.name}" data-price="${s.price}" data-duration="${s.duration}">
                <div class="svc-info">
                    <div class="svc-name">${s.name}</div>
                    <div class="svc-detail">${s.duration} min • ${s.description}</div>
                </div>
                <div class="svc-price">${s.price}€</div>
            </div>
        `).join('');

        container.querySelectorAll('.service-option').forEach(opt => {
            opt.addEventListener('click', () => {
                container.querySelectorAll('.service-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                selectedService = {
                    id: opt.dataset.id,
                    name: opt.dataset.name,
                    price: parseFloat(opt.dataset.price),
                    duration: parseInt(opt.dataset.duration)
                };
            });
        });
    }

    // Load worker selector
    function loadWorkerSelector() {
        const container = document.getElementById('workerSelector');
        if (!container) return;
        const workers = HabanaDB.Workers.getActive();

        const anyOption = `
            <div class="worker-option" data-id="any" data-name="Sin preferencia">
                <div class="wkr-avatar" style="background:var(--color-text-light);">?</div>
                <div>
                    <div class="wkr-name">Sin preferencia</div>
                    <div class="wkr-specialties">Primer barbero disponible</div>
                </div>
            </div>
        `;

        container.innerHTML = anyOption + workers.map(w => `
            <div class="worker-option" data-id="${w.id}" data-name="${w.name}">
                <div class="wkr-avatar" style="background:${w.color};">${w.name.charAt(0)}</div>
                <div>
                    <div class="wkr-name">${w.name}</div>
                    <div class="wkr-specialties">${(w.specialties || []).join(', ')}</div>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.worker-option').forEach(opt => {
            opt.addEventListener('click', () => {
                container.querySelectorAll('.worker-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                selectedWorker = {
                    id: opt.dataset.id,
                    name: opt.dataset.name
                };
            });
        });
    }

    // Date change -> load slots
    const bookingDate = document.getElementById('bookingDate');
    if (bookingDate) {
        // Set min date to today
        const todayStr = new Date().toISOString().split('T')[0];
        bookingDate.min = todayStr;
        bookingDate.value = todayStr;

        bookingDate.addEventListener('change', loadTimeSlots);
    }

    function loadTimeSlots() {
        const container = document.getElementById('timeSlots');
        if (!container) return;

        const date = bookingDate.value;
        if (!date || !selectedService) {
            container.innerHTML = '<p class="slots-hint">Selecciona un servicio y fecha primero</p>';
            return;
        }

        let workerId = selectedWorker ? selectedWorker.id : null;

        if (!workerId || workerId === 'any') {
            // Get slots from any worker
            const workers = HabanaDB.Workers.getActive();
            let allSlots = new Set();
            workers.forEach(w => {
                const slots = HabanaDB.Bookings.getAvailableSlots(date, w.id, selectedService.duration);
                slots.forEach(s => allSlots.add(s));
            });
            const slots = Array.from(allSlots).sort();
            renderSlots(container, slots);
        } else {
            const slots = HabanaDB.Bookings.getAvailableSlots(date, workerId, selectedService.duration);
            renderSlots(container, slots);
        }
    }

    function renderSlots(container, slots) {
        if (slots.length === 0) {
            container.innerHTML = '<p class="slots-hint">No hay horarios disponibles para esta fecha. Prueba otro día.</p>';
            return;
        }

        container.innerHTML = slots.map(s => `
            <div class="time-slot" data-time="${s}">${s}</div>
        `).join('');

        container.querySelectorAll('.time-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                container.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                selectedTime = slot.dataset.time;
            });
        });
    }

    // Step navigation
    function updateStepUI() {
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.step) === currentStep) {
                step.classList.add('active');
            }
        });

        document.querySelectorAll('.progress-step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            if (stepNum === currentStep) step.classList.add('active');
            if (stepNum < currentStep) step.classList.add('completed');
        });

        prevBtn.style.display = currentStep > 1 ? '' : 'none';
        nextBtn.style.display = currentStep < totalSteps ? '' : 'none';
        submitBtn.style.display = currentStep === totalSteps ? '' : 'none';
        summaryDiv.style.display = currentStep === totalSteps ? '' : 'none';

        // Update summary on last step
        if (currentStep === totalSteps) {
            updateSummary();
        }

        // Load time slots when reaching step 3
        if (currentStep === 3) {
            loadTimeSlots();
        }
    }

    function validateStep(step) {
        switch (step) {
            case 1:
                if (!selectedService) {
                    alert('Por favor, selecciona un servicio.');
                    return false;
                }
                return true;
            case 2:
                if (!selectedWorker) {
                    alert('Por favor, selecciona un barbero.');
                    return false;
                }
                return true;
            case 3:
                if (!bookingDate.value) {
                    alert('Por favor, selecciona una fecha.');
                    return false;
                }
                if (!selectedTime) {
                    alert('Por favor, selecciona una hora.');
                    return false;
                }
                return true;
            case 4:
                return true;
            default:
                return true;
        }
    }

    function updateSummary() {
        if (!summaryDetails) return;
        summaryDetails.innerHTML = `
            <div class="summary-row"><span>Servicio</span><span>${selectedService?.name || '-'}</span></div>
            <div class="summary-row"><span>Barbero</span><span>${selectedWorker?.name || '-'}</span></div>
            <div class="summary-row"><span>Fecha</span><span>${bookingDate.value ? new Date(bookingDate.value).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span></div>
            <div class="summary-row"><span>Hora</span><span>${selectedTime || '-'}</span></div>
            <div class="summary-row"><span>Duración</span><span>${selectedService?.duration || '-'} min</span></div>
            <div class="summary-row"><span><strong>Total</strong></span><span><strong>${selectedService?.price || 0}€</strong></span></div>
        `;
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (!validateStep(currentStep)) return;
            if (currentStep < totalSteps) {
                currentStep++;
                updateStepUI();
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateStepUI();
            }
        });
    }

    // Submit booking
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('bookingName').value.trim();
            const phone = document.getElementById('bookingPhone').value.trim();
            const email = document.getElementById('bookingEmail').value.trim();
            const notes = document.getElementById('bookingNotes').value.trim();

            if (!name || !phone) {
                alert('Por favor, completa nombre y teléfono.');
                return;
            }

            // Resolve worker
            let workerId = selectedWorker.id;
            let workerName = selectedWorker.name;
            if (workerId === 'any') {
                const workers = HabanaDB.Workers.getActive();
                // Pick the one with fewest bookings for this date
                let minBookings = Infinity;
                let bestWorker = workers[0];
                workers.forEach(w => {
                    const count = HabanaDB.Bookings.getByWorker(w.id, bookingDate.value).length;
                    if (count < minBookings) {
                        minBookings = count;
                        bestWorker = w;
                    }
                });
                workerId = bestWorker.id;
                workerName = bestWorker.name;
            }

            // Create or find client
            let client = HabanaDB.Clients.findByPhone(phone);
            if (!client) {
                client = HabanaDB.Clients.create({ name, phone, email, notes: '' });
            }

            // Create booking
            const booking = HabanaDB.Bookings.create({
                clientName: name,
                clientPhone: phone,
                clientEmail: email,
                clientId: client.id,
                serviceId: selectedService.id,
                serviceName: selectedService.name,
                servicePrice: selectedService.price,
                duration: selectedService.duration,
                workerId: workerId,
                workerName: workerName,
                date: bookingDate.value,
                time: selectedTime,
                notes: notes,
                status: 'pending'
            });

            // Show success
            bookingForm.style.display = 'none';
            successDiv.style.display = 'block';
        });
    }

    // Reset booking form
    window.resetBookingForm = function () {
        currentStep = 1;
        selectedService = null;
        selectedWorker = null;
        selectedTime = null;

        bookingForm.style.display = '';
        successDiv.style.display = 'none';
        bookingForm.reset();

        document.querySelectorAll('.service-option, .worker-option').forEach(o => o.classList.remove('selected'));
        document.getElementById('timeSlots').innerHTML = '<p class="slots-hint">Selecciona una fecha para ver horarios disponibles</p>';

        updateStepUI();
    };

    // Initialize
    loadServiceSelector();
    loadWorkerSelector();
    updateStepUI();

    // Re-init lucide icons after dynamic content
    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 100);
});
