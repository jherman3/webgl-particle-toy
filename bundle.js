(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){
/*
** Copyright (c) 2012 The Khronos Group Inc.
**
** Permission is hereby granted, free of charge, to any person obtaining a
** copy of this software and/or associated documentation files (the
** "Materials"), to deal in the Materials without restriction, including
** without limitation the rights to use, copy, modify, merge, publish,
** distribute, sublicense, and/or sell copies of the Materials, and to
** permit persons to whom the Materials are furnished to do so, subject to
** the following conditions:
**
** The above copyright notice and this permission notice shall be included
** in all copies or substantial portions of the Materials.
**
** THE MATERIALS ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
** EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
** MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
** IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
** CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
** TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
** MATERIALS OR THE USE OR OTHER DEALINGS IN THE MATERIALS.
*/

//Ported to node by Marcin Ignac on 2016-05-20

// Various functions for helping debug WebGL apps.

WebGLDebugUtils = function() {
var window

//polyfill window in node
if (typeof(window) == 'undefined') {
    window = global;
}

/**
 * Wrapped logging function.
 * @param {string} msg Message to log.
 */
var log = function(msg) {
  if (window.console && window.console.log) {
    window.console.log(msg);
  }
};

/**
 * Wrapped error logging function.
 * @param {string} msg Message to log.
 */
var error = function(msg) {
  if (window.console && window.console.error) {
    window.console.error(msg);
  } else {
    log(msg);
  }
};


/**
 * Which arguments are enums based on the number of arguments to the function.
 * So
 *    'texImage2D': {
 *       9: { 0:true, 2:true, 6:true, 7:true },
 *       6: { 0:true, 2:true, 3:true, 4:true },
 *    },
 *
 * means if there are 9 arguments then 6 and 7 are enums, if there are 6
 * arguments 3 and 4 are enums
 *
 * @type {!Object.<number, !Object.<number, string>}
 */
var glValidEnumContexts = {
  // Generic setters and getters

  'enable': {1: { 0:true }},
  'disable': {1: { 0:true }},
  'getParameter': {1: { 0:true }},

  // Rendering

  'drawArrays': {3:{ 0:true }},
  'drawElements': {4:{ 0:true, 2:true }},

  // Shaders

  'createShader': {1: { 0:true }},
  'getShaderParameter': {2: { 1:true }},
  'getProgramParameter': {2: { 1:true }},
  'getShaderPrecisionFormat': {2: { 0: true, 1:true }},

  // Vertex attributes

  'getVertexAttrib': {2: { 1:true }},
  'vertexAttribPointer': {6: { 2:true }},

  // Textures

  'bindTexture': {2: { 0:true }},
  'activeTexture': {1: { 0:true }},
  'getTexParameter': {2: { 0:true, 1:true }},
  'texParameterf': {3: { 0:true, 1:true }},
  'texParameteri': {3: { 0:true, 1:true, 2:true }},
  // texImage2D and texSubImage2D are defined below with WebGL 2 entrypoints
  'copyTexImage2D': {8: { 0:true, 2:true }},
  'copyTexSubImage2D': {8: { 0:true }},
  'generateMipmap': {1: { 0:true }},
  // compressedTexImage2D and compressedTexSubImage2D are defined below with WebGL 2 entrypoints

  // Buffer objects

  'bindBuffer': {2: { 0:true }},
  // bufferData and bufferSubData are defined below with WebGL 2 entrypoints
  'getBufferParameter': {2: { 0:true, 1:true }},

  // Renderbuffers and framebuffers

  'pixelStorei': {2: { 0:true, 1:true }},
  // readPixels is defined below with WebGL 2 entrypoints
  'bindRenderbuffer': {2: { 0:true }},
  'bindFramebuffer': {2: { 0:true }},
  'checkFramebufferStatus': {1: { 0:true }},
  'framebufferRenderbuffer': {4: { 0:true, 1:true, 2:true }},
  'framebufferTexture2D': {5: { 0:true, 1:true, 2:true }},
  'getFramebufferAttachmentParameter': {3: { 0:true, 1:true, 2:true }},
  'getRenderbufferParameter': {2: { 0:true, 1:true }},
  'renderbufferStorage': {4: { 0:true, 1:true }},

  // Frame buffer operations (clear, blend, depth test, stencil)

  'clear': {1: { 0: { 'enumBitwiseOr': ['COLOR_BUFFER_BIT', 'DEPTH_BUFFER_BIT', 'STENCIL_BUFFER_BIT'] }}},
  'depthFunc': {1: { 0:true }},
  'blendFunc': {2: { 0:true, 1:true }},
  'blendFuncSeparate': {4: { 0:true, 1:true, 2:true, 3:true }},
  'blendEquation': {1: { 0:true }},
  'blendEquationSeparate': {2: { 0:true, 1:true }},
  'stencilFunc': {3: { 0:true }},
  'stencilFuncSeparate': {4: { 0:true, 1:true }},
  'stencilMaskSeparate': {2: { 0:true }},
  'stencilOp': {3: { 0:true, 1:true, 2:true }},
  'stencilOpSeparate': {4: { 0:true, 1:true, 2:true, 3:true }},

  // Culling

  'cullFace': {1: { 0:true }},
  'frontFace': {1: { 0:true }},

  // ANGLE_instanced_arrays extension

  'drawArraysInstancedANGLE': {4: { 0:true }},
  'drawElementsInstancedANGLE': {5: { 0:true, 2:true }},

  // EXT_blend_minmax extension

  'blendEquationEXT': {1: { 0:true }},

  // WebGL 2 Buffer objects

  'bufferData': {
    3: { 0:true, 2:true }, // WebGL 1
    4: { 0:true, 2:true }, // WebGL 2
    5: { 0:true, 2:true }  // WebGL 2
  },
  'bufferSubData': {
    3: { 0:true }, // WebGL 1
    4: { 0:true }, // WebGL 2
    5: { 0:true }  // WebGL 2
  },
  'copyBufferSubData': {5: { 0:true, 1:true }},
  'getBufferSubData': {3: { 0:true }, 4: { 0:true }, 5: { 0:true }},

  // WebGL 2 Framebuffer objects

  'blitFramebuffer': {10: { 8: { 'enumBitwiseOr': ['COLOR_BUFFER_BIT', 'DEPTH_BUFFER_BIT', 'STENCIL_BUFFER_BIT'] }, 9:true }},
  'framebufferTextureLayer': {5: { 0:true, 1:true }},
  'invalidateFramebuffer': {2: { 0:true }},
  'invalidateSubFramebuffer': {6: { 0:true }},
  'readBuffer': {1: { 0:true }},

  // WebGL 2 Renderbuffer objects

  'getInternalformatParameter': {3: { 0:true, 1:true, 2:true }},
  'renderbufferStorageMultisample': {5: { 0:true, 2:true }},

  // WebGL 2 Texture objects

  'texStorage2D': {5: { 0:true, 2:true }},
  'texStorage3D': {6: { 0:true, 2:true }},
  'texImage2D': {
    9: { 0:true, 2:true, 6:true, 7:true }, // WebGL 1 & 2
    6: { 0:true, 2:true, 3:true, 4:true }, // WebGL 1
    10: { 0:true, 2:true, 6:true, 7:true } // WebGL 2
  },
  'texImage3D': {
    10: { 0:true, 2:true, 7:true, 8:true },
    11: { 0:true, 2:true, 7:true, 8:true }
  },
  'texSubImage2D': {
    9: { 0:true, 6:true, 7:true }, // WebGL 1 & 2
    7: { 0:true, 4:true, 5:true }, // WebGL 1
    10: { 0:true, 6:true, 7:true } // WebGL 2
  },
  'texSubImage3D': {
    11: { 0:true, 8:true, 9:true },
    12: { 0:true, 8:true, 9:true }
  },
  'copyTexSubImage3D': {9: { 0:true }},
  'compressedTexImage2D': {
    7: { 0: true, 2:true }, // WebGL 1 & 2
    8: { 0: true, 2:true }, // WebGL 2
    9: { 0: true, 2:true }  // WebGL 2
  },
  'compressedTexImage3D': {
    8: { 0: true, 2:true },
    9: { 0: true, 2:true },
    10: { 0: true, 2:true }
  },
  'compressedTexSubImage2D': {
    8: { 0: true, 6:true }, // WebGL 1 & 2
    9: { 0: true, 6:true }, // WebGL 2
    10: { 0: true, 6:true } // WebGL 2
  },
  'compressedTexSubImage3D': {
    10: { 0: true, 8:true },
    11: { 0: true, 8:true },
    12: { 0: true, 8:true }
  },

  // WebGL 2 Vertex attribs

  'vertexAttribIPointer': {5: { 2:true }},

  // WebGL 2 Writing to the drawing buffer

  'drawArraysInstanced': {4: { 0:true }},
  'drawElementsInstanced': {5: { 0:true, 2:true }},
  'drawRangeElements': {6: { 0:true, 4:true }},

  // WebGL 2 Reading back pixels

  'readPixels': {
    7: { 4:true, 5:true }, // WebGL 1 & 2
    8: { 4:true, 5:true }  // WebGL 2
  },

  // WebGL 2 Multiple Render Targets

  'clearBufferfv': {3: { 0:true }, 4: { 0:true }},
  'clearBufferiv': {3: { 0:true }, 4: { 0:true }},
  'clearBufferuiv': {3: { 0:true }, 4: { 0:true }},
  'clearBufferfi': {4: { 0:true }},

  // WebGL 2 Query objects

  'beginQuery': {2: { 0:true }},
  'endQuery': {1: { 0:true }},
  'getQuery': {2: { 0:true, 1:true }},
  'getQueryParameter': {2: { 1:true }},

  // WebGL 2 Sampler objects

  'samplerParameteri': {3: { 1:true, 2:true }},
  'samplerParameterf': {3: { 1:true }},
  'getSamplerParameter': {2: { 1:true }},

  // WebGL 2 Sync objects

  'fenceSync': {2: { 0:true, 1: { 'enumBitwiseOr': [] } }},
  'clientWaitSync': {3: { 1: { 'enumBitwiseOr': ['SYNC_FLUSH_COMMANDS_BIT'] } }},
  'waitSync': {3: { 1: { 'enumBitwiseOr': [] } }},
  'getSyncParameter': {2: { 1:true }},

  // WebGL 2 Transform Feedback

  'bindTransformFeedback': {2: { 0:true }},
  'beginTransformFeedback': {1: { 0:true }},
  'transformFeedbackVaryings': {3: { 2:true }},

  // WebGL2 Uniform Buffer Objects and Transform Feedback Buffers

  'bindBufferBase': {3: { 0:true }},
  'bindBufferRange': {5: { 0:true }},
  'getIndexedParameter': {2: { 0:true }},
  'getActiveUniforms': {3: { 2:true }},
  'getActiveUniformBlockParameter': {3: { 2:true }}
};

/**
 * Map of numbers to names.
 * @type {Object}
 */
var glEnums = null;

/**
 * Map of names to numbers.
 * @type {Object}
 */
var enumStringToValue = null;

/**
 * Initializes this module. Safe to call more than once.
 * @param {!WebGLRenderingContext} ctx A WebGL context. If
 *    you have more than one context it doesn't matter which one
 *    you pass in, it is only used to pull out constants.
 */
function init(ctx) {
  if (glEnums == null) {
    glEnums = { };
    enumStringToValue = { };
    for (var propertyName in ctx) {
      if (typeof ctx[propertyName] == 'number') {
        glEnums[ctx[propertyName]] = propertyName;
        enumStringToValue[propertyName] = ctx[propertyName];
      }
    }
  }
}

/**
 * Checks the utils have been initialized.
 */
function checkInit() {
  if (glEnums == null) {
    throw 'WebGLDebugUtils.init(ctx) not called';
  }
}

/**
 * Returns true or false if value matches any WebGL enum
 * @param {*} value Value to check if it might be an enum.
 * @return {boolean} True if value matches one of the WebGL defined enums
 */
function mightBeEnum(value) {
  checkInit();
  return (glEnums[value] !== undefined);
}

/**
 * Gets an string version of an WebGL enum.
 *
 * Example:
 *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
 *
 * @param {number} value Value to return an enum for
 * @return {string} The string version of the enum.
 */
function glEnumToString(value) {
  checkInit();
  var name = glEnums[value];
  return (name !== undefined) ? ("gl." + name) :
      ("/*UNKNOWN WebGL ENUM*/ 0x" + value.toString(16) + "");
}

/**
 * Returns the string version of a WebGL argument.
 * Attempts to convert enum arguments to strings.
 * @param {string} functionName the name of the WebGL function.
 * @param {number} numArgs the number of arguments passed to the function.
 * @param {number} argumentIndx the index of the argument.
 * @param {*} value The value of the argument.
 * @return {string} The value as a string.
 */
function glFunctionArgToString(functionName, numArgs, argumentIndex, value) {
  var funcInfo = glValidEnumContexts[functionName];
  if (funcInfo !== undefined) {
    var funcInfo = funcInfo[numArgs];
    if (funcInfo !== undefined) {
      if (funcInfo[argumentIndex]) {
        if (typeof funcInfo[argumentIndex] === 'object' &&
            funcInfo[argumentIndex]['enumBitwiseOr'] !== undefined) {
          var enums = funcInfo[argumentIndex]['enumBitwiseOr'];
          var orResult = 0;
          var orEnums = [];
          for (var i = 0; i < enums.length; ++i) {
            var enumValue = enumStringToValue[enums[i]];
            if ((value & enumValue) !== 0) {
              orResult |= enumValue;
              orEnums.push(glEnumToString(enumValue));
            }
          }
          if (orResult === value) {
            return orEnums.join(' | ');
          } else {
            return glEnumToString(value);
          }
        } else {
          return glEnumToString(value);
        }
      }
    }
  }
  if (value === null) {
    return "null";
  } else if (value === undefined) {
    return "undefined";
  } else {
    return value.toString();
  }
}

/**
 * Converts the arguments of a WebGL function to a string.
 * Attempts to convert enum arguments to strings.
 *
 * @param {string} functionName the name of the WebGL function.
 * @param {number} args The arguments.
 * @return {string} The arguments as a string.
 */
function glFunctionArgsToString(functionName, args) {
  // apparently we can't do args.join(",");
  var argStr = "";
  var numArgs = args.length;
  for (var ii = 0; ii < numArgs; ++ii) {
    argStr += ((ii == 0) ? '' : ', ') +
        glFunctionArgToString(functionName, numArgs, ii, args[ii]);
  }
  return argStr;
};


function makePropertyWrapper(wrapper, original, propertyName) {
  //log("wrap prop: " + propertyName);
  wrapper.__defineGetter__(propertyName, function() {
    return original[propertyName];
  });
  // TODO(gmane): this needs to handle properties that take more than
  // one value?
  wrapper.__defineSetter__(propertyName, function(value) {
    //log("set: " + propertyName);
    original[propertyName] = value;
  });
}

// Makes a function that calls a function on another object.
function makeFunctionWrapper(original, functionName) {
  //log("wrap fn: " + functionName);
  var f = original[functionName];
  return function() {
    //log("call: " + functionName);
    var result = f.apply(original, arguments);
    return result;
  };
}

/**
 * Given a WebGL context returns a wrapped context that calls
 * gl.getError after every command and calls a function if the
 * result is not gl.NO_ERROR.
 *
 * @param {!WebGLRenderingContext} ctx The webgl context to
 *        wrap.
 * @param {!function(err, funcName, args): void} opt_onErrorFunc
 *        The function to call when gl.getError returns an
 *        error. If not specified the default function calls
 *        console.log with a message.
 * @param {!function(funcName, args): void} opt_onFunc The
 *        function to call when each webgl function is called.
 *        You can use this to log all calls for example.
 * @param {!WebGLRenderingContext} opt_err_ctx The webgl context
 *        to call getError on if different than ctx.
 */
function makeDebugContext(ctx, opt_onErrorFunc, opt_onFunc, opt_err_ctx) {
  opt_err_ctx = opt_err_ctx || ctx;
  init(ctx);
  opt_onErrorFunc = opt_onErrorFunc || function(err, functionName, args) {
        // apparently we can't do args.join(",");
        var argStr = "";
        var numArgs = args.length;
        for (var ii = 0; ii < numArgs; ++ii) {
          argStr += ((ii == 0) ? '' : ', ') +
              glFunctionArgToString(functionName, numArgs, ii, args[ii]);
        }
        error("WebGL error "+ glEnumToString(err) + " in "+ functionName +
              "(" + argStr + ")");
      };

  // Holds booleans for each GL error so after we get the error ourselves
  // we can still return it to the client app.
  var glErrorShadow = { };

  // Makes a function that calls a WebGL function and then calls getError.
  function makeErrorWrapper(ctx, functionName) {
    return function() {
      if (opt_onFunc) {
        opt_onFunc(functionName, arguments);
      }
      var result = ctx[functionName].apply(ctx, arguments);
      var err = opt_err_ctx.getError();
      if (err != 0) {
        glErrorShadow[err] = true;
        opt_onErrorFunc(err, functionName, arguments);
      }
      return result;
    };
  }

  // Make a an object that has a copy of every property of the WebGL context
  // but wraps all functions.
  var wrapper = {};
  for (var propertyName in ctx) {
    if (typeof ctx[propertyName] == 'function') {
      if (propertyName != 'getExtension') {
        wrapper[propertyName] = makeErrorWrapper(ctx, propertyName);
      } else {
        var wrapped = makeErrorWrapper(ctx, propertyName);
        wrapper[propertyName] = function () {
          var result = wrapped.apply(ctx, arguments);
          if (!result) {
            return null;
          }
          return makeDebugContext(result, opt_onErrorFunc, opt_onFunc, opt_err_ctx);
        };
      }
    } else {
      makePropertyWrapper(wrapper, ctx, propertyName);
    }
  }

  // Override the getError function with one that returns our saved results.
  wrapper.getError = function() {
    for (var err in glErrorShadow) {
      if (glErrorShadow.hasOwnProperty(err)) {
        if (glErrorShadow[err]) {
          glErrorShadow[err] = false;
          return err;
        }
      }
    }
    return ctx.NO_ERROR;
  };

  return wrapper;
}

function resetToInitialState(ctx) {
  var isWebGL2RenderingContext = !!ctx.createTransformFeedback;

  if (isWebGL2RenderingContext) {
    ctx.bindVertexArray(null);
  }

  var numAttribs = ctx.getParameter(ctx.MAX_VERTEX_ATTRIBS);
  var tmp = ctx.createBuffer();
  ctx.bindBuffer(ctx.ARRAY_BUFFER, tmp);
  for (var ii = 0; ii < numAttribs; ++ii) {
    ctx.disableVertexAttribArray(ii);
    ctx.vertexAttribPointer(ii, 4, ctx.FLOAT, false, 0, 0);
    ctx.vertexAttrib1f(ii, 0);
    if (isWebGL2RenderingContext) {
      ctx.vertexAttribDivisor(ii, 0);
    }
  }
  ctx.deleteBuffer(tmp);

  var numTextureUnits = ctx.getParameter(ctx.MAX_TEXTURE_IMAGE_UNITS);
  for (var ii = 0; ii < numTextureUnits; ++ii) {
    ctx.activeTexture(ctx.TEXTURE0 + ii);
    ctx.bindTexture(ctx.TEXTURE_CUBE_MAP, null);
    ctx.bindTexture(ctx.TEXTURE_2D, null);
    if (isWebGL2RenderingContext) {
      ctx.bindTexture(ctx.TEXTURE_2D_ARRAY, null);
      ctx.bindTexture(ctx.TEXTURE_3D, null);
      ctx.bindSampler(ii, null);
    }
  }

  ctx.activeTexture(ctx.TEXTURE0);
  ctx.useProgram(null);
  ctx.bindBuffer(ctx.ARRAY_BUFFER, null);
  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, null);
  ctx.bindFramebuffer(ctx.FRAMEBUFFER, null);
  ctx.bindRenderbuffer(ctx.RENDERBUFFER, null);
  ctx.disable(ctx.BLEND);
  ctx.disable(ctx.CULL_FACE);
  ctx.disable(ctx.DEPTH_TEST);
  ctx.disable(ctx.DITHER);
  ctx.disable(ctx.SCISSOR_TEST);
  ctx.blendColor(0, 0, 0, 0);
  ctx.blendEquation(ctx.FUNC_ADD);
  ctx.blendFunc(ctx.ONE, ctx.ZERO);
  ctx.clearColor(0, 0, 0, 0);
  ctx.clearDepth(1);
  ctx.clearStencil(-1);
  ctx.colorMask(true, true, true, true);
  ctx.cullFace(ctx.BACK);
  ctx.depthFunc(ctx.LESS);
  ctx.depthMask(true);
  ctx.depthRange(0, 1);
  ctx.frontFace(ctx.CCW);
  ctx.hint(ctx.GENERATE_MIPMAP_HINT, ctx.DONT_CARE);
  ctx.lineWidth(1);
  ctx.pixelStorei(ctx.PACK_ALIGNMENT, 4);
  ctx.pixelStorei(ctx.UNPACK_ALIGNMENT, 4);
  ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false);
  ctx.pixelStorei(ctx.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  // TODO: Delete this IF.
  if (ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL) {
    ctx.pixelStorei(ctx.UNPACK_COLORSPACE_CONVERSION_WEBGL, ctx.BROWSER_DEFAULT_WEBGL);
  }
  ctx.polygonOffset(0, 0);
  ctx.sampleCoverage(1, false);
  ctx.scissor(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.stencilFunc(ctx.ALWAYS, 0, 0xFFFFFFFF);
  ctx.stencilMask(0xFFFFFFFF);
  ctx.stencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);
  ctx.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT | ctx.STENCIL_BUFFER_BIT);

  if (isWebGL2RenderingContext) {
    ctx.drawBuffers([ctx.BACK]);
    ctx.readBuffer(ctx.BACK);
    ctx.bindBuffer(ctx.COPY_READ_BUFFER, null);
    ctx.bindBuffer(ctx.COPY_WRITE_BUFFER, null);
    ctx.bindBuffer(ctx.PIXEL_PACK_BUFFER, null);
    ctx.bindBuffer(ctx.PIXEL_UNPACK_BUFFER, null);
    var numTransformFeedbacks = ctx.getParameter(ctx.MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS);
    for (var ii = 0; ii < numTransformFeedbacks; ++ii) {
      ctx.bindBufferBase(ctx.TRANSFORM_FEEDBACK_BUFFER, ii, null);
    }
    var numUBOs = ctx.getParameter(ctx.MAX_UNIFORM_BUFFER_BINDINGS);
    for (var ii = 0; ii < numUBOs; ++ii) {
      ctx.bindBufferBase(ctx.UNIFORM_BUFFER, ii, null);
    }
    ctx.disable(ctx.RASTERIZER_DISCARD);
    ctx.pixelStorei(ctx.UNPACK_IMAGE_HEIGHT, 0);
    ctx.pixelStorei(ctx.UNPACK_SKIP_IMAGES, 0);
    ctx.pixelStorei(ctx.UNPACK_ROW_LENGTH, 0);
    ctx.pixelStorei(ctx.UNPACK_SKIP_ROWS, 0);
    ctx.pixelStorei(ctx.UNPACK_SKIP_PIXELS, 0);
    ctx.pixelStorei(ctx.PACK_ROW_LENGTH, 0);
    ctx.pixelStorei(ctx.PACK_SKIP_ROWS, 0);
    ctx.pixelStorei(ctx.PACK_SKIP_PIXELS, 0);
    ctx.hint(ctx.FRAGMENT_SHADER_DERIVATIVE_HINT, ctx.DONT_CARE);
  }

  // TODO: This should NOT be needed but Firefox fails with 'hint'
  while(ctx.getError());
}

