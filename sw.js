const C='djb-v7';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(x=>fetch('./',{cache:'no-store'}).then(r=>r.ok&&x.put('index',r))).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  const shell=u.origin===location.origin,font=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if(!shell&&!font)return;
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(C).then(x=>x.put('index',c))}return res}).catch(()=>caches.open(C).then(x=>x.match('index'))));
    return;
  }
  e.respondWith(caches.open(C).then(async x=>{
    const hit=await x.match(r);
    const net=fetch(r).then(res=>{if(res.ok||res.type==='opaque')x.put(r,res.clone());return res}).catch(()=>hit);
    return hit||net;
  }));
});
