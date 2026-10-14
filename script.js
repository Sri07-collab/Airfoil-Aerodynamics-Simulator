// Find the input elements on the webpage.
const velocityInput = document.getElementById("velocity");
const densityInput = document.getElementById("density");
const areaInput = document.getElementById("area");
const angleInput = document.getElementById("angle");

// Find the result displays.
const angleValue = document.getElementById("angleValue");
const liftDisplay = document.getElementById("lift");
const dragDisplay = document.getElementById("drag");
const ratioDisplay = document.getElementById("ratio");
const explanationText = document.getElementById("explanationText");

// Calculate lift and drag.
function calculateAerodynamics() {

    const velocity = Number(velocityInput.value);
    const density = Number(densityInput.value);
    const area = Number(areaInput.value);
    const angle = Number(angleInput.value);

    // Prevent invalid input.
    if (
        velocityInput.value.trim() === "" ||
        densityInput.value.trim() === "" ||
        areaInput.value.trim() === "" ||
        !Number.isFinite(velocity) ||
        !Number.isFinite(density) ||
        !Number.isFinite(area) ||
        velocity <= 0 ||
        density <= 0 ||
        area <= 0
    ) {
        liftDisplay.textContent = "Check inputs";
        dragDisplay.textContent = "Check inputs";
        ratioDisplay.textContent = "--";
        explanationText.textContent =
            "Enter positive numbers for velocity, density, and wing area.";
        return;
    }

    // Convert angle from degrees to radians.
    const angleRadians = angle * Math.PI / 180;

    // Dynamic pressure.
    const dynamicPressure = 0.5 * density * velocity ** 2;

    // Simplified lift coefficient model.
    const liftCoefficient = 2 * Math.PI * angleRadians;

    // Simplified drag coefficient model.
    const dragCoefficient =
        0.02 + 0.04 * liftCoefficient ** 2;

    // Calculate lift and drag forces.
    const lift = dynamicPressure * area * liftCoefficient;
    const drag = dynamicPressure * area * dragCoefficient;

    // Calculate the lift-to-drag ratio.
    const ratio = drag > 0 ? lift / drag : 0;

    // Display the results.
    angleValue.textContent = angle;

    liftDisplay.textContent = lift.toFixed(2);
    dragDisplay.textContent = drag.toFixed(2);
    ratioDisplay.textContent = ratio.toFixed(2);

    // Explain the current conditions.
    explanationText.textContent =
        `At ${velocity} m/s and an angle of attack of ${angle}°, ` +
        `the estimated lift is ${lift.toFixed(2)} N and ` +
        `the estimated drag is ${drag.toFixed(2)} N. ` +
        `These values come from a simplified aerodynamic model.`;
}

// Update the calculations whenever an input changes.
velocityInput.addEventListener("input", calculateAerodynamics);
densityInput.addEventListener("input", calculateAerodynamics);
areaInput.addEventListener("input", calculateAerodynamics);
angleInput.addEventListener("input", calculateAerodynamics);

// Reset the inputs to their starting values.
document.getElementById("resetButton").addEventListener("click", () => {
    velocityInput.value = 30;
    densityInput.value = 1.225;
    areaInput.value = 20;
    angleInput.value = 5;

    calculateAerodynamics();
});

// Calculate the initial results when the page loads.
calculateAerodynamics();

// Airfoil visualization elements
const airfoilGroup = document.getElementById("airfoilGroup");
const visualAngle = document.getElementById("visualAngle");

// Update the airfoil drawing when the angle changes.
function updateAirfoilVisualization() {

    const angle = Number(angleInput.value);

    // Rotate the airfoil to represent its angle of attack.
    airfoilGroup.style.transform = `rotate(${-angle}deg)`;

    // Display the current angle beside the drawing.
    visualAngle.textContent = angle;
}

// Update the drawing whenever the angle slider moves.
angleInput.addEventListener(
    "input",
    updateAirfoilVisualization
);

// Show the initial airfoil orientation.
updateAirfoilVisualization();


// ======================================
// PERFORMANCE GRAPHS
// ======================================

// Find the three graph canvases.
const liftCanvas = document.getElementById("liftGraph");
const dragCanvas = document.getElementById("dragGraph");
const ratioCanvas = document.getElementById("ratioGraph");

// Get the drawing tools for each canvas.
const liftContext = liftCanvas.getContext("2d");
const dragContext = dragCanvas.getContext("2d");
const ratioContext = ratioCanvas.getContext("2d");


