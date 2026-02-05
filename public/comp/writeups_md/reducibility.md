# Reduction Theory for Competitive Programming

A lot of CP problems are solved by **reducing to a known model**, proving an equivalence, then implementing it efficiently. If you can write the reduction and the iff claim cleanly, you are already done. Code is just wiring.

Note: During my studies for CECS 329 at CSULB, seeing max independent set reduce to max clique made it obvious that CP problems follow the same discipline. If graph problems reduce, then flow reduces, then basically everything reduces. Thus this writeup.

---

## 0) Core Definitions

**Mapping reduction**
A mapping reduction from problem (A) to problem (B) is a function (f) such that:

$$
\boxed{x \in A \iff f(x) \in B}
$$

**Two-arrow proof discipline**
Every reduction must justify both directions:

$$
(\Rightarrow)\quad x \in A \Rightarrow f(x) \in B
$$

$$
(\Leftarrow)\quad f(x) \in B \Rightarrow x \in A
$$

**Equivalence-preserving normalization**
Some transformations do not change the problem, only its structure:

$$
x \sim g(x)
$$

Meaning:

$$
\text{ans}(x) = \text{ans}(g(x))
$$

---

## 1) Constraints

### When this mindset matters

This writeup is most useful in the 1600–2400 range, where problems are not “one topic”, they are pipelines.

### Complexity sanity checks (common)

* Flow: typically (O(E\sqrt{V})) for bipartite matching (Hopcroft–Karp), Dinic often fine in practice but worst-case large.
* SCC: (O(N+M))
* 2-SAT: (O(N+M)) on implication graph
* Binary search on answer: (O(\log R \cdot T_{\text{check}}))
* Mo’s: about (O((N+Q)\sqrt{N})) moves + sorting

### Common pitfalls (why they fail)

* You wrote a “solution” but never stated an iff claim, so you have no correctness.
* You chose a DS that feels smart, but your algorithmic idea is wrong, so you get fast WA.
* You treat multi-topic problems as simultaneous soup instead of a vertical pipeline.

---

## 2) Theory Bridge

CP reductions are usually not about hardness. They are about **equivalence** and **model selection**.

You are doing one of these:

1. **Normalization** (structure reduction)
   $$
   x \mapsto x' \quad \text{with} \quad \text{ans}(x)=\text{ans}(x')
   $$

2. **Reduction to a solver model**
   $$
   x \in A \iff f(x) \in B
   $$

3. **Optimization to decision** (binary search on answer)
   $$
   \min \text{ ans} = \min{X : P(X)=\text{true}}
   $$

---

## 3) Spotting the Model

| Statement cue                                                           | Likely move          | Target engine             |
| ----------------------------------------------------------------------- | -------------------- | ------------------------- |
| “assign”, “pair”, “each used at most once”, “capacity”                  | build network        | flow / matching / min cut |
| “cannot pick both”, “conflicts”                                         | build conflict graph | IS/VC, bipartite tricks   |
| “if … then …”, “either/or”, “must choose one”                           | implication graph    | 2-SAT / SCC               |
| “time axis”, “intervals”, “overlap”, “schedule”                         | sort / sweep         | greedy / heap / DP        |
| “minimize maximum”, “maximize minimum”, “smallest X such that feasible” | optimize → decision  | binary search on answer   |
| “range queries offline”, “frequency metric”                             | reorder queries      | Mo / sqrt decomposition   |
| “components”, “merge”, “connectivity under edges”                       | quotient graph       | DSU / SCC / bridge-tree   |

---

## 4) Competitive Programming Pipeline Model

When solving CP problems, separate the solution into three sequential layers:

### Structure Reduction (Normalization)

Eliminate irrelevant complexity while preserving equivalence. No optimization happens here.

Examples:

* SCC condensation: $$G \to \text{DAG}(G)$$
* Sorting to destroy symmetry
* Coordinate compression: $${10^9,10^{18}} \to [0..m)$$
* Tree rooting: undirected tree $$\to$$ parent-child DAG
* Euler tour flattening: $$\text{subtree}(u) \to [tin[u], tout[u]]$$
* Complement graph: clique $$\leftrightarrow$$ independent set
* Implication graph construction for 2-SAT
* DSU quotienting: $$G \to G/\sim$$ by an equivalence relation

