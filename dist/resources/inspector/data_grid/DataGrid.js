export default class DataGridImpl extends Common.Object{constructor(columnsArray,editCallback,deleteCallback,refreshCallback){super();this.element=createElementWithClass('div','data-grid');UI.appendStyle(this.element,'data_grid/dataGrid.css');this.element.tabIndex=0;this.element.addEventListener('keydown',this._keyDown.bind(this),false);this.element.addEventListener('contextmenu',this._contextMenu.bind(this),true);this._editCallback=editCallback;this._deleteCallback=deleteCallback;this._refreshCallback=refreshCallback;const headerContainer=this.element.createChild('div','header-container');this._headerTable=headerContainer.createChild('table','header');this._headerTableHeaders={};this._scrollContainer=this.element.createChild('div','data-container');this._dataTable=this._scrollContainer.createChild('table','data');if(editCallback){this._dataTable.addEventListener('dblclick',this._ondblclick.bind(this),false);}
this._dataTable.addEventListener('mousedown',this._mouseDownInDataTable.bind(this));this._dataTable.addEventListener('click',this._clickInDataTable.bind(this),true);this._inline=false;this._columnsArray=[];this._columns={};this._visibleColumnsArray=columnsArray;columnsArray.forEach(column=>this._innerAddColumn(column));this._cellClass=null;this._headerTableColumnGroup=this._headerTable.createChild('colgroup');this._headerTableBody=this._headerTable.createChild('tbody');this._headerRow=this._headerTableBody.createChild('tr');this._dataTableColumnGroup=this._dataTable.createChild('colgroup');this.dataTableBody=this._dataTable.createChild('tbody');this._topFillerRow=this.dataTableBody.createChild('tr','data-grid-filler-row revealed');this._bottomFillerRow=this.dataTableBody.createChild('tr','data-grid-filler-row revealed');this.setVerticalPadding(0,0);this._refreshHeader();this._editing=false;this.selectedNode=null;this.expandNodesWhenArrowing=false;this.setRootNode((new DataGridNode()));this.setHasSelection(false);this.indentWidth=15;this._resizers=[];this._columnWidthsInitialized=false;this._cornerWidth=CornerWidth;this._resizeMethod=ResizeMethod.Nearest;this._headerContextMenuCallback=null;this._rowContextMenuCallback=null;}
_firstSelectableNode(){let firstSelectableNode=this._rootNode;while(firstSelectableNode&&!firstSelectableNode.selectable){firstSelectableNode=firstSelectableNode.traverseNextNode(true);}
return firstSelectableNode;}
_lastSelectableNode(){let lastSelectableNode=this._rootNode;let iterator=this._rootNode;while(iterator){if(iterator.selectable){lastSelectableNode=iterator;}
iterator=iterator.traverseNextNode(true);}
return lastSelectableNode;}
static setElementText(element,newText,longText){if(longText&&newText.length>1000){element.textContent=newText.trimEndWithMaxLength(1000);element.title=newText;element[DataGrid._longTextSymbol]=newText;}else{element.textContent=newText;element.title='';element[DataGrid._longTextSymbol]=undefined;}}
setStriped(isStriped){this.element.classList.toggle('striped-data-grid',isStriped);}
setFocusable(focusable){this.element.tabIndex=focusable?0:-1;}
setHasSelection(hasSelected){this.element.classList.toggle('no-selection',!hasSelected);}
headerTableBody(){return this._headerTableBody;}
_innerAddColumn(column,position){const columnId=column.id;if(columnId in this._columns){this._innerRemoveColumn(columnId);}
if(position===undefined){position=this._columnsArray.length;}
this._columnsArray.splice(position,0,column);this._columns[columnId]=column;if(column.disclosure){this.disclosureColumnId=columnId;}
const cell=createElement('th');cell.className=columnId+'-column';cell[DataGrid._columnIdSymbol]=columnId;this._headerTableHeaders[columnId]=cell;const div=createElement('div');if(column.titleDOMFragment){div.appendChild(column.titleDOMFragment);}else{div.textContent=column.title;}
cell.appendChild(div);if(column.sort){cell.classList.add(column.sort);this._sortColumnCell=cell;}
if(column.sortable){cell.addEventListener('click',this._clickInHeaderCell.bind(this),false);cell.classList.add('sortable');const icon=UI.Icon.create('','sort-order-icon');cell.createChild('div','sort-order-icon-container').appendChild(icon);cell[DataGrid._sortIconSymbol]=icon;}}
addColumn(column,position){this._innerAddColumn(column,position);}
_innerRemoveColumn(columnId){const column=this._columns[columnId];if(!column){return;}
delete this._columns[columnId];const index=this._columnsArray.findIndex(columnConfig=>columnConfig.id===columnId);this._columnsArray.splice(index,1);const cell=this._headerTableHeaders[columnId];if(cell.parentElement){cell.parentElement.removeChild(cell);}
delete this._headerTableHeaders[columnId];}
removeColumn(columnId){this._innerRemoveColumn(columnId);}
setCellClass(cellClass){this._cellClass=cellClass;}
_refreshHeader(){this._headerTableColumnGroup.removeChildren();this._dataTableColumnGroup.removeChildren();this._headerRow.removeChildren();this._topFillerRow.removeChildren();this._bottomFillerRow.removeChildren();for(let i=0;i<this._visibleColumnsArray.length;++i){const column=this._visibleColumnsArray[i];const columnId=column.id;const headerColumn=this._headerTableColumnGroup.createChild('col');const dataColumn=this._dataTableColumnGroup.createChild('col');if(column.width){headerColumn.style.width=column.width;dataColumn.style.width=column.width;}
this._headerRow.appendChild(this._headerTableHeaders[columnId]);const topFillerRowCell=this._topFillerRow.createChild('th','top-filler-td');topFillerRowCell.textContent=column.title;topFillerRowCell.scope='col';this._bottomFillerRow.createChild('td','bottom-filler-td')[DataGrid._columnIdSymbol]=columnId;}
this._headerRow.createChild('th','corner');const topFillerRowCornerCell=this._topFillerRow.createChild('th','corner');topFillerRowCornerCell.classList.add('top-filler-td');topFillerRowCornerCell.scope='col';this._bottomFillerRow.createChild('td','corner').classList.add('bottom-filler-td');this._headerTableColumnGroup.createChild('col','corner');this._dataTableColumnGroup.createChild('col','corner');}
setVerticalPadding(top,bottom){const topPx=top+'px';const bottomPx=(top||bottom)?bottom+'px':'auto';if(this._topFillerRow.style.height===topPx&&this._bottomFillerRow.style.height===bottomPx){return;}
this._topFillerRow.style.height=topPx;this._bottomFillerRow.style.height=bottomPx;this.dispatchEventToListeners(Events.PaddingChanged);}
setRootNode(rootNode){if(this._rootNode){this._rootNode.removeChildren();this._rootNode.dataGrid=null;this._rootNode._isRoot=false;}
this._rootNode=rootNode;rootNode._isRoot=true;rootNode.setHasChildren(false);rootNode._expanded=true;rootNode._revealed=true;rootNode.selectable=false;rootNode.dataGrid=this;}
rootNode(){return this._rootNode;}
_ondblclick(event){if(this._editing||this._editingNode){return;}
const columnId=this.columnIdFromNode((event.target));if(!columnId||!this._columns[columnId].editable){return;}
this._startEditing((event.target));}
_startEditingColumnOfDataGridNode(node,cellIndex){this._editing=true;this._editingNode=node;this._editingNode.select();const element=this._editingNode._element.children[cellIndex];UI.InplaceEditor.startEditing(element,this._startEditingConfig(element));element.getComponentSelection().selectAllChildren(element);}
startEditingNextEditableColumnOfDataGridNode(node,columnIdentifier){const column=this._columns[columnIdentifier];const cellIndex=this._visibleColumnsArray.indexOf(column);const nextEditableColumn=this._nextEditableColumn(cellIndex);if(nextEditableColumn!==-1){this._startEditingColumnOfDataGridNode(node,nextEditableColumn);}}
_startEditing(target){const element=(target.enclosingNodeOrSelfWithNodeName('td'));if(!element){return;}
this._editingNode=this.dataGridNodeFromNode(target);if(!this._editingNode){if(!this.creationNode){return;}
this._editingNode=this.creationNode;}
if(this._editingNode.isCreationNode){this._startEditingColumnOfDataGridNode(this._editingNode,this._nextEditableColumn(-1));return;}
this._editing=true;if(element[DataGrid._longTextSymbol]){element.textContent=element[DataGrid._longTextSymbol];}
UI.InplaceEditor.startEditing(element,this._startEditingConfig(element));element.getComponentSelection().selectAllChildren(element);}
renderInline(){this.element.classList.add('inline');this._cornerWidth=0;this._inline=true;this.updateWidths();}
_startEditingConfig(element){return new UI.InplaceEditor.Config(this._editingCommitted.bind(this),this._editingCancelled.bind(this));}
_editingCommitted(element,newText,oldText,context,moveDirection){const columnId=this.columnIdFromNode(element);if(!columnId){this._editingCancelled(element);return;}
const column=this._columns[columnId];const cellIndex=this._visibleColumnsArray.indexOf(column);const textBeforeEditing=(this._editingNode.data[columnId]||'');const currentEditingNode=this._editingNode;function moveToNextIfNeeded(wasChange){if(!moveDirection){return;}
if(moveDirection==='forward'){const firstEditableColumn=this._nextEditableColumn(-1);if(currentEditingNode.isCreationNode&&cellIndex===firstEditableColumn&&!wasChange){return;}
const nextEditableColumn=this._nextEditableColumn(cellIndex);if(nextEditableColumn!==-1){this._startEditingColumnOfDataGridNode(currentEditingNode,nextEditableColumn);return;}
const nextDataGridNode=currentEditingNode.traverseNextNode(true,null,true);if(nextDataGridNode){this._startEditingColumnOfDataGridNode(nextDataGridNode,firstEditableColumn);return;}
if(currentEditingNode.isCreationNode&&wasChange){this.addCreationNode(false);this._startEditingColumnOfDataGridNode(this.creationNode,firstEditableColumn);return;}
return;}
if(moveDirection==='backward'){const prevEditableColumn=this._nextEditableColumn(cellIndex,true);if(prevEditableColumn!==-1){this._startEditingColumnOfDataGridNode(currentEditingNode,prevEditableColumn);return;}
const lastEditableColumn=this._nextEditableColumn(this._visibleColumnsArray.length,true);const nextDataGridNode=currentEditingNode.traversePreviousNode(true,true);if(nextDataGridNode){this._startEditingColumnOfDataGridNode(nextDataGridNode,lastEditableColumn);}
return;}}
DataGrid.DataGrid.setElementText(element,newText,!!column.longText);if(textBeforeEditing===newText){this._editingCancelled(element);moveToNextIfNeeded.call(this,false);return;}
this._editingNode.data[columnId]=newText;this._editCallback(this._editingNode,columnId,textBeforeEditing,newText);if(this._editingNode.isCreationNode){this.addCreationNode(false);}
this._editingCancelled(element);moveToNextIfNeeded.call(this,true);}
_editingCancelled(element){this._editing=false;this._editingNode=null;}
_nextEditableColumn(cellIndex,moveBackward){const increment=moveBackward?-1:1;const columns=this._visibleColumnsArray;for(let i=cellIndex+increment;(i>=0)&&(i<columns.length);i+=increment){if(columns[i].editable){return i;}}
return-1;}
sortColumnId(){if(!this._sortColumnCell){return null;}
return this._sortColumnCell[DataGrid._columnIdSymbol];}
sortOrder(){if(!this._sortColumnCell||this._sortColumnCell.classList.contains(Order.Ascending)){return Order.Ascending;}
if(this._sortColumnCell.classList.contains(Order.Descending)){return Order.Descending;}
return null;}
isSortOrderAscending(){return!this._sortColumnCell||this._sortColumnCell.classList.contains(Order.Ascending);}
_autoSizeWidths(widths,minPercent,maxPercent){if(minPercent){minPercent=Math.min(minPercent,Math.floor(100/widths.length));}
let totalWidth=0;for(let i=0;i<widths.length;++i){totalWidth+=widths[i];}
let totalPercentWidth=0;for(let i=0;i<widths.length;++i){let width=Math.round(100*widths[i]/totalWidth);if(minPercent&&width<minPercent){width=minPercent;}else if(maxPercent&&width>maxPercent){width=maxPercent;}
totalPercentWidth+=width;widths[i]=width;}
let recoupPercent=totalPercentWidth-100;while(minPercent&&recoupPercent>0){for(let i=0;i<widths.length;++i){if(widths[i]>minPercent){--widths[i];--recoupPercent;if(!recoupPercent){break;}}}}
while(maxPercent&&recoupPercent<0){for(let i=0;i<widths.length;++i){if(widths[i]<maxPercent){++widths[i];++recoupPercent;if(!recoupPercent){break;}}}}
return widths;}
autoSizeColumns(minPercent,maxPercent,maxDescentLevel){let widths=[];for(let i=0;i<this._columnsArray.length;++i){widths.push((this._columnsArray[i].title||'').length);}
maxDescentLevel=maxDescentLevel||0;const children=this._enumerateChildren(this._rootNode,[],maxDescentLevel+1);for(let i=0;i<children.length;++i){const node=children[i];for(let j=0;j<this._columnsArray.length;++j){const text=String(node.data[this._columnsArray[j].id]);if(text.length>widths[j]){widths[j]=text.length;}}}
widths=this._autoSizeWidths(widths,minPercent,maxPercent);for(let i=0;i<this._columnsArray.length;++i){this._columnsArray[i].weight=widths[i];}
this._columnWidthsInitialized=false;this.updateWidths();}
_enumerateChildren(rootNode,result,maxLevel){if(!rootNode._isRoot){result.push(rootNode);}
if(!maxLevel){return[];}
for(let i=0;i<rootNode.children.length;++i){this._enumerateChildren(rootNode.children[i],result,maxLevel-1);}
return result;}
onResize(){this.updateWidths();}
updateWidths(){if(!this._columnWidthsInitialized&&this.element.offsetWidth){const tableWidth=this.element.offsetWidth-this._cornerWidth;const cells=this._headerTableBody.rows[0].cells;const numColumns=cells.length-1;for(let i=0;i<numColumns;i++){const column=this._visibleColumnsArray[i];if(!column.weight){column.weight=100*cells[i].offsetWidth/tableWidth||10;}}
this._columnWidthsInitialized=true;}
this._applyColumnWeights();}
indexOfVisibleColumn(columnId){return this._visibleColumnsArray.findIndex(column=>column.id===columnId);}
setName(name){this._columnWeightsSetting=Common.settings.createSetting('dataGrid-'+name+'-columnWeights',{});this._loadColumnWeights();}
_loadColumnWeights(){if(!this._columnWeightsSetting){return;}
const weights=this._columnWeightsSetting.get();for(let i=0;i<this._columnsArray.length;++i){const column=this._columnsArray[i];const weight=weights[column.id];if(weight){column.weight=weight;}}
this._applyColumnWeights();}
_saveColumnWeights(){if(!this._columnWeightsSetting){return;}
const weights={};for(let i=0;i<this._columnsArray.length;++i){const column=this._columnsArray[i];weights[column.id]=column.weight;}
this._columnWeightsSetting.set(weights);}
wasShown(){this._loadColumnWeights();}
willHide(){}
_applyColumnWeights(){let tableWidth=this.element.offsetWidth-this._cornerWidth;if(tableWidth<=0){return;}
let sumOfWeights=0.0;const fixedColumnWidths=[];for(let i=0;i<this._visibleColumnsArray.length;++i){const column=this._visibleColumnsArray[i];if(column.fixedWidth){const width=this._headerTableColumnGroup.children[i][DataGrid._preferredWidthSymbol]||this._headerTableBody.rows[0].cells[i].offsetWidth;fixedColumnWidths[i]=width;tableWidth-=width;}else{sumOfWeights+=this._visibleColumnsArray[i].weight;}}
let sum=0;let lastOffset=0;for(let i=0;i<this._visibleColumnsArray.length;++i){const column=this._visibleColumnsArray[i];let width;if(column.fixedWidth){width=fixedColumnWidths[i];}else{sum+=column.weight;const offset=(sum*tableWidth/sumOfWeights)|0;width=offset-lastOffset;lastOffset=offset;}
this._setPreferredWidth(i,width);}
this._positionResizers();}
setColumnsVisiblity(columnsVisibility){this._visibleColumnsArray=[];for(let i=0;i<this._columnsArray.length;++i){const column=this._columnsArray[i];if(columnsVisibility[column.id]){this._visibleColumnsArray.push(column);}}
this._refreshHeader();this._applyColumnWeights();const nodes=this._enumerateChildren(this.rootNode(),[],-1);for(let i=0;i<nodes.length;++i){nodes[i].refresh();}}
get scrollContainer(){return this._scrollContainer;}
_positionResizers(){const headerTableColumns=this._headerTableColumnGroup.children;const numColumns=headerTableColumns.length-1;const left=[];const resizers=this._resizers;while(resizers.length>numColumns-1){resizers.pop().remove();}
for(let i=0;i<numColumns-1;i++){left[i]=(left[i-1]||0)+this._headerTableBody.rows[0].cells[i].offsetWidth;}
for(let i=0;i<numColumns-1;i++){let resizer=resizers[i];if(!resizer){resizer=createElement('div');resizer.__index=i;resizer.classList.add('data-grid-resizer');UI.installDragHandle(resizer,this._startResizerDragging.bind(this),this._resizerDragging.bind(this),this._endResizerDragging.bind(this),'col-resize');this.element.appendChild(resizer);resizers.push(resizer);}
if(resizer.__position!==left[i]){resizer.__position=left[i];resizer.style.left=left[i]+'px';}}}
addCreationNode(hasChildren){if(this.creationNode){this.creationNode.makeNormal();}
const emptyData={};for(const column in this._columns){emptyData[column]=null;}
this.creationNode=new DataGrid.CreationDataGridNode(emptyData,hasChildren);this.rootNode().appendChild(this.creationNode);}
_keyDown(event){if(event.shiftKey||event.metaKey||event.ctrlKey||this._editing||UI.isEditing()){return;}
let handled=false;let nextSelectedNode;if(!this.selectedNode){if(event.key==='ArrowUp'&&!event.altKey){nextSelectedNode=this._lastSelectableNode();}else if(event.key==='ArrowDown'&&!event.altKey){nextSelectedNode=this._firstSelectableNode();}
handled=nextSelectedNode?true:false;}else if(event.key==='ArrowUp'&&!event.altKey){nextSelectedNode=this.selectedNode.traversePreviousNode(true);while(nextSelectedNode&&!nextSelectedNode.selectable){nextSelectedNode=nextSelectedNode.traversePreviousNode(true);}
handled=nextSelectedNode?true:false;}else if(event.key==='ArrowDown'&&!event.altKey){nextSelectedNode=this.selectedNode.traverseNextNode(true);while(nextSelectedNode&&!nextSelectedNode.selectable){nextSelectedNode=nextSelectedNode.traverseNextNode(true);}
handled=nextSelectedNode?true:false;}else if(event.key==='ArrowLeft'){if(this.selectedNode.expanded){if(event.altKey){this.selectedNode.collapseRecursively();}else{this.selectedNode.collapse();}
handled=true;}else if(this.selectedNode.parent&&!this.selectedNode.parent._isRoot){handled=true;if(this.selectedNode.parent.selectable){nextSelectedNode=this.selectedNode.parent;handled=nextSelectedNode?true:false;}else if(this.selectedNode.parent){this.selectedNode.parent.collapse();}}}else if(event.key==='ArrowRight'){if(!this.selectedNode.revealed){this.selectedNode.reveal();handled=true;}else if(this.selectedNode.hasChildren()){handled=true;if(this.selectedNode.expanded){nextSelectedNode=this.selectedNode.children[0];handled=nextSelectedNode?true:false;}else{if(event.altKey){this.selectedNode.expandRecursively();}else{this.selectedNode.expand();}}}}else if(event.keyCode===8||event.keyCode===46){if(this._deleteCallback){handled=true;this._deleteCallback(this.selectedNode);}}else if(isEnterKey(event)){if(this._editCallback){handled=true;this._startEditing(this.selectedNode._element.children[this._nextEditableColumn(-1)]);}else{this.dispatchEventToListeners(Events.OpenedNode,this.selectedNode);}}
if(nextSelectedNode){nextSelectedNode.reveal();nextSelectedNode.select();}
if((event.key==='ArrowUp'||event.key==='ArrowDown'||event.key==='ArrowLeft'||event.key==='ArrowRight')&&document.activeElement!==this.element){this.element.focus();}
if(handled){event.consume(true);}}
updateSelectionBeforeRemoval(root,onlyAffectsSubtree){let ancestor=this.selectedNode;while(ancestor&&ancestor!==root){ancestor=ancestor.parent;}
if(!ancestor){return;}
let nextSelectedNode;for(ancestor=root;ancestor&&!ancestor.nextSibling;ancestor=ancestor.parent){}
if(ancestor){nextSelectedNode=ancestor.nextSibling;}
while(nextSelectedNode&&!nextSelectedNode.selectable){nextSelectedNode=nextSelectedNode.traverseNextNode(true);}
if(!nextSelectedNode||nextSelectedNode.isCreationNode){nextSelectedNode=root.traversePreviousNode(true);while(nextSelectedNode&&!nextSelectedNode.selectable){nextSelectedNode=nextSelectedNode.traversePreviousNode(true);}}
if(nextSelectedNode){nextSelectedNode.reveal();nextSelectedNode.select();}else{this.selectedNode.deselect();}}
dataGridNodeFromNode(target){const rowElement=target.enclosingNodeOrSelfWithNodeName('tr');return rowElement&&rowElement._dataGridNode;}
columnIdFromNode(target){const cellElement=target.enclosingNodeOrSelfWithNodeName('td');return cellElement&&cellElement[DataGrid._columnIdSymbol];}
_clickInHeaderCell(event){const cell=event.target.enclosingNodeOrSelfWithNodeName('th');if(!cell){return;}
this._sortByColumnHeaderCell(cell);}
_sortByColumnHeaderCell(cell){if((cell[DataGrid._columnIdSymbol]===undefined)||!cell.classList.contains('sortable')){return;}
let sortOrder=Order.Ascending;if((cell===this._sortColumnCell)&&this.isSortOrderAscending()){sortOrder=Order.Descending;}
if(this._sortColumnCell){this._sortColumnCell.classList.remove(Order.Ascending,Order.Descending);}
this._sortColumnCell=cell;cell.classList.add(sortOrder);const icon=cell[DataGrid._sortIconSymbol];icon.setIconType(sortOrder===Order.Ascending?'smallicon-triangle-up':'smallicon-triangle-down');this.dispatchEventToListeners(Events.SortingChanged);}
markColumnAsSortedBy(columnId,sortOrder){if(this._sortColumnCell){this._sortColumnCell.classList.remove(Order.Ascending,Order.Descending);}
this._sortColumnCell=this._headerTableHeaders[columnId];this._sortColumnCell.classList.add(sortOrder);}
headerTableHeader(columnId){return this._headerTableHeaders[columnId];}
_mouseDownInDataTable(event){const target=(event.target);const gridNode=this.dataGridNodeFromNode(target);if(!gridNode||!gridNode.selectable||gridNode.isEventWithinDisclosureTriangle(event)){return;}
const columnId=this.columnIdFromNode(target);if(columnId&&this._columns[columnId].nonSelectable){return;}
if(event.metaKey){if(gridNode.selected){gridNode.deselect();}else{gridNode.select();}}else{gridNode.select();this.dispatchEventToListeners(Events.OpenedNode,gridNode);}}
setHeaderContextMenuCallback(callback){this._headerContextMenuCallback=callback;}
setRowContextMenuCallback(callback){this._rowContextMenuCallback=callback;}
_contextMenu(event){const contextMenu=new UI.ContextMenu(event);const target=(event.target);const sortableVisibleColumns=this._visibleColumnsArray.filter(column=>{return(column.sortable&&column.title);});const sortableHiddenColumns=this._columnsArray.filter(column=>sortableVisibleColumns.indexOf(column)===-1&&column.allowInSortByEvenWhenHidden);const sortableColumns=[...sortableVisibleColumns,...sortableHiddenColumns];if(sortableColumns.length>0){const sortMenu=contextMenu.defaultSection().appendSubMenuItem(ls`Sort By`);for(const column of sortableColumns){const headerCell=this._headerTableHeaders[column.id];sortMenu.defaultSection().appendItem((column.title),this._sortByColumnHeaderCell.bind(this,headerCell));}}
if(this._headerContextMenuCallback){if(target.isSelfOrDescendant(this._headerTableBody)){this._headerContextMenuCallback(contextMenu);contextMenu.show();return;}else{const headerSubMenu=contextMenu.defaultSection().appendSubMenuItem(ls`Header Options`);this._headerContextMenuCallback(headerSubMenu);}}
const isContextMenuKey=(event.button===0);const gridNode=isContextMenuKey?this.selectedNode:this.dataGridNodeFromNode(target);if(isContextMenuKey&&this.selectedNode){const boundingRowRect=this.selectedNode.existingElement().getBoundingClientRect();if(boundingRowRect){const x=(boundingRowRect.right+boundingRowRect.left)/2;const y=(boundingRowRect.bottom+boundingRowRect.top)/2;contextMenu.setX(x);contextMenu.setY(y);}}
if(this._refreshCallback&&(!gridNode||gridNode!==this.creationNode)){contextMenu.defaultSection().appendItem(Common.UIString('Refresh'),this._refreshCallback.bind(this));}
if(gridNode&&gridNode.selectable&&!gridNode.isEventWithinDisclosureTriangle(event)){if(this._editCallback){if(gridNode===this.creationNode){contextMenu.defaultSection().appendItem(Common.UIString('Add new'),this._startEditing.bind(this,target));}else if(isContextMenuKey){const firstEditColumnIndex=this._nextEditableColumn(-1);if(firstEditColumnIndex>-1){const firstColumn=this._visibleColumnsArray[firstEditColumnIndex];if(firstColumn&&firstColumn.editable){contextMenu.defaultSection().appendItem(ls`Edit "${firstColumn.title}"`,this._startEditingColumnOfDataGridNode.bind(this,gridNode,firstEditColumnIndex));}}}else{const columnId=this.columnIdFromNode(target);if(columnId&&this._columns[columnId].editable){contextMenu.defaultSection().appendItem(Common.UIString('Edit "%s"',this._columns[columnId].title),this._startEditing.bind(this,target));}}}
if(this._deleteCallback&&gridNode!==this.creationNode){contextMenu.defaultSection().appendItem(Common.UIString('Delete'),this._deleteCallback.bind(this,gridNode));}
if(this._rowContextMenuCallback){this._rowContextMenuCallback(contextMenu,gridNode);}}
contextMenu.show();}
_clickInDataTable(event){const gridNode=this.dataGridNodeFromNode((event.target));if(!gridNode||!gridNode.hasChildren()||!gridNode.isEventWithinDisclosureTriangle(event)){return;}
if(gridNode.expanded){if(event.altKey){gridNode.collapseRecursively();}else{gridNode.collapse();}}else{if(event.altKey){gridNode.expandRecursively();}else{gridNode.expand();}}}
setResizeMethod(method){this._resizeMethod=method;}
_startResizerDragging(event){this._currentResizer=event.target;return true;}
_endResizerDragging(){this._currentResizer=null;this._saveColumnWeights();}
_resizerDragging(event){const resizer=this._currentResizer;if(!resizer){return;}
let dragPoint=event.clientX-this.element.totalOffsetLeft();const firstRowCells=this._headerTableBody.rows[0].cells;let leftEdgeOfPreviousColumn=0;let leftCellIndex=resizer.__index;let rightCellIndex=leftCellIndex+1;for(let i=0;i<leftCellIndex;i++){leftEdgeOfPreviousColumn+=firstRowCells[i].offsetWidth;}
if(this._resizeMethod===ResizeMethod.Last){rightCellIndex=this._resizers.length;}else if(this._resizeMethod===ResizeMethod.First){leftEdgeOfPreviousColumn+=firstRowCells[leftCellIndex].offsetWidth-firstRowCells[0].offsetWidth;leftCellIndex=0;}
const rightEdgeOfNextColumn=leftEdgeOfPreviousColumn+firstRowCells[leftCellIndex].offsetWidth+firstRowCells[rightCellIndex].offsetWidth;const leftMinimum=leftEdgeOfPreviousColumn+ColumnResizePadding;const rightMaximum=rightEdgeOfNextColumn-ColumnResizePadding;if(leftMinimum>rightMaximum){return;}
dragPoint=Number.constrain(dragPoint,leftMinimum,rightMaximum);const position=(dragPoint-CenterResizerOverBorderAdjustment);resizer.__position=position;resizer.style.left=position+'px';this._setPreferredWidth(leftCellIndex,dragPoint-leftEdgeOfPreviousColumn);this._setPreferredWidth(rightCellIndex,rightEdgeOfNextColumn-dragPoint);const leftColumn=this._visibleColumnsArray[leftCellIndex];const rightColumn=this._visibleColumnsArray[rightCellIndex];if(leftColumn.weight||rightColumn.weight){const sumOfWeights=leftColumn.weight+rightColumn.weight;const delta=rightEdgeOfNextColumn-leftEdgeOfPreviousColumn;leftColumn.weight=(dragPoint-leftEdgeOfPreviousColumn)*sumOfWeights/delta;rightColumn.weight=(rightEdgeOfNextColumn-dragPoint)*sumOfWeights/delta;}
this._positionResizers();event.preventDefault();}
_setPreferredWidth(columnIndex,width){const pxWidth=width+'px';this._headerTableColumnGroup.children[columnIndex][DataGrid._preferredWidthSymbol]=width;this._headerTableColumnGroup.children[columnIndex].style.width=pxWidth;this._dataTableColumnGroup.children[columnIndex].style.width=pxWidth;}
columnOffset(columnId){if(!this.element.offsetWidth){return 0;}
for(let i=1;i<this._visibleColumnsArray.length;++i){if(columnId===this._visibleColumnsArray[i].id){if(this._resizers[i-1]){return this._resizers[i-1].__position;}}}
return 0;}
asWidget(){if(!this._dataGridWidget){this._dataGridWidget=new DataGridWidget(this);}
return this._dataGridWidget;}
topFillerRowElement(){return this._topFillerRow;}}
export const CornerWidth=14;export const Events={SelectedNode:Symbol('SelectedNode'),DeselectedNode:Symbol('DeselectedNode'),OpenedNode:Symbol('OpenedNode'),SortingChanged:Symbol('SortingChanged'),PaddingChanged:Symbol('PaddingChanged'),};export const Order={Ascending:'sort-ascending',Descending:'sort-descending'};export const Align={Center:'center',Right:'right'};export const ColumnResizePadding=24;export const CenterResizerOverBorderAdjustment=3;export const ResizeMethod={Nearest:'nearest',First:'first',Last:'last'};export class DataGridNode extends Common.Object{constructor(data,hasChildren){super();this._element=null;this._expanded=false;this._selected=false;this._dirty=false;this._inactive=false;this._depth;this._revealed;this._attached=false;this._savedPosition=null;this._shouldRefreshChildren=true;this._data=data||{};this._hasChildren=hasChildren||false;this.children=[];this.dataGrid=null;this.parent=null;this.previousSibling=null;this.nextSibling=null;this.disclosureToggleWidth=10;this.selectable=true;this._isRoot=false;}
element(){if(!this._element){const element=this.createElement();this.createCells(element);}
return(this._element);}
createElement(){this._element=createElementWithClass('tr','data-grid-data-grid-node');this._element._dataGridNode=this;if(this._hasChildren){this._element.classList.add('parent');}
if(this.expanded){this._element.classList.add('expanded');}
if(this.selected){this._element.classList.add('selected');}
if(this.revealed){this._element.classList.add('revealed');}
if(this.dirty){this._element.classList.add('dirty');}
if(this.inactive){this._element.classList.add('inactive');}
return this._element;}
existingElement(){return this._element||null;}
resetElement(){this._element=null;}
createCells(element){element.removeChildren();const columnsArray=this.dataGrid._visibleColumnsArray;for(let i=0;i<columnsArray.length;++i){element.appendChild(this.createCell(columnsArray[i].id));}
element.appendChild(this._createTDWithClass('corner'));}
get data(){return this._data;}
set data(x){this._data=x||{};this.refresh();}
get revealed(){if(this._revealed!==undefined){return this._revealed;}
let currentAncestor=this.parent;while(currentAncestor&&!currentAncestor._isRoot){if(!currentAncestor.expanded){this._revealed=false;return false;}
currentAncestor=currentAncestor.parent;}
this.revealed=true;return true;}
set revealed(x){if(this._revealed===x){return;}
this._revealed=x;if(this._element){this._element.classList.toggle('revealed',this._revealed);}
for(let i=0;i<this.children.length;++i){this.children[i].revealed=x&&this.expanded;}}
isDirty(){return this._dirty;}
setDirty(dirty){if(this._dirty===dirty){return;}
this._dirty=dirty;if(!this._element){return;}
if(dirty){this._element.classList.add('dirty');}else{this._element.classList.remove('dirty');}}
isInactive(){return this._inactive;}
setInactive(inactive){if(this._inactive===inactive){return;}
this._inactive=inactive;if(!this._element){return;}
if(inactive){this._element.classList.add('inactive');}else{this._element.classList.remove('inactive');}}
hasChildren(){return this._hasChildren;}
setHasChildren(x){if(this._hasChildren===x){return;}
this._hasChildren=x;if(!this._element){return;}
this._element.classList.toggle('parent',this._hasChildren);this._element.classList.toggle('expanded',this._hasChildren&&this.expanded);}
get depth(){if(this._depth!==undefined){return this._depth;}
if(this.parent&&!this.parent._isRoot){this._depth=this.parent.depth+1;}else{this._depth=0;}
return this._depth;}
get leftPadding(){return this.depth*this.dataGrid.indentWidth;}
get shouldRefreshChildren(){return this._shouldRefreshChildren;}
set shouldRefreshChildren(x){this._shouldRefreshChildren=x;if(x&&this.expanded){this.expand();}}
get selected(){return this._selected;}
set selected(x){if(x){this.select();}else{this.deselect();}}
get expanded(){return this._expanded;}
set expanded(x){if(x){this.expand();}else{this.collapse();}}
refresh(){if(!this.dataGrid){this._element=null;}
if(!this._element){return;}
this.createCells(this._element);}
_createTDWithClass(className){const cell=createElementWithClass('td',className);const cellClass=this.dataGrid._cellClass;if(cellClass){cell.classList.add(cellClass);}
return cell;}
createTD(columnId){const cell=this._createTDWithClass(columnId+'-column');cell[DataGrid._columnIdSymbol]=columnId;const alignment=this.dataGrid._columns[columnId].align;if(alignment){cell.classList.add(alignment);}
if(columnId===this.dataGrid.disclosureColumnId){cell.classList.add('disclosure');if(this.leftPadding){cell.style.setProperty('padding-left',this.leftPadding+'px');}}
return cell;}
createCell(columnId){const cell=this.createTD(columnId);const data=this.data[columnId];if(data instanceof Node){cell.appendChild(data);}else if(data!==null){DataGrid.DataGrid.setElementText(cell,(data),!!this.dataGrid._columns[columnId].longText);}
return cell;}
nodeSelfHeight(){return 20;}
appendChild(child){this.insertChild(child,this.children.length);}
resetNode(onlyCaches){delete this._depth;delete this._revealed;if(onlyCaches){return;}
if(this.previousSibling){this.previousSibling.nextSibling=this.nextSibling;}
if(this.nextSibling){this.nextSibling.previousSibling=this.previousSibling;}
this.dataGrid=null;this.parent=null;this.nextSibling=null;this.previousSibling=null;this._attached=false;}
insertChild(child,index){if(!child){throw'insertChild: Node can\'t be undefined or null.';}
if(child.parent===this){const currentIndex=this.children.indexOf(child);if(currentIndex<0){console.assert(false,'Inconsistent DataGrid state');}
if(currentIndex===index){return;}
if(currentIndex<index){--index;}}
child.remove();this.children.splice(index,0,child);this.setHasChildren(true);child.parent=this;child.dataGrid=this.dataGrid;child.recalculateSiblings(index);child._shouldRefreshChildren=true;let current=child.children[0];while(current){current.resetNode(true);current.dataGrid=this.dataGrid;current._attached=false;current._shouldRefreshChildren=true;current=current.traverseNextNode(false,child,true);}
if(this.expanded){child._attach();}
if(!this.revealed){child.revealed=false;}}
remove(){if(this.parent){this.parent.removeChild(this);}}
removeChild(child){if(!child){throw'removeChild: Node can\'t be undefined or null.';}
if(child.parent!==this){throw'removeChild: Node is not a child of this node.';}
if(this.dataGrid){this.dataGrid.updateSelectionBeforeRemoval(child,false);}
child._detach();child.resetNode();this.children.remove(child,true);if(this.children.length<=0){this.setHasChildren(false);}}
removeChildren(){if(this.dataGrid){this.dataGrid.updateSelectionBeforeRemoval(this,true);}
for(let i=0;i<this.children.length;++i){const child=this.children[i];child._detach();child.resetNode();}
this.children=[];this.setHasChildren(false);}
recalculateSiblings(myIndex){if(!this.parent){return;}
const previousChild=this.parent.children[myIndex-1]||null;if(previousChild){previousChild.nextSibling=this;}
this.previousSibling=previousChild;const nextChild=this.parent.children[myIndex+1]||null;if(nextChild){nextChild.previousSibling=this;}
this.nextSibling=nextChild;}
collapse(){if(this._isRoot){return;}
if(this._element){this._element.classList.remove('expanded');}
this._expanded=false;for(let i=0;i<this.children.length;++i){this.children[i].revealed=false;}}
collapseRecursively(){let item=this;while(item){if(item.expanded){item.collapse();}
item=item.traverseNextNode(false,this,true);}}
populate(){}
expand(){if(!this._hasChildren||this.expanded){return;}
if(this._isRoot){return;}
if(this.revealed&&!this._shouldRefreshChildren){for(let i=0;i<this.children.length;++i){this.children[i].revealed=true;}}
if(this._shouldRefreshChildren){for(let i=0;i<this.children.length;++i){this.children[i]._detach();}
this.populate();if(this._attached){for(let i=0;i<this.children.length;++i){const child=this.children[i];if(this.revealed){child.revealed=true;}
child._attach();}}
this._shouldRefreshChildren=false;}
if(this._element){this._element.classList.add('expanded');}
this._expanded=true;}
expandRecursively(){let item=this;while(item){item.expand();item=item.traverseNextNode(false,this);}}
reveal(){if(this._isRoot){return;}
let currentAncestor=this.parent;while(currentAncestor&&!currentAncestor._isRoot){if(!currentAncestor.expanded){currentAncestor.expand();}
currentAncestor=currentAncestor.parent;}
this.element().scrollIntoViewIfNeeded(false);}
select(supressSelectedEvent){if(!this.dataGrid||!this.selectable||this.selected){return;}
if(this.dataGrid.selectedNode){this.dataGrid.selectedNode.deselect();}
this._selected=true;this.dataGrid.selectedNode=this;if(this._element){this._element.classList.add('selected');this.dataGrid.setHasSelection(true);}
if(!supressSelectedEvent){this.dataGrid.dispatchEventToListeners(Events.SelectedNode,this);}}
revealAndSelect(){if(this._isRoot){return;}
this.reveal();this.select();}
deselect(supressDeselectedEvent){if(!this.dataGrid||this.dataGrid.selectedNode!==this||!this.selected){return;}
this._selected=false;this.dataGrid.selectedNode=null;if(this._element){this._element.classList.remove('selected');this.dataGrid.setHasSelection(false);}
if(!supressDeselectedEvent){this.dataGrid.dispatchEventToListeners(Events.DeselectedNode);}}
traverseNextNode(skipHidden,stayWithin,dontPopulate,info){if(!dontPopulate&&this._hasChildren){this.populate();}
if(info){info.depthChange=0;}
let node=(!skipHidden||this.revealed)?this.children[0]:null;if(node&&(!skipHidden||this.expanded)){if(info){info.depthChange=1;}
return node;}
if(this===stayWithin){return null;}
node=(!skipHidden||this.revealed)?this.nextSibling:null;if(node){return node;}
node=this;while(node&&!node._isRoot&&!((!skipHidden||node.revealed)?node.nextSibling:null)&&node.parent!==stayWithin){if(info){info.depthChange-=1;}
node=node.parent;}
if(!node){return null;}
return(!skipHidden||node.revealed)?node.nextSibling:null;}
traversePreviousNode(skipHidden,dontPopulate){let node=(!skipHidden||this.revealed)?this.previousSibling:null;if(!dontPopulate&&node&&node._hasChildren){node.populate();}
while(node&&((!skipHidden||(node.revealed&&node.expanded))?node.children[node.children.length-1]:null)){if(!dontPopulate&&node._hasChildren){node.populate();}
node=((!skipHidden||(node.revealed&&node.expanded))?node.children[node.children.length-1]:null);}
if(node){return node;}
if(!this.parent||this.parent._isRoot){return null;}
return this.parent;}
isEventWithinDisclosureTriangle(event){if(!this._hasChildren){return false;}
const cell=event.target.enclosingNodeOrSelfWithNodeName('td');if(!cell||!cell.classList.contains('disclosure')){return false;}
const left=cell.totalOffsetLeft()+this.leftPadding;return event.pageX>=left&&event.pageX<=left+this.disclosureToggleWidth;}
_attach(){if(!this.dataGrid||this._attached){return;}
this._attached=true;const previousNode=this.traversePreviousNode(true,true);const previousElement=previousNode?previousNode.element():this.dataGrid._topFillerRow;this.dataGrid.dataTableBody.insertBefore(this.element(),previousElement.nextSibling);if(this.expanded){for(let i=0;i<this.children.length;++i){this.children[i]._attach();}}}
_detach(){if(!this._attached){return;}
this._attached=false;if(this._element){this._element.remove();}
for(let i=0;i<this.children.length;++i){this.children[i]._detach();}}
savePosition(){if(this._savedPosition){return;}
if(!this.parent){throw'savePosition: Node must have a parent.';}
this._savedPosition={parent:this.parent,index:this.parent.children.indexOf(this)};}
restorePosition(){if(!this._savedPosition){return;}
if(this.parent!==this._savedPosition.parent){this._savedPosition.parent.insertChild(this,this._savedPosition.index);}
this._savedPosition=null;}}
export class CreationDataGridNode extends DataGridNode{constructor(data,hasChildren){super(data,hasChildren);this.isCreationNode=true;}
makeNormal(){this.isCreationNode=false;}}
export class DataGridWidget extends UI.VBox{constructor(dataGrid){super();this._dataGrid=dataGrid;this.element.appendChild(dataGrid.element);}
wasShown(){this._dataGrid.wasShown();}
willHide(){this._dataGrid.willHide();}
onResize(){this._dataGrid.onResize();}
elementsToRestoreScrollPositionsFor(){return[this._dataGrid._scrollContainer];}
detachChildWidgets(){super.detachChildWidgets();for(const dataGrid of this._dataGrids){this.element.removeChild(dataGrid.element);}
this._dataGrids=[];}}
self.DataGrid=self.DataGrid||{};DataGrid=DataGrid||{};DataGrid.ColumnDescriptor;DataGrid._preferredWidthSymbol=Symbol('preferredWidth');DataGrid._columnIdSymbol=Symbol('columnId');DataGrid._sortIconSymbol=Symbol('sortIcon');DataGrid._longTextSymbol=Symbol('longText');DataGrid.DataGrid=DataGridImpl;DataGrid.CreationDataGridNode=CreationDataGridNode;DataGrid.DataGridNode=DataGridNode;DataGrid.DataGridWidget=DataGridWidget;DataGrid.DataGrid.Events=Events;DataGrid.DataGrid.Order=Order;DataGrid.DataGrid.Align=Align;DataGrid.DataGrid.ResizeMethod=ResizeMethod;DataGrid.DataGrid.ColumnDescriptor=DataGrid.ColumnDescriptor;