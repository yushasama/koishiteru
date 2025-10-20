# Matrix Exponentiation (When DP is Naive, Use Linear Algebra)

Yep, you read that absolutely right: there exist problems where your clever dynamic programming solution is actually the **naive** solution.

Don’t believe me? Try solving this Fibonacci problem, https://cses.fi/problemset/task/1722 with DP & lmk if you get DP or not.

---

## 0) **Introduction**

So what the hell is matrix exponentiation and why do CP grinders love it?

First step: understand **linear recurrences**.

---

### **Linear Recurrence Refresher**

A **recurrence relation** defines each term of a sequence from previous ones.  
A **linear recurrence** means the next term is a **linear combination** of the last $k$ terms:

$$
\boxed{\displaystyle f(n) = c_1 f(n-1) + c_2 f(n-2) + \cdots + c_k f(n-k).}
$$

- **Linear** = only “coefficient $\times$ old term” plus additions; no squaring, no $\min/\max$.
- The number of past terms ($k$) is the **order**.
- Once you know the first $k$ values, the rest is determined.

**Classic examples**

- Fibonacci: $F(n)=F(n-1)+F(n-2)$.
- Tribonacci: $T(n)=T(n-1)+T(n-2)+T(n-3)$.
- Weighted: $a(n)=2\,a(n-1)-a(n-2)$.

**Non-examples (nonlinear)**

- $f(n)=f(n-1)\cdot f(n-2)$.
- $f(n)=f(n-1)^2$.
- $f(n)=\min\{f(n-1), f(n-2)\}$.

**Big picture:** future $=$ weighted sum of past.

**Note:**
All linear recurrence problems are DP problems -> you can optimize with matrix exponentials. But not all DP problems have a linear recurrence structure.

---

### **Why Matrix Exponentiation?**

Linear recurrences can be written as a matrix multiplying a **state vector**. Instead of computing $f(n)$ step by step (which dies at $n\sim10^{12}$), raise the matrix to a power with **binary exponentiation** and jump straight there.

**Pipeline:**  
Recurrence $\to$ State Vector $\to$ Transition Matrix $\to$ Fast Exponentiation $\to$ Result.

**What is Matrix Exponentiation?**  
Take a linear recurrence/DP and rewrite it as
$$
\text{State}(n) = T\,\text{State}(n-1).
$$
Then jump to $n$ by computing $T^{n-1}$ (or $T^n$, see indexing below).

**Why Is It Useful?**  
If you only need the $n$‑th value and $n$ is massive (e.g., $10^{12}$), simulating every step **dies in brute**. Raising $T$ with fast (binary) exponentiation is easy.

---

## 1) **Speed First: Why Binary Exponentiation Is Stupid Fast**

**Goal:** compute $T^p$ without multiplying by $T$ $p$ times.
$$
T^{15} = T^{8}\,T^{4}\,T^{2}\,T^{1}.
$$
(Powers of the **same** matrix commute, so order doesn’t matter.)

**Why it’s fast.**  
You do $O(\log p)$ squarings and at most $O(\log p)$ multiplies to combine them.  

With naive $k\times k$ multiply at $O(k^3)$, total is **$O(k^3\log p)$**.  

Rule of thumb: good for $k\lesssim 50$ per test (constraints matter).

**Minimal code**
```cpp
Matrix mpow(Matrix base, long long p) {
    Matrix ans(base.n, base.mod, /*identity=*/true);
    while (p > 0) {
        if (p & 1LL) ans = ans * base;  // include this power if current bit is 1
        base = base * base;             // square: T -> T^2 -> T^4 -> ...
        p >>= 1;                        // shift exponent right
    }
    return ans;
}
```

---

## 2) **From DP to Linear Algebra (General Recipe)**

Start with a $k$‑term linear recurrence:
$$
\displaystyle f(n) = c_1 f(n-1) + c_2 f(n-2) + \cdots + c_k f(n-k).
$$

**State vector** = just enough info to advance one step:
$$
\text{State}(n) =
\begin{bmatrix}
 f(n)\\
 f(n-1)\\
 \vdots \\
 f(n-k+1)
\end{bmatrix}.
$$

There’s a $k\times k$ **transition (companion) matrix** $T$ such that
$$
T=\begin{bmatrix}
 c_1 & c_2 & \cdots & c_{k-1} & c_k\\
 1   & 0   & \cdots & 0       & 0\\
 0   & 1   & \cdots & 0       & 0\\
 \vdots & \vdots & \ddots & \vdots & \vdots\\
 0 & 0 & \cdots & 1 & 0
