// Brick Color Palette (Deep Calibration for Shadow Distinction)
const BRICK_PALETTE = [
    { name: '白色 (White)', rgb: [255, 255, 255], hex: '#FFFFFF' },
    { name: '黑色 (Black)', rgb: [0, 0, 0], hex: '#000000' },
    { name: '深海蓝 (Earth Blue)', rgb: [0, 37, 67], hex: '#002543' },
    { name: '深天蓝 (Dark Azure)', rgb: [0, 103, 161], hex: '#0067A1' },
    { name: '蔚蓝色 (Bright Blue)', rgb: [30, 90, 168], hex: '#1E5AA8' },
    { name: '深紫色 (Dark Purple)', rgb: [60, 37, 70], hex: '#3C2546' },
    { name: '浓绿色 (Earth Green)', rgb: [0, 68, 0], hex: '#004400' },
    { name: '深绿色 (Dark Green)', rgb: [0, 94, 39], hex: '#005E27' },
    { name: '浅绿色 (Bright Green)', rgb: [75, 159, 74], hex: '#4B9F4A' },
    { name: '黄色 (Bright Yellow)', rgb: [250, 200, 10], hex: '#FAC80A' },
    { name: '红色 (Bright Red)', rgb: [180, 0, 0], hex: '#B40000' },
    { name: '草绿色 (Lime)', rgb: [187, 233, 11], hex: '#BBE90B' },
    { name: '橄榄绿 (Olive Green)', rgb: [76, 81, 27], hex: '#4C511B' },
    { name: '橙色 (Bright Orange)', rgb: [214, 121, 35], hex: '#D67923' },
    { name: '深褐色 (Dark Brown)', rgb: [53, 33, 0], hex: '#352100' },
    { name: '深灰色 (Dark Stone Gray)', rgb: [100, 100, 100], hex: '#646464' },
    { name: '浅灰色 (Medium Stone Gray)', rgb: [155, 161, 175], hex: '#9BA1AF' },
    { name: '米色 (Tan)', rgb: [214, 181, 133], hex: '#D6B585' },
    { name: '粉色 (Bright Pink)', rgb: [255, 135, 156], hex: '#FF879C' },
    { name: '天蓝色 (Medium Azure)', rgb: [54, 174, 191], hex: '#36AEBF' },
    { name: '沙绿色 (Sand Green)', rgb: [112, 142, 124], hex: '#708E7C' },
    { name: '亮黄色 (Cool Yellow)', rgb: [253, 234, 141], hex: '#FDEA8D' }
];

// App State
const state = {
    originalImage: null,
    resolution: 70,
    brightness: 0,
    contrast: 0,
    style: 'round', // 'round' or 'square'
    isProcessing: false,
    colorStats: {},

    // Painter State
    brushActive: false,
    brushSize: 1,
    selectedColor: BRICK_PALETTE[0],
    brickGrid: [], // 2D array of colors [y][x]
    isDrawing: false
};

// UI Elements
const dropZone = document.getElementById('drop-zone');
const imageInput = document.getElementById('image-input');
const selectBtn = document.getElementById('select-btn');
const resolutionInput = document.getElementById('resolution');
const brightnessInput = document.getElementById('brightness');
const contrastInput = document.getElementById('contrast');
const resValueDisplay = document.getElementById('res-value');
const brightValueDisplay = document.getElementById('bright-value');
const contrastValueDisplay = document.getElementById('contrast-value');
const toggleBtns = document.querySelectorAll('.toggle-btn');
const resetBtn = document.getElementById('reset-btn');
const downloadBtn = document.getElementById('download-btn');
const outputCanvas = document.getElementById('output-canvas');
const emptyState = document.getElementById('empty-state');
const loader = document.getElementById('loader');
const statsContainer = document.getElementById('stats-container');

// Brush UI Elements
const brushToggle = document.getElementById('brush-toggle');
const palettePicker = document.getElementById('palette-picker');
const sizeBtns = document.querySelectorAll('.size-btn');
const brushCursor = document.getElementById('brush-cursor');

// Initialize Palette UI
function initPalette() {
    BRICK_PALETTE.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'palette-swatch';
        swatch.style.backgroundColor = color.hex;
        swatch.title = color.name;
        if (color.hex === state.selectedColor.hex) swatch.classList.add('active');

        swatch.addEventListener('click', () => {
            state.selectedColor = color;
            document.querySelectorAll('.palette-swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
        });
        palettePicker.appendChild(swatch);
    });
}
initPalette();

// Event Listeners
selectBtn.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', handleFileSelect);

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
        processFile(e.dataTransfer.files[0]);
    }
});

