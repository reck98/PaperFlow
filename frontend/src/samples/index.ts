export interface SampleDoc {
  id: string;
  title: string;
  description: string;
  preset: 'academic' | 'technical' | 'minimal' | 'research';
  metadata: {
    title: string;
    author: string;
    subtitle: string;
    date: string;
    abstract: string;
  };
  markdown: string;
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'sample-physics',
    title: 'Theoretical Physics & Quantum Mechanics',
    description: 'Relativity, Maxwell equations, matrices, and fundamental constants',
    preset: 'academic',
    metadata: {
      title: 'Principles of Modern Theoretical Physics',
      subtitle: 'Lecture Notes on Quantum Field Theory & Electrodynamics',
      author: 'Prof. Julian S. Schwinger',
      date: 'Autumn Semester 2026',
      abstract: 'An analytical introduction to classical field theory, relativistic invariance, and quantum mechanical wave equations. We derive Maxwell’s equations in differential form, examine energy-momentum four-vectors, and analyze matrix representations of unitary group operators.',
    },
    markdown: `# 1. Special Relativity and Relativistic Invariance

The foundation of special relativity rests upon the invariance of the spacetime interval $ds^2$ under Lorentz transformations. For an infinitesimal displacement in Minkowski spacetime:

$$ds^2 = -c^2 dt^2 + dx^2 + dy^2 + dz^2 = \\eta_{\\mu\\nu} dx^\\mu dx^\\nu$$

where $\\eta_{\\mu\\nu} = \\text{diag}(-1, 1, 1, 1)$ denotes the metric tensor.

The relativistic mass-energy relation for a particle with rest mass $m_0$ and relativistic momentum $\\mathbf{p}$ is:

$$E^2 = (m_0 c^2)^2 + (\\mathbf{p} c)^2$$

In the rest frame where $\\mathbf{p} = \\mathbf{0}$, this naturally reduces to Einstein's celebrated formulation:

$$E = m_0 c^2$$

---

# 2. Classical Electrodynamics & Maxwell's Equations

The unified dynamics of classical electromagnetic fields are expressed by Maxwell's four differential equations:

$$\\begin{aligned}
\\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\varepsilon_0} && \\text{(Gauss's Law)} \\\\
\\nabla \\cdot \\mathbf{B} &= 0 && \\text{(Gauss's Law for Magnetism)} \\\\
\\nabla \\times \\mathbf{E} &= -\\frac{\\partial \\mathbf{B}}{\\partial t} && \\text{(Faraday's Law of Induction)} \\\\
\\nabla \\times \\mathbf{B} &= \\mu_0 \\mathbf{J} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t} && \\text{(Ampère-Maxwell Law)}
\\end{aligned}$$

### Vector Calculus & Divergence Theorem

For any differentiable vector field $\\mathbf{F}$ defined over a compact volume $V \\subset \\mathbb{R}^3$ with smooth boundary $\\partial V = S$:

$$\\iiint_V (\\nabla \\cdot \\mathbf{F})\\, dV = \\oiint_S (\\mathbf{F} \\cdot \\mathbf{\\hat{n}})\\, dS$$

---

# 3. Quantum Mechanics & Wave Equations

The time-dependent Schrödinger equation governing the state vector $|\\psi(t)\\rangle$ is:

$$i\\hbar \\frac{\\partial}{\\partial t} |\\psi(t)\\rangle = \\hat{H} |\\psi(t)\\rangle$$

For a particle moving in a spatial potential $V(\\mathbf{r})$:

$$-\\frac{\\hbar^2}{2m} \\nabla^2 \\psi(\\mathbf{r}, t) + V(\\mathbf{r})\\psi(\\mathbf{r}, t) = i\\hbar \\frac{\\partial \\psi(\\mathbf{r}, t)}{\\partial t}$$

### Pauli Spin Matrices

The observable spin operators for spin-$1/2$ systems are represented by the Hermitian Pauli matrices:

$$\\sigma_x = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}, \\quad 
\\sigma_y = \\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}, \\quad 
\\sigma_z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}$$

The commutator algebra satisfies:

$$[\\sigma_j, \\sigma_k] = 2i \\sum_{l=1}^3 \\epsilon_{jkl} \\sigma_l$$

---

# 4. Table of Fundamental Physical Constants

The numerical values adopted for standard calculations:

| Constant | Symbol | Value | Units |
| :--- | :---: | :--- | :--- |
| Speed of Light | $c$ | $2.99792458 \\times 10^8$ | $\\text{m}\\cdot\\text{s}^{-1}$ |
| Planck's Constant | $h$ | $6.62607015 \\times 10^{-34}$ | $\\text{J}\\cdot\\text{s}$ |
| Reduced Planck Constant | $\\hbar = \\frac{h}{2\\pi}$ | $1.054571817 \\times 10^{-34}$ | $\\text{J}\\cdot\\text{s}$ |
| Gravitational Constant | $G$ | $6.67430 \\times 10^{-11}$ | $\\text{m}^3\\cdot\\text{kg}^{-1}\\cdot\\text{s}^{-2}$ |
| Elementary Charge | $e$ | $1.602176634 \\times 10^{-19}$ | $\\text{C}$ |
| Electron Rest Mass | $m_e$ | $9.1093837 \\times 10^{-31}$ | $\\text{kg}$ |

---

# 5. Computational Simulation

\`\`\`python
import numpy as np

def compute_wavepacket(x: np.ndarray, t: float, k0: float = 5.0, sigma: float = 1.0) -> np.ndarray:
    """
    Computes a 1D Gaussian wavepacket propagating in free space.
    """
    hbar = 1.0545718e-34
    m = 9.1093837e-31
    omega = (hbar * k0**2) / (2.0 * m)
    
    envelope = np.exp(-((x - (hbar * k0 / m) * t)**2) / (4.0 * sigma**2))
    phase = np.exp(1j * (k0 * x - omega * t))
    return (1.0 / (2.0 * np.pi * sigma**2)**0.25) * envelope * phase
\`\`\`

> "Mathematics is not merely a tool for physics; it is the language in which nature herself dictates the laws of the universe." — Paul Dirac
`,
  },
  {
    id: 'sample-ml',
    title: 'Machine Learning & Statistical Optimization',
    description: 'Gradient descent, loss formulations, and multivariate Gaussian distributions',
    preset: 'technical',
    metadata: {
      title: 'Mathematical Foundations of Deep Optimization',
      subtitle: 'Convergence Bounds and Empirical Risk Minimization',
      author: 'Applied Machine Learning Research Group',
      date: 'November 2026',
      abstract: 'We review foundational concepts in convex optimization, stochastic gradient descent with momentum, and covariance estimation for continuous random vectors.',
    },
    markdown: `# 1. Empirical Risk Minimization

Let $\\mathcal{D} = \\{(\\mathbf{x}_i, y_i)\\}_{i=1}^N$ be a training dataset drawn i.i.d. from distribution $\\mathcal{P}$. The empirical risk objective parameterized by weights $\\mathbf{w} \\in \\mathbb{R}^d$ is:

$$\\mathcal{R}_N(\\mathbf{w}) = \\frac{1}{N} \\sum_{i=1}^N \\mathcal{L}(f(\\mathbf{x}_i; \\mathbf{w}), y_i) + \\frac{\\lambda}{2} \\|\\mathbf{w}\\|_2^2$$

where $\\mathcal{L}(\\hat{y}, y)$ denotes the convex loss function and $\\lambda > 0$ represents the $L_2$ regularization coefficient.

### Gradient Descent with Momentum

The parameter updates under classical Polyak momentum are governed by:

$$\\begin{aligned}
\\mathbf{v}_{t+1} &= \\beta \\mathbf{v}_t + \\alpha \\nabla_{\\mathbf{w}} \\mathcal{R}_N(\\mathbf{w}_t) \\\\
\\mathbf{w}_{t+1} &= \\mathbf{w}_t - \\mathbf{v}_{t+1}
\\end{aligned}$$

with learning rate $\\alpha > 0$ and momentum hyperparameter $\\beta \\in [0, 1)$.

---

# 2. Multivariate Normal Distribution

For a random vector $\\mathbf{X} \\in \\mathbb{R}^k$ with mean vector $\\boldsymbol{\\mu} \\in \\mathbb{R}^k$ and positive-definite covariance matrix $\\boldsymbol{\\Sigma} \\in \\mathbb{R}^{k \\times k}$:

$$p(\\mathbf{x}; \\boldsymbol{\\mu}, \\boldsymbol{\\Sigma}) = \\frac{1}{(2\\pi)^{k/2} \\det(\\boldsymbol{\\Sigma})^{1/2}} \\exp\\left( -\\frac{1}{2} (\\mathbf{x} - \\boldsymbol{\\mu})^\\top \\boldsymbol{\\Sigma}^{-1} (\\mathbf{x} - \\boldsymbol{\\mu}) \\right)$$

The sample covariance estimator is defined by:

$$\\mathbf{S} = \\frac{1}{N - 1} \\sum_{i=1}^N (\\mathbf{x}_i - \\mathbf{\\bar{x}})(\\mathbf{x}_i - \\mathbf{\\bar{x}})^\\top$$

| Method | Convergence Rate | Memory Complexity | Best Suited For |
| :--- | :--- | :--- | :--- |
| Standard SGD | $\\mathcal{O}(1/\\sqrt{T})$ | $\\mathcal{O}(d)$ | Large-scale deep learning |
| AdamW | Adaptive | $\\mathcal{O}(2d)$ | Transformer models |
| L-BFGS | Superlinear | $\\mathcal{O}(m \\cdot d)$ | Small batch convex problems |
`,
  },
  {
    id: 'sample-minimal',
    title: 'Minimal Editorial Essay',
    description: 'Clean typographic layout for long-form essays and monographs',
    preset: 'minimal',
    metadata: {
      title: 'On the Craft of Mathematical Typography',
      subtitle: 'From Lead Typesetting to Digital Precision',
      author: 'Antigravity Press',
      date: '2026',
      abstract: 'A short reflection on readability, symbol spacing, and visual harmony in scientific publishing.',
    },
    markdown: `# The Harmony of Word and Symbol

Good typography in mathematical literature does not call attention to itself; it disappears between the reader's eye and the thought of the author.

When Donald Knuth conceived $\\TeX$ in 1977, his stated aim was not merely technological automation, but the revival of fine book printing that had degraded during the transition from hot-metal casting to early phototypesetting.

### The Measure of Elegance

Consider the Euler identity, frequently voted the most beautiful formula in mathematics:

$$e^{i\\pi} + 1 = 0$$

It links five fundamental constants:
- The base of natural logarithms, $e \\approx 2.71828$
- The imaginary unit, $i = \\sqrt{-1}$
- The circle ratio, $\\pi \\approx 3.14159$
- The multiplicative identity, $1$
- The additive identity, $0$

In a well-typeset text, the relation between prose and displayed mathematics maintains consistent vertical pacing. Headings are restrained, margins are generous, and the ink recedes into quiet clarity.
`,
  },
];
