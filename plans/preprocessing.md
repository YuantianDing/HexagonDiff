

# Preprocessing (A prompt to AI Code Generation)

HexagonDiff is a C++ tool for differential verification of deep neural networks (DNNs) on Hexagon DSPs. It compares the outputs of two DNN implementations to identify discrepancies and ensure correctness.

## Basics

Use `onnx` library to parse the ONNX models of the two DNN implementations. Extract the computational graph, input/output tensors, and parameters for each layer.

Write your own parser to read the VNNLIB specification file. Assume that the input specifications are in the form of $\mathbf{lb} \le \mathbf{x} \le \mathbf{ub}$, where $\mathbf{lb}$ and $\mathbf{ub}$ are the lower and upper bounds of the input, respectively.

Write most of your operation in `torch`. For operations doesn't exist in torch, write your own implementation using `triton` for GPU acceleration.

## Differential Network

We assume that two DNN implementations are only different in certain layers, such as affine layers and token pruning layers, which means we can construct a *differential network*. The differential network has the same structure as the original network, except the following differences:

1. All non-linear operators (e.g., ReLU, MaxPool) remained the same as in the original two DNNs.
2. If the two networks have different weight and bias in a certain affine layer, in the differential network, we keep weights and biases from both the DNNs: $(W_x, W_y, b_x, b_y)$ as the affine operator in the differential network.
3. We denote each edge of the network as different types of tensors. During the verification of the network, these different type will be bounded differently. At the current stage, we only consider the following types of tensors:
   1. $\mathrm{Eq}(\mathbf{x}, \mathbf{y})$ represents that the two DNNs have the exact same value at this point. Later, we will bound $\mathbf{x}$ and $\mathbf{y}$ using the same bounds: $\mathbf{lb} \le \mathbf{x}, \mathbf{y} \le \mathbf{ub}$.
   2. $\mathrm{Diff}(\mathbf{x}, \mathbf{y})$ represents that the two DNNs have different values but same shape at this point. Later, we will bound $\mathbf{x}$ and $\mathbf{y}$ separately: $\mathbf{lb}_x \le \mathbf{x} \le \mathbf{ub}_x$ and $\mathbf{lb}_y \le \mathbf{y} \le \mathbf{ub}_y$, and with a differential bound: $\mathbf{lb}_d \le \mathbf{y} - \boldsymbol{\beta}\mathbf{x} \le \mathbf{ub}_d, \boldsymbol{\beta} = \frac{\mathbf{uy} - \mathbf{ly}}{\mathbf{ux} - \mathbf{lx}}$.
   3. $\mathrm{Truncate}(\mathbf{x}, \mathbf{y})$ represents that the one vector (tensor) of the differential network is truncated from the other. Later, we will bound the common part of $\mathbf{x}$ and $\mathbf{y}$ using the same bounds as $\mathrm{Diff}$, and bound the truncated part of $\mathbf{y}$ using a single bound of $\mathbf{y}$: $\mathbf{lb}_y \le \mathbf{y} \le \mathbf{ub}_y$.
   4. $\mathrm{TruncateMerge}(\mathbf{x}, \mathbf{y})$ represents that the one vector (tensor) of the differential network is truncated from the other, and the truncated part is merged into the last vector (tensor). In addition to $\mathrm{Truncate}$, we also need to bound the $\mathrm{Diff}$ bounds between every value (tensor) in the truncated part and the merged value (tensor). For example, if vector $\mathbf{y}$ is truncated from vector $\mathbf{x}$, we need to bound $\mathbf{x}$ and $\mathbf{y}$ using $\mathrm{Truncate}$ bounds, and bound the difference between the last element of $\mathbf{y}$ and every element in the truncated part of $\mathbf{x}$ using $\mathrm{Diff}$ bounds.
4. For token pruning of transformers, we use special operators like $\text{TopK}$ and $\text{EViT}$ to represent the token pruning operations, which generates $\mathrm{Truncate}$ and $\mathrm{TruncateMerge}$ types. 

## Conversion to the Differential Network

The following changes has to be made to convert the original two DNNs into the differential network:

* LayerNorm's division needs to be removed, since this part will be difficult for verification.
* Integer tensor operations need to be fused into operators like $\text{TopK}$ and $\text{EViT}$, which will generate $\mathrm{Truncate}$ and $\mathrm{TruncateMerge}$ types. 

After making these changes, we can construct the differential network by merging the two DNNs together. The two DNNs will share the same non-linear operators, and have different weights and biases for affine layers. The types in the differential network are then deduced based on the structure of the network and the differences between the two DNNs. 