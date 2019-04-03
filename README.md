# WebGL Particle Toy

![screenshot](screenshot.png)

## About

Live demos are cooler than words: check it out [here](https://jherman3.github.io/webgl-particle-toy/) (you need WebGL 2 so use desktop Chrome or Firefox).
Click and drag to interact with particles. Right click to create a vortex effect.

Mobile is still a work in progress but it's surprisingly usable. Tap/hold to attract
particles and tap with at least two fingers to create a vortex effect. When
using multiple fingers, the attraction position is set to the average position
of all fingers. Unfortunately, no iOS browsers support WebGL 2 so this is Android-only.

The system uses OpenGL Transform Feedback so that all of the heavy math
is done in parallel on the GPU. This enables my 4-year-old laptop to handle over 2
million particles in realtime, which would not be anywhere near practical running on
the CPU, let alone in JS in a web browser.


## Build instructions
* Install gulp `$ npm install -g gulp-cli`
* Install dependencies `npm install`
* Build: `$ gulp`

Site is output to `dist/`
