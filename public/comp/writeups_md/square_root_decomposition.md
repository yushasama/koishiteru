# Square Root Decomposition and Mo's Algorithm

When queries are offline or the operation is simple, **square root decomposition** and **Mo's algorithm** let you "block it out," cut work to about $O(\sqrt{N})$ per move, and keep code tight. Meaning we don't always need a big structure like a Segment Tree. Use segment trees only when you truly need online dynamic updates or lazy range operations.

For those unfamiliar with Segment Trees, please checkout my writeups:

---

## 0) Core Definitions

**Square Root Decomposition:** Split an array into blocks of size $B \approx \sqrt{N}$. Keep an aggregate per block. Answer a range by scanning edge items and aggregating full blocks. About $O(\sqrt{N})$ per query.

**Mo's Algorithm:** Sort all range queries by $(\lfloor L / B \rfloor, R)$, then slide a window and maintain a frequency based answer with $\text{add}(x)$ and $\text{remove}(x)$ in $O(1)$. Offline total about $O((N + Q)\sqrt{N})$.

**Associativity:** If the operation is associative and has an identity (sum, min, max, gcd), you can pre-aggregate per block. If the answer is a function of frequencies that does not merge cleanly, use Mo's.

**Offline vs Online:** Mo's is offline. Square Root Decomposition can answer online when there are no range updates and only light point edits.

---

## 1) Constraints

* Scale: $n \approx 10^5$ both are fine. $n \approx 10^6$ blocks are still fine for sum or min. Use Mo's only if add and remove are true $O(1)$ and $Q$ is large.

* Quick pick: if $Q < n$ choose blocks. if $Q > n$ choose Mo's. if $Q \approx n$ choose by model fit.

* Cost estimates: blocks $\approx O(Q\sqrt{n})$. Mo's $\approx O((n + Q)\sqrt{n} + Q \log Q)$.

* Compression: required for Mo's when values are large. Optional for blocks.

* Memory: blocks $\approx n + \frac{n}{B}$. Mo's $\approx n + M$, where $M$ is the number of distinct values after compression.

---

## 2) Theory Bridge

**Blocks.** A query touches at most $\frac{N}{B}$ full blocks and $O(B)$ edge items. Cost $f(B) = \frac{N}{B} + B$. Minimum near $B = \sqrt{N}$, so $O(\sqrt{N})$ per query.

**Mo's.** Sorting by $(\lfloor L / B \rfloor, R)$ makes successive windows differ by $O(\sqrt{N})$ items on average. With $O(1)$ add and remove, total work is $O((N + Q)\sqrt{N})$.

---

## 3) Shapes and Models

| Statement cue                                 | Pick this model |
| --------------------------------------------- | --------------- |
| Static array, sum or min over ranges          | Square Root Decomp          |
| All queries known, count distinct             | Mo's            |
| Weighted frequency metric $\sum g(\text{val}, \text{freq}[\text{val}])$ | Mo's            |
| Intermixed queries with a few point updates   | Square Root Decomp          |

---

## 4) Templates

### 4.1 Square Root Decomposition — sum only
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

        while (l <= r && (l % B)) {
            res += a[l];
            l++;
        }
        while (l + B - 1 <= r) {
            res += agg[l / B];
            l += B;
        }
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

### 4.2 Square Root Decomposition — generic monoid

Identity means the neutral element $e$ such that $\text{combine}(e, x) = x$ and $\text{combine}(x, e) = x$.

* sum → $0$
* min → $+\infty$
* max → $-\infty$
* gcd → $0$
* xor → $0$

```cpp
#include <bits/stdc++.h>
using namespace std;

template <class T>
struct MinOp {
    T identity() const { return numeric_limits<T>::max(); }
    T combine(const T& a, const T& b) const { return a < b ? a : b; }
};

template <class T>
struct MaxOp {
    T identity() const { return numeric_limits<T>::lowest(); }
    T combine(const T& a, const T& b) const { return a < b ? b : a; }
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

        while (l <= r && (l % B)) {
            res = op.combine(res, a[l]);
            l++;
        }
        while (l + B - 1 <= r) {
            res = op.combine(res, agg[l / B]);
            l += B;
        }
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

        T s = op.identity();
        for (int j = L; j < R; j++) {
            s = op.combine(s, a[j]);
        }
        agg[b] = s;
    }
};
```

