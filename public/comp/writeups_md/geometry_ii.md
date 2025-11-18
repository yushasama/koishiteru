# Geometry II – Lines, Cuts, and Orientation

This house is where geometry starts feeling like math and stops feeling like drawing. You get lines. You get cuts. You get segments that want to intersect when they should not, and intervals that only make sense after you project something onto the right axis.

Everything reduces to three tools that never lie:

1. **Cross** for signed area and how two directions interact.
2. **Orientation** for left, right, or perfectly collinear.
3. **Projection** for turning a messy 2D picture into clean 1D intervals.

Once these three are locked in, the rest of the world becomes mechanical. You stop guessing. You stop eyeballing. You just run the predicates and let the signs tell the story.

This is the house of:

* segment vs segment
* segment vs line
* ray vs wall
* point vs half-plane
* shadow ranges
* visibility windows
* clipping
* checking if something blocks something else
* every small but deadly detail that ruins weak geometry code

Most problems here look bigger than they are. In reality they collapse the moment you translate them into:

* two orientation checks
* one projection
* a few interval merges

That is the whole game. You take a messy figure, slice it along a direction, drop the pieces into 1D, and resolve everything with signs and sorted endpoints.

---

## Series Roadmap

* **Geometry I - Distance and Movement** Movement rules, Manhattan, Chebyshev, rotated grids, hex grids, mixed metrics, linear forms tricks.
* **Geometry II - Lines, Cuts, and Orientation (This One)** Cross products, orientation tests, line intersection, half-planes, point-line distance, robust predicates.
* **Geometry III - Polygons and Convex Hull** Simple polygons, shoelace, convex hulls, point in polygon, supporting lines.
* **Geometry IV - Sweep Line and Closest Pair** Event sweeps, segment intersection, closest pair in $O(n \log n)$, rectangle union, offline queries.
* **Geometry V - Circles, Arcs and Tangents** Circle-line intersection, circle-circle intersection, tangents, arcs, angles.
* **Geometry VI - Advanced Rotations and Tricks** Non-axis metrics, mixed coordinate systems, weird grids, more transforms like "San Francisco", Manhattan triangles, and contest-style hacks.

---

## Links to Series Content

* [Geometry I - Distance and Movement](../competitive/geometry_i)
* [Geometry II - Lines, Cuts, and Orientation (This One)](../competitive/geometry_ii)
* [Geometry III - Polygons and Convex Hull](../competitive/geometry_iii)
* [Geometry IV - Sweep Line and Closest Pair](../competitive/geometry_iv)
* [Geometry V - Circles, Arcs and Tangents](../competitive/geometry_v)
* [Geometry VI - Advanced Rotations and Tricks](../competitive/geometry_vi)

---

## 0) Core Definitions

**Cross Product**

For vectors $a$, $b$:

$$\text{cross}(a, b) = a_x b_y - a_y b_x$$

Sign gives turn direction.

**Orientation**

For points $a$, $b$, $c$:

$$\text{orient}(a, b, c) = \text{cross}(b - a, c - a)$$

$\text{orient} > 0$ left, $\text{orient} < 0$ right, $\text{orient} = 0$ collinear.

**Dot Product**

$$\text{dot}(a, b) = a_x b_x + a_y b_y$$

Used for projections and distances.

**Segment Intersection Conditions**

Segments $AB$ and $CD$ intersect if:

* $\text{orient}(A,B,C)$ and $\text{orient}(A,B,D)$ have opposite signs, and
* $\text{orient}(C,D,A)$ and $\text{orient}(C,D,B)$ have opposite signs,
* or they are collinear and the projections on both axes overlap.

**Projection onto Segment**

Project $P$ to $AB$:

$$t = \frac{\text{dot}(P - A, B - A)}{|B - A|^2}$$

$$t = \text{clamp}(t, 0, 1)$$

$$\text{Proj} = A + t \cdot (B - A)$$

---

## 1) Constraints

