Media.EventDisplayColumnConfig;Media.Event;Media.EventNode=class extends DataGrid.SortableDataGridNode{constructor(event){super(event,false);}
createCell(columnId){const cell=this.createTD(columnId);const cellData=(this.data[columnId]);cell.createTextChild(cellData);return cell;}
nodeSelfHeight(){return 20;}};Media.EventDisplayTable=class extends UI.VBox{constructor(headerDescriptors,uniqueColumn,defaultSortingColumnId){super();this.registerRequiredCSS('media/eventDisplayTable.css');this.contentElement.classList.add('event-display-table-contents-table-container');this._uniqueColumnEntryKey=uniqueColumn;this._uniqueColumnMap=new Map();this._dataGrid=this._createDataGrid(headerDescriptors,defaultSortingColumnId);this._dataGrid.setStriped(true);this._dataGrid.asWidget().show(this.contentElement);}
_createDataGrid(headers,default_sort){const gridColumnDescs=[];const sortFunctionMap=new Map();for(const headerDesc of headers){gridColumnDescs.push(Media.EventDisplayTable._convertToGridDescriptor(headerDesc));if(headerDesc.sortable){sortFunctionMap.set(headerDesc.id,headerDesc.sortingFunction);if(!default_sort){default_sort=headerDesc.id;}}}
const datagrid=new DataGrid.SortableDataGrid(gridColumnDescs);if(default_sort){datagrid.sortNodes(sortFunctionMap.get(default_sort),!datagrid.isSortOrderAscending());function sortGrid(){const comparator=sortFunctionMap.get(datagrid.sortColumnId());datagrid.sortNodes(comparator,!datagrid.isSortOrderAscending());}
datagrid.addEventListener(DataGrid.DataGrid.Events.SortingChanged,sortGrid);}
datagrid.asWidget().contentElement.classList.add('no-border-top-datagrid');return datagrid;}
addEvents(events){for(const event of events){this.addEvent(event);}}
addEvent(event){if(this._uniqueColumnEntryKey){const eventValue=event[this._uniqueColumnEntryKey];if(this._uniqueColumnMap.has(eventValue)){this._uniqueColumnMap.get(eventValue).data=event;return;}}
const node=new Media.EventNode(event);this._dataGrid.rootNode().insertChildOrdered(node);if(this._uniqueColumnEntryKey){this._uniqueColumnMap.set(event[this._uniqueColumnEntryKey],node);}}
static _convertToGridDescriptor(columnConfig){return({id:columnConfig.id,title:columnConfig.title,sortable:columnConfig.sortable,weight:columnConfig.weight||0,sort:DataGrid.DataGrid.Order.Ascending});}};;Media.MainView=class extends UI.PanelWithSidebar{constructor(){super('Media');this.registerRequiredCSS('media/mediaView.css');this._detailPanels=new Map();this._deletedPlayers=new Set();this._sidebar=new Media.PlayerListView(this);this._sidebar.show(this.panelSidebarElement());SDK.targetManager.observeModels(Media.MediaModel,this);}
renderChanges(playerID,changes,changeType){if(this._deletedPlayers.has(playerID)){return;}
if(!this._detailPanels.has(playerID)){return;}
this._sidebar.renderChanges(playerID,changes,changeType);this._detailPanels.get(playerID).renderChanges(playerID,changes,changeType);}
renderMainPanel(playerID){if(!this._detailPanels.has(playerID)){return;}
this.splitWidget().mainWidget().detachChildWidgets();this._detailPanels.get(playerID).show(this.mainElement());}
_onPlayerCreated(playerID){this._sidebar.addMediaElementItem(playerID);this._detailPanels.set(playerID,new Media.PlayerDetailView());}
wasShown(){super.wasShown();for(const model of SDK.targetManager.models(Media.MediaModel)){this._addEventListeners(model);}}
willHide(){for(const model of SDK.targetManager.models(Media.MediaModel)){this._removeEventListeners(model);}}
modelAdded(mediaModel){if(this.isShowing()){this._addEventListeners(mediaModel);}}
modelRemoved(mediaModel){this._removeEventListeners(mediaModel);}
_addEventListeners(mediaModel){mediaModel.ensureEnabled();mediaModel.addEventListener(Media.MediaModel.Events.PlayerPropertiesChanged,this._propertiesChanged,this);mediaModel.addEventListener(Media.MediaModel.Events.PlayerEventsAdded,this._eventsAdded,this);mediaModel.addEventListener(Media.MediaModel.Events.PlayersCreated,this._playersCreated,this);}
_removeEventListeners(mediaModel){mediaModel.removeEventListener(Media.MediaModel.Events.PlayerPropertiesChanged,this._propertiesChanged,this);mediaModel.removeEventListener(Media.MediaModel.Events.PlayerEventsAdded,this._eventsAdded,this);mediaModel.removeEventListener(Media.MediaModel.Events.PlayersCreated,this._playersCreated,this);}
_propertiesChanged(event){this.renderChanges(event.data.playerId,event.data.properties,Media.MediaModel.MediaChangeTypeKeys.Property);}
_eventsAdded(event){this.renderChanges(event.data.playerId,event.data.events,Media.MediaModel.MediaChangeTypeKeys.Event);}
_playersCreated(event){const playerlist=(event.data);for(const playerID of playerlist){this._onPlayerCreated(playerID);}}};;Media.MediaPlayerPropertiesRenderer=class extends Media.EventDisplayTable{constructor(){super([{id:'name',title:'Property Name',sortable:true,weight:2,sortingFunction:DataGrid.SortableDataGrid.StringComparator.bind(null,'name')},{id:'value',title:'Value',sortable:false,weight:7}],'name');}
renderChanges(playerID,changes,change_type){this.addEvents(changes);}};Media.MediaPlayerEventTableRenderer=class extends Media.EventDisplayTable{constructor(){super([{id:'timestamp',title:'Timestamp',weight:1,sortable:true,sortingFunction:DataGrid.SortableDataGrid.NumericComparator.bind(null,'timestamp')},{id:'name',title:'Event Name',weight:2,sortable:false},{id:'value',title:'Value',weight:7,sortable:false}]);this._firstEventTime=0;}
renderChanges(playerID,changes,change_type){if(this._firstEventTime===0&&changes.length>0){this._firstEventTime=changes[0].timestamp;}
this.addEvents(changes.map(this._subtractFirstEventTime.bind(this,this._firstEventTime)));}
_subtractFirstEventTime(first_event_time,event){event.timestamp=(event.timestamp-first_event_time).toFixed(3);return event;}};;Media.PlayerDetailView=class extends UI.TabbedPane{constructor(){super();const propertyTable=new Media.MediaPlayerPropertiesRenderer();const eventTable=new Media.MediaPlayerEventTableRenderer();this._panels=new Map([[Media.MediaModel.MediaChangeTypeKeys.Property,[propertyTable]],[Media.MediaModel.MediaChangeTypeKeys.Event,[eventTable]]]);this.appendTab(Media.PlayerDetailView.Tabs.Properties,Common.UIString('Properties'),propertyTable,Common.UIString('Player properties'));this.appendTab(Media.PlayerDetailView.Tabs.Events,Common.UIString('Events'),eventTable,Common.UIString('Player events'));}
renderChanges(playerID,changes,changeType){for(const panel of this._panels.get(changeType)){panel.renderChanges(playerID,changes,changeType);}}};Media.PlayerDetailView.Tabs={Events:'events',Properties:'properties',};;Media.PlayerStatus;Media.PlayerStatusMapElement;Media.PlayerEntryTreeElement=class extends UI.TreeElement{constructor(playerStatus,displayContainer){super(playerStatus.playerTitle,false);this.titleFromUrl=true;this._playerStatus=playerStatus;this._displayContainer=displayContainer;this.setLeadingIcons([UI.Icon.create('smallicon-videoplayer-playing','media-player')]);}
onselect(selectedByUser){this._displayContainer.renderMainPanel(this._playerStatus.playerID);return true;}};Media.PlayerListView=class extends UI.VBox{constructor(mainContainer){super(true);this._playerStatuses=new Map();this._mainContainer=mainContainer;this._sidebarTree=new UI.TreeOutlineInShadow();this.contentElement.appendChild(this._sidebarTree.element);this._sidebarTree.registerRequiredCSS('media/playerListView.css');this._audioDevices=this._addListSection(Common.UIString('Audio I/O'));this._videoDevices=this._addListSection(Common.UIString('Video Capture Devices'));this._playerList=this._addListSection(Common.UIString('Players'));}
_addListSection(title){const treeElement=new UI.TreeElement(title,true);treeElement.listItemElement.classList.add('storage-group-list-item');treeElement.setCollapsible(false);treeElement.selectable=false;this._sidebarTree.appendChild(treeElement);return treeElement;}
addMediaElementItem(playerID){const playerStatus={playerTitle:playerID,playerID:playerID,exists:true,playing:false,titleEdited:false};const playerElement=new Media.PlayerEntryTreeElement(playerStatus,this._mainContainer);this._playerStatuses.set(playerID,playerElement);this._playerList.appendChild(playerElement);}
setMediaElementPlayerTitle(playerID,newTitle,isTitleExtractedFromUrl){if(this._playerStatuses.has(playerID)){const sidebarEntry=this._playerStatuses.get(playerID);if(!isTitleExtractedFromUrl||sidebarEntry.titleFromUrl){sidebarEntry.title=newTitle;sidebarEntry.titleFromUrl=isTitleExtractedFromUrl;}}}
setMediaElementPlayerIcon(playerID,iconName){if(this._playerStatuses.has(playerID)){const sidebarEntry=this._playerStatuses.get(playerID);sidebarEntry.setLeadingIcons([UI.Icon.create('smallicon-videoplayer-'+iconName,'media-player')]);}}
renderChanges(playerID,changes,changeType){if(changeType===Media.MediaModel.MediaChangeTypeKeys.Property){for(const change of changes){if(change.name==='frame_title'&&change.value){this.setMediaElementPlayerTitle(playerID,change.value,false);}
if(change.name==='frame_url'){const url_path_component=change.value.substring(change.value.lastIndexOf('/')+1);this.setMediaElementPlayerTitle(playerID,url_path_component,true);}}}
if(changeType===Media.MediaModel.MediaChangeTypeKeys.Event){let change_to=null;for(const change of changes){if(change.name==='Event'){if(change.value==='PLAY'){change_to='playing';}else if(change.value==='PAUSE'){change_to='paused';}else if(change.value==='WEBMEDIAPLAYER_DESTROYED'){change_to='destroyed';}}}
if(change_to){this.setMediaElementPlayerIcon(playerID,change_to);}}}};;Media.MediaModel=class extends SDK.SDKModel{constructor(target){super(target);this._enabled=false;this._agent=target.mediaAgent();target.registerMediaDispatcher(this);}
resumeModel(){if(!this._enabled){return Promise.resolve();}
return this._agent.enable();}
ensureEnabled(){this._agent.enable();this._enabled=true;}
playerPropertiesChanged(playerId,properties){this.dispatchEventToListeners(Media.MediaModel.Events.PlayerPropertiesChanged,{playerId:playerId,properties:properties});}
playerEventsAdded(playerId,events){this.dispatchEventToListeners(Media.MediaModel.Events.PlayerEventsAdded,{playerId:playerId,events:events});}
playersCreated(playerIds){this.dispatchEventToListeners(Media.MediaModel.Events.PlayersCreated,playerIds);}};SDK.SDKModel.register(Media.MediaModel,SDK.Target.Capability.DOM,false);Media.MediaModel.Events={PlayerPropertiesChanged:Symbol('PlayerPropertiesChanged'),PlayerEventsAdded:Symbol('PlayerEventsAdded'),PlayersCreated:Symbol('PlayersCreated')};Media.MediaModel.MediaChangeTypeKeys={Event:'Events',Property:'Properties'};;Root.Runtime.cachedResources["media/eventDisplayTable.css"]="/*\n * Copyright 2019 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.no-border-top-datagrid>.data-grid {\n  /* make sure there is no top border, it ruins the menu view */\n  border-top: 0px;\n}\n\n.event-display-table-contents-table-container>.widget>.data-grid {\n  height: 100%;\n}\n/*# sourceURL=media/eventDisplayTable.css */";Root.Runtime.cachedResources["media/mediaView.css"]="/*\n * Copyright (c) 2019 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n\n.playerlist-sidebar {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n}\n\n.playerlist-sidebar-header {\n  font-size: 22px;\n  padding: 8px 20px;\n  border-bottom:1px solid var(--divider-color);\n}\n\n.playerlist-entry-title>pre {\n  margin: 0px;\n}\n\n.playerlist-entry-title {\n  float: left;\n}\n/*# sourceURL=media/mediaView.css */";Root.Runtime.cachedResources["media/playerListView.css"]="/*\n * Copyright 2019 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.tree-outline {\n    padding-left: 0;\n    color: rgb(90, 90, 90);\n}\n\nli.storage-group-list-item {\n    padding: 10px 8px 6px 8px;\n}\n\nli.storage-group-list-item:not(:first-child) {\n    border-top: 1px solid rgb(230, 230, 230);\n}\n\nli.storage-group-list-item::before {\n    display: none;\n}\n/*# sourceURL=media/playerListView.css */";