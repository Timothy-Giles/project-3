// Build the metadata panel
function buildMetadata(sample) {
    console.log("Building metadata for sample:", sample);

    d3.json("SQL/cleaned_data.json").then((data) => {
        console.log("Data loaded:", data);

        // Get the metadata field
        let metadata = data;
        console.log("Metadata:", metadata);

        // Filter the metadata for the object with the desired sample number
        let resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
        let result = resultArray[0];
        console.log("Filtered metadata result:", result);

        // Use d3 to select the panel with id of `#model-metadata`
        let PANEL = d3.select("#model-metadata");
        console.log("Selected panel:", PANEL);

        // Use `.html("") to clear any existing metadata
        PANEL.html("");
        console.log("Panel cleared");

        // Inside a loop, use d3 to append new tags for each key-value in the filtered metadata
        Object.entries(result).forEach(([key, value]) => {
            PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
            console.log(`Appended: ${key.toUpperCase()}: ${value}`);
        });

        console.log("Metadata panel populated");
    //error handling    
    }).catch(error => {
        console.error("Error loading data:", error);
    });
}

  // Function to build charts (e.g., bar chart)
function buildCharts(sample) {
    console.log("Building charts for sample:", sample);

    d3.json("SQL/cleaned_data.json").then((data) => {
        console.log("Data loaded for charts:", data);

        // Filter the data for the object with the desired sample number
        let sampleData = data.samples.filter(sampleObj => sampleObj.id == sample)[0];
        console.log("Filtered sample data for charts:", sampleData);

        //Add visualizations below

    });
}

// Function to initialize the dashboard
function init() {
    console.log("Initializing dashboard");

    let selector = d3.select("#selDataset");
    console.log("Dropdown selector:", selector);

    // Populate the dropdown menu
    d3.json("SQL/cleaned_data.json").then((data) => {
        console.log("Data loaded for initialization:", data);


        data.forEach((sample) => {
            selector
                .append("option")
                .text(sample.make)
                .property("Make", sample.make);
                console.log(`Appended option: ${sample.make}`);
        });

        // Build the initial metadata and charts
        let firstSample = data[0];
        console.log("First sample:", firstSample);

        buildMetadata(firstSample);
        //buildCharts(firstSample);
    });
}

// Function to handle changes in the dropdown menu
function optionChanged(newSample) {
    console.log("Option changed to new sample:", newSample);
    buildMetadata(newSample);
    //buildCharts(newSample);
}

// Initialize the dashboard
init();