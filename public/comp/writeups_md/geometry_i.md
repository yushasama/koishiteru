# Geometry I - Distance and Movement

Geometry in contests is not only polygon areas and convex hulls.
In practice, CP "geometry" splits into a few big buckets:

* Distances and movement on weird grids
* Lines, orientation, and half-planes
* Polygons, hulls, and cut out regions
* Sweep line with events and closest pair tricks
* Circles, tangents, and intersection formulas
* Advanced transforms that turn geometry into pure algebra

This first part is the most "algorithmic geometry" of the series. You hardly draw any pictures. Instead you:

> Read how you are allowed to move.
> Recognize what metric that movement defines.
> Turn the whole problem into formulas on coordinates.

Movement rules define a norm. Once you know the norm, the problem is usually algebra, not BFS.

Whenever the statement is basically "movement rules plus big coordinates", you are in this house.

* No path simulation on a 1e9 grid
* No Dijkstra on an infinite graph
* Just norms, transforms, and some casework

---

## Series Roadmap

* **Geometry I - Distance and Movement (This One)**
  Movement rules, Manhattan, Chebyshev, rotated grids, hex grids, mixed metrics, linear forms tricks.

* **Geometry II - Lines, Cuts, and Orientation**
  Cross products, orientation tests, line intersection, half-planes, point-line distance, robust predicates.

* **Geometry III - Polygons and Convex Hull**
  Simple polygons, shoelace, convex hulls, point in polygon, supporting lines.

* **Geometry IV - Sweep Line and Closest Pair**
  Event sweeps, segment intersection, closest pair in O(n log n), rectangle union, offline queries.

* **Geometry V - Circles, Arcs and Tangents**
  Circle-line intersection, circle-circle intersection, tangents, arcs, angles.

* **Geometry VI - Similarity and Affine Geometry**
Similarity transforms, scaling, fractals, affine maps, barycentric tricks.

* **Geometry VII - Dynamic Geometry and Line Containers**
Convex hull trick, Li Chao tree, dynamic upper/lower hull maintenance, half-plane intersection via deque, geometry with segment trees.

* **Geometry VIII - Numerical Stability and Robust Geometry**
EPS discipline, exact vs floating comparisons, robust orientation, overflow control, safe predicate structure.
---

## Links to Series Content

* [Geometry I - Distance and Movement](../competitive/geometry_i)
* [Geometry II - Lines, Cuts, and Orientation (This One)](../competitive/geometry_ii)
* [Geometry III - Polygons and Convex Hull](../competitive/geometry_iii)
* [Geometry IV - Sweep Line and Closest Pair](../competitive/geometry_iv)
* [Geometry V - Circles, Arcs and Tangents](../competitive/geometry_v)
* [Geometry VI - Similarity and Affine Geometry](../competitive/geometry_vi)
* [Geometry VII - Dynamic Geometry and Line Containers](../competitive/geometry_vii)
* [Geometry VIII - Numerical Stability and Robust Geometry](../competitive/geometry_viii)

---

## 0) Core Definitions

### Manhattan Distance (L1)

Allowed moves: N, S, E, W, each cost 1.

$$d_1(p,q) = |x_p - x_q| + |y_p - y_q|$$

---

### Chebyshev Distance (L∞)

Allowed moves: 8 king moves, each cost 1.

$$d_\infty(p,q) = \max(|dx|, |dy|)$$

---

### 45 degree Rotated Coordinates

Let

$$u = x + y, \quad v = x - y$$

Then

$$|dx| + |dy| = \max(|du|, |dv|)$$

So Manhattan in $(x,y)$ becomes Chebyshev in $(u,v)$.
This is the default trick for rotated grids.

---

### Mixed Metric Regions

Two halves of the plane use different norms. Example:

* South uses axis aligned Manhattan.
* North uses a rotated grid.

Shortest paths either:

1. stay entirely in one region, or
2. cross the boundary exactly once.

The boundary is one dimensional, so the best crossing point lives in a small set of candidate points you can check by hand.

---

### Hex Grid (Cube Coordinates)

Represent an axial hex coordinate $(q,r)$ as cube coordinates $(x,y,z)$:

$$x = q, \quad z = r, \quad y = -x - z$$

Distance becomes

$$d_{\text{hex}} = \max(|dx|, |dy|, |dz|)$$

This removes angles and makes hex movement pure L1 in 3D with the constraint $x + y + z = 0$.

---

### Linear Forms Trick (Farthest Manhattan Pair)

For 2D Manhattan,

