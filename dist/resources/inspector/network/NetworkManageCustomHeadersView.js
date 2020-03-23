export default class NetworkManageCustomHeadersView extends UI.VBox{constructor(columnData,addHeaderColumnCallback,changeHeaderColumnCallback,removeHeaderColumnCallback){super(true);this.registerRequiredCSS('network/networkManageCustomHeadersView.css');this.contentElement.classList.add('custom-headers-wrapper');this.contentElement.createChild('div','header').textContent=Common.UIString('Manage Header Columns');this._list=new UI.ListWidget(this);this._list.element.classList.add('custom-headers-list');this._list.registerRequiredCSS('network/networkManageCustomHeadersView.css');const placeholder=createElementWithClass('div','custom-headers-list-list-empty');placeholder.textContent=Common.UIString('No custom headers');this._list.setEmptyPlaceholder(placeholder);this._list.show(this.contentElement);this.contentElement.appendChild(UI.createTextButton(Common.UIString('Add custom header\u2026'),this._addButtonClicked.bind(this),'add-button'));this._columnConfigs=new Map();columnData.forEach(columnData=>this._columnConfigs.set(columnData.title.toLowerCase(),columnData));this._addHeaderColumnCallback=addHeaderColumnCallback;this._changeHeaderColumnCallback=changeHeaderColumnCallback;this._removeHeaderColumnCallback=removeHeaderColumnCallback;this.contentElement.tabIndex=0;}
wasShown(){this._headersUpdated();}
_headersUpdated(){this._list.clear();this._columnConfigs.forEach(headerData=>this._list.appendItem({header:headerData.title},headerData.editable));}
_addButtonClicked(){this._list.addNewItem(this._columnConfigs.size,{header:''});}
renderItem(item,editable){const element=createElementWithClass('div','custom-headers-list-item');const header=element.createChild('div','custom-header-name');header.textContent=item.header;header.title=item.header;return element;}
removeItemRequested(item,index){this._removeHeaderColumnCallback(item.header);this._columnConfigs.delete(item.header.toLowerCase());this._headersUpdated();}
commitEdit(item,editor,isNew){const headerId=editor.control('header').value.trim();let success;if(isNew){success=this._addHeaderColumnCallback(headerId);}else{success=this._changeHeaderColumnCallback(item.header,headerId);}
if(success&&!isNew){this._columnConfigs.delete(item.header.toLowerCase());}
if(success){this._columnConfigs.set(headerId.toLowerCase(),{title:headerId,editable:true});}
this._headersUpdated();}
beginEdit(item){const editor=this._createEditor();editor.control('header').value=item.header;return editor;}
_createEditor(){if(this._editor){return this._editor;}
const editor=new UI.ListWidget.Editor();this._editor=editor;const content=editor.contentElement();const titles=content.createChild('div','custom-headers-edit-row');titles.createChild('div','custom-headers-header').textContent=Common.UIString('Header Name');const fields=content.createChild('div','custom-headers-edit-row');fields.createChild('div','custom-headers-header').appendChild(editor.createInput('header','text','x-custom-header',validateHeader.bind(this)));return editor;function validateHeader(item,index,input){let valid=true;const headerId=editor.control('header').value.trim().toLowerCase();if(this._columnConfigs.has(headerId)&&item.header!==headerId){valid=false;}
return{valid};}}}
self.Network=self.Network||{};Network=Network||{};Network.NetworkManageCustomHeadersView=NetworkManageCustomHeadersView;