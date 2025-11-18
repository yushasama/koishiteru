# Fenwick & Segment Trees - Templates + Applications


## Why These Structures Are Awesome

* Let you go from $O(n^2)$ brute → $O(n \log n)$ (this is the core win)
* Handle **“compare current with all before it”** type problems
* Reusable templates: just swap what you store (counts, sums, max, gcd, etc)
* Scale comfortably to $n \approx 10^5$–$2 \times 10^5$

But they’re **not always needed**.

If the problem is just static prefix sums (like subarray sum existence), a simple prefix array is $O(1)$ per query and way simpler.

Fenwick/Segtree is only worth it if you need *updates + queries* or dynamic sweep-style logic.

---

## What To Keep In Mind

* **Constraints**:

  * $n \approx 10^5$: $O(n \log n)$ is fine
  * $n \approx 10^6+$: log factors start to hurt → maybe you need a math identity, greedy, or offline trick instead of a Fenwick/Segtree
* **Coordinate Compression**:

  * If values are large (like up to $10^9$), compress into $[1..n]$ before storing in Fenwick/Segtree
* **Memory**:

  * Textbook Segment Tree uses about $4n$
  * Fenwick Tree uses $n$
  * Iterative/compact Segment Tree can be closer to $2n$
  * Disclaimer: Segment Tree will always be heavier than Fenwick

---

## When + Where To Use

**Longest Increasing Subsequence (LIS)**

* Solve in $O(n \log n)$ with a Segtree/Fenwick
* State:

  $$
  dp[i] = 1 + \max_{\;a[j] < a[i]} dp[j]
  $$
* Query for max over $[1, a[i]-1]$, then update at $a[i]$

**Inversion Counting**

* Classic Fenwick application
* Count pairs $(i, j)$ with $i < j$ and $a[i] > a[j]$
* Store **counts** in Fenwick

**Weighted Inversion / Difference Problems**

* General class of problems where contribution depends on both the **count** and the **sum** of earlier elements
* Example: for each $a[i]$, add/subtract differences against all previous elements
* Solution: maintain 2 Fenwicks → one for counts, one for sums

**Manhattan Distance Problems (special cases)**

* expand $|x_i - x_j| + |y_i - y_j|$ into linear terms involving counts + sums
* sweep one axis, store the other in Fenwicks
* only shows up in certain geometry/distance problems, not every distance task

**Line Sweep**

* Process events in sorted order (by coordinate or time)
* Maintain “active set” with Fenwick/Segtree
* Shows up in rectangle union, closest pairs, scheduling, etc

---

## Disclaimer

These are **general templates**.

You always tweak what you store (counts, sums, max, gcd, etc) to match the problem.

Don’t overkill, if it’s just prefix sums & the constraints are big enough, use a plain array.

---

## Fenwick Tree (BIT)

```cpp
struct Fenwick {
    int n;
    vector<long long> bit;
    Fenwick(int n) : n(n), bit(n+1,0) {}

    void add(int i, long long x) {
        for (; i <= n; i += i & -i) bit[i] += x;
    }
    long long sum(int i) {
        long long res = 0;
        for (; i > 0; i -= i & -i) res += bit[i];
        return res;
    }
    long long rangeSum(int l, int r) {
        return sum(r) - sum(l-1);
    }
};
```

**Notes:**

* Fenwick = **point update + prefix/range query**.
* Always use `long long` for sums as `n * max(a[i])` can exceed `2e9`.
* If you only store counts (`+1` each time), `int` would be fine, but `ll` is safer universally.

---

## Segment Tree

```cpp
struct SegmentTree {
    int n;
    vector<int> tree;

    SegmentTree(int sz) {
        n = 1;
        while (n < sz) n <<= 1;
        tree.assign(2 * n, 0); 
    }

    // point update: a[i] = max(a[i], val)
    void update(int i, int val) {
        i += n;
        tree[i] = max(tree[i], val);
        for (i >>= 1; i >= 1; i >>= 1) {
            tree[i] = max(tree[i << 1], tree[i << 1 | 1]);
        }
    }

    // range max on [l, r]
    int query(int l, int r) {
        int res = 0;
        l += n;
        r += n;
        while (l <= r) {
            if (l & 1) res = max(res, tree[l++]);
            if (!(r & 1)) res = max(res, tree[r--]);
            l >>= 1;
            r >>= 1;
        }
        return res;
    }
};

```
**Notes:**

* This template is tuned for **max queries** (like LIS DP).
* For **sum segment tree**, change the merge op (`+`) and the type to `long long`.
* Point update here is **assign/merge at one index**; range queries aggregate from leaves up.

---

