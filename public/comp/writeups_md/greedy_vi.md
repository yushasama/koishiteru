# **Greedy VI - Adaptive And Online**

So this is our sixth member of the Greedy Family. Here, the greedy choice depends on evolving state. You pick what gives the biggest **incremental** benefit on what is still uncovered or most at risk right now. Think coverage, caching, and “pick the next best marginal gain” under feedback.

---

## **0) Core Definitions**

### **Adaptive Greedy**
A greedy policy where the key you optimize changes with the current state. The action that was best five steps ago might not be best now.

### **Coverage Objective**
You maintain a set of “uncovered” elements. Each action covers some of them. Choose the action that covers the largest number of still-uncovered items.

### **Submodularity**
Diminishing returns: the marginal gain of an action never increases as the covered set grows. Greedy gives near-optimal solutions for many such objectives.

### **Online Policy**
Decisions are made as inputs arrive. No lookahead. Competitive analysis compares you to an omniscient offline optimum.

### **Caching Heuristics**
Rules like LRU or LFU that choose which item to evict based on adaptive signals such as recency or frequency.

---

## **1) Constraints**

* Typical $n \le 2 \cdot 10^5$. Sorting once: $O(n \log n)$. One pass with maps or heaps: $O(n \log n)$.
* Bitset coverage tricks: $O!\left(\frac{n m}{64}\right)$ if $m$ elements per set.
* When to use adaptive greedy: objective has diminishing returns or the “uncovered” pool shrinks monotonically.
* When to avoid: gains couple across choices in a nonlocal way or future arrivals can invalidate your metric. Use DP or flow if you cannot argue monotonicity.

Pitfalls and why:

* Double counting coverage. Always compute **new** coverage, not total coverage of a set.
* Recomputing from scratch each step. Maintain deltas or use a max heap with lazy deletes.
* Floating ratio comparisons. Use integers or cross multiply.
* Wrong eviction rule for the traffic pattern. LRU is not magic; it is just a good default.

---

## **2) Theory Bridge**

If the objective is **monotone submodular** with a cardinality constraint, the classic greedy that adds the set with the largest marginal gain at each step achieves a $(1 - 1/e)$ approximation. You do not need to prove the theorem every time, but you must ensure diminishing returns holds.

In online caching, Belady’s optimal offline policy evicts the item whose next use is farthest in the future. With no oracle, LRU uses **recency** as a proxy. It is simple, data-local, and competitive on many traces. LFU uses long-term **frequency**, which can lag on bursts. Pick the heuristic that matches access locality.

---

## **3) Spotting The Model**

| Statement clue                                        | Technique                       |
| :---------------------------------------------------- | :------------------------------ |
| “Pick up to $k$ actions to cover the most items”      | Greedy maximum coverage         |
| “Choose values so no one appears more than $t$ times” | Frequency-capped selection      |
| “Maintain a cache of size $K$ with misses minimal”    | LRU or LFU cache simulation     |
| “Pick most frequent colors until total count $k$”     | Adaptive count greedy with heap |

---

## **4) Shapes And Models**

| Type                  | How to tell                                      | Output         | Solver                        | Complexity                            | Notes                            |
| :-------------------- | :----------------------------------------------- | :------------- | :---------------------------- | :------------------------------------ | :------------------------------- |
| Maximum coverage      | Sets over a universe, pick at most $k$ sets      | covered count  | greedy largest marginal gain  | $O(k m)$ naive, faster with bitsets   | $(1 - 1/e)$ approx if submodular |
| Frequency-capped fill | Build multiset length $k$ with per-value cap $t$ | built sequence | count, round-robin fill, heap | $O(n \log n)$                         | CF 1077D archetype               |
| LRU cache simulation  | Stream of requests, capacity $K$                 | miss count     | hashmap + list or tree        | $O(n)$ average, $O(n \log K)$ ordered | Competitive in practice          |
| LFU cache simulation  | Stream with frequency priority                   | miss count     | hashmap + buckets             | $O(1)$ amortized with buckets         | Sensitive to bursts              |

---

## **5) Algorithms**

### **Maximum Coverage Greedy**

