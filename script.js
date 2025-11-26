// ==================== GLOBAL VARIABLES ====================

// Supermarket Simulation Variables
let singleCustomers = [];
let multiCustomers = [];
let simulationRunning = false;
let singleTime = 0;
let multiTime = 0;
let customerId = 0;
let singleInterval = null;
let multiInterval = null;
let timeInterval = null;

// Pipeline Simulation Variables
let instructions = [];
let instructionId = 0;
let pipelineRunning = false;
let currentView = 'single';
const pipelineStages = ['Fetch', 'Decode', 'Execute', 'Write Back'];

// Benchmark Data
const benchmarkData = {
    gaming: {
        '1 Core': 45,
        '2 Cores': 65,
        '4 Cores': 85,
        '6 Cores': 95,
        '8 Cores': 100
    },
    'video-editing': {
        '1 Core': 20,
        '2 Cores': 40,
        '4 Cores': 70,
        '6 Cores': 90,
        '8 Cores': 100
    },
    'web-browsing': {
        '1 Core': 60,
        '2 Cores': 80,
        '4 Cores': 95,
        '6 Cores': 98,
        '8 Cores': 100
    }
};

// ==================== DOM ELEMENTS ====================

// Supermarket Elements
const singleQueueElement = document.getElementById('single-queue');
const multiQueueElement = document.getElementById('multi-queue');
const singleCustomersElement = document.getElementById('single-customers');
const singleTimeElement = document.getElementById('single-time');
const multiCustomersElement = document.getElementById('multi-customers');
const multiTimeElement = document.getElementById('multi-time');
const addCustomerBtn = document.getElementById('add-customer');
const startSimulationBtn = document.getElementById('start-simulation');
const resetSimulationBtn = document.getElementById('reset-simulation');

// Pipeline Elements
const addInstructionBtn = document.getElementById('add-instruction');
const toggleCoreViewBtn = document.getElementById('toggle-core-view');
const startPipelineBtn = document.getElementById('start-pipeline');
const hazardExplanationBtn = document.getElementById('hazard-explanation');
const singlePipelineElement = document.getElementById('single-pipeline');
const multiPipelineElement = document.getElementById('multi-pipeline');

// Benchmark Elements
const workloadButtons = document.querySelectorAll('.workload-btn');
const runBenchmarkBtn = document.getElementById('run-benchmark');

// Quiz Elements
const quizOptions = document.querySelectorAll('.quiz-option');
const getRecommendationBtn = document.getElementById('get-recommendation');
const recommendationResult = document.getElementById('recommendation-result');

// Other Elements
const scrollToTopBtn = document.getElementById('scrollToTop');
const glossaryTerms = document.querySelectorAll('.glossary-term');

// ==================== UTILITY FUNCTIONS ====================

/**
 * Menampilkan notifikasi kepada pengguna
 * @param {string} message - Pesan yang akan ditampilkan
 * @param {string} type - Jenis notifikasi ('info', 'warning', 'success', 'error')
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger show animation
    setTimeout(() => {
        notification.classList.add('show');
        notification.classList.add('pulse');
    }, 10);
    
    // Auto hide setelah 4 detik
    setTimeout(() => {
        notification.classList.remove('show', 'pulse');
        notification.classList.add('hide');
        
        // Remove dari DOM setelah animasi selesai
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 600);
    }, 4000);
}

/**
 * Membuat modal untuk penjelasan hazards
 */
