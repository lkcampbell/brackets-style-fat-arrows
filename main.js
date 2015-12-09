/*
 * The MIT License (MIT)
 * Copyright (c) 2015 Lance Campbell. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/*jslint vars: true, plusplus: true, devel: true, regexp: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $ */

define(function (require, exports, module) {
    "use strict";
    
    // Brackets modules
    var EditorManager       = brackets.getModule("editor/EditorManager"),
        AppInit             = brackets.getModule("utils/AppInit"),
        MainViewManager     = brackets.getModule("view/MainViewManager");
    
    // Constants
    var JS_MODES = ["javascript", "text/x-brackets-html", "application/x-ejs"];
    
    // State variables
    var inBlockComment = false;
    
    // CodeMirror overlay code
    var fatArrowOverlay = {
        token: function (stream, state) {
            
            if (stream.match("=>") && (!inBlockComment)) {
                return "keyword";
            }
            
            // Skip fat arrows in terminated strings
            if (stream.match(/([\"']).*?[^\\]\1/)) {
                return null;
            }
            
            // Skip fat arrows in unterminated strings
            if (stream.match(/([\"'])[^\1]*/)) {
                return null;
            }
            
            // Skip fat arrows in line comments
            if (stream.match("//")) {
                stream.skipToEnd();
                return null;
            }
            
            // Skip fat arrows in block comments
            if (stream.match("/*")) {
                inBlockComment = true;
                return null;
            }
            
            if (stream.match("*/")) {
                inBlockComment = false;
                return null;
            }
            
            // Skip fat arrows in terminated regex expressions
            if (stream.match(/\/.*?[^\\]\//)) {
                return null;
            }
            
            // Skip fat arrows in unterminated regex expressions...
            if (stream.match(/\/[^\/]*/)) {
                return null;
            }
            
            // Advance the stream
            stream.next();
            
            // Skip everything else
            return null;
        }
    };
    
    function updateOverlay() {
        var editor      = EditorManager.getCurrentFullEditor(),
            cm          = editor ? editor._codeMirror : null,
            cmMode      = "";
        
        if (cm) {
            // Only apply the overlay in a mode that *might* contain Javascript
            cmMode = cm.options.mode;
            
            if ((typeof cm.options.mode) === "string") {
                cmMode = cm.options.mode;
            } else {
                cmMode = cm.options.mode[name];
            }
            
            if (JS_MODES.indexOf(cmMode) !== -1) {
                cm.removeOverlay(fatArrowOverlay);
                cm.addOverlay(fatArrowOverlay);
                cm.refresh();
            }
        }
    }
    
    // Initialize extension
    AppInit.appReady(function () {
        MainViewManager.on("currentFileChange", updateOverlay);
        updateOverlay();
    });
});
