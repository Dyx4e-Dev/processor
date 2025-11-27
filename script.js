// Penyimpanan state utama simulasi
let singleCustomers = [];
let multiCustomers = [];
let simulationRunning = false;
let singleTime = 0;
let multiTime = 0;
let customerId = 0;

// Penyimpanan state utama simulasi
let singleInterval = null;
let multiInterval = null;
let timeInterval = null;
// Interval untuk animasi titik pada teks loading
let loadingDotsInterval = null;
let loadingDotCount = 0;

// Data benchmark untuk chart & popup hasil
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

// Elemen DOM utama
const singleQueueElement = document.getElementById('single-queue');
const multiQueueElement = document.getElementById('multi-queue');
const singleCustomersElement = document.getElementById('single-customers');
const singleTimeElement = document.getElementById('single-time');
const multiCustomersElement = document.getElementById('multi-customers');
const multiTimeElement = document.getElementById('multi-time');
const addCustomerBtn = document.getElementById('add-customer');
const startSimulationBtn = document.getElementById('start-simulation');
const resetSimulationBtn = document.getElementById('reset-simulation');

// Tombol-tombol
const workloadButtons = document.querySelectorAll('.workload-btn');
const runBenchmarkBtn = document.getElementById('run-benchmark');

const quizOptions = document.querySelectorAll('.quiz-option');
const getRecommendationBtn = document.getElementById('get-recommendation');
const recommendationResult = document.getElementById('recommendation-result');

const scrollToTopBtn = document.getElementById('scrollToTop');
const glossaryTerms = document.querySelectorAll('.glossary-term');

// ==========================
// Fungsi Notifikasi
// ==========================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
        notification.classList.add('pulse');
    }, 10);
    // Animasi muncul dan hilang
    setTimeout(() => {
        notification.classList.remove('show', 'pulse');
        notification.classList.add('hide');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 600);
    }, 4000);
}

// ==========================
// ANALOGI
// ==========================


// Menambah pelanggan ke antrian
function addCustomer() {
    if (simulationRunning) {
        showNotification('Simulasi sedang berjalan! Tunggu hingga selesai.', 'warning');
        return;
    }
    customerId++;
    const customer = { id: customerId, processingTime: 2 };
    singleCustomers.push({ ...customer });
    multiCustomers.push({ ...customer });
    updateQueueDisplay();
    updateCustomerCounts();
}

// Menampilkan pelanggan di antrian
function updateQueueDisplay() {
    singleQueueElement.innerHTML = '';
    singleCustomers.forEach(customer => {
        const customerElement = createCustomerElement(customer);
        singleQueueElement.appendChild(customerElement);
    });
    multiQueueElement.innerHTML = '';
    multiCustomers.forEach(customer => {
        const customerElement = createCustomerElement(customer);
        multiQueueElement.appendChild(customerElement);
    });
}

// Proses antrian pelanggan
function createCustomerElement(customer) {
    const element = document.createElement('div');
    element.className = 'customer';
    element.textContent = customer.id;
    element.dataset.id = customer.id;
    element.title = `Pelanggan ${customer.id}`;
    return element;
}

// Update pelanggan
function updateCustomerCounts() {
    singleCustomersElement.textContent = singleCustomers.length;
    multiCustomersElement.textContent = multiCustomers.length;
}

// Update waktu
function updateTimeDisplays() {
    singleTimeElement.textContent = `${singleTime}s`;
    multiTimeElement.textContent = `${multiTime}s`;
}

// Memulai simulasi
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

