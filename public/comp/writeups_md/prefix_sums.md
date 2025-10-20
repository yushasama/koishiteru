# Why Prefix Sums Are Awesome

Prefix sums are one of the strongest tools in CP because instead of recalculating a subarray sum each time, you precompute:

$$
pre[i] = a_0 + a_1 + \dots + a_i
$$

Then any subarray sum $[l..r]$ is:

$$
\text{sum}(l..r) = pre[r] - pre[l-1]
$$

So instead of $O(n^2)$ brute force, you drop to $O(n)$ with one subtraction. When combined with mods, sets, or bitsets, you get all sorts of feasibility checks.

---

## Divisible Subarray (Mod Trick)
Subarray divisibility reduces to checking duplicate remainders.

$$
(pre[r] - pre[l]) \bmod n = 0
\quad \iff \quad
pre[r] \bmod n = pre[l] \bmod n
$$

```cpp
int n;
cin >> n;
vector<int> a(n), pre(n+1);

for (int i = 0; i < n; i++) {
    cin >> a[i];
    pre[i+1] = pre[i] + a[i];
}

unordered_map<int, long long> freq;
long long res = 0;

for (int i = 0; i <= n; i++) {
    int rem = (pre[i] % n + n) % n;
    res += freq[rem];
    freq[rem]++;
}

cout << res << "\n";
```

---

## Exact Target Subarray

$$
pre[r] - pre[l] = \text{target}
\quad \iff \quad
pre[l] = pre[r] - \text{target}
$$

```cpp
int n, target;
cin >> n >> target;
vector<int> a(n);

for (int i = 0; i < n; i++) cin >> a[i];

unordered_set<long long> seen;
seen.insert(0);

long long prefix = 0;
for (int x : a) {
    prefix += x;
    if (seen.count(prefix - target)) {
        cout << "YES\n";
        return 0;
    }
    seen.insert(prefix);
}
cout << "NO\n";
```

---

## Bitset Feasibility

If the max sum $\Omega$ is small or dense, collapse into a bitset.

```cpp
int target = 50;
vector<int> nums = {3, 7, 11};

bitset<1001> dp;
dp[0] = 1;

for (int x : nums) {
    dp |= (dp << x);
}

cout << (dp[target] ? "YES" : "NO") << "\n";
```

$$
dp[j] = \text{true if some subset makes sum } j
$$

Bit shifting = forward-spread reachability.

---

## When To Use

* **Prefix Sums:** Subarray sums, divisibility, exact targets
* **Maps/Sets:** Sparse or huge state space
* **Bitset:** Small, dense state space

---

## Why Prefix Sums Are Awesome

* Drop $O(n^2)$ subarray loops into $O(n)$
* Transform “does subarray exist?” into “did we see this prefix value/remainder?”
* Easy to combine with hash sets, bitsets, or rolling DP states

---

## Beyond Plain Arrays: Fenwick / Segment Tree

Prefix sums are just the static version.
When the array **doesn’t change**, `pre[i] = cumulative sum` is perfect.
But if you have **updates + queries**, you need a data structure that simulates prefix sums dynamically.

* **Fenwick Tree (Binary Indexed Tree):**
  Stores partial sums in a clever bit layout.
  Query: $O(\log n)$ for prefix sum.
  Update: $O(\log n)$.
  Basically a dynamic prefix sum array.

* **Segment Tree:**
  Generalizes prefix sums further.
  Can store sums, mins, max, gcd, etc.
  Query: $O(\log n)$.
  Update: $O(\log n)$.
  Think of it as “prefix sums, but with range queries and updates.”

So the math stays the same:

$$
\text{sum}(l..r) = pre[r] - pre[l-1]
$$

But instead of `pre[]` being a static vector, it’s provided on-the-fly by a Fenwick or Segment Tree.

---

## Takeaway

Prefix sums are the **mental model**.
Fenwick and Segment Trees are the **data structures** that let you use the same math under dynamic updates.

---

## Recommended Problems

* [USACO Guide – Prefix Sums](https://usaco.guide/silver/prefix-sums)