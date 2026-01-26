# Graph Connectivity & Decomposition (CC, SCC, 2-SAT)

You have graphs, you care about who's connected to who, where cycles live, and how to compress structure so DP / logic becomes easy. We'll walk from:
* Undirected connected components + cycles
* Strongly Connected Components + condensation
* 2-SAT as "boolean constraints → graph"

---

## 0) Core Definitions

* **Connected component (CC)** 
Maximal set of vertices where every pair has a path between them in an undirected graph.

* **Cycle (undirected)** 
A path that starts and ends at the same vertex, length $\ge 3$, no repeated edges.

* **Strongly connected component (SCC)** 
In a directed graph, a maximal set of vertices where every vertex can reach every other via directed paths.

* **Condensation DAG** 
Contract each SCC into a single node, keep edges between components. Result is always a DAG.

* **2-SAT** 
Boolean formula in CNF where each clause has exactly two literals, like $(x_i \lor \neg x_j)$. Ask if there exists an assignment making all clauses true.

---

## 1) Constraints

What ranges these tools are meant for:

* **Plain CC / cycles (undirected)**
  * Typical: $n, m \le 2 \times 10^5$.
  * $O(n + m)$ DFS/BFS or DSU.

* **SCC**
  * Directed graph, similar $n, m$.
  * Need $O(n + m)$ DFS-based SCC (Kosaraju / Tarjan).

* **2-SAT**
  * Variables: up to around $10^5$.
  * Clauses: up to around $2 \times 10^5$.
  * Implication graph: $2n$ nodes, $2m$ edges $\to O(n + m)$ SCC.

Constraint-based diagnosis:

* Undirected + "connected?", "how many components?", "tree or not" $\to$ CC / cycles.
* Directed + "mutually reachable", "infinite walk", "compress strongly connected parts" $\to$ SCC + condensation.
* "Each item has 2 options" + many pairwise "if/then / at least one / not both" constraints $\to$ 2-SAT.

---

## 2) Theory Bridge

* **CC & cycles (undirected)**
  * DFS/BFS or DSU from an unvisited node hits exactly that connected component.
  * Cycle in undirected DFS: you see an edge to a visited vertex that is not the parent.
  * **Self-loops / multiedges**: If you care about them as cycles, check explicitly. Most CP problems ignore self-loops in undirected graphs.

* **SCC**
  * Define $u \sim v$ if $u$ and $v$ can both reach each other. This is an equivalence relation $\to$ SCCs are equivalence classes.
  * Condensation is a DAG: if you had a directed cycle between components, they were one SCC.
  * **Self-loops**: A single vertex with a self-loop is its own SCC and contains a cycle.

* **2-SAT**
  * $(a \lor b)$ is equivalent to $(\neg a \to b) \land (\neg b \to a)$.
  * Build implication graph. If $x$ and $\neg x$ end up in same SCC, you're forced to set $x$ both true and false $\to$ impossible.
  * Otherwise, topological order of SCCs lets you choose values consistently.

---

## 3) Spotting the Model

Speed map from statement text to technique.

| Statement smell | Technique |
| ------------------------------------------------- | ------------------------ |
| Undirected, "how many components?" | CC (DFS/BFS or DSU) |
| Undirected, "is it a tree?", "any cycle?" | CC + cycle detection |
| Undirected, "dynamic edges", "offline queries" | DSU |
| Directed, "can go there and come back" | SCC |
| Directed, "infinite walk", "eventually loops" | SCC + condensation |
| "Compress strongly connected pieces" | SCC |
| Each item has exactly 2 options (A/B, left/right) | 2-SAT candidate |
| "Not both can happen" | 2-SAT clause $(\neg a \lor \neg b)$ |
| "At least one must happen" | 2-SAT clause $(a \lor b)$ |
| "If X then Y" | Implication / 2-SAT |

---

## 4) Shapes and Models

