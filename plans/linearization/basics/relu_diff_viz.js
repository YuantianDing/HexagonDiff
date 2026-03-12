// ReLU Difference Bounds Visualization using SciChart.js
// Compares two bounding methods for relu(x) - relu(y)

function relu(x) {
    return Math.max(0, x);
}

function clamp(x, lo, hi) {
    return Math.max(lo, Math.min(hi, x));
}

// relu_ub: upper bound for relu(x) where lb <= x <= ub
// Returns (k, bu, bl) such that: k*x + bl <= relu(x) <= k*x + bu
function relu_ub(lb, ub) {
    if (ub <= 0) {
        // relu is always 0
        return { k: 0, bu: 0, bl: 0 };
    }
    if (lb >= 0) {
        // relu(x) = x
        return { k: 1, bu: 0, bl: 0 };
    }
    // Mixed case: lb < 0 < ub
    const k = ub / (ub - lb);
    const bu = -k * lb;  // Upper bound bias
    const bl = 0;        // Lower bound bias (using k*x + 0 as lower)
    return { k, bu, bl };
}

// Bound1: Independent ReLU bounds for x and y
// kx*x + ky*y + bl <= relu(x) - relu(y) <= kx*x + ky*y + bu
function bound1(lx, ux, ly, uy, ld, ud) {
    const ubx = relu_ub(lx, ux);
    const uby = relu_ub(ly, uy);

    // For relu(x) - relu(y):
    // Upper: use upper bound for relu(x) and lower bound for relu(y)
    // Lower: use lower bound for relu(x) and upper bound for relu(y)
    const kx = ubx.k;
    const ky = -uby.k;
    const bu = ubx.bu - uby.bl;  // max of relu(x) - min of relu(y)
    const bl = ubx.bl - uby.bu;  // min of relu(x) - max of relu(y)

    return { kx, ky, bu, bl };
}

// Bound2: Difference-aware bounds
function bound2(lx, ux, ly, uy, ld, ud) {
    // Fall back to bound1 in simple cases
    if (ly >= 0 || uy <= 0 || ld >= 0 || ud <= 0) {
        return bound1(lx, ux, ly, uy, ld, ud);
    }

    // Special case: use delta (x-y) based bounds
    const lam_delta = clamp(ud / (ud - ld), 0, 1);
    const mu_delta = Math.max(-ld, ud) / 2;
    const nu_delta = lam_delta * relu(-ld);

    return {
        kx: lam_delta,
        ky: -lam_delta,
        bu: nu_delta,
        bl: nu_delta - 2 * mu_delta
    };
}

// Create sliders UI
function createUI(viz) {
    const container = document.getElementById("controls");
    if (!container) return;

    const groups = [
        {
            title: "x bounds",
            params: [
                { name: "lx", label: "lx (lower x)", min: -5, max: 0, step: 0.1 },
                { name: "ux", label: "ux (upper x)", min: 0, max: 5, step: 0.1 },
            ]
        },
        {
            title: "y bounds",
            params: [
                { name: "ly", label: "ly (lower y)", min: -5, max: 0, step: 0.1 },
                { name: "uy", label: "uy (upper y)", min: 0, max: 5, step: 0.1 },
            ]
        },
        {
            title: "x − y bounds",
            params: [
                { name: "ld", label: "ld (lower x−y)", min: -5, max: 0, step: 0.1 },
                { name: "ud", label: "ud (upper x−y)", min: 0, max: 5, step: 0.1 },
            ]
        }
    ];

    const currentParams = viz.getParams();

    groups.forEach((group) => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "slider-group";

        const title = document.createElement("div");
        title.className = "slider-group-title";
        title.textContent = group.title;
        groupDiv.appendChild(title);

        group.params.forEach((param) => {
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
            groupDiv.appendChild(div);
        });

        container.appendChild(groupDiv);
    });
}

