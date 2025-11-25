# Geometry I

### ICPC SoCal - San Francisco Distances

#### Problem Link


#### Problem Description

Model San Francisco as:

* South of Market Street $(y \ge 0)$: axis-aligned grid with Manhattan streets.
* North of Market Street: 45 degree rotated grid with equally spaced diagonals.

You can only walk along streets and only switch grids where streets coincide along Market Street.
Each query gives two points:

* $(X_1, Y_1, D_1)$ and $(X_2, Y_2, D_2)$
* $D$ is 'S' for South coordinates and 'N' for North coordinates
* Need the shortest walking distance between the two points.

#### Why Distance and Movement

This is the canonical "mixed metrics on a boundary" problem.

* South: Manhattan norm.
* North: rotated Manhattan that becomes Chebyshev in the right coordinates.
* Paths can be all south, all north, or cross the boundary once.

Perfect training for spotting when a shortest path has to cross a 1D boundary and the optimum crossing point lives in a finite candidate set.

#### Key Idea / Transform

1. South region: standard $L_1$ on integer grid.

   $$d_S((x_1, y_1), (x_2, y_2)) = |x_1 - x_2| + |y_1 - y_2|$$

2. North region: 45 degree rotated grid, each step has length $\sqrt{2}$.
   In the north's integer coordinates, distance is:

   $$d_N((x_1,y_1),(x_2,y_2)) = \sqrt{2} \cdot \max(|x_1 - x_2|, |y_1 - y_2|)$$

   So it behaves like Chebyshev times $\sqrt{2}$.

3. If one point is south and the other is north, any shortest path crosses Market Street at some $(t, 0)$.
   Distance is:

   $$D(t) = d_S(A, (t, 0)) + d_N((t, 0), B)$$

   This is piecewise linear in $t$, and its breakpoints occur at a small set of $x$ values defined by absolute value transitions.

#### Solution Outline

1. If both points are south, answer is $d_S$.

2. If both points are north, answer is $d_N$.

3. Otherwise, ensure point $A$ is south and $B$ is north by swapping if needed.

4. Let $A = (X_S, Y_S)$, $B = (X_N, Y_N)$.

5. Define a lambda `check(t)` that computes:

   $$D(t) = |X_S - t| + |Y_S - 0| + \sqrt{2} \cdot \max(|t - X_N|, |0 - Y_N|)$$

6. The absolute functions change regime at these candidate $t$ values:

   * $t = X_S$ (south part flips sign)
   * $t = X_N$ (north x difference changes sign)
   * $t = X_N + Y_N$
   * $t = X_N - Y_N$

   These last two come from where $|t - X_N|$ and $|Y_N|$ swap which is larger in the max.

7. Evaluate $D$ at those candidates and take the minimum.

8. Print with appropriate precision.

#### Complexity

* Time: $O(1)$ per query
* Memory: $O(1)$

#### Code

```cpp
#include <bits/stdc++.h>
using namespace std;

double distS(double x1, double y1, double x2, double y2) {
    return fabs(x1 - x2) + fabs(y1 - y2);
}

double distN(double x1, double y1, double x2, double y2) {
    return sqrt(2.0) * max(fabs(x1 - x2), fabs(y1 - y2));
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int Q;
    cin >> Q;

    cout << fixed << setprecision(12);

    while (Q--) {
        long long X1, Y1, X2, Y2;
        char D1, D2;
        cin >> X1 >> Y1 >> D1 >> X2 >> Y2 >> D2;

        // both south
        if (D1 == 'S' && D2 == 'S') {
            cout << distS(X1, Y1, X2, Y2) << "\n";
            continue;
        }

        // both north
        if (D1 == 'N' && D2 == 'N') {
            cout << distN(X1, Y1, X2, Y2) << "\n";
            continue;
        }

        // ensure A is south and B is north
        if (D1 == 'N') {
            swap(X1, X2);
            swap(Y1, Y2);
            swap(D1, D2);
        }

        double best = 1e100;
        double XS = X1, YS = Y1;
        double XN = X2, YN = Y2;

        auto check = [&](double t) {
            double val = distS(XS, YS, t, 0.0) + distN(t, 0.0, XN, YN);

            best = min(best, val);
        };

        check(XS);
        check(XN);
        check(XN + YN);
        check(XN - YN);

        cout << best << "\n";
    }

    return 0;
}
```

#### Notes

* The "hard" part of this problem is identifying the correct small set of candidate $t$ values.
* This pattern appears in various forms: mixing Euclidean with Manhattan, mixing different speeds, etc.
* Once you get comfortable deriving breakpoints from absolute values, these problems stop being scary.