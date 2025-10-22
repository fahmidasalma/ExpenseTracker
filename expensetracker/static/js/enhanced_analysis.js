// Enhanced Financial Analysis JavaScript

let expenseChart, incomeChart, trendChart, savingsChart;

// Color schemes for charts
const colorSchemes = {
    expenses: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
    ],
    income: [
        '#4BC0C0', '#36A2EB', '#FFCE56', '#FF6384', 
        '#9966FF', '#FF9F40', '#4BC0C0', '#C9CBCF'
    ],
    trend: {
        income: '#4BC0C0',
        expenses: '#FF6384',
        savings: '#36A2EB'
    }
};

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    loadExpenseAnalysis();
    
    // Tab switching handlers
    document.getElementById('income-analysis-tab').addEventListener('click', function() {
        setTimeout(loadIncomeAnalysis, 100);
    });
    
    document.getElementById('trend-analysis-tab').addEventListener('click', function() {
        setTimeout(loadTrendAnalysis, 100);
    });
});

// Expense Analysis Functions
async function loadExpenseAnalysis() {
    try {
        const response = await fetch('/api/expense-analysis/');
        const data = await response.json();
        
        renderExpenseCategoryChart(data.category_data);
        renderMonthlyExpenseChart(data.monthly_data);
        renderExpenseInsights(data.insights);
    } catch (error) {
        console.error('Error loading expense analysis:', error);
        showErrorMessage('expense-analysis', 'Failed to load expense data');
    }
}

function renderExpenseCategoryChart(categoryData) {
    const ctx = document.getElementById('expenseCategoryChart').getContext('2d');
    
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);
    
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colorSchemes.expenses.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: $${context.raw.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderMonthlyExpenseChart(monthlyData) {
    const ctx = document.getElementById('monthlyExpenseChart').getContext('2d');
    
    const labels = Object.keys(monthlyData).map(formatMonthLabel);
    const data = Object.values(monthlyData);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Expenses',
                data: data,
                backgroundColor: '#FF6384',
                borderColor: '#FF6384',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Expenses: $${context.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

function renderExpenseInsights(insights) {
    const container = document.getElementById('expenseInsights');
    container.innerHTML = `
        <div class="row">
            <div class="col-md-3">
                <div class="card bg-danger text-white">
                    <div class="card-body">
                        <h5>Total Expenses</h5>
                        <h3>$${insights.total_expenses.toFixed(2)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <h5>Top Category</h5>
                        <h6>${insights.top_category.name}</h6>
                        <p>$${insights.top_category.amount.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <h5>Monthly Average</h5>
                        <h3>$${insights.average_monthly.toFixed(2)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-secondary text-white">
                    <div class="card-body">
                        <h5>Categories</h5>
                        <h3>${insights.categories_count}</h3>
                    </div>
                </div>
            </div>
        </div>
    `;
}



function renderIncomeSourceChart(sourceData) {
    const ctx = document.getElementById('incomeSourceChart').getContext('2d');
    
    if (incomeChart) {
        incomeChart.destroy();
    }
    
    const labels = Object.keys(sourceData);
    const data = Object.values(sourceData);
    
    incomeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colorSchemes.income.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: $${context.raw.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderMonthlyIncomeChart(monthlyData) {
    const ctx = document.getElementById('monthlyIncomeChart').getContext('2d');
    
    const labels = Object.keys(monthlyData).map(formatMonthLabel);
    const data = Object.values(monthlyData);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Income',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: '#4BC0C0',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Income: $${context.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

function renderIncomeInsights(insights) {
    const container = document.getElementById('incomeInsights');
    container.innerHTML = `
        <div class="row">
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <h5>Total Income</h5>
                        <h3>$${insights.total_income.toFixed(2)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <h5>Top Source</h5>
                        <h6>${insights.top_source.name}</h6>
                        <p>$${insights.top_source.amount.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <h5>Monthly Average</h5>
                        <h3>$${insights.average_monthly.toFixed(2)}</h3>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-secondary text-white">
                    <div class="card-body">
                        <h5>Income Sources</h5>
                        <h3>${insights.sources_count}</h3>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Trend Analysis Functions
async function loadTrendAnalysis() {
    try {
        const response = await fetch('/api/trend-analysis/');
        const data = await response.json();
        
        renderTrendComparisonChart(data);
        renderSavingsChart(data.monthly_savings);
        renderHealthIndicators(data.health_indicators);
    } catch (error) {
        console.error('Error loading trend analysis:', error);
        showErrorMessage('trend-analysis', 'Failed to load trend data');
    }
}

function renderTrendComparisonChart(data) {
    const ctx = document.getElementById('trendComparisonChart').getContext('2d');
    
    if (trendChart) {
        trendChart.destroy();
    }
    
    const labels = Object.keys(data.monthly_income).map(formatMonthLabel);
    const incomeData = Object.values(data.monthly_income);
    const expenseData = Object.values(data.monthly_expenses);
    
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: colorSchemes.trend.income,
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: colorSchemes.trend.expenses,
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

function renderSavingsChart(savingsData) {
    const ctx = document.getElementById('savingsChart').getContext('2d');
    
    if (savingsChart) {
        savingsChart.destroy();
    }
    
    const labels = Object.keys(savingsData).map(formatMonthLabel);
    const data = Object.values(savingsData);
    
    savingsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Net Savings',
                data: data,
                backgroundColor: data.map(value => value >= 0 ? colorSchemes.trend.savings : colorSchemes.trend.expenses),
                borderColor: data.map(value => value >= 0 ? colorSchemes.trend.savings : colorSchemes.trend.expenses),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Savings: $${context.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

function renderHealthIndicators(indicators) {
    const container = document.getElementById('healthIndicators');
    container.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="card bg-${indicators.health_color} text-white">
                    <div class="card-body text-center">
                        <h4>Financial Health</h4>
                        <h2>${indicators.health_status}</h2>
                        <p>Savings Rate: ${indicators.savings_rate}%</p>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5>Key Metrics</h5>
                        <table class="table table-sm">
                            <tr>
                                <td>Total Income (12 months):</td>
                                <td><strong>$${indicators.total_income.toFixed(2)}</strong></td>
                            </tr>
                            <tr>
                                <td>Total Expenses (12 months):</td>
                                <td><strong>$${indicators.total_expenses.toFixed(2)}</strong></td>
                            </tr>
                            <tr>
                                <td>Total Savings:</td>
                                <td><strong class="text-${indicators.total_savings >= 0 ? 'success' : 'danger'}">
                                    $${indicators.total_savings.toFixed(2)}
                                </strong></td>
                            </tr>
                            <tr>
                                <td>Avg Monthly Income:</td>
                                <td><strong>$${indicators.avg_monthly_income.toFixed(2)}</strong></td>
                            </tr>
                            <tr>
                                <td>Avg Monthly Expenses:</td>
                                <td><strong>$${indicators.avg_monthly_expenses.toFixed(2)}</strong></td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Utility Functions
function formatMonthLabel(monthKey) {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function showErrorMessage(tabId, message) {
    const tab = document.getElementById(tabId);
    if (tab) {
        tab.innerHTML = `
            <div class="alert alert-danger mt-4" role="alert">
                <h4 class="alert-heading">Error!</h4>
                <p>${message}</p>
            </div>
        `;
    }
}