function createHazardModal() {
    const modal = document.createElement('div');
    modal.className = 'hazard-modal';
    modal.innerHTML = `
        <div class="hazard-content">
            <h3>Pipeline Hazards</h3>
            <p><strong>Data Hazard:</strong> Terjadi ketika instruksi bergantung pada hasil instruksi sebelumnya.</p>
            <p><strong>Structural Hazard:</strong> Terjadi ketika beberapa instruksi membutuhkan resource yang sama.</p>
            <p><strong>Control Hazard:</strong> Terjadi karena branch instructions (if, loop).</p>
            <p><strong>Multi-core mengatasi hazards dengan:</strong></p>
            <ul>
                <li>Memproses instruksi di core berbeda</li>
                <li>Mengurangi ketergantungan data</li>
                <li>Resource yang dedicated per core</li>
            </ul>
            <button class="close-modal">Tutup</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners untuk modal
    modal.addEventListener('click', function(e) {
        if (e.target === modal || e.target.classList.contains('close-modal')) {
            modal.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(modal)) {
                    document.body.removeChild(modal);
                }
            }, 300);
        }
    });
    
    return modal;
}

// ==================== SUPERMARKET SIMULATION ====================

/**
 * Menambah pelanggan baru ke simulasi
 */
function addCustomer() {
    if (simulationRunning) {
        showNotification('Simulasi sedang berjalan! Tunggu hingga selesai.', 'warning');
        return;
    }
    
    customerId++;
    const customer = {
        id: customerId,
        processingTime: 2
    };
    
    singleCustomers.push({...customer});
    multiCustomers.push({...customer});
    
    updateQueueDisplay();
    updateCustomerCounts();
}

/**
 * Memperbarui tampilan antrian pelanggan
 */
function updateQueueDisplay() {
    // Update single queue
    singleQueueElement.innerHTML = '';
    singleCustomers.forEach(customer => {
        const customerElement = createCustomerElement(customer);
        singleQueueElement.appendChild(customerElement);
    });
    
    // Update multi queue
    multiQueueElement.innerHTML = '';
    multiCustomers.forEach(customer => {
        const customerElement = createCustomerElement(customer);
        multiQueueElement.appendChild(customerElement);
    });
}

/**
 * Membuat elemen pelanggan
 * @param {Object} customer - Data pelanggan
 * @returns {HTMLElement} Elemen pelanggan
 */
function createCustomerElement(customer) {
    const element = document.createElement('div');
    element.className = 'customer';
    element.textContent = customer.id;
    element.dataset.id = customer.id;
    element.title = `Pelanggan ${customer.id}`;
    return element;
}

/**
 * Memperbarui jumlah pelanggan yang ditampilkan
 */
function updateCustomerCounts() {
    singleCustomersElement.textContent = singleCustomers.length;
    multiCustomersElement.textContent = multiCustomers.length;
}

/**
 * Memperbarui tampilan waktu
 */
function updateTimeDisplays() {
    singleTimeElement.textContent = `${singleTime}s`;
    multiTimeElement.textContent = `${multiTime}s`;
}

/**
 * Memulai simulasi supermarket
 */
function startSimulation() {
    if (singleCustomers.length === 0) {
        showNotification('Tidak ada pelanggan! Silakan tambah pelanggan terlebih dahulu.', 'warning');
        return;
    }

    if (simulationRunning) return;
    
    simulationRunning = true;
    startSimulationBtn.disabled = true;
    addCustomerBtn.disabled = true;

    singleTime = 0;
    multiTime = 0;
    
    updateTimeDisplays();
    startSimulationIntervals();
    startTimeUpdate();
}

/**
 * Memulai interval untuk simulasi
 */
function startSimulationIntervals() {
    // Single-core interval
    singleInterval = setInterval(() => {
        if (!simulationRunning || singleCustomers.length === 0) {
            clearInterval(singleInterval);
            return;
        }
        
        // Highlight customer pertama
        const customers = document.querySelectorAll('#single-queue .customer');
        if (customers.length > 0) {
            customers[0].classList.add('processing');
        }

        // Hapus 1 customer setelah delay untuk animasi
        setTimeout(() => {
            if (singleCustomers.length > 0) {
                singleCustomers.shift();
                updateQueueDisplay();
                updateCustomerCounts();
                
                if (singleCustomers.length === 0) {
                    clearInterval(singleInterval);
                    checkSimulationComplete();
                }
            }
        }, 200);
        
    }, 1000);
    
    // Multi-core interval
    multiInterval = setInterval(() => {
        if (!simulationRunning || multiCustomers.length === 0) {
            clearInterval(multiInterval);
            return;
        }
        
        // Highlight hingga 4 customer
        const customers = document.querySelectorAll('#multi-queue .customer');
        const customersToProcess = Math.min(4, multiCustomers.length);
        
        for (let i = 0; i < customersToProcess; i++) {
            customers[i].classList.add('processing');
        }
        
        // Hapus customers setelah delay untuk animasi
        setTimeout(() => {
            if (multiCustomers.length > 0) {
                multiCustomers.splice(0, customersToProcess);
                updateQueueDisplay();
                updateCustomerCounts();
                
                if (multiCustomers.length === 0) {
                    clearInterval(multiInterval);
                    checkSimulationComplete();
                }
            }
        }, 200);
        
    }, 1000);
}

/**
 * Memulai pembaruan waktu
 */
function startTimeUpdate() {
    timeInterval = setInterval(() => {
        if (!simulationRunning) {
            clearInterval(timeInterval);
            return;
        }
        
        if (singleCustomers.length > 0) singleTime++;
        if (multiCustomers.length > 0) multiTime++;
        
        updateTimeDisplays();
        
        if (singleCustomers.length === 0 && multiCustomers.length === 0) {
            clearInterval(timeInterval);
            simulationRunning = false;
            startSimulationBtn.disabled = false;
            addCustomerBtn.disabled = false;
            showComparisonResult();
        }
    }, 1000);
}

/**
 * Memeriksa apakah simulasi sudah selesai
 */
function checkSimulationComplete() {
    if (singleCustomers.length === 0 && multiCustomers.length === 0) {
        simulationRunning = false;
        startSimulationBtn.disabled = false;
        addCustomerBtn.disabled = false;
        showComparisonResult();
    }
}

/**
 * Menampilkan hasil perbandingan simulasi
 */
function showComparisonResult() {
    const efficiency = ((singleTime - multiTime) / singleTime * 100).toFixed(1);
    let message = '';
    let type = 'info';
    
    if (multiTime < singleTime) {
        message = `Multi-core ${efficiency}% lebih cepat!\n⏱️ Single: ${singleTime}s | ⏱️ Multi: ${multiTime}s`;
        type = 'success';
    } else if (multiTime > singleTime) {
        message = `Single-core ${Math.abs(efficiency)}% lebih cepat!\n⏱️ Single: ${singleTime}s | ⏱️ Multi: ${multiTime}s`;
        type = 'info';
    } else {
        message = `Kedua arsitektur sama cepat!\n⏱️ Waktu: ${singleTime}s`;
        type = 'info';
    }

    showNotification(message, type);
}

/**
 * Mereset simulasi supermarket
 */
function resetSimulation() {
    clearInterval(singleInterval);
    clearInterval(multiInterval);
    clearInterval(timeInterval);
    
    simulationRunning = false;
    singleCustomers = [];
    multiCustomers = [];
    customerId = 0;
    singleTime = 0;
    multiTime = 0;
    
    updateQueueDisplay();
    updateCustomerCounts();
    updateTimeDisplays();
    
    startSimulationBtn.disabled = false;
    addCustomerBtn.disabled = false;
}

// ==================== PIPELINE SIMULATION ====================

/**
 * Menginisialisasi pipeline multi-core
 */
function initializeMultiPipeline() {
    multiPipelineElement.innerHTML = '';
    
    for (let core = 0; core < 4; core++) {
        const corePipeline = document.createElement('div');
        corePipeline.className = 'pipeline-core';
        corePipeline.innerHTML = `
            <h4>Core ${core + 1}</h4>
            <div class="pipeline">
                ${pipelineStages.map(stage => `
                    <div class="pipeline-stage">
                        <div class="stage-title">${stage}</div>
                        <div class="instructions-container" data-core="${core}" data-stage="${stage.toLowerCase().replace(' ', '-')}"></div>
                    </div>
                `).join('')}
            </div>
        `;
        multiPipelineElement.appendChild(corePipeline);
    }
}

/**
 * Menambah instruksi baru ke pipeline
 */
function addInstruction() {
    if (pipelineRunning) {
        showNotification('Pipeline sedang berjalan! Tunggu hingga selesai.', 'warning');
        return;
    }
    
    instructionId++;
    const instruction = {
        id: instructionId,
        name: `INST${instructionId}`,
        currentStage: -1,
        completed: false,
        core: null
    };
    
    instructions.push(instruction);
    updatePipelineDisplay();
}

/**
 * Memperbarui tampilan pipeline
 */
function updatePipelineDisplay() {
    // Clear semua container
    document.querySelectorAll('.instructions-container').forEach(container => {
        container.innerHTML = '';
    });
    
    // Tampilkan instruksi berdasarkan view
    instructions.forEach(instruction => {
        if (instruction.currentStage >= 0 && !instruction.completed) {
            const stageName = pipelineStages[instruction.currentStage].toLowerCase().replace(' ', '-');
            
            if (currentView === 'single') {
                const container = document.querySelector(`.pipeline-stage:nth-child(${instruction.currentStage + 1}) .instructions-container`);
                if (container) {
                    const instElement = createInstructionElement(instruction);
                    container.appendChild(instElement);
                }
            } else {
                if (instruction.core !== null) {
                    const container = document.querySelector(`.instructions-container[data-core="${instruction.core}"][data-stage="${stageName}"]`);
                    if (container) {
                        const instElement = createInstructionElement(instruction);
                        container.appendChild(instElement);
                    }
                }
            }
        }
    });
}

/**
 * Membuat elemen instruksi
 * @param {Object} instruction - Data instruksi
 * @returns {HTMLElement} Elemen instruksi
 */
function createInstructionElement(instruction) {
    const element = document.createElement('div');
    element.className = `instruction ${instruction.completed ? 'completed' : ''}`;
    element.textContent = instruction.name;
    element.title = `Instruksi ${instruction.name}`;
    return element;
}

/**
 * Men-toggle tampilan antara single dan multi core
 */
function toggleCoreView() {
    if (pipelineRunning) {
        showNotification('Pipeline sedang berjalan! Tunggu hingga selesai.', 'warning');
        return;
    }
    
    currentView = currentView === 'single' ? 'multi' : 'single';
    
    if (currentView === 'single') {
        singlePipelineElement.style.display = 'flex';
        multiPipelineElement.style.display = 'none';
        toggleCoreViewBtn.textContent = 'Switch to Multi-Core';
    } else {
        singlePipelineElement.style.display = 'none';
        multiPipelineElement.style.display = 'block';
        toggleCoreViewBtn.textContent = 'Switch to Single-Core';
        initializeMultiPipeline();
    }
    
    updatePipelineDisplay();
}

/**
 * Memulai simulasi pipeline
 */
function startPipeline() {
    if (pipelineRunning) {
        showNotification('Pipeline sudah berjalan!', 'warning');
        return;
    }
    
    if (instructions.length === 0) {
        showNotification('Tidak ada instruksi! Silakan tambah instruksi terlebih dahulu.', 'warning');
        return;
    }
    
    pipelineRunning = true;
    startPipelineBtn.disabled = true;
    addInstructionBtn.disabled = true;
    toggleCoreViewBtn.disabled = true;
    
    // Reset semua instruksi
    instructions.forEach(instruction => {
        instruction.currentStage = -1;
        instruction.completed = false;
        instruction.core = null;
    });
    
    runPipelineSimulation();
}

/**
 * Menjalankan simulasi pipeline
 */
function runPipelineSimulation() {
    let cycle = 0;
    const maxCycles = 20;
    
    const pipelineInterval = setInterval(() => {
        cycle++;
        
        if (currentView === 'single') {
            simulateSingleCorePipeline(cycle);
        } else {
            simulateMultiCorePipeline(cycle);
        }
        
        updatePipelineDisplay();
        
        const allCompleted = instructions.every(instruction => instruction.completed);
        if (allCompleted || cycle >= maxCycles) {
            clearInterval(pipelineInterval);
            pipelineRunning = false;
            startPipelineBtn.disabled = false;
            addInstructionBtn.disabled = false;
            toggleCoreViewBtn.disabled = false;
            
            showPipelineResult(cycle, allCompleted);
        }
    }, 1000);
}

/**
 * Simulasi pipeline single-core
 * @param {number} cycle - Cycle saat ini
 */
function simulateSingleCorePipeline(cycle) {
    if (cycle === 1) {
        instructions.forEach((instruction, index) => {
            instruction.currentStage = -1;
            instruction.completed = false;
        });
    }
    
    instructions.forEach((instruction, index) => {
        if (instruction.currentStage === -1 && index === 0) {
            instruction.currentStage = 0;
        } else if (instruction.currentStage >= 0 && !instruction.completed) {
            const prevInstruction = index > 0 ? instructions[index - 1] : null;
            if (!prevInstruction || prevInstruction.currentStage > instruction.currentStage) {
                instruction.currentStage++;
                
                if (instruction.currentStage >= pipelineStages.length) {
                    instruction.completed = true;
                }
            }
        }
    });
}

/**
 * Simulasi pipeline multi-core
 * @param {number} cycle - Cycle saat ini
 */
function simulateMultiCorePipeline(cycle) {
    if (cycle === 1) {
        instructions.forEach((instruction, index) => {
            instruction.currentStage = -1;
            instruction.completed = false;
            instruction.core = index % 4;
        });
    }
    
    for (let core = 0; core < 4; core++) {
        const coreInstructions = instructions.filter(inst => inst.core === core);
        
        coreInstructions.forEach((instruction, index) => {
            if (instruction.currentStage === -1 && index === 0) {
                instruction.currentStage = 0;
            } else if (instruction.currentStage >= 0 && !instruction.completed) {
                const prevInstruction = index > 0 ? coreInstructions[index - 1] : null;
                if (!prevInstruction || prevInstruction.currentStage > instruction.currentStage) {
                    instruction.currentStage++;
                    
                    if (instruction.currentStage >= pipelineStages.length) {
                        instruction.completed = true;
                    }
                }
            }
        });
    }
}

/**
 * Menampilkan hasil simulasi pipeline
 * @param {number} cycles - Jumlah cycles yang dijalankan
 * @param {boolean} completed - Apakah semua instruksi selesai
 */
function showPipelineResult(cycles, completed) {
    const completedInstructions = instructions.filter(inst => inst.completed).length;
    const totalInstructions = instructions.length;
    const efficiency = ((completedInstructions / totalInstructions) * 100).toFixed(1);
    
    let message = '';
    if (completed) {
        message = `Semua ${totalInstructions} instruksi selesai dalam ${cycles} cycles!`;
    } else {
        message = `${completedInstructions} dari ${totalInstructions} instruksi selesai dalam ${cycles} cycles (${efficiency}% efisiensi).`;
    }
    
    if (currentView === 'multi') {
        message += " Multi-core memproses instruksi secara paralel!";
    } else {
        message += " Single-core memproses instruksi secara berurutan.";
    }
    
    showNotification(message, completed ? 'success' : 'info');
}

/**
 * Menampilkan penjelasan tentang pipeline hazards
 */
function showHazardExplanation() {
    const modal = createHazardModal();
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// ==================== BENCHMARK CHART ====================

/**
 * Menginisialisasi chart benchmark
 */
// ==================== BENCHMARK CHART ====================

let updateChart; // Variabel global untuk menyimpan function updateChart

/**
 * Menginisialisasi chart benchmark
 */
function initializeBenchmarkChart() {
    const svgWidth = 600;
    const svgHeight = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;
    
    // Clear existing chart
    d3.select("#benchmark-chart").html("");
    
    const svg = d3.select("#benchmark-chart")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
    
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const xScale = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    
    const yScale = d3.scaleLinear()
        .range([height, 0]);
    
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    
    g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`);
    
    g.append("g")
        .attr("class", "y-axis");

    // Add Y-axis label
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", "#fff")
        .text("Performance (%)");
    
    // Tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "chart-tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0, 0, 0, 0.8)")
        .style("color", "white")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0);
    
    /**
     * Memperbarui chart dengan data workload tertentu
     * @param {string} workload - Jenis workload
     */
    function updateChartFunction(workload) {
        const data = Object.entries(benchmarkData[workload]).map(([core, performance]) => ({
            core,
            performance
        }));
        
        xScale.domain(data.map(d => d.core));
        yScale.domain([0, 100]);
        
        // Perbarui sumbu
        g.select(".x-axis")
            .transition()
            .duration(500)
            .call(xAxis);
        
        g.select(".y-axis")
            .transition()
            .duration(500)
            .call(yAxis);
        
        // Bind data
        const bars = g.selectAll(".bar")
            .data(data, d => d.core);
        
        // Keluar
        bars.exit()
            .transition()
            .duration(500)
            .attr("y", height)
            .attr("height", 0)
            .remove();
        
        // Masuk
        const barsEnter = bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.core))
            .attr("y", height)
            .attr("width", xScale.bandwidth())
            .attr("height", 0)
            .attr("fill", "#00ff9d")
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`${d.core}<br/>Performance: ${d.performance}%`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
                
                d3.select(this).style("opacity", 0.7);
            })
            .on("mouseout", function() {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
                
                d3.select(this).style("opacity", 1);
            });
        
        // Update
        barsEnter.merge(bars)
            .transition()
            .duration(500)
            .attr("x", d => xScale(d.core))
            .attr("y", d => yScale(d.performance))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.performance));
        
        // Perbarui label
        const labels = g.selectAll(".label")
            .data(data, d => d.core);
        
        labels.exit().remove();
        
        labels.enter()
            .append("text")
            .attr("class", "label")
            .attr("text-anchor", "middle")
            .attr("fill", "#fff")
            .merge(labels)
            .transition()
            .duration(500)
            .attr("x", d => xScale(d.core) + xScale.bandwidth() / 2)
            .attr("y", d => yScale(d.performance) - 5)
            .text(d => `${d.performance}%`);
    }
    
    // Initialize dengan data gaming
    updateChartFunction('gaming');
    
    return updateChartFunction;
}

