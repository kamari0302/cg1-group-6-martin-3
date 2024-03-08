import * as React from 'react'
import { compileShaderProgram, resizeCanvas, useForceUpdate } from './Utility'

import { Matrix4, Matrix3, Vector3, Quaternion, Vector2 } from '@math.gl/core'
import { normalMatrix } from './Utility';

import VertexCode from './pool.vs.glsl?raw'
import FragmentCode from './pool.fs.glsl?raw'

import 'webgl-lint'
import { UIPanel } from './ui/UIPanel';
import { UILabel } from './ui/UILabel';
import { MultiSwitch, MultiSwitchElement } from './ui/MultiSwitch';


type AppContext = {
    gl: WebGL2RenderingContext;

    shapes: Array<Shape>;
    program: WebGLProgram;

    modelView: Matrix4;
    projection: Matrix4;
    
    mousePos: Vector2;
    mousePressed: boolean;
    aspect: number;
    zoom: number;
    
    viewMode: ViewMode;
    orientation: Quaternion;
}

export const worldCoord = (gl: WebGL2RenderingContext, p: Vector2, zoom?: number): Vector2 => {
    if (gl.canvas.width > gl.canvas.height) {
        return new Vector2([
            ((2.0 * p.x - gl.canvas.width) / gl.canvas.height) / (zoom ?? 1.0),
            (1.0 - 2.0 * p.y / gl.canvas.height) / (zoom ?? 1.0)
        ]);
    } else {
        return new Vector2([
            (2.0 * p.x / gl.canvas.width - 1.0) / (zoom ?? 1.0),
            ((gl.canvas.height - 2.0 * p.y) / gl.canvas.width) / (zoom ?? 1.0)
        ]);
    }
}

export type Shape = {
    vao: WebGLVertexArrayObject;
    vboSize?: number;
    iboSize?: number;
    type?: string
}

enum ViewMode {
    Stereo,
    Orthographic,
    Perspective
}

enum Surface {
    Pool = 0,
    Ball = 0,
}

const drawShapes = (ctx: AppContext) => {
    const shapes: Array<Shape> = [];
    shapes.push(createPool(ctx.gl));
    shapes.push(...createBalls(ctx.gl));

    const gl = ctx.gl;
    const program = ctx.program;

    let projectionLoc = gl.getUniformLocation(program, 'uProjection');
    gl.uniformMatrix4fv(projectionLoc, false, ctx.projection);
    let modelViewLoc = gl.getUniformLocation(program, 'uModelView');
    let normalMatLoc = gl.getUniformLocation(program, 'uNormal');

    for (const shape of shapes) {
        gl.bindVertexArray(shape.vao);
        let M = new Matrix4();
        M.copy(ctx.modelView);
        if (shape.type == "Ball") {
            M.translate([-1 / 2, 0, 0]);
        }
        gl.uniformMatrix4fv(modelViewLoc, false, M);
        gl.uniformMatrix3fv(normalMatLoc, false, normalMatrix(M));
        
        if (shape.type == "Ball") {
            gl.drawElements(gl.TRIANGLE_STRIP, shape.iboSize, gl.UNSIGNED_INT, 0);
        } else {
            gl.drawElements(gl.TRIANGLES, shape.iboSize, gl.UNSIGNED_INT, 0);
        }
    }
};

    

interface bufferData {
    vertices: number[];
    indices: number[];
}

