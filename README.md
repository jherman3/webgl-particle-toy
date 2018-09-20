# Hack a thing 1 - WebGL particle toy

## Jake Herman

### Build instructions
* Install typescript: `$ npm install -g typescript`
* Install project deps: `$ npm install`
* Compile typescript: `$ tsc index.ts`
* Open the site: `$ open index.html`

### What is it
Live demos are better than words: check it out [here](http://cs98.me/hack-a-thing-1-particletoy/).
![screenshot](screenshot.png)

It's a particle simulator that draws particles on a canvas and lets the user interact
with them using the mouse. Click to accelerate particles toward the mouse and right click to repel them.

I implemented the system using OpenGL Transform Feedback so that all of the heavy math
is done in parallel on the GPU. This enables my 4-year-old laptop to handle over 2
million particles in realtime, which would not be anywhere near practical running on
the CPU, let alone in JS in a web browser. The basic idea is that the vertex shader
computes the position and velocity for each particle in the next frame and saves those
values to a buffer while drawing the current frame. The drawing thread then copies
that buffer back into the main particle buffer once drawing is complete. Mouse position
and state are passed into the shader with uniforms.

### Tutorials
* https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html
* https://www.typescriptlang.org/docs/handbook

### Why
I have played with OpenGL before and thought it'd be cool to build something with it that
can run in a website. I've also been interested in Typescript and new web technologies
since most of my experience is in backend systems, so this seemed like a cool way
to combine them. Also, it looks cool and is fun to play with.

### New technologies
* Typescript
* WebGL 2

### What didn't work
* I tried for a while to get transform feedback to work with a single buffer rather
than separate input/output buffers, but I never could get it working quite right.
* Due to simplicity / time constraints I couldn't get a nice JS UI framework to
handle the sliders / text on the page so the overall page design is pretty bad
from a web design point of view. My main interest with this exercise was the OpenGL
part though, and that was a success.
