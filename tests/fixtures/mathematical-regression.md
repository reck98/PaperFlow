# Mathematical Typesetting and Layout Regression Suite

This document serves as the formal regression verification suite for Paperflow's mathematical typesetting, equation numbering, and multi-page layout engine. It exercises native vector mathematics, boundary page-breaking behavior, delimiter escaping, and code-block preservation.

---

# 1. Basic Equations

Fundamental equations demonstrating relativistic energy-momentum equivalence and carrier frequency separation under discrete modulation:

The celebrated mass-energy equivalence relation in flat spacetime:

$$
E = mc^2
$$

The minimum subcarrier frequency separation $\Delta f$ required for coherent orthogonal signaling across interval $T_s$ with subcarrier indices $m$ and $n$:

\[
\Delta f = \frac{k}{(m-n)T_s}
\]

Inline occurrences such as $E = mc^2$ and \(\Delta f = \frac{k}{(m-n)T_s}\) must integrate smoothly into the surrounding prose without excessive line-height distortion or vertical misalignment.

---

# 2. Summation, Sets, and Vectors

Vector notations, prime-accented index components, mathematical set definitions, and boxed equilibrium conditions:

Let $\vec S$ denote the constellation vector defined over the discrete alphabet:

$$
\\{s_1, -s_1, s_2, -s_2\\}
$$

The alternative set notation with single backslashes should also be typeset identically:

$$
\{s_1, -s_1, s_2, -s_2\}
$$

For an $M$-ary balanced modulation alphabet with state vector $\vec s'_m$, the zero-mean condition across all constellation points is formally constrained by the boxed expression:

\[
\boxed{\sum_{m=1}^M \vec s'_m = 0}
\]

The $L_2$ norm and inner product relations for state vectors $\vec{u}$ and $\vec{v}$ satisfy:

\[
\|\vec{u}\|_2 = \sqrt{\sum_{i=1}^d u_i^2}, \quad \vec{u} \cdot \vec{v} = \|\vec{u}\|_2 \|\vec{v}\|_2 \cos \theta
\]

Double-escaped norms must also normalize cleanly without leaking raw backslashes:

\[
\\|\mathbf{w}\\|_2^2 = \sum_{j=1}^k w_j^2
\]

---

# 3. Matrices and Linear Systems

Sylvester-Hadamard transform matrices and Hermitian Pauli spin operators:

The second-order Sylvester-Hadamard matrix $H_2$ normalized by $1/\sqrt{2}$:

\[
H_2 = \frac{1}{\sqrt{2}} \begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}
\]

The recursive fourth-order Hadamard matrix $H_4$ constructed via Kronecker product:

\[
H_4 = H_2 \otimes H_2 = \frac{1}{2} \begin{pmatrix}
1 & 1 & 1 & 1 \\
1 & -1 & 1 & -1 \\
1 & 1 & -1 & -1 \\
1 & -1 & -1 & 1
\end{pmatrix}
\]

The observable spin operators for spin-$1/2$ systems represented by the Hermitian Pauli matrices:

\[
\sigma_x = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \quad
\sigma_y = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}, \quad
\sigma_z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}
\]

The commutator bracket relation satisfies:

\[
[\sigma_j, \sigma_k] = 2i \sum_{l=1}^3 \epsilon_{jkl} \sigma_l
\]

---

# 4. Multiple Equations and System Formulations

A comprehensive formulation of classical electrodynamics, quantum mechanics, and empirical risk minimization, demonstrating more than fifteen distinct mathematical equations with clean alignment and numbering.

### Classical Electrodynamics (Maxwell's Equations)

The four differential field equations unifying electromagnetism:

\begin{aligned}
\nabla \cdot \mathbf{E} &= \frac{\rho}{\varepsilon_0} \\
\nabla \cdot \mathbf{B} &= 0 \\
\nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t} \\
\nabla \times \mathbf{B} &= \mu_0 \mathbf{J} + \mu_0 \varepsilon_0 \frac{\partial \mathbf{E}}{\partial t}
\end{aligned}

The divergence theorem over a compact volume $V \subset \mathbb{R}^3$ with smooth boundary $\partial V = S$:

\[
\iiint_V (\nabla \cdot \mathbf{F}) \, dV = \oiint_S (\mathbf{F} \cdot \hat{\mathbf{n}}) \, dS
\]

### Quantum Mechanical Wave Mechanics

The time-dependent Schrödinger wave equation:

\[
i\hbar \frac{\partial}{\partial t} \psi(\mathbf{r}, t) = \left( -\frac{\hbar^2}{2m} \nabla^2 + V(\mathbf{r}) \right) \psi(\mathbf{r}, t)
\]

The position-momentum uncertainty relation:

\[
\sigma_x \sigma_p \ge \frac{\hbar}{2}
\]

The Gaussian wavepacket dispersion envelope:

\[
\psi(x, t) = \frac{1}{(2\pi \sigma^2)^{1/4}} \exp\left( -\frac{(x - v t)^2}{4\sigma^2} + i(k_0 x - \omega_0 t) \right)
\]

### Statistical Optimization and Deep Learning

The regularized empirical risk objective for training dataset $\mathcal{D} = \{(\mathbf{x}_i, y_i)\}_{i=1}^N$:

\[
\mathcal{R}_N(\mathbf{w}) = \frac{1}{N} \sum_{i=1}^N \mathcal{L}(f(\mathbf{x}_i; \mathbf{w}), y_i) + \frac{\lambda}{2} \|\mathbf{w}\|_2^2
\]

