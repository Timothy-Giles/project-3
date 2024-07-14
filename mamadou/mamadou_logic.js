// Function to load and process the data
async function loadData() {
    try {
        const response = await fetch("SQL/cleaned_data.json");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error loading the data:", error);
    }
}

// Function to create the line graph
function createLineGraph(data) {
    // Process the data to get total models per year
    let yearData = d3.rollups(data, v => v.length, d => d.model_year)
        .map(([year, total]) => ({ year: +year, total }));

    // Sort the data by year
    yearData.sort((a, b) => a.year - b.year);

    // Extract x and y values
    let xValues = yearData.map(d => d.year);
    let yValues = yearData.map(d => d.total);

    // Create the trace for the line graph
    let trace = {
        x: xValues,
        y: yValues,
        mode: 'lines+markers',
        name: 'Actual Data'
    };

    // Plot the graph
    let layout = {
        title: 'Total cars And Predictions Over The Years',
        xaxis: { title: 'Years' },
        yaxis: { title: 'Total Car Per Year' }
    };

    Plotly.newPlot('chart', [trace], layout);

    return yearData;
}

// Function to add the prediction line
function addPrediction(data) {
    // Simple linear regression to predict future values
    let xMean = d3.mean(data, d => d.year);
    let yMean = d3.mean(data, d => d.total);
    let numerator = d3.sum(data, d => (d.year - xMean) * (d.total - yMean));
    let denominator = d3.sum(data, d => (d.year - xMean) ** 2);
    let slope = numerator / denominator;
    let intercept = yMean - slope * xMean;

    // Extend the data for prediction
    let lastYear = d3.max(data, d => d.year);
    let futureYears = d3.range(lastYear + 1, lastYear + 6);
    let predictionData = futureYears.map(year => ({
        year,
        total: slope * year + intercept
    }));

    // Combine actual data and prediction data
    let combinedData = data.concat(predictionData);

    // Extract x and y values for the prediction
    let xValuesPrediction = combinedData.map(d => d.year);
    let yValuesPrediction = combinedData.map(d => d.total);

    // Create the trace for the prediction line
    let tracePrediction = {
        x: xValuesPrediction,
        y: yValuesPrediction,
        mode: 'lines',
        name: 'Prediction',
        line: {
            dash: 'dot',
            color: 'red'
        }
    };

    // Update the plot with the prediction
    Plotly.addTraces('chart', tracePrediction);
}

// Load the data and create the graph with prediction
loadData().then(data => {
    let yearData = createLineGraph(data);
    addPrediction(yearData);
});

