# **Greedy IV - Threshold Feasibility**

So this is our fourth member of the Greedy Family. We binary search an answer $\theta$ and use a greedy check $P(\theta)$ to test feasibility. The set of feasible $\theta$ values must be monotone. You push the search boundary until you hit the first true or last true.

> Prerequisite: Binary Search Refresher
> We use half-open integer search $[lo, hi)$ and "first true" semantics throughout. For the full binary search playbook, see my writeup: ["Binary Search: The Boundary Hunter."](https://koishite.ru/competitive/binary_search)

## **Links to Series Content**
* [Greedy I - Selection](../competitive/greedy_i)
* [Greedy II - Interval](../competitive/greedy_ii)
* [Greedy III - Incremental](../competitive/greedy_iii)
* [Greedy IV - Threshold Feasibility (This One)](../competitive/greedy_iv)
* [Greedy V - Game & Competitive](../competitive/greedy_v)
* [Greedy VI - Adaptive & Online](../competitive/greedy_vi)

---

## 0) **Core Definitions**

### **Threshold Feasibility**
You search over an ordered answer space $\Theta$ for the boundary where a monotone predicate $P(\theta)$ flips. Typical forms: minimize the maximum load, maximize the minimum distance.

### **Feasibility Check**
A fast yes/no validator for a fixed $\theta$. Most checks are linear greedy: pack until overflow, count pieces, sum production, or compute deficits.

### **First True / Last True**
Find the smallest $\theta$ with $P(\theta)=\text{true}$ or the largest $\theta$ with $P(\theta)=\text{true}$. Choose based on how your predicate moves with $\theta$.

### **Answer Space**
What you are searching: time, speed, capacity, distance, count. Integers use discrete search. Reals use fixed iterations to reach tolerance.

```mermaid
flowchart LR
  A[lo] -- mid --> M{P(mid)?}
  M -- true --> H[hi = mid]
  M -- false --> L[lo = mid + 1]
  H --> A
  L --> A
```

---

## **1) Constraints**

* Typical $n \le 2 \cdot 10^5$ with a single $O(n)$ feasibility check. Total runtime is $O(n \log U)$, where $U$ is the answer range size.
* Integers: keep $[lo, hi)$ and `while (lo < hi)`. Use 64-bit for sums and bounds.
* Reals: run 60 to 80 iterations. For range $R$ and precision $\varepsilon$, you need $\lceil \log_2(R/\varepsilon) \rceil$ iterations.
* When not to use: predicate not monotone, feasibility depends on cyclic or nonlocal choices, or requires global combinatorial structure. Then you need DP or flow.

Pitfalls with why they fail:

* Wrong boundary semantics. Mixing min-true and max-true flips the branch and returns off-by-one.
* Overflow in checks. Products like $a_i \cdot x$ or cumulative sums can exceed 32-bit easily.
* Bad bounds. If `hi` is below the true answer, your search silently fails. Compute tighter bounds or lift exponentially.
* Nonmonotone checks. If increasing $\theta$ can toggle $P$ from true back to false, binary search is invalid.

---

## **2) Theory Bridge**

Define a totally ordered space $\Theta$ and a predicate $P:\Theta \to \{0,1\}$ that is monotone. Typical patterns:

* Minimize a cap $C$ so a greedy pack fits within $C$. If $C$ works, any larger $C'$ also works, so feasible caps form an upper set.
* Maximize a size $L$ so you can extract at least $k$ units. If $L$ works, any smaller $L'$ also works, so feasible sizes form a lower set.

The greedy checks work because contributions are nonnegative and local: adding more budget cannot reduce what you can fit, and tightening a cap cannot enable something that was previously impossible. Binary search isolates the boundary in $O(\log U)$ probes, each $O(n)$.

---

## **3) Spotting the Model**

| Trigger phrase                               | Technique                        |
| :------------------------------------------- | :------------------------------- |
| Minimize the maximum subarray sum into ≤ $m$ | Binary search cap + greedy split |
| Maximize minimum distance for $k$ placements | Binary search distance + place   |
| Minimum time to produce at least $x$ items   | Binary search time + sum output  |
| Maximum $x$ craftable with stock and magic   | Binary search count + deficits   |
| Buy the largest $N$ under affine cost        | Binary search $N$ + cost         |

---

## **4) Shapes and Models**

| Type                    | How to tell                    | Output                     | Solver                                  | Complexity       | Notes                      |
| :---------------------- | :----------------------------- | :------------------------- | :-------------------------------------- | :--------------- | :------------------------- |
| Min time to quota       | Production increases with time | Smallest $T$               | BS on $T$ + sum $\lfloor T/t_i \rfloor$ | $O(n \log U)$    | CSES Factory Machines      |
| Max equal cut length    | Pieces decrease with length    | Largest $L$                | BS on $L$ + sum $\lfloor a_i/L \rfloor$ | $O(n \log U)$    | CSES Ropes                 |
| Min largest segment sum | Splits decrease with cap       | Smallest cap $C$           | BS on $C$ + greedy partition            | $O(n \log U)$    | Classic load balancing     |
| Max craftable items     | Deficit increases with target  | Largest $x$                | BS on $x$ + sum deficits                | $O(n \log U)$    | CF Magic Powder 2          |
| Largest affordable $N$  | Cost increases with $N$        | Largest $N$                | BS on $N$ + cost                        | $O(\log U)$      | ABC 146 C Buy an Integer   |
| Real geometry threshold | Continuous monotone predicate  | Value within $\varepsilon$ | Fixed-iter BS on reals                  | $O(I \cdot T_c)$ | Choose 60 to 80 iterations |

---

## **5) Algorithms**

### **First True on Integers**

Smallest $\theta$ in $[lo, hi)$ with $P(\theta)=\text{true}$. Keep invariant that the answer lies in $[lo, hi)$ and shrink by half each step.

### **Last True on Integers**

Largest $\theta$ with $P(\theta)=\text{true}$. Use closed $[lo, hi]$ or keep half-open $[lo, hi)$ and return $lo-1$. Bias mid up.

### **Safety Checks**

* Count pieces under length $L$ by $\sum \lfloor a_i/L \rfloor$.
* Count segments needed under cap $C$ with one pass, starting a new segment on overflow.
* Sum production $\sum \lfloor T/t_i \rfloor$ and compare to target.
* Sum per-ingredient deficits for target $x$ and compare to stock plus magic powder.

---

## **6) Templates**

### **Binary Search Helpers**

```cpp
#include <bits/stdc++.h>
using namespace std;

// First True on [lo, hi)
template <class Predicate>
long long first_true(long long lo, long long hi, Predicate feasible) {
    while (lo < hi) {
        long long mid = lo + (hi - lo) / 2;
        if (feasible(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo; // returns hi if never true
}

// Last True on [lo, hi]
template <class Predicate>
long long last_true(long long lo, long long hi, Predicate feasible) {
    while (lo < hi) {
        long long mid = lo + (hi - lo + 1) / 2;
        if (feasible(mid)) lo = mid;
        else hi = mid - 1;
    }
    return lo; // returns lo - 1 if never true
}

// Real-valued first true on [lo, hi] with fixed iterations
double first_true_real(double lo, double hi, function<bool(double)> feasible, int iters = 70) {
    for (int i = 0; i < iters; ++i) {
        double mid = (lo + hi) / 2.0;
        if (feasible(mid)) hi = mid;
        else lo = mid;
    }
    return hi;
}
```

### **Greedy Feasibility Checks**

```cpp
#include <bits/stdc++.h>
using namespace std;

// Split array into at most max_segments so each segment sum <= cap
bool can_split_with_cap(const vector<long long> &a, int max_segments, long long cap) {
    long long current = 0;
    int segments = 1;
    for (int i = 0; i < (int)a.size(); ++i) {
        if (a[i] > cap) return false;
        if (current + a[i] > cap) {
            ++segments;
            current = 0;
        }
        current += a[i];
    }
    return segments <= max_segments;
}

// Pieces obtainable from ropes at length L
long long pieces_with_length(const vector<long long> &rope, long long L) {
    if (L == 0) return LLONG_MAX; // define as trivially feasible
    long long cnt = 0;
    for (int i = 0; i < (int)rope.size(); ++i) {
        cnt += rope[i] / L;
        if (cnt < 0) return LLONG_MAX; // overflow guard
    }
    return cnt;
}

// Total production by time T given machine times t[i]
long long produced_by_time(const vector<long long> &t, long long T) {
    long long total = 0;
    for (int i = 0; i < (int)t.size(); ++i) {
        total += T / t[i];
        if (total < 0) return LLONG_MAX; // overflow guard
    }
    return total;
}
```

---

## **7) Worked Examples**

### **Factory Machines - CSES**

#### **Problem**

Given machine times $t_i$ and a target $x$, find the minimum time $T$ to produce at least $x$ items.

#### **Why Threshold Feasibility**

Production $\sum \lfloor T/t_i \rfloor$ is nondecreasing in $T$. Predicate $P(T)$ is "produced $\ge x$." Binary search the smallest $T$.

#### **Complexity**

$O(n \log U)$ with $U = \min(t_i) \cdot x$.

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    long long target;
    cin >> n >> target;

    vector<long long> time_per_item(n);
    long long min_time = LLONG_MAX;

    for (int i = 0; i < n; ++i) {
        cin >> time_per_item[i];
        min_time = min(min_time, time_per_item[i]);
    }

    auto feasible = [&](long long T) -> bool {
        long long produced = 0;
        for (int i = 0; i < n; ++i) {
            produced += T / time_per_item[i];
            if (produced >= target) return true;
        }
        return false;
    };

    long long lo = 0;
    long long hi = min_time * target; // upper bound
    while (lo < hi) {
        long long mid = lo + (hi - lo) / 2;
        if (feasible(mid)) hi = mid;
        else lo = mid + 1;
    }
    cout << lo << "\n";
}
```

---

### **Ropes - CSES**

#### **Problem**

Given rope lengths and an integer $k$, cut into equal lengths $L$ to obtain at least $k$ pieces. Maximize $L$.

#### **Why Threshold Feasibility**

Piece count $\sum \lfloor a_i/L \rfloor$ is nonincreasing in $L$. Binary search the largest feasible $L$.

#### **Complexity**

$O(n \log U)$ with $U = \max(a_i)$.

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, k;
    cin >> n >> k;

    vector<long long> a(n);
    long long hi = 0;
    for (int i = 0; i < n; ++i) {
        cin >> a[i];
        hi = max(hi, a[i]);
    }

    auto feasible = [&](long long L) -> bool {
        if (L == 0) return true;
        long long cnt = 0;
        for (int i = 0; i < n; ++i) {
            cnt += a[i] / L;
            if (cnt >= k) return true;
        }
        return false;
    };

    long long lo = 0;
    while (lo < hi) {
        long long mid = lo + (hi - lo + 1) / 2; // bias up for max-true
        if (feasible(mid)) lo = mid;
        else hi = mid - 1;
    }
    cout << lo << "\n";
}
```