Repeat $k$ times: pick the set with the largest **new** coverage. Update the uncovered flag for those items. If sets are small or $m$ is small, this is fine. With big $m$, use bitsets and popcount.

### **Frequency-Capped Fill**

Count occurrences. Binary search a cap $t$ or just compute $t$ by trying frequencies. Then iterate values, taking up to $\min(\text{count}[v], t)$ copies in round-robin until you reach $k$.

### **LRU Cache**

Maintain a doubly linked list with most-recent at the front and a hashmap from key to node. On hit, move node to front. On miss, insert at front and evict from back if over capacity.

---

## **6) Templates**

Got it — here’s a clean, ready-to-paste version that fits your blog tone and keeps it sharp and technical:

---

### **Rule of Thumb: Bit Math**

Why does our bit logic uses `uint64_t` and not `long long`?
Unsigned types guarantee clean, defined behavior for every shift and mask.

**Why it matters:**

* Signed integers have a sign bit. Flipping or shifting it (`~x`, `1LL << 63`) can be undefined.
* Unsigned integers define every bit as data. Shifts and complements are logical, zero-filled, and safe.
* Overflow wraps around mod 2⁶⁴ exactly as hardware does.
* It signals intent: these are **bit patterns**, not arithmetic values.
* CPUs execute unsigned bit math directly, no sign extension, no surprises.

**Rule:** use unsigned for masks, shifts, and popcounts; use signed when negatives make sense.

### **Maximum Coverage With Bitsets ($O(k \cdot \frac{n m}{64})$)**

```cpp
#include <bits/stdc++.h>
using namespace std;

// Universe size m, candidate sets S[i] as bitsets.
vector<int> greedy_max_coverage(const vector<vector<int>> &sets, int m, int k) {
    int n = (int)sets.size();
    int words = (m + 63) / 64;

    vector<vector<uint64_t>> B(n, vector<uint64_t>(words, 0));
    for (int i = 0; i < n; ++i) {
        for (int x : sets[i]) {
            int w = x >> 6, b = x & 63;

            B[i][w] |= (1ULL << b);
        }
    }

    vector<uint64_t> covered(words, 0);
    vector<int> picked;
    vector<char> used(n, 0);

    auto count_new = [&](int i) -> int {
        int add = 0;

        for (int w = 0; w < words; ++w) {
            uint64_t diff = B[i][w] & ~covered[w];
            add += __builtin_popcountll(diff);
        }

        return add;
    };

    for (int it = 0; it < k; ++it) {
        int best = -1, best_add = -1;

        for (int i = 0; i < n; ++i) if (!used[i]) {
            int add = count_new(i);

            if (add > best_add) {
                best_add = add;
                best = i;
            }
        }

        if (best == -1 || best_add == 0) break;

        used[best] = 1;
        picked.push_back(best);

        for (int w = 0; w < words; ++w) covered[w] |= B[best][w];
    }

    return picked; // indices of chosen sets
}
```

### **Frequency-Capped Fill For Exactly $k$ Picks ($O(n \log n)$)**

```cpp
#include <bits/stdc++.h>
using namespace std;

// Returns sequence of values length k, each value appears at most cap times.
vector<int> frequency_capped_fill(const vector<int> &values, int k, int cap) {
    unordered_map<int, int> freq;
    freq.reserve(values.size() * 2);

    for (int v : values) ++freq[v];

    vector<pair<int, int>> pool; // (remaining, value)

    pool.reserve(freq.size());

    for (auto &p : freq) {
        int take = min(p.second, cap);
        if (take > 0) pool.push_back({take, p.first});
    }

    // Max heap by remaining count
    auto cmp = [](const pair<int,int> &a, const pair<int,int> &b){ return a.first < b.first; };
    
    priority_queue<pair<int,int>, vector<pair<int,int>>, decltype(cmp)> pq(cmp);
    for (auto &x : pool) pq.push(x);

    vector<int> res;
    res.reserve(k);

    while (!pq.empty() && (int)res.size() < k) {
        auto [rem, val] = pq.top(); pq.pop();
        res.push_back(val);
    
        if (--rem > 0) pq.push({rem, val});
    }

    return res;
}
```

