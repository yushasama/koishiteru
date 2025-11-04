# Greedy III - Incremental

So this is our third member of the Greedy Family, incremental. You build the solution step by step by always adding the cheapest valid piece right now. Priority queues, BFS, and DSU will hard carry you. If a piece creates a cycle or violates safety, skip it.

---

## 0) Core Definitions

**Incremental Construction Greedy**  
Build a global structure by repeatedly extracting the minimum key element that is safe to add. Safety is a local predicate that guarantees global optimality when it holds.

**Safe Edge (MST)**  
An edge that can be added to some MST regardless of future choices. By the cut property, the cheapest edge crossing any cut is safe.

**Relaxation (SSSP)**  
Try to improve a tentative distance of a neighbor through the current node. In Dijkstra with nonnegative weights, when a node leaves the min-heap, its label is final.

**Greedy Merge (Huffman Pattern)**  
Combine the two smallest components, pay their sum, and push back the merged weight. This is Huffman coding and stick divisions.

---

## 1) Constraints

- Graphs: $n \le 2 \cdot 10^5$, $m \le 2 \cdot 10^5$
- Kruskal: sort edges $O(m \log m)$, DSU ops $O(\alpha(n))$
- Prim on adjacency lists: $O(m \log n)$
- Dijkstra with binary heap and nonnegative weights: $O((n + m)\log n)$
- 0-1 BFS: $O(n + m)$ for weights in $\{0,1\}$
- Greedy merge with heap: $O(n \log n)$
- Use 64-bit for weights and totals

When to use: objective is additive and local safety implies global safety. Examples: cut property for MST, label-setting for SSSP, additive merge costs.

When it fails and why:
- Negative edges with Dijkstra. Label-setting breaks. Use Bellman-Ford or 0-1 BFS for $\{0,1\}$ weights.
- MST variants with nonadditive or side constraints. Cheapest-across-cut may not be safe.
- Merge cost not linear in the sum. Two-smallest-first can be wrong.

---

## 2) Theory Bridge

**Cut Property**  
For any partition of vertices $S \mid \bar S$ in a connected graph, the minimum-weight edge crossing the cut is contained in some MST. Therefore, repeatedly adding the cheapest non-cycling edge (Kruskal) or the cheapest edge from the current tree to outside (Prim) is safe.

**Label-Setting Property**  
In graphs with $w_e \ge 0$, Dijkstra maintains that the popped node $u$ has the smallest possible $dist[u]$ among all remaining nodes. Any future path to $u$ would have to pass through a node with distance no smaller than $dist[u]$, so $dist[u]$ is final.

**Huffman Optimality**  
For a multiset of weights $a_i$ with merge cost equal to the sum at each merge, always merging the two smallest minimizes total cost. A two-exchange argument shows any schedule that merges a larger item earlier can be improved by swapping with a smaller one.

---

## 3) Spotting the Model

| Trigger phrase | Technique |
|:--|:--|
| Connect all nodes with minimum total cost | Kruskal or Prim (MST) |
| Shortest path with nonnegative weights | Dijkstra with PQ |
| Weights are only 0 or 1 | 0-1 BFS |
| Cost to merge items equals pair sum | Greedy merge (Huffman pattern) |
| Add edges while avoiding cycles | Kruskal + DSU |
| Grow a component by nearest neighbor | Prim with PQ |

---

## 4) Shapes and Models

| Type | How to tell | Output | Solver | Complexity | Notes |
|:--|:--|:--|:--|:--|:--|
| MST by Kruskal | edge list, undirected | total weight or edges | sort edges + DSU | $O(m \log m)$ | Simple and fast on sparse graphs |
| MST by Prim | adjacency graph, connected | total weight or edges | min-heap frontier | $O(m \log n)$ | Good on adjacency lists |
| Dijkstra SSSP | $w_e \ge 0$ | distances and optional path | PQ relaxations | $O((n+m)\log n)$ | Do not use with negatives |
| 0-1 BFS | weights in $\{0,1\}$ | distances | deque push front/back | $O(n+m)$ | Beats Dijkstra here |
| Greedy Merge | merge cost is additive | minimal total cost | min-heap pairwise | $O(n \log n)$ | Stick divisions, Huffman |

