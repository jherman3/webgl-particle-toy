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
        state.accel = true;
        if (e.button == 2) {
            // Invert acceleration for right click
            state.accelAmount = -Math.abs(state.accelAmount);
        }
        else {
            state.accelAmount = Math.abs(state.accelAmount);
        }
    });
    canvas.addEventListener("mouseup", function () {
        state.accel = false;
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
            accelAmount: null,
            mouse: null,
            particleSize: null,
            dt: null
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
        this.uniformLocs.accelAmount = gl.getUniformLocation(program, "accelAmount");
        this.uniformLocs.mouse = gl.getUniformLocation(program, "mouse");
        this.uniformLocs.particleSize = gl.getUniformLocation(program, "particleSize");
        this.uniformLocs.dt = gl.getUniformLocation(program, "dt");
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
        gl.uniform1f(this.uniformLocs.accelAmount, state.accelAmount);
        gl.uniform2f(this.uniformLocs.mouse, state.mouse[0], state.mouse[1]);
        gl.uniform1f(this.uniformLocs.particleSize, state.particleSize);
        gl.uniform1f(this.uniformLocs.dt, dt);
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
var VS_SOURCE = "#version 300 es\n\n    uniform vec2 mouse;\n    uniform bool accel;\n    uniform float accelAmount;\n    uniform float particleSize;\n    uniform float dt;\n\n    in vec2 a_position;\n    in vec2 a_velocity;\n    out vec2 v_position;\n    out vec2 v_velocity;\n\n    // from https://thebookofshaders.com/10/\n    float random (vec2 st) {\n        return fract(sin(dot(st.xy,\n                            vec2(12.9898,78.233)))*\n            43758.5453123);\n    }\n\n    void main() {\n        gl_PointSize = particleSize;\n        gl_Position = vec4(a_position, 0, 1);\n        // Pass through to fragment shader\n        v_velocity = a_velocity;\n        //v_velocity.y -= 0.0001;\n\n        if(accel) {\n            vec2 del = normalize(mouse - a_position);\n            if (accelAmount < 0.0) {\n                v_velocity -= (vec2(del.y, -del.x)/5.0 + del) * accelAmount * dt;\n            } else {\n                v_velocity += del * accelAmount * dt;\n            }\n        }\n\n        // Friction\n        v_velocity *= (1.0 - 0.005 * (1.0 + random(v_position)));\n\n        // Update pos/vel for transform feedback\n        v_position = a_position;\n        v_position += v_velocity * dt;\n        if(v_position.x > 1.0) {\n            v_position.x = 2.0 - v_position.x;\n            v_velocity.x = -v_velocity.x;\n        }\n        if(v_position.y > 1.0) {\n            v_position.y = 2.0 - v_position.y;\n            v_velocity.y = -v_velocity.y;\n        }\n        if(v_position.x < -1.0) {\n            v_position.x = -2.0 - v_position.x;\n            v_velocity.x = -v_velocity.x;\n        }\n        if(v_position.y < -1.0) {\n            v_position.y = -2.0 - v_position.y;\n            v_velocity.y = -v_velocity.y;\n        }\n    }\n";
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
        this.particleSize = 1.0;
        this.accelAmount = 0.001;
    }
    return UserInputState;
}());
exports.UserInputState = UserInputState;

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvd2ViZ2wtZGVidWcvaW5kZXguanMiLCJzcmMvaW5kZXgudHMiLCJzcmMvcGFydGljbGVfZW5naW5lLnRzIiwic3JjL3NoYWRlcnMudHMiLCJzcmMvc3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ2hyQ0EscURBQWtEO0FBQ2xELGlDQUF5QztBQUV6QyxNQUFNLENBQUMsTUFBTSxHQUFHO0lBQ1osZUFBZTtJQUNmLElBQUksTUFBTSxHQUFzQixRQUFR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QixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdELEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN0QjtBQUNMLENBQUM7QUFDNkIsb0NBQVk7Ozs7O0FDekcxQztJQUFBO1FBQ0ksVUFBSyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2YsVUFBSyxHQUFHLEtBQUssQ0FBQztRQUNkLGlCQUFZLEdBQUcsR0FBRyxDQUFDO1FBQ25CLGdCQUFXLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLENBQUM7SUFBRCxxQkFBQztBQUFELENBTEEsQUFLQyxJQUFBO0FBTFksd0NBQWMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKlxuKiogQ29weXJpZ2h0IChjKSAyMDEyIFRoZSBLaHJvbm9zIEdyb3VwIEluYy5cbioqXG4qKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuKiogY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZC9vciBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuKiogXCJNYXRlcmlhbHNcIiksIHRvIGRlYWwgaW4gdGhlIE1hdGVyaWFscyB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbioqIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbioqIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgTWF0ZXJpYWxzLCBhbmQgdG9cbioqIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIE1hdGVyaWFscyBhcmUgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvXG4qKiB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4qKlxuKiogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbioqIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIE1hdGVyaWFscy5cbioqXG4qKiBUSEUgTUFURVJJQUxTIEFSRSBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG4qKiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcbioqIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC5cbioqIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZXG4qKiBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULFxuKiogVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEVcbioqIE1BVEVSSUFMUyBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBNQVRFUklBTFMuXG4qL1xuXG4vL1BvcnRlZCB0byBub2RlIGJ5IE1hcmNpbiBJZ25hYyBvbiAyMDE2LTA1LTIwXG5cbi8vIFZhcmlvdXMgZnVuY3Rpb25zIGZvciBoZWxwaW5nIGRlYnVnIFdlYkdMIGFwcHMuXG5cbldlYkdMRGVidWdVdGlscyA9IGZ1bmN0aW9uKCkge1xudmFyIHdpbmRvd1xuXG4vL3BvbHlmaWxsIHdpbmRvdyBpbiBub2RlXG5pZiAodHlwZW9mKHdpbmRvdykgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB3aW5kb3cgPSBnbG9iYWw7XG59XG5cbi8qKlxuICogV3JhcHBlZCBsb2dnaW5nIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtzdHJpbmd9IG1zZyBNZXNzYWdlIHRvIGxvZy5cbiAqL1xudmFyIGxvZyA9IGZ1bmN0aW9uKG1zZykge1xuICBpZiAod2luZG93LmNvbnNvbGUgJiYgd2luZG93LmNvbnNvbGUubG9nKSB7XG4gICAgd2luZG93LmNvbnNvbGUubG9nKG1zZyk7XG4gIH1cbn07XG5cbi8qKlxuICogV3JhcHBlZCBlcnJvciBsb2dnaW5nIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtzdHJpbmd9IG1zZyBNZXNzYWdlIHRvIGxvZy5cbiAqL1xudmFyIGVycm9yID0gZnVuY3Rpb24obXNnKSB7XG4gIGlmICh3aW5kb3cuY29uc29sZSAmJiB3aW5kb3cuY29uc29sZS5lcnJvcikge1xuICAgIHdpbmRvdy5jb25zb2xlLmVycm9yKG1zZyk7XG4gIH0gZWxzZSB7XG4gICAgbG9nKG1zZyk7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBXaGljaCBhcmd1bWVudHMgYXJlIGVudW1zIGJhc2VkIG9uIHRoZSBudW1iZXIgb2YgYXJndW1lbnRzIHRvIHRoZSBmdW5jdGlvbi5cbiAqIFNvXG4gKiAgICAndGV4SW1hZ2UyRCc6IHtcbiAqICAgICAgIDk6IHsgMDp0cnVlLCAyOnRydWUsIDY6dHJ1ZSwgNzp0cnVlIH0sXG4gKiAgICAgICA2OiB7IDA6dHJ1ZSwgMjp0cnVlLCAzOnRydWUsIDQ6dHJ1ZSB9LFxuICogICAgfSxcbiAqXG4gKiBtZWFucyBpZiB0aGVyZSBhcmUgOSBhcmd1bWVudHMgdGhlbiA2IGFuZCA3IGFyZSBlbnVtcywgaWYgdGhlcmUgYXJlIDZcbiAqIGFyZ3VtZW50cyAzIGFuZCA0IGFyZSBlbnVtc1xuICpcbiAqIEB0eXBlIHshT2JqZWN0LjxudW1iZXIsICFPYmplY3QuPG51bWJlciwgc3RyaW5nPn1cbiAqL1xudmFyIGdsVmFsaWRFbnVtQ29udGV4dHMgPSB7XG4gIC8vIEdlbmVyaWMgc2V0dGVycyBhbmQgZ2V0dGVyc1xuXG4gICdlbmFibGUnOiB7MTogeyAwOnRydWUgfX0sXG4gICdkaXNhYmxlJzogezE6IHsgMDp0cnVlIH19LFxuICAnZ2V0UGFyYW1ldGVyJzogezE6IHsgMDp0cnVlIH19LFxuXG4gIC8vIFJlbmRlcmluZ1xuXG4gICdkcmF3QXJyYXlzJzogezM6eyAwOnRydWUgfX0sXG4gICdkcmF3RWxlbWVudHMnOiB7NDp7IDA6dHJ1ZSwgMjp0cnVlIH19LFxuXG4gIC8vIFNoYWRlcnNcblxuICAnY3JlYXRlU2hhZGVyJzogezE6IHsgMDp0cnVlIH19LFxuICAnZ2V0U2hhZGVyUGFyYW1ldGVyJzogezI6IHsgMTp0cnVlIH19LFxuICAnZ2V0UHJvZ3JhbVBhcmFtZXRlcic6IHsyOiB7IDE6dHJ1ZSB9fSxcbiAgJ2dldFNoYWRlclByZWNpc2lvbkZvcm1hdCc6IHsyOiB7IDA6IHRydWUsIDE6dHJ1ZSB9fSxcblxuICAvLyBWZXJ0ZXggYXR0cmlidXRlc1xuXG4gICdnZXRWZXJ0ZXhBdHRyaWInOiB7MjogeyAxOnRydWUgfX0sXG4gICd2ZXJ0ZXhBdHRyaWJQb2ludGVyJzogezY6IHsgMjp0cnVlIH19LFxuXG4gIC8vIFRleHR1cmVzXG5cbiAgJ2JpbmRUZXh0dXJlJzogezI6IHsgMDp0cnVlIH19LFxuICAnYWN0aXZlVGV4dHVyZSc6IHsxOiB7IDA6dHJ1ZSB9fSxcbiAgJ2dldFRleFBhcmFtZXRlcic6IHsyOiB7IDA6dHJ1ZSwgMTp0cnVlIH19LFxuICAndGV4UGFyYW1ldGVyZic6IHszOiB7IDA6dHJ1ZSwgMTp0cnVlIH19LFxuICAndGV4UGFyYW1ldGVyaSc6IHszOiB7IDA6dHJ1ZSwgMTp0cnVlLCAyOnRydWUgfX0sXG4gIC8vIHRleEltYWdlMkQgYW5kIHRleFN1YkltYWdlMkQgYXJlIGRlZmluZWQgYmVsb3cgd2l0aCBXZWJHTCAyIGVudHJ5cG9pbnRzXG4gICdjb3B5VGV4SW1hZ2UyRCc6IHs4OiB7IDA6dHJ1ZSwgMjp0cnVlIH19LFxuICAnY29weVRleFN1YkltYWdlMkQnOiB7ODogeyAwOnRydWUgfX0sXG4gICdnZW5lcmF0ZU1pcG1hcCc6IHsxOiB7IDA6dHJ1ZSB9fSxcbiAgLy8gY29tcHJlc3NlZFRleEltYWdlMkQgYW5kIGNvbXByZXNzZWRUZXhTdWJJbWFnZTJEIGFyZSBkZWZpbmVkIGJlbG93IHdpdGggV2ViR0wgMiBlbnRyeXBvaW50c1xuXG4gIC8vIEJ1ZmZlciBvYmplY3RzXG5cbiAgJ2JpbmRCdWZmZXInOiB7MjogeyAwOnRydWUgfX0sXG4gIC8vIGJ1ZmZlckRhdGEgYW5kIGJ1ZmZlclN1YkRhdGEgYXJlIGRlZmluZWQgYmVsb3cgd2l0aCBXZWJHTCAyIGVudHJ5cG9pbnRzXG4gICdnZXRCdWZmZXJQYXJhbWV0ZXInOiB7MjogeyAwOnRydWUsIDE6dHJ1ZSB9fSxcblxuICAvLyBSZW5kZXJidWZmZXJzIGFuZCBmcmFtZWJ1ZmZlcnNcblxuICAncGl4ZWxTdG9yZWknOiB7MjogeyAwOnRydWUsIDE6dHJ1ZSB9fSxcbiAgLy8gcmVhZFBpeGVscyBpcyBkZWZpbmVkIGJlbG93IHdpdGggV2ViR0wgMiBlbnRyeXBvaW50c1xuICAnYmluZFJlbmRlcmJ1ZmZlcic6IHsyOiB7IDA6dHJ1ZSB9fSxcbiAgJ2JpbmRGcmFtZWJ1ZmZlcic6IHsyOiB7IDA6dHJ1ZSB9fSxcbiAgJ2NoZWNrRnJhbWVidWZmZXJTdGF0dXMnOiB7MTogeyAwOnRydWUgfX0sXG4gICdmcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcic6IHs0OiB7IDA6dHJ1ZSwgMTp0cnVlLCAyOnRydWUgfX0sXG4gICdmcmFtZWJ1ZmZlclRleHR1cmUyRCc6IHs1OiB7IDA6dHJ1ZSwgMTp0cnVlLCAyOnRydWUgfX0sXG4gICdnZXRGcmFtZWJ1ZmZlckF0dGFjaG1lbnRQYXJhbWV0ZXInOiB7MzogeyAwOnRydWUsIDE6dHJ1ZSwgMjp0cnVlIH19LFxuICAnZ2V0UmVuZGVyYnVmZmVyUGFyYW1ldGVyJzogezI6IHsgMDp0cnVlLCAxOnRydWUgfX0sXG4gICdyZW5kZXJidWZmZXJTdG9yYWdlJzogezQ6IHsgMDp0cnVlLCAxOnRydWUgfX0sXG5cbiAgLy8gRnJhbWUgYnVmZmVyIG9wZXJhdGlvbnMgKGNsZWFyLCBibGVuZCwgZGVwdGggdGVzdCwgc3RlbmNpbClcblxuICAnY2xlYXInOiB7MTogeyAwOiB7ICdlbnVtQml0d2lzZU9yJzogWydDT0xPUl9CVUZGRVJfQklUJywgJ0RFUFRIX0JVRkZFUl9CSVQnLCAnU1RFTkNJTF9CVUZGRVJfQklUJ10gfX19LFxuICAnZGVwdGhGdW5jJzogezE6IHsgMDp0cnVlIH19LFxuICAnYmxlbmRGdW5jJzogezI6IHsgMDp0cnVlLCAxOnRydWUgfX0sXG4gICdibGVuZEZ1bmNTZXBhcmF0ZSc6IHs0OiB7IDA6dHJ1ZSwgMTp0cnVlLCAyOnRydWUsIDM6dHJ1ZSB9fSxcbiAgJ2JsZW5kRXF1YXRpb24nOiB7MTogeyAwOnRydWUgfX0sXG4gICdibGVuZEVxdWF0aW9uU2VwYXJhdGUnOiB7MjogeyAwOnRydWUsIDE6dHJ1ZSB9fSxcbiAgJ3N0ZW5jaWxGdW5jJzogezM6IHsgMDp0cnVlIH19LFxuICAnc3RlbmNpbEZ1bmNTZXBhcmF0ZSc6IHs0OiB7IDA6dHJ1ZSwgMTp0cnVlIH19LFxuICAnc3RlbmNpbE1hc2tTZXBhcmF0ZSc6IHsyOiB7IDA6dHJ1ZSB9fSxcbiAgJ3N0ZW5jaWxPcCc6IHszOiB7IDA6dHJ1ZSwgMTp0cnVlLCAyOnRydWUgfX0sXG4gICdzdGVuY2lsT3BTZXBhcmF0ZSc6IHs0OiB7IDA6dHJ1ZSwgMTp0cnVlLCAyOnRydWUsIDM6dHJ1ZSB9fSxcblxuICAvLyBDdWxsaW5nXG5cbiAgJ2N1bGxGYWNlJzogezE6IHsgMDp0cnVlIH19LFxuICAnZnJvbnRGYWNlJzogezE6IHsgMDp0cnVlIH19LFxuXG4gIC8vIEFOR0xFX2luc3RhbmNlZF9hcnJheXMgZXh0ZW5zaW9uXG5cbiAgJ2RyYXdBcnJheXNJbnN0YW5jZWRBTkdMRSc6IHs0OiB7IDA6dHJ1ZSB9fSxcbiAgJ2RyYXdFbGVtZW50c0luc3RhbmNlZEFOR0xFJzogezU6IHsgMDp0cnVlLCAyOnRydWUgfX0sXG5cbiAgLy8gRVhUX2JsZW5kX21pbm1heCBleHRlbnNpb25cblxuICAnYmxlbmRFcXVhdGlvbkVYVCc6IHsxOiB7IDA6dHJ1ZSB9fSxcblxuICAvLyBXZWJHTCAyIEJ1ZmZlciBvYmplY3RzXG5cbiAgJ2J1ZmZlckRhdGEnOiB7XG4gICAgMzogeyAwOnRydWUsIDI6dHJ1ZSB9LCAvLyBXZWJHTCAxXG4gICAgNDogeyAwOnRydWUsIDI6dHJ1ZSB9LCAvLyBXZWJHTCAyXG4gICAgNTogeyAwOnRydWUsIDI6dHJ1ZSB9ICAvLyBXZWJHTCAyXG4gIH0sXG4gICdidWZmZXJTdWJEYXRhJzoge1xuICAgIDM6IHsgMDp0cnVlIH0sIC8vIFdlYkdMIDFcbiAgICA0OiB7IDA6dHJ1ZSB9LCAvLyBXZWJHTCAyXG4gICAgNTogeyAwOnRydWUgfSAgLy8gV2ViR0wgMlxuICB9LFxuICAnY29weUJ1ZmZlclN1YkRhdGEnOiB7NTogeyAwOnRydWUsIDE6dHJ1ZSB9fSxcbiAgJ2dldEJ1ZmZlclN1YkRhdGEnOiB7MzogeyAwOnRydWUgfSwgNDogeyAwOnRydWUgfSwgNTogeyAwOnRydWUgfX0sXG5cbiAgLy8gV2ViR0wgMiBGcmFtZWJ1ZmZlciBvYmplY3RzXG5cbiAgJ2JsaXRGcmFtZWJ1ZmZlcic6IHsxMDogeyA4OiB7ICdlbnVtQml0d2lzZU9yJzogWydDT0xPUl9CVUZGRVJfQklUJywgJ0RFUFRIX0JVRkZFUl9CSVQnLCAnU1RFTkNJTF9CVUZGRVJfQklUJ10gfSwgOTp0cnVlIH19LFxuICAnZnJhbWVidWZmZXJUZXh0dXJlTGF5ZXInOiB7NTogeyAwOnRydWUsIDE6dHJ1ZSB9fSxcbiAgJ2ludmFsaWRhdGVGcmFtZWJ1ZmZlcic6IHsyOiB7IDA6dHJ1ZSB9fSxcbiAgJ2ludmFsaWRhdGVTdWJGcmFtZWJ1ZmZlcic6IHs2OiB7IDA6dHJ1ZSB9fSxcbiAgJ3JlYWRCdWZmZXInOiB7MTogeyAwOnRydWUgfX0sXG5cbiAgLy8gV2ViR0wgMiBSZW5kZXJidWZmZXIgb2JqZWN0c1xuXG4gICdnZXRJbnRlcm5hbGZvcm1hdFBhcmFtZXRlcic6IHszOiB7IDA6dHJ1ZSwgMTp0cnVlLCAyOnRydWUgfX0sXG4gICdyZW5kZXJidWZmZXJTdG9yYWdlTXVsdGlzYW1wbGUnOiB7NTogeyAwOnRydWUsIDI6dHJ1ZSB9fSxcblxuICAvLyBXZWJHTCAyIFRleHR1cmUgb2JqZWN0c1xuXG4gICd0ZXhTdG9yYWdlMkQnOiB7NTogeyAwOnRydWUsIDI6dHJ1ZSB9fSxcbiAgJ3RleFN0b3JhZ2UzRCc6IHs2OiB7IDA6dHJ1ZSwgMjp0cnVlIH19LFxuICAndGV4SW1hZ2UyRCc6IHtcbiAgICA5OiB7IDA6dHJ1ZSwgMjp0cnVlLCA2OnRydWUsIDc6dHJ1ZSB9LCAvLyBXZWJHTCAxICYgMlxuICAgIDY6IHsgMDp0cnVlLCAyOnRydWUsIDM6dHJ1ZSwgNDp0cnVlIH0sIC8vIFdlYkdMIDFcbiAgICAxMDogeyAwOnRydWUsIDI6dHJ1ZSwgNjp0cnVlLCA3OnRydWUgfSAvLyBXZWJHTCAyXG4gIH0sXG4gICd0ZXhJbWFnZTNEJzoge1xuICAgIDEwOiB7IDA6dHJ1ZSwgMjp0cnVlLCA3OnRydWUsIDg6dHJ1ZSB9LFxuICAgIDExOiB7IDA6dHJ1ZSwgMjp0cnVlLCA3OnRydWUsIDg6dHJ1ZSB9XG4gIH0sXG4gICd0ZXhTdWJJbWFnZTJEJzoge1xuICAgIDk6IHsgMDp0cnVlLCA2OnRydWUsIDc6dHJ1ZSB9LCAvLyBXZWJHTCAxICYgMlxuICAgIDc6IHsgMDp0cnVlLCA0OnRydWUsIDU6dHJ1ZSB9LCAvLyBXZWJHTCAxXG4gICAgMTA6IHsgMDp0cnVlLCA2OnRydWUsIDc6dHJ1ZSB9IC8vIFdlYkdMIDJcbiAgfSxcbiAgJ3RleFN1YkltYWdlM0QnOiB7XG4gICAgMTE6IHsgMDp0cnVlLCA4OnRydWUsIDk6dHJ1ZSB9LFxuICAgIDEyOiB7IDA6dHJ1ZSwgODp0cnVlLCA5OnRydWUgfVxuICB9LFxuICAnY29weVRleFN1YkltYWdlM0QnOiB7OTogeyAwOnRydWUgfX0sXG4gICdjb21wcmVzc2VkVGV4SW1hZ2UyRCc6IHtcbiAgICA3OiB7IDA6IHRydWUsIDI6dHJ1ZSB9LCAvLyBXZWJHTCAxICYgMlxuICAgIDg6IHsgMDogdHJ1ZSwgMjp0cnVlIH0sIC8vIFdlYkdMIDJcbiAgICA5OiB7IDA6IHRydWUsIDI6dHJ1ZSB9ICAvLyBXZWJHTCAyXG4gIH0sXG4gICdjb21wcmVzc2VkVGV4SW1hZ2UzRCc6IHtcbiAgICA4OiB7IDA6IHRydWUsIDI6dHJ1ZSB9LFxuICAgIDk6IHsgMDogdHJ1ZSwgMjp0cnVlIH0sXG4gICAgMTA6IHsgMDogdHJ1ZSwgMjp0cnVlIH1cbiAgfSxcbiAgJ2NvbXByZXNzZWRUZXhTdWJJbWFnZTJEJzoge1xuICAgIDg6IHsgMDogdHJ1ZSwgNjp0cnVlIH0sIC8vIFdlYkdMIDEgJiAyXG4gICAgOTogeyAwOiB0cnVlLCA2OnRydWUgfSwgLy8gV2ViR0wgMlxuICAgIDEwOiB7IDA6IHRydWUsIDY6dHJ1ZSB9IC8vIFdlYkdMIDJcbiAgfSxcbiAgJ2NvbXByZXNzZWRUZXhTdWJJbWFnZTNEJzoge1xuICAgIDEwOiB7IDA6IHRydWUsIDg6dHJ1ZSB9LFxuICAgIDExOiB7IDA6IHRydWUsIDg6dHJ1ZSB9LFxuICAgIDEyOiB7IDA6IHRydWUsIDg6dHJ1ZSB9XG4gIH0sXG5cbiAgLy8gV2ViR0wgMiBWZXJ0ZXggYXR0cmlic1xuXG4gICd2ZXJ0ZXhBdHRyaWJJUG9pbnRlcic6IHs1OiB7IDI6dHJ1ZSB9fSxcblxuICAvLyBXZWJHTCAyIFdyaXRpbmcgdG8gdGhlIGRyYXdpbmcgYnVmZmVyXG5cbiAgJ2RyYXdBcnJheXNJbnN0YW5jZWQnOiB7NDogeyAwOnRydWUgfX0sXG4gICdkcmF3RWxlbWVudHNJbnN0YW5jZWQnOiB7NTogeyAwOnRydWUsIDI6dHJ1ZSB9fSxcbiAgJ2RyYXdSYW5nZUVsZW1lbnRzJzogezY6IHsgMDp0cnVlLCA0OnRydWUgfX0sXG5cbiAgLy8gV2ViR0wgMiBSZWFkaW5nIGJhY2sgcGl4ZWxzXG5cbiAgJ3JlYWRQaXhlbHMnOiB7XG4gICAgNzogeyA0OnRydWUsIDU6dHJ1ZSB9LCAvLyBXZWJHTCAxICYgMlxuICAgIDg6IHsgNDp0cnVlLCA1OnRydWUgfSAgLy8gV2ViR0wgMlxuICB9LFxuXG4gIC8vIFdlYkdMIDIgTXVsdGlwbGUgUmVuZGVyIFRhcmdldHNcblxuICAnY2xlYXJCdWZmZXJmdic6IHszOiB7IDA6dHJ1ZSB9LCA0OiB7IDA6dHJ1ZSB9fSxcbiAgJ2NsZWFyQnVmZmVyaXYnOiB7MzogeyAwOnRydWUgfSwgNDogeyAwOnRydWUgfX0sXG4gICdjbGVhckJ1ZmZlcnVpdic6IHszOiB7IDA6dHJ1ZSB9LCA0OiB7IDA6dHJ1ZSB9fSxcbiAgJ2NsZWFyQnVmZmVyZmknOiB7NDogeyAwOnRydWUgfX0sXG5cbiAgLy8gV2ViR0wgMiBRdWVyeSBvYmplY3RzXG5cbiAgJ2JlZ2luUXVlcnknOiB7MjogeyAwOnRydWUgfX0sXG4gICdlbmRRdWVyeSc6IHsxOiB7IDA6dHJ1ZSB9fSxcbiAgJ2dldFF1ZXJ5JzogezI6IHsgMDp0cnVlLCAxOnRydWUgfX0sXG4gICdnZXRRdWVyeVBhcmFtZXRlcic6IHsyOiB7IDE6dHJ1ZSB9fSxcblxuICAvLyBXZWJHTCAyIFNhbXBsZXIgb2JqZWN0c1xuXG4gICdzYW1wbGVyUGFyYW1ldGVyaSc6IHszOiB7IDE6dHJ1ZSwgMjp0cnVlIH19LFxuICAnc2FtcGxlclBhcmFtZXRlcmYnOiB7MzogeyAxOnRydWUgfX0sXG4gICdnZXRTYW1wbGVyUGFyYW1ldGVyJzogezI6IHsgMTp0cnVlIH19LFxuXG4gIC8vIFdlYkdMIDIgU3luYyBvYmplY3RzXG5cbiAgJ2ZlbmNlU3luYyc6IHsyOiB7IDA6dHJ1ZSwgMTogeyAnZW51bUJpdHdpc2VPcic6IFtdIH0gfX0sXG4gICdjbGllbnRXYWl0U3luYyc6IHszOiB7IDE6IHsgJ2VudW1CaXR3aXNlT3InOiBbJ1NZTkNfRkxVU0hfQ09NTUFORFNfQklUJ10gfSB9fSxcbiAgJ3dhaXRTeW5jJzogezM6IHsgMTogeyAnZW51bUJpdHdpc2VPcic6IFtdIH0gfX0sXG4gICdnZXRTeW5jUGFyYW1ldGVyJzogezI6IHsgMTp0cnVlIH19LFxuXG4gIC8vIFdlYkdMIDIgVHJhbnNmb3JtIEZlZWRiYWNrXG5cbiAgJ2JpbmRUcmFuc2Zvcm1GZWVkYmFjayc6IHsyOiB7IDA6dHJ1ZSB9fSxcbiAgJ2JlZ2luVHJhbnNmb3JtRmVlZGJhY2snOiB7MTogeyAwOnRydWUgfX0sXG4gICd0cmFuc2Zvcm1GZWVkYmFja1ZhcnlpbmdzJzogezM6IHsgMjp0cnVlIH19LFxuXG4gIC8vIFdlYkdMMiBVbmlmb3JtIEJ1ZmZlciBPYmplY3RzIGFuZCBUcmFuc2Zvcm0gRmVlZGJhY2sgQnVmZmVyc1xuXG4gICdiaW5kQnVmZmVyQmFzZSc6IHszOiB7IDA6dHJ1ZSB9fSxcbiAgJ2JpbmRCdWZmZXJSYW5nZSc6IHs1OiB7IDA6dHJ1ZSB9fSxcbiAgJ2dldEluZGV4ZWRQYXJhbWV0ZXInOiB7MjogeyAwOnRydWUgfX0sXG4gICdnZXRBY3RpdmVVbmlmb3Jtcyc6IHszOiB7IDI6dHJ1ZSB9fSxcbiAgJ2dldEFjdGl2ZVVuaWZvcm1CbG9ja1BhcmFtZXRlcic6IHszOiB7IDI6dHJ1ZSB9fVxufTtcblxuLyoqXG4gKiBNYXAgb2YgbnVtYmVycyB0byBuYW1lcy5cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbnZhciBnbEVudW1zID0gbnVsbDtcblxuLyoqXG4gKiBNYXAgb2YgbmFtZXMgdG8gbnVtYmVycy5cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbnZhciBlbnVtU3RyaW5nVG9WYWx1ZSA9IG51bGw7XG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgdGhpcyBtb2R1bGUuIFNhZmUgdG8gY2FsbCBtb3JlIHRoYW4gb25jZS5cbiAqIEBwYXJhbSB7IVdlYkdMUmVuZGVyaW5nQ29udGV4dH0gY3R4IEEgV2ViR0wgY29udGV4dC4gSWZcbiAqICAgIHlvdSBoYXZlIG1vcmUgdGhhbiBvbmUgY29udGV4dCBpdCBkb2Vzbid0IG1hdHRlciB3aGljaCBvbmVcbiAqICAgIHlvdSBwYXNzIGluLCBpdCBpcyBvbmx5IHVzZWQgdG8gcHVsbCBvdXQgY29uc3RhbnRzLlxuICovXG5mdW5jdGlvbiBpbml0KGN0eCkge1xuICBpZiAoZ2xFbnVtcyA9PSBudWxsKSB7XG4gICAgZ2xFbnVtcyA9IHsgfTtcbiAgICBlbnVtU3RyaW5nVG9WYWx1ZSA9IHsgfTtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eU5hbWUgaW4gY3R4KSB7XG4gICAgICBpZiAodHlwZW9mIGN0eFtwcm9wZXJ0eU5hbWVdID09ICdudW1iZXInKSB7XG4gICAgICAgIGdsRW51bXNbY3R4W3Byb3BlcnR5TmFtZV1dID0gcHJvcGVydHlOYW1lO1xuICAgICAgICBlbnVtU3RyaW5nVG9WYWx1ZVtwcm9wZXJ0eU5hbWVdID0gY3R4W3Byb3BlcnR5TmFtZV07XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ2hlY2tzIHRoZSB1dGlscyBoYXZlIGJlZW4gaW5pdGlhbGl6ZWQuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrSW5pdCgpIHtcbiAgaWYgKGdsRW51bXMgPT0gbnVsbCkge1xuICAgIHRocm93ICdXZWJHTERlYnVnVXRpbHMuaW5pdChjdHgpIG5vdCBjYWxsZWQnO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIG9yIGZhbHNlIGlmIHZhbHVlIG1hdGNoZXMgYW55IFdlYkdMIGVudW1cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVmFsdWUgdG8gY2hlY2sgaWYgaXQgbWlnaHQgYmUgYW4gZW51bS5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgbWF0Y2hlcyBvbmUgb2YgdGhlIFdlYkdMIGRlZmluZWQgZW51bXNcbiAqL1xuZnVuY3Rpb24gbWlnaHRCZUVudW0odmFsdWUpIHtcbiAgY2hlY2tJbml0KCk7XG4gIHJldHVybiAoZ2xFbnVtc1t2YWx1ZV0gIT09IHVuZGVmaW5lZCk7XG59XG5cbi8qKlxuICogR2V0cyBhbiBzdHJpbmcgdmVyc2lvbiBvZiBhbiBXZWJHTCBlbnVtLlxuICpcbiAqIEV4YW1wbGU6XG4gKiAgIHZhciBzdHIgPSBXZWJHTERlYnVnVXRpbC5nbEVudW1Ub1N0cmluZyhjdHguZ2V0RXJyb3IoKSk7XG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIFZhbHVlIHRvIHJldHVybiBhbiBlbnVtIGZvclxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgc3RyaW5nIHZlcnNpb24gb2YgdGhlIGVudW0uXG4gKi9cbmZ1bmN0aW9uIGdsRW51bVRvU3RyaW5nKHZhbHVlKSB7XG4gIGNoZWNrSW5pdCgpO1xuICB2YXIgbmFtZSA9IGdsRW51bXNbdmFsdWVdO1xuICByZXR1cm4gKG5hbWUgIT09IHVuZGVmaW5lZCkgPyAoXCJnbC5cIiArIG5hbWUpIDpcbiAgICAgIChcIi8qVU5LTk9XTiBXZWJHTCBFTlVNKi8gMHhcIiArIHZhbHVlLnRvU3RyaW5nKDE2KSArIFwiXCIpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHN0cmluZyB2ZXJzaW9uIG9mIGEgV2ViR0wgYXJndW1lbnQuXG4gKiBBdHRlbXB0cyB0byBjb252ZXJ0IGVudW0gYXJndW1lbnRzIHRvIHN0cmluZ3MuXG4gKiBAcGFyYW0ge3N0cmluZ30gZnVuY3Rpb25OYW1lIHRoZSBuYW1lIG9mIHRoZSBXZWJHTCBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1BcmdzIHRoZSBudW1iZXIgb2YgYXJndW1lbnRzIHBhc3NlZCB0byB0aGUgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gYXJndW1lbnRJbmR4IHRoZSBpbmRleCBvZiB0aGUgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSBvZiB0aGUgYXJndW1lbnQuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSB2YWx1ZSBhcyBhIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gZ2xGdW5jdGlvbkFyZ1RvU3RyaW5nKGZ1bmN0aW9uTmFtZSwgbnVtQXJncywgYXJndW1lbnRJbmRleCwgdmFsdWUpIHtcbiAgdmFyIGZ1bmNJbmZvID0gZ2xWYWxpZEVudW1Db250ZXh0c1tmdW5jdGlvbk5hbWVdO1xuICBpZiAoZnVuY0luZm8gIT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBmdW5jSW5mbyA9IGZ1bmNJbmZvW251bUFyZ3NdO1xuICAgIGlmIChmdW5jSW5mbyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoZnVuY0luZm9bYXJndW1lbnRJbmRleF0pIHtcbiAgICAgICAgaWYgKHR5cGVvZiBmdW5jSW5mb1thcmd1bWVudEluZGV4XSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAgIGZ1bmNJbmZvW2FyZ3VtZW50SW5kZXhdWydlbnVtQml0d2lzZU9yJ10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHZhciBlbnVtcyA9IGZ1bmNJbmZvW2FyZ3VtZW50SW5kZXhdWydlbnVtQml0d2lzZU9yJ107XG4gICAgICAgICAgdmFyIG9yUmVzdWx0ID0gMDtcbiAgICAgICAgICB2YXIgb3JFbnVtcyA9IFtdO1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZW51bXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBlbnVtVmFsdWUgPSBlbnVtU3RyaW5nVG9WYWx1ZVtlbnVtc1tpXV07XG4gICAgICAgICAgICBpZiAoKHZhbHVlICYgZW51bVZhbHVlKSAhPT0gMCkge1xuICAgICAgICAgICAgICBvclJlc3VsdCB8PSBlbnVtVmFsdWU7XG4gICAgICAgICAgICAgIG9yRW51bXMucHVzaChnbEVudW1Ub1N0cmluZyhlbnVtVmFsdWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG9yUmVzdWx0ID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIG9yRW51bXMuam9pbignIHwgJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBnbEVudW1Ub1N0cmluZyh2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBnbEVudW1Ub1N0cmluZyh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIFwibnVsbFwiO1xuICB9IGVsc2UgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gXCJ1bmRlZmluZWRcIjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnRzIHRoZSBhcmd1bWVudHMgb2YgYSBXZWJHTCBmdW5jdGlvbiB0byBhIHN0cmluZy5cbiAqIEF0dGVtcHRzIHRvIGNvbnZlcnQgZW51bSBhcmd1bWVudHMgdG8gc3RyaW5ncy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZnVuY3Rpb25OYW1lIHRoZSBuYW1lIG9mIHRoZSBXZWJHTCBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7bnVtYmVyfSBhcmdzIFRoZSBhcmd1bWVudHMuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBhcmd1bWVudHMgYXMgYSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGdsRnVuY3Rpb25BcmdzVG9TdHJpbmcoZnVuY3Rpb25OYW1lLCBhcmdzKSB7XG4gIC8vIGFwcGFyZW50bHkgd2UgY2FuJ3QgZG8gYXJncy5qb2luKFwiLFwiKTtcbiAgdmFyIGFyZ1N0ciA9IFwiXCI7XG4gIHZhciBudW1BcmdzID0gYXJncy5sZW5ndGg7XG4gIGZvciAodmFyIGlpID0gMDsgaWkgPCBudW1BcmdzOyArK2lpKSB7XG4gICAgYXJnU3RyICs9ICgoaWkgPT0gMCkgPyAnJyA6ICcsICcpICtcbiAgICAgICAgZ2xGdW5jdGlvbkFyZ1RvU3RyaW5nKGZ1bmN0aW9uTmFtZSwgbnVtQXJncywgaWksIGFyZ3NbaWldKTtcbiAgfVxuICByZXR1cm4gYXJnU3RyO1xufTtcblxuXG5mdW5jdGlvbiBtYWtlUHJvcGVydHlXcmFwcGVyKHdyYXBwZXIsIG9yaWdpbmFsLCBwcm9wZXJ0eU5hbWUpIHtcbiAgLy9sb2coXCJ3cmFwIHByb3A6IFwiICsgcHJvcGVydHlOYW1lKTtcbiAgd3JhcHBlci5fX2RlZmluZUdldHRlcl9fKHByb3BlcnR5TmFtZSwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG9yaWdpbmFsW3Byb3BlcnR5TmFtZV07XG4gIH0pO1xuICAvLyBUT0RPKGdtYW5lKTogdGhpcyBuZWVkcyB0byBoYW5kbGUgcHJvcGVydGllcyB0aGF0IHRha2UgbW9yZSB0aGFuXG4gIC8vIG9uZSB2YWx1ZT9cbiAgd3JhcHBlci5fX2RlZmluZVNldHRlcl9fKHByb3BlcnR5TmFtZSwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAvL2xvZyhcInNldDogXCIgKyBwcm9wZXJ0eU5hbWUpO1xuICAgIG9yaWdpbmFsW3Byb3BlcnR5TmFtZV0gPSB2YWx1ZTtcbiAgfSk7XG59XG5cbi8vIE1ha2VzIGEgZnVuY3Rpb24gdGhhdCBjYWxscyBhIGZ1bmN0aW9uIG9uIGFub3RoZXIgb2JqZWN0LlxuZnVuY3Rpb24gbWFrZUZ1bmN0aW9uV3JhcHBlcihvcmlnaW5hbCwgZnVuY3Rpb25OYW1lKSB7XG4gIC8vbG9nKFwid3JhcCBmbjogXCIgKyBmdW5jdGlvbk5hbWUpO1xuICB2YXIgZiA9IG9yaWdpbmFsW2Z1bmN0aW9uTmFtZV07XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAvL2xvZyhcImNhbGw6IFwiICsgZnVuY3Rpb25OYW1lKTtcbiAgICB2YXIgcmVzdWx0ID0gZi5hcHBseShvcmlnaW5hbCwgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuXG4vKipcbiAqIEdpdmVuIGEgV2ViR0wgY29udGV4dCByZXR1cm5zIGEgd3JhcHBlZCBjb250ZXh0IHRoYXQgY2FsbHNcbiAqIGdsLmdldEVycm9yIGFmdGVyIGV2ZXJ5IGNvbW1hbmQgYW5kIGNhbGxzIGEgZnVuY3Rpb24gaWYgdGhlXG4gKiByZXN1bHQgaXMgbm90IGdsLk5PX0VSUk9SLlxuICpcbiAqIEBwYXJhbSB7IVdlYkdMUmVuZGVyaW5nQ29udGV4dH0gY3R4IFRoZSB3ZWJnbCBjb250ZXh0IHRvXG4gKiAgICAgICAgd3JhcC5cbiAqIEBwYXJhbSB7IWZ1bmN0aW9uKGVyciwgZnVuY05hbWUsIGFyZ3MpOiB2b2lkfSBvcHRfb25FcnJvckZ1bmNcbiAqICAgICAgICBUaGUgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIGdsLmdldEVycm9yIHJldHVybnMgYW5cbiAqICAgICAgICBlcnJvci4gSWYgbm90IHNwZWNpZmllZCB0aGUgZGVmYXVsdCBmdW5jdGlvbiBjYWxsc1xuICogICAgICAgIGNvbnNvbGUubG9nIHdpdGggYSBtZXNzYWdlLlxuICogQHBhcmFtIHshZnVuY3Rpb24oZnVuY05hbWUsIGFyZ3MpOiB2b2lkfSBvcHRfb25GdW5jIFRoZVxuICogICAgICAgIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBlYWNoIHdlYmdsIGZ1bmN0aW9uIGlzIGNhbGxlZC5cbiAqICAgICAgICBZb3UgY2FuIHVzZSB0aGlzIHRvIGxvZyBhbGwgY2FsbHMgZm9yIGV4YW1wbGUuXG4gKiBAcGFyYW0geyFXZWJHTFJlbmRlcmluZ0NvbnRleHR9IG9wdF9lcnJfY3R4IFRoZSB3ZWJnbCBjb250ZXh0XG4gKiAgICAgICAgdG8gY2FsbCBnZXRFcnJvciBvbiBpZiBkaWZmZXJlbnQgdGhhbiBjdHguXG4gKi9cbmZ1bmN0aW9uIG1ha2VEZWJ1Z0NvbnRleHQoY3R4LCBvcHRfb25FcnJvckZ1bmMsIG9wdF9vbkZ1bmMsIG9wdF9lcnJfY3R4KSB7XG4gIG9wdF9lcnJfY3R4ID0gb3B0X2Vycl9jdHggfHwgY3R4O1xuICBpbml0KGN0eCk7XG4gIG9wdF9vbkVycm9yRnVuYyA9IG9wdF9vbkVycm9yRnVuYyB8fCBmdW5jdGlvbihlcnIsIGZ1bmN0aW9uTmFtZSwgYXJncykge1xuICAgICAgICAvLyBhcHBhcmVudGx5IHdlIGNhbid0IGRvIGFyZ3Muam9pbihcIixcIik7XG4gICAgICAgIHZhciBhcmdTdHIgPSBcIlwiO1xuICAgICAgICB2YXIgbnVtQXJncyA9IGFyZ3MubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgbnVtQXJnczsgKytpaSkge1xuICAgICAgICAgIGFyZ1N0ciArPSAoKGlpID09IDApID8gJycgOiAnLCAnKSArXG4gICAgICAgICAgICAgIGdsRnVuY3Rpb25BcmdUb1N0cmluZyhmdW5jdGlvbk5hbWUsIG51bUFyZ3MsIGlpLCBhcmdzW2lpXSk7XG4gICAgICAgIH1cbiAgICAgICAgZXJyb3IoXCJXZWJHTCBlcnJvciBcIisgZ2xFbnVtVG9TdHJpbmcoZXJyKSArIFwiIGluIFwiKyBmdW5jdGlvbk5hbWUgK1xuICAgICAgICAgICAgICBcIihcIiArIGFyZ1N0ciArIFwiKVwiKTtcbiAgICAgIH07XG5cbiAgLy8gSG9sZHMgYm9vbGVhbnMgZm9yIGVhY2ggR0wgZXJyb3Igc28gYWZ0ZXIgd2UgZ2V0IHRoZSBlcnJvciBvdXJzZWx2ZXNcbiAgLy8gd2UgY2FuIHN0aWxsIHJldHVybiBpdCB0byB0aGUgY2xpZW50IGFwcC5cbiAgdmFyIGdsRXJyb3JTaGFkb3cgPSB7IH07XG5cbiAgLy8gTWFrZXMgYSBmdW5jdGlvbiB0aGF0IGNhbGxzIGEgV2ViR0wgZnVuY3Rpb24gYW5kIHRoZW4gY2FsbHMgZ2V0RXJyb3IuXG4gIGZ1bmN0aW9uIG1ha2VFcnJvcldyYXBwZXIoY3R4LCBmdW5jdGlvbk5hbWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAob3B0X29uRnVuYykge1xuICAgICAgICBvcHRfb25GdW5jKGZ1bmN0aW9uTmFtZSwgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICAgIHZhciByZXN1bHQgPSBjdHhbZnVuY3Rpb25OYW1lXS5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG4gICAgICB2YXIgZXJyID0gb3B0X2Vycl9jdHguZ2V0RXJyb3IoKTtcbiAgICAgIGlmIChlcnIgIT0gMCkge1xuICAgICAgICBnbEVycm9yU2hhZG93W2Vycl0gPSB0cnVlO1xuICAgICAgICBvcHRfb25FcnJvckZ1bmMoZXJyLCBmdW5jdGlvbk5hbWUsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH1cblxuICAvLyBNYWtlIGEgYW4gb2JqZWN0IHRoYXQgaGFzIGEgY29weSBvZiBldmVyeSBwcm9wZXJ0eSBvZiB0aGUgV2ViR0wgY29udGV4dFxuICAvLyBidXQgd3JhcHMgYWxsIGZ1bmN0aW9ucy5cbiAgdmFyIHdyYXBwZXIgPSB7fTtcbiAgZm9yICh2YXIgcHJvcGVydHlOYW1lIGluIGN0eCkge1xuICAgIGlmICh0eXBlb2YgY3R4W3Byb3BlcnR5TmFtZV0gPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKHByb3BlcnR5TmFtZSAhPSAnZ2V0RXh0ZW5zaW9uJykge1xuICAgICAgICB3cmFwcGVyW3Byb3BlcnR5TmFtZV0gPSBtYWtlRXJyb3JXcmFwcGVyKGN0eCwgcHJvcGVydHlOYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB3cmFwcGVkID0gbWFrZUVycm9yV3JhcHBlcihjdHgsIHByb3BlcnR5TmFtZSk7XG4gICAgICAgIHdyYXBwZXJbcHJvcGVydHlOYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0ID0gd3JhcHBlZC5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbWFrZURlYnVnQ29udGV4dChyZXN1bHQsIG9wdF9vbkVycm9yRnVuYywgb3B0X29uRnVuYywgb3B0X2Vycl9jdHgpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBtYWtlUHJvcGVydHlXcmFwcGVyKHdyYXBwZXIsIGN0eCwgcHJvcGVydHlOYW1lKTtcbiAgICB9XG4gIH1cblxuICAvLyBPdmVycmlkZSB0aGUgZ2V0RXJyb3IgZnVuY3Rpb24gd2l0aCBvbmUgdGhhdCByZXR1cm5zIG91ciBzYXZlZCByZXN1bHRzLlxuICB3cmFwcGVyLmdldEVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgZXJyIGluIGdsRXJyb3JTaGFkb3cpIHtcbiAgICAgIGlmIChnbEVycm9yU2hhZG93Lmhhc093blByb3BlcnR5KGVycikpIHtcbiAgICAgICAgaWYgKGdsRXJyb3JTaGFkb3dbZXJyXSkge1xuICAgICAgICAgIGdsRXJyb3JTaGFkb3dbZXJyXSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBlcnI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGN0eC5OT19FUlJPUjtcbiAgfTtcblxuICByZXR1cm4gd3JhcHBlcjtcbn1cblxuZnVuY3Rpb24gcmVzZXRUb0luaXRpYWxTdGF0ZShjdHgpIHtcbiAgdmFyIGlzV2ViR0wyUmVuZGVyaW5nQ29udGV4dCA9ICEhY3R4LmNyZWF0ZVRyYW5zZm9ybUZlZWRiYWNrO1xuXG4gIGlmIChpc1dlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICBjdHguYmluZFZlcnRleEFycmF5KG51bGwpO1xuICB9XG5cbiAgdmFyIG51bUF0dHJpYnMgPSBjdHguZ2V0UGFyYW1ldGVyKGN0eC5NQVhfVkVSVEVYX0FUVFJJQlMpO1xuICB2YXIgdG1wID0gY3R4LmNyZWF0ZUJ1ZmZlcigpO1xuICBjdHguYmluZEJ1ZmZlcihjdHguQVJSQVlfQlVGRkVSLCB0bXApO1xuICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgbnVtQXR0cmliczsgKytpaSkge1xuICAgIGN0eC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkoaWkpO1xuICAgIGN0eC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGlpLCA0LCBjdHguRkxPQVQsIGZhbHNlLCAwLCAwKTtcbiAgICBjdHgudmVydGV4QXR0cmliMWYoaWksIDApO1xuICAgIGlmIChpc1dlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICAgIGN0eC52ZXJ0ZXhBdHRyaWJEaXZpc29yKGlpLCAwKTtcbiAgICB9XG4gIH1cbiAgY3R4LmRlbGV0ZUJ1ZmZlcih0bXApO1xuXG4gIHZhciBudW1UZXh0dXJlVW5pdHMgPSBjdHguZ2V0UGFyYW1ldGVyKGN0eC5NQVhfVEVYVFVSRV9JTUFHRV9VTklUUyk7XG4gIGZvciAodmFyIGlpID0gMDsgaWkgPCBudW1UZXh0dXJlVW5pdHM7ICsraWkpIHtcbiAgICBjdHguYWN0aXZlVGV4dHVyZShjdHguVEVYVFVSRTAgKyBpaSk7XG4gICAgY3R4LmJpbmRUZXh0dXJlKGN0eC5URVhUVVJFX0NVQkVfTUFQLCBudWxsKTtcbiAgICBjdHguYmluZFRleHR1cmUoY3R4LlRFWFRVUkVfMkQsIG51bGwpO1xuICAgIGlmIChpc1dlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICAgIGN0eC5iaW5kVGV4dHVyZShjdHguVEVYVFVSRV8yRF9BUlJBWSwgbnVsbCk7XG4gICAgICBjdHguYmluZFRleHR1cmUoY3R4LlRFWFRVUkVfM0QsIG51bGwpO1xuICAgICAgY3R4LmJpbmRTYW1wbGVyKGlpLCBudWxsKTtcbiAgICB9XG4gIH1cblxuICBjdHguYWN0aXZlVGV4dHVyZShjdHguVEVYVFVSRTApO1xuICBjdHgudXNlUHJvZ3JhbShudWxsKTtcbiAgY3R4LmJpbmRCdWZmZXIoY3R4LkFSUkFZX0JVRkZFUiwgbnVsbCk7XG4gIGN0eC5iaW5kQnVmZmVyKGN0eC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbnVsbCk7XG4gIGN0eC5iaW5kRnJhbWVidWZmZXIoY3R4LkZSQU1FQlVGRkVSLCBudWxsKTtcbiAgY3R4LmJpbmRSZW5kZXJidWZmZXIoY3R4LlJFTkRFUkJVRkZFUiwgbnVsbCk7XG4gIGN0eC5kaXNhYmxlKGN0eC5CTEVORCk7XG4gIGN0eC5kaXNhYmxlKGN0eC5DVUxMX0ZBQ0UpO1xuICBjdHguZGlzYWJsZShjdHguREVQVEhfVEVTVCk7XG4gIGN0eC5kaXNhYmxlKGN0eC5ESVRIRVIpO1xuICBjdHguZGlzYWJsZShjdHguU0NJU1NPUl9URVNUKTtcbiAgY3R4LmJsZW5kQ29sb3IoMCwgMCwgMCwgMCk7XG4gIGN0eC5ibGVuZEVxdWF0aW9uKGN0eC5GVU5DX0FERCk7XG4gIGN0eC5ibGVuZEZ1bmMoY3R4Lk9ORSwgY3R4LlpFUk8pO1xuICBjdHguY2xlYXJDb2xvcigwLCAwLCAwLCAwKTtcbiAgY3R4LmNsZWFyRGVwdGgoMSk7XG4gIGN0eC5jbGVhclN0ZW5jaWwoLTEpO1xuICBjdHguY29sb3JNYXNrKHRydWUsIHRydWUsIHRydWUsIHRydWUpO1xuICBjdHguY3VsbEZhY2UoY3R4LkJBQ0spO1xuICBjdHguZGVwdGhGdW5jKGN0eC5MRVNTKTtcbiAgY3R4LmRlcHRoTWFzayh0cnVlKTtcbiAgY3R4LmRlcHRoUmFuZ2UoMCwgMSk7XG4gIGN0eC5mcm9udEZhY2UoY3R4LkNDVyk7XG4gIGN0eC5oaW50KGN0eC5HRU5FUkFURV9NSVBNQVBfSElOVCwgY3R4LkRPTlRfQ0FSRSk7XG4gIGN0eC5saW5lV2lkdGgoMSk7XG4gIGN0eC5waXhlbFN0b3JlaShjdHguUEFDS19BTElHTk1FTlQsIDQpO1xuICBjdHgucGl4ZWxTdG9yZWkoY3R4LlVOUEFDS19BTElHTk1FTlQsIDQpO1xuICBjdHgucGl4ZWxTdG9yZWkoY3R4LlVOUEFDS19GTElQX1lfV0VCR0wsIGZhbHNlKTtcbiAgY3R4LnBpeGVsU3RvcmVpKGN0eC5VTlBBQ0tfUFJFTVVMVElQTFlfQUxQSEFfV0VCR0wsIGZhbHNlKTtcbiAgLy8gVE9ETzogRGVsZXRlIHRoaXMgSUYuXG4gIGlmIChjdHguVU5QQUNLX0NPTE9SU1BBQ0VfQ09OVkVSU0lPTl9XRUJHTCkge1xuICAgIGN0eC5waXhlbFN0b3JlaShjdHguVU5QQUNLX0NPTE9SU1BBQ0VfQ09OVkVSU0lPTl9XRUJHTCwgY3R4LkJST1dTRVJfREVGQVVMVF9XRUJHTCk7XG4gIH1cbiAgY3R4LnBvbHlnb25PZmZzZXQoMCwgMCk7XG4gIGN0eC5zYW1wbGVDb3ZlcmFnZSgxLCBmYWxzZSk7XG4gIGN0eC5zY2lzc29yKDAsIDAsIGN0eC5jYW52YXMud2lkdGgsIGN0eC5jYW52YXMuaGVpZ2h0KTtcbiAgY3R4LnN0ZW5jaWxGdW5jKGN0eC5BTFdBWVMsIDAsIDB4RkZGRkZGRkYpO1xuICBjdHguc3RlbmNpbE1hc2soMHhGRkZGRkZGRik7XG4gIGN0eC5zdGVuY2lsT3AoY3R4LktFRVAsIGN0eC5LRUVQLCBjdHguS0VFUCk7XG4gIGN0eC52aWV3cG9ydCgwLCAwLCBjdHguY2FudmFzLndpZHRoLCBjdHguY2FudmFzLmhlaWdodCk7XG4gIGN0eC5jbGVhcihjdHguQ09MT1JfQlVGRkVSX0JJVCB8IGN0eC5ERVBUSF9CVUZGRVJfQklUIHwgY3R4LlNURU5DSUxfQlVGRkVSX0JJVCk7XG5cbiAgaWYgKGlzV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkge1xuICAgIGN0eC5kcmF3QnVmZmVycyhbY3R4LkJBQ0tdKTtcbiAgICBjdHgucmVhZEJ1ZmZlcihjdHguQkFDSyk7XG4gICAgY3R4LmJpbmRCdWZmZXIoY3R4LkNPUFlfUkVBRF9CVUZGRVIsIG51bGwpO1xuICAgIGN0eC5iaW5kQnVmZmVyKGN0eC5DT1BZX1dSSVRFX0JVRkZFUiwgbnVsbCk7XG4gICAgY3R4LmJpbmRCdWZmZXIoY3R4LlBJWEVMX1BBQ0tfQlVGRkVSLCBudWxsKTtcbiAgICBjdHguYmluZEJ1ZmZlcihjdHguUElYRUxfVU5QQUNLX0JVRkZFUiwgbnVsbCk7XG4gICAgdmFyIG51bVRyYW5zZm9ybUZlZWRiYWNrcyA9IGN0eC5nZXRQYXJhbWV0ZXIoY3R4Lk1BWF9UUkFOU0ZPUk1fRkVFREJBQ0tfU0VQQVJBVEVfQVRUUklCUyk7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IG51bVRyYW5zZm9ybUZlZWRiYWNrczsgKytpaSkge1xuICAgICAgY3R4LmJpbmRCdWZmZXJCYXNlKGN0eC5UUkFOU0ZPUk1fRkVFREJBQ0tfQlVGRkVSLCBpaSwgbnVsbCk7XG4gICAgfVxuICAgIHZhciBudW1VQk9zID0gY3R4LmdldFBhcmFtZXRlcihjdHguTUFYX1VOSUZPUk1fQlVGRkVSX0JJTkRJTkdTKTtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgbnVtVUJPczsgKytpaSkge1xuICAgICAgY3R4LmJpbmRCdWZmZXJCYXNlKGN0eC5VTklGT1JNX0JVRkZFUiwgaWksIG51bGwpO1xuICAgIH1cbiAgICBjdHguZGlzYWJsZShjdHguUkFTVEVSSVpFUl9ESVNDQVJEKTtcbiAgICBjdHgucGl4ZWxTdG9yZWkoY3R4LlVOUEFDS19JTUFHRV9IRUlHSFQsIDApO1xuICAgIGN0eC5waXhlbFN0b3JlaShjdHguVU5QQUNLX1NLSVBfSU1BR0VTLCAwKTtcbiAgICBjdHgucGl4ZWxTdG9yZWkoY3R4LlVOUEFDS19ST1dfTEVOR1RILCAwKTtcbiAgICBjdHgucGl4ZWxTdG9yZWkoY3R4LlVOUEFDS19TS0lQX1JPV1MsIDApO1xuICAgIGN0eC5waXhlbFN0b3JlaShjdHguVU5QQUNLX1NLSVBfUElYRUxTLCAwKTtcbiAgICBjdHgucGl4ZWxTdG9yZWkoY3R4LlBBQ0tfUk9XX0xFTkdUSCwgMCk7XG4gICAgY3R4LnBpeGVsU3RvcmVpKGN0eC5QQUNLX1NLSVBfUk9XUywgMCk7XG4gICAgY3R4LnBpeGVsU3RvcmVpKGN0eC5QQUNLX1NLSVBfUElYRUxTLCAwKTtcbiAgICBjdHguaGludChjdHguRlJBR01FTlRfU0hBREVSX0RFUklWQVRJVkVfSElOVCwgY3R4LkRPTlRfQ0FSRSk7XG4gIH1cblxuICAvLyBUT0RPOiBUaGlzIHNob3VsZCBOT1QgYmUgbmVlZGVkIGJ1dCBGaXJlZm94IGZhaWxzIHdpdGggJ2hpbnQnXG4gIHdoaWxlKGN0eC5nZXRFcnJvcigpKTtcbn1cblxuZnVuY3Rpb24gbWFrZUxvc3RDb250ZXh0U2ltdWxhdGluZ0NhbnZhcyhjYW52YXMpIHtcbiAgdmFyIHVud3JhcHBlZENvbnRleHRfO1xuICB2YXIgd3JhcHBlZENvbnRleHRfO1xuICB2YXIgb25Mb3N0XyA9IFtdO1xuICB2YXIgb25SZXN0b3JlZF8gPSBbXTtcbiAgdmFyIHdyYXBwZWRDb250ZXh0XyA9IHt9O1xuICB2YXIgY29udGV4dElkXyA9IDE7XG4gIHZhciBjb250ZXh0TG9zdF8gPSBmYWxzZTtcbiAgdmFyIHJlc291cmNlSWRfID0gMDtcbiAgdmFyIHJlc291cmNlRGJfID0gW107XG4gIHZhciBudW1DYWxsc1RvTG9zZUNvbnRleHRfID0gMDtcbiAgdmFyIG51bUNhbGxzXyA9IDA7XG4gIHZhciBjYW5SZXN0b3JlXyA9IGZhbHNlO1xuICB2YXIgcmVzdG9yZVRpbWVvdXRfID0gMDtcbiAgdmFyIGlzV2ViR0wyUmVuZGVyaW5nQ29udGV4dDtcblxuICAvLyBIb2xkcyBib29sZWFucyBmb3IgZWFjaCBHTCBlcnJvciBzbyBjYW4gc2ltdWxhdGUgZXJyb3JzLlxuICB2YXIgZ2xFcnJvclNoYWRvd18gPSB7IH07XG5cbiAgY2FudmFzLmdldENvbnRleHQgPSBmdW5jdGlvbihmKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGN0eCA9IGYuYXBwbHkoY2FudmFzLCBhcmd1bWVudHMpO1xuICAgICAgLy8gRGlkIHdlIGdldCBhIGNvbnRleHQgYW5kIGlzIGl0IGEgV2ViR0wgY29udGV4dD9cbiAgICAgIGlmICgoY3R4IGluc3RhbmNlb2YgV2ViR0xSZW5kZXJpbmdDb250ZXh0KSB8fCAod2luZG93LldlYkdMMlJlbmRlcmluZ0NvbnRleHQgJiYgKGN0eCBpbnN0YW5jZW9mIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQpKSkge1xuICAgICAgICBpZiAoY3R4ICE9IHVud3JhcHBlZENvbnRleHRfKSB7XG4gICAgICAgICAgaWYgKHVud3JhcHBlZENvbnRleHRfKSB7XG4gICAgICAgICAgICB0aHJvdyBcImdvdCBkaWZmZXJlbnQgY29udGV4dFwiXG4gICAgICAgICAgfVxuICAgICAgICAgIGlzV2ViR0wyUmVuZGVyaW5nQ29udGV4dCA9IHdpbmRvdy5XZWJHTDJSZW5kZXJpbmdDb250ZXh0ICYmIChjdHggaW5zdGFuY2VvZiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0KTtcbiAgICAgICAgICB1bndyYXBwZWRDb250ZXh0XyA9IGN0eDtcbiAgICAgICAgICB3cmFwcGVkQ29udGV4dF8gPSBtYWtlTG9zdENvbnRleHRTaW11bGF0aW5nQ29udGV4dCh1bndyYXBwZWRDb250ZXh0Xyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHdyYXBwZWRDb250ZXh0XztcbiAgICAgIH1cbiAgICAgIHJldHVybiBjdHg7XG4gICAgfVxuICB9KGNhbnZhcy5nZXRDb250ZXh0KTtcblxuICBmdW5jdGlvbiB3cmFwRXZlbnQobGlzdGVuZXIpIHtcbiAgICBpZiAodHlwZW9mKGxpc3RlbmVyKSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZm8pIHtcbiAgICAgICAgbGlzdGVuZXIuaGFuZGxlRXZlbnQoaW5mbyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdmFyIGFkZE9uQ29udGV4dExvc3RMaXN0ZW5lciA9IGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgb25Mb3N0Xy5wdXNoKHdyYXBFdmVudChsaXN0ZW5lcikpO1xuICB9O1xuXG4gIHZhciBhZGRPbkNvbnRleHRSZXN0b3JlZExpc3RlbmVyID0gZnVuY3Rpb24obGlzdGVuZXIpIHtcbiAgICBvblJlc3RvcmVkXy5wdXNoKHdyYXBFdmVudChsaXN0ZW5lcikpO1xuICB9O1xuXG5cbiAgZnVuY3Rpb24gd3JhcEFkZEV2ZW50TGlzdGVuZXIoY2FudmFzKSB7XG4gICAgdmFyIGYgPSBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcjtcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyLCBidWJibGUpIHtcbiAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICd3ZWJnbGNvbnRleHRsb3N0JzpcbiAgICAgICAgICBhZGRPbkNvbnRleHRMb3N0TGlzdGVuZXIobGlzdGVuZXIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd3ZWJnbGNvbnRleHRyZXN0b3JlZCc6XG4gICAgICAgICAgYWRkT25Db250ZXh0UmVzdG9yZWRMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgZi5hcHBseShjYW52YXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHdyYXBBZGRFdmVudExpc3RlbmVyKGNhbnZhcyk7XG5cbiAgY2FudmFzLmxvc2VDb250ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFjb250ZXh0TG9zdF8pIHtcbiAgICAgIGNvbnRleHRMb3N0XyA9IHRydWU7XG4gICAgICBudW1DYWxsc1RvTG9zZUNvbnRleHRfID0gMDtcbiAgICAgICsrY29udGV4dElkXztcbiAgICAgIHdoaWxlICh1bndyYXBwZWRDb250ZXh0Xy5nZXRFcnJvcigpKTtcbiAgICAgIGNsZWFyRXJyb3JzKCk7XG4gICAgICBnbEVycm9yU2hhZG93X1t1bndyYXBwZWRDb250ZXh0Xy5DT05URVhUX0xPU1RfV0VCR0xdID0gdHJ1ZTtcbiAgICAgIHZhciBldmVudCA9IG1ha2VXZWJHTENvbnRleHRFdmVudChcImNvbnRleHQgbG9zdFwiKTtcbiAgICAgIHZhciBjYWxsYmFja3MgPSBvbkxvc3RfLnNsaWNlKCk7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIC8vbG9nKFwibnVtQ2FsbGJhY2tzOlwiICsgY2FsbGJhY2tzLmxlbmd0aCk7XG4gICAgICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IGNhbGxiYWNrcy5sZW5ndGg7ICsraWkpIHtcbiAgICAgICAgICAgIC8vbG9nKFwiY2FsbGluZyBjYWxsYmFjazpcIiArIGlpKTtcbiAgICAgICAgICAgIGNhbGxiYWNrc1tpaV0oZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAocmVzdG9yZVRpbWVvdXRfID49IDApIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY2FudmFzLnJlc3RvcmVDb250ZXh0KCk7XG4gICAgICAgICAgICAgIH0sIHJlc3RvcmVUaW1lb3V0Xyk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAwKTtcbiAgICB9XG4gIH07XG5cbiAgY2FudmFzLnJlc3RvcmVDb250ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKGNvbnRleHRMb3N0Xykge1xuICAgICAgaWYgKG9uUmVzdG9yZWRfLmxlbmd0aCkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCFjYW5SZXN0b3JlXykge1xuICAgICAgICAgICAgICB0aHJvdyBcImNhbiBub3QgcmVzdG9yZS4gd2ViZ2xjb250ZXN0bG9zdCBsaXN0ZW5lciBkaWQgbm90IGNhbGwgZXZlbnQucHJldmVudERlZmF1bHRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZyZWVSZXNvdXJjZXMoKTtcbiAgICAgICAgICAgIHJlc2V0VG9Jbml0aWFsU3RhdGUodW53cmFwcGVkQ29udGV4dF8pO1xuICAgICAgICAgICAgY29udGV4dExvc3RfID0gZmFsc2U7XG4gICAgICAgICAgICBudW1DYWxsc18gPSAwO1xuICAgICAgICAgICAgY2FuUmVzdG9yZV8gPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBjYWxsYmFja3MgPSBvblJlc3RvcmVkXy5zbGljZSgpO1xuICAgICAgICAgICAgdmFyIGV2ZW50ID0gbWFrZVdlYkdMQ29udGV4dEV2ZW50KFwiY29udGV4dCByZXN0b3JlZFwiKTtcbiAgICAgICAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBjYWxsYmFja3MubGVuZ3RoOyArK2lpKSB7XG4gICAgICAgICAgICAgIGNhbGxiYWNrc1tpaV0oZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIDApO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBjYW52YXMubG9zZUNvbnRleHRJbk5DYWxscyA9IGZ1bmN0aW9uKG51bUNhbGxzKSB7XG4gICAgaWYgKGNvbnRleHRMb3N0Xykge1xuICAgICAgdGhyb3cgXCJZb3UgY2FuIG5vdCBhc2sgYSBsb3N0IGNvbnRldCB0byBiZSBsb3N0XCI7XG4gICAgfVxuICAgIG51bUNhbGxzVG9Mb3NlQ29udGV4dF8gPSBudW1DYWxsc18gKyBudW1DYWxscztcbiAgfTtcblxuICBjYW52YXMuZ2V0TnVtQ2FsbHMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbnVtQ2FsbHNfO1xuICB9O1xuXG4gIGNhbnZhcy5zZXRSZXN0b3JlVGltZW91dCA9IGZ1bmN0aW9uKHRpbWVvdXQpIHtcbiAgICByZXN0b3JlVGltZW91dF8gPSB0aW1lb3V0O1xuICB9O1xuXG4gIGZ1bmN0aW9uIGlzV2ViR0xPYmplY3Qob2JqKSB7XG4gICAgLy9yZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIChvYmogaW5zdGFuY2VvZiBXZWJHTEJ1ZmZlciB8fFxuICAgICAgICAgICAgb2JqIGluc3RhbmNlb2YgV2ViR0xGcmFtZWJ1ZmZlciB8fFxuICAgICAgICAgICAgb2JqIGluc3RhbmNlb2YgV2ViR0xQcm9ncmFtIHx8XG4gICAgICAgICAgICBvYmogaW5zdGFuY2VvZiBXZWJHTFJlbmRlcmJ1ZmZlciB8fFxuICAgICAgICAgICAgb2JqIGluc3RhbmNlb2YgV2ViR0xTaGFkZXIgfHxcbiAgICAgICAgICAgIG9iaiBpbnN0YW5jZW9mIFdlYkdMVGV4dHVyZSk7XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja1Jlc291cmNlcyhhcmdzKSB7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IGFyZ3MubGVuZ3RoOyArK2lpKSB7XG4gICAgICB2YXIgYXJnID0gYXJnc1tpaV07XG4gICAgICBpZiAoaXNXZWJHTE9iamVjdChhcmcpKSB7XG4gICAgICAgIHJldHVybiBhcmcuX193ZWJnbERlYnVnQ29udGV4dExvc3RJZF9fID09IGNvbnRleHRJZF87XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xlYXJFcnJvcnMoKSB7XG4gICAgdmFyIGsgPSBPYmplY3Qua2V5cyhnbEVycm9yU2hhZG93Xyk7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IGsubGVuZ3RoOyArK2lpKSB7XG4gICAgICBkZWxldGUgZ2xFcnJvclNoYWRvd19ba1tpaV1dO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGxvc2VDb250ZXh0SWZUaW1lKCkge1xuICAgICsrbnVtQ2FsbHNfO1xuICAgIGlmICghY29udGV4dExvc3RfKSB7XG4gICAgICBpZiAobnVtQ2FsbHNUb0xvc2VDb250ZXh0XyA9PSBudW1DYWxsc18pIHtcbiAgICAgICAgY2FudmFzLmxvc2VDb250ZXh0KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gTWFrZXMgYSBmdW5jdGlvbiB0aGF0IHNpbXVsYXRlcyBXZWJHTCB3aGVuIG91dCBvZiBjb250ZXh0LlxuICBmdW5jdGlvbiBtYWtlTG9zdENvbnRleHRGdW5jdGlvbldyYXBwZXIoY3R4LCBmdW5jdGlvbk5hbWUpIHtcbiAgICB2YXIgZiA9IGN0eFtmdW5jdGlvbk5hbWVdO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGxvZyhcImNhbGxpbmc6XCIgKyBmdW5jdGlvbk5hbWUpO1xuICAgICAgLy8gT25seSBjYWxsIHRoZSBmdW5jdGlvbnMgaWYgdGhlIGNvbnRleHQgaXMgbm90IGxvc3QuXG4gICAgICBsb3NlQ29udGV4dElmVGltZSgpO1xuICAgICAgaWYgKCFjb250ZXh0TG9zdF8pIHtcbiAgICAgICAgLy9pZiAoIWNoZWNrUmVzb3VyY2VzKGFyZ3VtZW50cykpIHtcbiAgICAgICAgLy8gIGdsRXJyb3JTaGFkb3dfW3dyYXBwZWRDb250ZXh0Xy5JTlZBTElEX09QRVJBVElPTl0gPSB0cnVlO1xuICAgICAgICAvLyAgcmV0dXJuO1xuICAgICAgICAvL31cbiAgICAgICAgdmFyIHJlc3VsdCA9IGYuYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBmcmVlUmVzb3VyY2VzKCkge1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCByZXNvdXJjZURiXy5sZW5ndGg7ICsraWkpIHtcbiAgICAgIHZhciByZXNvdXJjZSA9IHJlc291cmNlRGJfW2lpXTtcbiAgICAgIGlmIChyZXNvdXJjZSBpbnN0YW5jZW9mIFdlYkdMQnVmZmVyKSB7XG4gICAgICAgIHVud3JhcHBlZENvbnRleHRfLmRlbGV0ZUJ1ZmZlcihyZXNvdXJjZSk7XG4gICAgICB9IGVsc2UgaWYgKHJlc291cmNlIGluc3RhbmNlb2YgV2ViR0xGcmFtZWJ1ZmZlcikge1xuICAgICAgICB1bndyYXBwZWRDb250ZXh0Xy5kZWxldGVGcmFtZWJ1ZmZlcihyZXNvdXJjZSk7XG4gICAgICB9IGVsc2UgaWYgKHJlc291cmNlIGluc3RhbmNlb2YgV2ViR0xQcm9ncmFtKSB7XG4gICAgICAgIHVud3JhcHBlZENvbnRleHRfLmRlbGV0ZVByb2dyYW0ocmVzb3VyY2UpO1xuICAgICAgfSBlbHNlIGlmIChyZXNvdXJjZSBpbnN0YW5jZW9mIFdlYkdMUmVuZGVyYnVmZmVyKSB7XG4gICAgICAgIHVud3JhcHBlZENvbnRleHRfLmRlbGV0ZVJlbmRlcmJ1ZmZlcihyZXNvdXJjZSk7XG4gICAgICB9IGVsc2UgaWYgKHJlc291cmNlIGluc3RhbmNlb2YgV2ViR0xTaGFkZXIpIHtcbiAgICAgICAgdW53cmFwcGVkQ29udGV4dF8uZGVsZXRlU2hhZGVyKHJlc291cmNlKTtcbiAgICAgIH0gZWxzZSBpZiAocmVzb3VyY2UgaW5zdGFuY2VvZiBXZWJHTFRleHR1cmUpIHtcbiAgICAgICAgdW53cmFwcGVkQ29udGV4dF8uZGVsZXRlVGV4dHVyZShyZXNvdXJjZSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChpc1dlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICAgICAgaWYgKHJlc291cmNlIGluc3RhbmNlb2YgV2ViR0xRdWVyeSkge1xuICAgICAgICAgIHVud3JhcHBlZENvbnRleHRfLmRlbGV0ZVF1ZXJ5KHJlc291cmNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChyZXNvdXJjZSBpbnN0YW5jZW9mIFdlYkdMU2FtcGxlcikge1xuICAgICAgICAgIHVud3JhcHBlZENvbnRleHRfLmRlbGV0ZVNhbXBsZXIocmVzb3VyY2UpO1xuICAgICAgICB9IGVsc2UgaWYgKHJlc291cmNlIGluc3RhbmNlb2YgV2ViR0xTeW5jKSB7XG4gICAgICAgICAgdW53cmFwcGVkQ29udGV4dF8uZGVsZXRlU3luYyhyZXNvdXJjZSk7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzb3VyY2UgaW5zdGFuY2VvZiBXZWJHTFRyYW5zZm9ybUZlZWRiYWNrKSB7XG4gICAgICAgICAgdW53cmFwcGVkQ29udGV4dF8uZGVsZXRlVHJhbnNmb3JtRmVlZGJhY2socmVzb3VyY2UpO1xuICAgICAgICB9IGVsc2UgaWYgKHJlc291cmNlIGluc3RhbmNlb2YgV2ViR0xWZXJ0ZXhBcnJheU9iamVjdCkge1xuICAgICAgICAgIHVud3JhcHBlZENvbnRleHRfLmRlbGV0ZVZlcnRleEFycmF5KHJlc291cmNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1ha2VXZWJHTENvbnRleHRFdmVudChzdGF0dXNNZXNzYWdlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c01lc3NhZ2U6IHN0YXR1c01lc3NhZ2UsXG4gICAgICBwcmV2ZW50RGVmYXVsdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY2FuUmVzdG9yZV8gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBjYW52YXM7XG5cbiAgZnVuY3Rpb24gbWFrZUxvc3RDb250ZXh0U2ltdWxhdGluZ0NvbnRleHQoY3R4KSB7XG4gICAgLy8gY29weSBhbGwgZnVuY3Rpb25zIGFuZCBwcm9wZXJ0aWVzIHRvIHdyYXBwZXJcbiAgICBmb3IgKHZhciBwcm9wZXJ0eU5hbWUgaW4gY3R4KSB7XG4gICAgICBpZiAodHlwZW9mIGN0eFtwcm9wZXJ0eU5hbWVdID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgIHdyYXBwZWRDb250ZXh0X1twcm9wZXJ0eU5hbWVdID0gbWFrZUxvc3RDb250ZXh0RnVuY3Rpb25XcmFwcGVyKFxuICAgICAgICAgICAgIGN0eCwgcHJvcGVydHlOYW1lKTtcbiAgICAgICB9IGVsc2Uge1xuICAgICAgICAgbWFrZVByb3BlcnR5V3JhcHBlcih3cmFwcGVkQ29udGV4dF8sIGN0eCwgcHJvcGVydHlOYW1lKTtcbiAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gV3JhcCBhIGZldyBmdW5jdGlvbnMgc3BlY2lhbGx5LlxuICAgIHdyYXBwZWRDb250ZXh0Xy5nZXRFcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgbG9zZUNvbnRleHRJZlRpbWUoKTtcbiAgICAgIGlmICghY29udGV4dExvc3RfKSB7XG4gICAgICAgIHZhciBlcnI7XG4gICAgICAgIHdoaWxlIChlcnIgPSB1bndyYXBwZWRDb250ZXh0Xy5nZXRFcnJvcigpKSB7XG4gICAgICAgICAgZ2xFcnJvclNoYWRvd19bZXJyXSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGVyciBpbiBnbEVycm9yU2hhZG93Xykge1xuICAgICAgICBpZiAoZ2xFcnJvclNoYWRvd19bZXJyXSkge1xuICAgICAgICAgIGRlbGV0ZSBnbEVycm9yU2hhZG93X1tlcnJdO1xuICAgICAgICAgIHJldHVybiBlcnI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB3cmFwcGVkQ29udGV4dF8uTk9fRVJST1I7XG4gICAgfTtcblxuICAgIHZhciBjcmVhdGlvbkZ1bmN0aW9ucyA9IFtcbiAgICAgIFwiY3JlYXRlQnVmZmVyXCIsXG4gICAgICBcImNyZWF0ZUZyYW1lYnVmZmVyXCIsXG4gICAgICBcImNyZWF0ZVByb2dyYW1cIixcbiAgICAgIFwiY3JlYXRlUmVuZGVyYnVmZmVyXCIsXG4gICAgICBcImNyZWF0ZVNoYWRlclwiLFxuICAgICAgXCJjcmVhdGVUZXh0dXJlXCJcbiAgICBdO1xuICAgIGlmIChpc1dlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICAgIGNyZWF0aW9uRnVuY3Rpb25zLnB1c2goXG4gICAgICAgIFwiY3JlYXRlUXVlcnlcIixcbiAgICAgICAgXCJjcmVhdGVTYW1wbGVyXCIsXG4gICAgICAgIFwiZmVuY2VTeW5jXCIsXG4gICAgICAgIFwiY3JlYXRlVHJhbnNmb3JtRmVlZGJhY2tcIixcbiAgICAgICAgXCJjcmVhdGVWZXJ0ZXhBcnJheVwiXG4gICAgICApO1xuICAgIH1cbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgY3JlYXRpb25GdW5jdGlvbnMubGVuZ3RoOyArK2lpKSB7XG4gICAgICB2YXIgZnVuY3Rpb25OYW1lID0gY3JlYXRpb25GdW5jdGlvbnNbaWldO1xuICAgICAgd3JhcHBlZENvbnRleHRfW2Z1bmN0aW9uTmFtZV0gPSBmdW5jdGlvbihmKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsb3NlQ29udGV4dElmVGltZSgpO1xuICAgICAgICAgIGlmIChjb250ZXh0TG9zdF8pIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgb2JqID0gZi5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgb2JqLl9fd2ViZ2xEZWJ1Z0NvbnRleHRMb3N0SWRfXyA9IGNvbnRleHRJZF87XG4gICAgICAgICAgcmVzb3VyY2VEYl8ucHVzaChvYmopO1xuICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH07XG4gICAgICB9KGN0eFtmdW5jdGlvbk5hbWVdKTtcbiAgICB9XG5cbiAgICB2YXIgZnVuY3Rpb25zVGhhdFNob3VsZFJldHVybk51bGwgPSBbXG4gICAgICBcImdldEFjdGl2ZUF0dHJpYlwiLFxuICAgICAgXCJnZXRBY3RpdmVVbmlmb3JtXCIsXG4gICAgICBcImdldEJ1ZmZlclBhcmFtZXRlclwiLFxuICAgICAgXCJnZXRDb250ZXh0QXR0cmlidXRlc1wiLFxuICAgICAgXCJnZXRBdHRhY2hlZFNoYWRlcnNcIixcbiAgICAgIFwiZ2V0RnJhbWVidWZmZXJBdHRhY2htZW50UGFyYW1ldGVyXCIsXG4gICAgICBcImdldFBhcmFtZXRlclwiLFxuICAgICAgXCJnZXRQcm9ncmFtUGFyYW1ldGVyXCIsXG4gICAgICBcImdldFByb2dyYW1JbmZvTG9nXCIsXG4gICAgICBcImdldFJlbmRlcmJ1ZmZlclBhcmFtZXRlclwiLFxuICAgICAgXCJnZXRTaGFkZXJQYXJhbWV0ZXJcIixcbiAgICAgIFwiZ2V0U2hhZGVySW5mb0xvZ1wiLFxuICAgICAgXCJnZXRTaGFkZXJTb3VyY2VcIixcbiAgICAgIFwiZ2V0VGV4UGFyYW1ldGVyXCIsXG4gICAgICBcImdldFVuaWZvcm1cIixcbiAgICAgIFwiZ2V0VW5pZm9ybUxvY2F0aW9uXCIsXG4gICAgICBcImdldFZlcnRleEF0dHJpYlwiXG4gICAgXTtcbiAgICBpZiAoaXNXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgICBmdW5jdGlvbnNUaGF0U2hvdWxkUmV0dXJuTnVsbC5wdXNoKFxuICAgICAgICBcImdldEludGVybmFsZm9ybWF0UGFyYW1ldGVyXCIsXG4gICAgICAgIFwiZ2V0UXVlcnlcIixcbiAgICAgICAgXCJnZXRRdWVyeVBhcmFtZXRlclwiLFxuICAgICAgICBcImdldFNhbXBsZXJQYXJhbWV0ZXJcIixcbiAgICAgICAgXCJnZXRTeW5jUGFyYW1ldGVyXCIsXG4gICAgICAgIFwiZ2V0VHJhbnNmb3JtRmVlZGJhY2tWYXJ5aW5nXCIsXG4gICAgICAgIFwiZ2V0SW5kZXhlZFBhcmFtZXRlclwiLFxuICAgICAgICBcImdldFVuaWZvcm1JbmRpY2VzXCIsXG4gICAgICAgIFwiZ2V0QWN0aXZlVW5pZm9ybXNcIixcbiAgICAgICAgXCJnZXRBY3RpdmVVbmlmb3JtQmxvY2tQYXJhbWV0ZXJcIixcbiAgICAgICAgXCJnZXRBY3RpdmVVbmlmb3JtQmxvY2tOYW1lXCJcbiAgICAgICk7XG4gICAgfVxuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBmdW5jdGlvbnNUaGF0U2hvdWxkUmV0dXJuTnVsbC5sZW5ndGg7ICsraWkpIHtcbiAgICAgIHZhciBmdW5jdGlvbk5hbWUgPSBmdW5jdGlvbnNUaGF0U2hvdWxkUmV0dXJuTnVsbFtpaV07XG4gICAgICB3cmFwcGVkQ29udGV4dF9bZnVuY3Rpb25OYW1lXSA9IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxvc2VDb250ZXh0SWZUaW1lKCk7XG4gICAgICAgICAgaWYgKGNvbnRleHRMb3N0Xykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmLmFwcGx5KGN0eCwgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgfSh3cmFwcGVkQ29udGV4dF9bZnVuY3Rpb25OYW1lXSk7XG4gICAgfVxuXG4gICAgdmFyIGlzRnVuY3Rpb25zID0gW1xuICAgICAgXCJpc0J1ZmZlclwiLFxuICAgICAgXCJpc0VuYWJsZWRcIixcbiAgICAgIFwiaXNGcmFtZWJ1ZmZlclwiLFxuICAgICAgXCJpc1Byb2dyYW1cIixcbiAgICAgIFwiaXNSZW5kZXJidWZmZXJcIixcbiAgICAgIFwiaXNTaGFkZXJcIixcbiAgICAgIFwiaXNUZXh0dXJlXCJcbiAgICBdO1xuICAgIGlmIChpc1dlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICAgIGlzRnVuY3Rpb25zLnB1c2goXG4gICAgICAgIFwiaXNRdWVyeVwiLFxuICAgICAgICBcImlzU2FtcGxlclwiLFxuICAgICAgICBcImlzU3luY1wiLFxuICAgICAgICBcImlzVHJhbnNmb3JtRmVlZGJhY2tcIixcbiAgICAgICAgXCJpc1ZlcnRleEFycmF5XCJcbiAgICAgICk7XG4gICAgfVxuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBpc0Z1bmN0aW9ucy5sZW5ndGg7ICsraWkpIHtcbiAgICAgIHZhciBmdW5jdGlvbk5hbWUgPSBpc0Z1bmN0aW9uc1tpaV07XG4gICAgICB3cmFwcGVkQ29udGV4dF9bZnVuY3Rpb25OYW1lXSA9IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxvc2VDb250ZXh0SWZUaW1lKCk7XG4gICAgICAgICAgaWYgKGNvbnRleHRMb3N0Xykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZi5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgIH0od3JhcHBlZENvbnRleHRfW2Z1bmN0aW9uTmFtZV0pO1xuICAgIH1cblxuICAgIHdyYXBwZWRDb250ZXh0Xy5jaGVja0ZyYW1lYnVmZmVyU3RhdHVzID0gZnVuY3Rpb24oZikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBsb3NlQ29udGV4dElmVGltZSgpO1xuICAgICAgICBpZiAoY29udGV4dExvc3RfKSB7XG4gICAgICAgICAgcmV0dXJuIHdyYXBwZWRDb250ZXh0Xy5GUkFNRUJVRkZFUl9VTlNVUFBPUlRFRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZi5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgIH0od3JhcHBlZENvbnRleHRfLmNoZWNrRnJhbWVidWZmZXJTdGF0dXMpO1xuXG4gICAgd3JhcHBlZENvbnRleHRfLmdldEF0dHJpYkxvY2F0aW9uID0gZnVuY3Rpb24oZikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBsb3NlQ29udGV4dElmVGltZSgpO1xuICAgICAgICBpZiAoY29udGV4dExvc3RfKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmLmFwcGx5KGN0eCwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSh3cmFwcGVkQ29udGV4dF8uZ2V0QXR0cmliTG9jYXRpb24pO1xuXG4gICAgd3JhcHBlZENvbnRleHRfLmdldFZlcnRleEF0dHJpYk9mZnNldCA9IGZ1bmN0aW9uKGYpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbG9zZUNvbnRleHRJZlRpbWUoKTtcbiAgICAgICAgaWYgKGNvbnRleHRMb3N0Xykge1xuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmLmFwcGx5KGN0eCwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfSh3cmFwcGVkQ29udGV4dF8uZ2V0VmVydGV4QXR0cmliT2Zmc2V0KTtcblxuICAgIHdyYXBwZWRDb250ZXh0Xy5pc0NvbnRleHRMb3N0ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gY29udGV4dExvc3RfO1xuICAgIH07XG5cbiAgICBpZiAoaXNXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgICB3cmFwcGVkQ29udGV4dF8uZ2V0RnJhZ0RhdGFMb2NhdGlvbiA9IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxvc2VDb250ZXh0SWZUaW1lKCk7XG4gICAgICAgICAgaWYgKGNvbnRleHRMb3N0Xykge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZi5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgICB9KHdyYXBwZWRDb250ZXh0Xy5nZXRGcmFnRGF0YUxvY2F0aW9uKTtcblxuICAgICAgd3JhcHBlZENvbnRleHRfLmNsaWVudFdhaXRTeW5jID0gZnVuY3Rpb24oZikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbG9zZUNvbnRleHRJZlRpbWUoKTtcbiAgICAgICAgICBpZiAoY29udGV4dExvc3RfKSB7XG4gICAgICAgICAgICByZXR1cm4gd3JhcHBlZENvbnRleHRfLldBSVRfRkFJTEVEO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZi5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgICB9KHdyYXBwZWRDb250ZXh0Xy5jbGllbnRXYWl0U3luYyk7XG5cbiAgICAgIHdyYXBwZWRDb250ZXh0Xy5nZXRVbmlmb3JtQmxvY2tJbmRleCA9IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxvc2VDb250ZXh0SWZUaW1lKCk7XG4gICAgICAgICAgaWYgKGNvbnRleHRMb3N0Xykge1xuICAgICAgICAgICAgcmV0dXJuIHdyYXBwZWRDb250ZXh0Xy5JTlZBTElEX0lOREVYO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZi5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgICB9KHdyYXBwZWRDb250ZXh0Xy5nZXRVbmlmb3JtQmxvY2tJbmRleCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHdyYXBwZWRDb250ZXh0XztcbiAgfVxufVxuXG5yZXR1cm4ge1xuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhpcyBtb2R1bGUuIFNhZmUgdG8gY2FsbCBtb3JlIHRoYW4gb25jZS5cbiAgICogQHBhcmFtIHshV2ViR0xSZW5kZXJpbmdDb250ZXh0fSBjdHggQSBXZWJHTCBjb250ZXh0LiBJZlxuICAgKiAgICB5b3UgaGF2ZSBtb3JlIHRoYW4gb25lIGNvbnRleHQgaXQgZG9lc24ndCBtYXR0ZXIgd2hpY2ggb25lXG4gICAqICAgIHlvdSBwYXNzIGluLCBpdCBpcyBvbmx5IHVzZWQgdG8gcHVsbCBvdXQgY29uc3RhbnRzLlxuICAgKi9cbiAgJ2luaXQnOiBpbml0LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgb3IgZmFsc2UgaWYgdmFsdWUgbWF0Y2hlcyBhbnkgV2ViR0wgZW51bVxuICAgKiBAcGFyYW0geyp9IHZhbHVlIFZhbHVlIHRvIGNoZWNrIGlmIGl0IG1pZ2h0IGJlIGFuIGVudW0uXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdmFsdWUgbWF0Y2hlcyBvbmUgb2YgdGhlIFdlYkdMIGRlZmluZWQgZW51bXNcbiAgICovXG4gICdtaWdodEJlRW51bSc6IG1pZ2h0QmVFbnVtLFxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIHN0cmluZyB2ZXJzaW9uIG9mIGFuIFdlYkdMIGVudW0uXG4gICAqXG4gICAqIEV4YW1wbGU6XG4gICAqICAgV2ViR0xEZWJ1Z1V0aWwuaW5pdChjdHgpO1xuICAgKiAgIHZhciBzdHIgPSBXZWJHTERlYnVnVXRpbC5nbEVudW1Ub1N0cmluZyhjdHguZ2V0RXJyb3IoKSk7XG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBWYWx1ZSB0byByZXR1cm4gYW4gZW51bSBmb3JcbiAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgc3RyaW5nIHZlcnNpb24gb2YgdGhlIGVudW0uXG4gICAqL1xuICAnZ2xFbnVtVG9TdHJpbmcnOiBnbEVudW1Ub1N0cmluZyxcblxuICAvKipcbiAgICogQ29udmVydHMgdGhlIGFyZ3VtZW50IG9mIGEgV2ViR0wgZnVuY3Rpb24gdG8gYSBzdHJpbmcuXG4gICAqIEF0dGVtcHRzIHRvIGNvbnZlcnQgZW51bSBhcmd1bWVudHMgdG8gc3RyaW5ncy5cbiAgICpcbiAgICogRXhhbXBsZTpcbiAgICogICBXZWJHTERlYnVnVXRpbC5pbml0KGN0eCk7XG4gICAqICAgdmFyIHN0ciA9IFdlYkdMRGVidWdVdGlsLmdsRnVuY3Rpb25BcmdUb1N0cmluZygnYmluZFRleHR1cmUnLCAyLCAwLCBnbC5URVhUVVJFXzJEKTtcbiAgICpcbiAgICogd291bGQgcmV0dXJuICdURVhUVVJFXzJEJ1xuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZnVuY3Rpb25OYW1lIHRoZSBuYW1lIG9mIHRoZSBXZWJHTCBmdW5jdGlvbi5cbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bUFyZ3MgVGhlIG51bWJlciBvZiBhcmd1bWVudHNcbiAgICogQHBhcmFtIHtudW1iZXJ9IGFyZ3VtZW50SW5keCB0aGUgaW5kZXggb2YgdGhlIGFyZ3VtZW50LlxuICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSBvZiB0aGUgYXJndW1lbnQuXG4gICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHZhbHVlIGFzIGEgc3RyaW5nLlxuICAgKi9cbiAgJ2dsRnVuY3Rpb25BcmdUb1N0cmluZyc6IGdsRnVuY3Rpb25BcmdUb1N0cmluZyxcblxuICAvKipcbiAgICogQ29udmVydHMgdGhlIGFyZ3VtZW50cyBvZiBhIFdlYkdMIGZ1bmN0aW9uIHRvIGEgc3RyaW5nLlxuICAgKiBBdHRlbXB0cyB0byBjb252ZXJ0IGVudW0gYXJndW1lbnRzIHRvIHN0cmluZ3MuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmdW5jdGlvbk5hbWUgdGhlIG5hbWUgb2YgdGhlIFdlYkdMIGZ1bmN0aW9uLlxuICAgKiBAcGFyYW0ge251bWJlcn0gYXJncyBUaGUgYXJndW1lbnRzLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBhcmd1bWVudHMgYXMgYSBzdHJpbmcuXG4gICAqL1xuICAnZ2xGdW5jdGlvbkFyZ3NUb1N0cmluZyc6IGdsRnVuY3Rpb25BcmdzVG9TdHJpbmcsXG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgV2ViR0wgY29udGV4dCByZXR1cm5zIGEgd3JhcHBlZCBjb250ZXh0IHRoYXQgY2FsbHNcbiAgICogZ2wuZ2V0RXJyb3IgYWZ0ZXIgZXZlcnkgY29tbWFuZCBhbmQgY2FsbHMgYSBmdW5jdGlvbiBpZiB0aGVcbiAgICogcmVzdWx0IGlzIG5vdCBOT19FUlJPUi5cbiAgICpcbiAgICogWW91IGNhbiBzdXBwbHkgeW91ciBvd24gZnVuY3Rpb24gaWYgeW91IHdhbnQuIEZvciBleGFtcGxlLCBpZiB5b3UnZCBsaWtlXG4gICAqIGFuIGV4Y2VwdGlvbiB0aHJvd24gb24gYW55IEdMIGVycm9yIHlvdSBjb3VsZCBkbyB0aGlzXG4gICAqXG4gICAqICAgIGZ1bmN0aW9uIHRocm93T25HTEVycm9yKGVyciwgZnVuY05hbWUsIGFyZ3MpIHtcbiAgICogICAgICB0aHJvdyBXZWJHTERlYnVnVXRpbHMuZ2xFbnVtVG9TdHJpbmcoZXJyKSArXG4gICAqICAgICAgICAgICAgXCIgd2FzIGNhdXNlZCBieSBjYWxsIHRvIFwiICsgZnVuY05hbWU7XG4gICAqICAgIH07XG4gICAqXG4gICAqICAgIGN0eCA9IFdlYkdMRGVidWdVdGlscy5tYWtlRGVidWdDb250ZXh0KFxuICAgKiAgICAgICAgY2FudmFzLmdldENvbnRleHQoXCJ3ZWJnbFwiKSwgdGhyb3dPbkdMRXJyb3IpO1xuICAgKlxuICAgKiBAcGFyYW0geyFXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGN0eCBUaGUgd2ViZ2wgY29udGV4dCB0byB3cmFwLlxuICAgKiBAcGFyYW0geyFmdW5jdGlvbihlcnIsIGZ1bmNOYW1lLCBhcmdzKTogdm9pZH0gb3B0X29uRXJyb3JGdW5jIFRoZSBmdW5jdGlvblxuICAgKiAgICAgdG8gY2FsbCB3aGVuIGdsLmdldEVycm9yIHJldHVybnMgYW4gZXJyb3IuIElmIG5vdCBzcGVjaWZpZWQgdGhlIGRlZmF1bHRcbiAgICogICAgIGZ1bmN0aW9uIGNhbGxzIGNvbnNvbGUubG9nIHdpdGggYSBtZXNzYWdlLlxuICAgKiBAcGFyYW0geyFmdW5jdGlvbihmdW5jTmFtZSwgYXJncyk6IHZvaWR9IG9wdF9vbkZ1bmMgVGhlXG4gICAqICAgICBmdW5jdGlvbiB0byBjYWxsIHdoZW4gZWFjaCB3ZWJnbCBmdW5jdGlvbiBpcyBjYWxsZWQuIFlvdVxuICAgKiAgICAgY2FuIHVzZSB0aGlzIHRvIGxvZyBhbGwgY2FsbHMgZm9yIGV4YW1wbGUuXG4gICAqL1xuICAnbWFrZURlYnVnQ29udGV4dCc6IG1ha2VEZWJ1Z0NvbnRleHQsXG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgY2FudmFzIGVsZW1lbnQgcmV0dXJucyBhIHdyYXBwZWQgY2FudmFzIGVsZW1lbnQgdGhhdCB3aWxsXG4gICAqIHNpbXVsYXRlIGxvc3QgY29udGV4dC4gVGhlIGNhbnZhcyByZXR1cm5lZCBhZGRzIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zLlxuICAgKlxuICAgKiBsb3NlQ29udGV4dDpcbiAgICogICBzaW11bGF0ZXMgYSBsb3N0IGNvbnRleHQgZXZlbnQuXG4gICAqXG4gICAqIHJlc3RvcmVDb250ZXh0OlxuICAgKiAgIHNpbXVsYXRlcyB0aGUgY29udGV4dCBiZWluZyByZXN0b3JlZC5cbiAgICpcbiAgICogbG9zdENvbnRleHRJbk5DYWxsczpcbiAgICogICBsb3NlcyB0aGUgY29udGV4dCBhZnRlciBOIGdsIGNhbGxzLlxuICAgKlxuICAgKiBnZXROdW1DYWxsczpcbiAgICogICB0ZWxscyB5b3UgaG93IG1hbnkgZ2wgY2FsbHMgdGhlcmUgaGF2ZSBiZWVuIHNvIGZhci5cbiAgICpcbiAgICogc2V0UmVzdG9yZVRpbWVvdXQ6XG4gICAqICAgc2V0cyB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB1bnRpbCB0aGUgY29udGV4dCBpcyByZXN0b3JlZFxuICAgKiAgIGFmdGVyIGl0IGhhcyBiZWVuIGxvc3QuIERlZmF1bHRzIHRvIDAuIFBhc3MgLTEgdG8gcHJldmVudFxuICAgKiAgIGF1dG9tYXRpYyByZXN0b3JpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7IUNhbnZhc30gY2FudmFzIFRoZSBjYW52YXMgZWxlbWVudCB0byB3cmFwLlxuICAgKi9cbiAgJ21ha2VMb3N0Q29udGV4dFNpbXVsYXRpbmdDYW52YXMnOiBtYWtlTG9zdENvbnRleHRTaW11bGF0aW5nQ2FudmFzLFxuXG4gIC8qKlxuICAgKiBSZXNldHMgYSBjb250ZXh0IHRvIHRoZSBpbml0aWFsIHN0YXRlLlxuICAgKiBAcGFyYW0geyFXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGN0eCBUaGUgd2ViZ2wgY29udGV4dCB0b1xuICAgKiAgICAgcmVzZXQuXG4gICAqL1xuICAncmVzZXRUb0luaXRpYWxTdGF0ZSc6IHJlc2V0VG9Jbml0aWFsU3RhdGVcbn07XG5cbn0oKTtcblxubW9kdWxlLmV4cG9ydHMgPSBXZWJHTERlYnVnVXRpbHM7XG4iLCJpbXBvcnQgeyBQYXJ0aWNsZUVuZ2luZSB9IGZyb20gJy4vcGFydGljbGVfZW5naW5lJ1xuaW1wb3J0IHsgVXNlcklucHV0U3RhdGUgfSBmcm9tICcuL3N0YXRlJztcblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBTZXQgdXAgV2ViR0xcbiAgICBsZXQgY2FudmFzID0gPEhUTUxDYW52YXNFbGVtZW50PmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpbkNhbnZhc1wiKTtcbiAgICBsZXQgZ2wgPSBjYW52YXMuZ2V0Q29udGV4dChcIndlYmdsMlwiKTtcbiAgICBpZiAoIWdsKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3I6IGNvdWxkIG5vdCBnZXQgd2ViZ2wyXCIpO1xuICAgICAgICBjYW52YXMuaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2xlcnJvclwiKS5oaWRkZW4gPSB0cnVlO1xuXG4gICAgdmFyIGNvdW50ID0gMTAwMDA7XG4gICAgbGV0IHN0YXRlID0gbmV3IFVzZXJJbnB1dFN0YXRlKCk7XG4gICAgbGV0IGVuZ2luZSA9IG5ldyBQYXJ0aWNsZUVuZ2luZShnbCwgY291bnQpO1xuXG4gICAgLy8gQ2FsbGJhY2tzXG4gICAgY2FudmFzLm9uY29udGV4dG1lbnUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBmYWxzZTsgfTtcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBzdGF0ZS5tb3VzZVswXSA9IChlLm9mZnNldFggLyBjYW52YXMuY2xpZW50V2lkdGgpICogMiAtIDE7XG4gICAgICAgIHN0YXRlLm1vdXNlWzFdID0gKChjYW52YXMuY2xpZW50SGVpZ2h0IC0gZS5vZmZzZXRZKSAvIGNhbnZhcy5jbGllbnRIZWlnaHQpICogMiAtIDE7XG4gICAgfSk7XG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgc3RhdGUuYWNjZWwgPSB0cnVlO1xuICAgICAgICBpZiAoZS5idXR0b24gPT0gMikge1xuICAgICAgICAgICAgLy8gSW52ZXJ0IGFjY2VsZXJhdGlvbiBmb3IgcmlnaHQgY2xpY2tcbiAgICAgICAgICAgIHN0YXRlLmFjY2VsQW1vdW50ID0gLU1hdGguYWJzKHN0YXRlLmFjY2VsQW1vdW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlLmFjY2VsQW1vdW50ID0gTWF0aC5hYnMoc3RhdGUuYWNjZWxBbW91bnQpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3RhdGUuYWNjZWwgPSBmYWxzZTtcbiAgICB9KTtcbiAgICBsZXQgaGFuZGxlUmVzaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgLy8gVGVsbCBXZWJHTCBob3cgdG8gY29udmVydCBmcm9tIGNsaXAgc3BhY2UgdG8gcGl4ZWxzXG4gICAgICAgIGdsLnZpZXdwb3J0KDAsIDAsIGdsLmNhbnZhcy53aWR0aCwgZ2wuY2FudmFzLmhlaWdodCk7XG4gICAgfTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBoYW5kbGVSZXNpemUpO1xuICAgIGxldCBhY3ZhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWNjZWxWYWxcIik7XG4gICAgbGV0IGFjID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhY2NlbFwiKTtcbiAgICBhYy5vbmlucHV0ID0gZnVuY3Rpb24gKHRoaXM6IEhUTUxJbnB1dEVsZW1lbnQsIGV2OiBFdmVudCkge1xuICAgICAgICBzdGF0ZS5hY2NlbEFtb3VudCA9IE51bWJlcih0aGlzLnZhbHVlKSAqIDAuMDU7XG4gICAgICAgIGFjdmFsLnRleHRDb250ZW50ID0gc3RhdGUuYWNjZWxBbW91bnQudG9QcmVjaXNpb24oMyk7XG4gICAgfTtcbiAgICBsZXQgcG9pbnRzVmFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb2ludHNWYWxcIik7XG4gICAgbGV0IHBvaW50cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicG9pbnRzXCIpO1xuICAgIHZhciBuZXdDb3VudCA9IDA7XG4gICAgcG9pbnRzLm9uaW5wdXQgPSBmdW5jdGlvbiAodGhpczogSFRNTElucHV0RWxlbWVudCwgZXY6IEV2ZW50KSB7XG4gICAgICAgIG5ld0NvdW50ID0gTWF0aC5yb3VuZCg1MDAwICogTWF0aC5leHAoTnVtYmVyKHRoaXMudmFsdWUpIC8gMTQpKTtcbiAgICAgICAgcG9pbnRzVmFsLnRleHRDb250ZW50ID0gXCJcIiArIG5ld0NvdW50O1xuICAgIH07XG4gICAgcG9pbnRzLm9uY2hhbmdlID0gZnVuY3Rpb24gKHRoaXM6IEhUTUxJbnB1dEVsZW1lbnQsIGV2OiBFdmVudCkge1xuICAgICAgICAvLyBXaGVuIHVzZXIgaXMgZG9uZSBzbGlkaW5nLCByZS1pbml0IHBhcnRpY2xlIGJ1ZmZlcnNcbiAgICAgICAgY291bnQgPSBuZXdDb3VudDtcbiAgICAgICAgZW5naW5lLnJlc2V0UGFydGljbGVzKGNvdW50KTtcbiAgICB9O1xuICAgIGxldCBwb2ludHNpemVWYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBvaW50c2l6ZVZhbFwiKTtcbiAgICBsZXQgcG9pbnRzaXplID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BvaW50c2l6ZScpO1xuICAgIHBvaW50c2l6ZS5vbmlucHV0ID0gZnVuY3Rpb24gKHRoaXM6IEhUTUxJbnB1dEVsZW1lbnQsIGV2OiBFdmVudCkge1xuICAgICAgICBzdGF0ZS5wYXJ0aWNsZVNpemUgPSBOdW1iZXIodGhpcy52YWx1ZSkgLyAxMC4wO1xuICAgICAgICBwb2ludHNpemVWYWwudGV4dENvbnRlbnQgPSBcIlwiICsgc3RhdGUucGFydGljbGVTaXplO1xuICAgIH07XG5cbiAgICBsZXQgZnJhbWVDb3VudGVyID0gMDtcbiAgICBsZXQgZnBzVmFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmcHNcIik7XG4gICAgbGV0IHByZXZGcmFtZSA9IERhdGUubm93KCk7XG5cbiAgICBmdW5jdGlvbiBkcmF3U2NlbmUoKSB7XG4gICAgICAgIGVuZ2luZS5kcmF3KHN0YXRlKTtcbiAgICAgICAgaWYgKGZyYW1lQ291bnRlciA9PSA5KSB7XG4gICAgICAgICAgICBsZXQgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIGxldCBmcHMgPSAxMDAwMC4wIC8gKG5vdyAtIHByZXZGcmFtZSk7XG4gICAgICAgICAgICBwcmV2RnJhbWUgPSBub3c7XG4gICAgICAgICAgICBmcHNWYWwudGV4dENvbnRlbnQgPSBcIlwiICsgZnBzO1xuICAgICAgICAgICAgZnJhbWVDb3VudGVyID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZyYW1lQ291bnRlciArPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXdTY2VuZSk7XG4gICAgfVxuICAgIC8vIFNldCB1cCBwb2ludHMgYnkgbWFudWFsbHkgY2FsbGluZyB0aGUgY2FsbGJhY2tzXG4gICAgYWMub25pbnB1dChudWxsKTtcbiAgICBwb2ludHMub25pbnB1dChudWxsKTtcbiAgICBwb2ludHMub25jaGFuZ2UobnVsbCk7XG4gICAgcG9pbnRzaXplLm9uaW5wdXQobnVsbCk7XG4gICAgaGFuZGxlUmVzaXplKCk7XG4gICAgZHJhd1NjZW5lKCk7XG59O1xuIiwiaW1wb3J0ICogYXMgV2ViR0xEZWJ1Z1V0aWxzIGZyb20gJ3dlYmdsLWRlYnVnJ1xuaW1wb3J0IHsgVlNfU09VUkNFLCBGU19TT1VSQ0UsIGNyZWF0ZVNoYWRlciB9IGZyb20gJy4vc2hhZGVycydcbmltcG9ydCB7IFVzZXJJbnB1dFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSdcblxuZXhwb3J0IGNsYXNzIFBhcnRpY2xlRW5naW5lIHtcbiAgICBwcml2YXRlIGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0O1xuICAgIHByaXZhdGUgY291bnQ6IG51bWJlcjtcbiAgICBwcml2YXRlIHRyYW5zZm9ybUZlZWRiYWNrOiBXZWJHTFRyYW5zZm9ybUZlZWRiYWNrO1xuICAgIHByaXZhdGUgdW5pZm9ybUxvY3MgPSB7XG4gICAgICAgIGFjY2VsOiBudWxsLFxuICAgICAgICBhY2NlbEFtb3VudDogbnVsbCxcbiAgICAgICAgbW91c2U6IG51bGwsXG4gICAgICAgIHBhcnRpY2xlU2l6ZTogbnVsbCxcbiAgICAgICAgZHQ6IG51bGwsXG4gICAgfTtcbiAgICBwcml2YXRlIGJ1ZmZlcnMgPSB7XG4gICAgICAgIHBvc2l0aW9uOiBbbnVsbCwgbnVsbF0sXG4gICAgICAgIHZlbG9jaXR5OiBbbnVsbCwgbnVsbF0sXG4gICAgfTtcbiAgICBwcml2YXRlIGF0dHJpYnV0ZUxvY3MgPSB7XG4gICAgICAgIHBvc2l0aW9uOiBudWxsLFxuICAgICAgICB2ZWxvY2l0eTogbnVsbCxcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBpbmRleCA9IDA7XG4gICAgcHJpdmF0ZSBwcmV2RnJhbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgcHJpdmF0ZSB0aHJvd09uR0xFcnJvcihlcnIsIGZ1bmNOYW1lLCBhcmdzKSB7XG4gICAgICAgIHRocm93IFdlYkdMRGVidWdVdGlscy5nbEVudW1Ub1N0cmluZyhlcnIpICsgXCIgd2FzIGNhdXNlZCBieSBjYWxsIHRvOiBcIiArIGZ1bmNOYW1lO1xuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcihjdHg6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsIGNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgLy90aGlzLmdsID0gV2ViR0xEZWJ1Z1V0aWxzLm1ha2VEZWJ1Z0NvbnRleHQoY3R4LCB0aGlzLnRocm93T25HTEVycm9yKTtcbiAgICAgICAgdGhpcy5nbCA9IGN0eDtcbiAgICAgICAgbGV0IGdsID0gdGhpcy5nbDtcblxuICAgICAgICBsZXQgdnMgPSBjcmVhdGVTaGFkZXIoZ2wsIGdsLlZFUlRFWF9TSEFERVIsIFZTX1NPVVJDRSk7XG4gICAgICAgIGxldCBmcyA9IGNyZWF0ZVNoYWRlcihnbCwgZ2wuRlJBR01FTlRfU0hBREVSLCBGU19TT1VSQ0UpO1xuICAgICAgICBsZXQgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHZzKTtcbiAgICAgICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZzKTtcbiAgICAgICAgZ2wudHJhbnNmb3JtRmVlZGJhY2tWYXJ5aW5ncyhwcm9ncmFtLCBbJ3ZfcG9zaXRpb24nLCAndl92ZWxvY2l0eSddLCBnbC5TRVBBUkFURV9BVFRSSUJTKTtcbiAgICAgICAgZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSk7XG5cbiAgICAgICAgdGhpcy5idWZmZXJzLnBvc2l0aW9uWzBdID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIHRoaXMuYnVmZmVycy52ZWxvY2l0eVswXSA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICB0aGlzLmJ1ZmZlcnMucG9zaXRpb25bMV0gPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgdGhpcy5idWZmZXJzLnZlbG9jaXR5WzFdID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG5cbiAgICAgICAgdGhpcy51bmlmb3JtTG9jcy5hY2NlbCA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCBcImFjY2VsXCIpO1xuICAgICAgICB0aGlzLnVuaWZvcm1Mb2NzLmFjY2VsQW1vdW50ID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIFwiYWNjZWxBbW91bnRcIik7XG4gICAgICAgIHRoaXMudW5pZm9ybUxvY3MubW91c2UgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgXCJtb3VzZVwiKTtcbiAgICAgICAgdGhpcy51bmlmb3JtTG9jcy5wYXJ0aWNsZVNpemUgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgXCJwYXJ0aWNsZVNpemVcIik7XG4gICAgICAgIHRoaXMudW5pZm9ybUxvY3MuZHQgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgXCJkdFwiKTtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVMb2NzLnBvc2l0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgXCJhX3Bvc2l0aW9uXCIpO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZUxvY3MudmVsb2NpdHkgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCBcImFfdmVsb2NpdHlcIik7XG5cbiAgICAgICAgbGV0IHZhbyA9IGdsLmNyZWF0ZVZlcnRleEFycmF5KCk7XG4gICAgICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh2YW8pO1xuXG4gICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuYXR0cmlidXRlTG9jcy52ZWxvY2l0eSk7XG4gICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuYXR0cmlidXRlTG9jcy5wb3NpdGlvbik7XG5cbiAgICAgICAgLy8gVGVsbCBpdCB0byB1c2Ugb3VyIHByb2dyYW0gKHBhaXIgb2Ygc2hhZGVycylcbiAgICAgICAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtKTtcblxuICAgICAgICAvLyBCaW5kIHRoZSBhdHRyaWJ1dGUvYnVmZmVyIHNldCB3ZSB3YW50LlxuICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkodmFvKTtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1GZWVkYmFjayA9IGdsLmNyZWF0ZVRyYW5zZm9ybUZlZWRiYWNrKCk7XG4gICAgICAgIHRoaXMucmVzZXRQYXJ0aWNsZXMoY291bnQpO1xuICAgIH1cblxuICAgIGRyYXcoc3RhdGU6IFVzZXJJbnB1dFN0YXRlKSB7XG4gICAgICAgIGxldCBnbCA9IHRoaXMuZ2w7XG4gICAgICAgIGxldCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICBsZXQgZHQgPSAobm93IC0gdGhpcy5wcmV2RnJhbWUpIC8gMTAwMC4wO1xuICAgICAgICB0aGlzLnByZXZGcmFtZSA9IG5vdztcbiAgICAgICAgZ2wudW5pZm9ybTFpKHRoaXMudW5pZm9ybUxvY3MuYWNjZWwsIHN0YXRlLmFjY2VsID8gMSA6IDApO1xuICAgICAgICBnbC51bmlmb3JtMWYodGhpcy51bmlmb3JtTG9jcy5hY2NlbEFtb3VudCwgc3RhdGUuYWNjZWxBbW91bnQpO1xuICAgICAgICBnbC51bmlmb3JtMmYodGhpcy51bmlmb3JtTG9jcy5tb3VzZSwgc3RhdGUubW91c2VbMF0sIHN0YXRlLm1vdXNlWzFdKTtcbiAgICAgICAgZ2wudW5pZm9ybTFmKHRoaXMudW5pZm9ybUxvY3MucGFydGljbGVTaXplLCBzdGF0ZS5wYXJ0aWNsZVNpemUpO1xuICAgICAgICBnbC51bmlmb3JtMWYodGhpcy51bmlmb3JtTG9jcy5kdCwgZHQpO1xuXG4gICAgICAgIC8vIFNldCB1cCBidWZmZXIgZGF0YVxuICAgICAgICBsZXQgc2l6ZSA9IDI7ICAgICAgICAgIC8vIDIgY29tcG9uZW50cyBwZXIgaXRlcmF0aW9uXG4gICAgICAgIGxldCB0eXBlID0gZ2wuRkxPQVQ7ICAgLy8gdGhlIGRhdGEgaXMgMzJiaXQgZmxvYXRzXG4gICAgICAgIGxldCBub3JtYWxpemUgPSBmYWxzZTsgLy8gZG9uJ3Qgbm9ybWFsaXplIHRoZSBkYXRhXG4gICAgICAgIGxldCBzdHJpZGUgPSAwOyAgICAgICAgLy8gMCA9IG1vdmUgZm9yd2FyZCBzaXplICogc2l6ZW9mKHR5cGUpIGVhY2ggaXRlcmF0aW9uIHRvIGdldCB0aGUgbmV4dCBwb3NpdGlvblxuICAgICAgICBsZXQgb2Zmc2V0ID0gMDsgICAgICAgIC8vIHN0YXJ0IGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGJ1ZmZlclxuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5idWZmZXJzLnBvc2l0aW9uW3RoaXMuaW5kZXhdKTtcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihcbiAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlTG9jcy5wb3NpdGlvbiwgc2l6ZSwgdHlwZSwgbm9ybWFsaXplLCBzdHJpZGUsIG9mZnNldCk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcnMudmVsb2NpdHlbdGhpcy5pbmRleF0pO1xuICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKFxuICAgICAgICAgICAgdGhpcy5hdHRyaWJ1dGVMb2NzLnZlbG9jaXR5LCBzaXplLCB0eXBlLCBub3JtYWxpemUsIHN0cmlkZSwgb2Zmc2V0KTtcblxuICAgICAgICBnbC5jbGVhckNvbG9yKDAuMDEsIDAuMDEsIDAuMDEsIDEpO1xuICAgICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUKTtcbiAgICAgICAgZ2wuYmluZFRyYW5zZm9ybUZlZWRiYWNrKGdsLlRSQU5TRk9STV9GRUVEQkFDSywgdGhpcy50cmFuc2Zvcm1GZWVkYmFjayk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXJCYXNlKGdsLlRSQU5TRk9STV9GRUVEQkFDS19CVUZGRVIsIDAsIHRoaXMuYnVmZmVycy5wb3NpdGlvblsxLXRoaXMuaW5kZXhdKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlckJhc2UoZ2wuVFJBTlNGT1JNX0ZFRURCQUNLX0JVRkZFUiwgMSwgdGhpcy5idWZmZXJzLnZlbG9jaXR5WzEtdGhpcy5pbmRleF0pO1xuICAgICAgICBnbC5iZWdpblRyYW5zZm9ybUZlZWRiYWNrKGdsLlBPSU5UUyk7XG4gICAgICAgIGdsLmRyYXdBcnJheXMoZ2wuUE9JTlRTLCAwLCB0aGlzLmNvdW50KTtcbiAgICAgICAgZ2wuZW5kVHJhbnNmb3JtRmVlZGJhY2soKTtcbiAgICAgICAgZ2wuYmluZEJ1ZmZlckJhc2UoZ2wuVFJBTlNGT1JNX0ZFRURCQUNLX0JVRkZFUiwgMCwgbnVsbCk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXJCYXNlKGdsLlRSQU5TRk9STV9GRUVEQkFDS19CVUZGRVIsIDEsIG51bGwpO1xuICAgICAgICAvLyBTd2FwIGJ1ZmZlcnNcbiAgICAgICAgdGhpcy5pbmRleCA9IDEgLSB0aGlzLmluZGV4O1xuICAgIH1cblxuICAgIHJlc2V0UGFydGljbGVzKGNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5jb3VudCA9IGNvdW50O1xuICAgICAgICBsZXQgcG9zaXRpb25zID0gW107XG4gICAgICAgIGxldCB2ZWxzID0gW107XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBwb3NpdGlvbnMucHVzaCgyICogTWF0aC5yYW5kb20oKSAtIDEpOyAvLyB4XG4gICAgICAgICAgICBwb3NpdGlvbnMucHVzaCgyICogTWF0aC5yYW5kb20oKSAtIDEpOyAvLyB5XG4gICAgICAgICAgICB2ZWxzLnB1c2goMC4wKTtcbiAgICAgICAgICAgIHZlbHMucHVzaCgwLjApO1xuICAgICAgICB9XG4gICAgICAgIGxldCBnbCA9IHRoaXMuZ2w7XG4gICAgICAgIC8vIEZpbGwgbWFpbiBidWZmZXJzXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcnMucG9zaXRpb25bMF0pO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShwb3NpdGlvbnMpLCBnbC5TVEFUSUNfRFJBVyk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcnMudmVsb2NpdHlbMF0pO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh2ZWxzKSwgZ2wuU1RBVElDX0RSQVcpO1xuXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcnMucG9zaXRpb25bMV0pO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShwb3NpdGlvbnMpLCBnbC5TVEFUSUNfRFJBVyk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcnMudmVsb2NpdHlbMV0pO1xuICAgICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh2ZWxzKSwgZ2wuU1RBVElDX0RSQVcpO1xuXG4gICAgICAgIC8vIFVuYmluZCBidWZmZXJcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xuICAgIH1cbn1cbiIsImxldCBWU19TT1VSQ0UgPSBgI3ZlcnNpb24gMzAwIGVzXG5cbiAgICB1bmlmb3JtIHZlYzIgbW91c2U7XG4gICAgdW5pZm9ybSBib29sIGFjY2VsO1xuICAgIHVuaWZvcm0gZmxvYXQgYWNjZWxBbW91bnQ7XG4gICAgdW5pZm9ybSBmbG9hdCBwYXJ0aWNsZVNpemU7XG4gICAgdW5pZm9ybSBmbG9hdCBkdDtcblxuICAgIGluIHZlYzIgYV9wb3NpdGlvbjtcbiAgICBpbiB2ZWMyIGFfdmVsb2NpdHk7XG4gICAgb3V0IHZlYzIgdl9wb3NpdGlvbjtcbiAgICBvdXQgdmVjMiB2X3ZlbG9jaXR5O1xuXG4gICAgLy8gZnJvbSBodHRwczovL3RoZWJvb2tvZnNoYWRlcnMuY29tLzEwL1xuICAgIGZsb2F0IHJhbmRvbSAodmVjMiBzdCkge1xuICAgICAgICByZXR1cm4gZnJhY3Qoc2luKGRvdChzdC54eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZWMyKDEyLjk4OTgsNzguMjMzKSkpKlxuICAgICAgICAgICAgNDM3NTguNTQ1MzEyMyk7XG4gICAgfVxuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICBnbF9Qb2ludFNpemUgPSBwYXJ0aWNsZVNpemU7XG4gICAgICAgIGdsX1Bvc2l0aW9uID0gdmVjNChhX3Bvc2l0aW9uLCAwLCAxKTtcbiAgICAgICAgLy8gUGFzcyB0aHJvdWdoIHRvIGZyYWdtZW50IHNoYWRlclxuICAgICAgICB2X3ZlbG9jaXR5ID0gYV92ZWxvY2l0eTtcbiAgICAgICAgLy92X3ZlbG9jaXR5LnkgLT0gMC4wMDAxO1xuXG4gICAgICAgIGlmKGFjY2VsKSB7XG4gICAgICAgICAgICB2ZWMyIGRlbCA9IG5vcm1hbGl6ZShtb3VzZSAtIGFfcG9zaXRpb24pO1xuICAgICAgICAgICAgaWYgKGFjY2VsQW1vdW50IDwgMC4wKSB7XG4gICAgICAgICAgICAgICAgdl92ZWxvY2l0eSAtPSAodmVjMihkZWwueSwgLWRlbC54KS81LjAgKyBkZWwpICogYWNjZWxBbW91bnQgKiBkdDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdl92ZWxvY2l0eSArPSBkZWwgKiBhY2NlbEFtb3VudCAqIGR0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRnJpY3Rpb25cbiAgICAgICAgdl92ZWxvY2l0eSAqPSAoMS4wIC0gMC4wMDUgKiAoMS4wICsgcmFuZG9tKHZfcG9zaXRpb24pKSk7XG5cbiAgICAgICAgLy8gVXBkYXRlIHBvcy92ZWwgZm9yIHRyYW5zZm9ybSBmZWVkYmFja1xuICAgICAgICB2X3Bvc2l0aW9uID0gYV9wb3NpdGlvbjtcbiAgICAgICAgdl9wb3NpdGlvbiArPSB2X3ZlbG9jaXR5ICogZHQ7XG4gICAgICAgIGlmKHZfcG9zaXRpb24ueCA+IDEuMCkge1xuICAgICAgICAgICAgdl9wb3NpdGlvbi54ID0gMi4wIC0gdl9wb3NpdGlvbi54O1xuICAgICAgICAgICAgdl92ZWxvY2l0eS54ID0gLXZfdmVsb2NpdHkueDtcbiAgICAgICAgfVxuICAgICAgICBpZih2X3Bvc2l0aW9uLnkgPiAxLjApIHtcbiAgICAgICAgICAgIHZfcG9zaXRpb24ueSA9IDIuMCAtIHZfcG9zaXRpb24ueTtcbiAgICAgICAgICAgIHZfdmVsb2NpdHkueSA9IC12X3ZlbG9jaXR5Lnk7XG4gICAgICAgIH1cbiAgICAgICAgaWYodl9wb3NpdGlvbi54IDwgLTEuMCkge1xuICAgICAgICAgICAgdl9wb3NpdGlvbi54ID0gLTIuMCAtIHZfcG9zaXRpb24ueDtcbiAgICAgICAgICAgIHZfdmVsb2NpdHkueCA9IC12X3ZlbG9jaXR5Lng7XG4gICAgICAgIH1cbiAgICAgICAgaWYodl9wb3NpdGlvbi55IDwgLTEuMCkge1xuICAgICAgICAgICAgdl9wb3NpdGlvbi55ID0gLTIuMCAtIHZfcG9zaXRpb24ueTtcbiAgICAgICAgICAgIHZfdmVsb2NpdHkueSA9IC12X3ZlbG9jaXR5Lnk7XG4gICAgICAgIH1cbiAgICB9XG5gO1xuXG5sZXQgRlNfU09VUkNFID0gYCN2ZXJzaW9uIDMwMCBlc1xuXG4gICAgLy8gZnJhZ21lbnQgc2hhZGVycyBkb24ndCBoYXZlIGEgZGVmYXVsdCBwcmVjaXNpb24gc28gd2UgbmVlZFxuICAgIC8vIHRvIHBpY2sgb25lLiBtZWRpdW1wIGlzIGEgZ29vZCBkZWZhdWx0LiBJdCBtZWFucyBcIm1lZGl1bSBwcmVjaXNpb25cIlxuICAgIHByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xuXG4gICAgaW4gdmVjMiB2X3ZlbG9jaXR5O1xuICAgIC8vIHdlIG5lZWQgdG8gZGVjbGFyZSBhbiBvdXRwdXQgZm9yIHRoZSBmcmFnbWVudCBzaGFkZXJcbiAgICBvdXQgdmVjNCBvdXRDb2xvcjtcblxuICAgIHZlYzMgaHN2MnJnYih2ZWMzIGMpIHtcbiAgICAgICAgdmVjNCBLID0gdmVjNCgxLjAsIDIuMCAvIDMuMCwgMS4wIC8gMy4wLCAzLjApO1xuICAgICAgICB2ZWMzIHAgPSBhYnMoZnJhY3QoYy54eHggKyBLLnh5eikgKiA2LjAgLSBLLnd3dyk7XG4gICAgICAgIHJldHVybiBjLnogKiBtaXgoSy54eHgsIGNsYW1wKHAgLSBLLnh4eCwgMC4wLCAxLjApLCBjLnkpO1xuICAgIH1cblxuICAgIHZvaWQgbWFpbigpIHtcbiAgICAgICAgLy8gVGVjaG5pY2FsbHkgSFNWIGlzIHN1cHBvc2VkIHRvIGJlIGJldHdlZW4gMCBhbmQgMSBidXQgSSBmb3VuZCB0aGF0XG4gICAgICAgIC8vIGxldHRpbmcgdGhlIHZhbHVlIGdvIGhpZ2hlciBjYXVzZXMgaXQgdG8gd3JhcC1hcm91bmQgYW5kIGxvb2sgY29vbFxuICAgICAgICBmbG9hdCB2ZWwgPSBjbGFtcChsZW5ndGgodl92ZWxvY2l0eSkgKiAwLjgsIDAuMCwgMi4wKTtcbiAgICAgICAgb3V0Q29sb3IgPSB2ZWM0KFxuICAgICAgICAgICAgaHN2MnJnYih2ZWMzKFxuICAgICAgICAgICAgICAgIDAuNiAtIHZlbCAqIDAuNiwgIC8vIGh1ZVxuICAgICAgICAgICAgICAgIDEuMCwgICAgICAgICAgICAgICAvLyBzYXRcbiAgICAgICAgICAgICAgICBtYXgoMC4yICsgdmVsLCAwLjgpIC8vIHZpYnJhbmNlXG4gICAgICAgICAgICApKSxcbiAgICAgICAgMS4wKTtcbiAgICB9XG5gO1xuXG4vLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly93ZWJnbDJmdW5kYW1lbnRhbHMub3JnL3dlYmdsL2xlc3NvbnMvd2ViZ2wtZnVuZGFtZW50YWxzLmh0bWxcbmZ1bmN0aW9uIGNyZWF0ZVNoYWRlcihnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgdHlwZTogbnVtYmVyLCBzb3VyY2U6IHN0cmluZykge1xuICAgIGxldCBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIodHlwZSk7XG4gICAgZ2wuc2hhZGVyU291cmNlKHNoYWRlciwgc291cmNlKTtcbiAgICBnbC5jb21waWxlU2hhZGVyKHNoYWRlcik7XG4gICAgbGV0IHN1Y2Nlc3MgPSBnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoc2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUyk7XG4gICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgcmV0dXJuIHNoYWRlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgZSA9IFwiU2hhZGVyIGJ1aWxkIGVycm9yOiBcIiArIGdsLmdldFNoYWRlckluZm9Mb2coc2hhZGVyKTtcbiAgICAgICAgZ2wuZGVsZXRlU2hhZGVyKHNoYWRlcik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlKTtcbiAgICB9XG59XG5leHBvcnQge1ZTX1NPVVJDRSwgRlNfU09VUkNFLCBjcmVhdGVTaGFkZXJ9XG4iLCJleHBvcnQgY2xhc3MgVXNlcklucHV0U3RhdGUge1xuICAgIG1vdXNlID0gWzAsIDBdO1xuICAgIGFjY2VsID0gZmFsc2U7XG4gICAgcGFydGljbGVTaXplID0gMS4wO1xuICAgIGFjY2VsQW1vdW50ID0gMC4wMDE7XG59XG4iXX0=
