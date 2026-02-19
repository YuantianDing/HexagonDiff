
# POMT: Prune One More Token

Paper: [Eliopoulos2024](https://arxiv.org/pdf/2407.05941)

Code: [POMT](https://github.com/nickjeliopoulos/PruneOneMoreToken)

## Overview

POMT uses a combination of two metrics to determine which token to prune: attention-based metric and magnitude-based metric. 

```py
###
### metric_attn Measures how much each token is attended to by all other tokens - this is a metric to gauge token 'importance'
###
metric_attn = (
    torch.amax(softmax_attn[..., pomt_info.prefix_tokens :, pomt_info.prefix_tokens :], dim=1)
    .sum(dim=1, keepdim=True) # Sum along the 'rows' - this essentially counts how much a particular token is attended to by all other tokens
    .transpose(-2,-1) # Need to reshape into (B, ..., 1) instead of (B, 1, ...) shape
)
# ### Maximum possible value for any score = 1
metric_attn = metric_attn / torch.max(metric_attn)

###
### metric_magnitude estimates information content (magnitude of information) by summing features of V - this is a metric to gauge token 'importance'
###
metric_v = torch.softmax(
    torch.amax(v, dim=1)
    .sum(dim=-1, keepdim=True), # Sum along the # feature per head dimension
    dim=1 # Apply softmax across the sums of features for each token
)[:, pomt_info.prefix_tokens :] # Shave off special tokens, attenuate
### Maximum possible value for any score = 1

###
### Combine Importance Scores
###
metric = (metric_attn + metric_v)
```

Notably, POMT combines multiple heads of attention using a max operation, which is different from the mean operation used in Top-K and EViT. Thus, linearizing MAX operation is necessary for linearizing POMT.

```py
offset = torch.tensor(
    data=[pomt_info.prefix_tokens], dtype=torch.long, device=x.device
)
similarity_indices = metric.argsort(dim=1, descending=True) + offset

### Keep highest scores
kept_indices = similarity_indices[:, :T]
discard_indices = similarity_indices[:, T:]

### Congregate the discarded tokens then take the mean of them
x_discarded = torch.gather(x, dim=1, index=discard_indices.expand(B, discard_indices.shape[1], C)).mean(dim=1, keepdim=True)

### Create pruned x'
x = torch.cat(
    (
        x[:, 0 : pomt_info.prefix_tokens, :],
        torch.gather(x, dim=1, index=kept_indices.expand(B, T, C)),
        x_discarded,
    ),
    dim=1,
)
```

So instead of weighted average of the non-topk tokens in EViT, POMT simply takes the mean of the non-topk tokens as the extra token.
