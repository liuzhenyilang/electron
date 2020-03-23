export default class RequestCookiesView extends UI.Widget{constructor(request){super();this.registerRequiredCSS('network/requestCookiesView.css');this.element.classList.add('request-cookies-view');this._request=request;this._detailedRequestCookies=null;this._showFilteredOutCookiesSetting=Common.settings.createSetting('show-filtered-out-request-cookies',false);this._emptyWidget=new UI.EmptyWidget(Common.UIString('This request has no cookies.'));this._emptyWidget.show(this.element);this._requestCookiesTitle=this.element.createChild('div');const titleText=this._requestCookiesTitle.createChild('span','request-cookies-title');titleText.textContent=ls`Request Cookies`;titleText.title=ls`Cookies that were sent to the server in the 'cookie' header of the request`;const requestCookiesCheckbox=UI.SettingsUI.createSettingCheckbox(ls`show filtered out request cookies`,this._showFilteredOutCookiesSetting,true);requestCookiesCheckbox.checkboxElement.addEventListener('change',()=>{this._refreshRequestCookiesView();});this._requestCookiesTitle.appendChild(requestCookiesCheckbox);this._requestCookiesEmpty=this.element.createChild('div','cookies-panel-item');this._requestCookiesEmpty.textContent=ls`No request cookies were sent.`;this._requestCookiesTable=new CookieTable.CookiesTable(true);this._requestCookiesTable.contentElement.classList.add('cookie-table','cookies-panel-item');this._requestCookiesTable.show(this.element);this._responseCookiesTitle=this.element.createChild('div','request-cookies-title');this._responseCookiesTitle.textContent=ls`Response Cookies`;this._responseCookiesTitle.title=ls`Cookies that were received from the server in the 'set-cookie' header of the response`;this._responseCookiesTable=new CookieTable.CookiesTable(true);this._responseCookiesTable.contentElement.classList.add('cookie-table','cookies-panel-item');this._responseCookiesTable.show(this.element);this._malformedResponseCookiesTitle=this.element.createChild('div','request-cookies-title');this._malformedResponseCookiesTitle.textContent=ls`Malformed Response Cookies`;this._malformedResponseCookiesTitle.title=ls`Cookies that were received from the server in the 'set-cookie' header of the response but were malformed`;this._malformedResponseCookiesList=this.element.createChild('div');}
_getRequestCookies(){let requestCookies=[];const requestCookieToBlockedReasons=new Map();if(this._request.requestCookies){requestCookies=this._request.requestCookies.slice();if(this._detailedRequestCookies){requestCookies=requestCookies.map(cookie=>{for(const detailedCookie of(this._detailedRequestCookies||[])){if(detailedCookie.name()===cookie.name()&&detailedCookie.value()===cookie.value()){return detailedCookie;}}
return cookie;});}else{const networkManager=SDK.NetworkManager.forRequest(this._request);if(networkManager){const cookieModel=networkManager.target().model(SDK.CookieModel);if(cookieModel){cookieModel.getCookies([this._request.url()]).then(cookies=>{this._detailedRequestCookies=cookies;this._refreshRequestCookiesView();});}}}}
if(this._showFilteredOutCookiesSetting.get()){for(const blockedCookie of this._request.blockedRequestCookies()){requestCookieToBlockedReasons.set(blockedCookie.cookie,blockedCookie.blockedReasons.map(blockedReason=>{return{attribute:SDK.NetworkRequest.cookieBlockedReasonToAttribute(blockedReason),uiString:SDK.NetworkRequest.cookieBlockedReasonToUiString(blockedReason)};}));requestCookies.push(blockedCookie.cookie);}}
return{requestCookies,requestCookieToBlockedReasons};}
_getResponseCookies(){let responseCookies=[];const responseCookieToBlockedReasons=new Map();const malformedResponseCookies=[];if(this._request.responseCookies){const blockedCookieLines=this._request.blockedResponseCookies().map(blockedCookie=>blockedCookie.cookieLine);responseCookies=this._request.responseCookies.filter(cookie=>{if(blockedCookieLines.includes(cookie.getCookieLine())){blockedCookieLines.remove(cookie.getCookieLine(),true);return false;}
return true;});for(const blockedCookie of this._request.blockedResponseCookies()){const parsedCookies=SDK.CookieParser.parseSetCookie(blockedCookie.cookieLine);if(!parsedCookies.length||blockedCookie.blockedReasons.includes(Protocol.Network.SetCookieBlockedReason.SyntaxError)){malformedResponseCookies.push(blockedCookie);continue;}
const cookie=parsedCookies[0];responseCookieToBlockedReasons.set(cookie,blockedCookie.blockedReasons.map(blockedReason=>{return{attribute:SDK.NetworkRequest.setCookieBlockedReasonToAttribute(blockedReason),uiString:SDK.NetworkRequest.setCookieBlockedReasonToUiString(blockedReason)};}));responseCookies.push(cookie);}}
return{responseCookies,responseCookieToBlockedReasons,malformedResponseCookies};}
_refreshRequestCookiesView(){if(!this.isShowing()){return;}
const{requestCookies,requestCookieToBlockedReasons}=this._getRequestCookies();const{responseCookies,responseCookieToBlockedReasons,malformedResponseCookies}=this._getResponseCookies();if(requestCookies.length){this._requestCookiesTitle.classList.remove('hidden');this._requestCookiesEmpty.classList.add('hidden');this._requestCookiesTable.showWidget();this._requestCookiesTable.setCookies(requestCookies,requestCookieToBlockedReasons);}else if(this._request.blockedRequestCookies().length){this._requestCookiesTitle.classList.remove('hidden');this._requestCookiesEmpty.classList.remove('hidden');this._requestCookiesTable.hideWidget();}else{this._requestCookiesTitle.classList.add('hidden');this._requestCookiesEmpty.classList.add('hidden');this._requestCookiesTable.hideWidget();}
if(responseCookies.length){this._responseCookiesTitle.classList.remove('hidden');this._responseCookiesTable.showWidget();this._responseCookiesTable.setCookies(responseCookies,responseCookieToBlockedReasons);}else{this._responseCookiesTitle.classList.add('hidden');this._responseCookiesTable.hideWidget();}
if(malformedResponseCookies.length){this._malformedResponseCookiesTitle.classList.remove('hidden');this._malformedResponseCookiesList.classList.remove('hidden');this._malformedResponseCookiesList.removeChildren();for(const malformedCookie of malformedResponseCookies){const listItem=this._malformedResponseCookiesList.createChild('span','cookie-line source-code');const icon=UI.Icon.create('smallicon-error','cookie-warning-icon');listItem.appendChild(icon);listItem.createTextChild(malformedCookie.cookieLine);listItem.title=SDK.NetworkRequest.setCookieBlockedReasonToUiString(Protocol.Network.SetCookieBlockedReason.SyntaxError);}}else{this._malformedResponseCookiesTitle.classList.add('hidden');this._malformedResponseCookiesList.classList.add('hidden');}}
wasShown(){this._request.addEventListener(SDK.NetworkRequest.Events.RequestHeadersChanged,this._cookiesUpdated,this);this._request.addEventListener(SDK.NetworkRequest.Events.ResponseHeadersChanged,this._cookiesUpdated,this);if(this._gotCookies()){this._refreshRequestCookiesView();this._emptyWidget.hideWidget();}else{this._emptyWidget.showWidget();}}
willHide(){this._request.removeEventListener(SDK.NetworkRequest.Events.RequestHeadersChanged,this._cookiesUpdated,this);this._request.removeEventListener(SDK.NetworkRequest.Events.ResponseHeadersChanged,this._cookiesUpdated,this);}
_gotCookies(){return!!(this._request.requestCookies&&this._request.requestCookies.length)||!!(this._request.responseCookies&&this._request.responseCookies.length);}
_cookiesUpdated(){if(!this.isShowing()){return;}
if(this._gotCookies()){this._refreshRequestCookiesView();this._emptyWidget.hideWidget();}else{this._emptyWidget.showWidget();}}}
self.Network=self.Network||{};Network=Network||{};Network.RequestCookiesView=RequestCookiesView;