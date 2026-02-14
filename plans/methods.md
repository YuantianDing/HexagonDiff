# Verification Methods

`HexagonDiff` verifies the differential network using two interrelated process: *linearization* and *bound propagation*. The linearization process computes the *linear dependent bounds* (`dbound`) for each non-linear operator, which are used to approximate the non-linear operator with linear constraints. Linear dependent bounds for a 1-input 1-output operator is in the following form: 

$$
\begin{gathered}
\mathbf{l_x} \odot \mathbf{x} + \mathbf{lb}_x \le f(\mathbf{x}) \le \mathbf{u_x} \odot \mathbf{x} + \mathbf{ub}_x\\
\mathbf{l_y} \odot \mathbf{y} + \mathbf{lb}_y \le f(\mathbf{y}) \le \mathbf{u_y} \odot \mathbf{y} + \mathbf{ub}_y\\
\mathbf{l_{\Delta x}} \odot \mathbf{x} + \mathbf{l_{\Delta y}} \odot \mathbf{y} + \mathbf{lb}_{\Delta} \le f(\mathbf{x}) - f(\mathbf{y}) \le \mathbf{u_{\Delta x}} \odot \mathbf{x} + \mathbf{u_{\Delta y}} \odot \mathbf{y} + \mathbf{ub}_{\Delta}\\
\end{gathered}
$$

However, to obtain an accurate linear dependent bound, we need the bound restriction for the input of the non-linear operator. For simplicity of the linearization process, we remove the dependency and use *global bound* (`gbound`) to estimate the input of the non-linear operator, which is in the following form:

$$
\begin{gathered}
\mathbf{lx} \le \mathbf{x} \le \mathbf{ux}\\
\mathbf{ly} \le \mathbf{y} \le \mathbf{uy}\\
\mathbf{ld} \le \mathbf{x} - \mathbf{y} \le \mathbf{ud}\\
\end{gathered}
$$

To compute the global bound for the input of the non-linear operator, we propagate linear dependent bounds from the non-linear operator to the input layer. The linear dependent bounds for the non-linear operator are used to compute the global bound for its input, which is then used to compute the linear dependent bounds for the non-linear operator. This process is repeated until we reach the output layer of the differential network, where we can check the output specifications.

For more details about the linearization and bound propagation process, please refer to the following sections:

- [Bound Propagation](bound_propagation.md)
- [Linearization of ReLU](linearization/relu.md)
- [Linearization of $1/x$](linearization/inv.md)
- [Linearization of $e^x$](linearization/exp.md)

Note: [Why this is more general than Zonotope formalization](vs_zonotope.md)

## Equivalence Checking

We provide two kind of equivalence standards: epsilon equivalence and top-1 equivalence. 

- *Epsilon equivalence* checks whether the output of the two DNNs are within an epsilon distance, which means $\|\mathbf{y}_1 - \mathbf{y}_2\| \le \epsilon$ where $\mathbf{y}_1$ and $\mathbf{y}_2$ are the outputs of the two DNNs, respectively.
- *Top-1 equivalence* checks whether the top-1 prediction of the two DNNs are the same, which means $\arg\max(\mathbf{y}_1) = \arg\max(\mathbf{y}_2)$ where $\mathbf{y}_1$ and $\mathbf{y}_2$ are the outputs of the two DNNs, respectively.