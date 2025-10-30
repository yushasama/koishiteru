# **Hardmogging with Bitmasks**

## **0) Core Definitions**

* **Bitmask** - an integer whose bits represent a subset or a row's state.  
  `$ \text{bit } i = 1 $` means "item i is chosen" or "column i is on."
* **LSB (Least Significant Bit)** - `$ x \& -x $`. Pulls out the lowest 1-bit.
* **Popcount** - number of 1-bits. `__builtin_popcount(x)` or `popcountll` for 64-bit.
* **ctz / clz** - count trailing / leading zeros.  
  Use `ctz(x)` to get the index of the lowest bit. Undefined if `$ x = 0 $`.
* **Submask** - any mask `$ s $` such that `$ (s \& m) = s $`.
* **Lane** - a 64-bit chunk. Multiple lanes only matter when `$ W > 64 $`.

---

## **1) What To Keep In Mind**

* When `$ n \le 22 $` use subset DP with `$ 2^n $` states.
* When grid width `$ W \le 20 $` row-mask DP is fine.
* A bitmask replaces loops when state fits in a machine word.
* All `$ O(1) $` set logic:
  * Union: `$ a \mid b $`
  * Intersect: `$ a \& b $`
  * Complement: `$ \sim a $`
  * Difference: `$ a \& \sim b $`
* Always use unsigned integers when shifting.
* Guard `$ \operatorname{ctz}(0) $` and `$ \operatorname{clz}(0) $`.
* Reset per test case. Mask reuse often causes WA.

---

## **2) Theory Bridge**

A mask is a compressed form of a subset.

* Sets ↔ bits.
* Local adjacency ↔ shifts `$ \ll, \gg $`.
* Flips ↔ XOR.
* Hamming distance ↔ `$ \mathrm{popcount}(x \oplus y) $`.
* Enumerating submasks ↔ exploring all subsets.

This lets you replace nested loops with constant-time bit math and make DPs over sets or row patterns.

---

## **3) Shapes and Models**

| Task Type           | How to Tell               | What You Do                | Common Op           |
| ------------------- | ------------------------- | -------------------------- | ------------------- |
| Grid constraints    | 0/1 grid, "no adjacents"  | pack rows into masks       | shifts + AND        |
| Chessboard flips    | "min flips to pattern"    | XOR with pattern, popcount | `popcount(x ^ y)`   |
| Subset optimization | `n <= 22`                 | DP[mask], submask loops    | `(mask ^ bit)`      |
| Row-state DP        | `H×W`, local 2×2 rules    | DP over row masks          | compatibility check |
| SOS DP              | need subset/superset sums | DP over `2^k`              | bitwise propagation |

---

## **4) Operations You Constantly Use**

Below are the only bit tricks you'll really need, plus what each one does.

### **Extracting bits**

```cpp
using u64 = unsigned long long;

// Count bits
int pc(u64 x) { return __builtin_popcountll(x); }  // number of 1s

// Find index of least significant 1
int ctz64(u64 x) { return x ? __builtin_ctzll(x) : 64; }

// Get that least significant 1 itself
u64 lsb(u64 x) { return x & -x; }

// Remove it
void clear_lsb(u64 &x) { x &= x - 1; }
```

Idea: `$ x \& -x $` isolates the lowest bit that's set.  
`$ x \&= x-1 $` clears that bit. Combine them to loop over active positions fast.

---

### **Setting and checking bits**

```cpp
mask |= (1 << i);          // turn bit i on
mask &= ~(1 << i);         // turn bit i off
bool on = (mask >> i) & 1; // read bit i
```

Use this when building or debugging small masks manually.

---

### **Iterating over bits**

```cpp
int m = mask;
while (m) {
  int b = __builtin_ctz(m); // index of next 1
  m &= m - 1;               // clear it
}
```

Walks through all bits that are 1 in `mask` in `$ O(\#\text{bits}) $`.

---

### **Enumerating submasks**

```cpp
for (int s = mask; ; s = (s - 1) & mask) {
  // use s
  if (s == 0) break;
}
```

Standard way to loop over all subsets of a mask.

---

### **Counting and comparing**

```cpp
int bits = __builtin_popcount(mask);   // how many are on
int flips = __builtin_popcount(x ^ y); // difference between two masks
```

Used for parity or flip-cost checks, for example `$ \mathrm{popcount}(x \oplus y) $`.

---

### **Row packing for grids**

```cpp
vector<int> row(H);
for (int i = 0; i < H; i++) {
  string s; cin >> s;
  for (int j = 0; j < W; j++)
    if (s[j] == '*') row[i] |= (1 << j);
}
```

Converts each row of a binary grid into a mask.

---

### **Adjacency checks**

```cpp
bool badRow(int m) { return m & (m << 1); }                 // left/right
bool badVert(int a, int b) { return a & b; }                // up/down
bool badDiag(int a, int b) { return (a & (b << 1)) || (a & (b >> 1)); } // diagonals
```

Classic in grid validation tasks like Star Battle or Minesweeper.

---

### **Sum over subsets (SOS DP)**

