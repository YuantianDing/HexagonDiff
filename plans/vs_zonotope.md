
# About Zonotopes

A special case of the linear dependent bound (dbound) formalization, where the upper and lower bounds have the same slope:

$$
\begin{gathered}
\mathbf{\lambda_x} \odot \mathbf{x} + \mathbf{lb}_x \le f(\mathbf{x}) \le \mathbf{\lambda_x} \odot \mathbf{x} + \mathbf{ub}_x\\
\mathbf{\lambda_y} \odot \mathbf{y} + \mathbf{lb}_y \le f(\mathbf{y}) \le \mathbf{\lambda_y} \odot \mathbf{y} + \mathbf{ub}_y\\
\mathbf{\lambda_{\Delta x}} \odot \mathbf{x} + \mathbf{\lambda_{\Delta y}} \odot \mathbf{y} + \mathbf{lb}_{\Delta} \le f(\mathbf{x}) - f(\mathbf{y}) \le \mathbf{\lambda_{\Delta x}} \odot \mathbf{x} + \mathbf{\lambda_{\Delta y}} \odot \mathbf{y} + \mathbf{ub}_{\Delta}\\
\end{gathered}
$$

However, this is still not a zonotope, the area for each $(x,y)$ is a hexagon instead of a parallelogram, so to make it a zonotope, we need to further relax the hexagon area to a parallelogram area, which means we need to select one of the two slopes as the slope for both upper and lower bounds. However, there are different ways to loose this bound, it is not trivial to decide which form is better. The method proposed in [Bound Propagation](bound_propagation.md) can be used to select the best bound, which will give a tighter bound than the standard zonotope formalization. 