$$|dx| + |dy| = \max((x + y), (x - y), (-x + y), (-x - y)) \text{ differences}$$

So for a set of points, you can:

* compute these 4 forms for each point
* track min and max per form
* the maximum Manhattan distance is the maximum difference over those 4 forms

In $k$ dimensions you use $2^k$ masks.

---

## 1) Constraints

Distance and movement problems usually look like:

* $n \le 2 \cdot 10^5$
* $|x|, |y| \le 10^9$
* total queries $q \le 2 \cdot 10^5$
* no walls or obstacles, or only a very simple boundary
* move cost is uniform

When you see that, simulating movement is almost always the wrong play.
Use formulas.

Common trap patterns:

* Infinite grid, huge coordinates, shortest path question.
* Distances that depend only on coordinates, not on any local structure.
* Complete graph over points with Manhattan weights, but $n$ is large and editorial goes below $O(n^2)$.

---

## 2) Theory Bridge

### Movement rules as norms

Moves are unit vectors. The convex hull of these vectors defines a norm.
Shortest paths in that move system are shortest paths in the norm.

Examples:

* Moves $\{N, S, E, W\}$ generate $L_1$.
* Moves $\{8 \text{ king moves}\}$ generate $L_\infty$.
* Moves $\{(1,1), (1,-1), (-1,1), (-1,-1)\}$ are a rotated $L_1$ basis.

---

### Rotating Manhattan into Chebyshev

With

$$u = x + y, \quad v = x - y$$

we have

$$|dx| + |dy| = \max(|du|, |dv|)$$

So rotated city grids become Chebyshev in the right coordinates.
You can flip between them depending on which is easier.

---

### Mixed metrics on a boundary

North half uses norm $N_N$, south half uses norm $N_S$.
Any shortest path:

* either lies completely in one region
* or crosses the boundary once

The boundary is a line.
The objective is piecewise linear in the crossing position, so it has a small finite set of breakpoints.
You derive them and check them.

San Francisco Distances is the typical example.

---

### Hex Grid as 3D L1

Hex grids become easy if you stop drawing hexagons and just use cube coordinates with $x + y + z = 0$.
Distance to a point is:

$$d = \max(|dx|, |dy|, |dz|)$$

Everything else is just counting steps in these axes.

---

## 3) Spotting the Model

| Statement cue                           | Model                        |
| --------------------------------------- | ---------------------------- |
| "4 neighbors but coordinates up to 1e9" | Manhattan                    |
| "8 directions allowed"                  | Chebyshev                    |
| "taxi grid" or "walking grid"           | Manhattan                    |
| "grid rotated 45 degrees"               | Rotated Manhattan            |
| "north half different from south half"  | Mixed metrics with boundary  |
| "distance on hex tiles"                 | Hex cube coordinates         |
| "find maximum Manhattan distance"       | Linear forms trick           |
| "Manhattan MST or matching costs"       | Transform plus sweep or flow |
| "equilateral in Manhattan distance"     | Diagonals with $\|dx\| = \|dy\|$ |

---

## 4) Shapes and Models

Quick model table for this house.

| Type                         | Detection                         | Output                | Solver                        | Notes               |
| ---------------------------- | --------------------------------- | --------------------- | ----------------------------- | ------------------- |
| Pure Manhattan               | axis grid, 4 moves                | shortest path or cost | L1 formula                    | O(1) per query      |
| Rotated Manhattan            | diagonal streets                  | street distance       | change basis                  | rotated city        |
| Mixed Manhattan (two halves) | border line, different grid rules | min travel            | check few crossings           | San Francisco style |
| Hex grid                     | honeycomb, 6 moves                | min steps             | cube coordinates              | cleanest model      |
| Farthest Manhattan pair      | need max L1 distance over points  | max distance          | 4 linear forms                | ABC178E, Typical90  |
| Range Manhattan              | dynamic queries                   | max distance on range | segment tree over $2^k$ masks | CF 1093G            |
| Manhattan equilateral        | all pairwise $d_1$ equal          | triple of indices     | $x+y$ and $x-y$ diagonals     | CF 1979E            |
| Manhattan matching or MST    | edges cost = L1                   | MST, matching etc     | plane sweeps and transforms   | advanced            |

---

## 5) Algorithms

### Manhattan

$$d = |x_1 - x_2| + |y_1 - y_2|$$

---

### Chebyshev

$$d = \max(|x_1 - x_2|, |y_1 - y_2|)$$

---

### Rotated Manhattan

$$u = x + y, \quad v = x - y$$

Then

