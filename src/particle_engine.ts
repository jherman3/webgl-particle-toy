import * as WebGLDebugUtils from 'webgl-debug'
import { VS_SOURCE, FS_SOURCE, createShader } from './shaders'
import { UserInputState } from './state'

export class ParticleEngine {
    private gl: WebGL2RenderingContext;
    private count: number;
    private transformFeedback: WebGLTransformFeedback;
    private uniformLocs = {
        accel: null,
        accelAmount: null,
        mouse: null,
        particleSize: null
    };
    private buffers = {
        position: [null, null],
        velocity: [null, null],
    };
    private attributeLocs = {
        position: null,
        velocity: null,
    };

    private index = 0;

    private throwOnGLError(err, funcName, args) {
        throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
    };

    constructor(ctx: WebGL2RenderingContext, count: number) {
        //this.gl = WebGLDebugUtils.makeDebugContext(ctx, this.throwOnGLError);
        this.gl = ctx;
        let gl = this.gl;

        let vs = createShader(gl, gl.VERTEX_SHADER, VS_SOURCE);
        let fs = createShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE);
        let program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.transformFeedbackVaryings(program, ['v_position', 'v_velocity'], gl.SEPARATE_ATTRIBS);
        gl.linkProgram(program);

        this.buffers.position[0] = gl.createBuffer();
        this.buffers.velocity[0] = gl.createBuffer();
        this.buffers.position[1] = gl.createBuffer();
        this.buffers.velocity[1] = gl.createBuffer();

        this.uniformLocs.accel = gl.getUniformLocation(program, "accel");
        this.uniformLocs.accelAmount = gl.getUniformLocation(program, "accelAmount");
        this.uniformLocs.mouse = gl.getUniformLocation(program, "mouse");
        this.uniformLocs.particleSize = gl.getUniformLocation(program, "particleSize");
        this.attributeLocs.position = gl.getAttribLocation(program, "a_position");
        this.attributeLocs.velocity = gl.getAttribLocation(program, "a_velocity");

        let vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        gl.enableVertexAttribArray(this.attributeLocs.velocity);
        gl.enableVertexAttribArray(this.attributeLocs.position);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

        // Bind the attribute/buffer set we want.
        gl.bindVertexArray(vao);
        this.transformFeedback = gl.createTransformFeedback();
        this.resetParticles(count);
    }

    draw(state: UserInputState) {
        let gl = this.gl;
        gl.uniform1i(this.uniformLocs.accel, state.accel ? 1 : 0);
        gl.uniform1f(this.uniformLocs.accelAmount, state.accelAmount);
        gl.uniform2f(this.uniformLocs.mouse, state.mouse[0], state.mouse[1]);
        gl.uniform1f(this.uniformLocs.particleSize, state.particleSize);

        // Set up buffer data
        let size = 2;          // 2 components per iteration
        let type = gl.FLOAT;   // the data is 32bit floats
        let normalize = false; // don't normalize the data
        let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        let offset = 0;        // start at the beginning of the buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position[this.index]);
        gl.vertexAttribPointer(
            this.attributeLocs.position, size, type, normalize, stride, offset);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.velocity[this.index]);
        gl.vertexAttribPointer(
            this.attributeLocs.velocity, size, type, normalize, stride, offset);

        gl.clearColor(0.01, 0.01, 0.01, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedback);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.buffers.position[1-this.index]);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.buffers.velocity[1-this.index]);
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, this.count);
        gl.endTransformFeedback();
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);
        // Swap buffers
        this.index = 1 - this.index;
    }

    resetParticles(count: number) {
        this.count = count;
        let positions = [];
        let vels = [];
        for(var i = 0; i < count; i++) {
            positions.push(2 * Math.random() - 1); // x
            positions.push(2 * Math.random() - 1); // y
            vels.push(0.0);
            vels.push(0.0);
        }
        let gl = this.gl;
        // Fill main buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position[0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.velocity[0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vels), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position[1]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.velocity[1]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vels), gl.STATIC_DRAW);

        // Unbind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}
