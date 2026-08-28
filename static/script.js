const products = [
  {id:1, name:'Basic Cotton Crew-Neck T-Shirt', category:'Topwear', price:550, image:'/static/product 1.jpg'},
  {id:2, name:'Printed Casual Shirt', category:'Topwear', price:899, image:'/static/product 2.jpg'},
  {id:3, name:'Slim-Fit Denim Jeans', category:'Bottomwear', price:1499, image:'/static/product 3.jpg'},
  {id:4, name:'Cotton Pyjama Set', category:'Loungewear', price:799, image:'/static/product 4.jpg'},
  {id:5, name:'Formal Trousers', category:'Bottomwear', price:1799, image:'/static/product 5.jpg'},
  {id:6, name:'Wool-Blend Sweater', category:'Winterwear', price:2499, image:'/static/product 6.jpg'},
  {id:7, name:'Zippered Hoodie', category:'Casualwear', price:1999, image:'/static/product 7.jpg'},
  {id:8, name:'Ethnic Kurta with Embroidery', category:'Ethnicwear', price:2999, image:'/static/product 8.jpg'},
  {id:9, name:'Leather Jacket', category:'Outerwear', price:4499, image:'/static/product 9.jpg'},
  {id:10, name:'Blazer (Slim Fit)', category:'Formalwear', price:4999, image:'/static/product 10.jpg'}
];
let cart=JSON.parse(localStorage.getItem('aftr-cart')||'[]'); const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n); const grid=document.getElementById('grid'),filters=document.getElementById('filters'); const cats=['All',...new Set(products.map(p=>p.category))];
function renderFilters(){filters.innerHTML=cats.map((c,i)=>`<button class="${i?'':'active'}" data-filter="${c}">${c.toUpperCase()}</button>`).join('');filters.querySelectorAll('button').forEach(b=>b.onclick=()=>{filters.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');renderProducts(b.dataset.filter)})} function renderProducts(f='All'){grid.innerHTML='';products.filter(p=>f==='All'||p.category===f).forEach(p=>{let e=document.createElement('article');e.className='card';e.innerHTML=`<div class="card-top"><span class="number">${String(p.id).padStart(2,'0')}</span><span class="category">${p.category.toUpperCase()}</span></div><h3>${p.name}</h3><div class="card-bottom"><strong>${money(p.price)}</strong><button class="add">ADD TO BAG</button></div>`;e.querySelector('.add').onclick=x=>{x.stopPropagation();add(p.id)};e.onclick=()=>add(p.id);grid.appendChild(e)})}
function save(){localStorage.setItem('aftr-cart',JSON.stringify(cart));renderBag()} function add(id){let x=cart.find(i=>i.id===id);x?x.qty++:cart.push({id,qty:1});save();openBag()} function changeQty(id,d){let x=cart.find(i=>i.id===id);if(!x)return;x.qty+=d;if(x.qty<=0)cart=cart.filter(i=>i.id!==id);save()} function total(){return cart.reduce((s,i)=>s+products.find(p=>p.id===i.id).price*i.qty,0)}
function renderBag(){items.innerHTML=cart.length?cart.map(i=>{let p=products.find(x=>x.id===i.id);return `<div class="item"><div><h4>${p.name}</h4><p>${p.category} · ${money(p.price)}</p><div class="qty"><button onclick="changeQty(${p.id},-1)">−</button><span>${i.qty}</span><button onclick="changeQty(${p.id},1)">+</button></div></div><button class="remove" onclick="changeQty(${p.id},-${i.qty})">REMOVE</button></div>`}).join(''):'<div class="empty">YOUR BAG IS EMPTY.</div>';subtotal.textContent=money(total());checkoutTotal.textContent=money(total());count.textContent=cart.reduce((s,i)=>s+i.qty,0)}
function openBag(){drawer.classList.add('open');shade.classList.add('open')} function closeDrawer(){drawer.classList.remove('open');shade.classList.remove('open')} bagBtn.onclick=openBag;closeBag.onclick=closeDrawer;shade.onclick=closeDrawer;checkoutBtn.onclick=()=>{if(!cart.length)return alert('YOUR BAG IS EMPTY.');checkoutModal.classList.add('open');closeDrawer()};closeCheckout.onclick=()=>checkoutModal.classList.remove('open');
const customer=()=>({first_name:firstName.value.trim(),last_name:lastName.value.trim(),email:email.value.trim(),phone:phone.value.trim(),address:address.value.trim(),city:city.value.trim(),pin:pin.value.trim()}); const payload=()=>cart.map(i=>({id:i.id,qty:i.qty})); function err(m){checkoutError.textContent=m;checkoutError.classList.remove('hidden')} function ok(m){checkoutFormWrap.classList.add('hidden');success.classList.remove('hidden');successText.textContent=m;cart=[];save()}
checkoutForm.onsubmit=async e=>{e.preventDefault();checkoutError.classList.add('hidden');if(!cart.length)return err('Your bag is empty.');const c=customer();if(paymentMethod.value==='cod'){try{let r=await fetch('/api/cod-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cart:payload(),customer:c})}),d=await r.json();if(!r.ok)throw Error(d.error);ok(`COD order ${d.order_number} has been received.`)}catch(x){err(x.message)}return}payBtn.disabled=true;try{let r=await fetch('/api/create-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cart:payload(),customer:c})}),d=await r.json();if(!r.ok)throw Error(d.error);new Razorpay({key:d.key_id,amount:d.amount,currency:d.currency,name:'AFTR',description:'AFTR clothing order',order_id:d.razorpay_order_id,prefill:{name:`${c.first_name} ${c.last_name}`,email:c.email,contact:c.phone},notes:{aftr_order:d.order_number},handler:async resp=>{try{let vr=await fetch('/api/verify-payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...resp,order_number:d.order_number,customer:c,cart:payload()})}),vd=await vr.json();if(!vr.ok)throw Error(vd.error);ok(`Payment verified. Order ${d.order_number} is confirmed.`)}catch(x){err(x.message)}},modal:{ondismiss:()=>{payBtn.disabled=false}}}).open()}catch(x){err(x.message)}finally{payBtn.disabled=false}};done.onclick=()=>{checkoutModal.classList.remove('open');checkoutForm.reset();checkoutFormWrap.classList.remove('hidden');success.classList.add('hidden')};renderFilters();function renderProducts(f='All'){
  grid.innerHTML='';

  products
    .filter(p => f==='All' || p.category===f)
    .forEach(p => {

      let e=document.createElement('article');
      e.className='card';

      e.innerHTML=`
        <div class="product-image-wrap">
          <img src="${p.image}" alt="${p.name}" class="product-image">
        </div>

        <div class="card-top">
          <span class="number">${String(p.id).padStart(2,'0')}</span>
          <span class="category">${p.category.toUpperCase()}</span>
        </div>

        <h3>${p.name}</h3>

        <div class="card-bottom">
          <strong>${money(p.price)}</strong>
          <button class="add">ADD TO BAG</button>
        </div>
      `;

      e.querySelector('.add').onclick=x=>{
        x.stopPropagation();
        add(p.id);
      };

      e.onclick=()=>add(p.id);

      grid.appendChild(e);
    });
};renderBag();