---

### **Magic Powder 2 - Codeforces 670D2**

#### **Problem**

Each product needs $a_i$ units. You have $b_i$ units in stock and $k$ units of magic that can cover deficits. Maximize the number of products.

#### **Why Threshold Feasibility**

Deficit $\sum \max(0, a_i \cdot x - b_i)$ is nondecreasing in $x$. Binary search the largest $x$ with total deficit $\le k$.

#### **Complexity**

$O(n \log U)$. Use 128-bit for products to avoid overflow.

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    long long k;
    cin >> n >> k;

    vector<long long> need(n), have(n);
    for (int i = 0; i < n; ++i) cin >> need[i];
    for (int i = 0; i < n; ++i) cin >> have[i];

    auto feasible = [&](long long x) -> bool {
        long long required = 0;
        for (int i = 0; i < n; ++i) {
            __int128 want = (__int128)need[i] * x;
            if (want > have[i]) {
                __int128 diff = want - have[i];
                long long deficit = diff > (__int128)LLONG_MAX ? LLONG_MAX : (long long)diff;
                if (required > k - deficit) return false;
                required += deficit;
            }
        }
        return required <= k;
    };

    long long lo = 0, hi = 1;
    while (feasible(hi)) {
        if (hi >= (long long)2e18 / 2) break;
        hi *= 2; // lift bound
    }

    while (lo < hi) {
        long long mid = lo + (hi - lo + 1) / 2;
        if (feasible(mid)) lo = mid;
        else hi = mid - 1;
    }
    cout << lo << "\n";
}
```

---

### **Buy an Integer - AtCoder ABC 146 C**

#### **Problem**

Find the largest $N$ such that $a \cdot N + b \cdot \text{digits}(N) \le X$.

#### **Why Threshold Feasibility**

Cost is increasing in $N$. Binary search for the largest $N$ with cost $\le X$.

#### **Complexity**

$O(\log U)$ with $U = 10^9$.

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    long long a, b, x;
    cin >> a >> b >> x;

    auto digits = [&](long long v) -> int {
        if (v == 0) return 1;
        int d = 0;
        while (v > 0) { ++d; v /= 10; }
        return d;
    };

    auto feasible = [&](long long n) -> bool {
        __int128 cost = (__int128)a * n + (__int128)b * digits(n);
        return cost <= x;
    };

    long long lo = 0, hi = 1000000000LL;
    while (lo < hi) {
        long long mid = lo + (hi - lo + 1) / 2;
        if (feasible(mid)) lo = mid;
        else hi = mid - 1;
    }
    cout << lo << "\n";
}
```