### Algorithmic Idea (Correctness Core)

Choose the engine that achieves the goal after normalization.

Examples:

* DP recurrence
* greedy choice + exchange argument
* max flow / min cut formulation
* sweep invariant
* shortest path modeling
* SCC satisfiability test (2-SAT)
* binary search on answer (optimization → decision + monotonicity)
* two pointers (monotone invariant)
* monotone stack / queue (next greater, window extrema, linear invariant)
* meet-in-the-middle (split (2^n \to 2^{n/2}))
* offline query ordering (Mo’s)

### Data Structure (Efficiency Layer)

Implement efficiently. This affects time/memory only, never correctness.

Examples:

* Fenwick tree, segment tree
* heap, multiset, deque
* DSU (when you maintain the partition online)
* hash maps

Rule of thumb: if swapping DS for a slower one preserves correctness but TLEs, your pipeline is correct.

DSU nuance: DSU is a DS when it only speeds operations, but it is a structure reduction when you explicitly reason on components as single nodes.

---

## 5) Algorithms

This section lists the core reductions you should recognize instantly.

### Flow / Matching

**Bipartite matching → max flow**
Build network:

$$
s \to L \to R \to t
$$

All capacities (1).

Claim:

$$
\exists \text{ matching of size } k \iff \text{maxflow} \ge k
$$

**Scheduling with capacities → max flow**
Tasks to machines with capacities. Claim:

$$
\text{All tasks scheduled} \iff \text{maxflow} = |T|
$$

**Project selection with prerequisites → min cut**
Profits (p_i), implications (i \Rightarrow j). Use infinite capacity edges for implications.

Claim:

$$
\text{max profit} = \sum_{p_i>0} p_i - \text{mincut}
$$

---

### Greedy as reduction to order

Normalize by sorting:

$$
x \mapsto \pi = f(x)
$$

Then prove greedy is optimal on (\pi) by exchange argument.

---

### DP as state graph

DP is reachability / optimization on a DAG of states.

Subset sum:

$$
dp[i][t] = dp[i-1][t] \lor dp[i-1][t-a_i]
$$

Claim:

$$
dp[n][T]=\text{true} \iff \exists \text{ subset sum } T
$$

---

### SCC / Condensation

SCC gives a quotient graph:

$$
G \to \text{DAG}(G)
$$

Then you typically do DP on the DAG.

---

### 2-SAT → SCC

Clause:

$$
(a \lor b)
$$

Edges:

$$
(\neg a \to b),\quad (\neg b \to a)
$$

Claim:

$$
\varphi \text{ satisfiable} \iff \forall x,\ \text{SCC}(x)\neq \text{SCC}(\neg x)
$$

---

### Binary search on answer

Reduction:

$$
\min \text{ ans} = \min{X : P(X)=\text{true}}
$$

Monotonicity requirement:

$$
P(X)=\text{true} \Rightarrow P(X+1)=\text{true}
$$

---

### Two pointers (monotone invariant)

You must prove pointers only move forward:

$$
L \uparrow,\ R \uparrow
$$

Correctness is an invariant about what the window represents.

---

### Monotone stack / queue

Maintain a monotone structure so each element enters and leaves once:

$$
O(n) \text{ total pops and pushes}
$$

Used for next greater, span, sliding window min/max, and some DP optimizations.

---

### Meet-in-the-middle

Split set into two halves:

$$
2^n \to 2^{n/2} + 2^{n/2}
$$

Then combine via sorting / two pointers / hashing.

---

### Mo’s algorithm (offline query ordering)

Reorder queries to minimize add/remove work. Maintain answer under window moves.

Complexity ballpark:

$$
O((N+Q)\sqrt{N})
$$

---

## 6) Templates

These are contest-ready skeletons. Copy, paste, adapt.

### DSU (Quotient maintenance)

