import { ParticleEngine } from './particle_engine'
import { UserInputState } from './state';

window.onload = function () {
    // Set up WebGL
    let canvas = <HTMLCanvasElement>document.getElementById("mainCanvas");
    let gl = canvas.getContext("webgl2");
    if (!gl) {
        console.log("Error: could not get webgl2");
        canvas.hidden = true;
        return
    }
    document.getElementById("glerror").hidden = true;

    var count = 10000;
    let state = new UserInputState();
    let engine = new ParticleEngine(gl, count);

    // Callbacks
    canvas.oncontextmenu = function () { return false; };
    canvas.addEventListener("mousemove", function (e) {
        state.mouse[0] = (e.offsetX / canvas.clientWidth) * 2 - 1;
        state.mouse[1] = ((canvas.clientHeight - e.offsetY) / canvas.clientHeight) * 2 - 1;
    });
    canvas.addEventListener("mousedown", function (e) {
        if (e.button == 2) {
            state.vortex = true;
        } else {
            state.accel = true;
        }
    });
    canvas.addEventListener("mouseup", function () {
        state.accel = false;
        state.vortex = false;
    });

    // Touch handler: Set mouse to the average touch position and handle vortex
    // and accel behavior
    let updateTouch = (e: TouchEvent) => {
        state.mouse[0] = 0.0;
        state.mouse[1] = 0.0;
        for(let i = 0; i < e.touches.length; i += 1) {
            state.mouse[0] += (e.touches[i].clientX / canvas.clientWidth) * 2 - 1;
            state.mouse[1] += ((canvas.clientHeight - e.touches[i].clientY) / canvas.clientHeight) * 2 - 1;
        }
        state.mouse[0] /= e.touches.length;
        state.mouse[1] /= e.touches.length;
        if (e.touches.length > 1) {
            state.accel = false;
            state.vortex = true;
        } else if (e.touches.length > 0) {
            state.accel = true;
            state.vortex = false;
        } else {
            state.accel = false;
            state.vortex = false;
        }
    }
    canvas.addEventListener("touchmove", updateTouch);
    canvas.addEventListener("touchstart", updateTouch);
    canvas.addEventListener("touchend", updateTouch);
    // Prevent scrolling when touching the canvas
    document.body.addEventListener("touchstart", function (e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
    }, false);
    document.body.addEventListener("touchend", function (e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
    }, false);
    document.body.addEventListener("touchmove", function (e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
    }, false);

    let handleResize = function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    };
    window.addEventListener("resize", handleResize);
    let acval = document.getElementById("accelVal");
    let ac = document.getElementById("accel");
    ac.oninput = function (this: HTMLInputElement, ev: Event) {
        state.accelAmount = Number(this.value) * 0.05;
        acval.textContent = state.accelAmount.toPrecision(3);
    };
    let pointsVal = document.getElementById("pointsVal");
    let points = document.getElementById("points");
    var newCount = 0;
    points.oninput = function (this: HTMLInputElement, ev: Event) {
        newCount = Math.round(5000 * Math.exp(Number(this.value) / 14));
        pointsVal.textContent = "" + newCount;
    };
    points.onchange = function (this: HTMLInputElement, ev: Event) {
        // When user is done sliding, re-init particle buffers
        count = newCount;
        engine.resetParticles(count);
    };
    let pointsizeVal = document.getElementById("pointsizeVal");
    let pointsize = document.getElementById('pointsize');
    pointsize.oninput = function (this: HTMLInputElement, ev: Event) {
        state.particleSize = Number(this.value) / 10.0;
        pointsizeVal.textContent = "" + state.particleSize;
    };
    let frictionVal = document.getElementById("frictionVal");
    let friction = document.getElementById('friction');
    friction.oninput = function (this: HTMLInputElement, ev: Event) {
        state.friction = Number(this.value) * 0.01;
        frictionVal.textContent = state.friction.toPrecision(3);
    };

    let frameCounter = 0;
    let fpsVal = document.getElementById("fps");
    let prevFrame = Date.now();

    function drawScene() {
        engine.draw(state);
        if (frameCounter == 9) {
            let now = Date.now();
            let fps = 10000.0 / (now - prevFrame);
            prevFrame = now;
            fpsVal.textContent = "" + fps;
            frameCounter = 0;
        } else {
            frameCounter += 1;
        }

        requestAnimationFrame(drawScene);
    }
    // Set up points by manually calling the callbacks
    ac.oninput(null);
    points.oninput(null);
    points.onchange(null);
    pointsize.oninput(null);
    friction.oninput(null);
    handleResize();
    drawScene();
};
