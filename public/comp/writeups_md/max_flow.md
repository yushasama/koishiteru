# Flowing Into Higher Elo

## What is Max Flow?

Flow is the go-to model for "push as much as you can" in a graph. You have a source $s$, a sink $t$, and capacities on edges. With this lens you solve throughput, blocking, pairing, disjoint paths, and "cheapest way to send $K$" tasks.

In practice, use **Dinic** for max flow and matching, and add **MCMF** (Min-Cost Max Flow) when the statement cares about cost. This combo handles the vast majority of flow problems you'll see in contests.

Though flow problems aren't as common as some other topics, when they appear, they act as gatekeepers. If you know how to model and implement flow, it's free elo.

---

## 0) Core Definitions

**Flow network.**  
A directed graph with source $s$, sink $t$, and non-negative capacities $c(u,v)$. A flow $f$ obeys $0 \le f(u,v) \le c(u,v)$, and at every internal node the inflow equals the outflow (conservation).

**Residual graph.**  
For each edge $(u,v)$ with flow $f(u,v)$, the residual has a forward capacity $c(u,v) - f(u,v)$ and a backward capacity $f(u,v)$. All flow algorithms work on this residual graph.

**Augmenting path.**  
Any $s \to t$ path in the residual where all residual capacities are positive. Push the bottleneck (minimum capacity on path) along that path, update residuals, repeat until no augmenting path remains.

**Max-Flow = Min-Cut.**  
The maximum $s \to t$ flow equals the minimum total capacity of edges whose removal separates $s$ from $t$. This is why "send" and "block" are two faces of the same problem.

---

## 1) What To Keep In Mind

* **Constraints**
  * $V \approx 10^5$, $E \approx 2 \times 10^5$, unit capacities → Dinic is usually fine.
  * Dense graphs or MCMF with costs → expect much smaller inputs ($V, E \le 10^3$ often).
  * Capacities are integers in most CP problems. Use 64-bit where sums can grow large.

* **Time Complexity**
  * **Ford-Fulkerson:** $O(E \cdot f_{\max})$ where $f_{\max}$ is max flow value. Can be exponential on pathological inputs (e.g., zig-zag graph). **Use only for theory or tiny inputs.**
  * **Edmonds-Karp:** $O(VE^2)$ (uses BFS for augmenting paths). Predictable but slow on larger graphs.
  * **Dinic:** $O(V^2 E)$ in general, $O(E\sqrt{V})$ for unit capacity, $O(E \min(V^{2/3}, \sqrt{E}))$ for unit capacity bipartite matching. **Use this as your default.**
  * **MCMF (with Dijkstra + potentials):** $O(fVE \log V)$ where $f$ is the flow amount. Slower than Dinic, use only when costs matter.

* **Memory**
  * Residual graphs keep a reverse edge for every edge, so budget about $2E$ edges in adjacency lists.

* **Modeling tips**
  * **Node capacity:** Split $v$ into $v_{\text{in}}$ and $v_{\text{out}}$ with an internal edge of capacity $k$. Replace all incoming edges to go to $v_{\text{in}}$ and all outgoing to come from $v_{\text{out}}$.
  * **Bipartition from arbitrary graph:** 2-color by BFS or DFS. If the graph is not bipartite (odd cycle exists), flow matching won't work as intended.
  * **Bipartition on grid:** Parity like $(r+c) \bmod 2$ or column parity is a quick special case.

* **Output recovery**
  * **Min cut:** After max flow, run BFS/DFS from $s$ in the final residual to find all reachable nodes. Edges from reachable to unreachable form a min cut.
  * **Matching pairs:** Edges $u \to v$ (Left $\to$ Right) with flow 1 are your matched pairs.

---

## 2) Bipartite Dualities - Minimum Vertex Cover and Maximum Independent Set

**What they are.**  
A **vertex cover** $C$ is a set of vertices that touches every edge. Think: "put a guard on some intersections so every road has a guard at one end." The **minimum vertex cover** is a cover with the smallest possible size.

An **independent set** $I$ is a set of vertices with **no** edges inside. Think: "pick as many intersections as possible so no two chosen ones are connected." The **maximum independent set** is an independent set with the largest possible size.

