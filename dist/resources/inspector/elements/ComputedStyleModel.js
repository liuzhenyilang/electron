export class ComputedStyleModel extends Common.Object{constructor(){super();this._node=UI.context.flavor(SDK.DOMNode);this._cssModel=null;this._eventListeners=[];UI.context.addFlavorChangeListener(SDK.DOMNode,this._onNodeChanged,this);}
node(){return this._node;}
cssModel(){return this._cssModel&&this._cssModel.isEnabled()?this._cssModel:null;}
_onNodeChanged(event){this._node=(event.data);this._updateModel(this._node?this._node.domModel().cssModel():null);this._onComputedStyleChanged(null);}
_updateModel(cssModel){if(this._cssModel===cssModel){return;}
Common.EventTarget.removeEventListeners(this._eventListeners);this._cssModel=cssModel;const domModel=cssModel?cssModel.domModel():null;const resourceTreeModel=cssModel?cssModel.target().model(SDK.ResourceTreeModel):null;if(cssModel&&domModel&&resourceTreeModel){this._eventListeners=[cssModel.addEventListener(SDK.CSSModel.Events.StyleSheetAdded,this._onComputedStyleChanged,this),cssModel.addEventListener(SDK.CSSModel.Events.StyleSheetRemoved,this._onComputedStyleChanged,this),cssModel.addEventListener(SDK.CSSModel.Events.StyleSheetChanged,this._onComputedStyleChanged,this),cssModel.addEventListener(SDK.CSSModel.Events.FontsUpdated,this._onComputedStyleChanged,this),cssModel.addEventListener(SDK.CSSModel.Events.MediaQueryResultChanged,this._onComputedStyleChanged,this),cssModel.addEventListener(SDK.CSSModel.Events.PseudoStateForced,this._onComputedStyleChanged,this),cssModel.addEventListener(SDK.CSSModel.Events.ModelWasEnabled,this._onComputedStyleChanged,this),domModel.addEventListener(SDK.DOMModel.Events.DOMMutated,this._onDOMModelChanged,this),resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.FrameResized,this._onFrameResized,this),];}}
_onComputedStyleChanged(event){delete this._computedStylePromise;this.dispatchEventToListeners(Events.ComputedStyleChanged,event?event.data:null);}
_onDOMModelChanged(event){const node=(event.data);if(!this._node||this._node!==node&&node.parentNode!==this._node.parentNode&&!node.isAncestor(this._node)){return;}
this._onComputedStyleChanged(null);}
_onFrameResized(event){function refreshContents(){this._onComputedStyleChanged(null);delete this._frameResizedTimer;}
if(this._frameResizedTimer){clearTimeout(this._frameResizedTimer);}
this._frameResizedTimer=setTimeout(refreshContents.bind(this),100);}
_elementNode(){return this.node()?this.node().enclosingElementOrSelf():null;}
fetchComputedStyle(){const elementNode=this._elementNode();const cssModel=this.cssModel();if(!elementNode||!cssModel){return Promise.resolve((null));}
if(!this._computedStylePromise){this._computedStylePromise=cssModel.computedStylePromise(elementNode.id).then(verifyOutdated.bind(this,elementNode));}
return this._computedStylePromise;function verifyOutdated(elementNode,style){return elementNode===this._elementNode()&&style?new ComputedStyle(elementNode,style):(null);}}}
export const Events={ComputedStyleChanged:Symbol('ComputedStyleChanged')};export class ComputedStyle{constructor(node,computedStyle){this.node=node;this.computedStyle=computedStyle;}}