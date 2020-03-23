export class MainImpl{constructor(){MainImpl._instanceForTest=this;runOnWindowLoad(this._loaded.bind(this));}
static time(label){if(Host.isUnderTest()){return;}
console.time(label);}
static timeEnd(label){if(Host.isUnderTest()){return;}
console.timeEnd(label);}
async _loaded(){console.timeStamp('Main._loaded');await Root.Runtime.appStarted();Root.Runtime.setPlatform(Host.platform());Root.Runtime.setL10nCallback(ls);Host.InspectorFrontendHost.getPreferences(this._gotPreferences.bind(this));}
_gotPreferences(prefs){console.timeStamp('Main._gotPreferences');if(Host.isUnderTest(prefs)){self.runtime.useTestBase();}
this._createSettings(prefs);this._createAppUI();}
_createSettings(prefs){this._initializeExperiments();let storagePrefix='';if(Host.isCustomDevtoolsFrontend()){storagePrefix='__custom__';}else if(!Root.Runtime.queryParam('can_dock')&&!!Root.Runtime.queryParam('debugFrontend')&&!Host.isUnderTest()){storagePrefix='__bundled__';}
let localStorage;if(!Host.isUnderTest()&&window.localStorage){localStorage=new Common.SettingsStorage(window.localStorage,undefined,undefined,()=>window.localStorage.clear(),storagePrefix);}else{localStorage=new Common.SettingsStorage({},undefined,undefined,undefined,storagePrefix);}
const globalStorage=new Common.SettingsStorage(prefs,Host.InspectorFrontendHost.setPreference,Host.InspectorFrontendHost.removePreference,Host.InspectorFrontendHost.clearPreferences,storagePrefix);Common.settings=new Common.Settings(globalStorage,localStorage);if(!Host.isUnderTest()){new Common.VersionController().updateVersion();}}
_initializeExperiments(){Root.Runtime.experiments.register('applyCustomStylesheet','Allow custom UI themes');Root.Runtime.experiments.register('captureNodeCreationStacks','Capture node creation stacks');Root.Runtime.experiments.register('sourcesPrettyPrint','Automatically pretty print in the Sources Panel');Root.Runtime.experiments.register('backgroundServices','Background web platform feature events',true);Root.Runtime.experiments.register('backgroundServicesNotifications','Background services section for Notifications');Root.Runtime.experiments.register('backgroundServicesPaymentHandler','Background services section for Payment Handler');Root.Runtime.experiments.register('backgroundServicesPushMessaging','Background services section for Push Messaging');Root.Runtime.experiments.register('backgroundServicesPeriodicBackgroundSync','Background services section for Periodic Background Sync');Root.Runtime.experiments.register('blackboxJSFramesOnTimeline','Blackbox JavaScript frames on Timeline',true);Root.Runtime.experiments.register('cssOverview','CSS Overview');Root.Runtime.experiments.register('emptySourceMapAutoStepping','Empty sourcemap auto-stepping');Root.Runtime.experiments.register('inputEventsOnTimelineOverview','Input events on Timeline overview',true);Root.Runtime.experiments.register('liveHeapProfile','Live heap profile',true);Root.Runtime.experiments.register('mediaInspector','Media Element Inspection');Root.Runtime.experiments.register('nativeHeapProfiler','Native memory sampling heap profiler',true);Root.Runtime.experiments.register('protocolMonitor','Protocol Monitor');Root.Runtime.experiments.register('reportInternalNetErrorOnSourceMapLoadFail','Report internal net error code when a SourceMap fails to load');Root.Runtime.experiments.register('recordCoverageWithPerformanceTracing','Record coverage while performance tracing');Root.Runtime.experiments.register('samplingHeapProfilerTimeline','Sampling heap profiler timeline',true);Root.Runtime.experiments.register('sourceDiff','Source diff');Root.Runtime.experiments.register('spotlight','Spotlight',true);Root.Runtime.experiments.register('timelineEventInitiators','Timeline: event initiators');Root.Runtime.experiments.register('timelineFlowEvents','Timeline: flow events',true);Root.Runtime.experiments.register('timelineInvalidationTracking','Timeline: invalidation tracking',true);Root.Runtime.experiments.register('timelineShowAllEvents','Timeline: show all events',true);Root.Runtime.experiments.register('timelineV8RuntimeCallStats','Timeline: V8 Runtime Call Stats on Timeline',true);Root.Runtime.experiments.register('timelineWebGL','Timeline: WebGL-based flamechart');Root.Runtime.experiments.cleanUpStaleExperiments();const enabledExperiments=Root.Runtime.queryParam('enabledExperiments');if(enabledExperiments){Root.Runtime.experiments.setServerEnabledExperiments(enabledExperiments.split(';'));}
Root.Runtime.experiments.setDefaultExperiments(['backgroundServices','backgroundServicesNotifications','backgroundServicesPushMessaging','backgroundServicesPaymentHandler',]);if(Host.isUnderTest()&&Root.Runtime.queryParam('test').includes('live-line-level-heap-profile.js')){Root.Runtime.experiments.enableForTest('liveHeapProfile');}}
async _createAppUI(){MainImpl.time('Main._createAppUI');UI.viewManager=new UI.ViewManager();Persistence.isolatedFileSystemManager=new Persistence.IsolatedFileSystemManager();const themeSetting=Common.settings.createSetting('uiTheme','systemPreferred');UI.initializeUIUtils(document,themeSetting);themeSetting.addChangeListener(Components.reload.bind(Components));UI.installComponentRootStyles((document.body));this._addMainEventListeners(document);const canDock=!!Root.Runtime.queryParam('can_dock');UI.zoomManager=new UI.ZoomManager(window,Host.InspectorFrontendHost);UI.inspectorView=UI.InspectorView.instance();UI.ContextMenu.initialize();UI.ContextMenu.installHandler(document);UI.Tooltip.installHandler(document);Components.dockController=new Components.DockController(canDock);SDK.consoleModel=new SDK.ConsoleModel();SDK.multitargetNetworkManager=new SDK.MultitargetNetworkManager();SDK.domDebuggerManager=new SDK.DOMDebuggerManager();SDK.targetManager.addEventListener(SDK.TargetManager.Events.SuspendStateChanged,this._onSuspendStateChanged.bind(this));UI.shortcutsScreen=new UI.ShortcutsScreen();UI.shortcutsScreen.section(Common.UIString('Elements Panel'));UI.shortcutsScreen.section(Common.UIString('Styles Pane'));UI.shortcutsScreen.section(Common.UIString('Debugger'));UI.shortcutsScreen.section(Common.UIString('Console'));Workspace.fileManager=new Workspace.FileManager();Workspace.workspace=new Workspace.Workspace();Bindings.networkProjectManager=new Bindings.NetworkProjectManager();Bindings.resourceMapping=new Bindings.ResourceMapping(SDK.targetManager,Workspace.workspace);new Bindings.PresentationConsoleMessageManager();Bindings.cssWorkspaceBinding=new Bindings.CSSWorkspaceBinding(SDK.targetManager,Workspace.workspace);Bindings.debuggerWorkspaceBinding=new Bindings.DebuggerWorkspaceBinding(SDK.targetManager,Workspace.workspace);Bindings.breakpointManager=new Bindings.BreakpointManager(Workspace.workspace,SDK.targetManager,Bindings.debuggerWorkspaceBinding);Extensions.extensionServer=new Extensions.ExtensionServer();new Persistence.FileSystemWorkspaceBinding(Persistence.isolatedFileSystemManager,Workspace.workspace);Persistence.persistence=new Persistence.Persistence(Workspace.workspace,Bindings.breakpointManager);Persistence.networkPersistenceManager=new Persistence.NetworkPersistenceManager(Workspace.workspace);new Main.ExecutionContextSelector(SDK.targetManager,UI.context);Bindings.blackboxManager=new Bindings.BlackboxManager(Bindings.debuggerWorkspaceBinding);new PauseListener();UI.actionRegistry=new UI.ActionRegistry();UI.shortcutRegistry=new UI.ShortcutRegistry(UI.actionRegistry,document);UI.ShortcutsScreen.registerShortcuts();this._registerForwardedShortcuts();this._registerMessageSinkListener();MainImpl.timeEnd('Main._createAppUI');this._showAppUI(await self.runtime.extension(Common.AppProvider).instance());}
_showAppUI(appProvider){MainImpl.time('Main._showAppUI');const app=(appProvider).createApp();Components.dockController.initialize();app.presentUI(document);const toggleSearchNodeAction=UI.actionRegistry.action('elements.toggle-element-search');if(toggleSearchNodeAction){Host.InspectorFrontendHost.events.addEventListener(Host.InspectorFrontendHostAPI.Events.EnterInspectElementMode,toggleSearchNodeAction.execute.bind(toggleSearchNodeAction),this);}
Host.InspectorFrontendHost.events.addEventListener(Host.InspectorFrontendHostAPI.Events.RevealSourceLine,this._revealSourceLine,this);UI.inspectorView.createToolbars();Host.InspectorFrontendHost.loadCompleted();const extensions=self.runtime.extensions(Common.QueryParamHandler);for(const extension of extensions){const value=Root.Runtime.queryParam(extension.descriptor()['name']);if(value!==null){extension.instance().then(handleQueryParam.bind(null,value));}}
function handleQueryParam(value,handler){handler.handleQueryParam(value);}
setTimeout(this._initializeTarget.bind(this),0);MainImpl.timeEnd('Main._showAppUI');}
async _initializeTarget(){MainImpl.time('Main._initializeTarget');const instances=await Promise.all(self.runtime.extensions('early-initialization').map(extension=>extension.instance()));for(const instance of instances){await(instance).run();}
Host.InspectorFrontendHost.readyForTest();setTimeout(this._lateInitialization.bind(this),100);MainImpl.timeEnd('Main._initializeTarget');}
_lateInitialization(){MainImpl.time('Main._lateInitialization');this._registerShortcuts();Extensions.extensionServer.initializeExtensions();const extensions=self.runtime.extensions('late-initialization');const promises=[];for(const extension of extensions){const setting=extension.descriptor()['setting'];if(!setting||Common.settings.moduleSetting(setting).get()){promises.push(extension.instance().then(instance=>((instance)).run()));continue;}
async function changeListener(event){if(!event.data){return;}
Common.settings.moduleSetting(setting).removeChangeListener(changeListener);((await extension.instance())).run();}
Common.settings.moduleSetting(setting).addChangeListener(changeListener);}
this._lateInitDonePromise=Promise.all(promises);MainImpl.timeEnd('Main._lateInitialization');}
lateInitDonePromiseForTest(){return this._lateInitDonePromise;}
_registerForwardedShortcuts(){const forwardedActions=['main.toggle-dock','debugger.toggle-breakpoints-active','debugger.toggle-pause','commandMenu.show','console.show'];const actionKeys=UI.shortcutRegistry.keysForActions(forwardedActions).map(UI.KeyboardShortcut.keyCodeAndModifiersFromKey);Host.InspectorFrontendHost.setWhitelistedShortcuts(JSON.stringify(actionKeys));}
_registerMessageSinkListener(){Common.console.addEventListener(Common.Console.Events.MessageAdded,messageAdded);function messageAdded(event){const message=(event.data);if(message.show){Common.console.show();}}}
_revealSourceLine(event){const url=(event.data['url']);const lineNumber=(event.data['lineNumber']);const columnNumber=(event.data['columnNumber']);const uiSourceCode=Workspace.workspace.uiSourceCodeForURL(url);if(uiSourceCode){Common.Revealer.reveal(uiSourceCode.uiLocation(lineNumber,columnNumber));return;}
function listener(event){const uiSourceCode=(event.data);if(uiSourceCode.url()===url){Common.Revealer.reveal(uiSourceCode.uiLocation(lineNumber,columnNumber));Workspace.workspace.removeEventListener(Workspace.Workspace.Events.UISourceCodeAdded,listener);}}
Workspace.workspace.addEventListener(Workspace.Workspace.Events.UISourceCodeAdded,listener);}
_registerShortcuts(){const shortcut=UI.KeyboardShortcut;const section=UI.shortcutsScreen.section(Common.UIString('All Panels'));let keys=[shortcut.makeDescriptor('[',shortcut.Modifiers.CtrlOrMeta),shortcut.makeDescriptor(']',shortcut.Modifiers.CtrlOrMeta)];section.addRelatedKeys(keys,Common.UIString('Go to the panel to the left/right'));const toggleConsoleLabel=Common.UIString('Show console');section.addKey(shortcut.makeDescriptor(shortcut.Keys.Tilde,shortcut.Modifiers.Ctrl),toggleConsoleLabel);section.addKey(shortcut.makeDescriptor(shortcut.Keys.Esc),Common.UIString('Toggle drawer'));if(Components.dockController.canDock()){section.addKey(shortcut.makeDescriptor('M',shortcut.Modifiers.CtrlOrMeta|shortcut.Modifiers.Shift),Common.UIString('Toggle device mode'));section.addKey(shortcut.makeDescriptor('D',shortcut.Modifiers.CtrlOrMeta|shortcut.Modifiers.Shift),Common.UIString('Toggle dock side'));}
section.addKey(shortcut.makeDescriptor('f',shortcut.Modifiers.CtrlOrMeta),Common.UIString('Search'));const advancedSearchShortcutModifier=Host.isMac()?UI.KeyboardShortcut.Modifiers.Meta|UI.KeyboardShortcut.Modifiers.Alt:UI.KeyboardShortcut.Modifiers.Ctrl|UI.KeyboardShortcut.Modifiers.Shift;const advancedSearchShortcut=shortcut.makeDescriptor('f',advancedSearchShortcutModifier);section.addKey(advancedSearchShortcut,Common.UIString('Search across all sources'));const inspectElementModeShortcuts=UI.shortcutRegistry.shortcutDescriptorsForAction('elements.toggle-element-search');if(inspectElementModeShortcuts.length){section.addKey(inspectElementModeShortcuts[0],Common.UIString('Select node to inspect'));}
const openResourceShortcut=UI.KeyboardShortcut.makeDescriptor('p',UI.KeyboardShortcut.Modifiers.CtrlOrMeta);section.addKey(openResourceShortcut,Common.UIString('Go to source'));if(Host.isMac()){keys=[shortcut.makeDescriptor('g',shortcut.Modifiers.Meta),shortcut.makeDescriptor('g',shortcut.Modifiers.Meta|shortcut.Modifiers.Shift)];section.addRelatedKeys(keys,Common.UIString('Find next/previous'));}}
_postDocumentKeyDown(event){if(!event.handled){UI.shortcutRegistry.handleShortcut(event);}}
_redispatchClipboardEvent(event){const eventCopy=new CustomEvent('clipboard-'+event.type,{bubbles:true});eventCopy['original']=event;const document=event.target&&event.target.ownerDocument;const target=document?document.deepActiveElement():null;if(target){target.dispatchEvent(eventCopy);}
if(eventCopy.handled){event.preventDefault();}}
_contextMenuEventFired(event){if(event.handled||event.target.classList.contains('popup-glasspane')){event.preventDefault();}}
_addMainEventListeners(document){document.addEventListener('keydown',this._postDocumentKeyDown.bind(this),false);document.addEventListener('beforecopy',this._redispatchClipboardEvent.bind(this),true);document.addEventListener('copy',this._redispatchClipboardEvent.bind(this),false);document.addEventListener('cut',this._redispatchClipboardEvent.bind(this),false);document.addEventListener('paste',this._redispatchClipboardEvent.bind(this),false);document.addEventListener('contextmenu',this._contextMenuEventFired.bind(this),true);}
_onSuspendStateChanged(){const suspended=SDK.targetManager.allTargetsSuspended();UI.inspectorView.onSuspendStateChanged(suspended);}}
export class ZoomActionDelegate{handleAction(context,actionId){if(Host.InspectorFrontendHost.isHostedMode()){return false;}
switch(actionId){case'main.zoom-in':Host.InspectorFrontendHost.zoomIn();return true;case'main.zoom-out':Host.InspectorFrontendHost.zoomOut();return true;case'main.zoom-reset':Host.InspectorFrontendHost.resetZoom();return true;}
return false;}}
export class SearchActionDelegate{handleAction(context,actionId){let searchableView=UI.SearchableView.fromElement(document.deepActiveElement());if(!searchableView){const currentPanel=UI.inspectorView.currentPanelDeprecated();if(currentPanel){searchableView=currentPanel.searchableView();}
if(!searchableView){return false;}}
switch(actionId){case'main.search-in-panel.find':return searchableView.handleFindShortcut();case'main.search-in-panel.cancel':return searchableView.handleCancelSearchShortcut();case'main.search-in-panel.find-next':return searchableView.handleFindNextShortcut();case'main.search-in-panel.find-previous':return searchableView.handleFindPreviousShortcut();}
return false;}}
export class MainMenuItem{constructor(){this._item=new UI.ToolbarMenuButton(this._handleContextMenu.bind(this),true);this._item.setTitle(Common.UIString('Customize and control DevTools'));}
item(){return this._item;}
_handleContextMenu(contextMenu){if(Components.dockController.canDock()){const dockItemElement=createElementWithClass('div','flex-centered flex-auto');dockItemElement.tabIndex=-1;const titleElement=dockItemElement.createChild('span','flex-auto');titleElement.textContent=Common.UIString('Dock side');const toggleDockSideShorcuts=UI.shortcutRegistry.shortcutDescriptorsForAction('main.toggle-dock');titleElement.title=Common.UIString('Placement of DevTools relative to the page. (%s to restore last position)',toggleDockSideShorcuts[0].name);dockItemElement.appendChild(titleElement);const dockItemToolbar=new UI.Toolbar('',dockItemElement);if(Host.isMac()&&!UI.themeSupport.hasTheme()){dockItemToolbar.makeBlueOnHover();}
const undock=new UI.ToolbarToggle(Common.UIString('Undock into separate window'),'largeicon-undock');const bottom=new UI.ToolbarToggle(Common.UIString('Dock to bottom'),'largeicon-dock-to-bottom');const right=new UI.ToolbarToggle(Common.UIString('Dock to right'),'largeicon-dock-to-right');const left=new UI.ToolbarToggle(Common.UIString('Dock to left'),'largeicon-dock-to-left');undock.addEventListener(UI.ToolbarButton.Events.MouseDown,event=>event.data.consume());bottom.addEventListener(UI.ToolbarButton.Events.MouseDown,event=>event.data.consume());right.addEventListener(UI.ToolbarButton.Events.MouseDown,event=>event.data.consume());left.addEventListener(UI.ToolbarButton.Events.MouseDown,event=>event.data.consume());undock.addEventListener(UI.ToolbarButton.Events.Click,setDockSide.bind(null,Components.DockController.State.Undocked));bottom.addEventListener(UI.ToolbarButton.Events.Click,setDockSide.bind(null,Components.DockController.State.DockedToBottom));right.addEventListener(UI.ToolbarButton.Events.Click,setDockSide.bind(null,Components.DockController.State.DockedToRight));left.addEventListener(UI.ToolbarButton.Events.Click,setDockSide.bind(null,Components.DockController.State.DockedToLeft));undock.setToggled(Components.dockController.dockSide()===Components.DockController.State.Undocked);bottom.setToggled(Components.dockController.dockSide()===Components.DockController.State.DockedToBottom);right.setToggled(Components.dockController.dockSide()===Components.DockController.State.DockedToRight);left.setToggled(Components.dockController.dockSide()===Components.DockController.State.DockedToLeft);dockItemToolbar.appendToolbarItem(undock);dockItemToolbar.appendToolbarItem(left);dockItemToolbar.appendToolbarItem(bottom);dockItemToolbar.appendToolbarItem(right);dockItemElement.addEventListener('keydown',event=>{let dir=0;if(event.key==='ArrowLeft'){dir=-1;}else if(event.key==='ArrowRight'){dir=1;}else{return;}
const buttons=[undock,left,bottom,right];let index=buttons.findIndex(button=>button.element.hasFocus());index=Number.constrain(index+dir,0,buttons.length-1);buttons[index].element.focus();event.consume(true);});contextMenu.headerSection().appendCustomItem(dockItemElement);}
const button=this._item.element;function setDockSide(side){const hadKeyboardFocus=document.deepActiveElement().hasAttribute('data-keyboard-focus');Components.dockController.once(Components.DockController.Events.AfterDockSideChanged).then(()=>{button.focus();if(hadKeyboardFocus){UI.markAsFocusedByKeyboard(button);}});Components.dockController.setDockSide(side);contextMenu.discard();}
if(Components.dockController.dockSide()===Components.DockController.State.Undocked&&SDK.targetManager.mainTarget()&&SDK.targetManager.mainTarget().type()===SDK.Target.Type.Frame){contextMenu.defaultSection().appendAction('inspector_main.focus-debuggee',Common.UIString('Focus debuggee'));}
contextMenu.defaultSection().appendAction('main.toggle-drawer',UI.inspectorView.drawerVisible()?Common.UIString('Hide console drawer'):Common.UIString('Show console drawer'));contextMenu.appendItemsAtLocation('mainMenu');const moreTools=contextMenu.defaultSection().appendSubMenuItem(Common.UIString('More tools'));const extensions=self.runtime.extensions('view',undefined,true);for(const extension of extensions){const descriptor=extension.descriptor();if(descriptor['persistence']!=='closeable'){continue;}
if(descriptor['location']!=='drawer-view'&&descriptor['location']!=='panel'){continue;}
moreTools.defaultSection().appendItem(extension.title(),UI.viewManager.showView.bind(UI.viewManager,descriptor['id']));}
const helpSubMenu=contextMenu.footerSection().appendSubMenuItem(Common.UIString('Help'));helpSubMenu.appendItemsAtLocation('mainMenuHelp');}}
export class PauseListener{constructor(){SDK.targetManager.addModelListener(SDK.DebuggerModel,SDK.DebuggerModel.Events.DebuggerPaused,this._debuggerPaused,this);}
_debuggerPaused(event){SDK.targetManager.removeModelListener(SDK.DebuggerModel,SDK.DebuggerModel.Events.DebuggerPaused,this._debuggerPaused,this);const debuggerModel=(event.data);const debuggerPausedDetails=debuggerModel.debuggerPausedDetails();UI.context.setFlavor(SDK.Target,debuggerModel.target());Common.Revealer.reveal(debuggerPausedDetails);}}
export function sendOverProtocol(method,params){return new Promise((resolve,reject)=>{Protocol.test.sendRawMessage(method,params,(err,...results)=>{if(err){return reject(err);}
return resolve(results);});});}
export class ReloadActionDelegate{handleAction(context,actionId){switch(actionId){case'main.debug-reload':Components.reload();return true;}
return false;}}
new MainImpl();self.Main=self.Main||{};Main=Main||{};Main.Main=MainImpl;Main.Main.ZoomActionDelegate=ZoomActionDelegate;Main.Main.SearchActionDelegate=SearchActionDelegate;Main.Main.MainMenuItem=MainMenuItem;Main.Main.PauseListener=PauseListener;Main.ReloadActionDelegate=ReloadActionDelegate;Main.sendOverProtocol=sendOverProtocol;