---

### **Koko Eating Bananas - LeetCode 875**

#### **Problem**

Find minimal eating speed $v$ so Koko finishes all piles within $H$ hours.

#### **Why Threshold Feasibility**

Time $\sum \lceil p_i / v \rceil$ decreases with $v$. Binary search smallest $v$ with time $\le H$.

#### **Complexity**

$O(n \log U)$ with $U = \max(p_i)$.

```cpp
#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int minEatingSpeed(vector<int>& piles, int H) {
        long long lo = 1, hi = 0;
        for (int x : piles) hi = max(hi, (long long)x);
        auto feasible = [&](long long v) -> bool {
            long long hours = 0;
            for (int x : piles) {
                hours += (x + v - 1) / v;
                if (hours > H) return false;
            }
            return true;
        };
        while (lo < hi) {
            long long mid = lo + (hi - lo) / 2;
            if (feasible(mid)) hi = mid;
            else lo = mid + 1;
        }
        return (int)lo;
    }
};
```

---

## **8) Common Pitfalls**

* Mixing min-true and max-true
  Why: wrong mid bias or wrong branch update.
  Fix: write $P(\theta)$ and decide direction. For max-true, bias mid up.

* Overflow in $a_i \cdot x$ and sums
  Why: 32-bit limits.
  Fix: use `__int128` for products, short-circuit when the sum exceeds the budget.

