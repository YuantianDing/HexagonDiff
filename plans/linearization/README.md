
# Linearization

Given a non-linear operator $f$ and a region $R$, we want to find linear constraints to approximate the non-linear operator, which is in the following form:

$$
\mathbf{l}^\mathrm{T} \mathbf{x} + \mathbf{lb} \le f(\mathbf{x}) \le \mathbf{u}^\mathrm{T} \mathbf{x} + \mathbf{ub} \text{ for any } \mathbf{x} \in R
$$

Specifically, given a  `gbound` region $l_x \le x \le u_x, l_y \le y \le u_y, l_d \le x - y \le u_d$, we want to find linear constraints to approximate the non-linear operator $f(x)$, $f(y)$ and $f(x) - f(y)$ for any $x, y$ in the `gbound` region.

## Linearization Objective

Different strategies can be used to find the linear constraints. Here we consider the following two objectives:

1. Minimum $L_1$ norm of the bounds: $\displaystyle\int_R (\mathbf{u} - \mathbf{l})^\mathrm{T} \mathbf{x} + (\mathbf{ub} - \mathbf{lb}) \text{d}\mathbf{x}$.
2. Minimum $L_\infty$ norm of the bounds: $\displaystyle\max_{\mathbf{x} \in R}\, (\mathbf{u} - \mathbf{l})^\mathrm{T} \mathbf{x} + (\mathbf{ub} - \mathbf{lb})$.

For me, the minimum $L_1$ bounds makes more sense because it minimizes the total area between the upper and lower bounds. In the overall algorithm, the bound will be used to restrict different directions, e.g., we may want the minimum and maximum values of $a f(x) + b x$ in bound propagation. The minimum $L_1$ bounds have the ability to guarantee the average case.

At the same time, the minimum $L_1$ bounds are easier to compute. To do this, we need *the convex (concave) envelope* of the non-linear operator, which is the tightest convex (concave) function that upper (lower) bounds the non-linear operator, defined as follows:

$$
\begin{gathered}
f^{\cup}
= \sup\{g \mid g \text{ is convex and } g(\mathbf{x}) \le f(\mathbf{x}) \text{ for any } \mathbf{x} \in R\}\\
f^{\cap}
= \inf\{g \mid g \text{ is concave
    and } g(\mathbf{x}) \ge f(\mathbf{x}) \text{ for any } \mathbf{x} \in R\}
\end{gathered}
$$

Then we have the formulas for the minimum $L_1$ bounds:

$$
\begin{gathered}
\mathbf{l} = \nabla f^{\cup}(\mathbf{x}_C) \quad\quad \mathbf{lb} = f^{\cup}(\mathbf{x}_C) - \nabla f^{\cup}(\mathbf{x}_C)^\mathrm{T} \mathbf{x}_C\\
\mathbf{u} = \nabla f^{\cap}(\mathbf{x}_C) \quad\quad \mathbf{ub} = f^{\cap}(\mathbf{x}_C) - \nabla f^{\cap}(\mathbf{x}_C)^\mathrm{T} \mathbf{x}_C \\
\end{gathered}
$$

where $\mathbf{x}_C$ is the center of $R$.

Therefore, in the following sections, we will use the minimum $L_1$ bounds as the linearization objective, and we will compute the convex (concave) envelope of the non-linear operator to obtain the linear constraints. 

See [DeepPoly](https://arxiv.org/abs/1805.03162) for more details about the minimum $L_1$ bounds.

## Linearization Process

Before we go into the details of the linearization of specific non-linear operators, we first need to normalize the `gbound` to ensure that all bounds are tight. For example, for the `gbound` of $x$, we can compute the minimum and maximum values of $x$ in the `gbound` region, which are $\min(u_x, l_y + u_d)$ and $\max(l_x, u_y + l_d)$, respectively. Then we can update the `gbound` of $x$ to be $\min(u_x, l_y + u_d) \le x \le \max(l_x, u_y + l_d)$. 

Even after this, `gbound` area is still too complex for fast computation, thus we will try to further relax the `gbound` area to a parallelogram area. Obviously, there are 3 ways to relax the `gbound` area to a parallelogram area, which are 1) $l_x \le x \le u_x, l_y \le y \le u_y$, 2) $l_x \le x \le u_x, l_d \le x - y \le u_d$ and 3) $l_y \le y \le u_y, l_d \le x - y \le u_d$. We will select the parallelogram with the smallest area. Specifically, we compare $u_x - l_x$, $u_y - l_y$, and $u_d - l_d$, if $u_d - l_d$ is the largest, we will select the first parallelogram, if $u_y - l_y$ is the largest, we will select the second parallelogram, and if $u_x - l_x$ is the largest, we will select the third parallelogram.

Then we consider the bounds for $f(x)$, $f(y)$ and $f(x) - f(y)$. For each function, we compute the minimum $L_1$ bounds using the convex (concave) envelope of the function in the selected parallelogram area. The case for the parallelogram area 1 ($l_x \le x \le u_x, l_y \le y \le u_y$) is the simplest, we can directly compute the convex (concave) envelope of $f$ in the range of $x$ and $y$. The other two cases are symmetric, so we only consider the case for the parallelogram area 2 ($l_x \le x \le u_x, l_d \le x - y \le u_d$). 

## Linearization of Specific Non-linear Operators

Here we list the detailed linearization for some common non-linear operators, and we will add more non-linear operators in the future.

- [ReLU](relu.md)
- [Reciprocal](inv.md)
- [Exponential](exp.md)