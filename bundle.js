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
        state.accelAmount = Number(this.value) * 0.0001;
        acval.textContent = state.accelAmount.toPrecision(3);
    };
    var pointsVal = document.getElementById("pointsVal");
    var points = document.getElementById("points");
    var newCount = 0;
    points.oninput = function (ev) {
        newCount = Math.round(500 * Math.exp(Number(this.value) / 12));
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
            particleSize: null
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
        gl.uniform1i(this.uniformLocs.accel, state.accel ? 1 : 0);
        gl.uniform1f(this.uniformLocs.accelAmount, state.accelAmount);
        gl.uniform2f(this.uniformLocs.mouse, state.mouse[0], state.mouse[1]);
        gl.uniform1f(this.uniformLocs.particleSize, state.particleSize);
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
var VS_SOURCE = "#version 300 es\n\n    uniform vec2 mouse;\n    uniform bool accel;\n    uniform float accelAmount;\n    uniform float particleSize;\n\n    in vec2 a_position;\n    in vec2 a_velocity;\n    out vec2 v_position;\n    out vec2 v_velocity;\n\n    // from https://thebookofshaders.com/10/\n    float random (vec2 st) {\n        return fract(sin(dot(st.xy,\n                            vec2(12.9898,78.233)))*\n            43758.5453123);\n    }\n\n    void main() {\n        gl_PointSize = particleSize;\n        gl_Position = vec4(a_position, 0, 1);\n        // Pass through to fragment shader\n        v_velocity = a_velocity;\n        //v_velocity.y -= 0.0001;\n\n        if(accel) {\n            vec2 del = normalize(mouse - a_position);\n            if (accelAmount < 0.0) {\n                v_velocity -= vec2(del.y, -del.x)*accelAmount/5.0 + del * accelAmount;\n            } else {\n                v_velocity += del * accelAmount;\n            }\n        }\n\n        // Friction\n        v_velocity *= (1.0 - 0.01 * (1.0 + random(v_position)));\n\n        // Update pos/vel for transform feedback\n        v_position = a_position;\n        v_position += v_velocity;\n        if(v_position.x > 1.0) {\n            v_position.x = 2.0 - v_position.x;\n            v_velocity.x = -v_velocity.x;\n        }\n        if(v_position.y > 1.0) {\n            v_position.y = 2.0 - v_position.y;\n            v_velocity.y = -v_velocity.y;\n        }\n        if(v_position.x < -1.0) {\n            v_position.x = -2.0 - v_position.x;\n            v_velocity.x = -v_velocity.x;\n        }\n        if(v_position.y < -1.0) {\n            v_position.y = -2.0 - v_position.y;\n            v_velocity.y = -v_velocity.y;\n        }\n    }\n";
exports.VS_SOURCE = VS_SOURCE;
var FS_SOURCE = "#version 300 es\n\n    // fragment shaders don't have a default precision so we need\n    // to pick one. mediump is a good default. It means \"medium precision\"\n    precision mediump float;\n\n    in vec2 v_velocity;\n    // we need to declare an output for the fragment shader\n    out vec4 outColor;\n\n    vec3 hsv2rgb(vec3 c) {\n        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n    }\n\n    void main() {\n        // Technically HSV is supposed to be between 0 and 1 but I found that\n        // letting the value go higher causes it to wrap-around and look cool\n        float vel = clamp(length(v_velocity) * 20.0, 0.0, 2.0);\n        outColor = vec4(\n            hsv2rgb(vec3(\n                0.6 - vel * 0.6,  // hue\n                1.0,               // sat\n                max(0.2 + vel, 0.8) // vibrance\n            )),\n        1.0);\n    }\n";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvd2ViZ2wtZGVidWcvaW5kZXguanMiLCJzcmMvaW5kZXgudHMiLCJzcmMvcGFydGljbGVfZW5naW5lLnRzIiwic3JjL3NoYWRlcnMudHMiLCJzcmMvc3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7OztBQ2hyQ0EscURBQWtEO0FBQ2xELGlDQUF5QztBQUV6QyxNQUFNLENBQUMsTUFBTSxHQUFHO0lBQ1osZUFBZTtJQUNmLElBQUksTUFBTSxHQUFzQixRQUFR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Y2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLypcbioqIENvcHlyaWdodCAoYykgMjAxMiBUaGUgS2hyb25vcyBHcm91cCBJbmMuXG4qKlxuKiogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbioqIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQvb3IgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbioqIFwiTWF0ZXJpYWxzXCIpLCB0byBkZWFsIGluIHRoZSBNYXRlcmlhbHMgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4qKiB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4qKiBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIE1hdGVyaWFscywgYW5kIHRvXG4qKiBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBNYXRlcmlhbHMgYXJlIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xuKiogdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuKipcbioqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4qKiBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBNYXRlcmlhbHMuXG4qKlxuKiogVEhFIE1BVEVSSUFMUyBBUkUgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuKiogRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4qKiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuXG4qKiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWVxuKiogQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCxcbioqIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFXG4qKiBNQVRFUklBTFMgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgTUFURVJJQUxTLlxuKi9cblxuLy9Qb3J0ZWQgdG8gbm9kZSBieSBNYXJjaW4gSWduYWMgb24gMjAxNi0wNS0yMFxuXG4vLyBWYXJpb3VzIGZ1bmN0aW9ucyBmb3IgaGVscGluZyBkZWJ1ZyBXZWJHTCBhcHBzLlxuXG5XZWJHTERlYnVnVXRpbHMgPSBmdW5jdGlvbigpIHtcbnZhciB3aW5kb3dcblxuLy9wb2x5ZmlsbCB3aW5kb3cgaW4gbm9kZVxuaWYgKHR5cGVvZih3aW5kb3cpID09ICd1bmRlZmluZWQnKSB7XG4gICAgd2luZG93ID0gZ2xvYmFsO1xufVxuXG4vKipcbiAqIFdyYXBwZWQgbG9nZ2luZyBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtc2cgTWVzc2FnZSB0byBsb2cuXG4gKi9cbnZhciBsb2cgPSBmdW5jdGlvbihtc2cpIHtcbiAgaWYgKHdpbmRvdy5jb25zb2xlICYmIHdpbmRvdy5jb25zb2xlLmxvZykge1xuICAgIHdpbmRvdy5jb25zb2xlLmxvZyhtc2cpO1xuICB9XG59O1xuXG4vKipcbiAqIFdyYXBwZWQgZXJyb3IgbG9nZ2luZyBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBtc2cgTWVzc2FnZSB0byBsb2cuXG4gKi9cbnZhciBlcnJvciA9IGZ1bmN0aW9uKG1zZykge1xuICBpZiAod2luZG93LmNvbnNvbGUgJiYgd2luZG93LmNvbnNvbGUuZXJyb3IpIHtcbiAgICB3aW5kb3cuY29uc29sZS5lcnJvcihtc2cpO1xuICB9IGVsc2Uge1xuICAgIGxvZyhtc2cpO1xuICB9XG59O1xuXG5cbi8qKlxuICogV2hpY2ggYXJndW1lbnRzIGFyZSBlbnVtcyBiYXNlZCBvbiB0aGUgbnVtYmVyIG9mIGFyZ3VtZW50cyB0byB0aGUgZnVuY3Rpb24uXG4gKiBTb1xuICogICAgJ3RleEltYWdlMkQnOiB7XG4gKiAgICAgICA5OiB7IDA6dHJ1ZSwgMjp0cnVlLCA2OnRydWUsIDc6dHJ1ZSB9LFxuICogICAgICAgNjogeyAwOnRydWUsIDI6dHJ1ZSwgMzp0cnVlLCA0OnRydWUgfSxcbiAqICAgIH0sXG4gKlxuICogbWVhbnMgaWYgdGhlcmUgYXJlIDkgYXJndW1lbnRzIHRoZW4gNiBhbmQgNyBhcmUgZW51bXMsIGlmIHRoZXJlIGFyZSA2XG4gKiBhcmd1bWVudHMgMyBhbmQgNCBhcmUgZW51bXNcbiAqXG4gKiBAdHlwZSB7IU9iamVjdC48bnVtYmVyLCAhT2JqZWN0LjxudW1iZXIsIHN0cmluZz59XG4gKi9cbnZhciBnbFZhbGlkRW51bUNvbnRleHRzID0ge1xuICAvLyBHZW5lcmljIHNldHRlcnMgYW5kIGdldHRlcnNcblxuICAnZW5hYmxlJzogezE6IHsgMDp0cnVlIH19LFxuICAnZGlzYWJsZSc6IHsxOiB7IDA6dHJ1ZSB9fSxcbiAgJ2dldFBhcmFtZXRlcic6IHsxOiB7IDA6dHJ1ZSB9fSxcblxuICAvLyBSZW5kZXJpbmdcblxuICAnZHJhd0FycmF5cyc6IHszOnsgMDp0cnVlIH19LFxuICAnZHJhd0VsZW1lbnRzJzogezQ6eyAwOnRydWUsIDI6dHJ1ZSB9fSxcblxuICAvLyBTaGFkZXJzXG5cbiAgJ2NyZWF0ZVNoYWRlcic6IHsxOiB7IDA6dHJ1ZSB9fSxcbiAgJ2dldFNoYWRlclBhcmFtZXRlcic6IHsyOiB7IDE6dHJ1ZSB9fSxcbiAgJ2dldFByb2dyYW1QYXJhbWV0ZXInOiB7MjogeyAxOnRydWUgfX0sXG4gICdnZXRTaGFkZXJQcmVjaXNpb25Gb3JtYXQnOiB7MjogeyAwOiB0cnVlLCAxOnRydWUgfX0sXG5cbiAgLy8gVmVydGV4IGF0dHJpYnV0ZXNcblxuICAnZ2V0VmVydGV4QXR0cmliJzogezI6IHsgMTp0cnVlIH19LFxuICAndmVydGV4QXR0cmliUG9pbnRlcic6IHs2OiB7IDI6dHJ1ZSB9fSxcblxuICAvLyBUZXh0dXJlc1xuXG4gICdiaW5kVGV4dHVyZSc6IHsyOiB7IDA6dHJ1ZSB9fSxcbiAgJ2FjdGl2ZVRleHR1cmUnOiB7MTogeyAwOnRydWUgfX0sXG4gICdnZXRUZXhQYXJhbWV0ZXInOiB7MjogeyAwOnRydWUsIDE6dHJ1ZSB9fSxcbiAgJ3RleFBhcmFtZXRlcmYnOiB7MzogeyAwOnRydWUsIDE6dHJ1ZSB9fSxcbiAgJ3RleFBhcmFtZXRlcmknOiB7MzogeyAwOnRydWUsIDE6dHJ1ZSwgMjp0cnVlIH19LFxuICAvLyB0ZXhJbWFnZTJEIGFuZCB0ZXhTdWJJbWFnZTJEIGFyZSBkZWZpbmVkIGJlbG93IHdpdGggV2ViR0wgMiBlbnRyeXBvaW50c1xuICAnY29weVRleEltYWdlMkQnOiB7ODogeyAwOnRydWUsIDI6dHJ1ZSB9fSxcbiAgJ2NvcHlUZXhTdWJJbWFnZTJEJzogezg6IHsgMDp0cnVlIH19LFxuICAnZ2VuZXJhdGVNaXBtYXAnOiB7MTogeyAwOnRydWUgfX0sXG4gIC8vIGNvbXByZXNzZWRUZXhJbWFnZTJEIGFuZCBjb21wcmVzc2VkVGV4U3ViSW1hZ2UyRCBhcmUgZGVmaW5lZCBiZWxvdyB3aXRoIFdlYkdMIDIgZW50cnlwb2ludHNcblxuICAvLyBCdWZmZXIgb2JqZWN0c1xuXG4gICdiaW5kQnVmZmVyJzogezI6IHsgMDp0cnVlIH19LFxuICAvLyBidWZmZXJEYXRhIGFuZCBidWZmZXJTdWJEYXRhIGFyZSBkZWZpbmVkIGJlbG93IHdpdGggV2ViR0wgMiBlbnRyeXBvaW50c1xuICAnZ2V0QnVmZmVyUGFyYW1ldGVyJzogezI6IHsgMDp0cnVlLCAxOnRydWUgfX0sXG5cbiAgLy8gUmVuZGVyYnVmZmVycyBhbmQgZnJhbWVidWZmZXJzXG5cbiAgJ3BpeGVsU3RvcmVpJzogezI6IHsgMDp0cnVlLCAxOnRydWUgfX0sXG4gIC8vIHJlYWRQaXhlbHMgaXMgZGVmaW5lZCBiZWxvdyB3aXRoIFdlYkdMIDIgZW50cnlwb2ludHNcbiAgJ2JpbmRSZW5kZXJidWZmZXInOiB7MjogeyAwOnRydWUgfX0sXG4gICdiaW5kRnJhbWVidWZmZXInOiB7MjogeyAwOnRydWUgfX0sXG4gICdjaGVja0ZyYW1lYnVmZmVyU3RhdHVzJzogezE6IHsgMDp0cnVlIH19LFxuICAnZnJhbWVidWZmZXJSZW5kZXJidWZmZXInOiB7NDogeyAwOnRydWUsIDE6dHJ1ZSwgMjp0cnVlIH19LFxuICAnZnJhbWVidWZmZXJUZXh0dXJlMkQnOiB7NTogeyAwOnRydWUsIDE6dHJ1ZSwgMjp0cnVlIH19LFxuICAnZ2V0RnJhbWVidWZmZXJBdHRhY2htZW50UGFyYW1ldGVyJzogezM6IHsgMDp0cnVlLCAxOnRydWUsIDI6dHJ1ZSB9fSxcbiAgJ2dldFJlbmRlcmJ1ZmZlclBhcmFtZXRlcic6IHsyOiB7IDA6dHJ1ZSwgMTp0cnVlIH19LFxuICAncmVuZGVyYnVmZmVyU3RvcmFnZSc6IHs0OiB7IDA6dHJ1ZSwgMTp0cnVlIH19LFxuXG4gIC8vIEZyYW1lIGJ1ZmZlciBvcGVyYXRpb25zIChjbGVhciwgYmxlbmQsIGRlcHRoIHRlc3QsIHN0ZW5jaWwpXG5cbiAgJ2NsZWFyJzogezE6IHsgMDogeyAnZW51bUJpdHdpc2VPcic6IFsnQ09MT1JfQlVGRkVSX0JJVCcsICdERVBUSF9CVUZGRVJfQklUJywgJ1NURU5DSUxfQlVGRkVSX0JJVCddIH19fSxcbiAgJ2RlcHRoRnVuYyc6IHsxOiB7IDA6dHJ1ZSB9fSxcbiAgJ2JsZW5kRnVuYyc6IHsyOiB7IDA6dHJ1ZSwgMTp0cnVlIH19LFxuICAnYmxlbmRGdW5jU2VwYXJhdGUnOiB7NDogeyAwOnRydWUsIDE6dHJ1ZSwgMjp0cnVlLCAzOnRydWUgfX0sXG4gICdibGVuZEVxdWF0aW9uJzogezE6IHsgMDp0cnVlIH19LFxuICAnYmxlbmRFcXVhdGlvblNlcGFyYXRlJzogezI6IHsgMDp0cnVlLCAxOnRydWUgfX0sXG4gICdzdGVuY2lsRnVuYyc6IHszOiB7IDA6dHJ1ZSB9fSxcbiAgJ3N0ZW5jaWxGdW5jU2VwYXJhdGUnOiB7NDogeyAwOnRydWUsIDE6dHJ1ZSB9fSxcbiAgJ3N0ZW5jaWxNYXNrU2VwYXJhdGUnOiB7MjogeyAwOnRydWUgfX0sXG4gICdzdGVuY2lsT3AnOiB7MzogeyAwOnRydWUsIDE6dHJ1ZSwgMjp0cnVlIH19LFxuICAnc3RlbmNpbE9wU2VwYXJhdGUnOiB7NDogeyAwOnRydWUsIDE6dHJ1ZSwgMjp0cnVlLCAzOnRydWUgfX0sXG5cbiAgLy8gQ3VsbGluZ1xuXG4gICdjdWxsRmFjZSc6IHsxOiB7IDA6dHJ1ZSB9fSxcbiAgJ2Zyb250RmFjZSc6IHsxOiB7IDA6dHJ1ZSB9fSxcblxuICAvLyBBTkdMRV9pbnN0YW5jZWRfYXJyYXlzIGV4dGVuc2lvblxuXG4gICdkcmF3QXJyYXlzSW5zdGFuY2VkQU5HTEUnOiB7NDogeyAwOnRydWUgfX0sXG4gICdkcmF3RWxlbWVudHNJbnN0YW5jZWRBTkdMRSc6IHs1OiB7IDA6dHJ1ZSwgMjp0cnVlIH19LFxuXG4gIC8vIEVYVF9ibGVuZF9taW5tYXggZXh0ZW5zaW9uXG5cbiAgJ2JsZW5kRXF1YXRpb25FWFQnOiB7MTogeyAwOnRydWUgfX0sXG5cbiAgLy8gV2ViR0wgMiBCdWZmZXIgb2JqZWN0c1xuXG4gICdidWZmZXJEYXRhJzoge1xuICAgIDM6IHsgMDp0cnVlLCAyOnRydWUgfSwgLy8gV2ViR0wgMVxuICAgIDQ6IHsgMDp0cnVlLCAyOnRydWUgfSwgLy8gV2ViR0wgMlxuICAgIDU6IHsgMDp0cnVlLCAyOnRydWUgfSAgLy8gV2ViR0wgMlxuICB9LFxuICAnYnVmZmVyU3ViRGF0YSc6IHtcbiAgICAzOiB7IDA6dHJ1ZSB9LCAvLyBXZWJHTCAxXG4gICAgNDogeyAwOnRydWUgfSwgLy8gV2ViR0wgMlxuICAgIDU6IHsgMDp0cnVlIH0gIC8vIFdlYkdMIDJcbiAgfSxcbiAgJ2NvcHlCdWZmZXJTdWJEYXRhJzogezU6IHsgMDp0cnVlLCAxOnRydWUgfX0sXG4gICdnZXRCdWZmZXJTdWJEYXRhJzogezM6IHsgMDp0cnVlIH0sIDQ6IHsgMDp0cnVlIH0sIDU6IHsgMDp0cnVlIH19LFxuXG4gIC8vIFdlYkdMIDIgRnJhbWVidWZmZXIgb2JqZWN0c1xuXG4gICdibGl0RnJhbWVidWZmZXInOiB7MTA6IHsgODogeyAnZW51bUJpdHdpc2VPcic6IFsnQ09MT1JfQlVGRkVSX0JJVCcsICdERVBUSF9CVUZGRVJfQklUJywgJ1NURU5DSUxfQlVGRkVSX0JJVCddIH0sIDk6dHJ1ZSB9fSxcbiAgJ2ZyYW1lYnVmZmVyVGV4dHVyZUxheWVyJzogezU6IHsgMDp0cnVlLCAxOnRydWUgfX0sXG4gICdpbnZhbGlkYXRlRnJhbWVidWZmZXInOiB7MjogeyAwOnRydWUgfX0sXG4gICdpbnZhbGlkYXRlU3ViRnJhbWVidWZmZXInOiB7NjogeyAwOnRydWUgfX0sXG4gICdyZWFkQnVmZmVyJzogezE6IHsgMDp0cnVlIH19LFxuXG4gIC8vIFdlYkdMIDIgUmVuZGVyYnVmZmVyIG9iamVjdHNcblxuICAnZ2V0SW50ZXJuYWxmb3JtYXRQYXJhbWV0ZXInOiB7MzogeyAwOnRydWUsIDE6dHJ1ZSwgMjp0cnVlIH19LFxuICAncmVuZGVyYnVmZmVyU3RvcmFnZU11bHRpc2FtcGxlJzogezU6IHsgMDp0cnVlLCAyOnRydWUgfX0sXG5cbiAgLy8gV2ViR0wgMiBUZXh0dXJlIG9iamVjdHNcblxuICAndGV4U3RvcmFnZTJEJzogezU6IHsgMDp0cnVlLCAyOnRydWUgfX0sXG4gICd0ZXhTdG9yYWdlM0QnOiB7NjogeyAwOnRydWUsIDI6dHJ1ZSB9fSxcbiAgJ3RleEltYWdlMkQnOiB7XG4gICAgOTogeyAwOnRydWUsIDI6dHJ1ZSwgNjp0cnVlLCA3OnRydWUgfSwgLy8gV2ViR0wgMSAmIDJcbiAgICA2OiB7IDA6dHJ1ZSwgMjp0cnVlLCAzOnRydWUsIDQ6dHJ1ZSB9LCAvLyBXZWJHTCAxXG4gICAgMTA6IHsgMDp0cnVlLCAyOnRydWUsIDY6dHJ1ZSwgNzp0cnVlIH0gLy8gV2ViR0wgMlxuICB9LFxuICAndGV4SW1hZ2UzRCc6IHtcbiAgICAxMDogeyAwOnRydWUsIDI6dHJ1ZSwgNzp0cnVlLCA4OnRydWUgfSxcbiAgICAxMTogeyAwOnRydWUsIDI6dHJ1ZSwgNzp0cnVlLCA4OnRydWUgfVxuICB9LFxuICAndGV4U3ViSW1hZ2UyRCc6IHtcbiAgICA5OiB7IDA6dHJ1ZSwgNjp0cnVlLCA3OnRydWUgfSwgLy8gV2ViR0wgMSAmIDJcbiAgICA3OiB7IDA6dHJ1ZSwgNDp0cnVlLCA1OnRydWUgfSwgLy8gV2ViR0wgMVxuICAgIDEwOiB7IDA6dHJ1ZSwgNjp0cnVlLCA3OnRydWUgfSAvLyBXZWJHTCAyXG4gIH0sXG4gICd0ZXhTdWJJbWFnZTNEJzoge1xuICAgIDExOiB7IDA6dHJ1ZSwgODp0cnVlLCA5OnRydWUgfSxcbiAgICAxMjogeyAwOnRydWUsIDg6dHJ1ZSwgOTp0cnVlIH1cbiAgfSxcbiAgJ2NvcHlUZXhTdWJJbWFnZTNEJzogezk6IHsgMDp0cnVlIH19LFxuICAnY29tcHJlc3NlZFRleEltYWdlMkQnOiB7XG4gICAgNzogeyAwOiB0cnVlLCAyOnRydWUgfSwgLy8gV2ViR0wgMSAmIDJcbiAgICA4OiB7IDA6IHRydWUsIDI6dHJ1ZSB9LCAvLyBXZWJHTCAyXG4gICAgOTogeyAwOiB0cnVlLCAyOnRydWUgfSAgLy8gV2ViR0wgMlxuICB9LFxuICAnY29tcHJlc3NlZFRleEltYWdlM0QnOiB7XG4gICAgODogeyAwOiB0cnVlLCAyOnRydWUgfSxcbiAgICA5OiB7IDA6IHRydWUsIDI6dHJ1ZSB9LFxuICAgIDEwOiB7IDA6IHRydWUsIDI6dHJ1ZSB9XG4gIH0sXG4gICdjb21wcmVzc2VkVGV4U3ViSW1hZ2UyRCc6IHtcbiAgICA4OiB7IDA6IHRydWUsIDY6dHJ1ZSB9LCAvLyBXZWJHTCAxICYgMlxuICAgIDk6IHsgMDogdHJ1ZSwgNjp0cnVlIH0sIC8vIFdlYkdMIDJcbiAgICAxMDogeyAwOiB0cnVlLCA2OnRydWUgfSAvLyBXZWJHTCAyXG4gIH0sXG4gICdjb21wcmVzc2VkVGV4U3ViSW1hZ2UzRCc6IHtcbiAgICAxMDogeyAwOiB0cnVlLCA4OnRydWUgfSxcbiAgICAxMTogeyAwOiB0cnVlLCA4OnRydWUgfSxcbiAgICAxMjogeyAwOiB0cnVlLCA4OnRydWUgfVxuICB9LFxuXG4gIC8vIFdlYkdMIDIgVmVydGV4IGF0dHJpYnNcblxuICAndmVydGV4QXR0cmliSVBvaW50ZXInOiB7NTogeyAyOnRydWUgfX0sXG5cbiAgLy8gV2ViR0wgMiBXcml0aW5nIHRvIHRoZSBkcmF3aW5nIGJ1ZmZlclxuXG4gICdkcmF3QXJyYXlzSW5zdGFuY2VkJzogezQ6IHsgMDp0cnVlIH19LFxuICAnZHJhd0VsZW1lbnRzSW5zdGFuY2VkJzogezU6IHsgMDp0cnVlLCAyOnRydWUgfX0sXG4gICdkcmF3UmFuZ2VFbGVtZW50cyc6IHs2OiB7IDA6dHJ1ZSwgNDp0cnVlIH19LFxuXG4gIC8vIFdlYkdMIDIgUmVhZGluZyBiYWNrIHBpeGVsc1xuXG4gICdyZWFkUGl4ZWxzJzoge1xuICAgIDc6IHsgNDp0cnVlLCA1OnRydWUgfSwgLy8gV2ViR0wgMSAmIDJcbiAgICA4OiB7IDQ6dHJ1ZSwgNTp0cnVlIH0gIC8vIFdlYkdMIDJcbiAgfSxcblxuICAvLyBXZWJHTCAyIE11bHRpcGxlIFJlbmRlciBUYXJnZXRzXG5cbiAgJ2NsZWFyQnVmZmVyZnYnOiB7MzogeyAwOnRydWUgfSwgNDogeyAwOnRydWUgfX0sXG4gICdjbGVhckJ1ZmZlcml2JzogezM6IHsgMDp0cnVlIH0sIDQ6IHsgMDp0cnVlIH19LFxuICAnY2xlYXJCdWZmZXJ1aXYnOiB7MzogeyAwOnRydWUgfSwgNDogeyAwOnRydWUgfX0sXG4gICdjbGVhckJ1ZmZlcmZpJzogezQ6IHsgMDp0cnVlIH19LFxuXG4gIC8vIFdlYkdMIDIgUXVlcnkgb2JqZWN0c1xuXG4gICdiZWdpblF1ZXJ5JzogezI6IHsgMDp0cnVlIH19LFxuICAnZW5kUXVlcnknOiB7MTogeyAwOnRydWUgfX0sXG4gICdnZXRRdWVyeSc6IHsyOiB7IDA6dHJ1ZSwgMTp0cnVlIH19LFxuICAnZ2V0UXVlcnlQYXJhbWV0ZXInOiB7MjogeyAxOnRydWUgfX0sXG5cbiAgLy8gV2ViR0wgMiBTYW1wbGVyIG9iamVjdHNcblxuICAnc2FtcGxlclBhcmFtZXRlcmknOiB7MzogeyAxOnRydWUsIDI6dHJ1ZSB9fSxcbiAgJ3NhbXBsZXJQYXJhbWV0ZXJmJzogezM6IHsgMTp0cnVlIH19LFxuICAnZ2V0U2FtcGxlclBhcmFtZXRlcic6IHsyOiB7IDE6dHJ1ZSB9fSxcblxuICAvLyBXZWJHTCAyIFN5bmMgb2JqZWN0c1xuXG4gICdmZW5jZVN5bmMnOiB7MjogeyAwOnRydWUsIDE6IHsgJ2VudW1CaXR3aXNlT3InOiBbXSB9IH19LFxuICAnY2xpZW50V2FpdFN5bmMnOiB7MzogeyAxOiB7ICdlbnVtQml0d2lzZU9yJzogWydTWU5DX0ZMVVNIX0NPTU1BTkRTX0JJVCddIH0gfX0sXG4gICd3YWl0U3luYyc6IHszOiB7IDE6IHsgJ2VudW1CaXR3aXNlT3InOiBbXSB9IH19LFxuICAnZ2V0U3luY1BhcmFtZXRlcic6IHsyOiB7IDE6dHJ1ZSB9fSxcblxuICAvLyBXZWJHTCAyIFRyYW5zZm9ybSBGZWVkYmFja1xuXG4gICdiaW5kVHJhbnNmb3JtRmVlZGJhY2snOiB7MjogeyAwOnRydWUgfX0sXG4gICdiZWdpblRyYW5zZm9ybUZlZWRiYWNrJzogezE6IHsgMDp0cnVlIH19LFxuICAndHJhbnNmb3JtRmVlZGJhY2tWYXJ5aW5ncyc6IHszOiB7IDI6dHJ1ZSB9fSxcblxuICAvLyBXZWJHTDIgVW5pZm9ybSBCdWZmZXIgT2JqZWN0cyBhbmQgVHJhbnNmb3JtIEZlZWRiYWNrIEJ1ZmZlcnNcblxuICAnYmluZEJ1ZmZlckJhc2UnOiB7MzogeyAwOnRydWUgfX0sXG4gICdiaW5kQnVmZmVyUmFuZ2UnOiB7NTogeyAwOnRydWUgfX0sXG4gICdnZXRJbmRleGVkUGFyYW1ldGVyJzogezI6IHsgMDp0cnVlIH19LFxuICAnZ2V0QWN0aXZlVW5pZm9ybXMnOiB7MzogeyAyOnRydWUgfX0sXG4gICdnZXRBY3RpdmVVbmlmb3JtQmxvY2tQYXJhbWV0ZXInOiB7MzogeyAyOnRydWUgfX1cbn07XG5cbi8qKlxuICogTWFwIG9mIG51bWJlcnMgdG8gbmFtZXMuXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG52YXIgZ2xFbnVtcyA9IG51bGw7XG5cbi8qKlxuICogTWFwIG9mIG5hbWVzIHRvIG51bWJlcnMuXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG52YXIgZW51bVN0cmluZ1RvVmFsdWUgPSBudWxsO1xuXG4vKipcbiAqIEluaXRpYWxpemVzIHRoaXMgbW9kdWxlLiBTYWZlIHRvIGNhbGwgbW9yZSB0aGFuIG9uY2UuXG4gKiBAcGFyYW0geyFXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGN0eCBBIFdlYkdMIGNvbnRleHQuIElmXG4gKiAgICB5b3UgaGF2ZSBtb3JlIHRoYW4gb25lIGNvbnRleHQgaXQgZG9lc24ndCBtYXR0ZXIgd2hpY2ggb25lXG4gKiAgICB5b3UgcGFzcyBpbiwgaXQgaXMgb25seSB1c2VkIHRvIHB1bGwgb3V0IGNvbnN0YW50cy5cbiAqL1xuZnVuY3Rpb24gaW5pdChjdHgpIHtcbiAgaWYgKGdsRW51bXMgPT0gbnVsbCkge1xuICAgIGdsRW51bXMgPSB7IH07XG4gICAgZW51bVN0cmluZ1RvVmFsdWUgPSB7IH07XG4gICAgZm9yICh2YXIgcHJvcGVydHlOYW1lIGluIGN0eCkge1xuICAgICAgaWYgKHR5cGVvZiBjdHhbcHJvcGVydHlOYW1lXSA9PSAnbnVtYmVyJykge1xuICAgICAgICBnbEVudW1zW2N0eFtwcm9wZXJ0eU5hbWVdXSA9IHByb3BlcnR5TmFtZTtcbiAgICAgICAgZW51bVN0cmluZ1RvVmFsdWVbcHJvcGVydHlOYW1lXSA9IGN0eFtwcm9wZXJ0eU5hbWVdO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENoZWNrcyB0aGUgdXRpbHMgaGF2ZSBiZWVuIGluaXRpYWxpemVkLlxuICovXG5mdW5jdGlvbiBjaGVja0luaXQoKSB7XG4gIGlmIChnbEVudW1zID09IG51bGwpIHtcbiAgICB0aHJvdyAnV2ViR0xEZWJ1Z1V0aWxzLmluaXQoY3R4KSBub3QgY2FsbGVkJztcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBvciBmYWxzZSBpZiB2YWx1ZSBtYXRjaGVzIGFueSBXZWJHTCBlbnVtXG4gKiBAcGFyYW0geyp9IHZhbHVlIFZhbHVlIHRvIGNoZWNrIGlmIGl0IG1pZ2h0IGJlIGFuIGVudW0uXG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIG1hdGNoZXMgb25lIG9mIHRoZSBXZWJHTCBkZWZpbmVkIGVudW1zXG4gKi9cbmZ1bmN0aW9uIG1pZ2h0QmVFbnVtKHZhbHVlKSB7XG4gIGNoZWNrSW5pdCgpO1xuICByZXR1cm4gKGdsRW51bXNbdmFsdWVdICE9PSB1bmRlZmluZWQpO1xufVxuXG4vKipcbiAqIEdldHMgYW4gc3RyaW5nIHZlcnNpb24gb2YgYW4gV2ViR0wgZW51bS5cbiAqXG4gKiBFeGFtcGxlOlxuICogICB2YXIgc3RyID0gV2ViR0xEZWJ1Z1V0aWwuZ2xFbnVtVG9TdHJpbmcoY3R4LmdldEVycm9yKCkpO1xuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBWYWx1ZSB0byByZXR1cm4gYW4gZW51bSBmb3JcbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHN0cmluZyB2ZXJzaW9uIG9mIHRoZSBlbnVtLlxuICovXG5mdW5jdGlvbiBnbEVudW1Ub1N0cmluZyh2YWx1ZSkge1xuICBjaGVja0luaXQoKTtcbiAgdmFyIG5hbWUgPSBnbEVudW1zW3ZhbHVlXTtcbiAgcmV0dXJuIChuYW1lICE9PSB1bmRlZmluZWQpID8gKFwiZ2wuXCIgKyBuYW1lKSA6XG4gICAgICAoXCIvKlVOS05PV04gV2ViR0wgRU5VTSovIDB4XCIgKyB2YWx1ZS50b1N0cmluZygxNikgKyBcIlwiKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBzdHJpbmcgdmVyc2lvbiBvZiBhIFdlYkdMIGFyZ3VtZW50LlxuICogQXR0ZW1wdHMgdG8gY29udmVydCBlbnVtIGFyZ3VtZW50cyB0byBzdHJpbmdzLlxuICogQHBhcmFtIHtzdHJpbmd9IGZ1bmN0aW9uTmFtZSB0aGUgbmFtZSBvZiB0aGUgV2ViR0wgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gbnVtQXJncyB0aGUgbnVtYmVyIG9mIGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtudW1iZXJ9IGFyZ3VtZW50SW5keCB0aGUgaW5kZXggb2YgdGhlIGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgb2YgdGhlIGFyZ3VtZW50LlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgdmFsdWUgYXMgYSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGdsRnVuY3Rpb25BcmdUb1N0cmluZyhmdW5jdGlvbk5hbWUsIG51bUFyZ3MsIGFyZ3VtZW50SW5kZXgsIHZhbHVlKSB7XG4gIHZhciBmdW5jSW5mbyA9IGdsVmFsaWRFbnVtQ29udGV4dHNbZnVuY3Rpb25OYW1lXTtcbiAgaWYgKGZ1bmNJbmZvICE9PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgZnVuY0luZm8gPSBmdW5jSW5mb1tudW1BcmdzXTtcbiAgICBpZiAoZnVuY0luZm8gIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKGZ1bmNJbmZvW2FyZ3VtZW50SW5kZXhdKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZnVuY0luZm9bYXJndW1lbnRJbmRleF0gPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICBmdW5jSW5mb1thcmd1bWVudEluZGV4XVsnZW51bUJpdHdpc2VPciddICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB2YXIgZW51bXMgPSBmdW5jSW5mb1thcmd1bWVudEluZGV4XVsnZW51bUJpdHdpc2VPciddO1xuICAgICAgICAgIHZhciBvclJlc3VsdCA9IDA7XG4gICAgICAgICAgdmFyIG9yRW51bXMgPSBbXTtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVudW1zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZW51bVZhbHVlID0gZW51bVN0cmluZ1RvVmFsdWVbZW51bXNbaV1dO1xuICAgICAgICAgICAgaWYgKCh2YWx1ZSAmIGVudW1WYWx1ZSkgIT09IDApIHtcbiAgICAgICAgICAgICAgb3JSZXN1bHQgfD0gZW51bVZhbHVlO1xuICAgICAgICAgICAgICBvckVudW1zLnB1c2goZ2xFbnVtVG9TdHJpbmcoZW51bVZhbHVlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChvclJlc3VsdCA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBvckVudW1zLmpvaW4oJyB8ICcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZ2xFbnVtVG9TdHJpbmcodmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZ2xFbnVtVG9TdHJpbmcodmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBcIm51bGxcIjtcbiAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIFwidW5kZWZpbmVkXCI7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyB0aGUgYXJndW1lbnRzIG9mIGEgV2ViR0wgZnVuY3Rpb24gdG8gYSBzdHJpbmcuXG4gKiBBdHRlbXB0cyB0byBjb252ZXJ0IGVudW0gYXJndW1lbnRzIHRvIHN0cmluZ3MuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGZ1bmN0aW9uTmFtZSB0aGUgbmFtZSBvZiB0aGUgV2ViR0wgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge251bWJlcn0gYXJncyBUaGUgYXJndW1lbnRzLlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgYXJndW1lbnRzIGFzIGEgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBnbEZ1bmN0aW9uQXJnc1RvU3RyaW5nKGZ1bmN0aW9uTmFtZSwgYXJncykge1xuICAvLyBhcHBhcmVudGx5IHdlIGNhbid0IGRvIGFyZ3Muam9pbihcIixcIik7XG4gIHZhciBhcmdTdHIgPSBcIlwiO1xuICB2YXIgbnVtQXJncyA9IGFyZ3MubGVuZ3RoO1xuICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgbnVtQXJnczsgKytpaSkge1xuICAgIGFyZ1N0ciArPSAoKGlpID09IDApID8gJycgOiAnLCAnKSArXG4gICAgICAgIGdsRnVuY3Rpb25BcmdUb1N0cmluZyhmdW5jdGlvbk5hbWUsIG51bUFyZ3MsIGlpLCBhcmdzW2lpXSk7XG4gIH1cbiAgcmV0dXJuIGFyZ1N0cjtcbn07XG5cblxuZnVuY3Rpb24gbWFrZVByb3BlcnR5V3JhcHBlcih3cmFwcGVyLCBvcmlnaW5hbCwgcHJvcGVydHlOYW1lKSB7XG4gIC8vbG9nKFwid3JhcCBwcm9wOiBcIiArIHByb3BlcnR5TmFtZSk7XG4gIHdyYXBwZXIuX19kZWZpbmVHZXR0ZXJfXyhwcm9wZXJ0eU5hbWUsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBvcmlnaW5hbFtwcm9wZXJ0eU5hbWVdO1xuICB9KTtcbiAgLy8gVE9ETyhnbWFuZSk6IHRoaXMgbmVlZHMgdG8gaGFuZGxlIHByb3BlcnRpZXMgdGhhdCB0YWtlIG1vcmUgdGhhblxuICAvLyBvbmUgdmFsdWU/XG4gIHdyYXBwZXIuX19kZWZpbmVTZXR0ZXJfXyhwcm9wZXJ0eU5hbWUsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgLy9sb2coXCJzZXQ6IFwiICsgcHJvcGVydHlOYW1lKTtcbiAgICBvcmlnaW5hbFtwcm9wZXJ0eU5hbWVdID0gdmFsdWU7XG4gIH0pO1xufVxuXG4vLyBNYWtlcyBhIGZ1bmN0aW9uIHRoYXQgY2FsbHMgYSBmdW5jdGlvbiBvbiBhbm90aGVyIG9iamVjdC5cbmZ1bmN0aW9uIG1ha2VGdW5jdGlvbldyYXBwZXIob3JpZ2luYWwsIGZ1bmN0aW9uTmFtZSkge1xuICAvL2xvZyhcIndyYXAgZm46IFwiICsgZnVuY3Rpb25OYW1lKTtcbiAgdmFyIGYgPSBvcmlnaW5hbFtmdW5jdGlvbk5hbWVdO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgLy9sb2coXCJjYWxsOiBcIiArIGZ1bmN0aW9uTmFtZSk7XG4gICAgdmFyIHJlc3VsdCA9IGYuYXBwbHkob3JpZ2luYWwsIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn1cblxuLyoqXG4gKiBHaXZlbiBhIFdlYkdMIGNvbnRleHQgcmV0dXJucyBhIHdyYXBwZWQgY29udGV4dCB0aGF0IGNhbGxzXG4gKiBnbC5nZXRFcnJvciBhZnRlciBldmVyeSBjb21tYW5kIGFuZCBjYWxscyBhIGZ1bmN0aW9uIGlmIHRoZVxuICogcmVzdWx0IGlzIG5vdCBnbC5OT19FUlJPUi5cbiAqXG4gKiBAcGFyYW0geyFXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGN0eCBUaGUgd2ViZ2wgY29udGV4dCB0b1xuICogICAgICAgIHdyYXAuXG4gKiBAcGFyYW0geyFmdW5jdGlvbihlcnIsIGZ1bmNOYW1lLCBhcmdzKTogdm9pZH0gb3B0X29uRXJyb3JGdW5jXG4gKiAgICAgICAgVGhlIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiBnbC5nZXRFcnJvciByZXR1cm5zIGFuXG4gKiAgICAgICAgZXJyb3IuIElmIG5vdCBzcGVjaWZpZWQgdGhlIGRlZmF1bHQgZnVuY3Rpb24gY2FsbHNcbiAqICAgICAgICBjb25zb2xlLmxvZyB3aXRoIGEgbWVzc2FnZS5cbiAqIEBwYXJhbSB7IWZ1bmN0aW9uKGZ1bmNOYW1lLCBhcmdzKTogdm9pZH0gb3B0X29uRnVuYyBUaGVcbiAqICAgICAgICBmdW5jdGlvbiB0byBjYWxsIHdoZW4gZWFjaCB3ZWJnbCBmdW5jdGlvbiBpcyBjYWxsZWQuXG4gKiAgICAgICAgWW91IGNhbiB1c2UgdGhpcyB0byBsb2cgYWxsIGNhbGxzIGZvciBleGFtcGxlLlxuICogQHBhcmFtIHshV2ViR0xSZW5kZXJpbmdDb250ZXh0fSBvcHRfZXJyX2N0eCBUaGUgd2ViZ2wgY29udGV4dFxuICogICAgICAgIHRvIGNhbGwgZ2V0RXJyb3Igb24gaWYgZGlmZmVyZW50IHRoYW4gY3R4LlxuICovXG5mdW5jdGlvbiBtYWtlRGVidWdDb250ZXh0KGN0eCwgb3B0X29uRXJyb3JGdW5jLCBvcHRfb25GdW5jLCBvcHRfZXJyX2N0eCkge1xuICBvcHRfZXJyX2N0eCA9IG9wdF9lcnJfY3R4IHx8IGN0eDtcbiAgaW5pdChjdHgpO1xuICBvcHRfb25FcnJvckZ1bmMgPSBvcHRfb25FcnJvckZ1bmMgfHwgZnVuY3Rpb24oZXJyLCBmdW5jdGlvbk5hbWUsIGFyZ3MpIHtcbiAgICAgICAgLy8gYXBwYXJlbnRseSB3ZSBjYW4ndCBkbyBhcmdzLmpvaW4oXCIsXCIpO1xuICAgICAgICB2YXIgYXJnU3RyID0gXCJcIjtcbiAgICAgICAgdmFyIG51bUFyZ3MgPSBhcmdzLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IG51bUFyZ3M7ICsraWkpIHtcbiAgICAgICAgICBhcmdTdHIgKz0gKChpaSA9PSAwKSA/ICcnIDogJywgJykgK1xuICAgICAgICAgICAgICBnbEZ1bmN0aW9uQXJnVG9TdHJpbmcoZnVuY3Rpb25OYW1lLCBudW1BcmdzLCBpaSwgYXJnc1tpaV0pO1xuICAgICAgICB9XG4gICAgICAgIGVycm9yKFwiV2ViR0wgZXJyb3IgXCIrIGdsRW51bVRvU3RyaW5nKGVycikgKyBcIiBpbiBcIisgZnVuY3Rpb25OYW1lICtcbiAgICAgICAgICAgICAgXCIoXCIgKyBhcmdTdHIgKyBcIilcIik7XG4gICAgICB9O1xuXG4gIC8vIEhvbGRzIGJvb2xlYW5zIGZvciBlYWNoIEdMIGVycm9yIHNvIGFmdGVyIHdlIGdldCB0aGUgZXJyb3Igb3Vyc2VsdmVzXG4gIC8vIHdlIGNhbiBzdGlsbCByZXR1cm4gaXQgdG8gdGhlIGNsaWVudCBhcHAuXG4gIHZhciBnbEVycm9yU2hhZG93ID0geyB9O1xuXG4gIC8vIE1ha2VzIGEgZnVuY3Rpb24gdGhhdCBjYWxscyBhIFdlYkdMIGZ1bmN0aW9uIGFuZCB0aGVuIGNhbGxzIGdldEVycm9yLlxuICBmdW5jdGlvbiBtYWtlRXJyb3JXcmFwcGVyKGN0eCwgZnVuY3Rpb25OYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKG9wdF9vbkZ1bmMpIHtcbiAgICAgICAgb3B0X29uRnVuYyhmdW5jdGlvbk5hbWUsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgICB2YXIgcmVzdWx0ID0gY3R4W2Z1bmN0aW9uTmFtZV0uYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgICAgdmFyIGVyciA9IG9wdF9lcnJfY3R4LmdldEVycm9yKCk7XG4gICAgICBpZiAoZXJyICE9IDApIHtcbiAgICAgICAgZ2xFcnJvclNoYWRvd1tlcnJdID0gdHJ1ZTtcbiAgICAgICAgb3B0X29uRXJyb3JGdW5jKGVyciwgZnVuY3Rpb25OYW1lLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9XG5cbiAgLy8gTWFrZSBhIGFuIG9iamVjdCB0aGF0IGhhcyBhIGNvcHkgb2YgZXZlcnkgcHJvcGVydHkgb2YgdGhlIFdlYkdMIGNvbnRleHRcbiAgLy8gYnV0IHdyYXBzIGFsbCBmdW5jdGlvbnMuXG4gIHZhciB3cmFwcGVyID0ge307XG4gIGZvciAodmFyIHByb3BlcnR5TmFtZSBpbiBjdHgpIHtcbiAgICBpZiAodHlwZW9mIGN0eFtwcm9wZXJ0eU5hbWVdID09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChwcm9wZXJ0eU5hbWUgIT0gJ2dldEV4dGVuc2lvbicpIHtcbiAgICAgICAgd3JhcHBlcltwcm9wZXJ0eU5hbWVdID0gbWFrZUVycm9yV3JhcHBlcihjdHgsIHByb3BlcnR5TmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgd3JhcHBlZCA9IG1ha2VFcnJvcldyYXBwZXIoY3R4LCBwcm9wZXJ0eU5hbWUpO1xuICAgICAgICB3cmFwcGVyW3Byb3BlcnR5TmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCA9IHdyYXBwZWQuYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgICAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG1ha2VEZWJ1Z0NvbnRleHQocmVzdWx0LCBvcHRfb25FcnJvckZ1bmMsIG9wdF9vbkZ1bmMsIG9wdF9lcnJfY3R4KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbWFrZVByb3BlcnR5V3JhcHBlcih3cmFwcGVyLCBjdHgsIHByb3BlcnR5TmFtZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gT3ZlcnJpZGUgdGhlIGdldEVycm9yIGZ1bmN0aW9uIHdpdGggb25lIHRoYXQgcmV0dXJucyBvdXIgc2F2ZWQgcmVzdWx0cy5cbiAgd3JhcHBlci5nZXRFcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGVyciBpbiBnbEVycm9yU2hhZG93KSB7XG4gICAgICBpZiAoZ2xFcnJvclNoYWRvdy5oYXNPd25Qcm9wZXJ0eShlcnIpKSB7XG4gICAgICAgIGlmIChnbEVycm9yU2hhZG93W2Vycl0pIHtcbiAgICAgICAgICBnbEVycm9yU2hhZG93W2Vycl0gPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gZXJyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjdHguTk9fRVJST1I7XG4gIH07XG5cbiAgcmV0dXJuIHdyYXBwZXI7XG59XG5cbmZ1bmN0aW9uIHJlc2V0VG9Jbml0aWFsU3RhdGUoY3R4KSB7XG4gIHZhciBpc1dlYkdMMlJlbmRlcmluZ0NvbnRleHQgPSAhIWN0eC5jcmVhdGVUcmFuc2Zvcm1GZWVkYmFjaztcblxuICBpZiAoaXNXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgY3R4LmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcbiAgfVxuXG4gIHZhciBudW1BdHRyaWJzID0gY3R4LmdldFBhcmFtZXRlcihjdHguTUFYX1ZFUlRFWF9BVFRSSUJTKTtcbiAgdmFyIHRtcCA9IGN0eC5jcmVhdGVCdWZmZXIoKTtcbiAgY3R4LmJpbmRCdWZmZXIoY3R4LkFSUkFZX0JVRkZFUiwgdG1wKTtcbiAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IG51bUF0dHJpYnM7ICsraWkpIHtcbiAgICBjdHguZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5KGlpKTtcbiAgICBjdHgudmVydGV4QXR0cmliUG9pbnRlcihpaSwgNCwgY3R4LkZMT0FULCBmYWxzZSwgMCwgMCk7XG4gICAgY3R4LnZlcnRleEF0dHJpYjFmKGlpLCAwKTtcbiAgICBpZiAoaXNXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgICBjdHgudmVydGV4QXR0cmliRGl2aXNvcihpaSwgMCk7XG4gICAgfVxuICB9XG4gIGN0eC5kZWxldGVCdWZmZXIodG1wKTtcblxuICB2YXIgbnVtVGV4dHVyZVVuaXRzID0gY3R4LmdldFBhcmFtZXRlcihjdHguTUFYX1RFWFRVUkVfSU1BR0VfVU5JVFMpO1xuICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgbnVtVGV4dHVyZVVuaXRzOyArK2lpKSB7XG4gICAgY3R4LmFjdGl2ZVRleHR1cmUoY3R4LlRFWFRVUkUwICsgaWkpO1xuICAgIGN0eC5iaW5kVGV4dHVyZShjdHguVEVYVFVSRV9DVUJFX01BUCwgbnVsbCk7XG4gICAgY3R4LmJpbmRUZXh0dXJlKGN0eC5URVhUVVJFXzJELCBudWxsKTtcbiAgICBpZiAoaXNXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgICBjdHguYmluZFRleHR1cmUoY3R4LlRFWFRVUkVfMkRfQVJSQVksIG51bGwpO1xuICAgICAgY3R4LmJpbmRUZXh0dXJlKGN0eC5URVhUVVJFXzNELCBudWxsKTtcbiAgICAgIGN0eC5iaW5kU2FtcGxlcihpaSwgbnVsbCk7XG4gICAgfVxuICB9XG5cbiAgY3R4LmFjdGl2ZVRleHR1cmUoY3R4LlRFWFRVUkUwKTtcbiAgY3R4LnVzZVByb2dyYW0obnVsbCk7XG4gIGN0eC5iaW5kQnVmZmVyKGN0eC5BUlJBWV9CVUZGRVIsIG51bGwpO1xuICBjdHguYmluZEJ1ZmZlcihjdHguRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG51bGwpO1xuICBjdHguYmluZEZyYW1lYnVmZmVyKGN0eC5GUkFNRUJVRkZFUiwgbnVsbCk7XG4gIGN0eC5iaW5kUmVuZGVyYnVmZmVyKGN0eC5SRU5ERVJCVUZGRVIsIG51bGwpO1xuICBjdHguZGlzYWJsZShjdHguQkxFTkQpO1xuICBjdHguZGlzYWJsZShjdHguQ1VMTF9GQUNFKTtcbiAgY3R4LmRpc2FibGUoY3R4LkRFUFRIX1RFU1QpO1xuICBjdHguZGlzYWJsZShjdHguRElUSEVSKTtcbiAgY3R4LmRpc2FibGUoY3R4LlNDSVNTT1JfVEVTVCk7XG4gIGN0eC5ibGVuZENvbG9yKDAsIDAsIDAsIDApO1xuICBjdHguYmxlbmRFcXVhdGlvbihjdHguRlVOQ19BREQpO1xuICBjdHguYmxlbmRGdW5jKGN0eC5PTkUsIGN0eC5aRVJPKTtcbiAgY3R4LmNsZWFyQ29sb3IoMCwgMCwgMCwgMCk7XG4gIGN0eC5jbGVhckRlcHRoKDEpO1xuICBjdHguY2xlYXJTdGVuY2lsKC0xKTtcbiAgY3R4LmNvbG9yTWFzayh0cnVlLCB0cnVlLCB0cnVlLCB0cnVlKTtcbiAgY3R4LmN1bGxGYWNlKGN0eC5CQUNLKTtcbiAgY3R4LmRlcHRoRnVuYyhjdHguTEVTUyk7XG4gIGN0eC5kZXB0aE1hc2sodHJ1ZSk7XG4gIGN0eC5kZXB0aFJhbmdlKDAsIDEpO1xuICBjdHguZnJvbnRGYWNlKGN0eC5DQ1cpO1xuICBjdHguaGludChjdHguR0VORVJBVEVfTUlQTUFQX0hJTlQsIGN0eC5ET05UX0NBUkUpO1xuICBjdHgubGluZVdpZHRoKDEpO1xuICBjdHgucGl4ZWxTdG9yZWkoY3R4LlBBQ0tfQUxJR05NRU5ULCA0KTtcbiAgY3R4LnBpeGVsU3RvcmVpKGN0eC5VTlBBQ0tfQUxJR05NRU5ULCA0KTtcbiAgY3R4LnBpeGVsU3RvcmVpKGN0eC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCBmYWxzZSk7XG4gIGN0eC5waXhlbFN0b3JlaShjdHguVU5QQUNLX1BSRU1VTFRJUExZX0FMUEhBX1dFQkdMLCBmYWxzZSk7XG4gIC8vIFRPRE86IERlbGV0ZSB0aGlzIElGLlxuICBpZiAoY3R4LlVOUEFDS19DT0xPUlNQQUNFX0NPTlZFUlNJT05fV0VCR0wpIHtcbiAgICBjdHgucGl4ZWxTdG9yZWkoY3R4LlVOUEFDS19DT0xPUlNQQUNFX0NPTlZFUlNJT05fV0VCR0wsIGN0eC5CUk9XU0VSX0RFRkFVTFRfV0VCR0wpO1xuICB9XG4gIGN0eC5wb2x5Z29uT2Zmc2V0KDAsIDApO1xuICBjdHguc2FtcGxlQ292ZXJhZ2UoMSwgZmFsc2UpO1xuICBjdHguc2Npc3NvcigwLCAwLCBjdHguY2FudmFzLndpZHRoLCBjdHguY2FudmFzLmhlaWdodCk7XG4gIGN0eC5zdGVuY2lsRnVuYyhjdHguQUxXQVlTLCAwLCAweEZGRkZGRkZGKTtcbiAgY3R4LnN0ZW5jaWxNYXNrKDB4RkZGRkZGRkYpO1xuICBjdHguc3RlbmNpbE9wKGN0eC5LRUVQLCBjdHguS0VFUCwgY3R4LktFRVApO1xuICBjdHgudmlld3BvcnQoMCwgMCwgY3R4LmNhbnZhcy53aWR0aCwgY3R4LmNhbnZhcy5oZWlnaHQpO1xuICBjdHguY2xlYXIoY3R4LkNPTE9SX0JVRkZFUl9CSVQgfCBjdHguREVQVEhfQlVGRkVSX0JJVCB8IGN0eC5TVEVOQ0lMX0JVRkZFUl9CSVQpO1xuXG4gIGlmIChpc1dlYkdMMlJlbmRlcmluZ0NvbnRleHQpIHtcbiAgICBjdHguZHJhd0J1ZmZlcnMoW2N0eC5CQUNLXSk7XG4gICAgY3R4LnJlYWRCdWZmZXIoY3R4LkJBQ0spO1xuICAgIGN0eC5iaW5kQnVmZmVyKGN0eC5DT1BZX1JFQURfQlVGRkVSLCBudWxsKTtcbiAgICBjdHguYmluZEJ1ZmZlcihjdHguQ09QWV9XUklURV9CVUZGRVIsIG51bGwpO1xuICAgIGN0eC5iaW5kQnVmZmVyKGN0eC5QSVhFTF9QQUNLX0JVRkZFUiwgbnVsbCk7XG4gICAgY3R4LmJpbmRCdWZmZXIoY3R4LlBJWEVMX1VOUEFDS19CVUZGRVIsIG51bGwpO1xuICAgIHZhciBudW1UcmFuc2Zvcm1GZWVkYmFja3MgPSBjdHguZ2V0UGFyYW1ldGVyKGN0eC5NQVhfVFJBTlNGT1JNX0ZFRURCQUNLX1NFUEFSQVRFX0FUVFJJQlMpO1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBudW1UcmFuc2Zvcm1GZWVkYmFja3M7ICsraWkpIHtcbiAgICAgIGN0eC5iaW5kQnVmZmVyQmFzZShjdHguVFJBTlNGT1JNX0ZFRURCQUNLX0JVRkZFUiwgaWksIG51bGwpO1xuICAgIH1cbiAgICB2YXIgbnVtVUJPcyA9IGN0eC5nZXRQYXJhbWV0ZXIoY3R4Lk1BWF9VTklGT1JNX0JVRkZFUl9CSU5ESU5HUyk7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IG51bVVCT3M7ICsraWkpIHtcbiAgICAgIGN0eC5iaW5kQnVmZmVyQmFzZShjdHguVU5JRk9STV9CVUZGRVIsIGlpLCBudWxsKTtcbiAgICB9XG4gICAgY3R4LmRpc2FibGUoY3R4LlJBU1RFUklaRVJfRElTQ0FSRCk7XG4gICAgY3R4LnBpeGVsU3RvcmVpKGN0eC5VTlBBQ0tfSU1BR0VfSEVJR0hULCAwKTtcbiAgICBjdHgucGl4ZWxTdG9yZWkoY3R4LlVOUEFDS19TS0lQX0lNQUdFUywgMCk7XG4gICAgY3R4LnBpeGVsU3RvcmVpKGN0eC5VTlBBQ0tfUk9XX0xFTkdUSCwgMCk7XG4gICAgY3R4LnBpeGVsU3RvcmVpKGN0eC5VTlBBQ0tfU0tJUF9ST1dTLCAwKTtcbiAgICBjdHgucGl4ZWxTdG9yZWkoY3R4LlVOUEFDS19TS0lQX1BJWEVMUywgMCk7XG4gICAgY3R4LnBpeGVsU3RvcmVpKGN0eC5QQUNLX1JPV19MRU5HVEgsIDApO1xuICAgIGN0eC5waXhlbFN0b3JlaShjdHguUEFDS19TS0lQX1JPV1MsIDApO1xuICAgIGN0eC5waXhlbFN0b3JlaShjdHguUEFDS19TS0lQX1BJWEVMUywgMCk7XG4gICAgY3R4LmhpbnQoY3R4LkZSQUdNRU5UX1NIQURFUl9ERVJJVkFUSVZFX0hJTlQsIGN0eC5ET05UX0NBUkUpO1xuICB9XG5cbiAgLy8gVE9ETzogVGhpcyBzaG91bGQgTk9UIGJlIG5lZWRlZCBidXQgRmlyZWZveCBmYWlscyB3aXRoICdoaW50J1xuICB3aGlsZShjdHguZ2V0RXJyb3IoKSk7XG59XG5cbmZ1bmN0aW9uIG1ha2VMb3N0Q29udGV4dFNpbXVsYXRpbmdDYW52YXMoY2FudmFzKSB7XG4gIHZhciB1bndyYXBwZWRDb250ZXh0XztcbiAgdmFyIHdyYXBwZWRDb250ZXh0XztcbiAgdmFyIG9uTG9zdF8gPSBbXTtcbiAgdmFyIG9uUmVzdG9yZWRfID0gW107XG4gIHZhciB3cmFwcGVkQ29udGV4dF8gPSB7fTtcbiAgdmFyIGNvbnRleHRJZF8gPSAxO1xuICB2YXIgY29udGV4dExvc3RfID0gZmFsc2U7XG4gIHZhciByZXNvdXJjZUlkXyA9IDA7XG4gIHZhciByZXNvdXJjZURiXyA9IFtdO1xuICB2YXIgbnVtQ2FsbHNUb0xvc2VDb250ZXh0XyA9IDA7XG4gIHZhciBudW1DYWxsc18gPSAwO1xuICB2YXIgY2FuUmVzdG9yZV8gPSBmYWxzZTtcbiAgdmFyIHJlc3RvcmVUaW1lb3V0XyA9IDA7XG4gIHZhciBpc1dlYkdMMlJlbmRlcmluZ0NvbnRleHQ7XG5cbiAgLy8gSG9sZHMgYm9vbGVhbnMgZm9yIGVhY2ggR0wgZXJyb3Igc28gY2FuIHNpbXVsYXRlIGVycm9ycy5cbiAgdmFyIGdsRXJyb3JTaGFkb3dfID0geyB9O1xuXG4gIGNhbnZhcy5nZXRDb250ZXh0ID0gZnVuY3Rpb24oZikge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjdHggPSBmLmFwcGx5KGNhbnZhcywgYXJndW1lbnRzKTtcbiAgICAgIC8vIERpZCB3ZSBnZXQgYSBjb250ZXh0IGFuZCBpcyBpdCBhIFdlYkdMIGNvbnRleHQ/XG4gICAgICBpZiAoKGN0eCBpbnN0YW5jZW9mIFdlYkdMUmVuZGVyaW5nQ29udGV4dCkgfHwgKHdpbmRvdy5XZWJHTDJSZW5kZXJpbmdDb250ZXh0ICYmIChjdHggaW5zdGFuY2VvZiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSkpIHtcbiAgICAgICAgaWYgKGN0eCAhPSB1bndyYXBwZWRDb250ZXh0Xykge1xuICAgICAgICAgIGlmICh1bndyYXBwZWRDb250ZXh0Xykge1xuICAgICAgICAgICAgdGhyb3cgXCJnb3QgZGlmZmVyZW50IGNvbnRleHRcIlxuICAgICAgICAgIH1cbiAgICAgICAgICBpc1dlYkdMMlJlbmRlcmluZ0NvbnRleHQgPSB3aW5kb3cuV2ViR0wyUmVuZGVyaW5nQ29udGV4dCAmJiAoY3R4IGluc3RhbmNlb2YgV2ViR0wyUmVuZGVyaW5nQ29udGV4dCk7XG4gICAgICAgICAgdW53cmFwcGVkQ29udGV4dF8gPSBjdHg7XG4gICAgICAgICAgd3JhcHBlZENvbnRleHRfID0gbWFrZUxvc3RDb250ZXh0U2ltdWxhdGluZ0NvbnRleHQodW53cmFwcGVkQ29udGV4dF8pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3cmFwcGVkQ29udGV4dF87XG4gICAgICB9XG4gICAgICByZXR1cm4gY3R4O1xuICAgIH1cbiAgfShjYW52YXMuZ2V0Q29udGV4dCk7XG5cbiAgZnVuY3Rpb24gd3JhcEV2ZW50KGxpc3RlbmVyKSB7XG4gICAgaWYgKHR5cGVvZihsaXN0ZW5lcikgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICByZXR1cm4gbGlzdGVuZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihpbmZvKSB7XG4gICAgICAgIGxpc3RlbmVyLmhhbmRsZUV2ZW50KGluZm8pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZhciBhZGRPbkNvbnRleHRMb3N0TGlzdGVuZXIgPSBmdW5jdGlvbihsaXN0ZW5lcikge1xuICAgIG9uTG9zdF8ucHVzaCh3cmFwRXZlbnQobGlzdGVuZXIpKTtcbiAgfTtcblxuICB2YXIgYWRkT25Db250ZXh0UmVzdG9yZWRMaXN0ZW5lciA9IGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgb25SZXN0b3JlZF8ucHVzaCh3cmFwRXZlbnQobGlzdGVuZXIpKTtcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIHdyYXBBZGRFdmVudExpc3RlbmVyKGNhbnZhcykge1xuICAgIHZhciBmID0gY2FudmFzLmFkZEV2ZW50TGlzdGVuZXI7XG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lciwgYnViYmxlKSB7XG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnd2ViZ2xjb250ZXh0bG9zdCc6XG4gICAgICAgICAgYWRkT25Db250ZXh0TG9zdExpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnd2ViZ2xjb250ZXh0cmVzdG9yZWQnOlxuICAgICAgICAgIGFkZE9uQ29udGV4dFJlc3RvcmVkTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGYuYXBwbHkoY2FudmFzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICB3cmFwQWRkRXZlbnRMaXN0ZW5lcihjYW52YXMpO1xuXG4gIGNhbnZhcy5sb3NlQ29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghY29udGV4dExvc3RfKSB7XG4gICAgICBjb250ZXh0TG9zdF8gPSB0cnVlO1xuICAgICAgbnVtQ2FsbHNUb0xvc2VDb250ZXh0XyA9IDA7XG4gICAgICArK2NvbnRleHRJZF87XG4gICAgICB3aGlsZSAodW53cmFwcGVkQ29udGV4dF8uZ2V0RXJyb3IoKSk7XG4gICAgICBjbGVhckVycm9ycygpO1xuICAgICAgZ2xFcnJvclNoYWRvd19bdW53cmFwcGVkQ29udGV4dF8uQ09OVEVYVF9MT1NUX1dFQkdMXSA9IHRydWU7XG4gICAgICB2YXIgZXZlbnQgPSBtYWtlV2ViR0xDb250ZXh0RXZlbnQoXCJjb250ZXh0IGxvc3RcIik7XG4gICAgICB2YXIgY2FsbGJhY2tzID0gb25Mb3N0Xy5zbGljZSgpO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAvL2xvZyhcIm51bUNhbGxiYWNrczpcIiArIGNhbGxiYWNrcy5sZW5ndGgpO1xuICAgICAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBjYWxsYmFja3MubGVuZ3RoOyArK2lpKSB7XG4gICAgICAgICAgICAvL2xvZyhcImNhbGxpbmcgY2FsbGJhY2s6XCIgKyBpaSk7XG4gICAgICAgICAgICBjYWxsYmFja3NbaWldKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHJlc3RvcmVUaW1lb3V0XyA+PSAwKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNhbnZhcy5yZXN0b3JlQ29udGV4dCgpO1xuICAgICAgICAgICAgICB9LCByZXN0b3JlVGltZW91dF8pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgMCk7XG4gICAgfVxuICB9O1xuXG4gIGNhbnZhcy5yZXN0b3JlQ29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChjb250ZXh0TG9zdF8pIHtcbiAgICAgIGlmIChvblJlc3RvcmVkXy5sZW5ndGgpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICghY2FuUmVzdG9yZV8pIHtcbiAgICAgICAgICAgICAgdGhyb3cgXCJjYW4gbm90IHJlc3RvcmUuIHdlYmdsY29udGVzdGxvc3QgbGlzdGVuZXIgZGlkIG5vdCBjYWxsIGV2ZW50LnByZXZlbnREZWZhdWx0XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmcmVlUmVzb3VyY2VzKCk7XG4gICAgICAgICAgICByZXNldFRvSW5pdGlhbFN0YXRlKHVud3JhcHBlZENvbnRleHRfKTtcbiAgICAgICAgICAgIGNvbnRleHRMb3N0XyA9IGZhbHNlO1xuICAgICAgICAgICAgbnVtQ2FsbHNfID0gMDtcbiAgICAgICAgICAgIGNhblJlc3RvcmVfID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2tzID0gb25SZXN0b3JlZF8uc2xpY2UoKTtcbiAgICAgICAgICAgIHZhciBldmVudCA9IG1ha2VXZWJHTENvbnRleHRFdmVudChcImNvbnRleHQgcmVzdG9yZWRcIik7XG4gICAgICAgICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgY2FsbGJhY2tzLmxlbmd0aDsgKytpaSkge1xuICAgICAgICAgICAgICBjYWxsYmFja3NbaWldKGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCAwKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgY2FudmFzLmxvc2VDb250ZXh0SW5OQ2FsbHMgPSBmdW5jdGlvbihudW1DYWxscykge1xuICAgIGlmIChjb250ZXh0TG9zdF8pIHtcbiAgICAgIHRocm93IFwiWW91IGNhbiBub3QgYXNrIGEgbG9zdCBjb250ZXQgdG8gYmUgbG9zdFwiO1xuICAgIH1cbiAgICBudW1DYWxsc1RvTG9zZUNvbnRleHRfID0gbnVtQ2FsbHNfICsgbnVtQ2FsbHM7XG4gIH07XG5cbiAgY2FudmFzLmdldE51bUNhbGxzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG51bUNhbGxzXztcbiAgfTtcblxuICBjYW52YXMuc2V0UmVzdG9yZVRpbWVvdXQgPSBmdW5jdGlvbih0aW1lb3V0KSB7XG4gICAgcmVzdG9yZVRpbWVvdXRfID0gdGltZW91dDtcbiAgfTtcblxuICBmdW5jdGlvbiBpc1dlYkdMT2JqZWN0KG9iaikge1xuICAgIC8vcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiAob2JqIGluc3RhbmNlb2YgV2ViR0xCdWZmZXIgfHxcbiAgICAgICAgICAgIG9iaiBpbnN0YW5jZW9mIFdlYkdMRnJhbWVidWZmZXIgfHxcbiAgICAgICAgICAgIG9iaiBpbnN0YW5jZW9mIFdlYkdMUHJvZ3JhbSB8fFxuICAgICAgICAgICAgb2JqIGluc3RhbmNlb2YgV2ViR0xSZW5kZXJidWZmZXIgfHxcbiAgICAgICAgICAgIG9iaiBpbnN0YW5jZW9mIFdlYkdMU2hhZGVyIHx8XG4gICAgICAgICAgICBvYmogaW5zdGFuY2VvZiBXZWJHTFRleHR1cmUpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tSZXNvdXJjZXMoYXJncykge1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBhcmdzLmxlbmd0aDsgKytpaSkge1xuICAgICAgdmFyIGFyZyA9IGFyZ3NbaWldO1xuICAgICAgaWYgKGlzV2ViR0xPYmplY3QoYXJnKSkge1xuICAgICAgICByZXR1cm4gYXJnLl9fd2ViZ2xEZWJ1Z0NvbnRleHRMb3N0SWRfXyA9PSBjb250ZXh0SWRfO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFyRXJyb3JzKCkge1xuICAgIHZhciBrID0gT2JqZWN0LmtleXMoZ2xFcnJvclNoYWRvd18pO1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBrLmxlbmd0aDsgKytpaSkge1xuICAgICAgZGVsZXRlIGdsRXJyb3JTaGFkb3dfW2tbaWldXTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBsb3NlQ29udGV4dElmVGltZSgpIHtcbiAgICArK251bUNhbGxzXztcbiAgICBpZiAoIWNvbnRleHRMb3N0Xykge1xuICAgICAgaWYgKG51bUNhbGxzVG9Mb3NlQ29udGV4dF8gPT0gbnVtQ2FsbHNfKSB7XG4gICAgICAgIGNhbnZhcy5sb3NlQ29udGV4dCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIE1ha2VzIGEgZnVuY3Rpb24gdGhhdCBzaW11bGF0ZXMgV2ViR0wgd2hlbiBvdXQgb2YgY29udGV4dC5cbiAgZnVuY3Rpb24gbWFrZUxvc3RDb250ZXh0RnVuY3Rpb25XcmFwcGVyKGN0eCwgZnVuY3Rpb25OYW1lKSB7XG4gICAgdmFyIGYgPSBjdHhbZnVuY3Rpb25OYW1lXTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBsb2coXCJjYWxsaW5nOlwiICsgZnVuY3Rpb25OYW1lKTtcbiAgICAgIC8vIE9ubHkgY2FsbCB0aGUgZnVuY3Rpb25zIGlmIHRoZSBjb250ZXh0IGlzIG5vdCBsb3N0LlxuICAgICAgbG9zZUNvbnRleHRJZlRpbWUoKTtcbiAgICAgIGlmICghY29udGV4dExvc3RfKSB7XG4gICAgICAgIC8vaWYgKCFjaGVja1Jlc291cmNlcyhhcmd1bWVudHMpKSB7XG4gICAgICAgIC8vICBnbEVycm9yU2hhZG93X1t3cmFwcGVkQ29udGV4dF8uSU5WQUxJRF9PUEVSQVRJT05dID0gdHJ1ZTtcbiAgICAgICAgLy8gIHJldHVybjtcbiAgICAgICAgLy99XG4gICAgICAgIHZhciByZXN1bHQgPSBmLmFwcGx5KGN0eCwgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZnJlZVJlc291cmNlcygpIHtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgcmVzb3VyY2VEYl8ubGVuZ3RoOyArK2lpKSB7XG4gICAgICB2YXIgcmVzb3VyY2UgPSByZXNvdXJjZURiX1tpaV07XG4gICAgICBpZiAocmVzb3VyY2UgaW5zdGFuY2VvZiBXZWJHTEJ1ZmZlcikge1xuICAgICAgICB1bndyYXBwZWRDb250ZXh0Xy5kZWxldGVCdWZmZXIocmVzb3VyY2UpO1xuICAgICAgfSBlbHNlIGlmIChyZXNvdXJjZSBpbnN0YW5jZW9mIFdlYkdMRnJhbWVidWZmZXIpIHtcbiAgICAgICAgdW53cmFwcGVkQ29udGV4dF8uZGVsZXRlRnJhbWVidWZmZXIocmVzb3VyY2UpO1xuICAgICAgfSBlbHNlIGlmIChyZXNvdXJjZSBpbnN0YW5jZW9mIFdlYkdMUHJvZ3JhbSkge1xuICAgICAgICB1bndyYXBwZWRDb250ZXh0Xy5kZWxldGVQcm9ncmFtKHJlc291cmNlKTtcbiAgICAgIH0gZWxzZSBpZiAocmVzb3VyY2UgaW5zdGFuY2VvZiBXZWJHTFJlbmRlcmJ1ZmZlcikge1xuICAgICAgICB1bndyYXBwZWRDb250ZXh0Xy5kZWxldGVSZW5kZXJidWZmZXIocmVzb3VyY2UpO1xuICAgICAgfSBlbHNlIGlmIChyZXNvdXJjZSBpbnN0YW5jZW9mIFdlYkdMU2hhZGVyKSB7XG4gICAgICAgIHVud3JhcHBlZENvbnRleHRfLmRlbGV0ZVNoYWRlcihyZXNvdXJjZSk7XG4gICAgICB9IGVsc2UgaWYgKHJlc291cmNlIGluc3RhbmNlb2YgV2ViR0xUZXh0dXJlKSB7XG4gICAgICAgIHVud3JhcHBlZENvbnRleHRfLmRlbGV0ZVRleHR1cmUocmVzb3VyY2UpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaXNXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgICAgIGlmIChyZXNvdXJjZSBpbnN0YW5jZW9mIFdlYkdMUXVlcnkpIHtcbiAgICAgICAgICB1bndyYXBwZWRDb250ZXh0Xy5kZWxldGVRdWVyeShyZXNvdXJjZSk7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzb3VyY2UgaW5zdGFuY2VvZiBXZWJHTFNhbXBsZXIpIHtcbiAgICAgICAgICB1bndyYXBwZWRDb250ZXh0Xy5kZWxldGVTYW1wbGVyKHJlc291cmNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChyZXNvdXJjZSBpbnN0YW5jZW9mIFdlYkdMU3luYykge1xuICAgICAgICAgIHVud3JhcHBlZENvbnRleHRfLmRlbGV0ZVN5bmMocmVzb3VyY2UpO1xuICAgICAgICB9IGVsc2UgaWYgKHJlc291cmNlIGluc3RhbmNlb2YgV2ViR0xUcmFuc2Zvcm1GZWVkYmFjaykge1xuICAgICAgICAgIHVud3JhcHBlZENvbnRleHRfLmRlbGV0ZVRyYW5zZm9ybUZlZWRiYWNrKHJlc291cmNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChyZXNvdXJjZSBpbnN0YW5jZW9mIFdlYkdMVmVydGV4QXJyYXlPYmplY3QpIHtcbiAgICAgICAgICB1bndyYXBwZWRDb250ZXh0Xy5kZWxldGVWZXJ0ZXhBcnJheShyZXNvdXJjZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtYWtlV2ViR0xDb250ZXh0RXZlbnQoc3RhdHVzTWVzc2FnZSkge1xuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNNZXNzYWdlOiBzdGF0dXNNZXNzYWdlLFxuICAgICAgcHJldmVudERlZmF1bHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNhblJlc3RvcmVfID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH07XG4gIH1cblxuICByZXR1cm4gY2FudmFzO1xuXG4gIGZ1bmN0aW9uIG1ha2VMb3N0Q29udGV4dFNpbXVsYXRpbmdDb250ZXh0KGN0eCkge1xuICAgIC8vIGNvcHkgYWxsIGZ1bmN0aW9ucyBhbmQgcHJvcGVydGllcyB0byB3cmFwcGVyXG4gICAgZm9yICh2YXIgcHJvcGVydHlOYW1lIGluIGN0eCkge1xuICAgICAgaWYgKHR5cGVvZiBjdHhbcHJvcGVydHlOYW1lXSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICB3cmFwcGVkQ29udGV4dF9bcHJvcGVydHlOYW1lXSA9IG1ha2VMb3N0Q29udGV4dEZ1bmN0aW9uV3JhcHBlcihcbiAgICAgICAgICAgICBjdHgsIHByb3BlcnR5TmFtZSk7XG4gICAgICAgfSBlbHNlIHtcbiAgICAgICAgIG1ha2VQcm9wZXJ0eVdyYXBwZXIod3JhcHBlZENvbnRleHRfLCBjdHgsIHByb3BlcnR5TmFtZSk7XG4gICAgICAgfVxuICAgIH1cblxuICAgIC8vIFdyYXAgYSBmZXcgZnVuY3Rpb25zIHNwZWNpYWxseS5cbiAgICB3cmFwcGVkQ29udGV4dF8uZ2V0RXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIGxvc2VDb250ZXh0SWZUaW1lKCk7XG4gICAgICBpZiAoIWNvbnRleHRMb3N0Xykge1xuICAgICAgICB2YXIgZXJyO1xuICAgICAgICB3aGlsZSAoZXJyID0gdW53cmFwcGVkQ29udGV4dF8uZ2V0RXJyb3IoKSkge1xuICAgICAgICAgIGdsRXJyb3JTaGFkb3dfW2Vycl0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBlcnIgaW4gZ2xFcnJvclNoYWRvd18pIHtcbiAgICAgICAgaWYgKGdsRXJyb3JTaGFkb3dfW2Vycl0pIHtcbiAgICAgICAgICBkZWxldGUgZ2xFcnJvclNoYWRvd19bZXJyXTtcbiAgICAgICAgICByZXR1cm4gZXJyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gd3JhcHBlZENvbnRleHRfLk5PX0VSUk9SO1xuICAgIH07XG5cbiAgICB2YXIgY3JlYXRpb25GdW5jdGlvbnMgPSBbXG4gICAgICBcImNyZWF0ZUJ1ZmZlclwiLFxuICAgICAgXCJjcmVhdGVGcmFtZWJ1ZmZlclwiLFxuICAgICAgXCJjcmVhdGVQcm9ncmFtXCIsXG4gICAgICBcImNyZWF0ZVJlbmRlcmJ1ZmZlclwiLFxuICAgICAgXCJjcmVhdGVTaGFkZXJcIixcbiAgICAgIFwiY3JlYXRlVGV4dHVyZVwiXG4gICAgXTtcbiAgICBpZiAoaXNXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgICBjcmVhdGlvbkZ1bmN0aW9ucy5wdXNoKFxuICAgICAgICBcImNyZWF0ZVF1ZXJ5XCIsXG4gICAgICAgIFwiY3JlYXRlU2FtcGxlclwiLFxuICAgICAgICBcImZlbmNlU3luY1wiLFxuICAgICAgICBcImNyZWF0ZVRyYW5zZm9ybUZlZWRiYWNrXCIsXG4gICAgICAgIFwiY3JlYXRlVmVydGV4QXJyYXlcIlxuICAgICAgKTtcbiAgICB9XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IGNyZWF0aW9uRnVuY3Rpb25zLmxlbmd0aDsgKytpaSkge1xuICAgICAgdmFyIGZ1bmN0aW9uTmFtZSA9IGNyZWF0aW9uRnVuY3Rpb25zW2lpXTtcbiAgICAgIHdyYXBwZWRDb250ZXh0X1tmdW5jdGlvbk5hbWVdID0gZnVuY3Rpb24oZikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbG9zZUNvbnRleHRJZlRpbWUoKTtcbiAgICAgICAgICBpZiAoY29udGV4dExvc3RfKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdmFyIG9iaiA9IGYuYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgICAgICAgIG9iai5fX3dlYmdsRGVidWdDb250ZXh0TG9zdElkX18gPSBjb250ZXh0SWRfO1xuICAgICAgICAgIHJlc291cmNlRGJfLnB1c2gob2JqKTtcbiAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9O1xuICAgICAgfShjdHhbZnVuY3Rpb25OYW1lXSk7XG4gICAgfVxuXG4gICAgdmFyIGZ1bmN0aW9uc1RoYXRTaG91bGRSZXR1cm5OdWxsID0gW1xuICAgICAgXCJnZXRBY3RpdmVBdHRyaWJcIixcbiAgICAgIFwiZ2V0QWN0aXZlVW5pZm9ybVwiLFxuICAgICAgXCJnZXRCdWZmZXJQYXJhbWV0ZXJcIixcbiAgICAgIFwiZ2V0Q29udGV4dEF0dHJpYnV0ZXNcIixcbiAgICAgIFwiZ2V0QXR0YWNoZWRTaGFkZXJzXCIsXG4gICAgICBcImdldEZyYW1lYnVmZmVyQXR0YWNobWVudFBhcmFtZXRlclwiLFxuICAgICAgXCJnZXRQYXJhbWV0ZXJcIixcbiAgICAgIFwiZ2V0UHJvZ3JhbVBhcmFtZXRlclwiLFxuICAgICAgXCJnZXRQcm9ncmFtSW5mb0xvZ1wiLFxuICAgICAgXCJnZXRSZW5kZXJidWZmZXJQYXJhbWV0ZXJcIixcbiAgICAgIFwiZ2V0U2hhZGVyUGFyYW1ldGVyXCIsXG4gICAgICBcImdldFNoYWRlckluZm9Mb2dcIixcbiAgICAgIFwiZ2V0U2hhZGVyU291cmNlXCIsXG4gICAgICBcImdldFRleFBhcmFtZXRlclwiLFxuICAgICAgXCJnZXRVbmlmb3JtXCIsXG4gICAgICBcImdldFVuaWZvcm1Mb2NhdGlvblwiLFxuICAgICAgXCJnZXRWZXJ0ZXhBdHRyaWJcIlxuICAgIF07XG4gICAgaWYgKGlzV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkge1xuICAgICAgZnVuY3Rpb25zVGhhdFNob3VsZFJldHVybk51bGwucHVzaChcbiAgICAgICAgXCJnZXRJbnRlcm5hbGZvcm1hdFBhcmFtZXRlclwiLFxuICAgICAgICBcImdldFF1ZXJ5XCIsXG4gICAgICAgIFwiZ2V0UXVlcnlQYXJhbWV0ZXJcIixcbiAgICAgICAgXCJnZXRTYW1wbGVyUGFyYW1ldGVyXCIsXG4gICAgICAgIFwiZ2V0U3luY1BhcmFtZXRlclwiLFxuICAgICAgICBcImdldFRyYW5zZm9ybUZlZWRiYWNrVmFyeWluZ1wiLFxuICAgICAgICBcImdldEluZGV4ZWRQYXJhbWV0ZXJcIixcbiAgICAgICAgXCJnZXRVbmlmb3JtSW5kaWNlc1wiLFxuICAgICAgICBcImdldEFjdGl2ZVVuaWZvcm1zXCIsXG4gICAgICAgIFwiZ2V0QWN0aXZlVW5pZm9ybUJsb2NrUGFyYW1ldGVyXCIsXG4gICAgICAgIFwiZ2V0QWN0aXZlVW5pZm9ybUJsb2NrTmFtZVwiXG4gICAgICApO1xuICAgIH1cbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgZnVuY3Rpb25zVGhhdFNob3VsZFJldHVybk51bGwubGVuZ3RoOyArK2lpKSB7XG4gICAgICB2YXIgZnVuY3Rpb25OYW1lID0gZnVuY3Rpb25zVGhhdFNob3VsZFJldHVybk51bGxbaWldO1xuICAgICAgd3JhcHBlZENvbnRleHRfW2Z1bmN0aW9uTmFtZV0gPSBmdW5jdGlvbihmKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsb3NlQ29udGV4dElmVGltZSgpO1xuICAgICAgICAgIGlmIChjb250ZXh0TG9zdF8pIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZi5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgIH0od3JhcHBlZENvbnRleHRfW2Z1bmN0aW9uTmFtZV0pO1xuICAgIH1cblxuICAgIHZhciBpc0Z1bmN0aW9ucyA9IFtcbiAgICAgIFwiaXNCdWZmZXJcIixcbiAgICAgIFwiaXNFbmFibGVkXCIsXG4gICAgICBcImlzRnJhbWVidWZmZXJcIixcbiAgICAgIFwiaXNQcm9ncmFtXCIsXG4gICAgICBcImlzUmVuZGVyYnVmZmVyXCIsXG4gICAgICBcImlzU2hhZGVyXCIsXG4gICAgICBcImlzVGV4dHVyZVwiXG4gICAgXTtcbiAgICBpZiAoaXNXZWJHTDJSZW5kZXJpbmdDb250ZXh0KSB7XG4gICAgICBpc0Z1bmN0aW9ucy5wdXNoKFxuICAgICAgICBcImlzUXVlcnlcIixcbiAgICAgICAgXCJpc1NhbXBsZXJcIixcbiAgICAgICAgXCJpc1N5bmNcIixcbiAgICAgICAgXCJpc1RyYW5zZm9ybUZlZWRiYWNrXCIsXG4gICAgICAgIFwiaXNWZXJ0ZXhBcnJheVwiXG4gICAgICApO1xuICAgIH1cbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgaXNGdW5jdGlvbnMubGVuZ3RoOyArK2lpKSB7XG4gICAgICB2YXIgZnVuY3Rpb25OYW1lID0gaXNGdW5jdGlvbnNbaWldO1xuICAgICAgd3JhcHBlZENvbnRleHRfW2Z1bmN0aW9uTmFtZV0gPSBmdW5jdGlvbihmKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsb3NlQ29udGV4dElmVGltZSgpO1xuICAgICAgICAgIGlmIChjb250ZXh0TG9zdF8pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGYuYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgICB9KHdyYXBwZWRDb250ZXh0X1tmdW5jdGlvbk5hbWVdKTtcbiAgICB9XG5cbiAgICB3cmFwcGVkQ29udGV4dF8uY2hlY2tGcmFtZWJ1ZmZlclN0YXR1cyA9IGZ1bmN0aW9uKGYpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbG9zZUNvbnRleHRJZlRpbWUoKTtcbiAgICAgICAgaWYgKGNvbnRleHRMb3N0Xykge1xuICAgICAgICAgIHJldHVybiB3cmFwcGVkQ29udGV4dF8uRlJBTUVCVUZGRVJfVU5TVVBQT1JURUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGYuYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICB9KHdyYXBwZWRDb250ZXh0Xy5jaGVja0ZyYW1lYnVmZmVyU3RhdHVzKTtcblxuICAgIHdyYXBwZWRDb250ZXh0Xy5nZXRBdHRyaWJMb2NhdGlvbiA9IGZ1bmN0aW9uKGYpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbG9zZUNvbnRleHRJZlRpbWUoKTtcbiAgICAgICAgaWYgKGNvbnRleHRMb3N0Xykge1xuICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZi5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgIH0od3JhcHBlZENvbnRleHRfLmdldEF0dHJpYkxvY2F0aW9uKTtcblxuICAgIHdyYXBwZWRDb250ZXh0Xy5nZXRWZXJ0ZXhBdHRyaWJPZmZzZXQgPSBmdW5jdGlvbihmKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGxvc2VDb250ZXh0SWZUaW1lKCk7XG4gICAgICAgIGlmIChjb250ZXh0TG9zdF8pIHtcbiAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZi5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgIH0od3JhcHBlZENvbnRleHRfLmdldFZlcnRleEF0dHJpYk9mZnNldCk7XG5cbiAgICB3cmFwcGVkQ29udGV4dF8uaXNDb250ZXh0TG9zdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGNvbnRleHRMb3N0XztcbiAgICB9O1xuXG4gICAgaWYgKGlzV2ViR0wyUmVuZGVyaW5nQ29udGV4dCkge1xuICAgICAgd3JhcHBlZENvbnRleHRfLmdldEZyYWdEYXRhTG9jYXRpb24gPSBmdW5jdGlvbihmKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsb3NlQ29udGV4dElmVGltZSgpO1xuICAgICAgICAgIGlmIChjb250ZXh0TG9zdF8pIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGYuYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgICAgfSh3cmFwcGVkQ29udGV4dF8uZ2V0RnJhZ0RhdGFMb2NhdGlvbik7XG5cbiAgICAgIHdyYXBwZWRDb250ZXh0Xy5jbGllbnRXYWl0U3luYyA9IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxvc2VDb250ZXh0SWZUaW1lKCk7XG4gICAgICAgICAgaWYgKGNvbnRleHRMb3N0Xykge1xuICAgICAgICAgICAgcmV0dXJuIHdyYXBwZWRDb250ZXh0Xy5XQUlUX0ZBSUxFRDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGYuYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgICAgfSh3cmFwcGVkQ29udGV4dF8uY2xpZW50V2FpdFN5bmMpO1xuXG4gICAgICB3cmFwcGVkQ29udGV4dF8uZ2V0VW5pZm9ybUJsb2NrSW5kZXggPSBmdW5jdGlvbihmKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsb3NlQ29udGV4dElmVGltZSgpO1xuICAgICAgICAgIGlmIChjb250ZXh0TG9zdF8pIHtcbiAgICAgICAgICAgIHJldHVybiB3cmFwcGVkQ29udGV4dF8uSU5WQUxJRF9JTkRFWDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGYuYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgICAgfSh3cmFwcGVkQ29udGV4dF8uZ2V0VW5pZm9ybUJsb2NrSW5kZXgpO1xuICAgIH1cblxuICAgIHJldHVybiB3cmFwcGVkQ29udGV4dF87XG4gIH1cbn1cblxucmV0dXJuIHtcbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoaXMgbW9kdWxlLiBTYWZlIHRvIGNhbGwgbW9yZSB0aGFuIG9uY2UuXG4gICAqIEBwYXJhbSB7IVdlYkdMUmVuZGVyaW5nQ29udGV4dH0gY3R4IEEgV2ViR0wgY29udGV4dC4gSWZcbiAgICogICAgeW91IGhhdmUgbW9yZSB0aGFuIG9uZSBjb250ZXh0IGl0IGRvZXNuJ3QgbWF0dGVyIHdoaWNoIG9uZVxuICAgKiAgICB5b3UgcGFzcyBpbiwgaXQgaXMgb25seSB1c2VkIHRvIHB1bGwgb3V0IGNvbnN0YW50cy5cbiAgICovXG4gICdpbml0JzogaW5pdCxcblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIG9yIGZhbHNlIGlmIHZhbHVlIG1hdGNoZXMgYW55IFdlYkdMIGVudW1cbiAgICogQHBhcmFtIHsqfSB2YWx1ZSBWYWx1ZSB0byBjaGVjayBpZiBpdCBtaWdodCBiZSBhbiBlbnVtLlxuICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHZhbHVlIG1hdGNoZXMgb25lIG9mIHRoZSBXZWJHTCBkZWZpbmVkIGVudW1zXG4gICAqL1xuICAnbWlnaHRCZUVudW0nOiBtaWdodEJlRW51bSxcblxuICAvKipcbiAgICogR2V0cyBhbiBzdHJpbmcgdmVyc2lvbiBvZiBhbiBXZWJHTCBlbnVtLlxuICAgKlxuICAgKiBFeGFtcGxlOlxuICAgKiAgIFdlYkdMRGVidWdVdGlsLmluaXQoY3R4KTtcbiAgICogICB2YXIgc3RyID0gV2ViR0xEZWJ1Z1V0aWwuZ2xFbnVtVG9TdHJpbmcoY3R4LmdldEVycm9yKCkpO1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgVmFsdWUgdG8gcmV0dXJuIGFuIGVudW0gZm9yXG4gICAqIEByZXR1cm4ge3N0cmluZ30gVGhlIHN0cmluZyB2ZXJzaW9uIG9mIHRoZSBlbnVtLlxuICAgKi9cbiAgJ2dsRW51bVRvU3RyaW5nJzogZ2xFbnVtVG9TdHJpbmcsXG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoZSBhcmd1bWVudCBvZiBhIFdlYkdMIGZ1bmN0aW9uIHRvIGEgc3RyaW5nLlxuICAgKiBBdHRlbXB0cyB0byBjb252ZXJ0IGVudW0gYXJndW1lbnRzIHRvIHN0cmluZ3MuXG4gICAqXG4gICAqIEV4YW1wbGU6XG4gICAqICAgV2ViR0xEZWJ1Z1V0aWwuaW5pdChjdHgpO1xuICAgKiAgIHZhciBzdHIgPSBXZWJHTERlYnVnVXRpbC5nbEZ1bmN0aW9uQXJnVG9TdHJpbmcoJ2JpbmRUZXh0dXJlJywgMiwgMCwgZ2wuVEVYVFVSRV8yRCk7XG4gICAqXG4gICAqIHdvdWxkIHJldHVybiAnVEVYVFVSRV8yRCdcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZ1bmN0aW9uTmFtZSB0aGUgbmFtZSBvZiB0aGUgV2ViR0wgZnVuY3Rpb24uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1BcmdzIFRoZSBudW1iZXIgb2YgYXJndW1lbnRzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhcmd1bWVudEluZHggdGhlIGluZGV4IG9mIHRoZSBhcmd1bWVudC5cbiAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgb2YgdGhlIGFyZ3VtZW50LlxuICAgKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSB2YWx1ZSBhcyBhIHN0cmluZy5cbiAgICovXG4gICdnbEZ1bmN0aW9uQXJnVG9TdHJpbmcnOiBnbEZ1bmN0aW9uQXJnVG9TdHJpbmcsXG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoZSBhcmd1bWVudHMgb2YgYSBXZWJHTCBmdW5jdGlvbiB0byBhIHN0cmluZy5cbiAgICogQXR0ZW1wdHMgdG8gY29udmVydCBlbnVtIGFyZ3VtZW50cyB0byBzdHJpbmdzLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZnVuY3Rpb25OYW1lIHRoZSBuYW1lIG9mIHRoZSBXZWJHTCBmdW5jdGlvbi5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGFyZ3MgVGhlIGFyZ3VtZW50cy5cbiAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgYXJndW1lbnRzIGFzIGEgc3RyaW5nLlxuICAgKi9cbiAgJ2dsRnVuY3Rpb25BcmdzVG9TdHJpbmcnOiBnbEZ1bmN0aW9uQXJnc1RvU3RyaW5nLFxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIFdlYkdMIGNvbnRleHQgcmV0dXJucyBhIHdyYXBwZWQgY29udGV4dCB0aGF0IGNhbGxzXG4gICAqIGdsLmdldEVycm9yIGFmdGVyIGV2ZXJ5IGNvbW1hbmQgYW5kIGNhbGxzIGEgZnVuY3Rpb24gaWYgdGhlXG4gICAqIHJlc3VsdCBpcyBub3QgTk9fRVJST1IuXG4gICAqXG4gICAqIFlvdSBjYW4gc3VwcGx5IHlvdXIgb3duIGZ1bmN0aW9uIGlmIHlvdSB3YW50LiBGb3IgZXhhbXBsZSwgaWYgeW91J2QgbGlrZVxuICAgKiBhbiBleGNlcHRpb24gdGhyb3duIG9uIGFueSBHTCBlcnJvciB5b3UgY291bGQgZG8gdGhpc1xuICAgKlxuICAgKiAgICBmdW5jdGlvbiB0aHJvd09uR0xFcnJvcihlcnIsIGZ1bmNOYW1lLCBhcmdzKSB7XG4gICAqICAgICAgdGhyb3cgV2ViR0xEZWJ1Z1V0aWxzLmdsRW51bVRvU3RyaW5nKGVycikgK1xuICAgKiAgICAgICAgICAgIFwiIHdhcyBjYXVzZWQgYnkgY2FsbCB0byBcIiArIGZ1bmNOYW1lO1xuICAgKiAgICB9O1xuICAgKlxuICAgKiAgICBjdHggPSBXZWJHTERlYnVnVXRpbHMubWFrZURlYnVnQ29udGV4dChcbiAgICogICAgICAgIGNhbnZhcy5nZXRDb250ZXh0KFwid2ViZ2xcIiksIHRocm93T25HTEVycm9yKTtcbiAgICpcbiAgICogQHBhcmFtIHshV2ViR0xSZW5kZXJpbmdDb250ZXh0fSBjdHggVGhlIHdlYmdsIGNvbnRleHQgdG8gd3JhcC5cbiAgICogQHBhcmFtIHshZnVuY3Rpb24oZXJyLCBmdW5jTmFtZSwgYXJncyk6IHZvaWR9IG9wdF9vbkVycm9yRnVuYyBUaGUgZnVuY3Rpb25cbiAgICogICAgIHRvIGNhbGwgd2hlbiBnbC5nZXRFcnJvciByZXR1cm5zIGFuIGVycm9yLiBJZiBub3Qgc3BlY2lmaWVkIHRoZSBkZWZhdWx0XG4gICAqICAgICBmdW5jdGlvbiBjYWxscyBjb25zb2xlLmxvZyB3aXRoIGEgbWVzc2FnZS5cbiAgICogQHBhcmFtIHshZnVuY3Rpb24oZnVuY05hbWUsIGFyZ3MpOiB2b2lkfSBvcHRfb25GdW5jIFRoZVxuICAgKiAgICAgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIGVhY2ggd2ViZ2wgZnVuY3Rpb24gaXMgY2FsbGVkLiBZb3VcbiAgICogICAgIGNhbiB1c2UgdGhpcyB0byBsb2cgYWxsIGNhbGxzIGZvciBleGFtcGxlLlxuICAgKi9cbiAgJ21ha2VEZWJ1Z0NvbnRleHQnOiBtYWtlRGVidWdDb250ZXh0LFxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIGNhbnZhcyBlbGVtZW50IHJldHVybnMgYSB3cmFwcGVkIGNhbnZhcyBlbGVtZW50IHRoYXQgd2lsbFxuICAgKiBzaW11bGF0ZSBsb3N0IGNvbnRleHQuIFRoZSBjYW52YXMgcmV0dXJuZWQgYWRkcyB0aGUgZm9sbG93aW5nIGZ1bmN0aW9ucy5cbiAgICpcbiAgICogbG9zZUNvbnRleHQ6XG4gICAqICAgc2ltdWxhdGVzIGEgbG9zdCBjb250ZXh0IGV2ZW50LlxuICAgKlxuICAgKiByZXN0b3JlQ29udGV4dDpcbiAgICogICBzaW11bGF0ZXMgdGhlIGNvbnRleHQgYmVpbmcgcmVzdG9yZWQuXG4gICAqXG4gICAqIGxvc3RDb250ZXh0SW5OQ2FsbHM6XG4gICAqICAgbG9zZXMgdGhlIGNvbnRleHQgYWZ0ZXIgTiBnbCBjYWxscy5cbiAgICpcbiAgICogZ2V0TnVtQ2FsbHM6XG4gICAqICAgdGVsbHMgeW91IGhvdyBtYW55IGdsIGNhbGxzIHRoZXJlIGhhdmUgYmVlbiBzbyBmYXIuXG4gICAqXG4gICAqIHNldFJlc3RvcmVUaW1lb3V0OlxuICAgKiAgIHNldHMgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdW50aWwgdGhlIGNvbnRleHQgaXMgcmVzdG9yZWRcbiAgICogICBhZnRlciBpdCBoYXMgYmVlbiBsb3N0LiBEZWZhdWx0cyB0byAwLiBQYXNzIC0xIHRvIHByZXZlbnRcbiAgICogICBhdXRvbWF0aWMgcmVzdG9yaW5nLlxuICAgKlxuICAgKiBAcGFyYW0geyFDYW52YXN9IGNhbnZhcyBUaGUgY2FudmFzIGVsZW1lbnQgdG8gd3JhcC5cbiAgICovXG4gICdtYWtlTG9zdENvbnRleHRTaW11bGF0aW5nQ2FudmFzJzogbWFrZUxvc3RDb250ZXh0U2ltdWxhdGluZ0NhbnZhcyxcblxuICAvKipcbiAgICogUmVzZXRzIGEgY29udGV4dCB0byB0aGUgaW5pdGlhbCBzdGF0ZS5cbiAgICogQHBhcmFtIHshV2ViR0xSZW5kZXJpbmdDb250ZXh0fSBjdHggVGhlIHdlYmdsIGNvbnRleHQgdG9cbiAgICogICAgIHJlc2V0LlxuICAgKi9cbiAgJ3Jlc2V0VG9Jbml0aWFsU3RhdGUnOiByZXNldFRvSW5pdGlhbFN0YXRlXG59O1xuXG59KCk7XG5cbm1vZHVsZS5leHBvcnRzID0gV2ViR0xEZWJ1Z1V0aWxzO1xuIiwiaW1wb3J0IHsgUGFydGljbGVFbmdpbmUgfSBmcm9tICcuL3BhcnRpY2xlX2VuZ2luZSdcbmltcG9ydCB7IFVzZXJJbnB1dFN0YXRlIH0gZnJvbSAnLi9zdGF0ZSc7XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gU2V0IHVwIFdlYkdMXG4gICAgbGV0IGNhbnZhcyA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5DYW52YXNcIik7XG4gICAgbGV0IGdsID0gY2FudmFzLmdldENvbnRleHQoXCJ3ZWJnbDJcIik7XG4gICAgaWYgKCFnbCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yOiBjb3VsZCBub3QgZ2V0IHdlYmdsMlwiKTtcbiAgICAgICAgY2FudmFzLmhpZGRlbiA9IHRydWU7XG4gICAgICAgIHJldHVyblxuICAgIH1cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdsZXJyb3JcIikuaGlkZGVuID0gdHJ1ZTtcblxuICAgIHZhciBjb3VudCA9IDEwMDAwO1xuICAgIGxldCBzdGF0ZSA9IG5ldyBVc2VySW5wdXRTdGF0ZSgpO1xuICAgIGxldCBlbmdpbmUgPSBuZXcgUGFydGljbGVFbmdpbmUoZ2wsIGNvdW50KTtcblxuICAgIC8vIENhbGxiYWNrc1xuICAgIGNhbnZhcy5vbmNvbnRleHRtZW51ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gZmFsc2U7IH07XG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgc3RhdGUubW91c2VbMF0gPSAoZS5vZmZzZXRYIC8gY2FudmFzLmNsaWVudFdpZHRoKSAqIDIgLSAxO1xuICAgICAgICBzdGF0ZS5tb3VzZVsxXSA9ICgoY2FudmFzLmNsaWVudEhlaWdodCAtIGUub2Zmc2V0WSkgLyBjYW52YXMuY2xpZW50SGVpZ2h0KSAqIDIgLSAxO1xuICAgIH0pO1xuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHN0YXRlLmFjY2VsID0gdHJ1ZTtcbiAgICAgICAgaWYgKGUuYnV0dG9uID09IDIpIHtcbiAgICAgICAgICAgIC8vIEludmVydCBhY2NlbGVyYXRpb24gZm9yIHJpZ2h0IGNsaWNrXG4gICAgICAgICAgICBzdGF0ZS5hY2NlbEFtb3VudCA9IC1NYXRoLmFicyhzdGF0ZS5hY2NlbEFtb3VudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0ZS5hY2NlbEFtb3VudCA9IE1hdGguYWJzKHN0YXRlLmFjY2VsQW1vdW50KTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHN0YXRlLmFjY2VsID0gZmFsc2U7XG4gICAgfSk7XG4gICAgbGV0IGhhbmRsZVJlc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIC8vIFRlbGwgV2ViR0wgaG93IHRvIGNvbnZlcnQgZnJvbSBjbGlwIHNwYWNlIHRvIHBpeGVsc1xuICAgICAgICBnbC52aWV3cG9ydCgwLCAwLCBnbC5jYW52YXMud2lkdGgsIGdsLmNhbnZhcy5oZWlnaHQpO1xuICAgIH07XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgaGFuZGxlUmVzaXplKTtcbiAgICBsZXQgYWN2YWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFjY2VsVmFsXCIpO1xuICAgIGxldCBhYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWNjZWxcIik7XG4gICAgYWMub25pbnB1dCA9IGZ1bmN0aW9uICh0aGlzOiBIVE1MSW5wdXRFbGVtZW50LCBldjogRXZlbnQpIHtcbiAgICAgICAgc3RhdGUuYWNjZWxBbW91bnQgPSBOdW1iZXIodGhpcy52YWx1ZSkgKiAwLjAwMDE7XG4gICAgICAgIGFjdmFsLnRleHRDb250ZW50ID0gc3RhdGUuYWNjZWxBbW91bnQudG9QcmVjaXNpb24oMyk7XG4gICAgfTtcbiAgICBsZXQgcG9pbnRzVmFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb2ludHNWYWxcIik7XG4gICAgbGV0IHBvaW50cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicG9pbnRzXCIpO1xuICAgIHZhciBuZXdDb3VudCA9IDA7XG4gICAgcG9pbnRzLm9uaW5wdXQgPSBmdW5jdGlvbiAodGhpczogSFRNTElucHV0RWxlbWVudCwgZXY6IEV2ZW50KSB7XG4gICAgICAgIG5ld0NvdW50ID0gTWF0aC5yb3VuZCg1MDAgKiBNYXRoLmV4cChOdW1iZXIodGhpcy52YWx1ZSkgLyAxMikpO1xuICAgICAgICBwb2ludHNWYWwudGV4dENvbnRlbnQgPSBcIlwiICsgbmV3Q291bnQ7XG4gICAgfTtcbiAgICBwb2ludHMub25jaGFuZ2UgPSBmdW5jdGlvbiAodGhpczogSFRNTElucHV0RWxlbWVudCwgZXY6IEV2ZW50KSB7XG4gICAgICAgIC8vIFdoZW4gdXNlciBpcyBkb25lIHNsaWRpbmcsIHJlLWluaXQgcGFydGljbGUgYnVmZmVyc1xuICAgICAgICBjb3VudCA9IG5ld0NvdW50O1xuICAgICAgICBlbmdpbmUucmVzZXRQYXJ0aWNsZXMoY291bnQpO1xuICAgIH07XG4gICAgbGV0IHBvaW50c2l6ZVZhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicG9pbnRzaXplVmFsXCIpO1xuICAgIGxldCBwb2ludHNpemUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncG9pbnRzaXplJyk7XG4gICAgcG9pbnRzaXplLm9uaW5wdXQgPSBmdW5jdGlvbiAodGhpczogSFRNTElucHV0RWxlbWVudCwgZXY6IEV2ZW50KSB7XG4gICAgICAgIHN0YXRlLnBhcnRpY2xlU2l6ZSA9IE51bWJlcih0aGlzLnZhbHVlKSAvIDEwLjA7XG4gICAgICAgIHBvaW50c2l6ZVZhbC50ZXh0Q29udGVudCA9IFwiXCIgKyBzdGF0ZS5wYXJ0aWNsZVNpemU7XG4gICAgfTtcblxuICAgIGxldCBmcmFtZUNvdW50ZXIgPSAwO1xuICAgIGxldCBmcHNWYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZwc1wiKTtcbiAgICBsZXQgcHJldkZyYW1lID0gRGF0ZS5ub3coKTtcblxuICAgIGZ1bmN0aW9uIGRyYXdTY2VuZSgpIHtcbiAgICAgICAgZW5naW5lLmRyYXcoc3RhdGUpO1xuICAgICAgICBpZiAoZnJhbWVDb3VudGVyID09IDkpIHtcbiAgICAgICAgICAgIGxldCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgbGV0IGZwcyA9IDEwMDAwLjAgLyAobm93IC0gcHJldkZyYW1lKTtcbiAgICAgICAgICAgIHByZXZGcmFtZSA9IG5vdztcbiAgICAgICAgICAgIGZwc1ZhbC50ZXh0Q29udGVudCA9IFwiXCIgKyBmcHM7XG4gICAgICAgICAgICBmcmFtZUNvdW50ZXIgPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnJhbWVDb3VudGVyICs9IDE7XG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhd1NjZW5lKTtcbiAgICB9XG4gICAgLy8gU2V0IHVwIHBvaW50cyBieSBtYW51YWxseSBjYWxsaW5nIHRoZSBjYWxsYmFja3NcbiAgICBhYy5vbmlucHV0KG51bGwpO1xuICAgIHBvaW50cy5vbmlucHV0KG51bGwpO1xuICAgIHBvaW50cy5vbmNoYW5nZShudWxsKTtcbiAgICBwb2ludHNpemUub25pbnB1dChudWxsKTtcbiAgICBoYW5kbGVSZXNpemUoKTtcbiAgICBkcmF3U2NlbmUoKTtcbn07XG4iLCJpbXBvcnQgKiBhcyBXZWJHTERlYnVnVXRpbHMgZnJvbSAnd2ViZ2wtZGVidWcnXG5pbXBvcnQgeyBWU19TT1VSQ0UsIEZTX1NPVVJDRSwgY3JlYXRlU2hhZGVyIH0gZnJvbSAnLi9zaGFkZXJzJ1xuaW1wb3J0IHsgVXNlcklucHV0U3RhdGUgfSBmcm9tICcuL3N0YXRlJ1xuXG5leHBvcnQgY2xhc3MgUGFydGljbGVFbmdpbmUge1xuICAgIHByaXZhdGUgZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQ7XG4gICAgcHJpdmF0ZSBjb3VudDogbnVtYmVyO1xuICAgIHByaXZhdGUgdHJhbnNmb3JtRmVlZGJhY2s6IFdlYkdMVHJhbnNmb3JtRmVlZGJhY2s7XG4gICAgcHJpdmF0ZSB1bmlmb3JtTG9jcyA9IHtcbiAgICAgICAgYWNjZWw6IG51bGwsXG4gICAgICAgIGFjY2VsQW1vdW50OiBudWxsLFxuICAgICAgICBtb3VzZTogbnVsbCxcbiAgICAgICAgcGFydGljbGVTaXplOiBudWxsXG4gICAgfTtcbiAgICBwcml2YXRlIGJ1ZmZlcnMgPSB7XG4gICAgICAgIHBvc2l0aW9uOiBbbnVsbCwgbnVsbF0sXG4gICAgICAgIHZlbG9jaXR5OiBbbnVsbCwgbnVsbF0sXG4gICAgfTtcbiAgICBwcml2YXRlIGF0dHJpYnV0ZUxvY3MgPSB7XG4gICAgICAgIHBvc2l0aW9uOiBudWxsLFxuICAgICAgICB2ZWxvY2l0eTogbnVsbCxcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBpbmRleCA9IDA7XG5cbiAgICBwcml2YXRlIHRocm93T25HTEVycm9yKGVyciwgZnVuY05hbWUsIGFyZ3MpIHtcbiAgICAgICAgdGhyb3cgV2ViR0xEZWJ1Z1V0aWxzLmdsRW51bVRvU3RyaW5nKGVycikgKyBcIiB3YXMgY2F1c2VkIGJ5IGNhbGwgdG86IFwiICsgZnVuY05hbWU7XG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKGN0eDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgY291bnQ6IG51bWJlcikge1xuICAgICAgICAvL3RoaXMuZ2wgPSBXZWJHTERlYnVnVXRpbHMubWFrZURlYnVnQ29udGV4dChjdHgsIHRoaXMudGhyb3dPbkdMRXJyb3IpO1xuICAgICAgICB0aGlzLmdsID0gY3R4O1xuICAgICAgICBsZXQgZ2wgPSB0aGlzLmdsO1xuXG4gICAgICAgIGxldCB2cyA9IGNyZWF0ZVNoYWRlcihnbCwgZ2wuVkVSVEVYX1NIQURFUiwgVlNfU09VUkNFKTtcbiAgICAgICAgbGV0IGZzID0gY3JlYXRlU2hhZGVyKGdsLCBnbC5GUkFHTUVOVF9TSEFERVIsIEZTX1NPVVJDRSk7XG4gICAgICAgIGxldCBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuICAgICAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgdnMpO1xuICAgICAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgZnMpO1xuICAgICAgICBnbC50cmFuc2Zvcm1GZWVkYmFja1ZhcnlpbmdzKHByb2dyYW0sIFsndl9wb3NpdGlvbicsICd2X3ZlbG9jaXR5J10sIGdsLlNFUEFSQVRFX0FUVFJJQlMpO1xuICAgICAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcblxuICAgICAgICB0aGlzLmJ1ZmZlcnMucG9zaXRpb25bMF0gPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgICAgdGhpcy5idWZmZXJzLnZlbG9jaXR5WzBdID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgICAgIHRoaXMuYnVmZmVycy5wb3NpdGlvblsxXSA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgICB0aGlzLmJ1ZmZlcnMudmVsb2NpdHlbMV0gPSBnbC5jcmVhdGVCdWZmZXIoKTtcblxuICAgICAgICB0aGlzLnVuaWZvcm1Mb2NzLmFjY2VsID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIFwiYWNjZWxcIik7XG4gICAgICAgIHRoaXMudW5pZm9ybUxvY3MuYWNjZWxBbW91bnQgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgXCJhY2NlbEFtb3VudFwiKTtcbiAgICAgICAgdGhpcy51bmlmb3JtTG9jcy5tb3VzZSA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCBcIm1vdXNlXCIpO1xuICAgICAgICB0aGlzLnVuaWZvcm1Mb2NzLnBhcnRpY2xlU2l6ZSA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCBcInBhcnRpY2xlU2l6ZVwiKTtcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVMb2NzLnBvc2l0aW9uID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgXCJhX3Bvc2l0aW9uXCIpO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZUxvY3MudmVsb2NpdHkgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCBcImFfdmVsb2NpdHlcIik7XG5cbiAgICAgICAgbGV0IHZhbyA9IGdsLmNyZWF0ZVZlcnRleEFycmF5KCk7XG4gICAgICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh2YW8pO1xuXG4gICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuYXR0cmlidXRlTG9jcy52ZWxvY2l0eSk7XG4gICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHRoaXMuYXR0cmlidXRlTG9jcy5wb3NpdGlvbik7XG5cbiAgICAgICAgLy8gVGVsbCBpdCB0byB1c2Ugb3VyIHByb2dyYW0gKHBhaXIgb2Ygc2hhZGVycylcbiAgICAgICAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtKTtcblxuICAgICAgICAvLyBCaW5kIHRoZSBhdHRyaWJ1dGUvYnVmZmVyIHNldCB3ZSB3YW50LlxuICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkodmFvKTtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1GZWVkYmFjayA9IGdsLmNyZWF0ZVRyYW5zZm9ybUZlZWRiYWNrKCk7XG4gICAgICAgIHRoaXMucmVzZXRQYXJ0aWNsZXMoY291bnQpO1xuICAgIH1cblxuICAgIGRyYXcoc3RhdGU6IFVzZXJJbnB1dFN0YXRlKSB7XG4gICAgICAgIGxldCBnbCA9IHRoaXMuZ2w7XG4gICAgICAgIGdsLnVuaWZvcm0xaSh0aGlzLnVuaWZvcm1Mb2NzLmFjY2VsLCBzdGF0ZS5hY2NlbCA/IDEgOiAwKTtcbiAgICAgICAgZ2wudW5pZm9ybTFmKHRoaXMudW5pZm9ybUxvY3MuYWNjZWxBbW91bnQsIHN0YXRlLmFjY2VsQW1vdW50KTtcbiAgICAgICAgZ2wudW5pZm9ybTJmKHRoaXMudW5pZm9ybUxvY3MubW91c2UsIHN0YXRlLm1vdXNlWzBdLCBzdGF0ZS5tb3VzZVsxXSk7XG4gICAgICAgIGdsLnVuaWZvcm0xZih0aGlzLnVuaWZvcm1Mb2NzLnBhcnRpY2xlU2l6ZSwgc3RhdGUucGFydGljbGVTaXplKTtcblxuICAgICAgICAvLyBTZXQgdXAgYnVmZmVyIGRhdGFcbiAgICAgICAgbGV0IHNpemUgPSAyOyAgICAgICAgICAvLyAyIGNvbXBvbmVudHMgcGVyIGl0ZXJhdGlvblxuICAgICAgICBsZXQgdHlwZSA9IGdsLkZMT0FUOyAgIC8vIHRoZSBkYXRhIGlzIDMyYml0IGZsb2F0c1xuICAgICAgICBsZXQgbm9ybWFsaXplID0gZmFsc2U7IC8vIGRvbid0IG5vcm1hbGl6ZSB0aGUgZGF0YVxuICAgICAgICBsZXQgc3RyaWRlID0gMDsgICAgICAgIC8vIDAgPSBtb3ZlIGZvcndhcmQgc2l6ZSAqIHNpemVvZih0eXBlKSBlYWNoIGl0ZXJhdGlvbiB0byBnZXQgdGhlIG5leHQgcG9zaXRpb25cbiAgICAgICAgbGV0IG9mZnNldCA9IDA7ICAgICAgICAvLyBzdGFydCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBidWZmZXJcbiAgICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRoaXMuYnVmZmVycy5wb3NpdGlvblt0aGlzLmluZGV4XSk7XG4gICAgICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoXG4gICAgICAgICAgICB0aGlzLmF0dHJpYnV0ZUxvY3MucG9zaXRpb24sIHNpemUsIHR5cGUsIG5vcm1hbGl6ZSwgc3RyaWRlLCBvZmZzZXQpO1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5idWZmZXJzLnZlbG9jaXR5W3RoaXMuaW5kZXhdKTtcbiAgICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihcbiAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlTG9jcy52ZWxvY2l0eSwgc2l6ZSwgdHlwZSwgbm9ybWFsaXplLCBzdHJpZGUsIG9mZnNldCk7XG5cbiAgICAgICAgZ2wuY2xlYXJDb2xvcigwLjAxLCAwLjAxLCAwLjAxLCAxKTtcbiAgICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCk7XG4gICAgICAgIGdsLmJpbmRUcmFuc2Zvcm1GZWVkYmFjayhnbC5UUkFOU0ZPUk1fRkVFREJBQ0ssIHRoaXMudHJhbnNmb3JtRmVlZGJhY2spO1xuICAgICAgICBnbC5iaW5kQnVmZmVyQmFzZShnbC5UUkFOU0ZPUk1fRkVFREJBQ0tfQlVGRkVSLCAwLCB0aGlzLmJ1ZmZlcnMucG9zaXRpb25bMS10aGlzLmluZGV4XSk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXJCYXNlKGdsLlRSQU5TRk9STV9GRUVEQkFDS19CVUZGRVIsIDEsIHRoaXMuYnVmZmVycy52ZWxvY2l0eVsxLXRoaXMuaW5kZXhdKTtcbiAgICAgICAgZ2wuYmVnaW5UcmFuc2Zvcm1GZWVkYmFjayhnbC5QT0lOVFMpO1xuICAgICAgICBnbC5kcmF3QXJyYXlzKGdsLlBPSU5UUywgMCwgdGhpcy5jb3VudCk7XG4gICAgICAgIGdsLmVuZFRyYW5zZm9ybUZlZWRiYWNrKCk7XG4gICAgICAgIGdsLmJpbmRCdWZmZXJCYXNlKGdsLlRSQU5TRk9STV9GRUVEQkFDS19CVUZGRVIsIDAsIG51bGwpO1xuICAgICAgICBnbC5iaW5kQnVmZmVyQmFzZShnbC5UUkFOU0ZPUk1fRkVFREJBQ0tfQlVGRkVSLCAxLCBudWxsKTtcbiAgICAgICAgLy8gU3dhcCBidWZmZXJzXG4gICAgICAgIHRoaXMuaW5kZXggPSAxIC0gdGhpcy5pbmRleDtcbiAgICB9XG5cbiAgICByZXNldFBhcnRpY2xlcyhjb3VudDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuY291bnQgPSBjb3VudDtcbiAgICAgICAgbGV0IHBvc2l0aW9ucyA9IFtdO1xuICAgICAgICBsZXQgdmVscyA9IFtdO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgcG9zaXRpb25zLnB1c2goMiAqIE1hdGgucmFuZG9tKCkgLSAxKTsgLy8geFxuICAgICAgICAgICAgcG9zaXRpb25zLnB1c2goMiAqIE1hdGgucmFuZG9tKCkgLSAxKTsgLy8geVxuICAgICAgICAgICAgdmVscy5wdXNoKDAuMCk7XG4gICAgICAgICAgICB2ZWxzLnB1c2goMC4wKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZ2wgPSB0aGlzLmdsO1xuICAgICAgICAvLyBGaWxsIG1haW4gYnVmZmVyc1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5idWZmZXJzLnBvc2l0aW9uWzBdKTtcbiAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkocG9zaXRpb25zKSwgZ2wuU1RBVElDX0RSQVcpO1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5idWZmZXJzLnZlbG9jaXR5WzBdKTtcbiAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodmVscyksIGdsLlNUQVRJQ19EUkFXKTtcblxuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5idWZmZXJzLnBvc2l0aW9uWzFdKTtcbiAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkocG9zaXRpb25zKSwgZ2wuU1RBVElDX0RSQVcpO1xuICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdGhpcy5idWZmZXJzLnZlbG9jaXR5WzFdKTtcbiAgICAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodmVscyksIGdsLlNUQVRJQ19EUkFXKTtcblxuICAgICAgICAvLyBVbmJpbmQgYnVmZmVyXG4gICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKTtcbiAgICB9XG59XG4iLCJsZXQgVlNfU09VUkNFID0gYCN2ZXJzaW9uIDMwMCBlc1xuXG4gICAgdW5pZm9ybSB2ZWMyIG1vdXNlO1xuICAgIHVuaWZvcm0gYm9vbCBhY2NlbDtcbiAgICB1bmlmb3JtIGZsb2F0IGFjY2VsQW1vdW50O1xuICAgIHVuaWZvcm0gZmxvYXQgcGFydGljbGVTaXplO1xuXG4gICAgaW4gdmVjMiBhX3Bvc2l0aW9uO1xuICAgIGluIHZlYzIgYV92ZWxvY2l0eTtcbiAgICBvdXQgdmVjMiB2X3Bvc2l0aW9uO1xuICAgIG91dCB2ZWMyIHZfdmVsb2NpdHk7XG5cbiAgICAvLyBmcm9tIGh0dHBzOi8vdGhlYm9va29mc2hhZGVycy5jb20vMTAvXG4gICAgZmxvYXQgcmFuZG9tICh2ZWMyIHN0KSB7XG4gICAgICAgIHJldHVybiBmcmFjdChzaW4oZG90KHN0Lnh5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlYzIoMTIuOTg5OCw3OC4yMzMpKSkqXG4gICAgICAgICAgICA0Mzc1OC41NDUzMTIzKTtcbiAgICB9XG5cbiAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgIGdsX1BvaW50U2l6ZSA9IHBhcnRpY2xlU2l6ZTtcbiAgICAgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KGFfcG9zaXRpb24sIDAsIDEpO1xuICAgICAgICAvLyBQYXNzIHRocm91Z2ggdG8gZnJhZ21lbnQgc2hhZGVyXG4gICAgICAgIHZfdmVsb2NpdHkgPSBhX3ZlbG9jaXR5O1xuICAgICAgICAvL3ZfdmVsb2NpdHkueSAtPSAwLjAwMDE7XG5cbiAgICAgICAgaWYoYWNjZWwpIHtcbiAgICAgICAgICAgIHZlYzIgZGVsID0gbm9ybWFsaXplKG1vdXNlIC0gYV9wb3NpdGlvbik7XG4gICAgICAgICAgICBpZiAoYWNjZWxBbW91bnQgPCAwLjApIHtcbiAgICAgICAgICAgICAgICB2X3ZlbG9jaXR5IC09IHZlYzIoZGVsLnksIC1kZWwueCkqYWNjZWxBbW91bnQvNS4wICsgZGVsICogYWNjZWxBbW91bnQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZfdmVsb2NpdHkgKz0gZGVsICogYWNjZWxBbW91bnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGcmljdGlvblxuICAgICAgICB2X3ZlbG9jaXR5ICo9ICgxLjAgLSAwLjAxICogKDEuMCArIHJhbmRvbSh2X3Bvc2l0aW9uKSkpO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBwb3MvdmVsIGZvciB0cmFuc2Zvcm0gZmVlZGJhY2tcbiAgICAgICAgdl9wb3NpdGlvbiA9IGFfcG9zaXRpb247XG4gICAgICAgIHZfcG9zaXRpb24gKz0gdl92ZWxvY2l0eTtcbiAgICAgICAgaWYodl9wb3NpdGlvbi54ID4gMS4wKSB7XG4gICAgICAgICAgICB2X3Bvc2l0aW9uLnggPSAyLjAgLSB2X3Bvc2l0aW9uLng7XG4gICAgICAgICAgICB2X3ZlbG9jaXR5LnggPSAtdl92ZWxvY2l0eS54O1xuICAgICAgICB9XG4gICAgICAgIGlmKHZfcG9zaXRpb24ueSA+IDEuMCkge1xuICAgICAgICAgICAgdl9wb3NpdGlvbi55ID0gMi4wIC0gdl9wb3NpdGlvbi55O1xuICAgICAgICAgICAgdl92ZWxvY2l0eS55ID0gLXZfdmVsb2NpdHkueTtcbiAgICAgICAgfVxuICAgICAgICBpZih2X3Bvc2l0aW9uLnggPCAtMS4wKSB7XG4gICAgICAgICAgICB2X3Bvc2l0aW9uLnggPSAtMi4wIC0gdl9wb3NpdGlvbi54O1xuICAgICAgICAgICAgdl92ZWxvY2l0eS54ID0gLXZfdmVsb2NpdHkueDtcbiAgICAgICAgfVxuICAgICAgICBpZih2X3Bvc2l0aW9uLnkgPCAtMS4wKSB7XG4gICAgICAgICAgICB2X3Bvc2l0aW9uLnkgPSAtMi4wIC0gdl9wb3NpdGlvbi55O1xuICAgICAgICAgICAgdl92ZWxvY2l0eS55ID0gLXZfdmVsb2NpdHkueTtcbiAgICAgICAgfVxuICAgIH1cbmA7XG5cbmxldCBGU19TT1VSQ0UgPSBgI3ZlcnNpb24gMzAwIGVzXG5cbiAgICAvLyBmcmFnbWVudCBzaGFkZXJzIGRvbid0IGhhdmUgYSBkZWZhdWx0IHByZWNpc2lvbiBzbyB3ZSBuZWVkXG4gICAgLy8gdG8gcGljayBvbmUuIG1lZGl1bXAgaXMgYSBnb29kIGRlZmF1bHQuIEl0IG1lYW5zIFwibWVkaXVtIHByZWNpc2lvblwiXG4gICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XG5cbiAgICBpbiB2ZWMyIHZfdmVsb2NpdHk7XG4gICAgLy8gd2UgbmVlZCB0byBkZWNsYXJlIGFuIG91dHB1dCBmb3IgdGhlIGZyYWdtZW50IHNoYWRlclxuICAgIG91dCB2ZWM0IG91dENvbG9yO1xuXG4gICAgdmVjMyBoc3YycmdiKHZlYzMgYykge1xuICAgICAgICB2ZWM0IEsgPSB2ZWM0KDEuMCwgMi4wIC8gMy4wLCAxLjAgLyAzLjAsIDMuMCk7XG4gICAgICAgIHZlYzMgcCA9IGFicyhmcmFjdChjLnh4eCArIEsueHl6KSAqIDYuMCAtIEsud3d3KTtcbiAgICAgICAgcmV0dXJuIGMueiAqIG1peChLLnh4eCwgY2xhbXAocCAtIEsueHh4LCAwLjAsIDEuMCksIGMueSk7XG4gICAgfVxuXG4gICAgdm9pZCBtYWluKCkge1xuICAgICAgICAvLyBUZWNobmljYWxseSBIU1YgaXMgc3VwcG9zZWQgdG8gYmUgYmV0d2VlbiAwIGFuZCAxIGJ1dCBJIGZvdW5kIHRoYXRcbiAgICAgICAgLy8gbGV0dGluZyB0aGUgdmFsdWUgZ28gaGlnaGVyIGNhdXNlcyBpdCB0byB3cmFwLWFyb3VuZCBhbmQgbG9vayBjb29sXG4gICAgICAgIGZsb2F0IHZlbCA9IGNsYW1wKGxlbmd0aCh2X3ZlbG9jaXR5KSAqIDIwLjAsIDAuMCwgMi4wKTtcbiAgICAgICAgb3V0Q29sb3IgPSB2ZWM0KFxuICAgICAgICAgICAgaHN2MnJnYih2ZWMzKFxuICAgICAgICAgICAgICAgIDAuNiAtIHZlbCAqIDAuNiwgIC8vIGh1ZVxuICAgICAgICAgICAgICAgIDEuMCwgICAgICAgICAgICAgICAvLyBzYXRcbiAgICAgICAgICAgICAgICBtYXgoMC4yICsgdmVsLCAwLjgpIC8vIHZpYnJhbmNlXG4gICAgICAgICAgICApKSxcbiAgICAgICAgMS4wKTtcbiAgICB9XG5gO1xuXG4vLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly93ZWJnbDJmdW5kYW1lbnRhbHMub3JnL3dlYmdsL2xlc3NvbnMvd2ViZ2wtZnVuZGFtZW50YWxzLmh0bWxcbmZ1bmN0aW9uIGNyZWF0ZVNoYWRlcihnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgdHlwZTogbnVtYmVyLCBzb3VyY2U6IHN0cmluZykge1xuICAgIGxldCBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIodHlwZSk7XG4gICAgZ2wuc2hhZGVyU291cmNlKHNoYWRlciwgc291cmNlKTtcbiAgICBnbC5jb21waWxlU2hhZGVyKHNoYWRlcik7XG4gICAgbGV0IHN1Y2Nlc3MgPSBnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoc2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUyk7XG4gICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgcmV0dXJuIHNoYWRlcjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgZSA9IFwiU2hhZGVyIGJ1aWxkIGVycm9yOiBcIiArIGdsLmdldFNoYWRlckluZm9Mb2coc2hhZGVyKTtcbiAgICAgICAgZ2wuZGVsZXRlU2hhZGVyKHNoYWRlcik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlKTtcbiAgICB9XG59XG5leHBvcnQge1ZTX1NPVVJDRSwgRlNfU09VUkNFLCBjcmVhdGVTaGFkZXJ9XG4iLCJleHBvcnQgY2xhc3MgVXNlcklucHV0U3RhdGUge1xuICAgIG1vdXNlID0gWzAsIDBdO1xuICAgIGFjY2VsID0gZmFsc2U7XG4gICAgcGFydGljbGVTaXplID0gMS4wO1xuICAgIGFjY2VsQW1vdW50ID0gMC4wMDE7XG59XG4iXX0=
