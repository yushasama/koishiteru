# The Return of Segment Tree: Lazy and Beats

Plain segtree is fine when it is just point updates and clean range queries. Cool, fast, simple. But the moment you need range adds, range sets, or something like "cap everything over 10 to 10," that vanilla tree gets cooked.

This is where lazy propagation comes in: tag the range now, push later when needed. And if even that starts struggling, like when updates depend on current values (chmin, chmax), bring out Segment Tree Beats to keep things clean without nuking your time.

**Prerequisite.** You should be comfortable with baseline segment trees and Fenwick.

[Primer. on Segment Trees](https://koishite.ru/competitive/fenwick_segment_trees
)
---

## 0) Core Definitions

**Segment Tree.** A binary tree over $[0..n-1]$ that stores an aggregate for each segment. Supports point updates and range queries in $O(\log n)$.

**Lazy Segment Tree.** A segment tree that defers uniform range updates by storing a **lazy tag** at internal nodes. You record the tag at the covering node and propagate only when a query or deeper update needs the children. Each operation stays $O(\log n)$ even for range updates. Sometimes this is referred to as Segment Tree with Lazy Propogation.

**Segment Tree Beats.** A segment tree variant for value-dependent range operations such as $\mathrm{chmin}(x)$ or $\mathrm{chmax}(x)$. Each node tracks structure like $\max_1$, $\max_2$, $\mathrm{cnt}_{\max}$, and $\mathrm{sum}$ so a clamp update applies to an entire node when it does not cross the node's second extreme. Otherwise, descend and continue. Amortized $O(\log n)$ to $O(\log^2 n)$.

**Range style.** Inclusive $[l, r]$ in all code.

---

## 1) Constraints

* Typical CP: $n, q \le 2\cdot 10^5$, time limit $1$ s.
* Budget: about $10^8$ to $2\cdot 10^8$ simple ops per second in C++.
* Costs:
  * Build $O(n)$
  * Lazy range update or query $O(\log n)$
  * Beats $\mathrm{chmin}/\mathrm{chmax}$ amortized $O(\log n \cdot \alpha(n))$

**Online vs offline and query style**

* Segment trees are online. No reordering.
* We code inclusive $[l, r]$. Be consistent.

**Operation type and model fit**

* Query aggregate must be associative with identity: sum, min, max, gcd.
* Lazy works for uniform, composable updates: add, assign, affine.
* Beats is for value clamping updates where a simple tag is insufficient: $\mathrm{chmin}$, $\mathrm{chmax}$, sometimes modulo patterns.

**Updates pattern**

* Many range updates and many queries -> lazy.
* Point-only updates -> Fenwick or plain segtree.
* Heavy $\mathrm{chmin}/\mathrm{chmax}$ -> Beats.

**Value ranges and compression**

* If indices are up to $10^9$ but only $M$ points matter, coordinate-compress to $M$ before building.
* Use `long long` for sums.

**Memory budget**

* `tree` and `lazy` of size $4n$ are standard.
* Beats stores a few scalars per node. Still $O(n)$.

**Heuristics and knobs**

* Recursive $4n$ implementation is reliable under contest time.
* For assign+add, model tags with precedence. Assign overrides add.

**Pitfalls**

* Always `push` before descending and `pull` after updating children.
* Compose tags as new after old. Be explicit in code.
* Reset per test case or use epochs.
* Beats applies a clamp at a node only if it does not cross the node's second extreme.

---

## 2) Theory Bridge

Two monoids and an action:

* Data monoid $(D, \oplus, \mathrm{id}_D)$ for queries.
* Update monoid $(U, \circ, \mathrm{id}_U)$ for tags.
* Action $\mathrm{apply}: U \times D \to D$ with
$$
\mathrm{apply}(\mathrm{id}_U, d) = d,\qquad
\mathrm{apply}(u_2, \mathrm{apply}(u_1, d)) = \mathrm{apply}(u_2 \circ u_1, d).
$$

Examples:

* **Range add, range sum**
$$
\mathrm{apply}(\Delta, (\mathrm{sum}, \mathrm{len})):\
\mathrm{sum} \gets \mathrm{sum} + \Delta \cdot \mathrm{len},\quad
\Delta_{\text{new}} \circ \Delta_{\text{old}} = \Delta_{\text{new}} + \Delta_{\text{old}}.
$$

