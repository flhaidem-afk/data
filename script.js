// script.js
class DataPulseDashboard {
    constructor() {
        this.charts = {};
        this.data = this.generateMockData();
        this.init();
    }

    init() {
        this.initCharts();
        this.populateTable();
        this.startRealTimeUpdates();
        this.setupEventListeners();
        this.animateNumbers();
    }

    generateMockData() {
        return {
            revenue: {
                week: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
                month: [45000, 52000, 48000, 61000, 58000, 72000, 68000, 75000, 82000, 79000, 88000, 95000],
                year: [520000, 610000, 580000, 720000, 680000, 750000, 820000, 790000, 880000, 950000, 1020000, 1100000]
            },
            traffic: [45, 30, 15, 10],
            transactions: [
                { id: '#TRX-7891', customer: 'Sarah Johnson', date: '2026-06-17', amount: '$2,450.00', status: 'completed' },
                { id: '#TRX-7892', customer: 'Michael Chen', date: '2026-06-17', amount: '$1,280.00', status: 'pending' },
                { id: '#TRX-7893', customer: 'Emily Davis', date: '2026-06-16', amount: '$3,750.00', status: 'completed' },
                { id: '#TRX-7894', customer: 'James Wilson', date: '2026-06-16', amount: '$890.00', status: 'failed' },
                { id: '#TRX-7895', customer: 'Anna Brown', date: '2026-06-15', amount: '$4,200.00', status: 'completed' },
                { id: '#TRX-7896', customer: 'David Lee', date: '2026-06-15', amount: '$1,650.00', status: 'pending' },
                { id: '#TRX-7897', customer: 'Lisa Garcia', date: '2026-06-14', amount: '$2,980.00', status: 'completed' },
                { id: '#TRX-7898', customer: 'Robert Taylor', date: '2026-06-14', amount: '$750.00', status: 'completed' }
            ]
        };
    }

    initCharts() {
        this.initRevenueChart();
        this.initTrafficChart();
    }

    initRevenueChart() {
        const canvas = document.getElementById('revenueChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        this.charts.revenue = {
            canvas, ctx, data: this.data.revenue.month,
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        };

        this.drawRevenueChart();
    }

    drawRevenueChart() {
        const { canvas, ctx, data, labels } = this.charts.revenue;
        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);
        const padding = { top: 20, right: 20, bottom: 40, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        ctx.clearRect(0, 0, width, height);

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
        }

        // Y-axis labels
        ctx.fillStyle = '#6b6b7b';
        ctx.font = '12px Inter';
        ctx.textAlign = 'right';
        const maxValue = Math.max(...data) * 1.2;
        for (let i = 0; i <= 5; i++) {
            const value = (maxValue / 5) * (5 - i);
            const y = padding.top + (chartHeight / 5) * i;
            ctx.fillText('$' + (value / 1000).toFixed(0) + 'k', padding.left - 10, y + 4);
        }

        // X-axis labels
        ctx.textAlign = 'center';
        ctx.fillStyle = '#6b6b7b';
        const step = Math.ceil(labels.length / 6);
        labels.forEach((label, i) => {
            if (i % step === 0) {
                const x = padding.left + (chartWidth / (labels.length - 1)) * i;
                ctx.fillText(label, x, height - 10);
            }
        });

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

        // Draw area
        ctx.beginPath();
        ctx.moveTo(padding.left, height - padding.bottom);
        data.forEach((value, i) => {
            const x = padding.left + (chartWidth / (data.length - 1)) * i;
            const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
            if (i === 0) ctx.lineTo(x, y);
            else {
                const prevX = padding.left + (chartWidth / (data.length - 1)) * (i - 1);
                const prevY = padding.top + chartHeight - (data[i - 1] / maxValue) * chartHeight;
                const cpX = (prevX + x) / 2;
                ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
            }
        });
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        data.forEach((value, i) => {
            const x = padding.left + (chartWidth / (data.length - 1)) * i;
            const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
            if (i === 0) ctx.moveTo(x, y);
            else {
                const prevX = padding.left + (chartWidth / (data.length - 1)) * (i - 1);
                const prevY = padding.top + chartHeight - (data[i - 1] / maxValue) * chartHeight;
                const cpX = (prevX + x) / 2;
                ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
            }
        });
        ctx.stroke();

