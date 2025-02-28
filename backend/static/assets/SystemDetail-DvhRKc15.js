import{u as j,j as s,B as c,L as n,S as u}from"./index-DI4Mvptb.js";import{C as l,a as r,b as a,c as i}from"./card-DE4grvh-.js";import{t as m}from"./test-data-DJtYMeWy.js";import{S as f}from"./server-CWB1igi2.js";import{B as g}from"./box-DKIS_EN6.js";import{A as N}from"./activity-CJ1cO7iT.js";import{H as p}from"./hard-drive-pngC0QDT.js";function U(){const{systemId:d}=j(),t=m.systems.find(e=>e.id===d);if(!t)return s.jsx("div",{children:"System not found"});const x=t.nodes.map(e=>m.nodes[e]),o=x.flatMap(e=>e.environments.map(h=>m.environments[h]));return s.jsxs("div",{className:"space-y-6",children:[s.jsxs("div",{className:"flex justify-between items-center",children:[s.jsxs("div",{children:[s.jsx("h1",{className:"text-3xl font-bold tracking-tight",children:t.name}),s.jsx("p",{className:"text-muted-foreground",children:t.description})]}),s.jsx(c,{variant:"outline",asChild:!0,children:s.jsxs(n,{to:`/config/systems/${d}`,children:[s.jsx(u,{className:"mr-2 h-4 w-4"}),"Configure System"]})})]}),s.jsxs("div",{className:"grid gap-4 md:grid-cols-2 lg:grid-cols-4",children:[s.jsxs(l,{children:[s.jsxs(r,{className:"flex flex-row items-center justify-between pb-2",children:[s.jsx(a,{className:"text-sm font-medium",children:"Nodes"}),s.jsx(f,{className:"h-4 w-4 text-muted-foreground"})]}),s.jsxs(i,{children:[s.jsx("div",{className:"text-2xl font-bold",children:t.nodeCount}),s.jsx("p",{className:"text-xs text-muted-foreground",children:"Active nodes"})]})]}),s.jsxs(l,{children:[s.jsxs(r,{className:"flex flex-row items-center justify-between pb-2",children:[s.jsx(a,{className:"text-sm font-medium",children:"Containers"}),s.jsx(g,{className:"h-4 w-4 text-muted-foreground"})]}),s.jsxs(i,{children:[s.jsx("div",{className:"text-2xl font-bold",children:t.totalContainers}),s.jsx("p",{className:"text-xs text-muted-foreground",children:"Running containers"})]})]}),s.jsxs(l,{children:[s.jsxs(r,{className:"flex flex-row items-center justify-between pb-2",children:[s.jsx(a,{className:"text-sm font-medium",children:"CPU Usage"}),s.jsx(N,{className:"h-4 w-4 text-muted-foreground"})]}),s.jsxs(i,{children:[s.jsxs("div",{className:"text-2xl font-bold",children:[t.cpuUsage,"%"]}),s.jsx("p",{className:"text-xs text-muted-foreground",children:"Across all nodes"})]})]}),s.jsxs(l,{children:[s.jsxs(r,{className:"flex flex-row items-center justify-between pb-2",children:[s.jsx(a,{className:"text-sm font-medium",children:"Memory Usage"}),s.jsx(p,{className:"h-4 w-4 text-muted-foreground"})]}),s.jsxs(i,{children:[s.jsxs("div",{className:"text-2xl font-bold",children:[t.memoryUsage,"%"]}),s.jsx("p",{className:"text-xs text-muted-foreground",children:"Across all nodes"})]})]})]}),s.jsxs("div",{className:"space-y-4",children:[s.jsx("h2",{className:"text-xl font-semibold tracking-tight",children:"System Nodes"}),s.jsx("div",{className:"grid gap-4 md:grid-cols-2",children:x.map(e=>s.jsxs(l,{children:[s.jsxs(r,{className:"flex flex-row items-center justify-between pb-2",children:[s.jsx(a,{className:"text-lg font-semibold",children:e.name}),s.jsx("div",{className:`px-2 py-1 rounded-full text-xs font-semibold ${e.status==="healthy"?"bg-green-500/20 text-green-500":"bg-yellow-500/20 text-yellow-500"}`,children:e.status})]}),s.jsx(i,{children:s.jsxs("div",{className:"space-y-4",children:[s.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[s.jsxs("div",{className:"space-y-2",children:[s.jsx("p",{className:"text-sm text-muted-foreground",children:"CPU Usage"}),s.jsxs("div",{className:"text-sm",children:[e.resources.cpu.used,"/",e.resources.cpu.total," cores"]})]}),s.jsxs("div",{className:"space-y-2",children:[s.jsx("p",{className:"text-sm text-muted-foreground",children:"Memory"}),s.jsxs("div",{className:"text-sm",children:[e.resources.memory.used,"/",e.resources.memory.total," GB"]})]})]}),s.jsx(c,{asChild:!0,className:"w-full",children:s.jsx(n,{to:`/display/systems/${d}/nodes/${e.id}`,children:"View Details"})})]})})]},e.id))})]}),s.jsxs("div",{className:"space-y-4",children:[s.jsx("h2",{className:"text-xl font-semibold tracking-tight",children:"System Environments"}),s.jsx("div",{className:"grid gap-4 md:grid-cols-2 lg:grid-cols-3",children:o.map(e=>s.jsxs(l,{children:[s.jsxs(r,{className:"flex flex-row items-center justify-between pb-2",children:[s.jsx(a,{className:"text-lg font-semibold",children:e.name}),s.jsx("div",{className:`px-2 py-1 rounded-full text-xs font-semibold ${e.status==="running"?"bg-green-500/20 text-green-500":"bg-yellow-500/20 text-yellow-500"}`,children:e.status})]}),s.jsx(i,{children:s.jsxs("div",{className:"space-y-4",children:[s.jsxs("div",{className:"space-y-2",children:[s.jsxs("p",{className:"text-sm text-muted-foreground",children:["Type: ",e.type]}),s.jsxs("p",{className:"text-sm text-muted-foreground",children:["Image: ",e.image]}),s.jsxs("p",{className:"text-sm text-muted-foreground",children:["Resources: ",e.resources.cpu," cores, ",e.resources.memory,"MB"]})]}),s.jsx(c,{asChild:!0,className:"w-full",children:s.jsx(n,{to:`/display/systems/${d}/nodes/${e.nodeId}/environments/${e.id}`,children:"View Details"})})]})})]},e.id))})]})]})}export{U as default};
