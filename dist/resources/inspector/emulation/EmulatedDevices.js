export class EmulatedDevice{constructor(){this.title='';this.type=Type.Unknown;this.vertical={width:0,height:0,outlineInsets:null,outlineImage:null};this.horizontal={width:0,height:0,outlineInsets:null,outlineImage:null};this.deviceScaleFactor=1;this.capabilities=[Capability.Touch,Capability.Mobile];this.userAgent='';this.modes=[];this._show=_Show.Default;this._showByDefault=true;this._extension=null;}
static fromJSONV1(json){try{function parseValue(object,key,type,defaultValue){if(typeof object!=='object'||object===null||!object.hasOwnProperty(key)){if(typeof defaultValue!=='undefined'){return defaultValue;}
throw new Error('Emulated device is missing required property \''+key+'\'');}
const value=object[key];if(typeof value!==type||value===null){throw new Error('Emulated device property \''+key+'\' has wrong type \''+typeof value+'\'');}
return value;}
function parseIntValue(object,key){const value=(parseValue(object,key,'number'));if(value!==Math.abs(value)){throw new Error('Emulated device value \''+key+'\' must be integer');}
return value;}
function parseInsets(json){return new UI.Insets(parseIntValue(json,'left'),parseIntValue(json,'top'),parseIntValue(json,'right'),parseIntValue(json,'bottom'));}
function parseOrientation(json){const result={};result.width=parseIntValue(json,'width');if(result.width<0||result.width>Emulation.DeviceModeModel.MaxDeviceSize||result.width<Emulation.DeviceModeModel.MinDeviceSize){throw new Error('Emulated device has wrong width: '+result.width);}
result.height=parseIntValue(json,'height');if(result.height<0||result.height>Emulation.DeviceModeModel.MaxDeviceSize||result.height<Emulation.DeviceModeModel.MinDeviceSize){throw new Error('Emulated device has wrong height: '+result.height);}
const outlineInsets=parseValue(json['outline'],'insets','object',null);if(outlineInsets){result.outlineInsets=parseInsets(outlineInsets);if(result.outlineInsets.left<0||result.outlineInsets.top<0){throw new Error('Emulated device has wrong outline insets');}
result.outlineImage=(parseValue(json['outline'],'image','string'));}
return(result);}
const result=new EmulatedDevice();result.title=(parseValue(json,'title','string'));result.type=(parseValue(json,'type','string'));const rawUserAgent=(parseValue(json,'user-agent','string'));result.userAgent=SDK.MultitargetNetworkManager.patchUserAgentWithChromeVersion(rawUserAgent);const capabilities=parseValue(json,'capabilities','object',[]);if(!Array.isArray(capabilities)){throw new Error('Emulated device capabilities must be an array');}
result.capabilities=[];for(let i=0;i<capabilities.length;++i){if(typeof capabilities[i]!=='string'){throw new Error('Emulated device capability must be a string');}
result.capabilities.push(capabilities[i]);}
result.deviceScaleFactor=(parseValue(json['screen'],'device-pixel-ratio','number'));if(result.deviceScaleFactor<0||result.deviceScaleFactor>100){throw new Error('Emulated device has wrong deviceScaleFactor: '+result.deviceScaleFactor);}
result.vertical=parseOrientation(parseValue(json['screen'],'vertical','object'));result.horizontal=parseOrientation(parseValue(json['screen'],'horizontal','object'));const modes=parseValue(json,'modes','object',[]);if(!Array.isArray(modes)){throw new Error('Emulated device modes must be an array');}
result.modes=[];for(let i=0;i<modes.length;++i){const mode={};mode.title=(parseValue(modes[i],'title','string'));mode.orientation=(parseValue(modes[i],'orientation','string'));if(mode.orientation!==Vertical&&mode.orientation!==Horizontal){throw new Error('Emulated device mode has wrong orientation \''+mode.orientation+'\'');}
const orientation=result.orientationByName(mode.orientation);mode.insets=parseInsets(parseValue(modes[i],'insets','object'));if(mode.insets.top<0||mode.insets.left<0||mode.insets.right<0||mode.insets.bottom<0||mode.insets.top+mode.insets.bottom>orientation.height||mode.insets.left+mode.insets.right>orientation.width){throw new Error('Emulated device mode \''+mode.title+'\'has wrong mode insets');}
mode.image=(parseValue(modes[i],'image','string',null));result.modes.push(mode);}
result._showByDefault=(parseValue(json,'show-by-default','boolean',undefined));result._show=(parseValue(json,'show','string',_Show.Default));return result;}catch(e){return null;}}
static deviceComparator(device1,device2){const order1=(device1._extension&&device1._extension.descriptor()['order'])||-1;const order2=(device2._extension&&device2._extension.descriptor()['order'])||-1;if(order1>order2){return 1;}
if(order2>order1){return-1;}
return device1.title<device2.title?-1:(device1.title>device2.title?1:0);}
extension(){return this._extension;}
setExtension(extension){this._extension=extension;}
modesForOrientation(orientation){const result=[];for(let index=0;index<this.modes.length;index++){if(this.modes[index].orientation===orientation){result.push(this.modes[index]);}}
return result;}
_toJSON(){const json={};json['title']=this.title;json['type']=this.type;json['user-agent']=this.userAgent;json['capabilities']=this.capabilities;json['screen']={};json['screen']['device-pixel-ratio']=this.deviceScaleFactor;json['screen']['vertical']=this._orientationToJSON(this.vertical);json['screen']['horizontal']=this._orientationToJSON(this.horizontal);json['modes']=[];for(let i=0;i<this.modes.length;++i){const mode={};mode['title']=this.modes[i].title;mode['orientation']=this.modes[i].orientation;mode['insets']={};mode['insets']['left']=this.modes[i].insets.left;mode['insets']['top']=this.modes[i].insets.top;mode['insets']['right']=this.modes[i].insets.right;mode['insets']['bottom']=this.modes[i].insets.bottom;if(this.modes[i].image){mode['image']=this.modes[i].image;}
json['modes'].push(mode);}
json['show-by-default']=this._showByDefault;json['show']=this._show;return json;}
_orientationToJSON(orientation){const json={};json['width']=orientation.width;json['height']=orientation.height;if(orientation.outlineInsets){json['outline']={};json['outline']['insets']={};json['outline']['insets']['left']=orientation.outlineInsets.left;json['outline']['insets']['top']=orientation.outlineInsets.top;json['outline']['insets']['right']=orientation.outlineInsets.right;json['outline']['insets']['bottom']=orientation.outlineInsets.bottom;json['outline']['image']=orientation.outlineImage;}
return json;}
modeImage(mode){if(!mode.image){return'';}
if(!this._extension){return mode.image;}
return this._extension.module().substituteURL(mode.image);}
outlineImage(mode){const orientation=this.orientationByName(mode.orientation);if(!orientation.outlineImage){return'';}
if(!this._extension){return orientation.outlineImage;}
return this._extension.module().substituteURL(orientation.outlineImage);}
orientationByName(name){return name===Vertical?this.vertical:this.horizontal;}
show(){if(this._show===_Show.Default){return this._showByDefault;}
return this._show===_Show.Always;}
setShow(show){this._show=show?_Show.Always:_Show.Never;}
copyShowFrom(other){this._show=other._show;}
touch(){return this.capabilities.indexOf(Capability.Touch)!==-1;}
mobile(){return this.capabilities.indexOf(Capability.Mobile)!==-1;}}
export const Horizontal='horizontal';export const Vertical='vertical';export const Type={Phone:'phone',Tablet:'tablet',Notebook:'notebook',Desktop:'desktop',Unknown:'unknown'};export const Capability={Touch:'touch',Mobile:'mobile'};export const _Show={Always:'Always',Default:'Default',Never:'Never'};export class EmulatedDevicesList extends Common.Object{constructor(){super();this._standardSetting=Common.settings.createSetting('standardEmulatedDeviceList',[]);this._standard=[];this._listFromJSONV1(this._standardSetting.get(),this._standard);this._updateStandardDevices();this._customSetting=Common.settings.createSetting('customEmulatedDeviceList',[]);this._custom=[];if(!this._listFromJSONV1(this._customSetting.get(),this._custom)){this.saveCustomDevices();}}
static instance(){if(!this._instance){this._instance=new EmulatedDevicesList();}
return(this._instance);}
_updateStandardDevices(){const devices=[];const extensions=self.runtime.extensions('emulated-device');for(let i=0;i<extensions.length;++i){const device=EmulatedDevice.fromJSONV1(extensions[i].descriptor()['device']);device.setExtension(extensions[i]);devices.push(device);}
this._copyShowValues(this._standard,devices);this._standard=devices;this.saveStandardDevices();}
_listFromJSONV1(jsonArray,result){if(!Array.isArray(jsonArray)){return false;}
let success=true;for(let i=0;i<jsonArray.length;++i){const device=EmulatedDevice.fromJSONV1(jsonArray[i]);if(device){result.push(device);if(!device.modes.length){device.modes.push({title:'',orientation:Horizontal,insets:new UI.Insets(0,0,0,0),image:null});device.modes.push({title:'',orientation:Vertical,insets:new UI.Insets(0,0,0,0),image:null});}}else{success=false;}}
return success;}
standard(){return this._standard;}
custom(){return this._custom;}
revealCustomSetting(){Common.Revealer.reveal(this._customSetting);}
addCustomDevice(device){this._custom.push(device);this.saveCustomDevices();}
removeCustomDevice(device){this._custom.remove(device);this.saveCustomDevices();}
saveCustomDevices(){const json=this._custom.map(function(device){return device._toJSON();});this._customSetting.set(json);this.dispatchEventToListeners(Events.CustomDevicesUpdated);}
saveStandardDevices(){const json=this._standard.map(function(device){return device._toJSON();});this._standardSetting.set(json);this.dispatchEventToListeners(Events.StandardDevicesUpdated);}
_copyShowValues(from,to){const deviceById=new Map();for(let i=0;i<from.length;++i){deviceById.set(from[i].title,from[i]);}
for(let i=0;i<to.length;++i){const title=to[i].title;if(deviceById.has(title)){to[i].copyShowFrom((deviceById.get(title)));}}}}
export const Events={CustomDevicesUpdated:Symbol('CustomDevicesUpdated'),StandardDevicesUpdated:Symbol('StandardDevicesUpdated')};self.Emulation=self.Emulation||{};Emulation=Emulation||{};Emulation.EmulatedDevice=EmulatedDevice;Emulation.EmulatedDevice.Mode;Emulation.EmulatedDevice.Orientation;Emulation.EmulatedDevice.Horizontal=Horizontal;Emulation.EmulatedDevice.Vertical=Vertical;Emulation.EmulatedDevice.Type=Type;Emulation.EmulatedDevice.Capability=Capability;Emulation.EmulatedDevice._Show=_Show;Emulation.EmulatedDevicesList=EmulatedDevicesList;Emulation.EmulatedDevicesList._instance;Emulation.EmulatedDevicesList.Events=Events;