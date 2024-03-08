import { Matrix3, Matrix4, Quaternion, Vector2, Vector3 } from "@math.gl/core";

import * as React from "react";

export const worldCoord = (canvas: HTMLCanvasElement | OffscreenCanvas, p: Vector2): Vector2 => {
    if (canvas.width > canvas.height) {
        let dx = (2.0 * p.x - canvas.width) / canvas.height;
        let dy = 1.0 - 2.0 * p.y / canvas.height;
        return new Vector2(dx, dy);
    } else {
        let dx = 2.0 * p.x / canvas.width - 1.0;
        let dy = (canvas.height - 2.0 * p.y) / canvas.width;
        return new Vector2(dx, dy);
    }
}

export const loadImage = async (url: string) => {
    const img = new Image();
    await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.crossOrigin = "";
        img.src = url;
    })
    return img;
}

export const mouseToTrackball = (canvas: HTMLCanvasElement | OffscreenCanvas, p: Vector2): Vector3 => {
    let u = worldCoord(canvas, p);
    let d = u.lengthSquared();
    let v = new Vector3();
    if (d > 1.0) {
        d = Math.sqrt(d);
        v.set(u[0] / d, u[1] / d, 0.0);
    } else
        v.set(u[0], u[1], Math.sqrt(1.0 - d * d));
    return v;
}

export const trackball = (u: Vector3, v: Vector3): Quaternion => {
    let uxv = new Vector3(u);
    uxv.cross(v);
    const uv = u.dot(v);
    let ret = new Quaternion(uxv[0], uxv[1], uxv[2], 1 + uv);
    ret.normalize();
    return ret;
}

/**
 * This function determines if the canvas needs to be resized.
 * This can happen when as the canvas is scaled by the browser.
 */
export const resizeCanvas = (canvas: HTMLCanvasElement) => {
    const displayWidth = canvas.clientWidth, displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        return true;
    }

    return false;
}

export const normalMatrix = (M: Matrix4): Matrix3 => {
    const m00 = M.getElement(0, 0);
    const m10 = M.getElement(1, 0);
    const m20 = M.getElement(2, 0);
    const m01 = M.getElement(0, 1);
    const m11 = M.getElement(1, 1);
    const m21 = M.getElement(2, 1);
    const m02 = M.getElement(0, 2);
    const m12 = M.getElement(1, 2);
    const m22 = M.getElement(2, 2);
    const N = new Matrix3();
    N.set(m00, m10, m20, m01, m11, m21, m02, m12, m22);
    return N.invert().transpose();
}


/**
 * This function compiles a shader program from a vertex and fragment shader source.
 * If successfull it returns the shader program.
 */
export const compileShaderProgram = (gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string) => {
    // Initialize Vertex Shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) {
        throw new Error('Vertex shader could not be created.');
    };
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error('Vertex shader could not be compiled.' + gl.getShaderInfoLog(vertexShader));
    }

    // Initialize Fragment Shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) {
        throw new Error('Fragment shader could not be created.');
    }
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw new Error('Fragment shader could not be compiled.' + gl.getShaderInfoLog(fragmentShader));
    }

    // Initialize Shader Program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        throw new Error('Shader program could not be linked.');
    }

    return program;
}

export const useForceUpdate = () => {
    const [_value, setValue] = React.useState(0);
    return () => setValue(value => value + 1);
}