### **König's Theorem (Bipartite)**

In any bipartite graph $G = (U \cup V, E)$:

$$
|\text{Minimum Vertex Cover}| = |\text{Maximum Matching}| = \nu(G)
$$

---

### **Dual Relationship**

In any graph:

$$
\text{Maximum Independent Set} = \text{All Vertices} - \text{Minimum Vertex Cover}
$$

Then by **König's theorem** (in bipartite graphs, minimum vertex cover equals maximum matching):

$$
\boxed{\text{Maximum Independent Set} = |U| + |V| - \nu(G)}
$$

That's why in bipartite graphs, once you find the **maximum matching**, you immediately know the size of the **maximum independent set**. It's simply all the vertices *not used up* by the cover induced by the matching.

### What this means in practice (tiny example)

Let $U = \{u_1, u_2\}$, $V = \{v_1, v_2, v_3\}$. Edges:  
$u_1\text{-}v_1$, $u_1\text{-}v_2$, $u_2\text{-}v_2$, $u_2\text{-}v_3$.

- A **maximum matching** has size $\nu(G)=2$, for example $\{(u_1,v_1), (u_2,v_3)\}$.
- A **minimum vertex cover** has size 2. One valid cover is $\{u_1, u_2\}$: every edge touches either $u_1$ or $u_2$.
- A **maximum independent set** then has size $|U|+|V|-\nu(G) = 5 - 2 = 3$. One example is $\{v_1, v_2, v_3\}$ (no edges inside $V$ itself).

**How to construct the minimum vertex cover after max matching (flow view).**  
Build the standard matching network $s \to U \to V \to t$ with unit capacities and run **Dinic**. In the final residual graph:

1. Start from all **unmatched** vertices in $U$.
2. Traverse alternating residual edges: unsaturated $U \to V$ forward, saturated $V \to U$ backward.
3. Let the visited sets be $Z_U \subseteq U$ and $Z_V \subseteq V$.

Then a minimum vertex cover is $(U \setminus Z_U) \cup Z_V$. The complement is a maximum independent set.

**Problem-style intuition.**  
- **Minimum vertex cover** is "pick the smallest set of vertices so every edge is blocked by at least one chosen endpoint." In a classroom seating or cheating-edge model, that is the fewest seats you would mark as "occupied or blocked" so no cheating pair remains active.
- **Maximum independent set** is "pick the largest set of vertices with zero conflicts." In that same seating model, it is the most students you can place so that no two can see each other. On bipartite graphs, compute a max matching, then use $|V| - \nu(G)$ to get the count directly.

---

## 3) Spotting a Flow Problem - Keyword Scan

### Max Flow
- Send as many as possible
- Maximize throughput
- Network bottleneck

### Min Cut
- Fewest roads to close so $s$ cannot reach $t$
- Minimum capacity to block all routes
- Separate A from B with a minimal cut

### Bipartite Matching
- Pair left with right
- Assign workers to tasks
- Maximum number of compatible pairs

### Node Capacity
- Each vertex can be used at most $k$ times
- Each station can process at most $k$ units

### Edge-Disjoint Paths
- Find $k$ paths that do not share edges
- Flow per edge has a max capacity of 1

### Vertex-Disjoint Paths
- Find $k$ paths that do not share vertices (except $s$ and $t$)

### Min-Cost Max Flow
- Send $K$ units with minimum total cost
- Cost per edge, minimize price or penalty

### Circulation with Demands
- Supplies and demands at nodes
- Lower bounds on edges
- Feasible flow that satisfies all balance constraints

---

## 4) Modeling Space

**Bipartite matching.**  
Shape: $s \to$ Left $\to$ Right $\to t$.

Add $s \to u$ (cap 1) for each $u \in$ Left, $u \to v$ (cap 1) for allowed pairs, and $v \to t$ (cap 1) for each $v \in$ Right. Run Dinic. Pairs are edges $u \to v$ with flow 1.

To create the bipartition from an arbitrary graph, 2-color by BFS or DFS. If an odd cycle exists, the graph is not bipartite. On grids, parity like $(r+c) \bmod 2$ or column parity is a fast special case.

