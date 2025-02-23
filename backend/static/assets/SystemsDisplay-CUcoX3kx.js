import{j as e,B as n,L as c,S as j}from"./index-DOsXcJXR.js";import{C as l,a as r,b as d,c as i}from"./card-BYGEtsEE.js";import{t as u}from"./test-data-DJtYMeWy.js";import{S as f}from"./server-ByQD3EUM.js";import{H as g}from"./hard-drive-B3idsjHp.js";import{B as N}from"./box-MTTg-lnx.js";import{A as p}from"./activity-PfkOxJk6.js";function M(){const{systems:t}=u,x=t.reduce((s,a)=>s+a.totalContainers,0),o=t.reduce((s,a)=>s+a.nodeCount,0),m=Math.round(t.reduce((s,a)=>s+a.cpuUsage,0)/t.length),h=Math.round(t.reduce((s,a)=>s+a.memoryUsage,0)/t.length);return e.jsxs("div",{className:"space-y-6",children:[e.jsx("div",{className:"flex justify-between items-center",children:e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold tracking-tight",children:"Systems Overview"}),e.jsx("p",{className:"text-muted-foreground",children:"Monitor and manage your container systems"})]})}),e.jsxs("div",{className:"grid gap-4 md:grid-cols-2 lg:grid-cols-4",children:[e.jsxs(l,{children:[e.jsxs(r,{className:"flex flex-row items-center justify-between pb-2",children:[e.jsx(d,{className:"text-sm font-medium",children:"Total Systems"}),e.jsx(f,{className:"h-4 w-4 text-muted-foreground"})]}),e.jsxs(i,{children:[e.jsx("div",{className:"text-2xl font-bold",children:t.length}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Active systems"})]})]}),e.jsxs(l,{children:[e.jsxs(r,{className:"flex flex-row items-center justify-between pb-2",children:[e.jsx(d,{className:"text-sm font-medium",children:"Total Nodes"}),e.jsx(g,{className:"h-4 w-4 text-muted-foreground"})]}),e.jsxs(i,{children:[e.jsx("div",{className:"text-2xl font-bold",children:o}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Active nodes"})]})]}),e.jsxs(l,{children:[e.jsxs(r,{className:"flex flex-row items-center justify-between pb-2",children:[e.jsx(d,{className:"text-sm font-medium",children:"Total Containers"}),e.jsx(N,{className:"h-4 w-4 text-muted-foreground"})]}),e.jsxs(i,{children:[e.jsx("div",{className:"text-2xl font-bold",children:x}),e.jsx("p",{className:"text-xs text-muted-foreground",children:"Running containers"})]})]}),e.jsxs(l,{children:[e.jsxs(r,{className:"flex flex-row items-center justify-between pb-2",children:[e.jsx(d,{className:"text-sm font-medium",children:"Avg Resource Usage"}),e.jsx(p,{className:"h-4 w-4 text-muted-foreground"})]}),e.jsxs(i,{children:[e.jsxs("div",{className:"text-2xl font-bold",children:[m,"% CPU"]}),e.jsxs("p",{className:"text-xs text-muted-foreground",children:[h,"% Memory"]})]})]})]}),e.jsx("div",{className:"grid gap-6 md:grid-cols-2 lg:grid-cols-3",children:t.map(s=>e.jsxs(l,{children:[e.jsxs(r,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[e.jsx(d,{className:"text-xl font-semibold",children:s.name}),e.jsx("div",{className:`px-2 py-1 rounded-full text-xs font-semibold ${s.status==="healthy"?"bg-green-500/20 text-green-500":"bg-yellow-500/20 text-yellow-500"}`,children:s.status})]}),e.jsx(i,{children:e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"Nodes"}),e.jsx("p",{className:"text-sm font-medium",children:s.nodeCount})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"Containers"}),e.jsx("p",{className:"text-sm font-medium",children:s.totalContainers})]})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"CPU Usage"}),e.jsxs("p",{className:"text-sm font-medium",children:[s.cpuUsage,"%"]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"Memory Usage"}),e.jsxs("p",{className:"text-sm font-medium",children:[s.memoryUsage,"%"]})]})]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(n,{asChild:!0,className:"flex-1",children:e.jsx(c,{to:`/display/systems/${s.id}`,children:"View Details"})}),e.jsx(n,{variant:"outline",asChild:!0,children:e.jsx(c,{to:`/config/systems/${s.id}`,children:e.jsx(j,{className:"h-4 w-4"})})})]})]})})]},s.id))})]})}export{M as default};