**Complexity:** inverse Ackermann, basically constant.

```cpp
struct DSU {
  vector<int> e;
  DSU(int n=0) : e(n, -1) {}

  int find(int x) { return e[x] < 0 ? x : e[x] = find(e[x]); }

  bool unite(int a, int b) {
    a = find(a); b = find(b);
    if (a == b) return false;
    if (e[a] > e[b]) swap(a, b);
    e[a] += e[b];
    e[b] = a;
    return true;
  }

  int size(int x) { return -e[find(x)]; }
};
```

---

### Kosaraju SCC (build SCC id)

**Complexity:** (O(N+M))

```cpp
struct SCC {
  int n;
  vector<vector<int>> g, rg;
  vector<int> comp, order, vis;

  SCC(int n=0) : n(n), g(n), rg(n), comp(n, -1), vis(n, 0) {}

  void add_edge(int u, int v) {
    g[u].push_back(v);
    rg[v].push_back(u);
  }

  void dfs1(int u) {
    vis[u] = 1;
    for (int v : g[u]) if (!vis[v]) dfs1(v);
    order.push_back(u);
  }

  void dfs2(int u, int c) {
    comp[u] = c;
    for (int v : rg[u]) if (comp[v] == -1) dfs2(v, c);
  }

  int build() {
    for (int i = 0; i < n; i++) if (!vis[i]) dfs1(i);
    reverse(order.begin(), order.end());
    int c = 0;
    for (int v : order) if (comp[v] == -1) dfs2(v, c++);
    return c;
  }
};
```

---

### Binary search on answer (min X with check)

```cpp
long long first_true(long long lo, long long hi, auto ok) {
  // invariant: ok(hi) = true, ok(lo-1) = false style depends on setup
  while (lo < hi) {
    long long mid = lo + (hi - lo) / 2;
    if (ok(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
```

---

### Mo’s skeleton (offline range queries)

```cpp
struct Query { int l, r, id; }; // [l, r)
int B;

bool mo_cmp(const Query& a, const Query& b) {
  int ab = a.l / B, bb = b.l / B;
  if (ab != bb) return ab < bb;
  if (ab & 1) return a.r > b.r;
  return a.r < b.r;
}
```

You still need problem-specific `add(x)` / `remove(x)`.

---

## 7) Worked Examples

At least four complete, end-to-end solutions. These are chosen because they stress different pipeline layers.

---

### **Sagheer and Nubian Market - Codeforces 812C**

#### **Problem**

Pick exactly (k) items. Base costs (a_i). If you pick item (i) when buying (k) items, its cost becomes:

$$
a_i + i \cdot k
$$

(1-indexed (i)). Find maximum (k) you can afford with budget (S), and the minimum cost for that (k).

#### **Why Binary Search on Answer**

Optimization reduces to decision: “is there a feasible set of (k) items within budget?”

#### **Complexity**

Sorting per check:

$$
O(n \log n \log n)
$$

(outer (\log n) for binary search)

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n;
  long long S;
  cin >> n >> S;
  vector<long long> a(n);
  for (auto &x : a) cin >> x;

  auto cost_for_k = [&](int k) -> long long {
    vector<long long> c(n);
    for (int i = 0; i < n; i++) {
      long long idx = i + 1;
      c[i] = a[i] + idx * 1LL * k;
    }
    nth_element(c.begin(), c.begin() + k, c.end());
    long long sum = 0;
    for (int i = 0; i < k; i++) sum += c[i];
    return sum;
  };

  int lo = 0, hi = n;
  long long best_cost = 0;

  while (lo < hi) {
    int mid = lo + (hi - lo + 1) / 2;
    long long c = cost_for_k(mid);
    if (c <= S) lo = mid;
    else hi = mid - 1;
  }

  best_cost = cost_for_k(lo);
  cout << lo << " " << best_cost << "\n";
  return 0;
}
```

---

### **The Door Problem - Codeforces 776D**

#### **Problem**

Each door has two switches. Each door wants its parity (open/closed) to match a target. Decide if there exists a switch assignment.

#### **Why 2-SAT**

Each door becomes an XOR / parity constraint between two boolean variables, which reduces to 2-SAT via implications.

#### **Complexity**

Implication graph + SCC:

$$
O((n+m))
$$

```cpp
#include <bits/stdc++.h>
using namespace std;

