/**
 * DataPulse - Enterprise Analytics Dashboard
 * Complete JavaScript Application
 */

// ============================================
// DataPulse Application Core
// ============================================
const DataPulse = {
    // State Management
    state: {
        currentPage: 'dashboard',
        theme: 'dark',
        sidebarOpen: false,
        notificationsOpen: false,
        modalOpen: false,
        realTimeInterval: null,
        chartInstances: {}
    },

    // Mock Data Generators
    data: {
        generateRandomArray(length, min, max) {
            return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
        },

        generateSparklineData() {
            return this.generateRandomArray(12, 20, 100);
        },

        generateRevenueData() {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            return days.map(day => ({
                label: day,
                value: Math.floor(Math.random() * 50000) + 30000,
                previous: Math.floor(Math.random() * 50000) + 30000
            }));
        },

        generateTrafficData() {
            return [
                { label: 'Direct', value: 35, color: '#6366f1' },
                { label: 'Organic', value: 28, color: '#06b6d4' },
                { label: 'Social', value: 18, color: '#8b5cf6' },
                { label: 'Referral', value: 12, color: '#10b981' },
                { label: 'Email', value: 7, color: '#f59e0b' }
            ];
        },

        generateActivityData() {
            const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
            return hours.map(hour => ({
                label: hour,
                value: Math.floor(Math.random() * 2000) + 500
            }));
        },

        generateSalesData() {
            return [
                { label: 'Electronics', value: 45000 },
                { label: 'Clothing', value: 32000 },
                { label: 'Home', value: 28000 },
                { label: 'Sports', value: 19000 },
                { label: 'Books', value: 12000 }
            ];
        },

        generateDeviceData() {
            return [
                { label: 'Desktop', value: 52, color: '#6366f1' },
                { label: 'Mobile', value: 35, color: '#06b6d4' },
                { label: 'Tablet', value: 13, color: '#8b5cf6' }
            ];
        },

        generateHeatmapData() {
            return Array.from({ length: 168 }, () => Math.floor(Math.random() * 100));
        }
    },

    // ============================================
    // Chart Engine (Canvas-based)
    // ============================================
    charts: {
        createCanvas(container, width, height) {
            const canvas = document.createElement('canvas');
            canvas.width = width * 2;
            canvas.height = height * 2;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            const ctx = canvas.getContext('2d');
            ctx.scale(2, 2);
            container.appendChild(canvas);
            return { canvas, ctx, width, height };
        },

        drawLineChart(container, data, options) {
            options = options || {};
            const rect = container.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height || 260;
            const chart = this.createCanvas(container, width, height);
            const ctx = chart.ctx;
            const padding = options.padding || { top: 20, right: 20, bottom: 30, left: 50 };
            const chartWidth = width - padding.left - padding.right;
            const chartHeight = height - padding.top - padding.bottom;

            const maxValue = Math.max(...data.map(d => d.value)) * 1.1;

            // Clear
            ctx.clearRect(0, 0, width, height);

            // Grid lines
            ctx.strokeStyle = 'rgba(148,163,184,0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 5; i++) {
                const y = padding.top + (chartHeight / 5) * i;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(width - padding.right, y);
                ctx.stroke();

                const value = Math.round(maxValue - (maxValue / 5) * i);
                ctx.fillStyle = '#64748b';
                ctx.font = '11px Inter';
                ctx.textAlign = 'right';
                ctx.fillText(this.formatNumber(value), padding.left - 8, y + 4);
            }

            // Draw line points
            const points = data.map((d, i) => ({
                x: padding.left + (chartWidth / (data.length - 1)) * i,
                y: padding.top + chartHeight - ((d.value / maxValue) * chartHeight)
            }));

            // Gradient fill
            const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
            gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
            gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

            ctx.beginPath();
            ctx.moveTo(points[0].x, height - padding.bottom);
            points.forEach((p, i) => {
                if (i === 0) ctx.lineTo(p.x, p.y);
                else {
                    const prev = points[i - 1];
                    const cpX = (prev.x + p.x) / 2;
                    ctx.bezierCurveTo(cpX, prev.y, cpX, p.y, p.x, p.y);
                }
            });
            ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();

            // Draw line stroke
            ctx.beginPath();
            points.forEach((p, i) => {
                if (i === 0) ctx.moveTo(p.x, p.y);
                else {
                    const prev = points[i - 1];
                    const cpX = (prev.x + p.x) / 2;
                    ctx.bezierCurveTo(cpX, prev.y, cpX, p.y, p.x, p.y);
                }
            });
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Draw points
            points.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#6366f1';
                ctx.fill();
                ctx.strokeStyle = '#0f172a';
                ctx.lineWidth = 2;
                ctx.stroke();
            });

            // X-axis labels
            ctx.fillStyle = '#64748b';
            ctx.font = '11px Inter';
            ctx.textAlign = 'center';
            data.forEach((d, i) => {
                if (i % Math.ceil(data.length / 7) === 0) {
                    const x = padding.left + (chartWidth / (data.length - 1)) * i;
                    ctx.fillText(d.label, x, height - 8);
                }
            });

            return chart;
        },

        drawBarChart(container, data, options) {
            options = options || {};
            const rect = container.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height || 260;
            const chart = this.createCanvas(container, width, height);
            const ctx = chart.ctx;
            const padding = options.padding || { top: 20, right: 20, bottom: 30, left: 50 };
            const chartWidth = width - padding.left - padding.right;
            const chartHeight = height - padding.top - padding.bottom;

            const maxValue = Math.max(...data.map(d => d.value)) * 1.1;
            const barWidth = (chartWidth / data.length) * 0.6;
            const barSpacing = (chartWidth / data.length) * 0.4;

            ctx.clearRect(0, 0, width, height);

            // Grid
            ctx.strokeStyle = 'rgba(148,163,184,0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 5; i++) {
                const y = padding.top + (chartHeight / 5) * i;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(width - padding.right, y);
                ctx.stroke();
            }

            // Bars
            data.forEach((d, i) => {
                const x = padding.left + (chartWidth / data.length) * i + barSpacing / 2;
                const barHeight = (d.value / maxValue) * chartHeight;
                const y = padding.top + chartHeight - barHeight;

                const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
                gradient.addColorStop(0, d.color || '#6366f1');
                gradient.addColorStop(1, (d.color || '#6366f1') + '80');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth, barHeight, 4);
                ctx.fill();
            });

            // Labels
            ctx.fillStyle = '#64748b';
            ctx.font = '11px Inter';
            ctx.textAlign = 'center';
            data.forEach((d, i) => {
                const x = padding.left + (chartWidth / data.length) * i + barSpacing / 2 + barWidth / 2;
                ctx.fillText(d.label, x, height - 8);
            });

            return chart;
        },

        drawPieChart(container, data, options) {
            options = options || {};
            const rect = container.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height || 260;
            const chart = this.createCanvas(container, width, height);
            const ctx = chart.ctx;
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(width, height) / 2 - 20;
            const innerRadius = options.donut ? radius * 0.6 : 0;

            ctx.clearRect(0, 0, width, height);

            const total = data.reduce((sum, d) => sum + d.value, 0);
            let currentAngle = -Math.PI / 2;

            data.forEach(d => {
                const sliceAngle = (d.value / total) * Math.PI * 2;

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                if (innerRadius > 0) {
                    ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
                } else {
                    ctx.lineTo(centerX, centerY);
                }
                ctx.closePath();
                ctx.fillStyle = d.color;
                ctx.fill();
                ctx.strokeStyle = '#0f172a';
                ctx.lineWidth = 2;
                ctx.stroke();

                currentAngle += sliceAngle;
            });

            // Legend
            if (options.showLegend !== false) {
                let legendY = 20;
                data.forEach(d => {
                    ctx.fillStyle = d.color;
                    ctx.beginPath();
                    ctx.arc(width - 80, legendY, 5, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '11px Inter';
                    ctx.textAlign = 'left';
                    ctx.fillText(d.label + ' ' + d.value + '%', width - 70, legendY + 4);
                    legendY += 18;
                });
            }

            return chart;
        },

        drawSparkline(container, data, color) {
            color = color || '#6366f1';
            const rect = container.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height || 40;
            const chart = this.createCanvas(container, width, height);
            const ctx = chart.ctx;

            const maxValue = Math.max(...data) * 1.1;
            const minValue = Math.min(...data) * 0.9;
            const range = maxValue - minValue;

            ctx.clearRect(0, 0, width, height);

            const points = data.map((d, i) => ({
                x: (width / (data.length - 1)) * i,
                y: height - ((d - minValue) / range) * height
            }));

            // Area fill
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, color + '20');
            gradient.addColorStop(1, color + '00');

            ctx.beginPath();
            ctx.moveTo(0, height);
            points.forEach((p, i) => {
                if (i === 0) ctx.lineTo(p.x, p.y);
                else {
                    const prev = points[i - 1];
                    const cpX = (prev.x + p.x) / 2;
                    ctx.bezierCurveTo(cpX, prev.y, cpX, p.y, p.x, p.y);
                }
            });
            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();

            // Line
            ctx.beginPath();
            points.forEach((p, i) => {
                if (i === 0) ctx.moveTo(p.x, p.y);
                else {
                    const prev = points[i - 1];
                    const cpX = (prev.x + p.x) / 2;
                    ctx.bezierCurveTo(cpX, prev.y, cpX, p.y, p.x, p.y);
                }
            });
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.stroke();

            return chart;
        },

        formatNumber(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toString();
        }
    },

    // ============================================
    // Animation Utilities
    // ============================================
    animate: {
        counter(element, target, duration, prefix, suffix) {
            duration = duration || 2000;
            prefix = prefix || '';
            suffix = suffix || '';
            const start = 0;
            const startTime = performance.now();
            const isDecimal = target % 1 !== 0;

            const update = function(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = start + (target - start) * eased;

                if (isDecimal) {
                    element.textContent = prefix + current.toFixed(2) + suffix;
                } else {
                    element.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
                }

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            };

            requestAnimationFrame(update);
        }
    },

    // ============================================
    // Initialization Methods
    // ============================================
    init() {
        this.initTheme();
        this.initNavigation();
        this.initSidebar();
        this.initNotifications();
        this.initModal();
        this.initSearch();
        this.initSettings();
        this.initCharts();
        this.initCounters();
        this.initHeatmap();
        this.initGeoMap();
        this.initRealTime();
        this.initLoading();
        this.initFilterButtons();
    },

    initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const savedTheme = localStorage.getItem('datapulse-theme') || 'dark';
        this.setTheme(savedTheme);

        themeToggle.addEventListener('click', () => {
            const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        });
    },

    setTheme(theme) {
        this.state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('datapulse-theme', theme);

        const icon = document.querySelector('#themeToggle i');
        if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

        setTimeout(() => this.initCharts(), 100);
    },

    initNavigation() {
        const navItems = document.querySelectorAll('.nav-item[data-page]');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                this.navigateTo(page);

                if (window.innerWidth <= 1024) {
                    document.getElementById('sidebar').classList.remove('open');
                }
            });
        });
    },

    navigateTo(page) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        const activeNav = document.querySelector('.nav-item[data-page="' + page + '"]');
        if (activeNav) activeNav.classList.add('active');

        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById(page + '-page');
        if (targetPage) targetPage.classList.add('active');

        this.state.currentPage = page;

        if (page === 'dashboard') {
            setTimeout(() => this.initCharts(), 100);
        }
    },

    initSidebar() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebarClose = document.getElementById('sidebarClose');
        const sidebar = document.getElementById('sidebar');

        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => {
                sidebar.classList.remove('open');
            });
        }

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && 
                sidebar && !sidebar.contains(e.target) && 
                menuToggle && !menuToggle.contains(e.target) &&
                sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    },

    initNotifications() {
        const notificationsBtn = document.getElementById('notificationsBtn');
        const notificationsDropdown = document.getElementById('notificationsDropdown');

        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.state.notificationsOpen = !this.state.notificationsOpen;
                if (notificationsDropdown) {
                    notificationsDropdown.classList.toggle('active', this.state.notificationsOpen);
                }
            });
        }

        document.addEventListener('click', (e) => {
            if (notificationsDropdown && notificationsBtn &&
                !notificationsDropdown.contains(e.target) && !notificationsBtn.contains(e.target)) {
                this.state.notificationsOpen = false;
                notificationsDropdown.classList.remove('active');
            }
        });

        const markAllRead = document.querySelector('.mark-all-read');
        if (markAllRead) {
            markAllRead.addEventListener('click', () => {
                document.querySelectorAll('.notification-item').forEach(item => {
                    item.classList.remove('unread');
                });
                const dot = document.querySelector('.notification-dot');
                if (dot) dot.remove();
            });
        }
    },

    initModal() {
        const quickActionsBtn = document.getElementById('quickActionsBtn');
        const modal = document.getElementById('quickActionsModal');
        const modalClose = document.getElementById('modalClose');

        if (quickActionsBtn && modal) {
            quickActionsBtn.addEventListener('click', () => {
                modal.classList.add('active');
            });
        }

        if (modalClose && modal) {
            modalClose.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
    },

    initSearch() {
        const searchInput = document.getElementById('globalSearch');

        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.trim();
                    if (query) {
                        this.showToast('Searching for "' + query + '"...');
                    }
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (searchInput) searchInput.focus();
            }
        });
    },

    initSettings() {
        const settingsNavItems = document.querySelectorAll('.settings-nav-item');

        settingsNavItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');

                settingsNavItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
                const targetSection = document.getElementById(section + '-section');
                if (targetSection) targetSection.classList.add('active');
            });
        });

        document.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                const theme = card.getAttribute('data-theme');
                if (theme !== 'auto') {
                    this.setTheme(theme);
                }
            });
        });
    },

    initCharts() {
        if (this.state.currentPage !== 'dashboard') return;

        const revenueContainer = document.getElementById('revenueChart');
        if (revenueContainer) {
            revenueContainer.innerHTML = '';
            this.charts.drawLineChart(revenueContainer, this.data.generateRevenueData());
        }

        const trafficContainer = document.getElementById('trafficChart');
        if (trafficContainer) {
            trafficContainer.innerHTML = '';
            this.charts.drawPieChart(trafficContainer, this.data.generateTrafficData(), { donut: true });
        }

        const activityContainer = document.getElementById('activityChart');
        if (activityContainer) {
            activityContainer.innerHTML = '';
            this.charts.drawLineChart(activityContainer, this.data.generateActivityData());
        }

        const salesContainer = document.getElementById('salesChart');
        if (salesContainer) {
            salesContainer.innerHTML = '';
            this.charts.drawBarChart(salesContainer, this.data.generateSalesData());
        }

        const deviceContainer = document.getElementById('deviceChart');
        if (deviceContainer) {
            deviceContainer.innerHTML = '';
            this.charts.drawPieChart(deviceContainer, this.data.generateDeviceData(), { donut: true, showLegend: false });
        }
    },

    initCounters() {
        const counters = document.querySelectorAll('.kpi-value[data-target]');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const target = parseFloat(element.getAttribute('data-target'));
                    const prefix = element.getAttribute('data-prefix') || '';
                    const suffix = element.getAttribute('data-suffix') || '';

                    this.animate.counter(element, target, 2000, prefix, suffix);
                    observer.unobserve(element);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    },

    initSparklines() {
        const sparklineIds = ['sparkline1', 'sparkline2', 'sparkline3', 'sparkline4', 'sparkline5', 'sparkline6'];
        const colors = ['#6366f1', '#06b6d4', '#ef4444', '#10b981', '#ec4899', '#f59e0b'];

        sparklineIds.forEach((id, i) => {
            const container = document.getElementById(id);
            if (container) {
                container.innerHTML = '';
                this.charts.drawSparkline(container, this.data.generateSparklineData(), colors[i]);
            }
        });
    },

    initHeatmap() {
        const heatmapContainer = document.getElementById('heatmap');
        if (!heatmapContainer) return;

        heatmapContainer.innerHTML = '';
        const data = this.data.generateHeatmapData();
        const maxValue = Math.max(...data);

        data.forEach((value) => {
            const cell = document.createElement('div');
            cell.className = 'heatmap-cell';
            const intensity = value / maxValue;
            const hue = 240 + (1 - intensity) * 60;
            const saturation = 70 + intensity * 30;
            const lightness = 20 + intensity * 40;
            cell.style.backgroundColor = 'hsl(' + hue + ', ' + saturation + '%, ' + lightness + '%)';
            cell.setAttribute('data-value', value);
            heatmapContainer.appendChild(cell);
        });
    },

    initGeoMap() {
        const tooltip = document.getElementById('geoTooltip');
        const lands = document.querySelectorAll('.world-map .land');

        lands.forEach(land => {
            land.addEventListener('mouseenter', () => {
                const country = land.getAttribute('data-country');
                const value = land.getAttribute('data-value');

                if (tooltip) {
                    tooltip.innerHTML = '<h4>' + country + '</h4><p>' + parseInt(value).toLocaleString() + ' users</p>';
                    tooltip.classList.add('visible');
                }
            });

            land.addEventListener('mousemove', (e) => {
                const geoMap = document.querySelector('.geo-map');
                if (tooltip && geoMap) {
                    const rect = geoMap.getBoundingClientRect();
                    tooltip.style.left = (e.clientX - rect.left + 10) + 'px';
                    tooltip.style.top = (e.clientY - rect.top - 10) + 'px';
                }
            });

            land.addEventListener('mouseleave', () => {
                if (tooltip) tooltip.classList.remove('visible');
            });
        });
    },

    initRealTime() {
        this.state.realTimeInterval = setInterval(() => {
            if (this.state.currentPage === 'dashboard') {
                this.initSparklines();
                this.updateKPIValues();
            }
        }, 5000);

        this.initSparklines();
    },

    updateKPIValues() {
        const kpiValues = document.querySelectorAll('.kpi-value[data-target]');
        kpiValues.forEach(el => {
            const target = parseFloat(el.getAttribute('data-target'));
            const variation = (Math.random() - 0.5) * 0.02;
            const newValue = target * (1 + variation);
            const prefix = el.getAttribute('data-prefix') || '';
            const suffix = el.getAttribute('data-suffix') || '';

            if (target % 1 !== 0) {
                el.textContent = prefix + newValue.toFixed(2) + suffix;
            } else {
                el.textContent = prefix + Math.floor(newValue).toLocaleString() + suffix;
            }
        });
    },

    initLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 1500);
        }
    },

    initFilterButtons() {
        document.querySelectorAll('.date-filter').forEach(filter => {
            const buttons = filter.querySelectorAll('.filter-btn');
            buttons.forEach(btn => {
                btn.addEventListener('click', () => {
                    buttons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    if (this.state.currentPage === 'dashboard') {
                        this.initCharts();
                        this.initSparklines();
                    }
                });
            });
        });
    },

    showToast(message) {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '24px';
        toast.style.right = '24px';
        toast.style.background = 'var(--glass-bg)';
        toast.style.backdropFilter = 'blur(12px)';
        toast.style.border = '1px solid var(--glass-border)';
        toast.style.borderRadius = '12px';
        toast.style.padding = '14px 24px';
        toast.style.color = 'var(--text-primary)';
        toast.style.fontSize = '0.9rem';
        toast.style.zIndex = '9999';
        toast.style.boxShadow = 'var(--shadow-lg)';
        toast.style.animation = 'slideIn 0.3s ease';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// ============================================
// Global Event Listeners
// ============================================

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        DataPulse.initCharts();
        DataPulse.initSparklines();
    }, 250);
});

document.addEventListener('DOMContentLoaded', () => {
    DataPulse.init();
});

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100px); opacity: 0; }
    }
`;
document.head.appendChild(style);