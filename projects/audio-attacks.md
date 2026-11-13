# 2023-10-05 | Making voice assistants hear things they shouldn't

Voice assistants are convenient. You ask your phone to do something, it hears you, and (hopefully) does what you asked. The slightly less convenient part is that, in many cases, it doesn't really care *who* is asking.

So, for my undergraduate capstone project, I worked with two teammates on a rather fun question: **can we make a voice assistant execute a command without actually speaking to it?**

We looked at a bunch of papers on audio-based attacks against voice assistants, picked three attack vectors, and built a portable proof-of-concept tool to automate them. The idea was not just to get an attack working once in a lab, but to make it repeatable enough that we could test how it behaved under different conditions.

The three attacks were:

- Laser-based audio injection
- Psychoacoustic hiding
- FM radio hijacking

And yes, all three involve making a microphone hear something that a person nearby might not.

## The hardware

The goal was to keep the setup portable, so we used a Raspberry Pi 4B as the brains of the operation. The rest of the device was built around it: a screen, joystick, microphone, speakers, battery, amplifier, and the modules needed for the individual attacks.

Rather than write one giant program that did everything, we used ROS to connect the different bits of the tool. There was a node to read the joystick, one to handle the menu, another to drive the screen, and an attack handler that kicked off whichever attack was selected.

The interface was deliberately simple. Pick an attack, choose a pre-recorded command or record one on the spot, and run it. The tool also generated a basic report after execution.

It was hardware. It had a joystick. It did not need a fancy GUI.

## Step 1 — Make light behave like sound

This one is probably the strangest of the three.

MEMS microphones can respond to modulated light because of the photoacoustic and photoelectric effects. In other words, with the right setup, a microphone can interpret a rapidly changing laser signal as audio.

We based this part on the *Light Commands* paper. Their setup used a specialised laser driver and a 450 nm laser diode. We went for a much simpler 5 mW laser module, driven using the Raspberry Pi's audio output through a PiFi DAC.

The command audio was played through the audio output, which modulated the laser. The microphone on the receiving device then picked up the resulting signal.

I tested this attack, like, all others, against the open-source Mycroft assistant, using Kaldi for speech-to-text, running on a Google voice kit setup (calling it Kit). The wake word "Hey Siri" was used cos we wanted to feel fancy.

The test variables were ambient light, background noise, and the distance between the laser and the microphone. I used white noise to vary the background noise level.

A few things stood out:

- The wake word was registered across the tested distances.
- Background noise at 75 dB was enough to drown out the signal. At 65 dB, the attack still worked. (The hypothesis here was that the laser could only generate so strong an audio signal at the microphone, and at some point, it was going to be swallowed by background noise)
- Ambient luminosity affected the signal received by the microphone, even though Kit still registered the wake word across the light levels we tested.

The obvious mitigation is to stop light from reaching the microphone in the first place. Opaque microphone covers or a physical design that prevents direct line of sight would help.

## Step 2 — Hide a command inside completely normal audio

This one involved considerably less hardware and considerably more waiting for a model to do its thing.

The psychoacoustic hiding attack takes advantage of the difference between what humans can hear and what an automatic speech recognition system can recognise. A malicious command is modified and hidden inside an ordinary audio clip. To a person, the clip should still sound like the original music, ambient noise, or broadcast. To the speech recogniser, it contains a command.

For the voice-assistant setup, we again used Mycroft Assistant with Kaldi speech-to-text running on the Google Voice Kit (Kit). The psychoacoustic attack itself was based on a paper that used Kaldi, a deep neural network, and forced alignment.

The process involved collecting carrier audio, splitting it into 10-second snippets, preparing target commands, and training the model to modify the audio. We used different kinds of carrier audio: music, bird sounds, and a TV broadcast.

We played the modified audio to the **Mycroft Assistant running on the Google Voice Kit**, with Kaldi handling speech-to-text.

The results depended quite a bit on the carrier audio. The model was able to hide commands in all three types of samples we tested, but the attack was less reliable when the background noise became louder than the modified audio. In our tests, it failed once the background noise went above 60 dB.

One limitation was that our test setup used a specific stack: Mycroft as the assistant, Kaldi for speech-to-text, and the Google Voice Kit as the hardware platform. So the results demonstrate the attack against that setup, not automatically against every commercial voice assistant.

A checksum to verify that the ASR software has not been tampered with is one possible mitigation. Another, less convenient option is to keep the recogniser inactive when it is not being used.

## Step 3 — Let the radio do the talking

The third attack used FM radio as the delivery mechanism.

The idea was to transmit audio containing the command over an FM frequency, so that a vehicle's radio system could play it to the voice assistant or navigation software. We used the Raspberry Pi's PWM output and the PiFmRds tool to generate the VHF signal.

This attack was tested alongside the psychoacoustic attack. We tried 93.5 MHz and 102.8 MHz, which were frequencies used by popular FM stations in India at the time.

The results were consistent with the psychoacoustic attack when the two were used together. The radio transmission itself was not the interesting part so much as the fact that existing broadcast infrastructure could be used as another way to deliver the audio.

But since we used a Raspberry Pi GPIO pin as the FM transmitter, and Kit placed inside a car tuned to the radio channel as our receiver, there was only so much we could test re- the robustness of this attack vector. It would be worth studying how far away a receiver has to be, and at what strength, so the adversarial noise isn't drowned in the channel noise.

## So, did it work?

Yes! We ended up with a portable proof-of-concept tool that could run all three attack vectors in real time using different audio commands.

More importantly, we got to see how much the environment mattered.

The laser attack was affected by ambient light and background noise, although distance had little effect over the range we tested. The psychoacoustic attack depended on the carrier audio and the noise level around the target. The radio attack worked at the two FM frequencies we tested when combined with the psychoacoustic approach.

There were also some fairly clear limitations. The laser setup could be improved with better hardware and more controlled measurements. The psychoacoustic implementation depended on a particular open-source ASR system. And the radio attack relied on the target system being vulnerable to the audio command once it was delivered.

The useful takeaway was that voice assistants have a much bigger attack surface than just someone standing next to them and speaking. Audio can arrive through light, carefully modified recordings, or even a radio transmission.

