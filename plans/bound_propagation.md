
# Bound Propagation

Bound propagation is a process to compute the global bound for the input of a non-linear operator in the differential network. The global bound is used to estimate the input of the non-linear operator, which is then used to compute the linear dependent bounds for the non-linear operator.

*Propagation Boundary* $B$ is a set of edges in the differential network, where each edge represents a result $(\mathbf{x}_i, \mathbf{y}_i) \in B$ from previous computation in the network. In the bound propagation process, each bound is represented as a linear combination of the results in the propagation boundary, which is in the following format:

$$
\cdot \le \mathbf{c} + \sum_{(\mathbf{x}_i, \mathbf{y}_i) \in B} A_i \mathbf{x}_i + B_i \mathbf{y}_i \\
\text{where }\cdot \text{ is one of } \pm \mathbf{x}, \pm \mathbf{y}, \pm (\mathbf{x} - \mathbf{y})
$$

The propagation process start with initial bounds of non-linear operator input, e.g., $\mathbf{x} - \mathbf{y} \le \mathbf{x} - \mathbf{y}$. At this point, the propagation boundary is $\{(\mathbf{x}, \mathbf{y})\}$ as a starting point. Then we propagate the bounds backward 
in the topological order of the differential network, where each bound is represented as a linear combination of the results in the propagation boundary. When we reach the input layer of the differential network, we can obtain the global bound for the input of the non-linear operator.

Then we discuss our bound propagation method of 3 different cases: affine layers, non-linear layers and the input layer. 

## Affine Layers

If the next operator of the topological order is an affine layer, we can propagate the bound through the affine layer by substituting the output of the affine layer with its linear combination of its input. For example, if the next operator is a fully-connected layer represented as a tuple $(\mathbf{W}_1, \mathbf{b}_1, \mathbf{W}_2, \mathbf{b}_2)$ where $\mathbf{W}_1$ and $\mathbf{b}_1$ are the weight and bias of the affine layer in the first DNN, and $\mathbf{W}_2$ and $\mathbf{b}_2$ are those in the second DNN, we can propagate the bound through this affine layer by substituting $\mathbf{x}$ with $\mathbf{W}_1 \mathbf{x} + \mathbf{b}_1$ and $\mathbf{y}$ with $\mathbf{W}_2 \mathbf{y} + \mathbf{b}_2$.

## The input layers

Since the input specification is in the form of $\mathbf{lb} \le \mathbf{x} \le \mathbf{ub}, \mathbf{lb} \le \mathbf{y} \le \mathbf{ub}$, we can propagate the bound through the input layer by substituting $\mathbf{x}$ and $\mathbf{y}$ with $\mathbf{lb}$ and $\mathbf{ub}$, and $\mathbf{y}$ with $\mathbf{lb}$ and $\mathbf{ub}$. 

Given a bound in the form of $\cdot \le \mathbf{c} + \displaystyle\sum_{(\mathbf{x}_i, \mathbf{y}_i) \in B} A_i \mathbf{x}_i + B_i \mathbf{y}_i$, where all $(\mathbf{x}_i, \mathbf{y}_i) \in B$ are input layers. We obtain the global bound in the form of:

$$
\cdot \le \mathbf{c} + \displaystyle\sum_{(\mathbf{x}_i, \mathbf{y}_i) \in B} A_i \odot \mathbf{X}_i + B_i \odot \mathbf{Y}_i \text{ where}\\
(\mathbf{X}_i)_{m,n} = \begin{cases}
(\mathbf{ub}_i)_n & \text{if } (A_{i})_{m,n} > 0\\
(\mathbf{lb}_i)_n & \text{if } (A_{i})_{m,n} < 0\\
\end{cases} \quad
(\mathbf{Y}_i)_{m,n} = \begin{cases}
(\mathbf{ub}_i)_n & \text{if } (B_{i})_{m,n} > 0\\
(\mathbf{lb}_i)_n & \text{if } (B_{i})_{m,n} < 0\\
\end{cases}
$$


## Non-linear Layers

If the next operator of the topological order is a non-linear layer, we can propagate the bound through the non-linear layer by substituting the output of the non-linear layer with its linear dependent bounds. For a 1-input 1-output non-linear operator, the linear dependent bounds are in the following form:

