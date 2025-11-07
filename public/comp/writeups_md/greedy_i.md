
# **The Greedy Family - Series Opener**
Before we start the write up, firstly I welcome you to meet the 6 members of the Greedy Family. Okay and double before the start off, let's ask ourselves the real question here?

## What even is "Greedy?"
At its core, greedy means to build a solution by taking the best local move at every step, no backtracking, no regrets. Hence the namesake, greedy.

You trust that if each step is optimal at the current moment, the final structure is globally optimal.

In math terms, a local rule or invariant is defined, and that rule never breaks across the run.

That's exactly why it works and why we can be greedy. You're not just guessing, you're proving that each local invariant implies global optimality.

If we strip it down:

1. **You have a decision sequence.** Tasks, items, edges, whatever.
2. **You rank or select based on a metric.** Smallest deadline, largest ratio, shortest edge, etc.
3. **You commit immediately.** No undo, no lookahead.
4. **You prove the invariant.** If every step is “safe,” you end up with the optimal result.

That’s greedy in its purest form.

So, greedy isn’t just “sort by X and pray.” It’s a proof style. You pick a local rule that never breaks, defend that invariant, and ride it to global optimality. Master this and greedy problems just become free elo thrown your way.

This series covers the **six greedy families** you encounter contests. Each one has a different invariant, a different vibe, and its own set of traps. I’ll show you the model trigger, the mental picture, and the template that ships clean.

| Part | Family          | Core Pattern                                             | CF Example                                                    |
| :--- | :-------------- | :------------------------------------------------------- | :------------------------------------------------------------ |
| I    | **Selection**   | Sort by metric → process                                 | CF 1029B (Pancakes), CF 602B (Approximating a Constant Range) |
| II   | **Interval**    | Sort intervals → sweep/select                            | CF 1353D (Constructing the Array), CF 830A (Office Keys)      |
| III  | **Incremental** | Add cheapest *safe* piece (heap, DSU, BFS, union builds) | CF 1335E2 (Three Blocks Palindrome), Kruskal, Dijkstra        |
| IV   | **Threshold**   | Binary search + greedy check                             | CF 279B (Books), CF 670D2 (Magic Powder – 2)                  |
| V    | **Game**        | Alternating optimal moves                                | CF 1527C (Sequence Pair Weight), Stone Game                   |
| VI   | **Adaptive**    | State-dependent greedy                                   | CF 1077D (Cutting Out), Set Cover                             |

By the end, you’ll stop saying *“let’s try greedy”* and start *proving* why it works.
Each part dissects the invariant it protects, the edge cases that nuke it, and the exact pivot (DP, flow, or matroid) when the local rule stops holding.

Below, you will find links to my writeups covering the other greedy family members. You don't have to read the series in order, pick and choose whichever you need or feel like reading.

## **Links to Series Content**
* [Greedy I - Selection (This One)](../competitive/greedy_i)
* [Greedy II - Interval](../competitive/greedy_ii)
* [Greedy III - Incremental](../competitive/greedy_iii)
* [Greedy IV - Threshold Feasibility](../competitive/greedy_iv)
* [Greedy V - Game & Competitive](../competitive/greedy_v)
* [Greedy VI - Adaptive & Online](../competitive/greedy_vi)

Otherwise, let's begin.

---

# Greedy I - Selection

This is the first member of the greedy family, selection greedy. You rank items by a single metric, then you process in that order. No backtracking. If the metric is the right one, local best equals global best.

Selection Greedy covers three subtypes: **Pruning**, **Budgeted Gain**, and **Sorting-Driven**.

---


## 0) Core Definitions

### **Selection Greedy**
Choose items by a total order induced by a single key. Process them once. No later step should change the rank of earlier items.

### **Pruning Greedy**
You delete harmful pieces while maintaining a monotone invariant. Example: pop larger digits before smaller digits to minimize the number.

### **Budgeted Greedy**
You have a limited budget $k$. At each step, take the action with maximal marginal benefit per unit cost until the budget is gone.

### **Sorting-Driven Greedy**
Compute a key (ratio, deadline, processing time), sort by that key, then sweep once. Correctness comes from an exchange rule: swapping any two out-of-order items cannot improve the objective.