---

## 5) Algorithms

### **Kruskal MST**  
Sort edges by weight. Scan in ascending order and unite endpoints that are in different DSU components. Add the weight. Stop after $n-1$ accepted edges.

### **Prim MST**  
Pick a start node. Maintain a min-heap of crossing edges to unvisited nodes. Repeatedly pop the smallest edge to a new node, add it, and push its outgoing edges.

### **Dijkstra**  
Set $dist[s]=0$. Pop nodes in increasing distance, skipping stale entries. For each neighbor, relax $dist[v] = \min(dist[v], dist[u]+w)$ and push if improved. Record parents if you need the path.

### **0-1 BFS**  
Same goal as Dijkstra but specialized for $w \in \{0,1\}$. Use a deque. Push front for weight 0 edges, push back for weight 1 edges.

### **Greedy Merge (Huffman Pattern)**  
Push all weights to a min-heap. While size $> 1$, pop two smallest $x, y$, pay $x+y$, and push $x+y$ back. Sum the paid merges.

**Note:**  
In my personal opinion, it's $\max \mathbb{E}[V]$ to learn **Kruskal's** over **Prim's** for the DSU payoff.

DSU shows up everywhere: **Union-Find**, **Offline LCA**, **Merging Components**, and **Mo's Algorithm with Merges**.  

You can always convert a Prim's canonical adjacency list or matrix into Kruskal's canonical edge list:

```cpp
vector<tuple<int,int,int>> edges;

for (int u = 0; u < n; ++u) {
  for (auto [v, w] : adj[u]) {
    if (u < v) edges.push_back({w, u, v});
  }
}
```

---

## 6) Templates

### **DSU: Disjoint Set Union (Union by Size, Path Compression)**

**Complexity:** $O(\alpha(n))$ per op

```cpp
#include <bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> e;

    DSU(int n) : e(n, -1) {}

    int find(int x) {
        return e[x] < 0 ? x : e[x] = find(e[x]);
    }

    bool unite(int x, int y) {
        x = find(x);
        y = find(y);
        if (x == y) return false;

        if (e[x] > e[y]) swap(x, y);
        e[x] += e[y];
        e[y] = x;
        return true;
    }

    int size(int x) {
        return -e[find(x)];
    }
};
```

---

### **Kruskal MST: Minimum Spanning Tree**

**Complexity:** $O(m \log m)$

```cpp
#include <bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> e;

    DSU(int n) : e(n, -1) {}

    int find(int x) {
        return e[x] < 0 ? x : e[x] = find(e[x]);
    }
    
    bool unite(int a, int b) {
        a = find(a);
        b = find(b);
        if (a == b) return false;

        if (e[a] > e[b]) swap(a, b);
        e[a] += e[b];
        e[b] = a;
        return true;
    }
};


long long kruskal_mst(int n, vector<tuple<int, int, long long>> &edges) {
    sort(edges.begin(), edges.end(),
         [](const auto &A, const auto &B) {
             return get<2>(A) < get<2>(B);
         });

    DSU dsu(n);
    long long total = 0;
    int used = 0;

    for (auto &e : edges) {
        int u = get<0>(e);
        int v = get<1>(e);
        long long w = get<2>(e);

        if (dsu.unite(u, v)) {
            total += w;
            if (++used == n - 1) break;
        }
    }

    return used == n - 1 ? total : -1;
}
```

---

### **Prim MST: Adjacency List Version**

**Complexity:** $O(m \log n)$

