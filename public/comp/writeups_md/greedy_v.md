# **Greedy V - Game And Competitive**

So this is our fifth member of the Greedy Family. Two players alternate moves on the same resource pool. You win by maximizing your margin under perfect play. Greedy in games is fragile. It works only when the state has a simple invariant or a dominance rule. Otherwise use DP or [Sprague-Grundy.](../competitive/nim_grundy)

## **Links to Series Content**
* [Greedy I - Selection](../competitive/greedy_i)
* [Greedy II - Interval](../competitive/greedy_ii)
* [Greedy III - Incremental](../competitive/greedy_iii)
* [Greedy IV - Threshold Feasibility](../competitive/greedy_iv)
* [Greedy V - Game & Competitive (This One)](../competitive/greedy_v)
* [Greedy VI - Adaptive & Online](../competitive/greedy_vi)

---

## **0) Core Definitions**

### **Zero–Sum Alternation**
Two players take turns from a common state. Your gain is opponent’s loss. Payoff is the score difference.

### **Greedy Move**
A move that maximizes your immediate margin under the assumption the opponent will do the same. Valid only if a dominance rule or invariant guarantees global optimality.

### **Pair Cancellation Game**
Moves consume complementary pairs from the multiset. Winner is decided by the parity of possible cancellations.

### **Nim–Type Heap Game**
Players remove tokens under rules that decompose into independent heaps. Normal Nim is solved by XOR.

### **Invariant**
A property of the state that remains true after any legal move. If a simple invariant determines win/lose, greedy choice is safe.

---

## **1) Constraints**

* Typical $n \le 2 \cdot 10^5$. Sorting once: $O(n \log n)$. One pass or counting: $O(n)$.
* Use $O(1)$ or $O(\log n)$ updates per move if you simulate.
* When to use greedy: symmetric pool, independent choices, or a closed–form invariant (parity, XOR, majority).
* When to avoid: values depend on future branching, or there is state coupling across choices. Then use DP on intervals or Grundy numbers.

Pitfalls with why they fail:

* “Take the largest each turn” on an ends–picking array fails. Opponent can fork you. Use interval DP.
* Simulating moves when a closed form exists (pair cancellations) wastes time and TLEs.
* Misère conditions (last move loses) flip Nim answers. Know your variant.

---

## **2) Theory Bridge**

**Dominance for Symmetric Pools**
If both players draw from the same multiset and the score is additive, sorting by value and alternating picks produces the same margin as any optimal play when there is no positional constraint. Proof is an exchange: delaying a larger pick cannot increase your margin because the opponent can always seize it first.

**Pair Cancellation Invariants**
In games where a move removes a complementary pair, the number of legal moves equals the number of such pairs. If the game halts when no pair remains, the winner is decided by the parity of the move count.

**Nim XOR Rule**
In normal Nim, a position is losing iff the XOR of heap sizes is $0$. The optimal greedy move is “move to XOR $0$.” That is greedy because a single local change enforces the global invariant.

---

## **3) Spotting The Model**

| Statement clue                                          | Technique                      |
| :------------------------------------------------------ | :----------------------------- |
| Players alternately remove complementary pairs          | Pair cancellation, count pairs |
| Players pick values from one shared multiset            | Sort by value, alternate picks |
| “Take from piles, last move wins” with free pile choice | Nim XOR                        |
| “Pick from either end of an array”                      | Not greedy, interval DP        |
| “Graph tokens with move rules per node”                 | Grundy numbers, not greedy     |

---

## **4) Shapes And Models**

| Type                   | How to tell                              | Output        | Solver                     | Complexity                     | Notes                  |
| :--------------------- | :--------------------------------------- | :------------ | :------------------------- | :----------------------------- | :--------------------- |
| Pair cancellation      | Move removes a $01$/$10$ pair or similar | winner        | count pairs, parity        | $O(n)$                         | CF “01 Game” archetype |
| Symmetric value picks  | Both draw from one multiset by value     | margin/winner | sort, alternate accumulate | $O(n \log n)$                  | Dominance via exchange |
| Simple heap game (Nim) | Remove any tokens from one heap per move | winner        | XOR of heap sizes          | $O(n)$                         | Normal play only       |
| Ends picking on array  | Take $a[l]$ or $a[r]$ each turn          | max margin    | DP on intervals            | $O(n^2)$ or $O(n)$ with tricks | Greedy loses           |
| Constrained heap moves | Remove per rule set from heaps           | winner        | Grundy numbers             | Varies                         | Greedy not reliable    |

---

## **5) Algorithms**

### **Pair Cancellation Parity**

Count how many disjoint cancellations are possible. Winner is decided by the parity of that count. Often reduces to $\min(\text{count0}, \text{count1}) \bmod 2$.

### **Symmetric Alternate Picking**

Sort values descending. Player A takes indices with even turns, Player B with odd. Compare totals to decide winner.

### **Nim Greedy Move**

Compute XOR $S$. If $S = 0$, the position is losing. Otherwise take from some heap with leading bit in $S$ to make XOR zero. That is the unique greedy rule backed by theory.

---

## **6) Templates**

### **Pair Cancellation Game: Count And Parity ($O(n)$)**

```cpp
#include <bits/stdc++.h>
using namespace std;

string solve_pair_cancellation(const string &s) {
    int zeros = 0, ones = 0;

    for (char c : s) {
        if (c == '0') ++zeros;
        else if (c == '1') ++ones;
    }

    int moves = min(zeros, ones);

    return (moves % 2 == 1) ? "First" : "Second";
}
```

