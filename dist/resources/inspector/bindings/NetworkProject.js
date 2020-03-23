export class NetworkProjectManager extends Common.Object{}
export const Events={FrameAttributionAdded:Symbol('FrameAttributionAdded'),FrameAttributionRemoved:Symbol('FrameAttributionRemoved')};export default class NetworkProject{static _resolveFrame(uiSourceCode,frameId){const target=NetworkProject.targetForUISourceCode(uiSourceCode);const resourceTreeModel=target&&target.model(SDK.ResourceTreeModel);return resourceTreeModel?resourceTreeModel.frameForId(frameId):null;}
static setInitialFrameAttribution(uiSourceCode,frameId){const frame=NetworkProject._resolveFrame(uiSourceCode,frameId);if(!frame){return;}
const attribution=new Map();attribution.set(frameId,{frame:frame,count:1});uiSourceCode[_frameAttributionSymbol]=attribution;}
static cloneInitialFrameAttribution(fromUISourceCode,toUISourceCode){const fromAttribution=fromUISourceCode[_frameAttributionSymbol];if(!fromAttribution){return;}
const toAttribution=new Map();toUISourceCode[_frameAttributionSymbol]=toAttribution;for(const frameId of fromAttribution.keys()){const value=fromAttribution.get(frameId);toAttribution.set(frameId,{frame:value.frame,count:value.count});}}
static addFrameAttribution(uiSourceCode,frameId){const frame=NetworkProject._resolveFrame(uiSourceCode,frameId);if(!frame){return;}
const frameAttribution=uiSourceCode[_frameAttributionSymbol];const attributionInfo=frameAttribution.get(frameId)||{frame:frame,count:0};attributionInfo.count+=1;frameAttribution.set(frameId,attributionInfo);if(attributionInfo.count!==1){return;}
const data={uiSourceCode:uiSourceCode,frame:frame};Bindings.networkProjectManager.dispatchEventToListeners(Events.FrameAttributionAdded,data);}
static removeFrameAttribution(uiSourceCode,frameId){const frameAttribution=uiSourceCode[_frameAttributionSymbol];if(!frameAttribution){return;}
const attributionInfo=frameAttribution.get(frameId);console.assert(attributionInfo,'Failed to remove frame attribution for url: '+uiSourceCode.url());attributionInfo.count-=1;if(attributionInfo.count>0){return;}
frameAttribution.delete(frameId);const data={uiSourceCode:uiSourceCode,frame:attributionInfo.frame};Bindings.networkProjectManager.dispatchEventToListeners(Events.FrameAttributionRemoved,data);}
static targetForUISourceCode(uiSourceCode){return uiSourceCode.project()[_targetSymbol]||null;}
static setTargetForProject(project,target){project[_targetSymbol]=target;}
static framesForUISourceCode(uiSourceCode){const target=NetworkProject.targetForUISourceCode(uiSourceCode);const resourceTreeModel=target&&target.model(SDK.ResourceTreeModel);const attribution=uiSourceCode[_frameAttributionSymbol];if(!resourceTreeModel||!attribution){return[];}
const frames=Array.from(attribution.keys()).map(frameId=>resourceTreeModel.frameForId(frameId));return frames.filter(frame=>!!frame);}}
const _targetSymbol=Symbol('target');const _frameAttributionSymbol=Symbol('_frameAttributionSymbol');self.Bindings=self.Bindings||{};Bindings=Bindings||{};Bindings.NetworkProjectManager=NetworkProjectManager;Bindings.NetworkProjectManager.Events=Events;Bindings.NetworkProject=NetworkProject;