// Draw a graph using calculated data.
function drawGraph(canvas, context, data, title, yLabel) {

    const width = canvas.width;
    const height = canvas.height;

    // Clear the previous graph.
    context.clearRect(0, 0, width, height);

    // Graph margins leave room for labels.
    const left = 75;
    const right = 20;
    const top = 25;
    const bottom = 55;

    const graphWidth = width - left - right;
    const graphHeight = height - top - bottom;

    // Find the data range.
    let minY = Math.min(0, ...data.map(point => point.y));
    let maxY = Math.max(1, ...data.map(point => point.y));

    // Add a little space above and below the data.
    const padding = (maxY - minY) * 0.1 || 1;

    minY -= padding;
    maxY += padding;

    // Map data coordinates to canvas coordinates.
    function xPosition(x) {
        return left + ((x + 5) / 20) * graphWidth;
    }

    function yPosition(y) {
        return top + ((maxY - y) / (maxY - minY)) * graphHeight;
    }

    // Draw horizontal grid lines and Y-axis labels.
    context.font = "20px Arial";
    context.textAlign = "right";
    context.textBaseline = "middle";

    for (let i = 0; i <= 5; i++) {

        const y = top + (i / 5) * graphHeight;

        const value = maxY - (i / 5) * (maxY - minY);

        context.beginPath();
        context.strokeStyle = "#334155";
        context.lineWidth = 1;
        context.moveTo(left, y);
        context.lineTo(width - right, y);
        context.stroke();

        context.fillStyle = "#cbd5e1";
        context.fillText(value.toFixed(1), left - 10, y);
    }

    // Draw X-axis tick marks and labels.
    context.textAlign = "center";
    context.textBaseline = "top";

    for (let angle = -5; angle <= 15; angle += 5) {

        const x = xPosition(angle);

        context.beginPath();
        context.strokeStyle = "#334155";
        context.moveTo(x, top);
        context.lineTo(x, height - bottom);
        context.stroke();

        context.fillStyle = "#cbd5e1";
        context.fillText(
            angle.toString(),
            x,
            height - bottom + 10
        );
    }

    // Draw the graph axes.
    context.beginPath();
    context.strokeStyle = "#94a3b8";
    context.lineWidth = 2;

    context.moveTo(left, top);
    context.lineTo(left, height - bottom);
    context.lineTo(width - right, height - bottom);

    context.stroke();

    // Draw the data curve.
    context.beginPath();
    context.strokeStyle = "#38bdf8";
    context.lineWidth = 3;

    data.forEach((point, index) => {

        const x = xPosition(point.x);
        const y = yPosition(point.y);

        if (index === 0) {
            context.moveTo(x, y);
        } else {
            context.lineTo(x, y);
        }
    });

    context.stroke();

    // Draw points on the curve.
    data.forEach(point => {

        context.beginPath();

        context.fillStyle = "#7dd3fc";

        context.arc(
            xPosition(point.x),
            yPosition(point.y),
            3,
            0,
            Math.PI * 2
        );

        context.fill();
    });

    // Draw graph title.
    context.fillStyle = "#f1f5f9";
    context.font = "bold 22px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillText(title, width / 2, 10);

    // Draw axis labels.
    context.font = "18px Arial";

    context.fillText(
        "Angle of Attack (degrees)",
        left + graphWidth / 2,
        height - 12
    );

    context.save();

    context.translate(18, top + graphHeight / 2);
    context.rotate(-Math.PI / 2);

    context.fillText(yLabel, 0, 0);

    context.restore();
}


// Calculate data for all three graphs.
function updatePerformanceGraphs() {

    const velocity = Number(velocityInput.value);
    const density = Number(densityInput.value);
    const area = Number(areaInput.value);

    // Avoid drawing graphs for invalid inputs.
    if (
        !Number.isFinite(velocity) ||
        !Number.isFinite(density) ||
        !Number.isFinite(area) ||
        velocity <= 0 ||
        density <= 0 ||
        area <= 0
    ) {
[liftCanvas, dragCanvas, ratioCanvas].forEach(canvas => {
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#f1f5f9";
    context.font = "24px Arial";
    context.textAlign = "center";

    context.fillText(
        "Enter valid positive inputs to display the graph.",
        canvas.width / 2,
        canvas.height / 2
    );
});

        return;
    }

    const liftData = [];
    const dragData = [];
    const ratioData = [];

    // Calculate results from -5° to 15°.
    for (let angle = -5; angle <= 15; angle += 1) {

        const radians = angle * Math.PI / 180;

        const dynamicPressure =
            0.5 * density * velocity ** 2;

        // Use the same simplified model as the simulator.
        const liftCoefficient = 2 * Math.PI * radians;

        const dragCoefficient =
            0.02 + 0.04 * liftCoefficient ** 2;

        const lift =
            dynamicPressure * area * liftCoefficient;

        const drag =
            dynamicPressure * area * dragCoefficient;

        const ratio = drag > 0 ? lift / drag : 0;

        liftData.push({
            x: angle,
            y: lift
        });

        dragData.push({
            x: angle,
            y: drag
        });

        ratioData.push({
            x: angle,
            y: ratio
        });
    }

    // Draw each graph.
    drawGraph(
        liftCanvas,
        liftContext,
        liftData,
        "Lift vs. Angle of Attack",
        "Lift (N)"
    );

    drawGraph(
        dragCanvas,
        dragContext,
        dragData,
        "Drag vs. Angle of Attack",
        "Drag (N)"
    );

    drawGraph(
        ratioCanvas,
        ratioContext,
        ratioData,
        "Lift-to-Drag Ratio",
        "Lift / Drag"
    );
}


// Update the graphs whenever an input changes.
velocityInput.addEventListener("input", updatePerformanceGraphs);
densityInput.addEventListener("input", updatePerformanceGraphs);
areaInput.addEventListener("input", updatePerformanceGraphs);
angleInput.addEventListener("input", updatePerformanceGraphs);

// Draw the initial graphs.
updatePerformanceGraphs();