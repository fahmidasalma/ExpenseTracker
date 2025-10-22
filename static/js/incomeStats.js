const renderIncomeChart = (data, labels) => {
  var ctx = document.getElementById("incomeChart").getContext("2d");
  var myChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Last 6 months income",
          data: data,
          backgroundColor: [
            "rgba(75, 192, 192, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(255, 99, 132, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: "Income per source",
      },
    },
  });
};

const getIncomeChartData = () => {
  console.log("fetching income data");
  fetch("/income/income_sources_data/")
    .then((res) => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .then((results) => {
      console.log("income results", results);
      if (!results || !results.income_source_data) {
        console.error("No income source data found.");
        return;
      }

      const source_data = results.income_source_data;
      const [labels, data] = [
        Object.keys(source_data),
        Object.values(source_data),
      ];

      renderIncomeChart(data, labels);
    })
    .catch((error) => {
      console.error('There was a problem with the fetch operation:', error);
    });
};

document.addEventListener('DOMContentLoaded', getIncomeChartData);