$$d_1(p,q) = \max(|u_1 - u_2|, |v_1 - v_2|)$$

---

### Mixed metrics template

Two norms $N_S$ and $N_N$ with a boundary line:

1. Compute distance if both points stay in south using $N_S$.
2. Compute distance if both points stay in north using $N_N$.
3. If crossing is allowed or needed:

   * parametrize the boundary by a scalar $t$
   * write $D(t) = N_S(p,c(t)) + N_N(c(t),q)$
   * find the finite set of breakpoints of this piecewise linear function
   * evaluate at those $t$ and take the minimum

---

### Hex grid

With cube coordinates $(x_1,y_1,z_1)$ and $(x_2,y_2,z_2)$, where each satisfies $x + y + z = 0$:

$$d = \max(|x_1 - x_2|, |y_1 - y_2|, |z_1 - z_2|)$$

---

### Manhattan farthest pair

For each point $(x,y)$ compute four forms:

* $f_1 = x + y$
* $f_2 = x - y$
* $f_3 = -x + y$
* $f_4 = -x - y$

Maintain min and max per form.
Then:

$$\max_{i,j} d_1(i,j) = \max_k (\max_i f_k(i) - \min_i f_k(i))$$

This is $O(n)$.

---

### Manhattan equilateral triangles

A Manhattan equilateral triangle is three points with all pairwise distances equal to $d$.

Fact:

> In any such triangle there is a side with
> $|x_1 - x_2| = |y_1 - y_2| = d/2$.

That side lies along a slope $\pm 1$ diagonal.
So you want to look along diagonals in:

* $x + y$ (one orientation), then
* $x - y$ (the other orientation)

For a point $(x,y)$, a partner at $(x + d/2, y - d/2)$ on the same $x + y$ diagonal makes a side with $|dx| = |dy|$.
The third vertex must then lie on $x + y \pm d$ diagonals in a small $x$ interval.
Same idea on $x - y$ after a simple transform.

---

## 6) Templates

### Manhattan

```cpp
long long manhattan(long long x1, long long y1,
                    long long x2, long long y2) {
    return llabs(x1 - x2) + llabs(y1 - y2);
}
```

---

### Chebyshev

```cpp
long long chebyshev(long long x1, long long y1,
                    long long x2, long long y2) {
    return max(llabs(x1 - x2), llabs(y1 - y2));
}
```

---

### Rotated coordinates

```cpp
pair<long long, long long> to_uv(long long x, long long y) {
    return {x + y, x - y};
}
```

---

### Hex cube distance

```cpp
long long hex_dist(long long x1, long long y1, long long z1,
                   long long x2, long long y2, long long z2) {
    return max({llabs(x1 - x2),
                llabs(y1 - y2),
                llabs(z1 - z2)});
}
```

---

### Manhattan farthest pair

```cpp
long long farthest_manhattan(const vector<pair<long long, long long>>& pts) {
    const long long INF = (long long)4e18;
    long long mx1 = -INF, mn1 = INF;
    long long mx2 = -INF, mn2 = INF;
    long long mx3 = -INF, mn3 = INF;
    long long mx4 = -INF, mn4 = INF;

    for (auto [x, y] : pts) {
        long long f1 = x + y;
        long long f2 = x - y;
        long long f3 = -x + y;
        long long f4 = -x - y;

        mx1 = max(mx1, f1);
        mn1 = min(mn1, f1);
        mx2 = max(mx2, f2);
        mn2 = min(mn2, f2);
        mx3 = max(mx3, f3);
        mn3 = min(mn3, f3);
        mx4 = max(mx4, f4);
        mn4 = min(mn4, f4);
    }

    return max({mx1 - mn1, mx2 - mn2, mx3 - mn3, mx4 - mn4});
}
```

---

## 7) Worked Examples

### AtCoder ABC178 E - Dist Max

#### Problem Link

https://atcoder.jp/contests/abc178/tasks/abc178_e

#### Problem Description

You are given $n$ points $(x_i, y_i)$ in 2D.
Find the maximum Manhattan distance between any pair of points:

$$\max_{i,j} (|x_i - x_j| + |y_i - y_j|)$$

#### Why Distance and Movement

This is the cleanest instance of "farthest Manhattan pair".
The intended solution is to use linear forms, not $O(n^2)$ pair checking.

#### Key Idea / Transform

Use the identity

$$|dx| + |dy| = \max((x + y), (x - y), (-x + y), (-x - y)) \text{ differences}$$

For each form $f_k$, the maximum difference over points equals the maximum Manhattan distance achievable with that sign pattern. Taking the max over the 4 forms gives the global answer.

