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


## Formalization for Linearization

The only operation that prevents linearization is the sorting operation in Top-K. The sorting operation can be formalized as follows:

$$
\begin{aligned}
\text{Kth-Best}(X, \mathbf{m}, k) &= \text{sort-by}_\text{dec}(\mathbf{x}, \mathbf{m})[k - 1]\\
&= \sum_{i=1}^N \delta\left(\sum_{j=1}^N h(\mathbf{m}_j - \mathbf{m}_i) - k\right) X_{i} \\
\end{aligned}
$$

where 
$$
\begin{gathered}
\delta(x) = \mathbf{1}[x = 0] \\
h(x) = \mathbf{1}[x \ge 0] \\
\end{gathered}
$$

The formula above are interpreted as follows: For each token $i$, we count how many tokens have a score higher than it, which is $\displaystyle\sum_{j=1}^N h(\mathbf{m}_j - \mathbf{m}_i)$. If the count is $k$, then this token is the k-th best token, and we add its feature to the output.

By linearizing the $\delta$ and $h$ functions, we can linearize the Top-K operation. 

