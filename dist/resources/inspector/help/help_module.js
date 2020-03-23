Root.Runtime.cachedResources["help/releaseNote.css"]="/*\n * Copyright 2017 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n:host {\n}\n\n.hbox {\n    overflow-y: auto;\n    overflow-x: hidden;\n}\n\n.release-note-top-section {\n    height: 27px;\n    line-height: 27px;\n    padding: 0 15px;\n    flex: none;\n    background-color: var(--toolbar-bg-color);\n    border-bottom: var(--divider-border);\n    overflow: hidden;\n    white-space: nowrap;\n    text-overflow: ellipsis;\n}\n\n:host-context(.-theme-with-dark-background) .release-note-top-section {\n    color: white;\n}\n\n.release-note-container {\n    display: flex;\n    flex-direction: column;\n}\n\n.release-note-container ul {\n    display: flex;\n    padding: 10px 16px;\n    flex-direction: column;\n    flex: none;\n    margin: 4px 12px 0 2px;\n    max-width: 600px;\n}\n\n.release-note-container li {\n    display: flex;\n    flex-direction:column;\n    flex: none;\n    line-height: 24px;\n    font-size: 14px;\n}\n\n\n.release-note-container li:hover {\n    color: #039be5;\n}\n\n.release-note-title,\n.release-note-subtitle {\n    color: inherit;\n    text-decoration: none;\n}\n\n.release-note-subtitle {\n    font-size: 13px;\n    line-height: 13px;\n    padding-bottom: 8px;\n}\n\n.release-note-container li:not(:hover) .release-note-subtitle {\n    color: #999;\n}\n\n.release-note-action-container > button {\n    margin: 10px 0 20px 20px;\n    color: #757575;\n}\n\n.release-note-action-container {\n    flex: none;\n}\n\n.release-note-image {\n    flex-shrink: 2;\n}\n\nimg {\n    margin: 20px;\n    width: 260px;\n    height: 200px;\n    flex: none;\n    box-shadow: 0 2px 4px rgba(0, 0, 0, .3);\n}\n\nimg:hover {\n    box-shadow: 0 2px 4px rgba(0, 0, 0, .5);\n}\n\n/*# sourceURL=help/releaseNote.css */";