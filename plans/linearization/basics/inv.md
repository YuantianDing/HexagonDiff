# Linearization of 1/x

For ReLU, we simply use the convex (concave) envelope of ReLU to compute the minimum $L_1$ bounds mentioned in [Linearization Methods](../README.md#linearization-objective). The envelope of ReLU is in the following form:

## Envelope of 1/x

```py
def inv_cup(x, lb, ub):
    return 1 / x

def inv_cap(x, lb, ub):
    return ((ub - x) * inv(lb) + (x - lb) * inv(ub)) / (ub - lb)
```

## Envelope of 1/x - 1/y

We only consider the area of `lx ≤ x ≤ ux, ld ≤ x - y ≤ ud`, we have the following formulas for the envelope of `1/x - 1/y`:

```py
def inv_diff(x, d):
    return 1/x - 1/(x - d)




```