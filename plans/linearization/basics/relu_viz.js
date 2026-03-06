// ReLU Difference Visualization using SciChart.js
// Visualizes relu(βx + d) - α relu(x) with upper and lower bounds

// Helper functions from relu.md
function relu(x) {
    return Math.max(0, x);
}

function clip(x, lo, hi) {
    return Math.max(lo, Math.min(hi, x));
}

function relu_lb(lb, ub) {
    const center = (lb + ub) / 2;
    if (center <= 0) {
        return [0, 0];
    } else {
        return [1, 0];
    }
}

function relu_ub(lb, ub) {
    if (ub <= lb) return [0, 0];
    const k = ub / (ub - lb);
    const b = -k * lb;
    return [k, b];
}

function relu_diff_ub0(lx, ux, ld, ud) {
    const x = clip(0, lx, ux);
    if (ud <= ld) return [0, 0];
    const k = (relu(x + ud) - relu(x + ld)) / (ud - ld);
    const b = relu(x + ud) - relu(x) - k * ud;
    return [k, b];
}

function relu_diff_ub(lx, ux, ld, ud, alpha, beta) {
    const [k1, b1] = relu_diff_ub0(beta * lx, beta * ux, ld, ud);
    let [k2_raw, b2] = relu_ub(lx, ux);
    if (beta < alpha) {
        [k2_raw, b2] = relu_lb(lx, ux);
    }
    const k2 = (beta - alpha) * k2_raw;
    const b2_scaled = (beta - alpha) * b2; 
    return [k2, k1, b1 + b2_scaled];
}

// 0 = x + y
// z = a2 x
// zp = a2 xp + b2 yp + c2 + k(a1 xp + b1 yp + c1)
function plane_with_line(a, b, c, xp, yp, zp) {
        const k = (zp - c - a * xp - b * yp) / (a * xp + b * yp + c);

}

function point2line(x1, y1, x2, y2) {
    const k = (y2 - y1) / (x2 - x1);
    const b = y1 - k * x1;
    return [k, b];
}


function relu_diff_lb0(lx, ux, d, alpha) {
    // relu(x + d) - 𝛼 relu(x) 
    const fux = relu(ux + d) - alpha * relu(ux);
    const flx = relu(lx + d) - alpha * relu(lx);
    const lowk = (fux - flx) / (ux - lx);
    const lowb = flx - lowk * lx;
    if (lowb + lowk * (-d) <= - alpha * relu(-d)) {
        return [lowk, lowb];
    }
    const x0 = (lx + ux) / 2;
    if (d >= 0 && x0 >= -d) {
        const p = Math.max(lx, -d);
        return point2line(p, relu(p + d) - alpha * relu(p), ux, relu(ux + d) - alpha * relu(ux));
    } else if (d >= 0 && x0 <= -d) {
        return [0, 0];
    } else if (d <= 0 && x0 <= -d) {
        const p = Math.min(ux, -d);
        return point2line(p, relu(p + d) - alpha * relu(p), lx, relu(lx + d) - alpha * relu(lx));
    } else if (d <= 0 && x0 >= -d) {
        return [1 - alpha, d];
    }
}

function relu_diff_lb(lx, ux, ld, ud, alpha, beta) {
    lx = lx * beta;
    ux = ux * beta;
    alpha /= beta;

    const upoint = Math.min(-lx, ud);
    const lpoint = Math.max(-ux, ld);
    const k = (relu(-lpoint) - relu(-upoint)) / (upoint - lpoint);
    const b = - k * upoint;
    const x0 = (lx + ux) / 2;
    const d0 = (ld + ud) / 2;
    if (x0 + d0 >= 0) {
        // relu(x + d) - relu(x) ≥ relu(x + ud) + (d - ud) - 𝛼 relu(x)
        const [k, b] = relu_diff_lb0(lx, ux, ud, alpha);
        return [k * beta, 1, b - ud];
    } else {
        // relu(x + d) - relu(x) ≥ relu(x + ld) - 𝛼 relu(x)
        const [k, b] = relu_diff_lb0(lx, ux, ld, alpha);
        return [k * beta, 0, b];
    }
}

