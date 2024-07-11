// Function to load and process the data
function loadData() {
    return d3.json("SQL/cleaned_data.json").then(data => {
        // Process the data if needed
        return data;
    }).catch(error => {
        console.error("Error loading the data:", error);
    });
}

// Function to build charts
function buildCharts(data, selectedModel) {
    // Filter data for the selected model
    let filteredData = data.filter(car => car.model === selectedModel);

    // Add more charts as needed
}

// Function to update metadata
function updateMetadata(data, selectedModel) {
    let metadata = d3.select("#model-metadata");
    metadata.html(""); // Clear existing metadata

    let filteredData = data.filter(car => car.model === selectedModel);
    let aggregateInfo = {
        Average_Range: d3.mean(filteredData, d => parseInt(d.electric_range)).toFixed(2),
        totalCars: filteredData.length,
        // Add more aggregate information as needed
    };

    Object.entries(aggregateInfo).forEach(([key, value]) => {
        metadata.append("p").text(`${key}: ${value}`);
    });
}

// Function to initialize the dashboard
function init() {
    loadData().then(data => {
        // Populate the dropdown menu
        let dropdown = d3.select("#selDataset");
        let models = [...new Set(data.map(car => car.model))];

        // Sort the models alphabetically
        models.sort((a, b) => a.localeCompare(b));
        
        models.forEach(model => {
            dropdown.append("option").text(model).property("value", model);
        });

        // Initialize charts with the first model
        let initialModel = models[0];
        buildCharts(data, initialModel);
        updateMetadata(data, initialModel);
    });
}

// Function to handle changes in the dropdown selection
function optionChanged(selectedModel) {
    loadData().then(data => {
        buildCharts(data, selectedModel);
        updateMetadata(data, selectedModel);
    });
}

// Initialize the dashboard
init();