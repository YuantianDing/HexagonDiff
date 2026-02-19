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


