const renderChart = (data, labels) => {
  const canvas = document.getElementById("myChart");
  if (!canvas) {
    console.error("Chart canvas not found!");
    return;
  }
  
  const ctx = canvas.getContext("2d");
  const myChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Last 6 months expenses",
          data: data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(153, 102, 255, 0.8)",
            "rgba(255, 159, 64, 0.8)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Expenses per category (Last 6 months)",
          font: {
            size: 16
          }
        },
        legend: {
          display: true,
          position: "bottom",
        }
      }
    },
  });
};

const getChartData = () => {
  console.log("Fetching expense category data...");
  
  fetch("/expense_category_summary/")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Network response was not ok: ${res.status} ${res.statusText}`);
      }
      return res.json();
    })
    .then((results) => {
      console.log("Chart data results:", results);
      
      if (!results || !results.expense_category_data) {
        console.error("No expense category data found in response:", results);
        showErrorMessage("No expense data available to display.");
        return;
      }

      const category_data = results.expense_category_data;
      
      // Check if we have any data
      if (Object.keys(category_data).length === 0) {
        showErrorMessage("No expenses found for the selected period.");
        return;
      }
      
      const [labels, data] = [
        Object.keys(category_data),
        Object.values(category_data),
      ];

      renderChart(data, labels);
    })
    .catch((error) => {
      console.error('Error fetching chart data:', error);
      showErrorMessage("Failed to load expense data. Please try again.");
    });
};

const showErrorMessage = (message) => {
  const canvas = document.getElementById("myChart");
  if (canvas) {
    const parent = canvas.parentElement;
    const errorDiv = document.createElement("div");
    errorDiv.className = "alert alert-warning text-center";
    errorDiv.innerHTML = `
      <i class="fa fa-exclamation-triangle"></i>
      <p>${message}</p>
      <button class="btn btn-primary btn-sm" onclick="getChartData()">
        <i class="fa fa-refresh"></i> Retry
      </button>
    `;
    
    // Hide canvas and show error
    canvas.style.display = "none";
    parent.appendChild(errorDiv);
  }
};

// Fixed: Use proper event listener instead of document.onload
document.addEventListener('DOMContentLoaded', function() {
  // Check if Chart.js is loaded
  if (typeof Chart === 'undefined') {
    console.error('Chart.js library not loaded!');
    showErrorMessage('Chart library failed to load. Please refresh the page.');
    return;
  }
  
  getChartData();
});

// Alternative: Also handle window load event as backup
window.addEventListener('load', function() {
  // Only run if DOM event hasn't fired yet
  if (document.readyState === 'complete') {
    const canvas = document.getElementById("myChart");
    if (canvas && !canvas.hasAttribute('data-chart-loaded')) {
      canvas.setAttribute('data-chart-loaded', 'true');
      getChartData();
    }
  }
});