struct SCC {
  int n;
  vector<vector<int>> g, rg;
  vector<int> comp, order, vis;
  SCC(int n=0): n(n), g(n), rg(n), comp(n, -1), vis(n, 0) {}
  void add_edge(int u, int v){ g[u].push_back(v); rg[v].push_back(u); }
  void dfs1(int u){
    vis[u]=1;
    for(int v:g[u]) if(!vis[v]) dfs1(v);
    order.push_back(u);
  }
  void dfs2(int u,int c){
    comp[u]=c;
    for(int v:rg[u]) if(comp[v]==-1) dfs2(v,c);
  }
  int build(){
    for(int i=0;i<n;i++) if(!vis[i]) dfs1(i);
    reverse(order.begin(), order.end());
    int c=0;
    for(int v:order) if(comp[v]==-1) dfs2(v,c++);
    return c;
  }
};

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n, m;
  cin >> n >> m;
  vector<int> desired(m);
  for (int i = 0; i < m; i++) cin >> desired[i];

  vector<vector<int>> doors_of_switch(n);
  for (int i = 0; i < m; i++) {
    int k; cin >> k;
    for (int j = 0; j < k; j++) {
      int sw; cin >> sw; --sw;
      doors_of_switch[sw].push_back(i);
    }
  }

  // For each door i, we need the two switches that affect it.
  vector<array<int,2>> sw(m, {-1,-1});
  for (int s = 0; s < n; s++) {
    for (int door : doors_of_switch[s]) {
      if (sw[door][0] == -1) sw[door][0] = s;
      else sw[door][1] = s;
    }
  }

  // 2-SAT with n variables, nodes: 2*n
  auto var = [&](int x, int val){ // val 0=false, 1=true
    // node for (x is val)
    return 2*x + val;
  };
  auto neg = [&](int node){
    int x = node/2;
    int val = node%2;
    return 2*x + (val^1);
  };

  SCC scc(2*n);

  auto add_imp = [&](int a, int b){ scc.add_edge(a,b); };
  auto add_or = [&](int a, int b){
    // (a OR b) == (!a -> b) and (!b -> a)
    add_imp(neg(a), b);
    add_imp(neg(b), a);
  };

  // Each door gives parity constraint between two switches.
  // Let switches be x and y. desired=0 means x == y. desired=1 means x != y.
  // Encode with 2-SAT clauses:
  // x == y : (x -> y) (y -> x) (!x -> !y) (!y -> !x)
  // x != y : (x -> !y) (y -> !x) (!x -> y) (!y -> x)
  for (int i = 0; i < m; i++) {
    int x = sw[i][0], y = sw[i][1];
    if (x == -1 || y == -1) { cout << "NO\n"; return 0; }

    if (desired[i] == 0) {
      add_imp(var(x,1), var(y,1));
      add_imp(var(y,1), var(x,1));
      add_imp(var(x,0), var(y,0));
      add_imp(var(y,0), var(x,0));
    } else {
      add_imp(var(x,1), var(y,0));
      add_imp(var(y,1), var(x,0));
      add_imp(var(x,0), var(y,1));
      add_imp(var(y,0), var(x,1));
    }
  }

  scc.build();
  for (int x = 0; x < n; x++) {
    if (scc.comp[var(x,0)] == scc.comp[var(x,1)]) {
      cout << "NO\n";
      return 0;
    }
  }
  cout << "YES\n";
  return 0;
}
```

---

### **Checkposts - Codeforces 427C**

#### **Problem**

Given directed graph, each node has a cost. Choose a set of nodes such that every SCC contributes at least one chosen node. Minimize total cost and count the number of minimum-cost ways.

#### **Why SCC Condensation**

SCCs are equivalence classes under mutual reachability. Contracting SCCs is a structure reduction:

$$
G \to G/\sim
$$

Then each SCC is independent for this objective.

#### **Complexity**

Kosaraju + per-SCC scan:

$$
O(n+m)
$$

```cpp
#include <bits/stdc++.h>
using namespace std;

