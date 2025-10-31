# **Hardmogging with Bitmasks**
Bitmasks are like cheat codes for problems with subsets, toggles, or state tracking. You take a whole set of things and cram it into one int. Suddenly, you're iterating subsets, tracking visited nodes, or building compact DP without blowing up memory. Clean. Fast. Hardmogging your competition with sheer elegance.

If a problem has "k things picked", "on/off switches", or "you can only use each once" vibes, there's a decent chance it’s bitmaskable. This writeup’s here to walk through the classic setups, the sick modeling tricks, and all the little ops that make bitmasks feel like black magic.

You’ll walk out knowing how to toggle, subset iterate, popcount optimize, and tell when a problem’s asking for bitmask DP without actually saying it.

## **0) Core Definitions**

* **Bitmask** - an integer whose bits represent a subset or a row's state.  
  Bit $i = 1$ means "item $i$ is chosen" or "column $i$ is on."
* **LSB (Least Significant Bit)** - `x & -x`. Pulls out the lowest 1-bit.
* **Popcount** - number of 1-bits. `__builtin_popcount(x)` for 32-bit, `__builtin_popcountll(x)` for 64-bit.
* **ctz / clz** - count trailing / leading zeros.  
  Use `ctz(x)` to get the index of the lowest bit. **Undefined if $x = 0$**, always guard this.
* **Submask** - any mask $s$ such that $(s \& m) = s$. In other words, $s$ has only bits that are also in $m$.
* **Practical limit** - Bitmasks work well for $n \le 20$-$22$. Beyond that, $2^n$ states explode exponentially. For $n \ge 25$, you're looking at 30+ million states, which is often too slow.

---

## **1) What To Keep In Mind**

* **When to use:** $n \le 22$ for subset DP with $2^n$ states. Grid width $W \le 20$ for row-mask DP.
* **Why bitmasks win:** Replace loops with $O(1)$ set operations when state fits in a machine word.
* **All $O(1)$ set logic:**
  * Union: `a | b`
  * Intersect: `a & b`
  * Complement: `~a` (be careful with leading 1s if mask is shorter than word size)
  * Difference: `a & ~b`
* **Type safety:** Always use unsigned integers when shifting to avoid undefined behavior.
* **Guard zero:** `ctz(0)` and `clz(0)` are undefined. Always check `if (x == 0)` before calling.
* **Reset per test case:** Mask reuse across test cases is a common source of WA.

---

## **2) Theory Bridge**

A mask is a compressed form of a subset.

* Sets ↔ bits
* Local adjacency ↔ shifts `<<`, `>>`
* Flips ↔ XOR
* Hamming distance ↔ `popcount(x ^ y)` (number of differing bits)
* Enumerating submasks ↔ exploring all subsets

This lets you replace nested loops with constant-time bit math and make DPs over sets or row patterns.

**Why submask enumeration works:**  
The loop `for (int s = mask; ; s = (s - 1) & mask)` visits all submasks because:
- Decrementing `s` flips bits from right to left
- AND-ing with `mask` keeps only bits that were originally in `mask`
- This generates all $2^{\text{popcount(mask)}}$ submasks in descending order

---

## **3) Shapes and Models**

| Task Type           | How to Tell               | What You Do                | Common Op           | Complexity |
| ------------------- | ------------------------- | -------------------------- | ------------------- | ---------- |
| Grid constraints    | 0/1 grid, "no adjacents"  | pack rows into masks       | shifts + AND        | $O(H \cdot 2^W)$ to $O(H \cdot 4^W)$ |
| Chessboard flips    | "min flips to pattern"    | XOR with pattern, popcount | `popcount(x ^ y)`   | $O(H \cdot W)$ |
| Subset optimization | $n \le 22$                 | DP[mask], submask loops    | `mask ^ (1 << i)`      | $O(2^n \cdot n)$ to $O(3^n)$ |
| Row-state DP        | $H \times W$, local $2 \times 2$ rules    | DP over row masks          | compatibility check | $O(H \cdot 4^W)$ |
| SOS DP              | need subset/superset sums | DP over $2^k$              | bitwise propagation | $O(2^k \cdot k)$ |