### 4.3 Mo's Algorithm — distinct count base

Use half open ranges $[l, r)$. Coordinate compress first.

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Query {
    int l;
    int r;   // [l, r)
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

### 4.4 Mo's Algorithm — weighted frequency metric

Example metric: sum over $v$ of $\text{freq}[v]^2 \cdot \text{weight}[v]$. Keep $\text{weight}[v]$ as the original value or a given weight.

```cpp
#include <bits/stdc++.h>
using namespace std;

vector<int> a;                // compressed values [0..M)
vector<long long> weight;     // weight[v] is original value or problem weight
vector<long long> freq64;     // frequency as 64 bit
long long cur_answer = 0;

void add_weighted(int v) {
    long long f = freq64[v];
    cur_answer -= f * f * weight[v];
    f += 1;
    freq64[v] = f;
    cur_answer += f * f * weight[v];
}

void remove_weighted(int v) {
    long long f = freq64[v];
    cur_answer -= f * f * weight[v];
    f -= 1;
    freq64[v] = f;
    cur_answer += f * f * weight[v];
}
```

**Math explanation:**

When adding a value $v$ with current frequency $f$:

$$
\text{cur\_answer} \gets \text{cur\_answer} - f^2 \cdot \text{weight}[v] + (f+1)^2 \cdot \text{weight}[v]
$$

When removing:

$$
\text{cur\_answer} \gets \text{cur\_answer} - f^2 \cdot \text{weight}[v] + (f-1)^2 \cdot \text{weight}[v]
$$

---

## 5) Algorithms That Win In Practice

* Frequency shaped and offline → Mo's with $O(1)$ add and remove.
* Associative with identity and static or lightly updated → blocks.
* Coordinate compress for Mo's. Keep freq over compressed values.

---

## 6) Cheat Sheet Table

| Type                    | How to tell                | What to output         | Shape          | Solver |
| ----------------------- | -------------------------- | ---------------------- | -------------- | ------ |
| Static range sum        | No updates, numeric sum    | Sum over $[l, r]$        | Blocks         | Blocks |
| Static range min or gcd | No updates, associative op | Min or gcd over $[l, r]$ | Blocks         | Blocks |
| Distinct count          | All queries known          | Number of distinct     | Sliding window | Mo's   |
| Weighted freq metric    | Depends on counts          | Scalar from freq       | Sliding window | Mo's   |
| Few point updates       | Small number of edits      | Aggregates             | Blocks         | Blocks |

---

## 7) Worked Example — Mo's for distinct count

Self contained. Reads $n$, array, $q$, queries in 1 based inclusive form, prints answers in original order. Converts to 0 based and $[l, r)$ internally.

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Query {
    int l;
    int r;   // [l, r)
    int id;
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    if (!(cin >> n)) return 0;

    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];

    // coordinate compression
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
        qs[i] = {L, R + 1, i}; // to half-open
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

## 8) TLDR

* Check associativity first. Associative and static → **block**. Frequency shaped and offline → **Mo's**.
* Square Root Decomposition gives about $O(\sqrt{N})$ per query with tiny code.
* Mo's gives about $O((N + Q)\sqrt{N})$ total, but only if $\text{add}$ and $\text{remove}$ are $O(1)$.
* For heavy or range updates, switch to the **segment tree** link.
* Coordinate-compress for Mo's. Alternate $R$ per $L$-block or use Hilbert order to reduce pointer travel.
* Rebuild blocks lazily for non-invertible ops to keep amortized $O(\sqrt{N})$.

---

## 9) Recommended Problems

* [USACO Guide - Square Root Decomposition](https://usaco.guide/plat/sqrt?lang=cpp)
* [CSES Range Sum Queries I](https://cses.fi/problemset/task/1646)
* [AtCoder ARC98E - Range Minimum Queries](https://atcoder.jp/contests/arc098/tasks/arc098_c)
* [SPOJ - DQUERY](https://www.spoj.com/problems/DQUERY/)
* [Codeforces 86D - Powerful Array](https://codeforces.com/problemset/problem/86/D)
* [Codeforces 375D - Tree and Queries](https://codeforces.com/problemset/problem/375/D)
* [Codeforces 940F - Machine Learning](https://codeforces.com/problemset/problem/940/F)