| Type | How to tell | What to output | Solver | Complexity | Notes |
| ---------------------- | ------------------------------------ | ------------------------ | --------------- | ---------- | ------------------------- |
| Undirected CC | No directions, basic connectivity | `comp[v]` per vertex | DFS/BFS | $O(n + m)$ | Standard. |
| DSU for CC | Offline / dynamic edges | `comp[v]` per vertex | DSU | $O(m \cdot \alpha(n))$ | Amortized near-constant. |
| Undirected cycle check | "Tree or not?", "contains cycle?" | YES / NO | DFS/BFS | $O(n + m)$ | DFS with parent. |
| SCC decomposition | Directed, mutual reachability talk | `comp[v]`, `#components` | Kosaraju | $O(n + m)$ | Core for directed stuff. |
| SCC + DAG DP | Need sums/paths on collapsed graph | DP per component | SCC + topo DP | $O(n + m)$ | E.g. infinite walk. |
| 2-SAT feasibility | 2 options per variable, pair clauses | YES / NO | 2-SAT via SCC | $O(n + m)$ | Check conflicts only. |
| 2-SAT with assignment | Need explicit choices | boolean per variable | 2-SAT via SCC | $O(n + m)$ | Use SCC order for values. |

---

## 5) Algorithms

### Undirected CC + cycle detection (DFS / BFS)

**Runtime:** $O(n + m)$

* Build adjacency list.
* For each unvisited vertex, traverse its component:
  * Track the traversal root (not the DFS parent) to assign component IDs in `comp_id[v]`
  * If an edge $(v, \text{to})$ is seen where `to` is already visited and `to $\ne$ parent[v]`, a cycle exists.

### DSU (for offline / dynamic connectivity)

**Runtime:** $O(m \cdot \alpha(n))$

Use when:
- You're building a graph incrementally (e.g., Kruskal's MST, offline connectivity queries).
- You don't care about the actual paths, just "are these connected?"

**When to use DFS vs DSU:**
- **DFS/BFS**: You need to actually traverse the graph, find paths, or detect cycles.
- **DSU**: You're doing offline queries, building MST, or just checking connectivity without caring about structure.

### Kosaraju SCC (directed)

**Runtime:** $O(n + m)$

1. DFS on original graph, push vertices in order of exit.
2. Reverse graph.
3. Process vertices in reverse exit order; DFS on reversed graph; each DFS = one SCC.

**Why Kosaraju over Tarjan:**
- Simpler to code.
- Two-pass but easier to debug.
- Tarjan is one-pass but trickier with `low[]` logic—only use if you're flex-coding or need the slight constant factor.

### Condensation DAG

**Runtime:** $O(n + m)$

After running SCC, build the compressed graph:

```cpp
int comps = scc.build();
vector<set<int>> dag(comps);
for (int u = 0; u < n; u++) {
    for (int v : g[u]) {
        int cu = scc.comp[u];
        int cv = scc.comp[v];
        if (cu != cv) dag[cu].insert(cv);
    }
}
```

Use `set` to avoid duplicate edges. For DP, you can convert to `vector<vector<int>>` after.

### 2-SAT via SCC

**Runtime:** $O(n + m)$

1. Map each literal `(var, val)` to index `id`.
2. Clause $(a \lor b) \to$ implications $\neg a \to b$ and $\neg b \to a$.
3. Run SCC on implication graph.
4. If `comp[x] == comp[$\neg$x]` for some variable $\to$ unsat.
5. Else, assign by SCC order (later component index = stronger implication).

---

## 6) Templates

### Undirected CC + cycle

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 200005;
vector<int> g[MAXN];
int comp_id[MAXN];
bool vis[MAXN];
bool has_cycle = false;

void dfs(int v, int cid, int p = -1) {
    vis[v] = true;
    comp_id[v] = cid;
    for (int to : g[v]) {
        if (!vis[to]) dfs(to, cid, v);
        else if (to != p) has_cycle = true;
    }
}

