export class Revealer{reveal(object,omitFocus){}}
export const reveal=function(revealable,omitFocus){if(!revealable){return Promise.reject(new Error('Can\'t reveal '+revealable));}
return self.runtime.allInstances(Revealer,revealable).then(reveal);function reveal(revealers){const promises=[];for(let i=0;i<revealers.length;++i){promises.push(revealers[i].reveal((revealable),omitFocus));}
return Promise.race(promises);}};export const revealDestination=function(revealable){const extension=self.runtime.extension(Revealer,revealable);if(!extension){return null;}
return extension.descriptor()['destination'];};