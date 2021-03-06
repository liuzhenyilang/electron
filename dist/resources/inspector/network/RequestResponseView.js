export default class RequestResponseView extends UI.VBox{constructor(request){super();this.element.classList.add('request-view');this.request=request;this._contentViewPromise=null;}
static _hasTextContent(request,contentData){const mimeType=request.mimeType||'';let resourceType=Common.ResourceType.fromMimeType(mimeType);if(resourceType===Common.resourceTypes.Other){resourceType=request.contentType();}
if(resourceType===Common.resourceTypes.Image){return mimeType.startsWith('image/svg');}
if(resourceType.isTextType()){return true;}
if(contentData.error){return false;}
if(resourceType===Common.resourceTypes.Other){return!!contentData.content&&!contentData.encoded;}
return false;}
static async sourceViewForRequest(request){let sourceView=request[_sourceViewSymbol];if(sourceView!==undefined){return sourceView;}
const contentData=await request.contentData();if(!RequestResponseView._hasTextContent(request,contentData)){request[_sourceViewSymbol]=null;return null;}
const highlighterType=request.resourceType().canonicalMimeType()||request.mimeType;sourceView=SourceFrame.ResourceSourceFrame.createSearchableView(request,highlighterType);request[_sourceViewSymbol]=sourceView;return sourceView;}
wasShown(){this._doShowPreview();}
_doShowPreview(){if(!this._contentViewPromise){this._contentViewPromise=this.showPreview();}
return this._contentViewPromise;}
async showPreview(){const responseView=await this.createPreview();responseView.show(this.element);return responseView;}
async createPreview(){const contentData=await this.request.contentData();const sourceView=await RequestResponseView.sourceViewForRequest(this.request);if((!contentData.content||!sourceView)&&!contentData.error){return new UI.EmptyWidget(Common.UIString('This request has no response data available.'));}
if(contentData.content&&sourceView){return sourceView;}
return new UI.EmptyWidget(Common.UIString('Failed to load response data'));}
async revealLine(line){const view=await this._doShowPreview();if(view instanceof SourceFrame.ResourceSourceFrame.SearchableContainer){view.revealPosition(line);}}}
export const _sourceViewSymbol=Symbol('RequestResponseSourceView');self.Network=self.Network||{};Network=Network||{};Network.RequestResponseView=RequestResponseView;Network.RequestResponseView._sourceViewSymbol=_sourceViewSymbol;