Use this family when statements talk about lines, cuts, shadows, visibility, closest points, or intersections.

Typical bounds and costs:

* Coordinates up to $10^9$ with 64 bit `long long` for cross and orient.
* Single segment intersection test: $O(1)$ time, $O(1)$ memory.
* Shadow merge over $n$ intervals: $O(n \log n)$ time, $O(n)$ memory.
* Shadow Line pattern with $n$ segments:
  * critical L values: $O(n^2)$ time, $O(n^2)$ memory
  * each sample evaluation: $O(n \log n)$ time, $O(n)$ memory

Common pitfalls and why:

* Using int for cross causes overflow. Use `long long`.
* Floating orientation flips sign on borderline inputs. Use integer orientation whenever the input is integral.
* Forgetting collinear overlap check misses endpoint touches.
* Not clamping $t$ in projection pushes outside the segment.
* Merging unsorted intervals returns wrong totals.

---

## 2) Theory Bridge

**Orientation is a 2x2 determinant sign**

$$\begin{vmatrix} b_x - a_x & c_x - a_x \\ b_y - a_y & c_y - a_y \end{vmatrix}$$

This classifies left or right of the directed line $AB$. Every cut or side test reduces to this.

**Intersection is sign disagreement**

If $C$ and $D$ lie on different sides of $AB$ and $A$ and $B$ on different sides of $CD$, they intersect. Collinear cases defer to bounding boxes.

**Projection is dot plus clamp**

Dot gives how far along $AB$ the orthogonal projection lands. Clamp makes it a segment projection.

**Shadow is a ray-line intersection**

Rays from the light to obstacles intersect a fixed wall. Endpoint projections define intervals that you merge.

---

## 3) Spotting The Model

| Statement phrase                   | Technique                                       |
| ---------------------------------- | ----------------------------------------------- |
| do these segments intersect        | 4 orientations + collinear overlap              |
| which side of the cut              | orientation                                     |
| distance to a road                 | projection with clamp                           |
| cast a shadow on a wall            | ray to vertical line + interval merge           |
| visibility changes as source moves | orientation-zero events partition the parameter |

---

## 4) Shapes and Models

| Type                 | How to tell               | Output        | Preprocess           | Query / Use                | Memory            | Notes                         |
| -------------------- | ------------------------- | ------------- | -------------------- | -------------------------- | ----------------- | ----------------------------- |
| Segment intersection | endpoints of two segments | yes or no     | none                 | $O(1)$ per pair            | $O(1)$            | atomic primitive              |
| Half-plane test      | many points vs line       | sign          | none                 | $O(1)$ per point           | $O(1)$            | robust with 64 bit ints       |
| Projection           | closest point or distance | point / value | none                 | $O(1)$ per query           | $O(1)$            | delay sqrt until the very end |
| Ray to vertical line | shadow endpoint           | Y on wall     | none                 | $O(1)$ per ray             | $O(1)$            | reusable inside shadow code   |
| Shadow merge         | union of intervals        | total length  | sort intervals $O(n)$ | merge sweep $O(n)$         | $O(n)$            | ICPC staple, static intervals |
| Shadow Line pattern  | moving light ordering     | measure(L)    | crit L: $O(n^2)$     | sample: $O(n \log n)$ each | $O(n^2) + O(n)$   | advanced parametric geometry  |

---

## 5) Algorithms

### Orientation

$$\text{orient}(a,b,c) = \text{cross}(b-a, c-a)$$

#### Complexity

* Time: $O(1)$
* Memory: $O(1)$

---

### Segment Intersection (two segments)

1. Compute $o_1 = \text{orient}(A,B,C)$, $o_2 = \text{orient}(A,B,D)$.
2. Compute $o_3 = \text{orient}(C,D,A)$, $o_4 = \text{orient}(C,D,B)$.
3. If $(o_1 > 0, o_2 < 0)$ or $(o_1 < 0, o_2 > 0)$ and similarly for $o_3, o_4$, they intersect strictly.
4. If any $o_i = 0$, check that point is inside the bounding box of the opposite segment.

