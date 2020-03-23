export class DOMBreakpointsSidebarPane extends UI.VBox{constructor(){super(true);this.registerRequiredCSS('browser_debugger/domBreakpointsSidebarPane.css');this._listElement=this.contentElement.createChild('div','breakpoint-list hidden');this._emptyElement=this.contentElement.createChild('div','gray-info-message');this._emptyElement.textContent=Common.UIString('No breakpoints');this._items=new Map();SDK.targetManager.addModelListener(SDK.DOMDebuggerModel,SDK.DOMDebuggerModel.Events.DOMBreakpointAdded,this._breakpointAdded,this);SDK.targetManager.addModelListener(SDK.DOMDebuggerModel,SDK.DOMDebuggerModel.Events.DOMBreakpointToggled,this._breakpointToggled,this);SDK.targetManager.addModelListener(SDK.DOMDebuggerModel,SDK.DOMDebuggerModel.Events.DOMBreakpointsRemoved,this._breakpointsRemoved,this);for(const domDebuggerModel of SDK.targetManager.models(SDK.DOMDebuggerModel)){domDebuggerModel.retrieveDOMBreakpoints();for(const breakpoint of domDebuggerModel.domBreakpoints()){this._addBreakpoint(breakpoint);}}
this._highlightedElement=null;this._update();}
_breakpointAdded(event){this._addBreakpoint((event.data));}
_breakpointToggled(event){const breakpoint=(event.data);const item=this._items.get(breakpoint);if(item){item.checkbox.checked=breakpoint.enabled;}}
_breakpointsRemoved(event){const breakpoints=(event.data);for(const breakpoint of breakpoints){const item=this._items.get(breakpoint);if(item){this._items.delete(breakpoint);this._listElement.removeChild(item.element);}}
if(!this._listElement.firstChild){this._emptyElement.classList.remove('hidden');this._listElement.classList.add('hidden');}}
_addBreakpoint(breakpoint){const element=createElementWithClass('div','breakpoint-entry');element.addEventListener('contextmenu',this._contextMenu.bind(this,breakpoint),true);const checkboxLabel=UI.CheckboxLabel.create('',breakpoint.enabled);const checkboxElement=checkboxLabel.checkboxElement;checkboxElement.addEventListener('click',this._checkboxClicked.bind(this,breakpoint),false);element.appendChild(checkboxLabel);const labelElement=createElementWithClass('div','dom-breakpoint');element.appendChild(labelElement);const description=createElement('div');const breakpointTypeLabel=BreakpointTypeLabels.get(breakpoint.type);description.textContent=breakpointTypeLabel;const linkifiedNode=createElementWithClass('monospace');linkifiedNode.style.display='block';labelElement.appendChild(linkifiedNode);Common.Linkifier.linkify(breakpoint.node).then(linkified=>{linkifiedNode.appendChild(linkified);UI.ARIAUtils.setAccessibleName(checkboxElement,ls`${breakpointTypeLabel}: ${linkified.deepTextContent()}`);});labelElement.appendChild(description);const item={breakpoint:breakpoint,element:element,checkbox:checkboxElement};element._item=item;this._items.set(breakpoint,item);let currentElement=this._listElement.firstChild;while(currentElement){if(currentElement._item&&currentElement._item.breakpoint.type<breakpoint.type){break;}
currentElement=currentElement.nextSibling;}
this._listElement.insertBefore(element,currentElement);this._emptyElement.classList.add('hidden');this._listElement.classList.remove('hidden');}
_contextMenu(breakpoint,event){const contextMenu=new UI.ContextMenu(event);contextMenu.defaultSection().appendItem(Common.UIString('Remove breakpoint'),()=>{breakpoint.domDebuggerModel.removeDOMBreakpoint(breakpoint.node,breakpoint.type);});contextMenu.defaultSection().appendItem(Common.UIString('Remove all DOM breakpoints'),()=>{breakpoint.domDebuggerModel.removeAllDOMBreakpoints();});contextMenu.show();}
_checkboxClicked(breakpoint){const item=this._items.get(breakpoint);if(!item){return;}
breakpoint.domDebuggerModel.toggleDOMBreakpoint(breakpoint,item.checkbox.checked);}
flavorChanged(object){this._update();}
_update(){const details=UI.context.flavor(SDK.DebuggerPausedDetails);if(!details||!details.auxData||details.reason!==SDK.DebuggerModel.BreakReason.DOM){if(this._highlightedElement){this._highlightedElement.classList.remove('breakpoint-hit');delete this._highlightedElement;}
return;}
const domDebuggerModel=details.debuggerModel.target().model(SDK.DOMDebuggerModel);if(!domDebuggerModel){return;}
const data=domDebuggerModel.resolveDOMBreakpointData((details.auxData));if(!data){return;}
let element=null;for(const item of this._items.values()){if(item.breakpoint.node===data.node&&item.breakpoint.type===data.type){element=item.element;}}
if(!element){return;}
UI.viewManager.showView('sources.domBreakpoints');element.classList.add('breakpoint-hit');this._highlightedElement=element;}}
export const BreakpointTypeLabels=new Map([[SDK.DOMDebuggerModel.DOMBreakpoint.Type.SubtreeModified,Common.UIString('Subtree modified')],[SDK.DOMDebuggerModel.DOMBreakpoint.Type.AttributeModified,Common.UIString('Attribute modified')],[SDK.DOMDebuggerModel.DOMBreakpoint.Type.NodeRemoved,Common.UIString('Node removed')],]);export class ContextMenuProvider{appendApplicableItems(event,contextMenu,object){const node=(object);if(node.pseudoType()){return;}
const domDebuggerModel=node.domModel().target().model(SDK.DOMDebuggerModel);if(!domDebuggerModel){return;}
function toggleBreakpoint(type){if(domDebuggerModel.hasDOMBreakpoint(node,type)){domDebuggerModel.removeDOMBreakpoint(node,type);}else{domDebuggerModel.setDOMBreakpoint(node,type);}}
const breakpointsMenu=contextMenu.debugSection().appendSubMenuItem(Common.UIString('Break on'));for(const key in SDK.DOMDebuggerModel.DOMBreakpoint.Type){const type=SDK.DOMDebuggerModel.DOMBreakpoint.Type[key];const label=Sources.DebuggerPausedMessage.BreakpointTypeNouns.get(type);breakpointsMenu.defaultSection().appendCheckboxItem(label,toggleBreakpoint.bind(null,type),domDebuggerModel.hasDOMBreakpoint(node,type));}}}
self.BrowserDebugger=self.BrowserDebugger||{};BrowserDebugger=BrowserDebugger||{};BrowserDebugger.DOMBreakpointsSidebarPane=DOMBreakpointsSidebarPane;BrowserDebugger.DOMBreakpointsSidebarPane.BreakpointTypeLabels=BreakpointTypeLabels;BrowserDebugger.DOMBreakpointsSidebarPane.Item;BrowserDebugger.DOMBreakpointsSidebarPane.ContextMenuProvider=ContextMenuProvider;