int main() {
    int n, m; cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        --u; --v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    int num_comps = 0;
    for (int i = 0; i < n; i++) {
        if (!vis[i]) dfs(i, num_comps++);
    }
    cout << (has_cycle ? "HAS CYCLE" : "NO CYCLE") << "\n";
    cout << "Components: " << num_comps << "\n";
}
```

### DSU

```cpp
struct DSU {
    vector<int> e;
    DSU(int n) : e(n, -1) {}
    int find(int x) { return e[x] < 0 ? x : e[x] = find(e[x]); }
    bool unite(int x, int y) {
        x = find(x), y = find(y);
        if (x == y) return false;
        if (e[x] > e[y]) swap(x, y);
        e[x] += e[y]; e[y] = x;
        return true;
    }
};
```

### SCC (Kosaraju)

```cpp
struct SCC {
    int n;
    vector<vector<int>> g, gr;
    vector<int> comp, order;
    vector<int> used;
    int comp_cnt;

    SCC(int n) : n(n), g(n), gr(n), comp(n, -1), used(n, 0), comp_cnt(0) {}

    void add_edge(int u, int v) {
        g[u].push_back(v);
        gr[v].push_back(u);
    }

    void dfs1(int v) {
        used[v] = 1;
        for (int to : g[v]) if (!used[to]) dfs1(to);
        order.push_back(v);
    }

    void dfs2(int v, int c) {
        comp[v] = c;
        for (int to : gr[v]) if (comp[to] == -1) dfs2(to, c);
    }

    int build() {
        order.clear();
        fill(used.begin(), used.end(), 0);
        for (int i = 0; i < n; i++) if (!used[i]) dfs1(i);
        fill(comp.begin(), comp.end(), -1);
        comp_cnt = 0;
        for (int i = n - 1; i >= 0; i--) {
            int v = order[i];
            if (comp[v] == -1) dfs2(v, comp_cnt++);
        }
        return comp_cnt;
    }
};
```

### TwoSAT

```cpp
struct TwoSAT {
    int n;
    vector<vector<int>> g;
    vector<int> comp, assignment;

    TwoSAT(int n = 0) { init(n); }

    void init(int n_) {
        n = n_;
        g.assign(2 * n, {});
    }

    int id(int var, int val) { // val: 0 = false, 1 = true
        return var * 2 + val;
    }

    int neg(int x) { return x ^ 1; }

    void add_implication(int x, int y) {
        g[x].push_back(y);
    }

    // (x_var == x_val) OR (y_var == y_val)
    void add_or(int x_var, int x_val, int y_var, int y_val) {
        int a = id(x_var, x_val);
        int b = id(y_var, y_val);
        add_implication(neg(a), b);
        add_implication(neg(b), a);
    }

    // x_var == y_var (both same value)
    void add_equal(int x_var, int y_var) {
        add_or(x_var, 0, y_var, 1); // (!x ∨ y)
        add_or(x_var, 1, y_var, 0); // (x ∨ !y)
    }

    // x_var != y_var (opposite values)
    void add_neq(int x_var, int y_var) {
        add_or(x_var, 1, y_var, 1); // (x ∨ y)
        add_or(x_var, 0, y_var, 0); // (!x ∨ !y)
    }

