export default class UserMetrics{panelShown(panelName){const code=_PanelCodes[panelName]||0;const size=Object.keys(_PanelCodes).length+1;Host.InspectorFrontendHost.recordEnumeratedHistogram('DevTools.PanelShown',code,size);this._panelChangedSinceLaunch=true;}
drawerShown(drawerId){this.panelShown('drawer-'+drawerId);}
actionTaken(action){const size=Object.keys(Action).length+1;Host.InspectorFrontendHost.recordEnumeratedHistogram('DevTools.ActionTaken',action,size);}
panelLoaded(panelName,histogramName){if(this._firedLaunchHistogram||panelName!==this._launchPanelName){return;}
this._firedLaunchHistogram=true;requestAnimationFrame(()=>{setTimeout(()=>{performance.mark(histogramName);if(this._panelChangedSinceLaunch){return;}
Host.InspectorFrontendHost.recordPerformanceHistogram(histogramName,performance.now());},0);});}
setLaunchPanel(panelName){this._launchPanelName=panelName;}}
export const Action={WindowDocked:1,WindowUndocked:2,ScriptsBreakpointSet:3,TimelineStarted:4,ProfilesCPUProfileTaken:5,ProfilesHeapProfileTaken:6,'LegacyAuditsStarted-deprecated':7,ConsoleEvaluated:8,FileSavedInWorkspace:9,DeviceModeEnabled:10,AnimationsPlaybackRateChanged:11,RevisionApplied:12,FileSystemDirectoryContentReceived:13,StyleRuleEdited:14,CommandEvaluatedInConsolePanel:15,DOMPropertiesExpanded:16,ResizedViewInResponsiveMode:17,TimelinePageReloadStarted:18,ConnectToNodeJSFromFrontend:19,ConnectToNodeJSDirectly:20,CpuThrottlingEnabled:21,CpuProfileNodeFocused:22,CpuProfileNodeExcluded:23,SelectFileFromFilePicker:24,SelectCommandFromCommandMenu:25,ChangeInspectedNodeInElementsPanel:26,StyleRuleCopied:27,CoverageStarted:28,AuditsStarted:29,AuditsFinished:30,ShowedThirdPartyBadges:31,AuditsViewTrace:32,FilmStripStartedRecording:33,CoverageReportFiltered:34,CoverageStartedPerBlock:35,};export const _PanelCodes={elements:1,resources:2,network:3,sources:4,timeline:5,heap_profiler:6,'legacy-audits-deprecated':7,console:8,layers:9,'drawer-console-view':10,'drawer-animations':11,'drawer-network.config':12,'drawer-rendering':13,'drawer-sensors':14,'drawer-sources.search':15,security:16,js_profiler:17,audits:18,'drawer-coverage':19,'drawer-protocol-monitor':20,'drawer-remote-devices':21,'drawer-web-audio':22,'drawer-changes.changes':23,'drawer-performance.monitor':24,'drawer-release-note':25,'drawer-live_heap_profile':26,'drawer-sources.quick':27,'drawer-network.blocked-urls':28,};self.Host=self.Host||{};Host=Host||{};Host.UserMetrics=UserMetrics;Host.UserMetrics.Action=Action;Host.UserMetrics._PanelCodes=_PanelCodes;Host.userMetrics=new UserMetrics();