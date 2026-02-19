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

In addition to TopK method, EViT adds an extra token, which is the weighted average of the non-topk tokens, where the weight is the attention between the non-topk tokens and the [CLS] token. 

