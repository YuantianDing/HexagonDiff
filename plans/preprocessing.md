

# Preprocessing (A prompt to AI Code Generation)

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