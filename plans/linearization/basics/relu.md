

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
    k = ub / (ub - lb)
    b = -k * lb
    return (k, b)
```

## Selecting $\alpha$

```py
def relu_alpha(lx, ux, ly, uy, ld, ud):
    return (relu(uy) - relu(ly)) / (relu(ux) - relu(lx))
```

## Linearization of ReLU(y) - 𝛼 ReLU(x)

We only consider the area of `lx ≤ x ≤ ux, ld ≤ y - 𝛽 x ≤ ud`, we have the following formulas for the envelope of $\mathrm{relu}(y) - 𝛼~ \mathrm{relu}(x)$:

```py
def relu_diff_ub(lx, ux, ld, ud, 𝛼, 𝛽):
    x0 = (ux + lx) / 2
    if x0 <= 0:
        z1 = relu(𝛽 * lx + ud)
        z2 = relu(𝛽 * lx + ld)
        z3 = relu(𝛽 * ux + ud)
        d
    return (k2, k1, b1 + b2)
```