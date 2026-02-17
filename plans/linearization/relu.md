

# Linearization of ReLU

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

def two_points(x, d, lx, ux):
    if d >= 0:
        return lx, clip(d, lx, ux)
    else:
        return clip(0, lx, ux), ux

def relu_diff_cup(x, d, lx, ux, ld, ud):
    xu1, xu2 = two_points(x, ud, lx, ux)
    xl1, xl2 = two_points(x, ld, lx, ux)
    k = (d - ld) / (ud - ld)
    x1 = k * xu1 + (1 - k) * xl1
    x2 = k * xu2 + (1 - k) * xl2
    if x1 ≤ x ≤ x2:
        return -(k * relu(-ud) + (1 - k) * relu(-ld))
    elif x2 < x:
        p = (ux - x) / (ux - x2)
        uu = p * relu(-ud) + (1-p) * (relu(ux) - relu(ux - ud))
        ll = p * relu(-ld) + (1-p) * (relu(ux) - relu(ux - ld))
        return k * uu + (1 - k) * ll
    else:
        p = (x - lx) / (x1 - lx)
        uu = p * relu(-ud) + (1-p) * (relu(lx) - relu(lx - ud))
        ll = p * relu(-ld) + (1-p) * (relu(lx) - relu(lx - ld))
        return k * uu + (1 - k) * ll

def relu_diff_cap(x, d, lx, ux, ld, ud):
    if x < d:
        return ((ux - x) * relu(lx) + (x - lx) * relu(ux)) / (ux - lx)
    else:
        p = max(d, lx)
        k = (x - p) / (ux - p)
        return k * relu_diff(p, d) + (1 - k) * relu_diff(ux, d)
```