Alright, Geometry IV rewrite with:

* your Fenwick template wired in
* clean custom segtree for rectangles
* no numbered 2.X subsections
* spaced like a human, no inline/static junk

Here we go.

---

# Geometry IV – Sweep Line and Closest Pair

This is the house where you stop simulating geometry and start sorting it.

You imagine a vertical line sweeping from left to right. Every time it hits something (segment endpoint, rectangle side, query point), you update an “active set”. Global geometry questions become local maintenance:

* “Closest pair of points” becomes “keep a small vertical strip around each point as you sweep”.
* “Area of union of rectangles” becomes “track covered y-length while x moves”.
* “Any two segments intersect” becomes “only neighbors in the active set can collide”.
* “How many intervals cover each query point” becomes “Fenwick plus events”.

The whole pattern is:

1. Turn geometry into **events** sorted by one coordinate.
2. Maintain an **active structure** indexed by the other coordinate(s).
3. Let the answer fall out while processing events.

---

## 0) Core Definitions

**Sweep line**
An imaginary line (usually vertical) that moves across the plane. We process geometry in order of increasing sweep coordinate.

**Event**
A position of the sweep line where the set of active objects changes: segment start/end, rectangle edge, query point.

**Active set**
The structure of objects currently intersecting the sweep line. Often a `set` ordered by y, or a Fenwick / segment tree over y intervals.

**Closest pair**
Given $n$ points, find the minimum Euclidean distance between any pair. Solved in $O(n \log n)$ via sweep / divide and conquer.

**Rectangle union area**
Given axis aligned rectangles, compute the area of their union. Solved in $O(n \log n)$ with an x-sweep and a segment tree over y.

---

## 1) Constraints and When To Use This House

You are in sweep-line territory when:

* $n$ is around $10^5$ or $2 \cdot 10^5$.
* The naive approach is $O(n^2)$ pair checks.
* The geometry is “aligned” with an axis: segments, rectangles, points with obvious sort key.
* The statement says things like:

  * “find any intersection”
  * “minimum distance between points”
  * “area of union of many rectangles”
  * “for each query point, how many segments cover it”

Typical budgets:

* Time: $O(n \log n)$ or $O((n + q) \log (n + q))$.
* Memory: $O(n)$ or $O((n + q))$.

Brute force fails for:

* Segment intersection with $n = 10^5$ segments.
* Closest pair with $n = 2 \cdot 10^5$ points.
* Rectangle union with $n = 10^5$ rectangles.

---

## Theory Bridge

There are three core ideas.

### Closest Pair Strip Argument

Sort points by $x$. Suppose you already know the global best squared distance $d^2$. Any point only needs to compare to points whose $x$ is within $\sqrt{d^2}$ and whose $y$ is also within $\sqrt{d^2}$. In the strip, each point has only $O(1)$ candidates in the $y$-ordered set, so the whole algorithm stays $O(n \log n)$.

### Rectangle Union as 1D Coverage

Rectangles become vertical edges plus y-intervals. For each vertical strip between consecutive x-events, the union area in that strip is:

$$
\text{area} += \text{covered_y} \cdot \Delta x
$$

All the heavy lifting is in maintaining `covered_y` as you add/remove y-intervals. That is a segment tree over compressed y.

### Segment Intersection as Local Neighbor Checks

At any given x, active segments are ordered by their y at that x. A new intersection can only appear between neighboring segments in this ordering. So each event only has to check O(1) neighbors, not all pairs.

---

## Spotting The Model

| Statement phrase                            | Model                            |
| ------------------------------------------- | -------------------------------- |
| “closest pair of points”                    | closest-pair sweep / DnC         |
| “area of the union of rectangles”           | x-sweep + segment tree on y      |
| “report if any segments intersect”          | segment sweep, active set by y   |
| “how many intervals cover each query”       | 1D sweep + Fenwick / prefix sums |
| “sum over pairs with constraint on x/y”     | sort + sweep with DS             |
| “for all points, count rectangles covering” | x-sweep or y-sweep with DS       |

---

## Shapes and Models

| Type                   | How to tell                           | Output           | Solver                        | Complexity           | Notes                   |
| ---------------------- | ------------------------------------- | ---------------- | ----------------------------- | -------------------- | ----------------------- |
| Closest pair of points | many points, min Euclidean distance   | min distance     | sweep / strip or DnC          | $O(n \log n)$        | core CP pattern         |
| Rectangle union area   | many axis aligned rectangles          | union area       | x-sweep + segment tree over y | $O(n \log n)$        | needs coord compression |
| Segment intersection   | arbitrary segments, any intersection? | yes / no         | x-sweep + ordered set by y    | $O((n+k)\log n)$     | often stop on first     |
| 1D interval coverage   | intervals + point queries on a line   | counts per point | events + Fenwick              | $O((n+q)\log (n+q))$ | good intro to sweeping  |

