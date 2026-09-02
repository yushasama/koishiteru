## 1. Le Challenge

Being the unfortunate hero reincarnated as an unemployed CS student that I am, I was scrolling through LinkedIn doing the usual: applying to jobs and getting brutally mogged by some Waterloo student accepting his return offer to Jump Trading.

That was when I found a blog post from [Jane Street](https://blog.janestreet.com/can-you-reverse-engineer-an-asic/). The title immediately caught my attention:

**“Can You Reverse Engineer an ASIC?”**

I answered the question in my head immediately: no.

That was present me though. Go ask future me a few days later.

Those few days somehow turned into two weeks. The first disappeared into other projects and my first venture outside in a month, while the second became back-to-back trips to Catalina Island with friends and my Calculus II professor, followed immediately by Niagara Falls in Canada. I was itching the whole time to work on the challenge.

I did spend time on Catalina Island studying what an ASIC even was and reviewing enough hardware concepts so my head wouldn't explode from being exposed to the challenge.

So after getting home, I finally approached the challenge, which was relatively straightforward to explain. Jane Street gave us the final physical layout of an ASIC, `puzzle.gds`, along with some sample inputs & outputs.

From there, we were supposed to:

<!-- visual:challenge-pipeline -->
<!-- /visual -->

I decided to first work on the warm-up puzzle since that was probably the easiest way to find out whether whatever I was building was actually correct.

Before getting into my approach though, let's first discuss what an ASIC even is.

---

## 2. What is an ASIC and Can I Eat It?

<!-- sticky:layer-stack -->

After several experiments conducted using the scientific process known as **mandibular processing**, I can confirm that no, an ASIC is not edible. The only positive result from this experiment would probably be for my dentist.

Onto the less interesting question: what actually is an ASIC?

An ASIC, or **Application-Specific Integrated Circuit**, is a chip designed around a specific application or a relatively small set of tasks. Unlike a CPU, which can run a wide variety of programs, the internal hardware logic of an ASIC is fixed once the chip is fabricated.

You lose flexibility, but in return insane performance & power efficiency is gained for whatever job the chip was designed for.

They show up everywhere from AI accelerators to crypto-mining hardware, among many other things.

At the bottom of the diagram are placed standard cells, reusable blocks that contain the chip's logic. LI1 connects the parts inside our standard cells to metal wiring labeled MET1, MET2, and so on. Vias act as vertical connections between the wiring layers.

<!-- /sticky -->

---

## 3. SKY130, Not Skynet

I kept calling SKY130 skynet for the first evening I was working on this problem. I realized my miustake when Google started showing me the Terminator.

Now, what is SKY130?

SKY130 is an open-source Process Design Kit made available through work involving Google and SkyWater Technology. It contains chip-design rules, documentation, and libraries. So it is a pretty awesome resource for anyone curious about semiconductor design.

Reading through the documentation helped me understand what I was even dealing with in the challenge. That, along with some very introductory hardware logic, was basically how I figured out what piece was what.

Some of those hardware concepts I had to deal with were **gates, nets, pins, cells, vias, and combinational logic**.

Gates take input bits, either `1` or `0`, and spit out other bits. A **net** is basically a wire connecting things together. A **pin** is a connection point on a cell, and a **cell** is just a reusable chunk of hardware logic with inputs and outputs.

A **via** is a small vertical connection that electrically joins conductive geometry on two different layers.

**Combinational logic** is logic where the output depends on whatever inputs it is receiving right now.

That's about enough electrical engineering for the moment.

---

## 4. So What Does Hardware Look Like in a GDS?

A logical schematic gives you something nice like:

<!-- visual:and-gate -->
<!-- /visual -->

Simple right? It sure would be nice if a GDS file gave us information like that.

It does not. It gives us shapes. Lots and lots of shapes actually.

Those shapes can represent a wide variety of things including metal layers, vias, labels, cells. The logical connections aren't handed to us directly, but the physical evidence for those connections is there... after deriving it ourselves from the geometry of course.

My original thought was fairly simple.

If two pieces of conductive geometry on the same layer touch or overlap, then they are physically continuous.

Now, if two conductors overlap in 2D but live on different layers, that alone means nothing. They only connect through an explicit via or contact bridging those layers.

So if I could figure out all of the valid physical connections, I could derive the electrical connections and eventually turn the whole thing into a graph.

And once I had a graph... **lightbulb** This problem starts looking a lot like a connected-components problem.

A connected component is a group of nodes where every node can reach every other node through some path. For example, one chain containing A, B, and C and another containing D and E form two separate connected components: `{A, B, C}` and `{D, E}`.

If those nodes represent conductive pieces, then each connected component can represent one electrical net. Great! We have figured out what the problem reduces to. But how do we do it efficiently?

---

## 5. R-Tree + DFS Go BRRRR

There is an insane number of these shapes.

Checking one shape against every other shape to see if they overlap is already $O(n)$. Doing that for every shape explodes the total work toward $O(n^2)$.

I knew we could absolutely do better, so I did some digging online. Thus behold:

**the R-tree.**

An R-tree is a data structure that groups nearby shapes together. Each group is represented by a bounding box containing all of its polygons.

When querying with a polygon, the tree compares the polygon's bounding box against each of those groups' bounding boxes. Whenever a group's bounding box does not overlap with our polygon's bounding box, that entire group gets skipped. This is because none of the polygons can overlap with what we queried.

In practice, those queries are roughly $O(\log n + k)$, where $k$ is however many possible matches the query actually returns. Worst-case performance can still degrade toward $O(n)$.

<!-- visual:rtree -->
<!-- /visual -->

Pretty cool amirite?

<!-- sticky:polygon-decomposition -->

There was a problem though.

Our polygons weren't always rectangles.

Imagine an I-shaped conductor in the GDS.

Throwing one giant rectangular bounding box around the whole shape means the box contains a bunch of empty space.

Then another conductor could sit inside that empty space and get returned even though it isn't actually touching the polygon.

Thankfully, the geometry we dealt with was Manhattan geometry, meaning its edges were vertical and horizontal.

That meant I could decompose those weird polygons into a bunch of smaller rectangles and insert each rectangle into the R-tree separately.

I also built a separate R-tree for each conductor layer, since ordinary conductor overlap only matters within the same layer.

Cross-layer connections are handled through vias.

Once the polygons were decomposed into rectangles, something convenient happened:

**the bounding box of each rectangle was the rectangle itself.**

Thus, when two rectangles on the same layer touch or overlap in the R-tree, they were physically connected so I added an edge between them.

<!-- /sticky -->

Vias added valid connections between the wiring layers. When a via touched routing wires on the two layers it connected, I added an edge between those pieces of routing.

Cell pins were handled similarly. They act as connection points for a cell's inputs, outputs, or where power meets wiring. If several pieces of routing touched the same pin, I connected them as well.

Once all of those edges were added, DFS walked the graph and built connected components. Each connected component became one recovered electrical net.

Now it was time to recover the actual circuit.

That is, until I got slightly detoured by debugging the program.

---

## 6. Debugging When Compiler.exe Has Stopped Responding

Debugging is already a pain itself, but changing something and then waiting forever for everything to rebuild is another level of pain.

Eventually I realized I was repeatedly recomputing expensive extraction work even when nothing relevant to the extraction had changed.

So I started hashing the exact inputs that could affect extraction: the GDS contents, extraction code, technology and via configuration, and the cache version.

If any relevant input changes, the fingerprint changes and the extractor rebuilds before saving a new result. If the fingerprint matches, it loads the cached work from our extractor immediately.

So if I changed something completely unrelated to physical extraction, the program didn't need to redo all of the geometry work again.


<!-- visual:cache -->
<!-- /visual -->

---

## 7. f(Geometry) = Circuit??

After debugging, it was time to get into the fun stuff:

**building an actual circuit from our graph.**

At this point I knew which cells existed, what pins belonged to them, and which pins shared the same electrical net.

Luckily, the GDS already told me which SKY130 cells were placed where. The harder part was figuring out what metal belonged to each pin, so I started from the pin labels and followed the connected geometry.

This meant I could finally stop caring about where every rectangle physically lived.

SKY130 already provides models describing how its standard cells behave, so I didn't need to manually reinvent every gate inside the library.

Once I recovered which cells existed and how their pins were connected, I could finally turn all of that physical geometry into something simulatable. The diagram below keeps the same net names visible as the representation changes from metals to nets to cell pins.

<!-- sticky:circuit-morph -->

But how do we know whether our circuit is actually correct?

I used the warm-up for exactly that.

The warm-up came with the original logic and netlist, meaning I could compare what my extractor recovered against something that was known to be correct.

Eventually I got:

```text
79 / 79 logic instances
285 signal cell pins
0 unattached signal pins
0 multi-net pins
84 / 84 signal nets
```

The reconstructed warm-up also behaved correctly when simulated.

Cool.

Now it was time to point everything at the actual puzzle.

That ended up being a completely different beast.

The warm-up was basically a simple circuit built around an 8-bit adder, two shift registers, and a comparator.

The real circuit was much larger and also contained **state**, meaning parts of the chip could remember values between clock cycles.

The circuit has 

```
738 logic instances
2,777 signal cell pins
21 unattached pins
0 multi-net pins
718 signal nets
92 flip flops
```

> All 21 unattached pins are unused outputs. Zero of them were inputs, which is what I was worried about, as unattached inputs would indicate my extracted circuit missed a connection somewhere.

Most of that state lived in those 92 **flip-flops**, which are basically tiny circuits that hold a bit from one clock cycle to the next.

<!-- /sticky -->

<!-- sticky:scc-dag -->

At that point the recovered circuit itself was too large to learn much from by staring at the raw graph.

So I generated a **state dependency graph**.

Here, an edge basically means that the value stored in one register can affect what another register stores next.

The question I wanted that graph to answer was basically:

> Which stored parts of this chip can eventually influence other stored parts, especially $success$?

There were cycles everywhere.

Some groups of stored state could eventually feed back into each other.

Those groups are called **strongly connected components**, or SCCs.

The first stage uses a real four-register cluster from the recovered circuit: `q34`, `q35`, `q36`, and `q37` each influence the others. Everything in that feedback loop can reach everything else.

Instead of staring at those four registers separately, the next stage collapses them into state region `S3`.

Once every feedback region gets collapsed like that, the graph between those regions becomes a **DAG**, or directed acyclic graph.

This was really useful as I no longer needed to trace hundreds of individual gates and wires. I then sliced the DAG towards $success$, removing anything without a structural path to it.

Boom. Now I had a much cleaner map of the circuit to reason about.

One important distinction:

The DAG was just a cleaner representation for understanding and slicing the circuit.

The actual circuit remained intact when it came time to run any real circuit logic.

<!-- /sticky -->

---

## 8. success = 1 & SAT = Free ELO

At this point I had a circuit that could actually be reasoned about and simulated.

Now, to eventually get the solution, you had to feed the circuit the right binary input sequence.

<!-- visual:io-stream -->
<!-- /visual -->

There was one tiny issue though...

I had absolutely no idea what a valid input looked like.

Thankfully, the chip did.

Jane Street tells us that when the correct solution is accepted, the $success$ output goes high.

So I knew what the end of a correct execution looked like: $success = 1$.

I just didn't know what came before it.

Instead of guessing complete inputs and seeing where they ended up, I only cared about the circuit eventually reaching $ success = 1$ and only cared about bit sequences that led to such a result.

Which led me to further reduce the problem into a SAT problem.

Context:
> SAT, short for Boolean satisfiability, asks whether there is some assignment of `0`s and `1`s that makes a whole set of Boolean constraints true.

Suppose the entire circuit was just $success = A \land B$, and we require $success = 1$. Working backwards, I immediately know $A = 1$ and $B = 1$.

The output constraint eliminates the other three assignments in one move.

That's basically the intuition behind SAT.

<!-- visual:sat-basics -->
<!-- /visual -->

For the solver itself, I used **Z3**, a program that can solve systems of logical constraints like these.

In my case, the main constraint I cared about was still $success = 1$.

Now bridge that idea to the actual circuit.

Instead of one AND gate, we have hundreds of cells and state changing across clock cycles. One copy of the circuit maps the current state $S_t$ and input $I_t$ to the next state $S_{t+1}$.

I copied that transition forward across time & enforced the constraint:

$$
\exists\, I_1,\ldots,I_k:
\left(success_1 \lor success_2 \lor \cdots \lor success_k\right)=1
$$

Translation from Martian to English: Find an input sequence that makes $ success $ flip to $ 1 $ within the next $ k $ clock cycles.

I initially set $ k = 64 $ but Z3 gave me UNSAT. I knew that my circuit was correct, so I suspected that $ 64 $ was too little. Thus I bumped it up to $ 312 $ clock cycles. 

Then I got a hit. I then ran binary search on an interval of $ [64, 312] $ clock cycles to find the minimum value of $ k $.

I eventually reached 122 cycles. The last cycle is used for submission while the first 121 clock cycles are bit placements.

<!-- sticky:sat-timeline -->


From Jane Street's sample input waveform, it showed 121 binary bits as the input. Meaning each attempt at finding the right input is also a 121 bit sequence. This lined up with the previous result of obtaining $ success = 1 $ within $ 122 $ clock cycles.

Brute forcing that means staring at:

$$
2^{121}
$$

possible bit sequences.

Which is:

**2,&#8203;658,&#8203;455,&#8203;991,&#8203;569,&#8203;831,&#8203;745,&#8203;807,&#8203;614,&#8203;120,&#8203;560,&#8203;689,&#8203;152**

The Pacific Ocean has a volume of about 710 quadrillion cubic meters, or:

$7.1 \times 10^{17}\,\mathrm{m}^3$

A U.S. \$100 bill occupies about:

$15.6 \times 6.63 \times 0.011\,\mathrm{cm} \approx 1.138\,\mathrm{cm}^3$

That means one Pacific Ocean could hold **~624 sextillion \$100 bills**, worth about **\$62.4 septillion**.

To have $2^{121}$ **dollars**, you would need **~42.6 billion Pacific Oceans filled entirely with \$100 bills**.

That can buy you 4 Chipotle bowls with double meat and guac.

SAT doesn't need to try every complete bit sequence one at a time.

It can discover that certain **combinations of earlier input bits** are incompatible with the circuit ever reaching $success = 1$, letting it discard entire families of possible inputs at once.

I outsourced the definition of correctness to the hardware itself. I didn't actually need to know the hidden rule to find a valid input. The method was built around the fact that the hardware would eventually say $success = 1$.

<!-- /sticky -->

---

## 9. SAT Can't Be Wrong Right??

Well...

SAT can only give me assignments that don't violate the equations I give it. However, that doesn't guarantee that my model behaves exactly like the hardware.

So I needed another way to check it.

From the recovered circuit, I generated structural Verilog and simulated it using Icarus Verilog together with the official SKY130 cell models.

Then I took the exact input sequence SAT gave me and replayed it through that separate simulation.

This distinction mattered because the solver returning SAT only proved that the input worked according to **my formal model**. Replaying the same input through Verilog with the official SKY130 models checked whether the recovered hardware agreed.

So now I had a SAT model predicting $success = 1$ at cycle $T$, and a separate structural Verilog simulation using the official SKY130 models and the same inputs.

If they disagree, something somewhere between the recovered circuit, Z3, and the Verilog replay was cooked.

If they agree at the same point, then the input sequence works in both my SAT model and the reconstructed Verilog simulation.

<!-- visual:verification -->
<!-- /visual -->

They ended up agreeing, which is perfect! Now it was time to recover the final output.

---

## 10. The Solution

After taking the successful input bits, I ran them through the recovered circuit and let the output logic continue.

Then I transformed the raw output bits into something readable. Voilà, we have our solution.

<!-- visual:result-decode -->
<!-- /visual -->

An OCaml-style comment saying **TWO STARS**. Pretty fitting answer for a Jane Street puzzle given their heavy use of OCaml lul.

---

## 11. Afterthoughts

I started off with geometry given by the GDS layout of an ASIC, turned the physical geometry into a graph problem, recovered a circuit, and got an answer.

I was pretty surprised I was able to finish the challenge in only a few days of actual active work given that I came into this without much hardware experience.

Overall this was really fun and I got to learn some pretty cool stuff.

I hope you guys got to learn a thing or two too.

### Final Note

Here's the puzzle's GDS layout but animated:

<!-- visual:showcase-video -->
<!-- /visual -->

Have a good day XO.

## 12. Relevant Links

- [Jane Street: Can You Reverse Engineer an ASIC?](https://blog.janestreet.com/can-you-reverse-engineer-an-asic/)
- [Jane Street ASIC Puzzle 2026 repository](https://github.com/janestreet/asic-puzzle-2026)
