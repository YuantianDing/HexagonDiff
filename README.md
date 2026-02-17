
# HexagonDiff

HexagonDiff is a Python tool for differential verification of deep neural networks (DNNs) on Hexagon DSPs. It compares the outputs of two DNN implementations to identify discrepancies and ensure correctness.

## Command-line Usage

To use HexagonDiff, run the following command in your terminal:

```bash
Usage: hexagon_diff [options] <nn1> <nn2> <spec>

    <nn1> and <nn2> are the paths to the two DNN implementations to be compared (ONNX format).
    <spec> is the input specification file (VNNLIB).


Options:
  --epsilon EPSILON     Verify Epsilon Equivalence (L-infinity norm); provides the epsilon value (type: Float64, default: -Inf)
  --top-1               Verify Top-1 Equivalence
  --timeout TIMEOUT     Timeout for verification (type: Int64, default: 0)
  -h, --help            Show this help message and exit
  -v, --verbose         Enable verbose output for detailed comparison results
```

Note that one single VNNLIB specification file is used for both DNNs, and the specification must be in the form of $\mathbf{lb} \le \mathbf{x} \le \mathbf{ub}$, where $\mathbf{lb}$ and $\mathbf{ub}$ are the lower and upper bounds of the input, respectively. Examples are available in the `examples` directory.

## Dependencies

HexagonDiff relies on the following libraries:

- `onnx`: For parsing ONNX models.
- `numpy`: For linear algebra operations.
- `triton`: For GPU acceleration of verification code.

