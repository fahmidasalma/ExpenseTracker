// Financial Analysis Charts
const colors = [
  'rgba(255, 99, 132, 0.8)',
  'rgba(54, 162, 235, 0.8)',
  'rgba(255, 206, 86, 0.8)',
  'rgba(75, 192, 192, 0.8)',
  'rgba(153, 102, 255, 0.8)',
  'rgba(255, 159, 64, 0.8)',
];

// Render Categories Distribution Chart
const renderCategoriesChart = (data, labels) => {
  const ctx = document.getElementById('categoriesChart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        }
      }
    }
  });
};

// Render Monthly Breakdown Chart
const renderMonthlyChart = (data, labels) => {
  const ctx = document.getElementById('monthlyChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Monthly Expenses',
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
};

// Render Top Categories Chart
const renderTopCategoriesChart = (data, labels) => {
  const ctx = document.getElementById('topCategoriesChart').getContext('2d');
  new Chart(ctx, {
    type: 'horizontalBar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Amount Spent',
        data: data,
        backgroundColor: colors.slice(0, data.length),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true
        }
      }
    }
  });
};

// Fetch and load all chart data
const loadFinancialAnalysis = () => {
  // Fetch categories data
  fetch('/expense_category_summary')
    .then(res => res.json())
    .then(results => {
      if (results && results.expense_category_data) {
        const categoryData = results.expense_category_data;
        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);
        renderCategoriesChart(data, labels);
        renderTopCategoriesChart(data, labels);
      }
    })
    .catch(error => console.error('Error loading categories:', error));

  // Fetch monthly data (you'll need to create this endpoint)
  fetch('/monthly_expense_summary')
    .then(res => res.json())
    .then(results => {
      if (results && results.monthly_data) {
        const monthlyData = results.monthly_data;
        const labels = Object.keys(monthlyData);
        const data = Object.values(monthlyData);
        renderMonthlyChart(data, labels);
      }
    })
    .catch(error => console.error('Error loading monthly data:', error));
};

// Load charts when DOM is ready
document.addEventListener('DOMContentLoaded', loadFinancialAnalysis);