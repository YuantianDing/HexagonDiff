
# Linearization of ReLU

Here we simply provide the $\boxed{f}$ and $\boxed{f_\Delta}$ for ReLU, the bounds for ReLU can be easily derived using the formulas in [Linearization of Basics Operators](../linearization/basics/README.md#bound-for-fx).

## Boxed $f(x)$

```py
def relu_box(a, b, l, u)
    = max(l ≤ x ≤ u){ a x + b relu(x) }
    = with 
        lam = (relu(u) - relu(l)) / (u - l)
        if a + b ≥ 0 and a + lam b ≥ 0:
            a * u + b * relu(u)
        and if a + lam b ≤ 0 and a ≤ 0:
            a * l + b * relu(l)
        and if a ≥ 0 and a + b ≤ 0:
            p = clip(0, l, u)
            a * p + b * relu(p)
```


## Boxed $f(x) - f(x - d)$

```py
def relu_diff_box0(a, b, d, l, u)
    = max(l ≤ x ≤ u){ a x + b (relu(x) - relu(x - d)) }
    = if d ≥ 0:
        max(l ≤ x ≤ u){ a x + b (relu(x) - relu(x - d)) }
    and if d ≤ 0:
        max(l ≤ x ≤ u){ a x + b (relu(-x) - relu(-x + d) + d) }
    = if d ≥ 0:
        pointd = clip(d, l, u)
        point0 = clip(0, l, u)
        lamd = (relu(pointd) - relu(l)) / (pointd - l)
        lam0 = (relu(u) - relu(point0)) / (u - point0)
        if a + lam0 b ≥ 0 and a ≥ 0:
            a * u + b * (relu(u) - relu(u - pointd))
        and if a ≤ 0 and a + lambd b ≥ 0:
            a * pointd + b * relu(pointd)
        and if a + lamd b ≤ 0 and a ≤ 0:
            a * l + b * (relu(l) - relu(l - pointd))
        and if a ≥ 0 and a + lamd b ≤ 0:
            a * point0 - b * relu(-pointd)
    and if d ≤ 0:
        relu_diff_box0(a, b, -d, -u, -l) + b d

def relu_diff_inv0(d, a)
    = if d ≥ 0 and 0 ≤ a ≤ d: a
    and if d ≤ 0 and d ≤ a ≤ 0: a - d
    else: None

def relu_diff_box(a, b, c, lx, ux, ld, ud)
    = max(lx ≤ x ≤ ux, ld ≤ d ≤ ud){ a x + b d + c (relu(x) - relu(x - d)) } 
    = max(lx ≤ x ≤ ux){ a x +  c relu(x) + b d - c relu(x - d) } 
    = max(lx ≤ x ≤ ux){ a x +  c relu(x) + relu_box(b, -c, x - ud, x - ld) }  
    = max(lx ≤ x ≤ ux){ a x +  c relu(x) + with 
        lam = (relu(x - ld) - relu(x - ud)) / (ud - ld)
        if a + b ≥ 0 and a + lam b ≥ 0:
            a * (x - ld) + b * relu(x - ld)
        and if a + lam b ≤ 0 and a ≤ 0:
            a * (x - ud) + b * relu(x - ud)
        and if a ≥ 0 and a + b ≤ 0:
            p = clip(0, x - ud, x - ld)
            b * p - c * relu(p)
    }
    = max(lx ≤ x ≤ ux){ a x +  c relu(x) + with 
        xbound = ld + relu_diff_inv0(ud - ld, (ud - ld) b / c )
        if b - c ≥ 0 and x ≥ xbound:
            b (x - ld) - c relu(x - ld)
        and if x ≤ xbound and b ≤ 0:
            b (x - ud) - c relu(x - ud)
        and if b ≥ 0 and b - c ≤ 0:
            p = clip(0, x - ud, x - ld)
            b * p - c * relu(p)
    }
    = with 
        xbound = ld + relu_diff_inv0(ud - ld, (ud - ld) b / c )
        if b - c ≥ 0: max(max(lx, xbound) ≤ x ≤ ux){ a x +  c relu(x) + b (x - ld) - c relu(x - ld) },
        if b ≤ 0: max(lx ≤ x ≤ min(ux, xbound)){ a x +  c relu(x) + b (x - ud) - c relu(x - ud) },
        if b ≥ 0 and b - c ≤ 0: max(lx ≤ x ≤ ux){
            p = clip(0, x - ud, x - ld)
            a x + c relu(x) + b p - c  relu(p)
        }
    = with
        xbound = ld + relu_diff_inv0(ud - ld, (ud - ld) b / c )
        if b - c ≥ 0: max(max(lx, xbound) ≤ x ≤ ux){ (a + b) x +  c relu(x) - c relu(x - ld) } - b ld,
        if b ≤ 0: max(lx ≤ x ≤ min(ux, xbound)){ (a + b) x +  c relu(x) - c relu(x - ud) } - b ud,
        if b ≥ 0 and b - c ≤ 0: max(lx ≤ x ≤ ux){
            p = clip(0, x - ud, x - ld)
            a x + c relu(x) + b p - c  relu(p)
        }
    = with
        xbound = ld + relu_diff_inv0(ud - ld, (ud - ld) b / c )
        if b - c ≥ 0: relu_diff_box0(a+b, c, ld, max(lx, xbound), ux) - b ld,
        if b ≤ 0: relu_diff_box0(a+b, c, ud, lx, min(ux, xbound)) - b ud,
        if b ≥ 0 and b - c ≤ 0:
            max(
                relu_box(a, c, max(lx, ld), min(ux, ud)),
                relu_diff_box0(a + b, c, ld, lx, min(ux, ld)) - b ld,
                relu_diff_box0(a + b, c, ud, max(lx, ud), ux) - b ud,
            )
```