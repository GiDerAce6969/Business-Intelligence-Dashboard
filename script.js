document.addEventListener('DOMContentLoaded', () => {
    // FORM & INPUT ELEMENTS
    const entryForm = document.getElementById('entry-form');
    const typeSelect = document.getElementById('type');
    const cashFields = document.getElementById('cash-fields');
    const investmentFields = document.getElementById('investment-fields');
    const dateInput = document.getElementById('date');

    // SUMMARY ELEMENTS
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpensesEl = document.getElementById('total-expenses');
    const netCashflowEl = document.getElementById('net-cashflow');
    const totalInvestmentsEl = document.getElementById('total-investments');

    // LIST & CHART ELEMENTS
    const transactionList = document.getElementById('transaction-list');
    const investmentList = document.getElementById('investment-list');
    const expenseChartCtx = document.getElementById('expense-chart').getContext('2d');
    const investmentChartCtx = document.getElementById('investment-chart').getContext('2d');

    // DATA STORAGE
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let investments = JSON.parse(localStorage.getItem('investments')) || [];
    
    // CHART INSTANCES
    let expenseChart, investmentChart;

    // ----- EVENT LISTENERS -----
    typeSelect.addEventListener('change', toggleFields);
    entryForm.addEventListener('submit', addEntry);
    transactionList.addEventListener('click', deleteTransaction);
    investmentList.addEventListener('click', deleteInvestment);

    // ----- INITIALIZATION -----
    function init() {
        dateInput.valueAsDate = new Date();
        toggleFields();
        updateUI();
    }

    // ----- FUNCTIONS -----
    function toggleFields() {
        if (typeSelect.value === 'investment') {
            investmentFields.classList.remove('hidden');
            cashFields.classList.add('hidden');
        } else {
            investmentFields.classList.add('hidden');
            cashFields.classList.remove('hidden');
        }
    }

    function addEntry(e) {
        e.preventDefault();
        const type = typeSelect.value;
        const date = document.getElementById('date').value;

        if (type === 'investment') {
            const name = document.getElementById('investment-name').value;
            const amount = parseFloat(document.getElementById('investment-amount').value);
            if (!name || isNaN(amount) || !date) return;
            investments.push({ id: Date.now(), name, amount, date });
            saveInvestments();
        } else {
            const description = document.getElementById('cash-description').value;
            const amount = parseFloat(document.getElementById('cash-amount').value);
            if (!description || isNaN(amount) || !date) return;
            transactions.push({ id: Date.now(), type, description, amount, date });
            saveTransactions();
        }
        
        entryForm.reset();
        dateInput.valueAsDate = new Date();
        toggleFields();
        updateUI();
    }

    function deleteTransaction(e) {
        if (e.target.classList.contains('delete-btn')) {
            const id = parseInt(e.target.parentElement.dataset.id);
            transactions = transactions.filter(t => t.id !== id);
            saveTransactions();
            updateUI();
        }
    }

    function deleteInvestment(e) {
        if (e.target.classList.contains('delete-btn')) {
            const id = parseInt(e.target.parentElement.dataset.id);
            investments = investments.filter(i => i.id !== id);
            saveInvestments();
            updateUI();
        }
    }

    function updateUI() {
        updateSummary();
        renderTransactionList();
        renderInvestmentList();
        renderCharts();
    }

    function updateSummary() {
        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const investmentTotal = investments.reduce((sum, i) => sum + i.amount, 0);

        totalIncomeEl.textContent = `₹${income.toFixed(2)}`;
        totalExpensesEl.textContent = `₹${expenses.toFixed(2)}`;
        netCashflowEl.textContent = `₹${(income - expenses).toFixed(2)}`;
        totalInvestmentsEl.textContent = `₹${investmentTotal.toFixed(2)}`;
    }

    function renderTransactionList() {
        transactionList.innerHTML = transactions.length === 0 ? '<li>No cash transactions yet.</li>' : '';
        transactions.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(t => {
            const sign = t.type === 'income' ? '+' : '-';
            const li = document.createElement('li');
            li.dataset.id = t.id;
            li.innerHTML = `
                <div>
                    <div class="description">${t.description}</div>
                    <div class="date">${t.date}</div>
                </div>
                <div>
                    <span class="amount ${t.type}">${sign} ₹${t.amount.toFixed(2)}</span>
                    <button class="delete-btn">✖</button>
                </div>
            `;
            transactionList.appendChild(li);
        });
    }

    function renderInvestmentList() {
        investmentList.innerHTML = investments.length === 0 ? '<li>No investments yet.</li>' : '';
        investments.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(i => {
            const li = document.createElement('li');
            li.dataset.id = i.id;
            li.innerHTML = `
                <div>
                    <div class="description">${i.name}</div>
                    <div class="date">${i.date}</div>
                </div>
                <div>
                    <span class="amount investment">₹${i.amount.toFixed(2)}</span>
                    <button class="delete-btn">✖</button>
                </div>
            `;
            investmentList.appendChild(li);
        });
    }

    function renderCharts() {
        // Expense Chart
        const expenseData = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
            const desc = t.description.toLowerCase();
            acc[desc] = (acc[desc] || 0) + t.amount;
            return acc;
        }, {});
        if (expenseChart) expenseChart.destroy();
        expenseChart = new Chart(expenseChartCtx, createChartConfig('Expense Breakdown', expenseData, ['#FF6384', '#36A2EB', '#FFCE56']));

        // Investment Chart
        const investmentData = investments.reduce((acc, i) => {
            acc[i.name] = (acc[i.name] || 0) + i.amount;
            return acc;
        }, {});
        if (investmentChart) investmentChart.destroy();
        investmentChart = new Chart(investmentChartCtx, createChartConfig('Investment Allocation', investmentData, ['#ffc107', '#fd7e14', '#20c997']));
    }

    function createChartConfig(title, data, backgroundColors) {
        return {
            type: 'doughnut',
            data: {
                labels: Object.keys(data),
                datasets: [{ data: Object.values(data), backgroundColor: backgroundColors }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: Object.keys(data).length > 0 } }
            }
        };
    }

    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function saveInvestments() {
        localStorage.setItem('investments', JSON.stringify(investments));
    }
    
    init();
});