// One stream error listener handles errors that are emitted after write callbacks.
// The caller bounds outstanding logger promises (see createObservability).
export function createStreamLogger(stream) {
 let failed=false;
 const onError=()=>{failed=true;};
 stream.on('error',onError);
 return {
  log(event) {
   if(failed||stream.destroyed||stream.writableEnded)return Promise.reject(new Error('Log output unavailable'));
   return new Promise((resolve,reject)=>{
    stream.write(JSON.stringify(event)+'\n',error=>error?reject(new Error('Log output unavailable')):resolve());
   });
  },
  // Intended for disposal only once the stream is no longer writing/emitting errors.
  dispose(){stream.off('error',onError);}
 };
}