    bool solve() {
        int N = 2 * n;
        vector<vector<int>> gr(N);
        for (int v = 0; v < N; v++)
            for (int to : g[v]) gr[to].push_back(v);

        vector<int> used(N, 0);
        vector<int> order;
        order.reserve(N);

        function<void(int)> dfs1 = [&](int v) {
            used[v] = 1;
            for (int to : g[v]) if (!used[to]) dfs1(to);
            order.push_back(v);
        };

        for (int i = 0; i < N; i++) if (!used[i]) dfs1(i);

        comp.assign(N, -1);
        int j = 0;

        function<void(int, int)> dfs2 = [&](int v, int c) {
            comp[v] = c;
            for (int to : gr[v]) if (comp[to] == -1) dfs2(to, c);
        };

        for (int i = N - 1; i >= 0; i--) {
            int v = order[i];
            if (comp[v] == -1) dfs2(v, j++);
        }

        assignment.assign(n, 0);
        for (int v = 0; v < n; v++) {
            if (comp[2 * v] == comp[2 * v + 1]) return false;
            assignment[v] = comp[2 * v] < comp[2 * v + 1] ? 1 : 0;
        }
        return true;
    }
};
```

---

## 7) Common 2-SAT Clause Patterns

| Constraint | Meaning | Clause(s) | Helper |
|------------|---------|-----------|--------|
| $(a \lor b)$ | At least one is true | $(\neg a \to b) \land (\neg b \to a)$ | `add_or(x, 1, y, 1)` |
| $(\neg a \lor \neg b)$ | Not both true | $(a \to \neg b) \land (b \to \neg a)$ | `add_or(x, 0, y, 0)` |
| $a = b$ | Both same value | $(\neg a \lor b) \land (a \lor \neg b)$ | `add_equal(x, y)` |
| $a \ne b$ | Opposite values | $(a \lor b) \land (\neg a \lor \neg b)$ | `add_neq(x, y)` |
| $a \to b$ | If a then b | $\neg a \lor b$ | `add_implication(id(x,1), id(y,1))` |
| $a \oplus b$ | XOR (exactly one) | $(a \lor b) \land (\neg a \lor \neg b)$ | Same as `add_neq` |

---

## 8) Worked Examples

### Checkposts – Codeforces 427C

**Problem:** Directed graph, each vertex has cost. Place checkposts so every SCC has at least one. Output min cost + number of ways.

**Why SCC:** Inside an SCC, one checkpost covers all vertices. Pick min-cost vertex per SCC, count ways.

**Complexity:** $O(n + m)$.

```cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct SCC {
    int n;
    vector<vector<int>> g, gr;
    vector<int> comp, order;
    vector<int> used;
    int comp_cnt;

    SCC(int n) : n(n), g(n), gr(n), comp(n, -1), used(n, 0), comp_cnt(0) {}

    void add_edge(int u, int v) {
        g[u].push_back(v);
        gr[v].push_back(u);
    }

    void dfs1(int v) {
        used[v] = 1;
        for (int to : g[v]) if (!used[to]) dfs1(to);
        order.push_back(v);
    }

    void dfs2(int v, int c) {
        comp[v] = c;
        for (int to : gr[v]) if (comp[to] == -1) dfs2(to, c);
    }

    int build() {
        order.clear();
        fill(used.begin(), used.end(), 0);
        for (int i = 0; i < n; i++) if (!used[i]) dfs1(i);
        fill(comp.begin(), comp.end(), -1);
        comp_cnt = 0;
        for (int i = n - 1; i >= 0; i--) {
            int v = order[i];
            if (comp[v] == -1) dfs2(v, comp_cnt++);
        }
        return comp_cnt;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n; cin >> n;
    vector<int> cost(n);
    for (int i = 0; i < n; i++) cin >> cost[i];

    int m; cin >> m;
    SCC scc(n);
    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        --u; --v;
        scc.add_edge(u, v);
    }

    int comps = scc.build();

    const ll INF = (ll)4e18;
    vector<ll> mn(comps, INF), cnt(comps, 0);

    for (int v = 0; v < n; v++) {
        int c = scc.comp[v];
        if (cost[v] < mn[c]) {
            mn[c] = cost[v];
            cnt[c] = 1;
        } else if (cost[v] == mn[c]) {
            cnt[c]++;
        }
    }

    const ll MOD = 1000000007;
    ll sum = 0, ways = 1;
    for (int c = 0; c < comps; c++) {
        sum += mn[c];
        ways = (ways * cnt[c]) % MOD;
    }

    cout << sum << " " << ways << "\n";
    return 0;
}
```

---

### Endless Walk – AtCoder ABC 245 F

**Problem:** Count vertices that can start an infinite walk in a directed graph.

**Why SCC:** Infinite walk = eventually loop. SCCs with size $> 1$ or self-loops contain cycles. Any vertex that can reach such an SCC can walk forever.

**Complexity:** $O(n + m)$.

```cpp
#include <bits/stdc++.h>
using namespace std;