\end{bmatrix},
\qquad
\text{State}(n) = T\,\text{State}(n-1).
$$

Unroll:
$$
\text{State}(n) = T^{\,n-1}\,\text{State}(1).
$$

**When is it $T^n$ vs $T^{n-1}$?**
- Base at **step 1** (you know $\text{State}(1)$) $\Rightarrow$ $\text{State}(n)=T^{n-1}\,\text{State}(1)$.
- Base at **step 0** (you know $\text{State}(0)$) $\Rightarrow$ $\text{State}(n)=T^{n}\,\text{State}(0)$.

It’s just indexing. Align it with your base case. **Don’t overthink**—pick the natural base.

---

## 3) **Worked Example: Fibonacci (2×2)**

Recurrence: $F(n)=F(n-1)+F(n-2)$, with $F(0)=0,\;F(1)=1$.

**State and Transition**

$$
\text{State}(n) =
\begin{bmatrix}
F(n) \\
F(n-1)
\end{bmatrix},\qquad
T =
\begin{bmatrix}
1 & 1 \\
1 & 0
\end{bmatrix}.
$$

**Check**

$$
T \begin{bmatrix} F(n-1) \\ F(n-2) \end{bmatrix}
= \begin{bmatrix} F(n-1)+F(n-2) \\ F(n-1) \end{bmatrix}
= \begin{bmatrix} F(n) \\ F(n-1) \end{bmatrix}.
$$

So the recurrence matches.

**Base case and small test**

Pick base
$$
\text{State}(1)=\begin{bmatrix}1\\0\end{bmatrix},
$$
so
$$
\text{State}(n)=T^{n-1}\,\text{State}(1).
$$

Small check:

$$
T^4=\begin{bmatrix}5&3\\3&2\end{bmatrix}
\;\;\Rightarrow\;\; F(5)=5.
$$

### **Fibonacci code (clean)**
```cpp
#include <iostream>
#include <vector>
using namespace std;

using ll = long long;
const long long MOD = 1'000'000'007LL;

struct Matrix {
    int n;
    ll mod;
    vector<vector<ll>> a;
    Matrix(int n, ll mod, bool ident = false) : n(n), mod(mod), a(n, vector<ll>(n, 0)) {
        if (ident) for (int i = 0; i < n; ++i) a[i][i] = 1;
    }
    Matrix operator*(const Matrix& o) const {
        Matrix r(n, mod);
        for (int i = 0; i < n; ++i) {
            for (int k = 0; k < n; ++k) if (a[i][k]) {
                ll aik = a[i][k];
                for (int j = 0; j < n; ++j) {
                    r.a[i][j] = (r.a[i][j] + aik * o.a[k][j]) % mod;
                }
            }
        }
        return r;
    }
};

Matrix mpow(Matrix base, long long p) {
    Matrix ans(base.n, base.mod, true);
    while (p > 0) {
        if (p & 1LL) ans = ans * base;
        base = base * base;
        p >>= 1;
    }
    return ans;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    long long n;
    cin >> n;

    if (n == 0) { cout << 0 << "\n"; return 0; }
    if (n == 1) { cout << 1 << "\n"; return 0; }

    Matrix T(2, MOD);
    T.a = {{1, 1},
           {1, 0}};

    Matrix P = mpow(T, n - 1);
    // State(n) = P * State(1), State(1) = [1, 0]^T
    // F(n) is the top component -> top-left entry of P
    cout << (P.a[0][0] % MOD) << "\n";
    return 0;
}
```

---

## 4) **Another Example: Graph Paths (Exact Length $k$)**

**Task:** number of length‑$k$ paths from node $1$ to node $n$ in a directed (possibly multi‑edge) graph.

### Naive DP (works, but dies if $k$ is huge)

Let
$$
\begin{aligned}
&dp[\ell][u] := \#\{\text{paths of length }\ell\text{ from }1\text{ to }u\},\\
&dp[0][1]=1,\quad dp[0][u\ne1]=0.
\end{aligned}
$$

Transition:
$$
 dp[\ell+1][u] \;=\; \sum_{v} dp[\ell][v]\cdot \#\text{edges}(v\to u).
$$

### Adjacency Matrix View

