/**
 * Interactive visualization for relu_diff_ub bounds.
 * Visualizes the upper bound of: x, d -> relu(βx + d) - α*relu(x)
 * over the region lx ≤ x ≤ ux, ld ≤ d ≤ ud
 */

// ReLU function
function relu(x) {
    return Math.max(0, x);
}

// Upper bound of d -> relu(x + d) - relu(x)
function relu_diff_ub1(lx, ux, d) {
    const x = Math.max(lx, Math.min(0, ux));
    const denom = 2 * d + 1e-10;
    const k = (relu(x + d) - relu(x - d)) / denom;
    const b = relu(x + d) - relu(x) - k * d;
    return [k, b];
}

// Upper bound of x -> relu(βx + d) - α*relu(x)
function relu_diff_ub2(lx, ux, d, alpha, beta) {
    const fux = relu(beta * ux + d) - alpha * relu(ux)
    const flx = relu(beta * lx + d) - alpha * relu(lx)
    const highk = (fux - flx) / (ux - lx)
    const highb = fux - highk * ux
    if(highb >= Math.max(0, d)) {
        return [highk, highb];
    }

    const x0 = (ux + lx) / 2;
    if (d >= 0 && x0 >= 0) {
        return [beta - alpha, d];
    } else if (d >= 0 && x0 <= 0) {
        const p = Math.min(0, ux);
        const denom = (p !== lx) ? (p - lx) : 1e-10;
        const k = relu(beta * p + d) / denom;
        const b = relu(beta * p + d) - k * p;
        return [k, b];
    } else if (d <= 0 && x0 >= 0) {
        const p = Math.max(0, lx);
        const denom = (ux !== p) ? (ux - p) : 1e-10;
        const k = (relu(beta * ux + d) - relu(beta * p + d)) / denom;
        const b = relu(beta * ux + d) - k * ux;
        return [k - alpha, b];
    } else {
        return [0, 0];
    }
}

// Upper bound of x, d -> relu(βx + d) - α*relu(x)
function relu_diff_ub(lx, ux, ld, ud, alpha, beta) {
    const dc = (ld + ud) / 2;
    let [k1, b1] = relu_diff_ub1(beta * lx + dc, beta * ux + dc, ud - dc);
    b1 = b1 - k1 * dc;
    const [k2, b2] = relu_diff_ub2(lx, ux, dc, alpha, beta);
    return [k2, k1, b1 + b2];
}

// Generate meshgrid
function meshgrid(xArr, yArr) {
    const X = [];
    const Y = [];
    for (let j = 0; j < yArr.length; j++) {
        const xRow = [];
        const yRow = [];
        for (let i = 0; i < xArr.length; i++) {
            xRow.push(xArr[i]);
            yRow.push(yArr[j]);
        }
        X.push(xRow);
        Y.push(yRow);
    }
    return [X, Y];
}

// Generate linspace
function linspace(start, end, n) {
    const arr = [];
    const step = (end - start) / (n - 1);
    for (let i = 0; i < n; i++) {
        arr.push(start + i * step);
    }
    return arr;
}

// Compute surfaces for given parameters
function computeSurfaces(lx, ux, ld, ud, alpha, beta, resolution = 40) {
    const xArr = linspace(lx, ux, resolution);
    const dArr = linspace(ld, ud, resolution);
    const [X, D] = meshgrid(xArr, dArr);

    // Actual function: relu(βx + d) - α*relu(x)
    const Z_actual = [];
    for (let j = 0; j < dArr.length; j++) {
        const row = [];
        for (let i = 0; i < xArr.length; i++) {
            const x = X[j][i];
            const d = D[j][i];
            row.push(relu(beta * x + d) - alpha * relu(x));
        }
        Z_actual.push(row);
    }

    // Upper bound plane
    const [kx, kd, b] = relu_diff_ub(lx, ux, ld, ud, alpha, beta);
    const Z_bound = [];
    for (let j = 0; j < dArr.length; j++) {
        const row = [];
        for (let i = 0; i < xArr.length; i++) {
            const x = X[j][i];
            const d = D[j][i];
            row.push(kx * x + kd * d + b);
        }
        Z_bound.push(row);
    }

    return { X, D, Z_actual, Z_bound, kx, kd, b };
}