**Node capacity.**  
If a vertex $v$ has capacity $k$, split it into $v_{\text{in}}$ and $v_{\text{out}}$, add $v_{\text{in}} \to v_{\text{out}}$ with capacity $k$. Replace each original edge $(u,v)$ with $(u_{\text{out}}, v_{\text{in}})$, and each edge $(v, w)$ with $(v_{\text{out}}, w_{\text{in}})$. Run Dinic.

**Edge-disjoint and vertex-disjoint paths.**  
**Edge-disjoint:** Set every edge capacity to 1 and run Dinic. Max flow value equals the maximum number of edge-disjoint $s$-$t$ paths.

**Vertex-disjoint:** Apply node-split with internal capacity 1 to all vertices except $s$ and $t$, then run Dinic. Max flow equals the maximum number of vertex-disjoint $s$-$t$ paths.

**Min-cost assignments and routing.**  
Attach costs to edges in the same network shapes and run **MCMF** to send the required amount with minimum total cost. Use Dijkstra with potentials for non-negative reduced costs (requires no negative cycles).

**Circulation with demands and lower bounds.**  
1. Reserve lower bounds on edges (reduce capacity by lower bound, adjust node balances).
2. Add a super-source $S$ and super-sink $T$. Connect $S$ to nodes with deficit (demand > supply) with capacity = deficit. Connect nodes with surplus (supply > demand) to $T$ with capacity = surplus.
3. Run Dinic (or MCMF if costs exist). Feasible if all edges from $S$ and to $T$ are saturated.

---

## 5) Algorithms and Templates

### **Ford-Fulkerson**

Find any augmenting path, push the bottleneck, repeat.

**Complexity:** $O(E \cdot f_{\max})$ where $f_{\max}$ is the max flow value. Can be exponential on adversarial inputs (e.g., zig-zag graph where capacities are chosen to force many tiny augmentations).

**When to use:** Theory purposes only. For contests, use Dinic.

```cpp
#include <bits/stdc++.h>
using namespace std;

struct FordFulkerson {
    struct Edge { int to, rev; long long cap; };
    int n; 
    vector<vector<Edge>> g;
    
    FordFulkerson(int n): n(n), g(n) {}
    
    void add_edge(int u, int v, long long c){
        Edge a{v, (int)g[v].size(), c};
        Edge b{u, (int)g[u].size(), 0};
        g[u].push_back(a); 
        g[v].push_back(b);
    }
    
    long long dfs(int u, int t, long long f, vector<int>& vis){
        if(u == t) return f;
        vis[u] = 1;
        for(auto &e : g[u]){
            if(e.cap > 0 && !vis[e.to]){
                long long pushed = dfs(e.to, t, min(f, e.cap), vis);
                if(pushed){
                    e.cap -= pushed;
                    g[e.to][e.rev].cap += pushed;
                    return pushed;
                }
            }
        }
        return 0;
    }
    
    long long maxflow(int s, int t){
        long long flow = 0;
        while(true){
            vector<int> vis(n, 0);
            long long pushed = dfs(s, t, LLONG_MAX, vis);
            if(!pushed) break;
            flow += pushed;
        }
        return flow;
    }
};
```

---

### **Edmonds-Karp**

Always take a BFS shortest augmenting path. Predictable and simple, but slow on larger graphs.

**Complexity:** $O(VE^2)$. Each BFS is $O(E)$, and there are at most $O(VE)$ augmentations.

**When to use:** Small graphs where Dinic feels like overkill. Otherwise use Dinic.