// Initialize visualization
async function initVisualization() {
    try {
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

        SciChart.SciChartSurface.UseCommunityLicense();

        const params = {
            lx: -2,
            ux: 2,
            ly: -2,
            uy: 2,
            ld: -1,
            ud: 1,
        };
        const gridSize = 50;

        // Create two surfaces
        const { sciChart3DSurface: surface1, wasmContext: ctx1 } = await SciChart3DSurface.create(
            "scichart-bound1",
            { theme: new SciChartJsNavyTheme() }
        );

        const { sciChart3DSurface: surface2, wasmContext: ctx2 } = await SciChart3DSurface.create(
            "scichart-bound2",
            { theme: new SciChartJsNavyTheme() }
        );

        // Configure cameras
        [surface1, surface2].forEach((surface) => {
            surface.camera.position = new Vector3(300, 200, 300);
            surface.camera.target = new Vector3(0, 0, 0);
        });

        // Create axes for surface 1
        surface1.xAxis = new NumericAxis3D(ctx1, { axisTitle: "x", autoRange: EAutoRange.Always });
        surface1.yAxis = new NumericAxis3D(ctx1, { axisTitle: "f(x,y)", autoRange: EAutoRange.Always });
        surface1.zAxis = new NumericAxis3D(ctx1, { axisTitle: "y", autoRange: EAutoRange.Always });

        // Create axes for surface 2
        surface2.xAxis = new NumericAxis3D(ctx2, { axisTitle: "x", autoRange: EAutoRange.Always });
        surface2.yAxis = new NumericAxis3D(ctx2, { axisTitle: "f(x,y)", autoRange: EAutoRange.Always });
        surface2.zAxis = new NumericAxis3D(ctx2, { axisTitle: "y", autoRange: EAutoRange.Always });

        // Add modifiers
        [surface1, surface2].forEach((surface) => {
            surface.chartModifiers.add(
                new MouseWheelZoomModifier3D(),
                new OrbitModifier3D(),
                new ResetCamera3DModifier()
            );
        });

        // Generate data for the actual function relu(x) - relu(y)
        function generateFunctionData(ctx) {
            const { lx, ux, ly, uy } = params;
            const yValues = [];
            const xStep = (ux - lx) / gridSize;
            const yStep = (uy - ly) / gridSize;

            for (let j = 0; j <= gridSize; j++) {
                const row = [];
                const y = ly + j * yStep;
                for (let i = 0; i <= gridSize; i++) {
                    const x = lx + i * xStep;
                    const val = relu(x) - relu(y);
                    row.push(val);
                }
                yValues.push(row);
            }

            return new UniformGridDataSeries3D(ctx, {
                xStart: lx,
                xStep: xStep,
                zStart: ly,
                zStep: yStep,
                yValues: yValues,
            });
        }

        // Generate upper bound data
        function generateUpperBoundData(ctx, boundFunc) {
            const { lx, ux, ly, uy, ld, ud } = params;
            const bound = boundFunc(lx, ux, ly, uy, ld, ud);
            const yValues = [];
            const xStep = (ux - lx) / gridSize;
            const yStep = (uy - ly) / gridSize;

            for (let j = 0; j <= gridSize; j++) {
                const row = [];
                const y = ly + j * yStep;
                for (let i = 0; i <= gridSize; i++) {
                    const x = lx + i * xStep;
                    const val = bound.kx * x + bound.ky * y + bound.bu;
                    row.push(val);
                }
                yValues.push(row);
            }

            return new UniformGridDataSeries3D(ctx, {
                xStart: lx,
                xStep: xStep,
                zStart: ly,
                zStep: yStep,
                yValues: yValues,
            });
        }

        // Generate lower bound data
        function generateLowerBoundData(ctx, boundFunc) {
            const { lx, ux, ly, uy, ld, ud } = params;
            const bound = boundFunc(lx, ux, ly, uy, ld, ud);
            const yValues = [];
            const xStep = (ux - lx) / gridSize;
            const yStep = (uy - ly) / gridSize;

            for (let j = 0; j <= gridSize; j++) {
                const row = [];
                const y = ly + j * yStep;
                for (let i = 0; i <= gridSize; i++) {
                    const x = lx + i * xStep;
                    const val = bound.kx * x + bound.ky * y + bound.bl;
                    row.push(val);
                }
                yValues.push(row);
            }

            return new UniformGridDataSeries3D(ctx, {
                xStart: lx,
                xStep: xStep,
                zStart: ly,
                zStep: yStep,
                yValues: yValues,
            });
        }

        // Create color palettes
        function createPalettes(ctx) {
            const funcPalette = new GradientColorPalette(ctx, {
                gradientStops: [{ offset: 0.5, color: "#1E90FF" }],
            });
            const ubPalette = new GradientColorPalette(ctx, {
                gradientStops: [{ offset: 0.5, color: "#FF6B6B" }],
            });
            const lbPalette = new GradientColorPalette(ctx, {
                gradientStops: [{ offset: 0.5, color: "#4CAF50" }],
            });
            return { funcPalette, ubPalette, lbPalette };
        }

        function createSurfaces() {
            // Clear existing series
            surface1.renderableSeries.clear();
            surface2.renderableSeries.clear();

            // Bound 1 chart
            const palettes1 = createPalettes(ctx1);
            const funcData1 = generateFunctionData(ctx1);
            const ubData1 = generateUpperBoundData(ctx1, bound1);
            const lbData1 = generateLowerBoundData(ctx1, bound1);

            surface1.renderableSeries.add(
                new SurfaceMeshRenderableSeries3D(ctx1, {
                    dataSeries: funcData1,
                    drawMeshAs: EDrawMeshAs.WireFrame,
                    meshColorPalette: palettes1.funcPalette,
                    opacity: 0.9,
                    drawSkirt: false,
                }),
                new SurfaceMeshRenderableSeries3D(ctx1, {
                    dataSeries: ubData1,
                    drawMeshAs: EDrawMeshAs.WireFrame,
                    meshColorPalette: palettes1.ubPalette,
                    opacity: 0.9,
                    drawSkirt: false,
                }),
                new SurfaceMeshRenderableSeries3D(ctx1, {
                    dataSeries: lbData1,
                    drawMeshAs: EDrawMeshAs.WireFrame,
                    meshColorPalette: palettes1.lbPalette,
                    opacity: 0.9,
                    drawSkirt: false,
                })
            );

            // Bound 2 chart
            const palettes2 = createPalettes(ctx2);
            const funcData2 = generateFunctionData(ctx2);
            const ubData2 = generateUpperBoundData(ctx2, bound2);
            const lbData2 = generateLowerBoundData(ctx2, bound2);

            surface2.renderableSeries.add(
                new SurfaceMeshRenderableSeries3D(ctx2, {
                    dataSeries: funcData2,
                    drawMeshAs: EDrawMeshAs.WireFrame,
                    meshColorPalette: palettes2.funcPalette,
                    opacity: 0.9,
                    drawSkirt: false,
                }),
                new SurfaceMeshRenderableSeries3D(ctx2, {
                    dataSeries: ubData2,
                    drawMeshAs: EDrawMeshAs.WireFrame,
                    meshColorPalette: palettes2.ubPalette,
                    opacity: 0.9,
                    drawSkirt: false,
                }),
                new SurfaceMeshRenderableSeries3D(ctx2, {
                    dataSeries: lbData2,
                    drawMeshAs: EDrawMeshAs.WireFrame,
                    meshColorPalette: palettes2.lbPalette,
                    opacity: 0.9,
                    drawSkirt: false,
                })
            );
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
                <div class="legend-item"><span class="legend-color" style="background: #1E90FF;"></span> relu(x) − relu(y)</div>
                <div class="legend-item"><span class="legend-color" style="background: #FF6B6B;"></span> Upper Bound</div>
                <div class="legend-item"><span class="legend-color" style="background: #4CAF50;"></span> Lower Bound</div>
            `;
        }

    } catch (error) {
        console.error("Error initializing visualization:", error);
        const containers = document.querySelectorAll(".scichart-container");
        containers.forEach((c) => {
            c.innerHTML = `<p style="color: red; padding: 20px;">Error: ${error.message}</p>`;
        });
    }
}

// Export for use in HTML
if (typeof window !== "undefined") {
    window.initReluDiffVisualization = initVisualization;
}