* **Range assign, range sum** with tag $(\text{hasSet}, s, \Delta)$
$$
\mathrm{apply}:\ \text{if hasSet} \Rightarrow \mathrm{sum} \gets s \cdot \mathrm{len};\quad
\mathrm{sum} \gets \mathrm{sum} + \Delta \cdot \mathrm{len}.
$$
New assign overrides prior assign and clears prior add. New add stacks.

* **Beats $\mathrm{chmin}(x)$** with node $(\mathrm{sum}, \max_1, \max_2, \mathrm{cnt}_{\max})$
$$
\text{if } x \ge \max_1 \Rightarrow \text{noop};\quad
\text{if } \max_2 < x < \max_1 \Rightarrow
\mathrm{sum} \gets \mathrm{sum} - (\max_1 - x)\cdot \mathrm{cnt}_{\max},\ \max_1 \gets x.
$$
Otherwise descend.

---

## 3) Spotting the Model

| Clues in statement                          | Model                             |
| ------------------------------------------- | --------------------------------- |
| "Add x to [l,r]" and sum or min queries     | Lazy add segtree                  |
| "Set [l,r] = x" and sum or min queries      | Lazy assign segtree               |
| "Clamp to at most x" or "at least x"        | Segment Tree Beats                |
| Only point updates, range sums              | Fenwick or plain segtree          |
| Need gcd over ranges, with point updates    | Plain segtree with gcd nodes      |
| Indices sparse up to $10^9$                 | Coordinate compress, then segtree |

---

## 4) Shapes and Models

| Type                                        | How to tell                   | What to output            | Shape | Solver                 | Notes                                               |
| ------------------------------------------- | ----------------------------- | ------------------------- | ----- | ---------------------- | --------------------------------------------------- |
| Point update, range sum                     | Many point bumps, sum queries | Sum                       | Array | Fenwick or Segtree     | Fenwick is smaller code.                            |
| Range add, range sum                        | "Add x to [l,r]"              | Sum                       | Array | Lazy segtree           | Store $\mathrm{sum}$, $\mathrm{len}$, and `lzAdd`.  |
| Range assign, range sum                     | "Set [l,r] = x"               | Sum                       | Array | Lazy segtree           | Tag `(hasSet, s, Delta)`. Assign overrides.         |
| Range min or max only                       | Query min or max, few updates | Min or Max                | Array | Plain segtree          | No lazy if queries only.                            |
| Range $\mathrm{chmin}/\mathrm{chmax}$ + sum | Value clamps                  | Sum and sometimes extreme | Array | Segment Tree Beats     | Track extremes and counts.                          |
| GCD with adds on diffs                      | GCD queries with adds         | GCD                       | Array | Segtree on differences | Standard trick.                                     |

---

## 5) Algorithms

### Lazy segment tree

* Node keeps query aggregate and often $\mathrm{len}$.
* Tag keeps pending operation. For add: a number. For assign: a flagged pair and optional add on top.
* Update $[l,r]$: if the node is fully covered, mutate aggregate and compose tag, then stop. Else push and recurse.

### Segment Tree Beats

* Node keeps $(\max_1, \max_2, \mathrm{cnt}_{\max}, \mathrm{sum})$ for $\mathrm{chmin}$. Min-symmetric for $\mathrm{chmax}$.
* For $\mathrm{chmin}(x)$ on a node:
  * If $x \ge \max_1$ do nothing.
  * If $\max_2 < x < \max_1$ apply in bulk:
    $$
    \mathrm{sum} \gets \mathrm{sum} - (\max_1 - x)\cdot \mathrm{cnt}_{\max},\quad \max_1 \gets x.
    $$
  * Else push to children and continue.

---

## 6) Templates

### A) Lazy Range Add + Range Sum

