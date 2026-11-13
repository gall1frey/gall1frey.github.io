# 2026-09-30 | Getting a film camera working again

Restoring a Yashica TL Electro X: A Lesson in Mechanisms

Restoring a camera taught me more about mechanisms than most classes ever did. A camera is essentially a stack of small timing problems:

- A shutter that must open for exactly the right amount of time.
- A film advance lever that loads a spring and advances the film by one frame.
- A mirror or shutter curtain that must move out of the way at precisely the right moment to let light reach the film.

I set out to restore a **Yashica TL Electro X**, a mechanical SLR camera that uses electronics for its light meter and shutter timing. I managed to track one down online, and it was in fairly good working order — mechanically, everything did what it was supposed to. The electronics, however, were a different story.

![the camera in question](images/film_stf/film_stf_1.png){medium}

### Step 1 — Get the mechanics working smoothly

I used isopropyl alcohol (IPA) for cleaning. The recommended degreasers were naphtha or lighter fluid, but I figured any non-corrosive, non-polar solvent should work. 91% isopropyl alcohol did the trick.

### Step 2 — Get the electronics working

This one's fun, and it deserves a post of its own later. I had a blast trying to decode the exploded diagram, then gave up and decided the age-old policy of "YOLO" should work.

![exploded view of camera](https://learncamerarepair.com/cw4/images/product_full/Yashica-TL-Electro-X-Exploded-Diagrams.jpg)

It did.

After a lot of poking around with a multimeter, I found that most of the electrical connections were intact. Phew! A few wires had come unsoldered, but those were easy enough to fix. Also, all the wires are color-coded. It's kind of like doing the wires task in Among Us, except you don't get killed.

![among us wire task: level 100000](images/film_stf/film_stf_2.png){medium}

The camera uses an Eveready 544 battery, which they don't make anymore. So I figured I'd use the closest alternative in terms of form factor and voltage. Luckily for me, Duracell makes the 28A battery. It supplies 6 V and has a similar form factor. Wrapping it in electrical insulation tape ensured a snug fit in the battery compartment!

Another issue was a corroded battery contact. That was an easy fix too: I rolled up some solder wire and stuffed it into the end of the battery compartment to restore electrical contact. And just like that, we had fully functioning electronics!

### Step 3 — Make sure the camera can actually take pictures

This one was a doozy.

The first few frames I shot showed that light was leaking into the camera. Why was that even a surprise? The light-sealing foam was literally falling apart in my hands when I bought it.

There was another issue: when shooting at wider apertures (f/1.7 and such), the shutter would sometimes remain locked open.???

The light leaks were an easy fix. I got some replacement light-sealing foam and installed it.

The shutter issue, however, liked to make me suffer.

Since the rest of the camera's mechanics were working smoothly, I suspected the lens was the culprit. Specifically, the lens pin.

Now, keep in mind that, like anyone born after the turn of the millennium, I'd never held a film camera in my hands before this, much less actually shot with one. So when online repair guides mentioned that the lens pin had to move "smoothly," I didn't know just how smooth they meant. The pin didn't feel seized to me, but I tried cleaning it with IPA anyway.

Didn't work.

Should I try opening up the lens to physically remove any debris that might be inside?

Luckily, I found another compatible kit lens for sale online and bought it. Now, **THAT LENS PIN WAS SMOOOOOOTH!**

And it solved my problem!

Now I had a functional film camera. :)

Or did I?

I hadn't actually developed any film yet.

So naturally, I got myself some CineStill Cs41 developing chemistry and got to work! I'll put the pictures up later, but now I have irrefutable proof that this camera from 1968 still works!

The development process, much like the electronics debugging, deserves a post of its own.

### Step 4 — Conclusion

Okay, I have a functional camera and a way to develop film. Now what?

Well, I also seem to have an extra lens with a seized pin and a whole bunch of developed negatives that are in dire need of being converted to positives.

For my next projects, I'm considering:

1. Building a camera from scratch using the lens with the seized pin.
2. Building a film scanner to digitize the negatives and convert them into positive images.

Let's see where this goes!

# 2026-10-28 | Developing Film
(proving that my fixes actually worked)

