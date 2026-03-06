

# Linearization of ReLU

## Linearization of ReLU(x)

```py
def relu_lb(lb, ub):
    center = (lb + ub) / 2
    if center <= 0:
        return (0, 0)
    elif center >= 0:
        return (1, 0)

def relu_ub(lb, ub):
    k = (relu(ub) - relu(lb)) / (ub - lb)
    b = relu(lb) - k * lb
    return (k, b)
```

## Selecting $\alpha$

```py
def relu_alpha(lx, ux, ly, uy, ld, ud):
    return (relu(uy) - relu(ly)) / (relu(ux) - relu(lx))
```

## Linearization of ReLU(y) - 𝛼 ReLU(x)

We only consider the area of `lx ≤ x ≤ ux, ld ≤ y - 𝛽 x ≤ ud`, we have the following formulas for the upper and lower bounds of $\mathrm{relu}(y) - 𝛼~ \mathrm{relu}(x)$:

```py
def relu_diff_ub0(lx, ux, ld, ud):
    x = clip(0, lx, ux)
    k = (relu(x + ud) - relu(x + ld)) / (ud - ld)
    b = relu(x + ud) - relu(x) - k * ud
    return (k, b)

# Upper bound for `relu(𝛽x + d) - 𝛼 relu(x)`
def relu_diff_ub(lx, ux, ld, ud, 𝛼, 𝛽):
    k1, b1 = relu_diff_ub0(𝛽 lx, 𝛽 ux, ld, ud)
    if 𝛽 ≥ 𝛼:
        k2, b2 = (𝛽 - 𝛼) relu_ub(lx, ux)
    else:
        k2, b2 = (𝛽 - 𝛼) relu_lb(lx, ux)
    return k2, k1, b1 + b2

def point2line(x1, y1, x2, y2):
    k = (y2 - y1) / (x2 - x1)
    b = y1 - k * x1
    return (k, b)

# Lower bound for `relu(x + d) - 𝛼 relu(x)` (fixed d)
def relu_diff_lb0(lx, ux, d, 𝛼):
    fux = relu(ux + d) - 𝛼 * relu(ux)
    flx = relu(lx + d) - 𝛼 * relu(lx)
    lowk = (fux - flx) / (ux - lx)
    lowb = flx - lowk * lx
    if lowb + lowk * (-d) <= -𝛼 * relu(-d):
        return (lowk, lowb)
    x0 = (lx + ux) / 2
    if d >= 0 and x0 >= -d:
        p = max(lx, -d)
        return point2line(p, relu(p + d) - 𝛼 * relu(p), ux, relu(ux + d) - 𝛼 * relu(ux))
    elif d >= 0 and x0 <= -d:
        return (0, 0)
    elif d <= 0 and x0 <= -d:
        p = min(ux, -d)
        return point2line(p, relu(p + d) - 𝛼 * relu(p), lx, relu(lx + d) - 𝛼 * relu(lx))
    elif d <= 0 and x0 >= -d:
        return (1 - 𝛼, d)

# Lower bound for `relu(𝛽x + d) - 𝛼 relu(x)`
def relu_diff_lb(lx, ux, ld, ud, 𝛼, 𝛽):
    lx = lx * 𝛽
    ux = ux * 𝛽
    𝛼 = 𝛼 / 𝛽
    x0 = (lx + ux) / 2
    d0 = (ld + ud) / 2
    if x0 + d0 >= 0:
        # relu(x + d) - 𝛼 relu(x) ≥ relu(x + ud) + (d - ud) - 𝛼 relu(x)
        k, b = relu_diff_lb0(lx, ux, ud, 𝛼)
        return (k * 𝛽, 1, b - ud)
    else:
        # relu(x + d) - 𝛼 relu(x) ≥ relu(x + ld) - 𝛼 relu(x)
        k, b = relu_diff_lb0(lx, ux, ld, 𝛼)
        return (k * 𝛽, 0, b)
```

[Open visualization in new tab](relu_viz.html)


<!-- def relu_diff_ub2(lx, ux, d, 𝛼, 𝛽):
    fux = relu(𝛽 ux + d) - 𝛼 relu(ux)
    flx = relu(𝛽 lx + d) - 𝛼 relu(lx)
    highk = (fux - flx) / (ux - lx)
    highb = flx - highk * lx
    if highb >= relu(d):
        return (highk, highb)
    
    x0 = (ux + lx) / 2
    if d >= 0 and x0 >= 0:
        return (𝛽 - 𝛼, d)
    elif d >= 0 and x0 <= 0:
        p = min(0, ux)
        k = relu(𝛽 p + d) / (p - lx)
        b = relu(𝛽 p + d) - k * p
        return (k, b)
    elif d <= 0 and x0 >= 0:
        p = max(0, lx)
        k = (relu(𝛽 ux + d) - relu(𝛽 p + d)) / (ux - p)
        b = relu(𝛽 ux + d) - k * ux
        return (k - 𝛼, b)
    else:
        return (0, 0) -->