#### Solution Outline

1. For each point $(x, y)$, compute:

   * $f_1 = x + y$
   * $f_2 = x - y$
   * $f_3 = -x + y$
   * $f_4 = -x - y$

2. Track min and max of each form over all points.

3. For each $k$ in $\{1,2,3,4\}$, compute $\text{mx}_k - \text{mn}_k$.

4. Answer is the maximum of these 4 differences.

5. Complexity is linear in $n$.

#### Complexity

* Time: $O(n)$
* Memory: $O(1)$ extra

#### Code

```cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    const ll INF = (ll)4e18;
    ll mx1 = -INF, mn1 = INF;
    ll mx2 = -INF, mn2 = INF;
    ll mx3 = -INF, mn3 = INF;
    ll mx4 = -INF, mn4 = INF;

    for (int i = 0; i < n; ++i) {
        ll x, y;
        cin >> x >> y;

        ll f1 = x + y;
        ll f2 = x - y;
        ll f3 = -x + y;
        ll f4 = -x - y;

        mx1 = max(mx1, f1);
        mn1 = min(mn1, f1);
        mx2 = max(mx2, f2);
        mn2 = min(mn2, f2);
        mx3 = max(mx3, f3);
        mn3 = min(mn3, f3);
        mx4 = max(mx4, f4);
        mn4 = min(mn4, f4);
    }

    ll ans = max({mx1 - mn1, mx2 - mn2, mx3 - mn3, mx4 - mn4});
    cout << ans << "\n";
    return 0;
}
```

#### Notes

* Typical "first time" mistake is trying to sort points or do something pairwise.
* This pattern generalizes to $k$ dimensions with $2^k$ forms.
* You can copy paste this block into many other Manhattan max problems.

---

### AtCoder Typical90 036 - Max Manhattan Distance

#### Problem Link

https://atcoder.jp/contests/typical90/tasks/typical90_aj

#### Problem Description

Given $n$ points, answer queries (or a single query) for the maximum Manhattan distance between any pair of points.

The statement is effectively the same as ABC178 E, under a different name.

#### Why Distance and Movement

This is deliberate repetition. It is the same shape as ABC178 E, meant to test if you recognize the metric trick without being told.

#### Key Idea / Transform

Exactly the same four linear forms:

$$f_1 = x + y, \quad f_2 = x - y, \quad f_3 = -x + y, \quad f_4 = -x - y$$

Max Manhattan distance is the maximum difference over these forms.

#### Solution Outline

1. Read all points.
2. Compute min/max of the 4 forms as in ABC178 E.
3. Output the max difference.
4. If there are multiple queries over the same point set, you can precompute the forms and reuse.

#### Complexity

* Time: $O(n)$
* Memory: $O(1)$ extra

#### Code

Use the same code as in ABC178 E, possibly wrapped in your own IO.

#### Notes

* Good practice for "see a distance, immediately ask which metric it is and what linear forms it gives".
* When you see multiple problems with the same trick, that is a signal to treat it as a template, not a one off.

---

### Kattis - Honeycomb Walk

#### Problem Link

https://open.kattis.com/problems/honey

#### Problem Description

You are given an integer $n$ representing how many steps a larva takes on a hex grid.

At each step, it may move to any of the six adjacent cells.
After exactly $n$ steps, the larva must return to its original starting cell.

Your task is to compute the number of distinct walks of length $n$ that start and end at the origin.

#### Why Distance and Movement

Even though the problem asks for a count rather than a distance, the underlying structure is the same as any hex-grid movement problem:

* six uniform adjacent directions,
* cube coordinates with a linear invariant,
* movement behavior identical to standard hex geometry,
* reachable radius after $s$ steps is at most $s$.

This makes cube coordinates perfect for modeling the state transitions and performing a dynamic programming walk-count.

### Key Idea / Transform

We use **cube coordinates** $(x, y, z)$ on a hex grid, which satisfy the invariant:

$$
x + y + z = 0.
$$

The six canonical cube-coordinate move vectors are:

$$
\begin{aligned}
\text{n}  &: (0,; +1,; -1), \
\text{ne} &: (+1,; 0,; -1), \
\text{se} &: (+1,; -1,; 0), \
\text{s}  &: (0,; -1,; +1), \
\text{sw} &: (-1,; 0,; +1), \
\text{nw} &: (-1,; +1,; 0).
\end{aligned}
$$

Because the constraint $x + y + z = 0$ implies

$$
z = -x - y,
$$

