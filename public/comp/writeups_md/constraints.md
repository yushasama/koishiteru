# **Sniffing Out The Algo from Constraints**

Being able to read the problem statement is cool, but **being able to read the constraints is what makes you mog**.

Imagine you're in a live contest, solving Div2D. You whip up a “genius” prefix sum solution, hit submit… and boom, TLE nukes your PC. Meanwhile some dude skimmed the problem statement and read $n \leq 10^5$, instantly knew prefix sums alone won’t scale, and pulled out a Fenwick Tree. he’s smurfing the whole contest w ACs while you’re still coping.

---

## **Operations Budget (Per 1s)**

* CF / AtCoder / CSES → about $10^8$ ops.
* ICPC / Kattis stricter → about $5 \cdot 10^7$.
* USACO → 2s C++, 4s Python/Java.
* LeetCode → Python gets $3{-}5\times$ the C++ budget.
* Python (PyPy) → roughly 10× slower than C++.

---

## **Constraint buckets**

* **Exponential**

  * Brute Subsets: $n \leq 20{-}22$.
  * Bitmask DP (TSP, SOS): $n \approx 20$.
  * Meet-in-the-Middle: $n \leq 40{-}44$.
  * Backtracking + Pruning: sometimes $n \approx 30$.

* **Small:** $n \leq 100$ → $O(n^3)$.

* **Medium:** $n \leq 1000$ → $O(n^2)$.

* **Big:** $n \leq 10^5$ → $O(n \log n)$.

* **Fat:** $n \leq 10^6$ → $O(n)$.

* **Monster:** $n \geq 10^9$ → math / compression only.

* **Cosmic:** $n \sim 10^{18}$ → only $O(\log n)$.

---

## **Cheat Map w/ Hidden Tells**

| $n$ scale      | Safe complexity | Algos you grab                          | Hidden tells               |
| -------------- | --------------- | --------------------------------------- | ---------------------------------------------- |
| $\leq 20{-}22$ | $2^n, n!$       | brute force, bitmask DP                 | tiny input → brute intended                    |
| $\sim 32{-}40$ | $2^{n/2}$       | meet-in-the-middle                      | “$n=32$” often hints MITM                      |
| $\leq 100$     | $n^3$           | Floyd–Warshall, Hungarian, 3D DP        | small graph DP / APSP                          |
| $\leq 1000$    | $n^2$           | LIS DP, grid DP, matrix graph           | grid $\leq 1000 \times 1000$ safe              |
| $\leq 10^5$    | $n \log n$      | sort, segtree/Fenwick, DSU, Dijkstra    | max value $\leq 10^9$ → coordinate compression |
| $\leq 10^6$    | $n$             | prefix sums, sieve, hashmap, KMP/Z, BFS | if $Q$ big → preprocess once                   |
| $\geq 10^9$    | math / log only | closed forms, binary search, fast exp   | implicit input → no arrays, must compress      |
| $\sim 10^{18}$ | $O(\log n)$     | fast exp, doubling, gcd                 | binary search / math only                      |

---

## **Other Hidden Tells**

* **Sum of $n$ over testcases $\leq 10^5$** → amortize across tests, total complexity matters.

* **Max value $\leq 10^9$** → can’t array index → coordinate compression.
* **Sums / products**: $n=10^5$ with values up to $10^9$ → sum can hit $10^{14}$. → **use `long long`**.
* **Graph weights up to $10^9$** with many edges → path sums in $10^{14+}$. → **use `long long`**.
* **Modulo $10^9+7$ or $998244353$** → DP/combinatorics incoming.
* **Big $Q$, small $n$** → precompute everything, answer in $O(1)$.
* **Memory 256MB** → 2D DP past about $1000 \times 1000$ is RIP unless rolled/compressed.
* **Edges $\sim 2 \cdot 10^5$** → expect DSU/Kruskal/Dijkstra, adjacency matrix will die.

---

## **Long Long or Long Debug Times**

Setters love trolling with value ranges. if you miss it, you’ll be gaslighting yourself in debug hell when the only crime was using `int`.

* Values up to $10^9$, $n=10^5$ → sums hit $10^{14}$. `int` explodes, use `long long`.
* Products / factorials → overflow city
* Graph weights of $10^9$ across many edges → path length shoots to $10^{14+}$.
* Values ≤ $10^9$ but array small → coordinate compression, don’t even think of `vector<int>(1e9)`.

