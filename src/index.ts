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
        state.accel = true;
        if (e.button == 2) {
            // Invert acceleration for right click
            state.accelAmount = -Math.abs(state.accelAmount);
        } else {
            state.accelAmount = Math.abs(state.accelAmount);
        }
    });
    canvas.addEventListener("mouseup", function () {
        state.accel = false;
    });
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
        state.accelAmount = Number(this.value) * 0.0001;
        acval.textContent = state.accelAmount.toPrecision(3);
    };
    let pointsVal = document.getElementById("pointsVal");
    let points = document.getElementById("points");
    var newCount = 0;
    points.oninput = function (this: HTMLInputElement, ev: Event) {
        newCount = Math.round(500 * Math.exp(Number(this.value) / 12));
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
    handleResize();
    drawScene();
};
