# **Turn 1/4th of CP with Binary Search**

## **What's so Good About Binary Search?**

Binary search isn’t just “find element in sorted array.” It’s also “find the smallest value where a monotone condition flips.”

Once you get that, you unlock around a quarter of CP problems that uses load balancing, LIS, distance placement, and precision geometry problems.

---

## **0) Core Definitions**

**Monotone predicate.**
A boolean `P(x)` that stays false then turns true once.
If `x1 ≤ x2` implies `P(x1) ≤ P(x2)`, it’s monotone → we can binary search on it.

**First true / last true.**
Find the flip boundary. Converts optimization problems into yes/no checks.

**Answer space.**
The domain we’re searching over: index, count, capacity, distance, time, or real value.
We don’t need the data sorted, just the feasibility monotone.

**Feasibility check.**
A `check(x)` that says if `x` is good enough. Usually greedy or simple DP.

---

## **1) What To Keep In Mind**

1. Use half-open `[lo, hi)` unless you need both ends inclusive.
2. Maintain invariant: answer is inside `[lo, hi)` and `P(lo-1)=false`, `P(hi)=true` when defined.
3. Integer mid: `mid = lo + (hi - lo) / 2`.
4. Real mid: normal average, fixed iterations (~60–100).
5. `check(x)` must be monotone, correct, and fast.
6. Tighten bounds: don’t default to `1e18`.
7. Always brute small cases to verify.

---

## **2) Constraints**

When reading constraints, you can usually tell it’s a binary search problem:

| What You See                                     | What It Means                                          |
| ------------------------------------------------ | ------------------------------------------------------ |
| `K` or answer range up to `1e9` or `1e18`        | Search space is huge → likely binary search on answer. |
| `n ≤ 1e5` and `check(x)` takes O(n)`             | O(n log range)` ≈ 1e6–1e7 ops → totally fine.          |
| “Precision to 1e-6”                              | Real-valued search.                                    |
| “Find minimum time / distance / cost / capacity” | Monotone feasibility pattern.                          |
| Small ranges (≤ 1e4)`                            | Brute force works, binary search optional.             |

If the statement screams *“minimize X under Y”* or *“can we do Z with limit L?”* and the limit can go up to 1e9, just binary search it.

---

## **3) Theory Bridge**

Binary search exists because many problems form a **false…true** pattern over integers.
If we can phrase a task as “find the smallest `x` such that there exists a solution with cost ≤ `x`,” and the predicate is monotone, the boundary is the minimal feasible `x`.
You’re minimizing a 0-1 convex function without ever computing full costs.

---

### **Construction Recipe**

1. **Decide what the answer variable is.** (time, distance, capacity, etc.)
2. **Show monotonicity.** If it works for `x`, it works for `x+1` (or reverse).
3. **Design `check(x)`:** greedy or prefix-based is ideal.
4. **Pick bounds.** `lo` = definitely impossible, `hi` = definitely possible.
5. **Run binary search.**

   ```cpp
   while (lo < hi) {
       mid = (lo + hi) / 2;
       if (ok(mid)) hi = mid;
       else lo = mid + 1;
   }
   ```
6. **Return `lo`** (first true).
7. Test with small random cases.

---

## **4) Spotting The Model**

These phrases are your triggers:

* “Minimize the maximum…” / “maximize the minimum…”
* “Find smallest X so you can finish K tasks.”
* “Place K items at least D apart.”
* “Ship packages within D days.”
* “Earliest time T all machines finish.”
* “Find precision up to 1e-6.”
* “LIS with patience sorting tails.” (yep, that’s `lower_bound`.)

If any of those appear and constraints hit 1e9 or 1e18, it’s a binary search setup.

---

## **5) Modeling Space**

* **Capacity / time limit:** check if schedule fits under `mid`.
* **Distance / spacing:** can we place K items with ≥ mid gap.
* **Counts / thresholds:** at least K items meet condition.
* **Index boundary:** first index satisfying predicate.
* **Continuous answers:** geometry, averages, or ratios → real search.

---

## **6) Algorithms**

### **A. First True (default solver)**

```cpp
template<class F>
long long first_true(long long lo, long long hi, F P){
    while (lo < hi){
        long long mid = lo + (hi - lo) / 2;
        if (P(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}
```

### **B. Last True**

```cpp
template<class F>
long long last_true(long long lo, long long hi, F P){
    while (lo < hi){
        long long mid = lo + (hi - lo + 1) / 2;
        if (P(mid)) lo = mid;
        else hi = mid - 1;
    }
    return lo;
}
```

### **C. Lower / Upper Bound**

```cpp
int lower_bound_idx(const vector<int>& a, int x){
    int lo = 0, hi = a.size();
    while (lo < hi){
        int mid = (lo + hi) / 2;
        if (a[mid] >= x) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}
```

### **D. Unknown Upper Bound**

```cpp
long long first_true_unbounded(function<bool(long long)> P){
    long long lo = 0, hi = 1;
    while (!P(hi)) { lo = hi + 1; hi <<= 1; }
    return first_true(lo, hi + 1, P);
}
```

### **E. Real-Valued**

```cpp
double first_true_real(double lo, double hi, function<bool(double)> P, int iters=80){
    for(int i=0;i<iters;i++){
        double mid = (lo + hi) / 2;
        if (P(mid)) hi = mid;
        else lo = mid;
    }
    return hi;
}
```

**Trick:**
In “maximize min distance,” sort once and greedy place items. No need for graphs.
Greedy O(n) inside binary search is ideal.

---

## **7) Cheat Sheet Table**

| Type                   | How to Tell               | Output             | Range Shape          | Solver | Notes                |
| ---------------------- | ------------------------- | ------------------ | -------------------- | ------ | -------------------- |
| First True             | “smallest X that works”   | minimal feasible X | `[lo, hi)`           | A      | default              |
| Last True              | “largest X still ok”      | maximal feasible X | `[lo, hi]`           | B      | upper mid            |
| Array LB               | sorted array `>=`         | index i            | indices              | C      | LIS tails            |
| Array UB               | sorted array `>`          | index i            | indices              | C      | counts               |
| Maximize min distance  | “place K with gap ≥ d”    | largest d          | `[0, maxGap+1)`      | A      | greedy check         |
| Minimize max load      | “split ≤ m parts under L” | smallest L         | `[max(a), sum(a)+1)` | A      | greedy partition     |
| Machine speed / Koko   | “speed/time so all done”  | min speed/time     | realistic bounds     | A      | use ceil divisions   |
| Earliest feasible time | jobs + rates              | min T              | `[0, hi)`            | A      | sum(rate*T)          |
| Real precision         | geometry / ratios         | within eps         | `[lo, hi]`           | E      | 60–100 iters         |
| Unknown range          | unbounded                 | boundary           | expand+search        | D      | double hi until true |

---

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