#### Complexity

* Time: $O(1)$
* Memory: $O(1)$

---

### Projection onto Segment

$$t = \frac{\text{dot}(P-A, B-A)}{|B-A|^2}, \quad t \leftarrow \text{clamp}(t, 0, 1)$$

$$Q = A + t(B-A)$$

#### Complexity

* Time per projection: $O(1)$
* Memory: $O(1)$

---

### Ray hitting vertical wall ($x = W$)

Light at $(L, 0)$, endpoint $(x, y)$:

$$t = \frac{W - L}{x - L}, \quad Y = t y$$

#### Complexity

* Time per projection: $O(1)$
* Memory: $O(1)$

---

### Shadow Line pattern (moving light)

Endpoints $A = (x_a, y_a)$, $B = (x_b, y_b)$ swap order on the wall when their projected Y coincide:

$$Y_A(L) = Y_B(L)$$

Solving gives

$$L = \frac{y_b x_a - y_a x_b}{y_b - y_a} \quad \text{if } y_a \neq y_b$$

These L are critical events along the light path. Between consecutive critical values, the order of projections is fixed, so the merged shadow structure is constant.

High level algorithm:

1. Generate all critical L from pairs of endpoints with different y.
2. Add sentinels $-\infty$ and $0$. Sort and unique.
3. For each neighboring pair of L values, sample a mid $L$, project all segments, merge intervals, count merged shadows.
4. Sum length of L intervals where the count equals the target (here, one).

#### Complexity

* Time to generate critical L: $O(n^2)$
* Time per sampled region: $O(n \log n)$ for project + sort + merge
* Total time: $O(n^2 \log n)$ in worst case
* Memory:
  * critical L storage: $O(n^2)$
  * per sample projection + intervals: $O(n)$

---

## 6) Templates

### Segment Intersection Template

```cpp
struct P { long long x, y; };
P operator-(P a, P b) { return {a.x - b.x, a.y - b.y}; }
long long cross(P a, P b) { return a.x * b.y - a.y * b.x; }
long long orient(P a, P b, P c) { return cross(b - a, c - a); }

bool on_seg(P a, P b, P p) {
    if (orient(a, b, p) != 0) return false;
    return min(a.x, b.x) <= p.x && p.x <= max(a.x, b.x) &&
           min(a.y, b.y) <= p.y && p.y <= max(a.y, b.y);
}

bool seg_inter(P a, P b, P c, P d) {
    long long o1 = orient(a, b, c);
    long long o2 = orient(a, b, d);
    long long o3 = orient(c, d, a);
    long long o4 = orient(c, d, b);
    if (o1 == 0 && on_seg(a, b, c)) return true;
    if (o2 == 0 && on_seg(a, b, d)) return true;
    if (o3 == 0 && on_seg(c, d, a)) return true;
    if (o4 == 0 && on_seg(c, d, b)) return true;
    return (o1 > 0) != (o2 > 0) && (o3 > 0) != (o4 > 0);
}
```

---

### Projection Template

```cpp
struct D { double x, y; };
D operator-(D a, D b) { return {a.x - b.x, a.y - b.y}; }
double dot(D a, D b) { return a.x * b.x + a.y * b.y; }

double dist_seg(D a, D b, D p) {
    D ab = b - a;
    D ap = p - a;
    double t = dot(ap, ab) / dot(ab, ab);
    t = max(0.0, min(1.0, t));
    D q = {a.x + t * ab.x, a.y + t * ab.y};
    double dx = p.x - q.x;
    double dy = p.y - q.y;
    return sqrt(dx * dx + dy * dy);
}
```

---

### Shadow Line Pattern Template

```cpp
long double projectY(long double L, long double W, long double x, long double y) {
    long double t = (W - L) / (x - L);
    return t * y;
}

// Ordering flip critical point for endpoints (xa, ya) and (xb, yb):
// if (ya != yb) L = (yb * xa - ya * xb) / (yb - ya)
```