---

## **4) Operations You Constantly Use**

Below are the only bit tricks you'll really need, plus what each one does.

### **Extracting bits**

```cpp
using u64 = unsigned long long;

// Count bits
int pc(u64 x) { return __builtin_popcountll(x); }

// Find index of least significant 1 (safe version)
int safe_ctz(u64 x) { 
    return x ? __builtin_ctzll(x) : 64; 
}

// Get that least significant 1 itself
u64 lsb(u64 x) { return x & -x; }

// Remove the least significant 1
void clear_lsb(u64 &x) { x &= x - 1; }
```

**Idea:** `x & -x` isolates the lowest bit that's set because `-x` in two's complement flips all bits and adds 1, which cancels everything up to and including the lowest 1-bit.

`x &= x - 1` clears that bit because `x - 1` flips all trailing zeros and the lowest 1, so AND-ing removes it.

Combine them to loop over active positions fast.

**Guard example:**
```cpp
if (x == 0) {
    // handle empty mask
} else {
    int lowest_bit_index = __builtin_ctzll(x);
}
```

---

### **Setting and checking bits**

```cpp
mask |= (1LL << i);        // turn bit i on
mask &= ~(1LL << i);       // turn bit i off
bool on = (mask >> i) & 1; // read bit i
```

Use this when building or debugging small masks manually.

**Note:** Use `1LL` for long long masks to avoid overflow when $i \ge 30$.

---

### **Iterating over bits**

```cpp
int m = mask;
while (m) {
    int b = __builtin_ctz(m); // index of next 1
    // process bit b
    m &= m - 1;               // clear it
}
```

Walks through all bits that are 1 in `mask` in $O(\text{popcount(mask)})$ time.

---

### **Enumerating submasks**

```cpp
for (int s = mask; ; s = (s - 1) & mask) {
    // use s (a submask of mask)
    if (s == 0) break;
}
```

Standard way to loop over all $2^{\text{popcount(mask)}}$ subsets of a mask.

**Why this works:** Decrementing `s` flips bits, and AND-ing with `mask` keeps only bits that were originally in `mask`. This generates all submasks in descending order.

**Complexity:** $O(3^n)$ total if you enumerate submasks for all masks from 0 to $2^n - 1$. This is because $\sum_{m=0}^{2^n-1} 2^{\text{popcount}(m)} = 3^n$ by the binomial theorem.

---

### **Counting and comparing**

```cpp
int bits = __builtin_popcount(mask);   // how many are on
int flips = __builtin_popcount(x ^ y); // Hamming distance (number of differing bits)
```

Used for parity checks, flip-cost computations. For example, `popcount(x ^ y)` gives the minimum number of bit flips to transform `x` into `y`.

---

### **Row packing for grids**

This is useful when you have a binary grid and want to compress each row into an integer for fast operations.

```cpp
vector<int> row(H);
for (int i = 0; i < H; i++) {
    string s; cin >> s;
    for (int j = 0; j < W; j++)
        if (s[j] == '*') row[i] |= (1 << j);
}
```

Converts each row of a binary grid into a mask, where bit $j$ represents column $j$.

---

### **Adjacency checks**

These are common in grid validation tasks like Star Battle, Minesweeper, or placement problems.

```cpp
bool badRow(int m) { 
    return m & (m << 1); 
}  // checks horizontal neighbors

bool badVert(int a, int b) { 
    return a & b; 
}  // checks vertical overlap

bool badDiag(int a, int b) { 
    return (a & (b << 1)) || (a & (b >> 1)); 
}  // checks diagonals
```

**Why these work:**
- `m & (m << 1)`: Shifting left by 1 moves each bit to its right neighbor. AND-ing catches adjacent 1s.
- `a & b`: Direct AND catches vertical overlaps (same column in adjacent rows).
- Diagonal checks shift one row relative to the other to align diagonal positions.

