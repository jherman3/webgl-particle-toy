import * as WebGLDebugUtils from 'webgl-debug'
import { VS_SOURCE, FS_SOURCE, createShader } from './shaders'

function throwOnGLError(err, funcName, args) {
    throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
};

window.onload = function() {
    // Set up WebGL
    let canvas = <HTMLCanvasElement>document.getElementById("mainCanvas");
    let gl = canvas.getContext("webgl2");
    if (!gl) {
        console.log("Error: could not get webgl2");
        canvas.hidden = true;
        return
    }
    document.getElementById("glerror").hidden = true;
    gl = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError);

    let vs = createShader(gl, gl.VERTEX_SHADER, VS_SOURCE);
    let fs = createShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE);
    let program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.transformFeedbackVaryings(program, ['v_position', 'v_velocity'], gl.SEPARATE_ATTRIBS);
    gl.linkProgram(program);

    let positionBuffer = gl.createBuffer();
    let velocityBuffer = gl.createBuffer();
    let tfPositionBuffer = gl.createBuffer();
    let tfVelocityBuffer = gl.createBuffer();

    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    let velocityAttributeLocation = gl.getAttribLocation(program, "a_velocity");

    let accelLocation = gl.getUniformLocation(program, "accel");
    let accelAmountLocation = gl.getUniformLocation(program, "accelAmount");
    let mouseLocation = gl.getUniformLocation(program, "mouse");
    let particleSizeLocation = gl.getUniformLocation(program, "particleSize");

    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Setup buffers
    let size = 2;          // 2 components per iteration
    let type = gl.FLOAT;   // the data is 32bit floats
    let normalize = false; // don't normalize the data
    let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0;        // start at the beginning of the buffer

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset);

    gl.bindBuffer(gl.ARRAY_BUFFER, velocityBuffer);
    gl.enableVertexAttribArray(velocityAttributeLocation);
    gl.vertexAttribPointer(
        velocityAttributeLocation, size, type, normalize, stride, offset);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);
    let transformFeedback = gl.createTransformFeedback();

    var count = 10000;
    let initParticles = function() {
        let positions = [];
        let vels = [];
        for(var i = 0; i < count; i++) {
            positions.push(2 * Math.random() - 1); // x
            positions.push(2 * Math.random() - 1); // y
            vels.push(0.0);
            vels.push(0.0);
        }
        // Fill main buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, velocityBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vels), gl.STATIC_DRAW);

        // Fill transform buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, tfPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, tfVelocityBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vels), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    // Set by input callback
    var accelAmount = 0.0;
    var mouse = [0.0, 0.0];
    var accel = false;
    var screensaverMode = false;
    let particleSize = 1.0;
    var screensaverCounter = 100;

    // Callbacks
    canvas.oncontextmenu = function() {return false;};
    canvas.addEventListener("mousemove", function(e){
        if(!screensaverMode){
            mouse[0] = (e.offsetX / canvas.clientWidth)*2-1;
            mouse[1] = ((canvas.clientHeight - e.offsetY) / canvas.clientHeight)*2-1;
        }
    });
    canvas.addEventListener("mousedown", function(e) {
        if(!screensaverMode){
            accel = true;
            if(e.button == 2) {
                // Invert acceleration for right click
                accelAmount = -Math.abs(accelAmount);
            } else {
                accelAmount = Math.abs(accelAmount);
            }
        }
    });
    canvas.addEventListener("mouseup", function() {
        if(!screensaverMode){
            accel = false;
        }
    });
    let handleResize = function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    };
    window.addEventListener("resize", handleResize);
    let acval = document.getElementById("accelVal");
    let ac = document.getElementById("accel");
    ac.oninput = function(this: HTMLInputElement, ev: Event) {
        accelAmount = Number(this.value) * 0.0001;
        acval.textContent = accelAmount.toPrecision(3);
    };
    let pointsVal = document.getElementById("pointsVal");
    let points = document.getElementById("points");
    var newCount = 0;
    points.oninput = function(this: HTMLInputElement, ev: Event) {
        newCount = Math.round(500 * Math.exp(Number(this.value) / 12));
        pointsVal.textContent = "" + newCount;
    };
    points.onchange = function(this: HTMLInputElement, ev: Event) {
        // When user is done sliding, re-init particle buffers
        count = newCount;
        initParticles();
    };
    let pointsizeVal = document.getElementById("pointsizeVal");
    let pointsize = document.getElementById('pointsize');
    pointsize.oninput = function(this: HTMLInputElement, ev: Event) {
        particleSize = Number(this.value) / 10.0;
        pointsizeVal.textContent = "" + particleSize;
    };

    let screensaver = document.getElementById('screensaver');
    screensaver.oninput = function(this: HTMLInputElement, ev: Event) {
        // // particleSize = Number(this.value);
        // // pointsizeVal.textContent = "" + particleSize;
        // let element: HTMLElement = document.elementFromPoint(0, 0) as HTMLElement;
        //     //--- Get the first link that has "stackoverflow" in its URL.
        // var targetNode = document.querySelector ("a[href*='stackoverflow']");
        // if (targetNode) {
        //     //--- Simulate a natural mouse-click sequence.
        //     triggerMouseEvent (targetNode, "mouseover");
        //     triggerMouseEvent (targetNode, "mousedown");
        //     triggerMouseEvent (targetNode, "mouseup");
        //     triggerMouseEvent (targetNode, "click");
        // }
        // else
        //     console.log ("*** Target node not found!");

        // element.click();
        if (this.checked){
            screensaverMode = true;
            accel = true;
            randomizeMouse(-1,1);
            screensaverCounter = 100;
        }else{
            screensaverMode = false;
            mouse = [0.0, 0.0];
            accel = false;
        }
    };

    //https://gist.github.com/ValeryToda/fbf1de017f91c0ec3da04116c5ccf8b5
    function randomizeMouse(min, max) {
        mouse = [(Math.random() * (max - min) + min).toFixed(4) , (Math.random() * (max - min) + min).toFixed(4) ];
    }

    function triggerMouseEvent (node, eventType) {
        var clickEvent = document.createEvent ('MouseEvents');
        clickEvent.initEvent (eventType, true, true);
        node.dispatchEvent (clickEvent);
    }

    function drawScene() {
        gl.uniform1i(accelLocation, accel ? 1 : 0);
        gl.uniform1f(accelAmountLocation, accelAmount);
        gl.uniform2f(mouseLocation, mouse[0], mouse[1]);
        gl.uniform1f(particleSizeLocation, particleSize);

        gl.clearColor(0.01, 0.01, 0.01, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, tfPositionBuffer);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, tfVelocityBuffer);
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, count);
        gl.endTransformFeedback();
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);

        gl.bindBuffer(gl.COPY_WRITE_BUFFER, positionBuffer);
        gl.bindBuffer(gl.COPY_READ_BUFFER, tfPositionBuffer);
        gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, 0, 0, 8 * count);
        gl.bindBuffer(gl.COPY_WRITE_BUFFER, velocityBuffer);
        gl.bindBuffer(gl.COPY_READ_BUFFER, tfVelocityBuffer);
        gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, 0, 0, 8 * count);
        gl.bindBuffer(gl.COPY_WRITE_BUFFER, null);
        gl.bindBuffer(gl.COPY_READ_BUFFER, null);

        if(screensaverMode && screensaverCounter==0){
            newFunction(randomizeMouse);
            var decelerate = false;
            decelerate=Math.random() < 0.2 ? true : false;
            if (decelerate){
                accelAmount = -Math.abs(accelAmount);
                screensaverCounter = Math.floor((Math.random() * (100 - 10) + 10));
            }else{
                screensaverCounter = Math.floor((Math.random() * (300 - 10) + 10));
                accelAmount = Math.abs(accelAmount);
            }
        }
        screensaverCounter--;
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
function newFunction(randomizeMouse: (min: any, max: any) => void) {
    randomizeMouse(-1,1);
}