---

## 7) Worked Examples

### Segment Intersection – Codeforces 16E

Use the segment intersection primitive to decide if two segments intersect, including endpoints and overlaps.

#### Complexity

* Time per test: $O(1)$
* Memory: $O(1)$

```cpp
#include <bits/stdc++.h>
using namespace std;

struct P { long long x, y; };
P operator-(P a, P b) { return {a.x - b.x, a.y - b.y}; }
long long cross(P a, P b) { return a.x * b.y - a.y * b.x; }
long long orient(P a, P b, P c) { return cross(b - a, c - a); }

bool on_seg(P a, P b, P p) {
    if (orient(a, b, p) != 0) return false;
    return min(a.x, b.x) <= p.x && p.x <= max(a.x, b.x) &&
           min(a.y, b.y) <= p.y && p.y <= max(a.y, b.y);
}

bool seg_inter(P a, P b, P c, P d) {
    long long o1 = orient(a, b, c);
    long long o2 = orient(a, b, d);
    long long o3 = orient(c, d, a);
    long long o4 = orient(c, d, b);
    if (o1 == 0 && on_seg(a, b, c)) return true;
    if (o2 == 0 && on_seg(a, b, d)) return true;
    if (o3 == 0 && on_seg(c, d, a)) return true;
    if (o4 == 0 && on_seg(c, d, b)) return true;
    return (o1 > 0) != (o2 > 0) && (o3 > 0) != (o4 > 0);
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int t; cin >> t;
    while (t--) {
        P a, b, c, d;
        cin >> a.x >> a.y >> b.x >> b.y;
        cin >> c.x >> c.y >> d.x >> d.y;
        cout << (seg_inter(a, b, c, d) ? "YES\n" : "NO\n");
    }
}
```

---

### Many Segment Intersections – AtCoder ABC259 F

Repeatedly apply segment intersection to count how many pairs of segments intersect.

#### Complexity

* Time: $O(n^2)$ for $n$ segments
* Memory: $O(n)$ for storing segments

```cpp
#include <bits/stdc++.h>
using namespace std;

struct P { long long x, y; };
P operator-(P a, P b) { return {a.x - b.x, a.y - b.y}; }
long long cross(P a, P b) { return a.x * b.y - a.y * b.x; }
long long orient(P a, P b, P c) { return cross(b - a, c - a); }

bool on_seg(P a, P b, P p) {
    if (orient(a, b, p) != 0) return false;
    return min(a.x, b.x) <= p.x && p.x <= max(a.x, b.x) &&
           min(a.y, b.y) <= p.y && p.y <= max(a.y, b.y);
}

bool seg_inter(P a, P b, P c, P d) {
    long long o1 = orient(a, b, c);
    long long o2 = orient(a, b, d);
    long long o3 = orient(c, d, a);
    long long o4 = orient(c, d, b);
    if (o1 == 0 && on_seg(a, b, c)) return true;
    if (o2 == 0 && on_seg(a, b, d)) return true;
    if (o3 == 0 && on_seg(c, d, a)) return true;
    if (o4 == 0 && on_seg(c, d, b)) return true;
    return (o1 > 0) != (o2 > 0) && (o3 > 0) != (o4 > 0);
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin >> n;
    vector<pair<P, P>> seg(n);
    for (int i = 0; i < n; i++) {
        cin >> seg[i].first.x >> seg[i].first.y;
        cin >> seg[i].second.x >> seg[i].second.y;
    }
    long long ans = 0;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (seg_inter(seg[i].first, seg[i].second, seg[j].first, seg[j].second)) {
                ans++;
            }
        }
    }
    cout << ans << "\n";
}
```

---

### We Need More Bosses – Codeforces 1000E

Find bridges, compress components, build the bridge tree, and compute its diameter.

#### Complexity