// Create UI with sliders
function createUI(viz) {
    const container = document.getElementById("controls");
    if (!container) return;

    const params = [
        { name: "lx", label: "lx (lower x)", min: -5, max: 0, step: 0.1 },
        { name: "ux", label: "ux (upper x)", min: 0, max: 5, step: 0.1 },
        { name: "ld", label: "ld (lower d)", min: -5, max: 0, step: 0.1 },
        { name: "ud", label: "ud (upper d)", min: 0, max: 5, step: 0.1 },
        { name: "alpha", label: "α (alpha)", min: 0, max: 2, step: 0.05 },
        { name: "beta", label: "β (beta)", min: 0, max: 2, step: 0.05 },
    ];

    const currentParams = viz.getParams();

    params.forEach((param) => {
        const div = document.createElement("div");
        div.className = "slider-container";

        const label = document.createElement("label");
        label.textContent = `${param.label}: `;
        label.htmlFor = param.name;

        const valueSpan = document.createElement("span");
        valueSpan.id = `${param.name}-value`;
        valueSpan.textContent = currentParams[param.name].toFixed(2);

        const slider = document.createElement("input");
        slider.type = "range";
        slider.id = param.name;
        slider.min = param.min;
        slider.max = param.max;
        slider.step = param.step;
        slider.value = currentParams[param.name];

        slider.addEventListener("input", (e) => {
            viz.updateParam(param.name, e.target.value);
            valueSpan.textContent = parseFloat(e.target.value).toFixed(2);
        });

        div.appendChild(label);
        div.appendChild(slider);
        div.appendChild(valueSpan);
        container.appendChild(div);
    });
}

