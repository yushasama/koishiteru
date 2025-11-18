# **Geometry III – Polygons and Convex Hull**

This house is the moment geometry becomes shapes you can reason about.
Not single cuts. Not lonely segments.
Full polygons. Full boundaries. Full structure.

You work with areas, containment, hulls, and any shape that behaves cleanly when you walk around its edges.

Your toolbox is small but powerful:

* **Shoelace** for exact area.
* **Monotone chain** for convex hulls that never break.
* **Point in polygon** for odd–even checks and winding signs.
* **Rotating calipers** for farthest pairs, width, and support lines.

Most problems here reduce a complicated picture into a clean convex core.
You strip a shape down to its hull.
You use that hull to answer max dot products, nearest directions, farthest pairs, or any query that depends on the boundary, not the interior.

This house also holds every standard pattern:

* compute the hull
* walk it
* find the feature
* answer the query

Area? Shoelace.
Containment? Winding parity.
Support directions? Calipers.
Farthest pair? Calipers again.
Convex polygon clipping? March around edges with orientation tests.

When a problem talks about:

* regions with real boundaries
* polygon area or centroid
* convex envelopes
* extreme points
* checking if something lies inside a shape
* walking around vertices in order

Everything reduces to a few standard passes over a well formed boundary.

---

## 0) Core Definitions

**Simple polygon**
Non self-intersecting closed polyline $p[0..n-1]$.

**Convex polygon**
Every internal angle $\le 180^\circ$, equivalently each edge supports the polygon on one side.

**Signed area (shoelace)**
For CCW polygon:
$$
2,\text{Area} ;=; \sum_i \operatorname{cross}(p_i, p_{i+1})
$$
Positive if CCW, negative if CW.

**Convex hull**
Smallest convex polygon containing a set of points. Monotone chain runs in $O(n\log n)$.

**Rotating calipers**
Linear sweep on convex polygons to get diameter, width, support pairs.

---

## 1) Constraints

* $n$ up to $2\cdot 10^5$ is common for hull. Sort once, linear build.
* Use 64-bit for integer coordinates up to $10^9$. Cross of differences fits in signed 64-bit.
* Keep computations integer as long as possible. Take $\sqrt{\cdot}$ only at the end.

Pitfalls:

* Not deduplicating points before hull.
* Using strict vs non-strict turn tests inconsistently. Decide if you keep collinear boundary points.
* Ray casting edge cases on horizontal edges. Handle on-edge first.
* Shoelace sign flipped because input is CW. Either take absolute or enforce CCW.

---

## 2) Theory Bridge

**Shoelace**
$$
\text{Area} ;=; \left|\sum_i \operatorname{cross}(p_i, p_{i+1})\right|/2
$$

**Monotone chain correctness**
Sort by $(x,y)$. Maintain convex frontier by popping while the last two edges and the new point make a non-left turn.

**Point in polygon**
Ray casting counts crossings to the right. Odd means inside. Always test on-edge first via orientation zero plus bounding box.

**Calipers**
On a convex polygon, the farthest pair is an antipodal pair. Two pointers walk around the hull in $O(h)$.

---

## 3) Spotting The Model

| Statement phrase                      | Technique                           |
| ------------------------------------- | ----------------------------------- |
| smallest fence around points          | convex hull                         |
| polygon area or centroid              | shoelace                            |
| is point inside polygon               | ray casting or convex binary search |
| farthest pair of points               | hull + rotating calipers            |
| convex polygons intersection or union | half-plane or convex intersection   |
| polygon A inside B                    | on-edge check + point in polygon    |

---

## 4) Shapes and Models

| Type                    | How to tell       | Output         | Solver               | Complexity        | Notes               |
| ----------------------- | ----------------- | -------------- | -------------------- | ----------------- | ------------------- |
| Hull of points          | raw points        | convex polygon | monotone chain       | $O(n\log n)$      | stable and short    |
| Polygon area            | vertices in order | area           | shoelace             | $O(n)$            | sign is orientation |
| Point in polygon        | general polygon   | inside or not  | on-edge + ray cast   | $O(n)$            | robust              |
| Point in convex polygon | convex, CCW       | inside or not  | binary search on fan | $O(\log n)$       | many queries        |
| Diameter of set         | farthest pair     | max distance   | hull + calipers      | $O(n\log n)+O(h)$ | $h$ hull size       |

---

## 5) Algorithms

**Orientation**
$$
\operatorname{orient}(a,b,c)=\operatorname{cross}(b-a,,c-a)
$$

