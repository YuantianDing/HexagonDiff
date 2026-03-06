
# Linearization of Exp(x)

## Linearization of Exp(x)

```py
def exp_lb(lb, ub):
    center = (lb + ub) / 2
    return (exp(center), exp(center) * (1 - center))

def exp_ub(lb, ub):
    k = (exp(ub) - exp(lb)) / (ub - lb)
    b = exp(lb) - k * lb
    return (k, b)
```

## Selecting $\alpha$

```py
def exp_alpha(lx, ux, ly, uy, ld, ud):
    return (exp(uy) - exp(ly)) / (exp(ux) - exp(lx))
```

## Linearization of Exp(y) - 𝛼 Exp(x)

We only consider the area of `lx ≤ x ≤ ux, ld ≤ y - 𝛽 x ≤ ud`, we have the following formulas for the upper and lower bounds of $\mathrm{exp}(y) - 𝛼~ \mathrm{exp}(x)$:

```py
# Upper bound for `exp(𝛽x + d) - 𝛼 exp(x)`
def exp_diff_ub(lx, ux, ld, ud, 𝛼, 𝛽):
    fudux = exp(𝛽 ux + ud) - 𝛼 exp(ux)
    fudlx = exp(𝛽 lx + ld) - 𝛼 exp(lx)
    k = (fudux - fudlx) / (ux - lx)
    b = fudlx - k * lx
    return k, 0, b

def point2line(x1, y1, x2, y2):
    k = (y2 - y1) / (x2 - x1)
    b = y1 - k * x1
    return (k, b)

# Lower bound for `relu(𝛽x + d) - 𝛼 relu(x)`
def relu_diff_lb(lx, ux, ld, ud, 𝛼, 𝛽):
    return (0,0,0) # TODO
```

[Open visualization in new tab](exp_viz.html)


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