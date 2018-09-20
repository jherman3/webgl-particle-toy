# Hack a thing 1 - WebGL particle toy

## Jake Herman

### Build instructions
* Install typescript: `$ npm install -g typescript`
* Install project deps: `$ npm install`
* Compile typescript: `$ tsc index.ts`
* Open the site: `$ open index.html`

### What is it
Live demos are cooler than words: check it out [here](http://cs98.me/hack-a-thing-1-particletoy/). Click and drag to interact with particles. Right click reverses the effect.
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

### What I learned
* Typescript is very easy to work with and feels a lot like Python's new type
system. I could see it being very useful in a large web app with a lot of
complexity. For this simple project I probably didn't gain a ton from it, but it
gave my editor (VS code) very good autocompletion for the complex OpenGL API so
that was nice.
* WebGL 2 is very powerful, but working with raw OpenGL calls really increases
the complexity of the project. I'm just trying to draw a bunch of points on a
canvas and to do this I had to set up a vertex buffer object, manage several
vertex attribute arrays, write and compile/link shaders, and manage OpenGL's
complex state machine. The performance payoff was massive but the complexity
makes working with it very challenging. This is made worse by the fact that the
API provides very few static guarantees so it's super easy to shoot yourself in
the foot if you're unfamiliar with how OpenGL works. A strongly-typed wrapper that
encapsulates OpenGL's implicit state would make this much more pleasant to work
with.

### What didn't work
* I tried for a while to get transform feedback to work with a single buffer rather
than separate input/output buffers, but I never could get it working quite right.
* Due to simplicity / time constraints I couldn't get a nice JS UI framework to
handle the sliders / text on the page so the overall page design is pretty bad
from a web design point of view. My main interest with this exercise was the OpenGL
part though, and that was a success.
* I briefly looked at automated website packaging / deployment systems but I
couldn't get it working quickly so the process for deploying this on
github pages is to manually merge changes into the gh-pages branch and manually
re-run the typescript compiler. Again, this is sub-optimal from a webdev point
of view.