we can drop $z$ and store only the pair $(x, y)$.

---

### Deriving the 2D Move Rules

We convert each cube move $(\Delta x, \Delta y, \Delta z)$ into a 2D update.

#### n:

$$
(x', y') = (x + 0,; y + 1)
$$

#### ne:

$$
(x', y') = (x + 1,; y)
$$

#### se:

$$
(x', y') = (x + 1,; y - 1)
$$

#### s:

$$
(x', y') = (x,; y - 1)
$$

#### sw:

$$
(x', y') = (x - 1,; y)
$$

#### nw:

$$
(x', y') = (x - 1,; y + 1)
$$

Thus our final 2D transitions are:

$$
\begin{aligned}
\text{n}  &: (x,; y+1), \
\text{ne} &: (x+1,; y), \
\text{se} &: (x+1,; y-1), \
\text{s}  &: (x,; y-1), \
\text{sw} &: (x-1,; y), \
\text{nw} &: (x-1,; y+1).
\end{aligned}
$$

### DP Formulation

Define

$$
dp[s][x][y] = \text{number of walks of length } s \text{ ending at } (x, y).
$$

Initial condition:

$$
dp[0][0][0] = 1.
$$

Maximum absolute coordinate after $n$ steps is at most $n \le 14$, so a $41 \times 41$ grid (after adding an offset) is more than sufficient.

We want the number of closed walks:

$$
\text{answer} = dp[n][0][0].
$$

### Solution Outline

1. Create a 3D DP array $dp[s][x][y]$ for $0 \le s \le 14$ and $-14 \le x, y \le 14$ (offset to nonnegative indices).
2. Set $dp[0][0][0] = 1$.
3. For each step $s$, distribute $dp[s][x][y]$ to its six neighbors.
4. Output $dp[n][0][0]$ for each test case.

### Complexity

* Time: $O(n R^2)$ with $R = 14$
* Memory: $O(R^2)$

Both extremely small.

### Code

```cpp
#include <bits/stdc++.h>
using namespace std;

static const int MAXN = 14;
static const int OFF = 20;

int dx[6] = {0, 1, 1, 0, -1, -1};
int dy[6] = {1, 0, -1, -1, 0, 1};

long long dp[MAXN+1][41][41];

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    dp[0][OFF][OFF] = 1;

    for (int s = 0; s < MAXN; s++) {
        for (int x = 0; x <= 40; x++) {
            for (int y = 0; y <= 40; y++) {
                long long v = dp[s][x][y];
                if (!v) continue;

                for (int d = 0; d < 6; d++) {
                    int nx = x + dx[d];
                    int ny = y + dy[d];
                    dp[s+1][nx][ny] += v;
                }
            }
        }
    }

    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        cout << dp[n][OFF][OFF] << "\n";
    }

    return 0;
}
```

### Notes

* Once you know cube coordinates, *hex-grid movement becomes algebra*, not geometry.
* The main pitfall is breaking the invariant $x + y + z = 0$ when deriving simplified coordinate systems.
* Many hex-grid problems that look combinatorial become simple DP once the correct cube mapping is applied.
* Closed-walk counting is a direct consequence of summing transitions; no geometry tricks are needed.
* The reachable radius after $n$ steps is at most $n$, keeping the DP small and safe.

---

### Codeforces 1979E - Manhattan Triangle

#### Problem Link

https://codeforces.com/contest/1979/problem/E

#### Problem Description

You are given $n$ distinct lattice points and an even integer $d$.
Find any triple of distinct points $(A, B, C)$ such that the Manhattan distance between every pair is exactly $d$.
If none exists, print `0 0 0`.

#### Why Distance and Movement

This is a "structure of shapes under Manhattan distance" problem.
You are not computing distances for queries; you are using the geometry of $L_1$ to constrain where the vertices of a triangle can be.

#### Key Idea / Transform

Key fact:

> In any Manhattan equilateral triangle with side length $d$, there exist two vertices $A$ and $B$ such that
> $|x_A - x_B| = |y_A - y_B| = d/2$.

So one side lies on a diagonal of slope $\pm 1$ and has equal horizontal and vertical span.

That means:

* One side lives on a line $x + y = \text{const}$ or $x - y = \text{const}$.
* The third point must then live on a diagonal shifted by $\pm d$ in that coordinate system.

So:

* First pass: group points by $x + y$.
* Second pass: group points by $x - y$.
* Inside each group, search for pairs exactly $d/2$ apart in $x$, then look for a third point on the shifted diagonals with $x$ in a small interval.