---

## Algorithms

### Closest Pair Sweep

1. Read all points, sort by $x$ (and by $y$ as tiebreaker).
2. Maintain best squared distance `best`.
3. Maintain an ordered set of active points, keyed by `y`, containing only points whose $x$ is within $\sqrt{\text{best}}$ of current $x$.
4. For each new point:

   * Remove stale points whose $x$ is too far left.
   * In the active set, only scan points with $|y - p.y| \le \sqrt{\text{best}}$.
   * Update `best` with squared distance checks.
5. Answer is $\sqrt{\text{best}}$ or `best` depending on problem.

### Rectangle Union Area via x-sweep

1. For each rectangle $(x_1, y_1, x_2, y_2)$ with $x_1 < x_2$, $y_1 < y_2$:

   * Add event $(x_1, y_1, y_2, +1)$.
   * Add event $(x_2, y_1, y_2, -1)$.
2. Collect all distinct y endpoints into a vector, sort, deduplicate. This is for coordinate compression.
3. Build a segment tree over y-intervals, where each node keeps:

   * `cnt`: how many rectangles currently cover this segment
   * `len`: how much of this segment is covered in original coordinates
4. Sort events by `x` (breaking ties with add before remove).
5. Sweep:

   * Between `prev_x` and `cur_x`, area contribution is `covered_y * (cur_x - prev_x)`, where `covered_y = seg[1].len`.
   * Apply current event’s update on the segment tree over `[y1, y2)`.
6. Sum all contributions.

### Segment Intersection Sweep

1. For each segment, normalize so $(x_a, y_a)$ is the left endpoint and $(x_b, y_b)$ is the right endpoint (swap if needed).
2. Create events:

   * `start` at $x_a$
   * `end` at $x_b$
3. Sort events by `x`, with starts before ends at same x.
4. Maintain `curX` and an ordered set of active segment indices, ordered by y at `curX`.
5. On start:

   * Insert segment into set.
   * Check intersection with predecessor and successor.
6. On end:

   * Before erasing, check whether predecessor and successor (if both exist) intersect after this one is removed.
7. On any intersection found, you can often stop.

This is more implementation-heavy; it is here mainly to show the pattern.

### 1D Interval Coverage with Fenwick

1. For each closed interval $[l, r]$ and query point $x$:

   * Coordinate compress all $l$, $r+1$, and $x$ values.
2. Use a Fenwick tree on compressed indices.
3. For each interval $[L, R]$ (indices after compression):

   * `add(L, +1)`
   * `add(R + 1, -1)`
4. For each query at index `X`, the answer is `sum(X)`.

This is the 1D version of the rectangle union pattern.

---

## Templates

### Closest Pair of Points (Sweep)

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Point {
    long long x, y;
};