Build $A$ with **row = from, col = to**:
$$
A[v][u] := \#\text{edges}(v\to u).
$$

Treat $dp[\ell]$ as a **row vector** $[dp[\ell][1],\dots,dp[\ell][n]]$. Then
$$
 dp[\ell+1] = dp[\ell]\,A,\qquad
 dp[k] = dp[0] \; A^k,\qquad
 dp[0] = e_1^\top = [1,0,\dots,0].
$$

Answer for paths $1\to n$ of length $k$ is
$$
 dp[k][n] = (A^k)[1][n] \text{ in 1-indexed math}
 \;\Longleftrightarrow\;
 (A^k)[0][n-1] \text{ in 0-indexed code}.
$$

### **Graph Paths Code**
```cpp
#include <iostream>
#include <vector>
using namespace std;

using ll = long long;
const ll MOD = 1'000'000'007LL;

struct Matrix {
    int n;
    ll mod;
    vector<vector<ll>> a;
    Matrix(int n, ll mod, bool ident = false) : n(n), mod(mod), a(n, vector<ll>(n, 0)) {
        if (ident) for (int i = 0; i < n; ++i) a[i][i] = 1;
    }
    Matrix operator*(const Matrix& o) const {
        Matrix r(n, mod);
        for (int i = 0; i < n; ++i) {
            for (int k = 0; k < n; ++k) if (a[i][k]) {
                ll aik = a[i][k];
                for (int j = 0; j < n; ++j) {
                    r.a[i][j] = (r.a[i][j] + aik * o.a[k][j]) % mod;
                }
            }
        }
        return r;
    }
};

Matrix mpow(Matrix base, long long p) {
    Matrix ans(base.n, base.mod, true);
    while (p > 0) {
        if (p & 1LL) ans = ans * base;
        base = base * base;
        p >>= 1;
    }
    return ans;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m; long long k;
    cin >> n >> m >> k;

    Matrix A(n, MOD); // A[from][to]
    for (int i = 0; i < m; ++i) {
        int from, to; // edge from -> to, 1-indexed input
        cin >> from >> to;
        --from; --to;
        A.a[from][to] = (A.a[from][to] + 1) % MOD; // row=from, col=to
    }

    Matrix Ak = mpow(A, k);

    // dp[0] = e1^T picks the first row when multiplying on the left:
    // dp[k][n] = (e1^T * A^k)[n] = (A^k)[0][n-1]
    cout << Ak.a[0][n-1] << "\n";
    return 0;
}
```

**Why multi‑edges become counts:** each parallel edge is a distinct choice in a path, so it adds $+1$ into $A[\text{from}][\text{to}]$.

---

## 5) **How to Define the State & Transition (Formal Derivation)**

### 5.1 General $k$‑term linear recurrence

Given
$$
 f(n) = c_1 f(n-1) + c_2 f(n-2) + \cdots + c_k f(n-k),
$$

define the **state**
$$
S(n)=\begin{bmatrix}
 f(n)\\
 f(n-1)\\
 \vdots \\
 f(n-k+1)
\end{bmatrix}.
$$

Then
$$
S(n) =
\underbrace{\begin{bmatrix}
 c_1 & c_2 & \cdots & c_{k-1} & c_k\\
 1   & 0   & \cdots & 0       & 0\\
 0   & 1   & \cdots & 0       & 0\\
 \vdots & \vdots & \ddots & \vdots & \vdots\\
 0 & 0 & \cdots & 1 & 0
\end{bmatrix}}_{T}
\, S(n-1),\qquad
S(n)=T^{\,n-n_0}S(n_0).
$$

Pick $n_0$ so all entries of $S(n_0)$ are known (e.g., $n_0=k$ if you’re given $f(1\dots k)$).

---

### 5.2 Fibonacci
$$
S(n)=\begin{bmatrix}F(n)\\ F(n-1)\end{bmatrix},\quad
T=\begin{bmatrix}1&1\\ 1&0\end{bmatrix},\quad
S(n)=T\,S(n-1),\quad S(1)=\begin{bmatrix}1\\0\end{bmatrix}.
$$

---

### 5.3 Tribonacci

**Recurrence & Bases**
$$
\mathrm{Tri}(n)=\mathrm{Tri}(n-1)+\mathrm{Tri}(n-2)+\mathrm{Tri}(n-3),\quad
\mathrm{Tri}(0)=0,\;\mathrm{Tri}(1)=0,\;\mathrm{Tri}(2)=1.
$$