**Segment intersection**
Compute $o_1,o_2,o_3,o_4$ as orientations and check sign disagreement, plus collinear overlap by boxes.

**Projection**
$$
t=\frac{\operatorname{dot}(P-A,;B-A)}{|B-A|^2},\quad t\in[0,1],\quad Q=A+t(B-A)
$$

**Rotating calipers step**
Advance $j$ while $|\operatorname{cross}(h_i,h_{i+1},h_{j+1})|$ increases.

---

## 6) Templates

### Point and Primitives

```cpp
struct P {
    long long x, y;

    bool operator<(const P& o) const {
        return x != o.x ? x < o.x : y < o.y;
    }
    bool operator==(const P& o) const {
        return x == o.x && y == o.y;
    }
};

P operator-(P a, P b) { return {a.x - b.x, a.y - b.y}; }

long long cross(P a, P b) { return a.x * b.y - a.y * b.x; }

long long cross(P a, P b, P c) { return cross(b - a, c - a); }

long long dot(P a, P b) { return a.x * b.x + a.y * b.y; }

long long sqdist(P a, P b) {
    long long dx = a.x - b.x;
    long long dy = a.y - b.y;

    return dx * dx + dy * dy;
}
```

### Convex Hull (monotone chain)

```cpp
vector<P> convex_hull(vector<P> pts) {
    sort(pts.begin(), pts.end());
    pts.erase(unique(pts.begin(), pts.end()), pts.end());

    int n = (int)pts.size();
    if (n <= 1) return pts;

    vector<P> lo, up;

    for (int i = 0; i < n; i++) {
        while ((int)lo.size() >= 2 &&
               cross(lo[(int)lo.size() - 2], lo.back(), pts[i]) <= 0) {
            lo.pop_back();
        }

        lo.push_back(pts[i]);
    }

    for (int i = n - 1; i >= 0; i--) {
        while ((int)up.size() >= 2 &&
               cross(up[(int)up.size() - 2], up.back(), pts[i]) <= 0) {
            up.pop_back();
        }

        up.push_back(pts[i]);
    }

    lo.pop_back();
    up.pop_back();
    lo.insert(lo.end(), up.begin(), up.end());
    
    return lo; // CCW, no duplicate last
}
```

### Shoelace area

```cpp
long double polygon_area2(const vector<P>& poly) { // returns 2 * area, signed
    long long s = 0;
    int n = (int)poly.size();

    for (int i = 0; i < n; i++) {
        int j = (i + 1) % n;
        s += cross(poly[i], poly[j]);
    }

    return (long double)s;
}
```

### Point on segment and point in polygon (general)

```cpp
bool on_seg(P a, P b, P p) {
    if (cross(a, b, p) != 0) return false;

    return min(a.x, b.x) <= p.x && p.x <= max(a.x, b.x) &&
           min(a.y, b.y) <= p.y && p.y <= max(a.y, b.y);
}

bool point_in_poly(const vector<P>& poly, P q) {
    int n = (int)poly.size();

    for (int i = 0; i < n; i++) {
        if (on_seg(poly[i], poly[(i + 1) % n], q)) return true; // on edge
    }

    bool c = false;

    for (int i = 0, j = n - 1; i < n; j = i++) {
        P a = poly[i], b = poly[j];
        bool up = (a.y > q.y) != (b.y > q.y);

        if (up) {
            long double xint = a.x +
                (long double)(b.x - a.x) * (q.y - a.y) / (long double)(b.y - a.y);
            if (xint > q.x) c = !c;
        }
    }

    return c;
}
```

### Diameter via rotating calipers

```cpp
long long convex_diameter_sq(const vector<P>& h) {
    int n = (int)h.size();

    if (n <= 1) return 0;
    if (n == 2) return sqdist(h[0], h[1]);

    long long best = 0;
    int j = 1;

    for (int i = 0; i < n; i++) {
        int ni = (i + 1) % n;

        while (true) {
            int nj = (j + 1) % n;

            long long cur = llabs(cross(h[i], h[ni], h[j]));
            long long nxt = llabs(cross(h[i], h[ni], h[nj]));
            
            if (nxt > cur) j = nj;
            else break;
        }

        best = max(best, sqdist(h[i], h[j]));
        best = max(best, sqdist(h[ni], h[j]));
    
    }
    
    return best;
}
```

---

## 7) Worked Examples

### Convex Hull Builder — Kattis convexhull

#### Problem

Given $n$ points, output the convex hull in CCW order without repeating the start. If multiple valid hulls exist due to collinear chains, include all boundary points.