// Initialize visualization when DOM is ready
async function initVisualization() {
    try {
        // Get SciChart components after library is loaded
        const {
            SciChart3DSurface,
            NumericAxis3D,
            Vector3,
            SciChartJsNavyTheme,
            EDrawMeshAs,
            GradientColorPalette,
            SurfaceMeshRenderableSeries3D,
            UniformGridDataSeries3D,
            MouseWheelZoomModifier3D,
            OrbitModifier3D,
            ResetCamera3DModifier,
            EAutoRange,
        } = SciChart;

        // Use community license for demo
        SciChart.SciChartSurface.UseCommunityLicense();

        const params = {
            lx: -2,
            ux: 2,
            ld: -1,
            ud: 1,
            alpha: 0.5,
            beta: 1.0
        };
        const gridSize = 50;

        // Initialize SciChart
        const { sciChart3DSurface, wasmContext } = await SciChart3DSurface.create(
            "scichart-container",
            {
                theme: new SciChartJsNavyTheme(),
            }
        );

        // Configure camera
        sciChart3DSurface.camera.position = new Vector3(300, 200, 300);
        sciChart3DSurface.camera.target = new Vector3(0, 0, 0);

        // Create axes
        sciChart3DSurface.xAxis = new NumericAxis3D(wasmContext, {
            axisTitle: "x",
            autoRange: EAutoRange.Always,
        });
        sciChart3DSurface.yAxis = new NumericAxis3D(wasmContext, {
            axisTitle: "f(x,d)",
            autoRange: EAutoRange.Always,
        });
        sciChart3DSurface.zAxis = new NumericAxis3D(wasmContext, {
            axisTitle: "d",
            autoRange: EAutoRange.Always,
        });

        // Add modifiers for interactivity
        sciChart3DSurface.chartModifiers.add(
            new MouseWheelZoomModifier3D(),
            new OrbitModifier3D(),
            new ResetCamera3DModifier()
        );

        function generateFunctionData() {
            const { lx, ux, ld, ud, alpha, beta } = params;
            const yValues = [];
            const xStep = (ux - lx) / gridSize;
            const dStep = (ud - ld) / gridSize;

            for (let j = 0; j <= gridSize; j++) {
                const row = [];
                const d = ld + j * dStep;
                for (let i = 0; i <= gridSize; i++) {
                    const x = lx + i * xStep;
                    const y = relu(beta * x + d) - alpha * relu(x);
                    row.push(y);
                }
                yValues.push(row);
            }

            return new UniformGridDataSeries3D(wasmContext, {
                xStart: lx,
                xStep: xStep,
                zStart: ld,
                zStep: dStep,
                yValues: yValues,
            });
        }

        function generateUpperBoundData() {
            const { lx, ux, ld, ud, alpha, beta } = params;
            const yValues = [];
            const xStep = (ux - lx) / gridSize;
            const dStep = (ud - ld) / gridSize;
            const [k2, k1, b] = relu_diff_ub(lx, ux, ld, ud, alpha, beta);

            for (let j = 0; j <= gridSize; j++) {
                const row = [];
                const d = ld + j * dStep;
                for (let i = 0; i <= gridSize; i++) {
                    const x = lx + i * xStep;
                    const y = k2 * x + k1 * d + b;
                    row.push(y);
                }
                yValues.push(row);
            }

            return new UniformGridDataSeries3D(wasmContext, {
                xStart: lx,
                xStep: xStep,
                zStart: ld,
                zStep: dStep,
                yValues: yValues,
            });
        }

        function generateLowerBoundData() {
            const { lx, ux, ld, ud, alpha, beta } = params;
            const yValues = [];
            const xStep = (ux - lx) / gridSize;
            const dStep = (ud - ld) / gridSize;
            const [k2, k1, b] = relu_diff_lb(lx, ux, ld, ud, alpha, beta);

            for (let j = 0; j <= gridSize; j++) {
                const row = [];
                const d = ld + j * dStep;
                for (let i = 0; i <= gridSize; i++) {
                    const x = lx + i * xStep;
                    const y = k2 * x + k1 * d + b;
                    row.push(y);
                }
                yValues.push(row);
            }

            return new UniformGridDataSeries3D(wasmContext, {
                xStart: lx,
                xStep: xStep,
                zStart: ld,
                zStep: dStep,
                yValues: yValues,
            });
        }

        function createSurfaces() {
            sciChart3DSurface.renderableSeries.clear();

            const funcData = generateFunctionData();
            const ubData = generateUpperBoundData();
            const lbData = generateLowerBoundData();

            const funcPalette = new GradientColorPalette(wasmContext, {
                gradientStops: [
                    { offset: 0.5, color: "#1E90FF" }
                    // { offset: 0.5, color: "#87CEEB" },
                    // { offset: 1, color: "#00CED1" }
                ],
            });

            const ubPalette = new GradientColorPalette(wasmContext, {
                gradientStops: [
                    { offset: 0.5, color: "#FF6B6B" }
                    // { offset: 1, color: "#FF8E8E" }
                ],
            });

            const lbPalette = new GradientColorPalette(wasmContext, {
                gradientStops: [
                    { offset: 0.5, color: "#4CAF50" }
                    // { offset: 1, color: "#81C784" }
                ],
            });

            const funcSeries = new SurfaceMeshRenderableSeries3D(wasmContext, {
                dataSeries: funcData,
                drawMeshAs: EDrawMeshAs.WireFrame,
                meshColorPalette: funcPalette,
                opacity: 0.9,
                drawSkirt: false,
            });

            const ubSeries = new SurfaceMeshRenderableSeries3D(wasmContext, {
                dataSeries: ubData,
                drawMeshAs: EDrawMeshAs.WireFrame,
                meshColorPalette: ubPalette,
                opacity: 0.9,
                drawSkirt: false,
            });

            const lbSeries = new SurfaceMeshRenderableSeries3D(wasmContext, {
                dataSeries: lbData,
                drawMeshAs: EDrawMeshAs.WireFrame,
                meshColorPalette: lbPalette,
                opacity: 0.9,
                drawSkirt: false,
            });

            sciChart3DSurface.renderableSeries.add(funcSeries, ubSeries, lbSeries);
        }

        createSurfaces();

        // Create viz object for UI
        const viz = {
            updateParam(name, value) {
                params[name] = parseFloat(value);
                createSurfaces();
            },
            getParams() {
                return params;
            }
        };

        createUI(viz);

        // Add legend
        const legend = document.getElementById("legend");
        if (legend) {
            legend.innerHTML = `
                <h2>Legend</h2>
                <div class="legend-item"><span class="legend-color" style="background: linear-gradient(90deg, #1E90FF, #00CED1);"></span> relu(βx + d) - α relu(x)</div>
                <div class="legend-item"><span class="legend-color" style="background: #FF6B6B;"></span> Upper Bound</div>
                <div class="legend-item"><span class="legend-color" style="background: #4CAF50;"></span> Lower Bound</div>
            `;
        }
    } catch (error) {
        console.error("Error initializing visualization:", error);
        document.getElementById("scichart-container").innerHTML =
            `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

// Export for use in HTML
if (typeof window !== "undefined") {
    window.initReluVisualization = initVisualization;
}
