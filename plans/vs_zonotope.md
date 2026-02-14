
# Why this is more general than Zonotope formalization

Zonotope is a special case of the linear dependent bound (dbound) formalization, where the upper and lower bounds have the same slope:

$$
\begin{gathered}
\mathbf{\lambda_x} \odot \mathbf{x} + \mathbf{lb}_x \le f(\mathbf{x}) \le \mathbf{\lambda_x} \odot \mathbf{x} + \mathbf{ub}_x\\
\mathbf{\lambda_y} \odot \mathbf{y} + \mathbf{lb}_y \le f(\mathbf{y}) \le \mathbf{\lambda_y} \odot \mathbf{y} + \mathbf{ub}_y\\
\mathbf{\lambda_{\Delta x}} \odot \mathbf{x} + \mathbf{\lambda_{\Delta y}} \odot \mathbf{y} + \mathbf{lb}_{\Delta} \le f(\mathbf{x}) - f(\mathbf{y}) \le \mathbf{\lambda_{\Delta x}} \odot \mathbf{x} + \mathbf{\lambda_{\Delta y}} \odot \mathbf{y} + \mathbf{ub}_{\Delta}\\
\end{gathered}
$$

In such a case, $\mathbf{lb}_x$ and $\mathbf{ub}_x$ can be represented as a noise term in additional to $\mathbf{\lambda_x} \odot \mathbf{x}$, reducing the need of backward bound propagation. To see this can obtain the same result, think about if we pick the noise terms of the Zonotope form backward to the input layer, we actually enables each noise term to be linearly dependent to previous noise terms, which is equivalent to the linear dependent bound formalization. The benefit of the Zonotope formalization is that it reduces the need to repeatedly propagate the linear layers. However, since our method just run the entire linearization of the network once, so I choose generality over some performance loss during this process. This also allows us to try out more general linear dependent bounds, which can potentially lead to tighter bounds and better verification results.