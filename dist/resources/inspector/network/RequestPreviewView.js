export default class RequestPreviewView extends Network.RequestResponseView{constructor(request){super(request);}
async showPreview(){const view=await super.showPreview();if(!(view instanceof UI.SimpleView)){return view;}
const toolbar=new UI.Toolbar('network-item-preview-toolbar',this.element);for(const item of view.syncToolbarItems()){toolbar.appendToolbarItem(item);}
return view;}
async _htmlPreview(){const contentData=await this.request.contentData();if(contentData.error){return new UI.EmptyWidget(Common.UIString('Failed to load response data'));}
const whitelist=new Set(['text/html','text/plain','application/xhtml+xml']);if(!whitelist.has(this.request.mimeType)){return null;}
const content=contentData.encoded?window.atob((contentData.content)):(contentData.content);const jsonView=await SourceFrame.JSONView.createView(content);if(jsonView){return jsonView;}
const dataURL=Common.ContentProvider.contentAsDataURL(contentData.content,this.request.mimeType,contentData.encoded,this.request.charset());return dataURL?new Network.RequestHTMLView(dataURL):null;}
async createPreview(){if(this.request.signedExchangeInfo()){return new Network.SignedExchangeInfoView(this.request);}
const htmlErrorPreview=await this._htmlPreview();if(htmlErrorPreview){return htmlErrorPreview;}
const provided=await SourceFrame.PreviewFactory.createPreview(this.request,this.request.mimeType);if(provided){return provided;}
return new UI.EmptyWidget(Common.UIString('Preview not available'));}}
self.Network=self.Network||{};Network=Network||{};Network.RequestPreviewView=RequestPreviewView;