$$
\mathbf{l_x} \odot \mathbf{x} + \mathbf{lb}_
x \le f(\mathbf{x}) \le \mathbf{u_x} \odot \mathbf{x} + \mathbf{ub}_x\\
\mathbf{l_y} \odot \mathbf{y} + \mathbf{lb}_y \le f(\mathbf{y}) \le \mathbf{u_y} \odot \mathbf{y} + \mathbf{ub}_y\\
\mathbf{l_{\Delta x}} \odot \mathbf{x} + \mathbf{l_{\Delta y}} \odot \mathbf{y} + \mathbf{lb}_{\Delta} \le f(\mathbf{x}) - f(\mathbf{y}) \le \mathbf{u_{\Delta x}} \odot \mathbf{x} + \mathbf{u_{\Delta y}} \odot \mathbf{y} + \mathbf{ub}_{\Delta}\\
$$

Given a bound in the form of $\cdot \le \mathbf{c} + A f(\mathbf{x}) + B f(\mathbf{y})$, we can propagate using the follow substitution:

$$
(\cdot)_i \le \mathbf{c}_i + 
    \sum_{j} A_{i, j} (p_{i,j} \mathbf{x}_j + q_{i,j} \mathbf{y}_j + a_{i,j}) +
    \sum_{j} B_{i, j} (u_{i,j} \mathbf{x}_j + v_{i,j} \mathbf{y}_j + b_{i,j})
$$

The value of $p_{i,j},  q_{i,j}, a_{i,j}, u_{i,j}, v_{i,j}, b_{i,j}$ are divided into 6 cases based on $A_{i, j}$ and $B_{i, j}$:

| Cases | $\begin{bmatrix} p_{i,j} & q_{i,j} \\ u_{i,j} & v_{i,j} \end{bmatrix}$ | $\begin{bmatrix} a_{i,j} \\ b_{i,j} \end{bmatrix}$ |
| :---: | :---: | :---: |
| $A \ge 0, B \ge 0$ | $\begin{bmatrix} \mathbf{u_x}_{j} & 0 \\ 0 & \mathbf{u_y}_j \end{bmatrix}$ | $\begin{bmatrix} \mathbf{ub_x}_j \\ \mathbf{ub_y}_j \end{bmatrix}$ |
| $A \le 0, B + A \ge 0$ | $\begin{bmatrix}\mathbf{l_{\Delta x}}_{j} & \mathbf{l_{\Delta x}}_{j} + \mathbf{u_y}_{j} \\0 & \mathbf{u_y}_j\end{bmatrix}$ | $\begin{bmatrix} \mathbf{lb_{\Delta x}}_j + \mathbf{ub_y}_j \\ \mathbf{ub_y}_j \end{bmatrix}$ |
| $A \le 0, B + A \le 0$ | $\begin{bmatrix} \mathbf{l_x}_{j} & 0 \\ \mathbf{l_x}_{j} - \mathbf{l_{\Delta x}}_{j} & -\mathbf{l_{\Delta y}}_j \end{bmatrix}$ | $\begin{bmatrix} \mathbf{lb_x}_j \\ \mathbf{lb_x}_j - \mathbf{lb}_{\Delta} \end{bmatrix}$ |
| $A \le 0, B \le 0$ | $\begin{bmatrix} \mathbf{l_x}_{j} & 0 \\ 0 & \mathbf{l_y}_j \end{bmatrix}$ | $\begin{bmatrix} \mathbf{lb_x}_j \\ \mathbf{lb_y}_j \end{bmatrix}$ |
| $A \ge 0, B + A \le 0$ | $\begin{bmatrix}\mathbf{u_{\Delta x}}_{j} & \mathbf{u_{\Delta x}}_{j} + \mathbf{l_y}_{j} \\0 & \mathbf{l_y}_j\end{bmatrix}$ | $\begin{bmatrix} \mathbf{ub_{\Delta x}}_j + \mathbf{lb_y}_j \\ \mathbf{lb_y}_j \end{bmatrix}$ |
| $A \ge 0, B + A \ge 0$ | $\begin{bmatrix} \mathbf{u_x}_{j} & 0 \\ \mathbf{u_x}_{j} - \mathbf{u_{\Delta x}}_{j} & -\mathbf{u_{\Delta y}}_j \end{bmatrix}$ | $\begin{bmatrix} \mathbf{ub_x}_j \\ \mathbf{ub_x}_j - \mathbf{ub}_{\Delta} \end{bmatrix}$ |