export class PropertiesWidget extends UI.ThrottledWidget{constructor(){super(true);this.registerRequiredCSS('elements/propertiesWidget.css');SDK.targetManager.addModelListener(SDK.DOMModel,SDK.DOMModel.Events.AttrModified,this._onNodeChange,this);SDK.targetManager.addModelListener(SDK.DOMModel,SDK.DOMModel.Events.AttrRemoved,this._onNodeChange,this);SDK.targetManager.addModelListener(SDK.DOMModel,SDK.DOMModel.Events.CharacterDataModified,this._onNodeChange,this);SDK.targetManager.addModelListener(SDK.DOMModel,SDK.DOMModel.Events.ChildNodeCountUpdated,this._onNodeChange,this);UI.context.addFlavorChangeListener(SDK.DOMNode,this._setNode,this);this._node=UI.context.flavor(SDK.DOMNode);this._treeOutline=new ObjectUI.ObjectPropertiesSectionsTreeOutline({readOnly:true});this._treeOutline.setShowSelectionOnKeyboardFocus(true,false);this._expandController=new ObjectUI.ObjectPropertiesSectionsTreeExpandController(this._treeOutline);this.contentElement.appendChild(this._treeOutline.element);this._treeOutline.addEventListener(UI.TreeOutline.Events.ElementExpanded,()=>{Host.userMetrics.actionTaken(Host.UserMetrics.Action.DOMPropertiesExpanded);});this.update();}
_setNode(event){this._node=(event.data);this.update();}
async doUpdate(){if(this._lastRequestedNode){this._lastRequestedNode.domModel().runtimeModel().releaseObjectGroup(_objectGroupName);delete this._lastRequestedNode;}
if(!this._node){this.contentElement.removeChildren();return;}
this._lastRequestedNode=this._node;const object=await this._node.resolveToObject(_objectGroupName);if(!object){return;}
const result=await object.callFunction(protoList);object.release();if(!result.object||result.wasThrown){return;}
const propertiesResult=await result.object.getOwnProperties(false);result.object.release();if(!propertiesResult||!propertiesResult.properties){return;}
const properties=propertiesResult.properties;this._treeOutline.removeChildren();let selected=false;for(let i=0;i<properties.length;++i){if(!parseInt(properties[i].name,10)){continue;}
const property=properties[i].value;let title=property.description;title=title.replace(/Prototype$/,'');const section=this._createSectionTreeElement(property,title);this._treeOutline.appendChild(section);if(!selected){section.select(true,false);selected=true;}}
function protoList(){let proto=this;const result={__proto__:null};let counter=1;while(proto){result[counter++]=proto;proto=proto.__proto__;}
return result;}}
_createSectionTreeElement(property,title){const titleElement=createElementWithClass('span','tree-element-title');titleElement.textContent=title;const section=new ObjectUI.ObjectPropertiesSection.RootElement(property);section.title=titleElement;this._expandController.watchSection(title,section);return section;}
_onNodeChange(event){if(!this._node){return;}
const data=event.data;const node=(data instanceof SDK.DOMNode?data:data.node);if(this._node!==node){return;}
this.update();}}
export const _objectGroupName='properties-sidebar-pane';