# Greedy II - Interval

Meet the second family member of greedy, interval. You simply sort interval endpoints, then you either pick a compatible set, count overlaps, assign resources, or merge coverage. The invariant is time order. If you add weights, greedy usually breaks and you switch to DP.

---

## 0) Core Definitions

### Interval Scheduling
Pick the maximum number of non-overlapping intervals. Greedy by earliest finish is optimal.

### Interval Partitioning
Assign a minimal number of resources so no overlapping intervals share a resource. Solve by a sweep with a min-heap of current end times.

### Event Sweep
Convert intervals to point events (start, end), sort by time with a precise tie rule, scan while maintaining active count or sets.

### Interval Union
Merge overlapping intervals to produce disjoint blocks or compute total covered length.

### Semantics
Decide your convention and keep it consistent:
- Half-open $[s, e)$: end does not overlap the next start. Process end before start at equal times.
- Closed $[s, e]$: equality overlaps. Process start before end at equal times.

---

## 1) Constraints

- $n \le 2 \cdot 10^5$
- Sort once: $O(n \log n)$
- Heap operations: $O(\log n)$ per event
- One scan after sort: $O(n)$
- Memory: $O(n)$

Greedy fails when weights on intervals matter or when choosing a short interval blocks a heavy one later. Use DP on sorted intervals for those.

---

## 2) Theory Bridge

### Earliest Finish Is Optimal
If your schedule picks interval $J$ first but there exists a compatible interval $I$ with $f(I) \le f(J)$, replacing $J$ with $I$ never reduces the remaining feasible set. Repeating this swap shows the schedule sorted by finish times is optimal.

### Minimum Rooms Equals Peak Overlap
At any time $t$, you need at least as many rooms as the number of intervals active at $t$. A sweep that reuses the earliest finishing room whenever possible attains this bound, so it is minimal.

### Tie Rules Are Part of the Proof
Your event ordering defines overlap semantics. If you model $[s, e)$, an interval ending at $t$ frees a resource before another starting at $t$ uses it. The sort must reflect that.

---

## 3) Spotting The Model

| Statement clue | Technique |
| :-- | :-- |
| Maximize the number of non-overlapping intervals | earliest-finish scheduling |
| Min rooms or platforms with full assignment | sweep with a min-heap of ends and reuse |
| Count the maximum number of simultaneous intervals | event sweep and track peak |
| Compute union length of intervals | sort by start and merge blocks |
| Assign room indices while minimizing total rooms | sweep with room id reuse |

---

## 4) Shapes and Models

| Type | How to tell | Output | Solver | Complexity | Notes |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Scheduling (max non-overlap) | choose compatible subset | count or list | sort by end, greedy keep | $O(n \log n)$ | classic exchange proof |
| Partitioning (min rooms) | assign resource ids | room count and ids | sweep + min-heap of ends | $O(n \log n)$ | equals peak overlap |
| Event counting | track active set size | max overlap or timeline | prefix over events | $O(n \log n)$ | tie rule defines overlap |
| Union merge | combine overlaps | disjoint blocks or total length | sort by start, merge | $O(n \log n)$ | 64-bit sums if needed |

---

## 5) Algorithms

**Max Non-Overlapping Intervals**  
Sort by finish time. Keep an interval if its start $\ge$ last kept finish. Exchange argument certifies correctness.

**Minimum Rooms With Assignments**  
Sort by start time. Maintain a min-heap of $(\text{end}, \text{room\_id})$. Reuse the room whose end $\le$ current start, else allocate a new room. Track the maximum heap size.

**Event Sweep Counting**  
Create starts as $(t, +1)$ and ends as $(t, -1)$. Sort by time with a consistent tie rule. Scan, update a running count, track the maximum.

**Merge To Union**  
Sort by start, extend the current block while next start $\le$ current end, otherwise close the block and start a new one.

---

## 6) Templates

### Scheduling: Max Non-Overlapping by Earliest Finish
```cpp
#include <bits/stdc++.h>
using namespace std;

int maxNonOverlap(vector<pair<long long,long long>> seg) {
    sort(seg.begin(), seg.end(), [](auto a, auto b){
        if (a.second != b.second) return a.second < b.second;
        return a.first < b.first;
    });
    
    long long last = LLONG_MIN;
    int cnt = 0;
    
    for (auto [s, e] : seg) {
        if (s >= last) {
            ++cnt;
            last = e;
        }
    }
}
```

