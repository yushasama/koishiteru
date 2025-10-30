# **Binary Search: The Boundary Hunter**

Binary search isn't just "find element in sorted array." It's also "find the smallest value where a monotone condition flips."

Once you get that, you unlock a significant portion of CP problems involving load balancing, LIS, distance placement, capacity optimization, and precision geometry.

---

## **0) Core Definitions**

**Monotone predicate.**
A boolean `P(x)` that stays false then turns true once (or vice versa).
If `x1 ≤ x2` implies `P(x1) ≤ P(x2)`, it's monotone → we can binary search on it.

**First true / last true.**
Find the flip boundary. Converts optimization problems into yes/no checks.

**Answer space.**
The domain we're searching over: index, count, capacity, distance, time, or real value.
We don't need the data sorted, just the feasibility monotone.

**Feasibility check.**
A `check(x)` that says if `x` is good enough. Usually greedy or simple DP.

---

## **1) What To Keep In Mind**

1. **Convention:** Use half-open `[lo, hi)` for integer search unless stated otherwise. This guide uses `[lo, hi)` consistently.
2. **Invariant:** Answer is inside `[lo, hi)` with `P(lo-1)=false` and `P(hi)=true` when defined.
3. **Integer mid:** `mid = lo + (hi - lo) / 2` to avoid overflow.
4. **Real mid:** Normal average `(lo + hi) / 2`, fixed iterations.
5. **Iteration count for reals:** For precision $\epsilon$ and range $R$, need $\lceil \log_2(R/\epsilon) \rceil$ iterations. For $\epsilon = 10^{-6}$ and $R = 10^9$, that's about 50 iterations. Using 60-80 gives a safe margin.
6. **`check(x)` requirements:** Must be monotone, correct, and fast enough (usually $O(n)$ or better).
7. **Tighten bounds:** Don't default to `1e18` when you can compute tighter limits from the problem.
8. **Edge cases:** If predicate is never true, `first_true` returns `hi`. If always true, returns `lo`. Check these cases separately if needed.
9. **Always brute small cases to verify.**

---

## **2) Constraints**

When reading constraints, you can usually tell it's a binary search problem:

| What You See                                     | What It Means                                          |
| ------------------------------------------------ | ------------------------------------------------------ |
| `K` or answer range up to `1e9` or `1e18`        | Search space is huge → likely binary search on answer. |
| `n ≤ 1e5` and `check(x)` takes `O(n)`             | `O(n log range)` ≈ 1e6-1e7 ops → totally fine.          |
| "Precision to 1e-6"                              | Real-valued search.                                    |
| "Find minimum time / distance / cost / capacity" | Monotone feasibility pattern.                          |
| Small ranges (`≤ 1e4`)                            | Brute force works, binary search optional.             |

If the statement screams *"minimize X under Y"* or *"can we do Z with limit L?"* and the limit can go up to 1e9, just binary search it.

---

## **3) Theory Bridge**

Binary search exists because many problems form a **false…true** pattern over integers or reals.

If we can phrase a task as "find the smallest `x` such that there exists a solution with cost ≤ `x`," and the predicate is monotone, the boundary is the minimal feasible `x`.

You're minimizing over a 0-1 function without ever computing full costs—just checking feasibility.

---

You're right — your **Modeling Space** section and **Modeling Space Table** (section 7) are structurally overlapping. They're both aiming to help the reader recognize and map problem phrasing to a binary search form.

Here's a clean way to **merge them**:

---

## **4) Modeling Space**

Binary search problems hide behind real-world phrasing. Here’s how to sniff them out and turn them into boundary hunts.

### **Modeling From Problem Statements**

If the problem says:

* “Minimize the maximum…”
* “Maximize the minimum…”
* “What’s the earliest/latest X so that Y happens?”
* “Can you do task Z within limit L?”
* “Find distance/time/speed/capacity to finish job”

…then odds are high it’s a binary search over the answer.

These problems are about **finding boundaries** — the smallest or largest value that satisfies a feasibility condition.

---

### **Build the Model**

1. **Define the answer variable.** Is it distance? speed? cost? index?
2. **Check monotonicity.** If `x` works, will `x+1` work too?
3. **Write `check(x)`.** Fast greedy is best, or prefix sums, 2-pointers, etc.
4. **Pick tight bounds.** Avoid defaulting to `1e18` unless necessary.
5. **Return boundary.** Usually `lo` for first true, `lo - 1` for last true.
6. **Always brute-force tiny inputs to verify.**

---

### **Shape of Various Binary Search Problems**

