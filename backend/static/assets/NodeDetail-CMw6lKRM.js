import{j as s,B as i}from"./index-CUx4AkRE.js";import{L as n}from"./index-zoAH5yq0.js";import{C as m,a as o,b as l,c}from"./card-GfTrfn0x.js";import{u as x}from"./index-COlA1zcW.js";import{S as r}from"./settings-CqhcJ5ad.js";import{B as u}from"./box-BceA6PzZ.js";function y(){const{systemId:a,nodeId:t}=x(),d=[{id:"env1",name:"Production Environment",status:"running",image:"nginx:latest",cpu:"2 cores",memory:"4GB"},{id:"env2",name:"Staging Environment",status:"running",image:"nginx:latest",cpu:"1 core",memory:"2GB"}];return s.jsxs("div",{className:"space-y-6",children:[s.jsxs("div",{className:"flex justify-between items-center",children:[s.jsxs("div",{children:[s.jsx("h1",{className:"text-3xl font-bold tracking-tight",children:"Node Details"}),s.jsxs("p",{className:"text-muted-foreground",children:["Viewing environments for node: ",t]})]}),s.jsx(i,{variant:"outline",asChild:!0,children:s.jsxs(n,{to:`/config/systems/${a}/nodes/${t}`,children:[s.jsx(r,{className:"mr-2 h-4 w-4"}),"Configure Node"]})})]}),s.jsx("div",{className:"grid gap-6 md:grid-cols-2 lg:grid-cols-3",children:d.map(e=>s.jsxs(m,{children:[s.jsxs(o,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[s.jsx(l,{className:"text-xl font-semibold",children:e.name}),s.jsx(u,{className:"h-5 w-5 text-muted-foreground"})]}),s.jsx(c,{children:s.jsxs("div",{className:"space-y-4",children:[s.jsxs("div",{className:"space-y-2",children:[s.jsxs("p",{className:"text-sm text-muted-foreground",children:["Status: ",e.status]}),s.jsxs("p",{className:"text-sm text-muted-foreground",children:["Image: ",e.image]}),s.jsxs("p",{className:"text-sm text-muted-foreground",children:["CPU: ",e.cpu]}),s.jsxs("p",{className:"text-sm text-muted-foreground",children:["Memory: ",e.memory]})]}),s.jsxs("div",{className:"flex gap-2",children:[s.jsx(i,{asChild:!0,className:"flex-1",children:s.jsx(n,{to:`/display/systems/${a}/nodes/${t}/environments/${e.id}`,children:"View Details"})}),s.jsx(i,{variant:"outline",asChild:!0,children:s.jsx(n,{to:`/config/systems/${a}/nodes/${t}/environments/${e.id}`,children:s.jsx(r,{className:"h-4 w-4"})})})]})]})})]},e.id))})]})}export{y as default};
