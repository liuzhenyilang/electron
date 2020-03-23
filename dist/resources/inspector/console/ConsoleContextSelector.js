export default class ConsoleContextSelector{constructor(){this._items=new UI.ListModel();this._dropDown=new UI.SoftDropDown(this._items,this);this._dropDown.setRowHeight(36);this._toolbarItem=new UI.ToolbarItem(this._dropDown.element);this._toolbarItem.setEnabled(false);this._toolbarItem.setTitle(ls`JavaScript context: Not selected`);this._items.addEventListener(UI.ListModel.Events.ItemsReplaced,()=>this._toolbarItem.setEnabled(!!this._items.length));this._toolbarItem.element.classList.add('toolbar-has-dropdown');SDK.targetManager.addModelListener(SDK.RuntimeModel,SDK.RuntimeModel.Events.ExecutionContextCreated,this._onExecutionContextCreated,this);SDK.targetManager.addModelListener(SDK.RuntimeModel,SDK.RuntimeModel.Events.ExecutionContextChanged,this._onExecutionContextChanged,this);SDK.targetManager.addModelListener(SDK.RuntimeModel,SDK.RuntimeModel.Events.ExecutionContextDestroyed,this._onExecutionContextDestroyed,this);SDK.targetManager.addModelListener(SDK.ResourceTreeModel,SDK.ResourceTreeModel.Events.FrameNavigated,this._frameNavigated,this);UI.context.addFlavorChangeListener(SDK.ExecutionContext,this._executionContextChangedExternally,this);UI.context.addFlavorChangeListener(SDK.DebuggerModel.CallFrame,this._callFrameSelectedInUI,this);SDK.targetManager.observeModels(SDK.RuntimeModel,this);SDK.targetManager.addModelListener(SDK.DebuggerModel,SDK.DebuggerModel.Events.CallFrameSelected,this._callFrameSelectedInModel,this);}
toolbarItem(){return this._toolbarItem;}
highlightedItemChanged(from,to,fromElement,toElement){SDK.OverlayModel.hideDOMNodeHighlight();if(to&&to.frameId){const overlayModel=to.target().model(SDK.OverlayModel);if(overlayModel){overlayModel.highlightFrame(to.frameId);}}
if(fromElement){fromElement.classList.remove('highlighted');}
if(toElement){toElement.classList.add('highlighted');}}
titleFor(executionContext){const target=executionContext.target();let label=executionContext.label()?target.decorateLabel(executionContext.label()):'';if(executionContext.frameId){const resourceTreeModel=target.model(SDK.ResourceTreeModel);const frame=resourceTreeModel&&resourceTreeModel.frameForId(executionContext.frameId);if(frame){label=label||frame.displayName();}}
label=label||executionContext.origin;return label;}
_depthFor(executionContext){let target=executionContext.target();let depth=0;if(!executionContext.isDefault){depth++;}
if(executionContext.frameId){const resourceTreeModel=target.model(SDK.ResourceTreeModel);let frame=resourceTreeModel&&resourceTreeModel.frameForId(executionContext.frameId);while(frame){frame=frame.parentFrame||frame.crossTargetParentFrame();if(frame){depth++;target=frame.resourceTreeModel().target();}}}
let targetDepth=0;while(target.parentTarget()&&target.type()!==SDK.Target.Type.ServiceWorker){targetDepth++;target=target.parentTarget();}
depth+=targetDepth;return depth;}
_executionContextCreated(executionContext){this._items.insertWithComparator(executionContext,executionContext.runtimeModel.executionContextComparator());if(executionContext===UI.context.flavor(SDK.ExecutionContext)){this._dropDown.selectItem(executionContext);}}
_onExecutionContextCreated(event){const executionContext=(event.data);this._executionContextCreated(executionContext);}
_onExecutionContextChanged(event){const executionContext=(event.data);if(this._items.indexOf(executionContext)===-1){return;}
this._executionContextDestroyed(executionContext);this._executionContextCreated(executionContext);}
_executionContextDestroyed(executionContext){const index=this._items.indexOf(executionContext);if(index===-1){return;}
this._items.remove(index);}
_onExecutionContextDestroyed(event){const executionContext=(event.data);this._executionContextDestroyed(executionContext);}
_executionContextChangedExternally(event){const executionContext=(event.data);this._dropDown.selectItem(executionContext);}
_isTopContext(executionContext){if(!executionContext||!executionContext.isDefault){return false;}
const resourceTreeModel=executionContext.target().model(SDK.ResourceTreeModel);const frame=executionContext.frameId&&resourceTreeModel&&resourceTreeModel.frameForId(executionContext.frameId);if(!frame){return false;}
return frame.isTopFrame();}
_hasTopContext(){return this._items.some(executionContext=>this._isTopContext(executionContext));}
modelAdded(runtimeModel){runtimeModel.executionContexts().forEach(this._executionContextCreated,this);}
modelRemoved(runtimeModel){for(let i=this._items.length-1;i>=0;i--){if(this._items.at(i).runtimeModel===runtimeModel){this._executionContextDestroyed(this._items.at(i));}}}
createElementForItem(item){const element=createElementWithClass('div');const shadowRoot=UI.createShadowRootWithCoreStyles(element,'console/consoleContextSelector.css');const title=shadowRoot.createChild('div','title');title.createTextChild(this.titleFor(item).trimEndWithMaxLength(100));const subTitle=shadowRoot.createChild('div','subtitle');subTitle.createTextChild(this._subtitleFor(item));element.style.paddingLeft=(8+this._depthFor(item)*15)+'px';return element;}
_subtitleFor(executionContext){const target=executionContext.target();let frame;if(executionContext.frameId){const resourceTreeModel=target.model(SDK.ResourceTreeModel);frame=resourceTreeModel&&resourceTreeModel.frameForId(executionContext.frameId);}
if(executionContext.origin.startsWith('chrome-extension://')){return Common.UIString('Extension');}
if(!frame||!frame.parentFrame||frame.parentFrame.securityOrigin!==executionContext.origin){const url=Common.ParsedURL.fromString(executionContext.origin);if(url){return url.domain();}}
if(frame){const callFrame=frame.findCreationCallFrame(callFrame=>!!callFrame.url);if(callFrame){return new Common.ParsedURL(callFrame.url).domain();}
return Common.UIString('IFrame');}
return'';}
isItemSelectable(item){const callFrame=item.debuggerModel.selectedCallFrame();const callFrameContext=callFrame&&callFrame.script.executionContext();return!callFrameContext||item===callFrameContext;}
itemSelected(item){this._toolbarItem.element.classList.toggle('warning',!this._isTopContext(item)&&this._hasTopContext());const title=item?ls`JavaScript context: ${this.titleFor(item)}`:ls`JavaScript context: Not selected`;this._toolbarItem.setTitle(title);UI.context.setFlavor(SDK.ExecutionContext,item);}
_callFrameSelectedInUI(){const callFrame=UI.context.flavor(SDK.DebuggerModel.CallFrame);const callFrameContext=callFrame&&callFrame.script.executionContext();if(callFrameContext){UI.context.setFlavor(SDK.ExecutionContext,callFrameContext);}}
_callFrameSelectedInModel(event){const debuggerModel=(event.data);for(const executionContext of this._items){if(executionContext.debuggerModel===debuggerModel){this._dropDown.refreshItem(executionContext);}}}
_frameNavigated(event){const frame=(event.data);const runtimeModel=frame.resourceTreeModel().target().model(SDK.RuntimeModel);if(!runtimeModel){return;}
for(const executionContext of runtimeModel.executionContexts()){if(frame.id===executionContext.frameId){this._dropDown.refreshItem(executionContext);}}}}
self.Console=self.Console||{};Console=Console||{};Console.ConsoleContextSelector=ConsoleContextSelector;