function makeLostContextSimulatingCanvas(canvas) {
  var unwrappedContext_;
  var wrappedContext_;
  var onLost_ = [];
  var onRestored_ = [];
  var wrappedContext_ = {};
  var contextId_ = 1;
  var contextLost_ = false;
  var resourceId_ = 0;
  var resourceDb_ = [];
  var numCallsToLoseContext_ = 0;
  var numCalls_ = 0;
  var canRestore_ = false;
  var restoreTimeout_ = 0;
  var isWebGL2RenderingContext;

  // Holds booleans for each GL error so can simulate errors.
  var glErrorShadow_ = { };

  canvas.getContext = function(f) {
    return function() {
      var ctx = f.apply(canvas, arguments);
      // Did we get a context and is it a WebGL context?
      if ((ctx instanceof WebGLRenderingContext) || (window.WebGL2RenderingContext && (ctx instanceof WebGL2RenderingContext))) {
        if (ctx != unwrappedContext_) {
          if (unwrappedContext_) {
            throw "got different context"
          }
          isWebGL2RenderingContext = window.WebGL2RenderingContext && (ctx instanceof WebGL2RenderingContext);
          unwrappedContext_ = ctx;
          wrappedContext_ = makeLostContextSimulatingContext(unwrappedContext_);
        }
        return wrappedContext_;
      }
      return ctx;
    }
  }(canvas.getContext);

  function wrapEvent(listener) {
    if (typeof(listener) == "function") {
      return listener;
    } else {
      return function(info) {
        listener.handleEvent(info);
      }
    }
  }

  var addOnContextLostListener = function(listener) {
    onLost_.push(wrapEvent(listener));
  };

  var addOnContextRestoredListener = function(listener) {
    onRestored_.push(wrapEvent(listener));
  };


  function wrapAddEventListener(canvas) {
    var f = canvas.addEventListener;
    canvas.addEventListener = function(type, listener, bubble) {
      switch (type) {
        case 'webglcontextlost':
          addOnContextLostListener(listener);
          break;
        case 'webglcontextrestored':
          addOnContextRestoredListener(listener);
          break;
        default:
          f.apply(canvas, arguments);
      }
    };
  }

  wrapAddEventListener(canvas);

  canvas.loseContext = function() {
    if (!contextLost_) {
      contextLost_ = true;
      numCallsToLoseContext_ = 0;
      ++contextId_;
      while (unwrappedContext_.getError());
      clearErrors();
      glErrorShadow_[unwrappedContext_.CONTEXT_LOST_WEBGL] = true;
      var event = makeWebGLContextEvent("context lost");
      var callbacks = onLost_.slice();
      setTimeout(function() {
          //log("numCallbacks:" + callbacks.length);
          for (var ii = 0; ii < callbacks.length; ++ii) {
            //log("calling callback:" + ii);
            callbacks[ii](event);
          }
          if (restoreTimeout_ >= 0) {
            setTimeout(function() {
                canvas.restoreContext();
              }, restoreTimeout_);
          }
        }, 0);
    }
  };

  canvas.restoreContext = function() {
    if (contextLost_) {
      if (onRestored_.length) {
        setTimeout(function() {
            if (!canRestore_) {
              throw "can not restore. webglcontestlost listener did not call event.preventDefault";
            }
            freeResources();
            resetToInitialState(unwrappedContext_);
            contextLost_ = false;
            numCalls_ = 0;
            canRestore_ = false;
            var callbacks = onRestored_.slice();
            var event = makeWebGLContextEvent("context restored");
            for (var ii = 0; ii < callbacks.length; ++ii) {
              callbacks[ii](event);
            }
          }, 0);
      }
    }
  };

  canvas.loseContextInNCalls = function(numCalls) {
    if (contextLost_) {
      throw "You can not ask a lost contet to be lost";
    }
    numCallsToLoseContext_ = numCalls_ + numCalls;
  };

  canvas.getNumCalls = function() {
    return numCalls_;
  };

  canvas.setRestoreTimeout = function(timeout) {
    restoreTimeout_ = timeout;
  };

  function isWebGLObject(obj) {
    //return false;
    return (obj instanceof WebGLBuffer ||
            obj instanceof WebGLFramebuffer ||
            obj instanceof WebGLProgram ||
            obj instanceof WebGLRenderbuffer ||
            obj instanceof WebGLShader ||
            obj instanceof WebGLTexture);
  }

  function checkResources(args) {
    for (var ii = 0; ii < args.length; ++ii) {
      var arg = args[ii];
      if (isWebGLObject(arg)) {
        return arg.__webglDebugContextLostId__ == contextId_;
      }
    }
    return true;
  }

  function clearErrors() {
    var k = Object.keys(glErrorShadow_);
    for (var ii = 0; ii < k.length; ++ii) {
      delete glErrorShadow_[k[ii]];
    }
  }

  function loseContextIfTime() {
    ++numCalls_;
    if (!contextLost_) {
      if (numCallsToLoseContext_ == numCalls_) {
        canvas.loseContext();
      }
    }
  }

  // Makes a function that simulates WebGL when out of context.
  function makeLostContextFunctionWrapper(ctx, functionName) {
    var f = ctx[functionName];
    return function() {
      // log("calling:" + functionName);
      // Only call the functions if the context is not lost.
      loseContextIfTime();
      if (!contextLost_) {
        //if (!checkResources(arguments)) {
        //  glErrorShadow_[wrappedContext_.INVALID_OPERATION] = true;
        //  return;
        //}
        var result = f.apply(ctx, arguments);
        return result;
      }
    };
  }

  function freeResources() {
    for (var ii = 0; ii < resourceDb_.length; ++ii) {
      var resource = resourceDb_[ii];
      if (resource instanceof WebGLBuffer) {
        unwrappedContext_.deleteBuffer(resource);
      } else if (resource instanceof WebGLFramebuffer) {
        unwrappedContext_.deleteFramebuffer(resource);
      } else if (resource instanceof WebGLProgram) {
        unwrappedContext_.deleteProgram(resource);
      } else if (resource instanceof WebGLRenderbuffer) {
        unwrappedContext_.deleteRenderbuffer(resource);
      } else if (resource instanceof WebGLShader) {
        unwrappedContext_.deleteShader(resource);
      } else if (resource instanceof WebGLTexture) {
        unwrappedContext_.deleteTexture(resource);
      }
      else if (isWebGL2RenderingContext) {
        if (resource instanceof WebGLQuery) {
          unwrappedContext_.deleteQuery(resource);
        } else if (resource instanceof WebGLSampler) {
          unwrappedContext_.deleteSampler(resource);
        } else if (resource instanceof WebGLSync) {
          unwrappedContext_.deleteSync(resource);
        } else if (resource instanceof WebGLTransformFeedback) {
          unwrappedContext_.deleteTransformFeedback(resource);
        } else if (resource instanceof WebGLVertexArrayObject) {
          unwrappedContext_.deleteVertexArray(resource);
        }
      }
    }
  }

  function makeWebGLContextEvent(statusMessage) {
    return {
      statusMessage: statusMessage,
      preventDefault: function() {
          canRestore_ = true;
        }
    };
  }

  return canvas;

  function makeLostContextSimulatingContext(ctx) {
    // copy all functions and properties to wrapper
    for (var propertyName in ctx) {
      if (typeof ctx[propertyName] == 'function') {
         wrappedContext_[propertyName] = makeLostContextFunctionWrapper(
             ctx, propertyName);
       } else {
         makePropertyWrapper(wrappedContext_, ctx, propertyName);
       }
    }

    // Wrap a few functions specially.
    wrappedContext_.getError = function() {
      loseContextIfTime();
      if (!contextLost_) {
        var err;
        while (err = unwrappedContext_.getError()) {
          glErrorShadow_[err] = true;
        }
      }
      for (var err in glErrorShadow_) {
        if (glErrorShadow_[err]) {
          delete glErrorShadow_[err];
          return err;
        }
      }
      return wrappedContext_.NO_ERROR;
    };

    var creationFunctions = [
      "createBuffer",
      "createFramebuffer",
      "createProgram",
      "createRenderbuffer",
      "createShader",
      "createTexture"
    ];
    if (isWebGL2RenderingContext) {
      creationFunctions.push(
        "createQuery",
        "createSampler",
        "fenceSync",
        "createTransformFeedback",
        "createVertexArray"
      );
    }
    for (var ii = 0; ii < creationFunctions.length; ++ii) {
      var functionName = creationFunctions[ii];
      wrappedContext_[functionName] = function(f) {
        return function() {
          loseContextIfTime();
          if (contextLost_) {
            return null;
          }
          var obj = f.apply(ctx, arguments);
          obj.__webglDebugContextLostId__ = contextId_;
          resourceDb_.push(obj);
          return obj;
        };
      }(ctx[functionName]);
    }

    var functionsThatShouldReturnNull = [
      "getActiveAttrib",
      "getActiveUniform",
      "getBufferParameter",
      "getContextAttributes",
      "getAttachedShaders",
      "getFramebufferAttachmentParameter",
      "getParameter",
      "getProgramParameter",
      "getProgramInfoLog",
      "getRenderbufferParameter",
      "getShaderParameter",
      "getShaderInfoLog",
      "getShaderSource",
      "getTexParameter",
      "getUniform",
      "getUniformLocation",
      "getVertexAttrib"
    ];
    if (isWebGL2RenderingContext) {
      functionsThatShouldReturnNull.push(
        "getInternalformatParameter",
        "getQuery",
        "getQueryParameter",
        "getSamplerParameter",
        "getSyncParameter",
        "getTransformFeedbackVarying",
        "getIndexedParameter",
        "getUniformIndices",
        "getActiveUniforms",
        "getActiveUniformBlockParameter",
        "getActiveUniformBlockName"
      );
    }
    for (var ii = 0; ii < functionsThatShouldReturnNull.length; ++ii) {
      var functionName = functionsThatShouldReturnNull[ii];
      wrappedContext_[functionName] = function(f) {
        return function() {
          loseContextIfTime();
          if (contextLost_) {
            return null;
          }
          return f.apply(ctx, arguments);
        }
      }(wrappedContext_[functionName]);
    }

    var isFunctions = [
      "isBuffer",
      "isEnabled",
      "isFramebuffer",
      "isProgram",
      "isRenderbuffer",
      "isShader",
      "isTexture"
    ];
    if (isWebGL2RenderingContext) {
      isFunctions.push(
        "isQuery",
        "isSampler",
        "isSync",
        "isTransformFeedback",
        "isVertexArray"
      );
    }
    for (var ii = 0; ii < isFunctions.length; ++ii) {
      var functionName = isFunctions[ii];
      wrappedContext_[functionName] = function(f) {
        return function() {
          loseContextIfTime();
          if (contextLost_) {
            return false;
          }
          return f.apply(ctx, arguments);
        }
      }(wrappedContext_[functionName]);
    }

    wrappedContext_.checkFramebufferStatus = function(f) {
      return function() {
        loseContextIfTime();
        if (contextLost_) {
          return wrappedContext_.FRAMEBUFFER_UNSUPPORTED;
        }
        return f.apply(ctx, arguments);
      };
    }(wrappedContext_.checkFramebufferStatus);

    wrappedContext_.getAttribLocation = function(f) {
      return function() {
        loseContextIfTime();
        if (contextLost_) {
          return -1;
        }
        return f.apply(ctx, arguments);
      };
    }(wrappedContext_.getAttribLocation);

    wrappedContext_.getVertexAttribOffset = function(f) {
      return function() {
        loseContextIfTime();
        if (contextLost_) {
          return 0;
        }
        return f.apply(ctx, arguments);
      };
    }(wrappedContext_.getVertexAttribOffset);

    wrappedContext_.isContextLost = function() {
      return contextLost_;
    };

    if (isWebGL2RenderingContext) {
      wrappedContext_.getFragDataLocation = function(f) {
        return function() {
          loseContextIfTime();
          if (contextLost_) {
            return -1;
          }
          return f.apply(ctx, arguments);
        };
      }(wrappedContext_.getFragDataLocation);

      wrappedContext_.clientWaitSync = function(f) {
        return function() {
          loseContextIfTime();
          if (contextLost_) {
            return wrappedContext_.WAIT_FAILED;
          }
          return f.apply(ctx, arguments);
        };
      }(wrappedContext_.clientWaitSync);

      wrappedContext_.getUniformBlockIndex = function(f) {
        return function() {
          loseContextIfTime();
          if (contextLost_) {
            return wrappedContext_.INVALID_INDEX;
          }
          return f.apply(ctx, arguments);
        };
      }(wrappedContext_.getUniformBlockIndex);
    }

    return wrappedContext_;
  }
}

return {
  /**
   * Initializes this module. Safe to call more than once.
   * @param {!WebGLRenderingContext} ctx A WebGL context. If
   *    you have more than one context it doesn't matter which one
   *    you pass in, it is only used to pull out constants.
   */
  'init': init,

  /**
   * Returns true or false if value matches any WebGL enum
   * @param {*} value Value to check if it might be an enum.
   * @return {boolean} True if value matches one of the WebGL defined enums
   */
  'mightBeEnum': mightBeEnum,

  /**
   * Gets an string version of an WebGL enum.
   *
   * Example:
   *   WebGLDebugUtil.init(ctx);
   *   var str = WebGLDebugUtil.glEnumToString(ctx.getError());
   *
   * @param {number} value Value to return an enum for
   * @return {string} The string version of the enum.
   */
  'glEnumToString': glEnumToString,

  /**
   * Converts the argument of a WebGL function to a string.
   * Attempts to convert enum arguments to strings.
   *
   * Example:
   *   WebGLDebugUtil.init(ctx);
   *   var str = WebGLDebugUtil.glFunctionArgToString('bindTexture', 2, 0, gl.TEXTURE_2D);
   *
   * would return 'TEXTURE_2D'
   *
   * @param {string} functionName the name of the WebGL function.
   * @param {number} numArgs The number of arguments
   * @param {number} argumentIndx the index of the argument.
   * @param {*} value The value of the argument.
   * @return {string} The value as a string.
   */
  'glFunctionArgToString': glFunctionArgToString,

  /**
   * Converts the arguments of a WebGL function to a string.
   * Attempts to convert enum arguments to strings.
   *
   * @param {string} functionName the name of the WebGL function.
   * @param {number} args The arguments.
   * @return {string} The arguments as a string.
   */
  'glFunctionArgsToString': glFunctionArgsToString,

  /**
   * Given a WebGL context returns a wrapped context that calls
   * gl.getError after every command and calls a function if the
   * result is not NO_ERROR.
   *
   * You can supply your own function if you want. For example, if you'd like
   * an exception thrown on any GL error you could do this
   *
   *    function throwOnGLError(err, funcName, args) {
   *      throw WebGLDebugUtils.glEnumToString(err) +
   *            " was caused by call to " + funcName;
   *    };
   *
   *    ctx = WebGLDebugUtils.makeDebugContext(
   *        canvas.getContext("webgl"), throwOnGLError);
   *
   * @param {!WebGLRenderingContext} ctx The webgl context to wrap.
   * @param {!function(err, funcName, args): void} opt_onErrorFunc The function
   *     to call when gl.getError returns an error. If not specified the default
   *     function calls console.log with a message.
   * @param {!function(funcName, args): void} opt_onFunc The
   *     function to call when each webgl function is called. You
   *     can use this to log all calls for example.
   */
  'makeDebugContext': makeDebugContext,

  /**
   * Given a canvas element returns a wrapped canvas element that will
   * simulate lost context. The canvas returned adds the following functions.
   *
   * loseContext:
   *   simulates a lost context event.
   *
   * restoreContext:
   *   simulates the context being restored.
   *
   * lostContextInNCalls:
   *   loses the context after N gl calls.
   *
   * getNumCalls:
   *   tells you how many gl calls there have been so far.
   *
   * setRestoreTimeout:
   *   sets the number of milliseconds until the context is restored
   *   after it has been lost. Defaults to 0. Pass -1 to prevent
   *   automatic restoring.
   *
   * @param {!Canvas} canvas The canvas element to wrap.
   */
  'makeLostContextSimulatingCanvas': makeLostContextSimulatingCanvas,

  /**
   * Resets a context to the initial state.
   * @param {!WebGLRenderingContext} ctx The webgl context to
   *     reset.
   */
  'resetToInitialState': resetToInitialState
};

}();

