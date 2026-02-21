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

Sorting operation is the same as Top-K. So we only consider the weighted average operation for the extra token. The weighted average operation can be formalized as follows:

$$
\begin{aligned}
\text{ExtraToken}(X, \text{Attn}_0, k) = \sum_{i=1}^N h\left(\sum_{j=1}^N h(\text{Attn}_{0,j} - \text{Attn}_{0,i}) - k\right) X_{i} \text{Attn}_{0,i}
\end{aligned}
$$

The formula above are interpreted as follows: For each token $i$, we count how many tokens have a score higher than it, which is $\displaystyle\sum_{j=1}^N h(\text{Attn}_{0,j} - \text{Attn}_{0,i})$. If the count is greater than $k$, then this token is not in the top-k tokens, and we add its feature weighted by its attention score to the output.

