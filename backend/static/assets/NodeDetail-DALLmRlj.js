import{c as f,u as g,j as e,B as r,L as o,S as u}from"./index-CEwaw2xf.js";import{C as a,a as l,b as d,c as i}from"./card-Drl1U8-W.js";import{t as m}from"./test-data-DJtYMeWy.js";import{R as p}from"./refresh-cw-BwjlCUhU.js";import{A as N}from"./activity-CwmpRRpJ.js";import{H as h}from"./hard-drive-CLjgr33J.js";import{B as y}from"./box-CO14IanC.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=f("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);function U(){const{systemId:c,nodeId:n}=g(),s=m.nodes[n||""],x=m.systems.find(t=>t.id===c);if(!s||!x)return e.jsx("div",{children:"Node not found"});const j=s.environments.map(t=>m.environments[t]);return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold tracking-tight",children:s.name}),e.jsxs("p",{className:"text-muted-foreground",children:["Node in ",x.name]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(r,{variant:"outline",children:[e.jsx(p,{className:"mr-2 h-4 w-4"}),"Refresh Metrics"]}),e.jsx(r,{variant:"outline",asChild:!0,children:e.jsxs(o,{to:`/config/systems/${c}/nodes/${n}`,children:[e.jsx(u,{className:"mr-2 h-4 w-4"}),"Configure Node"]})})]})]}),e.jsxs("div",{className:"grid gap-4 md:grid-cols-2 lg:grid-cols-4",children:[e.jsxs(a,{children:[e.jsxs(l,{className:"flex flex-row items-center justify-between pb-2",children:[e.jsx(d,{className:"text-sm font-medium",children:"CPU Usage"}),e.jsx(N,{className:"h-4 w-4 text-muted-foreground"})]}),e.jsxs(i,{children:[e.jsxs("div",{className:"text-2xl font-bold",children:[Math.round(s.resources.cpu.used/s.resources.cpu.total*100),"%"]}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:[s.resources.cpu.used,"/",s.resources.cpu.total," cores"]})]})]}),e.jsxs(a,{children:[e.jsxs(l,{className:"flex flex-row items-center justify-between pb-2",children:[e.jsx(d,{className:"text-sm font-medium",children:"Memory Usage"}),e.jsx(h,{className:"h-4 w-4 text-muted-foreground"})]}),e.jsxs(i,{children:[e.jsxs("div",{className:"text-2xl font-bold",children:[Math.round(s.resources.memory.used/s.resources.memory.total*100),"%"]}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:[s.resources.memory.used,"/",s.resources.memory.total," GB"]})]})]}),e.jsxs(a,{children:[e.jsxs(l,{className:"flex flex-row items-center justify-between pb-2",children:[e.jsx(d,{className:"text-sm font-medium",children:"Storage Usage"}),e.jsx(h,{className:"h-4 w-4 text-muted-foreground"})]}),e.jsxs(i,{children:[e.jsxs("div",{className:"text-2xl font-bold",children:[Math.round(s.resources.storage.used/s.resources.storage.total*100),"%"]}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:[s.resources.storage.used,"/",s.resources.storage.total," GB"]})]})]}),e.jsxs(a,{children:[e.jsxs(l,{className:"flex flex-row items-center justify-between pb-2",children:[e.jsx(d,{className:"text-sm font-medium",children:"Uptime"}),e.jsx(v,{className:"h-4 w-4 text-muted-foreground"})]}),e.jsxs(i,{children:[e.jsx("div",{className:"text-2xl font-bold",children:s.uptime}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:["Last updated: ",new Date(s.lastUpdated).toLocaleString()]})]})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("h2",{className:"text-xl font-semibold tracking-tight",children:"Environments"}),e.jsxs(r,{variant:"outline",children:[e.jsx(y,{className:"mr-2 h-4 w-4"}),"Add Environment"]})]}),e.jsx("div",{className:"grid gap-4 md:grid-cols-2 lg:grid-cols-3",children:j.map(t=>e.jsxs(a,{children:[e.jsxs(l,{className:"flex flex-row items-center justify-between pb-2",children:[e.jsx(d,{className:"text-lg font-semibold",children:t.name}),e.jsx("div",{className:`px-2 py-1 rounded-full text-xs font-semibold ${t.status==="running"?"bg-green-500/20 text-green-500":"bg-yellow-500/20 text-yellow-500"}`,children:t.status})]}),e.jsx(i,{children:e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Type: ",t.type]}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Image: ",t.image]}),e.jsxs("div",{className:"grid grid-cols-2 gap-2",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"CPU"}),e.jsxs("p",{className:"text-sm",children:[t.resources.cpu," cores"]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"Memory"}),e.jsxs("p",{className:"text-sm",children:[t.resources.memory," MB"]})]})]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(r,{asChild:!0,className:"flex-1",children:e.jsx(o,{to:`/display/systems/${c}/nodes/${n}/environments/${t.id}`,children:"View Details"})}),e.jsx(r,{variant:"outline",asChild:!0,children:e.jsx(o,{to:`/config/systems/${c}/nodes/${n}/environments/${t.id}`,children:e.jsx(u,{className:"h-4 w-4"})})})]})]})})]},t.id))})]})]})}export{U as default};