### **LRU Cache ($O(1)$ Average Per Operation)**

```cpp
#include <bits/stdc++.h>
using namespace std;

struct LRUCache {
    int capacity;
    list<pair<int, int>> order;                 // front = most recent
    unordered_map<int, list<pair<int,int>>::iterator> pos;

    LRUCache(int cap) : capacity(cap) {}

    int get(int key) {
        auto it = pos.find(key);
        if (it == pos.end()) return -1;
        
        // move to front
        order.splice(order.begin(), order, it->second);
        return it->second->second;
    }

    void put(int key, int value) {
        auto it = pos.find(key);

        if (it != pos.end()) {
            it->second->second = value;
            order.splice(order.begin(), order, it->second);
            return;
        }

        // insert new
        order.emplace_front(key, value);
        pos[key] = order.begin();
        
        if ((int)order.size() > capacity) {
            auto back = order.back();

            pos.erase(back.first);
            order.pop_back();
        }
    }
};
```

---

## **7) Worked Examples**

### **Cutting Out - Codeforces 1077D**

#### **Problem**

Given a multiset of values and an integer $k$, build a sequence of length $k$ by repeating values, but all values should appear the same number of times $t$ (maximize $t$). Output any valid sequence.

#### **Why Adaptive Greedy**

You cap each value by $t$ and then fill in round-robin while counts deplete. The “best” next pick is the value with remaining quota. The cap $t$ is found by trying thresholds and checking whether total capped counts reach $k$.

#### **Complexity**

$O(n \log n)$ to sort or heap frequencies, plus a search for $t$ if you choose to binary search.

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, k;
    cin >> n >> k;

    vector<int> a(n);
    for (int i = 0; i < n; ++i) cin >> a[i];

    unordered_map<int, int> freq;
    freq.reserve(n * 2);
    for (int v : a) ++freq[v];

    vector<int> counts;
    counts.reserve(freq.size());

    for (auto &p : freq) counts.push_back(p.second);
    sort(counts.begin(), counts.end(), greater<int>());

    auto can = [&](int t) -> bool {
        long long total = 0;
        
        for (int c : counts) {
            total += c / t;

            if (total >= k) return true;
        }

        return false;
    };

    int lo = 1, hi = n, t = 1;

    while (lo <= hi) {
        int mid = (lo + hi) / 2;

        if (can(mid)) {
            t = mid;
            lo = mid + 1;
        }
        
        else hi = mid - 1;
    }

    // Build result
    vector<pair<int,int>> pool;
    pool.reserve(freq.size());

    for (auto &p : freq) {
        int take = p.second / t;
        if (take > 0) pool.push_back({take, p.first});
    }

    sort(pool.begin(), pool.end(), [](const auto &x, const auto &y){
        return x.first > y.first;
    });

    vector<int> res;
    res.reserve(k);

    int i = 0;
    
    while ((int)res.size() < k) {
        if (pool[i].first > 0) {
            res.push_back(pool[i].second);
            --pool[i].first;
        }

        ++i;
        
        if (i == (int)pool.size()) i = 0;
    }

    for (int j = 0; j < k; ++j) {
        if (j) cout << " ";

        cout << res[j];
    }

    cout << "\n";
}
```

---

### **LRU Cache - LeetCode 146**

#### **Problem**

Design a cache with capacity $K$ that supports `get` and `put`. Evict least recently used on overflow.

#### **Why Adaptive Greedy**

Eviction depends on the **current** recency order. The next evicted key is the one least used **now**. Recency adapts on every access.

#### **Complexity**

$O(1)$ average per operation with list plus hashmap.

```cpp
#include <bits/stdc++.h>
using namespace std;

struct LRUCache {
    int capacity;
    list<pair<int, int>> order;
    unordered_map<int, list<pair<int,int>>::iterator> pos;

    LRUCache(int capacity_) : capacity(capacity_) {}

    int get(int key) {
        auto it = pos.find(key);
        if (it == pos.end()) return -1;

        order.splice(order.begin(), order, it->second);
        return it->second->second;
    }