```cpp
#include <bits/stdc++.h>
using namespace std;

long long prim_mst(int n, const vector<vector<pair<int, int>>> &adj, int start = 0) {
    vector<bool> vis(n, false);
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<>> pq;

    vis[start] = true;
    for (auto [v, w] : adj[start]) {
        pq.push({w, v});
    }

    long long total = 0;
    int taken = 0;

    while (!pq.empty() && taken < n - 1) {
        auto [w, u] = pq.top();
        pq.pop();

        if (vis[u]) continue;

        vis[u] = true;
        total += w;
        ++taken;

        for (auto [v, wt] : adj[u]) {
            if (!vis[v]) {
                pq.push({wt, v});
            }
        }
    }

    if (taken != n - 1) return -1;
    return total;
}
```

---

### **Dijkstra: Shortest Paths With Parent Restore**

**Complexity:** $O((n+m)\log n)$

```cpp
#include <bits/stdc++.h>
using namespace std;

const long long INF = 1e18;


pair<vector<long long>, vector<int>>
dijkstra(int n, int src, const vector<vector<pair<int, int>>> &adj) {
    vector<long long> dist(n, INF);
    vector<int> par(n, -1);
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;

    dist[src] = 0;
    pq.push({0, src});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d != dist[u]) continue;

        for (auto [v, w] : adj[u]) {
            long long nd = d + w;

            if (nd < dist[v]) {
                dist[v] = nd;
                par[v] = u;
                pq.push({nd, v});
            }
        }
    }

    return {dist, par};
}


vector<int> restore_path(int target, const vector<int> &par) {
    vector<int> path;

    for (int v = target; v != -1; v = par[v]) {
        path.push_back(v);
    }

    reverse(path.begin(), path.end());
    return path;
}
```

---

### **0-1 BFS: Deque Implementation**

**Complexity:** $O(n+m)$

```cpp
#include <bits/stdc++.h>
using namespace std;

const long long INF = 1e18;


vector<long long> zero_one_bfs(int n, int src, const vector<vector<pair<int, int>>> &adj) {
    deque<int> dq;
    vector<long long> dist(n, INF);

    dist[src] = 0;
    dq.push_front(src);

    while (!dq.empty()) {
        int u = dq.front();
        dq.pop_front();

        for (auto [v, w] : adj[u]) {
            long long nd = dist[u] + w;

            if (nd < dist[v]) {
                dist[v] = nd;

                if (w == 0) dq.push_front(v);
                else dq.push_back(v);
            }
        }
    }

    return dist;
}
```

---

### **Greedy Merge: Minimal Total Merge Cost (Huffman)**

**Complexity:** $O(n \log n)$

```cpp
#include <bits/stdc++.h>
using namespace std;

long long huffman_min_cost(const vector<long long> &freq) {
    priority_queue<long long, vector<long long>, greater<long long>> pq(freq.begin(), freq.end());

    if (pq.size() <= 1) return 0;

    long long total = 0;

    while (pq.size() > 1) {
        long long a = pq.top(); pq.pop();
        long long b = pq.top(); pq.pop();

        long long merged = a + b;
        total += merged;
        pq.push(merged);
    }

    return total;
}
```

---

## 7) Worked Examples

### **Stick Divisions - CSES**

#### **Problem**
Given $n$ stick lengths, repeatedly join any two sticks into one with cost equal to their sum. Output the minimal total cost.

#### **Why Incremental Construction**
Merge cost is additive. Merging the two smallest first minimizes cascading cost. This is the Huffman pattern.

