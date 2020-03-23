Root.Runtime.cachedResources["object_ui/customPreviewComponent.css"]="/*\n * Copyright (c) 2015 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.custom-expandable-section {\n    display: inline-flex;\n    flex-direction: column;\n}\n\n.custom-expand-icon {\n    user-select: none;\n    opacity: 0.5;\n    margin-right: 4px;\n    margin-bottom: -2px;\n    background: black;\n}\n\n.custom-expandable-section-standard-section {\n    display: inline-flex;\n}\n\n/*# sourceURL=object_ui/customPreviewComponent.css */";Root.Runtime.cachedResources["object_ui/objectPopover.css"]="/*\n * Copyright 2017 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.object-popover-content {\n    display: block;\n    position: relative;\n    overflow: hidden;\n    flex: 1 1 auto;\n}\n\n.object-popover-title {\n    text-overflow: ellipsis;\n    overflow: hidden;\n    white-space: nowrap;\n    font-weight: bold;\n    padding-left: 18px;\n    padding-bottom: 2px;\n}\n\n.object-popover-tree {\n    border-top: 1px solid rgb(184, 184, 184);\n    overflow: auto;\n    width: 100%;\n    height: calc(100% - 13px);\n}\n\n.object-popover-container {\n    display: inline-block;\n}\n\n.function-popover-title {\n    border-bottom: 1px solid #AAA;\n    margin-bottom: 3px;\n    padding-bottom: 2px;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n}\n\n.function-popover-title .function-name {\n    font-weight: bold;\n}\n\n.function-title-link-container {\n    display: flex;\n    align-items: center;\n    position: relative;\n    margin-left: 10px;\n}\n\n.function-title-link-container .devtools-link {\n    white-space: nowrap;\n    overflow: hidden;\n}\n\n/*# sourceURL=object_ui/objectPopover.css */";Root.Runtime.cachedResources["object_ui/objectPropertiesSection.css"]="/*\n * Copyright 2015 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.object-properties-section-dimmed {\n    opacity: 0.6;\n}\n\n.object-properties-section {\n    padding: 0 0 0px 0px;\n    color: rgb(33,33,33) !important;\n    display: flex;\n    flex-direction: column;\n}\n\n.object-properties-section li {\n    user-select: text;\n}\n\n.object-properties-section li::before {\n    top: -1px;\n}\n\n.object-properties-section li.editing-sub-part {\n    padding: 3px 12px 8px 6px;\n    margin: -1px -6px -8px -6px;\n    text-overflow: clip;\n}\n\n.object-properties-section li.editing {\n    margin-left: 10px;\n    text-overflow: clip;\n}\n\n.tree-outline ol.title-less-mode {\n    padding-left: 0px;\n}\n\n.object-properties-section .synthetic-property {\n    font-style: italic;\n}\n\n.object-properties-section .private-property-hash {\n    color: #222;\n}\n\n.object-properties-section-root-element {\n    display: flex;\n    flex-direction: row;\n}\n\n.object-properties-section .editable-div {\n    overflow: hidden;\n}\n\n.name-and-value {\n    overflow: hidden;\n    text-overflow: ellipsis;\n    line-height: 16px;\n}\n\n.editing-sub-part .name-and-value {\n    overflow: visible;\n    display: inline-flex;\n}\n\n.property-prompt {\n    margin-left: 4px;\n}\n\n.tree-outline.hide-selection-when-blurred .selected:focus[data-keyboard-focus=\"true\"] {\n    background: none;\n}\n\n.tree-outline.hide-selection-when-blurred .selected:focus[data-keyboard-focus=\"true\"] ::slotted(*),\n.tree-outline.hide-selection-when-blurred .selected:focus[data-keyboard-focus=\"true\"] .tree-element-title,\n.tree-outline.hide-selection-when-blurred .selected:focus[data-keyboard-focus=\"true\"] .name-and-value {\n    background: var(--focus-bg-color);\n    border-radius: 2px;\n    box-shadow: 0px 0px 0px 2px var(--focus-bg-color);\n}\n\n/*# sourceURL=object_ui/objectPropertiesSection.css */";Root.Runtime.cachedResources["object_ui/objectValue.css"]="/*\n * Copyright 2015 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.object-value-scientific-notation-exponent {\n    flex-shrink: 0;\n}\n\n.object-value-scientific-notation-mantissa {\n    overflow: hidden;\n    text-overflow: ellipsis;\n    flex-shrink: 1;\n    min-width: 1ex;\n}\n\n.object-value-scientific-notation-number {\n    display: flex !important;\n}\n\n.value.object-value-node:hover {\n    background-color: var(--item-hover-color);\n}\n\n.object-value-function-prefix,\n.object-value-boolean {\n    color: rgb(13, 34, 170);\n}\n\n.object-value-function {\n    font-style: italic;\n}\n\n.object-value-function.linkified:hover {\n    background-color: rgba(0, 0, 0, 0.1);\n    cursor: pointer;\n}\n\n.object-value-number {\n    color: rgb(28, 0, 207);\n}\n\n.object-value-bigint {\n    color: rgb(0, 93, 0);\n}\n\n.object-value-string,\n.object-value-regexp,\n.object-value-symbol {\n    white-space: pre !important;\n    unicode-bidi: -webkit-isolate;\n    color: rgb(196, 26, 22);\n}\n\n.object-value-string-quote {\n    color: #222;\n}\n\n.object-value-node {\n    position: relative;\n    vertical-align: baseline;\n    color: rgb(48, 57, 66);\n    display: inline-block;\n}\n\n.object-value-null,\n.object-value-undefined {\n    color: rgb(128, 128, 128);\n}\n\n.object-value-calculate-value-button:hover {\n    text-decoration: underline;\n}\n\n.object-properties-section-custom-section {\n    display: inline-flex;\n    flex-direction: column;\n}\n\n.-theme-with-dark-background .object-value-number,\n:host-context(.-theme-with-dark-background) .object-value-number,\n.-theme-with-dark-background .object-value-boolean,\n:host-context(.-theme-with-dark-background) .object-value-boolean {\n    color: hsl(252, 100%, 75%);\n}\n\n.object-properties-section .object-description {\n    color: gray;\n}\n\n.value .object-properties-preview {\n    white-space: nowrap;\n}\n\n.name {\n    color: rgb(136, 19, 145);\n    flex-shrink: 0;\n}\n\n.object-properties-preview .name {\n    color: #565656;\n}\n\n/*# sourceURL=object_ui/objectValue.css */";