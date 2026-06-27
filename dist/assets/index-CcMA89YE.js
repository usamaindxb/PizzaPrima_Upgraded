(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))i(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function t(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(o){if(o.ep)return;o.ep=!0;const s=t(o);fetch(o.href,s)}})();const f=Object.freeze({CUSTOMERS:"pp_customers",CALL_LOG:"pp_call_log",SIP_CONFIG:"pp_sip_config",GS_CONFIG:"pp_gs_config"}),D=Object.freeze({webAppUrl:"",sheetName:"Customers",connected:!1}),U=Object.freeze({registrar:"fritz.box",user:"",pass:"",number:"",connected:!1});function L(n,e){try{const t=localStorage.getItem(n);return t?JSON.parse(t):e}catch{return e}}function _(n,e){localStorage.setItem(n,JSON.stringify(e))}function A(n){return n.id||(n.id=`c_${Date.now()}_${Math.random().toString(36).slice(2,8)}`),n}const X=[{id:"demo_1",name:"Demo Customer",phone:"+49 000 000000",email:"customer@example.com",addr:"Example Street 1, 48143 Muenster",plz:"48143",cat:"Regular customer",order:"Pizza Salami large",notes:"Demo record - safe to delete",calls:[{time:"2024-01-15T11:32:00",label:"Mo 15.01 · 11:32 Uhr"}]},{id:"demo_2",name:"VIP Demo",phone:"+49 000 111111",email:"vip@example.com",addr:"Sample Avenue 7, 48153 Muenster",plz:"48153",cat:"VIP",order:"Family pizza x2",notes:"Demo record - safe to delete",calls:[{time:"2024-01-15T13:05:00",label:"Mo 15.01 · 13:05 Uhr"}]}],Z=[{id:"demo_l1",name:"Demo Customer",phone:"+49 000 000000",type:"in",time:"11:32",ts:Date.now()-6e6},{id:"demo_l2",name:"VIP Demo",phone:"+49 000 111111",type:"miss",time:"13:05",ts:Date.now()-4e6},{id:"demo_l3",name:"",phone:"+49 000 222222",type:"in",time:"15:01",ts:Date.now()-2e6}],l={getCustomers(){return L(f.CUSTOMERS,X).map(A)},saveCustomers(n){_(f.CUSTOMERS,n.map(A))},findByPhone(n){return this.getCustomers().find(e=>e.phone===n)||null},findById(n){return this.getCustomers().find(e=>e.id===n)||null},upsertCustomer(n){var o;const e=this.getCustomers(),t=n.id?e.findIndex(s=>s.id===n.id):e.findIndex(s=>s.phone===n.phone);if(t>=0){const s=e[t];return e[t]={...s,...n,id:s.id,calls:(o=n.calls)!=null&&o.length?[...n.calls,...s.calls||[]]:s.calls||[],updatedAt:new Date().toISOString()},this.saveCustomers(e),e[t]}const i=A({...n,calls:n.calls||[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});return e.unshift(i),this.saveCustomers(e),i},deleteCustomer(n){const e=this.getCustomers(),t=e.find(i=>i.id===n)||null;return this.saveCustomers(e.filter(i=>i.id!==n)),t},getLog(){return L(f.CALL_LOG,Z)},addLogEntry(n){const e=this.getLog(),t={...n,id:`l_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,ts:Date.now()};e.unshift(t),_(f.CALL_LOG,e.slice(0,200))},getInsights(){const n=this.getCustomers(),e=this.getLog();return{customers:n.length,vip:n.filter(t=>String(t.cat||"").toLowerCase()==="vip").length,withAddress:n.filter(t=>t.addr).length,calls:e.length}},exportBackup(){return{version:2,exportedAt:new Date().toISOString(),customers:this.getCustomers(),callLog:this.getLog(),googleSheets:this.getGSConfig()}},importBackup(n){if(!n||!Array.isArray(n.customers))throw new Error("Invalid backup file.");return this.saveCustomers(n.customers.map(A)),Array.isArray(n.callLog)&&_(f.CALL_LOG,n.callLog),this.getCustomers()},getSIPConfig(){return L(f.SIP_CONFIG,U)},saveSIPConfig(n){_(f.SIP_CONFIG,{...U,...n})},getGSConfig(){return L(f.GS_CONFIG,D)},saveGSConfig(n){_(f.GS_CONFIG,{...D,...n})}},Q="modulepreload",Y=function(n){return"/"+n},O={},ee=function(e,t,i){let o=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),r=(a==null?void 0:a.nonce)||(a==null?void 0:a.getAttribute("nonce"));o=Promise.allSettled(t.map(c=>{if(c=Y(c),c in O)return;O[c]=!0;const p=c.endsWith(".css"),d=p?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${d}`))return;const u=document.createElement("link");if(u.rel=p?"stylesheet":Q,p||(u.as="script"),u.crossOrigin="",u.href=c,r&&u.setAttribute("nonce",r),document.head.appendChild(u),p)return new Promise((S,x)=>{u.addEventListener("load",S),u.addEventListener("error",()=>x(new Error(`Unable to preload CSS for ${c}`)))})}))}function s(a){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=a,window.dispatchEvent(r),!r.defaultPrevented)throw a}return o.then(a=>{for(const r of a||[])r.status==="rejected"&&s(r.reason);return e().catch(s)})},m={registrar:"fritz.box",registrarAlt:"192.168.178.1",wsPort:443,wsPath:"/ws",displayName:"Pizza Prima",numbers:["YOUR_PHONE_NUMBER"]};class te{constructor({onIncomingCall:e,onCallEnded:t,onRegistered:i,onUnregistered:o,onError:s}){this.onIncomingCall=e,this.onCallEnded=t,this.onRegistered=i,this.onUnregistered=o,this.onError=s,this._ua=null,this._session=null,this._connected=!1}async connect({user:e,pass:t,number:i,registrar:o=m.registrar}){var u,S,x,N;let s,a,r;try{const g=await ee(()=>import("./index-BNqdEQEA.js"),[]);s=g.UserAgent,a=g.Registerer,r=g.SessionState}catch(g){return(u=this.onError)==null||u.call(this,"SIP.js konnte nicht geladen werden: "+g.message),!1}const c=`wss://${o}:${m.wsPort}${m.wsPath}`,p=s.makeURI(`sip:${e}@${o}`);if(!p)return(S=this.onError)==null||S.call(this,"Ungültige SIP-URI. Benutzername und Registrar prüfen."),!1;const d={uri:p,transportOptions:{server:c,traceSip:!1},authorizationUsername:e,authorizationPassword:t,displayName:m.displayName,sessionDescriptionHandlerFactoryOptions:{peerConnectionConfiguration:{iceServers:[{urls:`stun:${o}`},{urls:"stun:stun.l.google.com:19302"}]}},logLevel:"error",delegate:{onInvite:g=>this._handleIncoming(g,r)}};try{return this._ua=new s(d),await this._ua.start(),this._registerer=new a(this._ua),await this._registerer.register(),this._connected=!0,(x=this.onRegistered)==null||x.call(this),!0}catch(g){return this._connected=!1,(N=this.onError)==null||N.call(this,"Fritz!Box Verbindung fehlgeschlagen: "+(g.message||g)),!1}}_handleIncoming(e,t){var s,a;this._session=e;const i=e.request.from,o=((s=i==null?void 0:i.uri)==null?void 0:s.user)||(i==null?void 0:i.displayName)||"Unbekannt";(a=this.onIncomingCall)==null||a.call(this,{number:o,invitation:e}),e.stateChange.addListener(r=>{var c;r===t.Terminated&&(this._session=null,(c=this.onCallEnded)==null||c.call(this))})}async accept(){if(this._session)try{await this._session.accept({sessionDescriptionHandlerOptions:{constraints:{audio:!0,video:!1}}})}catch(e){console.error("Accept failed:",e)}}async reject(){if(this._session)try{await this._session.reject()}catch{}}async hangup(){if(this._session)try{await this._session.bye()}catch{}}async disconnect(){var e,t,i;this._connected=!1;try{await((e=this._registerer)==null?void 0:e.unregister())}catch{}try{await((t=this._ua)==null?void 0:t.stop())}catch{}this._ua=null,(i=this.onUnregistered)==null||i.call(this)}get connected(){return this._connected}}function C(n){return/^https:\/\/script\.google\.com(?:\/u\/\d+)?\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?.*)?$/.test(String(n||"").trim())}class ${constructor({webAppUrl:e,sheetName:t="Customers"}){this.webAppUrl=String(e||"").trim(),this.sheetName=t||"Customers"}_requireUrl(){if(!this.webAppUrl)throw new Error("Google Apps Script Web-App-URL fehlt.");if(!C(this.webAppUrl))throw new Error("Falsche Apps-Script-URL. Bitte die Web-App-URL verwenden, die so aussieht: https://script.google.com/macros/s/.../exec. Nicht die /home/projects/.../edit URL verwenden.")}async _post(e){this._requireUrl();const t=await fetch(this.webAppUrl,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({sheetName:this.sheetName,...e})}),i=await t.text();let o={};try{o=i?JSON.parse(i):{}}catch{throw new Error("Apps Script returned invalid JSON. Check the deployment URL and redeploy as Web App.")}if(!t.ok||o.ok===!1)throw new Error(o.error||`HTTP ${t.status}`);return o}customerPayload(e){return{id:e.id||"",name:e.name||"",phone:e.phone||"",email:e.email||"",addr:e.addr||"",plz:e.plz||"",cat:e.cat||"",notes:e.notes||"",order:e.order||""}}syncAllCustomers(e){return this._post({action:"replaceAllCustomers",customers:e.map(t=>this.customerPayload(t))})}appendCustomer(e){return this.syncAllCustomers([e])}upsertCustomer(e){return this._post({action:"upsertCustomer",customer:this.customerPayload(e)})}updateCustomer(e,t=null){return this._post({action:"updateCustomer",customer:this.customerPayload(e),lookup:t?this.customerPayload(t):this.customerPayload(e)})}deleteCustomer(e){return this._post({action:"deleteCustomer",customer:this.customerPayload(e),lookup:this.customerPayload(e)})}async testConnection(){const e=await this._post({action:"test"});return e.spreadsheet||e.title||e.sheet||"Google Sheet"}}const M=["av-r","av-g","av-a","av-gr"];function ne(n){return n?M[n.charCodeAt(0)%M.length]:"av-gr"}function ie(n){return n?n.trim().split(/\s+/).map(e=>e[0]).join("").toUpperCase().slice(0,2):"?"}function W(){return new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})+" Uhr"}function se(){const n=new Date;return n.toLocaleDateString("de-DE",{weekday:"short",day:"2-digit",month:"2-digit"})+" · "+n.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})+" Uhr"}function oe(n){return document.getElementById(n)}function h(n,e,t="ok",i=3500){const o=oe(n);o&&(o.innerHTML=`<div class="toast t-${t}">${e}</div>`,setTimeout(()=>{o&&(o.innerHTML="")},i))}function ae(n){const e={in:["b-in","Eingehend"],miss:["b-miss","Verpasst"],out:["b-out","Ausgehend"]},[t,i]=e[n]||["b-out","—"];return`<span class="badge ${t}">${i}</span>`}function j(n){return n==="VIP"?'<span class="vip-pill">VIP</span>':""}function P(n=""){return String(n).replace(/[^+0-9]/g,"")}function re(n=""){const e=P(n);return e?`tel:${e}`:"#"}function le(n=""){const e=P(n).replace(/^\+/,"");return e?`https://wa.me/${e}`:"#"}function de(n=""){return n?`mailto:${encodeURIComponent(n)}`:"#"}function ce(n=""){return n?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(n)}`:"#"}function R(n,e,t="text/plain"){const i=new Blob([e],{type:t}),o=URL.createObjectURL(i),s=document.createElement("a");s.href=o,s.download=n,document.body.appendChild(s),s.click(),s.remove(),URL.revokeObjectURL(o)}class ue{constructor(e){this.container=e,this._onOpen=null,this._onDismiss=null,this._render()}_render(){this.container.innerHTML=`
      <div class="popup-overlay" id="popupOverlay" style="display:none">
        <div class="popup-card" id="popupCard">
          <div class="popup-header">
            <div class="ph-left">
              <i class="ti ti-phone-incoming ph-icon"></i>
              <div>
                <div class="ph-title">Eingehender Anruf</div>
                <div class="ph-sub" id="popupTime"></div>
              </div>
            </div>
            <button class="ph-close" id="popupClose" aria-label="Schließen">
              <i class="ti ti-x"></i>
            </button>
          </div>
          <div class="popup-body">
            <div class="popup-number" id="popupNumber"></div>
            <div id="popupContent"></div>
            <div class="popup-actions">
              <button class="btn btn-primary" id="popupOpenBtn">
                <i class="ti ti-user"></i> Kundendaten öffnen
              </button>
              <button class="btn btn-sec" id="popupDismissBtn">Ignorieren</button>
            </div>
          </div>
        </div>
      </div>`,document.getElementById("popupClose").addEventListener("click",()=>this.hide()),document.getElementById("popupDismissBtn").addEventListener("click",()=>this.hide()),document.getElementById("popupOpenBtn").addEventListener("click",()=>{var e;(e=this._onOpen)==null||e.call(this),this.hide()})}show({number:e,customer:t,onOpen:i}){var s;this._onOpen=i,document.getElementById("popupTime").textContent=W(),document.getElementById("popupNumber").textContent=e;const o=document.getElementById("popupContent");t?o.innerHTML=`
        <div class="popup-known">
          <div class="pk-name">${t.name} ${j(t.cat)}</div>
          ${t.addr?`<div class="pk-detail"><i class="ti ti-map-pin" style="font-size:11px;margin-right:3px"></i>${t.addr}</div>`:""}
          ${t.order?`<div class="pk-detail"><i class="ti ti-pizza" style="font-size:11px;margin-right:3px"></i>${t.order}</div>`:""}
          ${(s=t.calls)!=null&&s.length?`<div class="pk-detail"><i class="ti ti-history" style="font-size:11px;margin-right:3px"></i>${t.calls.length} frühere Anruf(e)</div>`:""}
          ${t.notes?`<div class="pk-detail" style="margin-top:5px;font-style:italic;color:#5F5E5A">"${t.notes}"</div>`:""}
        </div>`:o.innerHTML=`
        <span class="popup-new-badge">Neue Nummer</span>
        <div class="popup-new-txt">Kein Eintrag gefunden – bitte Daten aufnehmen.</div>`,document.getElementById("popupOverlay").style.display="block",clearTimeout(this._autoHide),this._autoHide=setTimeout(()=>this.hide(),3e4)}hide(){var e;clearTimeout(this._autoHide),document.getElementById("popupOverlay").style.display="none",(e=this._onDismiss)==null||e.call(this)}}class pe{constructor(e,{onSelectCall:t}){this.container=e,this.onSelectCall=t}render(){const e=l.getLog(),t=e.length,i=e.filter(a=>a.name).length,o=e.filter(a=>a.type==="miss").length,s=e.map((a,r)=>{const c=ne(a.name),p=a.name?`<span>${ie(a.name)}</span>`:'<i class="ti ti-user-question" style="font-size:13px"></i>',d=a.name?a.name:'<span style="color:var(--text-2)">Unbekannte Nummer</span>';return`
        <div class="call-row" data-index="${r}" role="button" tabindex="0">
          <div class="av ${c}">${p}</div>
          <div class="cinfo">
            <div class="cname">${d}</div>
            <div class="cnum">${a.phone}</div>
          </div>
          <div class="cright">
            <div class="ctime">Heute ${a.time}</div>
            ${ae(a.type)}
          </div>
        </div>`}).join("");this.container.innerHTML=`
      <div class="stats-row">
        <div class="stat"><div class="stat-val">${t}</div><div class="stat-lbl">Heute gesamt</div></div>
        <div class="stat"><div class="stat-val">${i}</div><div class="stat-lbl">Bekannt</div></div>
        <div class="stat"><div class="stat-val">${o}</div><div class="stat-lbl">Verpasst</div></div>
      </div>
      <div id="callRows">${s||'<div class="empty"><i class="ti ti-phone-off"></i>Noch keine Anrufe heute.</div>'}</div>`,this.container.querySelectorAll(".call-row").forEach(a=>{const r=()=>{var d;const c=parseInt(a.dataset.index),p=l.getLog()[c];(d=this.onSelectCall)==null||d.call(this,p)};a.addEventListener("click",r),a.addEventListener("keydown",c=>{(c.key==="Enter"||c.key===" ")&&r()})})}}function me(n){const e=String(n??"");return/[",\n]/.test(e)?`"${e.replaceAll('"','""')}"`:e}function he(n){const e=["Name","Phone","Email","Address","Postcode","Category","Notes","Last order","Calls"],t=n.map(i=>{var o;return[i.name,i.phone,i.email,i.addr,i.plz,i.cat,i.notes,i.order,((o=i.calls)==null?void 0:o.length)||0].map(me).join(",")});return[e.join(","),...t].join(`