| Problem Type           | Trigger Phrases or Pattern           | What To Output    | Answer Domain        | Template    | Notes                     |
| ---------------------- | ------------------------------------ | ----------------- | -------------------- | ----------- | ------------------------- |
| **First True**         | “Find smallest X that works”         | min feasible `x`  | `[0, max+1)`         | FirstTrue   | Most common form          |
| **Last True**          | “Find largest X that satisfies…”     | max feasible `x`  | `[0, max]`           | LastTrue    | Use closed bounds, +1 mid |
| **Place K items**      | “Place K items at least D apart”     | max `D`           | `[0, max+1)`         | FirstTrue   | Greedy placement check    |
| **Load balancing**     | “Split into ≤ m parts, minimize max” | min max load      | `[max(a), sum(a)+1)` | FirstTrue   | Greedy partitioning       |
| **Machine rate**       | “Min time/speed to finish job”       | min `T` or `rate` | `[1, max+1)`         | FirstTrue   | `ceil(a[i]/rate)` pattern |
| **Index boundary**     | “First/last index satisfying…”       | index             | `[0, n]`             | Lower/Upper | Array is sorted           |
| **Real-valued search** | “Precision up to 1e-6” / geometry    | `x ∈ ℝ`           | `[lo, hi]`           | RealBinary  | Fixed 60–80 iterations    |

---

## **6) Algorithms**

### **A. First True (default solver)**

Finds the smallest `x` in `[lo, hi)` where `P(x)` is true.

**Complexity:** $O(\log(\text{hi} - \text{lo}) \cdot T_{\text{check}})$ where $T_{\text{check}}$ is the cost of one `check(x)` call.

```cpp
template<class F>
long long first_true(long long lo, long long hi, F P){
    // Returns smallest x in [lo, hi) where P(x) is true
    // If no such x, returns hi
    while (lo < hi){
        long long mid = lo + (hi - lo) / 2;
        if (P(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}
```

**Edge case:** If `P` is never true in `[lo, hi)`, returns `hi`.

---

### **B. Last True**

Finds the largest `x` in `[lo, hi]` where `P(x)` is true. Note: uses closed interval `[lo, hi]`.

**Complexity:** $O(\log(\text{hi} - \text{lo}) \cdot T_{\text{check}})$

```cpp
template<class F>
long long last_true(long long lo, long long hi, F P){
    // Returns largest x in [lo, hi] where P(x) is true
    // If no such x, returns lo - 1
    while (lo < hi){
        long long mid = lo + (hi - lo + 1) / 2;
        if (P(mid)) lo = mid;
        else hi = mid - 1;
    }
    return lo;
}
```

**Note:** The `+1` in mid calculation is critical to avoid infinite loop when `hi = lo + 1`.

---

### **C. Lower / Upper Bound**

Standard binary search on a sorted array. Returns the first index where `a[i] >= x` (lower_bound) or `a[i] > x` (upper_bound).

**Complexity:** $O(\log n)$

```cpp
int lower_bound_idx(const vector<int>& a, int x){
    // Returns first index i where a[i] >= x, or a.size() if no such i
    int lo = 0, hi = a.size();
    while (lo < hi){
        int mid = lo + (hi - lo) / 2;
        if (a[mid] >= x) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

int upper_bound_idx(const vector<int>& a, int x){
    // Returns first index i where a[i] > x, or a.size() if no such i
    int lo = 0, hi = a.size();
    while (lo < hi){
        int mid = lo + (hi - lo) / 2;
        if (a[mid] > x) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}
```

---

### **D. Unknown Upper Bound (Exponential Search)**

When you don't know the upper bound in advance, double `hi` until `P(hi)` is true, then binary search.

**Complexity:** $O(\log(\text{answer}) \cdot T_{\text{check}})$

**When to use:** Rarely needed in CP. Most problems give you bounds. Useful for unbounded search spaces or when computing a tight upper bound is expensive.

```cpp
template<class F>
long long first_true_unbounded(F P){
    // Finds first true when upper bound unknown
    // Assumes P(x) is eventually true for large enough x
    long long lo = 0, hi = 1;
    while (!P(hi)) { 
        lo = hi; 
        hi <<= 1; 
        if (hi < 0) hi = LLONG_MAX; // overflow guard
    }
    return first_true(lo, hi + 1, P);
}
```

**Why doubling works:** If the answer is $A$, we'll reach $\text{hi} \geq A$ in $O(\log A)$ doublings, and the final binary search is also $O(\log A)$.

---

### **E. Real-Valued**

For continuous answer spaces (geometry, ratios, etc.). Run a fixed number of iterations to converge to precision $\epsilon$.

