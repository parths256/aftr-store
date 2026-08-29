const products = [
  {
    id: 1,
    name: 'Black Essential T-Shirt',
    category: 'Topwear',
    price: 550,
    image: '/static/product 1.jpg',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 2,
    name: 'Embroidered Overshirt',
    category: 'Topwear',
    price: 899,
    image: '/static/product 2.jpg',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 3,
    name: 'Straight-Fit Denim Jeans',
    category: 'Bottomwear',
    price: 1499,
    image: '/static/product 3.jpg',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 4,
    name: 'Blue Co-ord Set',
    category: 'Co-ords',
    price: 799,
    image: '/static/product 4.jpg',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 5,
    name: 'Charcoal Tailored Trousers',
    category: 'Bottomwear',
    price: 1799,
    image: '/static/product 5.jpg',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 6,
    name: 'Brown Knit Sweater',
    category: 'Winterwear',
    price: 2499,
    image: '/static/product 6.jpg',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 7,
    name: 'Beige Zip Hoodie',
    category: 'Casualwear',
    price: 1999,
    image: '/static/product 7.jpg',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 8,
    name: 'Embroidered Kurta',
    category: 'Ethnicwear',
    price: 2999,
    image: '/static/product 8.jpg',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 9,
    name: 'Brown Leather Jacket',
    category: 'Outerwear',
    price: 4499,
    image: '/static/product 9.jpg',
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: 10,
    name: 'Beige Slim-Fit Blazer',
    category: 'Formalwear',
    price: 4999,
    image: '/static/product 10.jpg',
    sizes: ['S', 'M', 'L', 'XL']
  }
];


let cart = JSON.parse(localStorage.getItem('aftr-cart') || '[]');

const money = n =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(n);

const grid = document.getElementById('grid');
const filters = document.getElementById('filters');

const cats = ['All', ...new Set(products.map(p => p.category))];


/* --------------------------------
   PRODUCT MODAL
-------------------------------- */

const productModal = document.createElement('div');

productModal.className = 'product-modal';

productModal.innerHTML = `
  <div class="product-modal-box">

    <button class="product-modal-close" type="button">×</button>

    <div class="product-modal-image">
      <img id="modalProductImage" src="" alt="">
    </div>

    <div class="product-modal-info">

      <p id="modalProductCategory" class="modal-category"></p>

      <h2 id="modalProductName"></h2>

      <strong id="modalProductPrice" class="modal-price"></strong>

      <div class="size-section">

        <p>SELECT SIZE</p>

        <div id="sizeButtons" class="size-buttons"></div>

      </div>

      <p id="sizeError" class="size-error"></p>

      <button id="modalAddBag" class="modal-add" type="button">
        ADD TO BAG
      </button>

    </div>

  </div>
`;

document.body.appendChild(productModal);

const modalProductImage =
  document.getElementById('modalProductImage');

const modalProductName =
  document.getElementById('modalProductName');

const modalProductCategory =
  document.getElementById('modalProductCategory');

const modalProductPrice =
  document.getElementById('modalProductPrice');

const sizeButtons =
  document.getElementById('sizeButtons');

const sizeError =
  document.getElementById('sizeError');

const modalAddBag =
  document.getElementById('modalAddBag');

const modalClose =
  document.querySelector('.product-modal-close');


let activeProduct = null;
let selectedSize = null;


function openProduct(id) {

  activeProduct = products.find(p => p.id === id);

  selectedSize = null;

  modalProductImage.src = activeProduct.image;
  modalProductImage.alt = activeProduct.name;

  modalProductName.textContent = activeProduct.name;

  modalProductCategory.textContent =
    activeProduct.category.toUpperCase();

  modalProductPrice.textContent =
    money(activeProduct.price);

  sizeError.textContent = '';

  sizeButtons.innerHTML =
    activeProduct.sizes
      .map(size => `
        <button
          class="size-btn"
          data-size="${size}"
          type="button">
          ${size}
        </button>
      `)
      .join('');


  sizeButtons
    .querySelectorAll('.size-btn')
    .forEach(button => {

      button.onclick = () => {

        sizeButtons
          .querySelectorAll('.size-btn')
          .forEach(b =>
            b.classList.remove('selected')
          );

        button.classList.add('selected');

        selectedSize = button.dataset.size;

        sizeError.textContent = '';
      };

    });


  productModal.classList.add('open');

  document.body.classList.add('modal-open');
}


function closeProduct() {

  productModal.classList.remove('open');

  document.body.classList.remove('modal-open');

}


modalClose.onclick = closeProduct;


