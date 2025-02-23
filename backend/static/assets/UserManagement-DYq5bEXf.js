import{c as te,r as i,e as M,f as Et,j as a,P as D,g as J,h as wt,i as me,R as Nt,k as Ct,l as jt,m as St,n as Pt,d as z,X as Rt,b as Dt,B as k,U as Ne,I as $}from"./index-BoM-nQG0.js";import{C as W,a as G,b as K,c as B}from"./card-9_0f6XkA.js";import{u as oe,S as Ce,a as Ot}from"./index-DgbkWPi0.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Tt=te("Key",[["path",{d:"m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4",key:"g0fldk"}],["path",{d:"m21 2-9.6 9.6",key:"1j0ho8"}],["circle",{cx:"7.5",cy:"15.5",r:"5.5",key:"yqb3hr"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const At=te("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Mt=te("UserPlus",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const kt=te("UserX",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"17",x2:"22",y1:"8",y2:"13",key:"3nzzx3"}],["line",{x1:"22",x2:"17",y1:"8",y2:"13",key:"1swrse"}]]);function T(e,t,{checkForDefaultPrevented:n=!0}={}){return function(o){if(e==null||e(o),n===!1||!o.defaultPrevented)return t==null?void 0:t(o)}}var It="DismissableLayer",he="dismissableLayer.update",Lt="dismissableLayer.pointerDownOutside",_t="dismissableLayer.focusOutside",je,Ue=i.createContext({layers:new Set,layersWithOutsidePointerEventsDisabled:new Set,branches:new Set}),We=i.forwardRef((e,t)=>{const{disableOutsidePointerEvents:n=!1,onEscapeKeyDown:r,onPointerDownOutside:o,onFocusOutside:s,onInteractOutside:d,onDismiss:c,...m}=e,f=i.useContext(Ue),[h,v]=i.useState(null),g=(h==null?void 0:h.ownerDocument)??(globalThis==null?void 0:globalThis.document),[,b]=i.useState({}),j=M(t,N=>v(N)),l=Array.from(f.layers),[x]=[...f.layersWithOutsidePointerEventsDisabled].slice(-1),E=l.indexOf(x),C=h?l.indexOf(h):-1,w=f.layersWithOutsidePointerEventsDisabled.size>0,u=C>=E,p=Wt(N=>{const R=N.target,U=[...f.branches].some(ae=>ae.contains(R));!u||U||(o==null||o(N),d==null||d(N),N.defaultPrevented||c==null||c())},g),y=Bt(N=>{const R=N.target;[...f.branches].some(ae=>ae.contains(R))||(s==null||s(N),d==null||d(N),N.defaultPrevented||c==null||c())},g);return Et(N=>{C===f.layers.size-1&&(r==null||r(N),!N.defaultPrevented&&c&&(N.preventDefault(),c()))},g),i.useEffect(()=>{if(h)return n&&(f.layersWithOutsidePointerEventsDisabled.size===0&&(je=g.body.style.pointerEvents,g.body.style.pointerEvents="none"),f.layersWithOutsidePointerEventsDisabled.add(h)),f.layers.add(h),Se(),()=>{n&&f.layersWithOutsidePointerEventsDisabled.size===1&&(g.body.style.pointerEvents=je)}},[h,g,n,f]),i.useEffect(()=>()=>{h&&(f.layers.delete(h),f.layersWithOutsidePointerEventsDisabled.delete(h),Se())},[h,f]),i.useEffect(()=>{const N=()=>b({});return document.addEventListener(he,N),()=>document.removeEventListener(he,N)},[]),a.jsx(D.div,{...m,ref:j,style:{pointerEvents:w?u?"auto":"none":void 0,...e.style},onFocusCapture:T(e.onFocusCapture,y.onFocusCapture),onBlurCapture:T(e.onBlurCapture,y.onBlurCapture),onPointerDownCapture:T(e.onPointerDownCapture,p.onPointerDownCapture)})});We.displayName=It;var Ft="DismissableLayerBranch",Ut=i.forwardRef((e,t)=>{const n=i.useContext(Ue),r=i.useRef(null),o=M(t,r);return i.useEffect(()=>{const s=r.current;if(s)return n.branches.add(s),()=>{n.branches.delete(s)}},[n.branches]),a.jsx(D.div,{...e,ref:o})});Ut.displayName=Ft;function Wt(e,t=globalThis==null?void 0:globalThis.document){const n=J(e),r=i.useRef(!1),o=i.useRef(()=>{});return i.useEffect(()=>{const s=c=>{if(c.target&&!r.current){let m=function(){Be(Lt,n,f,{discrete:!0})};const f={originalEvent:c};c.pointerType==="touch"?(t.removeEventListener("click",o.current),o.current=m,t.addEventListener("click",o.current,{once:!0})):m()}else t.removeEventListener("click",o.current);r.current=!1},d=window.setTimeout(()=>{t.addEventListener("pointerdown",s)},0);return()=>{window.clearTimeout(d),t.removeEventListener("pointerdown",s),t.removeEventListener("click",o.current)}},[t,n]),{onPointerDownCapture:()=>r.current=!0}}function Bt(e,t=globalThis==null?void 0:globalThis.document){const n=J(e),r=i.useRef(!1);return i.useEffect(()=>{const o=s=>{s.target&&!r.current&&Be(_t,n,{originalEvent:s},{discrete:!1})};return t.addEventListener("focusin",o),()=>t.removeEventListener("focusin",o)},[t,n]),{onFocusCapture:()=>r.current=!0,onBlurCapture:()=>r.current=!1}}function Se(){const e=new CustomEvent(he);document.dispatchEvent(e)}function Be(e,t,n,{discrete:r}){const o=n.originalEvent.target,s=new CustomEvent(e,{bubbles:!1,cancelable:!0,detail:n});t&&o.addEventListener(e,t,{once:!0}),r?wt(o,s):o.dispatchEvent(s)}var se="focusScope.autoFocusOnMount",ie="focusScope.autoFocusOnUnmount",Pe={bubbles:!1,cancelable:!0},zt="FocusScope",ze=i.forwardRef((e,t)=>{const{loop:n=!1,trapped:r=!1,onMountAutoFocus:o,onUnmountAutoFocus:s,...d}=e,[c,m]=i.useState(null),f=J(o),h=J(s),v=i.useRef(null),g=M(t,l=>m(l)),b=i.useRef({paused:!1,pause(){this.paused=!0},resume(){this.paused=!1}}).current;i.useEffect(()=>{if(r){let l=function(w){if(b.paused||!c)return;const u=w.target;c.contains(u)?v.current=u:O(v.current,{select:!0})},x=function(w){if(b.paused||!c)return;const u=w.relatedTarget;u!==null&&(c.contains(u)||O(v.current,{select:!0}))},E=function(w){if(document.activeElement===document.body)for(const p of w)p.removedNodes.length>0&&O(c)};document.addEventListener("focusin",l),document.addEventListener("focusout",x);const C=new MutationObserver(E);return c&&C.observe(c,{childList:!0,subtree:!0}),()=>{document.removeEventListener("focusin",l),document.removeEventListener("focusout",x),C.disconnect()}}},[r,c,b.paused]),i.useEffect(()=>{if(c){De.add(b);const l=document.activeElement;if(!c.contains(l)){const E=new CustomEvent(se,Pe);c.addEventListener(se,f),c.dispatchEvent(E),E.defaultPrevented||($t(Ht($e(c)),{select:!0}),document.activeElement===l&&O(c))}return()=>{c.removeEventListener(se,f),setTimeout(()=>{const E=new CustomEvent(ie,Pe);c.addEventListener(ie,h),c.dispatchEvent(E),E.defaultPrevented||O(l??document.body,{select:!0}),c.removeEventListener(ie,h),De.remove(b)},0)}}},[c,f,h,b]);const j=i.useCallback(l=>{if(!n&&!r||b.paused)return;const x=l.key==="Tab"&&!l.altKey&&!l.ctrlKey&&!l.metaKey,E=document.activeElement;if(x&&E){const C=l.currentTarget,[w,u]=Gt(C);w&&u?!l.shiftKey&&E===u?(l.preventDefault(),n&&O(w,{select:!0})):l.shiftKey&&E===w&&(l.preventDefault(),n&&O(u,{select:!0})):E===C&&l.preventDefault()}},[n,r,b.paused]);return a.jsx(D.div,{tabIndex:-1,...d,ref:g,onKeyDown:j})});ze.displayName=zt;function $t(e,{select:t=!1}={}){const n=document.activeElement;for(const r of e)if(O(r,{select:t}),document.activeElement!==n)return}function Gt(e){const t=$e(e),n=Re(t,e),r=Re(t.reverse(),e);return[n,r]}function $e(e){const t=[],n=document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,{acceptNode:r=>{const o=r.tagName==="INPUT"&&r.type==="hidden";return r.disabled||r.hidden||o?NodeFilter.FILTER_SKIP:r.tabIndex>=0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}});for(;n.nextNode();)t.push(n.currentNode);return t}function Re(e,t){for(const n of e)if(!Kt(n,{upTo:t}))return n}function Kt(e,{upTo:t}){if(getComputedStyle(e).visibility==="hidden")return!0;for(;e;){if(t!==void 0&&e===t)return!1;if(getComputedStyle(e).display==="none")return!0;e=e.parentElement}return!1}function Vt(e){return e instanceof HTMLInputElement&&"select"in e}function O(e,{select:t=!1}={}){if(e&&e.focus){const n=document.activeElement;e.focus({preventScroll:!0}),e!==n&&Vt(e)&&t&&e.select()}}var De=Xt();function Xt(){let e=[];return{add(t){const n=e[0];t!==n&&(n==null||n.pause()),e=Oe(e,t),e.unshift(t)},remove(t){var n;e=Oe(e,t),(n=e[0])==null||n.resume()}}}function Oe(e,t){const n=[...e],r=n.indexOf(t);return r!==-1&&n.splice(r,1),n}function Ht(e){return e.filter(t=>t.tagName!=="A")}var Yt="Portal",Ge=i.forwardRef((e,t)=>{var c;const{container:n,...r}=e,[o,s]=i.useState(!1);me(()=>s(!0),[]);const d=n||o&&((c=globalThis==null?void 0:globalThis.document)==null?void 0:c.body);return d?Nt.createPortal(a.jsx(D.div,{...r,ref:t}),d):null});Ge.displayName=Yt;function qt(e,t){return i.useReducer((n,r)=>t[n][r]??n,e)}var ne=e=>{const{present:t,children:n}=e,r=Zt(t),o=typeof n=="function"?n({present:r.isPresent}):i.Children.only(n),s=M(r.ref,Qt(o));return typeof n=="function"||r.isPresent?i.cloneElement(o,{ref:s}):null};ne.displayName="Presence";function Zt(e){const[t,n]=i.useState(),r=i.useRef({}),o=i.useRef(e),s=i.useRef("none"),d=e?"mounted":"unmounted",[c,m]=qt(d,{mounted:{UNMOUNT:"unmounted",ANIMATION_OUT:"unmountSuspended"},unmountSuspended:{MOUNT:"mounted",ANIMATION_END:"unmounted"},unmounted:{MOUNT:"mounted"}});return i.useEffect(()=>{const f=V(r.current);s.current=c==="mounted"?f:"none"},[c]),me(()=>{const f=r.current,h=o.current;if(h!==e){const g=s.current,b=V(f);e?m("MOUNT"):b==="none"||(f==null?void 0:f.display)==="none"?m("UNMOUNT"):m(h&&g!==b?"ANIMATION_OUT":"UNMOUNT"),o.current=e}},[e,m]),me(()=>{if(t){let f;const h=t.ownerDocument.defaultView??window,v=b=>{const l=V(r.current).includes(b.animationName);if(b.target===t&&l&&(m("ANIMATION_END"),!o.current)){const x=t.style.animationFillMode;t.style.animationFillMode="forwards",f=h.setTimeout(()=>{t.style.animationFillMode==="forwards"&&(t.style.animationFillMode=x)})}},g=b=>{b.target===t&&(s.current=V(r.current))};return t.addEventListener("animationstart",g),t.addEventListener("animationcancel",v),t.addEventListener("animationend",v),()=>{h.clearTimeout(f),t.removeEventListener("animationstart",g),t.removeEventListener("animationcancel",v),t.removeEventListener("animationend",v)}}else m("ANIMATION_END")},[t,m]),{isPresent:["mounted","unmountSuspended"].includes(c),ref:i.useCallback(f=>{f&&(r.current=getComputedStyle(f)),n(f)},[])}}function V(e){return(e==null?void 0:e.animationName)||"none"}function Qt(e){var r,o;let t=(r=Object.getOwnPropertyDescriptor(e.props,"ref"))==null?void 0:r.get,n=t&&"isReactWarning"in t&&t.isReactWarning;return n?e.ref:(t=(o=Object.getOwnPropertyDescriptor(e,"ref"))==null?void 0:o.get,n=t&&"isReactWarning"in t&&t.isReactWarning,n?e.props.ref:e.props.ref||e.ref)}var ce=0;function Jt(){i.useEffect(()=>{const e=document.querySelectorAll("[data-radix-focus-guard]");return document.body.insertAdjacentElement("afterbegin",e[0]??Te()),document.body.insertAdjacentElement("beforeend",e[1]??Te()),ce++,()=>{ce===1&&document.querySelectorAll("[data-radix-focus-guard]").forEach(t=>t.remove()),ce--}},[])}function Te(){const e=document.createElement("span");return e.setAttribute("data-radix-focus-guard",""),e.tabIndex=0,e.style.outline="none",e.style.opacity="0",e.style.position="fixed",e.style.pointerEvents="none",e}var P=function(){return P=Object.assign||function(t){for(var n,r=1,o=arguments.length;r<o;r++){n=arguments[r];for(var s in n)Object.prototype.hasOwnProperty.call(n,s)&&(t[s]=n[s])}return t},P.apply(this,arguments)};function Ke(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]]);return n}function en(e,t,n){if(n||arguments.length===2)for(var r=0,o=t.length,s;r<o;r++)(s||!(r in t))&&(s||(s=Array.prototype.slice.call(t,0,r)),s[r]=t[r]);return e.concat(s||Array.prototype.slice.call(t))}var Z="right-scroll-bar-position",Q="width-before-scroll-bar",tn="with-scroll-bars-hidden",nn="--removed-body-scroll-bar-size";function le(e,t){return typeof e=="function"?e(t):e&&(e.current=t),e}function rn(e,t){var n=i.useState(function(){return{value:e,callback:t,facade:{get current(){return n.value},set current(r){var o=n.value;o!==r&&(n.value=r,n.callback(r,o))}}}})[0];return n.callback=t,n.facade}var an=typeof window<"u"?i.useLayoutEffect:i.useEffect,Ae=new WeakMap;function on(e,t){var n=rn(null,function(r){return e.forEach(function(o){return le(o,r)})});return an(function(){var r=Ae.get(n);if(r){var o=new Set(r),s=new Set(e),d=n.current;o.forEach(function(c){s.has(c)||le(c,null)}),s.forEach(function(c){o.has(c)||le(c,d)})}Ae.set(n,e)},[e]),n}function sn(e){return e}function cn(e,t){t===void 0&&(t=sn);var n=[],r=!1,o={read:function(){if(r)throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");return n.length?n[n.length-1]:e},useMedium:function(s){var d=t(s,r);return n.push(d),function(){n=n.filter(function(c){return c!==d})}},assignSyncMedium:function(s){for(r=!0;n.length;){var d=n;n=[],d.forEach(s)}n={push:function(c){return s(c)},filter:function(){return n}}},assignMedium:function(s){r=!0;var d=[];if(n.length){var c=n;n=[],c.forEach(s),d=n}var m=function(){var h=d;d=[],h.forEach(s)},f=function(){return Promise.resolve().then(m)};f(),n={push:function(h){d.push(h),f()},filter:function(h){return d=d.filter(h),n}}}};return o}function ln(e){e===void 0&&(e={});var t=cn(null);return t.options=P({async:!0,ssr:!1},e),t}var Ve=function(e){var t=e.sideCar,n=Ke(e,["sideCar"]);if(!t)throw new Error("Sidecar: please provide `sideCar` property to import the right car");var r=t.read();if(!r)throw new Error("Sidecar medium not found");return i.createElement(r,P({},n))};Ve.isSideCarExport=!0;function un(e,t){return e.useMedium(t),Ve}var Xe=ln(),ue=function(){},re=i.forwardRef(function(e,t){var n=i.useRef(null),r=i.useState({onScrollCapture:ue,onWheelCapture:ue,onTouchMoveCapture:ue}),o=r[0],s=r[1],d=e.forwardProps,c=e.children,m=e.className,f=e.removeScrollBar,h=e.enabled,v=e.shards,g=e.sideCar,b=e.noIsolation,j=e.inert,l=e.allowPinchZoom,x=e.as,E=x===void 0?"div":x,C=e.gapMode,w=Ke(e,["forwardProps","children","className","removeScrollBar","enabled","shards","sideCar","noIsolation","inert","allowPinchZoom","as","gapMode"]),u=g,p=on([n,t]),y=P(P({},w),o);return i.createElement(i.Fragment,null,h&&i.createElement(u,{sideCar:Xe,removeScrollBar:f,shards:v,noIsolation:b,inert:j,setCallbacks:s,allowPinchZoom:!!l,lockRef:n,gapMode:C}),d?i.cloneElement(i.Children.only(c),P(P({},y),{ref:p})):i.createElement(E,P({},y,{className:m,ref:p}),c))});re.defaultProps={enabled:!0,removeScrollBar:!0,inert:!1};re.classNames={fullWidth:Q,zeroRight:Z};var dn=function(){if(typeof __webpack_nonce__<"u")return __webpack_nonce__};function fn(){if(!document)return null;var e=document.createElement("style");e.type="text/css";var t=dn();return t&&e.setAttribute("nonce",t),e}function mn(e,t){e.styleSheet?e.styleSheet.cssText=t:e.appendChild(document.createTextNode(t))}function hn(e){var t=document.head||document.getElementsByTagName("head")[0];t.appendChild(e)}var vn=function(){var e=0,t=null;return{add:function(n){e==0&&(t=fn())&&(mn(t,n),hn(t)),e++},remove:function(){e--,!e&&t&&(t.parentNode&&t.parentNode.removeChild(t),t=null)}}},pn=function(){var e=vn();return function(t,n){i.useEffect(function(){return e.add(t),function(){e.remove()}},[t&&n])}},He=function(){var e=pn(),t=function(n){var r=n.styles,o=n.dynamic;return e(r,o),null};return t},gn={left:0,top:0,right:0,gap:0},de=function(e){return parseInt(e||"",10)||0},xn=function(e){var t=window.getComputedStyle(document.body),n=t[e==="padding"?"paddingLeft":"marginLeft"],r=t[e==="padding"?"paddingTop":"marginTop"],o=t[e==="padding"?"paddingRight":"marginRight"];return[de(n),de(r),de(o)]},yn=function(e){if(e===void 0&&(e="margin"),typeof window>"u")return gn;var t=xn(e),n=document.documentElement.clientWidth,r=window.innerWidth;return{left:t[0],top:t[1],right:t[2],gap:Math.max(0,r-n+t[2]-t[0])}},bn=He(),F="data-scroll-locked",En=function(e,t,n,r){var o=e.left,s=e.top,d=e.right,c=e.gap;return n===void 0&&(n="margin"),`
  .`.concat(tn,` {
   overflow: hidden `).concat(r,`;
   padding-right: `).concat(c,"px ").concat(r,`;
  }
  body[`).concat(F,`] {
    overflow: hidden `).concat(r,`;
    overscroll-behavior: contain;
    `).concat([t&&"position: relative ".concat(r,";"),n==="margin"&&`
    padding-left: `.concat(o,`px;
    padding-top: `).concat(s,`px;
    padding-right: `).concat(d,`px;
    margin-left:0;
    margin-top:0;
    margin-right: `).concat(c,"px ").concat(r,`;
    `),n==="padding"&&"padding-right: ".concat(c,"px ").concat(r,";")].filter(Boolean).join(""),`
  }
  
  .`).concat(Z,` {
    right: `).concat(c,"px ").concat(r,`;
  }
  
  .`).concat(Q,` {
    margin-right: `).concat(c,"px ").concat(r,`;
  }
  
  .`).concat(Z," .").concat(Z,` {
    right: 0 `).concat(r,`;
  }
  
  .`).concat(Q," .").concat(Q,` {
    margin-right: 0 `).concat(r,`;
  }
  
  body[`).concat(F,`] {
    `).concat(nn,": ").concat(c,`px;
  }
`)},Me=function(){var e=parseInt(document.body.getAttribute(F)||"0",10);return isFinite(e)?e:0},wn=function(){i.useEffect(function(){return document.body.setAttribute(F,(Me()+1).toString()),function(){var e=Me()-1;e<=0?document.body.removeAttribute(F):document.body.setAttribute(F,e.toString())}},[])},Nn=function(e){var t=e.noRelative,n=e.noImportant,r=e.gapMode,o=r===void 0?"margin":r;wn();var s=i.useMemo(function(){return yn(o)},[o]);return i.createElement(bn,{styles:En(s,!t,o,n?"":"!important")})},ve=!1;if(typeof window<"u")try{var X=Object.defineProperty({},"passive",{get:function(){return ve=!0,!0}});window.addEventListener("test",X,X),window.removeEventListener("test",X,X)}catch{ve=!1}var I=ve?{passive:!1}:!1,Cn=function(e){return e.tagName==="TEXTAREA"},Ye=function(e,t){if(!(e instanceof Element))return!1;var n=window.getComputedStyle(e);return n[t]!=="hidden"&&!(n.overflowY===n.overflowX&&!Cn(e)&&n[t]==="visible")},jn=function(e){return Ye(e,"overflowY")},Sn=function(e){return Ye(e,"overflowX")},ke=function(e,t){var n=t.ownerDocument,r=t;do{typeof ShadowRoot<"u"&&r instanceof ShadowRoot&&(r=r.host);var o=qe(e,r);if(o){var s=Ze(e,r),d=s[1],c=s[2];if(d>c)return!0}r=r.parentNode}while(r&&r!==n.body);return!1},Pn=function(e){var t=e.scrollTop,n=e.scrollHeight,r=e.clientHeight;return[t,n,r]},Rn=function(e){var t=e.scrollLeft,n=e.scrollWidth,r=e.clientWidth;return[t,n,r]},qe=function(e,t){return e==="v"?jn(t):Sn(t)},Ze=function(e,t){return e==="v"?Pn(t):Rn(t)},Dn=function(e,t){return e==="h"&&t==="rtl"?-1:1},On=function(e,t,n,r,o){var s=Dn(e,window.getComputedStyle(t).direction),d=s*r,c=n.target,m=t.contains(c),f=!1,h=d>0,v=0,g=0;do{var b=Ze(e,c),j=b[0],l=b[1],x=b[2],E=l-x-s*j;(j||E)&&qe(e,c)&&(v+=E,g+=j),c instanceof ShadowRoot?c=c.host:c=c.parentNode}while(!m&&c!==document.body||m&&(t.contains(c)||t===c));return(h&&(Math.abs(v)<1||!o)||!h&&(Math.abs(g)<1||!o))&&(f=!0),f},H=function(e){return"changedTouches"in e?[e.changedTouches[0].clientX,e.changedTouches[0].clientY]:[0,0]},Ie=function(e){return[e.deltaX,e.deltaY]},Le=function(e){return e&&"current"in e?e.current:e},Tn=function(e,t){return e[0]===t[0]&&e[1]===t[1]},An=function(e){return`
  .block-interactivity-`.concat(e,` {pointer-events: none;}
  .allow-interactivity-`).concat(e,` {pointer-events: all;}
`)},Mn=0,L=[];function kn(e){var t=i.useRef([]),n=i.useRef([0,0]),r=i.useRef(),o=i.useState(Mn++)[0],s=i.useState(He)[0],d=i.useRef(e);i.useEffect(function(){d.current=e},[e]),i.useEffect(function(){if(e.inert){document.body.classList.add("block-interactivity-".concat(o));var l=en([e.lockRef.current],(e.shards||[]).map(Le),!0).filter(Boolean);return l.forEach(function(x){return x.classList.add("allow-interactivity-".concat(o))}),function(){document.body.classList.remove("block-interactivity-".concat(o)),l.forEach(function(x){return x.classList.remove("allow-interactivity-".concat(o))})}}},[e.inert,e.lockRef.current,e.shards]);var c=i.useCallback(function(l,x){if("touches"in l&&l.touches.length===2||l.type==="wheel"&&l.ctrlKey)return!d.current.allowPinchZoom;var E=H(l),C=n.current,w="deltaX"in l?l.deltaX:C[0]-E[0],u="deltaY"in l?l.deltaY:C[1]-E[1],p,y=l.target,N=Math.abs(w)>Math.abs(u)?"h":"v";if("touches"in l&&N==="h"&&y.type==="range")return!1;var R=ke(N,y);if(!R)return!0;if(R?p=N:(p=N==="v"?"h":"v",R=ke(N,y)),!R)return!1;if(!r.current&&"changedTouches"in l&&(w||u)&&(r.current=p),!p)return!0;var U=r.current||p;return On(U,x,l,U==="h"?w:u,!0)},[]),m=i.useCallback(function(l){var x=l;if(!(!L.length||L[L.length-1]!==s)){var E="deltaY"in x?Ie(x):H(x),C=t.current.filter(function(p){return p.name===x.type&&(p.target===x.target||x.target===p.shadowParent)&&Tn(p.delta,E)})[0];if(C&&C.should){x.cancelable&&x.preventDefault();return}if(!C){var w=(d.current.shards||[]).map(Le).filter(Boolean).filter(function(p){return p.contains(x.target)}),u=w.length>0?c(x,w[0]):!d.current.noIsolation;u&&x.cancelable&&x.preventDefault()}}},[]),f=i.useCallback(function(l,x,E,C){var w={name:l,delta:x,target:E,should:C,shadowParent:In(E)};t.current.push(w),setTimeout(function(){t.current=t.current.filter(function(u){return u!==w})},1)},[]),h=i.useCallback(function(l){n.current=H(l),r.current=void 0},[]),v=i.useCallback(function(l){f(l.type,Ie(l),l.target,c(l,e.lockRef.current))},[]),g=i.useCallback(function(l){f(l.type,H(l),l.target,c(l,e.lockRef.current))},[]);i.useEffect(function(){return L.push(s),e.setCallbacks({onScrollCapture:v,onWheelCapture:v,onTouchMoveCapture:g}),document.addEventListener("wheel",m,I),document.addEventListener("touchmove",m,I),document.addEventListener("touchstart",h,I),function(){L=L.filter(function(l){return l!==s}),document.removeEventListener("wheel",m,I),document.removeEventListener("touchmove",m,I),document.removeEventListener("touchstart",h,I)}},[]);var b=e.removeScrollBar,j=e.inert;return i.createElement(i.Fragment,null,j?i.createElement(s,{styles:An(o)}):null,b?i.createElement(Nn,{gapMode:e.gapMode}):null)}function In(e){for(var t=null;e!==null;)e instanceof ShadowRoot&&(t=e.host,e=e.host),e=e.parentNode;return t}const Ln=un(Xe,kn);var Qe=i.forwardRef(function(e,t){return i.createElement(re,P({},e,{ref:t,sideCar:Ln}))});Qe.classNames=re.classNames;var _n=function(e){if(typeof document>"u")return null;var t=Array.isArray(e)?e[0]:e;return t.ownerDocument.body},_=new WeakMap,Y=new WeakMap,q={},fe=0,Je=function(e){return e&&(e.host||Je(e.parentNode))},Fn=function(e,t){return t.map(function(n){if(e.contains(n))return n;var r=Je(n);return r&&e.contains(r)?r:(console.error("aria-hidden",n,"in not contained inside",e,". Doing nothing"),null)}).filter(function(n){return!!n})},Un=function(e,t,n,r){var o=Fn(t,Array.isArray(e)?e:[e]);q[n]||(q[n]=new WeakMap);var s=q[n],d=[],c=new Set,m=new Set(o),f=function(v){!v||c.has(v)||(c.add(v),f(v.parentNode))};o.forEach(f);var h=function(v){!v||m.has(v)||Array.prototype.forEach.call(v.children,function(g){if(c.has(g))h(g);else try{var b=g.getAttribute(r),j=b!==null&&b!=="false",l=(_.get(g)||0)+1,x=(s.get(g)||0)+1;_.set(g,l),s.set(g,x),d.push(g),l===1&&j&&Y.set(g,!0),x===1&&g.setAttribute(n,"true"),j||g.setAttribute(r,"true")}catch(E){console.error("aria-hidden: cannot operate on ",g,E)}})};return h(t),c.clear(),fe++,function(){d.forEach(function(v){var g=_.get(v)-1,b=s.get(v)-1;_.set(v,g),s.set(v,b),g||(Y.has(v)||v.removeAttribute(r),Y.delete(v)),b||v.removeAttribute(n)}),fe--,fe||(_=new WeakMap,_=new WeakMap,Y=new WeakMap,q={})}},Wn=function(e,t,n){n===void 0&&(n="data-aria-hidden");var r=Array.from(Array.isArray(e)?e:[e]),o=_n(e);return o?(r.push.apply(r,Array.from(o.querySelectorAll("[aria-live]"))),Un(r,o,n,"aria-hidden")):function(){return null}},ye="Dialog",[et,ar]=Ct(ye),[Bn,S]=et(ye),tt=e=>{const{__scopeDialog:t,children:n,open:r,defaultOpen:o,onOpenChange:s,modal:d=!0}=e,c=i.useRef(null),m=i.useRef(null),[f=!1,h]=Pt({prop:r,defaultProp:o,onChange:s});return a.jsx(Bn,{scope:t,triggerRef:c,contentRef:m,contentId:oe(),titleId:oe(),descriptionId:oe(),open:f,onOpenChange:h,onOpenToggle:i.useCallback(()=>h(v=>!v),[h]),modal:d,children:n})};tt.displayName=ye;var nt="DialogTrigger",rt=i.forwardRef((e,t)=>{const{__scopeDialog:n,...r}=e,o=S(nt,n),s=M(t,o.triggerRef);return a.jsx(D.button,{type:"button","aria-haspopup":"dialog","aria-expanded":o.open,"aria-controls":o.contentId,"data-state":we(o.open),...r,ref:s,onClick:T(e.onClick,o.onOpenToggle)})});rt.displayName=nt;var be="DialogPortal",[zn,at]=et(be,{forceMount:void 0}),ot=e=>{const{__scopeDialog:t,forceMount:n,children:r,container:o}=e,s=S(be,t);return a.jsx(zn,{scope:t,forceMount:n,children:i.Children.map(r,d=>a.jsx(ne,{present:n||s.open,children:a.jsx(Ge,{asChild:!0,container:o,children:d})}))})};ot.displayName=be;var ee="DialogOverlay",st=i.forwardRef((e,t)=>{const n=at(ee,e.__scopeDialog),{forceMount:r=n.forceMount,...o}=e,s=S(ee,e.__scopeDialog);return s.modal?a.jsx(ne,{present:r||s.open,children:a.jsx($n,{...o,ref:t})}):null});st.displayName=ee;var $n=i.forwardRef((e,t)=>{const{__scopeDialog:n,...r}=e,o=S(ee,n);return a.jsx(Qe,{as:jt,allowPinchZoom:!0,shards:[o.contentRef],children:a.jsx(D.div,{"data-state":we(o.open),...r,ref:t,style:{pointerEvents:"auto",...r.style}})})}),A="DialogContent",it=i.forwardRef((e,t)=>{const n=at(A,e.__scopeDialog),{forceMount:r=n.forceMount,...o}=e,s=S(A,e.__scopeDialog);return a.jsx(ne,{present:r||s.open,children:s.modal?a.jsx(Gn,{...o,ref:t}):a.jsx(Kn,{...o,ref:t})})});it.displayName=A;var Gn=i.forwardRef((e,t)=>{const n=S(A,e.__scopeDialog),r=i.useRef(null),o=M(t,n.contentRef,r);return i.useEffect(()=>{const s=r.current;if(s)return Wn(s)},[]),a.jsx(ct,{...e,ref:o,trapFocus:n.open,disableOutsidePointerEvents:!0,onCloseAutoFocus:T(e.onCloseAutoFocus,s=>{var d;s.preventDefault(),(d=n.triggerRef.current)==null||d.focus()}),onPointerDownOutside:T(e.onPointerDownOutside,s=>{const d=s.detail.originalEvent,c=d.button===0&&d.ctrlKey===!0;(d.button===2||c)&&s.preventDefault()}),onFocusOutside:T(e.onFocusOutside,s=>s.preventDefault())})}),Kn=i.forwardRef((e,t)=>{const n=S(A,e.__scopeDialog),r=i.useRef(!1),o=i.useRef(!1);return a.jsx(ct,{...e,ref:t,trapFocus:!1,disableOutsidePointerEvents:!1,onCloseAutoFocus:s=>{var d,c;(d=e.onCloseAutoFocus)==null||d.call(e,s),s.defaultPrevented||(r.current||(c=n.triggerRef.current)==null||c.focus(),s.preventDefault()),r.current=!1,o.current=!1},onInteractOutside:s=>{var m,f;(m=e.onInteractOutside)==null||m.call(e,s),s.defaultPrevented||(r.current=!0,s.detail.originalEvent.type==="pointerdown"&&(o.current=!0));const d=s.target;((f=n.triggerRef.current)==null?void 0:f.contains(d))&&s.preventDefault(),s.detail.originalEvent.type==="focusin"&&o.current&&s.preventDefault()}})}),ct=i.forwardRef((e,t)=>{const{__scopeDialog:n,trapFocus:r,onOpenAutoFocus:o,onCloseAutoFocus:s,...d}=e,c=S(A,n),m=i.useRef(null),f=M(t,m);return Jt(),a.jsxs(a.Fragment,{children:[a.jsx(ze,{asChild:!0,loop:!0,trapped:r,onMountAutoFocus:o,onUnmountAutoFocus:s,children:a.jsx(We,{role:"dialog",id:c.contentId,"aria-describedby":c.descriptionId,"aria-labelledby":c.titleId,"data-state":we(c.open),...d,ref:f,onDismiss:()=>c.onOpenChange(!1)})}),a.jsxs(a.Fragment,{children:[a.jsx(Vn,{titleId:c.titleId}),a.jsx(Hn,{contentRef:m,descriptionId:c.descriptionId})]})]})}),Ee="DialogTitle",lt=i.forwardRef((e,t)=>{const{__scopeDialog:n,...r}=e,o=S(Ee,n);return a.jsx(D.h2,{id:o.titleId,...r,ref:t})});lt.displayName=Ee;var ut="DialogDescription",dt=i.forwardRef((e,t)=>{const{__scopeDialog:n,...r}=e,o=S(ut,n);return a.jsx(D.p,{id:o.descriptionId,...r,ref:t})});dt.displayName=ut;var ft="DialogClose",mt=i.forwardRef((e,t)=>{const{__scopeDialog:n,...r}=e,o=S(ft,n);return a.jsx(D.button,{type:"button",...r,ref:t,onClick:T(e.onClick,()=>o.onOpenChange(!1))})});mt.displayName=ft;function we(e){return e?"open":"closed"}var ht="DialogTitleWarning",[or,vt]=St(ht,{contentName:A,titleName:Ee,docsSlug:"dialog"}),Vn=({titleId:e})=>{const t=vt(ht),n=`\`${t.contentName}\` requires a \`${t.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${t.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${t.docsSlug}`;return i.useEffect(()=>{e&&(document.getElementById(e)||console.error(n))},[n,e]),null},Xn="DialogDescriptionWarning",Hn=({contentRef:e,descriptionId:t})=>{const r=`Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${vt(Xn).contentName}}.`;return i.useEffect(()=>{var s;const o=(s=e.current)==null?void 0:s.getAttribute("aria-describedby");t&&o&&(document.getElementById(t)||console.warn(r))},[r,e,t]),null},Yn=tt,qn=rt,Zn=ot,pt=st,gt=it,xt=lt,yt=dt,Qn=mt;const _e=Yn,Fe=qn,Jn=Zn,bt=i.forwardRef(({className:e,...t},n)=>a.jsx(pt,{ref:n,className:z("fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",e),...t}));bt.displayName=pt.displayName;const pe=i.forwardRef(({className:e,children:t,...n},r)=>a.jsxs(Jn,{children:[a.jsx(bt,{}),a.jsxs(gt,{ref:r,className:z("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",e),...n,children:[t,a.jsxs(Qn,{className:"absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",children:[a.jsx(Rt,{className:"h-4 w-4"}),a.jsx("span",{className:"sr-only",children:"Close"})]})]})]}));pe.displayName=gt.displayName;const ge=({className:e,...t})=>a.jsx("div",{className:z("flex flex-col space-y-1.5 text-center sm:text-left",e),...t});ge.displayName="DialogHeader";const xe=i.forwardRef(({className:e,...t},n)=>a.jsx(xt,{ref:n,className:z("text-lg font-semibold leading-none tracking-tight",e),...t}));xe.displayName=xt.displayName;const er=i.forwardRef(({className:e,...t},n)=>a.jsx(yt,{ref:n,className:z("text-sm text-muted-foreground",e),...t}));er.displayName=yt.displayName;function sr(){const[e,t]=i.useState([]),[n,r]=i.useState([]),[o,s]=i.useState("");i.useState(null);const[d,c]=i.useState(!0),{toast:m}=Dt(),[f,h]=i.useState(""),[v,g]=i.useState(""),[b,j]=i.useState("");i.useEffect(()=>{l(),x()},[]);const l=async()=>{try{console.log("Fetching users...");const u=await fetch("/api/get_users",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include"});console.log("Response status:",u.status),console.log("Response headers:",Object.fromEntries(u.headers));const p=u.headers.get("content-type");if(console.log("Content type:",p),u.ok)if(p&&p.includes("application/json")){const y=await u.json();console.log("Received data:",y),t(y.users)}else{const y=await u.text();console.error("Received non-JSON response:",y),console.error("Response headers:",Object.fromEntries(u.headers)),m({title:"Error",description:"Invalid response format from server",variant:"destructive"})}else{const y=await u.text();console.error("Error response:",y),m({title:"Error",description:y||"Failed to fetch users",variant:"destructive"})}}catch(u){console.error("Error fetching users:",u),m({title:"Error",description:"Failed to fetch users",variant:"destructive"})}finally{c(!1)}},x=async()=>{try{const u=await fetch("/api/get_groups",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include"}),p=u.headers.get("content-type");if(u.ok)if(p&&p.includes("application/json")){const y=await u.json();r(y.groups)}else console.error("Received non-JSON response:",await u.text()),m({title:"Error",description:"Invalid response format from server",variant:"destructive"});else{let y="Failed to fetch groups";p&&p.includes("application/json")?y=(await u.json()).message||y:y=await u.text(),console.error("Error response:",y),m({title:"Error",description:y,variant:"destructive"})}}catch(u){console.error("Error fetching groups:",u)}},E=async u=>{if(f!==v){m({title:"Error",description:"Passwords do not match",variant:"destructive"});return}try{const p=await fetch("/change_password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u,password:f,confirmPassword:v})});if(p.ok)m({title:"Success",description:"Password updated successfully"}),h(""),g("");else{const y=await p.json();m({title:"Error",description:y.message||"Failed to update password",variant:"destructive"})}}catch(p){console.error("Error updating password:",p),m({title:"Error",description:"Failed to update password",variant:"destructive"})}},C=async u=>{try{(await fetch("/change_email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u,email:b})})).ok?(m({title:"Success",description:"Email updated successfully"}),j(""),l()):m({title:"Error",description:"Failed to update email",variant:"destructive"})}catch(p){console.error("Error updating email:",p),m({title:"Error",description:"Failed to update email",variant:"destructive"})}},w=e.filter(u=>{var p;return u.username.toLowerCase().includes(o.toLowerCase())||(((p=u.email)==null?void 0:p.toLowerCase())||"").includes(o.toLowerCase())});return a.jsxs("div",{className:"space-y-6",children:[a.jsxs("div",{className:"flex justify-between items-center",children:[a.jsxs("div",{children:[a.jsx("h1",{className:"text-3xl font-bold tracking-tight",children:"User Management"}),a.jsx("p",{className:"text-muted-foreground",children:"Manage user access and permissions"})]}),a.jsxs(k,{children:[a.jsx(Mt,{className:"mr-2 h-4 w-4"}),"Add User"]})]}),a.jsxs("div",{className:"grid gap-4 md:grid-cols-2 lg:grid-cols-4",children:[a.jsxs(W,{children:[a.jsxs(G,{className:"flex flex-row items-center justify-between pb-2",children:[a.jsx(K,{className:"text-sm font-medium",children:"Total Users"}),a.jsx(Ne,{className:"h-4 w-4 text-muted-foreground"})]}),a.jsxs(B,{children:[a.jsx("div",{className:"text-2xl font-bold",children:e.length}),a.jsx("p",{className:"text-xs text-muted-foreground",children:"Registered users"})]})]}),a.jsxs(W,{children:[a.jsxs(G,{className:"flex flex-row items-center justify-between pb-2",children:[a.jsx(K,{className:"text-sm font-medium",children:"Active Users"}),a.jsx(Ce,{className:"h-4 w-4 text-muted-foreground"})]}),a.jsxs(B,{children:[a.jsx("div",{className:"text-2xl font-bold",children:e.filter(u=>u.is_active).length}),a.jsx("p",{className:"text-xs text-muted-foreground",children:"Currently active"})]})]}),a.jsxs(W,{children:[a.jsxs(G,{className:"flex flex-row items-center justify-between pb-2",children:[a.jsx(K,{className:"text-sm font-medium",children:"Total Groups"}),a.jsx(Ne,{className:"h-4 w-4 text-muted-foreground"})]}),a.jsxs(B,{children:[a.jsx("div",{className:"text-2xl font-bold",children:n.length}),a.jsx("p",{className:"text-xs text-muted-foreground",children:"User groups"})]})]}),a.jsxs(W,{children:[a.jsxs(G,{className:"flex flex-row items-center justify-between pb-2",children:[a.jsx(K,{className:"text-sm font-medium",children:"2FA Enabled"}),a.jsx(Ce,{className:"h-4 w-4 text-muted-foreground"})]}),a.jsxs(B,{children:[a.jsx("div",{className:"text-2xl font-bold",children:e.filter(u=>u.is_totp_enabled).length}),a.jsx("p",{className:"text-xs text-muted-foreground",children:"Users with 2FA"})]})]})]}),a.jsx("div",{className:"flex gap-4",children:a.jsxs("div",{className:"relative flex-1 max-w-sm",children:[a.jsx(Ot,{className:"absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"}),a.jsx($,{placeholder:"Search users...",className:"pl-8",value:o,onChange:u=>s(u.target.value)})]})}),a.jsx(W,{children:a.jsx(B,{className:"p-0",children:a.jsxs("table",{className:"w-full",children:[a.jsx("thead",{children:a.jsxs("tr",{className:"border-b border-border",children:[a.jsx("th",{className:"text-left p-4 text-sm font-medium text-muted-foreground",children:"User"}),a.jsx("th",{className:"text-left p-4 text-sm font-medium text-muted-foreground",children:"Groups"}),a.jsx("th",{className:"text-left p-4 text-sm font-medium text-muted-foreground",children:"Status"}),a.jsx("th",{className:"text-left p-4 text-sm font-medium text-muted-foreground",children:"2FA"}),a.jsx("th",{className:"text-left p-4 text-sm font-medium text-muted-foreground",children:"Last Password Change"}),a.jsx("th",{className:"text-right p-4 text-sm font-medium text-muted-foreground",children:"Actions"})]})}),a.jsx("tbody",{children:w.map(u=>{var p;return a.jsxs("tr",{className:"border-b border-border",children:[a.jsx("td",{className:"p-4",children:a.jsxs("div",{children:[a.jsx("div",{className:"font-medium",children:u.username}),a.jsx("div",{className:"text-sm text-muted-foreground",children:u.email})]})}),a.jsx("td",{className:"p-4",children:a.jsx("div",{className:"flex gap-1",children:(p=u.groups)==null?void 0:p.map(y=>a.jsx("div",{className:"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",children:y},y))})}),a.jsx("td",{className:"p-4",children:a.jsx("div",{className:`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.is_active?"bg-green-500/20 text-green-500":"bg-yellow-500/20 text-yellow-500"}`,children:u.is_active?"Active":"Inactive"})}),a.jsx("td",{className:"p-4",children:a.jsx("div",{className:`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.is_totp_enabled?"bg-green-500/20 text-green-500":"bg-yellow-500/20 text-yellow-500"}`,children:u.is_totp_enabled?u.is_totp_confirmed?"Confirmed":"Pending":"Disabled"})}),a.jsx("td",{className:"p-4 text-sm text-muted-foreground",children:u.passwordChangeDate}),a.jsx("td",{className:"p-4",children:a.jsxs("div",{className:"flex justify-end gap-2",children:[a.jsxs(_e,{children:[a.jsx(Fe,{asChild:!0,children:a.jsx(k,{variant:"ghost",size:"icon",children:a.jsx(At,{className:"h-4 w-4"})})}),a.jsxs(pe,{children:[a.jsx(ge,{children:a.jsx(xe,{children:"Change Email"})}),a.jsxs("div",{className:"space-y-4 py-4",children:[a.jsx("div",{className:"space-y-2",children:a.jsx($,{placeholder:"New email",type:"email",value:b,onChange:y=>j(y.target.value)})}),a.jsx(k,{onClick:()=>C(u.username),className:"w-full",children:"Update Email"})]})]})]}),a.jsxs(_e,{children:[a.jsx(Fe,{asChild:!0,children:a.jsx(k,{variant:"ghost",size:"icon",children:a.jsx(Tt,{className:"h-4 w-4"})})}),a.jsxs(pe,{children:[a.jsx(ge,{children:a.jsx(xe,{children:"Change Password"})}),a.jsxs("div",{className:"space-y-4 py-4",children:[a.jsxs("div",{className:"space-y-2",children:[a.jsx($,{placeholder:"New password",type:"password",value:f,onChange:y=>h(y.target.value)}),a.jsx($,{placeholder:"Confirm password",type:"password",value:v,onChange:y=>g(y.target.value)})]}),a.jsx(k,{onClick:()=>E(u.username),className:"w-full",children:"Update Password"})]})]})]}),a.jsx(k,{variant:"ghost",size:"icon",children:a.jsx(kt,{className:"h-4 w-4"})})]})})]},u.user_id)})})]})})})]})}export{sr as default};
