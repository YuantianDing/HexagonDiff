
# Linearization of `1/x`


Given a `gbound` for the input of `exp`, we can derive the `dbound` for `exp(x)`, `exp(y)` and `exp(x) - exp(y)`. 

Here we only consider one value of the input vector, the bounds are given as follows:

```rs
fn gbound = 0 ≤ lx ≤ x ≤ ux, 0 ≤ ly ≤ y ≤ uy, ld ≤ x - y ≤ ud
```

## Bounds for `1/x`, `1/y`

Let the input `gbound` be `lx <= x <= ux`, `ly <= y <= uy`, and `ld <= x - y <= ud`. We can derive the following constraints:

```rs
theorem! inv_dbound_x : ∀(0 ≤ lx ≤ x ≤ ux)
    lamx x + Lx ≤ 1/x ≤ lamx x + Ux
where 
    lamx = (1/ux - 1/lx) / (ux - lx)
    Ux = 1/ux - lamx * ux = 1/lx - lamx * lx
    Lx = lamx * (1 - log(lamx))
```

Similarly, we can derive the following constraints for `y`:

```rs
theorem! inv_dbound_y : ∀(0 ≤ ly ≤ y ≤ uy)
    lamy y + Ly ≤ 1/y ≤ lamy y + Uy
where
    lamy = (1/uy - 1/ly) / (uy - ly)
    Uy = 1/uy - lamy * uy = 1/ly - lamy * ly
    Ly = lamy * (1 - log(lamy))
```

## Bounds for `1/x - 1/y`

We divide the bounds for `1/x - 1/y` into three cases, based on the biggest of `ux - lx`, `uy - ly` and `ud - ld`.

### Case 1: `ud - ld` is the biggest

```rs
theorem! inv_dbound_d1 : ∀(0 ≤ lx ≤ x ≤ ux, 0 ≤ ly ≤ y ≤ uy)
    lamx x - lamy y + Lx - Uy ≤ 1/x - 1/y ≤ lamx x - lamy y + Ux - Ly
where lamx, Lx, Ux, lamy, Ly, Uy "are defined as above".
```

### Case 2: `uy - ly` is the biggest

```rs
theorem! inv_dbound_d2 : ∀(0 ≤ lx ≤ x ≤ ux, 0 ≤ ly ≤ y ≤ uy, ld ≤ x - y ≤ ud)
    lamx2 x - lamd2 (x - y) + L2 ≤ 1/x - 1/(x - (x - y)) ≤ lamx2 x - lamd2 (x - y) + U2
where
    lamx2 = lamx - (1/(ux - ud) + 1/(ux - ld) - 1/(lx - ud) - 1/(lx - ld)) / 2(ux - lx)
    lamd2 = -(1/(ux - ud) + 1/(lx - ud) - 1/(ux - ld) - 1/(lx - ld)) / 2 (ud - ld)
    L2 = inv_dbound_L2(lamx2, lamd2, lx, ux, ld, ud)
    U2 = inv_dbound_U2(lamx2, lamd2, lx, ux, ld, ud)
```