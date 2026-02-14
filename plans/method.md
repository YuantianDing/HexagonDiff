

# HexagonDiff

HexagonDiff is a C++ tool for differential verification of deep neural networks (DNNs) on Hexagon DSPs. It compares the outputs of two DNN implementations to identify discrepancies and ensure correctness.

## Basics

Use `onnx` library to parse the ONNX models of the two DNN implementations. Extract the computational graph, input/output tensors, and parameters for each layer.

Write your own parser to read the VNNLIB specification file. Assume that the input specifications are in the form of $\mathbf{lb} \le \mathbf{x} \le \mathbf{ub}$, where $\mathbf{lb}$ and $\mathbf{ub}$ are the lower and upper bounds of the input, respectively.

Use `eigen` library for linear algebra operations. Make sure to enable MKL, OpenMP and `-match=native`.

## Differential Network

We assume that two DNN implementations are only different in affine layers, such as convolution and fully-connected layers, which means we can construct a *differential network*. The differential network has the same structure as the original network, except the following differences:

1. Each edge of the network represents two vectors instead of one, where the first vector is the output of the layer in the first DNN and the second vector is the output of the layer in the second DNN. The input layer of the differential network is represented as a tuple $(\mathbf{lb}, \mathbf{ub})$ where $\mathbf{lb}$ and $\mathbf{ub}$ are the lower and upper bounds of the input, respectively. The output layer of the differential network is represented as a tuple $(\mathbf{y}_1, \mathbf{y}_2)$ where $\mathbf{y}_1$ and $\mathbf{y}_2$ are the outputs of the two DNNs, respectively.
2. All non-linear operators (e.g., ReLU, MaxPool) are shared between the two DNNs, which means they take the same input and produce the same output for both DNNs. The affine layers are represented as tuples of their parameters.
3. Each affine layer is represented as a tuple of its parameters, such as weight and bias. For example, a full-connected layer can be represented as a tuple $(\mathbf{W}_1, \mathbf{b}_1, \mathbf{W}_2, \mathbf{b}_2)$ where $\mathbf{W}_1$ and $\mathbf{b}_1$ are the weight and bias of the affine layer in the first DNN, and $\mathbf{W}_2$ and $\mathbf{b}_2$ are those in the second DNN. The differential network use the same non-linear operators as the original DNNs. 

## Verification Methods

`HexagonDiff` verifies the differential network using two interrelated process: *linearization* and *bound propagation*. The linearization process computes the *linear dependent bounds* (`dbound`) for each non-linear operator, which are used to approximate the non-linear operator with linear constraints. Linear dependent bounds for a 1-input 1-output operator is in the following form: 

$$
\mathbf{l_x} \odot \mathbf{x} + \mathbf{lb}_x \le f(\mathbf{x}) \le \mathbf{u_x} \odot \mathbf{x} + \mathbf{ub}_x\\
\mathbf{l_y} \odot \mathbf{y} + \mathbf{lb}_y \le f(\mathbf{y}) \le \mathbf{u_y} \odot \mathbf{y} + \mathbf{ub}_y\\
\mathbf{l_{\Delta x}} \odot \mathbf{x} + \mathbf{l_{\Delta y}} \odot \mathbf{y} + \mathbf{lb}_{\Delta} \le f(\mathbf{x}) - f(\mathbf{y}) \le \mathbf{u_{\Delta x}} \odot \mathbf{x} + \mathbf{u_{\Delta y}} \odot \mathbf{y} + \mathbf{ub}_{\Delta}\\
$$

However, to obtain an accurate linear dependent bound, we need the bound restriction for the input of the non-linear operator. For simplicity of the linearization process, we remove the dependency and use *global bound* (`gbound`) to estimate the input of the non-linear operator, which is in the following form:

$$
\mathbf{lx} \le \mathbf{x} \le \mathbf{ux}\\
\mathbf{ly} \le \mathbf{y} \le \mathbf{uy}\\
\mathbf{ld} \le \mathbf{x} - \mathbf{y} \le \mathbf{ud}\\
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