/**
 * Menjalankan benchmark
 */
function runBenchmark() {
    const activeWorkload = document.querySelector('.workload-btn.active').dataset.workload;
    
    // Animasi loading
    const originalText = runBenchmarkBtn.innerHTML;
    runBenchmarkBtn.innerHTML = '<span class="loading">⏳</span> Menjalankan...';
    runBenchmarkBtn.disabled = true;
    
    // Simulasi proses benchmark
    setTimeout(() => {
        if (updateChart) {
            updateChart(activeWorkload);
        }
        
        // Tampilkan hasil spesifik berdasarkan workload
        let message = '';
        switch(activeWorkload) {
            case 'gaming':
                message = '✅ Gaming: Single-core performance lebih penting!';
                break;
            case 'video-editing':
                message = '✅ Video Editing: Multi-core memberikan boost performa signifikan!';
                break;
            case 'web-browsing':
                message = '✅ Web Browsing: 2-4 core sudah optimal untuk browsing!';
                break;
        }
        
        runBenchmarkBtn.innerHTML = originalText;
        runBenchmarkBtn.disabled = false;
        showNotification(`Benchmark ${activeWorkload} selesai!\n${message}`, 'success');
    }, 1500);
}

// ==================== BENCHMARK RESULTS POPUP ====================