function createCuboid(pos: Vector3, dim: Vector3, color: Vector3 = new Vector3(0)): bufferData {
    const vertices = [];

    function addVertex(x: number, y: number, z: number) {
        vertices.push(x, y, z, color.x, color.y, color.z);
    }

    // Unten
    addVertex(pos.x, pos.y, pos.z); // links vorne   0
    addVertex(pos.x, pos.y + dim.y, pos.z); // links hinten  1
    addVertex(pos.x + dim.x, pos.y + dim.y, pos.z); // rechts hinten 2
    addVertex(pos.x + dim.x, pos.y, pos.z); // rechts vorne  3

    // Oben
    addVertex(pos.x, pos.y, pos.z + dim.z); // links vorne   4
    addVertex(pos.x, pos.y + dim.y, pos.z + dim.z); // links hinten  5
    addVertex(pos.x + dim.x, pos.y + dim.y, pos.z + dim.z); // rechts hinten 6
    addVertex(pos.x + dim.x, pos.y, pos.z + dim.z); // rechts vorne  7

    const indices = [
        // Flächen
        // unten
        0, 2, 1,
        0, 2, 3,

        // oben
        4,6,5,
        4,6,7,

        // links
        0,5,1,
        0,5,4,

        // rechts
        2,7,3,
        2,7,6,

        // vorne
        0,7,4,
        0,7,3,
       
        // hinten
        1,6,5,
        1,6,2,
    ];

    return { vertices, indices};
}

export const createBall = (
    gl: WebGL2RenderingContext,
    pos: Vector3 = new Vector3(0,0,0),
    r: number,
    color: Vector3 = new Vector3(1,1,1),
    res: number = 16,
): Shape => {
    const m = res;
    const n = res;

    let vertices = [];
    let indices = [];

    let t = 0.0;
    for (let i = 0; i <= n; i++) {
        const ct = Math.cos(t);
        const st = Math.sin(t);

        let s = 0.0;
        for (let j = 0; j < m; j++) {
            const cs = Math.cos(s);
            const ss = Math.sin(s);
            const x = st * cs;
            const y = st * ss;
            const z = ct;
            vertices.push(r * x + pos.x, r * y + pos.y, r * z + pos.z);
            vertices.push(color.x,color.y,color.z);
            vertices.push(x + pos.x, y + pos.y, z + pos.z);

            s += 2 * Math.PI / m;
        }
        t += Math.PI / n;
    }

    let k = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            indices.push(k + j);
            indices.push(k + j + m);
        }
        indices.push(k + 0);
        indices.push(k + m);
        k += m;
    }
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    // position
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 9 * 4, 0);
    // color
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 9 * 4, 3 * 4);
    // normal
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 9 * 4, 6 * 4);

    const iboBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);

    return { vao, iboSize: indices.length, type: "Ball" };
}

// Hilfsfunktion
export const combineBasicShapes = (basicShapes: bufferData[], indexOffset: any): bufferData => {
    const vertices = [];
    const indices = [];

    for (let i = 0; i < basicShapes.length; i++) {
        // Vertices der aktuellen Basisform hinzufügen
        for (let j = 0; j < basicShapes[i].vertices.length; j++) {
            vertices.push(basicShapes[i].vertices[j]);
        }

        // Indizes der aktuellen Basisform hinzufügen, dabei die Indizes entsprechend verschieben
        const offset = i * basicShapes[i].vertices.length / indexOffset; // Berechnung des Versatzes für Indizes
        for (let j = 0; j < basicShapes[i].indices.length; j++) {
            indices.push(basicShapes[i].indices[j] + offset);
        }
    }
    return { vertices, indices};
}

