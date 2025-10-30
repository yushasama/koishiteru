# Square Root Decomposition and Mo's Algorithm

When queries are offline or the operation is simple, **square root decomposition** and **Mo's algorithm** let you "block it out," cut work to about $O(\sqrt{N})$ per move, and keep code tight. You don't always need a big structure like a segment tree.

**When to use segment trees:** Only when you truly need online dynamic updates with range modifications (like range add, range set) or lazy propagation. For static arrays with simple queries, or offline frequency-based queries, the methods here are simpler and often faster.

For those unfamiliar with segment trees, check out my other writeups on segment trees and lazy propagation.

---

## 0) Core Definitions

**Square Root Decomposition:** Split an array into blocks of size $B \approx \sqrt{N}$. Keep an aggregate per block. Answer a range query by scanning edge items individually and aggregating full blocks. About $O(\sqrt{N})$ per query.

**Mo's Algorithm:** Sort all range queries by $(\lfloor L / B \rfloor, R)$ with alternating $R$ order per block, then slide a window and maintain an answer with `add(x)` and `remove(x)` in $O(1)$. Offline, total complexity about $O((N + Q)\sqrt{N})$ plus sorting.

**Associativity:** If the operation is associative and has an identity (sum, min, max, gcd), you can pre-aggregate per block and answer queries by combining block aggregates. If the answer is a function of frequencies that doesn't merge cleanly (like "count distinct" or "sum of frequency squares"), use Mo's.

**Offline vs Online:** Mo's is **offline only**—you must know all queries in advance. Square root decomposition can answer queries **online** when there are no range updates, or only light point updates.

---

## 1) Constraints

* **Scale:** $n \approx 10^5$ both are fine. $n \approx 10^6$ blocks still work for sum or min. Use Mo's only if `add` and `remove` are true $O(1)$ and $Q$ is reasonably large.

* **Quick pick:** 
  - If $Q < n$ choose blocks. 
  - If $Q > n$ choose Mo's. 
  - If $Q \approx n$ choose by model fit.

* **Cost estimates:** 
  - Blocks: $O(Q\sqrt{n})$ for queries, $O(n)$ build.
  - Mo's: $O((n + Q)\sqrt{n})$ for pointer moves plus $O(Q \log Q)$ for sorting.

* **Compression:** Required for Mo's when values are large (to keep frequency array size manageable). Optional for blocks.

* **Memory:** 
  - Blocks: $\approx n + \frac{n}{B}$ where $B \approx \sqrt{n}$.
  - Mo's: $\approx n + M$ where $M$ is the number of distinct values after compression.

* **Block size optimization:**
  - Square root decomp: $B = \sqrt{n}$ minimizes $\frac{n}{B} + B$.
  - Mo's: Optimal block size is $\frac{n}{\sqrt{Q}}$ when $Q$ is known. In practice, $B = \sqrt{n}$ works well for most cases. For $Q \gg n$, use $B = \frac{n}{\sqrt{Q}}$ for better constants.

---

## 2) Theory Bridge

**Blocks.** A query touches at most $\frac{N}{B}$ full blocks and $O(B)$ edge items. Cost $f(B) = \frac{N}{B} + B$. Taking derivative and setting to zero: $f'(B) = -\frac{N}{B^2} + 1 = 0 \Rightarrow B = \sqrt{N}$. This gives $f(\sqrt{N}) = 2\sqrt{N}$, so $O(\sqrt{N})$ per query.

**Mo's.** Sorting by $(\lfloor L / B \rfloor, R)$ with alternating $R$ order per $L$-block makes successive windows differ by $O(\sqrt{N})$ items on average:
- Within a block, $L$ changes by at most $B = \sqrt{N}$.
- Between blocks, $R$ can change by at most $N$, but this happens only $\frac{N}{B} = \sqrt{N}$ times across all queries.
- Total pointer movement: $O(Q \cdot B)$ for $L$ moves plus $O(N \cdot \frac{N}{B}) = O(N\sqrt{N})$ for $R$ moves.
- With $O(1)$ add and remove, total work is $O((N + Q)\sqrt{N})$.

**Why coordinate compression matters:** If values go up to $10^9$ but there are only $M \le 10^5$ distinct values, you'd need a $10^9$-sized frequency array without compression. After compression, frequency array is size $M$, which is manageable.