// Initialize visualization
function initVisualization(containerId) {
    const container = document.getElementById(containerId);

    // Create layout
    container.innerHTML = `
        <div id="plot" style="width: 100%; height: 600px;"></div>
        <div id="controls" style="padding: 20px; background: #f5f5f5; border-radius: 8px; margin-top: 10px;">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                <div>
                    <label><b>lx:</b> <span id="lx-val">-2.0</span></label>
                    <input type="range" id="lx" min="-4" max="0" step="0.5" value="-2" style="width: 100%;">
                </div>
                <div>
                    <label><b>ux:</b> <span id="ux-val">2.0</span></label>
                    <input type="range" id="ux" min="0.5" max="4" step="0.5" value="2" style="width: 100%;">
                </div>
                <div>
                    <label><b>ld:</b> <span id="ld-val">-1.0</span></label>
                    <input type="range" id="ld" min="-3" max="0" step="0.5" value="-1" style="width: 100%;">
                </div>
                <div>
                    <label><b>ud:</b> <span id="ud-val">1.0</span></label>
                    <input type="range" id="ud" min="0.5" max="3" step="0.5" value="1" style="width: 100%;">
                </div>
                <div>
                    <label><b>α:</b> <span id="alpha-val">0.50</span></label>
                    <input type="range" id="alpha" min="0" max="1" step="0.05" value="0.5" style="width: 100%;">
                </div>
                <div>
                    <label><b>β:</b> <span id="beta-val">1.00</span></label>
                    <input type="range" id="beta" min="0.25" max="2" step="0.05" value="1" style="width: 100%;">
                </div>
            </div>
            <div style="margin-top: 15px; text-align: center; color: #666;">
                <b>Blue surface:</b> relu(βx + d) - α·relu(x) &nbsp;|&nbsp;
                <b>Red surface:</b> Linear upper bound (k<sub>x</sub>·x + k<sub>d</sub>·d + b)
            </div>
            <div id="bound-info" style="margin-top: 10px; text-align: center; font-family: monospace;"></div>
        </div>
    `;

    // Get slider elements
    const sliders = {
        lx: document.getElementById('lx'),
        ux: document.getElementById('ux'),
        ld: document.getElementById('ld'),
        ud: document.getElementById('ud'),
        alpha: document.getElementById('alpha'),
        beta: document.getElementById('beta')
    };

    const valDisplays = {
        lx: document.getElementById('lx-val'),
        ux: document.getElementById('ux-val'),
        ld: document.getElementById('ld-val'),
        ud: document.getElementById('ud-val'),
        alpha: document.getElementById('alpha-val'),
        beta: document.getElementById('beta-val')
    };

    const boundInfo = document.getElementById('bound-info');

    // Get current parameter values
    function getParams() {
        return {
            lx: parseFloat(sliders.lx.value),
            ux: parseFloat(sliders.ux.value),
            ld: parseFloat(sliders.ld.value),
            ud: parseFloat(sliders.ud.value),
            alpha: parseFloat(sliders.alpha.value),
            beta: parseFloat(sliders.beta.value)
        };
    }

    // Update plot
    function updatePlot() {
        const p = getParams();

        // Update value displays
        valDisplays.lx.textContent = p.lx.toFixed(1);
        valDisplays.ux.textContent = p.ux.toFixed(1);
        valDisplays.ld.textContent = p.ld.toFixed(1);
        valDisplays.ud.textContent = p.ud.toFixed(1);
        valDisplays.alpha.textContent = p.alpha.toFixed(2);
        valDisplays.beta.textContent = p.beta.toFixed(2);

        // Validate bounds
        if (p.lx >= p.ux || p.ld >= p.ud) {
            boundInfo.innerHTML = '<span style="color: red;">Invalid bounds: lx must be < ux and ld must be < ud</span>';
            return;
        }

        // Compute surfaces
        const { X, D, Z_actual, Z_bound, kx, kd, b } = computeSurfaces(
            p.lx, p.ux, p.ld, p.ud, p.alpha, p.beta
        );

        // Update bound info
        boundInfo.innerHTML = `Upper bound: <b>${kx.toFixed(3)}</b>·x + <b>${kd.toFixed(3)}</b>·d + <b>${b.toFixed(3)}</b>`;

        // Update plot data
        Plotly.react('plot', [
            {
                type: 'surface',
                x: X,
                y: D,
                z: Z_actual,
                colorscale: 'Viridis',
                opacity: 0.9,
                showscale: true,
                colorbar: { title: 'Value', x: 1.02, len: 0.5, y: 0.7 },
                name: 'Actual',
                hovertemplate: 'x: %{x:.2f}<br>d: %{y:.2f}<br>f: %{z:.3f}<extra>Actual</extra>'
            },
            {
                type: 'surface',
                x: X,
                y: D,
                z: Z_bound,
                colorscale: 'Reds',
                opacity: 0.5,
                showscale: false,
                name: 'Upper Bound',
                hovertemplate: 'x: %{x:.2f}<br>d: %{y:.2f}<br>bound: %{z:.3f}<extra>Upper Bound</extra>'
            }
        ], {
            title: {
                text: `relu(βx + d) - α·relu(x) Upper Bound<br>` +
                      `<sub>x∈[${p.lx.toFixed(1)}, ${p.ux.toFixed(1)}], d∈[${p.ld.toFixed(1)}, ${p.ud.toFixed(1)}], ` +
                      `α=${p.alpha.toFixed(2)}, β=${p.beta.toFixed(2)}</sub>`,
                font: { size: 16 }
            },
            scene: {
                xaxis: { title: 'x' },
                yaxis: { title: 'd' },
                zaxis: { title: 'f(x, d)' },
                camera: { eye: { x: 1.5, y: 1.5, z: 1.0 } },
                aspectmode: 'cube'
            },
            margin: { l: 0, r: 0, t: 60, b: 0 }
        }, {
            responsive: true
        });
    }

    // Attach event listeners to all sliders
    Object.values(sliders).forEach(slider => {
        slider.addEventListener('input', updatePlot);
    });

    // Initial plot
    updatePlot();
}

// Auto-initialize if DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('relu-vis')) {
                initVisualization('relu-vis');
            }
        });
    } else {
        if (document.getElementById('relu-vis')) {
            initVisualization('relu-vis');
        }
    }
}