### Partitioning: Min Rooms With Room Ids
```cpp
#include <bits/stdc++.h>
using namespace std;

// Input: n intervals [s, e), output: (rooms_used, assignment by original index, 1-indexed room ids)
pair<int, vector<int>> roomAllocation(vector<array<int,3>> a) {
    // a[i] = {start, end, index}
    sort(a.begin(), a.end(), [](auto x, auto y){
        if (x[0] != y[0]) return x[0] < y[0];

        return x[1] < y[1];
    });
    
    // busy rooms: (end, room_id)
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> busy;
    // free room ids
    priority_queue<int, vector<int>, greater<int>> free_ids;

    vector<int> res(a.size());
    int next_id = 1;
    int peak = 0;

    for (auto [s, e, idx] : a) {
        while (!busy.empty() && busy.top().first <= s) {
            free_ids.push(busy.top().second);
            busy.pop();
        }
        
        int rid;
        
        if (!free_ids.empty()) {
            rid = free_ids.top(); free_ids.pop();
        }
        
        else {
            rid = next_id++;
        }
        
        res[idx] = rid;
        busy.push({e, rid});
        
        peak = max(peak, (int)busy.size());
    }
    return {peak, res};
}
```

### **Event Sweep: Peak Overlap (Closed Semantics)**
```cpp
#include <bits/stdc++.h>
using namespace std;

// For closed semantics [s, e] where equality overlaps: process start before end at equal time.
long long peakOverlapClosed(const vector<pair<long long,long long>>& seg) {
    vector<pair<long long,int>> ev;
    ev.reserve(seg.size() * 2);
    
    for (auto [s, e] : seg) {
        ev.push_back({s, +1});
        ev.push_back({e, -1});
    }
    
    sort(ev.begin(), ev.end(), [](auto a, auto b){
        if (a.first != b.first) return a.first < b.first;
        return a.second > b.second; // +1 before -1 at same time
    });
    
    long long cur = 0, best = 0;
    
    for (auto [t, v] : ev) {
        cur += v;
        best = max(best, cur);
    }
    
    return best;
}
```

### **Event Sweep: Peak Overlap (Half-Open Semantics)**
```cpp
#include <bits/stdc++.h>
using namespace std;

// For half-open semantics [s, e) where equality does not overlap: process end before start at equal time.
long long peakOverlapHalfOpen(const vector<pair<long long,long long>>& seg) {
    vector<pair<long long,int>> ev;
    ev.reserve(seg.size() * 2);
    
    for (auto [s, e] : seg) {
        ev.push_back({s, +1});
        ev.push_back({e, -1});
    }
    
    sort(ev.begin(), ev.end(), [](auto a, auto b){
        if (a.first != b.first) return a.first < b.first;
        return a.second < b.second; // -1 before +1 at same time
    });
    
    long long cur = 0, best = 0;
    
    for (auto [t, v] : ev) {
        cur += v;
        best = max(best, cur);
    }
    return best;
}
```

### **Merge Intervals To Total Covered Length**
```cpp
#include <bits/stdc++.h>
using namespace std;

long long totalCoveredLength(vector<pair<long long,long long>> seg) {
    if (seg.empty()) return 0;
    
    sort(seg.begin(), seg.end());
    
    long long L = seg[0].first, R = seg[0].second, res = 0;
    
    for (int i = 1; i < (int)seg.size(); ++i) {
        auto [s, e] = seg[i];
        
        if (s > R) {
            res += R - L;
            L = s; R = e;
        }
        
        else {
            R = max(R, e);
        }
    }
    
    res += R - L;
    return res;
}
```

---

## 7) Worked Examples

### **CSES - Movie Festival**

#### **Problem**
Pick the maximum number of non-overlapping movies.

#### **Why Interval Greedy**
Sort by end time. Keep a movie if its start $\ge$ last end. Two-interval swap shows earliest finish never hurts future feasibility.

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
    
    vector<pair<int,int>> a(n);
    
    for (int i = 0; i < n; ++i) cin >> a[i].first >> a[i].second;
    
    sort(a.begin(), a.end(), [](auto x, auto y){
        if (x.second != y.second) return x.second < y.second;
        return x.first < y.first;
    });
    
    int cnt = 0;
    int last = INT_MIN;
    
    for (auto [s, e] : a) {
        if (s >= last) {
            ++cnt;
            last = e;
        }
    }
    cout << cnt << "\n";
}
```

---

### CSES - Room Allocation

#### **Problem**
Assign room ids to all intervals and print the minimum number of rooms used.

#### **Why Interval Greedy**
Sort by start. Reuse the room whose end $\le$ current start, else create a new room. The heap size peak equals the reswer.

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
    
    vector<array<int,3>> a(n);
    
    for (int i = 0; i < n; ++i) {
        int s, e;
        cin >> s >> e;
        a[i] = {s, e, i};
    }
    
    sort(a.begin(), a.end(), [](auto x, auto y){
        if (x[0] != y[0]) return x[0] < y[0];
        return x[1] < y[1];
    });

    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> busy;
    priority_queue<int, vector<int>, greater<int>> free_ids;

    vector<int> res(n);
    int next_id = 1;
    int peak = 0;

    for (auto [s, e, idx] : a) {
        while (!busy.empty() && busy.top().first <= s) {
            free_ids.push(busy.top().second);
            busy.pop();
        }
        
        int rid;
        
        if (!free_ids.empty()) {
            rid = free_ids.top();
            free_ids.pop();
        }
        
        else {
            rid = next_id++;
        }
        
        res[idx] = rid;
        busy.push({e, rid});
        
        peak = max(peak, (int)busy.size());
    }

    cout << peak << "\n";
    
    for (int i = 0; i < n; ++i) {
        cout << res[i] << (i + 1 == n ? '\n' : ' ');
    }
}
```