```cpp
#include <bits/stdc++.h>
using namespace std;

struct EdmondsKarp {
    struct Edge { int to, rev; long long cap; };
    int n; 
    vector<vector<Edge>> g;
    
    EdmondsKarp(int n): n(n), g(n) {}
    
    void add_edge(int u, int v, long long c){
        Edge a{v, (int)g[v].size(), c};
        Edge b{u, (int)g[u].size(), 0};
        g[u].push_back(a); 
        g[v].push_back(b);
    }
    
    long long maxflow(int s, int t){
        long long flow = 0;
        while(true){
            vector<int> pv(n, -1), pe(n, -1);
            queue<int> q; 
            q.push(s); 
            pv[s] = s;
            
            while(!q.empty() && pv[t] == -1){
                int u = q.front(); q.pop();
                for(int i = 0; i < (int)g[u].size(); ++i){
                    auto &e = g[u][i];
                    if(e.cap > 0 && pv[e.to] == -1){
                        pv[e.to] = u; 
                        pe[e.to] = i; 
                        q.push(e.to);
                        if(e.to == t) break;
                    }
                }
            }
            
            if(pv[t] == -1) break; // no augmenting path
            
            long long aug = LLONG_MAX;
            for(int v = t; v != s; v = pv[v]){
                int u = pv[v], ei = pe[v];
                aug = min(aug, g[u][ei].cap);
            }
            for(int v = t; v != s; v = pv[v]){
                int u = pv[v], ei = pe[v];
                int r = g[u][ei].rev;
                g[u][ei].cap -= aug;
                g[v][r].cap   += aug;
            }
            flow += aug;
        }
        return flow;
    }
};
```

---

### **Dinic**

Build a level graph by BFS, then push a blocking flow by DFS with a current-arc pointer. Fast in practice on sparse and unit-cap graphs.

**Complexity:** 
- General: $O(V^2 E)$
- Unit capacity: $O(E\sqrt{V})$
- Unit capacity bipartite matching: $O(E \min(V^{2/3}, \sqrt{E}))$

**When to use:** Your default max flow algorithm. Use this unless you need MCMF.

```cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;

struct Dinic {
    struct Edge {
        int v, rev;
        ll cap;
    };

    int n, s, t;
    vector<vector<Edge>> graph;
    vector<int> level, ptr;

    Dinic(int n, int s, int t) : n(n), s(s), t(t) {
        graph.assign(n, {});
        level.resize(n);
        ptr.resize(n);
    }

    void add_edge(int u, int v, ll cap) {
        Edge a{v, (int)graph[v].size(), cap};
        Edge b{u, (int)graph[u].size(), 0};
        graph[u].push_back(a);
        graph[v].push_back(b);
    }

    bool bfs() {
        fill(level.begin(), level.end(), -1);
        queue<int> q;
        q.push(s);
        level[s] = 0;

        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (auto &e : graph[u]) {
                if (e.cap > 0 && level[e.v] == -1) {
                    level[e.v] = level[u] + 1;
                    q.push(e.v);
                }
            }
        }
        return level[t] != -1;
    }

    ll dfs(int u, ll pushed) {
        if (u == t || pushed == 0) return pushed;

        for (int &cid = ptr[u]; cid < (int)graph[u].size(); ++cid) {
            Edge &e = graph[u][cid];
            if (e.cap > 0 && level[e.v] == level[u] + 1) {
                ll tr = dfs(e.v, min(pushed, e.cap));
                if (tr == 0) continue;

                e.cap -= tr;
                graph[e.v][e.rev].cap += tr;
                return tr;
            }
        }
        return 0;
    }

    ll maxFlow() {
        ll flow = 0;
        const ll INF = LLONG_MAX;

        while (bfs()) {
            fill(ptr.begin(), ptr.end(), 0);
            while (ll pushed = dfs(s, INF)) {
                flow += pushed;
            }
        }
        return flow;
    }
};
```

---

### **Min-Cost Max Flow (MCMF)**