/**
 * Menampilkan popup hasil benchmark
 * @param {string} workload - Jenis workload yang di-test
 */
function showBenchmarkResults(workload) {
    const results = benchmarkData[workload];
    const popup = createResultsPopup(workload, results);
    
    document.body.appendChild(popup);
    
    // Trigger animation
    setTimeout(() => {
        popup.classList.add('show');
    }, 10);
}

/**
 * Membuat popup hasil benchmark
 */
// ==================== BENCHMARK RESULTS POPUP ====================

/**
 * Membuat popup hasil benchmark dengan struktur awal
 */
function createResultsPopup(workload, results) {
    const popup = document.createElement('div');
    popup.className = 'benchmark-results-popup';
    
    const workloadNames = {
        'gaming': 'Gaming',
        'video-editing': 'Video Editing', 
        'web-browsing': 'Web Browsing'
    };
    
    const bestValueCore = getBestValueCore(workload, results);
    const performanceData = getPerformanceAnalysis(workload, results);
    const recommendation = getPracticalRecommendation(workload, results);
    
    popup.innerHTML = `
        <div class="benchmark-results-content">
            <div class="benchmark-results-header">
                <h3>📊 Hasil Benchmark</h3>
                <div class="workload-type">${workloadNames[workload]}</div>
            </div>
            
            <div class="benchmark-summary">
                <div class="best-performance">
                    <div class="performance-label">REKOMENDASI TERBAIK</div>
                    <div class="best-core">${bestValueCore.core}</div>
                    <div class="performance-score">${bestValueCore.performance}%</div>
                    <div class="value-badge">${recommendation.badge}</div>
                </div>
                
                <div class="performance-comparison">
                    <div class="comp-item">
                        <span>Performa vs 1 Core:</span>
                        <span class="comp-value positive">+${bestValueCore.vsSingle}%</span>
                    </div>
                    <div class="comp-item">
                        <span>Efisiensi vs 8 Core:</span>
                        <span class="comp-value ${bestValueCore.vsMax > -10 ? 'positive' : 'negative'}">
                            ${bestValueCore.vsMax > 0 ? '+' : ''}${bestValueCore.vsMax}%
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="benchmark-insights">
                <h4>Analisis</h4>
                <p>${recommendation.analysis}</p>
            </div>
            
            <div class="benchmark-conclusion">
                <h4>Rekomendasi Spesifik</h4>
                <p><strong>${recommendation.specific}</strong> - ${recommendation.details}</p>
                <div class="cpu-examples">
                    <strong>Contoh CPU:</strong> ${recommendation.examples}
                </div>
            </div>
            
            <div class="benchmark-results-footer">
                <button class="close-results-btn" onclick="closeResultsPopup(this)">
                    Tutup Hasil
                </button>
            </div>
        </div>
    `;
    
    return popup;
}

