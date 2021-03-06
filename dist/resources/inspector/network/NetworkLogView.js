export default class NetworkLogView extends UI.VBox{constructor(filterBar,progressBarContainer,networkLogLargeRowsSetting){super();this.setMinimumSize(50,64);this.registerRequiredCSS('network/networkLogView.css');this.element.id='network-container';this.element.classList.add('no-node-selected');this._networkHideDataURLSetting=Common.settings.createSetting('networkHideDataURL',false);this._networkShowIssuesOnlySetting=Common.settings.createSetting('networkShowIssuesOnly',false);this._networkResourceTypeFiltersSetting=Common.settings.createSetting('networkResourceTypeFilters',{});this._rawRowHeight=0;this._progressBarContainer=progressBarContainer;this._networkLogLargeRowsSetting=networkLogLargeRowsSetting;this._networkLogLargeRowsSetting.addChangeListener(updateRowHeight.bind(this),this);function updateRowHeight(){this._rawRowHeight=!!this._networkLogLargeRowsSetting.get()?41:21;this._rowHeight=this._computeRowHeight();}
this._rawRowHeight=0;this._rowHeight=0;updateRowHeight.call(this);this._timeCalculator=new Network.NetworkTransferTimeCalculator();this._durationCalculator=new Network.NetworkTransferDurationCalculator();this._calculator=this._timeCalculator;this._columns=new Network.NetworkLogViewColumns(this,this._timeCalculator,this._durationCalculator,networkLogLargeRowsSetting);this._columns.show(this.element);this._staleRequests=new Set();this._mainRequestLoadTime=-1;this._mainRequestDOMContentLoadedTime=-1;this._highlightedSubstringChanges=[];this._filters=[];this._timeFilter=null;this._hoveredNode=null;this._recordingHint=null;this._refreshRequestId=null;this._highlightedNode=null;this.linkifier=new Components.Linkifier();this._recording=false;this._needsRefresh=false;this._headerHeight=0;this._groupLookups=new Map();this._groupLookups.set('Frame',new Network.NetworkFrameGrouper(this));this._activeGroupLookup=null;this._textFilterUI=new UI.TextFilterUI();this._textFilterUI.addEventListener(UI.FilterUI.Events.FilterChanged,this._filterChanged,this);filterBar.addFilter(this._textFilterUI);this._dataURLFilterUI=new UI.CheckboxFilterUI('hide-data-url',Common.UIString('Hide data URLs'),true,this._networkHideDataURLSetting);this._dataURLFilterUI.addEventListener(UI.FilterUI.Events.FilterChanged,this._filterChanged.bind(this),this);this._dataURLFilterUI.element().title=ls`Hides data: and blob: URLs`;filterBar.addFilter(this._dataURLFilterUI);const filterItems=Object.values(Common.resourceCategories).map(category=>({name:category.title,label:category.shortTitle,title:category.title}));this._resourceCategoryFilterUI=new UI.NamedBitSetFilterUI(filterItems,this._networkResourceTypeFiltersSetting);UI.ARIAUtils.setAccessibleName(this._resourceCategoryFilterUI.element(),ls`Resource types to include`);this._resourceCategoryFilterUI.addEventListener(UI.FilterUI.Events.FilterChanged,this._filterChanged.bind(this),this);filterBar.addFilter(this._resourceCategoryFilterUI);this._onlyIssuesFilterUI=new UI.CheckboxFilterUI('only-show-issues',ls`Only show requests with SameSite issues`,true,this._networkShowIssuesOnlySetting);this._onlyIssuesFilterUI.addEventListener(UI.FilterUI.Events.FilterChanged,this._filterChanged.bind(this),this);this._onlyIssuesFilterUI.element().title=ls`Only show requests with SameSite issues`;filterBar.addFilter(this._onlyIssuesFilterUI);this._filterParser=new TextUtils.FilterParser(_searchKeys);this._suggestionBuilder=new UI.FilterSuggestionBuilder(_searchKeys,NetworkLogView._sortSearchValues);this._resetSuggestionBuilder();this._dataGrid=this._columns.dataGrid();this._setupDataGrid();this._columns.sortByCurrentColumn();filterBar.filterButton().addEventListener(UI.ToolbarButton.Events.Click,this._dataGrid.scheduleUpdate.bind(this._dataGrid,true));this._summaryToolbar=new UI.Toolbar('network-summary-bar',this.element);new UI.DropTarget(this.element,[UI.DropTarget.Type.File],Common.UIString('Drop HAR files here'),this._handleDrop.bind(this));Common.moduleSetting('networkColorCodeResourceTypes').addChangeListener(this._invalidateAllItems.bind(this,false),this);SDK.targetManager.observeModels(SDK.NetworkManager,this);SDK.networkLog.addEventListener(SDK.NetworkLog.Events.RequestAdded,this._onRequestUpdated,this);SDK.networkLog.addEventListener(SDK.NetworkLog.Events.RequestUpdated,this._onRequestUpdated,this);SDK.networkLog.addEventListener(SDK.NetworkLog.Events.Reset,this._reset,this);this._updateGroupByFrame();Common.moduleSetting('network.group-by-frame').addChangeListener(()=>this._updateGroupByFrame());this._filterBar=filterBar;}
_updateGroupByFrame(){const value=Common.moduleSetting('network.group-by-frame').get();this._setGrouping(value?'Frame':null);}
static _sortSearchValues(key,values){if(key===FilterType.Priority){values.sort((a,b)=>{const aPriority=(PerfUI.uiLabelToNetworkPriority(a));const bPriority=(PerfUI.uiLabelToNetworkPriority(b));return PerfUI.networkPriorityWeight(aPriority)-PerfUI.networkPriorityWeight(bPriority);});}else{values.sort();}}
static _negativeFilter(filter,request){return!filter(request);}
static _requestPathFilter(regex,request){if(!regex){return false;}
return regex.test(request.path()+'/'+request.name());}
static _subdomains(domain){const result=[domain];let indexOfPeriod=domain.indexOf('.');while(indexOfPeriod!==-1){result.push('*'+domain.substring(indexOfPeriod));indexOfPeriod=domain.indexOf('.',indexOfPeriod+1);}
return result;}
static _createRequestDomainFilter(value){function escapeForRegExp(string){return string.escapeForRegExp();}
const escapedPattern=value.split('*').map(escapeForRegExp).join('.*');return NetworkLogView._requestDomainFilter.bind(null,new RegExp('^'+escapedPattern+'$','i'));}
static _requestDomainFilter(regex,request){return regex.test(request.domain);}
static _runningRequestFilter(request){return!request.finished;}
static _fromCacheRequestFilter(request){return request.cached();}
static _interceptedByServiceWorkerFilter(request){return request.fetchedViaServiceWorker;}
static _initiatedByServiceWorkerFilter(request){return request.initiatedByServiceWorker();}
static _requestResponseHeaderFilter(value,request){return request.responseHeaderValue(value)!==undefined;}
static _requestMethodFilter(value,request){return request.requestMethod===value;}
static _requestPriorityFilter(value,request){return request.priority()===value;}
static _requestMimeTypeFilter(value,request){return request.mimeType===value;}
static _requestMixedContentFilter(value,request){if(value===MixedContentFilterValues.Displayed){return request.mixedContentType===Protocol.Security.MixedContentType.OptionallyBlockable;}else if(value===MixedContentFilterValues.Blocked){return request.mixedContentType===Protocol.Security.MixedContentType.Blockable&&request.wasBlocked();}else if(value===MixedContentFilterValues.BlockOverridden){return request.mixedContentType===Protocol.Security.MixedContentType.Blockable&&!request.wasBlocked();}else if(value===MixedContentFilterValues.All){return request.mixedContentType!==Protocol.Security.MixedContentType.None;}
return false;}
static _requestSchemeFilter(value,request){return request.scheme===value;}
static _requestSetCookieDomainFilter(value,request){const cookies=request.responseCookies;for(let i=0,l=cookies?cookies.length:0;i<l;++i){if(cookies[i].domain()===value){return true;}}
return false;}
static _requestSetCookieNameFilter(value,request){const cookies=request.responseCookies;for(let i=0,l=cookies?cookies.length:0;i<l;++i){if(cookies[i].name()===value){return true;}}
return false;}
static _requestSetCookieValueFilter(value,request){const cookies=request.responseCookies;for(let i=0,l=cookies?cookies.length:0;i<l;++i){if(cookies[i].value()===value){return true;}}
return false;}
static _requestSizeLargerThanFilter(value,request){return request.transferSize>=value;}
static _statusCodeFilter(value,request){return(''+request.statusCode)===value;}
static HTTPRequestsFilter(request){return request.parsedURL.isValid&&(request.scheme in HTTPSchemas);}
static _requestTimeFilter(windowStart,windowEnd,request){if(request.issueTime()>windowEnd){return false;}
if(request.endTime!==-1&&request.endTime<windowStart){return false;}
return true;}
static _copyRequestHeaders(request){Host.InspectorFrontendHost.copyText(request.requestHeadersText());}
static _copyResponseHeaders(request){Host.InspectorFrontendHost.copyText(request.responseHeadersText);}
static async _copyResponse(request){const contentData=await request.contentData();let content=contentData.content||'';if(!request.contentType().isTextType()){content=Common.ContentProvider.contentAsDataURL(content,request.mimeType,contentData.encoded);}else if(contentData.encoded){content=window.atob(content);}
Host.InspectorFrontendHost.copyText(content);}
_handleDrop(dataTransfer){const items=dataTransfer.items;if(!items.length){return;}
const entry=items[0].webkitGetAsEntry();if(entry.isDirectory){return;}
entry.file(this.onLoadFromFile.bind(this));}
async onLoadFromFile(file){const outputStream=new Common.StringOutputStream();const reader=new Bindings.ChunkedFileReader(file,10000000);const success=await reader.read(outputStream);if(!success){this._harLoadFailed(reader.error().message);return;}
let harRoot;try{harRoot=new HARImporter.HARRoot(JSON.parse(outputStream.data()));}catch(e){this._harLoadFailed(e);return;}
SDK.networkLog.importRequests(HARImporter.Importer.requestsFromHARLog(harRoot.log));}
_harLoadFailed(message){Common.console.error('Failed to load HAR file with following error: '+message);}
_setGrouping(groupKey){if(this._activeGroupLookup){this._activeGroupLookup.reset();}
const groupLookup=groupKey?this._groupLookups.get(groupKey)||null:null;this._activeGroupLookup=groupLookup;this._invalidateAllItems();}
_computeRowHeight(){return Math.round(this._rawRowHeight*window.devicePixelRatio)/window.devicePixelRatio;}
nodeForRequest(request){return request[_networkNodeSymbol]||null;}
headerHeight(){return this._headerHeight;}
setRecording(recording){this._recording=recording;this._updateSummaryBar();}
modelAdded(networkManager){if(networkManager.target().parentTarget()){return;}
const resourceTreeModel=networkManager.target().model(SDK.ResourceTreeModel);if(resourceTreeModel){resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.Load,this._loadEventFired,this);resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.DOMContentLoaded,this._domContentLoadedEventFired,this);}}
modelRemoved(networkManager){if(!networkManager.target().parentTarget()){const resourceTreeModel=networkManager.target().model(SDK.ResourceTreeModel);if(resourceTreeModel){resourceTreeModel.removeEventListener(SDK.ResourceTreeModel.Events.Load,this._loadEventFired,this);resourceTreeModel.removeEventListener(SDK.ResourceTreeModel.Events.DOMContentLoaded,this._domContentLoadedEventFired,this);}}}
setWindow(start,end){if(!start&&!end){this._timeFilter=null;this._timeCalculator.setWindow(null);}else{this._timeFilter=NetworkLogView._requestTimeFilter.bind(null,start,end);this._timeCalculator.setWindow(new Network.NetworkTimeBoundary(start,end));}
this._filterRequests();}
resetFocus(){this._dataGrid.element.focus();}
_resetSuggestionBuilder(){this._suggestionBuilder.clear();this._suggestionBuilder.addItem(FilterType.Is,IsFilterType.Running);this._suggestionBuilder.addItem(FilterType.Is,IsFilterType.FromCache);this._suggestionBuilder.addItem(FilterType.Is,IsFilterType.ServiceWorkerIntercepted);this._suggestionBuilder.addItem(FilterType.Is,IsFilterType.ServiceWorkerInitiated);this._suggestionBuilder.addItem(FilterType.LargerThan,'100');this._suggestionBuilder.addItem(FilterType.LargerThan,'10k');this._suggestionBuilder.addItem(FilterType.LargerThan,'1M');this._textFilterUI.setSuggestionProvider(this._suggestionBuilder.completions.bind(this._suggestionBuilder));}
_filterChanged(event){this.removeAllNodeHighlights();this._parseFilterQuery(this._textFilterUI.value());this._filterRequests();}
_showRecordingHint(){this._hideRecordingHint();this._recordingHint=this.element.createChild('div','network-status-pane fill');const hintText=this._recordingHint.createChild('div','recording-hint');let reloadShortcutNode=null;const reloadShortcutDescriptor=UI.shortcutRegistry.shortcutDescriptorsForAction('inspector_main.reload')[0];if(reloadShortcutDescriptor){reloadShortcutNode=this._recordingHint.createChild('b');reloadShortcutNode.textContent=reloadShortcutDescriptor.name;}
if(this._recording){const recordingText=hintText.createChild('span');recordingText.textContent=Common.UIString('Recording network activity\u2026');if(reloadShortcutNode){hintText.createChild('br');hintText.appendChild(UI.formatLocalized('Perform a request or hit %s to record the reload.',[reloadShortcutNode]));}}else{const recordNode=hintText.createChild('b');recordNode.textContent=UI.shortcutRegistry.shortcutTitleForAction('network.toggle-recording');if(reloadShortcutNode){hintText.appendChild(UI.formatLocalized('Record (%s) or reload (%s) to display network activity.',[recordNode,reloadShortcutNode]));}else{hintText.appendChild(UI.formatLocalized('Record (%s) to display network activity.',[recordNode]));}}
hintText.createChild('br');hintText.appendChild(UI.XLink.create('https://developers.google.com/web/tools/chrome-devtools/network/?utm_source=devtools&utm_campaign=2019Q1','Learn more'));this._setHidden(true);}
_hideRecordingHint(){this._setHidden(false);if(this._recordingHint){this._recordingHint.remove();}
this._recordingHint=null;}
_setHidden(value){this._columns.setHidden(value);UI.ARIAUtils.setHidden(this._summaryToolbar.element,value);}
elementsToRestoreScrollPositionsFor(){if(!this._dataGrid)
{return[];}
return[this._dataGrid.scrollContainer];}
columnExtensionResolved(){this._invalidateAllItems(true);}
_setupDataGrid(){this._dataGrid.setRowContextMenuCallback((contextMenu,node)=>{const request=node.request();if(request){this.handleContextMenuForRequest(contextMenu,request);}});this._dataGrid.setStickToBottom(true);this._dataGrid.setName('networkLog');this._dataGrid.setResizeMethod(DataGrid.DataGrid.ResizeMethod.Last);this._dataGrid.element.classList.add('network-log-grid');this._dataGrid.element.addEventListener('mousedown',this._dataGridMouseDown.bind(this),true);this._dataGrid.element.addEventListener('mousemove',this._dataGridMouseMove.bind(this),true);this._dataGrid.element.addEventListener('mouseleave',()=>this._setHoveredNode(null),true);this._dataGrid.element.addEventListener('keydown',event=>{if(isEnterOrSpaceKey(event)){this.dispatchEventToListeners(Events.RequestActivated,true);event.consume(true);}});this._dataGrid.element.addEventListener('focus',this.updateNodeBackground.bind(this),true);this._dataGrid.element.addEventListener('blur',this.updateNodeBackground.bind(this),true);return this._dataGrid;}
_dataGridMouseMove(event){const node=(this._dataGrid.dataGridNodeFromNode((event.target)));const highlightInitiatorChain=event.shiftKey;this._setHoveredNode(node,highlightInitiatorChain);}
hoveredNode(){return this._hoveredNode;}
_setHoveredNode(node,highlightInitiatorChain){if(this._hoveredNode){this._hoveredNode.setHovered(false,false);}
this._hoveredNode=node;if(this._hoveredNode){this._hoveredNode.setHovered(true,!!highlightInitiatorChain);}}
_dataGridMouseDown(event){if(!this._dataGrid.selectedNode&&event.button){event.consume();}}
_updateSummaryBar(){this._hideRecordingHint();let transferSize=0;let resourceSize=0;let selectedNodeNumber=0;let selectedTransferSize=0;let selectedResourceSize=0;let baseTime=-1;let maxTime=-1;let nodeCount=0;for(const request of SDK.networkLog.requests()){const node=request[_networkNodeSymbol];if(!node){continue;}
nodeCount++;const requestTransferSize=request.transferSize;transferSize+=requestTransferSize;const requestResourceSize=request.resourceSize;resourceSize+=requestResourceSize;if(!node[_isFilteredOutSymbol]){selectedNodeNumber++;selectedTransferSize+=requestTransferSize;selectedResourceSize+=requestResourceSize;}
const networkManager=SDK.NetworkManager.forRequest(request);if(networkManager&&request.url()===networkManager.target().inspectedURL()&&request.resourceType()===Common.resourceTypes.Document&&!networkManager.target().parentTarget()){baseTime=request.startTime;}
if(request.endTime>maxTime){maxTime=request.endTime;}}
if(!nodeCount){this._showRecordingHint();return;}
this._summaryToolbar.removeToolbarItems();const appendChunk=(chunk,title)=>{const toolbarText=new UI.ToolbarText(chunk);toolbarText.setTitle(title?title:chunk);this._summaryToolbar.appendToolbarItem(toolbarText);return toolbarText.element;};if(selectedNodeNumber!==nodeCount){appendChunk(ls`${selectedNodeNumber} / ${nodeCount} requests`);this._summaryToolbar.appendSeparator();appendChunk(ls`${Number.bytesToString(selectedTransferSize)} / ${Number.bytesToString(transferSize)} transferred`,ls`${selectedTransferSize} B / ${transferSize} B transferred over network`);this._summaryToolbar.appendSeparator();appendChunk(ls`${Number.bytesToString(selectedResourceSize)} / ${Number.bytesToString(resourceSize)} resources`,ls`${selectedResourceSize} B / ${resourceSize} B resources loaded by the page`);}else{appendChunk(ls`${nodeCount} requests`);this._summaryToolbar.appendSeparator();appendChunk(ls`${Number.bytesToString(transferSize)} transferred`,ls`${transferSize} B transferred over network`);this._summaryToolbar.appendSeparator();appendChunk(ls`${Number.bytesToString(resourceSize)} resources`,ls`${resourceSize} B resources loaded by the page`);}
if(baseTime!==-1&&maxTime!==-1){this._summaryToolbar.appendSeparator();appendChunk(ls`Finish: ${Number.secondsToString(maxTime - baseTime)}`);if(this._mainRequestDOMContentLoadedTime!==-1&&this._mainRequestDOMContentLoadedTime>baseTime){this._summaryToolbar.appendSeparator();const domContentLoadedText=ls`DOMContentLoaded: ${Number.secondsToString(this._mainRequestDOMContentLoadedTime - baseTime)}`;appendChunk(domContentLoadedText).style.color=NetworkLogView.getDCLEventColor();}
if(this._mainRequestLoadTime!==-1){this._summaryToolbar.appendSeparator();const loadText=ls`Load: ${Number.secondsToString(this._mainRequestLoadTime - baseTime)}`;appendChunk(loadText).style.color=NetworkLogView.getLoadEventColor();}}}
scheduleRefresh(){if(this._needsRefresh){return;}
this._needsRefresh=true;if(this.isShowing()&&!this._refreshRequestId){this._refreshRequestId=this.element.window().requestAnimationFrame(this._refresh.bind(this));}}
addFilmStripFrames(times){this._columns.addEventDividers(times,'network-frame-divider');}
selectFilmStripFrame(time){this._columns.selectFilmStripFrame(time);}
clearFilmStripFrame(){this._columns.clearFilmStripFrame();}
_refreshIfNeeded(){if(this._needsRefresh){this._refresh();}}
_invalidateAllItems(deferUpdate){this._staleRequests=new Set(SDK.networkLog.requests());if(deferUpdate){this.scheduleRefresh();}else{this._refresh();}}
timeCalculator(){return this._timeCalculator;}
calculator(){return this._calculator;}
setCalculator(x){if(!x||this._calculator===x){return;}
if(this._calculator!==x){this._calculator=x;this._columns.setCalculator(this._calculator);}
this._calculator.reset();if(this._calculator.startAtZero){this._columns.hideEventDividers();}else{this._columns.showEventDividers();}
this._invalidateAllItems();}
_loadEventFired(event){if(!this._recording){return;}
const time=(event.data.loadTime);if(time){this._mainRequestLoadTime=time;this._columns.addEventDividers([time],'network-load-divider');}}
_domContentLoadedEventFired(event){if(!this._recording){return;}
const data=(event.data);if(data){this._mainRequestDOMContentLoadedTime=data;this._columns.addEventDividers([data],'network-dcl-divider');}}
wasShown(){this._refreshIfNeeded();this._columns.wasShown();}
willHide(){this._columns.willHide();}
onResize(){this._rowHeight=this._computeRowHeight();}
flatNodesList(){return this._dataGrid.rootNode().flatChildren();}
updateNodeBackground(){if(this._dataGrid.selectedNode){this._dataGrid.selectedNode.updateBackgroundColor();}}
updateNodeSelectedClass(isSelected){if(isSelected){this.element.classList.remove('no-node-selected');}else{this.element.classList.add('no-node-selected');}}
stylesChanged(){this._columns.scheduleRefresh();}
_refresh(){this._needsRefresh=false;if(this._refreshRequestId){this.element.window().cancelAnimationFrame(this._refreshRequestId);this._refreshRequestId=null;}
this.removeAllNodeHighlights();this._timeCalculator.updateBoundariesForEventTime(this._mainRequestLoadTime);this._durationCalculator.updateBoundariesForEventTime(this._mainRequestLoadTime);this._timeCalculator.updateBoundariesForEventTime(this._mainRequestDOMContentLoadedTime);this._durationCalculator.updateBoundariesForEventTime(this._mainRequestDOMContentLoadedTime);const nodesToInsert=new Map();const nodesToRefresh=[];const staleNodes=new Set();while(this._staleRequests.size){const request=this._staleRequests.firstValue();this._staleRequests.delete(request);let node=request[_networkNodeSymbol];if(!node){node=this._createNodeForRequest(request);}
staleNodes.add(node);}
for(const node of staleNodes){const isFilteredOut=!this._applyFilter(node);if(isFilteredOut&&node===this._hoveredNode){this._setHoveredNode(null);}
if(!isFilteredOut){nodesToRefresh.push(node);}
const request=node.request();this._timeCalculator.updateBoundaries(request);this._durationCalculator.updateBoundaries(request);const newParent=this._parentNodeForInsert(node);if(node[_isFilteredOutSymbol]===isFilteredOut&&node.parent===newParent){continue;}
node[_isFilteredOutSymbol]=isFilteredOut;const removeFromParent=node.parent&&(isFilteredOut||node.parent!==newParent);if(removeFromParent){let parent=node.parent;parent.removeChild(node);while(parent&&!parent.hasChildren()&&parent.dataGrid&&parent.dataGrid.rootNode()!==parent){const grandparent=parent.parent;grandparent.removeChild(parent);parent=grandparent;}}
if(!newParent||isFilteredOut){continue;}
if(!newParent.dataGrid&&!nodesToInsert.has(newParent)){nodesToInsert.set(newParent,this._dataGrid.rootNode());nodesToRefresh.push(newParent);}
nodesToInsert.set(node,newParent);}
for(const node of nodesToInsert.keys()){nodesToInsert.get(node).appendChild(node);}
for(const node of nodesToRefresh){node.refresh();}
this._updateSummaryBar();if(nodesToInsert.size){this._columns.sortByCurrentColumn();}
this._dataGrid.updateInstantly();this._didRefreshForTest();}
_didRefreshForTest(){}
_parentNodeForInsert(node){if(!this._activeGroupLookup){return this._dataGrid.rootNode();}
const groupNode=this._activeGroupLookup.groupNodeForRequest(node.request());if(!groupNode){return this._dataGrid.rootNode();}
return groupNode;}
_reset(){this.dispatchEventToListeners(Events.RequestActivated,false);this._setHoveredNode(null);this._columns.reset();this._timeFilter=null;this._calculator.reset();this._timeCalculator.setWindow(null);this.linkifier.reset();if(this._activeGroupLookup){this._activeGroupLookup.reset();}
this._staleRequests.clear();this._resetSuggestionBuilder();this._mainRequestLoadTime=-1;this._mainRequestDOMContentLoadedTime=-1;this._dataGrid.rootNode().removeChildren();this._updateSummaryBar();this._dataGrid.setStickToBottom(true);this.scheduleRefresh();}
setTextFilterValue(filterString){this._textFilterUI.setValue(filterString);this._dataURLFilterUI.setChecked(false);this._onlyIssuesFilterUI.setChecked(false);this._resourceCategoryFilterUI.reset();}
_createNodeForRequest(request){const node=new Network.NetworkRequestNode(this,request);request[_networkNodeSymbol]=node;node[_isFilteredOutSymbol]=true;for(let redirect=request.redirectSource();redirect;redirect=redirect.redirectSource()){this._refreshRequest(redirect);}
return node;}
_onRequestUpdated(event){const request=(event.data);this._refreshRequest(request);}
_refreshRequest(request){NetworkLogView._subdomains(request.domain).forEach(this._suggestionBuilder.addItem.bind(this._suggestionBuilder,FilterType.Domain));this._suggestionBuilder.addItem(FilterType.Method,request.requestMethod);this._suggestionBuilder.addItem(FilterType.MimeType,request.mimeType);this._suggestionBuilder.addItem(FilterType.Scheme,''+request.scheme);this._suggestionBuilder.addItem(FilterType.StatusCode,''+request.statusCode);const priority=request.priority();if(priority){this._suggestionBuilder.addItem(FilterType.Priority,PerfUI.uiLabelForNetworkPriority(priority));}
if(request.mixedContentType!==Protocol.Security.MixedContentType.None){this._suggestionBuilder.addItem(FilterType.MixedContent,MixedContentFilterValues.All);}
if(request.mixedContentType===Protocol.Security.MixedContentType.OptionallyBlockable){this._suggestionBuilder.addItem(FilterType.MixedContent,MixedContentFilterValues.Displayed);}
if(request.mixedContentType===Protocol.Security.MixedContentType.Blockable){const suggestion=request.wasBlocked()?MixedContentFilterValues.Blocked:MixedContentFilterValues.BlockOverridden;this._suggestionBuilder.addItem(FilterType.MixedContent,suggestion);}
const responseHeaders=request.responseHeaders;for(let i=0,l=responseHeaders.length;i<l;++i){this._suggestionBuilder.addItem(FilterType.HasResponseHeader,responseHeaders[i].name);}
const cookies=request.responseCookies;for(let i=0,l=cookies?cookies.length:0;i<l;++i){const cookie=cookies[i];this._suggestionBuilder.addItem(FilterType.SetCookieDomain,cookie.domain());this._suggestionBuilder.addItem(FilterType.SetCookieName,cookie.name());this._suggestionBuilder.addItem(FilterType.SetCookieValue,cookie.value());}
this._staleRequests.add(request);this.scheduleRefresh();}
rowHeight(){return this._rowHeight;}
switchViewMode(gridMode){this._columns.switchViewMode(gridMode);}
handleContextMenuForRequest(contextMenu,request){contextMenu.appendApplicableItems(request);let copyMenu=contextMenu.clipboardSection().appendSubMenuItem(Common.UIString('Copy'));const footerSection=copyMenu.footerSection();if(request){copyMenu.defaultSection().appendItem(UI.copyLinkAddressLabel(),Host.InspectorFrontendHost.copyText.bind(Host.InspectorFrontendHost,request.contentURL()));if(request.requestHeadersText()){copyMenu.defaultSection().appendItem(Common.UIString('Copy request headers'),NetworkLogView._copyRequestHeaders.bind(null,request));}
if(request.responseHeadersText){copyMenu.defaultSection().appendItem(Common.UIString('Copy response headers'),NetworkLogView._copyResponseHeaders.bind(null,request));}
if(request.finished){copyMenu.defaultSection().appendItem(Common.UIString('Copy response'),NetworkLogView._copyResponse.bind(null,request));}
const disableIfBlob=request.isBlobRequest();if(Host.isWin()){footerSection.appendItem(Common.UIString('Copy as PowerShell'),this._copyPowerShellCommand.bind(this,request),disableIfBlob);footerSection.appendItem(Common.UIString('Copy as fetch'),this._copyFetchCall.bind(this,request),disableIfBlob);footerSection.appendItem(Common.UIString('Copy as cURL (cmd)'),this._copyCurlCommand.bind(this,request,'win'),disableIfBlob);footerSection.appendItem(Common.UIString('Copy as cURL (bash)'),this._copyCurlCommand.bind(this,request,'unix'),disableIfBlob);footerSection.appendItem(Common.UIString('Copy all as PowerShell'),this._copyAllPowerShellCommand.bind(this));footerSection.appendItem(Common.UIString('Copy all as fetch'),this._copyAllFetchCall.bind(this));footerSection.appendItem(Common.UIString('Copy all as cURL (cmd)'),this._copyAllCurlCommand.bind(this,'win'));footerSection.appendItem(Common.UIString('Copy all as cURL (bash)'),this._copyAllCurlCommand.bind(this,'unix'));}else{footerSection.appendItem(Common.UIString('Copy as fetch'),this._copyFetchCall.bind(this,request),disableIfBlob);footerSection.appendItem(Common.UIString('Copy as cURL'),this._copyCurlCommand.bind(this,request,'unix'),disableIfBlob);footerSection.appendItem(Common.UIString('Copy all as fetch'),this._copyAllFetchCall.bind(this));footerSection.appendItem(Common.UIString('Copy all as cURL'),this._copyAllCurlCommand.bind(this,'unix'));}}else{copyMenu=contextMenu.clipboardSection().appendSubMenuItem(Common.UIString('Copy'));}
footerSection.appendItem(Common.UIString('Copy all as HAR'),this._copyAll.bind(this));contextMenu.saveSection().appendItem(ls`Save all as HAR with content`,this.exportAll.bind(this));contextMenu.editSection().appendItem(Common.UIString('Clear browser cache'),this._clearBrowserCache.bind(this));contextMenu.editSection().appendItem(Common.UIString('Clear browser cookies'),this._clearBrowserCookies.bind(this));if(request){const maxBlockedURLLength=20;const manager=SDK.multitargetNetworkManager;let patterns=manager.blockedPatterns();function addBlockedURL(url){patterns.push({enabled:true,url:url});manager.setBlockedPatterns(patterns);manager.setBlockingEnabled(true);UI.viewManager.showView('network.blocked-urls');}
function removeBlockedURL(url){patterns=patterns.filter(pattern=>pattern.url!==url);manager.setBlockedPatterns(patterns);UI.viewManager.showView('network.blocked-urls');}
const urlWithoutScheme=request.parsedURL.urlWithoutScheme();if(urlWithoutScheme&&!patterns.find(pattern=>pattern.url===urlWithoutScheme)){contextMenu.debugSection().appendItem(Common.UIString('Block request URL'),addBlockedURL.bind(null,urlWithoutScheme));}else if(urlWithoutScheme){const croppedURL=urlWithoutScheme.trimMiddle(maxBlockedURLLength);contextMenu.debugSection().appendItem(Common.UIString('Unblock %s',croppedURL),removeBlockedURL.bind(null,urlWithoutScheme));}
const domain=request.parsedURL.domain();if(domain&&!patterns.find(pattern=>pattern.url===domain)){contextMenu.debugSection().appendItem(Common.UIString('Block request domain'),addBlockedURL.bind(null,domain));}else if(domain){const croppedDomain=domain.trimMiddle(maxBlockedURLLength);contextMenu.debugSection().appendItem(Common.UIString('Unblock %s',croppedDomain),removeBlockedURL.bind(null,domain));}
if(SDK.NetworkManager.canReplayRequest(request)){contextMenu.debugSection().appendItem(Common.UIString('Replay XHR'),SDK.NetworkManager.replayRequest.bind(null,request));}}}
_harRequests(){return SDK.networkLog.requests().filter(NetworkLogView.HTTPRequestsFilter).filter(request=>{return request.finished||(request.resourceType()===Common.resourceTypes.WebSocket&&request.responseReceivedTime);});}
async _copyAll(){const harArchive={log:await SDK.HARLog.build(this._harRequests())};Host.InspectorFrontendHost.copyText(JSON.stringify(harArchive,null,2));}
async _copyCurlCommand(request,platform){const command=await this._generateCurlCommand(request,platform);Host.InspectorFrontendHost.copyText(command);}
async _copyAllCurlCommand(platform){const commands=await this._generateAllCurlCommand(SDK.networkLog.requests(),platform);Host.InspectorFrontendHost.copyText(commands);}
async _copyFetchCall(request,platform){const command=await this._generateFetchCall(request);Host.InspectorFrontendHost.copyText(command);}
async _copyAllFetchCall(){const commands=await this._generateAllFetchCall(SDK.networkLog.requests());Host.InspectorFrontendHost.copyText(commands);}
async _copyPowerShellCommand(request){const command=await this._generatePowerShellCommand(request);Host.InspectorFrontendHost.copyText(command);}
async _copyAllPowerShellCommand(){const commands=await this._generateAllPowerShellCommand(SDK.networkLog.requests());Host.InspectorFrontendHost.copyText(commands);}
async exportAll(){const url=SDK.targetManager.mainTarget().inspectedURL();const parsedURL=Common.ParsedURL.fromString(url);const filename=parsedURL?parsedURL.host:'network-log';const stream=new Bindings.FileOutputStream();if(!await stream.open(filename+'.har')){return;}
const progressIndicator=new UI.ProgressIndicator();this._progressBarContainer.appendChild(progressIndicator.element);await Network.HARWriter.write(stream,this._harRequests(),progressIndicator);progressIndicator.done();stream.close();}
_clearBrowserCache(){if(confirm(Common.UIString('Are you sure you want to clear browser cache?'))){SDK.multitargetNetworkManager.clearBrowserCache();}}
_clearBrowserCookies(){if(confirm(Common.UIString('Are you sure you want to clear browser cookies?'))){SDK.multitargetNetworkManager.clearBrowserCookies();}}
_removeAllHighlights(){this.removeAllNodeHighlights();for(let i=0;i<this._highlightedSubstringChanges.length;++i){UI.revertDomChanges(this._highlightedSubstringChanges[i]);}
this._highlightedSubstringChanges=[];}
_applyFilter(node){const request=node.request();if(this._timeFilter&&!this._timeFilter(request)){return false;}
const categoryName=request.resourceType().category().title;if(!this._resourceCategoryFilterUI.accept(categoryName)){return false;}
if(this._dataURLFilterUI.checked()&&(request.parsedURL.isDataURL()||request.parsedURL.isBlobURL())){return false;}
if(this._onlyIssuesFilterUI.checked()&&!SDK.IssuesModel.hasIssues(request)){return false;}
if(request.statusText==='Service Worker Fallback Required'){return false;}
for(let i=0;i<this._filters.length;++i){if(!this._filters[i](request)){return false;}}
return true;}
_parseFilterQuery(query){const descriptors=this._filterParser.parse(query);this._filters=descriptors.map(descriptor=>{const key=descriptor.key;const text=descriptor.text||'';const regex=descriptor.regex;let filter;if(key){const defaultText=(key+':'+text).escapeForRegExp();filter=this._createSpecialFilter((key),text)||NetworkLogView._requestPathFilter.bind(null,new RegExp(defaultText,'i'));}else if(descriptor.regex){filter=NetworkLogView._requestPathFilter.bind(null,(regex));}else{filter=NetworkLogView._requestPathFilter.bind(null,new RegExp(text.escapeForRegExp(),'i'));}
return descriptor.negative?NetworkLogView._negativeFilter.bind(null,filter):filter;});}
_createSpecialFilter(type,value){switch(type){case FilterType.Domain:return NetworkLogView._createRequestDomainFilter(value);case FilterType.HasResponseHeader:return NetworkLogView._requestResponseHeaderFilter.bind(null,value);case FilterType.Is:if(value.toLowerCase()===IsFilterType.Running){return NetworkLogView._runningRequestFilter;}
if(value.toLowerCase()===IsFilterType.FromCache){return NetworkLogView._fromCacheRequestFilter;}
if(value.toLowerCase()===IsFilterType.ServiceWorkerIntercepted){return NetworkLogView._interceptedByServiceWorkerFilter;}
if(value.toLowerCase()===IsFilterType.ServiceWorkerInitiated){return NetworkLogView._initiatedByServiceWorkerFilter;}
break;case FilterType.LargerThan:return this._createSizeFilter(value.toLowerCase());case FilterType.Method:return NetworkLogView._requestMethodFilter.bind(null,value);case FilterType.MimeType:return NetworkLogView._requestMimeTypeFilter.bind(null,value);case FilterType.MixedContent:return NetworkLogView._requestMixedContentFilter.bind(null,(value));case FilterType.Scheme:return NetworkLogView._requestSchemeFilter.bind(null,value);case FilterType.SetCookieDomain:return NetworkLogView._requestSetCookieDomainFilter.bind(null,value);case FilterType.SetCookieName:return NetworkLogView._requestSetCookieNameFilter.bind(null,value);case FilterType.SetCookieValue:return NetworkLogView._requestSetCookieValueFilter.bind(null,value);case FilterType.Priority:return NetworkLogView._requestPriorityFilter.bind(null,PerfUI.uiLabelToNetworkPriority(value));case FilterType.StatusCode:return NetworkLogView._statusCodeFilter.bind(null,value);}
return null;}
_createSizeFilter(value){let multiplier=1;if(value.endsWith('k')){multiplier=1024;value=value.substring(0,value.length-1);}else if(value.endsWith('m')){multiplier=1024*1024;value=value.substring(0,value.length-1);}
const quantity=Number(value);if(isNaN(quantity)){return null;}
return NetworkLogView._requestSizeLargerThanFilter.bind(null,quantity*multiplier);}
_filterRequests(){this._removeAllHighlights();this._invalidateAllItems();}
_reveal(request){this.removeAllNodeHighlights();const node=request[_networkNodeSymbol];if(!node||!node.dataGrid){return null;}
node.reveal();return node;}
revealAndHighlightRequest(request){const node=this._reveal(request);if(node){this._highlightNode(node);}}
selectRequest(request){this.setTextFilterValue('');const node=this._reveal(request);if(node){node.select();}}
removeAllNodeHighlights(){if(this._highlightedNode){this._highlightedNode.element().classList.remove('highlighted-row');this._highlightedNode=null;}}
_highlightNode(node){UI.runCSSAnimationOnce(node.element(),'highlighted-row');this._highlightedNode=node;}
_filterOutBlobRequests(requests){return requests.filter(request=>!request.isBlobRequest());}
async _generateFetchCall(request){const ignoredHeaders={'method':1,'path':1,'scheme':1,'version':1,'accept-charset':1,'accept-encoding':1,'access-control-request-headers':1,'access-control-request-method':1,'connection':1,'content-length':1,'cookie':1,'cookie2':1,'date':1,'dnt':1,'expect':1,'host':1,'keep-alive':1,'origin':1,'referer':1,'te':1,'trailer':1,'transfer-encoding':1,'upgrade':1,'via':1,'user-agent':1};const credentialHeaders={'cookie':1,'authorization':1};const url=JSON.stringify(request.url());const requestHeaders=request.requestHeaders();const headerData=requestHeaders.reduce((result,header)=>{const name=header.name;if(!ignoredHeaders[name.toLowerCase()]&&!name.includes(':')){result.append(name,header.value);}
return result;},new Headers());const headers={};for(const headerArray of headerData){headers[headerArray[0]]=headerArray[1];}
const credentials=request.requestCookies||requestHeaders.some(({name})=>credentialHeaders[name.toLowerCase()])?'include':'omit';const referrerHeader=requestHeaders.find(({name})=>name.toLowerCase()==='referer');const referrer=referrerHeader?referrerHeader.value:void 0;const referrerPolicy=request.referrerPolicy()||void 0;const requestBody=await request.requestFormData();const fetchOptions={credentials,headers:Object.keys(headers).length?headers:void 0,referrer,referrerPolicy,body:requestBody,method:request.requestMethod,mode:'cors'};const options=JSON.stringify(fetchOptions);return`fetch(${url}, ${options});`;}
async _generateAllFetchCall(requests){const nonBlobRequests=this._filterOutBlobRequests(requests);const commands=await Promise.all(nonBlobRequests.map(request=>this._generateFetchCall(request)));return commands.join(' ;\n');}
async _generateCurlCommand(request,platform){let command=['curl'];const ignoredHeaders={'accept-encoding':1,'host':1,'method':1,'path':1,'scheme':1,'version':1};function escapeStringWin(str){const encapsChars=/[\r\n]/.test(str)?'^"':'"';return encapsChars+
str.replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/[^a-zA-Z0-9\s_\-:=+~'\/.',?;()*`]/g,'^$&').replace(/%(?=[a-zA-Z0-9_])/g,'%^').replace(/\r\n|[\n\r]/g,'^\n\n')+
encapsChars;}
function escapeStringPosix(str){function escapeCharacter(x){const code=x.charCodeAt(0);let hexString=code.toString(16);while(hexString.length<4){hexString='0'+hexString;}
return'\\u'+hexString;}
if(/[\u0000-\u001f\u007f-\u009f!]|\'/.test(str)){return'$\''+
str.replace(/\\/g,'\\\\').replace(/\'/g,'\\\'').replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/[\u0000-\u001f\u007f-\u009f!]/g,escapeCharacter)+'\'';}else{return'\''+str+'\'';}}
const escapeString=platform==='win'?escapeStringWin:escapeStringPosix;command.push(escapeString(request.url()).replace(/[[{}\]]/g,'\\$&'));let inferredMethod='GET';const data=[];const requestContentType=request.requestContentType();const formData=await request.requestFormData();if(requestContentType&&requestContentType.startsWith('application/x-www-form-urlencoded')&&formData){data.push('--data');data.push(escapeString(formData));ignoredHeaders['content-length']=true;inferredMethod='POST';}else if(formData){data.push('--data-binary');data.push(escapeString(formData));ignoredHeaders['content-length']=true;inferredMethod='POST';}
if(request.requestMethod!==inferredMethod){command.push('-X');command.push(request.requestMethod);}
const requestHeaders=request.requestHeaders();for(let i=0;i<requestHeaders.length;i++){const header=requestHeaders[i];const name=header.name.replace(/^:/,'');if(name.toLowerCase()in ignoredHeaders){continue;}
command.push('-H');command.push(escapeString(name+': '+header.value));}
command=command.concat(data);command.push('--compressed');if(request.securityState()===Protocol.Security.SecurityState.Insecure){command.push('--insecure');}
return command.join(' ');}
async _generateAllCurlCommand(requests,platform){const nonBlobRequests=this._filterOutBlobRequests(requests);const commands=await Promise.all(nonBlobRequests.map(request=>this._generateCurlCommand(request,platform)));if(platform==='win'){return commands.join(' &\r\n');}else{return commands.join(' ;\n');}}
async _generatePowerShellCommand(request){const command=['Invoke-WebRequest'];const ignoredHeaders=new Set(['host','connection','proxy-connection','content-length','expect','range','content-type']);function escapeString(str){return'"'+
str.replace(/[`\$"]/g,'`$&').replace(/[^\x20-\x7E]/g,char=>'$([char]'+char.charCodeAt(0)+')')+'"';}
command.push('-Uri');command.push(escapeString(request.url()));if(request.requestMethod!=='GET'){command.push('-Method');command.push(escapeString(request.requestMethod));}
const requestHeaders=request.requestHeaders();const headerNameValuePairs=[];for(const header of requestHeaders){const name=header.name.replace(/^:/,'');if(ignoredHeaders.has(name.toLowerCase())){continue;}
headerNameValuePairs.push(escapeString(name)+'='+escapeString(header.value));}
if(headerNameValuePairs.length){command.push('-Headers');command.push('@{'+headerNameValuePairs.join('; ')+'}');}
const contentTypeHeader=requestHeaders.find(({name})=>name.toLowerCase()==='content-type');if(contentTypeHeader){command.push('-ContentType');command.push(escapeString(contentTypeHeader.value));}
const formData=await request.requestFormData();if(formData){command.push('-Body');const body=escapeString(formData);if(/[^\x20-\x7E]/.test(formData)){command.push('([System.Text.Encoding]::UTF8.GetBytes('+body+'))');}else{command.push(body);}}
return command.join(' ');}
async _generateAllPowerShellCommand(requests){const nonBlobRequests=this._filterOutBlobRequests(requests);const commands=await Promise.all(nonBlobRequests.map(request=>this._generatePowerShellCommand(request)));return commands.join(';\r\n');}
static getDCLEventColor(){if(UI.themeSupport.themeName()==='dark'){return'#03A9F4';}
return'#0867CB';}
static getLoadEventColor(){return UI.themeSupport.patchColorText('#B31412',UI.ThemeSupport.ColorUsage.Foreground);}}
export const _isFilteredOutSymbol=Symbol('isFilteredOut');export const _networkNodeSymbol=Symbol('NetworkNode');export const HTTPSchemas={'http':true,'https':true,'ws':true,'wss':true};export const Events={RequestSelected:Symbol('RequestSelected'),RequestActivated:Symbol('RequestActivated')};export const FilterType={Domain:'domain',HasResponseHeader:'has-response-header',Is:'is',LargerThan:'larger-than',Method:'method',MimeType:'mime-type',MixedContent:'mixed-content',Priority:'priority',Scheme:'scheme',SetCookieDomain:'set-cookie-domain',SetCookieName:'set-cookie-name',SetCookieValue:'set-cookie-value',StatusCode:'status-code'};export const MixedContentFilterValues={All:'all',Displayed:'displayed',Blocked:'blocked',BlockOverridden:'block-overridden'};export const IsFilterType={Running:'running',FromCache:'from-cache',ServiceWorkerIntercepted:'service-worker-intercepted',ServiceWorkerInitiated:'service-worker-initiated'};export const _searchKeys=Object.keys(FilterType).map(key=>FilterType[key]);export class GroupLookupInterface{groupNodeForRequest(request){}
reset(){}}
self.Network=self.Network||{};Network=Network||{};Network.NetworkLogView=NetworkLogView;Network.NetworkLogView.Filter;Network.NetworkLogView._isFilteredOutSymbol=_isFilteredOutSymbol;Network.NetworkLogView._networkNodeSymbol=_networkNodeSymbol;Network.NetworkLogView.HTTPSchemas=HTTPSchemas;Network.NetworkLogView.Events=Events;Network.NetworkLogView.FilterType=FilterType;Network.NetworkLogView.MixedContentFilterValues=MixedContentFilterValues;Network.NetworkLogView.IsFilterType=IsFilterType;Network.NetworkLogView._searchKeys=_searchKeys;Network.GroupLookupInterface=GroupLookupInterface;