#### Why Polygons and Hulls

Canonical hull construction. Many set problems reduce to the hull.

#### Complexity

$O(n\log n)$.

```cpp
#include <bits/stdc++.h>
using namespace std;

struct P {
    long long x, y;
    bool operator<(const P& o) const { return x != o.x ? x < o.x : y < o.y; }
    bool operator==(const P& o) const { return x == o.x && y == o.y; }
};

P operator-(P a, P b) { return {a.x - b.x, a.y - b.y}; }
long long cross(P a, P b) { return a.x * b.y - a.y * b.x; }
long long cross(P a, P b, P c) { return cross(b - a, c - a); }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    if (!(cin >> n)) return 0;
    vector<P> a(n);
    for (auto& p : a) cin >> p.x >> p.y;

    sort(a.begin(), a.end());
    a.erase(unique(a.begin(), a.end()), a.end());
    if (a.size() <= 1) {
        for (auto& p : a) cout << p.x << " " << p.y << "\n";
        return 0;
    }

    vector<P> lo, up;

    for (auto& p : a) {
        while (lo.size() >= 2 &&
               cross(lo[lo.size() - 2], lo.back(), p) < 0) {
            lo.pop_back();
        }
        lo.push_back(p);
    }

    for (int i = (int)a.size() - 1; i >= 0; i--) {
        auto p = a[i];
        while (up.size() >= 2 &&
               cross(up[up.size() - 2], up.back(), p) < 0) {
            up.pop_back();
        }
        up.push_back(p);
    }

    lo.pop_back();
    up.pop_back();
    lo.insert(lo.end(), up.begin(), up.end());

    for (auto& p : lo) cout << p.x << " " << p.y << "\n";
}
```

---

### Point in Polygon — Kattis pointinpolygon

#### Problem

Given one simple polygon and many query points, report if each is inside or on the boundary.

#### Why Polygons and Hulls

General containment is a staple. Handle on-edge first, then parity by ray cast.

#### Complexity

$O(n)$ per query.

```cpp
#include <bits/stdc++.h>
using namespace std;

struct P {
    long long x, y;
};

P operator-(P a, P b) { return {a.x - b.x, a.y - b.y}; }
long long cross(P a, P b) { return a.x * b.y - a.y * b.x; }
long long cross(P a, P b, P c) { return cross(b - a, c - a); }

bool on_seg(P a, P b, P p) {
    if (cross(a, b, p)) return false;

    return min(a.x, b.x) <= p.x && p.x <= max(a.x, b.x) &&
           min(a.y, b.y) <= p.y && p.y <= max(a.y, b.y);
}

bool pip(const vector<P>& poly, P q) {
    int n = (int)poly.size();

    for (int i = 0; i < n; i++) {
        if (on_seg(poly[i], poly[(i + 1) % n], q)) return true;
    }

    bool c = false;

    for (int i = 0, j = n - 1; i < n; j = i++) {
        P a = poly[i], b = poly[j];
        bool up = (a.y > q.y) != (b.y > q.y);
        
        if (up) {
            long double xint = a.x +
                (long double)(b.x - a.x) * (q.y - a.y) / (long double)(b.y - a.y);
        
          if (xint > q.x) c = !c;
        }
    }
    return c;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, q;
    
    if (!(cin >> n >> q)) return 0;
    vector<P> poly(n);

    for (auto& p : poly) cin >> p.x >> p.y;

    while (q--) {
        P r;
        cin >> r.x >> r.y;
        cout << (pip(poly, r) ? "INSIDE\n" : "OUTSIDE\n");
    }
}
```

---

### Polygon Containment — Codeforces 166B Polygon

#### Problem

Two polygons $A$ and $B$ are given. Decide if $B$ is strictly inside $A$ or $A$ is strictly inside $B$, otherwise no.

#### Why Polygons and Hulls

Combines boundary checks with strict point in polygon. Also ensure no edge intersections.

#### Complexity

$O(n+m)$ scans plus pairwise edge intersection in $O(n+m)$ with careful sweep or $O(nm)$ if small.

