# 2025-10-08 | Course project write-up

Watch the robot here:

@[youtube: Wi-Finder demo](https://youtu.be/1fyw1vySwcY)


Trying to find the right classroom on campus, or my gate at a new airport has to be one of those experiences that make you think "I physically can't belong to the same species as Magellan". Google maps isn't much help when there is no GPS indoors and you have multiple floors to look through.

Wanted to solve that problem, but there are constraints:
1. it should be easy - whatever system is set up, i don't want to have to carry extra equipment everywhere with me just to connect to the campus' "indoor GPS". 
2. it should be easy to install - we don't want to have something needing to be built into the foundation of a building fo this to work, or no existing buildings would work with it
That's it, really

WiFi does the trick? 
1. Everyone carries their phone, and every phone has the capability to connect to WiFi (unless you have one of the Nokia bricks, in which case, mad respect)
2. Every big commercial (or academic) building has multiple wifi access points. Even if they're not for the general public to use, you can still see that they exist. 

So _in theory_, if you have multiple wifi access points, you could measure how strong of a signal you are getting from each of those access points. You could then triangulate where you are, relative to those access points (the kind of stuff they do to with cell towers to figure out where you are)

Decided to test this theory out for the final project of a robot sensing class. And since it was a robot sensing class, a turtlebot waffle was the official test dummy.

## Experiment 1: Simulating radio waves

Gazebo doesn't exactly come with a radio physics department, so I built a ROS 2 node to simulate Wi-Fi RSSI using Free Space Path Loss between access points and the robot's pose. 

Then I added walls, material properties, and configurable noise because radio waves apparently refuse to travel in straight lines just because the math says they should. The simulation does a decent job of simulating attenuation due to different media, but doesn't simulate multipath.

I tested nine access points in an open world, then eleven in the TurtleBot3 House environment.

## Experiment 2: Getting the measurements

Two things: there usually are A LOT OF wifi access points around you at any given moment. So, how do I find out a. how strong a signal is, and b. what signal belongs to what access point?

The first one is simple: **[RSSI](https://en.wikipedia.org/wiki/Received_signal_strength_indicator)**  
To save you the wikipedia read, the physical layer IEEE 802.11 frames contain information about the signal strength received. But also,
> The 802.11 standard does not define any relationship between RSSI value and power level in milliwatts or decibels referenced to one milliwatt (dBm)

Still, there is *some* way to measure signal strength. Now onto the second question.

There's this very common attack called the Evil Twin, where a hacker creates an access point of their own, and names it the exact same as a legit network (imagine you naming your wifi the same as your neighbor's wifi just to sit back and revel in the confusion). My point is, how do I identify unique access points when there is no rule saying access point names should be unique?

IEEE 802.11 to the rescue again with [service sets and BSSID](https://en.wikipedia.org/wiki/Service_set_(802.11_network))
> The BSSID is a 48-bit label that conforms to MAC-48 conventions. While a device may have multiple BSSIDs, usually each BSSID is associated with at most one basic service set at a time

![simulation world with no walls](images/wifinder/wifinder_1.png){right}

Tried putting my findings into practice:
- First, `nmcli` utility on linux. Easy to use, but super slow: scans took 1–2 seconds, and RSSI readings were filtered. 
- Next, an ESP32. This was faster than `nmcli`, but still slow. Also, the ESP32 could only listen to 2.4GHz signals. And Wifi, famously, has two bands: 2.4GHz and 5GHz
- Third attempt: a USB Wi-Fi adapter in monitor mode, with Scapy capturing IEEE 802.11 beacon frames directly. Now I could extract BSSID, frequency, timestamps, and RSSI without waiting for a full network scan. (a second USB adapter was requried because while an adapter is in monitor mode, it cannot be connected to a network. And we really wanted to be connected to the turtlebot over ssh while it was in action)

The idea was to estimate distance from nearby access points using RSSI, then combine those measurements with wheel odometry and IMU data to localize a TurtleBot.

![simulation world with walls](images/wifinder/wifinder_2.png){right}


## Experiment 3: The walls are lying to me

RSSI is not distance. Sure, it changes with change in distance from the source, but that doesn't mean it is a one-to-one mapping. It is logarithmic, for starters. Plus indoors, it gets distorted by reflections and multipath.

I implemented sliding-window filtering, grouping readings by BSSID and frequency, then selecting the strongest RSSI in each window. I also investigated adapting the window size to robot velocity: smaller windows when moving quickly, larger ones when moving slowly. This was a band-aid fix at best, but hey! it worked.

It is definitely worth looking into other ways of getting "good" readings in the future.

![real world](images/wifinder/wifinder_3.png){right}


## Experiment 4: Take it outside the simulation

We tested in a classroom with soundproofing panels and in a Drone Cage to minimize multipath. We couldn't find significant differences between the two locations. Both were worse than the simulation (to be expected)


## What survived the experiments?

Here's what the results looked like. Coming up first, running the turtlebot in a simulation world with channel noise and no signal attenuation due to walls

Second in line: still in simulation, but this time there's walls and stuff around


See how the trajectory vaguely follows the shape of the ground truth here, but the scale is off? That's because it sometimes thinks it is too far away from some access points, when in fact it is only across a wall from them.

Finally, the real world result