    void put(int key, int value) {
        auto it = pos.find(key);

        if (it != pos.end()) {
            it->second->second = value;
            order.splice(order.begin(), order, it->second);
        
            return;
        }

        order.emplace_front(key, value);
        pos[key] = order.begin();
        
        if ((int)order.size() > capacity) {
            auto back = order.back();
            
            pos.erase(back.first);
            order.pop_back();
        }
    }
};
```

---

### **Assign Cookies - LeetCode 455**

#### **Problem**

Each child $i$ has greed factor $g_i$. Each cookie has size $s_j$. Give at most one cookie per child, and a child is content if $s_j \ge g_i$. Maximize the number of content children.

#### **Why Adaptive Greedy**

Sort both lists. Always give the smallest cookie that still satisfies the smallest remaining greed. This covers one more child using minimal size, preserving larger cookies for harder cases.

#### **Complexity**

$O(n \log n)$ for sorting, then $O(n)$ two pointers.

```cpp
#include <bits/stdc++.h>
using namespace std;

int findContentChildren(vector<int>& g, vector<int>& s) {
    sort(g.begin(), g.end());
    sort(s.begin(), s.end());

    int i = 0, j = 0, n = g.size(), m = s.size();
    int happy = 0;

    while (i < n && j < m) {
        if (s[j] >= g[i]) { ++happy; ++i; ++j; }
        else { ++j; }
    }

    return happy;
}
```

---

## **8) Common Pitfalls**

* Counting total coverage rather than **new** coverage
  Why: double counts already covered items.
  Fix: maintain an uncovered flag or bitset and compute marginal gain.

* Heap without lazy deletes
  Why: you push updated gains but never drop stale ones.
  Fix: store a version or recompute on pop until it matches current state.

* Overfitting cache policy
  Why: LFU fails on bursts, LRU fails on scans.
  Fix: understand the access pattern. If the judge trace is adversarial, only competitive bounds help.

* Binary searching $t$ without a monotone check
  Why: the cap might not be monotone if you define feasibility wrong.
  Fix: define $P(t)$ as “sum of $\lfloor f_i / t \rfloor \ge k$,” which is monotone decreasing in $t$.

* Using floating ratios for coverage gain
  Why: precision bugs change ordering.
  Fix: compare integers where possible.

---

## **9) TLDR**

* Adaptive greedy is about **marginal** gain on the **remaining** state.
* Coverage with diminishing returns is safe to greedify and gives strong approximations.
* Frequency-capped selection: cap counts, then round-robin fill.
* LRU is the default eviction rule; code it with list plus hashmap.
* Keep deltas, not totals. Marginal gain or remaining quota belongs in the heap.
* Expect $O(n \log n)$ unless you invest in bitsets or buckets.

---

## **10) Recommended Problems**

* [Codeforces 1077D - Cutting Out](https://codeforces.com/problemset/problem/1077/D)
* [Codeforces 1095C - Powers Of Two](https://codeforces.com/problemset/problem/1095/C)  (adaptive splitting to hit target count)
* [AtCoder ABC 131 F - Must Be Rectangles](https://atcoder.jp/contests/abc131/tasks/abc131_f)  (coverage flavor with components)
* [CSES - Room Allocation](https://cses.fi/problemset/task/1164/)  (adaptive assignment with multiset reuse)
* [LeetCode 146 - LRU Cache](https://leetcode.com/problems/lru-cache/)
* [LeetCode 455 - Assign Cookies](https://leetcode.com/problems/assign-cookies/)

## **Glossary**

* **Adaptive greedy**: pick the best action for the current state.
* **Marginal gain**: benefit on what remains, not total.
* **Coverage objective**: track uncovered; score is new items covered.
* **Submodular**: diminishing returns.
* **Monotone**: adding actions never reduces value.
* **1−1/e guarantee**: greedy is near-optimal for monotone submodular with k picks.
* **Lazy greedy**: heap of upper bounds, recompute on pop.
* **Bitset/popcount**: packed bits for fast coverage counts.
* **LRU/LFU/Belady**: recency, frequency, offline optimal for caching.
* **Competitive ratio**: measure online vs offline optimum.
* **Working set/locality**: pattern that decides if LRU or LFU works.
* **Early exit**: stop when marginal gain is zero or all covered.