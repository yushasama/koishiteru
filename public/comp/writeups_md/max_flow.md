# Flowing Into Higher Elo

## What is Max Flow?

Flow is the go‑to model for “push as much as you can” in a graph. You have a source $s$, a sink $t$, and capacities on edges. With this lens you solve throughput, blocking, pairing, disjoint paths, and “cheapest way to send $K$” tasks. 

In practice, use **Dinic** for max flow and matching, and add **MCMF** (Min‑Cost Max Flow) when the statement cares about cost. This combo should be able to handle a majority of flow problems you encounter in the wild. 

Though flow problems aren't as common compared to other topics, when they appear, they act as a gatekeeper. Meaning if you know how to go with the flow, it's an elo farm.

---

## 0) Core Definitions

**Flow network.**  
A directed graph with source $s$, sink $t$, and non‑negative capacities $c(u,v)$. A flow $f$ obeys $0 \le f(u,v) \le c(u,v)$, and at every internal node the inflow equals the outflow.

**Residual graph.**  
For each edge $(u,v)$ with flow $f(u,v)$, the residual has a forward capacity $c(u,v) - f(u,v)$ and a backward capacity $f(u,v)$. Computation happens on this residual graph.

**Augmenting path.**  
Any $s \to t$ path in the residual where all residual capacities are positive. Push the bottleneck on that path, update residuals, repeat until none remain.

**Max‑Flow = Min‑Cut.**  
The maximum $s \to t$ flow equals the minimum total capacity of edges whose removal separates $s$ from $t$. This is why “send” and “block” are two faces of the same problem.

---

## 1) What To Keep In Mind

* **Constraints**
  * $V \approx 10^5$, $E \approx 2\times 10^5$, unit capacities → Dinic is usually fine.
  * Dense graphs or MCMF with costs → expect much smaller inputs.
  * Capacities are integers in most CP problems. Use 64‑bit where sums can grow.

* **Time**
  * Dinic is fast on sparse and unit‑cap graphs.
  * MCMF is slower since each augmentation is a shortest path in cost.

* **Memory**
  * Residual graphs keep a reverse edge for every edge, so budget about $2E$ edges.

* **Modeling tips**
  * Node capacity: split $v$ into $v_{\text{in}}$ and $v_{\text{out}}$ with an internal cap.
  * Bipartition: 2‑color by BFS or DFS. On grids, parity like $(r+c)\bmod 2$ or column parity is a quick special case.

* **Output recovery**
  * Min cut: after max flow, take nodes reachable from $s$ in the final residual. Edges from reachable to unreachable form a min cut.
  * Matching: edges Left $\to$ Right with flow $1$ are your pairs.

---

## 2) Bipartite Dualities - Minimum Vertex Cover and Maximum Independent Set

**What they are.**  
A **vertex cover** $C$ is a set of vertices that touches every edge. Think: “put a guard on some intersections so every road has a guard at one end.” Thus, the **minimum vertex cover** is a cover with the smallest possible size.  

An **independent set** $I$ is a set of vertices with **no** edges inside. Think: “pick as many intersections as possible so no two chosen ones are connected.” The **maximum independent set** is an independent set with the largest possible size. 

### **Kőnig’s Theorem (Bipartite)**

In any bipartite graph $G = (U \cup V, E)$:

$$
|\text{Minimum Vertex Cover}| = |\text{Maximum Matching}| = \nu(G)
$$

---

### **Dual Relationship** 

Because in any graph:

$$
\textbf{Maximum Independent Set} = \text{All Vertices} - \text{Minimum Vertex Cover}
$$

then by **Kőnig’s theorem** (since in bipartite graphs the minimum vertex cover equals the maximum matching):

$$
\boxed{\textbf{Maximum Independent Set} = |U| + |V| - \nu(G)}
$$

That’s why in bipartite graphs, once you find the **maximum matching**, you immediately know the size of the **maximum independent set**. It’s simply all the vertices *not used up* by the matching. 

### What this means in practice (tiny example)

Let $U = \{u_1,u_2\}$, $V = \{v_1,v_2,v_3\}$. Edges:  
$u_1\!\text{-}v_1$, $u_1\!\text{-}v_2$, $u_2\!\text{-}v_2$, $u_2\!\text{-}v_3$.

- A **maximum matching** has size $\nu(G)=2$, for example $\{(u_1,v_1), (u_2,v_3)\}$.
- A **minimum vertex cover** has size 2. One valid cover is **$\{u_1, u_2\}$**: every edge touches either $u_1$ or $u_2$.
- A **maximum independent set** then has size $|U|+|V|-\nu(G) = 5 - 2 = 3$. One example is **$\{v_1, v_2, v_3\}$** (no edges inside $V$ itself).