static const long long MOD = 1'000'000'007LL;

struct SCC {
  int n;
  vector<vector<int>> g, rg;
  vector<int> comp, order, vis;
  SCC(int n=0): n(n), g(n), rg(n), comp(n, -1), vis(n, 0) {}
  void add_edge(int u, int v){ g[u].push_back(v); rg[v].push_back(u); }
  void dfs1(int u){
    vis[u]=1;
    for(int v:g[u]) if(!vis[v]) dfs1(v);
    order.push_back(u);
  }
  void dfs2(int u,int c){
    comp[u]=c;
    for(int v:rg[u]) if(comp[v]==-1) dfs2(v,c);
  }
  int build(){
    for(int i=0;i<n;i++) if(!vis[i]) dfs1(i);
    reverse(order.begin(), order.end());
    int c=0;
    for(int v:order) if(comp[v]==-1) dfs2(v,c++);
    return c;
  }
};

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n; cin >> n;
  vector<long long> cost(n);
  for (int i = 0; i < n; i++) cin >> cost[i];

  int m; cin >> m;
  SCC scc(n);
  for (int i = 0; i < m; i++) {
    int u,v; cin >> u >> v; --u; --v;
    scc.add_edge(u,v);
  }

  int c = scc.build();
  vector<long long> minCost(c, (long long)4e18);
  vector<long long> ways(c, 0);

  for (int i = 0; i < n; i++) {
    int id = scc.comp[i];
    if (cost[i] < minCost[id]) {
      minCost[id] = cost[i];
      ways[id] = 1;
    } else if (cost[i] == minCost[id]) {
      ways[id]++;
    }
  }

  long long total = 0;
  long long cnt = 1;
  for (int id = 0; id < c; id++) {
    total += minCost[id];
    cnt = (cnt * (ways[id] % MOD)) % MOD;
  }

  cout << total << " " << cnt << "\n";
  return 0;
}
```

---

### **Powerful array - Codeforces 86D**

#### **Problem**

Given array and many offline range queries ([l,r]). Compute:

$$
\sum_{v} v \cdot (\text{freq}_v)^2
$$

for each query.

#### **Why Mo’s Algorithm**

Structure reduction: reorder queries to minimize window edits. Algorithmic idea: maintain an invariant under add/remove.

#### **Complexity**

About:

$$
O((N+Q)\sqrt{N})
$$

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Query {
  int l, r, id; // [l, r)
};

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  int n, q;
  cin >> n >> q;
  vector<int> a(n);
  for (int i = 0; i < n; i++) cin >> a[i];

  // Coordinate compression not strictly needed here (values <= 1e6 in CF 86D),
  // but keep it generic.
  vector<int> vals = a;
  sort(vals.begin(), vals.end());
  vals.erase(unique(vals.begin(), vals.end()), vals.end());
  for (int i = 0; i < n; i++) {
    a[i] = int(lower_bound(vals.begin(), vals.end(), a[i]) - vals.begin());
  }
  int M = (int)vals.size();

  vector<Query> qs(q);
  for (int i = 0; i < q; i++) {
    int l, r; cin >> l >> r;
    --l;
    qs[i] = {l, r, i}; // input is inclusive, convert to [l, r)
  }

  int B = max(1, (int)sqrt(n));

  auto cmp = [&](const Query& A, const Query& Bq) {
    int ab = A.l / B, bb = Bq.l / B;
    if (ab != bb) return ab < bb;
    if (ab & 1) return A.r > Bq.r;
    return A.r < Bq.r;
  };
  sort(qs.begin(), qs.end(), cmp);

  vector<long long> freq(M, 0);
  long long cur = 0;

  auto add = [&](int idx) {
    int v = a[idx];
    long long f = freq[v];
    long long val = vals[v];
    cur -= val * f * f;
    f++;
    freq[v] = f;
    cur += val * f * f;
  };

  auto remove_ = [&](int idx) {
    int v = a[idx];
    long long f = freq[v];
    long long val = vals[v];
    cur -= val * f * f;
    f--;
    freq[v] = f;
    cur += val * f * f;
  };

  vector<long long> ans(q);
  int L = 0, R = 0; // current window [L, R)
  for (auto &qq : qs) {
    while (L > qq.l) add(--L);
    while (R < qq.r) add(R++);
    while (L < qq.l) remove_(L++);
    while (R > qq.r) remove_(--R);
    ans[qq.id] = cur;
  }

  for (int i = 0; i < q; i++) cout << ans[i] << "\n";
  return 0;
}
```