long long sqdist(const Point &a, const Point &b) {
    long long dx = a.x - b.x;
    long long dy = a.y - b.y;
    return dx * dx + dy * dy;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;

    vector<Point> pts(n);
    for (int i = 0; i < n; i++) {
        cin >> pts[i].x >> pts[i].y;
    }

    sort(pts.begin(), pts.end(), [](const Point &a, const Point &b) {
        if (a.x != b.x) return a.x < b.x;
        return a.y < b.y;
    });

    set<pair<long long, int>> box; // (y, index)
    long long best = (long long)4e18;
    int left = 0;

    for (int i = 0; i < n; i++) {
        Point p = pts[i];

        long double limit = sqrt((long double)best) + 1e-9L;
        while (left < i && (long double)(p.x - pts[left].x) > limit) {
            box.erase({pts[left].y, left});
            left++;
        }

        long long y_low = p.y - (long long)ceil(limit);
        long long y_high = p.y + (long long)ceil(limit);

        auto it_low = box.lower_bound({y_low, -1});
        auto it_high = box.upper_bound({y_high, n});

        for (auto it = it_low; it != it_high; ++it) {
            int j = it->second;
            long long d2 = sqdist(p, pts[j]);
            if (d2 < best) {
                best = d2;
            }
        }

        box.insert({p.y, i});
    }

    cout << fixed << setprecision(10) << sqrt((long double)best) << "\n";
    return 0;
}
```

---

### Rectangle Union Area (Custom Segment Tree)

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Event {
    long long x;
    long long y1, y2;
    int type; // +1 add, -1 remove
};

struct Node {
    int cnt;
    long long len;
};

vector<Node> seg;
vector<long long> ys;

void pull(int idx, int l, int r) {
    if (seg[idx].cnt > 0) {
        seg[idx].len = ys[r] - ys[l];
    } else if (r - l <= 1) {
        seg[idx].len = 0;
    } else {
        seg[idx].len = seg[idx * 2].len + seg[idx * 2 + 1].len;
    }
}

void update(int idx, int l, int r, int ql, int qr, int delta) {
    if (qr <= l || r <= ql) {
        return;
    }
    if (ql <= l && r <= qr) {
        seg[idx].cnt += delta;
        pull(idx, l, r);
        return;
    }
    int mid = (l + r) / 2;
    update(idx * 2, l, mid, ql, qr, delta);
    update(idx * 2 + 1, mid, r, ql, qr, delta);
    pull(idx, l, r);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;

    vector<Event> ev;
    ev.reserve(2 * n);
    ys.reserve(2 * n);

    for (int i = 0; i < n; i++) {
        long long x1, y1, x2, y2;
        cin >> x1 >> y1 >> x2 >> y2;

        if (x1 > x2) swap(x1, x2);
        if (y1 > y2) swap(y1, y2);

        ev.push_back({x1, y1, y2, +1});
        ev.push_back({x2, y1, y2, -1});
        ys.push_back(y1);
        ys.push_back(y2);
    }

    sort(ys.begin(), ys.end());
    ys.erase(unique(ys.begin(), ys.end()), ys.end());

    auto get_id = [&](long long y) {
        return (int)(lower_bound(ys.begin(), ys.end(), y) - ys.begin());
    };

    sort(ev.begin(), ev.end(), [](const Event &a, const Event &b) {
        if (a.x != b.x) return a.x < b.x;
        return a.type > b.type; // add before remove at same x
    });

    int m = (int)ys.size();
    seg.assign(4 * m, Node{0, 0});

    long long prev_x = ev[0].x;
    long long area = 0;

    for (size_t i = 0; i < ev.size(); i++) {
        long long cur_x = ev[i].x;
        long long dx = cur_x - prev_x;
        area += seg[1].len * dx;

        int l = get_id(ev[i].y1);
        int r = get_id(ev[i].y2);
        update(1, 0, m - 1, l, r, ev[i].type);

        prev_x = cur_x;
    }

    cout << area << "\n";
    return 0;
}
```

---