// Interval simulasi
function startSimulationIntervals() {
    singleInterval = setInterval(() => {
        if (!simulationRunning || singleCustomers.length === 0) {
            clearInterval(singleInterval);
            return;
        }
        const customers = document.querySelectorAll('#single-queue .customer');
        if (customers.length > 0) {
            customers[0].classList.add('processing');
        }
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

    multiInterval = setInterval(() => {
        if (!simulationRunning || multiCustomers.length === 0) {
            clearInterval(multiInterval);
            return;
        }
        const customers = document.querySelectorAll('#multi-queue .customer');
        const customersToProcess = Math.min(4, multiCustomers.length);
        for (let i = 0; i < customersToProcess; i++) {
            customers[i].classList.add('processing');
        }
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

// Update waktu simulasi
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

// Cek apakah simulasi selesai
function checkSimulationComplete() {
    if (singleCustomers.length === 0 && multiCustomers.length === 0) {
        simulationRunning = false;
        startSimulationBtn.disabled = false;
        addCustomerBtn.disabled = false;
        showComparisonResult();
    }
}

// Menampilkan hasil perbandingan
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

// Mereset simulasi
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

// ==========================
// BENCHMARK
// ==========================

// Inisialisasi chart benchmark
let updateChart;

// Inisialisasi chart benchmark dengan D3.js
function initializeBenchmarkChart() {
    const svgWidth = 600;
    const svgHeight = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;
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
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", "#fff")
        .text("Performance (%)");
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

    // Fungsi untuk memperbarui chart
    function updateChartFunction(workload) {
        const data = Object.entries(benchmarkData[workload]).map(([core, performance]) => ({
            core,
            performance
        }));
        xScale.domain(data.map(d => d.core));
        yScale.domain([0, 100]);
        g.select(".x-axis")
            .transition()
            .duration(500)
            .call(xAxis);
        g.select(".y-axis")
            .transition()
            .duration(500)
            .call(yAxis);
        const bars = g.selectAll(".bar")
            .data(data, d => d.core);
        bars.exit()
            .transition()
            .duration(500)
            .attr("y", height)
            .attr("height", 0)
            .remove();
        const barsEnter = bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.core))
            .attr("y", height)
            .attr("width", xScale.bandwidth())
            .attr("height", 0)
            .attr("fill", "#00ff9d")
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`${d.core}<br/>Performance: ${d.performance}%`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
                d3.select(this).style("opacity", 0.7);
            })
            .on("mouseout", function () {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
                d3.select(this).style("opacity", 1);
            });
        barsEnter.merge(bars)
            .transition()
            .duration(500)
            .attr("x", d => xScale(d.core))
            .attr("y", d => yScale(d.performance))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.performance));
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
    updateChartFunction('gaming');
    return updateChartFunction;
}

// Menjalankan benchmark
function runBenchmark() {
    const activeWorkload = document.querySelector('.workload-btn.active').dataset.workload;
    const originalText = runBenchmarkBtn.innerHTML;
    runBenchmarkBtn.innerHTML = '<span class="loading">⏳</span> Menjalankan...';
    runBenchmarkBtn.disabled = true;
    setTimeout(() => {
        if (updateChart) {
            updateChart(activeWorkload);
        }
        showBenchmarkResults(activeWorkload);
        runBenchmarkBtn.innerHTML = originalText;
        runBenchmarkBtn.disabled = false;
    }, 1500);
}

// Menampilkan popup hasil benchmark
function showBenchmarkResults(workload) {
    const results = benchmarkData[workload];
    const popup = createResultsPopup(workload, results);
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.classList.add('show');
    }, 10);
}

