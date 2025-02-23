import{r as s,j as a,d as V,R as N,e as H,f as he,g as B}from"./index-CEwaw2xf.js";import{u as Y}from"./index-B3xuYRwA.js";import{C as q,a as z,c as Z,d as J}from"./card-Drl1U8-W.js";function x(e,t,{checkForDefaultPrevented:o=!0}={}){return function(r){if(e==null||e(r),o===!1||!r.defaultPrevented)return t==null?void 0:t(r)}}function $(e,t){if(typeof e=="function")return e(t);e!=null&&(e.current=t)}function Q(...e){return t=>{let o=!1;const n=e.map(r=>{const i=$(r,t);return!o&&typeof i=="function"&&(o=!0),i});if(o)return()=>{for(let r=0;r<n.length;r++){const i=n[r];typeof i=="function"?i():$(e[r],null)}}}}function F(...e){return s.useCallback(Q(...e),e)}var M=s.forwardRef((e,t)=>{const{children:o,...n}=e,r=s.Children.toArray(o),i=r.find(xe);if(i){const u=i.props.children,f=r.map(d=>d===i?s.Children.count(u)>1?s.Children.only(null):s.isValidElement(u)?u.props.children:null:d);return a.jsx(O,{...n,ref:t,children:s.isValidElement(u)?s.cloneElement(u,void 0,f):null})}return a.jsx(O,{...n,ref:t,children:o})});M.displayName="Slot";var O=s.forwardRef((e,t)=>{const{children:o,...n}=e;if(s.isValidElement(o)){const r=Ne(o),i=Te(n,o.props);return o.type!==s.Fragment&&(i.ref=t?Q(t,r):r),s.cloneElement(o,i)}return s.Children.count(o)>1?s.Children.only(null):null});O.displayName="SlotClone";var Ie=({children:e})=>a.jsx(a.Fragment,{children:e});function xe(e){return s.isValidElement(e)&&e.type===Ie}function Te(e,t){const o={...t};for(const n in t){const r=e[n],i=t[n];/^on[A-Z]/.test(n)?r&&i?o[n]=(...f)=>{i(...f),r(...f)}:r&&(o[n]=r):n==="style"?o[n]={...r,...i}:n==="className"&&(o[n]=[r,i].filter(Boolean).join(" "))}return{...e,...o}}function Ne(e){var n,r;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,o=t&&"isReactWarning"in t&&t.isReactWarning;return o?e.ref:(t=(r=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:r.get,o=t&&"isReactWarning"in t&&t.isReactWarning,o?e.props.ref:e.props.ref||e.ref)}function we(e){const t=e+"CollectionProvider",[o,n]=V(t),[r,i]=o(t,{collectionRef:{current:null},itemMap:new Map}),u=v=>{const{scope:l,children:b}=v,h=N.useRef(null),C=N.useRef(new Map).current;return a.jsx(r,{scope:l,itemMap:C,collectionRef:h,children:b})};u.displayName=t;const f=e+"CollectionSlot",d=N.forwardRef((v,l)=>{const{scope:b,children:h}=v,C=i(f,b),R=F(l,C.collectionRef);return a.jsx(M,{ref:R,children:h})});d.displayName=f;const c=e+"CollectionItemSlot",p="data-radix-collection-item",m=N.forwardRef((v,l)=>{const{scope:b,children:h,...C}=v,R=N.useRef(null),w=F(l,R),y=i(c,b);return N.useEffect(()=>(y.itemMap.set(R,{ref:R,...C}),()=>void y.itemMap.delete(R))),a.jsx(M,{[p]:"",ref:w,children:h})});m.displayName=c;function g(v){const l=i(e+"CollectionConsumer",v);return N.useCallback(()=>{const h=l.collectionRef.current;if(!h)return[];const C=Array.from(h.querySelectorAll(`[${p}]`));return Array.from(l.itemMap.values()).sort((y,E)=>C.indexOf(y.ref.current)-C.indexOf(E.ref.current))},[l.collectionRef,l.itemMap])}return[{Provider:u,Slot:d,ItemSlot:m},g,n]}var ye=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","span","svg","ul"],A=ye.reduce((e,t)=>{const o=s.forwardRef((n,r)=>{const{asChild:i,...u}=n,f=i?M:t;return typeof window<"u"&&(window[Symbol.for("radix-ui")]=!0),a.jsx(f,{...u,ref:r})});return o.displayName=`Primitive.${t}`,{...e,[t]:o}},{}),Ae=s.createContext(void 0);function X(e){const t=s.useContext(Ae);return e||t||"ltr"}var _="rovingFocusGroup.onEntryFocus",Ee={bubbles:!1,cancelable:!0},j="RovingFocusGroup",[D,ee,Se]=we(j),[Fe,te]=V(j,[Se]),[Me,je]=Fe(j),ne=s.forwardRef((e,t)=>a.jsx(D.Provider,{scope:e.__scopeRovingFocusGroup,children:a.jsx(D.Slot,{scope:e.__scopeRovingFocusGroup,children:a.jsx(Pe,{...e,ref:t})})}));ne.displayName=j;var Pe=s.forwardRef((e,t)=>{const{__scopeRovingFocusGroup:o,orientation:n,loop:r=!1,dir:i,currentTabStopId:u,defaultCurrentTabStopId:f,onCurrentTabStopIdChange:d,onEntryFocus:c,preventScrollOnEntryFocus:p=!1,...m}=e,g=s.useRef(null),v=F(t,g),l=X(i),[b=null,h]=H({prop:u,defaultProp:f,onChange:d}),[C,R]=s.useState(!1),w=he(c),y=ee(o),E=s.useRef(!1),[ve,K]=s.useState(0);return s.useEffect(()=>{const I=g.current;if(I)return I.addEventListener(_,w),()=>I.removeEventListener(_,w)},[w]),a.jsx(Me,{scope:o,orientation:n,dir:l,loop:r,currentTabStopId:b,onItemFocus:s.useCallback(I=>h(I),[h]),onItemShiftTab:s.useCallback(()=>R(!0),[]),onFocusableItemAdd:s.useCallback(()=>K(I=>I+1),[]),onFocusableItemRemove:s.useCallback(()=>K(I=>I-1),[]),children:a.jsx(A.div,{tabIndex:C||ve===0?-1:0,"data-orientation":n,...m,ref:v,style:{outline:"none",...e.style},onMouseDown:x(e.onMouseDown,()=>{E.current=!0}),onFocus:x(e.onFocus,I=>{const ge=!E.current;if(I.target===I.currentTarget&&ge&&!C){const W=new CustomEvent(_,Ee);if(I.currentTarget.dispatchEvent(W),!W.defaultPrevented){const P=y().filter(T=>T.focusable),Ce=P.find(T=>T.active),be=P.find(T=>T.id===b),Re=[Ce,be,...P].filter(Boolean).map(T=>T.ref.current);se(Re,p)}}E.current=!1}),onBlur:x(e.onBlur,()=>R(!1))})})}),oe="RovingFocusGroupItem",re=s.forwardRef((e,t)=>{const{__scopeRovingFocusGroup:o,focusable:n=!0,active:r=!1,tabStopId:i,...u}=e,f=Y(),d=i||f,c=je(oe,o),p=c.currentTabStopId===d,m=ee(o),{onFocusableItemAdd:g,onFocusableItemRemove:v}=c;return s.useEffect(()=>{if(n)return g(),()=>v()},[n,g,v]),a.jsx(D.ItemSlot,{scope:o,id:d,focusable:n,active:r,children:a.jsx(A.span,{tabIndex:p?0:-1,"data-orientation":c.orientation,...u,ref:t,onMouseDown:x(e.onMouseDown,l=>{n?c.onItemFocus(d):l.preventDefault()}),onFocus:x(e.onFocus,()=>c.onItemFocus(d)),onKeyDown:x(e.onKeyDown,l=>{if(l.key==="Tab"&&l.shiftKey){c.onItemShiftTab();return}if(l.target!==l.currentTarget)return;const b=De(l,c.orientation,c.dir);if(b!==void 0){if(l.metaKey||l.ctrlKey||l.altKey||l.shiftKey)return;l.preventDefault();let C=m().filter(R=>R.focusable).map(R=>R.ref.current);if(b==="last")C.reverse();else if(b==="prev"||b==="next"){b==="prev"&&C.reverse();const R=C.indexOf(l.currentTarget);C=c.loop?Ue(C,R+1):C.slice(R+1)}setTimeout(()=>se(C))}})})})});re.displayName=oe;var _e={ArrowLeft:"prev",ArrowUp:"prev",ArrowRight:"next",ArrowDown:"next",PageUp:"first",Home:"first",PageDown:"last",End:"last"};function Oe(e,t){return t!=="rtl"?e:e==="ArrowLeft"?"ArrowRight":e==="ArrowRight"?"ArrowLeft":e}function De(e,t,o){const n=Oe(e.key,o);if(!(t==="vertical"&&["ArrowLeft","ArrowRight"].includes(n))&&!(t==="horizontal"&&["ArrowUp","ArrowDown"].includes(n)))return _e[n]}function se(e,t=!1){const o=document.activeElement;for(const n of e)if(n===o||(n.focus({preventScroll:t}),document.activeElement!==o))return}function Ue(e,t){return e.map((o,n)=>e[(t+n)%e.length])}var Le=ne,Ve=re;function Ge(e,t){return s.useReducer((o,n)=>t[o][n]??o,e)}var ie=e=>{const{present:t,children:o}=e,n=ke(t),r=typeof o=="function"?o({present:n.isPresent}):s.Children.only(o),i=F(n.ref,Ke(r));return typeof o=="function"||n.isPresent?s.cloneElement(r,{ref:i}):null};ie.displayName="Presence";function ke(e){const[t,o]=s.useState(),n=s.useRef({}),r=s.useRef(e),i=s.useRef("none"),u=e?"mounted":"unmounted",[f,d]=Ge(u,{mounted:{UNMOUNT:"unmounted",ANIMATION_OUT:"unmountSuspended"},unmountSuspended:{MOUNT:"mounted",ANIMATION_END:"unmounted"},unmounted:{MOUNT:"mounted"}});return s.useEffect(()=>{const c=S(n.current);i.current=f==="mounted"?c:"none"},[f]),B(()=>{const c=n.current,p=r.current;if(p!==e){const g=i.current,v=S(c);e?d("MOUNT"):v==="none"||(c==null?void 0:c.display)==="none"?d("UNMOUNT"):d(p&&g!==v?"ANIMATION_OUT":"UNMOUNT"),r.current=e}},[e,d]),B(()=>{if(t){let c;const p=t.ownerDocument.defaultView??window,m=v=>{const b=S(n.current).includes(v.animationName);if(v.target===t&&b&&(d("ANIMATION_END"),!r.current)){const h=t.style.animationFillMode;t.style.animationFillMode="forwards",c=p.setTimeout(()=>{t.style.animationFillMode==="forwards"&&(t.style.animationFillMode=h)})}},g=v=>{v.target===t&&(i.current=S(n.current))};return t.addEventListener("animationstart",g),t.addEventListener("animationcancel",m),t.addEventListener("animationend",m),()=>{p.clearTimeout(c),t.removeEventListener("animationstart",g),t.removeEventListener("animationcancel",m),t.removeEventListener("animationend",m)}}else d("ANIMATION_END")},[t,d]),{isPresent:["mounted","unmountSuspended"].includes(f),ref:s.useCallback(c=>{c&&(n.current=getComputedStyle(c)),o(c)},[])}}function S(e){return(e==null?void 0:e.animationName)||"none"}function Ke(e){var n,r;let t=(n=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:n.get,o=t&&"isReactWarning"in t&&t.isReactWarning;return o?e.ref:(t=(r=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:r.get,o=t&&"isReactWarning"in t&&t.isReactWarning,o?e.props.ref:e.props.ref||e.ref)}var G="Tabs",[We,Je]=V(G,[te]),ae=te(),[Be,k]=We(G),ce=s.forwardRef((e,t)=>{const{__scopeTabs:o,value:n,onValueChange:r,defaultValue:i,orientation:u="horizontal",dir:f,activationMode:d="automatic",...c}=e,p=X(f),[m,g]=H({prop:n,onChange:r,defaultProp:i});return a.jsx(Be,{scope:o,baseId:Y(),value:m,onValueChange:g,orientation:u,dir:p,activationMode:d,children:a.jsx(A.div,{dir:p,"data-orientation":u,...c,ref:t})})});ce.displayName=G;var ue="TabsList",le=s.forwardRef((e,t)=>{const{__scopeTabs:o,loop:n=!0,...r}=e,i=k(ue,o),u=ae(o);return a.jsx(Le,{asChild:!0,...u,orientation:i.orientation,dir:i.dir,loop:n,children:a.jsx(A.div,{role:"tablist","aria-orientation":i.orientation,...r,ref:t})})});le.displayName=ue;var de="TabsTrigger",U=s.forwardRef((e,t)=>{const{__scopeTabs:o,value:n,disabled:r=!1,...i}=e,u=k(de,o),f=ae(o),d=me(u.baseId,n),c=pe(u.baseId,n),p=n===u.value;return a.jsx(Ve,{asChild:!0,...f,focusable:!r,active:p,children:a.jsx(A.button,{type:"button",role:"tab","aria-selected":p,"aria-controls":c,"data-state":p?"active":"inactive","data-disabled":r?"":void 0,disabled:r,id:d,...i,ref:t,onMouseDown:x(e.onMouseDown,m=>{!r&&m.button===0&&m.ctrlKey===!1?u.onValueChange(n):m.preventDefault()}),onKeyDown:x(e.onKeyDown,m=>{[" ","Enter"].includes(m.key)&&u.onValueChange(n)}),onFocus:x(e.onFocus,()=>{const m=u.activationMode!=="manual";!p&&!r&&m&&u.onValueChange(n)})})})});U.displayName=de;var fe="TabsContent",L=s.forwardRef((e,t)=>{const{__scopeTabs:o,value:n,forceMount:r,children:i,...u}=e,f=k(fe,o),d=me(f.baseId,n),c=pe(f.baseId,n),p=n===f.value,m=s.useRef(p);return s.useEffect(()=>{const g=requestAnimationFrame(()=>m.current=!1);return()=>cancelAnimationFrame(g)},[]),a.jsx(ie,{present:r||p,children:({present:g})=>a.jsx(A.div,{"data-state":p?"active":"inactive","data-orientation":f.orientation,role:"tabpanel","aria-labelledby":d,hidden:!g,id:c,tabIndex:0,...u,ref:t,style:{...e.style,animationDuration:m.current?"0s":void 0},children:g&&i})})});L.displayName=fe;function me(e,t){return`${e}-trigger-${t}`}function pe(e,t){return`${e}-content-${t}`}function $e(){return a.jsxs(q,{children:[a.jsx(z,{children:"Hi"}),a.jsx(Z,{children:"Hello"}),a.jsx(J,{children:"Howdy"})]})}function He(){return a.jsxs(q,{children:[a.jsx(z,{children:"Hi"}),a.jsx(Z,{children:"Hello"}),a.jsx(J,{children:"Howdy"})]})}function Qe(){return a.jsxs(ce,{defaultValue:"view",children:[a.jsxs(le,{children:[a.jsx(U,{value:"view",children:"View"}),a.jsx(U,{value:"upload",children:"Upload"})]}),a.jsxs(L,{value:"view",children:[a.jsx("p",{children:"View container configurations."}),a.jsx($e,{})]}),a.jsxs(L,{value:"upload",children:[a.jsx("p",{children:"Upload new container configuration."}),a.jsx(He,{})]})]})}export{Qe as default};