`)}class ge{constructor(e,{onSelectCustomer:t,onDeleteCustomer:i,onDataChanged:o}){this.container=e,this.onSelectCustomer=t,this.onDeleteCustomer=i,this.onDataChanged=o,this._filter="",this._sort="recent"}render(){const e=l.getCustomers(),t=e.length,i=e.filter(s=>String(s.cat||"").toLowerCase()==="vip").length,o=e.filter(s=>!s.addr).length;this.container.innerHTML=`
      <div class="customer-hero">
        <div>
          <div class="customer-hero-kicker">Customer Command Center</div>
          <div class="customer-hero-title">${t} Kunden im System</div>
          <div class="mini-metrics"><span>${i} VIP</span><span>${o} ohne Adresse</span><span>${l.getLog().length} Anrufe</span></div>
        </div>
        <div class="customer-hero-icon"><i class="ti ti-users-group"></i></div>
      </div>

      <div class="toolbar-row">
        <div class="search-wrap elevated-search">
          <i class="ti ti-search"></i>
          <input class="search-input" id="custSearch" type="text" placeholder="Name, Nummer, Adresse, Bestellung oder Notiz suchen…" value="${this._filter}" />
        </div>
        <select class="smart-select" id="custSort">
          <option value="recent" ${this._sort==="recent"?"selected":""}>Neueste zuerst</option>
          <option value="name" ${this._sort==="name"?"selected":""}>Name A-Z</option>
          <option value="vip" ${this._sort==="vip"?"selected":""}>VIP zuerst</option>
          <option value="calls" ${this._sort==="calls"?"selected":""}>Meiste Anrufe</option>
        </select>
      </div>

      <div class="actions-bar">
        <button class="btn btn-sec" id="exportCsv"><i class="ti ti-file-spreadsheet"></i> CSV exportieren</button>
        <button class="btn btn-sec" id="exportJson"><i class="ti ti-download"></i> Backup exportieren</button>
        <button class="btn btn-sec" id="importJson"><i class="ti ti-upload"></i> Backup importieren</button>
        <input id="importFile" type="file" accept="application/json" hidden />
      </div>

      <div id="custTableBody"></div>`,document.getElementById("custSearch").addEventListener("input",s=>{this._filter=s.target.value,this._renderTable()}),document.getElementById("custSort").addEventListener("change",s=>{this._sort=s.target.value,this._renderTable()}),document.getElementById("exportCsv").addEventListener("click",()=>{R(`pizza-prima-customers-${new Date().toISOString().slice(0,10)}.csv`,he(l.getCustomers()),"text/csv")}),document.getElementById("exportJson").addEventListener("click",()=>{R(`pizza-prima-backup-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(l.exportBackup(),null,2),"application/json")}),document.getElementById("importJson").addEventListener("click",()=>document.getElementById("importFile").click()),document.getElementById("importFile").addEventListener("change",s=>this._importBackup(s)),this._renderTable()}async _importBackup(e){var i,o;const t=(i=e.target.files)==null?void 0:i[0];if(t)try{const s=JSON.parse(await t.text());if(!confirm("Backup importieren? Aktuelle lokale Kunden werden ersetzt und danach mit Google Sheets synchronisiert."))return;l.importBackup(s),(o=this.onDataChanged)==null||o.call(this,"imported"),this.render()}catch(s){alert("Backup konnte nicht importiert werden: "+s.message)}finally{e.target.value=""}}_getList(){const e=this._filter.toLowerCase(),t=P(this._filter);let i=l.getCustomers().filter(s=>e?[s.name,s.phone,s.email,s.addr,s.plz,s.cat,s.order,s.notes].some(a=>String(a||"").toLowerCase().includes(e))||P(s.phone).includes(t):!0);const o=s=>new Date(s.updatedAt||s.createdAt||0).getTime();return this._sort==="name"&&i.sort((s,a)=>String(s.name||"").localeCompare(String(a.name||""))),this._sort==="vip"&&i.sort((s,a)=>(String(a.cat).toLowerCase()==="vip")-(String(s.cat).toLowerCase()==="vip")||o(a)-o(s)),this._sort==="calls"&&i.sort((s,a)=>{var r,c;return(((r=a.calls)==null?void 0:r.length)||0)-(((c=s.calls)==null?void 0:c.length)||0)}),this._sort==="recent"&&i.sort((s,a)=>o(a)-o(s)),i}_renderTable(){const e=this._getList(),t=document.getElementById("custTableBody");if(t){if(!e.length){t.innerHTML='<div class="empty"><i class="ti ti-users"></i>Keine Kunden gefunden.</div>';return}t.innerHTML=`
      <table class="ctbl premium-table">
        <thead>
          <tr>
            <th style="width:28%">Name</th>
            <th style="width:20%">Telefon</th>
            <th style="width:17%">Typ</th>
            <th style="width:18%">Letzte Bestellung</th>
            <th style="width:7%">Anrufe</th>
            <th style="width:10%;text-align:right">Aktion</th>
          </tr>
        </thead>
        <tbody>
          ${e.map(i=>{var o;return`
            <tr data-id="${i.id}" role="button" tabindex="0">
              <td><strong>${i.name||"Ohne Namen"}</strong> ${j(i.cat)} ${i.addr?"":'<span class="data-chip warn">Adresse fehlt</span>'}</td>
              <td>${i.phone||"—"}</td>
              <td>${i.cat||"—"}</td>
              <td>${i.order||"—"}</td>
              <td style="text-align:center">${((o=i.calls)==null?void 0:o.length)||0}</td>
              <td class="row-actions">
                <button class="icon-btn edit-customer" title="Bearbeiten" data-id="${i.id}"><i class="ti ti-edit"></i></button>
                <button class="icon-btn danger delete-customer" title="Löschen" data-id="${i.id}"><i class="ti ti-trash"></i></button>
              </td>
            </tr>`}).join("")}
        </tbody>
      </table>`,t.querySelectorAll("tr[data-id]").forEach(i=>{const o=s=>{var r;if(s.target.closest("button"))return;const a=l.findById(i.dataset.id);a&&((r=this.onSelectCustomer)==null||r.call(this,a))};i.addEventListener("click",o),i.addEventListener("keydown",s=>{(s.key==="Enter"||s.key===" ")&&o(s)})}),t.querySelectorAll(".edit-customer").forEach(i=>{i.addEventListener("click",o=>{var a;o.stopPropagation();const s=l.findById(i.dataset.id);s&&((a=this.onSelectCustomer)==null||a.call(this,s))})}),t.querySelectorAll(".delete-customer").forEach(i=>{i.addEventListener("click",o=>{var r;o.stopPropagation();const s=l.findById(i.dataset.id);if(!s||!confirm(`${s.name||s.phone} wirklich löschen? Der Eintrag wird lokal und in Google Sheets entfernt.`))return;const a=l.deleteCustomer(s.id);(r=this.onDeleteCustomer)==null||r.call(this,a||s),this._renderTable()})})}}}class ve{constructor(e,{onSaved:t,onDeleted:i}){this.container=e,this.onSaved=t,this.onDeleted=i,this._activePhone=null,this._editingId=null,this._originalCustomer=null,this._render()}_render(){this.container.innerHTML=`
      <div id="activeBanner" style="display:none" class="active-banner">
        <div class="ab-dot"></div>
        <span class="ab-txt" id="bannerTxt">Eingehender Anruf</span>
        <span class="ab-num" id="bannerNum"></span>
      </div>

      <div class="form-header">
        <div class="form-title" id="fTitle">Kundendaten eingeben</div>
        <div class="form-sub" id="fSub">Während des Anrufs ausfüllen und speichern</div>
      </div>

      <div class="form-body">
        <div class="fg2">
          <div class="ff">
            <label for="f_name">Name</label>
            <input id="f_name" type="text" placeholder="Max Mustermann" autocomplete="name" />
          </div>
          <div class="ff">
            <label for="f_phone">Telefon</label>
            <input id="f_phone" type="tel" placeholder="+49 XXX XXXXXX" />
          </div>
        </div>

        <div class="ff">
          <label for="f_addr">Adresse</label>
          <input id="f_addr" type="text" placeholder="Musterstraße 12, 48143 Münster" />
        </div>

        <div class="fg2">
          <div class="ff">
            <label for="f_plz">PLZ</label>
            <input id="f_plz" type="text" placeholder="48XXX" maxlength="5" />
          </div>
          <div class="ff">
            <label for="f_cat">Kategorie</label>
            <select id="f_cat">
              <option value="">— wählen —</option>
              <option>Stammkunde</option>
              <option>Neukunde</option>
              <option>VIP</option>
              <option>Lieferant</option>
              <option>Sonstiges</option>
            </select>
          </div>
        </div>

        <div class="ff">
          <label for="f_email">E-Mail</label>
          <input id="f_email" type="email" placeholder="kunde@beispiel.de" />
        </div>

        <div class="ff">
          <label for="f_order">Letzte Bestellung</label>
          <input id="f_order" type="text" placeholder="z.B. Pizza Salami groß, Cola…" />
        </div>

        <div class="ff">
          <label for="f_notes">Notizen</label>
          <textarea id="f_notes" placeholder="Lieferpräferenzen, Allergien, Stammbestellung…"></textarea>
        </div>

        <div id="quickActions" class="quick-actions" style="display:none">
          <a id="qaCall" class="qa-btn" href="#"><i class="ti ti-phone"></i> Anrufen</a>
          <a id="qaWhatsApp" class="qa-btn" href="#" target="_blank" rel="noopener"><i class="ti ti-brand-whatsapp"></i> WhatsApp</a>
          <a id="qaMail" class="qa-btn" href="#"><i class="ti ti-mail"></i> E-Mail</a>
          <a id="qaMap" class="qa-btn" href="#" target="_blank" rel="noopener"><i class="ti ti-map-pin"></i> Route</a>
        </div>

        <div id="dupWarning" style="display:none" class="notice n-warn compact-note"></div>

        <div id="histBlock" style="display:none">
          <div class="sec-label" style="margin-bottom:6px">Anrufverlauf</div>
          <div id="histItems"></div>
        </div>

        <div id="formToast"></div>
      </div>

      <div class="form-footer">
        <button class="btn btn-primary btn-glow" id="btnSave">
          <i class="ti ti-device-floppy"></i> Speichern
        </button>
        <button class="btn btn-sec" id="btnClear">Leeren</button>
        <button class="btn btn-danger" id="btnDelete" style="display:none">
          <i class="ti ti-trash"></i> Löschen
        </button>
      </div>`,document.getElementById("btnSave").addEventListener("click",()=>this._save()),document.getElementById("btnClear").addEventListener("click",()=>this.clear()),document.getElementById("btnDelete").addEventListener("click",()=>this._delete()),document.getElementById("f_phone").addEventListener("input",()=>this._checkDuplicate())}load(e){this._editingId=e.id||null,this._originalCustomer={...e},document.getElementById("btnDelete").style.display=e.id?"inline-flex":"none",document.getElementById("btnSave").innerHTML='<i class="ti ti-edit"></i> Änderungen speichern',document.getElementById("f_name").value=e.name||"",document.getElementById("f_phone").value=e.phone||"",document.getElementById("f_email").value=e.email||"",document.getElementById("f_addr").value=e.addr||"",document.getElementById("f_plz").value=e.plz||"",document.getElementById("f_cat").value=e.cat||"",document.getElementById("f_order").value=e.order||"",document.getElementById("f_notes").value=e.notes||"",this._updateQuickActions(e),this._checkDuplicate(),document.getElementById("fTitle").textContent=e.name||"Kundendaten bearbeiten",document.getElementById("fSub").textContent=(e.cat||"")+(e.phone?" · "+e.phone:"");const t=e.calls||[],i=document.getElementById("histBlock"),o=document.getElementById("histItems");t.length?(i.style.display="block",o.innerHTML=t.map(s=>`<div class="hist-item"><i class="ti ti-phone" style="font-size:12px"></i>${s.label||s}</div>`).join("")):i.style.display="none",this._hideBanner()}setIncomingPhone(e){this._activePhone=e,this._editingId=null,this._originalCustomer=null,document.getElementById("btnDelete").style.display="none",document.getElementById("btnSave").innerHTML='<i class="ti ti-device-floppy"></i> Speichern',document.getElementById("f_phone").value=e,document.getElementById("quickActions").style.display="none",document.getElementById("fTitle").textContent="Neuer Kunde",document.getElementById("fSub").textContent="Daten während des Anrufs aufnehmen",this._showBanner(e,"Eingehender Anruf"),document.getElementById("f_name").focus()}_showBanner(e,t="Eingehender Anruf"){document.getElementById("activeBanner").style.display="flex",document.getElementById("bannerTxt").textContent=t,document.getElementById("bannerNum").textContent=e}_hideBanner(){document.getElementById("activeBanner").style.display="none",this._activePhone=null}clear(){["f_name","f_phone","f_email","f_addr","f_plz","f_order","f_notes"].forEach(e=>{document.getElementById(e).value=""}),document.getElementById("f_cat").value="",document.getElementById("fTitle").textContent="Kundendaten eingeben",document.getElementById("fSub").textContent="Während des Anrufs ausfüllen und speichern",document.getElementById("histBlock").style.display="none",document.getElementById("formToast").innerHTML="",document.getElementById("dupWarning").style.display="none",document.getElementById("quickActions").style.display="none",this._editingId=null,this._originalCustomer=null,document.getElementById("btnDelete").style.display="none",document.getElementById("btnSave").innerHTML='<i class="ti ti-device-floppy"></i> Speichern',this._hideBanner()}_updateQuickActions(e){const t=document.getElementById("quickActions");t&&(t.style.display=e!=null&&e.phone||e!=null&&e.email||e!=null&&e.addr?"grid":"none",document.getElementById("qaCall").href=re(e.phone),document.getElementById("qaWhatsApp").href=le(e.phone),document.getElementById("qaMail").href=de(e.email),document.getElementById("qaMap").href=ce(e.addr))}_checkDuplicate(){var o;const e=document.getElementById("dupWarning");if(!e)return;const t=(o=document.getElementById("f_phone"))==null?void 0:o.value.trim(),i=t?l.getCustomers().find(s=>s.phone===t&&s.id!==this._editingId):null;i?(e.style.display="flex",e.innerHTML=`<i class="ti ti-alert-triangle"></i> Diese Telefonnummer ist schon bei <strong>${i.name||i.phone}</strong> gespeichert.`):(e.style.display="none",e.innerHTML="")}_save(){var a;const e=document.getElementById("f_phone").value.trim();if(!e){h("formToast",'<i class="ti ti-alert-triangle"></i> Telefonnummer ist erforderlich.',"warn");return}const t=l.getCustomers().find(r=>r.phone===e&&r.id!==this._editingId);if(t&&!confirm(`Diese Telefonnummer gehört bereits zu ${t.name||"einem anderen Kunden"}. Trotzdem speichern?`))return;const i={id:this._editingId,name:document.getElementById("f_name").value.trim(),phone:e,email:document.getElementById("f_email").value.trim(),addr:document.getElementById("f_addr").value.trim(),plz:document.getElementById("f_plz").value.trim(),cat:document.getElementById("f_cat").value,order:document.getElementById("f_order").value.trim(),notes:document.getElementById("f_notes").value.trim(),calls:[{time:new Date().toISOString(),label:se()}]},o=l.upsertCustomer(i);this._hideBanner(),this._editingId=o.id,document.getElementById("btnDelete").style.display="inline-flex",document.getElementById("btnSave").innerHTML='<i class="ti ti-edit"></i> Änderungen speichern',h("formToast",`<i class="ti ti-check"></i> ${i.id?"Kundendaten aktualisiert.":"Neuer Kunde gespeichert."}`,"ok");const s=this._originalCustomer;this._originalCustomer={...o},this._updateQuickActions(o),(a=this.onSaved)==null||a.call(this,o,{mode:i.id?"update":"create",previousCustomer:s})}_delete(){var s;if(!this._editingId)return;const e=l.findById(this._editingId),t=(e==null?void 0:e.name)||document.getElementById("f_name").value.trim()||"diesen Kunden";if(!confirm(`${t} wirklich löschen? Der Eintrag wird lokal und in Google Sheets entfernt.`))return;const i=l.deleteCustomer(this._editingId),o=this._originalCustomer;this.clear(),h("formToast",'<i class="ti ti-trash"></i> Kunde gelöscht.',"ok"),(s=this.onDeleted)==null||s.call(this,i||e||o)}}class fe{constructor(e,{sipManager:t,onSIPConnected:i,onSIPDisconnected:o,onSheetsConnected:s}){this.container=e,this.sipManager=t,this.onSIPConnected=i,this.onSIPDisconnected=o,this.onSheetsConnected=s}renderSIP(){var t;const e=l.getSIPConfig();this.container.innerHTML=`
      <!-- Fritz!Box info box -->
      <div class="vf-box">
        <div class="vf-header">
          <div class="vf-logo" style="background:#0059A3">
            <i class="ti ti-router"></i>
          </div>
          <div>
            <div class="vf-title" style="color:#003D73">FRITZ!Box 6490 Cable</div>
            <div class="vf-sub" style="color:#005A9E">Internes IP-Telefon via LAN/WLAN · Vodafone (NRW/Hessen)</div>
          </div>
        </div>

        <div class="field-row">
          <label>Registrar <span class="prefill-tag">Fritz!Box</span></label>
          <div class="field-box prefilled">${m.registrar} &nbsp;·&nbsp; ${m.registrarAlt}</div>
        </div>
        <div class="field-row">
          <label>WebSocket-Port <span class="prefill-tag">Fritz!Box</span></label>
          <div class="field-box prefilled">${m.wsPort} (WSS) · Pfad: ${m.wsPath}</div>
        </div>
        <div class="field-row">
          <label>Rufnummern <span class="prefill-tag">Vodafone</span></label>
          <div class="field-box prefilled" style="line-height:1.8">
            ${m.numbers.join("<br>")}
          </div>
        </div>

        <hr class="divider" style="border-color:#B5D0E8" />

        <div class="field-row">
          <label>Benutzername</label>
          <div class="field-box">
            <input type="text" id="sipUser"
              placeholder="Fritz!Box SIP username"
              value="${e.user||""}"
              autocomplete="username" />
          </div>
        </div>
        <div class="field-row">
          <label>Kennwort</label>
          <div class="field-box">
            <input type="password" id="sipPass"
              placeholder="Fritz!Box SIP-Kennwort"
              autocomplete="current-password" />
          </div>
        </div>
        <div class="field-row">
          <label>Registrar</label>
          <div class="field-box">
            <input type="text" id="sipRegistrar"
              value="${e.registrar||m.registrar}"
              placeholder="fritz.box oder 192.168.178.1" />
          </div>
        </div>
        <div class="field-row">
          <label>Ausgehende Rufnr.</label>
          <div class="field-box">
            <select id="sipNumber" style="width:100%;border:none;background:transparent;font-size:12.5px;color:var(--text);font-family:var(--font);outline:none">
              ${m.numbers.map(i=>`<option value="${i}" ${e.number===i?"selected":""}>${i}</option>`).join("")}
            </select>
          </div>
        </div>
      </div>

      <div class="notice n-info" style="margin-bottom:12px">
        <i class="ti ti-info-circle"></i>
        <div>
          Benutzername und Kennwort finden Sie in Ihrer Fritz!Box unter
          <strong>Telefonie → Telefoniegeräte → IP-Telefon → Anmeldedaten</strong>.
          <br>Fritz!Box Admin-Seite: <strong><a href="http://fritz.box" target="_blank" style="color:var(--blue)">http://fritz.box</a></strong>
          &nbsp;oder&nbsp;
          <strong><a href="http://192.168.178.1" target="_blank" style="color:var(--blue)">http://192.168.178.1</a></strong>
        </div>
      </div>

      <div id="sipNotice" class="notice n-warn" style="margin-bottom:10px">
        <i class="ti ti-alert-triangle"></i>
        Bitte Kennwort eingeben. Benutzername ist bereits vorausgefüllt.
      </div>

      <div id="sipBtnArea">
        <button class="btn btn-primary" id="btnSIPConnect">
          <i class="ti ti-plug"></i> Mit Fritz!Box verbinden
        </button>
      </div>

      <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--border)">
        <div class="sec-label">Wie es funktioniert</div>
        <div class="step-list">
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-txt">
              Ihr PC / Laptop muss im selben Netzwerk wie die Fritz!Box sein (LAN-Kabel oder WLAN <strong>your restaurant Wi-Fi</strong>).
            </div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-txt">
              Die App meldet sich als <strong>IP-Telefon</strong> an der Fritz!Box an —
              genau wie "IP-Telefon 1" in Ihrer Geräteliste. Klingelt die Festnetzleitung,
              erscheint das Popup sofort auf Ihrem Bildschirm.
            </div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-txt">
              Die Fritz!Box leitet Anrufe von Vodafone automatisch weiter —
              keine weiteren Vodafone-Zugangsdaten erforderlich.
            </div>
          </div>
          <div class="step">
            <div class="step-num">4</div>
            <div class="step-txt">
              In der Fritz!Box unter <strong>Telefoniegeräte → Neues Gerät → LAN/WLAN (IP-Telefon)</strong>
              einen neuen Eintrag für diesen Browser anlegen und die angezeigten Anmeldedaten hier eintragen.
            </div>
          </div>
        </div>
      </div>

      <div id="sipToast" style="margin-top:10px"></div>`,document.getElementById("btnSIPConnect").addEventListener("click",()=>this._connectSIP()),(t=this.sipManager)!=null&&t.connected&&this._showSIPConnected(e.registrar||m.registrar)}async _connectSIP(){var r,c,p,d,u;const e=(r=document.getElementById("sipUser"))==null?void 0:r.value.trim(),t=(c=document.getElementById("sipPass"))==null?void 0:c.value.trim(),i=(p=document.getElementById("sipNumber"))==null?void 0:p.value,o=((d=document.getElementById("sipRegistrar"))==null?void 0:d.value.trim())||m.registrar;if(!e||!t){h("sipToast",'<i class="ti ti-alert-triangle"></i> Bitte Benutzername und Kennwort eingeben.',"warn");return}const s=document.getElementById("btnSIPConnect");s.innerHTML='<i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> Verbinde mit Fritz!Box…',s.disabled=!0,l.saveSIPConfig({user:e,pass:t,number:i,registrar:o,connected:!1}),await this.sipManager.connect({user:e,pass:t,number:i,registrar:o})?(l.saveSIPConfig({user:e,pass:t,number:i,registrar:o,connected:!0}),this._showSIPConnected(o),h("sipToast",'<i class="ti ti-check"></i> Fritz!Box verbunden! Eingehende Anrufe erscheinen jetzt als Popup.',"ok"),(u=this.onSIPConnected)==null||u.call(this)):(s.innerHTML='<i class="ti ti-plug"></i> Erneut versuchen',s.disabled=!1,h("sipToast",'<i class="ti ti-alert-triangle"></i> Verbindung fehlgeschlagen. Prüfen Sie: 1) PC im selben Netz wie Fritz!Box? 2) Kennwort korrekt? 3) Neues IP-Telefon in Fritz!Box angelegt?',"warn"))}_showSIPConnected(e){var o;const t=document.getElementById("sipNotice"),i=document.getElementById("sipBtnArea");t&&(t.className="notice n-ok",t.innerHTML=`<i class="ti ti-check"></i> Verbunden mit <strong>${e}</strong> (Fritz!Box 6490 Cable) – Festnetz aktiv, Popup erscheint bei Anruf.`),i&&(i.innerHTML=`
        <div style="display:flex;gap:8px">
          <div class="btn-connected" style="flex:1">
            <i class="ti ti-check" style="font-size:13px;vertical-align:-1px;margin-right:4px"></i>
            Verbunden · ${e}
          </div>
          <button class="btn btn-sec" style="width:auto;padding:9px 14px" id="btnSIPDisconnect">
            Trennen
          </button>
        </div>`,(o=document.getElementById("btnSIPDisconnect"))==null||o.addEventListener("click",()=>{var s;this.sipManager.disconnect(),(s=this.onSIPDisconnected)==null||s.call(this),this.renderSIP()}))}renderSheets(){const e=l.getGSConfig();this.container.innerHTML=`
      <div class="notice n-info" style="margin-bottom:14px">
        <i class="ti ti-table"></i>
        <div>
          Jeder gespeicherte Kunde wird automatisch in Ihr Google Sheet übertragen.<br>
          <strong>Wichtig:</strong> Schreiben funktioniert nicht mit einem API-Schlüssel allein. Verwenden Sie die Google Apps Script Web-App-URL.
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px">
        <div class="field-row" style="margin-bottom:0">
          <label>Web-App-URL</label>
          <div class="field-box">
            <input type="url" id="gsWebAppUrl" placeholder="https://script.google.com/macros/s/.../exec" value="${e.webAppUrl||""}" />
          </div>
        </div>
        <div class="field-row" style="margin-bottom:0">
          <label>Blattname</label>
          <div class="field-box">
            <input type="text" id="gsSheet" value="${e.sheetName||"Customers"}" />
          </div>
        </div>
      </div>

      <div id="gsNotice" class="notice n-warn" style="margin-bottom:10px">
        <i class="ti ti-alert-triangle"></i>
        Apps Script Web-App-URL eingeben, um die Synchronisierung zu aktivieren.
      </div>

      <div id="gsBtnArea">
        <button class="btn btn-primary" id="btnGSConnect">
          <i class="ti ti-table"></i> Google Sheets verbinden & testen
        </button>
      </div>

      <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--border)">
        <div class="sec-label">Einrichtung</div>
        <div class="step-list">
          <div class="step">
            <div class="step-num">1</div>
            <div class="step-txt">Google Sheet öffnen → <strong>Erweiterungen → Apps Script</strong></div>
          </div>
          <div class="step">
            <div class="step-num">2</div>
            <div class="step-txt">Den Code aus <code>google-apps-script.gs</code> einfügen und speichern</div>
          </div>
          <div class="step">
            <div class="step-num">3</div>
            <div class="step-txt"><strong>Bereitstellen → Neue Bereitstellung → Web-App</strong>: Ausführen als <strong>Ich</strong>, Zugriff <strong>Jeder mit dem Link</strong></div>
          </div>
          <div class="step">
            <div class="step-num">4</div>
            <div class="step-txt">Die Web-App-URL, die auf <code>/exec</code> endet, hier einfügen und testen</div>
          </div>
        </div>
      </div>

      <div id="gsToast" style="margin-top:10px"></div>`,document.getElementById("btnGSConnect").addEventListener("click",()=>this._connectSheets()),e.connected&&C(e.webAppUrl)&&this._showSheetsConnected(e.sheetName||"Customers"),e.connected&&e.webAppUrl&&!C(e.webAppUrl)&&(l.saveGSConfig({webAppUrl:"",sheetName:e.sheetName||"Customers",connected:!1}),h("gsToast",'<i class="ti ti-alert-triangle"></i> Gespeicherte Apps-Script-Editor-URL wurde entfernt. Bitte die Web-App-URL mit /exec einfügen.',"warn"))}async _connectSheets(){var o,s,a;const e=(o=document.getElementById("gsWebAppUrl"))==null?void 0:o.value.trim(),t=((s=document.getElementById("gsSheet"))==null?void 0:s.value.trim())||"Customers";if(!e){h("gsToast",'<i class="ti ti-alert-triangle"></i> Google Apps Script Web-App-URL ist erforderlich.',"warn");return}if(!C(e)){h("gsToast",'<i class="ti ti-alert-triangle"></i> Bitte die Web-App-URL verwenden, die mit /exec endet. Nicht die Apps-Script-Editor-URL /home/projects/.../edit verwenden.',"warn");return}const i=document.getElementById("btnGSConnect");i.innerHTML='<i class="ti ti-loader-2" style="animation:spin 1s linear infinite"></i> Teste Verbindung…',i.disabled=!0;try{const c=await new $({webAppUrl:e,sheetName:t}).testConnection();l.saveGSConfig({webAppUrl:e,sheetName:t,connected:!0}),this._showSheetsConnected(t),h("gsToast",`<i class="ti ti-check"></i> Verbunden mit "<strong>${c}</strong>" – Synchronisierung aktiv.`,"ok"),(a=this.onSheetsConnected)==null||a.call(this,{webAppUrl:e,sheetName:t})}catch(r){h("gsToast",`<i class="ti ti-alert-triangle"></i> Fehler: ${r.message}`,"warn"),i.innerHTML='<i class="ti ti-table"></i> Erneut versuchen',i.disabled=!1}}_showSheetsConnected(e){const t=document.getElementById("gsNotice"),i=document.getElementById("gsBtnArea");t&&(t.className="notice n-ok",t.innerHTML=`<i class="ti ti-check"></i> Verbunden mit <strong>${e}</strong> – Kundendaten werden automatisch synchronisiert.`),i&&(i.innerHTML=`<div class="btn-connected"><i class="ti ti-check" style="font-size:13px;vertical-align:-1px;margin-right:4px"></i>Synchronisierung aktiv – ${e}</div>`)}}function F(n){return(n?new Date(n):new Date).toISOString().slice(0,10)}function G(n,e){return e?`${Math.round(n/e*100)}%`:"0%"}class be{constructor(e,{onOpenCustomer:t,onOpenSettings:i}){this.container=e,this.onOpenCustomer=t,this.onOpenSettings=i}render(){var p;const e=l.getCustomers(),t=l.getLog(),i=F(),o=t.filter(d=>F(d.ts||Date.now())===i),s=e.filter(d=>String(d.cat||"").toLowerCase()==="vip"),a=e.filter(d=>d.name&&d.phone&&d.addr&&d.order),r=[...e].sort((d,u)=>new Date(u.updatedAt||u.createdAt||0)-new Date(d.updatedAt||d.createdAt||0)).slice(0,5),c=l.getGSConfig();this.container.innerHTML=`
      <div class="dashboard-hero">
        <div>
          <div class="customer-hero-kicker">Operations cockpit</div>
          <div class="dashboard-title">Pizza Prima läuft im Control-Tower-Modus</div>
          <p class="dashboard-sub">Live customer intelligence, calls, Google Sheets status and useful actions in one place.</p>
        </div>
        <div class="dashboard-orb"><i class="ti ti-dashboard"></i></div>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card"><span>Kunden</span><strong>${e.length}</strong><small>gesamt gespeichert</small></div>
        <div class="kpi-card"><span>Heute</span><strong>${o.length}</strong><small>Anrufe im Verlauf</small></div>
        <div class="kpi-card"><span>VIP</span><strong>${s.length}</strong><small>${G(s.length,e.length)} der Kunden</small></div>
        <div class="kpi-card"><span>Datenqualität</span><strong>${G(a.length,e.length)}</strong><small>Name + Telefon + Adresse + Bestellung</small></div>
      </div>

      <div class="insight-grid">
        <section class="insight-card">
          <div class="insight-head"><div><strong>Google Sheets Sync</strong><small>Realtime mirror status</small></div><i class="ti ti-table"></i></div>
          <div class="sync-big ${c.connected?"ok":"warn"}">${c.connected?"Connected":"Local only"}</div>
          <p>${c.connected?"Every save, edit and delete mirrors the full customer list to your Sheet.":"Connect a Web App URL ending in /exec to enable cloud sync."}</p>
          <button class="btn btn-sec" id="dashSheets"><i class="ti ti-settings"></i> Open Sheets setup</button>
        </section>
        <section class="insight-card">
          <div class="insight-head"><div><strong>Recent customers</strong><small>Fast access</small></div><i class="ti ti-users"></i></div>
          <div class="recent-list">
            ${r.length?r.map(d=>`
              <button class="recent-chip" data-id="${d.id}">
                <span>${d.name||d.phone||"Unnamed customer"}</span>
                <small>${d.cat||"No category"} · ${d.phone||"No phone"}</small>
              </button>`).join(""):'<div class="empty mini">No customers yet.</div>'}
          </div>
        </section>
      </div>`,(p=this.container.querySelector("#dashSheets"))==null||p.addEventListener("click",()=>{var d;return(d=this.onOpenSettings)==null?void 0:d.call(this,"sheets")}),this.container.querySelectorAll(".recent-chip").forEach(d=>{d.addEventListener("click",()=>{var S;const u=l.findById(d.dataset.id);u&&((S=this.onOpenCustomer)==null||S.call(this,u))})})}}const J=document.createElement("style");J.textContent="@keyframes spin { to { transform: rotate(360deg); } }";document.head.appendChild(J);document.getElementById("app").innerHTML=`
  <!-- Top bar -->
  <div class="topbar">
    <div class="brand">
      <div class="brand-icon">🍕</div>
      <div>
        <div class="brand-name">Pizza Prima</div>
        <div class="brand-sub">Premium Call CRM &mdash; Germany</div>
      </div>
    </div>
    <div class="topbar-right">
      <div class="pill" id="vfPill">
        <i class="ti ti-router" style="font-size:13px"></i>
        Fritz!Box · Vodafone
      </div>
      <div class="pill" id="sipPill">
        <span class="sip-dot" id="sipDot"></span>
        <span id="sipLabel">SIP: nicht verbunden</span>
      </div>
      <div class="pill" id="gsPill">
        <i class="ti ti-table" style="font-size:13px"></i>
        <span id="gsLabel">Lokal</span>
      </div>
    </div>
  </div>

  <!-- Popup mount point -->
  <div id="popupMount"></div>

  <!-- Main grid -->
  <div class="main">
    <div class="left-panel">
      <!-- Simulate strip -->
      <div class="sim-strip">
        <span class="sim-label">
          <i class="ti ti-device-landline" style="font-size:14px;vertical-align:-2px;margin-right:3px"></i>
          Testanruf simulieren:
        </span>
        <button class="sim-btn" id="simKnown">
          <i class="ti ti-phone-incoming"></i> Stammkunde
        </button>
        <button class="sim-btn" id="simUnknown">
          <i class="ti ti-phone-incoming"></i> Unbekannte Nr.
        </button>
        <button class="sim-btn" id="simVIP">
          <i class="ti ti-phone-incoming"></i> VIP-Kunde
        </button>
      </div>

      <!-- Card with tabs -->
      <div class="card glass-card" style="flex:1">
        <div class="tabs">
          <div class="tab active" data-tab="dashboard">Dashboard</div>
          <div class="tab" data-tab="log">Anrufliste</div>
          <div class="tab" data-tab="customers">Kunden</div>
          <div class="tab" data-tab="sip">Fritz!Box SIP</div>
          <div class="tab" data-tab="sheets">Google Sheets</div>
        </div>
        <div id="tabContent"></div>
      </div>
    </div>

    <!-- Right panel: customer form -->
    <div class="right-panel" id="rightPanel"></div>
  </div>`;let B=null,v="dashboard";const y=l.getGSConfig();y!=null&&y.connected&&C(y==null?void 0:y.webAppUrl)&&(B=new $({webAppUrl:y.webAppUrl,sheetName:y.sheetName||"Customers"}));const ye=new te({onIncomingCall:({number:n})=>z(n),onCallEnded:()=>I("ok","SIP: verbunden"),onRegistered:()=>I("ok","SIP: verbunden"),onUnregistered:()=>I("offline","SIP: nicht verbunden"),onError:n=>{I("offline","SIP: Fehler"),console.error("[SIP]",n)}}),Ie=new ue(document.getElementById("popupMount")),E=new ve(document.getElementById("rightPanel"),{onSaved:()=>{T("updated"),["dashboard","log","customers"].includes(v)&&b(v)},onDeleted:()=>{T("deleted"),["dashboard","log","customers"].includes(v)&&b(v)}}),H=new be(document.getElementById("tabContent"),{onOpenCustomer:n=>{E.load(n),b("customers")},onOpenSettings:n=>b(n||"sheets")}),V=new pe(document.getElementById("tabContent"),{onSelectCall:n=>{const e=l.findByPhone(n.phone);e?E.load(e):(E.clear(),document.getElementById("f_phone").value=n.phone)}}),K=new ge(document.getElementById("tabContent"),{onSelectCustomer:n=>E.load(n),onDeleteCustomer:()=>{T("deleted"),E.clear(),["dashboard","log","customers"].includes(v)&&b(v)},onDataChanged:n=>{T(n||"changed"),["dashboard","log","customers"].includes(v)&&b(v)}}),k=new fe(document.getElementById("tabContent"),{sipManager:ye,onSIPConnected:()=>I("ok","SIP: verbunden"),onSIPDisconnected:()=>I("offline","SIP: nicht verbunden"),onSheetsConnected:({webAppUrl:n,sheetName:e})=>{B=new $({webAppUrl:n,sheetName:e}),document.getElementById("gsLabel").textContent="Google Sheets ✓"}});function T(n="updated"){if(!B){alert("Google Sheets ist nicht verbunden. Öffne den Tab Google Sheets und füge die Web-App-URL ein, die mit /exec endet.");return}const e=l.getCustomers();B.syncAllCustomers(e).then(t=>{console.info(`[Sheets] Full sync ${n}:`,t)}).catch(t=>{console.warn("[Sheets] Full sync failed:",t),alert("Google Sheets konnte nicht synchronisiert werden: "+t.message)})}function b(n){v=n,document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab===n));const e=document.getElementById("tabContent");switch(n){case"dashboard":H.container=e,H.render();break;case"log":V.container=e,V.render();break;case"customers":K.container=e,K.render();break;case"sip":k.container=e,k.renderSIP();break;case"sheets":k.container=e,k.renderSheets();break}}document.querySelectorAll(".tab").forEach(n=>{n.addEventListener("click",()=>b(n.dataset.tab))});function z(n){const e=l.findByPhone(n);l.addLogEntry({name:(e==null?void 0:e.name)||"",phone:n,type:"in",time:W().replace(" Uhr","")}),I("ring","Klingelt…"),Ie.show({number:n,customer:e,onOpen:()=>{e?E.load(e):E.setIncomingPhone(n),I("ok","SIP: verbunden")}}),v==="log"&&b("log"),Se(n,e)}const q=["+49 000 222222","+49 000 333333","+49 000 444444","+49 000 555555"];document.getElementById("simKnown").addEventListener("click",()=>{z(l.getCustomers()[0].phone)});document.getElementById("simVIP").addEventListener("click",()=>{z(l.getCustomers()[1].phone)});document.getElementById("simUnknown").addEventListener("click",()=>{const n=q[Math.floor(Math.random()*q.length)];z(n)});function I(n,e){const t=document.getElementById("sipDot"),i=document.getElementById("sipLabel");t&&(t.className="sip-dot",n!=="offline"&&t.classList.add(n)),i&&(i.textContent=e)}async function Se(n,e){if("Notification"in window&&(Notification.permission==="default"&&await Notification.requestPermission(),Notification.permission==="granted")){const t=e?`📞 ${e.name}`:"📞 Eingehender Anruf",i=e?`${n}
${e.addr||""}`:`${n} – Neue Nummer`;new Notification(t,{body:i,icon:"/favicon.svg"})}}const w=l.getGSConfig();w.connected&&C(w.webAppUrl)?(B=new $({webAppUrl:w.webAppUrl,sheetName:w.sheetName}),document.getElementById("gsLabel").textContent="Google Sheets ✓"):w.connected&&w.webAppUrl&&(l.saveGSConfig({webAppUrl:"",sheetName:w.sheetName||"Customers",connected:!1}),document.getElementById("gsLabel").textContent="Local");b("dashboard");