// Membuat elemen popup hasil benchmark
function createResultsPopup(workload, results) {
    const popup = document.createElement('div');
    popup.className = 'benchmark-results-popup';

    const workloadNames = {
        'gaming': 'Gaming',
        'video-editing': 'Video Editing',
        'web-browsing': 'Web Browsing'
    };

    const bestValueCore = getBestValueCore(workload, results);
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

// Mendapatkan core dengan value terbaik berdasarkan workload
function getBestValueCore(workload, results) {
    if (workload === 'gaming') {
        return {
            core: '6 Cores',
            performance: results['6 Cores'],
            vsSingle: results['6 Cores'] - results['1 Core'],
            vsMax: results['6 Cores'] - results['8 Cores']
        };
    } else if (workload === 'web-browsing') {
        return {
            core: '4 Cores',
            performance: results['4 Cores'],
            vsSingle: results['4 Cores'] - results['1 Core'],
            vsMax: results['4 Cores'] - results['8 Cores']
        };
    } else {
        return {
            core: '8 Cores',
            performance: results['8 Cores'],
            vsSingle: results['8 Cores'] - results['1 Core'],
            vsMax: 0
        };
    }
}

// Mendapatkan analisis performa untuk setiap core
function getPerformanceAnalysis(workload, results) {
    const bestValueCore = getBestValueCore(workload, results).core;
    return Object.entries(results).map(([core, performance]) => ({
        core,
        performance,
        isBestValue: core === bestValueCore,
        label: getCoreLabel(workload, core, performance)
    }));
}

// Mendapatkan label performa berdasarkan workload dan core
function getCoreLabel(workload, core) {
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

// Mendapatkan rekomendasi praktis berdasarkan workload
function getPracticalRecommendation(workload) {
    const recommendations = {
        'gaming': {
            badge: 'Sweet Spot',
            analysis: 'Game modern lebih mengandalkan single-core performance. 6 core memberikan 95% performa 8 core dengan harga yang jauh lebih efisien. Budget lebih baik dialokasikan ke GPU.',
            specific: '6 Core - Ryzen 5 / Core i5',
            details: 'Prioritaskan CPU dengan clock speed tinggi dan IPC yang baik.',
            examples: 'Ryzen 5 7600X, Core i5-13600K, Ryzen 5 5600X'
        },
        'video-editing': {
            badge: 'Recommended',
            analysis: 'Rendering video sangat scalable dengan core tambahan. Setiap core baru secara signifikan mempercepat proses encoding dan rendering. 8 core adalah starting point untuk editing profesional.',
            specific: '8+ Core - Ryzen 7 / Core i7',
            details: 'Investasi di core tambahan sangat worth it untuk produktivitas.',
            examples: 'Ryzen 7 7700X, Core i7-13700K, Ryzen 9 7900X'
        },
        'web-browsing': {
            badge: 'Optimal',
            analysis: 'Aplikasi browsing dan office tidak memanfaatkan banyak core. 4 core modern sudah memberikan pengalaman yang smooth untuk multitasking sehari-hari. Core tambahan memberikan diminishing returns.',
            specific: '4 Core - Ryzen 3 / Core i3',
            details: 'Tidak perlu investasi berlebih untuk core tambahan.',
            examples: 'Ryzen 3 5300G, Core i3-13100, Ryzen 5 5600G'
        }
    };
    return recommendations[workload];
}

// Mendapatkan core dengan performa terbaik
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

// Menghitung faktor scaling dari 1 core ke multi-core
function calculateScalingFactor(results) {
    const singleCorePerf = results['1 Core'];
    const multiCorePerf = results['8 Cores'];
    const scaling = (multiCorePerf / singleCorePerf).toFixed(1);
    return scaling;
}

// Mendapatkan insight dari hasil benchmark
function getBenchmarkInsights(workload, results) {
    const insights = {
        'gaming': `Performance gaming meningkat ${results['8 Cores'] - results['1 Core']}% dari 1 core ke 8 core.`,
        'video-editing': `Scaling yang excellent! Multi-core memberikan boost ${results['8 Cores'] - results['1 Core']}%.`,
        'web-browsing': `Performa optimal tercapai pada 4 core.`
    };
    return insights[workload];
}

// Mendapatkan kesimpulan rekomendasi berdasarkan workload
function getBenchmarkConclusion(workload) {
    const conclusions = {
        'gaming': 'Prioritaskan CPU dengan clock speed tinggi. 6-8 core adalah sweet spot.',
        'video-editing': 'Investasi di CPU multi-core sangat worth it. 8+ core akan menghemat waktu render.',
        'web-browsing': 'CPU 4-core menawarkan value terbaik.'
    };
    return conclusions[workload];
}

// Menutup popup hasil benchmark
function closeResultsPopup(button) {
    const popup = button.closest('.benchmark-results-popup');
    popup.classList.remove('show');
    setTimeout(() => {
        if (document.body.contains(popup)) {
            document.body.removeChild(popup);
        }
    }, 300);
}

// ==========================
// REKOMENDASI
// ==========================

// Mendapatkan rekomendasi CPU berdasarkan jawaban kuis
function getRecommendation() {
    const answers = { usage: null, budget: null, applications: null };
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
    let recommendation = '';
    let title = '';
    let icon = '💡';
    // Rekomendasi berdasarkan jawaban
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
    // Rekomendasi berdasarkan budget
    if (answers.budget === 'low') {
        recommendation += ' Dengan budget terbatas, pertimbangkan CPU entry-level dengan 4-6 core yang menawarkan value terbaik.';
    } else if (answers.budget === 'medium') {
        recommendation += ' Dengan budget menengah, Anda dapat mempertimbangkan CPU mid-range dengan 6-8 core yang menawarkan performa yang seimbang.';
    } else if (answers.budget === 'high') {
        recommendation += ' Dengan budget tinggi, Anda dapat memilih CPU high-end dengan 12+ core untuk performa maksimal dalam semua scenario.';
    }
    recommendationResult.innerHTML = `
        <h3>${icon} ${title}</h3>
        <p>${recommendation}</p>
    `;
    recommendationResult.classList.add('show');
    recommendationResult.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

// ==========================
// FUNGSI UMUM
// ==========================

// Inisialisasi glossary interaktif
function initializeGlossary() {
    glossaryTerms.forEach(term => {
        const toggle = term.querySelector('.term-toggle');
        const definition = term.querySelector('.term-definition');
        const chevronIcon = term.querySelector('.chevron-icon');

        if (!toggle || !definition || !chevronIcon) return;

        toggle.addEventListener('click', function (event) {
            event.stopPropagation();
            const isExpanded = definition.classList.contains('expanded');
            closeAllGlossaryTerms();
            if (!isExpanded) {
                definition.classList.add('expanded');
                term.classList.add('active');
                chevronIcon.classList.add('rotated');
            } else {
                definition.classList.remove('expanded');
                term.classList.remove('active');
                chevronIcon.classList.remove('rotated');
            }
        });

        term.addEventListener('click', function (event) {
            if (event.target === term) {
                const isExpanded = definition.classList.contains('expanded');
                closeAllGlossaryTerms();
                if (!isExpanded) {
                    definition.classList.add('expanded');
                    term.classList.add('active');
                    chevronIcon.classList.add('rotated');
                }
            }
        });
    });
    initializeGlossaryClickOutside();
}

// Menutup semua istilah glossary
function closeAllGlossaryTerms() {
    glossaryTerms.forEach(term => {
        const chevronIcon = term.querySelector('.chevron-icon');
        const definition = term.querySelector('.term-definition');
        if (chevronIcon && definition) {
            definition.classList.remove('expanded');
            term.classList.remove('active');
            chevronIcon.classList.remove('rotated');
        }
    });
}

// Inisialisasi klik di luar glossary untuk menutup
function initializeGlossaryClickOutside() {
    document.addEventListener('click', function (event) {
        const isGlossaryTerm = event.target.closest('.glossary-term');
        const isGlossaryContainer = event.target.closest('.glossary-container');
        if (!isGlossaryContainer) {
            closeAllGlossaryTerms();
        }
    });
}

// Inisialisasi smooth scrolling untuk anchor links
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

// Inisialisasi tombol scroll to top
function initializeScrollToTop() {
    window.addEventListener('scroll', function () {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.display = 'flex';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });
    scrollToTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Inisialisasi navigasi aktif berdasarkan scroll
function initializeActiveNavigation() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', function () {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
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

// Menyambungkan semua event listener utama (tombol, pilihan, dan inisialisasi UI)
function initializeEventListeners() {
    if (addCustomerBtn) addCustomerBtn.addEventListener('click', addCustomer);
    if (startSimulationBtn) startSimulationBtn.addEventListener('click', startSimulation);
    if (resetSimulationBtn) resetSimulationBtn.addEventListener('click', resetSimulation);

    workloadButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            workloadButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            if (updateChart) updateChart(this.dataset.workload);
        });
    });

    if (runBenchmarkBtn) runBenchmarkBtn.addEventListener('click', runBenchmark);

    quizOptions.forEach(option => {
        option.addEventListener('click', function () {
            const parent = this.parentElement;
            if (!parent) return;
            parent.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    if (getRecommendationBtn) getRecommendationBtn.addEventListener('click', getRecommendation);

    // Inisialisasi utilitas UI
    initializeSmoothScrolling();
    initializeScrollToTop();
    initializeActiveNavigation();
}

// Sembunyikan loading screen
function hideLoadingScreen() {
    const loader = document.getElementById('loading-screen');
    if (!loader) return;
    if (loadingDotsInterval) {
        clearInterval(loadingDotsInterval);
        loadingDotsInterval = null;
    }
    const txt = loader.querySelector('.loader-text');
    if (txt) txt.textContent = 'Loading';
    loader.classList.add('hide');

    setTimeout(() => {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 500);
}

// Mulai animasi loading
function startLoadingDots() {
    const el = document.querySelector('.loader-text');
    if (!el) return;
    // reset
    loadingDotCount = 0;
    if (loadingDotsInterval) clearInterval(loadingDotsInterval);
    loadingDotsInterval = setInterval(() => {
        loadingDotCount = (loadingDotCount % 3) + 1;
        el.textContent = 'Loading' + '.'.repeat(loadingDotCount);
    }, 500);
}

// DOM siap
document.addEventListener('DOMContentLoaded', function () {
    updateChart = initializeBenchmarkChart();
    initializeGlossary();
    initializeEventListeners();
    updateCustomerCounts();
    updateTimeDisplays();
    hideLoadingScreen();
    console.log('Kelompok 5\nPerbedaan Single-Core vs Multi-core\nAqshal Virgiawan\nDika Pida Ismail\nFauzan Fathurrohman\nHarlan Ikhsan\nJasmine Haimana Wildan\nRafly Al Bukhary\nRidho Muhamad Ilham');
});
startLoadingDots();

// Inisialisasi Swiper untuk team slider dengan coverflow 3D effect
const teamSwiper = new Swiper('.team-swiper', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 3,
    spaceBetween: 30,
    loop: true,
    autoplay: {
        delay: 4000,
        disableOnInteraction: true,
    },
    coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    breakpoints: {
        320: {
            slidesPerView: 1,
            spaceBetween: 10,
            coverflowEffect: {
                rotate: 30,
                depth: 60,
            },
        },
        768: {
            slidesPerView: 2,
            spaceBetween: 20,
            coverflowEffect: {
                rotate: 40,
                depth: 80,
            },
        },
        1024: {
            slidesPerView: 3,
            spaceBetween: 30,
            coverflowEffect: {
                rotate: 50,
                depth: 100,
            },
        },
    }
});
