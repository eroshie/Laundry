/* Plain JavaScript application. No framework, imports, or build step required. */
'use strict';
const root = document.getElementById('app');
const state = {
  page: 'welcome', menu: false, modal: false, selected: null, search: '',
  period: 'day', portalIds: ['920', '123', '88', '72'], expanded: '920', rating: 5,
  orders: load('laundry-orders', initialOrders), reviews: load('laundry-reviews', initialReviews)
};
let toastTimer;
function load(key, fallback) {
  try { const data = JSON.parse(localStorage.getItem(key)); return Array.isArray(data) ? data : structuredClone(fallback); }
  catch { return structuredClone(fallback); }
}
function save() {
  try {
    localStorage.setItem('laundry-orders', JSON.stringify(state.orders));
    localStorage.setItem('laundry-reviews', JSON.stringify(state.reviews));
  } catch { notify('Browser storage is unavailable. Changes will last only for this session.'); }
}
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
const h = escapeHTML;
const paths = {
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  right:'<path d="m9 5 7 7-7 7"/>', left:'<path d="m15 5-7 7 7 7"/>', down:'<path d="m5 9 7 7 7-7"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  machine:'<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="14" r="5"/><path d="M7 6h1m3 0h6M8 14c3-3 5 3 8 0"/>',
  orders:'<rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 2h6v4H9zM9 11h6M9 15h6"/>',
  dashboard:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  customers:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 5a5 5 0 0 1 3 5"/>',
  reports:'<path d="M4 20h17M7 16V9m5 7V4m5 12v-6"/>',
  star:'<path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',
  heart:'<path d="M20 5c-3-3-7-1-8 1-1-2-5-4-8-1-4 4 0 8 8 15 8-7 12-11 8-15z"/>',
  bell:'<path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zM10 21h4"/>',
  search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  exit:'<path d="M10 3H4v18h6M9 12h12m-5-5 5 5-5 5"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>'
};
function icon(name, size=20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.machine}</svg>`;
}
function button(action, content, cls='', extra='') {
  return `<button type="button" data-action="${action}" class="${cls}" ${extra}>${content}</button>`;
}
function badge(status) { return `<span class="badge ${h(status.toLowerCase())}">${h(status)}</span>`; }
function notify(message) {
  document.getElementById('toast')?.remove();
  const toast = document.createElement('div');
  toast.id = 'toast'; toast.className = 'toast'; toast.setAttribute('role','status'); toast.textContent = message;
  document.body.append(toast); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.remove(), 4000);
}
function go(page) { state.page=page; state.menu=false; state.search=''; render(); window.scrollTo(0,0); }
function updateOrder(patch) {
  state.orders = state.orders.map(order => order.id===state.selected ? {...order,...patch} : order);
  save(); render();
}
function steps(status, customer=false) {
  return `<div class="steps">${stages.map((s,i) => `<div class="${i<=stages.indexOf(status)?'done '+s.toLowerCase():''}"><span>${icon(['orders','machine','heart','check'][i],15)}</span><small>${(customer?['Received','Washing','Folding','Ready']:['In Line','Washing','Drying','Ready'])[i]}</small></div>`).join('')}</div>`;
}
function orderCard(order, index=null) {
  return button('detail', `<span class="order-icon">${index===null?icon('machine'):index+1}</span><span class="order-copy"><strong>${h(order.name)}</strong><small>${h(order.service)} · ${order.weight} kg${state.page==='orders'?' · '+money(order.price):''}</small></span>${order.paid&&state.page==='orders'?'<span class="paid">PAID</span>':''}${badge(order.status)}${icon('right',16)}`, `order-row ${state.page==='customers'?'green':''}`, `data-id="${h(order.id)}"`);
}
function reviewCards(items) {
  return items.map((r,i) => `<article class="review-card"><span class="avatar a${i%5}">${h(r.name[0])}</span><div><div class="review-heading"><strong>${h(r.name)}</strong><small>${new Date(r.date+'T00:00:00').toLocaleDateString('en-PH',{month:'short',day:'numeric',year:'numeric'})}</small></div><div class="stars">${'★'.repeat(r.rating)}<span>${'★'.repeat(5-r.rating)}</span> <small>${h(r.service)}</small></div><p>${h(r.comment)}</p></div></article>`).join('');
}
function average() { return state.reviews.length ? state.reviews.reduce((s,r)=>s+r.rating,0)/state.reviews.length : 0; }
function total(orders=state.orders) { return orders.reduce((s,o)=>s+o.price,0); }
function detailRows(rows) { return rows.map(([label,value])=>`<div class="detail-row"><span>${h(label)}</span><strong>${h(value)}</strong></div>`).join(''); }
function header() {
  if (!['dashboard','orders','customers','reports','reviews'].includes(state.page)) return '';
  const titles={dashboard:'Laundry Shop Tracking',orders:'Orders',customers:'Customer',reports:'Reports',reviews:'Customer Reviews'};
  const subtitles={orders:`${state.orders.filter(o=>['Wash','Dry'].includes(o.status)).length} currently in machine`, customers:"Welcome! here's the latest laundry status",reviews:'What customers are saying'};
  return `<header>${button('menu',icon('menu',22),'icon-button','aria-label="Open navigation"')}<div><h1>${titles[state.page]}</h1>${subtitles[state.page]?'<small>'+subtitles[state.page]+'</small>':''}</div>${state.page==='orders'?button('add',icon('plus'),'add-button','aria-label="Add laundry order"'):'<span class="brand-dot"></span>'}</header>`;
}
function drawer() {
  if(!state.menu) return '';
  return `<div class="overlay" data-dismiss="menu"><nav class="drawer">${button('close-menu',icon('close'),'close','aria-label="Close navigation"')}<div class="drawer-brand">${icon('machine')} Laundry</div>${[['dashboard','Dashboard'],['orders','Order'],['customers','Customers'],['reports','Reports'],['reviews','Reviews']].map(([page,label])=>button('go',icon(page==='reviews'?'star':page,19)+label,state.page===page?'active':'',`data-page="${page}"`)).join('')}${button('go','Staff user '+icon('exit',18),'logout','data-page="welcome"')}</nav></div>`;
}
function welcome() {
  return `<section class="welcome"><div class="bubbles"></div><img class="welcome-illustration" src="./assets/laundry-illustration.png" alt="Laundry being washed with real-time tracking"><div class="welcome-bottom"><h1>Laundry Tracking System</h1><p>Manage orders, customers & reports seamlessly</p>${button('go','Get Started '+icon('right',18),'primary','data-page="login"')}${button('go','Track my laundry →','text-button','data-page="track"')}</div></section>`;
}
function login() {
  return `<section class="login"><div class="bubbles"></div>${button('go',icon('left')+' Back','back','data-page="welcome"')}<form class="card login-card" data-form="login">${icon('machine',42)}<h1>WELCOME</h1><p>Sign in to your laundry workspace</p><label>Client Name<input name="client" placeholder="123" required autocomplete="username"></label><label>Password<input type="password" name="password" placeholder="Enter your value" required autocomplete="current-password"></label>${button('forgot','Forgot password?','forgot')}<button class="primary dark">Login</button><small class="demo-note">Demo workspace · no real authentication</small></form></section>`;
}
function dashboard() {
  const metrics=[['Customers',new Set(state.orders.map(o=>o.phone)).size,'blue'],['Ready',state.orders.filter(o=>o.status==='Ready').length,'mint'],['Pending',state.orders.filter(o=>o.status==='Pending').length,'peach'],['Total Sales',money(total()),'purple']];
  const labels=state.period==='day'?['Mon','Tue','Wed','Thu','Fri','Sat','Sun']:['Apr','May','Jun','Jul','Aug','Sep'];
  return `<section class="content"><div class="stats">${metrics.map(([label,value,color])=>`<div class="stat ${color}"><small>${label}</small><strong>${value}</strong></div>`).join('')}</div><div class="card chart-card"><div class="tabs">${button('period','Total Sales — Everyday',state.period==='day'?'active':'','data-period="day"')}${button('period','Total Sales — Per Month',state.period==='month'?'active':'','data-period="month"')}</div><div class="chart">${labels.map((label,i)=>`<div><span style="height:${28+(i*17)%64}%" title="Illustrative sales trend"></span><small>${label}</small></div>`).join('')}</div><small class="demo-note">Illustrative trend · totals reflect current orders</small></div><div class="card"><h2>Recent Laundry Status</h2>${state.orders.slice(0,5).map(o=>orderCard(o)).join('')}</div>${button('go','Manage orders '+icon('right',18),'primary','data-page="orders"')}</section>`;
}
function ordersPage() {
  return `<section class="content">${[['In Machine Now',['Wash','Dry']],['Waiting Queue',['Pending']],['Ready for Pickup',['Ready']]].map(([title,statuses])=>{
    const orders=state.orders.filter(o=>statuses.includes(o.status));
    return `<h2 class="section-label">${title}<span>${orders.length}</span></h2>${orders.map((o,i)=>orderCard(o,o.status==='Pending'?i:null)).join('') || '<p class="empty">No orders here yet.</p>'}`;
  }).join('')}</section>`;
}
function matchingOrders() { return state.orders.filter(o=>`${o.name} ${o.id} ${o.phone} ${o.status}`.toLowerCase().includes(state.search.toLowerCase())); }
function customerResults() { return matchingOrders().map((o,i)=>orderCard(o,o.status==='Pending'?i:null)).join('') || '<p class="empty">No customers found.</p>'; }
function customersPage() {
  return `<section class="content"><div class="summary">${stages.map(s=>button('filter',`<strong>${state.orders.filter(o=>o.status===s).length}</strong><small>${s}</small>`,'',`data-status="${s}"`)).join('')}</div><div class="search">${icon('search',17)}<input aria-label="Search customers" placeholder="Search customers..." value="${h(state.search)}" id="customer-search"></div><h2 class="section-label">Waiting Queue<span>${state.orders.filter(o=>o.status==='Pending').length} in line</span></h2><div id="customer-results" class="results">${customerResults()}</div></section>`;
}
function detail() {
  const o=state.orders.find(o=>o.id===state.selected); if(!o) return customersPage();
  const titles={Pending:'Your Laundry is in Line',Wash:'Washing',Dry:'Drying & Folding',Ready:'Ready for Pickup'};
  const descriptions={Pending:'Your laundry has been received and is queued',Wash:'Your clothes are being washed',Dry:'Almost done — being folded neatly',Ready:'Your laundry is ready! Come pick it up'};
  return `<header class="detail-header">${button('go',icon('left'),'icon-button','aria-label="Back to customers" data-page="customers"')}<div><h1>${h(o.name)}</h1><small>${h(o.phone)}</small></div>${badge(o.status)}</header><div class="status-hero ${o.status.toLowerCase()}"><div class="status-orb">${icon({Ready:'check',Dry:'heart',Wash:'machine',Pending:'orders'}[o.status])}</div><h2>${titles[o.status]}</h2><p>${descriptions[o.status]}</p></div><section class="content detail-content">${steps(o.status)}<div class="card"><h2 class="eyebrow">Service Details</h2>${detailRows([['Service',o.service],['Weight',o.weight+' kg'],['Total Price',money(o.price)],['Payment',o.paid?'PAID':'UNPAID']])}</div><div class="card controls"><label>Update laundry status<select id="order-status">${stages.map(s=>`<option ${s===o.status?'selected':''}>${s}</option>`).join('')}</select></label>${button('payment',o.paid?'Mark unpaid':'Record cash payment','secondary')}</div>${o.status==='Ready'?`<div class="notify-card">${icon('bell',22)}<div><strong>Notify Customer</strong><small>Laundry is ready for pickup</small></div>${button('notify',o.notified?'Notification saved':'Send Notification')}<small>Demo notification · no SMS service connected</small></div>`:''}<form class="card" data-form="note"><h2 class="eyebrow">Notes</h2>${o.notes.map(n=>`<p class="saved-note">${h(n)}</p>`).join('')}<textarea name="note" aria-label="Order note" placeholder="Enter your value" required></textarea><button class="small-button">Send</button></form></section>`;
}
function reviewsPage() {
  return `<section class="content"><div class="rating-summary"><div><strong>${average().toFixed(1)}</strong><div class="stars">★★★★★</div><small>${state.reviews.length} reviews</small></div><div class="rating-bars">${[5,4,3,2,1].map(n=>`<div><span>${n}</span><div><i style="width:${state.reviews.filter(r=>r.rating===n).length/Math.max(state.reviews.length,1)*100}%"></i></div><span>${state.reviews.filter(r=>r.rating===n).length}</span></div>`).join('')}</div></div>${reviewCards(state.reviews)}</section>`;
}
function reports() {
  return `<section class="content"><div class="card"><h2>Sales overview</h2><p class="muted">Based on all orders in this browser</p><div class="report-total">${money(total())}</div>${detailRows([['Cash collected',money(total(state.orders.filter(o=>o.paid)))],['Unpaid balance',money(total(state.orders.filter(o=>!o.paid)))],['Total weight',state.orders.reduce((s,o)=>s+o.weight,0)+' kg']])}</div><div class="card"><h2>Orders by status</h2>${stages.map(s=>`<div class="detail-row">${badge(s)}<strong>${state.orders.filter(o=>o.status===s).length}</strong></div>`).join('')}</div>${button('export',icon('download',18)+' Export report CSV','primary')}</section>`;
}
function track() {
  return `<section class="track">${button('go',icon('left')+' Back','back','data-page="welcome"')}<div class="track-icon">${icon('machine',48)}</div><h1>Track Your<br><span>Laundry</span></h1><p>Real-time status & pickup alerts</p><form class="card" data-form="track"><h2>Get started</h2><p>Enter your order ID to track your laundry</p><input aria-label="Order ID" name="id" placeholder="e.g. #123" required><button class="primary">Track My Laundry →</button>${button('demo-orders','Explore demo orders','text-button')}<small class="demo-note">Demo portal · order IDs are not secure authentication</small></form></section>`;
}
function portal() {
  const orders=state.orders.filter(o=>state.portalIds.includes(o.id)).sort((a,b)=>state.portalIds.indexOf(a.id)-state.portalIds.indexOf(b.id));
  const metrics=[['Total Orders',orders.length],['Total Spent',money(total(orders))],['Total Weight',orders.reduce((s,o)=>s+o.weight,0)+' kg']];
  return `<div class="summary">${metrics.map(([label,value])=>`<div><strong>${value}</strong><small>${label}</small></div>`).join('')}</div><h2 class="eyebrow">Active Orders</h2>${orders.map(o=>`<article class="card portal-order">${button('expand',`<span class="portal-order-icon ${o.status.toLowerCase()}">${icon(o.status==='Ready'?'check':'orders')}</span><div><strong>#${h(o.id.padStart(3,'0'))} ${badge(o.status)}</strong><small>${h(o.service)} · ${o.weight} kg · <b>${money(o.price)}</b></small></div>${icon('down',18)}`,'',`data-id="${h(o.id)}" aria-expanded="${state.expanded===o.id}"`)}${state.expanded===o.id?steps(o.status,true)+`<p class="muted">Payment: ${o.paid?'Paid':'Unpaid'}</p>`+o.notes.map(n=>`<p class="saved-note">${h(n)}</p>`).join(''):''}</article>`).join('')}`;
}
function reviewForm() {
  return `<form data-form="review"><div class="card star-picker"><div>${[1,2,3,4,5].map(n=>button('rating','★',n<=state.rating?'selected':'',`data-rating="${n}" aria-label="${n} star rating" aria-pressed="${state.rating===n}"`)).join('')}</div><strong id="rating-label">${['','Poor','Fair','Good','Very good','Excellent'][state.rating]}</strong></div><div class="card"><label>Your Name (optional)<input name="name" placeholder="Anonymous" maxlength="80"></label><label>Your Comment<textarea name="comment" placeholder="Tell us about your experience…" required maxlength="1000" id="review-comment"></textarea></label><div class="review-submit"><small id="char-count">0 chars</small><button class="primary">Submit Review</button></div></div></form>`;
}
function portalReviews() {
  return `<label class="eyebrow">Select a Laundry Shop<select><option>FreshPress Studio</option></select></label><h2 class="section-label">Reviews for FreshPress Studio<span class="stars">★ ${average().toFixed(1)} avg</span></h2>${reviewCards(state.reviews)}<h2 class="eyebrow">Write a Review</h2>${reviewForm()}`;
}
function portalShell() {
  return `<header class="portal-header"><div><span class="eyebrow">${state.page==='portal'?'Laundry Shop Customer Portal':'Customer Portal'}</span><h1>${state.page==='portal'?'My Orders':'Reviews'}</h1></div>${state.page==='portal'?button('alerts',icon('bell'),'icon-button','aria-label="Pickup alerts"'):''}</header><section class="content portal-content">${state.page==='portal'?portal():portalReviews()}</section><nav class="bottom-nav">${[['portal','My Orders','orders'],['portalReviews','Review','star'],['track','Exit','exit']].map(([page,label,symbol])=>button('go',icon(symbol,23)+`<small>${label}</small>`,state.page===page?'active':'',`data-page="${page}"`)).join('')}</nav>`;
}
function orderModal() {
  if(!state.modal) return '';
  return `<div class="overlay modal-overlay" data-dismiss="modal"><section role="dialog" aria-modal="true" aria-label="Add Laundry Order" class="modal"><div class="modal-heading"><h2>Add Laundry Order</h2>${button('close-modal',icon('close'),'icon-button','aria-label="Close order form"')}</div><form data-form="order"><label>Customer Name<input name="name" placeholder="e.g. Juan dela Cruz" required maxlength="80"></label><label>Phone<input name="phone" type="tel" placeholder="e.g. 09123456789" pattern="[0-9+ ()-]{7,20}" required></label><div class="form-columns"><label>Weight (kg)<input type="number" step="0.1" min="0.1" max="1000" name="weight" placeholder="e.g. 5" required></label><label>Price (₱)<input type="number" step="0.01" min="1" name="price" placeholder="e.g. 250" required></label></div><label>Service<select name="service"><option>Wash & Fold</option><option>Wash Only</option><option>Dry Clean</option></select></label><label class="checkbox">Already Paid (Cash)<input type="checkbox" name="paid"></label><button class="primary">Add to Queue</button></form></section></div>`;
}
function render() {
  const pages={welcome,login,dashboard,orders:ordersPage,customers:customersPage,detail,reviews:reviewsPage,reports,track};
  const customer=state.page==='portal'||state.page==='portalReviews';
  root.className='app'+(customer?' portal-app':'');
  root.innerHTML=header()+(customer?portalShell():(pages[state.page]||welcome)())+drawer()+orderModal();
}
function exportReport() {
  const rows=[['Order ID','Customer','Service','Weight kg','Price PHP','Status','Paid'],...state.orders.map(o=>[o.id,o.name,o.service,o.weight,o.price,o.status,o.paid?'Yes':'No'])];
  const csv=rows.map(row=>row.map(value=>'"'+String(value).replaceAll('"','""')+'"').join(',')).join('\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a'); link.href=url; link.download='laundry-report.csv'; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
root.addEventListener('click',event=>{
  if(event.target.matches('[data-dismiss]')) {
    state[event.target.dataset.dismiss==='menu'?'menu':'modal']=false; render(); return;
  }
  const target=event.target.closest('button[data-action]'); if(!target) return;
  switch(target.dataset.action) {
    case 'go': go(target.dataset.page); break;
    case 'menu': state.menu=true; render(); break;
    case 'close-menu': state.menu=false; render(); break;
    case 'add': state.modal=true; render(); root.querySelector('.modal input')?.focus(); break;
    case 'close-modal': state.modal=false; render(); break;
    case 'forgot': notify('Demo login: enter any client name and password.'); break;
    case 'detail': state.selected=target.dataset.id; go('detail'); break;
    case 'period': state.period=target.dataset.period; render(); break;
    case 'filter': state.search=state.search===target.dataset.status?'':target.dataset.status; render(); break;
    case 'payment': updateOrder({paid:!state.orders.find(o=>o.id===state.selected).paid}); break;
    case 'notify': updateOrder({notified:true}); notify('Demo pickup notification saved. No SMS was sent.'); break;
    case 'export': exportReport(); break;
    case 'demo-orders': state.portalIds=['920','123','88','72']; go('portal'); break;
    case 'expand': state.expanded=state.expanded===target.dataset.id?null:target.dataset.id; render(); break;
    case 'alerts': notify(state.orders.filter(o=>state.portalIds.includes(o.id)&&o.status==='Ready').map(o=>`Order #${o.id} is ready for pickup`).join(' · ')||'No pickup alerts yet'); break;
    case 'rating':
      state.rating=Number(target.dataset.rating);
      root.querySelectorAll('[data-action="rating"]').forEach(b=>{b.classList.toggle('selected',Number(b.dataset.rating)<=state.rating); b.setAttribute('aria-pressed',Number(b.dataset.rating)===state.rating);});
      root.querySelector('#rating-label').textContent=['','Poor','Fair','Good','Very good','Excellent'][state.rating]; break;
  }
});
root.addEventListener('input',event=>{
  if(event.target.id==='customer-search') {state.search=event.target.value;root.querySelector('#customer-results').innerHTML=customerResults();}
  if(event.target.id==='review-comment') root.querySelector('#char-count').textContent=event.target.value.length+' chars';
});
root.addEventListener('change',event=>{
  if(event.target.id==='order-status'&&stages.includes(event.target.value)) {updateOrder({status:event.target.value});notify('Laundry status updated');}
});
root.addEventListener('submit',event=>{
  const form=event.target.closest('form[data-form]'); if(!form) return;
  event.preventDefault(); if(!form.reportValidity()) return;
  const data=new FormData(form);
  switch(form.dataset.form) {
    case 'login': go('dashboard'); break;
    case 'order': {
      const name=data.get('name').trim(),weight=Number(data.get('weight')),price=Number(data.get('price'));
      if(!name||!Number.isFinite(weight)||weight<=0||!Number.isFinite(price)||price<=0) {notify('Enter a name, valid weight and price.');return;}
      const id=String(Math.max(1000,...state.orders.map(o=>Number(o.id)||0))+1);
      state.orders.push({id,name,phone:data.get('phone'),weight,price,service:data.get('service'),paid:data.get('paid')==='on',status:'Pending',notes:[],created:new Date().toISOString().slice(0,10)});
      state.modal=false;save();render();notify(`Order #${id} added to queue`);break;
    }
    case 'note': {
      const note=data.get('note').trim(); if(!note) return;
      const order=state.orders.find(o=>o.id===state.selected); updateOrder({notes:[...order.notes,note]});notify('Note saved');break;
    }
    case 'track': {
      const id=data.get('id').trim().replace(/^#/,'').replace(/^0+(?=\d)/,'');
      if(!state.orders.some(o=>o.id===id)){notify('Order not found. Try demo order #123, #88 or #72.');return;}
      state.portalIds=[id];state.expanded=id;go('portal');break;
    }
    case 'review': {
      const comment=data.get('comment').trim(); if(!comment) return;
      state.reviews.unshift({name:data.get('name').trim()||'Anonymous',comment,rating:state.rating,service:'Wash & Fold',shop:'FreshPress Studio',date:new Date().toISOString().slice(0,10)});
      state.rating=5;save();render();notify('Thank you! Your review has been submitted.');break;
    }
  }
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&(state.menu||state.modal)){state.menu=false;state.modal=false;render();}});
render();