---

## 3) Shapes and Models

| Statement cue                                 | Pick this model | Why |
| --------------------------------------------- | --------------- | --- |
| Static array, sum or min over ranges          | Square Root Decomp | Associative with identity → precompute per block |
| All queries known, count distinct             | Mo's | Non-mergeable frequency metric → slide window |
| Weighted frequency metric $\sum g(\text{val}, \text{freq}[\text{val}])$ | Mo's | Function of counts, not associative |
| Intermixed queries with a few point updates   | Square Root Decomp | Can rebuild blocks incrementally or lazily |
| Online queries, no updates                    | Square Root Decomp | Blocks support online queries |
| Offline queries, complex frequency function   | Mo's | Sliding window with $O(1)$ add/remove |

---

## 4) Templates

### Square Root Decomposition — sum only

**Complexity:** 
- Build: $O(n)$
- Query: $O(\sqrt{n})$
- Point update: $O(1)$

```cpp
#include <bits/stdc++.h>
using namespace std;

struct SqrtSum {
    int n = 0;
    int B = 1;
    int nb = 0;
    vector<long long> a;
    vector<long long> agg;

    SqrtSum() {}

    SqrtSum(int n_) {
        init(n_);
    }

    SqrtSum(const vector<long long>& v) {
        init((int)v.size());
        a = v;
        build();
    }

    void init(int n_) {
        n = n_;
        B = max(1, (int)sqrt(max(1, n)));
        nb = (n + B - 1) / B;
        a.assign(n, 0);
        agg.assign(nb, 0);
    }

    void build() {
        fill(agg.begin(), agg.end(), 0);
        for (int i = 0; i < n; i++) {
            agg[i / B] += a[i];
        }
    }

    long long query(int l, int r) { // inclusive [l, r]
        if (n == 0) return 0;
        l = max(l, 0);
        r = min(r, n - 1);
        if (l > r) return 0;

        long long res = 0;

        // Left edge
        while (l <= r && (l % B)) {
            res += a[l];
            l++;
        }
        // Full blocks
        while (l + B - 1 <= r) {
            res += agg[l / B];
            l += B;
        }
        // Right edge
        while (l <= r) {
            res += a[l];
            l++;
        }
        return res;
    }

    void point_add(int i, long long delta) {
        a[i] += delta;
        agg[i / B] += delta;
    }

    void point_set(int i, long long v) {
        long long d = v - a[i];
        a[i] = v;
        agg[i / B] += d;
    }
};
```

---

### Square Root Decomposition — Generic Monoid

Identity means the neutral element $e$ such that $\text{combine}(e, x) = x$ and $\text{combine}(x, e) = x$.

* sum → $0$
* min → $+\infty$
* max → $-\infty$
* gcd → $0$
* xor → $0$

**Complexity:** Same as sum version.

```cpp
#include <bits/stdc++.h>
using namespace std;

template <class T>
struct MinOp {
    T identity() const { return numeric_limits<T>::max(); }
    T combine(const T& a, const T& b) const { return min(a, b); }
};

template <class T>
struct MaxOp {
    T identity() const { return numeric_limits<T>::lowest(); }
    T combine(const T& a, const T& b) const { return max(a, b); }
};

template <class T>
struct GcdOp {
    T identity() const { return T(0); }
    T combine(T a, T b) const { return std::gcd(a, b); }
};

template <class T, class Op>
struct SqrtBlocks {
    int n = 0;
    int B = 1;
    int nb = 0;
    vector<T> a;
    vector<T> agg;
    Op op;

    SqrtBlocks() {}

    SqrtBlocks(int n_, int B_ = -1) {
        init(n_, B_);
    }

    SqrtBlocks(const vector<T>& init_values, int B_ = -1) {
        init((int)init_values.size(), B_);
        a = init_values;
        build();
    }

    void init(int n_, int B_ = -1) {
        n = n_;
        B = (B_ == -1 ? max(1, (int)sqrt(max(1, n))) : max(1, B_));
        nb = (n + B - 1) / B;
        a.assign(n, op.identity());
        agg.assign(nb, op.identity());
    }

    void build() {
        fill(agg.begin(), agg.end(), op.identity());
        for (int i = 0; i < n; i++) {
            int b = i / B;
            agg[b] = op.combine(agg[b], a[i]);
        }
    }

    T query(int l, int r) { // inclusive [l, r]
        if (n == 0) return op.identity();
        l = max(l, 0);
        r = min(r, n - 1);
        if (l > r) return op.identity();

        T res = op.identity();

        // Left edge
        while (l <= r && (l % B)) {
            res = op.combine(res, a[l]);
            l++;
        }
        // Full blocks
        while (l + B - 1 <= r) {
            res = op.combine(res, agg[l / B]);
            l += B;
        }
        // Right edge
        while (l <= r) {
            res = op.combine(res, a[l]);
            l++;
        }
        return res;
    }

    void point_set(int i, T v) {
        a[i] = v;
        int b = i / B;
        int L = b * B;
        int R = min(n, L + B);

        // Rebuild block aggregate
        T s = op.identity();
        for (int j = L; j < R; j++) {
            s = op.combine(s, a[j]);
        }
        agg[b] = s;
    }
};
```

