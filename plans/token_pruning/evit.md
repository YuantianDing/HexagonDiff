# EViT


Paper: [Liang2022](https://arxiv.org/pdf/2202.07800)

Code: [evit](https://github.com/youweiliang/evit/blob/master/evit.py)

Scoring Method: Attention between spatial tokens and the [CLS] token.

## Overview

```py
cls_attn = attn[:, :, 0, 1:]  # [B, H, N-1]
cls_attn = cls_attn.mean(dim=1)  # [B, N-1]
_, idx = torch.topk(cls_attn, left_tokens, dim=1, largest=True, sorted=True)  # [B, left_tokens]
index = idx.unsqueeze(-1).expand(-1, -1, C)  # [B, left_tokens, C]

non_cls = x[:, 1:]
x_others = torch.gather(non_cls, dim=1, index=index)  # [B, left_tokens, C]
compl = complement_idx(idx, N - 1)  # [B, N-1-left_tokens]
non_topk = torch.gather(non_cls, dim=1, index=compl.unsqueeze(-1).expand(-1, -1, C))  # [B, N-1-left_tokens, C]

non_topk_attn = torch.gather(cls_attn, dim=1, index=compl)  # [B, N-1-left_tokens]
extra_token = torch.sum(non_topk * non_topk_attn.unsqueeze(-1), dim=1, keepdim=True)  # [B, 1, C]
x = torch.cat([x[:, 0:1], x_others, extra_token], dim=1)
```

* `torch.topk`: Returns the k largest elements of the given input tensor along a given dimension. The function returns a namedtuple (values, indices) where values is the k largest elements and indices is the indices of the k largest elements in the original input tensor.
* `torch.gather`: Gathers values along an axis specified by dim. For a 3-D tensor, if dim = 1, then for each value in the output tensor, it is equal to input[i][index[i][j][k]][k] where i, j, k are the indices of the output tensor.


In addition to TopK method, EViT adds an extra token, which is the weighted average of the non-topk tokens, where the weight is the attention between the non-topk tokens and the [CLS] token. 


## Formalization for Linearization

The code above can be simplified into the following code, using similar `sort_by_key` as in TopK.

```py
# N is the number of non-class tokens, C is the feature dimension, and k is the number of tokens to keep.
def topk_pruning(X: Tensor[N+1, C], attn: Tensor[N+1, N+1], k: int) -> Tensor[k+2, C]:
    X_non_cls = X[1:]  # [N, C]
    scores = attn[0, 1:] # [N]
    X_new, scores_new = sort_by_key(X_non_cls, scores, descending=True)  # [N, C]
    extra_token = sum(scores_new[i] * X_new[i] for i in range(k, N))  # [1, C]
    return torch.cat([X[0:1], X_new[:k], extra_token], dim=0)

def sort_by_key(X: Tensor[N, C], key: Tensor[N], descending: bool = False) -> (Tensor[N, C], Tensor[N]):
    sorted_indices = torch.argsort(key, dim=0, descending=descending)  # [N]
    return X[sorted_indices], key[sorted_indices]  # [N, C], [N]
```

For linearization, I rewrite the code above into the following code, using the `heaviside` function.

```py
def heaviside(x: Tensor) -> Tensor:
    return float(x > 0)

def topk_pruning(X: Tensor[N+1, C], attn: Tensor[N+1, N+1], k: int) -> Tensor[k+2, C]:
    X_non_cls = X[1:]  # [N, C]
    scores = attn[0, 1:] # [N]
    extra_token = sum<i>(heaviside(scores[i] - scores[k]) * X_non_cls[i])  # [1, C]
    X_new = sort_by_key(X_non_cls, scores, descending=True)  # [N, C]
    return torch.cat([X[0:1], X_new[:k], extra_token], dim=0)

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