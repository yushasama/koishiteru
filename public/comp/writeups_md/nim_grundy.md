# **Game Theory – Nim & Grundy**

So what exactly is Game Theory in the context of CP? Game theory problems are two-player logic puzzles under **perfect information**.

Both sides see the full board, alternate moves, and play optimally. You either win by forcing the opponent into a position where they have **no legal moves**, or by maximizing some final score.

### **Two Broad Classes**

| Type          | Definition                              | How you solve it             |
| :------------ | :-------------------------------------- | :--------------------------- |
| **Impartial** | Both players have the same move options | Nim / Grundy (xor logic)     |
| **Partisan**  | Moves differ by player                  | Minimax or DP by player turn |

We only handle **impartial games**, because only those reduce cleanly to **Nim logic** or its generalization, **Sprague–Grundy**.

If your problem can be modeled as a **finite DAG of symmetric states**, you can use one of these levels:

| **Level**                            | **When To Use**                                    | **How It Works**                                        |
| :----------------------------------- | :------------------------------------------------- | :------------------------------------------------------ |
| **Pure Nim**                         | Direct heaps, remove tokens from one pile per move | xor of heap sizes decides winner                        |
| **Nim Variant**                      | Fixed move sets (subtraction, sequential Nim)      | DP over allowed removals, or reduce to xor condition    |
| **Sprague-Grundy (Generalized Nim)** | Arbitrary impartial DAGs (splits, graphs, etc.)    | Compute Grundy values via $\mathrm{mex}$, then xor them |

---

### **When You *Can't* Nim**

You cannot apply Nim or Grundy logic if:

* The two players have **different** move sets (partisan).
* The game can **loop** or repeat positions indefinitely.
* The game's outcome depends on **scores or totals**, not on "who moved last."

Those require minimax search or score-based dynamic programming, not xor.

### **Why We Build Up This Way**

Nim is the simplest impartial game.

Sprague–Grundy is just Nim applied to **any** acyclic impartial system.

Every valid Grundy game eventually behaves like one big Nim heap whose size is the xor of all subcomponents.

---

## **0) Core Definitions**

### **Impartial Game**
Both players have identical move options from any position. Normal play means the player who cannot move loses.

### **Partisan Game**
A game where players have different move sets. Examples include chess and checkers. These cannot be solved using Nim or Grundy theory.

### **Losing Position**
A position where the player to move will lose with optimal play. Grundy number $g = 0$.

### **Winning Position**
A position where the player to move can force a win. Grundy number $g > 0$.

### **mex (Minimum Excludant)**
The mex of a set is the smallest non-negative integer that is NOT in the set.

**Examples:**
- $\mathrm{mex}(\{0, 1, 2, 4\}) = 3$ (because 3 is missing)
- $\mathrm{mex}(\{1, 2, 3\}) = 0$ (because 0 is missing)
- $\mathrm{mex}(\{0, 2, 3\}) = 1$ (because 1 is missing)
- $\mathrm{mex}(\{\}) = 0$ (empty set, so 0 is the first missing number)

**Why we use mex:** In game theory, the Grundy number of a position is the mex of all Grundy numbers you can reach in one move. This captures the idea that a position's "strength" is the smallest value you CAN'T force your opponent into.

### **Grundy Number**
Each position has a numeric value representing its equivalent Nim heap size:
$$
g(s) = \mathrm{mex}\{ g(t) : s \to t \}
$$

The Grundy number is the mex of all Grundy numbers reachable in one move from the current position.

### **Nim-Sum**
The xor of all heap sizes: $a_1 \oplus a_2 \oplus \cdots \oplus a_k$.

### **Heap (Game Theory)**
A pile of indistinguishable tokens. A move changes one heap only. 

**Important:** This is NOT the heap data structure (priority queue). In game theory, "heap" simply means a pile of identical objects.

### **Nim**
There are multiple heaps. On your turn, choose one heap and remove any positive number of tokens. First player wins iff the xor of all heap sizes is nonzero.

### **Sequential or Constrained Nim**
Nim with restricted pile choices or order; often reduces to parity or prefix rules.

### **Misere Nim**
Last move loses (opposite of normal play). Play like normal Nim except when all heaps are size $1$. If all heaps are size $1$, the first player wins iff the number of heaps is even.

