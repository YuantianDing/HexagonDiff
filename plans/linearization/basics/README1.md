
# Linearization of 1-input 1-output Non-linear Operators $f$

Given a `gbound` for the input of $f$, we can derive the `dbound` for $f(x)$, $f(y)$ and $f(x) - f(y)$. 

## Normalization of `gbound`

Before we go into the details of the linearization of specific non-linear operators, we first need to normalize the `gbound` to ensure that all bounds are tight. For example, for the `gbound` of $x$, we can compute the minimum and maximum values of $x$ in the `gbound` region, which are $\min(u_x, l_y + u_d)$ and $\max(l_x, u_y + l_d)$, respectively. Then we can update the `gbound` of $x$ to be $\min(u_x, l_y + u_d) \le x \le \max(l_x, u_y + l_d)$. 

## Bound for $f(x)$

$$
\begin{gathered}
\lambda_x x + \text{L}_x \le f(x) \le \lambda_x x + \text{U}_x \text{ for any } l_x \le x \le u_x \text{ where } \\ 
\lambda_x = \frac{f(u_x) - f(l_x)}{u_x - l_x} \\
\text{U}_x = \boxed{f}(-\lambda_x, 1, l_x, u_x) \\
\text{L}_x = -\boxed{f}(\lambda_x, -1, l_x, u_x)
\end{gathered}
$$

Here we use the symbol $\boxed{f}$ to represent the following optimization problem:

$$
\boxed{f}(a, b, l, u) = \max_{l \le x \le u} a x + b f(x)
$$

We use the symbol of box because the optimization problem is related to the convex (concave) envelope of $f$. 

## Bound for $f(x) - f(y)$

The `gbound` area is too complex for fast computation, thus we will try to relax the `gbound` area to a parallelogram area. Obviously, there are 3 ways to relax the `gbound` area to a parallelogram area, which are 1) $l_x \le x \le u_x, l_y \le y \le u_y$, 2) $l_x \le x \le u_x, l_d \le x - y \le u_d$ and 3) $l_y \le y \le u_y, l_d \le x - y \le u_d$. We will select the parallelogram with the smallest area. Specifically, we compare $u_x - l_x$, $u_y - l_y$, and $u_d - l_d$, if $u_d - l_d$ is the largest, we will select the first parallelogram, if $u_y - l_y$ is the largest, we will select the second parallelogram, and if $u_x - l_x$ is the largest, we will select the third parallelogram.

### Case 1: $u_d - l_d$ is the largest

We assume that $x$ and $y$ are independent, thus we can directly compute the bounds for $f(x) - f(y)$ using the bounds for $f(x)$ and $f(y)$:

$$
\begin{gathered}
\lambda_x x - \lambda_y y + \text{L}_x - \text
{U}_y \le f(x) - f(y) \le \lambda_x x - \lambda_y y + \text{U}_x - \text{L}_y \\
\text{where } \lambda_x, \text{L}_x, \text{
U}_x, \lambda_y, \text{L}_y, \text{U}_y \text{ are defined as above}.
\end{gathered}
$$

### Case 2: $u_y - l_y$ is the largest

We assume that $x$ and $d = x - y$ are independent, thus we can compute the bounds for $f(x) - f(y) = f(x) - f(x - d)$:

$$
\begin{gathered}
\lambda_{x2} x - \lambda_{d2} (x - y)
+ \text{L}_2 \le f(x) - f(x - (x - y)) \le \lambda_{x2} x - \lambda_{d2} (x - y) + \text{U}_2 \\
\text{where } \lambda_{x2} = \lambda_x - \frac{f(u_x - u_d) + f(u_x - l_d) - f(l_x - u_d) - f(l_x - l_d)}{2(u_x - l_x)} \\
\lambda_{d2} = -\frac{f(u_x - u_d) + f(l_x - u_d) - f(u_x - l_d) - f(l_x -  l_d)}{2 (u_d - l_d)} \\
\text{U}_2 = \boxed{f_\Delta} (-\lambda_{x2}, -\lambda_{d2}, 1, l_x, u_x, l_d, u_d) \\
\text{L}_2 = -\boxed{f_\Delta} (\lambda_{x2}, \lambda_{d2}, -1, l_x, u_x, l_d, u_d)
\end{gathered}
$$

Where we use the symbol $\boxed{f_\Delta}$ to represent the following optimization problem:

$$
\boxed{f_\Delta}(a, b, c, l_x, u_x, l_d, u_d) = \max_{\substack{l_x \le x \le u_x \\ l_d \le d \le u_d}} a \, x + b \, d + c (f(x) - f(x - d))
$$

### Case 3: $u_x - l_x$ is the largest

This case is symmetric to Case 2.