        // Draw points
        data.forEach((value, i) => {
            const x = padding.left + (chartWidth / (data.length - 1)) * i;
            const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#8b5cf6';
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
            ctx.fill();
        });
    }

    initTrafficChart() {
        const canvas = document.getElementById('trafficChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const data = this.data.traffic;
        const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
        const total = data.reduce((a, b) => a + b, 0);
        
        const centerX = (canvas.width / dpr) / 2;
        const centerY = (canvas.height / dpr) / 2;
        const radius = Math.min(centerX, centerY) - 20;

        let currentAngle = -Math.PI / 2;

        data.forEach((value, i) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            
            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[i];
            ctx.fill();

            // Draw white border
            ctx.strokeStyle = '#1a1a2e';
            ctx.lineWidth = 3;
            ctx.stroke();

            currentAngle += sliceAngle;
        });

        // Draw center hole
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#1a1a2e';
        ctx.fill();

        // Center text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('100%', centerX, centerY - 10);
        
        ctx.fillStyle = '#6b6b7b';
        ctx.font = '12px Inter';
        ctx.fillText('Total Traffic', centerX, centerY + 15);
    }

    populateTable() {
        const tbody = document.getElementById('transactionTable');
        if (!tbody) return;

        tbody.innerHTML = this.data.transactions.map(trx => `
            <tr>
                <td><span class="trx-id">${trx.id}</span></td>
                <td>
                    <div class="customer-cell">
                        <div class="customer-avatar">${trx.customer.split(' ').map(n => n[0]).join('')}</div>
                        <span>${trx.customer}</span>
                    </div>
                </td>
                <td>${trx.date}</td>
                <td><strong>${trx.amount}</strong></td>
                <td><span class="status-badge status-${trx.status}">${trx.status}</span></td>
                <td>
                    <button class="action-btn" onclick="viewTransaction('${trx.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    startRealTimeUpdates() {
        setInterval(() => {
            this.updateStats();
        }, 5000);

        setInterval(() => {
            this.addNewTransaction();
        }, 8000);
    }

    updateStats() {
        const stats = ['revenue', 'users', 'orders', 'conversion'];
        stats.forEach(stat => {
            const element = document.getElementById(stat);
            if (!element) return;
            
            const current = parseFloat(element.textContent.replace(/[^0-9.]/g, ''));
            const change = (Math.random() - 0.5) * 0.02;
            const newValue = current * (1 + change);
            
            let formatted;
            if (stat === 'revenue') formatted = '$' + newValue.toLocaleString('en-US', { maximumFractionDigits: 0 });
            else if (stat === 'users') formatted = newValue.toLocaleString('en-US', { maximumFractionDigits: 0 });
            else if (stat === 'orders') formatted = newValue.toLocaleString('en-US', { maximumFractionDigits: 0 });
            else formatted = newValue.toFixed(2) + '%';
            
            element.textContent = formatted;
            element.style.color = change > 0 ? '#10b981' : '#ef4444';
            setTimeout(() => {
                element.style.color = '';
            }, 1000);
        });
    }

    addNewTransaction() {
        const customers = ['Alex Turner', 'Maria Silva', 'Kevin Park', 'Sophie Martin', 'Ryan Clark'];
        const statuses = ['completed', 'pending', 'completed', 'completed', 'failed'];
        const amounts = [1250, 3400, 890, 5670, 2100];
        
        const newTrx = {
            id: '#TRX-' + (7899 + this.data.transactions.length),
            customer: customers[Math.floor(Math.random() * customers.length)],
            date: new Date().toISOString().split('T')[0],
            amount: '$' + amounts[Math.floor(Math.random() * amounts.length)].toLocaleString() + '.00',
            status: statuses[Math.floor(Math.random() * statuses.length)]
        };

        this.data.transactions.unshift(newTrx);
        if (this.data.transactions.length > 8) this.data.transactions.pop();
        
        this.populateTable();
        
        // Flash effect on table
        const table = document.querySelector('.table-card');
        table.style.borderColor = 'rgba(139, 92, 246, 0.5)';
        setTimeout(() => {
            table.style.borderColor = '';
        }, 300);
    }

    setupEventListeners() {
        // Period buttons
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                const period = e.target.dataset.period;
                this.charts.revenue.data = this.data.revenue[period];
                this.charts.revenue.labels = period === 'week' 
                    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    : period === 'month'
                    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    : ['2021', '2022', '2023', '2024', '2025', '2026'];
                
                this.drawRevenueChart();
            });
        });

        // Window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.initCharts();
            }, 250);
        });

        // Nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.currentTarget.getAttribute('href') === '#') {
                    e.preventDefault();
                    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                }
            });
        });
    }

    animateNumbers() {
        const stats = ['revenue', 'users', 'orders', 'conversion'];
        const targets = [48295, 12543, 3847, 4.32];
        
        stats.forEach((stat, index) => {
            const element = document.getElementById(stat);
            if (!element) return;
            
            const target = targets[index];
            const duration = 2000;
            const start = 0;
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                
                const current = start + (target - start) * easeProgress;
                
                let formatted;
                if (stat === 'revenue') formatted = '$' + Math.floor(current).toLocaleString();
                else if (stat === 'users') formatted = Math.floor(current).toLocaleString();
                else if (stat === 'orders') formatted = Math.floor(current).toLocaleString();
                else formatted = current.toFixed(2) + '%';
                
                element.textContent = formatted;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        });
    }
}

// Global functions
function exportData() {
    const btn = document.querySelector('.export-btn');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<span class="loading"></span> Exporting...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
            </svg>
            Exported!
        `;
        btn.style.background = '#10b981';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.disabled = false;
        }, 2000);
    }, 1500);
}

function viewTransaction(id) {
    alert(`Viewing transaction ${id}\n\nIn a real app, this would open a detailed view.`);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new DataPulseDashboard();
});