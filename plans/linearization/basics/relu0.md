

# Linearization of ReLU

For ReLU, we simply use the convex (concave) envelope of ReLU to compute the minimum $L_1$ bounds mentioned in [Linearization Methods](../linearization.md#linearization-objective). The envelope of ReLU is in the following form:

## Envelope of ReLU(x)

```py
def relu_cup(x, lb, ub):
    return relu(x)

def relu_cap(x, lb, ub):
    return ((ub - x) * relu(lb) + (x - lb) * relu(ub)) / (ub - lb)
```

## Envelope of ReLU(x) - ReLU(y)

We only consider the area of `lx ≤ x ≤ ux, ld ≤ x - y ≤ ud`, we have the following formulas for the envelope of $\text{relu}(x) - \text{relu}(y)$:

```py
def relu_diff(x, d):
    return relu(x) - relu(x - d)

def line2p(x, l, u, ly, uy):
    k = (x - l) / (u - l)
    return k * uy + (1 - k) * ly

def two_points(x, d, lx, ux):
    if d >= 0:
        return lx, clip(d, lx, ux)
    else:
        return clip(0, lx, ux), ux

def relu_diff_cup(x, d, lx, ux, ld, ud):
    xu1, xu2 = two_points(x, ud, lx, ux)
    xl1, xl2 = two_points(x, ld, lx, ux)
    x1 = line2p(d, ld, ud, xl1, xu1)
    x2 = line2p(d, ld, ud, xl2, xu2)
    if x1 ≤ x ≤ x2:
        return -line2p(d, ld, ud, relu(-ld), relu(-ud))
    elif x2 < x:
        uu = line2p(x, x2, ux, relu(-ud), relu_diff(ux, ud))
        ll = line2p(x, x2, ux, relu(-ld), relu_diff(ux, ld))
        return line2p(d, ld, ud, ll, uu)
    else:
        uu = line2p(x, lx, x1, relu(-ud), relu_diff(lx, ud))
        ll = line2p(x, lx, x1, relu(-ld), relu_diff(lx, ld))
        return line2p(d, ld, ud, ll, uu)

def relu_diff_cap(x, d, lx, ux, ld, ud):
    if x < d:
        p = min(d, ux)
        return line2p(x, lx, p, relu_diff(lx, d), relu_diff(p, d))
    else:
        p = max(d, lx)
        return line2p(x, p, ux, relu_diff(p, d), relu_diff(ux, d))
```