---

### Mo's Algorithm - Distinct Count Base

Use half-open ranges $[l, r)$. Coordinate compress first.

**Complexity:** $O(Q \log Q + (N + Q)\sqrt{N})$ where the $Q \log Q$ is for sorting queries.

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Query {
    int l;
    int r;   // [l, r) half-open
    int id;
};

vector<int> a;       // compressed to [0..M)
vector<int> freq;    // size M
int B_size = 1;
int current_distinct = 0;

void add_value(int v) {
    freq[v]++;
    if (freq[v] == 1) current_distinct++;
}

void remove_value(int v) {
    freq[v]--;
    if (freq[v] == 0) current_distinct--;
}

bool mo_compare(const Query& A, const Query& B) {
    int ab = A.l / B_size;
    int bb = B.l / B_size;
    if (ab != bb) return ab < bb;
    // Alternate R order per block to reduce pointer travel
    if (ab % 2 == 0) return A.r < B.r;
    return A.r > B.r;
}

vector<int> mo_solve(vector<Query> qs) {
    sort(qs.begin(), qs.end(), mo_compare);
    vector<int> ans(qs.size());

    int L = 0;
    int R = 0;
    current_distinct = 0;

    for (const Query& q : qs) {
        // Expand/contract window to match query range
        while (L > q.l) {
            L--;
            add_value(a[L]);
        }
        while (R < q.r) {
            add_value(a[R]);
            R++;
        }
        while (L < q.l) {
            remove_value(a[L]);
            L++;
        }
        while (R > q.r) {
            R--;
            remove_value(a[R]);
        }
        ans[q.id] = current_distinct;
    }
    return ans;
}
```

**Why alternating R order:** Within a block of queries (same $\lfloor L / B \rfloor$), alternating the direction of $R$ traversal reduces backtracking. Odd blocks go right-to-left, even blocks go left-to-right.

---

### Mo's Algorithm - Weighted Frequency Metric

Example metric: sum over $v$ of $\text{freq}[v]^2 \cdot \text{weight}[v]$. Keep $\text{weight}[v]$ as the original value or a given weight.

**Complexity:** Same as distinct count Mo's.

```cpp
#include <bits/stdc++.h>
using namespace std;

vector<int> a;                // compressed values [0..M)
vector<long long> weight;     // weight[v] is original value or problem weight
vector<long long> freq64;     // frequency as 64 bit
long long cur_answer = 0;

void add_weighted(int v) {
    long long f = freq64[v];
    cur_answer -= f * f * weight[v];  // remove old contribution
    f += 1;
    freq64[v] = f;
    cur_answer += f * f * weight[v];  // add new contribution
}