**State and Transition**
$$
S(n)=\begin{bmatrix}
 \mathrm{Tri}(n)\\
 \mathrm{Tri}(n-1)\\
 \mathrm{Tri}(n-2)
\end{bmatrix},\qquad
T=\begin{bmatrix}
 1&1&1\\
 1&0&0\\
 0&1&0
\end{bmatrix},\qquad
S(n)=T\,S(n-1).
$$

Take $S(2)=[1,0,0]^\top$, then $S(n)=T^{\,n-2}S(2)$.

**Compute $S(7)$ ($\mathrm{Tri}(7)$)**

Squares:
$$
T^2=\begin{bmatrix}2&2&1\\1&1&1\\1&0&0\end{bmatrix},\quad
T^4=(T^2)^2=\begin{bmatrix}7&6&4\\4&3&2\\2&2&1\end{bmatrix},\quad
T^5=T^4T=\begin{bmatrix}13&11&7\\7&6&4\\4&3&2\end{bmatrix}.
$$

Jump:
$$
S(7)=T^5 S(2)=\text{first column of }T^5=
\begin{bmatrix}13\\7\\4\end{bmatrix}
\Rightarrow \mathrm{Tri}(7)=13.
$$

---

### 5.4 Graph Paths

Define
$$
 dp[\ell][u] = \#\{\text{paths of length }\ell\text{ from }1\text{ to }u\}.
$$

Let the **state at layer $\ell$** be the **row** vector
$$
S(\ell)\equiv dp[\ell] =
\begin{bmatrix}
 dp[\ell][1] & dp[\ell][2] & \cdots & dp[\ell][n]
\end{bmatrix}.
$$

Build $A$ with **row = from, col = to**:
$$
A[v][u]=\#\text{edges}(v\to u).
$$

Then
$$
 S(\ell+1)=S(\ell)\,A,\qquad S(0)=e_1^\top=[1,0,\dots,0],
$$
so
$$
 S(k)=e_1^\top A^k,\quad
 \#\text{paths }1\to n\text{ of length }k \;=\; (A^k)[1][n] \text{ (1‑index)} \;=\; (A^k)[0][n-1] \text{ (0‑index)}.
$$

---

## 6) **Closing Notes (Pattern + Caveats)**

### **Pattern**
1. **Define state.** Package just enough info into a vector so one step forward is linear.
2. **Build transition $T$.** Write the recurrence as a dot product of coefficients with past state.
3. **Choose base index.** Decide if your base is $\text{State}(0)$ or $\text{State}(1)$.
4. **Compute $T^{\text{power}}$** with **binary exponentiation** — $O(k^3\log n)$.
5. **Multiply once by the base vector.** That gives $\text{State}(n)$.

### **How to Spot it From a Statement**
- The next answer is a **weighted sum** of the last $k$ answers (not min/max/product/square).
- **Coefficients are constant** in $n$ (fixed transition).
- Graph path DP that looks like
  $$dp[\ell+1][u] = \sum_v dp[\ell][v] \cdot \text{edges}(v\to u)$$
  is literally matrix multiplication with your $A[v][u]$.
- If $n$ or $k$ goes up to $10^9$, $10^{12}$, $10^{18}$, step‑by‑step DP is impossible — use matrix expo.

### **Where It Shines**
- Fibonacci/Tribonacci/**any** fixed $k$‑term linear recurrence.
- Population/Markov models.
- Graph path counts of exact length $k$.
- Automata DP (counting strings under constraints).

### **Caveats**
- Always mod after add/mul; use 64‑bit intermediates before mod.
- $O(k^3\log n)$ can die when $k$ is large (and squaring densifies matrices).
- Don’t overkill: if $n$ is small, plain DP may be faster/simpler.

**Aside.** For 1‑D recurrences there’s also the **Kitamasa method**, which targets $f(n)$ without building a full $k\times k$ matrix; out of scope here.


**TLDR**  
If the problem screams “linear recurrence + huge $n$,” DP is naive.  

Answer = Define State $\to$ Build Transition $\to$ Fast Power. Enjoy mogging everyone else.

---

## Recommended Problems
* [USACO Guide - Matrix Exponentiation](https://usaco.guide/plat/matrix-expo)
* [UCLA ICPC Spring Training #4 Contest](https://vjudge.net/contest/628365)