**How to construct the minimum vertex cover after max matching (flow view).**  
Build the standard matching network $s \to U \to V \to t$ with unit capacities and run **Dinic**. In the final residual graph:

1. Start from all **unmatched** vertices in $U$.  
2. Traverse alternating residual edges: unsaturated $U\to V$ forward, saturated $V\to U$ backward.  
3. Let the visited sets be $Z_U \subseteq U$ and $Z_V \subseteq V$.

Then a minimum vertex cover is $(U \setminus Z_U) \cup Z_V$. The complement is a maximum independent set.

**Problem‑style intuition.**  
- **Minimum vertex cover** is “pick the smallest set of vertices so every edge is blocked by at least one chosen endpoint.” In a classroom seating or cheating‑edge model, that is the fewest seats you would mark as “occupied or blocked” so no cheating pair remains active.  
- **Maximum independent set** is “pick the largest set of vertices with zero conflicts.” In that same seating model, it is the most students you can place so that no two can see each other. On bipartite graphs, compute a max matching, then use $|V| - \nu(G)$ to get the count directly.

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

### Edge‑Disjoint Paths
- Find $k$ paths that do not share edges
- Flow per edge has a max capacity of 1

### Vertex‑Disjoint Paths
- Find $k$ paths that do not share vertices

### Min‑Cost Max Flow
- Send $K$ units with minimum total cost  
- Cost per edge, minimize price or penalty

### Circulation with Demands
- Supplies and demands  
- Lower bounds on edges  
- Feasible flow that satisfies all balances

---

## 4) Modeling Space

**Bipartite matching.**  
Shape: $s \to$ Left $\to$ Right $\to t$.  

Add $s \to u$ (cap 1) for each $u \in$ Left, $u \to v$ (cap 1) for allowed pairs, and $v \to t$ (cap 1) for each $v \in$ Right. Run Dinic. Pairs are edges $u \to v$ with flow 1.  

To create the bipartition from an arbitrary graph, 2‑color by BFS or DFS. On grids, parity like $(r+c)\bmod 2$ or column parity is a fast special case.

**Node capacity.**  
If a vertex $v$ has capacity $k$, split it into $v_{\text{in}}$ and $v_{\text{out}}$, add $v_{\text{in}}\to v_{\text{out}}$ with capacity $k$, and replace each original edge $(u,v)$ with $(u_{\text{out}}, v_{\text{in}})$. Run Dinic.

**Edge‑disjoint and vertex‑disjoint paths.**  
Edge‑disjoint: set every edge capacity to 1 and run Dinic.  
Vertex‑disjoint: apply node‑split with internal capacity 1, then run Dinic.

**Min‑cost assignments and routing.**  
Attach costs to edges in the same shapes and run **MCMF** to send the required amount with minimum total cost. Use Dijkstra with potentials for non‑negative reduced costs.

**Circulation with demands and lower bounds.**  
Reserve lower bounds, adjust node balances, add a super‑source and super‑sink to connect surpluses and deficits. Run Dinic for feasibility, or MCMF if costs exist. Feasible if all balance edges saturate.

---

## 5) Important Algorithms

## **Ford Fulkerson**  
Find any augmenting path, push the bottleneck, repeat. Short to code, fine only for tiny inputs.
```cpp
#include <bits/stdc++.h>
using namespace std;

struct FordFulkerson {
  struct Edge { int to, rev; long long cap; };
  int n; vector<vector<Edge>> g;
  FordFulkerson(int n): n(n), g(n) {}
  void add_edge(int u, int v, long long c){
    Edge a{v, (int)g[v].size(), c};
    Edge b{u, (int)g[u].size(), 0};
    g[u].push_back(a); g[v].push_back(b);
  }
  long long dfs(int u, int t, long long f, vector<int>& vis){
    if(u==t) return f;
    vis[u]=1;
    for(auto &e : g[u]){
      if(e.cap>0 && !vis[e.to]){
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
    long long flow=0;
    while(true){
      vector<int> vis(n,0);
      long long pushed = dfs(s,t,LLONG_MAX,vis);
      if(!pushed) break;
      flow += pushed;
    }
    return flow;
  }
};
```

## **Edmond Karp**
Always take a BFS shortest augmenting path. Predictable and simple, but slow on larger graphs.

