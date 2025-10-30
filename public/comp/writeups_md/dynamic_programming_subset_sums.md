# DP Forward-Building Trick (Subset / Knapsack Propagation)

This is very useful when the DP state is **boolean**, meaning we only care whether a value is *possible* or not:

$$
dp[j] = \text{true} \quad \text{if some value } j \text{ is possible.}
$$

```cpp
std::vector<bool> dp(target + 1, false);
dp[0] = true; // base case: empty subset

for (int y : nums) {
    for (int j = target - y; j >= 0; --j) {
        if (dp[j]) {
            dp[j + y] = true; // if we can build j, we can build j + y
        }
    }
}
```

Every valid subset sum $j$ unlocks a new subset $j + y$ when we add $y$.
We’re **spreading reachability forward** from smaller to larger sums.

You’ll see this in subset-sum or unbounded knapsack problems like **coin change**.

---

## Bitset Variant

If the amount of DP states is small, you can use a **bitset** for ultra-fast propagation:

```cpp
int target = 50;
std::bitset<1001> dp;  
dp[0] = 1;

for (int x : coins) {
    for (int j = x; j <= target; ++j) {
        if (dp[j - x]) dp[j] = 1; // forward spread
    }
}
```

---

## Bounded 0/1 Knapsack

If each item can only be used once, you must prevent reuse within the same iteration.
To do this, loop **backward**:

```cpp
std::vector<int> dp(target + 1, 0);

for (int w : weights) {
    for (int j = target; j >= w; --j) { // backward loop
        dp[j] = std::max(dp[j], dp[j - w] + value[w]);
    }
}
```

Memory footprint reduces from:

$$
O(n \cdot \text{target}) ;;; \to ;;; O(\text{target})
$$

---

## Feasibility Problems

If the DP state is boolean, we just need to track if a subset sum is possible:

```cpp
std::vector<bool> dp(target + 1, false);
dp[0] = true;

for (int w : weights) {
    for (int j = target; j >= w; --j) {
        if (dp[j - w]) dp[j] = true;
    }
}
```

---

## Bitset Feasibility

If the state space is small and dense, we can compress it into a bitset:

```cpp
int target = 50;
std::bitset<1001> dp;  
dp[0] = 1;

for (int w : weights) {
    dp |= (dp << w); // each item used once
}
```

---

## When Is Bitset Safe?

Let $\Omega$ be the number of DP states.

* `std::bitset<Ω>` stores exactly Ω bits (≈ Ω / 8 bytes of memory)
* Safe: $\Omega \le 10^7$
* Borderline: $\Omega \sim 10^8$
* Risky: anything above that

---

## What If Ω Is Too Big?

* **Sets / Hashmaps:** If reachable states are sparse, use these instead.
* **Compression:** In LIS / patience sorting, you can compress values and use a segment tree or Fenwick tree.

Hashmaps can degrade from $O(1)$ to $O(\Omega)$ with collisions, so if constraints are tight, balanced trees may be safer.
Big-O alone doesn’t capture real-world performance, **tail latency** is a factor.

---

## Rolling State DP

If transitions only depend on the previous layer, you don’t need the full 2D table.

Instead of $dp[n][\text{sum}]$, you just keep $dp[\text{sum}]$.
That’s exactly what we used above in the knapsack examples.

---

## Other Tricks

* **Meet in the Middle (MITM)**
* **Numeric Transforms (FFT / NTT)**
* **SOS DP**

(I’ll cover up to MITM later, the rest are 2000+ Elo tricks and I’m not that good yet.)

---

## Recommended Problems

* [USACO Guide – Knapsack DP](https://usaco.guide/gold/knapsack)
* [USACO Guide – LIS](https://usaco.guide/gold/lis)