---

## 8) Common Pitfalls

* Mixing structure reduction and algorithmic logic
* Writing greedy without specifying the ordering
* “Using DS to justify correctness” (wrong layer)
* Treating multi-topic as simultaneous rather than vertical pipeline
* Forgetting the backward arrow
* Binary search without proving monotonicity
* Mo’s without truly (O(1)) add/remove

---

## 9) TLDR

* CP is reduction theory in disguise
* Write the claim:
  $$
  x \in A \iff f(x) \in B
  $$
* Separate layers:

  * structure reduction
  * algorithmic idea
  * data structure
* DSU can be both:

  * reduction when contracting components
  * DS when maintaining partitions online
* Most “multi-topic” problems are pipelines, not interwoven

---

## 10) Recommended Problems

---

### Flow / Matching / Min-Cut

**Warm Up**

* [CF 1213D2 – Equalizing by Division](https://codeforces.com/problemset/problem/1213/D2)
* [CF 1665C – Tree Infection](https://codeforces.com/problemset/problem/1665/C)
* [CF 1076D – Edge Deletion](https://codeforces.com/problemset/problem/1076/D)

**Core**

* [CF 1082G – Petya and Graph](https://codeforces.com/problemset/problem/1082/G)
* [CF 786B – Legacy](https://codeforces.com/problemset/problem/786/B)
* [CF 1266E – Spaceship Solitaire](https://codeforces.com/problemset/problem/1266/E)
* [CF 277E – (closure style)](https://codeforces.com/problemset/problem/277/E)

---

### Greedy (Sort + Exchange + Invariant)

**Warm Up**

* [CF 1131C – Birthday](https://codeforces.com/problemset/problem/1131/C)
* [CF 1114D – Flood Fill](https://codeforces.com/problemset/problem/1114/D)
* [CF 1462E – Close Tuples](https://codeforces.com/problemset/problem/1462/E)

**Core**

* [CF 1251C – Minimize The Integer](https://codeforces.com/problemset/problem/1251/C)
* [CF 1705C – Mark and His Unfinished Essay](https://codeforces.com/problemset/problem/1705/C)
* [CF 1537E2 – Erase and Extend (Hard)](https://codeforces.com/problemset/problem/1537/E2)
* [CF 1408D – Searchlights](https://codeforces.com/problemset/problem/1408/D)

---

### DP (State Reduction First)

**Warm Up**

* [CF 448C – Painting Fence](https://codeforces.com/problemset/problem/448/C)
* [CF 1392D – Omkar and Bed Wars](https://codeforces.com/problemset/problem/1392/D)
* [AtCoder DP F – LCS](https://atcoder.jp/contests/dp/tasks/dp_f)

**Core**

* [CF 1625C – Road Optimization](https://codeforces.com/problemset/problem/1625/C)
* [CF 1741F – Multi-Colored Segments](https://codeforces.com/problemset/problem/1741/F)
* [AtCoder DP K–N](https://atcoder.jp/contests/dp/tasks)

---

### SCC / Condensation / 2-SAT

**Warm Up**

* [CF 999E – Reachability from the Capital](https://codeforces.com/problemset/problem/999/E)
* [CF 1000E – We Need More Bosses](https://codeforces.com/problemset/problem/1000/E)
* [CSES 1684 – Giant Pizza (2-SAT)](https://cses.fi/problemset/task/1684)

**Core**

* [CF 427C – Checkposts](https://codeforces.com/problemset/problem/427/C)
* [CF 776D – The Door Problem](https://codeforces.com/problemset/problem/776/D)
* [CF 1209F – Koala and Notebook](https://codeforces.com/problemset/problem/1209/F)

---

### DSU (Quotienting)

**Warm Up**

* [CF 1167C – News Distribution](https://codeforces.com/problemset/problem/1167/C)
* [CF 1209D – Cow and Fields](https://codeforces.com/problemset/problem/1209/D)
* [CF 1665D – (DSU-ish component logic)](https://codeforces.com/problemset/problem/1665/D)

**Core**

* [CF 1411C – Peaceful Rooks](https://codeforces.com/problemset/problem/1411/C)
* [CF 1705E – Mark and Professor](https://codeforces.com/problemset/problem/1705/E)
* [CF 455C – Civilization](https://codeforces.com/problemset/problem/455/C)

---

### Binary Search on Answer

**Warm Up**

* [CF 474B – Worms](https://codeforces.com/problemset/problem/474/B)
* [CF 670D1 – Magic Powder (Easy)](https://codeforces.com/problemset/problem/670/D1)
* [CF 812C – Sagheer and Nubian Market](https://codeforces.com/problemset/problem/812/C)

**Core**

* [CF 1661C – Water the Trees](https://codeforces.com/problemset/problem/1661/C)
* [CF 1169C – Increasing by Modulo](https://codeforces.com/problemset/problem/1169/C)
* [CF 1373D – Maximum Sum on Even Positions](https://codeforces.com/problemset/problem/1373/D)

---

### Two Pointers / Sliding Window

**Warm Up**

* [CF 676C – Vasya and String](https://codeforces.com/problemset/problem/676/C)
* [CF 279B – Books](https://codeforces.com/problemset/problem/279/B)
* [CF 702A – Maximum Increase](https://codeforces.com/problemset/problem/702/A)

**Core**

* [CF 1537E2 – Erase and Extend (Hard)](https://codeforces.com/problemset/problem/1537/E2)
* [CF 1408D – Searchlights](https://codeforces.com/problemset/problem/1408/D)
* [CF 1705C – Mark and His Unfinished Essay](https://codeforces.com/problemset/problem/1705/C)

---

### Monotone Stack / Queue

**Warm Up**

* [CF 1324D – Pair of Topics](https://codeforces.com/problemset/problem/1324/D)
* [CF 1197C – Array Splitting](https://codeforces.com/problemset/problem/1197/C)
* [CF 1462C – Unique Number](https://codeforces.com/problemset/problem/1462/C)

**Core**

* [CF 1795C – Tea Tasting](https://codeforces.com/problemset/problem/1795/C)
* [CF 1179A – Valeriy and Deque](https://codeforces.com/problemset/problem/1179/A)
* [CF 1749C – Number Game](https://codeforces.com/problemset/problem/1749/C)

---

### Meet-in-the-Middle

**Warm Up**

* [CSES 1628 – Meet in the Middle](https://cses.fi/problemset/task/1628)
* [CF 1006F – Xor of 3](https://codeforces.com/problemset/problem/1006/F)

**Core**

* [CF 1114C – Trailing Loves](https://codeforces.com/problemset/problem/1114/C)
* [CF 1099F – Cookies](https://codeforces.com/problemset/problem/1099/F)

---

### Mo’s Algorithm / Offline Query Ordering

**Warm Up**

* [CF 86D – Powerful Array](https://codeforces.com/problemset/problem/86/D)
* [CF 220B – Little Elephant and Array](https://codeforces.com/problemset/problem/220/B)

**Core**

* [CF 617E – XOR and Favorite Number](https://codeforces.com/problemset/problem/617/E)
* [CF 840D – Destiny](https://codeforces.com/problemset/problem/840/D)
* [CF 475D – CGCDSSQ](https://codeforces.com/problemset/problem/475/D)