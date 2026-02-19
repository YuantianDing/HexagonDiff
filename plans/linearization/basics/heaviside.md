
# Linearization of Heaviside(x)

Here we simply provide the $\boxed{f}$ and $\boxed{f_\Delta}$ for ReLU, the bounds for ReLU can be easily derived using the formulas in [Linearization of Basics Operators](../linearization/basics/README.md#bound-for-fx).

## Boxed $h(x)$

```py
def heaviside_box(a, b, l, u)
    = max(l ≤ x ≤ u){ a x + b heaviside(x) }
    = with
        point0 = clip(0, l, u)
        lamtop = (heaviside(point0) - heaviside(l)) / (point0 - l)
        lambot = (heaviside(u) - heaviside(point0)) / (u - point0)
        if a ≥ 0 and a + lambot b ≥ 0:
            a * u + b
        and if a ≤ 0 and a + lamtop b ≥ 0:
            a * point0 + b 
        and if a + lamtop b ≤ 0 and a ≤ 0:
            a * l
        and if a ≥ 0 and a + lamtop b ≤ 0:
            a * point0
```