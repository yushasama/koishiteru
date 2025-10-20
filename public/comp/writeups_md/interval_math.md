# Interval Math (Prefix Sums, Sliding Window, Range Queries)

Interval math is one of those things that kills otherwise correct code. Your logic is fine but because you forgot a `+1` or `-1`, you end up eating a WA (Wrong Answer)

Shows up everywhere: sliding windows, prefix sums, range queries, binary search, Fenwick, segtree.

---

## Interval Length Math

Two conventions:

* **Inclusive** $[l..r]$:

  $$
  \text{len} = r-l+1
  $$

* **Half-open** $[l..r)$:

  $$
  \text{len} = r-l
  $$

Check:
$[2..5]$ → $5-2+1=4$ items.
$[2..5)$ → $5-2=3$ items.

Half-open is cleaner, no +1 juggling.

---

## Prefix Sum Queries

Define prefix:

$$
pre[0]=0,\quad pre[i+1]=pre[i]+a[i]
$$

so

$$
pre[k]=\sum_{t=0}^{k-1}a[t].
$$

* Inclusive query $[l..r]$:

  $$
  \sum_{i=l}^r a[i] = pre[r+1]-pre[l]
  $$

* Half-open query $[l..r)$:

  $$
  \sum_{i=l}^{r-1} a[i] = pre[r]-pre[l]
  $$

---

## Length Consistency Check

Normally, inclusive length is

$$
r-l+1
$$

but `pre[r]-pre[l]` covers $[l..r-1]$.
so the last included index is $r-1$.

Length math:

$$
(r-1)-l+1 = r-l
$$

Now suppose we want exactly $k$ elements.

* Inclusive target: last index = $l+k-1$
* Prefix sum view: last index = $r-1$
* set them equal:

  $$
  r-1 = l+k-1 \quad\implies\quad r=l+k
  $$

then

$$
r-l = (l+k)-l = k
$$

so defining $r=l+k$ guarantees exactly $k$ elements.

---

### Example

array:

```cpp
idx: 0   1   2   3   4
a  : 5   2   7   3   6
```

Take $l=1, k=3$.

* Inclusive thinking: want indices \[1..3], length = $3-1+1=3$.
* Last index = $1+3-1 = 3$.

Half-open form: set $r=l+k=4$, then `[1..4)` covers indices 1,2,3.

So our length = $4-1+1=3$ by inclusive math or simply $4-1=3$ by half-open, both matching $k=3$.

---

## Sliding Window Intervals

Window of length $k$ starting at $l$:

* Exclusive right endpoint = $r=l+k$
* Interval = $[l..r-1]$
* Length = $r-l=k$
* Sum =

  $$
  pre[r]-pre[l]
  $$

Example:

```cpp
a = [4,1,6,2]
pre = [0,4,5,11,13]

l=1, k=2 → r=3

sum = pre[3]-pre[1] = 11-4 = 7
covers a[1]+a[2] = 1+6 = 7
```

---

## Interval Query Patterns

* Suffix after $i$: $[i+1..n)$ → $pre[n]-pre[i+1]$
* Prefix up to $i$: $[0..i]$ → $pre[i+1]-pre[0]$
* Generic inclusive $[l..r]$: $pre[r+1]-pre[l]$

---

## Fenwick Tree Off-By-Ones

Fenwick is usually 1-based.

* `Sum(i)` = sum over $[1..i]$
* Range $[l..r]$:

  $$
  sum(r)-sum(l-1)
  $$

If array is 0-based, shift indices by +1. 

**Common Pitfall:** forgetting the $-1$.

---

## Segment Tree Off-By-Ones

iterative segtree is always half-open:

* built on $[0..n)$
* queries are $[l..r)$
* inclusive $[l..r]$ from problem? bump `r++`

```cpp
// query sum over [l..r)
int res = 0;
for (l += n, r += n; l < r; l >>= 1, r >>= 1) {
    if (l&1) res += t[l++];
    if (r&1) res += t[--r];
}
```

---

## Other Off-By-One Hotspots

* Binary Search: safest is `while (l<r)` with half-open $[l..r)$
* Substrings: in C++/Python, `s[l:r]` = $[l..r)$, length = `r-l`
* DP windows: transitions often use $[i..i+k)$

---

## Cheat Sheet

* Inclusive $[l..r]$: sum = `pre[r+1]-pre[l]`, len = `r-l+1`
* Half-open $[l..r)$: sum = `pre[r]-pre[l]`, len = `r-l`
* Sliding window size $k$: `[l..l+k)` → `pre[l+k]-pre[l]`
* Fenwick: `[l..r] = sum(r)-sum(l-1)`
* Segtree: `[l..r)` always, bump r if inclusive
* Substrings/loops: already half-open

---

## Recommended Problems

* [USACO Guide – Prefix Sums](https://usaco.guide/silver/prefix-sums)
* [USACO Guide – Sliding Window](https://usaco.guide/gold/sliding-window)
* [USACO Guide – Point Update Range Sum](https://usaco.guide/gold/PURS)