productModal.onclick = e => {

  if (e.target === productModal) {
    closeProduct();
  }

};


modalAddBag.onclick = () => {

  if (!selectedSize) {

    sizeError.textContent =
      'PLEASE SELECT A SIZE.';

    return;
  }

  add(activeProduct.id, selectedSize);

  closeProduct();

};


/* --------------------------------
   FILTERS
-------------------------------- */

function renderFilters() {

  filters.innerHTML =
    cats
      .map((c, i) => `
        <button
          class="${i ? '' : 'active'}"
          data-filter="${c}">
          ${c.toUpperCase()}
        </button>
      `)
      .join('');


  filters
    .querySelectorAll('button')
    .forEach(button => {

      button.onclick = () => {

        filters
          .querySelectorAll('button')
          .forEach(x =>
            x.classList.remove('active')
          );

        button.classList.add('active');

        renderProducts(button.dataset.filter);
      };

    });

}


/* --------------------------------
   PRODUCTS
-------------------------------- */

function renderProducts(filter = 'All') {

  grid.innerHTML = '';

  products
    .filter(
      p =>
        filter === 'All' ||
        p.category === filter
    )
    .forEach(p => {

      const card =
        document.createElement('article');

      card.className = 'card';

      card.innerHTML = `

        <div class="product-image-wrap">

          <img
            src="${p.image}"
            alt="${p.name}"
            class="product-image">

        </div>

        <div class="card-top">

          <span class="number">
            ${String(p.id).padStart(2, '0')}
          </span>

          <span class="category">
            ${p.category.toUpperCase()}
          </span>

        </div>

        <h3>${p.name}</h3>

        <div class="card-bottom">

          <strong>
            ${money(p.price)}
          </strong>

          <button
            class="add"
            type="button">
            VIEW
          </button>

        </div>
      `;


      card.onclick = () =>
        openProduct(p.id);


      card
        .querySelector('.add')
        .onclick = e => {

          e.stopPropagation();

          openProduct(p.id);

        };


      grid.appendChild(card);

    });

}


/* --------------------------------
   CART
-------------------------------- */

function save() {

  localStorage.setItem(
    'aftr-cart',
    JSON.stringify(cart)
  );

  renderBag();

}


function add(id, size) {

  const existing = cart.find(
    item =>
      item.id === id &&
      item.size === size
  );


  if (existing) {

    existing.qty++;

  } else {

    cart.push({
      id,
      size,
      qty: 1
    });

  }


  save();

  openBag();

}


function changeQty(id, size, change) {

  const item = cart.find(
    i =>
      i.id === id &&
      i.size === size
  );


  if (!item) return;


  item.qty += change;


  if (item.qty <= 0) {

    cart = cart.filter(
      i =>
        !(
          i.id === id &&
          i.size === size
        )
    );

  }


  save();

}


function total() {

  return cart.reduce(
    (sum, item) => {

      const product =
        products.find(
          p => p.id === item.id
        );

      return (
        sum +
        product.price *
        item.qty
      );

    },
    0
  );

}


/* --------------------------------
   BAG
-------------------------------- */

function renderBag() {

  items.innerHTML =
    cart.length
      ? cart
          .map(item => {

            const product =
              products.find(
                p => p.id === item.id
              );

            return `

              <div class="item">

                <div>

                  <h4>
                    ${product.name}
                  </h4>

                  <p>
                    SIZE ${item.size}
                    ·
                    ${money(product.price)}
                  </p>

                  <div class="qty">

                    <button
                      onclick="changeQty(${product.id}, '${item.size}', -1)">
                      −
                    </button>

                    <span>
                      ${item.qty}
                    </span>

                    <button
                      onclick="changeQty(${product.id}, '${item.size}', 1)">
                      +
                    </button>

                  </div>

                </div>

                <button
                  class="remove"
                  onclick="changeQty(${product.id}, '${item.size}', -${item.qty})">
                  REMOVE
                </button>

              </div>
            `;

          })
          .join('')

      : '<div class="empty">YOUR BAG IS EMPTY.</div>';


  subtotal.textContent =
    money(total());

  checkoutTotal.textContent =
    money(total());

  count.textContent =
    cart.reduce(
      (sum, item) =>
        sum + item.qty,
      0
    );

}


/* --------------------------------
   BAG DRAWER
-------------------------------- */

function openBag() {

  drawer.classList.add('open');

  shade.classList.add('open');

}


function closeDrawer() {

  drawer.classList.remove('open');

  shade.classList.remove('open');

}


bagBtn.onclick =
  openBag;

closeBag.onclick =
  closeDrawer;

shade.onclick =
  closeDrawer;