---

### **Sum over subsets (SOS DP)**

This is used when you need to compute aggregates over all subsets or supersets of each mask.

```cpp
// Propagate values to all supersets
for (int b = 0; b < K; b++)
    for (int mask = 0; mask < (1 << K); mask++)
        if (mask & (1 << b))
            dp[mask] += dp[mask ^ (1 << b)];
```

**What this does:** For each bit position $b$, add the value from the state without bit $b$ to the state with bit $b$. After processing all bits, `dp[mask]` contains the sum of `dp[s]` for all submasks $s$ of `mask`.

**Complexity:** $O(2^K \cdot K)$, much faster than the naive $O(3^K)$ approach of enumerating all submasks explicitly.

---

## **5) Bitmask DP Patterns**

### **Subset DP (Generic)**

You store something per subset. Example: shortest Hamiltonian path (TSP).

**Complexity:** $O(2^n \cdot n^2)$ for TSP.

```cpp
int n;
int dp[1<<N][N];
fill(&dp[0][0], &dp[0][0] + (1<<N)*N, INF);
dp[1][0] = 0; // start at city 0

for (int mask = 1; mask < (1 << n); mask++) {
    for (int u = 0; u < n; u++) if (mask & (1 << u)) {
        for (int v = 0; v < n; v++) if (!(mask & (1 << v)))
            dp[mask | (1 << v)][v] = min(dp[mask | (1 << v)][v],
                                         dp[mask][u] + cost[u][v]);
    }
}
```

Each bit means a city is visited.  
`mask | (1 << v)` adds city $v$ to the visited set.

---

### **Chessboard Flip**

Grid repaint to alternating pattern: each row alternates 0/1. There are two global patterns, with top-left 0 or 1.  
Flip cost per row is `popcount(row[i] ^ pattern[i])`.

**Complexity:** $O(H \cdot W)$

```cpp
// Assume W-bit rows
int base0 = 0, base1 = 0;
for (int j = 0; j < W; j++) {
    if (j % 2 == 0) base0 |= (1 << j);
    else base1 |= (1 << j);
}

long long cost0 = 0, cost1 = 0;
for (int i = 0; i < H; i++) {
    int patt0 = (i % 2 == 0 ? base0 : base1);
    int patt1 = (i % 2 == 0 ? base1 : base0);
    cost0 += __builtin_popcount(row[i] ^ patt0);
    cost1 += __builtin_popcount(row[i] ^ patt1);
}
cout << min(cost0, cost1);
```

**Why XOR:** `row[i] ^ pattern[i]` gives a mask where 1s indicate cells that need flipping.

---

### **Row-Mask DP**

Used for "no $2 \times 2$ same color" type grids.  
Each state is the bitmask of the current row, and a transition is allowed only if it is compatible with the previous row.

**Complexity:** $O(H \cdot 4^W)$ in the worst case, but often much faster with pruning.

```cpp
bool valid(int up, int down) {
    int both1 = up & down;
    int both0 = ~up & ~down & ((1 << W) - 1); // mask to W bits
    return !((both1 & (both1 << 1)) || (both0 & (both0 << 1)));
}

int dp[H+1][1<<W];
fill(&dp[0][0], &dp[0][0] + (H+1)*(1<<W), INF);

for (int m = 0; m < (1 << W); m++)
    dp[0][m] = __builtin_popcount(m ^ row[0]);

for (int i = 1; i < H; i++) {
    for (int pm = 0; pm < (1 << W); pm++) {
        if (dp[i-1][pm] == INF) continue;
        for (int cm = 0; cm < (1 << W); cm++) {
            if (valid(pm, cm))
                dp[i][cm] = min(dp[i][cm],
                                dp[i-1][pm] + __builtin_popcount(cm ^ row[i]));
        }
    }
}

cout << *min_element(dp[H-1], dp[H-1] + (1 << W)) << "\n";
```

`valid` checks that stacking `pm` over `cm` does not create a $2 \times 2$ block of same bits.