/**
 * Mencari core dengan value terbaik
 */
function getBestValueCore(workload, results) {
    if (workload === 'gaming') {
        return {
            core: '6 Cores',
            performance: results['6 Cores'],
            vsSingle: results['6 Cores'] - results['1 Core'],
            vsMax: results['6 Cores'] - results['8 Cores']
        };
    }
    else if (workload === 'web-browsing') {
        return {
            core: '4 Cores', 
            performance: results['4 Cores'],
            vsSingle: results['4 Cores'] - results['1 Core'],
            vsMax: results['4 Cores'] - results['8 Cores']
        };
    }
    else {
        return {
            core: '8 Cores',
            performance: results['8 Cores'],
            vsSingle: results['8 Cores'] - results['1 Core'],
            vsMax: 0
        };
    }
}

/**
 * Analisis performa semua core
 */
function getPerformanceAnalysis(workload, results) {
    const bestValueCore = getBestValueCore(workload, results).core;
    
    return Object.entries(results).map(([core, performance]) => ({
        core,
        performance,
        isBestValue: core === bestValueCore,
        label: getCoreLabel(workload, core, performance)
    }));
}

/**
 * Label untuk setiap core
 */
function getCoreLabel(workload, core, performance) {
    const labels = {
        'gaming': {
            '1 Core': 'Minimal',
            '2 Cores': 'Dasar', 
            '4 Cores': 'Baik',
            '6 Cores': 'Optimal',
            '8 Cores': 'High-End'
        },
        'video-editing': {
            '1 Core': 'Sangat Lambat',
            '2 Cores': 'Dasar',
            '4 Cores': 'Standar',
            '6 Cores': 'Cepat', 
            '8 Cores': 'Profesional'
        },
        'web-browsing': {
            '1 Core': 'Terbatas',
            '2 Cores': 'Cukup',
            '4 Cores': 'Optimal',
            '6 Cores': 'Berlebih',
            '8 Cores': 'Berlebihan'
        }
    };
    
    return labels[workload]?.[core] || 'Standar';
}

