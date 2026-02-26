# Top-K


Paper: [Haurum2023](https://arxiv.org/pdf/2308.04657)

Code: [topk](https://github.com/JoakimHaurum/TokenReduction/blob/main/models/topk.py)

## Overview

```py
cls_attn = attn[:, :, 0, 1:]  # [B, H, N-1]
cls_attn = cls_attn.mean(dim=1)  # [B, N-1]
_, idx = torch.topk(cls_attn, left_tokens, dim=1, largest=True, sorted=True)  # [B, left_tokens]
index = idx.unsqueeze(-1).expand(-1, -1, C)  # [B, left_tokens, C]

non_cls = x[:, 1:]
x_others = torch.gather(non_cls, dim=1, index=index)  # [B, left_tokens, C]
x = torch.cat([x[:, 0:1], x_others], dim=1)
```

Scoring Method: Attention between spatial tokens and the [CLS] token.

* `torch.topk`: Returns the k largest elements of the given input tensor along a given dimension. The function returns a namedtuple (values, indices) where values is the k largest elements and indices is the indices of the k largest elements in the original input tensor.
* `torch.gather`: Gathers values along an axis specified by dim. For a 3-D tensor, if dim = 1, then for each value in the output tensor, it is equal to input[i][index[i][j][k]][k] where i, j, k are the indices of the output tensor.

## Formalization for Linearization

The code above can be simplified into the following code (Python-like syntax).

```py
# N is the number of non-class tokens, C is the feature dimension, and k is the number of tokens to keep.
def topk_pruning(X: Tensor[N+1, C], attn: Tensor[N+1, N+1], k: int) -> Tensor[k+1, C]:
    X_non_cls = X[1:]  # [N, C]
    scores = attn[0, 1:] # [N]
    X_new = sort_by_key(X_non_cls, scores, descending=True)  # [N, C]
    return torch.cat([X[0:1], X_new[:k]], dim=0)

def sort_by_key(X: Tensor[N, C], key: Tensor[N], descending: bool = False) -> Tensor[N, C]:
    sorted_indices = torch.argsort(key, dim=0, descending=descending)  # [N]
    return X[sorted_indices]  # [N, C]
```

For linearization, I rewrite the code above into the following code, using the `heaviside` function and `delta1` function defined as follows.

```py
def heaviside(x: Tensor) -> Tensor:
    return float(x > 0)

def delta1(x: Tensor) -> Tensor:
    return float(x == 0)

def sort_by_key(X: Tensor[N, C], key: Tensor[N], descending: bool = False) -> Tensor[N, C]:
    if descending:
        return [kth_largest(X, key, i) for i in range(N)]
    else:
        return [kth_smallest(X, key, i) for i in range(N)]

def kth_largest(X: Tensor[N, C], key: Tensor[N], k: int) -> Tensor[C]:
    for i in range(N):
        num_greater[i] = sum<j>(heaviside(key[j] - key[i]))

    return sum<i>(delta1(num_greater[i] - k) * X[i])
```
