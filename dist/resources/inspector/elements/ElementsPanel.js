import{ComputedStyleWidget}from'./ComputedStyleWidget.js';import{ElementsBreadcrumbs,Events}from'./ElementsBreadcrumbs.js';import{ElementsTreeElement,HrefSymbol}from'./ElementsTreeElement.js';import{ElementsTreeElementHighlighter}from'./ElementsTreeElementHighlighter.js';import{ElementsTreeOutline}from'./ElementsTreeOutline.js';import{MarkerDecorator}from'./MarkerDecorator.js';import{MetricsSidebarPane}from'./MetricsSidebarPane.js';import{StylesSidebarPane}from'./StylesSidebarPane.js';export class ElementsPanel extends UI.Panel{constructor(){super('elements');this.registerRequiredCSS('elements/elementsPanel.css');this._splitWidget=new UI.SplitWidget(true,true,'elementsPanelSplitViewState',325,325);this._splitWidget.addEventListener(UI.SplitWidget.Events.SidebarSizeChanged,this._updateTreeOutlineVisibleWidth.bind(this));this._splitWidget.show(this.element);this._searchableView=new UI.SearchableView(this);this._searchableView.setMinimumSize(25,28);this._searchableView.setPlaceholder(Common.UIString('Find by string, selector, or XPath'));const stackElement=this._searchableView.element;this._contentElement=createElement('div');const crumbsContainer=createElement('div');stackElement.appendChild(this._contentElement);stackElement.appendChild(crumbsContainer);this._splitWidget.setMainWidget(this._searchableView);this._splitMode=null;this._contentElement.id='elements-content';if(Common.moduleSetting('domWordWrap').get()){this._contentElement.classList.add('elements-wrap');}
Common.moduleSetting('domWordWrap').addChangeListener(this._domWordWrapSettingChanged.bind(this));crumbsContainer.id='elements-crumbs';this._breadcrumbs=new ElementsBreadcrumbs();this._breadcrumbs.show(crumbsContainer);this._breadcrumbs.addEventListener(Events.NodeSelected,this._crumbNodeSelected,this);this._stylesWidget=new StylesSidebarPane();this._computedStyleWidget=new ComputedStyleWidget();this._metricsWidget=new MetricsSidebarPane();Common.moduleSetting('sidebarPosition').addChangeListener(this._updateSidebarPosition.bind(this));this._updateSidebarPosition();this._treeOutlines=[];this._treeOutlineHeaders=new Map();SDK.targetManager.observeModels(SDK.DOMModel,this);SDK.targetManager.addEventListener(SDK.TargetManager.Events.NameChanged,event=>this._targetNameChanged((event.data)));Common.moduleSetting('showUAShadowDOM').addChangeListener(this._showUAShadowDOMChanged.bind(this));SDK.targetManager.addModelListener(SDK.DOMModel,SDK.DOMModel.Events.DocumentUpdated,this._documentUpdatedEvent,this);Extensions.extensionServer.addEventListener(Extensions.ExtensionServer.Events.SidebarPaneAdded,this._extensionSidebarPaneAdded,this);this._searchResults;}
static instance(){return(self.runtime.sharedInstance(ElementsPanel));}
_revealProperty(cssProperty){return this.sidebarPaneView.showView(this._stylesViewToReveal).then(()=>{this._stylesWidget.revealProperty((cssProperty));});}
resolveLocation(locationName){return this.sidebarPaneView;}
showToolbarPane(widget,toggle){this._stylesWidget.showToolbarPane(widget,toggle);}
modelAdded(domModel){const parentModel=domModel.parentModel();let treeOutline=parentModel?ElementsTreeOutline.forDOMModel(parentModel):null;if(!treeOutline){treeOutline=new ElementsTreeOutline(true,true);treeOutline.setWordWrap(Common.moduleSetting('domWordWrap').get());treeOutline.addEventListener(ElementsTreeOutline.Events.SelectedNodeChanged,this._selectedNodeChanged,this);treeOutline.addEventListener(ElementsTreeOutline.Events.ElementsTreeUpdated,this._updateBreadcrumbIfNeeded,this);new ElementsTreeElementHighlighter(treeOutline);this._treeOutlines.push(treeOutline);if(domModel.target().parentTarget()){this._treeOutlineHeaders.set(treeOutline,createElementWithClass('div','elements-tree-header'));this._targetNameChanged(domModel.target());}}
treeOutline.wireToDOMModel(domModel);if(this.isShowing()){this.wasShown();}}
modelRemoved(domModel){const treeOutline=ElementsTreeOutline.forDOMModel(domModel);treeOutline.unwireFromDOMModel(domModel);if(domModel.parentModel()){return;}
this._treeOutlines.remove(treeOutline);const header=this._treeOutlineHeaders.get(treeOutline);if(header){header.remove();}
this._treeOutlineHeaders.delete(treeOutline);treeOutline.element.remove();}
_targetNameChanged(target){const domModel=target.model(SDK.DOMModel);if(!domModel){return;}
const treeOutline=ElementsTreeOutline.forDOMModel(domModel);if(!treeOutline){return;}
const header=this._treeOutlineHeaders.get(treeOutline);if(!header){return;}
header.removeChildren();header.createChild('div','elements-tree-header-frame').textContent=Common.UIString('Frame');header.appendChild(Components.Linkifier.linkifyURL(target.inspectedURL(),{text:target.name()}));}
_updateTreeOutlineVisibleWidth(){if(!this._treeOutlines.length){return;}
let width=this._splitWidget.element.offsetWidth;if(this._splitWidget.isVertical()){width-=this._splitWidget.sidebarSize();}
for(let i=0;i<this._treeOutlines.length;++i){this._treeOutlines[i].setVisibleWidth(width);}
this._breadcrumbs.updateSizes();}
focus(){if(this._treeOutlines.length){this._treeOutlines[0].focus();}}
searchableView(){return this._searchableView;}
wasShown(){UI.context.setFlavor(ElementsPanel,this);for(let i=0;i<this._treeOutlines.length;++i){const treeOutline=this._treeOutlines[i];if(treeOutline.element.parentElement!==this._contentElement){const header=this._treeOutlineHeaders.get(treeOutline);if(header){this._contentElement.appendChild(header);}
this._contentElement.appendChild(treeOutline.element);}}
super.wasShown();this._breadcrumbs.update();const domModels=SDK.targetManager.models(SDK.DOMModel);for(const domModel of domModels){if(domModel.parentModel()){continue;}
const treeOutline=ElementsTreeOutline.forDOMModel(domModel);treeOutline.setVisible(true);if(!treeOutline.rootDOMNode){if(domModel.existingDocument()){treeOutline.rootDOMNode=domModel.existingDocument();this._documentUpdated(domModel);}else{domModel.requestDocument();}}}}
willHide(){SDK.OverlayModel.hideDOMNodeHighlight();for(let i=0;i<this._treeOutlines.length;++i){const treeOutline=this._treeOutlines[i];treeOutline.setVisible(false);this._contentElement.removeChild(treeOutline.element);const header=this._treeOutlineHeaders.get(treeOutline);if(header){this._contentElement.removeChild(header);}}
if(this._popoverHelper){this._popoverHelper.hidePopover();}
super.willHide();UI.context.setFlavor(ElementsPanel,null);}
onResize(){this.element.window().requestAnimationFrame(this._updateSidebarPosition.bind(this));this._updateTreeOutlineVisibleWidth();}
_selectedNodeChanged(event){const selectedNode=(event.data.node);const focus=(event.data.focus);for(const treeOutline of this._treeOutlines){if(!selectedNode||ElementsTreeOutline.forDOMModel(selectedNode.domModel())!==treeOutline){treeOutline.selectDOMNode(null);}}
this._breadcrumbs.setSelectedNode(selectedNode);UI.context.setFlavor(SDK.DOMNode,selectedNode);if(!selectedNode){return;}
selectedNode.setAsInspectedNode();if(focus){this._selectedNodeOnReset=selectedNode;this._hasNonDefaultSelectedNode=true;}
const executionContexts=selectedNode.domModel().runtimeModel().executionContexts();const nodeFrameId=selectedNode.frameId();for(const context of executionContexts){if(context.frameId===nodeFrameId){UI.context.setFlavor(SDK.ExecutionContext,context);break;}}}
_documentUpdatedEvent(event){const domModel=(event.data);this._documentUpdated(domModel);}
_documentUpdated(domModel){this._searchableView.resetSearch();if(!domModel.existingDocument()){if(this.isShowing()){domModel.requestDocument();}
return;}
this._hasNonDefaultSelectedNode=false;if(this._omitDefaultSelection){return;}
const savedSelectedNodeOnReset=this._selectedNodeOnReset;restoreNode.call(this,domModel,this._selectedNodeOnReset);async function restoreNode(domModel,staleNode){const nodePath=staleNode?staleNode.path():null;const restoredNodeId=nodePath?await domModel.pushNodeByPathToFrontend(nodePath):null;if(savedSelectedNodeOnReset!==this._selectedNodeOnReset){return;}
let node=restoredNodeId?domModel.nodeForId(restoredNodeId):null;if(!node){const inspectedDocument=domModel.existingDocument();node=inspectedDocument?inspectedDocument.body||inspectedDocument.documentElement:null;}
this._setDefaultSelectedNode(node);this._lastSelectedNodeSelectedForTest();}}
_lastSelectedNodeSelectedForTest(){}
_setDefaultSelectedNode(node){if(!node||this._hasNonDefaultSelectedNode||this._pendingNodeReveal){return;}
const treeOutline=ElementsTreeOutline.forDOMModel(node.domModel());if(!treeOutline){return;}
this.selectDOMNode(node);if(treeOutline.selectedTreeElement){treeOutline.selectedTreeElement.expand();}}
searchCanceled(){delete this._searchConfig;this._hideSearchHighlights();this._searchableView.updateSearchMatchesCount(0);delete this._currentSearchResultIndex;delete this._searchResults;SDK.DOMModel.cancelSearch();}
performSearch(searchConfig,shouldJump,jumpBackwards){const query=searchConfig.query;const whitespaceTrimmedQuery=query.trim();if(!whitespaceTrimmedQuery.length){return;}
if(!this._searchConfig||this._searchConfig.query!==query){this.searchCanceled();}else{this._hideSearchHighlights();}
this._searchConfig=searchConfig;const showUAShadowDOM=Common.moduleSetting('showUAShadowDOM').get();const domModels=SDK.targetManager.models(SDK.DOMModel);const promises=domModels.map(domModel=>domModel.performSearch(whitespaceTrimmedQuery,showUAShadowDOM));Promise.all(promises).then(resultCountCallback.bind(this));function resultCountCallback(resultCounts){this._searchResults=[];for(let i=0;i<resultCounts.length;++i){const resultCount=resultCounts[i];for(let j=0;j<resultCount;++j){this._searchResults.push({domModel:domModels[i],index:j,node:undefined});}}
this._searchableView.updateSearchMatchesCount(this._searchResults.length);if(!this._searchResults.length){return;}
if(this._currentSearchResultIndex>=this._searchResults.length){this._currentSearchResultIndex=undefined;}
let index=this._currentSearchResultIndex;if(shouldJump){if(this._currentSearchResultIndex===undefined){index=jumpBackwards?-1:0;}else{index=jumpBackwards?index-1:index+1;}
this._jumpToSearchResult(index);}}}
_domWordWrapSettingChanged(event){this._contentElement.classList.toggle('elements-wrap',event.data);for(let i=0;i<this._treeOutlines.length;++i){this._treeOutlines[i].setWordWrap((event.data));}}
switchToAndFocus(node){this._searchableView.cancelSearch();UI.viewManager.showView('elements').then(()=>this.selectDOMNode(node,true));}
_getPopoverRequest(event){let link=event.target;while(link&&!link[HrefSymbol]){link=link.parentElementOrShadowHost();}
if(!link){return null;}
return{box:link.boxInWindow(),show:async popover=>{const node=this.selectedDOMNode();if(!node){return false;}
const preview=await Components.ImagePreview.build(node.domModel().target(),link[HrefSymbol],true);if(preview){popover.contentElement.appendChild(preview);}
return!!preview;}};}
_jumpToSearchResult(index){if(!this._searchResults){return;}
this._currentSearchResultIndex=(index+this._searchResults.length)%this._searchResults.length;this._highlightCurrentSearchResult();}
jumpToNextSearchResult(){if(!this._searchResults){return;}
this.performSearch(this._searchConfig,true);}
jumpToPreviousSearchResult(){if(!this._searchResults){return;}
this.performSearch(this._searchConfig,true,true);}
supportsCaseSensitiveSearch(){return false;}
supportsRegexSearch(){return false;}
_highlightCurrentSearchResult(){const index=this._currentSearchResultIndex;const searchResults=this._searchResults;if(!searchResults){return;}
const searchResult=searchResults[index];this._searchableView.updateCurrentMatchIndex(index);if(searchResult.node===null){return;}
if(typeof searchResult.node==='undefined'){searchResult.domModel.searchResult(searchResult.index).then(node=>{searchResult.node=node;this._highlightCurrentSearchResult();});return;}
const treeElement=this._treeElementForNode(searchResult.node);searchResult.node.scrollIntoView();if(treeElement){treeElement.highlightSearchResults(this._searchConfig.query);treeElement.reveal();const matches=treeElement.listItemElement.getElementsByClassName(UI.highlightedSearchResultClassName);if(matches.length){matches[0].scrollIntoViewIfNeeded(false);}}}
_hideSearchHighlights(){if(!this._searchResults||!this._searchResults.length||this._currentSearchResultIndex===undefined){return;}
const searchResult=this._searchResults[this._currentSearchResultIndex];if(!searchResult.node){return;}
const treeOutline=ElementsTreeOutline.forDOMModel(searchResult.node.domModel());const treeElement=treeOutline.findTreeElement(searchResult.node);if(treeElement){treeElement.hideSearchHighlights();}}
selectedDOMNode(){for(let i=0;i<this._treeOutlines.length;++i){const treeOutline=this._treeOutlines[i];if(treeOutline.selectedDOMNode()){return treeOutline.selectedDOMNode();}}
return null;}
selectDOMNode(node,focus){for(const treeOutline of this._treeOutlines){const outline=ElementsTreeOutline.forDOMModel(node.domModel());if(outline===treeOutline){treeOutline.selectDOMNode(node,focus);}else{treeOutline.selectDOMNode(null);}}}
_updateBreadcrumbIfNeeded(event){const nodes=(event.data);this._breadcrumbs.updateNodes(nodes);}
_crumbNodeSelected(event){const node=(event.data);this.selectDOMNode(node,true);}
_treeOutlineForNode(node){if(!node){return null;}
return ElementsTreeOutline.forDOMModel(node.domModel());}
_treeElementForNode(node){const treeOutline=this._treeOutlineForNode(node);return(treeOutline.findTreeElement(node));}
_leaveUserAgentShadowDOM(node){let userAgentShadowRoot;while((userAgentShadowRoot=node.ancestorUserAgentShadowRoot())&&userAgentShadowRoot.parentNode){node=userAgentShadowRoot.parentNode;}
return node;}
revealAndSelectNode(node,focus,omitHighlight){this._omitDefaultSelection=true;node=Common.moduleSetting('showUAShadowDOM').get()?node:this._leaveUserAgentShadowDOM(node);if(!omitHighlight){node.highlightForTwoSeconds();}
return UI.viewManager.showView('elements',false,!focus).then(()=>{this.selectDOMNode(node,focus);delete this._omitDefaultSelection;if(!this._notFirstInspectElement){ElementsPanel._firstInspectElementNodeNameForTest=node.nodeName();ElementsPanel._firstInspectElementCompletedForTest();Host.InspectorFrontendHost.inspectElementCompleted();}
this._notFirstInspectElement=true;});}
_showUAShadowDOMChanged(){for(let i=0;i<this._treeOutlines.length;++i){this._treeOutlines[i].update();}}
_setupTextSelectionHack(stylePaneWrapperElement){const uninstallHackBound=uninstallHack.bind(this);const uninstallHackOnMousemove=event=>{if(event.buttons===0){uninstallHack.call(this);}};stylePaneWrapperElement.addEventListener('mousedown',event=>{if(event.which!==1){return;}
this._splitWidget.element.classList.add('disable-resizer-for-elements-hack');stylePaneWrapperElement.style.setProperty('height',`${stylePaneWrapperElement.offsetHeight}px`);const largeLength=1000000;stylePaneWrapperElement.style.setProperty('left',`${- 1 * largeLength}px`);stylePaneWrapperElement.style.setProperty('padding-left',`${largeLength}px`);stylePaneWrapperElement.style.setProperty('width',`calc(100% + ${largeLength}px)`);stylePaneWrapperElement.style.setProperty('position',`fixed`);stylePaneWrapperElement.window().addEventListener('blur',uninstallHackBound);stylePaneWrapperElement.window().addEventListener('contextmenu',uninstallHackBound,true);stylePaneWrapperElement.window().addEventListener('dragstart',uninstallHackBound,true);stylePaneWrapperElement.window().addEventListener('mousemove',uninstallHackOnMousemove,true);stylePaneWrapperElement.window().addEventListener('mouseup',uninstallHackBound,true);stylePaneWrapperElement.window().addEventListener('visibilitychange',uninstallHackBound);},true);function uninstallHack(){this._splitWidget.element.classList.remove('disable-resizer-for-elements-hack');stylePaneWrapperElement.style.removeProperty('left');stylePaneWrapperElement.style.removeProperty('padding-left');stylePaneWrapperElement.style.removeProperty('width');stylePaneWrapperElement.style.removeProperty('position');stylePaneWrapperElement.window().removeEventListener('blur',uninstallHackBound);stylePaneWrapperElement.window().removeEventListener('contextmenu',uninstallHackBound,true);stylePaneWrapperElement.window().removeEventListener('dragstart',uninstallHackBound,true);stylePaneWrapperElement.window().removeEventListener('mousemove',uninstallHackOnMousemove,true);stylePaneWrapperElement.window().removeEventListener('mouseup',uninstallHackBound,true);stylePaneWrapperElement.window().removeEventListener('visibilitychange',uninstallHackBound);}}
_updateSidebarPosition(){if(this.sidebarPaneView&&this.sidebarPaneView.tabbedPane().shouldHideOnDetach()){return;}
let splitMode;const position=Common.moduleSetting('sidebarPosition').get();if(position==='right'||(position==='auto'&&UI.inspectorView.element.offsetWidth>680)){splitMode=_splitMode.Vertical;}else if(UI.inspectorView.element.offsetWidth>415){splitMode=_splitMode.Horizontal;}else{splitMode=_splitMode.Slim;}
if(this.sidebarPaneView&&splitMode===this._splitMode){return;}
this._splitMode=splitMode;const extensionSidebarPanes=Extensions.extensionServer.sidebarPanes();let lastSelectedTabId=null;if(this.sidebarPaneView){lastSelectedTabId=this.sidebarPaneView.tabbedPane().selectedTabId;this.sidebarPaneView.tabbedPane().detach();this._splitWidget.uninstallResizer(this.sidebarPaneView.tabbedPane().headerElement());}
this._splitWidget.setVertical(this._splitMode===_splitMode.Vertical);this.showToolbarPane(null,null);const matchedStylePanesWrapper=new UI.VBox();matchedStylePanesWrapper.element.classList.add('style-panes-wrapper');this._stylesWidget.show(matchedStylePanesWrapper.element);this._setupTextSelectionHack(matchedStylePanesWrapper.element);const computedStylePanesWrapper=new UI.VBox();computedStylePanesWrapper.element.classList.add('style-panes-wrapper');this._computedStyleWidget.show(computedStylePanesWrapper.element);function showMetrics(inComputedStyle){if(inComputedStyle){this._metricsWidget.show(computedStylePanesWrapper.element,this._computedStyleWidget.element);}else{this._metricsWidget.show(matchedStylePanesWrapper.element);}}
function tabSelected(event){const tabId=(event.data.tabId);if(tabId===Common.UIString('Computed')){showMetrics.call(this,true);}else if(tabId===Common.UIString('Styles')){showMetrics.call(this,false);}}
this.sidebarPaneView=UI.viewManager.createTabbedLocation(()=>UI.viewManager.showView('elements'));const tabbedPane=this.sidebarPaneView.tabbedPane();if(this._popoverHelper){this._popoverHelper.hidePopover();}
this._popoverHelper=new UI.PopoverHelper(tabbedPane.element,this._getPopoverRequest.bind(this));this._popoverHelper.setHasPadding(true);this._popoverHelper.setTimeout(0);if(this._splitMode!==_splitMode.Vertical){this._splitWidget.installResizer(tabbedPane.headerElement());}
const stylesView=new UI.SimpleView(Common.UIString('Styles'));this.sidebarPaneView.appendView(stylesView);if(splitMode===_splitMode.Horizontal){stylesView.element.classList.add('flex-auto');const splitWidget=new UI.SplitWidget(true,true,'stylesPaneSplitViewState',215);splitWidget.show(stylesView.element);splitWidget.setMainWidget(matchedStylePanesWrapper);splitWidget.setSidebarWidget(computedStylePanesWrapper);}else{stylesView.element.classList.add('flex-auto');matchedStylePanesWrapper.show(stylesView.element);const computedView=new UI.SimpleView(Common.UIString('Computed'));computedView.element.classList.add('composite','fill');computedStylePanesWrapper.show(computedView.element);tabbedPane.addEventListener(UI.TabbedPane.Events.TabSelected,tabSelected,this);this.sidebarPaneView.appendView(computedView);}
this._stylesViewToReveal=stylesView;showMetrics.call(this,this._splitMode===_splitMode.Horizontal);this.sidebarPaneView.appendApplicableItems('elements-sidebar');for(let i=0;i<extensionSidebarPanes.length;++i){this._addExtensionSidebarPane(extensionSidebarPanes[i]);}
if(lastSelectedTabId){this.sidebarPaneView.tabbedPane().selectTab(lastSelectedTabId);}
this._splitWidget.setSidebarWidget(this.sidebarPaneView.tabbedPane());}
_extensionSidebarPaneAdded(event){const pane=(event.data);this._addExtensionSidebarPane(pane);}
_addExtensionSidebarPane(pane){if(pane.panelName()===this.name){this.sidebarPaneView.appendView(pane);}}}
export const _splitMode={Vertical:Symbol('Vertical'),Horizontal:Symbol('Horizontal'),Slim:Symbol('Slim'),};export class ContextMenuProvider{appendApplicableItems(event,contextMenu,object){if(!(object instanceof SDK.RemoteObject&&((object)).isNode())&&!(object instanceof SDK.DOMNode)&&!(object instanceof SDK.DeferredDOMNode)){return;}
if(ElementsPanel.instance().element.isAncestor((event.target))){return;}
const commandCallback=Common.Revealer.reveal.bind(Common.Revealer,object);contextMenu.revealSection().appendItem(Common.UIString('Reveal in Elements panel'),commandCallback);}}
export class DOMNodeRevealer{reveal(node,omitFocus){const panel=ElementsPanel.instance();panel._pendingNodeReveal=true;return new Promise(revealPromise);function revealPromise(resolve,reject){if(node instanceof SDK.DOMNode){onNodeResolved((node));}else if(node instanceof SDK.DeferredDOMNode){((node)).resolve(onNodeResolved);}else if(node instanceof SDK.RemoteObject){const domModel=(node).runtimeModel().target().model(SDK.DOMModel);if(domModel){domModel.pushObjectAsNodeToFrontend(node).then(onNodeResolved);}else{reject(new Error('Could not resolve a node to reveal.'));}}else{reject(new Error('Can\'t reveal a non-node.'));panel._pendingNodeReveal=false;}
function onNodeResolved(resolvedNode){panel._pendingNodeReveal=false;let currentNode=resolvedNode;while(currentNode.parentNode){currentNode=currentNode.parentNode;}
const isDetached=!(currentNode instanceof SDK.DOMDocument);const isDocument=node instanceof SDK.DOMDocument;if(!isDocument&&isDetached){const msg=ls`Node cannot be found in the current page.`;Common.console.warn(msg);reject(new Error(msg));return;}
if(resolvedNode){panel.revealAndSelectNode(resolvedNode,!omitFocus).then(resolve);return;}
reject(new Error('Could not resolve node to reveal.'));}}}}
export class CSSPropertyRevealer{reveal(property){const panel=ElementsPanel.instance();return panel._revealProperty((property));}}
export class ElementsActionDelegate{handleAction(context,actionId){const node=UI.context.flavor(SDK.DOMNode);if(!node){return true;}
const treeOutline=ElementsTreeOutline.forDOMModel(node.domModel());if(!treeOutline){return true;}
switch(actionId){case'elements.hide-element':treeOutline.toggleHideElement(node);return true;case'elements.edit-as-html':treeOutline.toggleEditAsHTML(node);return true;case'elements.undo':SDK.domModelUndoStack.undo();ElementsPanel.instance()._stylesWidget.forceUpdate();return true;case'elements.redo':SDK.domModelUndoStack.redo();ElementsPanel.instance()._stylesWidget.forceUpdate();return true;}
return false;}}
export class PseudoStateMarkerDecorator{decorate(node){return{color:'orange',title:Common.UIString('Element state: %s',':'+node.domModel().cssModel().pseudoState(node).join(', :'))};}}