#### **Complexity**
$O(n \log n)$ for the min-heap.

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;

    priority_queue<long long, vector<long long>, greater<long long>> pq;

    for (int i = 0; i < n; ++i) {
        long long x;
        cin >> x;
        pq.push(x);
    }

    long long ans = 0;

    while (pq.size() > 1) {
        long long a = pq.top(); pq.pop();
        long long b = pq.top(); pq.pop();

        ans += a + b;
        pq.push(a + b);
    }

    cout << ans << "\n";
}
```

---

### **Road Reparation - CSES**

#### **Problem**
Given $n$ cities and $m$ roads with costs, connect all cities with minimum total repair cost or print IMPOSSIBLE.

#### **Why Incremental Construction**
This is MST. Add the cheapest edges that do not create a cycle. DSU enforces the cycle check.

#### **Complexity**
$O(m \log m)$ for sorting. DSU operations are near constant.

```cpp
#include <bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> e;

    DSU(int n) : e(n, -1) {}

    int find(int x) {
        return e[x] < 0 ? x : e[x] = find(e[x]);
    }

    bool unite(int a, int b) {
        a = find(a);
        b = find(b);
        if (a == b) return false;

        if (e[a] > e[b]) swap(a, b);
        e[a] += e[b];
        e[b] = a;
        return true;
    }
};


int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;

    vector<tuple<int, int, long long>> edges;
    edges.reserve(m);

    for (int i = 0; i < m; ++i) {
        int u, v;
        long long w;
        cin >> u >> v >> w;
        --u; --v;
        edges.emplace_back(u, v, w);
    }

    sort(edges.begin(), edges.end(),
         [](const auto &A, const auto &B) {
             return get<2>(A) < get<2>(B);
         });

    DSU dsu(n);
    long long total = 0;
    int used = 0;

    for (auto &e : edges) {
        int u = get<0>(e);
        int v = get<1>(e);
        long long w = get<2>(e);

        if (dsu.unite(u, v)) {
            total += w;
            if (++used == n - 1) break;
        }
    }

    if (used != n - 1) {
        cout << "IMPOSSIBLE\n";
    } else {
        cout << total << "\n";
    }
}
```

---

### **Dijkstra? - Codeforces 20C**

#### **Problem**
Find the shortest path from node 1 to node $n$ in an undirected graph with nonnegative weights. Print the path or -1 if unreachable.

#### **Why Incremental Construction**
Nonnegative weights allow Dijkstra. Every heap pop finalizes a label. Relax edges and store parents to reconstruct the path.

#### **Complexity**
$O((n + m)\log n)$ with a binary heap.

```cpp
#include <bits/stdc++.h>
using namespace std;