/**
 * Rekomendasi praktis berdasarkan workload
 */
function getPracticalRecommendation(workload, results) {
    const recommendations = {
        'gaming': {
            badge: 'Sweet Spot',
            analysis: 'Game modern lebih mengandalkan single-core performance. 6 core memberikan 95% performa 8 core dengan harga yang jauh lebih efisien. Budget lebih baik dialokasikan ke GPU.',
            specific: '6 Core - Ryzen 5 / Core i5',
            details: 'Prioritaskan CPU dengan clock speed tinggi dan IPC yang baik',
            examples: 'Ryzen 5 7600X, Core i5-13600K, Ryzen 5 5600X'
        },
        
        'video-editing': {
            badge: 'Recommended', 
            analysis: 'Rendering video sangat scalable dengan core tambahan. Setiap core baru secara signifikan mempercepat proses encoding dan rendering. 8 core adalah starting point untuk editing profesional.',
            specific: '8+ Core - Ryzen 7 / Core i7',
            details: 'Investasi di core tambahan sangat worth it untuk produktivitas',
            examples: 'Ryzen 7 7700X, Core i7-13700K, Ryzen 9 7900X'
        },
        
        'web-browsing': {
            badge: 'Optimal',
            analysis: 'Aplikasi browsing dan office tidak memanfaatkan banyak core. 4 core modern sudah memberikan pengalaman yang smooth untuk multitasking sehari-hari. Core tambahan memberikan diminishing returns.',
            specific: '4 Core - Ryzen 3 / Core i3', 
            details: 'Tidak perlu investasi berlebih untuk core tambahan',
            examples: 'Ryzen 3 5300G, Core i3-13100, Ryzen 5 5600G'
        }
    };
    
    return recommendations[workload];
}

/**
 * Mendapatkan core dengan performa terbaik
 */
function getBestCore(results) {
    let bestCore = '';
    let bestPerformance = 0;
    
    Object.entries(results).forEach(([core, performance]) => {
        if (performance > bestPerformance) {
            bestPerformance = performance;
            bestCore = core;
        }
    });
    
    return { core: bestCore, performance: bestPerformance };
}

/**
 * Menghitung scaling factor dari single-core ke multi-core
 */
function calculateScalingFactor(results) {
    const singleCorePerf = results['1 Core'];
    const multiCorePerf = results['8 Cores'];
    const scaling = (multiCorePerf / singleCorePerf).toFixed(1);
    return scaling;
}

/**
 * Mendapatkan insights berdasarkan workload
 */
function getBenchmarkInsights(workload, results) {
    const insights = {
        'gaming': `Performance gaming meningkat ${results['8 Cores'] - results['1 Core']}% dari 1 core ke 8 core. Single-core performance masih dominan.`,
        'video-editing': `Scaling yang excellent! Multi-core memberikan boost ${results['8 Cores'] - results['1 Core']}% untuk rendering video.`,
        'web-browsing': `Performa optimal tercapai pada 4 core dengan ${results['4 Cores']}%. Tambahan core memberikan diminishing returns.`
    };
    
    return insights[workload];
}

