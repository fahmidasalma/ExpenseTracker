let expenseChart;

// Color schemes for charts
const colorSchemes = {
    expenses: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
    ]
};

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('Chart.js library not loaded!');
        showErrorMessage('Chart library failed to load. Please refresh the page.');
        return;
    }
    
    // Small delay to ensure all resources are loaded
    setTimeout(loadExpenseAnalysis, 100);
});

// Main function to load expense data
async function loadExpenseAnalysis() {
    try {
        console.log("Fetching expense category data...");
        
        // Use your existing endpoint
        const response = await fetch('/expense_category_summary');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Chart data results:", data);
        
        if (!data || !data.expense_category_data) {
            console.error("No expense category data found in response:", data);
            showErrorMessage("No expense data available to display.");
            return;
        }

        const category_data = data.expense_category_data;
        
        // Check if we have any data
        if (Object.keys(category_data).length === 0) {
            showErrorMessage("No expenses found for the selected period.");
            return;
        }
        
        const labels = Object.keys(category_data);
        const chartData = Object.values(category_data);

        renderExpenseCategoryChart(labels, chartData);
        
    } catch (error) {
        console.error('Error loading expense analysis:', error);
        showErrorMessage('Failed to load expense data. Please try again.');
    }
}

// Chart.js v2.7.3 compatible chart rendering
function renderExpenseCategoryChart(labels, data) {
    const canvas = document.getElementById("myChart");
    if (!canvas) {
        console.error("Chart canvas not found!");
        showErrorMessage("Chart canvas element not found!");
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    // Show chart container and hide loading
    const loadingDiv = document.getElementById("chart-loading");
    const chartContainer = document.getElementById("chart-container");
    
    if (loadingDiv) loadingDiv.style.display = "none";
    if (chartContainer) chartContainer.style.display = "block";
    
    // Chart.js v2.7.3 syntax
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: "Last 6 months expenses",
                data: data,
                backgroundColor: colorSchemes.expenses.slice(0, labels.length),
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            // Chart.js v2 syntax - title at root level
            title: {
                display: true,
                text: "Expenses per category (Last 6 months)",
                fontSize: 16
            },
            legend: {
                display: true,
                position: "bottom"
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        const dataset = data.datasets[tooltipItem.datasetIndex];
                        const total = dataset.data.reduce((a, b) => a + b, 0);
                        const currentValue = dataset.data[tooltipItem.index];
                        const percentage = ((currentValue / total) * 100).toFixed(1);
                        const label = data.labels[tooltipItem.index];
                        return `${label}: $${currentValue.toFixed(2)} (${percentage}%)`;
                    }
                }
            }
        }
    });
}

// Error message function compatible with your template
function showErrorMessage(message) {
    const loadingDiv = document.getElementById("chart-loading");
    const chartContainer = document.getElementById("chart-container");
    const errorDiv = document.getElementById("chart-error");
    
    if (loadingDiv) loadingDiv.style.display = "none";
    if (chartContainer) chartContainer.style.display = "none";
    
    if (errorDiv) {
        errorDiv.innerHTML = `
            <div class="alert alert-warning">
                <i class="fa fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button class="btn btn-primary btn-sm" onclick="location.reload()">
                    <i class="fa fa-refresh"></i> Retry
                </button>
            </div>
        `;
        errorDiv.style.display = "block";
    } else {
        // Fallback if error div doesn't exist
        const canvas = document.getElementById("myChart");
        if (canvas) {
            const parent = canvas.parentElement;
            const errorDiv = document.createElement("div");
            errorDiv.className = "alert alert-warning text-center";
            errorDiv.innerHTML = `
                <i class="fa fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button class="btn btn-primary btn-sm" onclick="location.reload()">
                    <i class="fa fa-refresh"></i> Retry
                </button>
            `;
            
            canvas.style.display = "none";
            parent.appendChild(errorDiv);
        }
    }
}

// Make functions available globally
window.renderExpenseCategoryChart = renderExpenseCategoryChart;
window.loadExpenseAnalysis = loadExpenseAnalysis;
window.showErrorMessage = showErrorMessage;