## Templated Segment Tree (Merge Op Segment Tree)
```cpp
template<typename T, typename F>
struct SegmentTree {
  int n;
  vector<T> tree;

  F op;
  T id;

  SegmentTree(int sz, F op_, T id_) : op(op_), id(id_) {
    n = 1;
    
    while (n < sz) n <<= 1;
    tree.assign(2 * n, id);
  }

  void set(int i, T val) {
    i += n;
    tree[i] = val;

    for (i >>= 1; i >= 1; i >>= 1) {
      tree[i] = op(tree[i << 1], tree[i << 1 | 1]);
    }
  }

  void update(int i, T val) {
    i += n;
    tree[i] = op(tree[i], val);

    while (i > 1) {
      i >>= 1;
      tree[i] = op(tree[i << 1], tree[i << 1 | 1]);
    }
  }

  T query(int l, int r) {
    T resL = id, resR = id;
    l += n, r += n;

    while (l <= r) {
      if (l & 1) resL = op(resL, tree[l++]);
      if (!(r & 1)) resR = op(tree[r--], resR);

      l >>= 1, r >>= 1;
    }

    return op(resL, resR);
  }
};

int main() {
  cin.tie(0);
  ios_base::sync_with_stdio(0);

  int n;
  cin >> n;

  auto gcd_op = [](int a, int b) { return gcd(a, b); };
  SegmentTree<int, decltype(gcd_op)> seg(n, gcd_op, 0);

  return 0;
}
```

## Example: Weighted Inversion Problem

**Problem (generalized):**

For each element $a[i]$, compute

$$
\text{counter}[i] = 
\sum_{j<i,\;a[j]<a[i]} (a[i] - a[j]) 
\;-\;
\sum_{j<i,\;a[j]>a[i]} (a[j] - a[i])
$$


In other words, for each element `a[i]`, look back at all earlier elements `a[j]`:

* If `a[j] < a[i]`, add the gap `(a[i] - a[j])`.
* If `a[j] > a[i]`, subtract the gap `(a[j] - a[i])`.

So `counter[i]` measures **how much bigger `a[i]` is than the smaller numbers before it, `a[j]`, minus how much smaller it is than the bigger numbers before it.**.

Brute force is $O(n^2)$, which dies at $n = 10^5$.

**Observation:**
This is basically inversion counting with weights:

* normal inversion = just counts
* here = counts + sums

We use two Fenwick Wrees
* One to maintain count of numbers seen so far
* One to maintain sum of numbers seen so far

### Coordinate Compression + Ranking

Fenwick trees only support **prefix queries** (sums over `[1..k]`).

To turn “smaller than `a[i]`” into a prefix query, we:

1. **Compress values**: map each unique value to a rank (1 = smallest, m = largest).

   * Example: arr = `[3,1,4]` → ranks `{1→1, 3→2, 4→3}`.

2. Then:

   * `cnt.sum(idx-1)` = # of elements with rank ≤ `idx-1` = **all elements smaller than `a[i]`**.
   * `sum.sum(idx-1)` = sum of all elements with rank ≤ `idx-1` = **sum of smaller values**.
   * `cnt.sum(m) - cnt.sum(idx)` = # greater.
   * `sum.sum(m) - sum.sum(idx)` = sum of greater values.

So the whole “smaller/greater” logic reduces to simple prefix sums thanks to ranking.

---

### Formula

At each index $i$:

$$
\text{counter}[i] =
\big(a[i] \cdot \text{cntSmaller} - \text{sumSmaller}\big)
+
\big(\text{sumGreater} - a[i] \cdot \text{cntGreater}\big)
$$

Where:

* `cntSmaller = cnt.sum(idx-1)`
* `sumSmaller = sum.sum(idx-1)`
* `cntGreater = cnt.sum(m) - cnt.sum(idx)`
* `sumGreater = sum.sum(m) - sum.sum(idx)`

**Code:**

```cpp
vector<long long> solve(vector<int>& arr) {
    int n = arr.size();

    // coordinate compression
    vector<int> vals = arr;
    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());
    
    auto get = [&](int x) {
        return int(lower_bound(vals.begin(), vals.end(), x) - vals.begin()) + 1;
    };
    
    int m = vals.size();

    Fenwick cnt(m), sum(m);
    vector<long long> ans(n);

    for (int i = 0; i < n; i++) {
        int idx = get(arr[i]);

        long long cntSmaller = cnt.sum(idx-1);
        long long sumSmaller = sum.sum(idx-1);

        long long cntAll = cnt.sum(m);
        long long sumAll = sum.sum(m);

        long long cntGreater = cntAll - cnt.sum(idx);
        long long sumGreater = sumAll - sum.sum(idx);

        long long res = arr[i]*cntSmaller - sumSmaller;
        
        res += sumGreater - arr[i]*cntGreater;
        ans[i] = res;

        cnt.add(idx, 1);
        sum.add(idx, arr[i]);
    }
    
    long long total = 0;
    
    for (int i = 0; i < n; i++) {
        total += ans[i];
    }
    
    return total;
}
```

---

# Quick Cheat Table

| Problem type                  | What to store in tree          |
| ----------------------------- | ------------------------------ |
| Inversion counting            | Counts only                    |
| LIS (dp style)                | Max DP value                   |
| Weighted inversions/diffs     | Counts + Sums                  |
| Manhattan distance (2D sweep) | Counts + Sums (sweep one axis) |
| Range sum query               | Prefix Sums                    |
| Range min/max/gcd             | Segtree with Merge Op          |

## Recommended problems

* [USACO Guide – Longest Increasing Subsequence](https://usaco.guide/gold/lis)
* [USACO Guide – Point Update Range Sum](https://usaco.guide/gold/PURS)
* [USACO Guide – Range Query Section from Plat](https://usaco.guide/plat/)

