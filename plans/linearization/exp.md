
# Linearization of `exp`

Given a `gbound` for the input of `exp`, we can derive the `dbound` for `exp(x)`, `exp(y)` and `exp(x) - exp(y)`. 

Here we only consider one value of the input vector, the bounds are given as follows:

```rs
fn gbound = lx ≤ x ≤ ux, ly ≤ y ≤ uy, ld ≤ x - y ≤ ud
```

## Bounds for `exp(x)`, `exp(y)`

Let the input `gbound` be `lx <= x <= ux`, `ly <= y <= uy`, and `ld <= x - y <= ud`. We can derive the following constraints:

```rs
theorem! exp_dbound_x : ∀(lx ≤ x ≤ ux)
    lamx x + Lx ≤ exp(x) ≤ lamx x + Ux
where 
    lamx = exp(ux) - exp(lx) / (ux - lx)
    Ux = exp(ux) - lamx * ux = exp(lx) - lamx * lx
    Lx = lamx * (1 - log(lamx))
```

Similarly, we can derive the following constraints for `y`:

```rs
theorem! exp_dbound_y : ∀(ly ≤ y ≤ uy)
    lamy y + Ly ≤ exp(y) ≤ lamy y + Uy
where 
    lamy = exp(uy) - exp(ly) / (uy - ly)
    Uy = exp(uy) - lamy * uy = exp(ly) - lamy * ly
    Ly = lamy * (1 - log(lamy))
```

## Bounds for `exp(x) - exp(y)`

We divide the bounds for `exp(x) - exp(y)` into three cases, based on the biggest of `ux - lx`, `uy - ly` and `ud - ld`.

### Case 1: `ud - ld` is the biggest

```rs
theorem! exp_dbound_d1 : ∀(lx ≤ x ≤ ux, ly ≤ y ≤ uy)
    lamx x - lamy y + Lx - Uy ≤ exp(x) - exp(y) ≤ lamx x - lamy y + Ux - Ly
where lamx, Lx, Ux, lamy, Ly, Uy "are defined as above".
```

### Case 2: `uy - ly` is the biggest