```cpp
#include <bits/stdc++.h>
using namespace std;

struct P {
    long long x, y;
};

P operator-(P a, P b) { return {a.x - b.x, a.y - b.y}; }
long long cross(P a, P b) { return a.x * b.y - a.y * b.x; }
long long cross(P a, P b, P c) { return cross(b - a, c - a); }

int sgn(long long z) { return (z > 0) - (z < 0); }

bool on_seg(P a, P b, P p) {
    if (cross(a, b, p)) return false;

    return min(a.x, b.x) <= p.x && p.x <= max(a.x, b.x) &&
           min(a.y, b.y) <= p.y && p.y <= max(a.y, b.y);
}

bool seg_inter(P a, P b, P c, P d) {
    long long o1 = cross(a, b, c);
    long long o2 = cross(a, b, d);
    long long o3 = cross(c, d, a);
    long long o4 = cross(c, d, b);

    if (o1 == 0 && on_seg(a, b, c)) return true;
    if (o2 == 0 && on_seg(a, b, d)) return true;
    if (o3 == 0 && on_seg(c, d, a)) return true;
    if (o4 == 0 && on_seg(c, d, b)) return true;

    return sgn(o1) != sgn(o2) && sgn(o3) != sgn(o4);
}

bool strict_pip(const vector<P>& poly, P q) { // strict inside only
    int n = (int)poly.size();

    for (int i = 0; i < n; i++) {
        if (on_seg(poly[i], poly[(i + 1) % n], q)) return false;
    }

    bool c = false;

    for (int i = 0, j = n - 1; i < n; j = i++) {
        P a = poly[i], b = poly[j];
        
        bool up = (a.y > q.y) != (b.y > q.y);
    
        if (up) {
            long double xint = a.x +
                (long double)(b.x - a.x) * (q.y - a.y) / (long double)(b.y - a.y);
            if (xint > q.x) c = !c;
        }
    }
    return c;
}

bool any_inter(const vector<P>& A, const vector<P>& B) {
    int n = (int)A.size();
    int m = (int)B.size();

    for (int i = 0; i < n; i++) {
        P a = A[i];
        P b = A[(i + 1) % n];
    
    for (int j = 0; j < m; j++) {
            P c = B[j];
            P d = B[(j + 1) % m];
    
            if (seg_inter(a, b, c, d)) return true;
        }
    }

    return false;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;

    if (!(cin >> n >> m)) return 0;

    vector<P> A(n), B(m);

    for (auto& p : A) cin >> p.x >> p.y;
    for (auto& p : B) cin >> p.x >> p.y;

    if (any_inter(A, B)) {
        cout << "NO\n";
        return 0;
    }

    bool BinA = strict_pip(A, B[0]);
    bool AinB = strict_pip(B, A[0]);

    cout << ((BinA || AinB) ? "YES\n" : "NO\n");
}
```

---

### Convex Diameter — Rotating Calipers

#### Problem

Given $n$ points, compute the maximum distance between any two points.

#### Why Polygons and Hulls

The farthest pair lies on the convex hull. Build hull, then calipers.

#### Complexity

$O(n\log n)$ to hull, $O(h)$ to calipers.

```cpp
#include <bits/stdc++.h>
using namespace std;

struct P {
    long long x, y;
    bool operator<(const P& o) const { return x != o.x ? x < o.x : y < o.y; }
    bool operator==(const P& o) const { return x == o.x && y == o.y; }
};

P operator-(P a, P b) { return {a.x - b.x, a.y - b.y}; }
long long cross(P a, P b) { return a.x * b.y - a.y * b.x; }
long long cross(P a, P b, P c) { return cross(b - a, c - a); }
long long sqd(P a, P b) { long long dx = a.x - b.x, dy = a.y - b.y; return dx * dx + dy * dy; }

vector<P> hull(vector<P> a) {
    sort(a.begin(), a.end());
    a.erase(unique(a.begin(), a.end()), a.end());

    if (a.size() <= 1) return a;

    vector<P> lo, up;
    
    for (auto& p : a) {
        while (lo.size() >= 2 && cross(lo[lo.size() - 2], lo.back(), p) <= 0) lo.pop_back();
        lo.push_back(p);
    }
    
    for (int i = (int)a.size() - 1; i >= 0; i--) {
        auto p = a[i];
        while (up.size() >= 2 && cross(up[up.size() - 2], up.back(), p) <= 0) up.pop_back();
        up.push_back(p);
    }
    
    lo.pop_back();
    up.pop_back();
    lo.insert(lo.end(), up.begin(), up.end());

    return lo;
}

long long diameter_sq(const vector<P>& h) {
    int n = (int)h.size();
    
    if (n <= 1) return 0;
    if (n == 2) return sqd(h[0], h[1]);

    long long best = 0;
    int j = 1;

    for (int i = 0; i < n; i++) {
        int ni = (i + 1) % n;
    
    while (true) {
            int nj = (j + 1) % n;

            long long cur = llabs(cross(h[i], h[ni], h[j]));
            long long nxt = llabs(cross(h[i], h[ni], h[nj]));
            
            if (nxt > cur) j = nj;
            else break;
        }

        best = max(best, sqd(h[i], h[j]));
        best = max(best, sqd(h[ni], h[j]));
    }

    return best;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    if (!(cin >> n)) return 0;
    vector<P> a(n);
    for (auto& p : a) cin >> p.x >> p.y;

    vector<P> h = hull(a);
    cout << fixed << setprecision(10) << sqrt((long double)diameter_sq(h)) << "\n";
}
```