So i went ahead and bought one of [these](https://cinestillfilm.com/products/cs41-simplified-color-processing-at-home-quart-kit-c-41-chemistry?variant=30376678593&country=US&currency=USD&utm_medium=product_sync&utm_source=google&utm_content=sag_organic&utm_campaign=sag_organic&gad_source=1&gad_campaignid=801655356&gclid=Cj0KCQiA5NXXBhDEARIsABAJhdKqYgQZtIK09buI386K8VDttW4Chq1jRMlrZbHx1QLtlkl9PJRph0YaAhPPEALw_wcB). 

Of all the options available out there, this one seemed to be the simplest. Armed with this, and a bunch of youtube videos I watched on the topic at 2am, I WAS READY TO GO.

### Prep
Basic stuff you need to develop film:
- [ ] A dark room
- [ ] A red light (so you can see)
- [ ] The chemistry to develop the film, and a way to measure it
- [ ] Some way of protecting yourself from the chemistry

How each of those requirements were satisfied:
- [x] I have a room. It is dark at night. (added aluminum foil on the windows for extra darkness)
- [x] A bike light
- [x] Cinestill CS41, a graduated mug and film canisters
- [x] Nitrile gloves and closed toed shoes

It should be noted, reader, that the above mentioned stuff was the only thing I was armed with. All the other important equipment required for developing photos was improvised for all that I was worth.

The manual states that concentration, temperature and duration of exposure to the developing chemistry are the three factors in getting good negatives from your exposed film. 

### Concentration
To make a pint of the developer, here's a handy chart they provided:
![developer recipe](images/film_stf/film_stf_3.png){medium}
Only issue, I had a graduated mug that only measured in 50ml intervals. I also realised (by pulling up their STL models online), that the canisters your film comes in, have a volume of about 30ml. So between the two, it was doable to get the chemistry measured up to +/- 10ml. Not to mention, the mug I had wasn't the gold standard of measurement. It would have trouble qualifing as the bronze standard, if it came to that.

But does that really matter, when my film was expired? As long as some image apepared, I would call it a success for my first attempt.

So, one requirement down, two to go. 

![Developed negative](images/film_stf/film_stf_4.png){medium right}
### Temperature.
The developer needs to be maintained at 39C, while the blix and wash needs to be maintained at 24-40C and the developed and washed film then needed to be dried at 60C.

I didn't have a heater to keep the chemistry warm throughout the process. So my best bet was to mix the chemicals with water warmer than 40C, and then ensure the mixture didn't cool faster than the time it took to develop the pictures. My idea for insulating was:
1. Make the room as warm as you can - I turned the thermostat as high as it would go, and shut all the doors and windows
2. Make sure nothing in contact with the chemistry was cool - I warmed the containers 
3. Make sure the containers don't lose warmth quickly - Put the chemistry into a warm water bath
![weird scanned negative to positive](images/film_stf/film_stf_5.jpg){medium right}

I had also planned on exchanging some water in the water bath if it got too cold, with some freshly microwaved water. But it didn't come to that

### Timing
I TOTALLY forgot how long each section of the process needed to be performed for. And by the time I realised it, I already had my (gloved) hands dirty drowning some film in developer. So I had to call a friend (thank god for smart voice assistants) and have him pull up the manual online. He even helped time the process!


### Finally
For now, I'm taking a picture of a negative while it sits on another phone displaying a blank notes app page (quick lightbed), and using photo editing software to get negatives. But this process of scanning is not ideal. The scanned image is grainy (smartphones don't like taking pictures of other smartphones)
So the next step is to think of a good way to scan these negatives and make them the correct color.

# 2026-11-09 | Scanning
(or: how to stop photographing my phone with my other phone)

Last time I left off with a pile of grainy negatives and a vague plan to "think of a good way to scan them." I thought about it. Then I did the only thing a robotics student knows how to do when handed a problem: designed a machine for it.

### The light
A scanner is basically a camera looking at a negative with a really even light behind it. My phone-screen lightbed was fine for a first attempt, but a screen is made of pixels, and that grid ends up in the scan. Smartphones really don't like taking pictures of other smartphones.

So I needed a proper backlight. A parabola has a neat trick: put a light at its focus and everything bouncing off it comes out parallel. So I made a parabolic reflector that takes an LED's light and throws it onto a diffusion sheet, which smooths it out. Both are 3D printed. The diffusion sheet being 3D printed still feels slightly illegal.

### What actually exists
![the printed scanner body, so far](images/film_stf/film_stf_7.jpg){side}
Here's the real-life version so far. It's teal. It's not done. The negative is just draped over it for moral support.

The parabola will be the brightest white spray can I can find at walmart, and the rest will be black, lined with more of the light proofing sponge I used for the camera.

What you're looking at is the printed base and the square window that each frame will sit in front of. The slots on the base are there so I can adjust things without reprinting everything (I'll definitely reprint everything).

### What I'm planning to build
![the 3D model of the finished scanner](images/film_stf/film_stf_6.png){side}
This is NOT built yet. It's the 3D model of where this is going.

The idea: the film runs across the base, past the light, and a crank pulls it along one frame at a time. Rollers keep it flat and straight, and the gear with the little lever (down at the bottom) is a ratchet so the film can't slip backwards while it's being scanned.

### What's left
- [x] An even light (reflector + diffusion sheet)
- [x] A base and a window for the negative
- [ ] Print and assemble the film transport (crank, rollers, ratchet)
- [x] Turn the negatives into positives (the colour bit)

Let's see how long it takes before this needs a post of its own.