### **Symmetric Alternate Picking From One Pool ($O(n \log n)$)**

```cpp
#include <bits/stdc++.h>
using namespace std;

string winner_by_alternate_picks(vector<long long> a) {
    sort(a.begin(), a.end(), greater<long long>());

    long long A = 0, B = 0;

    for (int i = 0; i < (int)a.size(); ++i) {
        if (i % 2 == 0) A += a[i];
        else B += a[i];
    }
    
    if (A > B) return "First";
    if (B > A) return "Second";

    return "Draw";
}
```

### **Normal Nim: XOR Rule ($O(n)$)**

```cpp
#include <bits/stdc++.h>
using namespace std;

string nim_winner(const vector<long long> &heaps) {
    long long x = 0;
    for (long long h : heaps) x ^= h;

    return (x == 0) ? "Second" : "First";
}
```

---

## **7) Worked Examples**

### **Game With Sticks - Codeforces 451A**

#### **Problem Link**

https://codeforces.com/problemset/problem/451/A

#### **Problem**

There is an $n \times m$ grid of intersections. Players alternately remove one unused intersection and all sticks incident to it. The one who cannot move loses. Print the winner names given in the statement.

#### **Why Game Greedy**

Each move reduces both $n$ and $m$ effectively by consuming one shared intersection on the smaller side. The total number of moves equals $\min(n, m)$. Winner is decided by parity.

#### **Complexity**

$O(1)$.

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;

    int moves = min(n, m);
    
    cout << (moves % 2 == 1 ? "Akshat" : "Malvika") << "\n";
}
```

---

### **01 Game - Codeforces 1373B**

#### **Problem Link**

https://codeforces.com/problemset/problem/1373/B

#### **Problem**

Given a binary string, players alternately remove any adjacent pair “01” or “10.” If a player cannot move, they lose. Determine the winner.

#### **Why Game Greedy**

Each move consumes one zero and one one. The number of moves is $\min(#0, #1)$. Winner is “First” if this count is odd.

#### **Complexity**

$O(n)$.

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int T;
    cin >> T;

    while (T--) {
        string s;
        cin >> s;

        int zeros = 0, ones = 0;
        
        for (char c : s) {
            zeros += (c == '0');
            ones += (c == '1');
        }

        int moves = min(zeros, ones);
        
        cout << (moves % 2 == 1 ? "DA" : "NET") << "\n";
    }
}
```

---

### **Normal Nim - Classic**

#### **Problem**

Given $k$ heaps with sizes $h_i$. Players alternately take any positive number of tokens from a single heap. Last move wins. Output the winner.

#### **Why Game Greedy**

The XOR invariant solves it. If $\bigoplus h_i = 0$ then the position is losing. Otherwise move to make XOR zero. That greedy move is optimal by theory.

#### **Complexity**

$O(k)$.

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int k;
    cin >> k;
    vector<long long> h(k);

    long long x = 0;
    
    for (int i = 0; i < k; ++i) {
        cin >> h[i];
        x ^= h[i];
    }
    
    cout << (x == 0 ? "Second" : "First") << "\n";
}
```

---

## **8) Common Pitfalls**

* Picking ends greedily on arrays
  Why: opponent can force bad parity. Fix: use interval DP (CSES Removal Game).

* Misère Nim confusion
  Why: last move loses changes the rule. Fix: handle the all–ones case specially.

* Over–simulating pair cancellations
  Why: linear counting is enough. Fix: compute counts and parity directly.

* Assuming “take the largest” is always optimal
  Why: positional constraints break symmetry. Fix: prove dominance or switch to DP.

* Ignoring draw states
  Why: some problems ask for margin or tie handling. Fix: check equality before naming a winner.

---

## **9) TLDR**

* Greedy in games is legal when a one–line invariant decides the winner: parity, $\min(#0,#1)$, or XOR.
* Symmetric pool with additive scores allows sort and alternate picking.
* Pair cancellation games reduce to parity of cancellations.
* Normal Nim is XOR zero for loss, and the greedy move is “move to XOR zero.”
* Ends–picking arrays and graph games need DP or Grundy. Do not force greedy there.

---

## **10) Recommended Problems**

* [Codeforces 451A - Game With Sticks](https://codeforces.com/problemset/problem/451/A)
* [Codeforces 1373B - 01 Game](https://codeforces.com/problemset/problem/1373/B)
* [Codeforces 1191B - Tokitsukaze, CSL And Stone Game](https://codeforces.com/problemset/problem/1191/B)
* [Codeforces 1395A - Boboniu Likes To Color Balls](https://codeforces.com/problemset/problem/1395/A)
* [CSES - Removal Game](https://cses.fi/problemset/task/1097/)
* [LeetCode 877 - Stone Game](https://leetcode.com/problems/stone-game/)
* [LeetCode 486 - Predict The Winner](https://leetcode.com/problems/predict-the-winner/)

## **Glossary**

* **Normal play**: last move wins.
* **Misère play**: last move loses.
* **Grundy number**: mex of successor Grundy values. Position is losing iff Grundy is $0$.
* **XOR invariant**: bitwise XOR of heap sizes in Nim that decides winning status.
* **Dominance**: a choice that never hurts compared to any alternative, enabling greedy correctness.
