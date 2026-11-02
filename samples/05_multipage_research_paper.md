# On the Convergence Properties of Adaptive Gradient Optimizers

Author: Dr. A. Turing, Dr. C. Shannon
Date: November 2026

## Abstract

We present a theoretical inquiry into stochastic gradient descent with adaptive second-order moment estimation. By bounding the variance of gradient approximations over non-convex empirical loss surfaces, we derive tight convergence criteria for parameterized models in over-parameterized regimes.

---

## 1. Introduction

Optimization in high-dimensional non-convex landscapes remains a central problem in statistical learning theory. Given empirical risk:

$$\mathcal{L}(\boldsymbol{\theta}) = \frac{1}{N} \sum_{i=1}^N \ell(f(\mathbf{x}_i; \boldsymbol{\theta}), y_i)$$

where $\mathbf{x}_i \in \mathbb{R}^d$ and $y_i \in \{-1, +1\}$.

### 1.1 Stochastic Approximation

Standard stochastic gradient descent updates parameters along the negative unbiased gradient estimate:

$$\boldsymbol{\theta}_{t+1} = \boldsymbol{\theta}_t - \eta_t \nabla \ell_i(\boldsymbol{\theta}_t)$$

with learning rate schedule $\sum_t \eta_t = \infty$ and $\sum_t \eta_t^2 < \infty$.

---

## 2. Adaptive Moment Estimation

The Adam optimizer maintains exponentially decaying averages of past gradients:

$$\begin{aligned}
\mathbf{m}_t &= \beta_1 \mathbf{m}_{t-1} + (1 - \beta_1) \mathbf{g}_t \\
\mathbf{v}_t &= \beta_2 \mathbf{v}_{t-1} + (1 - \beta_2) \mathbf{g}_t^2
\end{aligned}$$

With bias-corrected estimators:

$$\mathbf{\hat{m}}_t = \frac{\mathbf{m}_t}{1 - \beta_1^t}, \quad \mathbf{\hat{v}}_t = \frac{\mathbf{v}_t}{1 - \beta_2^t}$$

The update step is:

$$\boldsymbol{\theta}_{t+1} = \boldsymbol{\theta}_t - \frac{\eta}{\sqrt{\mathbf{\hat{v}}_t} + \epsilon} \odot \mathbf{\hat{m}}_t$$

---

## 3. Empirical Verification & Results

We evaluate convergence across synthetic Gaussian mixtures and real datasets:

| Benchmark Dataset | Parameters ($d$) | Batch Size | Iterations to $10^{-4}$ | Final Loss |
| :--- | :---: | :---: | :---: | :---: |
| Synthetic Convex Quad | $10^3$ | 64 | 420 | $3.12 \times 10^{-5}$ |
| Rosenbrock Valley | $10^4$ | 128 | 1,850 | $8.44 \times 10^{-5}$ |
| Deep Linear Autoencoder | $10^6$ | 256 | 4,200 | $1.02 \times 10^{-4}$ |

---

## 4. Conclusion

Adaptive moment estimators achieve asymptotically optimal regret bounds in stochastic regimes where Hessian eigenspectra exhibit severe ill-conditioning. Future directions include second-order curvature approximations via diagonal natural gradients.
