import{r as c,b as v,j as e,B as m,I as C}from"./index-Dn2-abxs.js";import{C as u,c as p,a as h,d as y}from"./card-BnrsOBg_.js";import{T as S}from"./textarea-CI5-_xTg.js";function E({configurations:t,selectedImage:i,onSelectImage:r,loading:o}){return o?e.jsx(u,{children:e.jsx(p,{className:"p-6",children:"Loading configurations..."})}):e.jsxs(u,{className:"mb-6",children:[e.jsx(h,{children:"Available Configurations"}),e.jsx(p,{children:e.jsx("div",{className:"grid gap-4",children:t.map(a=>e.jsx(m,{variant:i.name===a.name?"default":"outline",className:"w-full text-left",onClick:()=>r(a),children:a.name},a.name))})})]})}function N({selectedImage:t,onUpdateImage:i,onSave:r,onDelete:o}){return e.jsxs(u,{children:[e.jsx(h,{children:"Edit Configuration"}),e.jsx(p,{children:e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"text-sm font-medium",children:"Name"}),e.jsx(C,{value:t.name,onChange:a=>i({...t,name:a.target.value}),placeholder:"Configuration name"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"text-sm font-medium",children:"Content"}),e.jsx(S,{value:t.content,onChange:a=>i({...t,content:a.target.value}),placeholder:"Configuration content",className:"min-h-[200px]"})]})]})}),e.jsxs(y,{className:"flex justify-between",children:[e.jsx(m,{onClick:r,children:"Save Changes"}),e.jsx(m,{variant:"destructive",onClick:o,disabled:!t.name,children:"Delete Configuration"})]})]})}function F(){const[t,i]=c.useState({name:"",content:""}),[r,o]=c.useState([]),[a,g]=c.useState(!0),{toast:s}=v();c.useEffect(()=>{l()},[]);const l=async()=>{try{console.log("Fetching containers...");const n=await fetch("/api/get_containers",{method:"GET",headers:{"Content-Type":"application/json"},credentials:"include"}),f=n.headers.get("content-type");if(n.ok)if(f&&f.includes("application/json")){const d=await n.json();o(d.images)}else{const d=await n.text();console.error("Received non-JSON response:",d),s({title:"Error",description:"Invalid response format from server",variant:"destructive"})}}catch(n){console.error("Error fetching images:",n),s({title:"Error",description:"Failed to fetch images",variant:"destructive"})}finally{g(!1)}},x=async()=>{try{console.log("Updating container..."),(await fetch("/api/write_containers",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({filename:t.name,content:t.content})})).ok?(s({title:"Success",description:"Successfully updated image."}),l()):s({title:"Error",description:"Failed to update image",variant:"destructive"})}catch(n){console.error("Error updating image:",n),s({title:"Error",description:"Failed to update image",variant:"destructive"})}},j=async()=>{try{(await fetch("/api/delete_container",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({filename:t.name})})).ok?(s({title:"Success",description:"Successfully deleted image. Irreversible btw."}),i({name:"",content:""}),l()):s({title:"Error",description:"Failed to delete image.",variant:"destructive"})}catch(n){console.error("Error deleting image:",n),s({title:"Error",description:"Failed to delete image",variant:"destructive"})}};return e.jsxs("div",{className:"space-y-6",children:[e.jsx(E,{configurations:r,selectedImage:t,onSelectImage:i,loading:a}),e.jsx(N,{selectedImage:t,onUpdateImage:i,onSave:x,onDelete:j})]})}export{F as default};