* Bad `hi` bound
  Why: search misses the answer.
  Fix: compute analytic caps or lift `hi` exponentially until infeasible.

* Nonmonotone checks
  Why: greedy validator flips back and forth.
  Fix: re-model or switch to DP or flow. Binary search is invalid.

* Greedy partition off by one
  Why: not counting the last segment or starting segments at zero incorrectly.
  Fix: start `segments = 1`, start a new segment only on overflow.

* Real search precision
  Why: too few iterations, wrong termination.
  Fix: run fixed 60 to 80 iterations or until $hi - lo \le \varepsilon$.

---

## **9) TLDR**

* Model as "find boundary where $P(\theta)$ flips."
* Use half-open $[lo, hi)$ and first-true as your default.
* Write linear greedy checks: pack under cap, count pieces, sum outputs, sum deficits.
* Guard every product and sum with 64-bit, use `__int128` for $a_i \cdot x$.
* Compute tight bounds; if unsure, lift.
* Expect $O(n \log U)$. The only hard part is the predicate.
* Keep last-true logic separate with mid biased up.

---

## **10) Recommended Problems**

* [CSES - Factory Machines](https://cses.fi/problemset/task/1620/)
* [CSES - Ropes](https://cses.fi/problemset/task/1191/)
* [Codeforces 670D2 - Magic Powder 2](https://codeforces.com/problemset/problem/670/D2)
* [Codeforces 1201C - Maximum Median](https://codeforces.com/problemset/problem/1201/C)
* [AtCoder ABC 146 C - Buy an Integer](https://atcoder.jp/contests/abc146/tasks/abc146_c)
* [SPOJ - AGGRCOW](https://www.spoj.com/problems/AGGRCOW/)
* [LeetCode 875 - Koko Eating Bananas](https://leetcode.com/problems/koko-eating-bananas/)
* [LeetCode 1011 - Capacity To Ship Packages Within D Days](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/)

---

## **Glossary**

* **First true**: smallest $\theta$ with $P(\theta)=\text{true}$ on a half-open range.
* **Last true**: largest $\theta$ with $P(\theta)=\text{true}$ on a closed or adapted range.
* **Cap**: a maximum allowed cumulative measure used in feasibility checks.
* **Deficit**: shortfall for a target $x$ after consuming stock.
* **Exponential lifting**: doubling the upper bound until you bracket the boundary.
* **Bias mid up**: use $(lo + hi + 1)/2$ to avoid infinite loops on max-true.