void remove_weighted(int v) {
    long long f = freq64[v];
    cur_answer -= f * f * weight[v];  // remove old contribution
    f -= 1;
    freq64[v] = f;
    cur_answer += f * f * weight[v];  // add new contribution
}
```

**Math Explanation:**

When adding a value $v$ with current frequency $f$:

$$
\text{cur\_answer} \gets \text{cur\_answer} - f^2 \cdot \text{weight}[v] + (f+1)^2 \cdot \text{weight}[v]
$$

The net change is:
$$
(f+1)^2 \cdot w - f^2 \cdot w = (f^2 + 2f + 1 - f^2) \cdot w = (2f + 1) \cdot w
$$

When removing (frequency $f$ becomes $f-1$):
$$
\text{cur\_answer} \gets \text{cur\_answer} - f^2 \cdot \text{weight}[v] + (f-1)^2 \cdot \text{weight}[v]
$$

The net change is:
$$
(f-1)^2 \cdot w - f^2 \cdot w = (f^2 - 2f + 1 - f^2) \cdot w = (1 - 2f) \cdot w
$$

This allows $O(1)$ updates to the global answer.

---

## 5) Algorithms That Win In Practice

* **Frequency-shaped and offline** → Mo's with $O(1)$ add and remove.
* **Associative with identity and static or lightly updated** → blocks.
* **Coordinate compress for Mo's.** Keep freq over compressed values to avoid huge arrays.
* **Block size tuning:** Use $B = \sqrt{n}$ by default. For Mo's with $Q \gg n$, use $B = \frac{n}{\sqrt{Q}}$ for better constants.

---

## 6) Cheat Sheet Table

| Type                    | How to tell                | What to output         | Shape          | Solver | Complexity |
| ----------------------- | -------------------------- | ---------------------- | -------------- | ------ | ---------- |
| Static range sum        | No updates, numeric sum    | Sum over $[l, r]$        | Blocks         | Blocks | $O(Q\sqrt{n})$ |
| Static range min or gcd | No updates, associative op | Min or gcd over $[l, r]$ | Blocks         | Blocks | $O(Q\sqrt{n})$ |
| Distinct count          | All queries known          | Number of distinct     | Sliding window | Mo's   | $O((n+Q)\sqrt{n})$ |
| Weighted freq metric    | Depends on counts          | Scalar from freq       | Sliding window | Mo's   | $O((n+Q)\sqrt{n})$ |
| Few point updates       | Small number of edits      | Aggregates             | Blocks         | Blocks | $O(Q\sqrt{n})$ |

---

## 7) Worked Example — Mo's for distinct count

Self-contained. Reads $n$, array, $q$, queries in 1-based inclusive form, prints answers in original order. Converts to 0-based and $[l, r)$ internally.

**Complexity:** $O(Q \log Q + (n + Q)\sqrt{n})$

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Query {
    int l;
    int r;   // [l, r) half-open
    int id;
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    if (!(cin >> n)) return 0;

    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];

    // Coordinate compression
    vector<int> vals = a;
    sort(vals.begin(), vals.end());
    vals.erase(unique(vals.begin(), vals.end()), vals.end());
    for (int i = 0; i < n; i++) {
        a[i] = int(lower_bound(vals.begin(), vals.end(), a[i]) - vals.begin());
    }
    int M = (int)vals.size();

    int q;
    cin >> q;
    vector<Query> qs(q);
    for (int i = 0; i < q; i++) {
        int L, R;
        cin >> L >> R;      // 1-based inclusive input
        L--;                // convert to 0-based
        R--;
        qs[i] = {L, R + 1, i}; // to half-open [L, R+1)
    }

    int B_size = max(1, (int)sqrt(max(1, n)));
    auto mo_compare = [&](const Query& A, const Query& B) {
        int ab = A.l / B_size;
        int bb = B.l / B_size;
        if (ab != bb) return ab < bb;
        if (ab % 2 == 0) return A.r < B.r;
        return A.r > B.r;
    };
    sort(qs.begin(), qs.end(), mo_compare);

    vector<int> freq(M, 0);
    vector<int> ans(q, 0);

    int L = 0;
    int R = 0;
    int cur = 0;

    auto add_value = [&](int v) {
        freq[v]++;
        if (freq[v] == 1) cur++;
    };
    auto remove_value = [&](int v) {
        freq[v]--;
        if (freq[v] == 0) cur--;
    };

    for (const Query& qu : qs) {
        while (L > qu.l) {
            L--;
            add_value(a[L]);
        }
        while (R < qu.r) {
            add_value(a[R]);
            R++;
        }
        while (L < qu.l) {
            remove_value(a[L]);
            L++;
        }
        while (R > qu.r) {
            R--;
            remove_value(a[R]);
        }
        ans[qu.id] = cur;
    }

    for (int i = 0; i < q; i++) {
        cout << ans[i] << '\n';
    }
    return 0;
}
```