resolutionInput.addEventListener('input', (e) => {
    state.resolution = parseInt(e.target.value);
    resValueDisplay.textContent = `${state.resolution} px`;
    if (state.originalImage) debouncedProcess();
});

brightnessInput.addEventListener('input', (e) => {
    state.brightness = parseInt(e.target.value);
    brightValueDisplay.textContent = state.brightness;
    if (state.originalImage) debouncedProcess();
});

contrastInput.addEventListener('input', (e) => {
    state.contrast = parseInt(e.target.value);
    contrastValueDisplay.textContent = state.contrast;
    if (state.originalImage) debouncedProcess();
});

toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.style = btn.dataset.style;
        if (state.originalImage) drawGrid();
    });
});

brushToggle.addEventListener('click', () => {
    state.brushActive = !state.brushActive;
    brushToggle.classList.toggle('active', state.brushActive);
    outputCanvas.classList.toggle('brush-active', state.brushActive);
    if (!state.brushActive) brushCursor.classList.add('hidden');
});

sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.brushSize = parseInt(btn.dataset.size);
    });
});

resetBtn.addEventListener('click', () => {
    state.resolution = 70;
    state.brightness = 0;
    state.contrast = 0;
    state.style = 'round';

    resolutionInput.value = 70;
    brightnessInput.value = 0;
    contrastInput.value = 0;
    resValueDisplay.textContent = '70 px';
    brightValueDisplay.textContent = '0';
    contrastValueDisplay.textContent = '0';
    toggleBtns.forEach(b => {
        b.classList.remove('active');
        if (b.dataset.style === 'round') b.classList.add('active');
    });

    if (state.originalImage) renderBrick();
});

downloadBtn.addEventListener('click', () => {
    if (!state.originalImage) return;
    const link = document.createElement('a');
    link.download = `brick-art-${Date.now()}.png`;
    link.href = outputCanvas.toDataURL('image/png');
    link.click();
});

// Canvas Interactions
outputCanvas.addEventListener('mousedown', (e) => {
    if (!state.brushActive) return;
    state.isDrawing = true;
    handlePaint(e);
});

window.addEventListener('mousemove', (e) => {
    if (state.brushActive) updateBrushCursor(e);
    if (state.isDrawing) handlePaint(e);
});

outputCanvas.addEventListener('mouseenter', () => {
    if (state.brushActive) brushCursor.classList.remove('hidden');
});

outputCanvas.addEventListener('mouseleave', () => {
    brushCursor.classList.add('hidden');
});

function updateBrushCursor(e) {
    const rect = outputCanvas.getBoundingClientRect();
    const isOverCanvas = (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
    );

    if (!isOverCanvas) {
        brushCursor.classList.add('hidden');
        return;
    }

    brushCursor.classList.remove('hidden');

    const scale = 16;
    const canvasScaleX = rect.width / outputCanvas.width;
    const canvasScaleY = rect.height / outputCanvas.height;

    // Size of one brick on screen
    const screenBrickSizeX = scale * canvasScaleX;
    const screenBrickSizeY = scale * canvasScaleY;

    const brushSideBricks = (state.brushSize * 2) - 1;
    const cursorWidth = screenBrickSizeX * brushSideBricks;
    const cursorHeight = screenBrickSizeY * brushSideBricks;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Snap to grid for visual feedback
    const gridX = Math.floor((x / rect.width) * state.brickGrid[0].length);
    const gridY = Math.floor((y / rect.height) * state.brickGrid.length);

    const radius = state.brushSize - 1;
    const left = (gridX - radius) * screenBrickSizeX;
    const top = (gridY - radius) * screenBrickSizeY;

    brushCursor.style.width = `${cursorWidth}px`;
    brushCursor.style.height = `${cursorHeight}px`;
    brushCursor.style.left = `${left + outputCanvas.offsetLeft}px`;
    brushCursor.style.top = `${top + outputCanvas.offsetTop}px`;
}

window.addEventListener('mouseup', () => {
    state.isDrawing = false;
});

function handlePaint(e) {
    const rect = outputCanvas.getBoundingClientRect();
    const scaleX = outputCanvas.width / rect.width;
    const scaleY = outputCanvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const scale = 16;
    const gridX = Math.floor(x / scale);
    const gridY = Math.floor(y / scale);

    const radius = state.brushSize - 1;
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            const tx = gridX + dx;
            const ty = gridY + dy;
            if (state.brickGrid[ty] && state.brickGrid[ty][tx]) {
                state.brickGrid[ty][tx] = state.selectedColor;
            }
        }
    }
    drawGrid();
}