checkoutBtn.onclick = () => {

  if (!cart.length) {

    return alert(
      'YOUR BAG IS EMPTY.'
    );

  }

  checkoutModal.classList.add('open');

  closeDrawer();

};


closeCheckout.onclick = () =>
  checkoutModal.classList.remove('open');


/* --------------------------------
   CUSTOMER DETAILS
-------------------------------- */

const customer = () => ({

  first_name:
    firstName.value.trim(),

  last_name:
    lastName.value.trim(),

  email:
    email.value.trim(),

  phone:
    phone.value.trim(),

  address:
    address.value.trim(),

  city:
    city.value.trim(),

  pin:
    pin.value.trim()

});


const payload = () =>
  cart.map(item => ({

    id: item.id,

    qty: item.qty,

    size: item.size

  }));


function err(message) {

  checkoutError.textContent =
    message;

  checkoutError
    .classList
    .remove('hidden');

}


function ok(message) {

  checkoutFormWrap
    .classList
    .add('hidden');

  success
    .classList
    .remove('hidden');

  successText.textContent =
    message;

  cart = [];

  save();

}


/* --------------------------------
   CHECKOUT
-------------------------------- */

checkoutForm.onsubmit =
async e => {

  e.preventDefault();

  checkoutError
    .classList
    .add('hidden');


  if (!cart.length) {

    return err(
      'Your bag is empty.'
    );

  }


  const c = customer();


  /* CASH ON DELIVERY */

  if (
    paymentMethod.value === 'cod'
  ) {

    try {

      const response =
        await fetch(
          '/api/cod-order',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({

              cart: payload(),

              customer: c

            })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw Error(
          data.error
        );

      }


      ok(
        `COD order ${data.order_number} has been received.`
      );


    } catch (error) {

      err(error.message);

    }


    return;

  }


  /* RAZORPAY */

  payBtn.disabled = true;


  try {

    const response =
      await fetch(
        '/api/create-order',
        {

          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({

            cart: payload(),

            customer: c

          })

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw Error(
        data.error
      );

    }


    new Razorpay({

      key:
        data.key_id,

      amount:
        data.amount,

      currency:
        data.currency,

      name:
        'AFTR',

      description:
        'AFTR clothing order',

      order_id:
        data.razorpay_order_id,

      prefill: {

        name:
          `${c.first_name} ${c.last_name}`,

        email:
          c.email,

        contact:
          c.phone

      },

      notes: {

        aftr_order:
          data.order_number

      },


      handler:
      async response => {

        try {

          const verify =
            await fetch(
              '/api/verify-payment',
              {

                method:
                  'POST',

                headers: {
                  'Content-Type':
                    'application/json'
                },

                body:
                  JSON.stringify({

                    ...response,

                    order_number:
                      data.order_number,

                    customer:
                      c,

                    cart:
                      payload()

                  })

              }
            );


          const result =
            await verify.json();


          if (!verify.ok) {

            throw Error(
              result.error
            );

          }


          ok(
            `Payment verified. Order ${data.order_number} is confirmed.`
          );


        } catch (error) {

          err(error.message);

        }

      },


      modal: {

        ondismiss: () => {

          payBtn.disabled =
            false;

        }

      }

    }).open();


  } catch (error) {

    err(error.message);

  } finally {

    payBtn.disabled =
      false;

  }

};


/* --------------------------------
   ORDER COMPLETE
-------------------------------- */

done.onclick = () => {

  checkoutModal
    .classList
    .remove('open');

  checkoutForm.reset();

  checkoutFormWrap
    .classList
    .remove('hidden');

  success
    .classList
    .add('hidden');

};


/* --------------------------------
   START
-------------------------------- */

renderFilters();

renderProducts();

renderBag();
/* =========================================
   AFTR — HEADER + SCROLL EFFECTS
========================================= */

const siteHeader = document.querySelector("header");

window.addEventListener("scroll", function(){

  if(window.scrollY > 70){
    siteHeader?.classList.add("header-scrolled");
  } else {
    siteHeader?.classList.remove("header-scrolled");
  }

});


/* =========================================
   AFTR — SCROLL REVEAL
========================================= */

const revealElements = document.querySelectorAll(
  ".campaign-card, .section-head, .card, .about, .contact"
);

revealElements.forEach(function(el){
  el.classList.add("reveal");
});

const revealObserver = new IntersectionObserver(
  function(entries){

    entries.forEach(function(entry){

      if(entry.isIntersecting){
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }

    });

  },
  {
    threshold:0.08
  }
);

revealElements.forEach(function(el){
  revealObserver.observe(el);
});
