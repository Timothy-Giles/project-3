// Global variable to store the data
let globalData;

// Function to load and process the data
function loadData() {
    return d3.json("SQL/cleaned_data.json").then(data => {
        globalData = data;
        return data;
    }).catch(error => {
        console.error("Error loading the data:", error);
    });
}

// Declare a variable to hold the chart reference
let barChart;
// Function to build bar chart
function buildBarChart(data, selectedModel) {
    // If a chart already exists, destroy it
    if (barChart) {
        barChart.destroy();
    }
    
    // Count the number of cars for each model
    let modelData = d3.rollup(data, v => v.length, d => d.model);
    let modelEntries = Array.from(modelData, ([key, value]) => ({model: key, count: value}));
    modelEntries.sort((a, b) => b.count - a.count);

    // Limit to top 20 models and add an "Others" category
    let topModels = modelEntries.slice(0, 20);
    let othersCount = modelEntries.slice(20).reduce((sum, entry) => sum + entry.count, 0);
    if (othersCount > 0) {
        topModels.push({model: "Others", count: othersCount});
    }

    let colors = topModels.map(entry =>
        entry.model === selectedModel ? 'rgb(255,99,71)' :
        entry.model === "Others" ? 'rgb(169,169,169)' : 'rgb(158,202,225)'
    );
    
    
    // Create the chart using Chart.js
    let ctx = document.getElementById('bar').getContext('2d');
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topModels.map(entry => entry.model),
            datasets: [{
                label: 'Number of Cars',
                data: topModels.map(entry => entry.count),
                backgroundColor: colors,
                borderColor: 'rgb(8,48,107)',
                borderWidth: 1.5,
                hoverBackgroundColor: 'rgba(0,0,0,0.2)',
                hoverBorderColor: 'rgba(0,0,0,0.2)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Model'
                    },
                    ticks: {
                        maxRotation: 90,
                        minRotation: 45
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Number of Cars'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Total Cars by Model (Top 20)'
                }
            }
        }
    });

    // Animate the chart using Anime.js (makes the bars grow during initialization)
    anime({
              //an array of numerical values representing the bar heights (number of cars) in the bar chart
        targets: barChart.data.datasets[0].data,
              //creates an array of the car counts for the top models, which corresponds to the final values each bar in the chart should animate to
        value: topModels.map(entry => entry.count),
        //rounded to the nearest integer during the animation
        round: 1,
        //easing function that starts the animation slowly, accelerates, and then slows down again
        easing: 'easeInOutQuad',
        duration: 15000,
        update: function(anim) {
            //continuous update
            barChart.update();
        }
    });
}

// Function to build pie chart
function buildPieChart(data, selectedMake) {
    let makeData = d3.rollup(data, v => v.length, d => d.make);
    let makeEntries = Array.from(makeData, ([key, value]) => ({make: key, count: value}));
    makeEntries.sort((a, b) => b.count - a.count);

    let colors = makeEntries.map(entry => 
        entry.make === selectedMake ? 'rgb(255,99,71)' : 'rgb(158,202,225)'
    );

    let trace = {
        labels: makeEntries.map(entry => entry.make),
        values: makeEntries.map(entry => entry.count),
        type: 'pie',
        marker: {
            colors: colors
        },
        textinfo: 'label+percent',
        hoverinfo: 'label+value+percent',
        textposition: 'inside'
    };

    let layout = {
        title: 'Distribution of Car Makes',
        height: 600,
        margin: {
            l: 50,
            r: 50,
            b: 50,
            t: 50,
            pad: 4
        }
    };

    Plotly.newPlot('pie', [trace], layout);
}