const long long INF = 1e18;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;

    vector<vector<pair<int, int>>> adj(n + 1);

    for (int i = 0; i < m; ++i) {
        int u, v, w;
        cin >> u >> v >> w;
        adj[u].push_back({v, w});
        adj[v].push_back({u, w});
    }

    vector<long long> dist(n + 1, INF);
    vector<int> par(n + 1, -1);
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<>> pq;

    dist[1] = 0;
    pq.push({0, 1});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d != dist[u]) continue;

        for (auto [v, w] : adj[u]) {
            long long nd = d + w;

            if (nd < dist[v]) {
                dist[v] = nd;
                par[v] = u;
                pq.push({nd, v});
            }
        }
    }

    if (dist[n] == INF) {
        cout << -1 << "\n";
        return 0;
    }

    vector<int> path;
    for (int v = n; v != -1; v = par[v]) {
        path.push_back(v);
    }
    reverse(path.begin(), path.end());

    for (int i = 0; i < (int)path.size(); ++i) {
        cout << path[i] << (i + 1 == (int)path.size() ? '\n' : ' ');
    }
}
```

---

### **Minimum Cost to Connect Sticks - LeetCode 1167**

#### **Problem**
Given a multiset of stick lengths, repeatedly connect any two sticks. Connecting sticks of lengths $a$ and $b$ costs $a + b$. Return the minimal total cost to connect all sticks.

#### **Why Incremental Construction**
This is the Huffman merge. Pair the two smallest every time to minimize future cost accumulation.

#### **Complexity**
$O(n \log n)$ via a min-heap.

```cpp
#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int connectSticks(vector<int>& sticks) {
        priority_queue<long long, vector<long long>, greater<long long>> pq;

        for (int x : sticks) pq.push(x);
        if (pq.size() <= 1) return 0;

        long long total = 0;

        while (pq.size() > 1) {
            long long a = pq.top(); pq.pop();
            long long b = pq.top(); pq.pop();

            long long c = a + b;
            total += c;
            pq.push(c);
        }

        return (int)total;
    }
};
```

---

## 8) Common Pitfalls

- **Dijkstra with negative edges**  
  Why: label-setting fails.  
  Avoid: use Bellman-Ford or 0-1 BFS for 0-1 weights.

- **Dijkstra on $\{0,1\}$ weights**  
  Why: slower than necessary.  
  Avoid: use 0-1 BFS in $O(n+m)$.

- **MST without connectivity check**  
  Why: accepted edges fewer than $n-1$ on a disconnected graph.  
  Avoid: check union count, print IMPOSSIBLE.

- **Overflow on totals**  
  Why: sums and distances exceed 32-bit.  
  Avoid: use long long for weights and totals.

- **Stale PQ entries in Dijkstra**  
  Why: earlier heap entries become outdated after improvements.  
  Avoid: skip if popped distance does not match the stored label.

- **Prim pushes to visited nodes**  
  Why: no visited check before pushing or when popping.  
  Avoid: maintain visited array and ignore visited endpoints.

- **Kruskal without early stop**  
  Why: extra work and risk of bugs after the MST is complete.  
  Avoid: break once you have $n-1$ edges.

---

## 9) TLDR

- MST: add the cheapest edge that does not create a cycle. Kruskal uses sort plus DSU. Prim grows a frontier with a min-heap.  
- Dijkstra: nonnegative weights only. Popped node is final. Relax neighbors and store parents.  
- 0-1 BFS: if weights are 0 or 1, use deque for $O(n+m)$.  
- Greedy merge: if the merge cost is the sum, always combine the two smallest.  
- Complexity is driven by sorting and priority queues: $O(m \log m)$ or $O((n+m)\log n)$, and $O(n+m)$ for 0-1 BFS.  
- Use long long everywhere for weights and totals.  
- If local choices can re-rank future options globally, this family does not apply.

---

## 10) Recommended Problems

* [CSES - Stick Divisions](https://cses.fi/problemset/task/1161/)
* [CSES - Road Reparation](https://cses.fi/problemset/task/1675/)
* [CSES - Shortest Routes I](https://cses.fi/problemset/task/1671/)
* [Codeforces 20C - Dijkstra?](https://codeforces.com/problemset/problem/20/C)
* [Codeforces 609E - Minimum Spanning Tree for Each Edge](https://codeforces.com/problemset/problem/609/E)
* [AtCoder ABC 252 F - Bread](https://atcoder.jp/contests/abc252/tasks/abc252_f)
* [LeetCode 1167 - Minimum Cost to Connect Sticks](https://leetcode.com/problems/minimum-cost-to-connect-sticks/)
* [Yosupo - Minimum Spanning Tree](https://judge.yosupo.jp/problem/minimum_spanning_tree)

---

## Glossary

- **DSU**: disjoint set union with path compression and union by size. $find$ flattens paths, $unite$ joins by size.  
- **Cut property**: cheapest edge crossing any cut is safe to add in MST.  
- **Label-setting**: in Dijkstra with $w_e \ge 0$, a popped node's distance is final.  
- **Relaxation**: attempt to lower a tentative distance via an edge.  
- **0-1 BFS**: shortest paths on $\{0,1\}$ weights using a deque; push front for 0, back for 1.  
- **Stale entry**: heap entry whose key no longer matches the current label. Always skip.  
- **Frontier**: set of edges from the built component to unvisited nodes in Prim.  
- **Huffman merge**: always combine two smallest weights; total cost equals sum of all intermediate merges.