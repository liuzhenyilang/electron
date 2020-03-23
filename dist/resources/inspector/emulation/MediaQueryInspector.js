export default class MediaQueryInspector extends UI.Widget{constructor(getWidthCallback,setWidthCallback){super(true);this.registerRequiredCSS('emulation/mediaQueryInspector.css');this.contentElement.classList.add('media-inspector-view');this.contentElement.addEventListener('click',this._onMediaQueryClicked.bind(this),false);this.contentElement.addEventListener('contextmenu',this._onContextMenu.bind(this),false);this._mediaThrottler=new Common.Throttler(0);this._getWidthCallback=getWidthCallback;this._setWidthCallback=setWidthCallback;this._scale=1;SDK.targetManager.observeModels(SDK.CSSModel,this);UI.zoomManager.addEventListener(UI.ZoomManager.Events.ZoomChanged,this._renderMediaQueries.bind(this),this);}
modelAdded(cssModel){if(this._cssModel){return;}
this._cssModel=cssModel;this._cssModel.addEventListener(SDK.CSSModel.Events.StyleSheetAdded,this._scheduleMediaQueriesUpdate,this);this._cssModel.addEventListener(SDK.CSSModel.Events.StyleSheetRemoved,this._scheduleMediaQueriesUpdate,this);this._cssModel.addEventListener(SDK.CSSModel.Events.StyleSheetChanged,this._scheduleMediaQueriesUpdate,this);this._cssModel.addEventListener(SDK.CSSModel.Events.MediaQueryResultChanged,this._scheduleMediaQueriesUpdate,this);}
modelRemoved(cssModel){if(cssModel!==this._cssModel){return;}
this._cssModel.removeEventListener(SDK.CSSModel.Events.StyleSheetAdded,this._scheduleMediaQueriesUpdate,this);this._cssModel.removeEventListener(SDK.CSSModel.Events.StyleSheetRemoved,this._scheduleMediaQueriesUpdate,this);this._cssModel.removeEventListener(SDK.CSSModel.Events.StyleSheetChanged,this._scheduleMediaQueriesUpdate,this);this._cssModel.removeEventListener(SDK.CSSModel.Events.MediaQueryResultChanged,this._scheduleMediaQueriesUpdate,this);delete this._cssModel;}
setAxisTransform(scale){if(Math.abs(this._scale-scale)<1e-8){return;}
this._scale=scale;this._renderMediaQueries();}
_onMediaQueryClicked(event){const mediaQueryMarker=event.target.enclosingNodeOrSelfWithClass('media-inspector-bar');if(!mediaQueryMarker){return;}
const model=mediaQueryMarker._model;if(model.section()===Section.Max){this._setWidthCallback(model.maxWidthExpression().computedLength());return;}
if(model.section()===Section.Min){this._setWidthCallback(model.minWidthExpression().computedLength());return;}
const currentWidth=this._getWidthCallback();if(currentWidth!==model.minWidthExpression().computedLength()){this._setWidthCallback(model.minWidthExpression().computedLength());}else{this._setWidthCallback(model.maxWidthExpression().computedLength());}}
_onContextMenu(event){if(!this._cssModel||!this._cssModel.isEnabled()){return;}
const mediaQueryMarker=event.target.enclosingNodeOrSelfWithClass('media-inspector-bar');if(!mediaQueryMarker){return;}
const locations=mediaQueryMarker._locations;const uiLocations=new Map();for(let i=0;i<locations.length;++i){const uiLocation=Bindings.cssWorkspaceBinding.rawLocationToUILocation(locations[i]);if(!uiLocation){continue;}
const descriptor=String.sprintf('%s:%d:%d',uiLocation.uiSourceCode.url(),uiLocation.lineNumber+1,uiLocation.columnNumber+1);uiLocations.set(descriptor,uiLocation);}
const contextMenuItems=uiLocations.keysArray().sort();const contextMenu=new UI.ContextMenu(event);const subMenuItem=contextMenu.defaultSection().appendSubMenuItem(Common.UIString('Reveal in source code'));for(let i=0;i<contextMenuItems.length;++i){const title=contextMenuItems[i];subMenuItem.defaultSection().appendItem(title,this._revealSourceLocation.bind(this,(uiLocations.get(title))));}
contextMenu.show();}
_revealSourceLocation(location){Common.Revealer.reveal(location);}
_scheduleMediaQueriesUpdate(){if(!this.isShowing()){return;}
this._mediaThrottler.schedule(this._refetchMediaQueries.bind(this));}
_refetchMediaQueries(){if(!this.isShowing()||!this._cssModel){return Promise.resolve();}
return this._cssModel.mediaQueriesPromise().then(this._rebuildMediaQueries.bind(this));}
_squashAdjacentEqual(models){const filtered=[];for(let i=0;i<models.length;++i){const last=filtered.peekLast();if(!last||!last.equals(models[i])){filtered.push(models[i]);}}
return filtered;}
_rebuildMediaQueries(cssMedias){let queryModels=[];for(let i=0;i<cssMedias.length;++i){const cssMedia=cssMedias[i];if(!cssMedia.mediaList){continue;}
for(let j=0;j<cssMedia.mediaList.length;++j){const mediaQuery=cssMedia.mediaList[j];const queryModel=MediaQueryUIModel.createFromMediaQuery(cssMedia,mediaQuery);if(queryModel&&queryModel.rawLocation()){queryModels.push(queryModel);}}}
queryModels.sort(compareModels);queryModels=this._squashAdjacentEqual(queryModels);let allEqual=this._cachedQueryModels&&this._cachedQueryModels.length===queryModels.length;for(let i=0;allEqual&&i<queryModels.length;++i){allEqual=allEqual&&this._cachedQueryModels[i].equals(queryModels[i]);}
if(allEqual){return;}
this._cachedQueryModels=queryModels;this._renderMediaQueries();function compareModels(model1,model2){return model1.compareTo(model2);}}
_renderMediaQueries(){if(!this._cachedQueryModels||!this.isShowing()){return;}
const markers=[];let lastMarker=null;for(let i=0;i<this._cachedQueryModels.length;++i){const model=this._cachedQueryModels[i];if(lastMarker&&lastMarker.model.dimensionsEqual(model)){lastMarker.locations.push(model.rawLocation());lastMarker.active=lastMarker.active||model.active();}else{lastMarker={active:model.active(),model:model,locations:[model.rawLocation()]};markers.push(lastMarker);}}
this.contentElement.removeChildren();let container=null;for(let i=0;i<markers.length;++i){if(!i||markers[i].model.section()!==markers[i-1].model.section()){container=this.contentElement.createChild('div','media-inspector-marker-container');}
const marker=markers[i];const bar=this._createElementFromMediaQueryModel(marker.model);bar._model=marker.model;bar._locations=marker.locations;bar.classList.toggle('media-inspector-marker-inactive',!marker.active);container.appendChild(bar);}}
_zoomFactor(){return UI.zoomManager.zoomFactor()/this._scale;}
wasShown(){this._scheduleMediaQueriesUpdate();}
_createElementFromMediaQueryModel(model){const zoomFactor=this._zoomFactor();const minWidthValue=model.minWidthExpression()?model.minWidthExpression().computedLength()/zoomFactor:0;const maxWidthValue=model.maxWidthExpression()?model.maxWidthExpression().computedLength()/zoomFactor:0;const result=createElementWithClass('div','media-inspector-bar');if(model.section()===Section.Max){result.createChild('div','media-inspector-marker-spacer');const markerElement=result.createChild('div','media-inspector-marker media-inspector-marker-max-width');markerElement.style.width=maxWidthValue+'px';markerElement.title=model.mediaText();appendLabel(markerElement,model.maxWidthExpression(),false,false);appendLabel(markerElement,model.maxWidthExpression(),true,true);result.createChild('div','media-inspector-marker-spacer');}
if(model.section()===Section.MinMax){result.createChild('div','media-inspector-marker-spacer');const leftElement=result.createChild('div','media-inspector-marker media-inspector-marker-min-max-width');leftElement.style.width=(maxWidthValue-minWidthValue)*0.5+'px';leftElement.title=model.mediaText();appendLabel(leftElement,model.minWidthExpression(),true,false);appendLabel(leftElement,model.maxWidthExpression(),false,true);result.createChild('div','media-inspector-marker-spacer').style.flex='0 0 '+minWidthValue+'px';const rightElement=result.createChild('div','media-inspector-marker media-inspector-marker-min-max-width');rightElement.style.width=(maxWidthValue-minWidthValue)*0.5+'px';rightElement.title=model.mediaText();appendLabel(rightElement,model.minWidthExpression(),true,false);appendLabel(rightElement,model.maxWidthExpression(),false,true);result.createChild('div','media-inspector-marker-spacer');}
if(model.section()===Section.Min){const leftElement=result.createChild('div','media-inspector-marker media-inspector-marker-min-width media-inspector-marker-min-width-left');leftElement.title=model.mediaText();appendLabel(leftElement,model.minWidthExpression(),false,false);result.createChild('div','media-inspector-marker-spacer').style.flex='0 0 '+minWidthValue+'px';const rightElement=result.createChild('div','media-inspector-marker media-inspector-marker-min-width media-inspector-marker-min-width-right');rightElement.title=model.mediaText();appendLabel(rightElement,model.minWidthExpression(),true,true);}
function appendLabel(marker,expression,atLeft,leftAlign){marker.createChild('div','media-inspector-marker-label-container '+(atLeft?'media-inspector-marker-label-container-left':'media-inspector-marker-label-container-right')).createChild('span','media-inspector-marker-label '+
(leftAlign?'media-inspector-label-left':'media-inspector-label-right')).textContent=expression.value()+expression.unit();}
return result;}}
export const Section={Max:0,MinMax:1,Min:2};export class MediaQueryUIModel{constructor(cssMedia,minWidthExpression,maxWidthExpression,active){this._cssMedia=cssMedia;this._minWidthExpression=minWidthExpression;this._maxWidthExpression=maxWidthExpression;this._active=active;if(maxWidthExpression&&!minWidthExpression){this._section=Section.Max;}else if(minWidthExpression&&maxWidthExpression){this._section=Section.MinMax;}else{this._section=Section.Min;}}
static createFromMediaQuery(cssMedia,mediaQuery){let maxWidthExpression=null;let maxWidthPixels=Number.MAX_VALUE;let minWidthExpression=null;let minWidthPixels=Number.MIN_VALUE;const expressions=mediaQuery.expressions();for(let i=0;i<expressions.length;++i){const expression=expressions[i];const feature=expression.feature();if(feature.indexOf('width')===-1){continue;}
const pixels=expression.computedLength();if(feature.startsWith('max-')&&pixels<maxWidthPixels){maxWidthExpression=expression;maxWidthPixels=pixels;}else if(feature.startsWith('min-')&&pixels>minWidthPixels){minWidthExpression=expression;minWidthPixels=pixels;}}
if(minWidthPixels>maxWidthPixels||(!maxWidthExpression&&!minWidthExpression)){return null;}
return new MediaQueryUIModel(cssMedia,minWidthExpression,maxWidthExpression,mediaQuery.active());}
equals(other){return this.compareTo(other)===0;}
dimensionsEqual(other){return this.section()===other.section()&&(!this.minWidthExpression()||(this.minWidthExpression().computedLength()===other.minWidthExpression().computedLength()))&&(!this.maxWidthExpression()||(this.maxWidthExpression().computedLength()===other.maxWidthExpression().computedLength()));}
compareTo(other){if(this.section()!==other.section()){return this.section()-other.section();}
if(this.dimensionsEqual(other)){const myLocation=this.rawLocation();const otherLocation=other.rawLocation();if(!myLocation&&!otherLocation){return this.mediaText().compareTo(other.mediaText());}
if(myLocation&&!otherLocation){return 1;}
if(!myLocation&&otherLocation){return-1;}
if(this.active()!==other.active()){return this.active()?-1:1;}
return myLocation.url.compareTo(otherLocation.url)||myLocation.lineNumber-otherLocation.lineNumber||myLocation.columnNumber-otherLocation.columnNumber;}
if(this.section()===Section.Max){return other.maxWidthExpression().computedLength()-this.maxWidthExpression().computedLength();}
if(this.section()===Section.Min){return this.minWidthExpression().computedLength()-other.minWidthExpression().computedLength();}
return this.minWidthExpression().computedLength()-other.minWidthExpression().computedLength()||other.maxWidthExpression().computedLength()-this.maxWidthExpression().computedLength();}
section(){return this._section;}
mediaText(){return this._cssMedia.text;}
rawLocation(){if(!this._rawLocation){this._rawLocation=this._cssMedia.rawLocation();}
return this._rawLocation;}
minWidthExpression(){return this._minWidthExpression;}
maxWidthExpression(){return this._maxWidthExpression;}
active(){return this._active;}}
self.Emulation=self.Emulation||{};Emulation=Emulation||{};Emulation.MediaQueryInspector=MediaQueryInspector;Emulation.MediaQueryInspector.Section=Section;Emulation.MediaQueryInspector.MediaQueryUIModel=MediaQueryUIModel;