---

## 8) Common Pitfalls

1. **Forgetting coordinate compression for Mo's:** If values are up to $10^9$, you'll get MLE without compressing.
2. **Using closed intervals inconsistently:** Pick either $[l, r]$ or $[l, r)$ and stick to it. This guide uses $[l, r)$ for Mo's.
3. **Wrong block size for Mo's:** Using $B = \sqrt{n}$ when $Q \gg n$ can be suboptimal. Use $B = \frac{n}{\sqrt{Q}}$ for better constants.
4. **Non-$O(1)$ add/remove in Mo's:** If your add or remove operation is $O(\log n)$, Mo's becomes $O((n+Q)\sqrt{n} \log n)$, which might TLE.
5. **Not alternating R order:** Forgetting the `if (ab % 2 == 0)` check doubles the pointer travel for $R$.
6. **Rebuilding blocks inefficiently:** For non-invertible operations in square root decomp, rebuild the entire block on each update rather than trying to maintain incrementally.

---

## 9) Advanced: Hilbert Order for Mo's

For very tight time limits, you can sort queries by **Hilbert curve order** instead of the standard Mo's comparator. This reduces cache misses and pointer travel by following a space-filling curve.

**When to use:** Competitive programming with strict time limits and large $n, Q \approx 10^5$ to $10^6$.

**Complexity:** Still $O((n+Q)\sqrt{n})$ but with better constants (often 2-3x speedup).

**Implementation sketch:**
```cpp
inline long long hilbert_order(int x, int y, int pow, int rotate) {
    if (pow == 0) return 0;
    int hpow = 1 << (pow - 1);
    int seg = (x < hpow) ? ((y < hpow) ? 0 : 3) : ((y < hpow) ? 1 : 2);
    seg = (seg + rotate) & 3;
    const int rotateDelta[4] = {3, 0, 0, 1};
    int nx = x & (x ^ hpow), ny = y & (y ^ hpow);
    int nrot = (rotate + rotateDelta[seg]) & 3;
    long long subSquareSize = 1LL << (2 * pow - 2);
    long long ans = seg * subSquareSize;
    long long add = hilbert_order(nx, ny, pow - 1, nrot);
    ans += (seg == 1 || seg == 2) ? add : (subSquareSize - add - 1);
    return ans;
}

// In mo_compare:
int logn = __builtin_clz(1) - __builtin_clz(max(1, n));
return hilbert_order(A.l, A.r, logn, 0) < hilbert_order(B.l, B.r, logn, 0);
```

This is overkill for most problems but mentioned for completeness.

---

## 10) TLDR

* Check associativity first. **Associative and static** → blocks. **Frequency-shaped and offline** → Mo's.
* Square root decomposition gives about $O(\sqrt{N})$ per query with tiny code. Build is $O(n)$.
* Mo's gives about $O((N + Q)\sqrt{N})$ total, but **only if `add` and `remove` are $O(1)$**.
* For heavy or range updates, switch to segment trees with lazy propagation.
* **Coordinate-compress for Mo's** to keep frequency arrays manageable.
* **Alternate $R$ order per $L$-block** (even/odd) to reduce pointer travel.
* **Block size:** Use $B = \sqrt{n}$ by default. For Mo's with $Q \gg n$, use $B = \frac{n}{\sqrt{Q}}$.
* Rebuild blocks lazily or per update for non-invertible ops to keep amortized $O(\sqrt{N})$.

---

## 11) Recommended Problems

* [USACO Guide - Square Root Decomposition](https://usaco.guide/plat/sqrt?lang=cpp)
* [CSES 1646 - Static Range Sum Queries](https://cses.fi/problemset/task/1646)
* [AtCoder ARC098E - Range Minimum Queries](https://atcoder.jp/contests/arc098/tasks/arc098_c)
* [SPOJ - DQUERY](https://www.spoj.com/problems/DQUERY/)
* [Codeforces 86D - Powerful Array](https://codeforces.com/problemset/problem/86/D)
* [Codeforces 375D - Tree and Queries](https://codeforces.com/problemset/problem/375/D)
* [Codeforces 940F - Machine Learning](https://codeforces.com/problemset/problem/940/F)
* [Codeforces 617E - XOR and Favorite Number](https://codeforces.com/problemset/problem/617/E)