---

### Problem 6: Fractal Painting

#### Problem

We have vectors

* $a = \overrightarrow{A} = (x_0, y_0)$ from $(0,0)$ to $(x_0,y_0)$
* $b = \overrightarrow{B} = (x_1 - x_0,, y_1 - y_0)$ from $(x_0,y_0)$ to $(x_1,y_1)$
* $c = \overrightarrow{C} = (x_2 - x_0,, y_2 - y_0)$ from $(x_0,y_0)$ to $(x_2,y_2)$

From $(x_1,y_1)$ draw $D,E$ such that $(A,B,C)$ is similar to $(B,D,E)$, and from $(x_2,y_2)$ draw $F,G$ such that $(A,B,C)$ is similar to $(C,F,G)$. Repeat forever. Decide if the entire painting fits inside some finite rectangle.

#### Why Polygons and Hulls

Similarity system with two ratios $r_b = \lVert b\rVert/\lVert a\rVert$ and $r_c = \lVert c\rVert/\lVert a\rVert$. Bounded iff both ratios are strictly less than $1$.

#### Key Idea

$$
\max{\lVert b\rVert, \lVert c\rVert} < \lVert a\rVert
\quad\Longleftrightarrow\quad r_b<1 \text{ and } r_c<1
$$
Compare squared norms:
$$
\lVert a\rVert^2 = x_0^2 + y_0^2,\quad
\lVert b\rVert^2 = (x_1-x_0)^2 + (y_1-y_0)^2,\quad
\lVert c\rVert^2 = (x_2-x_0)^2 + (y_2-y_0)^2
$$
Answer YES iff $\lVert b\rVert^2 < \lVert a\rVert^2$ and $\lVert c\rVert^2 < \lVert a\rVert^2$.

#### Complexity

$O(1)$ per test case.

#### Code

```cpp
#include <bits/stdc++.h>
using namespace std;

long long sq(long long x) { return x * x; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int T;
    if (!(cin >> T)) return 0;

    while (T--) {
        long long x0, y0, x1, y1, x2, y2;
        cin >> x0 >> y0 >> x1 >> y1 >> x2 >> y2;

        long long a2 = sq(x0) + sq(y0);
        long long bx = x1 - x0, by = y1 - y0;
        long long cx = x2 - x0, cy = y2 - y0;
        long long b2 = sq(bx) + sq(by);
        long long c2 = sq(cx) + sq(cy);

        bool ok = (b2 < a2) && (c2 < a2);
        cout << (ok ? "YES\n" : "NO\n");
    }
    return 0;
}
```

---

## 8) Common Pitfalls

* Forgetting to remove duplicates before hull.
* Using the wrong inequality for keeping collinear points on hull.
* Not checking on-edge first for point in polygon.
* Mixing double and integer logic in containment.
* For fractal painting, overthinking similarity angles. Only the ratios matter for boundedness.

---

## 9) TLDR

* Shoelace: $\sum \operatorname{cross}(p_i,p_{i+1})/2$.
* Build the hull first; many tasks reduce to it.
* Point in polygon: on-edge, then parity.
* Diameter: hull + calipers in $O(h)$.
* Fractal painting bounded iff $\lVert b\rVert<\lVert a\rVert$ and $\lVert c\rVert<\lVert a\rVert$.

---

## 10) Recommended Problems
* [USACO Guide - Convex Hull](https://usaco.guide/plat/convex-hull)
* [Codeforces 166B - Polygons](https://codeforces.com/problemset/problem/166/B)
* [AtCoder ABC296 G - Polygon and Points](https://atcoder.jp/contests/abc296/tasks/abc296_g)
* [AtCoder ABC202 F - Integer Convex Hull](https://atcoder.jp/contests/abc202/tasks/abc202_f)
* [Kattis - Convex Hull](https://open.kattis.com/problems/convexhull)
* [Kattis - Point in Polygon](https://open.kattis.com/problems/pointinpolygon)