module.exports = WebGLDebugUtils;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],2:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var particle_engine_1 = require("./particle_engine");
var state_1 = require("./state");
window.onload = function () {
    // Set up WebGL
    var canvas = document.getElementById("mainCanvas");
    var gl = canvas.getContext("webgl2");
    if (!gl) {
        console.log("Error: could not get webgl2");
        canvas.hidden = true;
        return;
    }
    document.getElementById("glerror").hidden = true;
    var count = 10000;
    var state = new state_1.UserInputState();
    var engine = new particle_engine_1.ParticleEngine(gl, count);
    // Callbacks
    canvas.oncontextmenu = function () { return false; };
    canvas.addEventListener("mousemove", function (e) {
        state.mouse[0] = (e.offsetX / canvas.clientWidth) * 2 - 1;
        state.mouse[1] = ((canvas.clientHeight - e.offsetY) / canvas.clientHeight) * 2 - 1;
    });
    canvas.addEventListener("mousedown", function (e) {
        if (e.button == 2) {
            state.vortex = true;
        }
        else {
            state.accel = true;
        }
    });
    canvas.addEventListener("mouseup", function () {
        state.accel = false;
        state.vortex = false;
    });
    var handleResize = function () {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    };
    window.addEventListener("resize", handleResize);
    var acval = document.getElementById("accelVal");
    var ac = document.getElementById("accel");
    ac.oninput = function (ev) {
        state.accelAmount = Number(this.value) * 0.05;
        acval.textContent = state.accelAmount.toPrecision(3);
    };
    var pointsVal = document.getElementById("pointsVal");
    var points = document.getElementById("points");
    var newCount = 0;
    points.oninput = function (ev) {
        newCount = Math.round(5000 * Math.exp(Number(this.value) / 14));
        pointsVal.textContent = "" + newCount;
    };
    points.onchange = function (ev) {
        // When user is done sliding, re-init particle buffers
        count = newCount;
        engine.resetParticles(count);
    };
    var pointsizeVal = document.getElementById("pointsizeVal");
    var pointsize = document.getElementById('pointsize');
    pointsize.oninput = function (ev) {
        state.particleSize = Number(this.value) / 10.0;
        pointsizeVal.textContent = "" + state.particleSize;
    };
    var frictionVal = document.getElementById("frictionVal");
    var friction = document.getElementById('friction');
    friction.oninput = function (ev) {
        state.friction = Number(this.value) * 0.01;
        frictionVal.textContent = state.friction.toPrecision(3);
    };
    var frameCounter = 0;
    var fpsVal = document.getElementById("fps");
    var prevFrame = Date.now();
    function drawScene() {
        engine.draw(state);
        if (frameCounter == 9) {
            var now = Date.now();
            var fps = 10000.0 / (now - prevFrame);
            prevFrame = now;
            fpsVal.textContent = "" + fps;
            frameCounter = 0;
        }
        else {
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

},{"./particle_engine":3,"./state":5}],3:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var WebGLDebugUtils = require("webgl-debug");
var shaders_1 = require("./shaders");
var ParticleEngine = /** @class */ (function () {
    function ParticleEngine(ctx, count) {
        this.uniformLocs = {
            accel: null,
            vortex: null,
            accelAmount: null,
            mouse: null,
            particleSize: null,
            dt: null,
            friction: null
        };
        this.buffers = {
            position: [null, null],
            velocity: [null, null]
        };
        this.attributeLocs = {
            position: null,
            velocity: null
        };
        this.index = 0;
        this.prevFrame = Date.now();
        //this.gl = WebGLDebugUtils.makeDebugContext(ctx, this.throwOnGLError);
        this.gl = ctx;
        var gl = this.gl;
        var vs = shaders_1.createShader(gl, gl.VERTEX_SHADER, shaders_1.VS_SOURCE);
        var fs = shaders_1.createShader(gl, gl.FRAGMENT_SHADER, shaders_1.FS_SOURCE);
        var program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.transformFeedbackVaryings(program, ['v_position', 'v_velocity'], gl.SEPARATE_ATTRIBS);
        gl.linkProgram(program);
        this.buffers.position[0] = gl.createBuffer();
        this.buffers.velocity[0] = gl.createBuffer();
        this.buffers.position[1] = gl.createBuffer();
        this.buffers.velocity[1] = gl.createBuffer();
        this.uniformLocs.accel = gl.getUniformLocation(program, "accel");
        this.uniformLocs.vortex = gl.getUniformLocation(program, "vortex");
        this.uniformLocs.accelAmount = gl.getUniformLocation(program, "accelAmount");
        this.uniformLocs.mouse = gl.getUniformLocation(program, "mouse");
        this.uniformLocs.particleSize = gl.getUniformLocation(program, "particleSize");
        this.uniformLocs.dt = gl.getUniformLocation(program, "dt");
        this.uniformLocs.friction = gl.getUniformLocation(program, "friction");
        this.attributeLocs.position = gl.getAttribLocation(program, "a_position");
        this.attributeLocs.velocity = gl.getAttribLocation(program, "a_velocity");
        var vao = gl.createVertexArray();
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
    ParticleEngine.prototype.throwOnGLError = function (err, funcName, args) {
        throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
    };
    ;
    ParticleEngine.prototype.draw = function (state) {
        var gl = this.gl;
        var now = Date.now();
        var dt = (now - this.prevFrame) / 1000.0;
        this.prevFrame = now;
        gl.uniform1i(this.uniformLocs.accel, state.accel ? 1 : 0);
        gl.uniform1i(this.uniformLocs.vortex, state.vortex ? 1 : 0);
        gl.uniform1f(this.uniformLocs.accelAmount, state.accelAmount);
        gl.uniform2f(this.uniformLocs.mouse, state.mouse[0], state.mouse[1]);
        gl.uniform1f(this.uniformLocs.particleSize, state.particleSize);
        gl.uniform1f(this.uniformLocs.dt, dt);
        gl.uniform1f(this.uniformLocs.friction, state.friction);
        // Set up buffer data
        var size = 2; // 2 components per iteration
        var type = gl.FLOAT; // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0; // start at the beginning of the buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position[this.index]);
        gl.vertexAttribPointer(this.attributeLocs.position, size, type, normalize, stride, offset);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.velocity[this.index]);
        gl.vertexAttribPointer(this.attributeLocs.velocity, size, type, normalize, stride, offset);
        gl.clearColor(0.01, 0.01, 0.01, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedback);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.buffers.position[1 - this.index]);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.buffers.velocity[1 - this.index]);
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, this.count);
        gl.endTransformFeedback();
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);
        // Swap buffers
        this.index = 1 - this.index;
    };
    ParticleEngine.prototype.resetParticles = function (count) {
        this.count = count;
        var positions = [];
        var vels = [];
        for (var i = 0; i < count; i++) {
            positions.push(2 * Math.random() - 1); // x
            positions.push(2 * Math.random() - 1); // y
            vels.push(0.0);
            vels.push(0.0);
        }
        var gl = this.gl;
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
    };
    return ParticleEngine;
}());
exports.ParticleEngine = ParticleEngine;

},{"./shaders":4,"webgl-debug":1}],4:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var VS_SOURCE = "#version 300 es\n\n    uniform vec2 mouse;\n    uniform bool accel;\n    uniform bool vortex;\n    uniform float accelAmount;\n    uniform float particleSize;\n    uniform float dt;\n    uniform float friction;\n\n    in vec2 a_position;\n    in vec2 a_velocity;\n    out vec2 v_position;\n    out vec2 v_velocity;\n\n    // from https://thebookofshaders.com/10/\n    float random (vec2 st) {\n        return fract(sin(dot(st.xy,\n                            vec2(12.9898,78.233)))*\n            43758.5453123);\n    }\n\n    void main() {\n        gl_PointSize = particleSize;\n        gl_Position = vec4(a_position, 0, 1);\n        // Pass through to fragment shader\n        v_velocity = a_velocity;\n        //v_velocity.y -= 0.0001;\n\n        if (accel) {\n            vec2 del = normalize(mouse - a_position);\n            v_velocity += del * accelAmount * dt;\n        } else if (vortex) {\n            vec2 del = normalize(mouse - a_position);\n            v_velocity += (vec2(del.y, -del.x)/5.0 + del) * accelAmount * dt;\n        }\n\n        // Friction\n        v_velocity *= (1.0 - friction * dt * (1.0 + random(v_position)));\n\n        // Update pos/vel for transform feedback\n        v_position = a_position;\n        v_position += v_velocity * dt;\n        if(v_position.x > 1.0) {\n            v_position.x = 2.0 - v_position.x;\n            v_velocity.x = -v_velocity.x;\n        }\n        if(v_position.y > 1.0) {\n            v_position.y = 2.0 - v_position.y;\n            v_velocity.y = -v_velocity.y;\n        }\n        if(v_position.x < -1.0) {\n            v_position.x = -2.0 - v_position.x;\n            v_velocity.x = -v_velocity.x;\n        }\n        if(v_position.y < -1.0) {\n            v_position.y = -2.0 - v_position.y;\n            v_velocity.y = -v_velocity.y;\n        }\n    }\n";
exports.VS_SOURCE = VS_SOURCE;
var FS_SOURCE = "#version 300 es\n\n    // fragment shaders don't have a default precision so we need\n    // to pick one. mediump is a good default. It means \"medium precision\"\n    precision mediump float;\n\n    in vec2 v_velocity;\n    // we need to declare an output for the fragment shader\n    out vec4 outColor;\n\n    vec3 hsv2rgb(vec3 c) {\n        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n    }\n\n    void main() {\n        // Technically HSV is supposed to be between 0 and 1 but I found that\n        // letting the value go higher causes it to wrap-around and look cool\n        float vel = clamp(length(v_velocity) * 0.8, 0.0, 2.0);\n        outColor = vec4(\n            hsv2rgb(vec3(\n                0.6 - vel * 0.6,  // hue\n                1.0,               // sat\n                max(0.2 + vel, 0.8) // vibrance\n            )),\n        1.0);\n    }\n";
exports.FS_SOURCE = FS_SOURCE;
// Adapted from https://webgl2fundamentals.org/webgl/lessons/webgl-fundamentals.html
function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    else {
        var e = "Shader build error: " + gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(e);
    }
}
exports.createShader = createShader;

},{}],5:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var UserInputState = /** @class */ (function () {
    function UserInputState() {
        this.mouse = [0, 0];
        this.accel = false;
        this.vortex = false;
        this.particleSize = 1.0;
        this.accelAmount = 0.75;
        this.friction = 0.3;
    }
    return UserInputState;
}());
exports.UserInputState = UserInputState;

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvd2ViZ2wtZGVidWcvaW5kZXguanMiLCJzcmMvaW5kZXgudHMiLCJzcmMvcGFydGljbGVfZW5naW5lLnRzIiwic3JjL3NoYWRlcnMudHMiLCJzcmMvc3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ2hyQ0EscURBQWtEO0FBQ2xELGlDQUF5QztBQUV6QyxNQUFNLENBQUMsTUFBTSxHQUFHO0lBQ1osZUFBZTtJQUNmLElBQUksTUFBTSxHQUFzQixRQUFR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QixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztRQUN6QyxJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQztRQUNyQixFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUQsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVELEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzlELEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDaEUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN0QyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV4RCxxQkFBcUI7UUFDckIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQVUsNkJBQTZCO1FBQ3BELElB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LEtBQUssQ0FBQztRQUNmLGlCQUFZLEdBQUcsR0FBRyxDQUFDO1FBQ25CLGdCQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ25CLGFBQVEsR0FBRyxHQUFHLENBQUM7SUFDbkIsQ0FBQztJQUFELHFCQUFDO0FBQUQsQ0FQQSxBQU9DLElBQUE7QUFQWSx3Q0FBYyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qXG4qKiBDb3B5cmlnaHQgKGMpIDIwMTIgVGhlIEtocm9ub3MgR3JvdXAgSW5jLlxuKipcbioqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4qKiBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kL29yIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4qKiBcIk1hdGVyaWFsc1wiKSwgdG8gZGVhbCBpbiB0aGUgTWF0ZXJpYWxzIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuKiogd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuKiogZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBNYXRlcmlhbHMsIGFuZCB0b1xuKiogcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgTWF0ZXJpYWxzIGFyZSBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cbioqIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbioqXG4qKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuKiogaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgTWF0ZXJpYWxzLlxuKipcbioqIFRIRSBNQVRFUklBTFMgQVJFIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbioqIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuKiogTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULlxuKiogSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTllcbioqIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsXG4qKiBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRVxuKiogTUFURVJJQUxTIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIE1BVEVSSUFMUy5cbiovXG5cbi8vUG9ydGVkIHRvIG5vZGUgYnkgTWFyY2luIElnbmFjIG9uIDIwMTYtMDUtMjBcblxuLy8gVmFyaW91cyBmdW5jdGlvbnMgZm9yIGhlbHBpbmcgZGVidWcgV2ViR0wgYXBwcy5cblxuV2ViR0xEZWJ1Z1V0aWxzID0gZnVuY3Rpb24oKSB7XG52YXIgd2luZG93XG5cbi8vcG9seWZpbGwgd2luZG93IGluIG5vZGVcbmlmICh0eXBlb2Yod2luZG93KSA9PSAndW5kZWZpbmVkJykge1xuICAgIHdpbmRvdyA9IGdsb2JhbDtcbn1cblxuLyoqXG4gKiBXcmFwcGVkIGxvZ2dpbmcgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gbXNnIE1lc3NhZ2UgdG8gbG9nLlxuICovXG52YXIgbG9nID0gZnVuY3Rpb24obXNnKSB7XG4gIGlmICh3aW5kb3cuY29uc29sZSAmJiB3aW5kb3cuY29uc29sZS5sb2cpIHtcbiAgICB3aW5kb3cuY29uc29sZS5sb2cobXNnKTtcbiAgfVxufTtcblxuLyoqXG4gKiBXcmFwcGVkIGVycm9yIGxvZ2dpbmcgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gbXNnIE1lc3NhZ2UgdG8gbG9nLlxuICovXG52YXIgZXJyb3IgPSBmdW5jdGlvbihtc2cpIHtcbiAgaWYgKHdpbmRvdy5jb25zb2xlICYmIHdpbmRvdy5jb25zb2xlLmVycm9yKSB7XG4gICAgd2luZG93LmNvbnNvbGUuZXJyb3IobXNnKTtcbiAgfSBlbHNlIHtcbiAgICBsb2cobXNnKTtcbiAgfVxufTtcblxuXG4vKipcbiAqIFdoaWNoIGFyZ3VtZW50cyBhcmUgZW51bXMgYmFzZWQgb24gdGhlIG51bWJlciBvZiBhcmd1bWVudHMgdG8gdGhlIGZ1bmN0aW9uLlxuICogU29cbiAqICAgICd0ZXhJbWFnZTJEJzoge1xuICogICAgICAgOTogeyAwOnRydWUsIDI6dHJ1ZSwgNjp0cnVlLCA3OnRydWUgfSxcbiAqICAgICAgIDY6IHsgMDp0cnVlLCAyOnRydWUsIDM6dHJ1ZSwgNDp0cnVlIH0sXG4gKiAgICB9LFxuICpcbiAqIG1lYW5zIGlmIHRoZXJlIGFyZSA5IGFyZ3VtZW50cyB0aGVuIDYgYW5kIDcgYXJlIGVudW1zLCBpZiB0aGVyZSBhcmUgNlxuICogYXJndW1lbnRzIDMgYW5kIDQgYXJlIGVudW1zXG4gKlxuICogQHR5cGUgeyFPYmplY3QuPG51bWJlciwgIU9iamVjdC48bnVtYmVyLCBzdHJpbmc+fVxuICovXG52YXIgZ2xWYWxpZEVudW1Db250ZXh0cyA9IHtcbiAgLy8gR2VuZXJpYyBzZXR0ZXJzIGFuZCBnZXR0ZXJzXG5cbiAgJ2VuYWJsZSc6IHsxOiB7IDA6dHJ1ZSB9fSxcbiAgJ2Rpc2FibGUnOiB7MTogeyAwOnRydWUgfX0sXG4gICdnZXRQYXJhbWV0ZXInOiB7MTogeyAwOnRydWUgfX0sXG5cbiAgLy8gUmVuZGVyaW5nXG5cbiAgJ2RyYXdBcnJheXMnOiB7Mzp7IDA6dHJ1ZSB9fSxcbiAgJ2RyYXdFbGVtZW50cyc6IHs0OnsgMDp0cnVlLCAyOnRydWUgfX0sXG5cbiAgLy8gU2hhZGVyc1xuXG4gICdjcmVhdGVTaGFkZXInOiB7MTogeyAwOnRydWUgfX0sXG4gICdnZXRTaGFkZXJQYXJhbWV0ZXInOiB7MjogeyAxOnRydWUgfX0sXG4gICdnZXRQcm9ncmFtUGFyYW1ldGVyJzogezI6IHsgMTp0cnVlIH19LFxuICAnZ2V0U2hhZGVyUHJlY2lzaW9uRm9ybWF0JzogezI6IHsgMDogdHJ1ZSwgMTp0cnVlIH19LFxuXG4gIC8vIFZlcnRleCBhdHRyaWJ1dGVzXG5cbiAgJ2dldFZlcnRleEF0dHJpYic6IHsyOiB7IDE6dHJ1ZSB9fSxcbiAgJ3ZlcnRleEF0dHJpYlBvaW50ZXInOiB7NjogeyAyOnRydWUgfX0sXG5cbiAgLy8gVGV4dHVyZXNcblxuICAnYmluZFRleHR1cmUnOiB7MjogeyAwOnRydWUgfX0sXG4gICdhY3RpdmVUZXh0dXJlJzogezE6IHsgMDp0cnVlIH19LFxuICAnZ2V0VGV4UGFyYW1ldGVyJzogezI6IHsgMDp0cnVlLCAxOnRydWUgfX0sXG4gICd0ZXhQYXJhbWV0ZXJmJzogezM6IHsgMDp0cnVlLCAxOnRydWUgfX0sXG4gICd0ZXhQYXJhbWV0ZXJpJzogezM6IHsgMDp0cnVlLCAxOnRydWUsIDI6dHJ1ZSB9fSxcbiAgLy8gdGV4SW1hZ2UyRCBhbmQgdGV4U3ViSW1hZ2UyRCBhcmUgZGVmaW5lZCBiZWxvdyB3aXRoIFdlYkdMIDIgZW50cnlwb2ludHNcbiAgJ2NvcHlUZXhJbWFnZTJEJzogezg6IHsgMDp0cnVlLCAyOnRydWUgfX0sXG4gICdjb3B5VGV4U3ViSW1hZ2UyRCc6IHs4OiB7IDA6dHJ1ZSB9fSxcbiAgJ2dlbmVyYXRlTWlwbWFwJzogezE6IHsgMDp0cnVlIH19LFxuICAvLyBjb21wcmVzc2VkVGV4SW1hZ2UyRCBhbmQgY29tcHJlc3NlZFRleFN1YkltYWdlMkQgYXJlIGRlZmluZWQgYmVsb3cgd2l0aCBXZWJHTCAyIGVudHJ5cG9pbnRzXG5cbiAgLy8gQnVmZmVyIG9iamVjdHNcblxuICAnYmluZEJ1ZmZlcic6IHsyOiB7IDA6dHJ1ZSB9fSxcbiAgLy8gYnVmZmVyRGF0YSBhbmQgYnVmZmVyU3ViRGF0YSBhcmUgZGVmaW5lZCBiZWxvdyB3aXRoIFdlYkdMIDIgZW50cnlwb2ludHNcbiAgJ2dldEJ1ZmZlclBhcmFtZXRlcic6IHsyOiB7IDA6dHJ1ZSwgMTp0cnVlIH19LFxuXG4gIC8vIFJlbmRlcmJ1ZmZlcnMgYW5kIGZyYW1lYnVmZmVyc1xuXG4gICdwaXhlbFN0b3JlaSc6IHsyOiB7IDA6dHJ1ZSwgMTp0cnVlIH19LFxuICAvLyByZWFkUGl4ZWxzIGlzIGRlZmluZWQgYmVsb3cgd2l0aCBXZWJHTCAyIGVudHJ5cG9pbnRzXG4gICdiaW5kUmVuZGVyYnVmZmVyJzogezI6IHsgMDp0cnVlIH19LFxuICAnYmluZEZyYW1lYnVmZmVyJzogezI6IHsgMDp0cnVlIH19LFxuICAnY2hlY2tGcmFtZWJ1ZmZlclN0YXR1cyc6IHsxOiB7IDA6dHJ1ZSB9fSxcbiAgJ2ZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyJzogezQ6IHsgMDp0cnVlLCAxOnRydWUsIDI6dHJ1ZSB9fSxcbiAgJ2ZyYW1lYnVmZmVyVGV4dHVyZTJEJzogezU6IHsgMDp0cnVlLCAxOnRydWUsIDI6dHJ1ZSB9fSxcbiAgJ2dldEZyYW1lYnVmZmVyQXR0YWNobWVudFBhcmFtZXRlcic6IHszOiB7IDA6dHJ1ZSwgMTp0cnVlLCAyOnRydWUgfX0sXG4gICdnZXRSZW5kZXJidWZmZXJQYXJhbWV0ZXInOiB7MjogeyAwOnRydWUsIDE6dHJ1ZSB9fSxcbiAgJ3JlbmRlcmJ1ZmZlclN0b3JhZ2UnOiB7NDogeyAwOnRydWUsIDE6dHJ1ZSB9fSxcblxuICAvLyBGcmFtZSBidWZmZXIgb3BlcmF0aW9ucyAoY2xlYXIsIGJsZW5kLCBkZXB0aCB0ZXN0LCBzdGVuY2lsKVxuXG4gICdjbGVhcic6IHsxOiB7IDA6IHsgJ2VudW1CaXR3aXNlT3InOiBbJ0NPTE9SX0JVRkZFUl9CSVQnLCAnREVQVEhfQlVGRkVSX0JJVCcsICdTVEVOQ0lMX0JVRkZFUl9CSVQnXSB9fX0sXG4gICdkZXB0aEZ1bmMnOiB7MTogeyAwOnRydWUgfX0sXG4gICdibGVuZEZ1bmMnOiB7MjogeyAwOnRydWUsIDE6dHJ1ZSB9fSxcbiAgJ2JsZW5kRnVuY1NlcGFyYXRlJzogezQ6IHsgMDp0cnVlLCAxOnRydWUsIDI6dHJ1ZSwgMzp0cnVlIH19LFxuICAnYmxlbmRFcXVhdGlvbic6IHsxOiB7IDA6dHJ1ZSB9fSxcbiAgJ2JsZW5kRXF1YXRpb25TZXBhcmF0ZSc6IHsyOiB7IDA6dHJ1ZSwgMTp0cnVlIH19LFxuICAnc3RlbmNpbEZ1bmMnOiB7MzogeyAwOnRydWUgfX0sXG4gICdzdGVuY2lsRnVuY1NlcGFyYXRlJzogezQ6IHsgMDp0cnVlLCAxOnRydWUgfX0sXG4gICdzdGVuY2lsTWFza1NlcGFyYXRlJzogezI6IHsgMDp0cnVlIH19LFxuICAnc3RlbmNpbE9wJzogezM6IHsgMDp0cnVlLCAxOnRydWUsIDI6dHJ1ZSB9fSxcbiAgJ3N0ZW5jaWxPcFNlcGFyYXRlJzogezQ6IHsgMDp0cnVlLCAxOnRydWUsIDI6dHJ1ZSwgMzp0cnVlIH19LFxuXG4gIC8vIEN1bGxpbmdcblxuICAnY3VsbEZhY2UnOiB7MTogeyAwOnRydWUgfX0sXG4gICdmcm9udEZhY2UnOiB7MTogeyAwOnRydWUgfX0sXG5cbiAgLy8gQU5HTEVfaW5zdGFuY2VkX2FycmF5cyBleHRlbnNpb25cblxuICAnZHJhd0FycmF5c0luc3RhbmNlZEFOR0xFJzogezQ6IHsgMDp0cnVlIH19LFxuICAnZHJhd0VsZW1lbnRzSW5zdGFuY2VkQU5HTEUnOiB7NTogeyAwOnRydWUsIDI6dHJ1ZSB9fSxcblxuICAvLyBFWFRfYmxlbmRfbWlubWF4IGV4dGVuc2lvblxuXG4gICdibGVuZEVxdWF0aW9uRVhUJzogezE6IHsgMDp0cnVlIH19LFxuXG4gIC8vIFdlYkdMIDIgQnVmZmVyIG9iamVjdHNcblxuICAnYnVmZmVyRGF0YSc6IHtcbiAgICAzOiB7IDA6dHJ1ZSwgMjp0cnVlIH0sIC8vIFdlYkdMIDFcbiAgICA0OiB7IDA6dHJ1ZSwgMjp0cnVlIH0sIC8vIFdlYkdMIDJcbiAgICA1OiB7IDA6dHJ1ZSwgMjp0cnVlIH0gIC8vIFdlYkdMIDJcbiAgfSxcbiAgJ2J1ZmZlclN1YkRhdGEnOiB7XG4gICAgMzogeyAwOnRydWUgfSwgLy8gV2ViR0wgMVxuICAgIDQ6IHsgMDp0cnVlIH0sIC8vIFdlYkdMIDJcbiAgICA1OiB7IDA6dHJ1ZSB9ICAvLyBXZWJHTCAyXG4gIH0sXG4gICdjb3B5QnVmZmVyU3ViRGF0YSc6IHs1OiB7IDA6dHJ1ZSwgMTp0cnVlIH19LFxuICAnZ2V0QnVmZmVyU3ViRGF0YSc6IHszOiB7IDA6dHJ1ZSB9LCA0OiB7IDA6dHJ1ZSB9LCA1OiB7IDA6dHJ1ZSB9fSxcblxuICAvLyBXZWJHTCAyIEZyYW1lYnVmZmVyIG9iamVjdHNcblxuICAnYmxpdEZyYW1lYnVmZmVyJzogezEwOiB7IDg6IHsgJ2VudW1CaXR3aXNlT3InOiBbJ0NPTE9SX0JVRkZFUl9CSVQnLCAnREVQVEhfQlVGRkVSX0JJVCcsICdTVEVOQ0lMX0JVRkZFUl9CSVQnXSB9LCA5OnRydWUgfX0sXG4gICdmcmFtZWJ1ZmZlclRleHR1cmVMYXllcic6IHs1OiB7IDA6dHJ1ZSwgMTp0cnVlIH19LFxuICAnaW52YWxpZGF0ZUZyYW1lYnVmZmVyJzogezI6IHsgMDp0cnVlIH19LFxuICAnaW52YWxpZGF0ZVN1YkZyYW1lYnVmZmVyJzogezY6IHsgMDp0cnVlIH19LFxuICAncmVhZEJ1ZmZlcic6IHsxOiB7IDA6dHJ1ZSB9fSxcblxuICAvLyBXZWJHTCAyIFJlbmRlcmJ1ZmZlciBvYmplY3RzXG5cbiAgJ2dldEludGVybmFsZm9ybWF0UGFyYW1ldGVyJzogezM6IHsgMDp0cnVlLCAxOnRydWUsIDI6dHJ1ZSB9fSxcbiAgJ3JlbmRlcmJ1ZmZlclN0b3JhZ2VNdWx0aXNhbXBsZSc6IHs1OiB7IDA6dHJ1ZSwgMjp0cnVlIH19LFxuXG4gIC8vIFdlYkdMIDIgVGV4dHVyZSBvYmplY3RzXG5cbiAgJ3RleFN0b3JhZ2UyRCc6IHs1OiB7IDA6dHJ1ZSwgMjp0cnVlIH19LFxuICAndGV4U3RvcmFnZTNEJzogezY6IHsgMDp0cnVlLCAyOnRydWUgfX0sXG4gICd0ZXhJbWFnZTJEJzoge1xuICAgIDk6IHsgMDp0cnVlLCAyOnRydWUsIDY6dHJ1ZSwgNzp0cnVlIH0sIC8vIFdlYkdMIDEgJiAyXG4gICAgNjogeyAwOnRydWUsIDI6dHJ1ZSwgMzp0cnVlLCA0OnRydWUgfSwgLy8gV2ViR0wgMVxuICAgIDEwOiB7IDA6dHJ1ZSwgMjp0cnVlLCA2OnRydWUsIDc6dHJ1ZSB9IC8vIFdlYkdMIDJcbiAgfSxcbiAgJ3RleEltYWdlM0QnOiB7XG4gICAgMTA6IHsgMDp0cnVlLCAyOnRydWUsIDc6dHJ1ZSwgODp0cnVlIH0sXG4gICAgMTE6IHsgMDp0cnVlLCAyOnRydWUsIDc6dHJ1ZSwgODp0cnVlIH1cbiAgfSxcbiAgJ3RleFN1YkltYWdlMkQnOiB7XG4gICAgOTogeyAwOnRydWUsIDY6dHJ1ZSwgNzp0cnVlIH0sIC8vIFdlYkdMIDEgJiAyXG4gICAgNzogeyAwOnRydWUsIDQ6dHJ1ZSwgNTp0cnVlIH0sIC8vIFdlYkdMIDFcbiAgICAxMDogeyAwOnRydWUsIDY6dHJ1ZSwgNzp0cnVlIH0gLy8gV2ViR0wgMlxuICB9LFxuICAndGV4U3ViSW1hZ2UzRCc6IHtcbiAgICAxMTogeyAwOnRydWUsIDg6dHJ1ZSwgOTp0cnVlIH0sXG4gICAgMTI6IHsgMDp0cnVlLCA4OnRydWUsIDk6dHJ1ZSB9XG4gIH0sXG4gICdjb3B5VGV4U3ViSW1hZ2UzRCc6IHs5OiB7IDA6dHJ1ZSB9fSxcbiAgJ2NvbXByZXNzZWRUZXhJbWFnZTJEJzoge1xuICAgIDc6IHsgMDogdHJ1ZSwgMjp0cnVlIH0sIC8vIFdlYkdMIDEgJiAyXG4gICAgODogeyAwOiB0cnVlLCAyOnRydWUgfSwgLy8gV2ViR0wgMlxuICAgIDk6IHsgMDogdHJ1ZSwgMjp0cnVlIH0gIC8vIFdlYkdMIDJcbiAgfSxcbiAgJ2NvbXByZXNzZWRUZXhJbWFnZTNEJzoge1xuICAgIDg6IHsgMDogdHJ1ZSwgMjp0cnVlIH0sXG4gICAgOTogeyAwOiB0cnVlLCAyOnRydWUgfSxcbiAgICAxMDogeyAwOiB0cnVlLCAyOnRydWUgfVxuICB9LFxuICAnY29tcHJlc3NlZFRleFN1YkltYWdlMkQnOiB7XG4gICAgODogeyAwOiB0cnVlLCA2OnRydWUgfSwgLy8gV2ViR0wgMSAmIDJcbiAgICA5OiB7IDA6IHRydWUsIDY6dHJ1ZSB9LCAvLyBXZWJHTCAyXG4gICAgMTA6IHsgMDogdHJ1ZSwgNjp0cnVlIH0gLy8gV2ViR0wgMlxuICB9LFxuICAnY29tcHJlc3NlZFRleFN1YkltYWdlM0QnOiB7XG4gICAgMTA6IHsgMDogdHJ1ZSwgODp0cnVlIH0sXG4gICAgMTE6IHsgMDogdHJ1ZSwgODp0cnVlIH0sXG4gICAgMTI6IHsgMDogdHJ1ZSwgODp0cnVlIH1cbiAgfSxcblxuICAvLyBXZWJHTCAyIFZlcnRleCBhdHRyaWJzXG5cbiAgJ3ZlcnRleEF0dHJpYklQb2ludGVyJzogezU6IHsgMjp0cnVlIH19LFxuXG4gIC8vIFdlYkdMIDIgV3JpdGluZyB0byB0aGUgZHJhd2luZyBidWZmZXJcblxuICAnZHJhd0FycmF5c0luc3RhbmNlZCc6IHs0OiB7IDA6dHJ1ZSB9fSxcbiAgJ2RyYXdFbGVtZW50c0luc3RhbmNlZCc6IHs1OiB7IDA6dHJ1ZSwgMjp0cnVlIH19LFxuICAnZHJhd1JhbmdlRWxlbWVudHMnOiB7NjogeyAwOnRydWUsIDQ6dHJ1ZSB9fSxcblxuICAvLyBXZWJHTCAyIFJlYWRpbmcgYmFjayBwaXhlbHNcblxuICAncmVhZFBpeGVscyc6IHtcbiAgICA3OiB7IDQ6dHJ1ZSwgNTp0cnVlIH0sIC8vIFdlYkdMIDEgJiAyXG4gICAgODogeyA0OnRydWUsIDU6dHJ1ZSB9ICAvLyBXZWJHTCAyXG4gIH0sXG5cbiAgLy8gV2ViR0wgMiBNdWx0aXBsZSBSZW5kZXIgVGFyZ2V0c1xuXG4gICdjbGVhckJ1ZmZlcmZ2JzogezM6IHsgMDp0cnVlIH0sIDQ6IHsgMDp0cnVlIH19LFxuICAnY2xlYXJCdWZmZXJpdic6IHszOiB7IDA6dHJ1ZSB9LCA0OiB7IDA6dHJ1ZSB9fSxcbiAgJ2NsZWFyQnVmZmVydWl2JzogezM6IHsgMDp0cnVlIH0sIDQ6IHsgMDp0cnVlIH19LFxuICAnY2xlYXJCdWZmZXJmaSc6IHs0OiB7IDA6dHJ1ZSB9fSxcblxuICAvLyBXZWJHTCAyIFF1ZXJ5IG9iamVjdHNcblxuICAnYmVnaW5RdWVyeSc6IHsyOiB7IDA6dHJ1ZSB9fSxcbiAgJ2VuZFF1ZXJ5JzogezE6IHsgMDp0cnVlIH19LFxuICAnZ2V0UXVlcnknOiB7MjogeyAwOnRydWUsIDE6dHJ1ZSB9fSxcbiAgJ2dldFF1ZXJ5UGFyYW1ldGVyJzogezI6IHsgMTp0cnVlIH19LFxuXG4gIC8vIFdlYkdMIDIgU2FtcGxlciBvYmplY3RzXG5cbiAgJ3NhbXBsZXJQYXJhbWV0ZXJpJzogezM6IHsgMTp0cnVlLCAyOnRydWUgfX0sXG4gICdzYW1wbGVyUGFyYW1ldGVyZic6IHszOiB7IDE6dHJ1ZSB9fSxcbiAgJ2dldFNhbXBsZXJQYXJhbWV0ZXInOiB7MjogeyAxOnRydWUgfX0sXG5cbiAgLy8gV2ViR0wgMiBTeW5jIG9iamVjdHNcblxuICAnZmVuY2VTeW5jJzogezI6IHsgMDp0cnVlLCAxOiB7ICdlbnVtQml0d2lzZU9yJzogW10gfSB9fSxcbiAgJ2NsaWVudFdhaXRTeW5jJzogezM6IHsgMTogeyAnZW51bUJpdHdpc2VPcic6IFsnU1lOQ19GTFVTSF9DT01NQU5EU19CSVQnXSB9IH19LFxuICAnd2FpdFN5bmMnOiB7MzogeyAxOiB7ICdlbnVtQml0d2lzZU9yJzogW10gfSB9fSxcbiAgJ2dldFN5bmNQYXJhbWV0ZXInOiB7MjogeyAxOnRydWUgfX0sXG5cbiAgLy8gV2ViR0wgMiBUcmFuc2Zvcm0gRmVlZGJhY2tcblxuICAnYmluZFRyYW5zZm9ybUZlZWRiYWNrJzogezI6IHsgMDp0cnVlIH19LFxuICAnYmVnaW5UcmFuc2Zvcm1GZWVkYmFjayc6IHsxOiB7IDA6dHJ1ZSB9fSxcbiAgJ3RyYW5zZm9ybUZlZWRiYWNrVmFyeWluZ3MnOiB7MzogeyAyOnRydWUgfX0sXG5cbiAgLy8gV2ViR0wyIFVuaWZvcm0gQnVmZmVyIE9iamVjdHMgYW5kIFRyYW5zZm9ybSBGZWVkYmFjayBCdWZmZXJzXG5cbiAgJ2JpbmRCdWZmZXJCYXNlJzogezM6IHsgMDp0cnVlIH19LFxuICAnYmluZEJ1ZmZlclJhbmdlJzogezU6IHsgMDp0cnVlIH19LFxuICAnZ2V0SW5kZXhlZFBhcmFtZXRlcic6IHsyOiB7IDA6dHJ1ZSB9fSxcbiAgJ2dldEFjdGl2ZVVuaWZvcm1zJzogezM6IHsgMjp0cnVlIH19LFxuICAnZ2V0QWN0aXZlVW5pZm9ybUJsb2NrUGFyYW1ldGVyJzogezM6IHsgMjp0cnVlIH19XG59O1xuXG4vKipcbiAqIE1hcCBvZiBudW1iZXJzIHRvIG5hbWVzLlxuICogQHR5cGUge09iamVjdH1cbiAqL1xudmFyIGdsRW51bXMgPSBudWxsO1xuXG4vKipcbiAqIE1hcCBvZiBuYW1lcyB0byBudW1iZXJzLlxuICogQHR5cGUge09iamVjdH1cbiAqL1xudmFyIGVudW1TdHJpbmdUb1ZhbHVlID0gbnVsbDtcblxuLyoqXG4gKiBJbml0aWFsaXplcyB0aGlzIG1vZHVsZS4gU2FmZSB0byBjYWxsIG1vcmUgdGhhbiBvbmNlLlxuICogQHBhcmFtIHshV2ViR0xSZW5kZXJpbmdDb250ZXh0fSBjdHggQSBXZWJHTCBjb250ZXh0LiBJZlxuICogICAgeW91IGhhdmUgbW9yZSB0aGFuIG9uZSBjb250ZXh0IGl0IGRvZXNuJ3QgbWF0dGVyIHdoaWNoIG9uZVxuICogICAgeW91IHBhc3MgaW4sIGl0IGlzIG9ubHkgdXNlZCB0byBwdWxsIG91dCBjb25zdGFudHMuXG4gKi9cbmZ1bmN0aW9uIGluaXQoY3R4KSB7XG4gIGlmIChnbEVudW1zID09IG51bGwpIHtcbiAgICBnbEVudW1zID0geyB9O1xuICAgIGVudW1TdHJpbmdUb1ZhbHVlID0geyB9O1xuICAgIGZvciAodmFyIHByb3BlcnR5TmFtZSBpbiBjdHgpIHtcbiAgICAgIGlmICh0eXBlb2YgY3R4W3Byb3BlcnR5TmFtZV0gPT0gJ251bWJlcicpIHtcbiAgICAgICAgZ2xFbnVtc1tjdHhbcHJvcGVydHlOYW1lXV0gPSBwcm9wZXJ0eU5hbWU7XG4gICAgICAgIGVudW1TdHJpbmdUb1ZhbHVlW3Byb3BlcnR5TmFtZV0gPSBjdHhbcHJvcGVydHlOYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDaGVja3MgdGhlIHV0aWxzIGhhdmUgYmVlbiBpbml0aWFsaXplZC5cbiAqL1xuZnVuY3Rpb24gY2hlY2tJbml0KCkge1xuICBpZiAoZ2xFbnVtcyA9PSBudWxsKSB7XG4gICAgdGhyb3cgJ1dlYkdMRGVidWdVdGlscy5pbml0KGN0eCkgbm90IGNhbGxlZCc7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgb3IgZmFsc2UgaWYgdmFsdWUgbWF0Y2hlcyBhbnkgV2ViR0wgZW51bVxuICogQHBhcmFtIHsqfSB2YWx1ZSBWYWx1ZSB0byBjaGVjayBpZiBpdCBtaWdodCBiZSBhbiBlbnVtLlxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBtYXRjaGVzIG9uZSBvZiB0aGUgV2ViR0wgZGVmaW5lZCBlbnVtc1xuICovXG5mdW5jdGlvbiBtaWdodEJlRW51bSh2YWx1ZSkge1xuICBjaGVja0luaXQoKTtcbiAgcmV0dXJuIChnbEVudW1zW3ZhbHVlXSAhPT0gdW5kZWZpbmVkKTtcbn1cblxuLyoqXG4gKiBHZXRzIGFuIHN0cmluZyB2ZXJzaW9uIG9mIGFuIFdlYkdMIGVudW0uXG4gKlxuICogRXhhbXBsZTpcbiAqICAgdmFyIHN0ciA9IFdlYkdMRGVidWdVdGlsLmdsRW51bVRvU3RyaW5nKGN0eC5nZXRFcnJvcigpKTtcbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgVmFsdWUgdG8gcmV0dXJuIGFuIGVudW0gZm9yXG4gKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBzdHJpbmcgdmVyc2lvbiBvZiB0aGUgZW51bS5cbiAqL1xuZnVuY3Rpb24gZ2xFbnVtVG9TdHJpbmcodmFsdWUpIHtcbiAgY2hlY2tJbml0KCk7XG4gIHZhciBuYW1lID0gZ2xFbnVtc1t2YWx1ZV07XG4gIHJldHVybiAobmFtZSAhPT0gdW5kZWZpbmVkKSA/IChcImdsLlwiICsgbmFtZSkgOlxuICAgICAgKFwiLypVTktOT1dOIFdlYkdMIEVOVU0qLyAweFwiICsgdmFsdWUudG9TdHJpbmcoMTYpICsgXCJcIik7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc3RyaW5nIHZlcnNpb24gb2YgYSBXZWJHTCBhcmd1bWVudC5cbiAqIEF0dGVtcHRzIHRvIGNvbnZlcnQgZW51bSBhcmd1bWVudHMgdG8gc3RyaW5ncy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBmdW5jdGlvbk5hbWUgdGhlIG5hbWUgb2YgdGhlIFdlYkdMIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IG51bUFyZ3MgdGhlIG51bWJlciBvZiBhcmd1bWVudHMgcGFzc2VkIHRvIHRoZSBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhcmd1bWVudEluZHggdGhlIGluZGV4IG9mIHRoZSBhcmd1bWVudC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSBhcmd1bWVudC5cbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHZhbHVlIGFzIGEgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBnbEZ1bmN0aW9uQXJnVG9TdHJpbmcoZnVuY3Rpb25OYW1lLCBudW1BcmdzLCBhcmd1bWVudEluZGV4LCB2YWx1ZSkge1xuICB2YXIgZnVuY0luZm8gPSBnbFZhbGlkRW51bUNvbnRleHRzW2Z1bmN0aW9uTmFtZV07XG4gIGlmIChmdW5jSW5mbyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIGZ1bmNJbmZvID0gZnVuY0luZm9bbnVtQXJnc107XG4gICAgaWYgKGZ1bmNJbmZvICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChmdW5jSW5mb1thcmd1bWVudEluZGV4XSkge1xuICAgICAgICBpZiAodHlwZW9mIGZ1bmNJbmZvW2FyZ3VtZW50SW5kZXhdID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICAgZnVuY0luZm9bYXJndW1lbnRJbmRleF1bJ2VudW1CaXR3aXNlT3InXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdmFyIGVudW1zID0gZnVuY0luZm9bYXJndW1lbnRJbmRleF1bJ2VudW1CaXR3aXNlT3InXTtcbiAgICAgICAgICB2YXIgb3JSZXN1bHQgPSAwO1xuICAgICAgICAgIHZhciBvckVudW1zID0gW107XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbnVtcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIGVudW1WYWx1ZSA9IGVudW1TdHJpbmdUb1ZhbHVlW2VudW1zW2ldXTtcbiAgICAgICAgICAgIGlmICgodmFsdWUgJiBlbnVtVmFsdWUpICE9PSAwKSB7XG4gICAgICAgICAgICAgIG9yUmVzdWx0IHw9IGVudW1WYWx1ZTtcbiAgICAgICAgICAgICAgb3JFbnVtcy5wdXNoKGdsRW51bVRvU3RyaW5nKGVudW1WYWx1ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAob3JSZXN1bHQgPT09IHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gb3JFbnVtcy5qb2luKCcgfCAnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGdsRW51bVRvU3RyaW5nKHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGdsRW51bVRvU3RyaW5nKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gXCJudWxsXCI7XG4gIH0gZWxzZSBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBcInVuZGVmaW5lZFwiO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICB9XG59XG5cbi8qKlxuICogQ29udmVydHMgdGhlIGFyZ3VtZW50cyBvZiBhIFdlYkdMIGZ1bmN0aW9uIHRvIGEgc3RyaW5nLlxuICogQXR0ZW1wdHMgdG8gY29udmVydCBlbnVtIGFyZ3VtZW50cyB0byBzdHJpbmdzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBmdW5jdGlvbk5hbWUgdGhlIG5hbWUgb2YgdGhlIFdlYkdMIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGFyZ3MgVGhlIGFyZ3VtZW50cy5cbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIGFyZ3VtZW50cyBhcyBhIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gZ2xGdW5jdGlvbkFyZ3NUb1N0cmluZyhmdW5jdGlvbk5hbWUsIGFyZ3MpIHtcbiAgLy8gYXBwYXJlbnRseSB3ZSBjYW4ndCBkbyBhcmdzLmpvaW4oXCIsXCIpO1xuICB2YXIgYXJnU3RyID0gXCJcIjtcbiAgdmFyIG51bUFyZ3MgPSBhcmdzLmxlbmd0aDtcbiAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IG51bUFyZ3M7ICsraWkpIHtcbiAgICBhcmdTdHIgKz0gKChpaSA9PSAwKSA/ICcnIDogJywgJykgK1xuICAgICAgICBnbEZ1bmN0aW9uQXJnVG9TdHJpbmcoZnVuY3Rpb25OYW1lLCBudW1BcmdzLCBpaSwgYXJnc1tpaV0pO1xuICB9XG4gIHJldHVybiBhcmdTdHI7XG59O1xuXG5cbmZ1bmN0aW9uIG1ha2VQcm9wZXJ0eVdyYXBwZXIod3JhcHBlciwgb3JpZ2luYWwsIHByb3BlcnR5TmFtZSkge1xuICAvL2xvZyhcIndyYXAgcHJvcDogXCIgKyBwcm9wZXJ0eU5hbWUpO1xuICB3cmFwcGVyLl9fZGVmaW5lR2V0dGVyX18ocHJvcGVydHlOYW1lLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gb3JpZ2luYWxbcHJvcGVydHlOYW1lXTtcbiAgfSk7XG4gIC8vIFRPRE8oZ21hbmUpOiB0aGlzIG5lZWRzIHRvIGhhbmRsZSBwcm9wZXJ0aWVzIHRoYXQgdGFrZSBtb3JlIHRoYW5cbiAgLy8gb25lIHZhbHVlP1xuICB3cmFwcGVyLl9fZGVmaW5lU2V0dGVyX18ocHJvcGVydHlOYW1lLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgIC8vbG9nKFwic2V0OiBcIiArIHByb3BlcnR5TmFtZSk7XG4gICAgb3JpZ2luYWxbcHJvcGVydHlOYW1lXSA9IHZhbHVlO1xuICB9KTtcbn1cblxuLy8gTWFrZXMgYSBmdW5jdGlvbiB0aGF0IGNhbGxzIGEgZnVuY3Rpb24gb24gYW5vdGhlciBvYmplY3QuXG5mdW5jdGlvbiBtYWtlRnVuY3Rpb25XcmFwcGVyKG9yaWdpbmFsLCBmdW5jdGlvbk5hbWUpIHtcbiAgLy9sb2coXCJ3cmFwIGZuOiBcIiArIGZ1bmN0aW9uTmFtZSk7XG4gIHZhciBmID0gb3JpZ2luYWxbZnVuY3Rpb25OYW1lXTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIC8vbG9nKFwiY2FsbDogXCIgKyBmdW5jdGlvbk5hbWUpO1xuICAgIHZhciByZXN1bHQgPSBmLmFwcGx5KG9yaWdpbmFsLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5cbi8qKlxuICogR2l2ZW4gYSBXZWJHTCBjb250ZXh0IHJldHVybnMgYSB3cmFwcGVkIGNvbnRleHQgdGhhdCBjYWxsc1xuICogZ2wuZ2V0RXJyb3IgYWZ0ZXIgZXZlcnkgY29tbWFuZCBhbmQgY2FsbHMgYSBmdW5jdGlvbiBpZiB0aGVcbiAqIHJlc3VsdCBpcyBub3QgZ2wuTk9fRVJST1IuXG4gKlxuICogQHBhcmFtIHshV2ViR0xSZW5kZXJpbmdDb250ZXh0fSBjdHggVGhlIHdlYmdsIGNvbnRleHQgdG9cbiAqICAgICAgICB3cmFwLlxuICogQHBhcmFtIHshZnVuY3Rpb24oZXJyLCBmdW5jTmFtZSwgYXJncyk6IHZvaWR9IG9wdF9vbkVycm9yRnVuY1xuICogICAgICAgIFRoZSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gZ2wuZ2V0RXJyb3IgcmV0dXJucyBhblxuICogICAgICAgIGVycm9yLiBJZiBub3Qgc3BlY2lmaWVkIHRoZSBkZWZhdWx0IGZ1bmN0aW9uIGNhbGxzXG4gKiAgICAgICAgY29uc29sZS5sb2cgd2l0aCBhIG1lc3NhZ2UuXG4gKiBAcGFyYW0geyFmdW5jdGlvbihmdW5jTmFtZSwgYXJncyk6IHZvaWR9IG9wdF9vbkZ1bmMgVGhlXG4gKiAgICAgICAgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIGVhY2ggd2ViZ2wgZnVuY3Rpb24gaXMgY2FsbGVkLlxuICogICAgICAgIFlvdSBjYW4gdXNlIHRoaXMgdG8gbG9nIGFsbCBjYWxscyBmb3IgZXhhbXBsZS5cbiAqIEBwYXJhbSB7IVdlYkdMUmVuZGVyaW5nQ29udGV4dH0gb3B0X2Vycl9jdHggVGhlIHdlYmdsIGNvbnRleHRcbiAqICAgICAgICB0byBjYWxsIGdldEVycm9yIG9uIGlmIGRpZmZlcmVudCB0aGFuIGN0eC5cbiAqL1xuZnVuY3Rpb24gbWFrZURlYnVnQ29udGV4dChjdHgsIG9wdF9vbkVycm9yRnVuYywgb3B0X29uRnVuYywgb3B0X2Vycl9jdHgpIHtcbiAgb3B0X2Vycl9jdHggPSBvcHRfZXJyX2N0eCB8fCBjdHg7XG4gIGluaXQoY3R4KTtcbiAgb3B0X29uRXJyb3JGdW5jID0gb3B0X29uRXJyb3JGdW5jIHx8IGZ1bmN0aW9uKGVyciwgZnVuY3Rpb25OYW1lLCBhcmdzKSB7XG4gICAgICAgIC8vIGFwcGFyZW50bHkgd2UgY2FuJ3QgZG8gYXJncy5qb2luKFwiLFwiKTtcbiAgICAgICAgdmFyIGFyZ1N0ciA9IFwiXCI7XG4gICAgICAgIHZhciBudW1BcmdzID0gYXJncy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBudW1BcmdzOyArK2lpKSB7XG4gICAgICAgICAgYXJnU3RyICs9ICgoaWkgPT0gMCkgPyAnJyA6ICcsICcpICtcbiAgICAgICAgICAgICAgZ2xGdW5jdGlvbkFyZ1RvU3RyaW5nKGZ1bmN0aW9uTmFtZSwgbnVtQXJncywgaWksIGFyZ3NbaWldKTtcbiAgICAgICAgfVxuICAgICAgICBlcnJvcihcIldlYkdMIGVycm9yIFwiKyBnbEVudW1Ub1N0cmluZyhlcnIpICsgXCIgaW4gXCIrIGZ1bmN0aW9uTmFtZSArXG4gICAgICAgICAgICAgIFwiKFwiICsgYXJnU3RyICsgXCIpXCIpO1xuICAgICAgfTtcblxuICAvLyBIb2xkcyBib29sZWFucyBmb3IgZWFjaCBHTCBlcnJvciBzbyBhZnRlciB3ZSBnZXQgdGhlIGVycm9yIG91cnNlbHZlc1xuICAvLyB3ZSBjYW4gc3RpbGwgcmV0dXJuIGl0IHRvIHRoZSBjbGllbnQgYXBwLlxuICB2YXIgZ2xFcnJvclNoYWRvdyA9IHsgfTtcblxuICAvLyBNYWtlcyBhIGZ1bmN0aW9uIHRoYXQgY2FsbHMgYSBXZWJHTCBmdW5jdGlvbiBhbmQgdGhlbiBjYWxscyBnZXRFcnJvci5cbiAgZnVuY3Rpb24gbWFrZUVycm9yV3JhcHBlcihjdHgsIGZ1bmN0aW9uTmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChvcHRfb25GdW5jKSB7XG4gICAgICAgIG9wdF9vbkZ1bmMoZnVuY3Rpb25OYW1lLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgICAgdmFyIHJlc3VsdCA9IGN0eFtmdW5jdGlvbk5hbWVdLmFwcGx5KGN0eCwgYXJndW1lbnRzKTtcbiAgICAgIHZhciBlcnIgPSBvcHRfZXJyX2N0eC5nZXRFcnJvcigpO1xuICAgICAgaWYgKGVyciAhPSAwKSB7XG4gICAgICAgIGdsRXJyb3JTaGFkb3dbZXJyXSA9IHRydWU7XG4gICAgICAgIG9wdF9vbkVycm9yRnVuYyhlcnIsIGZ1bmN0aW9uTmFtZSwgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfVxuXG4gIC8vIE1ha2UgYSBhbiBvYmplY3QgdGhhdCBoYXMgYSBjb3B5IG9mIGV2ZXJ5IHByb3BlcnR5IG9mIHRoZSBXZWJHTCBjb250ZXh0XG4gIC8vIGJ1dCB3cmFwcyBhbGwgZnVuY3Rpb25zLlxuICB2YXIgd3JhcHBlciA9IHt9O1xuICBmb3IgKHZhciBwcm9wZXJ0eU5hbWUgaW4gY3R4KSB7XG4gICAgaWYgKHR5cGVvZiBjdHhbcHJvcGVydHlOYW1lXSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAocHJvcGVydHlOYW1lICE9ICdnZXRFeHRlbnNpb24nKSB7XG4gICAgICAgIHdyYXBwZXJbcHJvcGVydHlOYW1lXSA9IG1ha2VFcnJvcldyYXBwZXIoY3R4LCBwcm9wZXJ0eU5hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHdyYXBwZWQgPSBtYWtlRXJyb3JXcmFwcGVyKGN0eCwgcHJvcGVydHlOYW1lKTtcbiAgICAgICAgd3JhcHBlcltwcm9wZXJ0eU5hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciByZXN1bHQgPSB3cmFwcGVkLmFwcGx5KGN0eCwgYXJndW1lbnRzKTtcbiAgICAgICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBtYWtlRGVidWdDb250ZXh0KHJlc3VsdCwgb3B0X29uRXJyb3JGdW5jLCBvcHRfb25GdW5jLCBvcHRfZXJyX2N0eCk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG1ha2VQcm9wZXJ0eVdyYXBwZXIod3JhcHBlciwgY3R4LCBwcm9wZXJ0eU5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIE92ZXJyaWRlIHRoZSBnZXRFcnJvciBmdW5jdGlvbiB3aXRoIG9uZSB0aGF0IHJldHVybnMgb3VyIHNhdmVkIHJlc3VsdHMuXG4gIHdyYXBwZXIuZ2V0RXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBlcnIgaW4gZ2xFcnJvclNoYWRvdykge1xuICAgICAgaWYgKGdsRXJyb3JTaGFkb3cuaGFzT3duUHJvcGVydHkoZXJyKSkge1xuICAgICAgICBpZiAoZ2xFcnJvclNoYWRvd1tlcnJdKSB7XG4gICAgICAgICAgZ2xFcnJvclNoYWRvd1tlcnJdID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIGVycjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3R4Lk5PX0VSUk9SO1xuICB9O1xuXG4gIHJldHVybiB3cmFwcGVyO1xufVxuXG5mdW5jdGlvbiByZXNldFRvSW5pdGlhbFN0YXRlKGN0eCkge1xuICB2YXIgaXNXZWJHTDJSZW5kZXJpbmdDb250ZXh0ID0gISFjdHguY3JlYXRlVHJhbnNmb3JtRmVlZGJhY2s7XG5cbiAgaWYgKGlzV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkge1xuICAgIGN0eC5iaW5kVmVydGV4QXJyYXkobnVsbCk7XG4gIH1cblxuICB2YXIgbnVtQXR0cmlicyA9IGN0eC5nZXRQYXJhbWV0ZXIoY3R4Lk1BWF9WRVJURVhfQVRUUklCUyk7XG4gIHZhciB0bXAgPSBjdHguY3JlYXRlQnVmZmVyKCk7XG4gIGN0eC5iaW5kQnVmZmVyKGN0eC5BUlJBWV9CVUZGRVIsIHRtcCk7XG4gIGZvciAodmFyIGlpID0gMDsgaWkgPCBudW1BdHRyaWJzOyArK2lpKSB7XG4gICAgY3R4LmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheShpaSk7XG4gICAgY3R4LnZlcnRleEF0dHJpYlBvaW50ZXIoaWksIDQsIGN0eC5GTE9BVCwgZmFsc2UsIDAsIDApO1xuICAgIGN0eC52ZXJ0ZXhBdHRyaWIxZihpaSwgMCk7XG4gICAgaWYgKGlzV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkge1xuICAgICAgY3R4LnZlcnRleEF0dHJpYkRpdmlzb3IoaWksIDApO1xuICAgIH1cbiAgfVxuICBjdHguZGVsZXRlQnVmZmVyKHRtcCk7XG5cbiAgdmFyIG51bVRleHR1cmVVbml0cyA9IGN0eC5nZXRQYXJhbWV0ZXIoY3R4Lk1BWF9URVhUVVJFX0lNQUdFX1VOSVRTKTtcbiAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IG51bVRleHR1cmVVbml0czsgKytpaSkge1xuICAgIGN0eC5hY3RpdmVUZXh0dXJlKGN0eC5URVhUVVJFMCArIGlpKTtcbiAgICBjdHguYmluZFRleHR1cmUoY3R4LlRFWFRVUkVfQ1VCRV9NQVAsIG51bGwpO1xuICAgIGN0eC5iaW5kVGV4dHVyZShjdHguVEVYVFVSRV8yRCwgbnVsbCk7XG4gICAgaWYgKGlzV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkge1xuICAgICAgY3R4LmJpbmRUZXh0dXJlKGN0eC5URVhUVVJFXzJEX0FSUkFZLCBudWxsKTtcbiAgICAgIGN0eC5iaW5kVGV4dHVyZShjdHguVEVYVFVSRV8zRCwgbnVsbCk7XG4gICAgICBjdHguYmluZFNhbXBsZXIoaWksIG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5hY3RpdmVUZXh0dXJlKGN0eC5URVhUVVJFMCk7XG4gIGN0eC51c2VQcm9ncmFtKG51bGwpO1xuICBjdHguYmluZEJ1ZmZlcihjdHguQVJSQVlfQlVGRkVSLCBudWxsKTtcbiAgY3R4LmJpbmRCdWZmZXIoY3R4LkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBudWxsKTtcbiAgY3R4LmJpbmRGcmFtZWJ1ZmZlcihjdHguRlJBTUVCVUZGRVIsIG51bGwpO1xuICBjdHguYmluZFJlbmRlcmJ1ZmZlcihjdHguUkVOREVSQlVGRkVSLCBudWxsKTtcbiAgY3R4LmRpc2FibGUoY3R4LkJMRU5EKTtcbiAgY3R4LmRpc2FibGUoY3R4LkNVTExfRkFDRSk7XG4gIGN0eC5kaXNhYmxlKGN0eC5ERVBUSF9URVNUKTtcbiAgY3R4LmRpc2FibGUoY3R4LkRJVEhFUik7XG4gIGN0eC5kaXNhYmxlKGN0eC5TQ0lTU09SX1RFU1QpO1xuICBjdHguYmxlbmRDb2xvcigwLCAwLCAwLCAwKTtcbiAgY3R4LmJsZW5kRXF1YXRpb24oY3R4LkZVTkNfQUREKTtcbiAgY3R4LmJsZW5kRnVuYyhjdHguT05FLCBjdHguWkVSTyk7XG4gIGN0eC5jbGVhckNvbG9yKDAsIDAsIDAsIDApO1xuICBjdHguY2xlYXJEZXB0aCgxKTtcbiAgY3R4LmNsZWFyU3RlbmNpbCgtMSk7XG4gIGN0eC5jb2xvck1hc2sodHJ1ZSwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSk7XG4gIGN0eC5jdWxsRmFjZShjdHguQkFDSyk7XG4gIGN0eC5kZXB0aEZ1bmMoY3R4LkxFU1MpO1xuICBjdHguZGVwdGhNYXNrKHRydWUpO1xuICBjdHguZGVwdGhSYW5nZSgwLCAxKTtcbiAgY3R4LmZyb250RmFjZShjdHguQ0NXKTtcbiAgY3R4LmhpbnQoY3R4LkdFTkVSQVRFX01JUE1BUF9ISU5ULCBjdHguRE9OVF9DQVJFKTtcbiAgY3R4LmxpbmVXaWR0aCgxKTtcbiAgY3R4LnBpeGVsU3RvcmVpKGN0eC5QQUNLX0FMSUdOTUVOVCwgNCk7XG4gIGN0eC5waXhlbFN0b3JlaShjdHguVU5QQUNLX0FMSUdOTUVOVCwgNCk7XG4gIGN0eC5waXhlbFN0b3JlaShjdHguVU5QQUNLX0ZMSVBfWV9XRUJHTCwgZmFsc2UpO1xuICBjdHgucGl4ZWxTdG9yZWkoY3R4LlVOUEFDS19QUkVNVUxUSVBMWV9BTFBIQV9XRUJHTCwgZmFsc2UpO1xuICAvLyBUT0RPOiBEZWxldGUgdGhpcyBJRi5cbiAgaWYgKGN0eC5VTlBBQ0tfQ09MT1JTUEFDRV9DT05WRVJTSU9OX1dFQkdMKSB7XG4gICAgY3R4LnBpeGVsU3RvcmVpKGN0eC5VTlBBQ0tfQ09MT1JTUEFDRV9DT05WRVJTSU9OX1dFQkdMLCBjdHguQlJPV1NFUl9ERUZBVUxUX1dFQkdMKTtcbiAgfVxuICBjdHgucG9seWdvbk9mZnNldCgwLCAwKTtcbiAgY3R4LnNhbXBsZUNvdmVyYWdlKDEsIGZhbHNlKTtcbiAgY3R4LnNjaXNzb3IoMCwgMCwgY3R4LmNhbnZhcy53aWR0aCwgY3R4LmNhbnZhcy5oZWlnaHQpO1xuICBjdHguc3RlbmNpbEZ1bmMoY3R4LkFMV0FZUywgMCwgMHhGRkZGRkZGRik7XG4gIGN0eC5zdGVuY2lsTWFzaygweEZGRkZGRkZGKTtcbiAgY3R4LnN0ZW5jaWxPcChjdHguS0VFUCwgY3R4LktFRVAsIGN0eC5LRUVQKTtcbiAgY3R4LnZpZXdwb3J0KDAsIDAsIGN0eC5jYW52YXMud2lkdGgsIGN0eC5jYW52YXMuaGVpZ2h0KTtcbiAgY3R4LmNsZWFyKGN0eC5DT0xPUl9CVUZGRVJfQklUIHwgY3R4LkRFUFRIX0JVRkZFUl9CSVQgfCBjdHguU1RFTkNJTF9CVUZGRVJfQklUKTtcblxuICBpZiAoaXNXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgY3R4LmRyYXdCdWZmZXJzKFtjdHguQkFDS10pO1xuICAgIGN0eC5yZWFkQnVmZmVyKGN0eC5CQUNLKTtcbiAgICBjdHguYmluZEJ1ZmZlcihjdHguQ09QWV9SRUFEX0JVRkZFUiwgbnVsbCk7XG4gICAgY3R4LmJpbmRCdWZmZXIoY3R4LkNPUFlfV1JJVEVfQlVGRkVSLCBudWxsKTtcbiAgICBjdHguYmluZEJ1ZmZlcihjdHguUElYRUxfUEFDS19CVUZGRVIsIG51bGwpO1xuICAgIGN0eC5iaW5kQnVmZmVyKGN0eC5QSVhFTF9VTlBBQ0tfQlVGRkVSLCBudWxsKTtcbiAgICB2YXIgbnVtVHJhbnNmb3JtRmVlZGJhY2tzID0gY3R4LmdldFBhcmFtZXRlcihjdHguTUFYX1RSQU5TRk9STV9GRUVEQkFDS19TRVBBUkFURV9BVFRSSUJTKTtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgbnVtVHJhbnNmb3JtRmVlZGJhY2tzOyArK2lpKSB7XG4gICAgICBjdHguYmluZEJ1ZmZlckJhc2UoY3R4LlRSQU5TRk9STV9GRUVEQkFDS19CVUZGRVIsIGlpLCBudWxsKTtcbiAgICB9XG4gICAgdmFyIG51bVVCT3MgPSBjdHguZ2V0UGFyYW1ldGVyKGN0eC5NQVhfVU5JRk9STV9CVUZGRVJfQklORElOR1MpO1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBudW1VQk9zOyArK2lpKSB7XG4gICAgICBjdHguYmluZEJ1ZmZlckJhc2UoY3R4LlVOSUZPUk1fQlVGRkVSLCBpaSwgbnVsbCk7XG4gICAgfVxuICAgIGN0eC5kaXNhYmxlKGN0eC5SQVNURVJJWkVSX0RJU0NBUkQpO1xuICAgIGN0eC5waXhlbFN0b3JlaShjdHguVU5QQUNLX0lNQUdFX0hFSUdIVCwgMCk7XG4gICAgY3R4LnBpeGVsU3RvcmVpKGN0eC5VTlBBQ0tfU0tJUF9JTUFHRVMsIDApO1xuICAgIGN0eC5waXhlbFN0b3JlaShjdHguVU5QQUNLX1JPV19MRU5HVEgsIDApO1xuICAgIGN0eC5waXhlbFN0b3JlaShjdHguVU5QQUNLX1NLSVBfUk9XUywgMCk7XG4gICAgY3R4LnBpeGVsU3RvcmVpKGN0eC5VTlBBQ0tfU0tJUF9QSVhFTFMsIDApO1xuICAgIGN0eC5waXhlbFN0b3JlaShjdHguUEFDS19ST1dfTEVOR1RILCAwKTtcbiAgICBjdHgucGl4ZWxTdG9yZWkoY3R4LlBBQ0tfU0tJUF9ST1dTLCAwKTtcbiAgICBjdHgucGl4ZWxTdG9yZWkoY3R4LlBBQ0tfU0tJUF9QSVhFTFMsIDApO1xuICAgIGN0eC5oaW50KGN0eC5GUkFHTUVOVF9TSEFERVJfREVSSVZBVElWRV9ISU5ULCBjdHguRE9OVF9DQVJFKTtcbiAgfVxuXG4gIC8vIFRPRE86IFRoaXMgc2hvdWxkIE5PVCBiZSBuZWVkZWQgYnV0IEZpcmVmb3ggZmFpbHMgd2l0aCAnaGludCdcbiAgd2hpbGUoY3R4LmdldEVycm9yKCkpO1xufVxuXG5mdW5jdGlvbiBtYWtlTG9zdENvbnRleHRTaW11bGF0aW5nQ2FudmFzKGNhbnZhcykge1xuICB2YXIgdW53cmFwcGVkQ29udGV4dF87XG4gIHZhciB3cmFwcGVkQ29udGV4dF87XG4gIHZhciBvbkxvc3RfID0gW107XG4gIHZhciBvblJlc3RvcmVkXyA9IFtdO1xuICB2YXIgd3JhcHBlZENvbnRleHRfID0ge307XG4gIHZhciBjb250ZXh0SWRfID0gMTtcbiAgdmFyIGNvbnRleHRMb3N0XyA9IGZhbHNlO1xuICB2YXIgcmVzb3VyY2VJZF8gPSAwO1xuICB2YXIgcmVzb3VyY2VEYl8gPSBbXTtcbiAgdmFyIG51bUNhbGxzVG9Mb3NlQ29udGV4dF8gPSAwO1xuICB2YXIgbnVtQ2FsbHNfID0gMDtcbiAgdmFyIGNhblJlc3RvcmVfID0gZmFsc2U7XG4gIHZhciByZXN0b3JlVGltZW91dF8gPSAwO1xuICB2YXIgaXNXZWJHTDJSZW5kZXJpbmdDb250ZXh0O1xuXG4gIC8vIEhvbGRzIGJvb2xlYW5zIGZvciBlYWNoIEdMIGVycm9yIHNvIGNhbiBzaW11bGF0ZSBlcnJvcnMuXG4gIHZhciBnbEVycm9yU2hhZG93XyA9IHsgfTtcblxuICBjYW52YXMuZ2V0Q29udGV4dCA9IGZ1bmN0aW9uKGYpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY3R4ID0gZi5hcHBseShjYW52YXMsIGFyZ3VtZW50cyk7XG4gICAgICAvLyBEaWQgd2UgZ2V0IGEgY29udGV4dCBhbmQgaXMgaXQgYSBXZWJHTCBjb250ZXh0P1xuICAgICAgaWYgKChjdHggaW5zdGFuY2VvZiBXZWJHTFJlbmRlcmluZ0NvbnRleHQpIHx8ICh3aW5kb3cuV2ViR0wyUmVuZGVyaW5nQ29udGV4dCAmJiAoY3R4IGluc3RhbmNlb2YgV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkpKSB7XG4gICAgICAgIGlmIChjdHggIT0gdW53cmFwcGVkQ29udGV4dF8pIHtcbiAgICAgICAgICBpZiAodW53cmFwcGVkQ29udGV4dF8pIHtcbiAgICAgICAgICAgIHRocm93IFwiZ290IGRpZmZlcmVudCBjb250ZXh0XCJcbiAgICAgICAgICB9XG4gICAgICAgICAgaXNXZWJHTDJSZW5kZXJpbmdDb250ZXh0ID0gd2luZG93LldlYkdMMlJlbmRlcmluZ0NvbnRleHQgJiYgKGN0eCBpbnN0YW5jZW9mIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpO1xuICAgICAgICAgIHVud3JhcHBlZENvbnRleHRfID0gY3R4O1xuICAgICAgICAgIHdyYXBwZWRDb250ZXh0XyA9IG1ha2VMb3N0Q29udGV4dFNpbXVsYXRpbmdDb250ZXh0KHVud3JhcHBlZENvbnRleHRfKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd3JhcHBlZENvbnRleHRfO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGN0eDtcbiAgICB9XG4gIH0oY2FudmFzLmdldENvbnRleHQpO1xuXG4gIGZ1bmN0aW9uIHdyYXBFdmVudChsaXN0ZW5lcikge1xuICAgIGlmICh0eXBlb2YobGlzdGVuZXIpID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmV0dXJuIGxpc3RlbmVyO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oaW5mbykge1xuICAgICAgICBsaXN0ZW5lci5oYW5kbGVFdmVudChpbmZvKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2YXIgYWRkT25Db250ZXh0TG9zdExpc3RlbmVyID0gZnVuY3Rpb24obGlzdGVuZXIpIHtcbiAgICBvbkxvc3RfLnB1c2god3JhcEV2ZW50KGxpc3RlbmVyKSk7XG4gIH07XG5cbiAgdmFyIGFkZE9uQ29udGV4dFJlc3RvcmVkTGlzdGVuZXIgPSBmdW5jdGlvbihsaXN0ZW5lcikge1xuICAgIG9uUmVzdG9yZWRfLnB1c2god3JhcEV2ZW50KGxpc3RlbmVyKSk7XG4gIH07XG5cblxuICBmdW5jdGlvbiB3cmFwQWRkRXZlbnRMaXN0ZW5lcihjYW52YXMpIHtcbiAgICB2YXIgZiA9IGNhbnZhcy5hZGRFdmVudExpc3RlbmVyO1xuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIsIGJ1YmJsZSkge1xuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ3dlYmdsY29udGV4dGxvc3QnOlxuICAgICAgICAgIGFkZE9uQ29udGV4dExvc3RMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3dlYmdsY29udGV4dHJlc3RvcmVkJzpcbiAgICAgICAgICBhZGRPbkNvbnRleHRSZXN0b3JlZExpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBmLmFwcGx5KGNhbnZhcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgd3JhcEFkZEV2ZW50TGlzdGVuZXIoY2FudmFzKTtcblxuICBjYW52YXMubG9zZUNvbnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIWNvbnRleHRMb3N0Xykge1xuICAgICAgY29udGV4dExvc3RfID0gdHJ1ZTtcbiAgICAgIG51bUNhbGxzVG9Mb3NlQ29udGV4dF8gPSAwO1xuICAgICAgKytjb250ZXh0SWRfO1xuICAgICAgd2hpbGUgKHVud3JhcHBlZENvbnRleHRfLmdldEVycm9yKCkpO1xuICAgICAgY2xlYXJFcnJvcnMoKTtcbiAgICAgIGdsRXJyb3JTaGFkb3dfW3Vud3JhcHBlZENvbnRleHRfLkNPTlRFWFRfTE9TVF9XRUJHTF0gPSB0cnVlO1xuICAgICAgdmFyIGV2ZW50ID0gbWFrZVdlYkdMQ29udGV4dEV2ZW50KFwiY29udGV4dCBsb3N0XCIpO1xuICAgICAgdmFyIGNhbGxiYWNrcyA9IG9uTG9zdF8uc2xpY2UoKTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgLy9sb2coXCJudW1DYWxsYmFja3M6XCIgKyBjYWxsYmFja3MubGVuZ3RoKTtcbiAgICAgICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgY2FsbGJhY2tzLmxlbmd0aDsgKytpaSkge1xuICAgICAgICAgICAgLy9sb2coXCJjYWxsaW5nIGNhbGxiYWNrOlwiICsgaWkpO1xuICAgICAgICAgICAgY2FsbGJhY2tzW2lpXShldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChyZXN0b3JlVGltZW91dF8gPj0gMCkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjYW52YXMucmVzdG9yZUNvbnRleHQoKTtcbiAgICAgICAgICAgICAgfSwgcmVzdG9yZVRpbWVvdXRfKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDApO1xuICAgIH1cbiAgfTtcblxuICBjYW52YXMucmVzdG9yZUNvbnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoY29udGV4dExvc3RfKSB7XG4gICAgICBpZiAob25SZXN0b3JlZF8ubGVuZ3RoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIWNhblJlc3RvcmVfKSB7XG4gICAgICAgICAgICAgIHRocm93IFwiY2FuIG5vdCByZXN0b3JlLiB3ZWJnbGNvbnRlc3Rsb3N0IGxpc3RlbmVyIGRpZCBub3QgY2FsbCBldmVudC5wcmV2ZW50RGVmYXVsdFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnJlZVJlc291cmNlcygpO1xuICAgICAgICAgICAgcmVzZXRUb0luaXRpYWxTdGF0ZSh1bndyYXBwZWRDb250ZXh0Xyk7XG4gICAgICAgICAgICBjb250ZXh0TG9zdF8gPSBmYWxzZTtcbiAgICAgICAgICAgIG51bUNhbGxzXyA9IDA7XG4gICAgICAgICAgICBjYW5SZXN0b3JlXyA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrcyA9IG9uUmVzdG9yZWRfLnNsaWNlKCk7XG4gICAgICAgICAgICB2YXIgZXZlbnQgPSBtYWtlV2ViR0xDb250ZXh0RXZlbnQoXCJjb250ZXh0IHJlc3RvcmVkXCIpO1xuICAgICAgICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IGNhbGxiYWNrcy5sZW5ndGg7ICsraWkpIHtcbiAgICAgICAgICAgICAgY2FsbGJhY2tzW2lpXShldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgMCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGNhbnZhcy5sb3NlQ29udGV4dEluTkNhbGxzID0gZnVuY3Rpb24obnVtQ2FsbHMpIHtcbiAgICBpZiAoY29udGV4dExvc3RfKSB7XG4gICAgICB0aHJvdyBcIllvdSBjYW4gbm90IGFzayBhIGxvc3QgY29udGV0IHRvIGJlIGxvc3RcIjtcbiAgICB9XG4gICAgbnVtQ2FsbHNUb0xvc2VDb250ZXh0XyA9IG51bUNhbGxzXyArIG51bUNhbGxzO1xuICB9O1xuXG4gIGNhbnZhcy5nZXROdW1DYWxscyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBudW1DYWxsc187XG4gIH07XG5cbiAgY2FudmFzLnNldFJlc3RvcmVUaW1lb3V0ID0gZnVuY3Rpb24odGltZW91dCkge1xuICAgIHJlc3RvcmVUaW1lb3V0XyA9IHRpbWVvdXQ7XG4gIH07XG5cbiAgZnVuY3Rpb24gaXNXZWJHTE9iamVjdChvYmopIHtcbiAgICAvL3JldHVybiBmYWxzZTtcbiAgICByZXR1cm4gKG9iaiBpbnN0YW5jZW9mIFdlYkdMQnVmZmVyIHx8XG4gICAgICAgICAgICBvYmogaW5zdGFuY2VvZiBXZWJHTEZyYW1lYnVmZmVyIHx8XG4gICAgICAgICAgICBvYmogaW5zdGFuY2VvZiBXZWJHTFByb2dyYW0gfHxcbiAgICAgICAgICAgIG9iaiBpbnN0YW5jZW9mIFdlYkdMUmVuZGVyYnVmZmVyIHx8XG4gICAgICAgICAgICBvYmogaW5zdGFuY2VvZiBXZWJHTFNoYWRlciB8fFxuICAgICAgICAgICAgb2JqIGluc3RhbmNlb2YgV2ViR0xUZXh0dXJlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrUmVzb3VyY2VzKGFyZ3MpIHtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgYXJncy5sZW5ndGg7ICsraWkpIHtcbiAgICAgIHZhciBhcmcgPSBhcmdzW2lpXTtcbiAgICAgIGlmIChpc1dlYkdMT2JqZWN0KGFyZykpIHtcbiAgICAgICAgcmV0dXJuIGFyZy5fX3dlYmdsRGVidWdDb250ZXh0TG9zdElkX18gPT0gY29udGV4dElkXztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhckVycm9ycygpIHtcbiAgICB2YXIgayA9IE9iamVjdC5rZXlzKGdsRXJyb3JTaGFkb3dfKTtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgay5sZW5ndGg7ICsraWkpIHtcbiAgICAgIGRlbGV0ZSBnbEVycm9yU2hhZG93X1trW2lpXV07XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbG9zZUNvbnRleHRJZlRpbWUoKSB7XG4gICAgKytudW1DYWxsc187XG4gICAgaWYgKCFjb250ZXh0TG9zdF8pIHtcbiAgICAgIGlmIChudW1DYWxsc1RvTG9zZUNvbnRleHRfID09IG51bUNhbGxzXykge1xuICAgICAgICBjYW52YXMubG9zZUNvbnRleHQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBNYWtlcyBhIGZ1bmN0aW9uIHRoYXQgc2ltdWxhdGVzIFdlYkdMIHdoZW4gb3V0IG9mIGNvbnRleHQuXG4gIGZ1bmN0aW9uIG1ha2VMb3N0Q29udGV4dEZ1bmN0aW9uV3JhcHBlcihjdHgsIGZ1bmN0aW9uTmFtZSkge1xuICAgIHZhciBmID0gY3R4W2Z1bmN0aW9uTmFtZV07XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gbG9nKFwiY2FsbGluZzpcIiArIGZ1bmN0aW9uTmFtZSk7XG4gICAgICAvLyBPbmx5IGNhbGwgdGhlIGZ1bmN0aW9ucyBpZiB0aGUgY29udGV4dCBpcyBub3QgbG9zdC5cbiAgICAgIGxvc2VDb250ZXh0SWZUaW1lKCk7XG4gICAgICBpZiAoIWNvbnRleHRMb3N0Xykge1xuICAgICAgICAvL2lmICghY2hlY2tSZXNvdXJjZXMoYXJndW1lbnRzKSkge1xuICAgICAgICAvLyAgZ2xFcnJvclNoYWRvd19bd3JhcHBlZENvbnRleHRfLklOVkFMSURfT1BFUkFUSU9OXSA9IHRydWU7XG4gICAgICAgIC8vICByZXR1cm47XG4gICAgICAgIC8vfVxuICAgICAgICB2YXIgcmVzdWx0ID0gZi5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZyZWVSZXNvdXJjZXMoKSB7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IHJlc291cmNlRGJfLmxlbmd0aDsgKytpaSkge1xuICAgICAgdmFyIHJlc291cmNlID0gcmVzb3VyY2VEYl9baWldO1xuICAgICAgaWYgKHJlc291cmNlIGluc3RhbmNlb2YgV2ViR0xCdWZmZXIpIHtcbiAgICAgICAgdW53cmFwcGVkQ29udGV4dF8uZGVsZXRlQnVmZmVyKHJlc291cmNlKTtcbiAgICAgIH0gZWxzZSBpZiAocmVzb3VyY2UgaW5zdGFuY2VvZiBXZWJHTEZyYW1lYnVmZmVyKSB7XG4gICAgICAgIHVud3JhcHBlZENvbnRleHRfLmRlbGV0ZUZyYW1lYnVmZmVyKHJlc291cmNlKTtcbiAgICAgIH0gZWxzZSBpZiAocmVzb3VyY2UgaW5zdGFuY2VvZiBXZWJHTFByb2dyYW0pIHtcbiAgICAgICAgdW53cmFwcGVkQ29udGV4dF8uZGVsZXRlUHJvZ3JhbShyZXNvdXJjZSk7XG4gICAgICB9IGVsc2UgaWYgKHJlc291cmNlIGluc3RhbmNlb2YgV2ViR0xSZW5kZXJidWZmZXIpIHtcbiAgICAgICAgdW53cmFwcGVkQ29udGV4dF8uZGVsZXRlUmVuZGVyYnVmZmVyKHJlc291cmNlKTtcbiAgICAgIH0gZWxzZSBpZiAocmVzb3VyY2UgaW5zdGFuY2VvZiBXZWJHTFNoYWRlcikge1xuICAgICAgICB1bndyYXBwZWRDb250ZXh0Xy5kZWxldGVTaGFkZXIocmVzb3VyY2UpO1xuICAgICAgfSBlbHNlIGlmIChyZXNvdXJjZSBpbnN0YW5jZW9mIFdlYkdMVGV4dHVyZSkge1xuICAgICAgICB1bndyYXBwZWRDb250ZXh0Xy5kZWxldGVUZXh0dXJlKHJlc291cmNlKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGlzV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkge1xuICAgICAgICBpZiAocmVzb3VyY2UgaW5zdGFuY2VvZiBXZWJHTFF1ZXJ5KSB7XG4gICAgICAgICAgdW53cmFwcGVkQ29udGV4dF8uZGVsZXRlUXVlcnkocmVzb3VyY2UpO1xuICAgICAgICB9IGVsc2UgaWYgKHJlc291cmNlIGluc3RhbmNlb2YgV2ViR0xTYW1wbGVyKSB7XG4gICAgICAgICAgdW53cmFwcGVkQ29udGV4dF8uZGVsZXRlU2FtcGxlcihyZXNvdXJjZSk7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzb3VyY2UgaW5zdGFuY2VvZiBXZWJHTFN5bmMpIHtcbiAgICAgICAgICB1bndyYXBwZWRDb250ZXh0Xy5kZWxldGVTeW5jKHJlc291cmNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChyZXNvdXJjZSBpbnN0YW5jZW9mIFdlYkdMVHJhbnNmb3JtRmVlZGJhY2spIHtcbiAgICAgICAgICB1bndyYXBwZWRDb250ZXh0Xy5kZWxldGVUcmFuc2Zvcm1GZWVkYmFjayhyZXNvdXJjZSk7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzb3VyY2UgaW5zdGFuY2VvZiBXZWJHTFZlcnRleEFycmF5T2JqZWN0KSB7XG4gICAgICAgICAgdW53cmFwcGVkQ29udGV4dF8uZGVsZXRlVmVydGV4QXJyYXkocmVzb3VyY2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbWFrZVdlYkdMQ29udGV4dEV2ZW50KHN0YXR1c01lc3NhZ2UpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzTWVzc2FnZTogc3RhdHVzTWVzc2FnZSxcbiAgICAgIHByZXZlbnREZWZhdWx0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBjYW5SZXN0b3JlXyA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIGNhbnZhcztcblxuICBmdW5jdGlvbiBtYWtlTG9zdENvbnRleHRTaW11bGF0aW5nQ29udGV4dChjdHgpIHtcbiAgICAvLyBjb3B5IGFsbCBmdW5jdGlvbnMgYW5kIHByb3BlcnRpZXMgdG8gd3JhcHBlclxuICAgIGZvciAodmFyIHByb3BlcnR5TmFtZSBpbiBjdHgpIHtcbiAgICAgIGlmICh0eXBlb2YgY3R4W3Byb3BlcnR5TmFtZV0gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgd3JhcHBlZENvbnRleHRfW3Byb3BlcnR5TmFtZV0gPSBtYWtlTG9zdENvbnRleHRGdW5jdGlvbldyYXBwZXIoXG4gICAgICAgICAgICAgY3R4LCBwcm9wZXJ0eU5hbWUpO1xuICAgICAgIH0gZWxzZSB7XG4gICAgICAgICBtYWtlUHJvcGVydHlXcmFwcGVyKHdyYXBwZWRDb250ZXh0XywgY3R4LCBwcm9wZXJ0eU5hbWUpO1xuICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBXcmFwIGEgZmV3IGZ1bmN0aW9ucyBzcGVjaWFsbHkuXG4gICAgd3JhcHBlZENvbnRleHRfLmdldEVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICBsb3NlQ29udGV4dElmVGltZSgpO1xuICAgICAgaWYgKCFjb250ZXh0TG9zdF8pIHtcbiAgICAgICAgdmFyIGVycjtcbiAgICAgICAgd2hpbGUgKGVyciA9IHVud3JhcHBlZENvbnRleHRfLmdldEVycm9yKCkpIHtcbiAgICAgICAgICBnbEVycm9yU2hhZG93X1tlcnJdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZm9yICh2YXIgZXJyIGluIGdsRXJyb3JTaGFkb3dfKSB7XG4gICAgICAgIGlmIChnbEVycm9yU2hhZG93X1tlcnJdKSB7XG4gICAgICAgICAgZGVsZXRlIGdsRXJyb3JTaGFkb3dfW2Vycl07XG4gICAgICAgICAgcmV0dXJuIGVycjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHdyYXBwZWRDb250ZXh0Xy5OT19FUlJPUjtcbiAgICB9O1xuXG4gICAgdmFyIGNyZWF0aW9uRnVuY3Rpb25zID0gW1xuICAgICAgXCJjcmVhdGVCdWZmZXJcIixcbiAgICAgIFwiY3JlYXRlRnJhbWVidWZmZXJcIixcbiAgICAgIFwiY3JlYXRlUHJvZ3JhbVwiLFxuICAgICAgXCJjcmVhdGVSZW5kZXJidWZmZXJcIixcbiAgICAgIFwiY3JlYXRlU2hhZGVyXCIsXG4gICAgICBcImNyZWF0ZVRleHR1cmVcIlxuICAgIF07XG4gICAgaWYgKGlzV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkge1xuICAgICAgY3JlYXRpb25GdW5jdGlvbnMucHVzaChcbiAgICAgICAgXCJjcmVhdGVRdWVyeVwiLFxuICAgICAgICBcImNyZWF0ZVNhbXBsZXJcIixcbiAgICAgICAgXCJmZW5jZVN5bmNcIixcbiAgICAgICAgXCJjcmVhdGVUcmFuc2Zvcm1GZWVkYmFja1wiLFxuICAgICAgICBcImNyZWF0ZVZlcnRleEFycmF5XCJcbiAgICAgICk7XG4gICAgfVxuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBjcmVhdGlvbkZ1bmN0aW9ucy5sZW5ndGg7ICsraWkpIHtcbiAgICAgIHZhciBmdW5jdGlvbk5hbWUgPSBjcmVhdGlvbkZ1bmN0aW9uc1tpaV07XG4gICAgICB3cmFwcGVkQ29udGV4dF9bZnVuY3Rpb25OYW1lXSA9IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxvc2VDb250ZXh0SWZUaW1lKCk7XG4gICAgICAgICAgaWYgKGNvbnRleHRMb3N0Xykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBvYmogPSBmLmFwcGx5KGN0eCwgYXJndW1lbnRzKTtcbiAgICAgICAgICBvYmouX193ZWJnbERlYnVnQ29udGV4dExvc3RJZF9fID0gY29udGV4dElkXztcbiAgICAgICAgICByZXNvdXJjZURiXy5wdXNoKG9iaik7XG4gICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfTtcbiAgICAgIH0oY3R4W2Z1bmN0aW9uTmFtZV0pO1xuICAgIH1cblxuICAgIHZhciBmdW5jdGlvbnNUaGF0U2hvdWxkUmV0dXJuTnVsbCA9IFtcbiAgICAgIFwiZ2V0QWN0aXZlQXR0cmliXCIsXG4gICAgICBcImdldEFjdGl2ZVVuaWZvcm1cIixcbiAgICAgIFwiZ2V0QnVmZmVyUGFyYW1ldGVyXCIsXG4gICAgICBcImdldENvbnRleHRBdHRyaWJ1dGVzXCIsXG4gICAgICBcImdldEF0dGFjaGVkU2hhZGVyc1wiLFxuICAgICAgXCJnZXRGcmFtZWJ1ZmZlckF0dGFjaG1lbnRQYXJhbWV0ZXJcIixcbiAgICAgIFwiZ2V0UGFyYW1ldGVyXCIsXG4gICAgICBcImdldFByb2dyYW1QYXJhbWV0ZXJcIixcbiAgICAgIFwiZ2V0UHJvZ3JhbUluZm9Mb2dcIixcbiAgICAgIFwiZ2V0UmVuZGVyYnVmZmVyUGFyYW1ldGVyXCIsXG4gICAgICBcImdldFNoYWRlclBhcmFtZXRlclwiLFxuICAgICAgXCJnZXRTaGFkZXJJbmZvTG9nXCIsXG4gICAgICBcImdldFNoYWRlclNvdXJjZVwiLFxuICAgICAgXCJnZXRUZXhQYXJhbWV0ZXJcIixcbiAgICAgIFwiZ2V0VW5pZm9ybVwiLFxuICAgICAgXCJnZXRVbmlmb3JtTG9jYXRpb25cIixcbiAgICAgIFwiZ2V0VmVydGV4QXR0cmliXCJcbiAgICBdO1xuICAgIGlmIChpc1dlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICAgIGZ1bmN0aW9uc1RoYXRTaG91bGRSZXR1cm5OdWxsLnB1c2goXG4gICAgICAgIFwiZ2V0SW50ZXJuYWxmb3JtYXRQYXJhbWV0ZXJcIixcbiAgICAgICAgXCJnZXRRdWVyeVwiLFxuICAgICAgICBcImdldFF1ZXJ5UGFyYW1ldGVyXCIsXG4gICAgICAgIFwiZ2V0U2FtcGxlclBhcmFtZXRlclwiLFxuICAgICAgICBcImdldFN5bmNQYXJhbWV0ZXJcIixcbiAgICAgICAgXCJnZXRUcmFuc2Zvcm1GZWVkYmFja1ZhcnlpbmdcIixcbiAgICAgICAgXCJnZXRJbmRleGVkUGFyYW1ldGVyXCIsXG4gICAgICAgIFwiZ2V0VW5pZm9ybUluZGljZXNcIixcbiAgICAgICAgXCJnZXRBY3RpdmVVbmlmb3Jtc1wiLFxuICAgICAgICBcImdldEFjdGl2ZVVuaWZvcm1CbG9ja1BhcmFtZXRlclwiLFxuICAgICAgICBcImdldEFjdGl2ZVVuaWZvcm1CbG9ja05hbWVcIlxuICAgICAgKTtcbiAgICB9XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IGZ1bmN0aW9uc1RoYXRTaG91bGRSZXR1cm5OdWxsLmxlbmd0aDsgKytpaSkge1xuICAgICAgdmFyIGZ1bmN0aW9uTmFtZSA9IGZ1bmN0aW9uc1RoYXRTaG91bGRSZXR1cm5OdWxsW2lpXTtcbiAgICAgIHdyYXBwZWRDb250ZXh0X1tmdW5jdGlvbk5hbWVdID0gZnVuY3Rpb24oZikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbG9zZUNvbnRleHRJZlRpbWUoKTtcbiAgICAgICAgICBpZiAoY29udGV4dExvc3RfKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGYuYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgICB9KHdyYXBwZWRDb250ZXh0X1tmdW5jdGlvbk5hbWVdKTtcbiAgICB9XG5cbiAgICB2YXIgaXNGdW5jdGlvbnMgPSBbXG4gICAgICBcImlzQnVmZmVyXCIsXG4gICAgICBcImlzRW5hYmxlZFwiLFxuICAgICAgXCJpc0ZyYW1lYnVmZmVyXCIsXG4gICAgICBcImlzUHJvZ3JhbVwiLFxuICAgICAgXCJpc1JlbmRlcmJ1ZmZlclwiLFxuICAgICAgXCJpc1NoYWRlclwiLFxuICAgICAgXCJpc1RleHR1cmVcIlxuICAgIF07XG4gICAgaWYgKGlzV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkge1xuICAgICAgaXNGdW5jdGlvbnMucHVzaChcbiAgICAgICAgXCJpc1F1ZXJ5XCIsXG4gICAgICAgIFwiaXNTYW1wbGVyXCIsXG4gICAgICAgIFwiaXNTeW5jXCIsXG4gICAgICAgIFwiaXNUcmFuc2Zvcm1GZWVkYmFja1wiLFxuICAgICAgICBcImlzVmVydGV4QXJyYXlcIlxuICAgICAgKTtcbiAgICB9XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IGlzRnVuY3Rpb25zLmxlbmd0aDsgKytpaSkge1xuICAgICAgdmFyIGZ1bmN0aW9uTmFtZSA9IGlzRnVuY3Rpb25zW2lpXTtcbiAgICAgIHdyYXBwZWRDb250ZXh0X1tmdW5jdGlvbk5hbWVdID0gZnVuY3Rpb24oZikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbG9zZUNvbnRleHRJZlRpbWUoKTtcbiAgICAgICAgICBpZiAoY29udGV4dExvc3RfKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmLmFwcGx5KGN0eCwgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgfSh3cmFwcGVkQ29udGV4dF9bZnVuY3Rpb25OYW1lXSk7XG4gICAgfVxuXG4gICAgd3JhcHBlZENvbnRleHRfLmNoZWNrRnJhbWVidWZmZXJTdGF0dXMgPSBmdW5jdGlvbihmKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGxvc2VDb250ZXh0SWZUaW1lKCk7XG4gICAgICAgIGlmIChjb250ZXh0TG9zdF8pIHtcbiAgICAgICAgICByZXR1cm4gd3JhcHBlZENvbnRleHRfLkZSQU1FQlVGRkVSX1VOU1VQUE9SVEVEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmLmFwcGx5KGN0eCwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSh3cmFwcGVkQ29udGV4dF8uY2hlY2tGcmFtZWJ1ZmZlclN0YXR1cyk7XG5cbiAgICB3cmFwcGVkQ29udGV4dF8uZ2V0QXR0cmliTG9jYXRpb24gPSBmdW5jdGlvbihmKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGxvc2VDb250ZXh0SWZUaW1lKCk7XG4gICAgICAgIGlmIChjb250ZXh0TG9zdF8pIHtcbiAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGYuYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICB9KHdyYXBwZWRDb250ZXh0Xy5nZXRBdHRyaWJMb2NhdGlvbik7XG5cbiAgICB3cmFwcGVkQ29udGV4dF8uZ2V0VmVydGV4QXR0cmliT2Zmc2V0ID0gZnVuY3Rpb24oZikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBsb3NlQ29udGV4dElmVGltZSgpO1xuICAgICAgICBpZiAoY29udGV4dExvc3RfKSB7XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGYuYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICB9KHdyYXBwZWRDb250ZXh0Xy5nZXRWZXJ0ZXhBdHRyaWJPZmZzZXQpO1xuXG4gICAgd3JhcHBlZENvbnRleHRfLmlzQ29udGV4dExvc3QgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjb250ZXh0TG9zdF87XG4gICAgfTtcblxuICAgIGlmIChpc1dlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICAgIHdyYXBwZWRDb250ZXh0Xy5nZXRGcmFnRGF0YUxvY2F0aW9uID0gZnVuY3Rpb24oZikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbG9zZUNvbnRleHRJZlRpbWUoKTtcbiAgICAgICAgICBpZiAoY29udGV4dExvc3RfKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmLmFwcGx5KGN0eCwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICAgIH0od3JhcHBlZENvbnRleHRfLmdldEZyYWdEYXRhTG9jYXRpb24pO1xuXG4gICAgICB3cmFwcGVkQ29udGV4dF8uY2xpZW50V2FpdFN5bmMgPSBmdW5jdGlvbihmKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsb3NlQ29udGV4dElmVGltZSgpO1xuICAgICAgICAgIGlmIChjb250ZXh0TG9zdF8pIHtcbiAgICAgICAgICAgIHJldHVybiB3cmFwcGVkQ29udGV4dF8uV0FJVF9GQUlMRUQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmLmFwcGx5KGN0eCwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICAgIH0od3JhcHBlZENvbnRleHRfLmNsaWVudFdhaXRTeW5jKTtcblxuICAgICAgd3JhcHBlZENvbnRleHRfLmdldFVuaWZvcm1CbG9ja0luZGV4ID0gZnVuY3Rpb24oZikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbG9zZUNvbnRleHRJZlRpbWUoKTtcbiAgICAgICAgICBpZiAoY29udGV4dExvc3RfKSB7XG4gICAgICAgICAgICByZXR1cm4gd3JhcHBlZENvbnRleHRfLklOVkFMSURfSU5ERVg7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmLmFwcGx5KGN0eCwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICAgIH0od3JhcHBlZENvbnRleHRfLmdldFVuaWZvcm1CbG9ja0luZGV4KTtcbiAgICB9XG5cbiAgICByZXR1cm4gd3JhcHBlZENvbnRleHRfO1xuICB9XG59XG5cbnJldHVybiB7XG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGlzIG1vZHVsZS4gU2FmZSB0byBjYWxsIG1vcmUgdGhhbiBvbmNlLlxuICAgKiBAcGFyYW0geyFXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGN0eCBBIFdlYkdMIGNvbnRleHQuIElmXG4gICAqICAgIHlvdSBoYXZlIG1vcmUgdGhhbiBvbmUgY29udGV4dCBpdCBkb2Vzbid0IG1hdHRlciB3aGljaCBvbmVcbiAgICogICAgeW91IHBhc3MgaW4sIGl0IGlzIG9ubHkgdXNlZCB0byBwdWxsIG91dCBjb25zdGFudHMuXG4gICAqL1xuICAnaW5pdCc6IGluaXQsXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBvciBmYWxzZSBpZiB2YWx1ZSBtYXRjaGVzIGFueSBXZWJHTCBlbnVtXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWUgVmFsdWUgdG8gY2hlY2sgaWYgaXQgbWlnaHQgYmUgYW4gZW51bS5cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB2YWx1ZSBtYXRjaGVzIG9uZSBvZiB0aGUgV2ViR0wgZGVmaW5lZCBlbnVtc1xuICAgKi9cbiAgJ21pZ2h0QmVFbnVtJzogbWlnaHRCZUVudW0sXG5cbiAgLyoqXG4gICAqIEdldHMgYW4gc3RyaW5nIHZlcnNpb24gb2YgYW4gV2ViR0wgZW51bS5cbiAgICpcbiAgICogRXhhbXBsZTpcbiAgICogICBXZWJHTERlYnVnVXRpbC5pbml0KGN0eCk7XG4gICAqICAgdmFyIHN0ciA9IFdlYkdMRGVidWdVdGlsLmdsRW51bVRvU3RyaW5nKGN0eC5nZXRFcnJvcigpKTtcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIFZhbHVlIHRvIHJldHVybiBhbiBlbnVtIGZvclxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBzdHJpbmcgdmVyc2lvbiBvZiB0aGUgZW51bS5cbiAgICovXG4gICdnbEVudW1Ub1N0cmluZyc6IGdsRW51bVRvU3RyaW5nLFxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGUgYXJndW1lbnQgb2YgYSBXZWJHTCBmdW5jdGlvbiB0byBhIHN0cmluZy5cbiAgICogQXR0ZW1wdHMgdG8gY29udmVydCBlbnVtIGFyZ3VtZW50cyB0byBzdHJpbmdzLlxuICAgKlxuICAgKiBFeGFtcGxlOlxuICAgKiAgIFdlYkdMRGVidWdVdGlsLmluaXQoY3R4KTtcbiAgICogICB2YXIgc3RyID0gV2ViR0xEZWJ1Z1V0aWwuZ2xGdW5jdGlvbkFyZ1RvU3RyaW5nKCdiaW5kVGV4dHVyZScsIDIsIDAsIGdsLlRFWFRVUkVfMkQpO1xuICAgKlxuICAgKiB3b3VsZCByZXR1cm4gJ1RFWFRVUkVfMkQnXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmdW5jdGlvbk5hbWUgdGhlIG5hbWUgb2YgdGhlIFdlYkdMIGZ1bmN0aW9uLlxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtQXJncyBUaGUgbnVtYmVyIG9mIGFyZ3VtZW50c1xuICAgKiBAcGFyYW0ge251bWJlcn0gYXJndW1lbnRJbmR4IHRoZSBpbmRleCBvZiB0aGUgYXJndW1lbnQuXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIG9mIHRoZSBhcmd1bWVudC5cbiAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgdmFsdWUgYXMgYSBzdHJpbmcuXG4gICAqL1xuICAnZ2xGdW5jdGlvbkFyZ1RvU3RyaW5nJzogZ2xGdW5jdGlvbkFyZ1RvU3RyaW5nLFxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGUgYXJndW1lbnRzIG9mIGEgV2ViR0wgZnVuY3Rpb24gdG8gYSBzdHJpbmcuXG4gICAqIEF0dGVtcHRzIHRvIGNvbnZlcnQgZW51bSBhcmd1bWVudHMgdG8gc3RyaW5ncy5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZ1bmN0aW9uTmFtZSB0aGUgbmFtZSBvZiB0aGUgV2ViR0wgZnVuY3Rpb24uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhcmdzIFRoZSBhcmd1bWVudHMuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIGFyZ3VtZW50cyBhcyBhIHN0cmluZy5cbiAgICovXG4gICdnbEZ1bmN0aW9uQXJnc1RvU3RyaW5nJzogZ2xGdW5jdGlvbkFyZ3NUb1N0cmluZyxcblxuICAvKipcbiAgICogR2l2ZW4gYSBXZWJHTCBjb250ZXh0IHJldHVybnMgYSB3cmFwcGVkIGNvbnRleHQgdGhhdCBjYWxsc1xuICAgKiBnbC5nZXRFcnJvciBhZnRlciBldmVyeSBjb21tYW5kIGFuZCBjYWxscyBhIGZ1bmN0aW9uIGlmIHRoZVxuICAgKiByZXN1bHQgaXMgbm90IE5PX0VSUk9SLlxuICAgKlxuICAgKiBZb3UgY2FuIHN1cHBseSB5b3VyIG93biBmdW5jdGlvbiBpZiB5b3Ugd2FudC4gRm9yIGV4YW1wbGUsIGlmIHlvdSdkIGxpa2VcbiAgICogYW4gZXhjZXB0aW9uIHRocm93biBvbiBhbnkgR0wgZXJyb3IgeW91IGNvdWxkIGRvIHRoaXNcbiAgICpcbiAgICogICAgZnVuY3Rpb24gdGhyb3dPbkdMRXJyb3IoZXJyLCBmdW5jTmFtZSwgYXJncykge1xuICAgKiAgICAgIHRocm93IFdlYkdMRGVidWdVdGlscy5nbEVudW1Ub1N0cmluZyhlcnIpICtcbiAgICogICAgICAgICAgICBcIiB3YXMgY2F1c2VkIGJ5IGNhbGwgdG8gXCIgKyBmdW5jTmFtZTtcbiAgICogICAgfTtcbiAgICpcbiAgICogICAgY3R4ID0gV2ViR0xEZWJ1Z1V0aWxzLm1ha2VEZWJ1Z0NvbnRleHQoXG4gICAqICAgICAgICBjYW52YXMuZ2V0Q29udGV4dChcIndlYmdsXCIpLCB0aHJvd09uR0xFcnJvcik7XG4gICAqXG4gICAqIEBwYXJhbSB7IVdlYkdMUmVuZGVyaW5nQ29udGV4dH0gY3R4IFRoZSB3ZWJnbCBjb250ZXh0IHRvIHdyYXAuXG4gICAqIEBwYXJhbSB7IWZ1bmN0aW9uKGVyciwgZnVuY05hbWUsIGFyZ3MpOiB2b2lkfSBvcHRfb25FcnJvckZ1bmMgVGhlIGZ1bmN0aW9uXG4gICAqICAgICB0byBjYWxsIHdoZW4gZ2wuZ2V0RXJyb3IgcmV0dXJucyBhbiBlcnJvci4gSWYgbm90IHNwZWNpZmllZCB0aGUgZGVmYXVsdFxuICAgKiAgICAgZnVuY3Rpb24gY2FsbHMgY29uc29sZS5sb2cgd2l0aCBhIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSB7IWZ1bmN0aW9uKGZ1bmNOYW1lLCBhcmdzKTogdm9pZH0gb3B0X29uRnVuYyBUaGVcbiAgICogICAgIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBlYWNoIHdlYmdsIGZ1bmN0aW9uIGlzIGNhbGxlZC4gWW91XG4gICAqICAgICBjYW4gdXNlIHRoaXMgdG8gbG9nIGFsbCBjYWxscyBmb3IgZXhhbXBsZS5cbiAgICovXG4gICdtYWtlRGVidWdDb250ZXh0JzogbWFrZURlYnVnQ29udGV4dCxcblxuICAvKipcbiAgICogR2l2ZW4gYSBjYW52YXMgZWxlbWVudCByZXR1cm5zIGEgd3JhcHBlZCBjYW52YXMgZWxlbWVudCB0aGF0IHdpbGxcbiAgICogc2ltdWxhdGUgbG9zdCBjb250ZXh0LiBUaGUgY2FudmFzIHJldHVybmVkIGFkZHMgdGhlIGZvbGxvd2luZyBmdW5jdGlvbnMuXG4gICAqXG4gICAqIGxvc2VDb250ZXh0OlxuICAgKiAgIHNpbXVsYXRlcyBhIGxvc3QgY29udGV4dCBldmVudC5cbiAgICpcbiAgICogcmVzdG9yZUNvbnRleHQ6XG4gICAqICAgc2ltdWxhdGVzIHRoZSBjb250ZXh0IGJlaW5nIHJlc3RvcmVkLlxuICAgKlxuICAgKiBsb3N0Q29udGV4dEluTkNhbGxzOlxuICAgKiAgIGxvc2VzIHRoZSBjb250ZXh0IGFmdGVyIE4gZ2wgY2FsbHMuXG4gICAqXG4gICAqIGdldE51bUNhbGxzOlxuICAgKiAgIHRlbGxzIHlvdSBob3cgbWFueSBnbCBjYWxscyB0aGVyZSBoYXZlIGJlZW4gc28gZmFyLlxuICAgKlxuICAgKiBzZXRSZXN0b3JlVGltZW91dDpcbiAgICogICBzZXRzIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHVudGlsIHRoZSBjb250ZXh0IGlzIHJlc3RvcmVkXG4gICAqICAgYWZ0ZXIgaXQgaGFzIGJlZW4gbG9zdC4gRGVmYXVsdHMgdG8gMC4gUGFzcyAtMSB0byBwcmV2ZW50XG4gICAqICAgYXV0b21hdGljIHJlc3RvcmluZy5cbiAgICpcbiAgICogQHBhcmFtIHshQ2FudmFzfSBjYW52YXMgVGhlIGNhbnZhcyBlbGVtZW50IHRvIHdyYXAuXG4gICAqL1xuICAnbWFrZUxvc3RDb250ZXh0U2ltdWxhdGluZ0NhbnZhcyc6IG1ha2VMb3N0Q29udGV4dFNpbXVsYXRpbmdDYW52YXMsXG5cbiAgLyoqXG4gICAqIFJlc2V0cyBhIGNvbnRleHQgdG8gdGhlIGluaXRpYWwgc3RhdGUuXG4gICAqIEBwYXJhbSB7IVdlYkdMUmVuZGVyaW5nQ29udGV4dH0gY3R4IFRoZSB3ZWJnbCBjb250ZXh0IHRvXG4gICAqICAgICByZXNldC5cbiAgICovXG4gICdyZXNldFRvSW5pdGlhbFN0YXRlJzogcmVzZXRUb0luaXRpYWxTdGF0ZVxufTtcblxufSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdlYkdMRGVidWdVdGlscztcbiIsImltcG9ydCB7IFBhcnRpY2xlRW5naW5lIH0gZnJvbSAnLi9wYXJ0aWNsZV9lbmdpbmUnXG5pbXBvcnQgeyBVc2VySW5wdXRTdGF0ZSB9IGZyb20gJy4vc3RhdGUnO1xuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFNldCB1cCBXZWJHTFxuICAgIGxldCBjYW52YXMgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluQ2FudmFzXCIpO1xuICAgIGxldCBnbCA9IGNhbnZhcy5nZXRDb250ZXh0KFwid2ViZ2wyXCIpO1xuICAgIGlmICghZ2wpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJFcnJvcjogY291bGQgbm90IGdldCB3ZWJnbDJcIik7XG4gICAgICAgIGNhbnZhcy5oaWRkZW4gPSB0cnVlO1xuICAgICAgICByZXR1cm5cbiAgICB9XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnbGVycm9yXCIpLmhpZGRlbiA9IHRydWU7XG5cbiAgICB2YXIgY291bnQgPSAxMDAwMDtcbiAgICBsZXQgc3RhdGUgPSBuZXcgVXNlcklucHV0U3RhdGUoKTtcbiAgICBsZXQgZW5naW5lID0gbmV3IFBhcnRpY2xlRW5naW5lKGdsLCBjb3VudCk7XG5cbiAgICAvLyBDYWxsYmFja3NcbiAgICBjYW52YXMub25jb250ZXh0bWVudSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGZhbHNlOyB9O1xuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHN0YXRlLm1vdXNlWzBdID0gKGUub2Zmc2V0WCAvIGNhbnZhcy5jbGllbnRXaWR0aCkgKiAyIC0gMTtcbiAgICAgICAgc3RhdGUubW91c2VbMV0gPSAoKGNhbnZhcy5jbGllbnRIZWlnaHQgLSBlLm9mZnNldFkpIC8gY2FudmFzLmNsaWVudEhlaWdodCkgKiAyIC0gMTtcbiAgICB9KTtcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoZS5idXR0b24gPT0gMikge1xuICAgICAgICAgICAgc3RhdGUudm9ydGV4ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLmFjY2VsID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0YXRlLmFjY2VsID0gZmFsc2U7XG4gICAgICAgIHN0YXRlLnZvcnRleCA9IGZhbHNlO1xuICAgIH0pO1xuICAgIGxldCBoYW5kbGVSZXNpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICAvLyBUZWxsIFdlYkdMIGhvdyB0byBjb252ZXJ0IGZyb20gY2xpcCBzcGFjZSB0byBwaXhlbHNcbiAgICAgICAgZ2wudmlld3BvcnQoMCwgMCwgZ2wuY2FudmFzLndpZHRoLCBnbC5jYW52YXMuaGVpZ2h0KTtcbiAgICB9O1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIGhhbmRsZVJlc2l6ZSk7XG4gICAgbGV0IGFjdmFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhY2NlbFZhbFwiKTtcbiAgICBsZXQgYWMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFjY2VsXCIpO1xuICAgIGFjLm9uaW5wdXQgPSBmdW5jdGlvbiAodGhpczogSFRNTElucHV0RWxlbWVudCwgZXY6IEV2ZW50KSB7XG4gICAgICAgIHN0YXRlLmFjY2VsQW1vdW50ID0gTnVtYmVyKHRoaXMudmFsdWUpICogMC4wNTtcbiAgICAgICAgYWN2YWwudGV4dENvbnRlbnQgPSBzdGF0ZS5hY2NlbEFtb3VudC50b1ByZWNpc2lvbigzKTtcbiAgICB9O1xuICAgIGxldCBwb2ludHNWYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBvaW50c1ZhbFwiKTtcbiAgICBsZXQgcG9pbnRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb2ludHNcIik7XG4gICAgdmFyIG5ld0NvdW50ID0gMDtcbiAgICBwb2ludHMub25pbnB1dCA9IGZ1bmN0aW9uICh0aGlzOiBIVE1MSW5wdXRFbGVtZW50LCBldjogRXZlbnQpIHtcbiAgICAgICAgbmV3Q291bnQgPSBNYXRoLnJvdW5kKDUwMDAgKiBNYXRoLmV4cChOdW1iZXIodGhpcy52YWx1ZSkgLyAxNCkpO1xuICAgICAgICBwb2ludHNWYWwudGV4dENvbnRlbnQgPSBcIlwiICsgbmV3Q291bnQ7XG4gICAgfTtcbiAgICBwb2ludHMub25jaGFuZ2UgPSBmdW5jdGlvbiAodGhpczogSFRNTElucHV0RWxlbWVudCwgZXY6IEV2ZW50KSB7XG4gICAgICAgIC8vIFdoZW4gdXNlciBpcyBkb25lIHNsaWRpbmcsIHJlLWluaXQgcGFydGljbGUgYnVmZmVyc1xuICAgICAgICBjb3VudCA9IG5ld0NvdW50O1xuICAgICAgICBlbmdpbmUucmVzZXRQYXJ0aWNsZXMoY291bnQpO1xuICAgIH07XG4gICAgbGV0IHBvaW50c2l6ZVZhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicG9pbnRzaXplVmFsXCIpO1xuICAgIGxldCBwb2ludHNpemUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncG9pbnRzaXplJyk7XG4gICAgcG9pbnRzaXplLm9uaW5wdXQgPSBmdW5jdGlvbiAodGhpczogSFRNTElucHV0RWxlbWVudCwgZXY6IEV2ZW50KSB7XG4gICAgICAgIHN0YXRlLnBhcnRpY2xlU2l6ZSA9IE51bWJlcih0aGlzLnZhbHVlKSAvIDEwLjA7XG4gICAgICAgIHBvaW50c2l6ZVZhbC50ZXh0Q29udGVudCA9IFwiXCIgKyBzdGF0ZS5wYXJ0aWNsZVNpemU7XG4gICAgfTtcbiAgICBsZXQgZnJpY3Rpb25WYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZyaWN0aW9uVmFsXCIpO1xuICAgIGxldCBmcmljdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmcmljdGlvbicpO1xuICAgIGZyaWN0aW9uLm9uaW5wdXQgPSBmdW5jdGlvbiAodGhpczogSFRNTElucHV0RWxlbWVudCwgZXY6IEV2ZW50KSB7XG4gICAgICAgIHN0YXRlLmZyaWN0aW9uID0gTnVtYmVyKHRoaXMudmFsdWUpICogMC4wMTtcbiAgICAgICAgZnJpY3Rpb25WYWwudGV4dENvbnRlbnQgPSBzdGF0ZS5mcmljdGlvbi50b1ByZWNpc2lvbigzKTtcbiAgICB9O1xuXG4gICAgbGV0IGZyYW1lQ291bnRlciA9IDA7XG4gICAgbGV0IGZwc1ZhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZnBzXCIpO1xuICAgIGxldCBwcmV2RnJhbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgZnVuY3Rpb24gZHJhd1NjZW5lKCkge1xuICAgICAgICBlbmdpbmUuZHJhdyhzdGF0ZSk7XG4gICAgICAgIGlmIChmcmFtZUNvdW50ZXIgPT0gOSkge1xuICAgICAgICAgICAgbGV0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgICAgICBsZXQgZnBzID0gMTAwMDAuMCAvIChub3cgLSBwcmV2RnJhbWUpO1xuICAgICAgICAgICAgcHJldkZyYW1lID0gbm93O1xuICAgICAgICAgICAgZnBzVmFsLnRleHRDb250ZW50ID0gXCJcIiArIGZwcztcbiAgICAgICAgICAgIGZyYW1lQ291bnRlciA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmcmFtZUNvdW50ZXIgKz0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3U2NlbmUpO1xuICAgIH1cbiAgICAvLyBTZXQgdXAgcG9pbnRzIGJ5IG1hbnVhbGx5IGNhbGxpbmcgdGhlIGNhbGxiYWNrc1xuICAgIGFjLm9uaW5wdXQobnVsbCk7XG4gICAgcG9pbnRzLm9uaW5wdXQobnVsbCk7XG4gICAgcG9pbnRzLm9uY2hhbmdlKG51bGwpO1xuICAgIHBvaW50c2l6ZS5vbmlucHV0KG51bGwpO1xuICAgIGZyaWN0aW9uLm9uaW5wdXQobnVsbCk7XG4gICAgaGFuZGxlUmVzaXplKCk7XG4gICAgZHJhd1NjZW5lKCk7XG59O1xuIiwiaW1wb3J0ICogYXMgV2ViR0xEZWJ1Z1V0aWxzIGZyb20gJ3dlYmdsLWRlYnVnJ1xuaW1wb3J0IHsgVlNfU09VUkNFLCBGU19TT1VSQ0UsIGNyZWF0ZVNoYWRlciB9IGZyb20gJy4vc2hhZGVycydcbmltcG9ydCB7IFVzZXJJbnB1dFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcblxuZXhwb3J0IGNsYXNzIFBhcnRpY2xlRW5naW5lIHtcbiAgICBwcml2YXRlIGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0O1xuICAgIHByaXZhdGUgY291bnQ6IG51bWJlcjtcbiAgICBwcml2YXRlIHRyYW5zZm9ybUZlZWRiYWNrOiBXZWJHTFRyYW5zZm9ybUZlZWRiYWNrO1xuICAgIHByaXZhdGUgdW5pZm9ybUxvY3MgPSB7XG4gICAgICAgIGFjY2VsOiBudWxsLFxuICAgICAgICB2b3J0ZXg6IG51bGwsXG4gICAgICAgIGFjY2VsQW1vdW50OiBudWxsLFxuICAgICAgICBtb3VzZTogbnVsbCxcbiAgICAgICAgcGFydGljbGVTaXplOiBudWxsLFxuICAgICAgICBkdDogbnVsbCxcbiAgICAgICAgZnJpY3Rpb246IG51bGwsXG4gICAgfTtcbiAgICBwcml2YXRlIGJ1ZmZlcnMgPSB7XG4gICAgICAgIHBvc2l0aW9uOiBbbnVsbCwgbnVsbF0sXG4gICAgICAgIHZlbG9jaXR5OiBbbnVsbCwgbnVsbF0sXG4gICAgfTtcbiAgICBwcml2YXRlIGF0dHJpYnV0ZUxvY3MgPSB7XG4gICAgICAgIHBvc2l0aW9uOiBudWxsLFxuICAgICAgICB2ZWxvY2l0eTogbnVsbCxcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBpbmRleCA9IDA7XG4gICAgcHJpdmF0ZSBwcmV2RnJhbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgcHJpdmF0ZSB0aHJvd09uR0xFcnJvcihlcnIsIGZ1bmNOYW1lLCBhcmdzKSB7XG4gICAgICAgIHRocm93IFdlYkdMRGVidWdVdGlscy5nbEVudW1Ub1N0cmluZyhlcnIpICsgXCIgd2FzIGNhdXNlZCBieSBjYWxsIHRvOiBcIiArIGZ1bmNOYW1lO1xuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcihjdHg6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsIGNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgLy90aGlzLmdsID0gV2ViR0xEZWJ1Z1V0aWxzLm1ha2VEZWJ1Z0NvbnRleHQoY3R4LCB0aGlzLnRocm93T25HTEVycm9yKTtcbiAgICAgICAgdGhpcy5nbCA9IGN0eDtcbiAgICAgICAgbGV0IGdsID0gdGhpcy5nbDtcblxuICAgICAgICBsZXQgdnMgPSBjcmVhdGVTaGFkZXIoZ2wsIGdsLlZFUlRFWF9TSEFERVIsIFZTX1NPVVJDRSk7XG4gICAgICAgIGxldCBmcyA9IGNyZWF0ZVNoYWRlcihnbCwgZ2wuRlJBR01FTlRfU0hBREVSLCBGU19TT1VSQ0UpO1xuICAgICAgICBsZXQgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHZzKTtcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZzKTtcbiAgICAgICAgZ2wudHJhbnNmb3JtRmVlZGJhY2tWYXJ5aW5ncyhwcm9ncmFtLCBbJ3ZfcG9zaXRpb24nLCAndl92ZWxvY2l0eSddLCBnbC5TRVBBUkFURV9BVFRSSUJTKTtcbiAgICAgICAgZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSk7XG5cbiAgICAgICAgdGhpcy5idWZmZXJzLnBvc2l0aW9uWzBdID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIHRoaXMuYnVmZmVycy52ZWxvY2l0eVswXSA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICB0aGlzLmJ1ZmZlcnMucG9zaXRpb25bMV0gPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgdGhpcy5idWZmZXJzLnZlbG9jaXR5WzFdID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG5cbiAgICAgICAgdGhpcy51bmlmb3JtTG9jcy5hY2NlbCA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCBcImFjY2VsXCIpO1xuICAgICAgICB0aGlzLnVuaWZvcm1Mb2NzLnZvcnRleCA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCBcInZvcnRleFwiKTtcbiAgICAgICAgdGhpcy51bmlmb3JtTG9jcy5hY2NlbEFtb3VudCA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCBcImFjY2VsQW1vdW50XCIpO1xuICAgICAgICB0aGlzLnVuaWZvcm1Mb2NzLm1vdXNlID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIFwibW91c2VcIik7XG4gICAgICAgIHRoaXMudW5pZm9ybUxvY3MucGFydGljbGVTaXplID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIFwicGFydGljbGVTaXplXCIpO1xuICAgICAgICB0aGlzLnVuaWZvcm1Mb2NzLmR0ID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIFwiZHRcIik7XG4gICAgICAgIHRoaXMudW5pZm9ybUxvY3MuZnJpY3Rpb24gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgXCJmcmljdGlvblwiKTtcblxuICAgICAgICB0aGlzLmF0dHJpYnV0ZUxvY3MucG9zaXRpb24gPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCBcImFfcG9zaXRpb25cIik7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlTG9jcy52ZWxvY2l0eSA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIFwiYV92ZWxvY2l0eVwiKTtcblxuICAgICAgICBsZXQgdmFvID0gZ2wuY3JlYXRlVmVydGV4QXJyYXkoKTtcbiAgICAgICAgZ2wuYmluZFZlcnRleEFycmF5KHZhbyk7XG5cbiAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5hdHRyaWJ1dGVMb2NzLnZlbG9jaXR5KTtcbiAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGhpcy5hdHRyaWJ1dGVMb2NzLnBvc2l0aW9uKTtcblxuICAgICAgICAvLyBUZWxsIGl0IHRvIHVzZSBvdXIgcHJvZ3JhbSAocGFpciBvZiBzaGFkZXJzKVxuICAgICAgICBnbC51c2VQcm9ncmFtKHByb2dyYW0pO1xuXG4gICAgICAgIC8vIEJpbmQgdGhlIGF0dHJpYnV0ZS9idWZmZXIgc2V0IHdlIHdhbnQuXG4gICAgICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh2YW8pO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybUZlZWRiYWNrID0gZ2wuY3JlYXRlVHJhbnNmb3JtRmVlZGJhY2soKTtcbiAgICAgICAgdGhpcy5yZXNldFBhcnRpY2xlcyhjb3VudCk7XG4gICAgfVxuXG4gICAgZHJhdyhzdGF0ZTogVXNlcklucHV0U3RhdGUpIHtcbiAgICAgICAgbGV0IGdsID0gdGhpcy5nbDtcbiAgICAgICAgbGV0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIGxldCBkdCA9IChub3cgLSB0aGlzLnByZXZGcmFtZSkgLyAxMDAwLjA7XG4gICAgICAgIHRoaXMucHJldkZyYW1lID0gbm93O1xuICAgICAgICBnbC51bmlmb3JtMWkodGhpcy51bmlmb3JtTG9jcy5hY2NlbCwgc3RhdGUuYWNjZWwgPyAxIDogMCk7XG4gICAgICAgIGdsLnVuaWZvcm0xaSh0aGlzLnVuaWZvcm1Mb2NzLnZvcnRleCwgc3RhdGUudm9ydGV4ID8gMSA6IDApO1xuICAgICAgICBnbC51bmlmb3JtMWYodGhpcy51bmlmb3JtTG9jcy5hY2NlbEFtb3VudCwgc3RhdGUuYWNjZWxBbW91bnQpO1xuICAgICAgICBnbC51bmlmb3JtMmYodGhpcy51bmlmb3JtTG9jcy5tb3VzZSwgc3RhdGUubW91c2VbMF0sIHN0YXRlLm1vdXNlWzFdKTtcbiAgICAgICAgZ2wudW5pZm9ybTFmKHRoaXMudW5pZm9ybUxvY3MucGFydGljbGVTaXplLCBzdGF0ZS5wYXJ0aWNsZVNpemUpO1xuICAgICAgICBnbC51bmlmb3JtMWYodGhpcy51bmlmb3JtTG9jcy5kdCwgZHQpO1xuICAgICAgICBnbC51bmlmb3JtMWYodGhpcy51bmlmb3JtTG9jcy5mcmljdGlvbiwgc3RhdGUuZnJpY3Rpb24pO1xuXG4gICAgICAgIC8vIFNldCB1cCBidWZmZXIgZGF0YVxuICAgICAgICBsZXQgc2l6ZSA9IDI7ICAgICAgICAgIC8vIDIgY29tcG9uZW50cyBwZXIgaXRlcmF0aW9uXG4gICAgICAgIGxldCB0eXBlID0gZ2wuRkxPQVQ7ICAgLy8gdGhlIGRhdGEgaXMgMzJiaXQgZmxvYXRzXG4gICAgICAgIGxldCBub3JtYWxpemUgPSBmYWxzZTsgLy8gZG9uJ3Qgbm9ybWFsaXplIHRoZSBkYXRhXG4gICAgICAgIGxldCBzdHJpZGUgPSAwOyAgICAgICAgLy8gMCA9IG1vdmUgZm9yd2FyZCBzaXplICogc2l6ZW9mKHR5cGUpIGVhY2ggaXRlcmF0aW9uIHRvIGdldCB0aGUgbmV4dCBwb3NpdGlvblxuICAgICAgICBsZXQgb2Zmc2V0ID0gMDsgICAgICAgIC8vIHN0YXJ0IGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGJ1ZmZlclxuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5idWZmZXJzLnBvc2l0aW9uW3RoaXMuaW5kZXhdKTtcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihcbiAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlTG9jcy5wb3NpdGlvbiwgc2l6ZSwgdHlwZSwgbm9ybWFsaXplLCBzdHJpZGUsIG9mZnNldCk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcnMudmVsb2NpdHlbdGhpcy5pbmRleF0pO1xuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKFxuICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVMb2NzLnZlbG9jaXR5LCBzaXplLCB0eXBlLCBub3JtYWxpemUsIHN0cmlkZSwgb2Zmc2V0KTtcblxuICAgICAgICBnbC5jbGVhckNvbG9yKDAuMDEsIDAuMDEsIDAuMDEsIDEpO1xuICAgICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUKTtcbiAgICAgICAgZ2wuYmluZFRyYW5zZm9ybUZlZWRiYWNrKGdsLlRSQU5TRk9STV9GRUVEQkFDSywgdGhpcy50cmFuc2Zvcm1GZWVkYmFjayk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXJCYXNlKGdsLlRSQU5TRk9STV9GRUVEQkFDS19CVUZGRVIsIDAsIHRoaXMuYnVmZmVycy5wb3NpdGlvblsxLXRoaXMuaW5kZXhdKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlckJhc2UoZ2wuVFJBTlNGT1JNX0ZFRURCQUNLX0JVRkZFUiwgMSwgdGhpcy5idWZmZXJzLnZlbG9jaXR5WzEtdGhpcy5pbmRleF0pO1xuICAgICAgICBnbC5iZWdpblRyYW5zZm9ybUZlZWRiYWNrKGdsLlBPSU5UUyk7XG4gICAgICAgIGdsLmRyYXdBcnJheXMoZ2wuUE9JTlRTLCAwLCB0aGlzLmNvdW50KTtcbiAgICAgICAgZ2wuZW5kVHJhbnNmb3JtRmVlZGJhY2soKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlckJhc2UoZ2wuVFJBTlNGT1JNX0ZFRURCQUNLX0JVRkZFUiwgMCwgbnVsbCk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXJCYXNlKGdsLlRSQU5TRk9STV9GRUVEQkFDS19CVUZGRVIsIDEsIG51bGwpO1xuICAgICAgICAvLyBTd2FwIGJ1ZmZlcnNcbiAgICAgICAgdGhpcy5pbmRleCA9IDEgLSB0aGlzLmluZGV4O1xuICAgIH1cblxuICAgIHJlc2V0UGFydGljbGVzKGNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5jb3VudCA9IGNvdW50O1xuICAgICAgICBsZXQgcG9zaXRpb25zID0gW107XG4gICAgICAgIGxldCB2ZWxzID0gW107XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBwb3NpdGlvbnMucHVzaCgyICogTWF0aC5yYW5kb20oKSAtIDEpOyAvLyB4XG4gICAgICAgICAgICBwb3NpdGlvbnMucHVzaCgyICogTWF0aC5yYW5kb20oKSAtIDEpOyAvLyB5XG4gICAgICAgICAgICB2ZWxzLnB1c2goMC4wKTtcbiAgICAgICAgICAgIHZlbHMucHVzaCgwLjApO1xuICAgICAgICB9XG4gICAgICAgIGxldCBnbCA9IHRoaXMuZ2w7XG4gICAgICAgIC8vIEZpbGwgbWFpbiBidWZmZXJzXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcnMucG9zaXRpb25bMF0pO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShwb3NpdGlvbnMpLCBnbC5TVEFUSUNfRFJBVyk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcnMudmVsb2NpdHlbMF0pO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh2ZWxzKSwgZ2wuU1RBVElDX0RSQVcpO1xuXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcnMucG9zaXRpb25bMV0pO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShwb3NpdGlvbnMpLCBnbC5TVEFUSUNfRFJBVyk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcnMudmVsb2NpdHlbMV0pO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh2ZWxzKSwgZ2wuU1RBVElDX0RSQVcpO1xuXG4gICAgICAgIC8vIFVuYmluZCBidWZmZXJcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xuICAgIH1cbn1cbiIsImxldCBWU19TT1VSQ0UgPSBgI3ZlcnNpb24gMzAwIGVzXG5cbiAgICB1bmlmb3JtIHZlYzIgbW91c2U7XG4gICAgdW5pZm9ybSBib29sIGFjY2VsO1xuICAgIHVuaWZvcm0gYm9vbCB2b3J0ZXg7XG4gICAgdW5pZm9ybSBmbG9hdCBhY2NlbEFtb3VudDtcbiAgICB1bmlmb3JtIGZsb2F0IHBhcnRpY2xlU2l6ZTtcbiAgICB1bmlmb3JtIGZsb2F0IGR0O1xuICAgIHVuaWZvcm0gZmxvYXQgZnJpY3Rpb247XG5cbiAgICBpbiB2ZWMyIGFfcG9zaXRpb247XG4gICAgaW4gdmVjMiBhX3ZlbG9jaXR5O1xuICAgIG91dCB2ZWMyIHZfcG9zaXRpb247XG4gICAgb3V0IHZlYzIgdl92ZWxvY2l0eTtcblxuICAgIC8vIGZyb20gaHR0cHM6Ly90aGVib29rb2ZzaGFkZXJzLmNvbS8xMC9cbiAgICBmbG9hdCByYW5kb20gKHZlYzIgc3QpIHtcbiAgICAgICAgcmV0dXJuIGZyYWN0KHNpbihkb3Qoc3QueHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVjMigxMi45ODk4LDc4LjIzMykpKSpcbiAgICAgICAgICAgIDQzNzU4LjU0NTMxMjMpO1xuICAgIH1cblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgZ2xfUG9pbnRTaXplID0gcGFydGljbGVTaXplO1xuICAgICAgICBnbF9Qb3NpdGlvbiA9IHZlYzQoYV9wb3NpdGlvbiwgMCwgMSk7XG4gICAgICAgIC8vIFBhc3MgdGhyb3VnaCB0byBmcmFnbWVudCBzaGFkZXJcbiAgICAgICAgdl92ZWxvY2l0eSA9IGFfdmVsb2NpdHk7XG4gICAgICAgIC8vdl92ZWxvY2l0eS55IC09IDAuMDAwMTtcblxuICAgICAgICBpZiAoYWNjZWwpIHtcbiAgICAgICAgICAgIHZlYzIgZGVsID0gbm9ybWFsaXplKG1vdXNlIC0gYV9wb3NpdGlvbik7XG4gICAgICAgICAgICB2X3ZlbG9jaXR5ICs9IGRlbCAqIGFjY2VsQW1vdW50ICogZHQ7XG4gICAgICAgIH0gZWxzZSBpZiAodm9ydGV4KSB7XG4gICAgICAgICAgICB2ZWMyIGRlbCA9IG5vcm1hbGl6ZShtb3VzZSAtIGFfcG9zaXRpb24pO1xuICAgICAgICAgICAgdl92ZWxvY2l0eSArPSAodmVjMihkZWwueSwgLWRlbC54KS81LjAgKyBkZWwpICogYWNjZWxBbW91bnQgKiBkdDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZyaWN0aW9uXG4gICAgICAgIHZfdmVsb2NpdHkgKj0gKDEuMCAtIGZyaWN0aW9uICogZHQgKiAoMS4wICsgcmFuZG9tKHZfcG9zaXRpb24pKSk7XG5cbiAgICAgICAgLy8gVXBkYXRlIHBvcy92ZWwgZm9yIHRyYW5zZm9ybSBmZWVkYmFja1xuICAgICAgICB2X3Bvc2l0aW9uID0gYV9wb3NpdGlvbjtcbiAgICAgICAgdl9wb3NpdGlvbiArPSB2X3ZlbG9jaXR5ICogZHQ7XG4gICAgICAgIGlmKHZfcG9zaXRpb24ueCA+IDEuMCkge1xuICAgICAgICAgICAgdl9wb3NpdGlvbi54ID0gMi4wIC0gdl9wb3NpdGlvbi54O1xuICAgICAgICAgICAgdl92ZWxvY2l0eS54ID0gLXZfdmVsb2NpdHkueDtcbiAgICAgICAgfVxuICAgICAgICBpZih2X3Bvc2l0aW9uLnkgPiAxLjApIHtcbiAgICAgICAgICAgIHZfcG9zaXRpb24ueSA9IDIuMCAtIHZfcG9zaXRpb24ueTtcbiAgICAgICAgICAgIHZfdmVsb2NpdHkueSA9IC12X3ZlbG9jaXR5Lnk7XG4gICAgICAgIH1cbiAgICAgICAgaWYodl9wb3NpdGlvbi54IDwgLTEuMCkge1xuICAgICAgICAgICAgdl9wb3NpdGlvbi54ID0gLTIuMCAtIHZfcG9zaXRpb24ueDtcbiAgICAgICAgICAgIHZfdmVsb2NpdHkueCA9IC12X3ZlbG9jaXR5Lng7XG4gICAgICAgIH1cbiAgICAgICAgaWYodl9wb3NpdGlvbi55IDwgLTEuMCkge1xuICAgICAgICAgICAgdl9wb3NpdGlvbi55ID0gLTIuMCAtIHZfcG9zaXRpb24ueTtcbiAgICAgICAgICAgIHZfdmVsb2NpdHkueSA9IC12X3ZlbG9jaXR5Lnk7XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG5sZXQgRlNfU09VUkNFID0gYCN2ZXJzaW9uIDMwMCBlc1xuXG4gICAgLy8gZnJhZ21lbnQgc2hhZGVycyBkb24ndCBoYXZlIGEgZGVmYXVsdCBwcmVjaXNpb24gc28gd2UgbmVlZFxuICAgIC8vIHRvIHBpY2sgb25lLiBtZWRpdW1wIGlzIGEgZ29vZCBkZWZhdWx0LiBJdCBtZWFucyBcIm1lZGl1bSBwcmVjaXNpb25cIlxuICAgIHByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xuXG4gICAgaW4gdmVjMiB2X3ZlbG9jaXR5O1xuICAgIC8vIHdlIG5lZWQgdG8gZGVjbGFyZSBhbiBvdXRwdXQgZm9yIHRoZSBmcmFnbWVudCBzaGFkZXJcbiAgICBvdXQgdmVjNCBvdXRDb2xvcjtcblxuICAgIHZlYzMgaHN2MnJnYih2ZWMzIGMpIHtcbiAgICAgICAgdmVjNCBLID0gdmVjNCgxLjAsIDIuMCAvIDMuMCwgMS4wIC8gMy4wLCAzLjApO1xuICAgICAgICB2ZWMzIHAgPSBhYnMoZnJhY3QoYy54eHggKyBLLnh5eikgKiA2LjAgLSBLLnd3dyk7XG4gICAgICAgIHJldHVybiBjLnogKiBtaXgoSy54eHgsIGNsYW1wKHAgLSBLLnh4eCwgMC4wLCAxLjApLCBjLnkpO1xuICAgIH1cblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgLy8gVGVjaG5pY2FsbHkgSFNWIGlzIHN1cHBvc2VkIHRvIGJlIGJldHdlZW4gMCBhbmQgMSBidXQgSSBmb3VuZCB0aGF0XG4gICAgICAgIC8vIGxldHRpbmcgdGhlIHZhbHVlIGdvIGhpZ2hlciBjYXVzZXMgaXQgdG8gd3JhcC1hcm91bmQgYW5kIGxvb2sgY29vbFxuICAgICAgICBmbG9hdCB2ZWwgPSBjbGFtcChsZW5ndGgodl92ZWxvY2l0eSkgKiAwLjgsIDAuMCwgMi4wKTtcbiAgICAgICAgb3V0Q29sb3IgPSB2ZWM0KFxuICAgICAgICAgICAgaHN2MnJnYih2ZWMzKFxuICAgICAgICAgICAgICAgIDAuNiAtIHZlbCAqIDAuNiwgIC8vIGh1ZVxuICAgICAgICAgICAgICAgIDEuMCwgICAgICAgICAgICAgICAvLyBzYXRcbiAgICAgICAgICAgICAgICBtYXgoMC4yICsgdmVsLCAwLjgpIC8vIHZpYnJhbmNlXG4gICAgICAgICAgICApKSxcbiAgICAgICAgMS4wKTtcbiAgICB9XG5gO1xuXG4vLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly93ZWJnbDJmdW5kYW1lbnRhbHMub3JnL3dlYmdsL2xlc3NvbnMvd2ViZ2wtZnVuZGFtZW50YWxzLmh0bWxcbmZ1bmN0aW9uIGNyZWF0ZVNoYWRlcihnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgdHlwZTogbnVtYmVyLCBzb3VyY2U6IHN0cmluZykge1xuICAgIGxldCBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIodHlwZSk7XG4gICAgZ2wuc2hhZGVyU291cmNlKHNoYWRlciwgc291cmNlKTtcbiAgICBnbC5jb21waWxlU2hhZGVyKHNoYWRlcik7XG4gICAgbGV0IHN1Y2Nlc3MgPSBnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoc2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUyk7XG4gICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgcmV0dXJuIHNoYWRlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgZSA9IFwiU2hhZGVyIGJ1aWxkIGVycm9yOiBcIiArIGdsLmdldFNoYWRlckluZm9Mb2coc2hhZGVyKTtcbiAgICAgICAgZ2wuZGVsZXRlU2hhZGVyKHNoYWRlcik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlKTtcbiAgICB9XG59XG5leHBvcnQge1ZTX1NPVVJDRSwgRlNfU09VUkNFLCBjcmVhdGVTaGFkZXJ9XG4iLCJleHBvcnQgY2xhc3MgVXNlcklucHV0U3RhdGUge1xuICAgIG1vdXNlID0gWzAsIDBdO1xuICAgIGFjY2VsID0gZmFsc2U7XG4gICAgdm9ydGV4ID0gZmFsc2U7XG4gICAgcGFydGljbGVTaXplID0gMS4wO1xuICAgIGFjY2VsQW1vdW50ID0gMC43NTtcbiAgICBmcmljdGlvbiA9IDAuMztcbn1cbiJdfQ==