/**
 * Mendapatkan kesimpulan benchmark
 */
function getBenchmarkConclusion(workload, results) {
    const conclusions = {
        'gaming': 'Prioritaskan CPU dengan clock speed tinggi. 6-8 core adalah sweet spot untuk gaming modern.',
        'video-editing': 'Investasi di CPU multi-core sangat worth it. 8+ core akan menghemat waktu rendering secara signifikan.',
        'web-browsing': 'CPU 4-core menawarkan value terbaik. Tidak perlu investasi berlebih untuk core tambahan.'
    };
    
    return conclusions[workload];
}

/**
 * Menutup popup hasil
 */
function closeResultsPopup(button) {
    const popup = button.closest('.benchmark-results-popup');
    popup.classList.remove('show');
    
    setTimeout(() => {
        if (document.body.contains(popup)) {
            document.body.removeChild(popup);
        }
    }, 300);
}

/**
 * Menjalankan benchmark (updated version dengan popup hasil)
 */
function runBenchmark() {
    const activeWorkload = document.querySelector('.workload-btn.active').dataset.workload;
    
    // Animasi loading pada button
    const originalText = runBenchmarkBtn.innerHTML;
    runBenchmarkBtn.innerHTML = '<span class="loading">⏳</span> Menjalankan...';
    runBenchmarkBtn.disabled = true;
    
    // Simulasi proses benchmark
    setTimeout(() => {
        // Update chart (tetap di section)
        if (updateChart) {
            updateChart(activeWorkload);
        }
        
        // Tampilkan popup hasil
        showBenchmarkResults(activeWorkload);
        
        // Reset button
        runBenchmarkBtn.innerHTML = originalText;
        runBenchmarkBtn.disabled = false;
    }, 1500);
}

// ==================== QUIZ RECOMMENDATION ====================

/**
 * Mengumpulkan jawaban quiz dan memberikan rekomendasi
 */