```cpp
#include <bits/stdc++.h>
using namespace std;

struct LazyAddSum {
    struct Node {
        long long sum = 0;
        int len = 1;
    };

    int n;
    vector<Node> st;
    vector<long long> lz;
    vector<bool> marked;

    LazyAddSum(int n_) : n(n_), st(4 * n_), lz(4 * n_), marked(4 * n_) {}

    void build(const vector<long long>& a, int p = 1, int L = 0, int R = -1) {
        if (R == -1) R = n - 1;
        if (L == R) { st[p] = {a[L], 1}; return; }
        int M = (L + R) >> 1;
        build(a, p << 1, L, M);
        build(a, p << 1 | 1, M + 1, R);
        pull(p);
    }

    void pull(int p) {
        st[p].sum = st[p << 1].sum + st[p << 1 | 1].sum;
        st[p].len = st[p << 1].len + st[p << 1 | 1].len;
    }
    void apply_add(int p, long long v) {
        st[p].sum += v * st[p].len;
        lz[p] += v;
        marked[p] = true;
    }
    void push(int p) {
        if (!marked[p]) return;
        apply_add(p << 1, lz[p]);
        apply_add(p << 1 | 1, lz[p]);
        lz[p] = 0;
        marked[p] = false;
    }

    void range_add(int ql, int qr, long long v, int p = 1, int L = 0, int R = -1) {
        if (R == -1) R = n - 1;
        if (qr < L || R < ql) return;
        if (ql <= L && R <= qr) { apply_add(p, v); return; }
        push(p);
        int M = (L + R) >> 1;
        range_add(ql, qr, v, p << 1, L, M);
        range_add(ql, qr, v, p << 1 | 1, M + 1, R);
        pull(p);
    }
    long long range_sum(int ql, int qr, int p = 1, int L = 0, int R = -1) {
        if (R == -1) R = n - 1;
        if (qr < L || R < ql) return 0;
        if (ql <= L && R <= qr) return st[p].sum;
        push(p);
        int M = (L + R) >> 1;
        return range_sum(ql, qr, p << 1, L, M) + range_sum(ql, qr, p << 1 | 1, M + 1, R);
    }
};
```

### B) Segment Tree Beats for $\mathrm{chmin}$ + sum

```cpp
#include <bits/stdc++.h>
using namespace std;

struct BeatsChMinSum {
    struct Node {
        long long sum;
        long long mx1;   // maximum in segment
        long long mx2;   // second maximum
        int cntMx;       // count of maximum
    };

    int n;
    vector<Node> st;

    BeatsChMinSum(int n_) : n(n_), st(4 * n_) {}

    static Node make_leaf(long long v) {
        return Node{v, v, LLONG_MIN, 1};
    }
    static Node merge(const Node& a, const Node& b) {
        Node r; r.sum = a.sum + b.sum;
        if (a.mx1 == b.mx1) {
            r.mx1 = a.mx1;
            r.mx2 = max(a.mx2, b.mx2);
            r.cntMx = a.cntMx + b.cntMx;
        } else if (a.mx1 > b.mx1) {
            r.mx1 = a.mx1;
            r.mx2 = max(a.mx2, b.mx1);
            r.cntMx = a.cntMx;
        } else {
            r.mx1 = b.mx1;
            r.mx2 = max(a.mx1, b.mx2);
            r.cntMx = b.cntMx;
        }
        return r;
    }

    void build(const vector<long long>& a, int p = 1, int L = 0, int R = -1) {
        if (R == -1) R = n - 1;
        if (L == R) { st[p] = make_leaf(a[L]); return; }
        int M = (L + R) >> 1;
        build(a, p << 1, L, M);
        build(a, p << 1 | 1, M + 1, R);
        st[p] = merge(st[p << 1], st[p << 1 | 1]);
    }

    void apply_chmin(int p, long long x) {
        if (st[p].mx1 <= x) return;
        st[p].sum -= 1LL * (st[p].mx1 - x) * st[p].cntMx;
        st[p].mx1 = x;
    }
    void push(int p) {
        for (int c : {p << 1, p << 1 | 1})
            if (st[c].mx1 > st[p].mx1) apply_chmin(c, st[p].mx1);
    }

    void range_chmin(int ql, int qr, long long x, int p = 1, int L = 0, int R = -1) {
        if (R == -1) R = n - 1;
        if (qr < L || R < ql || st[p].mx1 <= x) return;
        if (ql <= L && R <= qr && st[p].mx2 < x) { apply_chmin(p, x); return; }
        push(p);
        int M = (L + R) >> 1;
        range_chmin(ql, qr, x, p << 1, L, M);
        range_chmin(ql, qr, x, p << 1 | 1, M + 1, R);
        st[p] = merge(st[p << 1], st[p << 1 | 1]);
    }

    long long range_sum(int ql, int qr, int p = 1, int L = 0, int R = -1) {
        if (R == -1) R = n - 1;
        if (qr < L || R < ql) return 0;
        if (ql <= L && R <= qr) return st[p].sum;
        push(p);
        int M = (L + R) >> 1;
        return range_sum(ql, qr, p << 1, L, M) + range_sum(ql, qr, p << 1 | 1, M + 1, R);
    }
};
```