struct SCC {
    int n;
    vector<vector<int>> g, gr;
    vector<int> comp, order;
    vector<int> used;
    int comp_cnt;

    SCC(int n) : n(n), g(n), gr(n), comp(n, -1), used(n, 0), comp_cnt(0) {}

    void add_edge(int u, int v) {
        g[u].push_back(v);
        gr[v].push_back(u);
    }

    void dfs1(int v) {
        used[v] = 1;
        for (int to : g[v]) if (!used[to]) dfs1(to);
        order.push_back(v);
    }

    void dfs2(int v, int c) {
        comp[v] = c;
        for (int to : gr[v]) if (comp[to] == -1) dfs2(to, c);
    }

    int build() {
        order.clear();
        fill(used.begin(), used.end(), 0);
        for (int i = 0; i < n; i++) if (!used[i]) dfs1(i);
        fill(comp.begin(), comp.end(), -1);
        comp_cnt = 0;
        for (int i = n - 1; i >= 0; i--) {
            int v = order[i];
            if (comp[v] == -1) dfs2(v, comp_cnt++);
        }
        return comp_cnt;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m; cin >> n >> m;
    SCC scc(n);
    vector<pair<int, int>> edges;
    edges.reserve(m);

    for (int i = 0; i < m; i++) {
        int u, v; cin >> u >> v;
        --u; --v;
        scc.add_edge(u, v);
        edges.push_back({u, v});
    }

    int comps = scc.build();

    vector<int> sz(comps, 0);
    for (int v = 0; v < n; v++) {
        sz[scc.comp[v]]++;
    }

    vector<vector<int>> dag(comps), rdag(comps);
    for (auto [u, v] : edges) {
        int cu = scc.comp[u];
        int cv = scc.comp[v];
        if (cu != cv) {
            dag[cu].push_back(cv);
            rdag[cv].push_back(cu);
        }
    }

    vector<int> cyc(comps, 0);
    for (int c = 0; c < comps; c++) {
        if (sz[c] > 1) cyc[c] = 1;
    }
    for (auto [u, v] : edges) {
        if (u == v) cyc[scc.comp[u]] = 1; // self-loop
    }

    vector<int> good(comps, 0);
    queue<int> q;
    for (int c = 0; c < comps; c++) {
        if (cyc[c]) {
            good[c] = 1;
            q.push(c);
        }
    }

    while (!q.empty()) {
        int c = q.front(); q.pop();
        for (int prev : rdag[c]) {
            if (!good[prev]) {
                good[prev] = 1;
                q.push(prev);
            }
        }
    }

    long long ans = 0;
    for (int v = 0; v < n; v++) {
        if (good[scc.comp[v]]) ans++;
    }

    cout << ans << "\n";
    return 0;
}
```

---

### Two SAT – AtCoder practice2 H

**Problem:** $n$ boolean variables, $m$ clauses of form $(x_i = a) \text{ OR } (x_j = b)$. Check satisfiability + output assignment.

**Why 2-SAT:** Literal 2-SAT problem.

**Complexity:** $O(n + m)$.

```cpp
#include <bits/stdc++.h>
using namespace std;

struct TwoSAT {
    int n;
    vector<vector<int>> g;
    vector<int> comp, assignment;

    TwoSAT(int n = 0) { init(n); }

    void init(int n_) {
        n = n_;
        g.assign(2 * n, {});
    }

    int id(int var, int val) { return var * 2 + val; }
    int neg(int x) { return x ^ 1; }

    void add_implication(int x, int y) {
        g[x].push_back(y);
    }