Send a required amount while minimizing total cost. Do successive shortest augmenting paths with potentials (Johnson's algorithm style).

**Complexity:** $O(fVE \log V)$ where $f$ is the flow amount sent.

**Assumptions:** No negative cost cycles. Most CP problems guarantee this.

**When to use:** When the statement cares about minimizing cost, not just maximizing flow.

```cpp
#include <bits/stdc++.h>
using namespace std;

struct MCMF {
    struct Edge { int to, rev; long long cap, cost; };
    int n;
    vector<vector<Edge>> g;

    MCMF(int n): n(n), g(n) {}

    // Adds directed edge u->v with capacity 'cap' and cost 'cost'
    void add_edge(int u, int v, long long cap, long long cost){
        Edge a{v, (int)g[v].size(), cap,  cost};
        Edge b{u, (int)g[u].size(), 0,   -cost};
        g[u].push_back(a);
        g[v].push_back(b);
    }

    // Send up to 'need' flow from s to t, minimizing total cost.
    // Returns {flow_sent, min_total_cost}.
    // Assumes no negative cost cycles.
    pair<long long, long long> min_cost_flow(int s, int t, long long need){
        const long long INF = (1LL << 62);
        long long flow = 0, cost = 0;

        // Johnson potentials (node potentials)
        vector<long long> pot(n, 0);

        // --- Initial SPFA to handle negative costs (no negative cycles assumed) ---
        {
            vector<long long> d(n, INF);
            vector<int> inq(n, 0);
            deque<int> dq;
            d[s] = 0; dq.push_back(s); inq[s] = 1;

            while(!dq.empty()){
                int u = dq.front(); dq.pop_front(); inq[u] = 0;
                for (auto &e : g[u]){
                    if (e.cap > 0 && d[e.to] > d[u] + e.cost){
                        d[e.to] = d[u] + e.cost;
                        if(!inq[e.to]){
                            if(!dq.empty() && d[e.to] < d[dq.front()]) 
                                dq.push_front(e.to);
                            else 
                                dq.push_back(e.to);
                            inq[e.to] = 1;
                        }
                    }
                }
            }
            for(int i = 0; i < n; i++) 
                pot[i] = (d[i] == INF ? 0 : d[i]);
        }

        vector<long long> dist(n), mincap(n);
        vector<int> par_u(n), par_e(n);

        while(flow < need){
            // Dijkstra on reduced costs: c'(u,v) = c(u,v) + pot[u] - pot[v]
            fill(dist.begin(), dist.end(), INF);
            fill(par_u.begin(), par_u.end(), -1);
            fill(par_e.begin(), par_e.end(), -1);

            using P = pair<long long, int>;
            priority_queue<P, vector<P>, greater<P>> pq;
            dist[s] = 0; mincap[s] = LLONG_MAX;
            pq.push({0, s});

            while(!pq.empty()){
                auto [du, u] = pq.top(); pq.pop();
                if(du != dist[u]) continue;
                for(int i = 0; i < (int)g[u].size(); ++i){
                    Edge &e = g[u][i];
                    if(e.cap <= 0) continue;
                    long long nd = du + e.cost + pot[u] - pot[e.to];
                    if(nd < dist[e.to]){
                        dist[e.to] = nd;
                        par_u[e.to] = u;
                        par_e[e.to] = i;
                        mincap[e.to] = min(mincap[u], e.cap);
                        pq.push({nd, e.to});
                    }
                }
            }

            if(par_u[t] == -1) break; // cannot send more

            // Update potentials: ensures reduced costs stay non-negative
            for(int v = 0; v < n; ++v)
                if(dist[v] < INF) pot[v] += dist[v];

            long long add = min(mincap[t], need - flow);
            // Push along the path (also accumulate path cost safely)
            long long path_cost = 0;
            for(int v = t; v != s; v = par_u[v]){
                int u = par_u[v], i = par_e[v];
                Edge &e = g[u][i];
                Edge &r = g[v][e.rev];
                path_cost += e.cost;
                e.cap -= add;
                r.cap += add;
            }
            flow += add;
            cost += add * path_cost;
        }
        return {flow, cost};
    }
};
```

---

## 6) What to Study

After understanding flow networks, residual graphs, and augmenting paths:

1. **Learn Ford-Fulkerson and Edmonds-Karp for theory purposes only.** Understand why F-F can be exponential and why E-K is $O(VE^2)$.
2. **Master Dinic.** This is your workhorse for general max flow and bipartite matching.
3. **Add MCMF** when costs matter. This combo solves the vast majority of contest flow problems.

---

## 7) Flow Models - Patterns, Outputs, and Shapes (Cheat Sheet)

| Type | How to Tell | What to Output | Shape | Solver | Complexity | Notes |
|---|---|---|---|---|---|---|
| Max Flow | send as many as possible, throughput | max flow value, sometimes edge flows | $s \to$ network $\to t$ | Dinic | $O(V^2 E)$ general, $O(E\sqrt{V})$ unit cap | read flows from edges if needed |
| Min Cut | fewest capacity to block $s \to t$ | cut value, sometimes cut edges or partition | same build as max flow | Dinic | same | after max flow, BFS from $s$ in residual |
| Bipartite Matching | pair left with right, assignment | number of pairs, sometimes the pairs | $s \to$ Left (1) $\to$ Right (1) $\to t$ | Dinic | $O(E\sqrt{V})$ | pairs are Left$\to$Right edges with flow 1 |
| Vertex-Disjoint Paths | no two paths share a vertex | maximum count, sometimes the paths | node-split each vertex, internal cap 1 | Dinic | $O(V^2 E)$ | follow flow through split nodes |
| Edge-Disjoint Paths | no two paths share an edge | maximum count | unit capacity on each edge | Dinic | $O(E\sqrt{V})$ | straightforward unit-cap build |
| Node Capacity | each station at most $k$ | max throughput or feasibility | node-split with internal cap $k$ | Dinic | $O(V^2 E)$ | generalizes vertex-disjoint paths |
| Min-Cost Flow, Assignment | send $K$ units cheaply, cost per edge | total cost, sometimes the assignment | any of the above with costs | MCMF | $O(fVE \log V)$ | Dijkstra with potentials |
| Circulation with Demands | supplies and demands, lower bounds | feasible or not, or a feasible flow | add super-source and super-sink | Dinic or MCMF | same | feasible if all balance edges saturate |

---

## 8) Worked Example - LeetCode 1349: Maximum Students Taking Exam

### **[Problem](https://leetcode.com/problems/maximum-students-taking-exam/)**

Given a classroom grid `seats[i][j]` with `'.'` (usable) and `'#'` (broken), place as many students as possible so no two can "cheat" (conflict). A conflict edge exists between seats that are horizontally adjacent or diagonally adjacent in neighboring rows. Return the maximum number of students you can seat.

### **Model**

Build a **conflict graph** on usable seats. We want a **maximum independent set** (no edges inside). For bipartite graphs, by **König's Theorem** we have

$$\text{Maximum Independent Set} = |V| - \nu(G)$$

where $\nu(G)$ is the size of a **maximum matching**. So we will compute a maximum matching via **Dinic** and subtract.

### **Why It Is Bipartite**

Every conflict move flips the **column parity**: left/right changes $j$ by $\pm 1$, and diagonals also change $j$ by $\pm 1$. So every conflict edge connects an even-$j$ seat to an odd-$j$ seat. That gives a clean $\text{Left} =$ even columns, $\text{Right} =$ odd columns split.

### **Flow Build (Standard Matching Network)**

* **Nodes:** One node per usable seat, plus **source** $S$ and **sink** $T$.
* **Partition:** even columns $\to$ **Left**, odd columns $\to$ **Right**.
* **Capacities:** Seat capacity is 1. Add edges $S \to u$ for $u$ in Left, edges $v \to T$ for $v$ in Right, all with capacity 1. For every conflict edge $(u,v)$ with $u$ in Left and $v$ in Right, add $u \to v$ with capacity 1.
* **Answer:** Let `total` be the number of usable seats. Run **Dinic** to get `match = max_flow(S,T)`. Return `total - match`.

### **Complexity**

$O(E\sqrt{V})$ where $V$ is the number of usable seats and $E$ is the number of conflict edges.

### **Solution**

```cpp
class Solution {
public:
    struct Dinic {
        struct Edge {
            int v, rev;
            long long cap;
        };

        int n, s, t;
        vector<vector<Edge>> graph;
        vector<int> level, ptr;

        Dinic(int n, int s, int t) : n(n), s(s), t(t) {
            graph.assign(n, {});
            level.resize(n);
            ptr.resize(n);
        }

        void add_edge(int u, int v, long long cap) {
            Edge a{v, (int)graph[v].size(), cap};
            Edge b{u, (int)graph[u].size(), 0};
            graph[u].push_back(a);
            graph[v].push_back(b);
        }

        bool bfs() {
            fill(level.begin(), level.end(), -1);
            queue<int> q;
            q.push(s);
            level[s] = 0;

            while (!q.empty()) {
                int u = q.front();
                q.pop();

                for (auto& e : graph[u]) {
                    if (e.cap > 0 && level[e.v] == -1) {
                        level[e.v] = level[u] + 1;
                        q.push(e.v);
                    }
                }
            }
            return level[t] != -1;
        }

        long long dfs(int u, long long pushed) {
            if (u == t || pushed == 0) return pushed;

            for (int& cid = ptr[u]; cid < (int)graph[u].size(); ++cid) {
                Edge& e = graph[u][cid];

                if (e.cap > 0 && level[e.v] == level[u] + 1) {
                    long long tr = dfs(e.v, min(pushed, e.cap));
                    if (tr == 0) continue;

                    e.cap -= tr;
                    graph[e.v][e.rev].cap += tr;
                    return tr;
                }
            }
            return 0;
        }

        long long maxFlow() {
            long long flow = 0;

            while (bfs()) {
                fill(ptr.begin(), ptr.end(), 0);
                while (long long pushed = dfs(s, 1LL * 5e9)) flow += pushed;
            }
            return flow;
        }
    };

    int maxStudents(vector<vector<char>>& seats) {
        int m = seats.size(), n = seats[0].size();

        auto id = [&](int i, int j) {
            return i * n + j;
        };

        int S = m * n;
        int T = S + 1;
        Dinic dinic(T + 1, S, T);

        auto inside = [&](int i, int j) {
            return i >= 0 && j >= 0 && i < m && j < n && seats[i][j] == '.';
        };

        vector<pair<int,int>> dirs = {
            {1,-1}, {1,1}, {0,-1}, {0,1}, {-1,-1}, {-1,1}
        };

        int total = 0;

        for (int i = 0; i < m; ++i) {
            for (int j = 0; j < n; ++j) {
                if (seats[i][j] == '#') continue;
                ++total;

                int u = id(i, j);

                if (!(j & 1)) {  // even column -> Left
                    dinic.add_edge(S, u, 1);

                    for (auto& [di, dj] : dirs) {
                        int ni = i + di;
                        int nj = j + dj;
                        if (inside(ni, nj)) dinic.add_edge(u, id(ni, nj), 1);
                    }
                }
                else {  // odd column -> Right
                    dinic.add_edge(u, T, 1);
                }
            }
        }

        return total - dinic.maxFlow();
    }
};
```

### **Notes**

* The **level graph** in Dinic has nothing to do with the physical distance between seats. Level edges are an algorithmic concept used internally by Dinic to ensure each augmenting path is shortest. Conflict edges come from the problem model.
* If your statement's cheating rules differ (e.g., only left/right and upper-left/upper-right), just change the neighbor list `dirs`. The bipartition argument still holds as long as every conflict changes column parity.
* This approach generalizes to any bipartite conflict graph where you want maximum independent set.

---

## 9) TLDR

- Learn the parts: capacities, conservation, residuals, augmenting paths.
- Map the statement to a model and its space.
- Use **Dinic** for max flow, matching, disjoint paths. It's your workhorse.
- Add **MCMF** when costs matter.
- In bipartite graphs, $|\text{min vertex cover}| = |\text{max matching}|$ and $|\text{max independent set}| = |V| - \nu(G)$ (König's Theorem).
- **Complexity cheat sheet:**
  - Ford-Fulkerson: $O(E \cdot f_{\max})$ (exponential worst case)
  - Edmonds-Karp: $O(VE^2)$
  - Dinic: $O(V^2 E)$ general, $O(E\sqrt{V})$ unit cap
  - MCMF: $O(fVE \log V)$
- Master this and you'll farm elo off gatekept flow problems.

---

## 10) Recommended Problems

* [USACO Guide - Maximal Flow](https://usaco.guide/adv/max-flow?lang=cpp)
* [USACO Guide - Minimum Cut](https://usaco.guide/adv/min-cut?lang=cpp)
* [USACO Guide - Minimum Cost Flow](https://usaco.guide/adv/min-cost-flow?lang=cpp)
* [LeetCode 1349 - Maximum Students Taking Exams](https://leetcode.com/problems/maximum-students-taking-exam/description/)
* [CSES 1694 - Download Speed](https://cses.fi/problemset/task/1694)
* [CSES 1695 - Police Chase](https://cses.fi/problemset/task/1695)
* [CSES 1696 - School Dance](https://cses.fi/problemset/task/1696)
* [Codeforces 808F - Card Game](https://codeforces.com/problemset/problem/808/F)