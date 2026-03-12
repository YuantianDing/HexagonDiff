
We compare two linear bounds for function `relu(x) - relu(y)`:

```py
kx x + ky y + bl <= relu(x) - relu(y) <= kx x + ky y + bu
```

## Bound1 of `lx <= x <= ux && ly <= y <= uy && ld <= x - y <= ud`

```py
def bound1(lx, ux, ly, uy, ld, ud):
    (kx, bux, blx) = relu_ub(lx, ux)
    (ky, buy, bly) = relu_ub(ly, uy)
    return (kx, ky, bux - buy, blx - bly)

#  k x + b1 <= relu(x) <= k x + b2
def relu_bound(lb, ub):
    k = (relu(ub) - relu(lb)) / (ub - lb)
    b = relu(lb) - k * lb
    return (k, b, 0)
```

## Bound2 of `lx <= x <= ux && ly <= y <= uy && ld <= x - y <= ud`

```py
def bound2(lx, ux, ly, uy, ld, ud):
    if ly >= 0 or uy <= 0 or ld >= 0 or ud <= 0:
        return bound1(lx, ux, ly, uy, ld, ud)
    else:
        lam_delta = clamp(ud / (ud - ld), 0, 1)
        mu_delta = max(-ld, ud) / 2
        nu_delta = lam_delta * relu(-ld)
        
        return (lam_delta, -lam_delta, nu_delta, nu_delta - 2 * mu_delta)
```