function getRecommendation() {
    const answers = {
        usage: null,
        budget: null,
        applications: null
    };
    
    // Kumpulkan jawaban
    document.querySelectorAll('.quiz-question').forEach((question, index) => {
        const selectedOption = question.querySelector('.quiz-option.selected');
        if (selectedOption) {
            if (index === 0) answers.usage = selectedOption.dataset.value;
            else if (index === 1) answers.budget = selectedOption.dataset.value;
            else if (index === 2) answers.applications = selectedOption.dataset.value;
        }
    });
    
    // Validasi jawaban
    if (!answers.usage || !answers.budget || !answers.applications) {
        showNotification('Silakan jawab semua pertanyaan terlebih dahulu!', 'warning');
        return;
    }
    
    // Berikan rekomendasi berdasarkan jawaban
    let recommendation = '';
    let title = '';
    let icon = '💡';
    
    if (answers.usage === 'gaming') {
        title = 'Rekomendasi: CPU dengan Single-Core Performance Tinggi';
        recommendation = 'Untuk gaming, kinerja single-core yang tinggi lebih penting daripada jumlah core. Pilih CPU dengan clock speed tinggi dan IPC (Instructions Per Cycle) yang baik. CPU dengan 6-8 core biasanya sudah cukup untuk sebagian besar game.';
        icon = '🎮';
    } else if (answers.usage === 'content-creation') {
        title = 'Rekomendasi: CPU Multi-Core dengan Banyak Core';
        recommendation = 'Untuk konten kreatif seperti video editing dan 3D rendering, CPU dengan banyak core akan memberikan performa yang jauh lebih baik. Carilah CPU dengan setidaknya 8 core, atau lebih jika budget memungkinkan.';
        icon = '🎨';
    } else if (answers.usage === 'programming') {
        title = 'Rekomendasi: CPU dengan Keseimbangan Single dan Multi-Core';
        recommendation = 'Untuk programming, Anda membutuhkan keseimbangan antara single-core performance untuk IDE dan tools development, serta multi-core performance untuk kompilasi kode dan menjalankan multiple services. CPU dengan 6-12 core adalah pilihan yang baik.';
        icon = '💻';
    } else {
        title = 'Rekomendasi: CPU dengan Keseimbangan yang Baik';
        recommendation = 'Untuk penggunaan produktivitas umum, carilah CPU yang menawarkan keseimbangan antara single-core performance dan jumlah core. CPU dengan 4-8 core biasanya sudah lebih dari cukup untuk kebutuhan office dan browsing.';
        icon = '⚖️';
    }
    
    // Sesuaikan berdasarkan budget
    if (answers.budget === 'low') {
        recommendation += ' Dengan budget terbatas, pertimbangkan CPU entry-level dengan 4-6 core yang menawarkan value terbaik.';
    } else if (answers.budget === 'medium') {
        recommendation += ' Dengan budget menengah, Anda dapat mempertimbangkan CPU mid-range dengan 6-8 core yang menawarkan performa yang seimbang.';
    } else if (answers.budget === 'high') {
        recommendation += ' Dengan budget tinggi, Anda dapat memilih CPU high-end dengan 12+ core untuk performa maksimal dalam semua scenario.';
    }
    
    // Tampilkan hasil
    recommendationResult.innerHTML = `
        <h3>${icon} ${title}</h3>
        <p>${recommendation}</p>
    `;
    recommendationResult.classList.add('show');
    
    // Scroll ke hasil
    recommendationResult.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

/**
 * Menginisialisasi fungsi toggle untuk glossary (Enhanced)
 */
function initializeGlossary() {
    glossaryTerms.forEach(term => {
        const toggle = term.querySelector('.term-toggle');
        const definition = term.querySelector('.term-definition');
        const chevronIcon = term.querySelector('.chevron-icon');
        
        // Validasi element ada
        if (!toggle || !definition || !chevronIcon) {
            console.warn('Glossary term tidak memiliki struktur yang lengkap:', term);
            return;
        }
        
        toggle.addEventListener('click', function(event) {
            event.stopPropagation();
            
            const isCurrentlyExpanded = definition.classList.contains('expanded');
            closeAllGlossaryTerms();
            
            if (!isCurrentlyExpanded) {
                definition.classList.add('expanded');
                term.classList.add('active');
                chevronIcon.setAttribute('name', 'chevron-up');
            } else {
                definition.classList.remove('expanded');
                term.classList.remove('active');
                chevronIcon.setAttribute('name', 'chevron-up');
            }
        });
        
        term.addEventListener('click', function(event) {
            if (event.target === term) {
                const isCurrentlyExpanded = definition.classList.contains('expanded');
                closeAllGlossaryTerms();
                
                if (!isCurrentlyExpanded) {
                    definition.classList.add('expanded');
                    term.classList.add('active');
                    chevronIcon.setAttribute('name', 'chevron-up');
                }
            }
        });
    });
    
    initializeGlossaryClickOutside();
}

/**
 * Menutup semua glossary term
 */
function closeAllGlossaryTerms() {
    glossaryTerms.forEach(term => {
        const chevronIcon = term.querySelector('.chevron-icon');
        const definition = term.querySelector('.term-definition');
        
        if (chevronIcon && definition) {
            definition.classList.remove('expanded');
            term.classList.remove('active');
            chevronIcon.setAttribute('name', 'chevron-down');
        }
    });
}

/**
 * Menutup semua glossary term
 */
function closeAllGlossaryTerms() {
    glossaryTerms.forEach(term => {
        const chevronIcon = term.querySelector('.chevron-icon');
        const definition = term.querySelector('.term-definition');
        
        // Safety check sebelum manipulasi DOM
        if (chevronIcon && definition) {
            definition.classList.remove('expanded');
            term.classList.remove('active');
            chevronIcon.setAttribute('name', 'chevron-down');
        }
    });
}

/**
 * Menutup glossary term ketika klik di luar area
 */
function initializeGlossaryClickOutside() {
    document.addEventListener('click', function(event) {
        const isGlossaryTerm = event.target.closest('.glossary-term');
        const isGlossaryContainer = event.target.closest('.glossary-container');
        
        // Jika klik di luar glossary container, tutup semua
        if (!isGlossaryContainer) {
            closeAllGlossaryTerms();
        }
    });
}

// ==================== SCROLL FUNCTIONS ====================

/**
 * Mengatur smooth scrolling untuk navigation links
 */
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Mengatur scroll to top button
 */
function initializeScrollToTop() {
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.display = 'flex';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });

    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Mengatur active navigation berdasarkan scroll position
 */
function initializeActiveNavigation() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// ==================== INITIALIZATION ====================

/**
 * Menginisialisasi semua event listeners
 */
function initializeEventListeners() {
    // Supermarket Simulation
    addCustomerBtn.addEventListener('click', addCustomer);
    startSimulationBtn.addEventListener('click', startSimulation);
    resetSimulationBtn.addEventListener('click', resetSimulation);
    
    // Pipeline Simulation
    addInstructionBtn.addEventListener('click', addInstruction);
    toggleCoreViewBtn.addEventListener('click', toggleCoreView);
    startPipelineBtn.addEventListener('click', startPipeline);
    hazardExplanationBtn.addEventListener('click', showHazardExplanation);
    
    // Benchmark
    workloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            workloadButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update chart langsung saat ganti workload
            if (updateChart) {
                updateChart(this.dataset.workload);
            }
        });
    });
    runBenchmarkBtn.addEventListener('click', runBenchmark);
    
    // Quiz
    quizOptions.forEach(option => {
        option.addEventListener('click', function() {
            const question = this.parentElement;
            const options = question.querySelectorAll('.quiz-option');
            options.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
    getRecommendationBtn.addEventListener('click', getRecommendation);
    
    // Scroll and Navigation
    initializeSmoothScrolling();
    initializeScrollToTop();
    initializeActiveNavigation();
}

/**
 * Menginisialisasi aplikasi saat DOM siap
 */
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi chart benchmark
    updateChart = initializeBenchmarkChart();
    
    // Inisialisasi pipeline multi-core
    initializeMultiPipeline();
    
    // Inisialisasi glossary
    initializeGlossary();
    
    // Inisialisasi event listeners
    initializeEventListeners();
    
    // Inisialisasi state awal
    updateCustomerCounts();
    updateTimeDisplays();
    
    console.log('Aplikasi Single-Core vs Multi-Core berhasil diinisialisasi!');
});