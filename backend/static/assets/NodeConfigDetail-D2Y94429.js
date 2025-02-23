import{c as p,u as g,j as e,B as a,L as x,a as d,I as i}from"./index-CxHL8qMa.js";import{C as n,a as c,b as o,c as m}from"./card-II-OpLe_.js";import{T as N}from"./textarea-BMsAbUQG.js";import{t as h}from"./test-data-DJtYMeWy.js";import{P as f}from"./plus-DLFrxxNC.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=p("Container",[["path",{d:"M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z",key:"1t2lqe"}],["path",{d:"M10 21.9V14L2.1 9.1",key:"o7czzq"}],["path",{d:"m10 14 11.9-6.9",key:"zm5e20"}],["path",{d:"M14 19.8v-8.1",key:"159ecu"}],["path",{d:"M18 17.5V9.4",key:"11uown"}]]);function M(){const{systemId:l,nodeId:t}=g(),r=h.nodes[t||""],j=h.systems.find(s=>s.id===l),u=(r==null?void 0:r.environments.map(s=>h.environments[s]))||[];return!r||!j?e.jsx("div",{children:"Node not found"}):e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-3xl font-bold tracking-tight",children:"Configure Node"}),e.jsxs("p",{className:"text-muted-foreground",children:["Configure ",r.name," in ",j.name]})]}),e.jsx("div",{className:"flex gap-2",children:e.jsx(a,{variant:"outline",asChild:!0,children:e.jsx(x,{to:`/display/systems/${l}/nodes/${t}`,children:"View Node"})})})]}),e.jsxs(n,{children:[e.jsx(c,{children:e.jsx(o,{children:"Node Settings"})}),e.jsx(m,{children:e.jsxs("form",{className:"space-y-4",children:[e.jsxs("div",{className:"grid gap-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(d,{htmlFor:"name",children:"Node Name"}),e.jsx(i,{id:"name",defaultValue:r.name,placeholder:"Enter node name"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(d,{htmlFor:"description",children:"Description"}),e.jsx(N,{id:"description",placeholder:"Enter node description"})]})]}),e.jsx(a,{children:"Save Changes"})]})})]}),e.jsxs(n,{children:[e.jsx(c,{children:e.jsx(o,{children:"Resource Configuration"})}),e.jsx(m,{children:e.jsxs("form",{className:"space-y-4",children:[e.jsxs("div",{className:"grid gap-4 sm:grid-cols-3",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(d,{htmlFor:"cpu",children:"CPU Cores"}),e.jsx(i,{id:"cpu",type:"number",defaultValue:r.resources.cpu.total,min:1}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Available: ",r.resources.cpu.available," cores"]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(d,{htmlFor:"memory",children:"Memory (GB)"}),e.jsx(i,{id:"memory",type:"number",defaultValue:r.resources.memory.total,min:1}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Available: ",r.resources.memory.available," GB"]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(d,{htmlFor:"storage",children:"Storage (GB)"}),e.jsx(i,{id:"storage",type:"number",defaultValue:r.resources.storage.total,min:1}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Available: ",r.resources.storage.available," GB"]})]})]}),e.jsx(a,{children:"Update Resources"})]})})]}),e.jsxs(n,{children:[e.jsx(c,{children:e.jsx(o,{children:"Network Configuration"})}),e.jsx(m,{children:e.jsxs("form",{className:"space-y-4",children:[e.jsxs("div",{className:"grid gap-4 sm:grid-cols-2",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(d,{htmlFor:"networkMode",children:"Network Mode"}),e.jsx(i,{id:"networkMode",defaultValue:"bridge",placeholder:"Enter network mode"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(d,{htmlFor:"subnet",children:"Subnet"}),e.jsx(i,{id:"subnet",placeholder:"Enter subnet"})]})]}),e.jsx(a,{children:"Update Network"})]})})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("h2",{className:"text-xl font-semibold tracking-tight",children:"Node Environments"}),e.jsxs(a,{children:[e.jsx(f,{className:"mr-2 h-4 w-4"}),"Add Environment"]})]}),e.jsx("div",{className:"grid gap-4 md:grid-cols-2 lg:grid-cols-3",children:u.map(s=>e.jsxs(n,{children:[e.jsxs(c,{className:"flex flex-row items-center justify-between pb-2",children:[e.jsx(o,{className:"text-lg font-semibold",children:s.name}),e.jsx(y,{className:"h-5 w-5 text-muted-foreground"})]}),e.jsx(m,{children:e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-2",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"Status"}),e.jsx("div",{className:`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.status==="running"?"bg-green-500/20 text-green-500":"bg-yellow-500/20 text-yellow-500"}`,children:s.status})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"Type"}),e.jsx("p",{className:"text-sm",children:s.type})]})]}),e.jsxs("div",{className:"pt-2",children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"Resources"}),e.jsxs("div",{className:"grid grid-cols-2 gap-2",children:[e.jsxs("p",{className:"text-sm",children:["CPU: ",s.resources.cpu," cores"]}),e.jsxs("p",{className:"text-sm",children:["Memory: ",s.resources.memory," MB"]})]})]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(a,{asChild:!0,className:"flex-1",children:e.jsx(x,{to:`/config/systems/${l}/nodes/${t}/environments/${s.id}`,children:"Configure"})}),e.jsx(a,{variant:"outline",asChild:!0,children:e.jsx(x,{to:`/display/systems/${l}/nodes/${t}/environments/${s.id}`,children:"View"})})]})]})})]},s.id))})]})]})}export{M as default};
