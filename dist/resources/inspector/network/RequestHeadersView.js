export class RequestHeadersView extends UI.VBox{constructor(request){super();this.registerRequiredCSS('network/requestHeadersView.css');this.element.classList.add('request-headers-view');this._request=request;this._decodeRequestParameters=true;this._showRequestHeadersText=false;this._showResponseHeadersText=false;this._highlightedElement=null;const root=new UI.TreeOutlineInShadow();root.registerRequiredCSS('object_ui/objectValue.css');root.registerRequiredCSS('object_ui/objectPropertiesSection.css');root.registerRequiredCSS('network/requestHeadersTree.css');root.element.classList.add('request-headers-tree');root.makeDense();this.element.appendChild(root.element);const generalCategory=new Category(root,'general',Common.UIString('General'));generalCategory.hidden=false;this._root=generalCategory;this._urlItem=generalCategory.createLeaf();this._requestMethodItem=generalCategory.createLeaf();this._statusCodeItem=generalCategory.createLeaf();this._remoteAddressItem=generalCategory.createLeaf();this._remoteAddressItem.hidden=true;this._referrerPolicyItem=generalCategory.createLeaf();this._referrerPolicyItem.hidden=true;this._responseHeadersCategory=new Category(root,'responseHeaders','');this._requestHeadersCategory=new Category(root,'requestHeaders','');this._queryStringCategory=new Category(root,'queryString','');this._formDataCategory=new Category(root,'formData','');this._requestPayloadCategory=new Category(root,'requestPayload',Common.UIString('Request Payload'));}
wasShown(){this._clearHighlight();this._request.addEventListener(SDK.NetworkRequest.Events.RemoteAddressChanged,this._refreshRemoteAddress,this);this._request.addEventListener(SDK.NetworkRequest.Events.RequestHeadersChanged,this._refreshRequestHeaders,this);this._request.addEventListener(SDK.NetworkRequest.Events.ResponseHeadersChanged,this._refreshResponseHeaders,this);this._request.addEventListener(SDK.NetworkRequest.Events.FinishedLoading,this._refreshHTTPInformation,this);this._refreshURL();this._refreshQueryString();this._refreshRequestHeaders();this._refreshResponseHeaders();this._refreshHTTPInformation();this._refreshRemoteAddress();this._refreshReferrerPolicy();this._root.select(true,false);}
willHide(){this._request.removeEventListener(SDK.NetworkRequest.Events.RemoteAddressChanged,this._refreshRemoteAddress,this);this._request.removeEventListener(SDK.NetworkRequest.Events.RequestHeadersChanged,this._refreshRequestHeaders,this);this._request.removeEventListener(SDK.NetworkRequest.Events.ResponseHeadersChanged,this._refreshResponseHeaders,this);this._request.removeEventListener(SDK.NetworkRequest.Events.FinishedLoading,this._refreshHTTPInformation,this);}
_formatHeader(name,value){const fragment=createDocumentFragment();fragment.createChild('div','header-name').textContent=name+': ';fragment.createChild('span','header-separator');fragment.createChild('div','header-value source-code').textContent=value;return fragment;}
_formatParameter(value,className,decodeParameters){let errorDecoding=false;if(decodeParameters){value=value.replace(/\+/g,' ');if(value.indexOf('%')>=0){try{value=decodeURIComponent(value);}catch(e){errorDecoding=true;}}}
const div=createElementWithClass('div',className);if(value===''){div.classList.add('empty-value');}
if(errorDecoding){div.createChild('span','header-decode-error').textContent=Common.UIString('(unable to decode value)');}else{div.textContent=value;}
return div;}
_refreshURL(){this._urlItem.title=this._formatHeader(Common.UIString('Request URL'),this._request.url());}
_refreshQueryString(){const queryString=this._request.queryString();const queryParameters=this._request.queryParameters;this._queryStringCategory.hidden=!queryParameters;if(queryParameters){this._refreshParams(Common.UIString('Query String Parameters'),queryParameters,queryString,this._queryStringCategory);}}
async _refreshFormData(){this._formDataCategory.hidden=true;this._requestPayloadCategory.hidden=true;const formData=await this._request.requestFormData();if(!formData){return;}
const formParameters=await this._request.formParameters();if(formParameters){this._formDataCategory.hidden=false;this._refreshParams(Common.UIString('Form Data'),formParameters,formData,this._formDataCategory);}else{this._requestPayloadCategory.hidden=false;try{const json=JSON.parse(formData);this._refreshRequestJSONPayload(json,formData);}catch(e){this._populateTreeElementWithSourceText(this._requestPayloadCategory,formData);}}}
_populateTreeElementWithSourceText(treeElement,sourceText){const max_len=3000;const text=(sourceText||'').trim();const trim=text.length>max_len;const sourceTextElement=createElementWithClass('span','header-value source-code');sourceTextElement.textContent=trim?text.substr(0,max_len):text;const sourceTreeElement=new UI.TreeElement(sourceTextElement);treeElement.removeChildren();treeElement.appendChild(sourceTreeElement);if(!trim){return;}
const showMoreButton=createElementWithClass('button','request-headers-show-more-button');showMoreButton.textContent=Common.UIString('Show more');function showMore(){showMoreButton.remove();sourceTextElement.textContent=text;sourceTreeElement.listItemElement.removeEventListener('contextmenu',onContextMenuShowMore);}
showMoreButton.addEventListener('click',showMore);function onContextMenuShowMore(event){const contextMenu=new UI.ContextMenu(event);const section=contextMenu.newSection();section.appendItem(ls`Show more`,showMore);contextMenu.show();}
sourceTreeElement.listItemElement.addEventListener('contextmenu',onContextMenuShowMore);sourceTextElement.appendChild(showMoreButton);}
_refreshParams(title,params,sourceText,paramsTreeElement){paramsTreeElement.removeChildren();paramsTreeElement.listItemElement.removeChildren();paramsTreeElement.listItemElement.createChild('div','selection fill');paramsTreeElement.listItemElement.createTextChild(title);const headerCount=createElementWithClass('span','header-count');headerCount.textContent=Common.UIString('\xA0(%d)',params.length);paramsTreeElement.listItemElement.appendChild(headerCount);const shouldViewSource=paramsTreeElement[_viewSourceSymbol];if(shouldViewSource){this._appendParamsSource(title,params,sourceText,paramsTreeElement);}else{this._appendParamsParsed(title,params,sourceText,paramsTreeElement);}}
_appendParamsSource(title,params,sourceText,paramsTreeElement){this._populateTreeElementWithSourceText(paramsTreeElement,sourceText);const listItemElement=paramsTreeElement.listItemElement;const viewParsed=function(event){listItemElement.removeEventListener('contextmenu',viewParsedContextMenu);paramsTreeElement[_viewSourceSymbol]=false;this._refreshParams(title,params,sourceText,paramsTreeElement);event.consume();};const viewParsedContextMenu=function(event){if(!paramsTreeElement.expanded){return;}
const contextMenu=new UI.ContextMenu(event);contextMenu.newSection().appendItem(ls`View parsed`,viewParsed.bind(this,event));contextMenu.show();}.bind(this);const viewParsedButton=this._createViewSourceToggle(true,viewParsed.bind(this));listItemElement.appendChild(viewParsedButton);listItemElement.addEventListener('contextmenu',viewParsedContextMenu);}
_appendParamsParsed(title,params,sourceText,paramsTreeElement){for(let i=0;i<params.length;++i){const paramNameValue=createDocumentFragment();if(params[i].name!==''){const name=this._formatParameter(params[i].name+': ','header-name',this._decodeRequestParameters);const value=this._formatParameter(params[i].value,'header-value source-code',this._decodeRequestParameters);paramNameValue.appendChild(name);paramNameValue.createChild('span','header-separator');paramNameValue.appendChild(value);}else{paramNameValue.appendChild(this._formatParameter(Common.UIString('(empty)'),'empty-request-header',this._decodeRequestParameters));}
const paramTreeElement=new UI.TreeElement(paramNameValue);paramsTreeElement.appendChild(paramTreeElement);}
const listItemElement=paramsTreeElement.listItemElement;const viewSource=function(event){listItemElement.removeEventListener('contextmenu',viewSourceContextMenu);paramsTreeElement[_viewSourceSymbol]=true;this._refreshParams(title,params,sourceText,paramsTreeElement);event.consume();};const toggleURLDecoding=function(event){listItemElement.removeEventListener('contextmenu',viewSourceContextMenu);this._toggleURLDecoding(event);};const viewSourceContextMenu=function(event){if(!paramsTreeElement.expanded){return;}
const contextMenu=new UI.ContextMenu(event);const section=contextMenu.newSection();section.appendItem(ls`View source`,viewSource.bind(this,event));const viewURLEncodedText=this._decodeRequestParameters?ls`View URL encoded`:ls`View decoded`;section.appendItem(viewURLEncodedText,toggleURLDecoding.bind(this,event));contextMenu.show();}.bind(this);const viewSourceButton=this._createViewSourceToggle(false,viewSource.bind(this));listItemElement.appendChild(viewSourceButton);const toggleTitle=this._decodeRequestParameters?ls`view URL encoded`:ls`view decoded`;const toggleButton=this._createToggleButton(toggleTitle);toggleButton.addEventListener('click',toggleURLDecoding.bind(this),false);listItemElement.appendChild(toggleButton);listItemElement.addEventListener('contextmenu',viewSourceContextMenu);}
_refreshRequestJSONPayload(parsedObject,sourceText){const rootListItem=this._requestPayloadCategory;rootListItem.removeChildren();const rootListItemElement=rootListItem.listItemElement;rootListItemElement.removeChildren();rootListItemElement.createChild('div','selection fill');rootListItemElement.createTextChild(this._requestPayloadCategory.title);const shouldViewSource=rootListItem[_viewSourceSymbol];if(shouldViewSource){this._appendJSONPayloadSource(rootListItem,parsedObject,sourceText);}else{this._appendJSONPayloadParsed(rootListItem,parsedObject,sourceText);}}
_appendJSONPayloadSource(rootListItem,parsedObject,sourceText){const rootListItemElement=rootListItem.listItemElement;this._populateTreeElementWithSourceText(rootListItem,sourceText);const viewParsed=function(event){rootListItemElement.removeEventListener('contextmenu',viewParsedContextMenu);rootListItem[_viewSourceSymbol]=false;this._refreshRequestJSONPayload(parsedObject,sourceText);event.consume();};const viewParsedButton=this._createViewSourceToggle(true,viewParsed.bind(this));rootListItemElement.appendChild(viewParsedButton);const viewParsedContextMenu=function(event){if(!rootListItem.expanded){return;}
const contextMenu=new UI.ContextMenu(event);contextMenu.newSection().appendItem(ls`View parsed`,viewParsed.bind(this,event));contextMenu.show();}.bind(this);rootListItemElement.addEventListener('contextmenu',viewParsedContextMenu);}
_appendJSONPayloadParsed(rootListItem,parsedObject,sourceText){const object=(SDK.RemoteObject.fromLocalObject(parsedObject));const section=new ObjectUI.ObjectPropertiesSection.RootElement(object);section.title=object.description;section.expand();section.editable=false;rootListItem.childrenListElement.classList.add('source-code','object-properties-section');rootListItem.appendChild(section);const rootListItemElement=rootListItem.listItemElement;const viewSource=function(event){rootListItemElement.removeEventListener('contextmenu',viewSourceContextMenu);rootListItem[_viewSourceSymbol]=true;this._refreshRequestJSONPayload(parsedObject,sourceText);event.consume();};const viewSourceContextMenu=function(event){if(!rootListItem.expanded){return;}
const contextMenu=new UI.ContextMenu(event);contextMenu.newSection().appendItem(ls`View source`,viewSource.bind(this,event));contextMenu.show();}.bind(this);const viewSourceButton=this._createViewSourceToggle(false,viewSource.bind(this));rootListItemElement.appendChild(viewSourceButton);rootListItemElement.addEventListener('contextmenu',viewSourceContextMenu);}
_createViewSourceToggle(viewSource,handler){const viewSourceToggleTitle=viewSource?Common.UIString('view parsed'):Common.UIString('view source');const viewSourceToggleButton=this._createToggleButton(viewSourceToggleTitle);viewSourceToggleButton.addEventListener('click',handler,false);return viewSourceToggleButton;}
_toggleURLDecoding(event){this._decodeRequestParameters=!this._decodeRequestParameters;this._refreshQueryString();this._refreshFormData();event.consume();}
_refreshRequestHeaders(){const treeElement=this._requestHeadersCategory;const headers=this._request.requestHeaders().slice();headers.sort(function(a,b){return a.name.toLowerCase().compareTo(b.name.toLowerCase());});const headersText=this._request.requestHeadersText();if(this._showRequestHeadersText&&headersText){this._refreshHeadersText(Common.UIString('Request Headers'),headers.length,headersText,treeElement);}else{this._refreshHeaders(Common.UIString('Request Headers'),headers,treeElement,headersText===undefined);}
if(headersText){const toggleButton=this._createHeadersToggleButton(this._showRequestHeadersText);toggleButton.addEventListener('click',this._toggleRequestHeadersText.bind(this),false);treeElement.listItemElement.appendChild(toggleButton);}
this._refreshFormData();}
_refreshResponseHeaders(){const treeElement=this._responseHeadersCategory;const headers=this._request.sortedResponseHeaders.slice();const headersText=this._request.responseHeadersText;if(this._showResponseHeadersText){this._refreshHeadersText(Common.UIString('Response Headers'),headers.length,headersText,treeElement);}else{this._refreshHeaders(Common.UIString('Response Headers'),headers,treeElement,false,this._request.blockedResponseCookies());}
if(headersText){const toggleButton=this._createHeadersToggleButton(this._showResponseHeadersText);toggleButton.addEventListener('click',this._toggleResponseHeadersText.bind(this),false);treeElement.listItemElement.appendChild(toggleButton);}}
_refreshHTTPInformation(){const requestMethodElement=this._requestMethodItem;requestMethodElement.hidden=!this._request.statusCode;const statusCodeElement=this._statusCodeItem;statusCodeElement.hidden=!this._request.statusCode;if(this._request.statusCode){const statusCodeFragment=createDocumentFragment();statusCodeFragment.createChild('div','header-name').textContent=ls`Status Code`+': ';statusCodeFragment.createChild('span','header-separator');const statusCodeImage=statusCodeFragment.createChild('span','resource-status-image','dt-icon-label');statusCodeImage.title=this._request.statusCode+' '+this._request.statusText;if(this._request.statusCode<300||this._request.statusCode===304){statusCodeImage.type='smallicon-green-ball';}else if(this._request.statusCode<400){statusCodeImage.type='smallicon-orange-ball';}else{statusCodeImage.type='smallicon-red-ball';}
requestMethodElement.title=this._formatHeader(ls`Request Method`,this._request.requestMethod);const statusTextElement=statusCodeFragment.createChild('div','header-value source-code');let statusText=this._request.statusCode+' '+this._request.statusText;if(this._request.cachedInMemory()){statusText+=' '+ls`(from memory cache)`;statusTextElement.classList.add('status-from-cache');}else if(this._request.fetchedViaServiceWorker){statusText+=' '+ls`(from ServiceWorker)`;statusTextElement.classList.add('status-from-cache');}else if(this._request.redirectSource()&&this._request.redirectSource().signedExchangeInfo()&&!this._request.redirectSource().signedExchangeInfo().errors){statusText+=' '+ls`(from signed-exchange)`;statusTextElement.classList.add('status-from-cache');}else if(this._request.fromPrefetchCache()){statusText+=' '+ls`(from prefetch cache)`;statusTextElement.classList.add('status-from-cache');}else if(this._request.cached()){statusText+=' '+ls`(from disk cache)`;statusTextElement.classList.add('status-from-cache');}
statusTextElement.textContent=statusText;statusCodeElement.title=statusCodeFragment;}}
_refreshHeadersTitle(title,headersTreeElement,headersLength){headersTreeElement.listItemElement.removeChildren();headersTreeElement.listItemElement.createChild('div','selection fill');headersTreeElement.listItemElement.createTextChild(title);const headerCount=Common.UIString('\xA0(%d)',headersLength);headersTreeElement.listItemElement.createChild('span','header-count').textContent=headerCount;}
_refreshHeaders(title,headers,headersTreeElement,provisionalHeaders,blockedResponseCookies){headersTreeElement.removeChildren();const length=headers.length;this._refreshHeadersTitle(title,headersTreeElement,length);if(provisionalHeaders){const cautionText=Common.UIString('Provisional headers are shown');const cautionFragment=createDocumentFragment();cautionFragment.createChild('span','','dt-icon-label').type='smallicon-warning';cautionFragment.createChild('div','caution').textContent=cautionText;const cautionTreeElement=new UI.TreeElement(cautionFragment);headersTreeElement.appendChild(cautionTreeElement);}
const blockedCookieLineToReasons=new Map();if(blockedResponseCookies){blockedResponseCookies.forEach(blockedCookie=>{blockedCookieLineToReasons.set(blockedCookie.cookieLine,blockedCookie.blockedReasons);});}
headersTreeElement.hidden=!length&&!provisionalHeaders;for(let i=0;i<length;++i){const headerTreeElement=new UI.TreeElement(this._formatHeader(headers[i].name,headers[i].value));headerTreeElement[_headerNameSymbol]=headers[i].name;if(headers[i].name.toLowerCase()==='set-cookie'){const matchingBlockedReasons=blockedCookieLineToReasons.get(headers[i].value);if(matchingBlockedReasons){const icon=UI.Icon.create('smallicon-warning','');headerTreeElement.listItemElement.appendChild(icon);let titleText='';for(const blockedReason of matchingBlockedReasons){if(titleText){titleText+='\n';}
titleText+=SDK.NetworkRequest.setCookieBlockedReasonToUiString(blockedReason);}
icon.title=titleText;}}
headersTreeElement.appendChild(headerTreeElement);}}
_refreshHeadersText(title,count,headersText,headersTreeElement){this._populateTreeElementWithSourceText(headersTreeElement,headersText);this._refreshHeadersTitle(title,headersTreeElement,count);}
_refreshRemoteAddress(){const remoteAddress=this._request.remoteAddress();const treeElement=this._remoteAddressItem;treeElement.hidden=!remoteAddress;if(remoteAddress){treeElement.title=this._formatHeader(Common.UIString('Remote Address'),remoteAddress);}}
_refreshReferrerPolicy(){const referrerPolicy=this._request.referrerPolicy();const treeElement=this._referrerPolicyItem;treeElement.hidden=!referrerPolicy;if(referrerPolicy){treeElement.title=this._formatHeader(Common.UIString('Referrer Policy'),referrerPolicy);}}
_toggleRequestHeadersText(event){this._showRequestHeadersText=!this._showRequestHeadersText;this._refreshRequestHeaders();event.consume();}
_toggleResponseHeadersText(event){this._showResponseHeadersText=!this._showResponseHeadersText;this._refreshResponseHeaders();event.consume();}
_createToggleButton(title){const button=createElementWithClass('span','header-toggle');button.textContent=title;return button;}
_createHeadersToggleButton(isHeadersTextShown){const toggleTitle=isHeadersTextShown?Common.UIString('view parsed'):Common.UIString('view source');return this._createToggleButton(toggleTitle);}
_clearHighlight(){if(this._highlightedElement){this._highlightedElement.listItemElement.classList.remove('header-highlight');}
this._highlightedElement=null;}
_revealAndHighlight(category,name){this._clearHighlight();for(const element of category.children()){if(element[_headerNameSymbol]!==name){continue;}
this._highlightedElement=element;element.reveal();element.listItemElement.classList.add('header-highlight');return;}}
revealRequestHeader(header){this._revealAndHighlight(this._requestHeadersCategory,header);}
revealResponseHeader(header){this._revealAndHighlight(this._responseHeadersCategory,header);}}
export const _headerNameSymbol=Symbol('HeaderName');export const _viewSourceSymbol=Symbol('ViewSource');export class Category extends UI.TreeElement{constructor(root,name,title){super(title||'',true);this.toggleOnClick=true;this.hidden=true;this._expandedSetting=Common.settings.createSetting('request-info-'+name+'-category-expanded',true);this.expanded=this._expandedSetting.get();root.appendChild(this);}
createLeaf(){const leaf=new UI.TreeElement();this.appendChild(leaf);return leaf;}
onexpand(){this._expandedSetting.set(true);}
oncollapse(){this._expandedSetting.set(false);}}
self.Network=self.Network||{};Network=Network||{};Network.RequestHeadersView=RequestHeadersView;Network.RequestHeadersView._headerNameSymbol=_headerNameSymbol;Network.RequestHeadersView._viewSourceSymbol=_viewSourceSymbol;Network.RequestHeadersView.Category=Category;