```cpp
#include <bits/stdc++.h>
using namespace std;

struct EdmondsKarp {
  struct Edge { int to, rev; long long cap; };
  int n; vector<vector<Edge>> g;
  EdmondsKarp(int n): n(n), g(n) {}
  void add_edge(int u, int v, long long c){
    Edge a{v, (int)g[v].size(), c};
    Edge b{u, (int)g[u].size(), 0};
    g[u].push_back(a); g[v].push_back(b);
  }
  long long maxflow(int s, int t){
    long long flow=0;
    while(true){
      vector<int> pv(n, -1), pe(n, -1);
      queue<int> q; q.push(s); pv[s] = s;
      while(!q.empty() && pv[t]==-1){
        int u = q.front(); q.pop();
        for(int i=0;i<(int)g[u].size();++i){
          auto &e=g[u][i];
          if(e.cap>0 && pv[e.to]==-1){
            pv[e.to]=u; pe[e.to]=i; q.push(e.to);
            if(e.to==t) break;
          }
        }
      }
      if(pv[t]==-1) break; // no augmenting path
      long long aug = LLONG_MAX;
      for(int v=t; v!=s; v=pv[v]){
        int u=pv[v], ei=pe[v];
        aug = min(aug, g[u][ei].cap);
      }
      for(int v=t; v!=s; v=pv[v]){
        int u=pv[v], ei=pe[v];
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

## **Dinic** 
Build a level graph by BFS, then push a blocking flow by DFS with a current‑arc pointer. Fast in practice on sparse and unit‑cap graphs. Use this as your default.

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
    Edge a{v, static_cast<int>(graph[v].size()), cap};
    Edge b{u, static_cast<int>(graph[u].size()), 0};
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

**Min‑Cost Max Flow (MCMF)**  
Send a required amount while minimizing total cost. Do successive shortest augmenting paths with potentials. Use when the statement cares about price or penalty.

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
  pair<long long,long long> min_cost_flow(int s, int t, long long need){
    const long long INF = (1LL<<62);
    long long flow = 0, cost = 0;

    // Johnson potentials (node potentials)
    vector<long long> pot(n, 0);

    // --- Initial SPFA to handle negative costs (no negative cycles) ---
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
              if(!dq.empty() && d[e.to] < d[dq.front()]) dq.push_front(e.to);
              else dq.push_back(e.to);
              inq[e.to] = 1;
            }
          }
        }
      }
      for(int i=0;i<n;i++) pot[i] = (d[i] == INF ? 0 : d[i]);
    }

    vector<long long> dist(n), mincap(n);
    vector<int> par_u(n), par_e(n);

    while(flow < need){
      // Dijkstra on reduced costs: c'(u,v) = c(u,v) + pot[u] - pot[v]
      fill(dist.begin(), dist.end(), INF);
      fill(par_u.begin(), par_u.end(), -1);
      fill(par_e.begin(), par_e.end(), -1);

      using P = pair<long long,int>;
      priority_queue<P, vector<P>, greater<P>> pq;
      dist[s] = 0; mincap[s] = LLONG_MAX;
      pq.push({0, s});

      while(!pq.empty()){
        auto [du, u] = pq.top(); pq.pop();
        if(du != dist[u]) continue;
        for(int i=0;i<(int)g[u].size();++i){
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
      for(int v=0; v<n; ++v)
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

### **Max $+\mathbb{E}[V]$ Algos To Study**
After understanding what flow networks, residual graphs, & augmenting paths are. Learn how **Ford-Fulkerson** & **Edmond-Karp** work just for theory purposes, then skip to making **Dinic's** a template.

**Dinic's** is faster than **F-F** and **E-P** and will be your workhorse for a majority of flow problems, specifically **general max-flow and bipartite matching problems.** Adding **MCMF** ontop of **Dinic's** should practically solve every contest flow problem.

---

## 7) Flow Models - Patterns, Outputs, and Shapes (Cheat Sheet)

| Type | How to Tell | What to Output | Shape | Solver | Notes |
|---|---|---|---|---|---|
| Max Flow | send as many as possible, throughput, bottleneck | max flow value, sometimes edge flows | $s \to$ network $\to t$ | Dinic | read flows from saturated edges if needed |
| Min Cut | fewest capacity to remove to block $s \to t$ | cut value, sometimes cut edges or partition | same build as max flow | Dinic | after max flow, take $s$-reachable set in residual |
| Bipartite Matching | pair left with right, assignment | number of pairs, sometimes the pairs | $s \to$ Left (1) $\to$ Right (1) $\to t$ | Dinic | pairs are Left$\to$Right edges with flow 1 |
| Vertex‑Disjoint Paths | no two paths share a vertex | maximum count, sometimes the paths | node‑split each vertex, internal cap 1 | Dinic | follow flow through split nodes |
| Edge‑Disjoint Paths | no two paths share an edge | maximum count | unit capacity on each edge | Dinic | straightforward unit‑cap build |
| Node Capacity | each station at most $k$ | max throughput or feasibility | node‑split with internal cap $k$ | Dinic | generalizes vertex‑disjoint paths |
| Min‑Cost Flow, Assignment | send $K$ units cheaply, cost per edge | total cost, sometimes the assignment | any of the above with costs | MCMF | Dijkstra with potentials |
| Circulation with Demands | supplies and demands, lower bounds | feasible or not, or a feasible flow | add super‑source and super‑sink | Dinic or MCMF | feasible if all balance edges saturate |

---

## 8) Worked Example - Leetcode 1349: Maximum Students Taking Exam

### **[Problem](https://leetcode.com/problems/maximum-students-taking-exam/)**
Given a classroom grid `seats[i][j]` with `'.'` (usable) and `'#'` (broken), place as many students as possible so no two can "cheat" (conflict). A conflict edge exists between seats that are horizontally adjacent or diagonally adjacent in neighboring rows. Return the maximum number of students you can seat.

### **Model**
Build a **conflict graph** on usable seats. We want a **maximum independent set** (no edges inside). For bipartite graphs, by **Kőnig’s Theorem** we have
$$\text{Maximum Independent Set} = |V| - \nu(G)$$
where $\nu(G)$ is the size of a **maximum matching**. So we will compute a maximum matching via **Dinic** and subtract.

### **Why It Is Bipartite.**
Every conflict move flips the **column parity**: left/right changes $j$ by $\pm 1$, and diagonals also change $j$ by $\pm 1$. So every conflict edge connects an even-$j$ seat to an odd-$j$ seat. That gives a clean $\text{Left}=$ even columns, $\text{Right}=$ odd columns split.

### **Flow build (Standard Matching Network).**
* Nodes: one node per usable seat, plus **source** $S$ and **sink** $T$.
* Partition: even columns $\to$ **Left**, odd columns $\to$ **Right**.
* Capacities: seat capacity is 1. Add edges $S\to u$ for $u$ in Left, edges $v\to T$ for $v$ in Right, all with capacity 1. For every conflict edge $(u,v)$ with $u$ in Left and $v$ in Right, add $u\to v$ with capacity 1.
* Answer: let `total` be the number of usable seats. Run **Dinic** to get `match = max_flow(S,T)`. Return `total - match`.

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
            {1,-1},
            {1,1},
            {0,-1},
            {0,1},
            {-1,-1},
            {-1,1}
        };

        int total = 0;

        for (int i = 0; i < m; ++i) {
            for (int j = 0; j < n; ++j) {
                if (seats[i][j] == '#') continue;
                ++total;

                int u = id(i, j);

                if (!(j & 1)) {
                    dinic.add_edge(S, u, 1);

                    for (auto& [di, dj] : dirs) {
                        int ni = i + di;
                        int nj = j + dj;

                        if (inside(ni, nj)) dinic.add_edge(u, id(ni, nj), 1);
                    }
                }

                else dinic.add_edge(u, T, 1); 
            }
        }

        return total - dinic.maxFlow();
    }
};
```

