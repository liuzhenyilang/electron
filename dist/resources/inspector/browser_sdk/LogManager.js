export default class LogManager{constructor(){SDK.targetManager.observeModels(SDK.LogModel,this);}
modelAdded(logModel){const eventListeners=[];eventListeners.push(logModel.addEventListener(SDK.LogModel.Events.EntryAdded,this._logEntryAdded,this));logModel[_eventSymbol]=eventListeners;}
modelRemoved(logModel){Common.EventTarget.removeEventListeners(logModel[_eventSymbol]);}
_logEntryAdded(event){const data=(event.data);const target=data.logModel.target();const consoleMessage=new SDK.ConsoleMessage(target.model(SDK.RuntimeModel),data.entry.source,data.entry.level,data.entry.text,undefined,data.entry.url,data.entry.lineNumber,undefined,[data.entry.text,...(data.entry.args||[])],data.entry.stackTrace,data.entry.timestamp,undefined,undefined,data.entry.workerId);if(data.entry.networkRequestId){SDK.networkLog.associateConsoleMessageWithRequest(consoleMessage,data.entry.networkRequestId);}
if(consoleMessage.source===SDK.ConsoleMessage.MessageSource.Worker){const workerId=consoleMessage.workerId||'';if(SDK.targetManager.targetById(workerId)){return;}
setTimeout(()=>{if(!SDK.targetManager.targetById(workerId)){SDK.consoleModel.addMessage(consoleMessage);}},1000);}else{SDK.consoleModel.addMessage(consoleMessage);}}}
const _eventSymbol=Symbol('_events');self.BrowserSDK=self.BrowserSDK||{};BrowserSDK=BrowserSDK||{};BrowserSDK.LogManager=LogManager;new LogManager();