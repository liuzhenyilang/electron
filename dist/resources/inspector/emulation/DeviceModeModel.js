export default class DeviceModeModel extends Common.Object{constructor(){super();this._screenRect=new UI.Rect(0,0,1,1);this._visiblePageRect=new UI.Rect(0,0,1,1);this._availableSize=new UI.Size(1,1);this._preferredSize=new UI.Size(1,1);this._initialized=false;this._appliedDeviceSize=new UI.Size(1,1);this._appliedDeviceScaleFactor=window.devicePixelRatio;this._appliedUserAgentType=UA.Desktop;this._scaleSetting=Common.settings.createSetting('emulation.deviceScale',1);if(!this._scaleSetting.get()){this._scaleSetting.set(1);}
this._scaleSetting.addChangeListener(this._scaleSettingChanged,this);this._widthSetting=Common.settings.createSetting('emulation.deviceWidth',400);if(this._widthSetting.get()<MinDeviceSize){this._widthSetting.set(MinDeviceSize);}
if(this._widthSetting.get()>MaxDeviceSize){this._widthSetting.set(MaxDeviceSize);}
this._widthSetting.addChangeListener(this._widthSettingChanged,this);this._heightSetting=Common.settings.createSetting('emulation.deviceHeight',0);if(this._heightSetting.get()&&this._heightSetting.get()<MinDeviceSize){this._heightSetting.set(MinDeviceSize);}
if(this._heightSetting.get()>MaxDeviceSize){this._heightSetting.set(MaxDeviceSize);}
this._heightSetting.addChangeListener(this._heightSettingChanged,this);this._uaSetting=Common.settings.createSetting('emulation.deviceUA',UA.Mobile);this._uaSetting.addChangeListener(this._uaSettingChanged,this);this._deviceScaleFactorSetting=Common.settings.createSetting('emulation.deviceScaleFactor',0);this._deviceScaleFactorSetting.addChangeListener(this._deviceScaleFactorSettingChanged,this);this._deviceOutlineSetting=Common.settings.moduleSetting('emulation.showDeviceOutline');this._deviceOutlineSetting.addChangeListener(this._deviceOutlineSettingChanged,this);this._toolbarControlsEnabledSetting=Common.settings.createSetting('emulation.toolbarControlsEnabled',true,Common.SettingStorageType.Session);this._type=Type.None;this._device=null;this._mode=null;this._fitScale=1;this._touchEnabled=false;this._touchMobile=false;this._emulationModel=null;this._onModelAvailable=null;SDK.targetManager.observeModels(SDK.EmulationModel,this);}
static widthValidator(value){let valid=false;let errorMessage;if(!/^[\d]+$/.test(value)){errorMessage=ls`Width must be a number.`;}else if(value>MaxDeviceSize){errorMessage=ls`Width must be less than or equal to ${MaxDeviceSize}.`;}else if(value<MinDeviceSize){errorMessage=ls`Width must be greater than or equal to ${MinDeviceSize}.`;}else{valid=true;}
return{valid,errorMessage};}
static heightValidator(value){let valid=false;let errorMessage;if(!/^[\d]+$/.test(value)){errorMessage=ls`Height must be a number.`;}else if(value>MaxDeviceSize){errorMessage=ls`Height must be less than or equal to ${MaxDeviceSize}.`;}else if(value<MinDeviceSize){errorMessage=ls`Height must be greater than or equal to ${MinDeviceSize}.`;}else{valid=true;}
return{valid,errorMessage};}
static scaleValidator(value){let valid=false;let errorMessage;const parsedValue=Number(value.trim());if(!value){valid=true;}else if(Number.isNaN(parsedValue)){errorMessage=ls`Device pixel ratio must be a number or blank.`;}else if(value>MaxDeviceScaleFactor){errorMessage=ls`Device pixel ratio must be less than or equal to ${MaxDeviceScaleFactor}.`;}else if(value<MinDeviceScaleFactor){errorMessage=ls`Device pixel ratio must be greater than or equal to ${MinDeviceScaleFactor}.`;}else{valid=true;}
return{valid,errorMessage};}
setAvailableSize(availableSize,preferredSize){this._availableSize=availableSize;this._preferredSize=preferredSize;this._initialized=true;this._calculateAndEmulate(false);}
emulate(type,device,mode,scale){const resetPageScaleFactor=this._type!==type||this._device!==device||this._mode!==mode;this._type=type;if(type===Type.Device){console.assert(device&&mode,'Must pass device and mode for device emulation');this._mode=mode;this._device=device;if(this._initialized){const orientation=device.orientationByName(mode.orientation);this._scaleSetting.set(scale||this._calculateFitScale(orientation.width,orientation.height,this._currentOutline(),this._currentInsets()));}}else{this._device=null;this._mode=null;}
if(type!==Type.None){Host.userMetrics.actionTaken(Host.UserMetrics.Action.DeviceModeEnabled);}
this._calculateAndEmulate(resetPageScaleFactor);}
setWidth(width){const max=Math.min(MaxDeviceSize,this._preferredScaledWidth());width=Math.max(Math.min(width,max),1);this._widthSetting.set(width);}
setWidthAndScaleToFit(width){width=Math.max(Math.min(width,MaxDeviceSize),1);this._scaleSetting.set(this._calculateFitScale(width,this._heightSetting.get()));this._widthSetting.set(width);}
setHeight(height){const max=Math.min(MaxDeviceSize,this._preferredScaledHeight());height=Math.max(Math.min(height,max),0);if(height===this._preferredScaledHeight()){height=0;}
this._heightSetting.set(height);}
setHeightAndScaleToFit(height){height=Math.max(Math.min(height,MaxDeviceSize),0);this._scaleSetting.set(this._calculateFitScale(this._widthSetting.get(),height));this._heightSetting.set(height);}
setScale(scale){this._scaleSetting.set(scale);}
device(){return this._device;}
mode(){return this._mode;}
type(){return this._type;}
screenImage(){return(this._device&&this._mode)?this._device.modeImage(this._mode):'';}
outlineImage(){return(this._device&&this._mode&&this._deviceOutlineSetting.get())?this._device.outlineImage(this._mode):'';}
outlineRect(){return this._outlineRect;}
screenRect(){return this._screenRect;}
visiblePageRect(){return this._visiblePageRect;}
scale(){return this._scale;}
fitScale(){return this._fitScale;}
appliedDeviceSize(){return this._appliedDeviceSize;}
appliedDeviceScaleFactor(){return this._appliedDeviceScaleFactor;}
appliedUserAgentType(){return this._appliedUserAgentType;}
isFullHeight(){return!this._heightSetting.get();}
_isMobile(){switch(this._type){case Type.Device:return this._device.mobile();case Type.None:return false;case Type.Responsive:return this._uaSetting.get()===UA.Mobile||this._uaSetting.get()===UA.MobileNoTouch;}
return false;}
enabledSetting(){return Common.settings.createSetting('emulation.showDeviceMode',false);}
scaleSetting(){return this._scaleSetting;}
uaSetting(){return this._uaSetting;}
deviceScaleFactorSetting(){return this._deviceScaleFactorSetting;}
deviceOutlineSetting(){return this._deviceOutlineSetting;}
toolbarControlsEnabledSetting(){return this._toolbarControlsEnabledSetting;}
reset(){this._deviceScaleFactorSetting.set(0);this._scaleSetting.set(1);this.setWidth(400);this.setHeight(0);this._uaSetting.set(UA.Mobile);}
modelAdded(emulationModel){if(!this._emulationModel&&emulationModel.supportsDeviceEmulation()){this._emulationModel=emulationModel;if(this._onModelAvailable){const callback=this._onModelAvailable;this._onModelAvailable=null;callback();}}else{emulationModel.emulateTouch(this._touchEnabled,this._touchMobile);}}
modelRemoved(emulationModel){if(this._emulationModel===emulationModel){this._emulationModel=null;}}
inspectedURL(){return this._emulationModel?this._emulationModel.target().inspectedURL():null;}
_scaleSettingChanged(){this._calculateAndEmulate(false);}
_widthSettingChanged(){this._calculateAndEmulate(false);}
_heightSettingChanged(){this._calculateAndEmulate(false);}
_uaSettingChanged(){this._calculateAndEmulate(true);}
_deviceScaleFactorSettingChanged(){this._calculateAndEmulate(false);}
_deviceOutlineSettingChanged(){this._calculateAndEmulate(false);}
_preferredScaledWidth(){return Math.floor(this._preferredSize.width/(this._scaleSetting.get()||1));}
_preferredScaledHeight(){return Math.floor(this._preferredSize.height/(this._scaleSetting.get()||1));}
_currentOutline(){let outline=new UI.Insets(0,0,0,0);if(this._type!==Type.Device){return outline;}
const orientation=this._device.orientationByName(this._mode.orientation);if(this._deviceOutlineSetting.get()){outline=orientation.outlineInsets||outline;}
return outline;}
_currentInsets(){if(this._type!==Type.Device){return new UI.Insets(0,0,0,0);}
return this._mode.insets;}
_calculateAndEmulate(resetPageScaleFactor){if(!this._emulationModel){this._onModelAvailable=this._calculateAndEmulate.bind(this,resetPageScaleFactor);}
const mobile=this._isMobile();if(this._type===Type.Device){const orientation=this._device.orientationByName(this._mode.orientation);const outline=this._currentOutline();const insets=this._currentInsets();this._fitScale=this._calculateFitScale(orientation.width,orientation.height,outline,insets);if(mobile){this._appliedUserAgentType=this._device.touch()?UA.Mobile:UA.MobileNoTouch;}else{this._appliedUserAgentType=this._device.touch()?UA.DesktopTouch:UA.Desktop;}
this._applyDeviceMetrics(new UI.Size(orientation.width,orientation.height),insets,outline,this._scaleSetting.get(),this._device.deviceScaleFactor,mobile,this._mode.orientation===Emulation.EmulatedDevice.Horizontal?Protocol.Emulation.ScreenOrientationType.LandscapePrimary:Protocol.Emulation.ScreenOrientationType.PortraitPrimary,resetPageScaleFactor);this._applyUserAgent(this._device.userAgent);this._applyTouch(this._device.touch(),mobile);}else if(this._type===Type.None){this._fitScale=this._calculateFitScale(this._availableSize.width,this._availableSize.height);this._appliedUserAgentType=UA.Desktop;this._applyDeviceMetrics(this._availableSize,new UI.Insets(0,0,0,0),new UI.Insets(0,0,0,0),1,0,mobile,null,resetPageScaleFactor);this._applyUserAgent('');this._applyTouch(false,false);}else if(this._type===Type.Responsive){let screenWidth=this._widthSetting.get();if(!screenWidth||screenWidth>this._preferredScaledWidth()){screenWidth=this._preferredScaledWidth();}
let screenHeight=this._heightSetting.get();if(!screenHeight||screenHeight>this._preferredScaledHeight()){screenHeight=this._preferredScaledHeight();}
const defaultDeviceScaleFactor=mobile?defaultMobileScaleFactor:0;this._fitScale=this._calculateFitScale(this._widthSetting.get(),this._heightSetting.get());this._appliedUserAgentType=this._uaSetting.get();this._applyDeviceMetrics(new UI.Size(screenWidth,screenHeight),new UI.Insets(0,0,0,0),new UI.Insets(0,0,0,0),this._scaleSetting.get(),this._deviceScaleFactorSetting.get()||defaultDeviceScaleFactor,mobile,screenHeight>=screenWidth?Protocol.Emulation.ScreenOrientationType.PortraitPrimary:Protocol.Emulation.ScreenOrientationType.LandscapePrimary,resetPageScaleFactor);this._applyUserAgent(mobile?_defaultMobileUserAgent:'');this._applyTouch(this._uaSetting.get()===UA.DesktopTouch||this._uaSetting.get()===UA.Mobile,this._uaSetting.get()===UA.Mobile);}
const overlayModel=this._emulationModel?this._emulationModel.overlayModel():null;if(overlayModel){overlayModel.setShowViewportSizeOnResize(this._type===Type.None);}
this.dispatchEventToListeners(Events.Updated);}
_calculateFitScale(screenWidth,screenHeight,outline,insets){const outlineWidth=outline?outline.left+outline.right:0;const outlineHeight=outline?outline.top+outline.bottom:0;const insetsWidth=insets?insets.left+insets.right:0;const insetsHeight=insets?insets.top+insets.bottom:0;let scale=Math.min(screenWidth?this._preferredSize.width/(screenWidth+outlineWidth):1,screenHeight?this._preferredSize.height/(screenHeight+outlineHeight):1);scale=Math.min(Math.floor(scale*100),100);let sharpScale=scale;while(sharpScale>scale*0.7){let sharp=true;if(screenWidth){sharp=sharp&&Number.isInteger((screenWidth-insetsWidth)*sharpScale/100);}
if(screenHeight){sharp=sharp&&Number.isInteger((screenHeight-insetsHeight)*sharpScale/100);}
if(sharp){return sharpScale/100;}
sharpScale-=1;}
return scale/100;}
setSizeAndScaleToFit(width,height){this._scaleSetting.set(this._calculateFitScale(width,height));this.setWidth(width);this.setHeight(height);}
_applyUserAgent(userAgent){SDK.multitargetNetworkManager.setUserAgentOverride(userAgent);}
_applyDeviceMetrics(screenSize,insets,outline,scale,deviceScaleFactor,mobile,screenOrientation,resetPageScaleFactor){screenSize.width=Math.max(1,Math.floor(screenSize.width));screenSize.height=Math.max(1,Math.floor(screenSize.height));let pageWidth=screenSize.width-insets.left-insets.right;let pageHeight=screenSize.height-insets.top-insets.bottom;this._emulatedPageSize=new UI.Size(pageWidth,pageHeight);const positionX=insets.left;const positionY=insets.top;const screenOrientationAngle=screenOrientation===Protocol.Emulation.ScreenOrientationType.LandscapePrimary?90:0;this._appliedDeviceSize=screenSize;this._appliedDeviceScaleFactor=deviceScaleFactor||window.devicePixelRatio;this._screenRect=new UI.Rect(Math.max(0,(this._availableSize.width-screenSize.width*scale)/2),outline.top*scale,screenSize.width*scale,screenSize.height*scale);this._outlineRect=new UI.Rect(this._screenRect.left-outline.left*scale,0,(outline.left+screenSize.width+outline.right)*scale,(outline.top+screenSize.height+outline.bottom)*scale);this._visiblePageRect=new UI.Rect(positionX*scale,positionY*scale,Math.min(pageWidth*scale,this._availableSize.width-this._screenRect.left-positionX*scale),Math.min(pageHeight*scale,this._availableSize.height-this._screenRect.top-positionY*scale));this._scale=scale;if(scale===1&&this._availableSize.width>=screenSize.width&&this._availableSize.height>=screenSize.height){pageWidth=0;pageHeight=0;}
if(this._visiblePageRect.width===pageWidth*scale&&this._visiblePageRect.height===pageHeight*scale&&Number.isInteger(pageWidth*scale)&&Number.isInteger(pageHeight*scale)){pageWidth=0;pageHeight=0;}
if(!this._emulationModel){return;}
if(resetPageScaleFactor){this._emulationModel.resetPageScaleFactor();}
if(pageWidth||pageHeight||mobile||deviceScaleFactor||scale!==1||screenOrientation){const metrics={width:pageWidth,height:pageHeight,deviceScaleFactor:deviceScaleFactor,mobile:mobile,scale:scale,screenWidth:screenSize.width,screenHeight:screenSize.height,positionX:positionX,positionY:positionY,dontSetVisibleSize:true};if(screenOrientation){metrics.screenOrientation={type:screenOrientation,angle:screenOrientationAngle};}
this._emulationModel.emulateDevice(metrics);}else{this._emulationModel.emulateDevice(null);}}
async captureScreenshot(fullSize,clip){const screenCaptureModel=this._emulationModel?this._emulationModel.target().model(SDK.ScreenCaptureModel):null;if(!screenCaptureModel){return null;}
const overlayModel=this._emulationModel?this._emulationModel.overlayModel():null;if(overlayModel){overlayModel.setShowViewportSizeOnResize(false);}
let deviceMetrics;if(fullSize){const metrics=await screenCaptureModel.fetchLayoutMetrics();if(!metrics){return null;}
const contentHeight=Math.min((1<<14)/this._appliedDeviceScaleFactor,metrics.contentHeight);deviceMetrics={width:Math.floor(metrics.contentWidth),height:Math.floor(contentHeight),deviceScaleFactor:this._appliedDeviceScaleFactor,mobile:this._isMobile(),};clip={x:0,y:0,width:deviceMetrics.width,height:deviceMetrics.height,scale:1};if(this._device){const screenOrientation=this._mode.orientation===Emulation.EmulatedDevice.Horizontal?Protocol.Emulation.ScreenOrientationType.LandscapePrimary:Protocol.Emulation.ScreenOrientationType.PortraitPrimary;const screenOrientationAngle=screenOrientation===Protocol.Emulation.ScreenOrientationType.LandscapePrimary?90:0;deviceMetrics.screenOrientation={type:screenOrientation,angle:screenOrientationAngle};}
await this._emulationModel.resetPageScaleFactor();await this._emulationModel.emulateDevice(deviceMetrics);}
const screenshot=await screenCaptureModel.captureScreenshot('png',100,clip);if(fullSize){if(this._device){const orientation=this._device.orientationByName(this._mode.orientation);deviceMetrics.width=orientation.width;deviceMetrics.height=orientation.height;}else{deviceMetrics.width=0;deviceMetrics.height=0;}
await this._emulationModel.emulateDevice(deviceMetrics);}
this._calculateAndEmulate(false);return screenshot;}
_applyTouch(touchEnabled,mobile){this._touchEnabled=touchEnabled;this._touchMobile=mobile;for(const emulationModel of SDK.targetManager.models(SDK.EmulationModel)){emulationModel.emulateTouch(touchEnabled,mobile);}}}
export const Events={Updated:'Updated'};export const Type={None:'None',Responsive:'Responsive',Device:'Device'};export const UA={Mobile:Common.UIString('Mobile'),MobileNoTouch:Common.UIString('Mobile (no touch)'),Desktop:Common.UIString('Desktop'),DesktopTouch:Common.UIString('Desktop (touch)')};export const MinDeviceSize=50;export const MaxDeviceSize=9999;export const MinDeviceScaleFactor=0;export const MaxDeviceScaleFactor=10;export const MaxDeviceNameLength=50;const _mobileUserAgent='Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/%s Mobile Safari/537.36';export const _defaultMobileUserAgent=SDK.MultitargetNetworkManager.patchUserAgentWithChromeVersion(_mobileUserAgent);export const defaultMobileScaleFactor=2;self.Emulation=self.Emulation||{};Emulation=Emulation||{};Emulation.DeviceModeModel=DeviceModeModel;Emulation.DeviceModeModel.Events=Events;Emulation.DeviceModeModel.Type=Type;Emulation.DeviceModeModel.UA=UA;Emulation.DeviceModeModel.MinDeviceSize=MinDeviceSize;Emulation.DeviceModeModel.MaxDeviceSize=MaxDeviceSize;Emulation.DeviceModeModel.MinDeviceScaleFactor=MinDeviceScaleFactor;Emulation.DeviceModeModel.MaxDeviceScaleFactor=MaxDeviceScaleFactor;Emulation.DeviceModeModel.MaxDeviceNameLength=MaxDeviceNameLength;Emulation.DeviceModeModel._defaultMobileUserAgent=_defaultMobileUserAgent;Emulation.DeviceModeModel.defaultMobileScaleFactor=defaultMobileScaleFactor;