**Iteration count:** For precision $\epsilon$ and range $R = \text{hi} - \text{lo}$, need $\lceil \log_2(R/\epsilon) \rceil$ iterations. 
- For $\epsilon = 10^{-6}$ and $R = 10^9$: $\lceil \log_2(10^{15}) \rceil \approx 50$ iterations.
- Safe practice: use 60-80 iterations for margin.

**Complexity:** $O(I \cdot T_{\text{check}})$ where $I$ is the number of iterations.

```cpp
double first_true_real(double lo, double hi, function<bool(double)> P, int iters=70){
    // Returns approximately the first x where P(x) is true
    // Precision depends on iters: each iteration halves the interval
    for(int i = 0; i < iters; i++){
        double mid = (lo + hi) / 2;
        if (P(mid)) hi = mid;
        else lo = mid;
    }
    return hi;
}
```

**Alternative (epsilon-based):**
```cpp
double first_true_real_eps(double lo, double hi, function<bool(double)> P, double eps=1e-9){
    while (hi - lo > eps){
        double mid = (lo + hi) / 2;
        if (P(mid)) hi = mid;
        else lo = mid;
    }
    return hi;
}
```

---

**Trick:**
In "maximize min distance," sort once and greedy place items. No need for graphs.
Greedy $O(n)$ inside binary search is ideal.

---

## **7) Modeling Space Table**

| Type                   | How to Tell               | Output             | Typical Bounds       | Solver | Complexity | Notes                |
| ---------------------- | ------------------------- | ------------------ | -------------------- | ------ | ---------- | -------------------- |
| First True             | "smallest X that works"   | minimal feasible X | `[0, maxVal+1)`      | A      | $O(\log R \cdot T_c)$ | default              |
| Last True              | "largest X still ok"      | maximal feasible X | `[0, maxVal]`        | B      | $O(\log R \cdot T_c)$ | closed interval, +1 in mid |
| Array LB               | sorted array `>=`         | index i            | indices              | C      | $O(\log n)$ | LIS tails            |
| Array UB               | sorted array `>`          | index i            | indices              | C      | $O(\log n)$ | counts               |
| Maximize min distance  | "place K with gap ≥ d"    | largest d          | `[0, maxGap+1)`      | A      | $O(\log R \cdot n)$ | greedy check         |
| Minimize max load      | "split ≤ m parts under L" | smallest L         | `[max(a), sum(a)+1)` | A      | $O(\log R \cdot n)$ | greedy partition     |
| Machine speed / Koko   | "speed/time so all done"  | min speed/time     | `[1, max(a)+1)`      | A      | $O(\log R \cdot n)$ | use ceil divisions   |
| Earliest feasible time | jobs + rates              | min T              | `[0, reasonableMax)` | A      | $O(\log R \cdot n)$ | sum(rate*T)          |
| Real precision         | geometry / ratios         | within eps         | `[lo, hi]`           |

## **8) Worked Example**

**Problem:** [LeetCode 875. Koko Eating Bananas]
Find minimal speed `k` so Koko eats all piles within `h` hours.

**Why binary search fits:**
If `k` works within `h`, any faster `k' > k` also works → monotone.
`check(k)` = can finish on time.
Bounds: `lo = 1`, `hi = max(piles)+1`.

```cpp
int minEatingSpeed(vector<int>& piles, int h) {
    auto ok = [&](long long k){
        long long hours = 0;
        for (int p : piles){
            hours += (p + k - 1) / k;
            if (hours > h) return false;
        }
        return true;
    };
    int lo = 1, hi = *max_element(piles.begin(), piles.end()) + 1;
    while (lo < hi){
        int mid = lo + (hi - lo) / 2;
        if (ok(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}
```

Complexity: O(n log max(pile)).

---

## **9) TLDR**

* Model it as “first true” on answer space.
* Keep `[lo, hi)` and `while (lo < hi)`.
* Tight bounds, not lazy `1e18`.
* Greedy `check(x)` over DS heavy logic.
* If no upper bound, double until found.
* Real search = 60–100 iterations.
* If constraints have 1e9+ answer range, binary search is almost always the move.

---

## **10) Recommended Problems**

* [USACO Guide - Binary Search](https://usaco.guide/silver/binary-search)
* [Codeforces 702C - Celluar Network](https://codeforces.com/problemset/problem/702/C)
* [Leetcode 875 - Koko Eating Bananas](https://leetcode.com/problems/koko-eating-bananas/)
* [Leetcode 1101 - Capacity To Ship Packages Within D Days](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/description/)
* [Codeforces 812C - Sagheer and Nubian Market](https://codeforces.com/problemset/problem/812/C) 
---