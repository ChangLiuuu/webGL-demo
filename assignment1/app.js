/**
 * Created by liuchang on 9/30/17.
 */

var InitDemo = function() {
    console.log('This is working');
    var canvas = document.getElementById('myCanvas');
    var gl = canvas.getContext('webgl');
    if (!gl) {
        console.log('WebGL not supported, falling back on experimental-webgl.')
        gl = canvas.getContext('experimental-webgl');
    }

    if (!gl) {
        alert('Your browser does not support WebGL');
    }


    /* 从像素坐标转换到 0.0 到 1.0 --> 再把 0->1 转换 0->2 -- >  把 0->2 转换到 -1->+1 (裁剪空间) */
    var vertexShaderStr = "\
    attribute vec2 a_Position;\
    uniform vec2 u_resolution;\
    void main() {\
        vec2 zeroToOne = a_Position / u_resolution;\
        vec2 zeroToTwo = zeroToOne * 2.0;\
        vec2 clipSpace = zeroToTwo - 1.0;\
        gl_Position = vec4(clipSpace, 0, 1);\
    }\
    ";

    var fragmentShaderStr = "\
    precision mediump float;\
    void main(){\
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\
    }\
    ";

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderStr);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vertexShader));
    }

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderStr);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(fragmentShader));
    }

    /* create GLSL program and bind shader */
    var prg = gl.createProgram();
    gl.attachShader(prg, vertexShader);
    gl.attachShader(prg, fragmentShader);
    gl.linkProgram(prg);

    if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
        gl.deleteProgram(prg);
    }

    /* look up the location of the attribute for the program */
    var positionAttribLocation = gl.getAttribLocation(prg, 'a_Position');
    var resolutionUniformLocation = gl.getUniformLocation(prg, 'u_resolution');
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    /* create positionBuffer cause attributes get their data from buffers */
    var positionBuffer = gl.createBuffer();
    if (!positionBuffer) {
        alert("Unable to initialize the vertexBuffer.");
        return;
    }

    /* bind position position buffer */
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(midPoint(100).pointArr), gl.STATIC_DRAW);

    /* put data in that buffer by referencing it through the bind point */

    /*
     // three 2d points
     var positions = [
     0, 0,
     0, 0.5,
     0.7, 0
     ];
     width : 400   height 300
     clip space      screen space
     0, 0       ->   200, 150
     0, 0.5     ->   200, 225
     0.7, 0     ->   340, 150

     */

    // var positions = [
    //     0, 0,
    //     0, 0.5,
    //     0.5, 0,
    //     0.5 , 0,
    //     0.5, 0.5,
    //     1.0 , 1.0
    // ];

    var positions = midPoint(10).pointArr;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    /* convert from clip space values to back into pixels(screen space)  */
    //This tells WebGL the -1 +1 clip space maps to 0 <-> gl.canvas.width for x and 0 <-> gl.canvas.height for y.
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    /* clear the canvas */
    gl.clearColor(175 / 225, 240 / 225, 245 / 225, 1.0);// set canvas's color
    gl.clear(gl.COLOR_BUFFER_BIT);

    /* tell WebGL which shader program to execute */
    gl.useProgram(prg);

    /* first tell WebGL how to take data from the buffer we setup above and supply it to the attribute in the shader */
    gl.enableVertexAttribArray(positionAttribLocation);

    /* then need to specify how to pull the data out */

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration / Number of elements per attribute
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionAttribLocation, size, type, normalize, stride, offset);
    /*
     a_position = {x: 0, y: 0, z: 0, w: 0}.
     Above we set size = 2. Attributes default to 0, 0, 0, 1
     so this attribute will get its first 2 values (x and y) from our buffer.
     The z, and w will be the default 0 and 1 respectively.
     */

    /* ask WebGL to execute our GLSL program */

    var primitiveType2 = gl.POINTS;
    var offset2 = 0;
    var count2 = positions.length / size;
    gl.drawArrays(primitiveType2, offset2, count2);


    console.log(positions);
}

var midPoint = function(r) {
    var x = 0;
    var y = r;
    var m = 5 / 4 - r;
    var pointArr = [];

    while (y >= x) {

        pointArr.push(x, y);
        pointArr.push(x, -y);
        pointArr.push(-x, y);
        pointArr.push(-x, -y);
        pointArr.push(y, x);
        pointArr.push(-y, x);
        pointArr.push(y, -x);
        pointArr.push(-y, -x);

        if (m < 0) {

            m += 2 * x + 3;
            x++;
        }
        else {
            m += 2 * (x - y) + 5;
            x++;
            y--;
        }

    }

    return {
        pointArr : pointArr
    }
};


