# WebGL Particle Toy

![screenshot](screenshot.png)

## About

Live demos are cooler than words: check it out [here](https://jherman3.github.io/webgl-particle-toy/) (you need WebGL 2 so use desktop Chrome or Firefox).
Click and drag to interact with particles. Right click to create a vortex effect.

The system uses OpenGL Transform Feedback so that all of the heavy math
is done in parallel on the GPU. This enables my 4-year-old laptop to handle over 2
million particles in realtime, which would not be anywhere near practical running on
the CPU, let alone in JS in a web browser.


## Build instructions
* Install gulp `$ npm install -g gulp-cli`
* Install dependencies `npm install`
* Build: `$ gulp`

Site is output to `dist/`