### **Invariants**
If items are ranked by key $K$ and the objective is additive or monotone, then any adjacent inversion increases cost. So the sorted order is optimal.

---

## 1) Constraints

* Typical $n \le 2 \cdot 10^5$
* Sort once: $O(n \log n)$
* Heap operations: $O(\log n)$
* Monotone stack or single pass: $O(n)$
* Memory: $O(n)$

When not to use it: if later choices re-rank earlier items, or the benefit depends on multiple evolving dimensions. Then you need DP.

---

## 2) Theory Bridge

### **Exchange Argument**
Let $G$ be your greedy order and $O$ any optimal order. If the first items differ, show swapping $G_1$ into $O$ does not worsen the objective. Repeat until the prefixes match. You never need to write more than two paragraphs.

### **Pruning Legality**
For a monotone invariant $I$, if removing an element that violates $I$ strictly improves the objective and never makes future removals worse, repeatedly pruning to restore $I$ is optimal.

### **Budgeted Legality**
If marginal gains are independent and nonincreasing as you apply them, always taking the best remaining marginal gain per cost is optimal. Fractional knapsack is the textbook case because the objective is linear.

### **Sorting-Driven Legality**
For two items $i$ and $j$, prove that the correct order by your key always dominates the opposite order. Smith's rule for minimizing $\sum w_i C_i$ is the classic: sort by $p_i / w_i$.

---

## 3) Spotting The Model

| Statement clue                                 | Technique        |
| :--------------------------------------------- | :--------------- |
| Remove up to $k$ items to minimize or maximize | Pruning Greedy   |
| Use at most $k$ operations or budget $B$       | Budgeted Greedy  |
| Sort by ratio or deadline then pick            | Sorting-Driven   |
| Choose items until a simple constraint breaks  | Selection Greedy |

If items can be compared independently by a single key and the constraint does not re-rank them, it is one of these.

---

## 4) Shapes and Models

| Type            | How to tell                            | Output           | Solver                            | Complexity       | Notes                                                                       |
| :-------------- | :------------------------------------- | :--------------- | :-------------------------------- | :--------------- | :-------------------------------------------------------------------------- |
| Pruning Greedy  | Violations are local and monotone      | Reduced sequence | Monotone stack or block scan      | $O(n)$           | Keep one per block or maintain nondecreasing stack                          |
| Budgeted Greedy | Limited moves or currency              | Chosen actions   | Sort or max heap on marginal gain | $O(n \log n)$    | Fractional is exact, integral often heuristic unless you prove independence |
| Sorting-Driven  | Clear job key: ratio, deadline, length | Ordered schedule | Sort + one pass                   | $O(n \log n)$    | Most scheduling basics live here                                            |

---

## 5) Algorithms

**Pruning Greedy**
Maintain an invariant like nondecreasing digits. While the last kept item violates it and you still have budget to delete, pop it. Blocks with a single rule are independent: for a run of equal items with costs, keep the maximum cost and remove the rest.

**Budgeted Greedy**
Each step, pick the action with highest marginal gain per unit cost. Use a max heap if gains change dynamically, or sort once if gains are static.

**Sorting-Driven**
Prove a two-item swap rule that defines a strict total order. Sort by that key, then sweep. For lateness, sort by deadline. For minimizing $\sum C_i$, sort by processing time. For $\sum w_i C_i$, sort by $p_i/w_i$.

---

## 6) Templates

### Pruning: Remove K Digits (Monotone Stack) $O(n)$

```cpp
#include <bits/stdc++.h>
using namespace std;

string removeKdigits(string num, int k) {
    string st;
    
    for (char c : num) {
        while (!st.empty() && k > 0 && st.back() > c) {
            st.pop_back();
            --k;
        }
        
        if (!st.empty() || c != '0') st.push_back(c);
    }
    
    while (k > 0 && !st.empty()) {
        st.pop_back();
        --k;
    }
    
    return st.empty() ? "0" : st;
}
```

### Pruning: Keep One Per Same-Color Block (Rope Colorful) $O(n)$