### **Split Game**
A move splits one heap into parts that become independent subgames. The parent state uses xor across child parts and then takes mex:
$$
g(x)=\mathrm{mex}\{g(a_1)\oplus g(a_2)\oplus \cdots\}
$$ 
subject to the split rules.

### **Subtraction Game**
One heap; can remove values from set $P$.
$$
g[x]=\mathrm{mex}\{g[x-p]:p\in P,p\le x\}
$$

### **Score Game**
Payoff is accumulated score rather than "who moves last." Solve by total-score DP or minimax with gains, such as:
$$
dp[s]=\max_{t\in \text{moves}(s)}(\text{gain}(s,t)-dp[t])
$$

Sprague–Grundy does not apply.

### **Sprague–Grundy Theorem**
Every finite impartial game equals a single Nim heap of size $g(s)$. Independent subgames combine by xor:
$$
g_{\text{total}} = g_1 \oplus g_2 \oplus \dotsb \oplus g_k
$$

If $g_{\text{total}} = 0$, you are losing.

### **Game DAG (Termination)**
Valid Sprague-Grundy modeling requires a directed acyclic graph of states, or a monotone measure that strictly decreases so the game always ends.

---

## **1) Constraints**

* The game must terminate (no loops). Model as DAG or ensure each move reduces something.
* Subtraction game DP: $O(N_{\max} \cdot |P|)$ time, $O(N_{\max})$ memory.
* DAG token game: $O(V + E)$.
* Nim xor decision: $O(n)$.
* Do not use Grundy for partisan or score-accumulating games.

**Pitfalls:**
* Cycles make $g(s)$ undefined.
* Misere (last move loses) only changes all-ones Nim.
* Xor works only for independent subgames.
* Using Grundy on a non-DAG or asymmetric game gives garbage.

---

## **2) Theory Bridge**

### **Why XOR Decides Nim - The Full Story**

Let $X = a_1 \oplus a_2 \oplus \dotsb \oplus a_k$ be the xor of all heap sizes.

**Claim:** First player wins if and only if $X \neq 0$.

**Proof:**

**Part 1: If $X = 0$, the first player loses.**

- When $X = 0$, no matter which heap you pick and how many you remove, you create a new configuration where $X' \neq 0$.
- Why? When you change heap $a_i$ to $a_i'$, the new xor is:
  $$
  X' = a_1 \oplus \cdots \oplus a_i' \oplus \cdots \oplus a_k = X \oplus a_i \oplus a_i' = 0 \oplus a_i \oplus a_i'
  $$
- Since $a_i' < a_i$ (you removed stones), we have $a_i \oplus a_i' \neq 0$, so $X' \neq 0$.
- Your opponent now faces $X' \neq 0$ and can force you back to $X = 0$ (see Part 2).
- This continues until you face all zeros and lose.

**Part 2: If $X \neq 0$, the first player can WIN by forcing $X = 0$.**