* Time: $O(n + m)$
* Memory: $O(n + m)$

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Edge { int to; int id; };

int n, m;
vector<vector<Edge>> g;
vector<int> tin, low, is_bridge;
int timer_val = 0;

void dfs_bridge(int v, int peid) {
    tin[v] = low[v] = ++timer_val;
    for (auto e : g[v]) {
        if (e.id == peid) continue;
        if (tin[e.to]) {
            low[v] = min(low[v], tin[e.to]);
        } else {
            dfs_bridge(e.to, e.id);
            low[v] = min(low[v], low[e.to]);
            if (low[e.to] > tin[v]) {
                is_bridge[e.id] = 1;
            }
        }
    }
}

vector<int> comp;

void dfs_comp(int v, int cid) {
    comp[v] = cid;
    for (auto e : g[v]) {
        if (comp[e.to]) continue;
        if (is_bridge[e.id]) continue;
        dfs_comp(e.to, cid);
    }
}

pair<int, int> farthest(int start, const vector<vector<int>>& tree) {
    vector<int> dist(tree.size(), -1);
    queue<int> q;
    q.push(start); dist[start] = 0;
    int best = start;
    while (!q.empty()) {
        int v = q.front(); q.pop();
        if (dist[v] > dist[best]) best = v;
        for (int u : tree[v]) {
            if (dist[u] == -1) {
                dist[u] = dist[v] + 1;
                q.push(u);
            }
        }
    }
    return {best, dist[best]};
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    cin >> n >> m;
    g.assign(n + 1, {});
    tin.assign(n + 1, 0);
    low.assign(n + 1, 0);
    is_bridge.assign(m, 0);
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        g[u].push_back({v, i});
        g[v].push_back({u, i});
    }
    dfs_bridge(1, -1);
    comp.assign(n + 1, 0);
    int cid = 0;
    for (int i = 1; i <= n; i++) {
        if (!comp[i]) {
            dfs_comp(i, ++cid);
        }
    }
    vector<vector<int>> tree(cid + 1);
    for (int v = 1; v <= n; v++) {
        for (auto e : g[v]) {
            if (is_bridge[e.id]) {
                int a = comp[v];
                int b = comp[e.to];
                if (a != b) {
                    tree[a].push_back(b);
                }
            }
        }
    }
    for (int i = 1; i <= cid; i++) {
        sort(tree[i].begin(), tree[i].end());
        tree[i].erase(unique(tree[i].begin(), tree[i].end()), tree[i].end());
    }
    if (cid == 1) {
        cout << 0 << "\n";
        return 0;
    }
    int u = farthest(1, tree).first;
    int diameter = farthest(u, tree).second;
    cout << diameter << "\n";
}
```

---

### Shadow Line – ICPC NAC 2024 Problem K

Compute the measure of light positions $L \le 0$ such that the union of projected intervals on the wall is exactly one interval.

#### Complexity

* Time for critical L generation: $O(n^2)$
* Time per sampled region: $O(n \log n)$
* Total time: $O(n^2 \log n)$ in worst case
* Memory: $O(n^2)$ for critical values, plus $O(n)$ per sample

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Seg { long double x, y1, y2; };

long double projectY(long double L, long double W, long double x, long double y) {
    long double t = (W - L) / (x - L);
    return t * y;
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; long double W;
    if (!(cin >> n >> W)) return 0;
    vector<Seg> seg(n);
    for (int i = 0; i < n; i++) {
        long double xi, yl, yh;
        cin >> xi >> yl >> yh;
        seg[i] = {xi, yl, yh};
    }
    const long double NEG_INF = -1e30L;

    // Collect endpoints
    int E = 2 * n;
    vector<long double> ex(E), ey(E);
    for (int i = 0; i < n; i++) {
        ex[2 * i] = seg[i].x; ey[2 * i] = seg[i].y1;
        ex[2 * i + 1] = seg[i].x; ey[2 * i + 1] = seg[i].y2;
    }

    vector<long double> crit;
    crit.reserve(2 + (size_t)E * (E - 1) / 2);
    crit.push_back(NEG_INF);
    crit.push_back(0.0L);

    // Compute critical L values where projected endpoint order changes
    for (int i = 0; i < E; i++) {
        for (int j = i + 1; j < E; j++) {
            long double ya = ey[i];
            long double yb = ey[j];
            if (fabsl(yb - ya) < 1e-18L) continue;
            long double xa = ex[i];
            long double xb = ex[j];
            long double L = (yb * xa - ya * xb) / (yb - ya);
            if (L <= 0.0L) crit.push_back(L);
        }
    }

    sort(crit.begin(), crit.end());
    crit.erase(
        unique(crit.begin(), crit.end(), [](long double a, long double b) {
            return fabsl(a - b) < 1e-15L;
        }),
        crit.end()
    );

    auto countMerged = [&](long double L) -> int {
        vector<pair<long double, long double>> iv;
        iv.reserve(n);
        for (int i = 0; i < n; i++) {
            long double yA = projectY(L, W, seg[i].x, seg[i].y1);
            long double yB = projectY(L, W, seg[i].x, seg[i].y2);
            if (yA > yB) swap(yA, yB);
            iv.emplace_back(yA, yB);
        }
        sort(iv.begin(), iv.end());
        int cnt = 1;
        long double curL = iv[0].first;
        long double curR = iv[0].second;
        for (int i = 1; i < n; i++) {
            if (iv[i].first > curR) {
                cnt++;
                curL = iv[i].first;
                curR = iv[i].second;
            } else {
                if (iv[i].second > curR) {
                    curR = iv[i].second;
                }
            }
        }
        return cnt;
    };

    // Check the unbounded region near -infinity
    if (countMerged(NEG_INF) == 1) {
        cout << "-1\n";
        return 0;
    }

    long double ans = 0.0L;
    for (int i = 0; i + 1 < (int)crit.size(); i++) {
        long double L1 = crit[i];
        long double L2 = crit[i + 1];
        if (L2 <= -1e25L) continue;
        if (L1 >= 0.0L) continue;
        if (L2 <= L1) continue;

        long double a = max(L1, NEG_INF / 10.0L);
        long double b = min(L2, 0.0L);
        if (b <= a) continue;

        long double mid = (a + b) * 0.5L;
        if (countMerged(mid) == 1) {
            ans += (b - a);
        }
    }

    cout.setf(ios::fixed);
    cout << setprecision(10) << ans << "\n";
}
```

