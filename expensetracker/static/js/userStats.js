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
    
    if (topMonthElement && topMonthValueElement && topMonth) {
      topMonthElement.textContent = getHumanMonth(Object.keys(topMonth)[0]);
      topMonthValueElement.textContent = Object.values(topMonth)[0];
    }
  } else {
    const topMonthElement = document.querySelector(".income-top-month");
    const topMonthValueElement = document.querySelector(".income-top-month-value");
    
    if (topMonthElement && topMonthValueElement && topMonth) {
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
  
  // Add null/undefined check
  if (!monthData || typeof monthData !== 'object') {
    console.warn(`Invalid monthData for ${type}:`, monthData);
    return;
  }
  
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

const setGraphs = (data) => {
  const [
    thisYearExpenses,
    expenseCategories,
    incomeSources,
    thisYearIncome,
  ] = data;

  // Render Expense Summary Chart
  if (expenseCategories && expenseCategories.expenses_category_data) {
    renderExpenseChart(expenseCategories.expenses_category_data);
  }

  // Render Income Summary Chart  
  if (incomeSources && incomeSources.income_sources_data) {
    renderIncomeChart(incomeSources.income_sources_data);
  }
};

const renderExpenseChart = (categoryData) => {
  const expenseCanvas = document.getElementById("expense-chart");
  if (!expenseCanvas) {
    console.warn("Expense chart canvas not found");
    return;
  }

  // Clear any existing chart
  const existingChart = Chart.getChart(expenseCanvas);
  if (existingChart) {
    existingChart.destroy();
  }

  const ctx = expenseCanvas.getContext("2d");
  const labels = Object.keys(categoryData);
  const data = Object.values(categoryData);

  if (labels.length === 0) {
    console.warn("No expense data to display");
    return;
  }

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Expense Distribution",
          data: data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(153, 102, 255, 0.8)",
            "rgba(255, 159, 64, 0.8)",
            "rgba(201, 203, 207, 0.8)",
            "rgba(255, 99, 255, 0.8)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)", 
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(201, 203, 207, 1)",
            "rgba(255, 99, 255, 1)",
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Expense Summary by Category",
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          position: "bottom",
        },
      },
    },
  });
};

const renderIncomeChart = (sourceData) => {
  const incomeCanvas = document.getElementById("income-chart");
  if (!incomeCanvas) {
    console.warn("Income chart canvas not found");
    return;
  }

  // Clear any existing chart
  const existingChart = Chart.getChart(incomeCanvas);
  if (existingChart) {
    existingChart.destroy();
  }

  const ctx = incomeCanvas.getContext("2d");
  const labels = Object.keys(sourceData);
  const data = Object.values(sourceData);

  if (labels.length === 0) {
    console.warn("No income data to display");
    return;
  }

  new Chart(ctx, {
    type: "pie", 
    data: {
      labels: labels,
      datasets: [
        {
          label: "Income Distribution",
          data: data,
          backgroundColor: [
            "rgba(75, 192, 192, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(153, 102, 255, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(255, 99, 132, 0.8)",
            "rgba(255, 159, 64, 0.8)",
            "rgba(201, 203, 207, 0.8)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(201, 203, 207, 1)",
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Income Summary by Source",
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          position: "bottom",
        },
      },
    },
  });
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
    });
};

// Use proper event listener instead of window.onload
document.addEventListener('DOMContentLoaded', function() {
  fetchData();
});