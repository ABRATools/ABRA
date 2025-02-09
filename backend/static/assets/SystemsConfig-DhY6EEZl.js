import{j as s,B as a,I as i,L as t}from"./index-CxHL8qMa.js";import{C as l,a as r,b as d,c as n}from"./card-II-OpLe_.js";import{t as c}from"./test-data-DJtYMeWy.js";import{P as x}from"./plus-DLFrxxNC.js";import{S as m}from"./server-B56TYr6X.js";function g(){return s.jsxs("div",{className:"space-y-6",children:[s.jsxs("div",{className:"flex justify-between items-center",children:[s.jsxs("div",{children:[s.jsx("h1",{className:"text-3xl font-bold tracking-tight",children:"Systems Configuration"}),s.jsx("p",{className:"text-muted-foreground",children:"Configure and manage your systems"})]}),s.jsxs(a,{children:[s.jsx(x,{className:"mr-2 h-4 w-4"}),"Add System"]})]}),s.jsx("div",{className:"flex gap-4",children:s.jsx(i,{placeholder:"Search systems...",className:"max-w-sm"})}),s.jsx("div",{className:"grid gap-6 md:grid-cols-2 lg:grid-cols-3",children:c.systems.map(e=>s.jsxs(l,{children:[s.jsxs(r,{className:"flex flex-row items-center justify-between space-y-0 pb-2",children:[s.jsx(d,{className:"text-xl font-semibold",children:e.name}),s.jsx(m,{className:"h-5 w-5 text-muted-foreground"})]}),s.jsx(n,{children:s.jsxs("div",{className:"space-y-4",children:[s.jsxs("div",{className:"space-y-2",children:[s.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[s.jsxs("div",{children:[s.jsx("p",{className:"text-sm text-muted-foreground",children:"Nodes"}),s.jsx("p",{className:"text-sm font-medium",children:e.nodeCount})]}),s.jsxs("div",{children:[s.jsx("p",{className:"text-sm text-muted-foreground",children:"Containers"}),s.jsx("p",{className:"text-sm font-medium",children:e.totalContainers})]})]}),s.jsx("div",{className:"grid grid-cols-2 gap-4",children:s.jsxs("div",{children:[s.jsx("p",{className:"text-sm text-muted-foreground",children:"Status"}),s.jsx("div",{className:`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${e.status==="healthy"?"bg-green-500/20 text-green-500":"bg-yellow-500/20 text-yellow-500"}`,children:e.status})]})})]}),s.jsxs("div",{className:"flex gap-2",children:[s.jsx(a,{asChild:!0,className:"flex-1",children:s.jsx(t,{to:`/config/systems/${e.id}`,children:"Configure System"})}),s.jsx(a,{variant:"outline",asChild:!0,children:s.jsx(t,{to:`/display/systems/${e.id}`,children:"View"})})]})]})})]},e.id))})]})}export{g as default};
