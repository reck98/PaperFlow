# Advanced Mathematical Physics & Calculus

Author: Department of Mathematics
Preset: Academic Notes

## 1. Classical and Relativistic Energy

The fundamental relationship between mass and energy for a particle at rest is given by:

$$E = m_0 c^2$$

In motion, with momentum vector $\mathbf{p} = (p_x, p_y, p_z)$, the dispersion relation generalizes to:

$$E = \sqrt{(m_0 c^2)^2 + \|\mathbf{p}\|^2 c^2}$$

Expanding for non-relativistic velocities $v \ll c$:

$$E \approx m_0 c^2 + \frac{1}{2} m_0 v^2 + \frac{3}{8} m_0 \frac{v^4}{c^2} + \mathcal{O}\left(\frac{v^6}{c^4}\right)$$

---

## 2. Integral Calculus & Multivariable Analysis

Consider a smooth scalar field $\phi(x, y, z)$ and vector field $\mathbf{A}(x, y, z)$. Stokes' theorem on a compact 2-manifold $\Sigma$ with boundary $\partial\Sigma = \Gamma$:

$$\oint_\Gamma \mathbf{A} \cdot d\mathbf{r} = \iint_\Sigma (\nabla \times \mathbf{A}) \cdot \mathbf{\hat{n}}\, dS$$

The Gaussian integral evaluation in $n$ dimensions:

$$\int_{-\infty}^\infty e^{-a x^2}\, dx = \sqrt{\frac{\pi}{a}}, \quad \text{for } a > 0$$

Generalizing to multidimensional integrals with symmetric positive-definite matrix $\mathbf{K}$:

$$\int_{\mathbb{R}^n} \exp\left(-\frac{1}{2} \mathbf{x}^\top \mathbf{K} \mathbf{x} + \mathbf{J}^\top \mathbf{x}\right) d^n\mathbf{x} = \frac{(2\pi)^{n/2}}{\sqrt{\det \mathbf{K}}} \exp\left(\frac{1}{2} \mathbf{J}^\top \mathbf{K}^{-1} \mathbf{J}\right)$$

---

## 3. Infinite Series and Asymptotic Expansions

The Riemann zeta function $\zeta(s)$ defined for $\Re(s) > 1$:

$$\zeta(s) = \sum_{n=1}^\infty \frac{1}{n^s} = \prod_{p \text{ prime}} \frac{1}{1 - p^{-s}}$$

The Basel problem solution:

$$\sum_{k=1}^\infty \frac{1}{k^2} = 1 + \frac{1}{4} + \frac{1}{9} + \frac{1}{16} + \cdots = \frac{\pi^2}{6}$$