**Why this works:** `both1` has 1s where both rows are 1. `both1 & (both1 << 1)` checks for horizontal adjacent 1s in these positions. Similarly for `both0`.

---

## **6) Worked Example - Star Battle Validation**

Check if a $10 \times 10$ placement of stars is valid. Rules:

* Each row, column, and region has exactly two stars.
* No stars touch horizontally, vertically, or diagonally.

**Complexity:** $O(H \cdot W)$ for grid size $H \times W$.

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    vector<vector<int>> region(10, vector<int>(10));
    for (int i = 0; i < 10; i++) {
        string s; cin >> s;
        for (int j = 0; j < 10; j++)
            region[i][j] = s[j] - '0';
    }

    vector<int> rowMask(10), colCount(10), regionCount(10);
    for (int i = 0; i < 10; i++) {
        string s; cin >> s;
        for (int j = 0; j < 10; j++) {
            if (s[j] == '*') {
                rowMask[i] |= 1 << j;
                colCount[j]++;
                regionCount[region[i][j]]++;
            }
        }
    }

    auto badRow = [&](int m){ return m & (m << 1); };
    auto badDiag = [&](int a, int b){
        return (a & b) || (a & (b << 1)) || (a & (b >> 1));
    };

    for (int i = 0; i < 10; i++) {
        if (__builtin_popcount(rowMask[i]) != 2) 
            return cout << "invalid\n", 0;
        if (badRow(rowMask[i])) 
            return cout << "invalid\n", 0;
        if (colCount[i] != 2 || regionCount[i] != 2) 
            return cout << "invalid\n", 0;
    }

    for (int i = 0; i < 9; i++)
        if (badDiag(rowMask[i], rowMask[i+1]))
            return cout << "invalid\n", 0;

    cout << "valid\n";
}
```

Key checks are one-liners using bit ops. No nested loops, no per-cell scanning.

---

## **7) When NOT to Use Bitmasks**

* **$n > 22$-$25$:** Exponential blowup. For $n = 25$, you have 33 million states. For $n = 30$, over 1 billion.
* **Non-binary state:** If each element has more than 2 states, bitmasks don't fit naturally (though you can use base-3 or higher with careful digit manipulation).
* **Large grids:** If $W > 20$, row-mask DP becomes too slow.
* **When you need fast updates:** Segment trees or other structures are better for dynamic range queries.

---

## **8) TLDR**

* Masks replace arrays of bools with integers.
* `m & (m << 1)` gives horizontal neighbors.
* `m & (m >> 1)` and `a & b` catch vertical overlap.
* `popcount(x ^ y)` gives Hamming distance (flip cost).
* Submask loop iterates all subsets fast: `for (int s = mask; ; s = (s - 1) & mask)`.
* Row-mask DP handles $W \le 20$.
* For pattern matching, XOR with the pattern and count bits.
* **Always guard `ctz(0)` and `clz(0)`** as they're undefined.
* **Always use unsigned integers for shifts** to avoid undefined behavior.
* **Always reset per test case** to avoid WA from stale state.
* If your rule is local, like $2 \times 2$, it is almost always a mask DP.
* **Practical limit: $n \le 22$ for subset DP.** Beyond that, exponential blowup kills you.

---

## **9) Recommended Problems**

* [USACO Guide - Bitmasks](https://usaco.guide/gold/dp-bitmasks)
* [USACO Guide - Sum over Subsets DP](https://usaco.guide/plat/dp-sos)
* [AtCoder DPO - Matching](https://atcoder.jp/contests/dp/tasks/dp_o)
* [CSES 1690 - Hamiltonian Flights](https://cses.fi/problemset/task/1690)
* [CSES 2181 - Counting Tilings](https://cses.fi/problemset/task/2181)
* [Codeforces 165E - Compatible Numbers](https://codeforces.com/problemset/problem/165/E)
* [Kattis - Star Battles](https://open.kattis.com/problems/starbattles1)