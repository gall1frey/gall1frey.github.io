# 2026-02-08 | Mechanism study write-up

Birds flap their wings. We want robots to do the same. Easy enough, until you actually have to make the wings move.

An ornithopter needs more than a motor and two wings. The linkage has to produce the right motion, avoid singularities, and ideally not make the aircraft veer sideways every time it flaps.

So I compared three flapping mechanisms and two folding mechanisms, worked through their kinematics, and combined the most practical options into a single CAD design.

The goal wasn't just to make something that moves. It was to understand *why* it moves the way it does.

## Experiment 1: Make the wings flap

I started with three linkage designs.

- **Single-crank double-rocker:** One crank drives both wings. Simple, one degree of freedom, but the wings showed a small phase difference. In flight, that could translate into unwanted yaw.
- **Crank-rocker:** Mechanically simple and easy to manufacture. The SolidWorks simulation showed asymmetric wing amplitudes and some instability from an unconstrained degree of freedom. Interestingly, a physical prototype with the same geometry didn't show the same behavior — possibly because friction and tension restricted the extra motion.
- **Double-crank double-rocker:** Each wing gets its own crank-rocker. The simulated motion was much more symmetric, with matching amplitudes and no observable phase difference. The catch? Synchronizing the two cranks adds complexity.

The double-crank design looked best for stable flight. But the simplest mechanism isn't always the one that wins on a real workbench.

## Experiment 2: Make the wings fold

Flapping gives us lift. Folding changes the wing area and potentially helps with maneuverability.

I compared a four-bar and a six-bar folding linkage, both driven by linear actuators.

The four-bar was simpler, but its transmission ratio varied nonlinearly through the motion. The six-bar added links, but gave smoother transmission and a larger change in effective wing area.

More links, more things to keep track of. Sometimes that's a worthwhile trade.

## Experiment 3: Put the mechanisms through their paces

I used SolidWorks motion studies to evaluate the wingtip trajectories, wing angles, transmission ratios, and mechanical advantage.

The idea was to catch problems in CAD before they became problems in hardware.

Singularities were a particular concern: configurations where the mechanism's geometry can cause its mechanical advantage or motion behavior to become problematic. The folding linkages encountered these near their travel limits — at approximately **37 mm for the four-bar** and **22 mm for the six-bar**, measured from their respective home positions.

I also calculated forward kinematics for the crank-rocker and six-bar folding mechanisms using loop-closure equations. That gave me a mathematical way to describe the motion instead of relying entirely on watching an animation and hoping everything looked right.

Want to see the mechanisms move? I put the demonstrations in a [YouTube playlist](https://youtube.com/playlist?list=PL2Cc95P3WAOvVsbrhK9XDPtWNo7-u5--b).

@[youtube: Mechanism demos](https://youtube.com/playlist?list=PL2Cc95P3WAOvVsbrhK9XDPtWNo7-u5--b)


The CAD models and simulation code are available in the [ornithopter repository](https://github.com/gall1frey/ornithopter).

## Experiment 4: Combine the parts

For the final design, I combined the crank-rocker flapping mechanism with the six-bar folding linkage.

Why not use the better-performing double-crank mechanism? Manufacturing simplicity. The double-crank arrangement offered better symmetry, but the single-crank configuration was easier to build.

The combined system has six degrees of freedom according to the mobility calculation, but only three independent inputs: one flapping crank and two linear actuators for folding the wings.

I simulated the combined motion with flapping at 1.5 Hz and folding at 1 Hz to visualize the resulting wingtip workspace.

It worked as a mechanism design. Whether it would deliver efficient, stable flight is another question — and one that needs aerodynamic testing, not just a satisfying SolidWorks animation.

## What did I learn?

Linkages are full of trade-offs. A mechanism can look symmetric on paper and behave differently in simulation. A simulation can look unstable while a physical prototype behaves better. And the design with the best kinematics isn't necessarily the easiest one to manufacture.

The next step would be to optimize link lengths, reduce the phase difference between the wings, and investigate mass distribution and aerodynamic performance.

First, make the wings move. Then make them move well. Then worry about making the whole thing fly.

One engineering problem at a time.