**The Winning Move:**
1. Find the highest bit position $b$ where $X$ has a 1.
2. Find any heap $a_i$ that also has a 1 in bit position $b$. (Such a heap must exist, otherwise $X$ wouldn't have a 1 there.)
3. Compute the target value: $a_i' = a_i \oplus X$.

**Key observation:** Since both $a_i$ and $X$ have a 1 in position $b$, when we xor them, that bit becomes 0, so $a_i' < a_i$. This is a legal move!

4. After changing heap $a_i$ to $a_i'$, the new xor becomes:
   $$
   X' = a_1 \oplus \cdots \oplus a_i' \oplus \cdots \oplus a_k
   $$
   $$
   = a_1 \oplus \cdots \oplus (a_i \oplus X) \oplus \cdots \oplus a_k
   $$
   $$
   = (a_1 \oplus \cdots \oplus a_i \oplus \cdots \oplus a_k) \oplus X
   $$
   $$
   = X \oplus X = 0
   $$

**Example:**
- Heaps: $\{3, 5, 6\}$
- Binary: $\{011, 101, 110\}$
- $X = 011 \oplus 101 \oplus 110 = 010$ (which is 2 in decimal)
- Highest bit in $X$ is position 1 (the 2's place)
- Heaps with bit 1 set: $5 = 101$ and $6 = 110$
- Pick heap with 6 stones: $a_i' = 6 \oplus 2 = 110 \oplus 010 = 100 = 4$
- Remove 2 stones from the heap of 6, leaving 4
- New state: $\{3, 5, 4\}$
- Check: $3 \oplus 5 \oplus 4 = 011 \oplus 101 \oplus 100 = 000 = 0$ ✓

Now your opponent faces $X = 0$ and must give you back $X \neq 0$, and you can repeat this strategy until they lose.

**Therefore:** $X \neq 0$ means winning position, $X = 0$ means losing position.

---

### **Recognizing Disguised Nim Problems**

Not all Nim problems scream "I'M NIM!" at you. Here's how to spot them:

#### **Pattern 1: Matchstick Games → Heaps**

**Problem Type:** "There are $n$ matchsticks. Players alternate removing 1, 2, or 3 matchsticks. Last player to move wins."

**Translation:**
- This is a **single heap of $n$ stones** with allowed moves $\{1, 2, 3\}$.
- It's a subtraction game! Compute Grundy values with DP.

**Key Recognition:** One shared resource + symmetric removal options = one heap.

#### **Pattern 2: Multiple Independent Resources → Multiple Heaps**

**Problem Type:** "There are $k$ piles of coins. On each turn, pick one pile and remove any number of coins from it."

**Translation:**
- This is **literal Nim** with $k$ heaps.
- Answer: xor all heap sizes.

**Key Recognition:** Multiple resources + "pick one and modify it" = standard Nim.

#### **Pattern 3: Position Games → Heap Encoding**

**Problem Type:** "A token starts at position 0 on a number line. Players can move it right by 1, 3, or 4 steps. First to reach or exceed position $n$ wins."

**Translation:**
- Encode position as a single heap: "distance remaining to goal."
- State $x$ = "$x$ steps away from winning."
- Allowed moves reduce the heap by 1, 3, or 4.
- This is a subtraction game!

**Key Recognition:** Position/distance to goal = heap of "remaining distance."

#### **Pattern 4: Divisor Games → Grundy on Values**

**Problem Type:** "Start with number $n$. Players alternate picking a proper divisor $d$ of the current number and subtracting it. First player who cannot move loses."

**Translation:**
- Each number is a game state.
- Moves from $n$ go to $n - d$ for each proper divisor $d$ of $n$.
- Build the game DAG and compute Grundy numbers bottom-up.

**Key Recognition:** Number manipulations with fixed rules = compute Grundy per number.

#### **Pattern 5: Grid Games → Combined Heaps**

**Problem Type:** "There are $k$ independent game boards. On your turn, pick one board and make a move. Last player to move wins."

**Translation:**
- Each board is a subgame with its own Grundy number.
- Total game value = $g_1 \oplus g_2 \oplus \cdots \oplus g_k$.

**Key Recognition:** Multiple independent games = xor their Grundy numbers.

#### **Quick Checklist for "Is This Nim?"**

Ask yourself:
1. **Is it impartial?** (Same moves for both players?) → If no, not Nim.
2. **Does it always end?** (No loops/cycles?) → If no, not Nim.
3. **Is there one resource or multiple independent ones?** → Single = subtraction/Grundy, Multiple = xor.
4. **Can I encode states as "piles" or "distances"?** → If yes, probably Nim-like.
5. **Are moves reducing something?** → If yes, likely a heap model works.

**Red Flags (NOT Nim):**
- "Maximize total score" → scoring game, not Nim.
- "Player 1 can move left, Player 2 can move right" → partisan, not Nim.
- "The game can repeat positions" → not a DAG, Grundy fails.

---

### **From General Game to Nim**

Compute $g(s)=\mathrm{mex}\{g(t)\}$ for all reachable states $t$ from $s$.

Each position behaves like a Nim heap of that size.

Independent components xor together.

Sprague–Grundy is just **dynamic programming on a DAG of game states**.

---

## **3) Spotting the Model**

| Problem cue                     | Technique                |
| :------------------------------ | :----------------------- |
| "Remove any number of stones"   | Pure Nim                 |
| "Remove p stones from one heap" | Subtraction DP           |
| "Split heap into parts"         | Split-game Grundy        |
| "Move tokens on a DAG"          | DAG Grundy               |
| "Several independent boards"    | XOR of Grundy values     |
| "Different moves per player"    | Partisan → minimax       |
| "Scoring / maximize total"      | DP on totals, not Grundy |

---

## **4) Shapes and Models**

| Type                 | How to Tell                | Output          | Solver              | Complexity         | Notes               |
| :------------------- | :------------------------- | :-------------- | :------------------ | :----------------- | :------------------ |
| **Nim**              | Free removal from one heap | Winner          | XOR of heaps        | $O(n)$             | Misere all-ones fix |
| **Subtraction Game** | Allowed decrements $P$     | $W/L$ or $g(x)$ | DP                  | $O(N \cdot |P|)$   | Often periodic      |
| **Split Game**       | Heap split into parts      | $g(x)$          | mex of xor of parts | $O(n^2)$           | Use symmetry        |
| **DAG Token Game**   | Tokens on DAG              | Winner          | Reverse-topo mex    | $O(V+E)$           | Must terminate      |
| **Score Game**       | Points gained each move    | Final score     | DP on totals        | Depends            | Not SG-compatible   |

---

## **5) Algorithms**

Not every problem is Sprague–Grundy. You must decide what kind it is.

### **Step 1: Identify if it's *Nimable***

Ask these:
* Do both players have the same moves?
* Does each move change exactly one heap or component?
* Does the game always end?
* Does the result depend only on who moves last, not on total score?

If all yes → impartial → Nimable.
If no → it's either partisan or scoring → use minimax or DP.

---

### **Step 2: Convert to a *Nim problem* if Possible**

**Direct Nim:** Heaps are explicit. XOR decides the winner.

**Subtraction Game:** Allowed removals = set $P$. Compute DP or Grundy for one heap:
$$
g[x] = \mathrm{mex}\{g[x - p] : p \in P, p \le x\}
$$

**Sequential or Constrained Nim:** If you can play only from certain piles or directions, compress the structure (often parity of leading 1-heaps or restricted indices decides).

**Composite Games:** If you can choose one independent subgame each move, xor all subgame Grundy numbers.

---

### **Step 3: Use *Sprague–Grundy* When Rules Aren't Simple Removals**

If moves can create or split subgames (like dividing heaps, or moving tokens on a graph), you must build the **game DAG**.

---

### **Step 4: Building the Grundy DAG**

1. **Define states** – each reachable configuration = node.
2. **Add edges** – from state $s$ to every reachable $t$. Must strictly decrease something.
3. **Mark terminals** – states with no moves → $g=0$.
4. **Compute** – process in reverse order:
   $$
   g(s)=\mathrm{mex}\{g(t): s\to t\}
   $$
5. **Combine subgames** – xor all $g_i$.
6. **Interpret** – $g=0$ → losing, $g>0$ → winning.

---

### **Step 5: When Grundy Doesn't Apply**

Some problems look like games but are **not impartial**:

* Moves differ by player → partisan → minimax recursion:
  $$
  \text{win}(s)=\exists (s\to t)\text{ s.t. }\neg \text{win}(t)
  $$
* Score accumulates each move → total-score DP:
  $$
  dp[s]=\max_{t\in \text{moves}(s)}(\text{gain}(s,t)-dp[t])
  $$
  
Those are standard 2-player DPs, not SG.

---

### **Step 6: Quick Example - Subtraction {1,3,4}**

**Let's compute the Grundy values step by step:**

|  x  | Reachable (x - p) | g(children)    | mex calculation              | g[x] |
| :-: | :---------------- | :------------- | :--------------------------- | :--: |
|  0  | –                 | –              | $\mathrm{mex}(\{\}) = 0$     |   0  |
|  1  | {0}               | {0}            | $\mathrm{mex}(\{0\}) = 1$    |   1  |
|  2  | {1}               | {1}            | $\mathrm{mex}(\{1\}) = 0$    |   0  |
|  3  | {2,0}             | {0,0}          | $\mathrm{mex}(\{0\}) = 1$    |   1  |
|  4  | {3,1,0}           | {1,1,0}        | $\mathrm{mex}(\{0,1\}) = 2$  |   2  |
|  5  | {4,2,1}           | {2,0,1}        | $\mathrm{mex}(\{0,1,2\}) = 3$|   3  |

**Interpretation:**
- Positions with $g[x] = 0$ are **losing positions** (0, 2).
- Positions with $g[x] > 0$ are **winning positions** (1, 3, 4, 5).

---

## **6) Templates**

### **Nim Winner with Misere**

```cpp
string nim_winner_with_misere(const vector<long long> &a, bool misere) {
    long long xr = 0; 
    int ones = 0;
    int big = 0;
    
    for (auto x : a) {
        xr ^= x;
        ones += (x == 1);
        big += (x > 1);
    }

    if (!misere) {
        return xr ? "First" : "Second";
    }
    
    if (big == 0) {
        return (ones % 2 == 0) ? "First" : "Second";
    }
    
    return xr ? "First" : "Second";
}
```

---

### **Subtraction Game DP**

```cpp
int n, k; 
cin >> n >> k;

vector<int> P(k);
for (int i = 0; i < k; i++) {
    cin >> P[i];
}

sort(P.begin(), P.end());

vector<char> win(n + 1, 0);

for (int x = 1; x <= n; x++) {
    for (int p : P) {
        if (p > x) {
            break;
        }
        
        if (!win[x - p]) { 
            win[x] = 1;
            break;
        }
    }
}

for (int x = 1; x <= n; x++) {
    cout << (win[x] ? 'W' : 'L');
}

cout << "\n";
```

---

### **Split Game Grundy**

```cpp
int N;
cin >> N;

vector<int> g(N + 1, 0);

for (int x = 1; x <= N; x++) {
    vector<int> vals;

    for (int a = 1; a + a <= x; a++) {
        int b = x - a;

        if (a == b) {
            continue;
        }

        vals.push_back(g[a] ^ g[b]);
    }

    vector<char> seen(vals.size() + 3, 0);
    
    for (int v : vals) {
        if (v < (int)seen.size()) {
            seen[v] = 1;
        }
    }
    
    int mex = 0; 
    
    while (mex < (int)seen.size() && seen[mex]) {
        mex++;
    }
    
    g[x] = mex;
}

cout << (g[N] ? "First" : "Second") << "\n";
```

---

### **DAG Grundy**

```cpp
int mex_from(const vector<int> &vals) {
    int m = vals.size(); 
    vector<char> seen(m + 2, 0);

    for (int v : vals) {
        if (0 <= v && v <= m + 1) {
            seen[v] = 1;
        }
    }

    for (int i = 0; i <= m + 1; i++) {
        if (!seen[i]) {
            return i;
        }
    }

    return m + 2;
}

int main() {
    int n, m, k; 
    cin >> n >> m >> k;

    vector<vector<int>> adj(n); 
    vector<int> indeg(n, 0);

    for (int i = 0; i < m; i++) {
        int u, v; 
        cin >> u >> v; 
        u--;
        v--;

        adj[u].push_back(v); 
        indeg[v]++;
    }

    queue<int> q;

    for (int i = 0; i < n; i++) {
        if (!indeg[i]) {
            q.push(i);
        }
    }

    vector<int> topo;

    while (!q.empty()) {
        int v = q.front();
        q.pop();

        topo.push_back(v);

        for (int u : adj[v]) {
            indeg[u]--;
            if (indeg[u] == 0) {
                q.push(u);
            }
        }
    }

    vector<int> g(n, 0);

    for (int i = n - 1; i >= 0; i--) {
        int v = topo[i];
        vector<int> vals; 

        for (int u : adj[v]) {
            vals.push_back(g[u]);
        }

        g[v] = mex_from(vals);
    }

    long long xr = 0;

    for (int i = 0; i < k; i++) {
        int s;
        cin >> s;
        s--;

        xr ^= g[s];
    }
    
    cout << (xr ? "First\n" : "Second\n");
    
    return 0;
}
```

---

## **7) Worked Examples**

### **CSES - Nim Game I**

**Problem:** Given heap sizes $a_1,\dots,a_n$, decide who wins.

**Why Nim:** Each heap is independent. XOR decides.

**Complexity:** $O(n)$.

```cpp
int n;
cin >> n;

long long xr = 0;

for (int i = 0; i < n; i++) {
    long long x;
    cin >> x;
    xr ^= x;
}

cout << (xr ? "First\n" : "Second\n");
```

---

### **CSES - Stick Game**

**Problem:** One heap, allowed removals $P=\{p_1,\dots,p_k\}$. Print W/L for each $x \le n$.

**Why Subtraction Game:** Each size depends on smaller ones. Simple DAG → DP.

**Complexity:** $O(nk)$.

```cpp
int n, k;
cin >> n >> k;

vector<int> P(k);
for (int i = 0; i < k; i++) {
    cin >> P[i];
}

sort(P.begin(), P.end());

vector<char> win(n + 1, 0);

for (int x = 1; x <= n; x++) {
    for (int p : P) {
        if (p > x) {
            break;
        }

        if (!win[x - p]) {
            win[x] = 1;
            break;
        }
    }
}

for (int x = 1; x <= n; x++) {
    cout << (win[x] ? 'W' : 'L');
}

cout << "\n";
```

---

### **CSES - Grundy's Game**

**Problem:** Split a heap of size $x$ into two unequal parts. If you can't move, you lose.

**Why Split Grundy:** Each split creates two subgames → xor + mex.

**Complexity:** $O(n^2)$ worst case.

```cpp
int main() {
    cin.tie(0);
    ios_base::sync_with_stdio(0);

    int n;
    cin >> n;

    vector<int> g(n + 1, 0);

    for (int x = 1; x <= n; x++) {
        vector<int> vals;

        for (int a = 1; a + a <= x; a++) {
            int b = x - a;
            
            if (a == b) {
                continue;
            }
            
            vals.push_back(g[a] ^ g[b]);
        }
        
        vector<char> seen(vals.size() + 3, 0);
        
        for (int v : vals) {
            if (v < (int)seen.size()) {
                seen[v] = 1;
            }
        }
        
        int mex = 0;
        
        while (mex < (int)seen.size() && seen[mex]) {
            mex++;
        }

        g[x] = mex;
    }

    cout << (g[n] ? "First" : "Second") << "\n";

    return 0;
}
```

---

## **8) Adjacent Techniques (Not Core Theory)**

Game theory problems often mix in other algorithmic concepts. These aren't part of Nim/Grundy theory itself, but they show up frequently enough that you need to know them.

### **Topological Sort in Game DAGs**

**When it appears:** Computing Grundy numbers on directed acyclic graphs (like token movement on graphs, or state transition games).

**Why you need it:** You must compute Grundy values in an order where all children are processed before parents. Topological sort gives you this order.

**How it works:**
1. Build the game graph where edges go from state $s$ to all reachable states $t$.
2. Compute topological order (reverse DFS or Kahn's algorithm).
3. Process nodes in **reverse** topological order.
4. For each node, compute $g(s) = \mathrm{mex}\{g(t) : s \to t\}$.

**Template (Kahn's Algorithm):**
```cpp
vector<int> topo_sort(int n, const vector<vector<int>>& adj) {
    vector<int> indeg(n, 0);
    
    for (int u = 0; u < n; u++) {
        for (int v : adj[u]) {
            indeg[v]++;
        }
    }
    
    queue<int> q;
    for (int i = 0; i < n; i++) {
        if (indeg[i] == 0) {
            q.push(i);
        }
    }
    
    vector<int> order;
    
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);
        
        for (int v : adj[u]) {
            indeg[v]--;
            if (indeg[v] == 0) {
                q.push(v);
            }
        }
    }
    
    return order;
}
```

**Common pattern:** Process in reverse order to compute Grundy values:
```cpp
vector<int> order = topo_sort(n, adj);

for (int i = n - 1; i >= 0; i--) {
    int u = order[i];
    // compute g[u] from children
}
```

---

### **Greedy + Parity Arguments**

**When it appears:** Sequential Nim, constrained Nim variants, games where only certain moves matter.

**Key insight:** Sometimes you don't need full Grundy computation - just check parity or leading positions.

**Example - Sequential Nim:**
- Players must take from the leftmost non-empty pile.
- If all piles have the same size, parity of number of piles decides.
- If there's a leading pile (different size), that player can control parity.

**Pattern recognition:**
```cpp
bool sequential_nim_win(const vector<int>& a) {
    int n = a.size();
    
    // Count leading piles (different from rest)
    int first_diff = -1;
    for (int i = 0; i < n; i++) {
        if (a[i] != a[0]) {
            first_diff = i;
            break;
        }
    }
    
    if (first_diff == -1) {
        // All same size - parity decides
        return (n % 2 == 1);
    }
    
    // Leading pile exists - that player controls
    return (first_diff % 2 == 0);
}
```

---

### **DP on Game States**

**When it appears:** Games with small state spaces that don't naturally decompose into independent subgames.

**Not Grundy - just DP:** Sometimes you just need basic win/loss DP without computing Grundy numbers.

**Template:**
```cpp
map<State, bool> memo;

bool can_win(State s) {
    if (is_terminal(s)) {
        return false; // no moves = lose
    }
    
    if (memo.count(s)) {
        return memo[s];
    }
    
    for (State t : get_next_states(s)) {
        if (!can_win(t)) {
            return memo[s] = true; // found losing move for opponent
        }
    }
    
    return memo[s] = false; // all moves lead to opponent winning
}
```

---

### **Periodicity Detection**

**When it appears:** Grundy sequences that eventually repeat (common in subtraction games).

**Key insight:** Compute until you find a repeating cycle, then use modular arithmetic for large $n$.

**Example:**
```cpp
vector<int> compute_grundy_with_period(int max_n, const vector<int>& moves) {
    vector<int> g(max_n + 1, 0);
    
    for (int x = 1; x <= max_n; x++) {
        set<int> reachable;
        for (int m : moves) {
            if (m <= x) {
                reachable.insert(g[x - m]);
            }
        }
        
        int mex = 0;
        while (reachable.count(mex)) {
            mex++;
        }
        g[x] = mex;
        
        // Check for period (look for repeating subarray)
        // Implementation depends on problem
    }
    
    return g;
}
```

---

### **Multi-Dimensional State Spaces**

**When it appears:** Games on grids, or with multiple parameters like $(x, y)$ positions.

**Strategy:** 
- Enumerate all states $(x, y, \ldots)$
- Build dependency graph
- Process in order respecting dependencies

**Example - Grid Game:**
```cpp
map<pair<int,int>, int> g;

int grundy(int x, int y) {
    if (x == 0 && y == 0) {
        return 0; // terminal
    }
    
    pair<int,int> state = {x, y};
    if (g.count(state)) {
        return g[state];
    }
    
    set<int> reachable;
    
    // Example: can move to (x-1, y), (x, y-1), or (x-1, y-1)
    if (x > 0) reachable.insert(grundy(x - 1, y));
    if (y > 0) reachable.insert(grundy(x, y - 1));
    if (x > 0 && y > 0) reachable.insert(grundy(x - 1, y - 1));
    
    int mex = 0;
    while (reachable.count(mex)) {
        mex++;
    }
    
    return g[state] = mex;
}
```

---

## **9) Common Pitfalls**
* Forgetting termination (cycles break it).
* Mixing up heap types with priority queues.
* Ignoring misere all-ones case.
* Using xor when moves affect multiple heaps.
* Using sets for mex (use bool array).
* Applying SG on partisan or scoring games.
* Not recognizing disguised Nim in matchstick/position/divisor games.

---

## **9) Common Pitfalls**

* Assuming every game is Grundy.
* Forgetting termination (cycles break it).
* Mixing up heap types with priority queues.
* Ignoring misere all-ones case.
* Using xor when moves affect multiple heaps.
* Using sets for mex (use bool array).
* Applying SG on partisan or scoring games.
* Not recognizing disguised Nim in matchstick/position/divisor games.

---

## **10) Glossary (Core + Adjacent Techniques)**

### **Core Game Theory Terms**

* **DAG Model**: Game states form a directed acyclic graph so every play terminates.
* **Impartial Game**: Both players have identical move options from any position.
* **Partisan Game**: Players have different move sets (e.g., chess, checkers).
* **Losing Position**: A position where the player to move will lose with optimal play ($g = 0$).
* **Winning Position**: A position where the player to move can force a win ($g > 0$).
* **mex**: Minimum excludant - the smallest non-negative integer not in a given set.
* **Nim-Sum**: The xor of all heap sizes in a Nim game.
* **Grundy Number**: The mex of all Grundy numbers reachable in one move; represents equivalent Nim heap size.
* **Sprague-Grundy Theorem**: Every finite impartial game is equivalent to a Nim heap of size $g(s)$.
* **Misere Play**: Last player to move loses (opposite of normal play).
* **Normal Play**: Last player to move wins.

### **Graph & Computation Terms**

* **Topological Order**: An ordering of DAG nodes where all edges point forward. Compute Grundy values in reverse topological order so all children are processed before parents.
* **Kahn's Algorithm**: BFS-based topological sort using in-degrees. Add nodes with in-degree 0 to queue, remove edges as you process.
* **Reverse Topological Processing**: For Grundy computation, process nodes in reverse topo order (children before parents) so $g(t)$ is known when computing $g(s)$.
* **State Space DP**: When state space is small and doesn't decompose into independent subgames, use direct DP with $\text{win}[s] = \exists t : \neg \text{win}[t]$.
* **Memoization**: Cache computed game states to avoid recomputation in recursive Grundy functions.

### **Optimization & Patterns**

* **Periodicity**: Some Grundy sequences repeat after a certain point. If you detect the period, you can compute $g(n)$ for large $n$ without full DP.
* **Symmetry Exploitation**: In split games or multi-dimensional games, use symmetry to reduce state space (e.g., only compute for $a \le b$ in splits).
* **Parity Arguments**: In sequential or constrained Nim, sometimes only parity of position or count matters, not full xor.
* **Greedy Observation**: In some variants, the first differing element or leading pile determines the winner without full computation.
* **Precomputation**: For subtraction games with fixed move sets, precompute all Grundy values up to max $n$ once.

### **Common Problem Patterns**

* **Sequential Nim**: Must play on leftmost non-empty pile. Solution often reduces to parity or greedy argument about leading pile.
* **Multi-dimensional Grundy**: Games on grids or with multiple parameters. Compute $g(x, y, \ldots)$ by enumerating all reachable states.
* **Composite Games**: Multiple independent subgames played simultaneously. Total Grundy = xor of individual Grundy numbers.
* **Token Movement on Graph**: Tokens on graph nodes, can move along edges. Compute Grundy for each node in reverse topo order.
* **Divisor Game**: Remove proper divisors from current number. Build DAG of numbers, compute Grundy bottom-up.
* **Subtraction Game**: Remove from fixed set of values $P$. DP with $g[x] = \mathrm{mex}\{g[x-p] : p \in P\}$.
* **Split Game**: Divide heap into unequal parts. Use $g[x] = \mathrm{mex}\{g[a] \oplus g[b] : a + b = x, a \neq b\}$.

### **Things That Are NOT Game Theory**

* **Minimax with Scoring**: If accumulating points rather than "last move wins," use minimax DP on total scores, not Grundy.
* **Probabilistic Games**: If moves involve randomness, Grundy doesn't apply. Use expectation DP.
* **Incomplete Information**: If players can't see full board, not a perfect information game. Game theory techniques don't apply.
* **Optimization Without Opponents**: If there's no adversary (just maximize/minimize some value), it's DP, not game theory.
* **Cooperative Games**: If players work together rather than compete, different theory applies.

---

## **11) TLDR**

* Game theory = two-player, perfect-information, optimal play.
* Nim = xor of heap sizes; $0$ means losing.
* Grundy = DP on DAG of states; $g(s)=\mathrm{mex}\{g(t)\}$.
* mex = minimum excluded value (smallest non-negative integer not in the set).
* XOR combines independent subgames.
* $g=0$ → losing, $g>0$ → winning.
* Use Grundy only for impartial finite games.
* Partisan or scoring games need minimax or score DP instead.
* Misere only changes all-ones Nim.
* Many problems are disguised Nim - look for heap-like structures.
* Topological sort processes game DAGs in correct order.
* Some games reduce to parity/greedy without full Grundy.

---

## **12) Recommended Problems**

* [CSES - Nim Game I](https://cses.fi/problemset/task/1730/)
* [CSES - Stick Game](https://cses.fi/problemset/task/1729/)
* [CSES - Grundy's Game](https://cses.fi/problemset/task/2207/)
* [Codeforces 1382B - Sequential Nim](https://codeforces.com/problemset/problem/1382/B)
* [Codeforces 1191D - Tokitsukaze, CSL and Stone Game](https://codeforces.com/problemset/problem/1191/D)
* [SPOJ - MCOINS](https://www.spoj.com/problems/MCOINS/)
* [AtCoder Library Practice - Grundy Number](https://atcoder.jp/contests/practice2/tasks/grundy)