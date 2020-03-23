export default class NetworkFrameGrouper{constructor(parentView){this._parentView=parentView;this._activeGroups=new Map();}
groupNodeForRequest(request){const frame=SDK.ResourceTreeModel.frameForRequest(request);if(!frame||frame.isTopFrame()){return null;}
let groupNode=this._activeGroups.get(frame);if(groupNode){return groupNode;}
groupNode=new FrameGroupNode(this._parentView,frame);this._activeGroups.set(frame,groupNode);return groupNode;}
reset(){this._activeGroups.clear();}}
export class FrameGroupNode extends Network.NetworkGroupNode{constructor(parentView,frame){super(parentView);this._frame=frame;}
displayName(){return new Common.ParsedURL(this._frame.url).domain()||this._frame.name||'<iframe>';}
renderCell(cell,columnId){super.renderCell(cell,columnId);const columnIndex=this.dataGrid.indexOfVisibleColumn(columnId);if(columnIndex===0){const name=this.displayName();cell.appendChild(UI.Icon.create('largeicon-navigator-frame','network-frame-group-icon'));cell.createTextChild(name);cell.title=name;}}}
self.Network=self.Network||{};Network=Network||{};Network.NetworkFrameGrouper=NetworkFrameGrouper;Network.FrameGroupNode=FrameGroupNode;