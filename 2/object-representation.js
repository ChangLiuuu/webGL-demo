var readline = require('readline');
var fs = require('fs');

var initDemo = function() {
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


    // mapping from resolution to -1 +1 clip space
    var vertexShaderStr = "\
    attribute vec2 a_position;\
    uniform vec2 u_resolution;\
    void main() {\
        vec2 trans = a_position / u_resolution;\
        gl_Position = vec4(trans, 0, 1);\
        gl_PointSize = 1.0;\
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

    // look up where the vertex data needs to go.
    var positionAttributeLocation = gl.getAttribLocation(prg, 'a_position');

    // look up uniform locations
    var resolutionUniformLocation = gl.getUniformLocation(prg, 'u_resolution');

    // create a buffer to put 2d clip space points in cause attributes get their data from buffers
    var positionBuffer = gl.createBuffer();
    if (!positionBuffer) {
        alert("Unable to initialize the vertexBuffer.");
        return;
    }

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    // clear the canvas
    gl.clearColor(175 / 225, 240 / 225, 245 / 225, 1.0);// set canvas's color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // tell WebGL which shader program to execute
    gl.useProgram(prg);


    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    /* put into data */
    var positions = readFile.verticesAll;
    console.log(positions);

    // put data in that buffer by referencing it through the bind point
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // clear the canvas
    gl.clearColor(175 / 225, 240 / 225, 245 / 225, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // tell it to use our program (pair of shaders)
    gl.useProgram(prg);

    // turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration, MUST be 1,2,3 or 4
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset);

    // set the resolution
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width / 2, gl.canvas.height / 2);

    // draw
    var primitiveType = gl.POINTS;
    var offset2 = 0;
    var count = positions.length / 3;
    gl.drawArrays(primitiveType, offset2, count);
};


// readFile
var vertices = [];
function readFile() {
    // read face-vertices.txt
    var rl = readline.createInterface({
        input : fs.createReadStream('face-vertices.txt'),
    });


    rl.on('line', function (line) {
        var temp = line.split(',');
        vertices.push(temp);
    }).on('close', function() {

    });

    // read face-index.txt
    var rl2 = readline.createInterface({
        input : fs.createReadStream('./face-index.txt')
    });

    var verticesAll = [];
    rl2.on('line', function(line) {
        const temp = line.split(',');
        verticesAll.concat(vertices[temp[0]], vertices[temp[1]], vertices[temp[2]]);
    });
}
readFile();
console.log(vertices);

// var ajax = function(url) {	//封装ajax
//     if (window.XMLHttpRequest) {  //if解决兼容IE6问题，window解决报错问题
//         var oAjax = new XMLHttpRequest(); // 1.创建ajax对象,不兼容IE6
//     }else{
//         var oAjax = new ActiveXObject("Microsoft.XMLHTTP");  //兼容IE6
//     }
//
//     //open(方法，文件名，异步传输true)
//     oAjax.open('GET',url,true);  //2.连接服务器
//     //在文件名后添加动态时间是为了解决缓存问题 new Date().getTime()
//
//     oAjax.send();	//3.发送请求
//
//     //4.接收服务器返回数据
//     oAjax.onreadystatechange = function () {	//使用onreadystatechange事件
//         if (oAjax.readyState === 4) {	// 4表示解析（读取）完成，可以在客户端调用了
//             if (oAjax.status === 200) {	// status 返回状态码,如果等于200，表示成功
//
//                 return {
//                     file : oAjax.responseText
//                 }
//
//             } else {
//
//                 console.log('err', oAjax.status);
//             }
//         }
//     }
// };
//
