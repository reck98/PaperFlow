# Linear Algebra, Matrices & Aligned Structures

Author: Applied Mathematics Laboratory

## 1. Matrix Inversion & Transformations

Given a square $2 \times 2$ real matrix $\mathbf{M} \in \mathbb{R}^{2 \times 2}$:

$$\mathbf{M} = \begin{pmatrix} a & b \\ c & d \end{pmatrix}$$

The determinant is $\det(\mathbf{M}) = ad - bc$. Assuming $\det(\mathbf{M}) \neq 0$, the inverse is:

$$\mathbf{M}^{-1} = \frac{1}{ad - bc} \begin{pmatrix} d & -b \\ -c & a \end{pmatrix}$$

For a general $3 \times 3$ matrix:

$$\mathbf{A} = \begin{bmatrix}
a_{11} & a_{12} & a_{13} \\
a_{21} & a_{22} & a_{23} \\
a_{31} & a_{32} & a_{33}
\end{bmatrix}$$

---

## 2. Aligned System of Equations

Maxwell's microscopic equations in differential form:

$$\begin{aligned}
\nabla \cdot \mathbf{E} &= \frac{\rho}{\varepsilon_0} \\
\nabla \cdot \mathbf{B} &= 0 \\
\nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t} \\
\nabla \times \mathbf{B} &= \mu_0 \mathbf{J} + \mu_0 \varepsilon_0 \frac{\partial \mathbf{E}}{\partial t}
\end{aligned}$$

Derivation of energy flux continuity via Poynting's theorem:

$$\begin{aligned}
\mathbf{S} &= \frac{1}{\mu_0} (\mathbf{E} \times \mathbf{B}) \\
u &= \frac{1}{2} \left( \varepsilon_0 \|\mathbf{E}\|^2 + \frac{1}{\mu_0} \|\mathbf{B}\|^2 \right) \\
\frac{\partial u}{\partial t} + \nabla \cdot \mathbf{S} &= -\mathbf{J} \cdot \mathbf{E}
\end{aligned}$$

---

## 3. Piecewise Functions and Cases

The Heaviside step function and Dirac delta limit:

$$\Theta(x) = \begin{cases}
0, & \text{if } x < 0 \\
\frac{1}{2}, & \text{if } x = 0 \\
1, & \text{if } x > 0
\end{cases}$$

The signum function:

$$\text{sgn}(x) = \begin{cases}
-1, & x < 0 \\
0, & x = 0 \\
1, & x > 0
\end{cases}$$