### 1D Interval Coverage

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Fenwick {
    int n;
    vector<long long> bit;

    Fenwick(int n) : n(n), bit(n + 1, 0) {}

    void add(int i, long long x) {
        for (; i <= n; i += i & -i) bit[i] += x;
    }

    long long sum(int i) {
        long long res = 0;
        for (; i > 0; i -= i & -i) res += bit[i];
        return res;
    }

    long long rangeSum(int l, int r) {
        return sum(r) - sum(l - 1);
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, q;
    cin >> n >> q;

    vector<long long> coords;
    coords.reserve(2 * n + q);

    vector<pair<long long, long long>> segs(n);
    for (int i = 0; i < n; i++) {
        long long l, r;
        cin >> l >> r;
        if (l > r) swap(l, r);
        segs[i] = {l, r};
        coords.push_back(l);
        coords.push_back(r + 1);
    }

    vector<long long> qs(q);
    for (int i = 0; i < q; i++) {
        cin >> qs[i];
        coords.push_back(qs[i]);
    }

    sort(coords.begin(), coords.end());
    coords.erase(unique(coords.begin(), coords.end()), coords.end());

    auto get_id = [&](long long x) {
        return (int)(lower_bound(coords.begin(), coords.end(), x) - coords.begin()) + 1;
    };

    Fenwick fw((int)coords.size());

    for (int i = 0; i < n; i++) {
        int L = get_id(segs[i].first);
        int R = get_id(segs[i].second + 1);
        fw.add(L, +1);
        fw.add(R, -1);
    }

    for (int i = 0; i < q; i++) {
        int X = get_id(qs[i]);
        cout << fw.sum(X) << "\n";
    }

    return 0;
}
```

---

### Segment Intersection Existence (Sweep Skeleton)

```cpp
#include <bits/stdc++.h>
using namespace std;

struct P {
    long double x, y;
};

struct Seg {
    P a, b;
};

long double orient(const P &a, const P &b, const P &c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

bool on_seg(const P &a, const P &b, const P &p) {
    if (fabsl(orient(a, b, p)) > 1e-12L) return false;
    return min(a.x, b.x) - 1e-12L <= p.x && p.x <= max(a.x, b.x) + 1e-12L &&
           min(a.y, b.y) - 1e-12L <= p.y && p.y <= max(a.y, b.y) + 1e-12L;
}

bool seg_inter(const Seg &s, const Seg &t) {
    long double o1 = orient(s.a, s.b, t.a);
    long double o2 = orient(s.a, s.b, t.b);
    long double o3 = orient(t.a, t.b, s.a);
    long double o4 = orient(t.a, t.b, s.b);

    if (o1 * o2 < 0 && o3 * o4 < 0) return true;
    if (fabsl(o1) < 1e-12L && on_seg(s.a, s.b, t.a)) return true;
    if (fabsl(o2) < 1e-12L && on_seg(s.a, s.b, t.b)) return true;
    if (fabsl(o3) < 1e-12L && on_seg(t.a, t.b, s.a)) return true;
    if (fabsl(o4) < 1e-12L && on_seg(t.a, t.b, s.b)) return true;
    return false;
}

vector<Seg> segs;
long double curX;

long double value_at(int id, long double x) {
    const P &p = segs[id].a;
    const P &q = segs[id].b;
    if (fabsl(p.x - q.x) < 1e-12L) return p.y;
    long double t = (x - p.x) / (q.x - p.x);
    return p.y + t * (q.y - p.y);
}

struct Cmp {
    bool operator()(int i, int j) const {
        long double yi = value_at(i, curX);
        long double yj = value_at(j, curX);
        if (fabsl(yi - yj) > 1e-12L) return yi < yj;
        return i < j;
    }
};

struct Event {
    long double x;
    int id;
    bool start;
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;

    segs.resize(n);
    vector<Event> ev;

    for (int i = 0; i < n; i++) {
        long double x1, y1, x2, y2;
        cin >> x1 >> y1 >> x2 >> y2;

        if (x2 < x1) {
            swap(x1, x2);
            swap(y1, y2);
        }
        segs[i] = {{x1, y1}, {x2, y2}};
        ev.push_back({x1, i, true});
        ev.push_back({x2, i, false});
    }

    sort(ev.begin(), ev.end(), [](const Event &a, const Event &b) {
        if (fabsl(a.x - b.x) > 1e-12L) return a.x < b.x;
        return a.start > b.start;
    });

    set<int, Cmp> act;

    for (size_t k = 0; k < ev.size(); k++) {
        curX = ev[k].x;
        int id = ev[k].id;

        if (ev[k].start) {
            auto it = act.insert(id).first;
            auto prev_it = it == act.begin() ? act.end() : prev(it);
            auto next_it = next(it);

            if (prev_it != act.end() && seg_inter(segs[*prev_it], segs[id])) {
                cout << "YES\n";
                return 0;
            }
            if (next_it != act.end() && seg_inter(segs[*next_it], segs[id])) {
                cout << "YES\n";
                return 0;
            }
        } else {
            auto it = act.find(id);
            if (it != act.end()) {
                auto prev_it = it == act.begin() ? act.end() : prev(it);
                auto next_it = next(it);
                if (prev_it != act.end() && next_it != act.end() &&
                    seg_inter(segs[*prev_it], segs[*next_it])) {
                    cout << "YES\n";
                    return 0;
                }
                act.erase(it);
            }
        }
    }

    cout << "NO\n";
    return 0;
}
```

---

## Common Pitfalls

* Keeping all points in the closest-pair candidate set instead of shrinking the x-window. That turns into $O(n^2)$.
* Using actual distances with `sqrt` everywhere instead of squared distances. This hurts precision and speed.
* Getting half-open vs closed intervals wrong in rectangle union when compressing y. Your segment tree should treat `[y_i, y_{i+1})`.
* Sorting rectangle events but processing removes before adds at the same x, which creates zero-width gaps.
* Ordering active segments by their endpoints instead of their y at the current sweep x. That breaks segment intersection checks.
* In Fenwick-based coverage, forgetting that the tree is 1-indexed and messing up `add` and `sum` indices.

---

## TLDR

* Sweep line = sort by one coordinate, maintain a structure on the other.
* Closest pair: sort by x, sliding window in x, active set by y.
* Rectangle union: vertical edges as events, segment tree on compressed y with coverage counts, accumulate `len * dx`.
* Segment intersection: active set ordered by y at current x, intersections only between neighbors.
* 1D interval coverage is sweep line plus your Fenwick tree.

---

## Recommended Problems

* [Codeforces 1635F - Closest Pair](https://codeforces.com/problemset/problem/1635/F)
* [Codeforces Gym 104172 I - Closest Pair](https://codeforces.com/problemset/gymProblem/104172/I)
* [Codeforces Gym 101239 H - Frame of Blocks](https://codeforces.com/problemset/gymProblem/101239/H)  *(rectangle union style)*
* [Codeforces 1000E - We Need More Bosses](https://codeforces.com/contest/1000/problem/E)  *(graph but uses distance-style thinking)*
* [AtCoder Beginner Contest 311 F - Cans and Openers](https://atcoder.jp/contests/abc311/tasks/abc311_f)
* [AtCoder ABC233 F - Swap and Sort](https://atcoder.jp/contests/abc233/tasks/abc233_f)  *(Fenwick sweep over indices)*
* [Kattis - segmentintersection](https://open.kattis.com/problems/segmentintersection)
* [Kattis - closestpair2](https://open.kattis.com/problems/closestpair2)