---

### **CSES - Restaurant Customers**

### **Problem**
Given arrivals and departures, find the maximum number of customers present at once.

#### **Why Interval Greedy**
Closed semantics for this task. Process start before end at equal times. Scan a sorted event list, track the peak active count.

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
    
    vector<pair<int,int>> ev;
    ev.reserve(2 * n);
    
    for (int i = 0; i < n; ++i) {
        int a, b; 
        cin >> a >> b;
        
        ev.push_back({a, +1}); // arrival
        ev.push_back({b, -1}); // departure
    }
    sort(ev.begin(), ev.end(), [](auto x, auto y){
        if (x.first != y.first) return x.first < y.first;
        return x.second > y.second; // +1 before -1 for closed semantics
    });
    
    int cur = 0, best = 0;
    
    for (auto [t, v] : ev) {
        cur += v;
        best = max(best, cur);
    }
    
    cout << best << "\n";
}
```

---

### LeetCode 56 - Merge Intervals

#### **Problem**
Merge a list of intervals into disjoint blocks.

#### **Why Interval Greedy**
Sort by start, extend the current block while the next start $\le$ current end. Write the block when you see a gap.

#### **Complexity**
$O(n \log n)$

```cpp
#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        if (intervals.empty()) return {};
        
        sort(intervals.begin(), intervals.end());
        
        vector<vector<int>> res;
        
        int L = intervals[0][0], R = intervals[0][1];
        
        for (int i = 1; i < (int)intervals.size(); ++i) {
            int s = intervals[i][0], e = intervals[i][1];
            
            if (s > R) {
                res.push_back({L, R});
                L = s; R = e;
            }
            
            else {
                R = max(R, e);
            }
        }
        
        res.push_back({L, R});
        return res;
    }
};
```

---

## 8) Common Pitfalls

- Wrong tie rule. Decide closed or half-open and sort events accordingly.
- Sorting by start time for scheduling. Earliest finish wins for max non-overlap.
- Reuse condition off by one. For half-open use end $\le$ start to reuse.
- Forgetting 64-bit when summing covered lengths or working with large times.
- Weighted variants. If interval profits differ, this family usually needs DP on sorted ends.

---

## 9) TLDR

- Scheduling: sort by end and keep if start $\ge$ last end.
- Partitioning: sweep with a min-heap of ends and reuse rooms greedily.
- Event counting: build events with a consistent tie rule and scan.
- Union: sort by start, merge overlaps, sum lengths.
- If weights matter, reach for DP, not greedy.

---

## 10) Recommended Problems
* [CSES - Movie Festival](https://cses.fi/problemset/task/1629/)
* [CSES - Room Allocation](https://cses.fi/problemset/task/1164/)
* [CSES - Restaurant Customers](https://cses.fi/problemset/task/1619/)
* [Codeforces 1705C - Mark and His Unfinished Essay](https://codeforces.com/problemset/problem/1705/C)
* [Codeforces 1665B - Array Cloning Technique](https://codeforces.com/problemset/problem/1665/B)
* [AtCoder ABC 217 D - Cutting Woods](https://atcoder.jp/contests/abc217/tasks/abc217_d)
* [LeetCode 56 - Merge Intervals](https://leetcode.com/problems/merge-intervals/)


## Glossary

- **Block scan**: linear pass that groups consecutive equal-key items into maximal blocks, processes each block independently, then advances. Used when constraints are local within runs.
- **Monotone stack**: stack that maintains a monotone property (nondecreasing or nonincreasing). Push while keeping the property, pop when violated. Enables $O(n)$ pruning.
- **Exchange argument**: two-item swap proof. Show that any adjacent inversion by the key cannot improve the objective, so the sorted order is optimal.
- **Marginal gain per cost**: benefit added by the next unit of action divided by its cost. The greedy choice is to pick the maximum available ratio at each step when gains are independent and nonincreasing.
- **Inversion**: a pair of items that appear out of the intended key order. Fixing inversions step by step leads to optimal order in sorting-driven proofs.
- **Heap**: priority queue data structure that supports $O(\log n)$ insert and extract-max or extract-min. Use for repeated best-action selection.