The Polyak heavy-ball momentum recurrence:

\begin{aligned}
\mathbf{v}_{t+1} &= \beta \mathbf{v}_t + \alpha \nabla_{\mathbf{w}} \mathcal{R}_N(\mathbf{w}_t) \\
\mathbf{w}_{t+1} &= \mathbf{w}_t - \mathbf{v}_{t+1}
\end{aligned}

The probability density of a continuous multivariate Gaussian distribution:

\[
p(\mathbf{x}; \boldsymbol{\mu}, \boldsymbol{\Sigma}) = \frac{1}{(2\pi)^{k/2} \det(\boldsymbol{\Sigma})^{1/2}} \exp\left( -\frac{1}{2} (\mathbf{x} - \boldsymbol{\mu})^\top \boldsymbol{\Sigma}^{-1} (\mathbf{x} - \boldsymbol{\mu}) \right)
\]

Euler's identity linking the five fundamental mathematical constants:

\[
e^{i\pi} + 1 = 0
\]

Gaussian integral over the real line:

\[
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
\]

Asymptotic limit definition of Euler's number:

\[
\lim_{n \to \infty} \left(1 + \frac{1}{n}\right)^n = e
\]

---

# 5. Pagination Stress Test and Boundary Equations

This section introduces long technical prose, complex tables, and strategic boundary equations to verify that mathematical expressions and section headings are never truncated or clipped at page margins.

In computational fluid dynamics and high-dimensional optimization, numerical algorithms must maintain high precision across multiple spatial discretization domains. Grid generation techniques often employ algebraic or elliptic solvers to map irregular physical geometries into structured computational domains. The resulting coordinate transformations introduce metric tensors and Jacobian determinants that modulate differential operators throughout the simulation volume.

| Convergence Parameter | Iteration Step ($k$) | Residual Tolerance ($\epsilon$) | Wall Time (s) | Status |
| :--- | :---: | :---: | :---: | :--- |
| First-order Euler | 1500 | $1.2 \times 10^{-4}$ | 42.8 | Converged |
| Second-order Runge-Kutta | 820 | $4.5 \times 10^{-7}$ | 28.1 | Converged |
| Fourth-order Adaptive RK | 310 | $1.0 \times 10^{-9}$ | 14.6 | Optimal |
| Implicit Crank-Nicolson | 450 | $8.0 \times 10^{-10}$ | 19.3 | Stable |

As the system approaches the transition threshold, boundary layer separation occurs when the adverse pressure gradient overcomes the momentum of fluid particles near the bounding wall. This phenomenon is modeled by the Prandtl boundary layer equations under high Reynolds numbers.

The boundary layer thickness $\delta(x)$ over a semi-infinite flat plate in laminar flow is given by the Blasius similarity solution:

\[
\delta(x) \approx 4.91 \sqrt{\frac{\nu x}{U_\infty}}
\]

### Page Boundary Transition Checkpoint

The following multi-line equation is situated near the boundary transition to ensure unbreakable equation rendering across page divides:

\begin{aligned}
\mathcal{F}\{\nabla^2 \phi\}(\mathbf{k}) &= -|\mathbf{k}|^2 \hat{\phi}(\mathbf{k}) \\
\mathcal{F}\left\{\frac{\partial \phi}{\partial t}\right\}(\mathbf{k}) &= \frac{\partial \hat{\phi}(\mathbf{k}, t)}{\partial t} \\
\mathcal{H}_{\text{eff}} &= \int_{\Omega} \left[ \frac{1}{2} |\nabla \phi|^2 + V(\phi) \right] d^d x
\end{aligned}

The stress-energy-momentum tensor $T^{\mu\nu}$ for a perfect fluid in general relativity satisfies the local conservation law:

\[
\nabla_\mu T^{\mu\nu} = 0, \quad \text{where } T^{\mu\nu} = (\rho + p) u^\mu u^\nu + p g^{\mu\nu}
\]

To verify sequential equation numbering across page breaks, the following equations ensure that numbering incrementation remains continuous:

\[
\oint_C \mathbf{A} \cdot d\mathbf{r} = \iint_S (\nabla \times \mathbf{A}) \cdot d\mathbf{S}
\]

\[
\sum_{k=1}^\infty \frac{1}{k^2} = \frac{\pi^2}{6}
\]

\[
\prod_{p \text{ prime}} \frac{1}{1 - p^{-s}} = \zeta(s) = \sum_{n=1}^\infty \frac{1}{n^s}
\]

---

# 6. Raw LaTeX in Fenced Code Blocks

This section verifies that LaTeX equations located inside fenced code blocks are never interpreted as mathematical markup and remain verbatim code.

```latex
% This is raw LaTeX source code that must NOT be converted to mathematical glyphs:
\begin{equation}
\Delta f = \frac{k}{(m-n)T_s}
\end{equation}

$$ \\{s_1,-s_1,s_2,-s_2\\} $$

\[ \boxed{\sum_{m=1}^M \vec s'_m = 0} \]
```

Here is a Python implementation of the same calculation:

```python
import numpy as np

def compute_frequency_offset(k: int, m: int, n: int, Ts: float) -> float:
    """
    Computes \Delta f = \frac{k}{(m - n) T_s}
    Raw LaTeX comments should remain literal and unescaped.
    """
    if m == n:
        raise ValueError("Indices m and n must be distinct.")
    return k / ((m - n) * Ts)
```

Inline code blocks such as `\\[ E = mc^2 \\]` and `$$ \\{s_1, s_2\\} $$` must also remain literal monospace code strings.
