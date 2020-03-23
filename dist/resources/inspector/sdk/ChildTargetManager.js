let _lastAnonymousTargetId=0;export default class ChildTargetManager extends SDK.SDKModel{constructor(parentTarget){super(parentTarget);this._targetManager=parentTarget.targetManager();this._parentTarget=parentTarget;this._targetAgent=parentTarget.targetAgent();this._targetInfos=new Map();this._childTargets=new Map();this._parallelConnections=new Map();this._parentTargetId=null;parentTarget.registerTargetDispatcher(this);this._targetAgent.invoke_setAutoAttach({autoAttach:true,waitForDebuggerOnStart:true,flatten:true});if(!parentTarget.parentTarget()&&!Host.isUnderTest()){this._targetAgent.setDiscoverTargets(true);this._targetAgent.setRemoteLocations([{host:'localhost',port:9229}]);}}
static install(attachCallback){SDK.ChildTargetManager._attachCallback=attachCallback;SDK.SDKModel.register(SDK.ChildTargetManager,SDK.Target.Capability.Target,true);}
suspendModel(){return this._targetAgent.invoke_setAutoAttach({autoAttach:true,waitForDebuggerOnStart:false,flatten:true});}
resumeModel(){return this._targetAgent.invoke_setAutoAttach({autoAttach:true,waitForDebuggerOnStart:true,flatten:true});}
dispose(){for(const sessionId of this._childTargets.keys()){this.detachedFromTarget(sessionId,undefined);}}
targetCreated(targetInfo){this._targetInfos.set(targetInfo.targetId,targetInfo);this._fireAvailableTargetsChanged();}
targetInfoChanged(targetInfo){this._targetInfos.set(targetInfo.targetId,targetInfo);this._fireAvailableTargetsChanged();}
targetDestroyed(targetId){this._targetInfos.delete(targetId);this._fireAvailableTargetsChanged();}
targetCrashed(targetId,status,errorCode){}
_fireAvailableTargetsChanged(){SDK.targetManager.dispatchEventToListeners(SDK.TargetManager.Events.AvailableTargetsChanged,this._targetInfos.valuesArray());}
async _getParentTargetId(){if(!this._parentTargetId){this._parentTargetId=(await this._parentTarget.targetAgent().getTargetInfo()).targetId;}
return this._parentTargetId;}
attachedToTarget(sessionId,targetInfo,waitingForDebugger){if(this._parentTargetId===targetInfo.targetId){return;}
let targetName='';if(targetInfo.type==='worker'&&targetInfo.title&&targetInfo.title!==targetInfo.url){targetName=targetInfo.title;}else if(targetInfo.type!=='iframe'){const parsedURL=Common.ParsedURL.fromString(targetInfo.url);targetName=parsedURL?parsedURL.lastPathComponentWithFragment():'#'+(++_lastAnonymousTargetId);}
let type=SDK.Target.Type.Browser;if(targetInfo.type==='iframe'){type=SDK.Target.Type.Frame;}
else if(targetInfo.type==='page'){type=SDK.Target.Type.Frame;}else if(targetInfo.type==='worker'){type=SDK.Target.Type.Worker;}else if(targetInfo.type==='service_worker'){type=SDK.Target.Type.ServiceWorker;}
const target=this._targetManager.createTarget(targetInfo.targetId,targetName,type,this._parentTarget,sessionId);this._childTargets.set(sessionId,target);if(SDK.ChildTargetManager._attachCallback){SDK.ChildTargetManager._attachCallback({target,waitingForDebugger}).then(()=>{target.runtimeAgent().runIfWaitingForDebugger();});}else{target.runtimeAgent().runIfWaitingForDebugger();}}
detachedFromTarget(sessionId,childTargetId){if(this._parallelConnections.has(sessionId)){this._parallelConnections.delete(sessionId);}else{this._childTargets.get(sessionId).dispose('target terminated');this._childTargets.delete(sessionId);}}
receivedMessageFromTarget(sessionId,message,childTargetId){}
async createParallelConnection(onMessage){const targetId=await this._getParentTargetId();const{connection,sessionId}=await this._createParallelConnectionAndSessionForTarget(this._parentTarget,targetId);connection.setOnMessage(onMessage);this._parallelConnections.set(sessionId,connection);return connection;}
async _createParallelConnectionAndSessionForTarget(target,targetId){const targetAgent=target.targetAgent();const targetRouter=target.router();const sessionId=(await targetAgent.attachToTarget(targetId,true));const connection=new SDK.ParallelConnection(targetRouter.connection(),sessionId);targetRouter.registerSession(target,sessionId,connection);connection.setOnDisconnect(()=>{targetAgent.detachFromTarget(sessionId);targetRouter.unregisterSession(sessionId);});return{connection,sessionId};}}
self.SDK=self.SDK||{};SDK=SDK||{};SDK.ChildTargetManager=ChildTargetManager;SDK.ChildTargetManager._attachCallback;