    void add_or(int x_var, int x_val, int y_var, int y_val) {
        int a = id(x_var, x_val);
        int b = id(y_var, y_val);
        add_implication(neg(a), b);
        add_implication(neg(b), a);
    }

    bool solve() {
        int N = 2 * n;
        vector<vector<int>> gr(N);
        for (int v = 0; v < N; v++)
            for (int to : g[v]) gr[to].push_back(v);

        vector<int> used(N, 0);
        vector<int> order;
        order.reserve(N);

        function<void(int)> dfs1 = [&](int v) {
            used[v] = 1;
            for (int to : g[v]) if (!used[to]) dfs1(to);
            order.push_back(v);
        };

        for (int i = 0; i < N; i++) if (!used[i]) dfs1(i);

        comp.assign(N, -1);
        int j = 0;

        function<void(int, int)> dfs2 = [&](int v, int c) {
            comp[v] = c;
            for (int to : gr[v]) if (comp[to] == -1) dfs2(to, c);
        };

        for (int i = N - 1; i >= 0; i--) {
            int v = order[i];
            if (comp[v] == -1) dfs2(v, j++);
        }

        assignment.assign(n, 0);
        for (int v = 0; v < n; v++) {
            if (comp[2 * v] == comp[2 * v + 1]) return false;
            assignment[v] = comp[2 * v] < comp[2 * v + 1] ? 1 : 0;
        }
        return true;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m; cin >> n >> m;
    TwoSAT ts(n);

    for (int k = 0; k < m; k++) {
        int i, a, j, b;
        cin >> i >> a >> j >> b;
        ts.add_or(i, a, j, b);
    }

    if (!ts.solve()) {
        cout << "s UNSATISFIABLE\n";
        return 0;
    }

    cout << "s SATISFIABLE\n";
    cout << "v ";
    for (int i = 0; i < n; i++) {
        cout << (ts.assignment[i] ? i + 1 : -(i + 1)) << " ";
    }
    cout << "0\n";
    return 0;
}
```

---

### The Door Problem – Codeforces 776D

**Problem:** $n$ doors, $m$ switches. Each door controlled by exactly 2 switches. Pressing a switch toggles all its doors. Check if there's an assignment to achieve target states.

**Why 2-SAT:** For door $i$ with switches $p, q$, final state = $s_p \oplus s_q$. Target $t_i$ gives:
- If $t_i = 0 \to s_p = s_q$ (equality)
- If $t_i = 1 \to s_p \ne s_q$ (inequality)

Use `add_equal` / `add_neq` helpers.

**Complexity:** $O(n + m)$.

```cpp
#include <bits/stdc++.h>
using namespace std;

struct TwoSAT {
    int n;
    vector<vector<int>> g;
    vector<int> comp, assignment;

    TwoSAT(int n = 0) { init(n); }

    void init(int n_) {
        n = n_;
        g.assign(2 * n, {});
    }

    int id(int var, int val) { return var * 2 + val; }
    int neg(int x) { return x ^ 1; }

    void add_implication(int x, int y) {
        g[x].push_back(y);
    }

    void add_or(int x_var, int x_val, int y_var, int y_val) {
        int a = id(x_var, x_val);
        int b = id(y_var, y_val);
        add_implication(neg(a), b);
        add_implication(neg(b), a);
    }

    void add_equal(int x_var, int y_var) {
        add_or(x_var, 0, y_var, 1);
        add_or(x_var, 1, y_var, 0);
    }

    void add_neq(int x_var, int y_var) {
        add_or(x_var, 1, y_var, 1);
        add_or(x_var, 0, y_var, 0);
    }