export const createBalls = (gl: WebGL2RenderingContext): Shape[] => {
    const root3 = 1.732;
    const delta = root3/20;
    const basicShapes = [
        createBall(gl, new Vector3(1.1,1.15,1),0.05, new Vector3(1,0,0)),
        createBall(gl, new Vector3(1.1,1.15,1.1),0.05, new Vector3(0,0,1)),
        createBall(gl, new Vector3(1.1,1.15,1.2),0.05, new Vector3(1,0,0)),
        createBall(gl, new Vector3(1.1,1.15,0.9),0.05, new Vector3(0,0,1)),
        createBall(gl, new Vector3(1.1,1.15,0.8),0.05, new Vector3(1,0,0)),

        createBall(gl, new Vector3(1.1+delta,1.15,1.15),0.05, new Vector3(0,0,1)),
        createBall(gl, new Vector3(1.1+delta,1.15,1.05),0.05, new Vector3(1,0,0)),
        createBall(gl, new Vector3(1.1+delta,1.15,0.95),0.05, new Vector3(0,0,1)),
        createBall(gl, new Vector3(1.1+delta,1.15,0.85),0.05, new Vector3(0,0,1)),

        createBall(gl, new Vector3(1.1+2*delta,1.15,1.10),0.05, new Vector3(1,0,0)),
        createBall(gl, new Vector3(1.1+2*delta,1.15,1.00),0.05, new Vector3(0,0,0)),
        createBall(gl, new Vector3(1.1+2*delta,1.15,0.90),0.05, new Vector3(1,0,0)),

        createBall(gl, new Vector3(1.1+3*delta,1.15,1.05),0.05, new Vector3(1,0,0)),
        createBall(gl, new Vector3(1.1+3*delta,1.15,0.95),0.05, new Vector3(0,0,1)),

        createBall(gl, new Vector3(1.1+4*delta,1.15,1),0.05, new Vector3(0,0,1)),

        createBall(gl, new Vector3(3.3, 1.15,1),0.05, new Vector3(1,1,1)),
    ];
    return basicShapes;
}

export const createPool = (gl: WebGL2RenderingContext, x: number = 4, y: number = 0.1, z: number = 2): Shape => {
    const basicShapes = [
        // Tisch
        createCuboid(new Vector3(0,1,0), new Vector3(4,0.1,2), new Vector3(0,1,0)),

        // Löscher
        createCuboid(new Vector3(0,1.001,0), new Vector3(0.15,0.1,0.15), new Vector3(0,0,0)),
        createCuboid(new Vector3(0,1.001,1.85), new Vector3(0.15,0.1,0.15), new Vector3(0,0,0)),
        createCuboid(new Vector3(3.85,1.001,0), new Vector3(0.15,0.1,0.15), new Vector3(0,0,0)),
        createCuboid(new Vector3(3.85,1.001,1.85), new Vector3(0.15,0.1,0.15), new Vector3(0,0,0)),

        createCuboid(new Vector3(3.85/2,1.001,0), new Vector3(0.15,0.1,0.15), new Vector3(0,0,0)),
        createCuboid(new Vector3(3.85/2,1.001,1.85), new Vector3(0.15,0.1,0.15), new Vector3(0,0,0)),

        // Bande
        createCuboid(new Vector3(-0.2,1,-0.2), new Vector3(0.2,0.2,2.4), new Vector3(153, 51, 0)),
        createCuboid(new Vector3(4,1,-0.2), new Vector3(0.2,0.2,2.4), new Vector3(153, 51, 0)),
        createCuboid(new Vector3(4,1,-0.2), new Vector3(-4.2,0.2,0.2), new Vector3(153, 51, 0)),
        createCuboid(new Vector3(4,1,2), new Vector3(-4.2,0.2,0.2), new Vector3(153, 51, 0)),

        // Beine
        createCuboid(new Vector3(0,0,0), new Vector3(-0.2,1,-0.2), new Vector3(153, 51, 0)),
        createCuboid(new Vector3(4,0,0), new Vector3(0.2,1,-0.2), new Vector3(153, 51, 0)),
        createCuboid(new Vector3(0,0,2), new Vector3(-0.2,1,0.2), new Vector3(153, 51, 0)),
        createCuboid(new Vector3(4,0,2), new Vector3(0.2,1,0.2), new Vector3(153, 51, 0)),

        // Lampe
        createCuboid(new Vector3(1,3,1), new Vector3(2,0.2,0.2), new Vector3(153, 51, 0)),
        createCuboid(new Vector3(1,2.9,1), new Vector3(2,0.1,0.2), new Vector3(1, 1, 0)),
        createCuboid(new Vector3(1,3,1), new Vector3(2,0.2,0.2), new Vector3(153, 51, 0)),

        // Kö
        createCuboid(new Vector3(3.85,2,1), new Vector3(4.2,0.05,0.05), new Vector3(153, 102, 51)),

        // Boden
        createCuboid(new Vector3(-8,0,-9), new Vector3(20,-0.2,20), new Vector3(1, 1, 1)),

    ]
    
    const combined = combineBasicShapes(basicShapes, 6);
    const vertices = combined.vertices;
    const indices = combined.indices;

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Position Attribut
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);

    // Farb-Attribut
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);

    return {
        vao,
        iboSize: indices.length,
        type: "Pool"
    };
};




