
# Why this is more general than Zonotope formalization

Zonotope is a special case of the linear dependent bound (dbound) formalization, where the upper and lower bounds have the same slope:

$$
\begin{gathered}
\mathbf{\lambda_x} \odot \mathbf{x} + \mathbf{lb}_x \le f(\mathbf{x}) \le \mathbf{\lambda_x} \odot \mathbf{x} + \mathbf{ub}_x\\
\mathbf{\lambda_y} \odot \mathbf{y} + \mathbf{lb}_y \le f(\mathbf{y}) \le \mathbf{\lambda_y} \odot \mathbf{y} + \mathbf{ub}_y\\
\mathbf{\lambda_{\Delta x}} \odot \mathbf{x} + \mathbf{\lambda_{\Delta y}} \odot \mathbf{y} + \mathbf{lb}_{\Delta} \le f(\mathbf{x}) - f(\mathbf{y}) \le \mathbf{\lambda_{\Delta x}} \odot \mathbf{x} + \mathbf{\lambda_{\Delta y}} \odot \mathbf{y} + \mathbf{ub}_{\Delta}\\
\end{gathered}
$$

However, for differential verification, a same formula can be written in different forms of zonotope mentioned above, with zonotope alone, it is not trivial to decide which form is better. The method proposed in [Bound Propagation](bound_propagation.md) can be used to select the best form of zonotope, which is more general than the zonotope formalization. 

If we just run the network for once, why not ignoring the performance and care more about the tightness of the bound? 