```cpp
#include <bits/stdc++.h>
using namespace std;

long long minTimeColorful(const string& colors, const vector<int>& t) {
    long long res = 0;
    int n = (int)colors.size();
    
    for (int i = 0; i < n; ) {
        int j = i;
        
        long long sum = 0;
        int mx = 0;
        
        while (j < n && colors[j] == colors[i]) {
            sum += t[j];
            mx = max(mx, t[j]);
            ++j;
        }
        
        res += sum - mx;        // delete all but the most expensive keeper
        i = j;
    }
    
    return res;
}
```

### Budgeted: Repeated Best Action With Max Heap $O(n \log n)$

Example: apply a discount operation $k$ times to the current largest value.

```cpp
#include <bits/stdc++.h>
using namespace std;

long long maxAfterKOps(vector<long long> a, int k) {
    priority_queue<long long> pq(a.begin(), a.end());
    
    while (k-- > 0 && !pq.empty()) {
        long long x = pq.top();
        pq.pop();
        
        long long y = x / 2;          // example operation: halve
        pq.push(y);
    }
    
    long long res = 0;
    
    while (!pq.empty()) {
        res += pq.top();
        pq.pop();
    }
    
    return res;
}
```

### Sorting-Driven: Tasks and Deadlines (Minimize Sum of Lateness-like Objective)

```cpp
#include <bits/stdc++.h>
using namespace std;

// CSES "Tasks and Deadlines": maximize sum(d_i - completion_i) equals minimize sum(completion_i)
long long tasksAndDeadlines(vector<pair<long long,long long>> job) { // (duration, deadline)
    sort(job.begin(), job.end(), [](auto a, auto b){ return a.first < b.first; }); // shortest processing first
    long long t = 0, score = 0;
    for (auto [p, d] : job) {
        t += p;
        score += (d - t);
    }
    return score;
}
```

---

## 7) Worked Examples

### **Codeforces 160A - Twins (Budgeted Greedy by Sorting Descending)**

#### **Problem**
Given coin values, pick a minimal count whose sum is strictly greater than the sum of the remaining coins.

#### **Why Selection Greedy**
Sort coins descending and keep taking the largest until your sum exceeds the rest. If you ever skip a bigger coin for a smaller one, you need at least as many coins to reach the same sum. Two-item swap proves the order.

#### **Complexity** $O(n \log n)$

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    int n; 
    if (!(cin >> n)) return 0;
    
    vector<int> a(n);
  
    long long sum = 0;
    
    for (int i = 0; i < n; ++i) {
        cin >> a[i];
        sum += a[i];
    }
    
    sort(a.begin(), a.end(), greater<int>());
    
    long long me = 0; 
    int res = 0;
    
    for (int x : a) {
        me += x; ++res;
        if (me > sum - me) break;
    }
    
    cout << res << "\n";
}
```

---

### **CSES - Tasks and Deadlines (Sorting-Driven by Processing Time)**

#### **Problem**
Each job has duration $p_i$ and deadline $d_i$. Maximize $\sum (d_i - C_i)$ where $C_i$ is completion time.

#### **Why Selection Greedy**
Maximizing $\sum (d_i - C_i)$ is equivalent to minimizing $\sum C_i$. The pairwise swap rule shows shortest processing time first is optimal. Sorting by $p_i$ is enough.

#### **Complexity**
$O(n \log n)$

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    int n; 
    cin >> n;
    
    vector<pair<long long,long long>> job(n); // (p, d)
    
    for (int i = 0; i < n; ++i) cin >> job[i].first >> job[i].second;
    
    sort(job.begin(), job.end(), [](auto a, auto b){ return a.first < b.first; });
    
    long long t = 0, res = 0;
    
    for (auto [p, d] : job) {
        t += p;
        res += (d - t);
    }
    
    cout << res << "\n";
}
```

---

### **AtCoder ABC 141 D - Powerful Discount Tickets (Budgeted Greedy with Heap)**

#### **Problem**
Given prices and $m$ discount tickets. Each ticket turns the current largest price $x$ into $\lfloor x/2 \rfloor$. Use all tickets to minimize the sum.

#### **Why Selection Greedy**
Each discount is most valuable on the largest available price. Use a max heap, apply the discount to the top, and push back the reduced price. Repeat.