export const mouseToTrackball = (gl: WebGL2RenderingContext, p: Vector2): Vector3 => {
    let u = worldCoord(gl, p);
    let d = u[0] * u[0] + u[1] * u[1];
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

const App = () => {
    const canvas = React.useRef<HTMLCanvasElement>()
    const context = React.useRef<AppContext>();
    const renderUI = useForceUpdate();

    const mouseDown = (event: MouseEvent): void => {
        if (!context.current) return;
        const ctx = context.current;
        ctx.mousePressed = true;
        ctx.mousePos = new Vector2(event.clientX, event.clientY);
    }

    const mouseUp = (event: MouseEvent): void => {
        if (!context.current) return;
        const ctx = context.current;
        ctx.mousePressed = false;
    }

    const mouseMove = (event: MouseEvent) => {

        if (!context.current) return;
        const ctx = context.current;

        if (ctx.mousePressed) {
            const newPos = new Vector2(event.clientX, event.clientY);
            let p0 = mouseToTrackball(ctx.gl, ctx.mousePos);
            let p1 = mouseToTrackball(ctx.gl, newPos);

            ctx.orientation.multiplyLeft(trackball(p0, p1));
            ctx.orientation.normalize();

            // console.log('Move',event.button,event.clientX, event.clientY);
            ctx.mousePos = newPos;
            drawScene();
        }
    }

    const mouseWheel = (event: WheelEvent) => {
        if (!context.current) return;
        const ctx = context.current;

        if (event.deltaY > 0.0) ctx.zoom *= 1.1; else ctx.zoom /= 1.1;
        // console.log('Wheel',event.deltaY,event.clientX, event.clientY);
        drawScene();
    }

    const drawScene = () => {

        if (!context.current) return;
        const ctx = context.current;
        const gl = ctx.gl;
        const program = ctx.program;
        const modelView = ctx.modelView;
        const zoom = ctx.zoom;
        const viewMode = ctx.viewMode;
        const qNow = ctx.orientation;

        let mynear = 10;
        let myfar = 100;
        let aspect = gl.canvas.width / gl.canvas.height;
        let displayHeight = 30;
        let displayWidth = aspect * displayHeight;
        let camX = 0;
        let camY = 0;
        let camZ = 50;
        let left = mynear * (-displayWidth / 2 - camX) / camZ;
        let right = mynear * (displayWidth / 2 - camX) / camZ;
        let bottom = mynear * (-displayHeight / 2 - camY) / camZ;
        let top = mynear * (displayHeight / 2 - camY) / camZ;

        ctx.projection.identity();
        if (viewMode == ViewMode.Orthographic) {
            ctx.projection = new Matrix4().ortho(
                {
                    left: -displayWidth / 2, right: displayWidth / 2,
                    bottom: -displayHeight / 2, top: displayHeight / 2,
                    near: mynear, far: myfar
                });
        }
        if (viewMode == ViewMode.Perspective) {
            ctx.projection = new Matrix4().frustum(
                {
                    'left': left, 'right': right,
                    'bottom': bottom, 'top': top,
                    'near': mynear, 'far': myfar
                });
        }
        ctx.projection.translate([-camX, -camY, -camZ]);

        camX = -3;
        left = mynear * (-displayWidth / 2 - camX) / camZ;
        right = mynear * (displayWidth / 2 - camX) / camZ;
        bottom = mynear * (-displayHeight / 2 - camY) / camZ;
        top = mynear * (displayHeight / 2 - camY) / camZ;

        let PLeft = new Matrix4();
        PLeft.frustum({
            'left': left, 'right': right,
            'bottom': bottom, 'top': top,
            'near': mynear, 'far': myfar
        });
        PLeft.translate([-camX, -camY, -camZ]);

        camX = 3;
        left = mynear * (-displayWidth / 2 - camX) / camZ;
        right = mynear * (displayWidth / 2 - camX) / camZ;
        bottom = mynear * (-displayHeight / 2 - camY) / camZ;
        top = mynear * (displayHeight / 2 - camY) / camZ;

        let PRight = new Matrix4();
        PRight.frustum({
            'left': left, 'right': right,
            'bottom': bottom, 'top': top,
            'near': mynear, 'far': myfar
        });
        PRight.translate([-camX, -camY, -camZ]);

        modelView.identity();
        modelView.fromQuaternion(qNow);
        modelView.scale([zoom, zoom, zoom]);
        modelView.scale([15, 15, 15]);

        let colorLoc = gl.getUniformLocation(program, 'uColor');
        gl.uniform3fv(colorLoc, [1, 1, 1]);

        gl.colorMask(true, true, true, true);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (viewMode == ViewMode.Stereo) {
            gl.colorMask(true, false, false, true);
            ctx.projection = PLeft;
            drawShapes(ctx);

            gl.clear(gl.DEPTH_BUFFER_BIT);

            gl.colorMask(false, true, true, true);
            ctx.projection = PRight;
            drawShapes(ctx);
        } else {
            drawShapes(ctx);
        }
    }


    const init = async () => {
        // Initialize WebGL2 Context / OpenGL ES 3.0
        const gl = canvas.current.getContext('webgl2', { antialias: true })
        if (!gl) return;

        // Load the vertex and fragment shader source code
        const program = compileShaderProgram(gl, VertexCode, FragmentCode);
        gl.useProgram(program);

        const radius = 2;

        // SHAPES werden hier geladen
        const pool = createPool(gl);
        const ball = createBall(gl, new Vector3(1,1,1),0.5, new Vector3(1,0,0));

        gl.clearColor(0.5, 0.5, 0.5, 1);
        gl.enable(gl.DEPTH_TEST);
        // gl.enable(gl.CULL_FACE);

        const resizeHandler = () => {
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            drawScene();
        }

        canvas.current.addEventListener('mousedown', mouseDown);
        canvas.current.addEventListener('mouseup', mouseUp);
        canvas.current.addEventListener('mousemove', mouseMove);
        canvas.current.addEventListener('wheel', mouseWheel);

        context.current = {
            gl,
            shapes: [pool, ball],
            program,
            modelView: new Matrix4().identity(),
            projection: new Matrix4().identity(),
            mousePos: new Vector2(),
            mousePressed: false,
            aspect: 1.0,
            zoom: 0.7 / (0.5 * radius + 1.0),
            viewMode: ViewMode.Perspective,
            orientation: new Quaternion(),
        }

        resizeCanvas(canvas.current);
        resizeHandler();

        window.addEventListener('resize', () => {
            if (resizeCanvas(canvas.current)) {
                resizeHandler();
            }
        });
    }

    React.useEffect(() => {
        init();
    }, [])

    return (
        <div className='relative bg-black h-[inherit] w-full'>
            <canvas ref={canvas} className='w-full h-[inherit]'></canvas>

            <UIPanel>
                <UILabel title="View Mode">
                    <MultiSwitch
                        onChange={(value) => {
                            context.current.viewMode = value;
                            drawScene();
                            renderUI();
                        }}
                    >
                        <MultiSwitchElement
                            label="Stereo"
                            value={ViewMode.Stereo}
                        />
                        <MultiSwitchElement
                            label="Orthographic"
                            value={ViewMode.Orthographic}
                        />
                        <MultiSwitchElement
                            label="Perspective"
                            value={ViewMode.Perspective}
                        />
                    </MultiSwitch>
                </UILabel>
            </UIPanel>
        </div>
    )
}

export default App
