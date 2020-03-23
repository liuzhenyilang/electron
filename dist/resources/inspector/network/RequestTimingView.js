export default class RequestTimingView extends UI.VBox{constructor(request,calculator){super();this.element.classList.add('resource-timing-view');this._request=request;this._calculator=calculator;}
static _timeRangeTitle(name){switch(name){case RequestTimeRangeNames.Push:return Common.UIString('Receiving Push');case RequestTimeRangeNames.Queueing:return Common.UIString('Queueing');case RequestTimeRangeNames.Blocking:return Common.UIString('Stalled');case RequestTimeRangeNames.Connecting:return Common.UIString('Initial connection');case RequestTimeRangeNames.DNS:return Common.UIString('DNS Lookup');case RequestTimeRangeNames.Proxy:return Common.UIString('Proxy negotiation');case RequestTimeRangeNames.ReceivingPush:return Common.UIString('Reading Push');case RequestTimeRangeNames.Receiving:return Common.UIString('Content Download');case RequestTimeRangeNames.Sending:return Common.UIString('Request sent');case RequestTimeRangeNames.ServiceWorker:return Common.UIString('Request to ServiceWorker');case RequestTimeRangeNames.ServiceWorkerPreparation:return Common.UIString('ServiceWorker Preparation');case RequestTimeRangeNames.SSL:return Common.UIString('SSL');case RequestTimeRangeNames.Total:return Common.UIString('Total');case RequestTimeRangeNames.Waiting:return Common.UIString('Waiting (TTFB)');default:return Common.UIString(name);}}
static calculateRequestTimeRanges(request,navigationStart){const result=[];function addRange(name,start,end){if(start<Number.MAX_VALUE&&start<=end){result.push({name:name,start:start,end:end});}}
function firstPositive(numbers){for(let i=0;i<numbers.length;++i){if(numbers[i]>0){return numbers[i];}}
return undefined;}
function addOffsetRange(name,start,end){if(start>=0&&end>=0){addRange(name,startTime+(start/1000),startTime+(end/1000));}}
const timing=request.timing;if(!timing){const start=request.issueTime()!==-1?request.issueTime():request.startTime!==-1?request.startTime:0;const middle=(request.responseReceivedTime===-1)?Number.MAX_VALUE:request.responseReceivedTime;const end=(request.endTime===-1)?Number.MAX_VALUE:request.endTime;addRange(RequestTimeRangeNames.Total,start,end);addRange(RequestTimeRangeNames.Blocking,start,middle);addRange(RequestTimeRangeNames.Receiving,middle,end);return result;}
const issueTime=request.issueTime();const startTime=timing.requestTime;const endTime=firstPositive([request.endTime,request.responseReceivedTime])||startTime;addRange(RequestTimeRangeNames.Total,issueTime<startTime?issueTime:startTime,endTime);if(timing.pushStart){const pushEnd=timing.pushEnd||endTime;if(pushEnd>navigationStart){addRange(RequestTimeRangeNames.Push,Math.max(timing.pushStart,navigationStart),pushEnd);}}
if(issueTime<startTime){addRange(RequestTimeRangeNames.Queueing,issueTime,startTime);}
const responseReceived=(request.responseReceivedTime-startTime)*1000;if(request.fetchedViaServiceWorker){addOffsetRange(RequestTimeRangeNames.Blocking,0,timing.workerStart);addOffsetRange(RequestTimeRangeNames.ServiceWorkerPreparation,timing.workerStart,timing.workerReady);addOffsetRange(RequestTimeRangeNames.ServiceWorker,timing.workerReady,timing.sendEnd);addOffsetRange(RequestTimeRangeNames.Waiting,timing.sendEnd,responseReceived);}else if(!timing.pushStart){const blockingEnd=firstPositive([timing.dnsStart,timing.connectStart,timing.sendStart,responseReceived])||0;addOffsetRange(RequestTimeRangeNames.Blocking,0,blockingEnd);addOffsetRange(RequestTimeRangeNames.Proxy,timing.proxyStart,timing.proxyEnd);addOffsetRange(RequestTimeRangeNames.DNS,timing.dnsStart,timing.dnsEnd);addOffsetRange(RequestTimeRangeNames.Connecting,timing.connectStart,timing.connectEnd);addOffsetRange(RequestTimeRangeNames.SSL,timing.sslStart,timing.sslEnd);addOffsetRange(RequestTimeRangeNames.Sending,timing.sendStart,timing.sendEnd);addOffsetRange(RequestTimeRangeNames.Waiting,Math.max(timing.sendEnd,timing.connectEnd,timing.dnsEnd,timing.proxyEnd,blockingEnd),responseReceived);}
if(request.endTime!==-1){addRange(timing.pushStart?RequestTimeRangeNames.ReceivingPush:RequestTimeRangeNames.Receiving,request.responseReceivedTime,endTime);}
return result;}
static createTimingTable(request,calculator){const tableElement=createElementWithClass('table','network-timing-table');UI.appendStyle(tableElement,'network/networkTimingTable.css');const colgroup=tableElement.createChild('colgroup');colgroup.createChild('col','labels');colgroup.createChild('col','bars');colgroup.createChild('col','duration');const timeRanges=RequestTimingView.calculateRequestTimeRanges(request,calculator.minimumBoundary());const startTime=timeRanges.map(r=>r.start).reduce((a,b)=>Math.min(a,b));const endTime=timeRanges.map(r=>r.end).reduce((a,b)=>Math.max(a,b));const scale=100/(endTime-startTime);let connectionHeader;let dataHeader;let queueingHeader;let totalDuration=0;const startTimeHeader=tableElement.createChild('thead','network-timing-start');const tableHeaderRow=startTimeHeader.createChild('tr');const activityHeaderCell=tableHeaderRow.createChild('th');activityHeaderCell.createChild('span','network-timing-hidden-header').textContent=ls`Label`;activityHeaderCell.scope='col';const waterfallHeaderCell=tableHeaderRow.createChild('th');waterfallHeaderCell.createChild('span','network-timing-hidden-header').textContent=ls`Waterfall`;waterfallHeaderCell.scope='col';const durationHeaderCell=tableHeaderRow.createChild('th');durationHeaderCell.createChild('span','network-timing-hidden-header').textContent=ls`Duration`;durationHeaderCell.scope='col';const queuedCell=startTimeHeader.createChild('tr').createChild('td');const startedCell=startTimeHeader.createChild('tr').createChild('td');queuedCell.colSpan=startedCell.colSpan=3;queuedCell.createTextChild(Common.UIString('Queued at %s',calculator.formatValue(request.issueTime(),2)));startedCell.createTextChild(Common.UIString('Started at %s',calculator.formatValue(request.startTime,2)));let right;for(let i=0;i<timeRanges.length;++i){const range=timeRanges[i];const rangeName=range.name;if(rangeName===RequestTimeRangeNames.Total){totalDuration=range.end-range.start;continue;}
if(rangeName===RequestTimeRangeNames.Push){createHeader(Common.UIString('Server Push'));}else if(rangeName===RequestTimeRangeNames.Queueing){if(!queueingHeader){queueingHeader=createHeader(ls`Resource Scheduling`);}}else if(ConnectionSetupRangeNames.has(rangeName)){if(!connectionHeader){connectionHeader=createHeader(Common.UIString('Connection Start'));}}else{if(!dataHeader){dataHeader=createHeader(Common.UIString('Request/Response'));}}
const left=(scale*(range.start-startTime));right=(scale*(endTime-range.end));const duration=range.end-range.start;const tr=tableElement.createChild('tr');tr.createChild('td').createTextChild(RequestTimingView._timeRangeTitle(rangeName));const row=tr.createChild('td').createChild('div','network-timing-row');const bar=row.createChild('span','network-timing-bar '+rangeName);bar.style.left=left+'%';bar.style.right=right+'%';bar.textContent='\u200B';UI.ARIAUtils.setAccessibleName(row,ls`Started at ${calculator.formatValue(range.start, 2)}`);const label=tr.createChild('td').createChild('div','network-timing-bar-title');label.textContent=Number.secondsToString(duration,true);}
if(!request.finished){const cell=tableElement.createChild('tr').createChild('td','caution');cell.colSpan=3;cell.createTextChild(Common.UIString('CAUTION: request is not finished yet!'));}
const footer=tableElement.createChild('tr','network-timing-footer');const note=footer.createChild('td');note.colSpan=1;note.appendChild(UI.createDocumentationLink('network-performance/reference#timing-explanation',Common.UIString('Explanation')));footer.createChild('td');footer.createChild('td').createTextChild(Number.secondsToString(totalDuration,true));const serverTimings=request.serverTimings;if(!serverTimings){return tableElement;}
const lastTimingRightEdge=right===undefined?100:right;const breakElement=tableElement.createChild('tr','network-timing-table-header').createChild('td');breakElement.colSpan=3;breakElement.createChild('hr','break');const serverHeader=tableElement.createChild('tr','network-timing-table-header');serverHeader.createChild('td').createTextChild(Common.UIString('Server Timing'));serverHeader.createChild('td');serverHeader.createChild('td').createTextChild(Common.UIString('TIME'));serverTimings.filter(item=>item.metric.toLowerCase()!=='total').forEach(item=>addTiming(item,lastTimingRightEdge));serverTimings.filter(item=>item.metric.toLowerCase()==='total').forEach(item=>addTiming(item,lastTimingRightEdge));return tableElement;function addTiming(serverTiming,right){const colorGenerator=new Common.Color.Generator({min:0,max:360,count:36},{min:50,max:80},80);const isTotal=serverTiming.metric.toLowerCase()==='total';const tr=tableElement.createChild('tr',isTotal?'network-timing-footer':'');const metric=tr.createChild('td','network-timing-metric');const description=serverTiming.description||serverTiming.metric;metric.createTextChild(description);metric.title=description;const row=tr.createChild('td').createChild('div','network-timing-row');if(serverTiming.value===null){return;}
const left=scale*(endTime-startTime-(serverTiming.value/1000));if(left>=0){const bar=row.createChild('span','network-timing-bar server-timing');bar.style.left=left+'%';bar.style.right=right+'%';bar.textContent='\u200B';if(!isTotal){bar.style.backgroundColor=colorGenerator.colorForID(serverTiming.metric);}}
const label=tr.createChild('td').createChild('div','network-timing-bar-title');label.textContent=Number.millisToString(serverTiming.value,true);}
function createHeader(title){const dataHeader=tableElement.createChild('tr','network-timing-table-header');const headerCell=dataHeader.createChild('td');headerCell.createTextChild(title);UI.ARIAUtils.markAsHeading(headerCell,2);dataHeader.createChild('td').createTextChild('');dataHeader.createChild('td').createTextChild(ls`DURATION`);return dataHeader;}}
wasShown(){this._request.addEventListener(SDK.NetworkRequest.Events.TimingChanged,this._refresh,this);this._request.addEventListener(SDK.NetworkRequest.Events.FinishedLoading,this._refresh,this);this._calculator.addEventListener(Network.NetworkTimeCalculator.Events.BoundariesChanged,this._refresh,this);this._refresh();}
willHide(){this._request.removeEventListener(SDK.NetworkRequest.Events.TimingChanged,this._refresh,this);this._request.removeEventListener(SDK.NetworkRequest.Events.FinishedLoading,this._refresh,this);this._calculator.removeEventListener(Network.NetworkTimeCalculator.Events.BoundariesChanged,this._refresh,this);}
_refresh(){if(this._tableElement){this._tableElement.remove();}
this._tableElement=RequestTimingView.createTimingTable(this._request,this._calculator);this._tableElement.classList.add('resource-timing-table');this.element.appendChild(this._tableElement);}}
export const RequestTimeRangeNames={Push:'push',Queueing:'queueing',Blocking:'blocking',Connecting:'connecting',DNS:'dns',Proxy:'proxy',Receiving:'receiving',ReceivingPush:'receiving-push',Sending:'sending',ServiceWorker:'serviceworker',ServiceWorkerPreparation:'serviceworker-preparation',SSL:'ssl',Total:'total',Waiting:'waiting'};export const ConnectionSetupRangeNames=new Set([RequestTimeRangeNames.Queueing,RequestTimeRangeNames.Blocking,RequestTimeRangeNames.Connecting,RequestTimeRangeNames.DNS,RequestTimeRangeNames.Proxy,RequestTimeRangeNames.SSL]);self.Network=self.Network||{};Network=Network||{};Network.RequestTimeRange;Network.RequestTimingView=RequestTimingView;Network.RequestTimingView.ConnectionSetupRangeNames=ConnectionSetupRangeNames;Network.RequestTimeRangeNames=RequestTimeRangeNames;