#### Solution Outline

1. Preprocess coordinates by shifting them by a large constant so indices stay in non-negative range for arrays.

2. **Pass 1: group by $x + y$.**

   * For each point $i$, insert $(x_i, i)$ into `diag[x_i + y_i]`.

   * For each $i$:

     * Let $\text{key} = x[i] + y[i]$.
     * The candidate partner $Q$ should be at $(x[i] + d/2, y[i] - d/2)$ on the same diagonal.
     * Use `lower_bound` in `diag[key]` to see if such $x$ exists.
     * If it does, you have a side $AB$.

   * For this $AB$:

     * The third vertex $R$ must be on:

       * diagonal `key + d` with $x$ in $[x[i] + d/2, x[i] + d]$, or
       * diagonal `key - d` with $x$ in $[x[i] - d/2, x[i]]$.
     * Use `lower_bound` to find any $x$ in the required interval.
     * If found, output the triple.

   * Clear sets for this pass.

3. **Pass 2: group by $x - y$.**

   * Shift $y$ by a constant so $x - y$ indices are valid.
   * Repeat the same logic but with diagonals keyed by $x - y$ and partner at $(x + d/2, y + d/2)$.
   * Again check diagonals shifted by $\pm d$.

4. If no triple is found after both passes, print `0 0 0`.

#### Complexity

* Time: $O(n \log n)$ per test
* Memory: $O(n)$

#### Code

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXC = 100000;
const int MAXD = 400000 + 10;

set<pair<int,int>> diag[MAXD];