// Function to create the line graph
function createLineGraph(data) {
    // Process the data to get total models per year
    let yearData = d3.rollups(data, v => v.length, d => d.model_year)
        .map(([year, total]) => ({ year: +year, total }));
    // Sort the data by year
    yearData.sort((a, b) => a.year - b.year);
    // Filter data from 2010 to 2024
    yearData = yearData.filter(d => d.year >= 2010 && d.year <= 2024);
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
        title: 'Total Cars And Prediction Over The Years',
        xaxis: { title: 'Years', range: [2010, 2030] },
        yaxis: { title: 'Total Cars Per Year' }
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
    let lastYear = 2024;
    let futureYears = d3.range(lastYear + 1, lastYear + 7);
    let predictionData = futureYears.map(year => ({
        year,
        total: Math.max(0, Math.round(slope * year + intercept))  // Ensure non-negative values
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

async function createBubbleMap(data) {
    const washingtonBounds = [
        [45.543541, -127.848974], // Southwest corner
        [50.002494, -114.916764]  // Northeast corner
    ];

    // Initialize the map centered on Washington State
    const map = L.map('map', {
        maxBounds: washingtonBounds,
        maxBoundsViscosity: 1.0,
        minZoom: 4,
        maxZoom: 15
    }).fitBounds(washingtonBounds);

    // Add the base map layer (OpenStreetMap tiles)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        noWrap: true,
        bounds: washingtonBounds
    }).addTo(map);

    // Object to store count of cars for each city
    const cityCounts = {};

    // Count cars for each city
    data.forEach(car => {
        if (car.city) {
            cityCounts[car.city] = (cityCounts[car.city] || 0) + 1;
        }
    });

    // Iterate through each city
    for (const [city, count] of Object.entries(cityCounts)) {
        try {
            // Fetch geographic data for the city from OpenStreetMap's Nominatim API
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)},Washington,USA`);
            const geoData = await response.json();

            // Check if we got a valid response
            if (geoData.length > 0) {
                // Extract latitude and longitude from the API response
                const lat = parseFloat(geoData[0].lat);
                const long = parseFloat(geoData[0].lon);

                // Calculate the radius of the circle based on the square root of the count
                const radius = Math.sqrt(count) * 200; // Adjust multiplier as needed

                // Create a circle marker on the map
                L.circle([lat, long], {
                    color: 'blue',
                    fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: radius
                }).addTo(map)
                  // Add a popup to the marker with city and count information
                  .bindPopup(`City: ${city}<br>Cars: ${count}`);
            }
        } catch (error) {
            console.error(`Error fetching data for city ${city}:`, error);
        }
    }
}

// Function to update metadata
function updateMetadata(data, selectedMake, selectedModel) {
    console.log("Updating Metadata for Make:", selectedMake, "Model:", selectedModel); // Debugging line

    let metadata = d3.select("#model-metadata");
    metadata.html(""); // Clear existing metadata

    let filteredData = data.filter(car => car.make === selectedMake);
    console.log("Filtered Data:", filteredData); // Debugging line

    let models = [...new Set(filteredData.map(car => car.model))];

    let aggregateInfo = {
        "Make": selectedMake,
        "Total Cars": filteredData.length,
        "Models": models.join(", ")
    };

    if (selectedModel) {
        let modelData = filteredData.filter(car => car.model === selectedModel);
        aggregateInfo["Selected Model"] = selectedModel;
        aggregateInfo["Model Count"] = modelData.length;
        aggregateInfo["Average Range"] = d3.mean(modelData, d => parseInt(d.electric_range)).toFixed(2);
    }

    Object.entries(aggregateInfo).forEach(([key, value]) => {
        metadata.append("p").text(`${key}: ${value}`);
    });
}

// Function to initialize the dashboard
async function init() {
    loadData().then(data => {
        // Populate the make dropdown menu
        let makeDropdown = d3.select("#selMake");
        let makes = [...new Set(data.map(car => car.make))];
        makes.sort((a, b) => a.localeCompare(b));
        makes.forEach(make => {
            makeDropdown.append("option").text(make).property("value", make);
        });

        // Initialize charts with the first make
        let initialMake = makes[0];
        makeChanged(initialMake);
        buildPieChart(data, initialMake);

        // Create line graph and add prediction
        let yearData = createLineGraph(data);
        addPrediction(yearData);

        createBubbleMap(data);
    });
}

// Function to handle changes in the make dropdown selection
function makeChanged(selectedMake) {
    console.log("Selected Make:", selectedMake); // Debugging line
    let filteredData = globalData.filter(car => car.make === selectedMake);
    
    // Update the model dropdown
    let modelDropdown = d3.select("#selDataset");
    modelDropdown.html(""); // Clear existing options
    let models = [...new Set(filteredData.map(car => car.model))];
    models.sort((a, b) => a.localeCompare(b));
    models.forEach(model => {
        modelDropdown.append("option").text(model).property("value", model);
    });

    // Update charts and metadata
    let initialModel = models[0];
    buildBarChart(globalData, initialModel);
    buildPieChart(globalData, selectedMake);
    updateMetadata(globalData, selectedMake, initialModel);
}

// Function to handle changes in the model dropdown selection
function optionChanged(selectedModel) {
    console.log("Selected Model:", selectedModel);

    let selectedMake = d3.select("#selMake").property("value");
    buildBarChart(globalData, selectedModel);
    buildPieChart(globalData, selectedMake);  // Add this line
    updateMetadata(globalData, selectedMake, selectedModel);
}
// Initialize the dashboard
init();
