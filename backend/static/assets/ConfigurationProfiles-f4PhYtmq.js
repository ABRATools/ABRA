import{c as i,j as e,B as a,I as n,S as t}from"./index-CXzNuwTG.js";import{C as r,a as l,b as d,c}from"./card-BMY6d1lA.js";import{P as o}from"./plus-BGVDjG7J.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=i("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=i("Tag",[["path",{d:"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",key:"vktsd0"}],["circle",{cx:"7.5",cy:"7.5",r:".5",fill:"currentColor",key:"kqv944"}]]),p=[{id:"prof1",name:"Production Node Profile",type:"node",description:"High-availability production configuration",appliedTo:5,lastUpdated:"2024-02-05",config:{maxCpu:8,maxMemory:"16GB",maxStorage:"500GB"}},{id:"prof2",name:"Development Environment",type:"environment",description:"Standard development environment settings",appliedTo:8,lastUpdated:"2024-02-04",config:{defaultImage:"node:latest",resources:"minimal",debug:!0}},{id:"prof3",name:"Staging Environment",type:"environment",description:"Staging environment with monitoring",appliedTo:3,lastUpdated:"2024-02-03",config:{monitoring:!0,logging:"verbose",backups:"daily"}}];function f(){return e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold tracking-tight",children:"Configuration Profiles"}),e.jsx("p",{className:"text-muted-foreground",children:"Manage and apply reusable configuration profiles"})]}),e.jsxs(a,{children:[e.jsx(o,{className:"mr-2 h-4 w-4"}),"Create Profile"]})]}),e.jsxs("div",{className:"flex gap-4",children:[e.jsx(n,{placeholder:"Search profiles...",className:"max-w-sm"}),e.jsxs(a,{variant:"outline",children:[e.jsx(x,{className:"mr-2 h-4 w-4"}),"Filter by Type"]})]}),e.jsx("div",{className:"grid gap-6 md:grid-cols-2 lg:grid-cols-3",children:p.map(s=>e.jsxs(r,{children:[e.jsxs(l,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(d,{className:"text-xl font-semibold",children:s.name}),e.jsx(t,{className:"h-5 w-5 text-muted-foreground"})]}),e.jsx(c,{children:e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-sm font-medium",children:"Type:"}),e.jsx("span",{className:"text-sm text-muted-foreground capitalize",children:s.type})]}),e.jsx("p",{className:"text-sm text-muted-foreground",children:s.description}),e.jsxs("div",{className:"text-sm text-muted-foreground",children:["Applied to ",s.appliedTo," instances"]}),e.jsxs("div",{className:"text-sm text-muted-foreground",children:["Last updated: ",s.lastUpdated]})]}),e.jsxs("div",{className:"pt-2 space-y-2",children:[e.jsxs(a,{className:"w-full",children:[e.jsx(t,{className:"mr-2 h-4 w-4"}),"Edit Profile"]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(a,{variant:"outline",className:"flex-1",children:[e.jsx(m,{className:"mr-2 h-4 w-4"}),"Clone"]}),e.jsx(a,{variant:"outline",className:"flex-1",children:"Apply"})]})]})]})})]},s.id))})]})}export{f as default};