```cpp
for (int b = 0; b < K; b++)
  for (int mask = 0; mask < (1<<K); mask++)
    if (mask & (1 << b))
      dp[mask] += dp[mask ^ (1 << b)];
```

Propagates values to all supersets. Used in counting submask frequencies.

---

## **5) Bitmask DP Patterns**

### **A) Subset DP (generic)**

You store something per subset. Example: shortest Hamiltonian path (TSP).

```cpp
int n;
int dp[1<<N][N];
fill(&dp[0][0], &dp[0][0]+(1<<N)*N, INF);
dp[1][0] = 0;

for (int mask = 1; mask < (1<<n); mask++) {
  for (int u = 0; u < n; u++) if (mask & (1<<u)) {
    for (int v = 0; v < n; v++) if (!(mask & (1<<v)))
      dp[mask|(1<<v)][v] = min(dp[mask|(1<<v)][v],
                               dp[mask][u] + cost[u][v]);
  }
}
```

Each bit means a city is visited.  
`$ \text{mask} \mid (1 \ll v) $` adds city `$ v $`.

---

### **B) Chessboard Flip**

Grid repaint to alternate pattern: each row alternates 0/1. There are two global patterns, with top-left 0 or 1.  
Flip cost per row is `$ \mathrm{popcount}(\text{row}[i] \oplus \text{pattern}[i]) $`.

```cpp
long long cost0 = 0, cost1 = 0;
for (int i = 0; i < H; i++) {
  int patt0 = (i % 2 == 0 ? base0 : base1);
  int patt1 = (i % 2 == 0 ? base1 : base0);
  cost0 += __builtin_popcount(row[i] ^ patt0);
  cost1 += __builtin_popcount(row[i] ^ patt1);
}
cout << min(cost0, cost1);
```

---

### **C) Row-Mask DP**

Used for "no `$ 2 \times 2 $` same color" type grids.  
Each state is the bitmask of the current row, and a transition is allowed only if it is compatible with the previous row.

```cpp
bool valid(int up, int down) {
  int both1 = up & down;
  int both0 = ~up & ~down;
  return !( (both1 & (both1 << 1)) || (both0 & (both0 << 1)) );
}

int dp[H+1][1<<W];
for (int m = 0; m < (1<<W); m++)
  dp[0][m] = __builtin_popcount(m ^ row[0]);

for (int i = 1; i < H; i++) {
  for (int pm = 0; pm < (1<<W); pm++)
    for (int cm = 0; cm < (1<<W); cm++)
      if (valid(pm, cm))
        dp[i][cm] = min(dp[i][cm],
                        dp[i-1][pm] + __builtin_popcount(cm ^ row[i]));
}

cout << *min_element(dp[H-1], dp[H-1] + (1<<W)) << "\n";
```

`valid` checks that stacking `pm` over `cm` does not create a `$ 2 \times 2 $` block of same bits.  
Runs in `$ O(H \cdot 4^W) $` for small `$ W $`.

---

## **6) Worked Example - Star Battle Validation**

Check if a `$ 10 \times 10 $` placement of stars is valid. Rules:

* Each row, column, and region has exactly two stars.
* No stars touch horizontally, vertically, or diagonally.

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
  auto badDiag = [&](int a,int b){
    return (a & b) || (a & (b << 1)) || (a & (b >> 1));
  };

  for (int i = 0; i < 10; i++) {
    if (__builtin_popcount(rowMask[i]) != 2) return cout << "invalid\n", 0;
    if (badRow(rowMask[i])) return cout << "invalid\n", 0;
    if (colCount[i] != 2 || regionCount[i] != 2) return cout << "invalid\n", 0;
  }

  for (int i = 0; i < 9; i++)
    if (badDiag(rowMask[i], rowMask[i+1]))
      return cout << "invalid\n", 0;

  cout << "valid\n";
}
```

Key checks are one-liners using bit ops. No nested loops, no per-cell scanning.

---

## **7) TLDR**

* Masks replace arrays of bools with integers.
* `$ m \& (m \ll 1) $` gives horizontal neighbors.
* `$ m \& (m \gg 1) $` and `$ a \& b $` catch vertical overlap.
* `$ \mathrm{popcount}(x \oplus y) $` gives flip cost.
* Submask loop iterates all subsets fast.
* Row-mask DP handles `$ W \le 20 $`.
* For pattern matching, XOR with the pattern.
* Guard zero in `ctz` and `clz`, and always reset per case.
* If your rule is local, like `$ 2 \times 2 $`, it is almost always a mask DP.

## **8) Recommended Problems**
* USACO Guide - Bitmasks: https://usaco.guide/gold/dp-bitmasks
* USACO Guide - Sum over Subsets DP: https://usaco.guide/plat/dp-sos
* AtCoder DPO - Matching: https://atcoder.jp/contests/dp/tasks/dp_o
* CSES 1690 - Hamiltonian Flights: https://cses.fi/problemset/task/1690
* CSES 2181 - Counting Tilings: https://cses.fi/problemset/task/2181
* Codeforces 165E - Compatible Numbers: https://codeforces.com/problemset/problem/165/E
* Kattis - Star Battles: https://open.kattis.com/problems/starbattles1