### **Notes**
* The **level graph** in Dinic has nothing to do with the physical distance between seats. Level edges are an algorithmic concept; conflict edges come from the model.
* If your statement’s cheating rules differ (e.g., only left/right and upper-left/upper-right), just change the neighbor list. The bipartition argument still holds as long as every conflict changes column parity.

## 9) TLDR

- Learn the parts: capacities, conservation, residuals, augmenting paths.  
- Map the statement to a model & its space.
- Use **Dinic** for max flow, matching, etc. It will be your main workhorse for flow problems. 
- Add **MCMF** when costs matter.  
- In bipartite graphs, $|\text{min vertex cover}| = |\text{max matching}|$ and $\alpha(G) = |V| - \nu(G)$.
- Master this and you will enjoy farming free elo off everyone else.

## 10) Recommended Problems
* [USACO Guide - Maximal Flow](https://usaco.guide/adv/max-flow?lang=cpp)
* [USACO Guide - Minimum Cut](https://usaco.guide/adv/min-cut?lang=cpp)
* [USACO Guide - Minimum Cost Flow](https://usaco.guide/adv/min-cost-flow?lang=cpp)
* [LeetCode 1349 - Maximum Students Taking Exams](https://leetcode.com/problems/maximum-students-taking-exam/description/)
* [CSES 1694 - Download Speed](https://cses.fi/problemset/task/1694)
* [CSES 1695 - Police Chase](https://cses.fi/problemset/task/1695)



