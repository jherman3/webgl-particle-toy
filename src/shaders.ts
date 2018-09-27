let VS_SOURCE = `#version 300 es

    uniform vec2 mouse;
    uniform bool accel;
    uniform float accelAmount;

    in vec2 a_position;
    in vec2 a_velocity;
    out vec2 v_position;
    out vec2 v_velocity;

    // from https://thebookofshaders.com/10/
    float random (vec2 st) {
        return fract(sin(dot(st.xy,
                            vec2(12.9898,78.233)))*
            43758.5453123);
    }

    void main() {
        gl_Position = vec4(a_position, 0, 1);
        // Pass through to fragment shader
        v_velocity = a_velocity;

        if(accel) {
            vec2 del = normalize(mouse - a_position);
            v_velocity += del * accelAmount;
        }

        // Friction
        v_velocity *= (1.0 - 0.01 * (1.0 + random(v_position)));

        // Update pos/vel for transform feedback
        v_position = a_position;
        v_position += v_velocity;
        if(v_position.x > 1.0) {
            v_position.x = 2.0 - v_position.x;
            v_velocity.x = -v_velocity.x;
        }
        if(v_position.y > 1.0) {
            v_position.y = 2.0 - v_position.y;
            v_velocity.y = -v_velocity.y;
        }
        if(v_position.x < -1.0) {
            v_position.x = -2.0 - v_position.x;
            v_velocity.x = -v_velocity.x;
        }
        if(v_position.y < -1.0) {
            v_position.y = -2.0 - v_position.y;
            v_velocity.y = -v_velocity.y;
        }
    }
`;

let FS_SOURCE = `#version 300 es

    // fragment shaders don't have a default precision so we need
    // to pick one. mediump is a good default. It means "medium precision"
    precision mediump float;

    in vec2 v_velocity;
    // we need to declare an output for the fragment shader
    out vec4 outColor;

    vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    void main() {
        // Technically HSV is supposed to be between 0 and 1 but I found that
        // letting the value go higher causes it to wrap-around and look cool
        float vel = clamp(length(v_velocity) * 20.0, 0.0, 2.0);
        outColor = vec4(
            hsv2rgb(vec3(
                0.6 - vel * 0.6,  // hue
                1.0,               // sat
                max(0.2 + vel, 0.8) // vibrance
            )),
        1.0);
    }
`;

// Adapted from https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html
function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    } else {
        let e = "Shader build error: " + gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(e);
    }
}
export {VS_SOURCE, FS_SOURCE, createShader}