    bool solve() {
        int N = 2 * n;
        vector<vector<int>> gr(N);
        for (int v = 0; v < N; v++)
            for (int to : g[v]) gr[to].push_back(v);

        vector<int> used(N, 0);
        vector<int> order;
        order.reserve(N);

        function<void(int)> dfs1 = [&](int v) {
            used[v] = 1;
            for (int to : g[v]) if (!used[to]) dfs1(to);
            order.push_back(v);
        };

        for (int i = 0; i < N; i++) if (!used[i]) dfs1(i);

        comp.assign(N, -1);
        int j = 0;

        function<void(int, int)> dfs2 = [&](int v, int c) {
            comp[v] = c;
            for (int to : gr[v]) if (comp[to] == -1) dfs2(to, c);
        };

        for (int i = N - 1; i >= 0; i--) {
            int v = order[i];
            if (comp[v] == -1) dfs2(v, j++);
        }

        assignment.assign(n, 0);
        for (int v = 0; v < n; v++) {
            if (comp[2 * v] == comp[2 * v + 1]) return false;
            assignment[v] = comp[2 * v] < comp[2 * v + 1] ? 1 : 0;
        }
        return true;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m; cin >> n >> m;
    vector<int> target(n);
    for (int i = 0; i < n; i++) cin >> target[i];

    vector<pair<int, int>> door_sw(n, {-1, -1});

    for (int sw = 0; sw < m; sw++) {
        int k; cin >> k;
        while (k--) {
            int d; cin >> d; --d;
            if (door_sw[d].first == -1) door_sw[d].first = sw;
            else door_sw[d].second = sw;
        }
    }

    TwoSAT ts(m);

    for (int i = 0; i < n; i++) {
        int p = door_sw[i].first;
        int q = door_sw[i].second;
        int t = target[i];

        if (t == 0) {
            ts.add_equal(p, q);
        } else {
            ts.add_neq(p, q);
        }
    }

    if (!ts.solve()) {
        cout << "NO\n";
    } else {
        cout << "YES\n";
    }

    return 0;
}
```

---

## 9) Common Pitfalls

* **Not clearing graph / arrays between test cases.**
* **Stack overflow** from deep recursion on large graphs—bump stack limit (`ulimit -s unlimited` on local) or use iterative DFS.
* **Undirected cycle detection:** Forgetting to check `to $\ne$ parent` when seeing visited node.
* **Kosaraju:** Mixing up original / reversed graphs, or forgetting to reset `used` array.
* **2-SAT literal mapping:** Messing up `id(var, val)` / `neg(x)` and silently breaking implications.
* **2-SAT clauses:** For $(a \lor b)$, adding only one implication instead of both.
* **Self-loops / isolated nodes:** Not handling edge cases (isolated = size-1 SCC with no edges, self-loop = size-1 SCC with cycle).
* **Multiedges in undirected graphs:** If counting edges matters, use `multiset` or check carefully.

---

## 10) TLDR

* **Undirected CC / cycles** = DFS/BFS or DSU for offline queries.
* **Directed "mutually reachable" / "infinite walks"** = SCC + condensation.
* **SCC** = group nodes that can reach each other; condensation DAG is where DP lives.
* **2-SAT** = each variable has 2 states + pair clauses $\to$ implication graph + SCC.
* All of this runs in **$O(n + m)$** and handles typical $2 \times 10^5$ CF / AtCoder graphs.
* Use **Kosaraju** for SCC (simpler than Tarjan).
* Use **DSU** for offline / dynamic connectivity, **DFS** for actual graph traversal.

---

## 11) Recommended Problems

* **[AtCoder practice2 G – SCC](https://atcoder.jp/contests/practice2/tasks/practice2_g)**
* **[Codeforces 427C – Checkposts](https://codeforces.com/problemset/problem/427/C)**
* **[AtCoder ABC 245 F – Endless Walk](https://atcoder.jp/contests/abc245/tasks/abc245_f)**
* **[AtCoder practice2 H – Two SAT](https://atcoder.jp/contests/practice2/tasks/practice2_h)**
* **[Codeforces 776D – The Door Problem](https://codeforces.com/problemset/problem/776/D)**
* **[Codeforces 468B – Two Sets](https://codeforces.com/problemset/problem/468/B)**
* **[Codeforces 2-SAT tag – extra reps](https://codeforces.com/problemset?tags=2-sat)**

---