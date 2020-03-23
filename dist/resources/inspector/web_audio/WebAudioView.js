export class WebAudioView extends UI.ThrottledWidget{constructor(){super(true,1000);this.element.classList.add('web-audio-drawer');this.registerRequiredCSS('web_audio/webAudio.css');const toolbarContainer=this.contentElement.createChild('div','web-audio-toolbar-container vbox');this._contextSelector=new WebAudio.AudioContextSelector();const toolbar=new UI.Toolbar('web-audio-toolbar',toolbarContainer);toolbar.appendToolbarItem(UI.Toolbar.createActionButtonForId('components.collect-garbage'));toolbar.appendSeparator();toolbar.appendToolbarItem(this._contextSelector.toolbarItem());this._detailViewContainer=this.contentElement.createChild('div','vbox flex-auto');this._graphManager=new WebAudio.GraphVisualizer.GraphManager();this._landingPage=new UI.VBox();this._landingPage.contentElement.classList.add('web-audio-landing-page','fill');this._landingPage.contentElement.appendChild(UI.html`
      <div>
        <p>${ls`Open a page that uses Web Audio API to start monitoring.`}</p>
      </div>
    `);this._landingPage.show(this._detailViewContainer);this._summaryBarContainer=this.contentElement.createChild('div','web-audio-summary-container');this._contextSelector.addEventListener(WebAudio.AudioContextSelector.Events.ContextSelected,event=>{const context=(event.data);this._updateDetailView(context);this.doUpdate();});SDK.targetManager.observeModels(WebAudio.WebAudioModel,this);}
wasShown(){super.wasShown();for(const model of SDK.targetManager.models(WebAudio.WebAudioModel)){this._addEventListeners(model);}}
willHide(){for(const model of SDK.targetManager.models(WebAudio.WebAudioModel)){this._removeEventListeners(model);}}
modelAdded(webAudioModel){if(this.isShowing()){this._addEventListeners(webAudioModel);}}
modelRemoved(webAudioModel){this._removeEventListeners(webAudioModel);}
async doUpdate(){await this._pollRealtimeData();this.update();}
_addEventListeners(webAudioModel){webAudioModel.ensureEnabled();webAudioModel.addEventListener(WebAudio.WebAudioModel.Events.ContextCreated,this._contextCreated,this);webAudioModel.addEventListener(WebAudio.WebAudioModel.Events.ContextDestroyed,this._contextDestroyed,this);webAudioModel.addEventListener(WebAudio.WebAudioModel.Events.ContextChanged,this._contextChanged,this);webAudioModel.addEventListener(WebAudio.WebAudioModel.Events.ModelReset,this._reset,this);webAudioModel.addEventListener(WebAudio.WebAudioModel.Events.ModelSuspend,this._suspendModel,this);webAudioModel.addEventListener(WebAudio.WebAudioModel.Events.AudioListenerCreated,this._audioListenerCreated,this);webAudioModel.addEventListener(WebAudio.WebAudioModel.Events.AudioListenerWillBeDestroyed,this._audioListenerWillBeDestroyed,this);webAudioModel.addEventListener(WebAudio.WebAudioModel.Events.AudioNodeCreated,this._audioNodeCreated,this);webAudioModel.addEventListener(WebAudio.WebAudioModel.Events.AudioNodeWillBeDestroyed,this._audioNodeWillBeDestroyed,this);webAudioModel.addEventListener(WebAudio.WebAudioModel.Events.AudioParamCreated,this._audioParamCreated,this);webAudioModel.addEventListener(WebAudio.WebAudioModel.Events.AudioParamWillBeDestroyed,this._audioParamWillBeDestroyed,this);webAudioModel.addEventListener(WebAudio.WebAudioModel.Events.NodesConnected,this._nodesConnected,this);webAudioModel.addEventListener(WebAudio.WebAudioModel.Events.NodesDisconnected,this._nodesDisconnected,this);webAudioModel.addEventListener(WebAudio.WebAudioModel.Events.NodeParamConnected,this._nodeParamConnected,this);webAudioModel.addEventListener(WebAudio.WebAudioModel.Events.NodeParamDisconnected,this._nodeParamDisconnected,this);}
_removeEventListeners(webAudioModel){webAudioModel.removeEventListener(WebAudio.WebAudioModel.Events.ContextCreated,this._contextCreated,this);webAudioModel.removeEventListener(WebAudio.WebAudioModel.Events.ContextDestroyed,this._contextDestroyed,this);webAudioModel.removeEventListener(WebAudio.WebAudioModel.Events.ContextChanged,this._contextChanged,this);webAudioModel.removeEventListener(WebAudio.WebAudioModel.Events.ModelReset,this._reset,this);webAudioModel.removeEventListener(WebAudio.WebAudioModel.Events.ModelSuspend,this._suspendModel,this);webAudioModel.removeEventListener(WebAudio.WebAudioModel.Events.AudioListenerCreated,this._audioListenerCreated,this);webAudioModel.removeEventListener(WebAudio.WebAudioModel.Events.AudioListenerWillBeDestroyed,this._audioListenerWillBeDestroyed,this);webAudioModel.removeEventListener(WebAudio.WebAudioModel.Events.AudioNodeCreated,this._audioNodeCreated,this);webAudioModel.removeEventListener(WebAudio.WebAudioModel.Events.AudioNodeWillBeDestroyed,this._audioNodeWillBeDestroyed,this);webAudioModel.removeEventListener(WebAudio.WebAudioModel.Events.AudioParamCreated,this._audioParamCreated,this);webAudioModel.removeEventListener(WebAudio.WebAudioModel.Events.AudioParamWillBeDestroyed,this._audioParamWillBeDestroyed,this);webAudioModel.removeEventListener(WebAudio.WebAudioModel.Events.NodesConnected,this._nodesConnected,this);webAudioModel.removeEventListener(WebAudio.WebAudioModel.Events.NodesDisconnected,this._nodesDisconnected,this);webAudioModel.removeEventListener(WebAudio.WebAudioModel.Events.NodeParamConnected,this._nodeParamConnected,this);webAudioModel.removeEventListener(WebAudio.WebAudioModel.Events.NodeParamDisconnected,this._nodeParamDisconnected,this);}
_contextCreated(event){const context=(event.data);this._graphManager.createContext(context.contextId);this._contextSelector.contextCreated(event);}
_contextDestroyed(event){const contextId=(event.data);this._graphManager.destroyContext(contextId);this._contextSelector.contextDestroyed(event);}
_contextChanged(event){const context=(event.data);if(!this._graphManager.hasContext(context.contextId)){return;}
this._contextSelector.contextChanged(event);}
_reset(){if(this._landingPage.isShowing()){this._landingPage.detach();}
this._contextSelector.reset();this._detailViewContainer.removeChildren();this._landingPage.show(this._detailViewContainer);this._graphManager.clearGraphs();}
_suspendModel(){this._graphManager.clearGraphs();}
_audioListenerCreated(event){const listener=(event.data);const graph=this._graphManager.getGraph(listener.contextId);if(!graph){return;}
graph.addNode({nodeId:listener.listenerId,nodeType:'Listener',numberOfInputs:0,numberOfOutputs:0,});}
_audioListenerWillBeDestroyed(event){const{contextId,listenerId}=event.data;const graph=this._graphManager.getGraph(contextId);if(!graph){return;}
graph.removeNode(listenerId);}
_audioNodeCreated(event){const node=(event.data);const graph=this._graphManager.getGraph(node.contextId);if(!graph){return;}
graph.addNode({nodeId:node.nodeId,nodeType:node.nodeType,numberOfInputs:node.numberOfInputs,numberOfOutputs:node.numberOfOutputs,});}
_audioNodeWillBeDestroyed(event){const{contextId,nodeId}=event.data;const graph=this._graphManager.getGraph(contextId);if(!graph){return;}
graph.removeNode(nodeId);}
_audioParamCreated(event){const param=(event.data);const graph=this._graphManager.getGraph(param.contextId);if(!graph){return;}
graph.addParam({paramId:param.paramId,paramType:param.paramType,nodeId:param.nodeId,});}
_audioParamWillBeDestroyed(event){const{contextId,paramId}=event.data;const graph=this._graphManager.getGraph(contextId);if(!graph){return;}
graph.removeParam(paramId);}
_nodesConnected(event){const{contextId,sourceId,destinationId,sourceOutputIndex,destinationInputIndex}=event.data;const graph=this._graphManager.getGraph(contextId);if(!graph){return;}
graph.addNodeToNodeConnection({sourceId,destinationId,sourceOutputIndex,destinationInputIndex,});}
_nodesDisconnected(event){const{contextId,sourceId,destinationId,sourceOutputIndex,destinationInputIndex}=event.data;const graph=this._graphManager.getGraph(contextId);if(!graph){return;}
graph.removeNodeToNodeConnection({sourceId,destinationId,sourceOutputIndex,destinationInputIndex,});}
_nodeParamConnected(event){const{contextId,sourceId,destinationId,sourceOutputIndex}=event.data;const graph=this._graphManager.getGraph(contextId);if(!graph){return;}
const nodeId=graph.getNodeIdByParamId(destinationId);if(!nodeId){return;}
graph.addNodeToParamConnection({sourceId,destinationId:nodeId,sourceOutputIndex,destinationParamId:destinationId,});}
_nodeParamDisconnected(event){const{contextId,sourceId,destinationId,sourceOutputIndex}=event.data;const graph=this._graphManager.getGraph(contextId);if(!graph){return;}
const nodeId=graph.getNodeIdByParamId(destinationId);if(!nodeId){return;}
graph.removeNodeToParamConnection({sourceId,destinationId:nodeId,sourceOutputIndex,destinationParamId:destinationId,});}
_updateDetailView(context){if(this._landingPage.isShowing()){this._landingPage.detach();}
const detailBuilder=new WebAudio.ContextDetailBuilder(context);this._detailViewContainer.removeChildren();this._detailViewContainer.appendChild(detailBuilder.getFragment());}
_updateSummaryBar(contextId,contextRealtimeData){const summaryBuilder=new WebAudio.AudioContextSummaryBuilder(contextId,contextRealtimeData);this._summaryBarContainer.removeChildren();this._summaryBarContainer.appendChild(summaryBuilder.getFragment());}
_clearSummaryBar(){this._summaryBarContainer.removeChildren();}
async _pollRealtimeData(){const context=this._contextSelector.selectedContext();if(!context){this._clearSummaryBar();return;}
for(const model of SDK.targetManager.models(WebAudio.WebAudioModel)){if(context.contextType==='realtime'){if(!this._graphManager.hasContext(context.contextId)){continue;}
const realtimeData=await model.requestRealtimeData(context.contextId);if(realtimeData){this._updateSummaryBar(context.contextId,realtimeData);}}else{this._clearSummaryBar();}}}}
self.WebAudio=self.WebAudio||{};WebAudio=WebAudio||{};WebAudio.WebAudioView=WebAudioView;