// Processing Logic
function handleFileSelect(e) {
    if (e.target.files.length > 0) {
        processFile(e.target.files[0]);
    }
}

function processFile(file) {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            state.originalImage = img;
            emptyState.classList.add('hidden');
            outputCanvas.style.display = 'block';
            renderBrick();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

let timeout;
function debouncedProcess() {
    clearTimeout(timeout);
    timeout = setTimeout(renderBrick, 150);
}

function renderBrick() {
    if (!state.originalImage || state.isProcessing) return;

    state.isProcessing = true;
    loader.classList.remove('hidden');

    setTimeout(() => {
        const img = state.originalImage;
        const aspect = img.height / img.width;
        const w = state.resolution;
        const h = Math.round(w * aspect);

        const offscreen = document.createElement('canvas');
        offscreen.width = w;
        offscreen.height = h;
        const offCtx = offscreen.getContext('2d');
        offCtx.drawImage(img, 0, 0, w, h);

        const pixels = offCtx.getImageData(0, 0, w, h).data;

        // Build the grid
        state.brickGrid = [];
        for (let y = 0; y < h; y++) {
            const row = [];
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                let r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
                r = clamp(r + state.brightness);
                g = clamp(g + state.brightness);
                b = clamp(b + state.brightness);
                const factor = (259 * (state.contrast + 255)) / (255 * (259 - state.contrast));
                r = clamp(factor * (r - 128) + 128);
                g = clamp(factor * (g - 128) + 128);
                b = clamp(factor * (b - 128) + 128);
                row.push(findNearestColor([r, g, b]));
            }
            state.brickGrid.push(row);
        }

        drawGrid();
        state.isProcessing = false;
        loader.classList.add('hidden');
    }, 10);
}

function drawGrid() {
    const scale = 16;
    const h = state.brickGrid.length;
    const w = h > 0 ? state.brickGrid[0].length : 0;
    if (w === 0) return;

    outputCanvas.width = w * scale;
    outputCanvas.height = h * scale;
    const ctx = outputCanvas.getContext('2d');
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

    state.colorStats = {};

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const brickColor = state.brickGrid[y][x];

            // Stats
            if (!state.colorStats[brickColor.name]) {
                state.colorStats[brickColor.name] = { count: 0, hex: brickColor.hex };
            }
            state.colorStats[brickColor.name].count++;

            const bx = x * scale, by = y * scale;
            ctx.fillStyle = brickColor.hex;
            ctx.fillRect(bx + 1, by + 1, scale - 2, scale - 2);
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(bx + 1, by + 1, scale - 2, scale - 2);
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.strokeRect(bx, by, scale, scale);

            if (state.style === 'round') {
                const radius = scale * 0.35;
                const centerX = bx + scale / 2, centerY = by + scale / 2;
                ctx.beginPath();
                ctx.arc(centerX + 0.5, centerY + 0.5, radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0,0,0,0.2)';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fillStyle = brickColor.hex;
                ctx.fill();
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, -Math.PI / 4, Math.PI + Math.PI / 4, true);
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
    updateStatsUI();
}

function updateStatsUI() {
    statsContainer.innerHTML = '';
    const sortedStats = Object.entries(state.colorStats).sort((a, b) => b[1].count - a[1].count);

    sortedStats.forEach(([name, data]) => {
        const item = document.createElement('div');
        item.className = 'stat-item';
        item.innerHTML = `
            <div class="color-swatch" style="background-color: ${data.hex}"></div>
            <span class="color-name">${name}</span>
            <span class="color-count">${data.count}</span>
        `;
        statsContainer.appendChild(item);
    });
}

function findNearestColor(rgb) {
    let minDistance = Infinity;
    let nearest = BRICK_PALETTE[0];

    for (const color of BRICK_PALETTE) {
        // Redmean color difference (better perceptual accuracy than simple Euclidean)
        const r1 = rgb[0], g1 = rgb[1], b1 = rgb[2];
        const r2 = color.rgb[0], g2 = color.rgb[1], b2 = color.rgb[2];
        const meanR = (r1 + r2) / 2;
        const dR = r1 - r2;
        const dG = g1 - g2;
        const dB = b1 - b2;

        let d = Math.sqrt((2 + meanR / 256) * dR * dR + 4 * dG * dG + (2 + (255 - meanR) / 256) * dB * dB);

        // Black Penalty: Add weight to black to prevent it from swallowing dark chromatic colors
        if (color.name.includes('Black')) {
            d += 35; // Fine-tuned sensitivity
        }

        if (d < minDistance) {
            minDistance = d;
            nearest = color;
        }
    }
    return nearest;
}

function clamp(v) {
    return Math.max(0, Math.min(255, v));
}
