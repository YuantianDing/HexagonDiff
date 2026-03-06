// Exp Difference Visualization using SciChart.js
// Visualizes exp(βx + d) - α exp(x) with upper and lower bounds

// Helper functions from exp.md
function clip(x, lo, hi) {
    return Math.max(lo, Math.min(hi, x));
}

function exp_lb(lb, ub) {
    const center = (lb + ub) / 2;
    const expCenter = Math.exp(center);
    return [expCenter, expCenter * (1 - center)];
}

function exp_ub(lb, ub) {
    if (ub <= lb) return [0, 0];
    const k = (Math.exp(ub) - Math.exp(lb)) / (ub - lb);
    const b = Math.exp(lb) - k * lb;
    return [k, b];
}

function exp_diff_ub0(lx, ux, ld, ud) {
    const x = clip(0, lx, ux);
    if (ud <= ld) return [0, 0];
    const k = (Math.exp(x + ud) - Math.exp(x + ld)) / (ud - ld);
    const b = Math.exp(x + ud) - Math.exp(x) - k * ud;
    return [k, b];
}



function exp_diff_ub(lx, ux, ld, ud, alpha, beta) {
    const fudux = Math.exp(beta * ux + ud) - alpha * Math.exp(ux);
    const fudlx = Math.exp(beta * lx + ud) - alpha * Math.exp(lx);
    const fldlx = Math.exp(beta * lx + ld) - alpha * Math.exp(lx);
    const k1 = (fudux - fudlx) / (ux - lx);
    const k2 = (fudlx - fldlx) / (ud - ld);
    const b = fudlx - k1 * lx - k2 * ud;
    return [k1, k2, b];
}

function point2line(x1, y1, x2, y2) {
    if (x2 === x1) return [0, y1];
    const k = (y2 - y1) / (x2 - x1);
    const b = y1 - k * x1;
    return [k, b];
}

// Lower bound for exp(βx + d) - α exp(x) (fixed d)
function exp_diff_lb0(lx, ux, d, alpha, beta) {
    // exp(βx + d) - α exp(x) = exp(x) (exp((β-1)x + d) - α)
    const fux = Math.exp(beta * ux + d) - alpha * Math.exp(ux);
    const x0 = (lx + ux) / 2;
    const fx0 = Math.exp(beta * x0 + d) - alpha * Math.exp(x0);
    const dfx0 = beta * Math.exp(beta * x0 + d) - alpha * Math.exp(x0);
    if(dfx0 * (ux - x0) + fx0 <= fux) {
        return [dfx0, fx0 - dfx0 * x0];
    }

    const flx = Math.exp(beta * lx + d) - alpha * Math.exp(lx);
    const dflx = beta * Math.exp(beta * lx + d) - alpha * Math.exp(lx);
    if(dflx * (ux - lx) + flx <= fux) {
        return [dflx, flx - dflx * lx];
    }

    return point2line(lx, flx, ux, fux);
}

// Lower bound for exp(βx + d) - α exp(x)
function exp_diff_lb(lx, ux, ld, ud, alpha, beta) {
    const x0 = (lx + ux) / 2;
    const d0 = (ld + ud) / 2;
    // exp(βx + d) - α exp(x) ≥ exp(βx + d) - exp(βx + d0) + exp(βx + d0) - α exp(x)
    if (x0 * beta + d0 >= 0) {
        
    } else {
        
    }
}

// Create UI with sliders
function createUI(viz) {
    const container = document.getElementById("controls");
    if (!container) return;

    const params = [
        { name: "lx", label: "lx (lower x)", min: -3, max: 0, step: 0.1 },
        { name: "ux", label: "ux (upper x)", min: 0, max: 3, step: 0.1 },
        { name: "ld", label: "ld (lower d)", min: -2, max: 0, step: 0.1 },
        { name: "ud", label: "ud (upper d)", min: 0, max: 2, step: 0.1 },
        { name: "alpha", label: "α (alpha)", min: 0, max: 3, step: 0.05 },
        { name: "beta", label: "β (beta)", min: 0.1, max: 2, step: 0.05 },
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
            lx: -1.5,
            ux: 1.5,
            ld: -0.5,
            ud: 0.5,
            alpha: 1.0,
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
                    const y = Math.exp(beta * x + d) - alpha * Math.exp(x);
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
            const [k2, k1, b] = exp_diff_ub(lx, ux, ld, ud, alpha, beta);

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
            const [k2, k1, b] = exp_diff_lb(lx, ux, ld, ud, alpha, beta);

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
                ],
            });

            const ubPalette = new GradientColorPalette(wasmContext, {
                gradientStops: [
                    { offset: 0.5, color: "#FF6B6B" }
                ],
            });

            const lbPalette = new GradientColorPalette(wasmContext, {
                gradientStops: [
                    { offset: 0.5, color: "#4CAF50" }
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
                <div class="legend-item"><span class="legend-color" style="background: linear-gradient(90deg, #1E90FF, #00CED1);"></span> exp(βx + d) - α exp(x)</div>
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
    window.initExpVisualization = initVisualization;
}
