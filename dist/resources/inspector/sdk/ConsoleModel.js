const _events=Symbol('SDK.ConsoleModel.events');export default class ConsoleModel extends Common.Object{constructor(){super();this._messages=[];this._messageByExceptionId=new Map();this._warnings=0;this._errors=0;this._violations=0;this._pageLoadSequenceNumber=0;SDK.targetManager.observeTargets(this);}
targetAdded(target){const resourceTreeModel=target.model(SDK.ResourceTreeModel);if(!resourceTreeModel||resourceTreeModel.cachedResourcesLoaded()){this._initTarget(target);return;}
const eventListener=resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.CachedResourcesLoaded,()=>{Common.EventTarget.removeEventListeners([eventListener]);this._initTarget(target);});}
_initTarget(target){const eventListeners=[];const cpuProfilerModel=target.model(SDK.CPUProfilerModel);if(cpuProfilerModel){eventListeners.push(cpuProfilerModel.addEventListener(SDK.CPUProfilerModel.Events.ConsoleProfileStarted,this._consoleProfileStarted.bind(this,cpuProfilerModel)));eventListeners.push(cpuProfilerModel.addEventListener(SDK.CPUProfilerModel.Events.ConsoleProfileFinished,this._consoleProfileFinished.bind(this,cpuProfilerModel)));}
const resourceTreeModel=target.model(SDK.ResourceTreeModel);if(resourceTreeModel&&!target.parentTarget()){eventListeners.push(resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.MainFrameNavigated,this._mainFrameNavigated,this));}
const runtimeModel=target.model(SDK.RuntimeModel);if(runtimeModel){eventListeners.push(runtimeModel.addEventListener(SDK.RuntimeModel.Events.ExceptionThrown,this._exceptionThrown.bind(this,runtimeModel)));eventListeners.push(runtimeModel.addEventListener(SDK.RuntimeModel.Events.ExceptionRevoked,this._exceptionRevoked.bind(this,runtimeModel)));eventListeners.push(runtimeModel.addEventListener(SDK.RuntimeModel.Events.ConsoleAPICalled,this._consoleAPICalled.bind(this,runtimeModel)));if(!target.parentTarget()){eventListeners.push(runtimeModel.debuggerModel().addEventListener(SDK.DebuggerModel.Events.GlobalObjectCleared,this._clearIfNecessary,this));}
eventListeners.push(runtimeModel.addEventListener(SDK.RuntimeModel.Events.QueryObjectRequested,this._queryObjectRequested.bind(this,runtimeModel)));}
target[_events]=eventListeners;}
targetRemoved(target){const runtimeModel=target.model(SDK.RuntimeModel);if(runtimeModel){this._messageByExceptionId.delete(runtimeModel);}
Common.EventTarget.removeEventListeners(target[_events]||[]);}
async evaluateCommandInConsole(executionContext,originatingMessage,expression,useCommandLineAPI,awaitPromise){const result=await executionContext.evaluate({expression:expression,objectGroup:'console',includeCommandLineAPI:useCommandLineAPI,silent:false,returnByValue:false,generatePreview:true,replMode:true},Common.settings.moduleSetting('consoleUserActivationEval').get(),awaitPromise);Host.userMetrics.actionTaken(Host.UserMetrics.Action.ConsoleEvaluated);if(result.error){return;}
await Common.console.showPromise();this.dispatchEventToListeners(Events.CommandEvaluated,{result:result.object,commandMessage:originatingMessage,exceptionDetails:result.exceptionDetails});}
addCommandMessage(executionContext,text){const commandMessage=new ConsoleMessage(executionContext.runtimeModel,MessageSource.JS,null,text,MessageType.Command);commandMessage.setExecutionContextId(executionContext.id);this.addMessage(commandMessage);return commandMessage;}
addMessage(msg){msg._pageLoadSequenceNumber=this._pageLoadSequenceNumber;if(msg.source===MessageSource.ConsoleAPI&&msg.type===MessageType.Clear){this._clearIfNecessary();}
this._messages.push(msg);const runtimeModel=msg.runtimeModel();if(msg._exceptionId&&runtimeModel){let modelMap=this._messageByExceptionId.get(runtimeModel);if(!modelMap){modelMap=new Map();this._messageByExceptionId.set(runtimeModel,modelMap);}
modelMap.set(msg._exceptionId,msg);}
this._incrementErrorWarningCount(msg);this.dispatchEventToListeners(Events.MessageAdded,msg);}
_exceptionThrown(runtimeModel,event){const exceptionWithTimestamp=(event.data);const consoleMessage=ConsoleMessage.fromException(runtimeModel,exceptionWithTimestamp.details,undefined,exceptionWithTimestamp.timestamp,undefined);consoleMessage.setExceptionId(exceptionWithTimestamp.details.exceptionId);this.addMessage(consoleMessage);}
_exceptionRevoked(runtimeModel,event){const exceptionId=(event.data);const modelMap=this._messageByExceptionId.get(runtimeModel);const exceptionMessage=modelMap?modelMap.get(exceptionId):null;if(!exceptionMessage){return;}
this._errors--;exceptionMessage.level=MessageLevel.Verbose;this.dispatchEventToListeners(Events.MessageUpdated,exceptionMessage);}
_consoleAPICalled(runtimeModel,event){const call=(event.data);let level=MessageLevel.Info;if(call.type===MessageType.Debug){level=MessageLevel.Verbose;}else if(call.type===MessageType.Error||call.type===MessageType.Assert){level=MessageLevel.Error;}else if(call.type===MessageType.Warning){level=MessageLevel.Warning;}else if(call.type===MessageType.Info||call.type===MessageType.Log){level=MessageLevel.Info;}
let message='';if(call.args.length&&call.args[0].unserializableValue){message=call.args[0].unserializableValue;}else if(call.args.length&&(typeof call.args[0].value!=='object'||call.args[0].value===null)){message=call.args[0].value+'';}else if(call.args.length&&call.args[0].description){message=call.args[0].description;}
const callFrame=call.stackTrace&&call.stackTrace.callFrames.length?call.stackTrace.callFrames[0]:null;const consoleMessage=new ConsoleMessage(runtimeModel,MessageSource.ConsoleAPI,level,(message),call.type,callFrame?callFrame.url:undefined,callFrame?callFrame.lineNumber:undefined,callFrame?callFrame.columnNumber:undefined,call.args,call.stackTrace,call.timestamp,call.executionContextId,undefined,undefined,call.context);this.addMessage(consoleMessage);}
_queryObjectRequested(runtimeModel,event){const consoleMessage=new ConsoleMessage(runtimeModel,MessageSource.ConsoleAPI,MessageLevel.Info,'',MessageType.QueryObjectResult,undefined,undefined,undefined,[event.data.objects]);this.addMessage(consoleMessage);}
_clearIfNecessary(){if(!Common.moduleSetting('preserveConsoleLog').get()){this._clear();}
++this._pageLoadSequenceNumber;}
_mainFrameNavigated(event){if(Common.moduleSetting('preserveConsoleLog').get()){Common.console.log(Common.UIString('Navigated to %s',event.data.url));}}
_consoleProfileStarted(cpuProfilerModel,event){const data=(event.data);this._addConsoleProfileMessage(cpuProfilerModel,MessageType.Profile,data.scriptLocation,Common.UIString('Profile \'%s\' started.',data.title));}
_consoleProfileFinished(cpuProfilerModel,event){const data=(event.data);this._addConsoleProfileMessage(cpuProfilerModel,MessageType.ProfileEnd,data.scriptLocation,Common.UIString('Profile \'%s\' finished.',data.title));}
_addConsoleProfileMessage(cpuProfilerModel,type,scriptLocation,messageText){const stackTrace=[{functionName:'',scriptId:scriptLocation.scriptId,url:scriptLocation.script()?scriptLocation.script().contentURL():'',lineNumber:scriptLocation.lineNumber,columnNumber:scriptLocation.columnNumber||0}];this.addMessage(new ConsoleMessage(cpuProfilerModel.runtimeModel(),MessageSource.ConsoleAPI,MessageLevel.Info,messageText,type,undefined,undefined,undefined,stackTrace));}
_incrementErrorWarningCount(msg){if(msg.source===MessageSource.Violation){this._violations++;return;}
switch(msg.level){case MessageLevel.Warning:this._warnings++;break;case MessageLevel.Error:this._errors++;break;}}
messages(){return this._messages;}
requestClearMessages(){for(const logModel of SDK.targetManager.models(SDK.LogModel)){logModel.requestClear();}
for(const runtimeModel of SDK.targetManager.models(SDK.RuntimeModel)){runtimeModel.discardConsoleEntries();}
this._clear();}
_clear(){this._messages=[];this._messageByExceptionId.clear();this._errors=0;this._warnings=0;this._violations=0;this.dispatchEventToListeners(Events.ConsoleCleared);}
errors(){return this._errors;}
warnings(){return this._warnings;}
violations(){return this._violations;}
async saveToTempVariable(currentExecutionContext,remoteObject){if(!remoteObject||!currentExecutionContext){failedToSave(null);return;}
const executionContext=(currentExecutionContext);const result=await executionContext.globalObject('',false);if(!!result.exceptionDetails||!result.object){failedToSave(result.object||null);return;}
const globalObject=result.object;const callFunctionResult=await globalObject.callFunction(saveVariable,[SDK.RemoteObject.toCallArgument(remoteObject)]);globalObject.release();if(callFunctionResult.wasThrown||!callFunctionResult.object||callFunctionResult.object.type!=='string'){failedToSave(callFunctionResult.object||null);}else{const text=(callFunctionResult.object.value);const message=this.addCommandMessage(executionContext,text);this.evaluateCommandInConsole(executionContext,message,text,false,false);}
if(callFunctionResult.object){callFunctionResult.object.release();}
function saveVariable(value){const prefix='temp';let index=1;while((prefix+index)in this){++index;}
const name=prefix+index;this[name]=value;return name;}
function failedToSave(result){let message=Common.UIString('Failed to save to temp variable.');if(result){message+=' '+result.description;}
Common.console.error(message);}}}
export const Events={ConsoleCleared:Symbol('ConsoleCleared'),MessageAdded:Symbol('MessageAdded'),MessageUpdated:Symbol('MessageUpdated'),CommandEvaluated:Symbol('CommandEvaluated')};export class ConsoleMessage{constructor(runtimeModel,source,level,messageText,type,url,line,column,parameters,stackTrace,timestamp,executionContextId,scriptId,workerId,context){this._runtimeModel=runtimeModel;this.source=source;this.level=(level);this.messageText=messageText;this.type=type||MessageType.Log;this.url=url||undefined;this.line=line||0;this.column=column||0;this.parameters=parameters;this.stackTrace=stackTrace;this.timestamp=timestamp||Date.now();this.executionContextId=executionContextId||0;this.scriptId=scriptId||null;this.workerId=workerId||null;if(!this.executionContextId&&this._runtimeModel){if(this.scriptId){this.executionContextId=this._runtimeModel.executionContextIdForScriptId(this.scriptId);}else if(this.stackTrace){this.executionContextId=this._runtimeModel.executionContextForStackTrace(this.stackTrace);}}
if(context){this.context=context.match(/[^#]*/)[0];}}
static fromException(runtimeModel,exceptionDetails,messageType,timestamp,forceUrl){return new ConsoleMessage(runtimeModel,MessageSource.JS,MessageLevel.Error,SDK.RuntimeModel.simpleTextFromException(exceptionDetails),messageType,forceUrl||exceptionDetails.url,exceptionDetails.lineNumber,exceptionDetails.columnNumber,exceptionDetails.exception?[SDK.RemoteObject.fromLocalObject(exceptionDetails.text),exceptionDetails.exception]:undefined,exceptionDetails.stackTrace,timestamp,exceptionDetails.executionContextId,exceptionDetails.scriptId);}
runtimeModel(){return this._runtimeModel;}
target(){return this._runtimeModel?this._runtimeModel.target():null;}
setOriginatingMessage(originatingMessage){this._originatingConsoleMessage=originatingMessage;this.executionContextId=originatingMessage.executionContextId;}
setExecutionContextId(executionContextId){this.executionContextId=executionContextId;}
setExceptionId(exceptionId){this._exceptionId=exceptionId;}
originatingMessage(){return this._originatingConsoleMessage;}
isGroupMessage(){return this.type===MessageType.StartGroup||this.type===MessageType.StartGroupCollapsed||this.type===MessageType.EndGroup;}
isGroupStartMessage(){return this.type===MessageType.StartGroup||this.type===MessageType.StartGroupCollapsed;}
isErrorOrWarning(){return(this.level===MessageLevel.Warning||this.level===MessageLevel.Error);}
isGroupable(){const isUngroupableError=this.level===MessageLevel.Error&&(this.source===MessageSource.JS||this.source===MessageSource.Network);return(this.source!==MessageSource.ConsoleAPI&&this.type!==MessageType.Command&&this.type!==MessageType.Result&&this.type!==MessageType.System&&!isUngroupableError);}
groupCategoryKey(){return[this.source,this.level,this.type,this._pageLoadSequenceNumber].join(':');}
isEqual(msg){if(!msg){return false;}
if(!this._isEqualStackTraces(this.stackTrace,msg.stackTrace)){return false;}
if(this.parameters){if(!msg.parameters||this.parameters.length!==msg.parameters.length){return false;}
for(let i=0;i<msg.parameters.length;++i){if(msg.parameters[i].type==='object'&&msg.parameters[i].subtype!=='error'){return false;}
if(this.parameters[i].type!==msg.parameters[i].type||this.parameters[i].value!==msg.parameters[i].value||this.parameters[i].description!==msg.parameters[i].description){return false;}}}
return(this.runtimeModel()===msg.runtimeModel())&&(this.source===msg.source)&&(this.type===msg.type)&&(this.level===msg.level)&&(this.line===msg.line)&&(this.url===msg.url)&&(this.messageText===msg.messageText)&&(this.request===msg.request)&&(this.executionContextId===msg.executionContextId);}
_isEqualStackTraces(stackTrace1,stackTrace2){if(!stackTrace1!==!stackTrace2){return false;}
if(!stackTrace1){return true;}
const callFrames1=stackTrace1.callFrames;const callFrames2=stackTrace2.callFrames;if(callFrames1.length!==callFrames2.length){return false;}
for(let i=0,n=callFrames1.length;i<n;++i){if(callFrames1[i].url!==callFrames2[i].url||callFrames1[i].functionName!==callFrames2[i].functionName||callFrames1[i].lineNumber!==callFrames2[i].lineNumber||callFrames1[i].columnNumber!==callFrames2[i].columnNumber){return false;}}
return this._isEqualStackTraces(stackTrace1.parent,stackTrace2.parent);}}
export const MessageSource={XML:'xml',JS:'javascript',Network:'network',ConsoleAPI:'console-api',Storage:'storage',AppCache:'appcache',Rendering:'rendering',CSS:'css',Security:'security',Deprecation:'deprecation',Worker:'worker',Violation:'violation',Intervention:'intervention',Recommendation:'recommendation',Other:'other'};export const MessageType={Log:'log',Debug:'debug',Info:'info',Error:'error',Warning:'warning',Dir:'dir',DirXML:'dirxml',Table:'table',Trace:'trace',Clear:'clear',StartGroup:'startGroup',StartGroupCollapsed:'startGroupCollapsed',EndGroup:'endGroup',Assert:'assert',Result:'result',Profile:'profile',ProfileEnd:'profileEnd',Command:'command',System:'system',QueryObjectResult:'queryObjectResult'};export const MessageLevel={Verbose:'verbose',Info:'info',Warning:'warning',Error:'error'};export const MessageSourceDisplayName=new Map([[MessageSource.XML,'xml'],[MessageSource.JS,'javascript'],[MessageSource.Network,'network'],[MessageSource.ConsoleAPI,'console-api'],[MessageSource.Storage,'storage'],[MessageSource.AppCache,'appcache'],[MessageSource.Rendering,'rendering'],[MessageSource.CSS,'css'],[MessageSource.Security,'security'],[MessageSource.Deprecation,'deprecation'],[MessageSource.Worker,'worker'],[MessageSource.Violation,'violation'],[MessageSource.Intervention,'intervention'],[MessageSource.Recommendation,'recommendation'],[MessageSource.Other,'other']]);self.SDK=self.SDK||{};SDK=SDK||{};SDK.ConsoleModel=ConsoleModel;SDK.ConsoleMessage=ConsoleMessage;SDK.ConsoleModel.Events=Events;SDK.ConsoleMessage.MessageSource=MessageSource;SDK.ConsoleMessage.MessageType=MessageType;SDK.ConsoleMessage.MessageLevel=MessageLevel;SDK.ConsoleMessage.MessageSourceDisplayName=MessageSourceDisplayName;SDK.consoleModel;