void solve() {
    int n, d;
    cin >> n >> d;

    vector<int> x(n), y(n);
    for (int i = 0; i < n; ++i) {
        cin >> x[i] >> y[i];
        x[i] += MAXC;
        y[i] += MAXC;
    }

    bool found = false;

    // Pass 1: group by (x + y)
    {
        for (int i = 0; i < n; ++i) {
            diag[x[i] + y[i]].insert({x[i], i});
        }

        for (int i = 0; i < n && !found; ++i) {
            int key = x[i] + y[i];

            // partner Q at (x[i] + d/2, y[i] - d/2)
            auto it1 = diag[key].lower_bound({x[i] + d / 2, -1});
            if (it1 == diag[key].end() || it1->first != x[i] + d / 2) continue;

            // try R on diagonal (x + y + d)
            int up = key + d;
            if (up < MAXD) {
                auto it2 = diag[up].lower_bound({x[i] + d / 2, -1});
                if (it2 != diag[up].end() && it2->first <= it1->first + d / 2) {
                    cout << i + 1 << " " << it1->second + 1 << " " << it2->second + 1 << "\n";
                    found = true;
                    break;
                }
            }

            // try R on diagonal (x + y - d)
            int down = key - d;
            if (!found && down >= 0) {
                auto it2 = diag[down].lower_bound({x[i] - d / 2, -1});
                if (it2 != diag[down].end() && it2->first <= it1->first - d / 2) {
                    cout << i + 1 << " " << it1->second + 1 << " " << it2->second + 1 << "\n";
                    found = true;
                    break;
                }
            }
        }

        for (int i = 0; i < n; ++i) {
            diag[x[i] + y[i]].erase({x[i], i});
        }
    }

    // Pass 2: group by (x - y)
    if (!found) {
        for (int i = 0; i < n; ++i) {
            y[i] -= 2 * MAXC;
            diag[x[i] - y[i]].insert({x[i], i});
        }

        for (int i = 0; i < n && !found; ++i) {
            int key = x[i] - y[i];

            // partner Q at (x[i] + d/2, y[i] + d/2)
            auto it1 = diag[key].lower_bound({x[i] + d / 2, -1});
            if (it1 == diag[key].end() || it1->first != x[i] + d / 2) continue;

            // R on (x - y + d)
            int up = key + d;
            
            if (up < MAXD) {
                auto it2 = diag[up].lower_bound({x[i] + d / 2, -1});
                
                if (it2 != diag[up].end() && it2->first <= it1->first + d / 2) {
                    cout << i + 1 << " " << it1->second + 1 << " " << it2->second + 1 << "\n";
                    found = true;
                    break;
                }
            }

            // R on (x - y - d)
            int down = key - d;
            
            if (!found && down >= 0) {
                auto it2 = diag[down].lower_bound({x[i] - d / 2, -1});
            
                if (it2 != diag[down].end() && it2->first <= it1->first - d / 2) {
                    cout << i + 1 << " " << it1->second + 1 << " " << it2->second + 1 << "\n";
                    found = true;
                    break;
                }
            }
        }

        for (int i = 0; i < n; ++i) {
            diag[x[i] - y[i]].erase({x[i], i});
        }
    }

    if (!found) {
        cout << "0 0 0\n";
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int t;
    cin >> t;
    while (t--) solve();
    return 0;
}
```

#### Notes

* This is a good example of "if editorial code looks cursed but short, try to interpret it as a structured search on diagonals".
* The memory offsets with MAXC are purely to avoid negative indices. You can use maps instead if you want clearer code at the cost of constants.
* The important part for this house is the geometric structure (diagonals, equal dx and dy), not the exact implementation details.

---

### Codeforces 1093G - Multidimensional Queries

#### Problem Link

https://codeforces.com/problemset/problem/1093/G

#### Problem Description

You are given a sequence of points in up to 5 dimensions:

$$a_i = (x_{i1}, x_{i2}, \ldots, x_{ik}), \quad 1 \le k \le 5$$

You must support:

* point updates: change $a_i$
* queries on a subarray $[l, r]$: output the maximum Manhattan distance between any two points in that range

#### Why Distance and Movement

This is the "multi dimensional version" of the farthest Manhattan pair, combined with range queries and updates.
It shows how the linear forms trick generalizes and how to plug it into a segment tree.

#### Key Idea / Transform

For $k$ dimensions, Manhattan distance is:

$$d_1(p, q) = \sum_{j=1}^k |p_j - q_j|$$

We can rewrite this as:

$$d_1(p, q) = \max_{m} (f_m(p) - f_m(q))$$

where each mask $m$ picks a sign for each coordinate:

$$f_m(p) = \sum_{j=1}^k s_j x_j, \quad s_j \in \{+1, -1\}$$

There are $2^k$ such masks. For $k \le 5$ this is at most 32.

For a fixed segment, if we know $\max f_m$ over the segment for each mask, and also $\min f_m$, then the maximum Manhattan distance inside that segment is:

$$\max_m (\text{maxF}[m] - \text{minF}[m])$$

Segment tree nodes can store the $\max f_m$ for every mask in that node. When merging two nodes, you just take the max per mask.

#### Solution Outline

1. Precompute all masks from 0 to $2^k - 1$.

2. For a point $p$ with coordinates $x[0..k-1]$, compute an array $\text{val}[m]$ of length $2^k$, where:

   $$\text{val}[m] = \sum_{j=0}^{k-1} (\text{bit } j \text{ of } m ? +1 : -1) \cdot x_j$$

3. Segment tree node will store:

   * an array `mx[m]` which is the maximum $\text{val}[m]$ in this segment
   * an array `mn[m]` which is the minimum $\text{val}[m]$ in this segment

4. Building:

   * For a leaf node, set mx and mn to the $\text{val}[m]$ of that point.
   * For an internal node: $\text{mx}[m] = \max(\text{mx}_{\text{left}}[m], \text{mx}_{\text{right}}[m])$ and same for mn.

5. For a query $[l, r]$:

   * Combine relevant nodes to get $\text{mx}[m]$, $\text{mn}[m]$ for the whole range.
   * Answer is max over masks of $\text{mx}[m] - \text{mn}[m]$.

6. Point update:

   * Recompute $\text{val}[m]$ for the new point.
   * Update leaf and propagate up.

#### Complexity

* Time per build: $O(n \cdot 2^k)$
* Time per query: $O(\log n \cdot 2^k)$
* Time per update: $O(\log n \cdot 2^k)$
* Memory: $O(n \cdot 2^k)$

For $k \le 5$, $2^k \le 32$, so the constants are fine.

#### Code

```cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;

const int MAXN = 200005;
const ll INF = 4e18;

int n, k, q;

struct Node {
    ll mx[32], mn[32];
    
    Node() {
        for (int i = 0; i < 32; ++i) {
            mx[i] = -INF;
            mn[i] = INF;
        }
    }
};

Node seg[4 * MAXN];
ll a[MAXN][5];

Node make_node(int idx) {
    Node node;
    int masks = 1 << k;

    for (int m = 0; m < masks; ++m) {
        ll v = 0;

        for (int j = 0; j < k; ++j) {
            int sign = (m & (1 << j)) ? 1 : -1;
            v += sign * a[idx][j];
        }

        node.mx[m] = node.mn[m] = v;
    }

    return node;
}

Node merge(const Node& l, const Node& r) {
    Node res;
    int masks = 1 << k;

    for (int m = 0; m < masks; ++m) {
        res.mx[m] = max(l.mx[m], r.mx[m]);
        res.mn[m] = min(l.mn[m], r.mn[m]);
    }

    return res;
}

void build(int v, int tl, int tr) {
    if (tl == tr) {
        seg[v] = make_node(tl);
        return;
    }

    int tm = (tl + tr) / 2;
    
    build(2*v, tl, tm);
    build(2*v+1, tm+1, tr);

    seg[v] = merge(seg[2*v], seg[2*v+1]);
}

void update(int v, int tl, int tr, int pos) {
    if (tl == tr) {
        seg[v] = make_node(pos);
        return;
    }

    int tm = (tl + tr) / 2;

    if (pos <= tm)
        update(2*v, tl, tm, pos);
    
    else update(2*v+1, tm+1, tr, pos);
    
    seg[v] = merge(seg[2*v], seg[2*v+1]);
}

Node query(int v, int tl, int tr, int l, int r) {
    if (l > r) {
        Node empty;
        return empty;
    }

    if (l == tl && r == tr)
        return seg[v];
    
    int tm = (tl + tr) / 2;
    
    return merge(
        query(2*v, tl, tm, l, min(r, tm)),
        query(2*v+1, tm+1, tr, max(l, tm+1), r)
    );
}

ll answer_from_node(const Node& node) {
    ll ans = 0;
    
    int masks = 1 << k;
    
    for (int m = 0; m < masks; ++m) {
        ans = max(ans, node.mx[m] - node.mn[m]);
    }
    
    return ans;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    cin >> n >> k;
    for (int i = 1; i <= n; ++i) {
        for (int j = 0; j < k; ++j) {
            cin >> a[i][j];
        }
    }
    
    build(1, 1, n);
    
    cin >> q;

    while (q--) {
        int type;
        cin >> type;

        if (type == 1) {
            int i;
            cin >> i;
            for (int j = 0; j < k; ++j) {
                cin >> a[i][j];
            }
            update(1, 1, n, i);
        } else {
            int l, r;
            cin >> l >> r;
            Node res = query(1, 1, n, l, r);
            cout << answer_from_node(res) << "\n";
        }
    }
    
    return 0;
}
```

#### Notes

* The core trick is exactly the same as in ABC178 E, just in higher dimension and per range instead of global.
* The only reason this is hard in contest is the implementation length plus careful handling of indices and masks.
* Once you internalize "Manhattan distance equals max of linear forms difference", range problems naturally suggest this segment tree structure.

---

## 8) Common Pitfalls

* Using BFS or Dijkstra on an infinite unobstructed grid when you should write a formula.
* Using Manhattan when 8 directions are allowed so the intended metric is actually Chebyshev.
* Forgetting the 45 degree transform when the grid is rotated.
* Mixing axial and cube coordinates in hex grids and breaking $x + y + z = 0$.
* Solving farthest Manhattan pair in $O(n^2)$ instead of using the 4 linear forms.
* In mixed metric problems, only checking "same region" paths and ignoring boundary crossings.
* Ignoring that large coordinates plus no walls is a loud signal that the intended solution is algebraic.

---

## 9) TLDR

* Movement rules define a norm, so identify that norm and use it directly.
* $L_1$ is axis moves, $L_\infty$ is king moves, rotated grids can turn Manhattan into Chebyshev via $u = x + y$, $v = x - y$.
* Hex grids become simple in cube coordinates with distance = max of 3 absolute differences.
* Mixed metrics along a boundary reduce to "norm in each region plus a small set of boundary crossing candidates".
* Farthest Manhattan distance over points is just 4 (or $2^k$) linear forms in $O(n)$ or segment tree time.
* Equilateral triangles in $L_1$ live on diagonals with $|dx| = |dy|$ so group by $x + y$ and $x - y$.
* If there are no walls and coordinates go up to $10^9$, you should probably be writing formulas, not BFS.

---

## 10) Recommended Problems

* [Codeforces 1093G - Multidimensional Queries](https://codeforces.com/problemset/problem/1093/G)
* [Codeforces 1979E - Manhattan Triangle](https://codeforces.com/contest/1979/problem/E)
* [AtCoder ABC178 E - Dist Max](https://atcoder.jp/contests/abc178/tasks/abc178_e)
* [AtCoder Typical90 36 - Max Manhattan Distance](https://atcoder.jp/contests/typical90/tasks/typical90_aj)
* [San Francisco Distances (Awaiting Release)](https://socalcontest.org/history/2024/SCICPC-2025-2026-ProblemSet.pdf)