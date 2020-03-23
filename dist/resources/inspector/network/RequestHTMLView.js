export default class RequestHTMLView extends UI.VBox{constructor(dataURL){super(true);this.registerRequiredCSS('network/requestHTMLView.css');this._dataURL=encodeURI(dataURL).replace(/#/g,'%23');this.contentElement.classList.add('html','request-view');}
wasShown(){this._createIFrame();}
willHide(){this.contentElement.removeChildren();}
_createIFrame(){this.contentElement.removeChildren();const iframe=createElement('iframe');iframe.className='html-preview-frame';iframe.setAttribute('sandbox','');iframe.setAttribute('src',this._dataURL);iframe.setAttribute('tabIndex',-1);UI.ARIAUtils.markAsPresentation(iframe);this.contentElement.appendChild(iframe);}}
self.Network=self.Network||{};Network=Network||{};Network.RequestHTMLView=RequestHTMLView;