---

## 8) Common Pitfalls

* Cross overflow with 32 bit ints on $10^9$ coordinates. Use `long long`.
* Floating orientation on integral inputs. Prefer integer signs.
* Missing collinear overlap when endpoints touch.
* No clamp in projection leads outside the segment.
* Interval merge with unsorted starts.
* For Shadow Line, forgetting the separate $L \to -\infty$ test.

---

## 9) TLDR

* Geometry II boils down to orientation, intersection, projection.
* Segment intersection is 4 signs plus collinear overlap.
* Projection is dot plus clamp.
* Shadows are ray to wall plus interval merge.
* Shadow Line is the moving light variant: orientation zero events partition $L$.

---

## 10) Recommended Problems

* [Codeforces 16E - Fish](https://codeforces.com/problemset/problem/16/E)
* [Codeforces 1000E - We Need More Bosses](https://codeforces.com/problemset/problem/1000/E)
* [AtCoder ABC259 F - Select Edges](https://atcoder.jp/contests/abc259/tasks/abc259_f)
* [Kattis – Line Segment Intersection](https://open.kattis.com/problems/segmentintersection)
* [ICPC NAC 2024 Problem K – Shadow Line](https://open.kattis.com/problems/shadowline)
* [Kattis – birthdaycake](https://open.kattis.com/problems/birthdaycake)
* [Codeforces Gym 104757 C - Extension Point](https://codeforces.com/gym/104757/problem/C)