#### **Complexity**
$O(n + m \log n)$

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    int n, m; 
    cin >> n >> m;
    
    priority_queue<long long> pq;
    
    for (int i = 0; i < n; ++i) {
        long long x; cin >> x; pq.push(x);
    }
    
    while (m-- > 0) {
        long long x = pq.top(); pq.pop();
        pq.push(x / 2);
    }
    
    long long res = 0;
    
    while (!pq.empty()) {
        res += pq.top();
        pq.pop();
    }
    
    cout << res << "\n";
}
```

---

### **LeetCode 1578 - Minimum Time to Make Rope Colorful (Pruning by Blocks)**

#### **Problem**
String of colors and removal times. No two adjacent equal colors can remain. Minimize removal time.

#### **Why Selection Greedy**
Split the string into maximal blocks of identical color. In each block of length $b$ you must delete $b-1$ items. To minimize time, keep the balloon with maximum keep-cost and remove the rest. Blocks are independent, so sum over blocks.

#### **Complexity**
$O(n)$

```cpp
#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int minCost(string colors, vector<int>& neededTime) {
        long long res = 0;
        int n = colors.size();
        
        for (int i = 0; i < n; ) {
            int j = i;
            long long sum = 0;
            
            int mx = 0;
            
            while (j < n && colors[j] == colors[i]) {
                sum += neededTime[j];
                mx = max(mx, neededTime[j]);
                ++j;
            }
            
            res += sum - mx;
            i = j;
        }
        return res;
    }
};
```

---

## 8) Common Pitfalls

* Pruning without a monotone invariant. If deleting something can create a new violation behind you, your one-pass stack is not sufficient.
* Ratio sorts with floating comparison. Use cross multiplication to avoid precision bugs.
* Wrong tie breaks. Equal keys need a deterministic secondary key or you can break the invariant. For example, queue reconstruction by height requires a specific secondary ordering.
* Hidden coupling. If choosing item A changes the true gain of item B in a nonlocal way, this family is the wrong tool.
* Forgetting leading zeros after pruning digits. Normalize the output.

---

## 9) TLDR

* One metric to rule them all. If you cannot name it in one line, it is not Selection Greedy.
* Defend a two-item swap rule or a monotone invariant. That is your proof.
* Use a stack for pruning, a heap for repeated best-action, and a single sort for scheduling.
* Expect $O(n \log n)$. With a stack it often drops to $O(n)$.
* If later choices can re-rank earlier items, switch to DP.

---

## 10) Recommended Problems

* [Codeforces 160A - Twins](https://codeforces.com/problemset/problem/160/A)
* [CSES - Tasks and Deadlines](https://cses.fi/problemset/task/1630/)
* [AtCoder ABC 141 D - Powerful Discount Tickets](https://atcoder.jp/contests/abc141/tasks/abc141_d)
* [Codeforces 702A - Maximum Increase](https://codeforces.com/problemset/problem/702/A)
* [Codeforces 1490C - Sum of Cubes](https://codeforces.com/problemset/problem/1490/C)
* [LeetCode 402 - Remove K Digits](https://leetcode.com/problems/remove-k-digits/)
* [LeetCode 1578 - Minimum Time to Make Rope Colorful](https://leetcode.com/problems/minimum-time-to-make-rope-colorful/)

---

## Glossary

- **Block scan**: linear pass that groups consecutive equal-key items into maximal blocks, processes each block independently, then advances. Used when constraints are local within runs.
- **Monotone stack**: stack that maintains a monotone property (nondecreasing or nonincreasing). Push while keeping the property, pop when violated. Enables $O(n)$ pruning.
- **Exchange argument**: two-item swap proof. Show that any adjacent inversion by the key cannot improve the objective, so the sorted order is optimal.
- **Marginal gain per cost**: benefit added by the next unit of action divided by its cost. The greedy choice is to pick the maximum available ratio at each step when gains are independent and nonincreasing.
- **Inversion**: a pair of items that appear out of the intended key order. Fixing inversions step by step leads to optimal order in sorting-driven proofs.
- **Heap**: priority queue data structure that supports $O(\log n)$ insert and extract-max or extract-min. Use for repeated best-action selection.