---

## 7) Worked Examples

### 7A) Pure Lazy Segment Tree

**Task.** Maintain $a[0..n-1]$ under
* `1 l r x` add $x$ to $a[l..r]$
* `2 l r` print $\sum_{i=l}^{r} a_i$

**Why this model.** Sum is associative with identity $0$. Range add composes by addition. Lazy add + sum fits exactly.

**Reference solution.**
```cpp
#include <bits/stdc++.h>
using namespace std;

// Paste LazyAddSum from section 6A.

int main(){
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n,q; if(!(cin>>n>>q)) return 0;
    vector<long long>a(n); for(auto&x:a)cin>>x;
    LazyAddSum seg(n); seg.build(a);
    while(q--){
        int t; cin>>t;
        if(t==1){ int l,r; long long x; cin>>l>>r>>x; seg.range_add(l,r,x); }
        else{ int l,r; cin>>l>>r; cout<<seg.range_sum(l,r)<<"\n"; }
    }
    return 0;
}
```

### 7B) Segment Tree Beats for $\mathrm{chmin}$ + sum

**Task.** Maintain $a[0..n-1]$ under
* `1 l r x` set $a_i \gets \min(a_i, x)$ for all $i \in [l, r]$
* `2 l r` print $\sum_{i=l}^{r} a_i$

**Why this model.** $\mathrm{chmin}$ is value-dependent and not a simple linear tag. Beats edits only the nodes whose maxima are above $x$ and for which $\max_2 < x$, otherwise descends.

**Reference solution.**
```cpp
#include <bits/stdc++.h>
using namespace std;

// Paste BeatsChMinSum from section 6B.

int main(){
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n,q; if(!(cin>>n>>q)) return 0;
    vector<long long>a(n); for(auto&x:a)cin>>x;
    BeatsChMinSum seg(n); seg.build(a);
    while(q--){
        int t; cin>>t;
        if(t==1){ int l,r; long long x; cin>>l>>r>>x; seg.range_chmin(l,r,x); }
        else{ int l,r; cin>>l>>r; cout<<seg.range_sum(l,r)<<"\n"; }
    }
    return 0;
}
```

---

## 8) TLDR

* Lazy segment tree stores deferred uniform range updates as tags and applies them when necessary.
* Segment Tree Beats augments nodes with extremes and counts so clamps like $\mathrm{chmin}$ and $\mathrm{chmax}$ can be applied in bulk when the clamp does not cross the second extreme.
* Use inclusive $[l, r]$ consistently. Push before descent and pull after updates.
* Coordinate-compress sparse indices. Use `long long` for sums.
* Pick the model from the update verb. Add or assign implies lazy. Clamp implies Beats.

---

## 9) Recommended Problems
* USACO Guide - Segment Tree Beats: https://usaco.guide/adv/segtree-beats
* Codeforces 52C - Circular RMQ: https://codeforces.com/problemset/problem/52/C
* SPOJ - HORRIBLE: https://www.spoj.com/problems/HORRIBLE/
* HDU 1698 - Just a Hook: https://acm.hdu.edu.cn/showproblem.php?pid=1698
* Codeforces 438D - The Child and Sequence: https://codeforces.com/problemset/problem/438/D
* Yosupo - Range Chmin Range Sum: https://judge.yosupo.jp/problem/range_chmin_range_sum
* Yosupo - Range Chmin Chmax Add Range Sum: https://judge.yosupo.jp/problem/range_chmin_chmax_add_range_sum
