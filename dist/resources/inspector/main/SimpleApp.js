export default class SimpleApp{presentUI(document){const rootView=new UI.RootView();UI.inspectorView.show(rootView.element);rootView.attachToDocument(document);rootView.focus();}}
export class SimpleAppProvider{createApp(){return new Main.SimpleApp();}}
self.Main=self.Main||{};Main=Main||{};Main.SimpleApp=SimpleApp;Main.SimpleAppProvider=SimpleAppProvider;