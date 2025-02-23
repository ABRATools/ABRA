import{c as d,u as v,r as y,j as e,B as n,L as w,S as b,N as C}from"./index-DhJJZe_p.js";import{C as a,c as r,a as l,b as i}from"./card-UXHJwue8.js";import{t as o}from"./test-data-DJtYMeWy.js";import{R as f}from"./refresh-cw-D7jFkIwQ.js";import{A as k}from"./activity-BPzDhlhz.js";import{H as N}from"./hard-drive-CvRjc_VA.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=d("Layers",[["path",{d:"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",key:"8b97xw"}],["path",{d:"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65",key:"dd6zsq"}],["path",{d:"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65",key:"ep9fru"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=d("Monitor",[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2",key:"48i651"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21",key:"1svkeh"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21",key:"vw1qmm"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=d("Play",[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=d("RefreshCcw",[["path",{d:"M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"14sxne"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}],["path",{d:"M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16",key:"1hlbsb"}],["path",{d:"M16 16h5v5",key:"ccwih5"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=d("Square",[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=d("Terminal",[["polyline",{points:"4 17 10 11 4 5",key:"akl6gq"}],["line",{x1:"12",x2:"20",y1:"19",y2:"19",key:"q2wloq"}]]);function O(){const{systemId:x,nodeId:m,envId:h}=v(),s=o.environments[h||""],j=o.nodes[m||""],u=o.systems.find(t=>t.id===x),[c,p]=y.useState(!1);return!s||!j||!u?e.jsx("div",{children:"Environment not found"}):e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold tracking-tight",children:s.name}),e.jsxs("p",{className:"text-muted-foreground",children:["Environment on ",j.name," in ",u.name]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(n,{variant:"outline",children:[e.jsx(f,{className:"mr-2 h-4 w-4"}),"Refresh"]}),e.jsx(n,{variant:"outline",asChild:!0,children:e.jsxs(w,{to:`/config/systems/${x}/nodes/${m}/environments/${h}`,children:[e.jsx(b,{className:"mr-2 h-4 w-4"}),"Configure"]})})]})]}),e.jsx(a,{children:e.jsx(r,{className:"pt-6",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("div",{className:`px-3 py-1 rounded-full text-sm font-semibold ${s.status==="running"?"bg-green-500/20 text-green-500":"bg-yellow-500/20 text-yellow-500"}`,children:s.status}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Image: ",s.image]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(n,{variant:"outline",size:"sm",children:[e.jsx(M,{className:"mr-2 h-4 w-4"}),"Start"]}),e.jsxs(n,{variant:"outline",size:"sm",children:[e.jsx(q,{className:"mr-2 h-4 w-4"}),"Stop"]}),e.jsxs(n,{variant:"outline",size:"sm",children:[e.jsx(S,{className:"mr-2 h-4 w-4"}),"Restart"]})]})]})})}),e.jsxs(a,{children:[e.jsxs(l,{className:"flex flex-row items-center justify-between pb-2",children:[e.jsxs("div",{children:[e.jsxs(i,{className:"flex items-center gap-2",children:[e.jsx(I,{className:"h-5 w-5"}),"Console Access"]}),e.jsx("p",{className:"text-sm text-muted-foreground mt-1",children:"Direct console access to the environment"})]}),e.jsx(n,{variant:c?"destructive":"default",onClick:()=>p(!c),children:c?"Disconnect":"Connect"})]}),e.jsxs(r,{children:[e.jsx("div",{className:"relative aspect-video w-full bg-muted rounded-lg overflow-hidden",children:c?e.jsx("iframe",{className:"absolute inset-0 w-full h-full",src:"about:blank",title:"VNC Console"}):e.jsx("div",{className:"absolute inset-0 flex items-center justify-center",children:e.jsx("p",{className:"text-muted-foreground",children:"Click Connect to start console session"})})}),e.jsxs("div",{className:"mt-2 flex gap-2",children:[e.jsxs(n,{variant:"outline",size:"sm",disabled:!c,children:[e.jsx(f,{className:"mr-2 h-4 w-4"}),"Refresh"]}),e.jsx(n,{variant:"outline",size:"sm",disabled:!c,children:"Full Screen"})]})]})]}),e.jsxs("div",{className:"grid gap-4 md:grid-cols-2 lg:grid-cols-3",children:[e.jsxs(a,{children:[e.jsxs(l,{className:"flex flex-row items-center justify-between pb-2",children:[e.jsx(i,{className:"text-sm font-medium",children:"CPU Usage"}),e.jsx(k,{className:"h-4 w-4 text-muted-foreground"})]}),e.jsxs(r,{children:[e.jsxs("div",{className:"text-2xl font-bold",children:[s.resources.cpu," cores"]}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Allocated CPU resources"})]})]}),e.jsxs(a,{children:[e.jsxs(l,{className:"flex flex-row items-center justify-between pb-2",children:[e.jsx(i,{className:"text-sm font-medium",children:"Memory Usage"}),e.jsx(N,{className:"h-4 w-4 text-muted-foreground"})]}),e.jsxs(r,{children:[e.jsxs("div",{className:"text-2xl font-bold",children:[s.resources.memory," MB"]}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Allocated memory"})]})]}),e.jsxs(a,{children:[e.jsxs(l,{className:"flex flex-row items-center justify-between pb-2",children:[e.jsx(i,{className:"text-sm font-medium",children:"Storage"}),e.jsx(N,{className:"h-4 w-4 text-muted-foreground"})]}),e.jsxs(r,{children:[e.jsxs("div",{className:"text-2xl font-bold",children:[s.resources.storage," GB"]}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Allocated storage"})]})]})]}),e.jsxs("div",{className:"grid gap-6 md:grid-cols-2",children:[e.jsxs(a,{children:[e.jsxs(l,{className:"flex flex-row items-center justify-between pb-2",children:[e.jsx(i,{children:"Network Configuration"}),e.jsx(C,{className:"h-4 w-4 text-muted-foreground"})]}),e.jsx(r,{children:e.jsx("div",{className:"space-y-4",children:e.jsxs("div",{children:[e.jsx("h4",{className:"text-sm font-medium mb-2",children:"Port Mappings"}),s.ports.map(t=>e.jsx("div",{className:"text-sm text-muted-foreground",children:t},t))]})})})]}),e.jsxs(a,{children:[e.jsxs(l,{className:"flex flex-row items-center justify-between pb-2",children:[e.jsx(i,{children:"Environment Variables"}),e.jsx(L,{className:"h-4 w-4 text-muted-foreground"})]}),e.jsx(r,{children:e.jsx("div",{className:"space-y-2",children:Object.entries(s.variables).map(([t,g])=>e.jsxs("div",{className:"text-sm",children:[e.jsxs("span",{className:"font-medium",children:[t,":"]})," ",e.jsx("span",{className:"text-muted-foreground",children:t.toLowerCase().includes("password")?"********":g})]},t))})})]})]}),e.jsxs(a,{children:[e.jsxs(l,{className:"flex flex-row items-center justify-between pb-2",children:[e.jsx(i,{children:"Container Logs"}),e.jsx(R,{className:"h-4 w-4 text-muted-foreground"})]}),e.jsx(r,{children:e.jsx("div",{className:"bg-muted p-4 rounded-md font-mono text-sm h-48 overflow-auto",children:e.jsxs("div",{className:"text-muted-foreground",children:["2024-02-06 10:30:15 [INFO] Container started successfully",e.jsx("br",{}),"2024-02-06 10:30:16 [INFO] Initializing application...",e.jsx("br",{}),"2024-02-06 10:30:17 [INFO] Application ready",e.jsx("br",{}),"2024-02-06 10:35:22 [INFO] Health check passed"]})})})]})]})}export{O as default};