```rs
theorem! exp_dbound_d2 : ∀(lx ≤ x ≤ ux, ly ≤ y ≤ uy, ld ≤ x - y ≤ ud)
    lamx2 x - lamd2 (x - y) + L2 ≤ exp(x) - exp(x - (x - y)) ≤ lamx2 x - lamd2 (x - y) + U2
where
    lamx2 = lamx - (exp(ux - ud) + exp(ux - ld) - exp(lx - ud) - exp(lx - ld)) / 2(ux - lx)
          = lamx (1 - (exp(-ux) + exp(-ld)) / 2)
    lamd2 = -(exp(ux - ud) + exp(lx - ud) - exp(ux - ld) - exp(lx - ld)) / 2 (ud - ld)
          = -lamd (exp(ud) + exp(lx)) / 2
    lamd = (exp(-ux) - exp(-ld))/ (ud - ld)
    L2 = exp_dbound_L2(lamx2, lamd2, lx, ux, ld, ud)
    U2 = exp_dbound_U2(lamx2, lamd2, lx, ux, ld, ud)

fn exp_dbound_d2_min0(a, lam, l, u)
    = min! l ≤ x ≤ u { a exp(x) - lam * x }
    = if lam ≥ a exp(u) {
        a exp(u) - lam * u
    } && if a exp(u) ≤ lam ≤ a exp(l) {
        x = log(lam / a)
        a exp(x) - lam * x = lam (1 - log(lam / a))
    } && if lam ≤ a exp(l) {
        a exp(l) - lam * l
    }

fn exp_dbound_d2_max0(a, lam, l, u)
    = max! l ≤ x ≤ u { a exp(x) - lam * x }
    = if lam ≥ a (exp(u) - exp(l)) / (u - l) {
        a exp(l) - lam * l
    } else {
        a exp(u) - lam * u
    }

fn exp_dbound_d2_min1(x, lamd, l, u)
    = min! l ≤ d ≤ u { exp(x - d) - lamd * d }
    = if lamd ≥ -exp(x - u) {
        exp(x - u) - lamd * u
    } && if -exp(x - l) ≤ lamd ≤ -exp(x - u) {
        d = x - log(-lamd)
        exp(x - d) - lamd * d = -lamd (1 + x - log(-lamd))
    } && if lamd ≤ -exp(x - l) {
        exp(x - l) - lamd * l
    }

fn exp_dbound_d2_max1(x, lamd, l, u)
    = max! l ≤ d ≤ u { exp(x - d) - lamd * d }
    = if lamd ≥ exp(x) (exp(-u) - exp(-l)) / (u - l) {
        exp(x - l) - lamd * l
    } else {
        exp(x - u) - lamd * u
    }

fn exp_dbound_L2(lamx2, lamd2, lx, ux, ld, ud)
    = min! lx ≤ x ≤ ux, ld ≤ d ≤ ud { exp(x) - exp(x - d) - lamx2 x - lamd2 d }
    = min! lx ≤ x ≤ ux { exp(x) - lamx2 x - max! ld ≤ d ≤ ud { exp(x - d) - (-lamd2) d } }
    = min! lx ≤ x ≤ ux { exp(x) - lamx2 x -  exp_dbound_d2_max1(x, -lamd2, ld, ud) }
    = min! lx ≤ x ≤ ux { exp(x) - lamx2 x - if lamd2 ≥ exp(x) (exp(-u) - exp(-l)) / (u - l) {
        exp(x - ld) + lamd2 * ld
    } else {
        exp(x - ud) + lamd2 * ud
    }}
    = let xbound = log(lam2 (u - l)/(exp(-u) - exp(-l))) in
    min(
        min! lx ≤ x ≤ min(ux, xbound) { exp(x)(1 - exp(-ld)) - lamx2 x} - lamd2 ld,
        min! max(lx, xbound) ≤ x ≤ ux { exp(x)(1 - exp(-ud)) - lamx2 x} - lamd2 ud,
    )
    = let xbound = log(lam2 (u - l)/(exp(-u) - exp(-l))) in
    min(
        exp_dbound_d2_min0(lamx2 (1 - exp(-ld)), lamx2, lx, min(ux, xbound)) - lamd2 ld,
        exp_dbound_d2_min0(lamx2 (1 - exp(-ud)), lamx2, max(lx, xbound), ux) - lamd2 ud,
    ) // Note: if any of the bounds doesn't exists, we can simply ignore that case.

fn exp_dbound_U2(lamx2, lamd2, lx, ux, ld, ud)
    = max! lx ≤ x ≤ ux, ld ≤ d ≤ ud { exp(x) - exp(x - d) - lamx2 x - lamd2 d }
    = max! lx ≤ x ≤ ux { exp(x) - lamx2 x - min! ld ≤ d ≤ ud { exp(x - d) - (-lamd2) d } }
    = max! lx ≤ x ≤ ux { exp(x) - lamx2 x - exp_dbound_d2_min1(x, -lamd2, ld, ud) }
    = max! lx ≤ x ≤ ux { exp(x) - lamx2 x - if lamd2 ≤ exp(x - ud) {
            exp(x - ud) + lamd2 * ud
        } && if exp(x - ld) ≥ lamd ≥ exp(x - ud) {
            d = x - log(lamd2)
            exp(x - d) + lamd2 * d = lamd2 (1 + x - log(lamd2))
        } && if lamd2 ≥ exp(x - ld) {
            exp(x - ld) + lamd2 * ld
        }}
    = max(
        max! max(lx, ud + log(lamd2)) ≤ x ≤ ux { exp(x) - lamx2 x - exp(x - ud) } - lamd2 * ud,
        max! max(lx, ld + log(lamd2)) ≤ x ≤ min(ux, ud + log(lamd2)) {
            exp(x) - (lamx2 + lamd2) x
        } - lamd2 (1 - log(lamd2)),
        max! lx ≤ x ≤ min(ux, ld + log(lamd2)) { exp(x) - lamx2 x - exp(x - ld) } - lamd2 * ld,
    )
    = max(
        exp_dbound_d2_max0(1 - exp(-ud), lamx2, max(lx, ud + log(lamd2)), ux) - lamd2 * ud,
        exp_dbound_d2_max0(1, lamx2 + lamd2, max(lx, ld + log(lamd2)), min(ux, ud + log(lamd2))) - lamd2 (1 - log(lamd2)),
        exp_dbound_d2_max0(1 - exp(-ld), lamx2, lx, min(ux, ld + log(lamd2))) - lamd2 * ld,
    ) // Note: if any of the bounds doesn't exists, we can simply ignore that case.
```

### Case 3: `ux - lx` is the biggest

```rs
theorem! exp_dbound_d3 = exp_dbound_d2[lx <=> ly, ux <=> uy, ld => -ud, ud => -ld]
```