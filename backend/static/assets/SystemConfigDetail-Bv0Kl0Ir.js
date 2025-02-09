import{u as j,j as s,B as a,L as r,a as l,I as d}from"./index-nPn9rl7P.js";import{C as n,a as c,b as m,c as x}from"./card-DuKVRNFm.js";import{T as u}from"./textarea-Bf3xSBIf.js";import{t as o}from"./test-data-DJtYMeWy.js";import{P as p}from"./plus--zcNaozz.js";import{H as f}from"./hard-drive-B3jgF85m.js";function w(){const{systemId:t}=j(),i=o.systems.find(e=>e.id===t),h=(i==null?void 0:i.nodes.map(e=>o.nodes[e]))||[];return i?s.jsxs("div",{className:"space-y-6",children:[s.jsxs("div",{className:"flex justify-between items-center",children:[s.jsxs("div",{children:[s.jsx("h1",{className:"text-3xl font-bold tracking-tight",children:"Configure System"}),s.jsxs("p",{className:"text-muted-foreground",children:["Configure ",i.name," settings and resources"]})]}),s.jsx("div",{className:"flex gap-2",children:s.jsx(a,{variant:"outline",asChild:!0,children:s.jsx(r,{to:`/display/systems/${t}`,children:"View System"})})})]}),s.jsxs(n,{children:[s.jsx(c,{children:s.jsx(m,{children:"System Settings"})}),s.jsx(x,{children:s.jsxs("form",{className:"space-y-4",children:[s.jsxs("div",{className:"grid gap-4",children:[s.jsxs("div",{className:"space-y-2",children:[s.jsx(l,{htmlFor:"name",children:"System Name"}),s.jsx(d,{id:"name",defaultValue:i.name,placeholder:"Enter system name"})]}),s.jsxs("div",{className:"space-y-2",children:[s.jsx(l,{htmlFor:"description",children:"Description"}),s.jsx(u,{id:"description",defaultValue:i.description,placeholder:"Enter system description"})]})]}),s.jsx(a,{children:"Save Changes"})]})})]}),s.jsxs(n,{children:[s.jsx(c,{children:s.jsx(m,{children:"Resource Limits"})}),s.jsx(x,{children:s.jsxs("form",{className:"space-y-4",children:[s.jsxs("div",{className:"grid gap-4 sm:grid-cols-2",children:[s.jsxs("div",{className:"space-y-2",children:[s.jsx(l,{htmlFor:"maxNodes",children:"Maximum Nodes"}),s.jsx(d,{id:"maxNodes",type:"number",defaultValue:10,min:1})]}),s.jsxs("div",{className:"space-y-2",children:[s.jsx(l,{htmlFor:"maxContainers",children:"Maximum Containers"}),s.jsx(d,{id:"maxContainers",type:"number",defaultValue:50,min:1})]})]}),s.jsx(a,{children:"Update Limits"})]})})]}),s.jsxs("div",{className:"space-y-4",children:[s.jsxs("div",{className:"flex justify-between items-center",children:[s.jsx("h2",{className:"text-xl font-semibold tracking-tight",children:"System Nodes"}),s.jsxs(a,{children:[s.jsx(p,{className:"mr-2 h-4 w-4"}),"Add Node"]})]}),s.jsx("div",{className:"grid gap-4 md:grid-cols-2 lg:grid-cols-3",children:h.map(e=>s.jsxs(n,{children:[s.jsxs(c,{className:"flex flex-row items-center justify-between pb-2",children:[s.jsx(m,{className:"text-lg font-semibold",children:e.name}),s.jsx(f,{className:"h-5 w-5 text-muted-foreground"})]}),s.jsx(x,{children:s.jsxs("div",{className:"space-y-4",children:[s.jsx("div",{className:"space-y-2",children:s.jsxs("div",{className:"grid grid-cols-2 gap-2",children:[s.jsxs("div",{children:[s.jsx("p",{className:"text-sm text-muted-foreground",children:"Status"}),s.jsx("div",{className:`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${e.status==="healthy"?"bg-green-500/20 text-green-500":"bg-yellow-500/20 text-yellow-500"}`,children:e.status})]}),s.jsxs("div",{children:[s.jsx("p",{className:"text-sm text-muted-foreground",children:"Environments"}),s.jsx("p",{className:"text-sm",children:e.environments.length})]})]})}),s.jsxs("div",{className:"flex gap-2",children:[s.jsx(a,{asChild:!0,className:"flex-1",children:s.jsx(r,{to:`/config/systems/${t}/nodes/${e.id}`,children:"Configure Node"})}),s.jsx(a,{variant:"outline",asChild:!0,children:s.jsx(r,{to:`/display/systems/${t}/nodes/${e.id}`,children:"View"})})]})]})})]},e.id))})]})]}):s.jsx("div",{children:"System not found"})}export{w as default};
