const getHumanMonth = (m) => {
  const [_, month, __] = new Date(new Date().getFullYear(), m - 1, 1)
    .toDateString()
    .split(" ");
  return month;
};

const updateTopMonthsUI = (topMonth, type) => {
  if (type === "expenses") {
    const topMonthElement = document.querySelector(".expense-top-month");
    const topMonthValueElement = document.querySelector(".expense-top-month-value");
    
    if (topMonthElement && topMonthValueElement) {
      topMonthElement.textContent = getHumanMonth(Object.keys(topMonth)[0]);
      topMonthValueElement.textContent = Object.values(topMonth)[0];
    }
  } else {
    const topMonthElement = document.querySelector(".income-top-month");
    const topMonthValueElement = document.querySelector(".income-top-month-value");
    
    if (topMonthElement && topMonthValueElement) {
      topMonthElement.textContent = getHumanMonth(Object.keys(topMonth)[0]);
      topMonthValueElement.textContent = Object.values(topMonth)[0];
    }
  }
};

const updateThisMonthUI = (data = [], type = "expenses") => {
  const currentMonthNumber = new Date().getMonth() + 1;

  const currentMonthData = data.find((item) => {
    return Object.keys(item)[0] == currentMonthNumber;
  });

  if (currentMonthData) {
    if (type === "expenses") {
      const thisMonthElement = document.querySelector(".expense-this-month");
      const thisMonthValueElement = document.querySelector(".expense-this-month-value");
      
      if (thisMonthElement && thisMonthValueElement) {
        thisMonthElement.textContent = getHumanMonth(Object.keys(currentMonthData)[0]);
        thisMonthValueElement.textContent = Object.values(currentMonthData)[0];
      }
    } else {
      const thisMonthElement = document.querySelector(".income-this-month");
      const thisMonthValueElement = document.querySelector(".income-this-month-value");
      
      if (thisMonthElement && thisMonthValueElement) {
        thisMonthElement.textContent = getHumanMonth(Object.keys(currentMonthData)[0]);
        thisMonthValueElement.textContent = Object.values(currentMonthData)[0];
      }
    }
  }
};

const formatStats = (data = {}, type = "expenses") => {
  const monthData = data.months;
  console.log("monthData", monthData);
  const vals = Object.values(monthData);
  const s = vals.map((item, i) => ({ [i + 1]: item }));

  const sorted = s.sort((a, b) =>
    Object.values(a)[0] > Object.values(b)[0] ? -1 : 1
  );
  const topMonth = sorted[0];
  
  if (type === "expenses") {
    updateThisMonthUI(s, "expenses");
  }
  if (type === "income") {
    updateThisMonthUI(s, "income");
  }

  updateTopMonthsUI(topMonth, type);
};

// Fixed setGraphs function - no longer empty!
const setGraphs = (data) => {
  const [thisYearExpenses, expenseCategories, incomeSources, thisYearIncome] = data;
  
  // Create expense trend chart if canvas exists
  const expenseChartCanvas = document.getElementById("expenseChart");
  if (expenseChartCanvas) {
    const ctx = expenseChartCanvas.getContext('2d');
    const monthlyData = thisYearExpenses.this_year_expenses_data.months;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: Object.keys(monthlyData).map(month => getHumanMonth(month)),
        datasets: [{
          label: 'Monthly Expenses',
          data: Object.values(monthlyData),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  
  // Create category distribution chart if canvas exists
  const categoryChartCanvas = document.getElementById("categoryChart");
  if (categoryChartCanvas) {
    const ctx = categoryChartCanvas.getContext('2d');
    const categoryData = expenseCategories.expenses_category_data;
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(categoryData),
        datasets: [{
          label: 'Expense Categories',
          data: Object.values(categoryData),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
          ]
        }]
      },
      options: {
        responsive: true
      }
    });
  }
};

const fetchData = () => {
  const promise1 = fetch("/expense_summary_rest/")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => Promise.resolve(data))
    .catch((e) => {
      console.error("Error fetching expense summary:", e);
      return Promise.reject(e);
    });

  const promise2 = fetch("/last_3months_stats/")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => Promise.resolve(data))
    .catch((e) => {
      console.error("Error fetching 3 months stats:", e);
      return Promise.reject(e);
    });

  const promise3 = fetch("/income/income_sources_data/")
    .then((res) => {
      if (!res.ok) {
        // If income endpoints don't exist yet, return empty data
        return Promise.resolve({ income_sources_data: {} });
      }
      return res.json();
    })
    .then((data) => Promise.resolve(data))
    .catch((e) => {
      console.warn("Income sources data not available:", e);
      return Promise.resolve({ income_sources_data: {} });
    });

  const promise4 = fetch("/income/income_summary_rest/")
    .then((res) => {
      if (!res.ok) {
        // If income endpoints don't exist yet, return empty data
        return Promise.resolve({ this_year_income_data: { months: {} } });
      }
      return res.json();
    })
    .then((data) => Promise.resolve(data))
    .catch((e) => {
      console.warn("Income summary data not available:", e);
      return Promise.resolve({ this_year_income_data: { months: {} } });
    });

  Promise.all([promise1, promise2, promise3, promise4])
    .then((data) => {
      const [
        thisYearExpenses,
        expenseCategories,
        incomeSources,
        thisYearIncome,
      ] = data;
      
      console.log("Data loaded successfully:", data);
      
      formatStats(thisYearExpenses.this_year_expenses_data, "expenses");
      formatStats(thisYearIncome.this_year_income_data, "income");
      setGraphs(data);
    })
    .catch((errs) => {
      console.error("Error loading dashboard data:", errs);
      // Display user-friendly error message
      const errorElement = document.getElementById("dashboard-error");
      if (errorElement) {
        errorElement.textContent = "Unable to load dashboard data. Please refresh the page.";
        errorElement.style.display = "block";
      }
    });
};

// Use proper event listener instead of window.onload
document.addEventListener('DOMContentLoaded', function() {
  fetchData();
});