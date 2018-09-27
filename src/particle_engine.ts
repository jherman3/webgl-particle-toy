import * as WebGLDebugUtils from 'webgl-debug'
import { VS_SOURCE, FS_SOURCE, createShader } from './shaders'
import { UserInputState } from './state'

export class ParticleEngine {
    private gl: WebGL2RenderingContext;
    private count: number;
    private transformFeedback: WebGLTransformFeedback;
    mouse: Array<number>;
    private uniformLocs = {
        accel: null,
        accelAmount: null,
        mouse: null,
        particleSize: null
    };

    private buffers = {
        position: null,
        velocity: null,
        tfPosition: null,
        tfVelocity: null
    };

    private throwOnGLError(err, funcName, args) {
        throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
    };

    constructor(ctx: WebGL2RenderingContext, count: number) {
        this.gl = WebGLDebugUtils.makeDebugContext(ctx, this.throwOnGLError);
        let gl = this.gl;

        let vs = createShader(gl, gl.VERTEX_SHADER, VS_SOURCE);
        let fs = createShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE);
        let program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.transformFeedbackVaryings(program, ['v_position', 'v_velocity'], gl.SEPARATE_ATTRIBS);
        gl.linkProgram(program);

        this.buffers.position = gl.createBuffer();
        this.buffers.velocity = gl.createBuffer();
        this.buffers.tfPosition = gl.createBuffer();
        this.buffers.tfVelocity = gl.createBuffer();

        let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        let velocityAttributeLocation = gl.getAttribLocation(program, "a_velocity");

        this.uniformLocs.accel = gl.getUniformLocation(program, "accel");
        this.uniformLocs.accelAmount = gl.getUniformLocation(program, "accelAmount");
        this.uniformLocs.mouse = gl.getUniformLocation(program, "mouse");
        this.uniformLocs.particleSize = gl.getUniformLocation(program, "particleSize");

        let vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        // Setup buffers
        let size = 2;          // 2 components per iteration
        let type = gl.FLOAT;   // the data is 32bit floats
        let normalize = false; // don't normalize the data
        let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        let offset = 0;        // start at the beginning of the buffer

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.velocity);
        gl.enableVertexAttribArray(velocityAttributeLocation);
        gl.vertexAttribPointer(
            velocityAttributeLocation, size, type, normalize, stride, offset);

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

        gl.clearColor(0.01, 0.01, 0.01, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedback);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.buffers.tfPosition);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.buffers.tfVelocity);
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, this.count);
        gl.endTransformFeedback();
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);

        gl.bindBuffer(gl.COPY_WRITE_BUFFER, this.buffers.position);
        gl.bindBuffer(gl.COPY_READ_BUFFER, this.buffers.tfPosition);
        gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, 0, 0, 8 * this.count);
        gl.bindBuffer(gl.COPY_WRITE_BUFFER, this.buffers.velocity);
        gl.bindBuffer(gl.COPY_READ_BUFFER, this.buffers.tfVelocity);
        gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, 0, 0, 8 * this.count);
        gl.bindBuffer(gl.COPY_WRITE_BUFFER, null);
        gl.bindBuffer(gl.COPY_READ_BUFFER, null);
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
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.velocity);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vels), gl.STATIC_DRAW);

        // Fill transform buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.tfPosition);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.tfVelocity);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vels), gl.STATIC_DRAW);

        // Unbind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}
