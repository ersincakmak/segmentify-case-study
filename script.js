const sliderButtons = `
<div class="seg-rec-product-previous">
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
</div>
<div class="seg-rec-product-next">
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
  </svg>
</div>
`;

const template = `
<div class="seg-rec-container">
  <div class="seg-rec-title">Sizin için Seçtiklerimiz</div>
  <div class="seg-rec-body">
    <div class="seg-rec-categories"></div>
    <div class="seg-rec-products-container">
      ${sliderButtons}
      <div class="seg-rec-products"></div>
    </div>
  </div>
  <div class="seg-rec-popup-container"></div>
</div>
`;

document.body.innerHTML = template;

const renderPopup = (product) => {
  const popup = document.createElement('div');
  popup.classList.add('seg-rec-product-popup');
  popup.innerHTML = `
  <div class="seg-rec-popup-check">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
    </svg>
  </div>
  <div class="seg-rec-popup-body">
    <p>Ürün sepete eklendi.</p>
    <button class="seg-rec-popup-basket-button">Sepete Git</button>
  </div>
  <button class="seg-rec-popup-close">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
  `;
  document.querySelector('.seg-rec-popup-container').appendChild(popup);

  popup.querySelector('.seg-rec-popup-close').addEventListener('click', () => {
    popup.remove();
  });

  popup
    .querySelector('.seg-rec-popup-basket-button')
    .addEventListener('click', () => {
      console.log('we can do whatever we want with product data', product);
    });
};

const renderCategories = (categories) => {
  const categoriesContainer = document.querySelector('.seg-rec-categories');
  categoriesContainer.innerHTML = '';
  categories.forEach((category) => {
    const categoryElement = document.createElement('div');
    categoryElement.classList.add('seg-rec-category');
    categoryElement.setAttribute('data-category-title', category);
    categoryElement.setAttribute('title', category);
    categoryElement.innerHTML = `
        <span class="seg-rec-category-title">${category}</span>
    `;
    categoriesContainer.appendChild(categoryElement);
  });
};

const updateCategoriesActiveClass = (elements, activeCategory, callback) => {
  elements.forEach((element) => {
    if (element.getAttribute('data-category-title') === activeCategory) {
      element.classList.add('active');
    } else {
      element.classList.remove('active');
    }
  });
  callback(activeCategory);
};

const renderProducts = (products) => {
  const productsContainer = document.querySelector('.seg-rec-products');
  productsContainer.innerHTML = '';
  productsContainer.scrollLeft = 0;
  products.forEach((product) => {
    const productElement = document.createElement('div');
    productElement.classList.add('seg-rec-product');
    productElement.innerHTML = `
    <div class="seg-rec-product-image">
      <img data-src="${product.image}" alt="${product.name}">
    </div>
    <div class="seg-rec-product-name-container">
      <a href="${product.url}" target="_blank" class="seg-rec-product-name">${
      product.name
    }</a>
    </div>
    <div class="seg-rec-product-price">${Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(product.price)} TL</div>
    ${
      product.params.shippingFee &&
      `
      <div class="seg-rec-product-shipping">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
        </svg>
        Ücretsiz Kargo
      </div>
    `
    }
    <button class="seg-rec-product-button">Sepete Ekle</button>
    `;
    productsContainer.appendChild(productElement);
  });

  // lazy-load >>

  const callback = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !!entry.target.getAttribute('data-src')) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        img.src = src;
        img.removeAttribute('data-src');
      }
    });
  };

  const observer = new IntersectionObserver(callback);
  const images = document.querySelectorAll('img[data-src]');
  images.forEach((image) => {
    observer.observe(image);
  });

  // << lazy-load

  const productButtons = document.querySelectorAll('.seg-rec-product-button');
  productButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      const product = products[index];
      renderPopup(product);
    });
  });
};

(async () => {
  const data = await fetch('./product-list.json').then((res) => res.json());
  const categories = data.responses[0][0].params.userCategories;
  const allProducts = data.responses[0][0].params.recommendedProducts;
  let activeCategory = categories[0];

  renderCategories(categories);

  const categoryElements = document.querySelectorAll('.seg-rec-category');

  // for first render
  updateCategoriesActiveClass(
    categoryElements,
    activeCategory,
    (activeCategory) => renderProducts(allProducts[activeCategory])
  );

  categoryElements.forEach((categoryElement) => {
    const changeActiveCategoryHandler = () => {
      // if click to active category, do nothing
      if (
        categoryElement.getAttribute('data-category-title') === activeCategory
      )
        return;
      activeCategory = categoryElement.innerText;
      updateCategoriesActiveClass(
        categoryElements,
        activeCategory,
        (activeCategory) => renderProducts(allProducts[activeCategory])
      );
    };
    categoryElement.addEventListener('click', changeActiveCategoryHandler);
  });

  // slide effect with touch >>

  let productIsDown = false;
  let productStartX;
  let productScrollLeft;
  const slider = document.querySelector('.seg-rec-products');

  const checkButtonShouldDisable = (slider) => {
    const sliderWidth = slider.offsetWidth;
    const sliderScrollLeft = slider.scrollLeft;
    const sliderScrollWidth = slider.scrollWidth;
    const sliderScrollLeftMax = sliderScrollWidth - sliderWidth;
    if (sliderScrollLeft === 0) {
      document
        .querySelector('.seg-rec-product-previous')
        .classList.add('passive');
    } else {
      document
        .querySelector('.seg-rec-product-previous')
        .classList.remove('passive');
    }
    if (sliderScrollLeft === sliderScrollLeftMax) {
      document.querySelector('.seg-rec-product-next').classList.add('passive');
    } else {
      document
        .querySelector('.seg-rec-product-next')
        .classList.remove('passive');
    }
  };

  // for first render
  checkButtonShouldDisable(slider);

  const end = () => {
    productIsDown = false;
  };

  const start = (e) => {
    productIsDown = true;
    productStartX = e.pageX || e.touches[0].pageX - slider.offsetLeft;
    productScrollLeft = slider.scrollLeft;
  };

  const move = (e) => {
    if (!productIsDown) return;
    e.preventDefault();
    const x = e.pageX || e.touches[0].pageX - slider.offsetLeft;
    const dist = x - productStartX;
    slider.style.scrollBehavior = 'inherit';
    slider.scrollLeft = productScrollLeft - dist;
    slider.style.scrollBehavior = 'smooth';
  };

  slider.addEventListener('scroll', (event) =>
    checkButtonShouldDisable(event.target)
  );

  slider.addEventListener('mousedown', start);
  slider.addEventListener('touchstart', start);

  slider.addEventListener('mousemove', move);
  slider.addEventListener('touchmove', move);

  slider.addEventListener('mouseleave', end);
  slider.addEventListener('mouseup', end);
  slider.addEventListener('touchend', end);

  // << slide effect with touch

  // category list slide effect with touch >>

  let categoryIsDown = false;
  let categoryStartX;
  let categoryScrollLeft;
  const categorySlider = document.querySelector('.seg-rec-categories');

  const categoryEnd = () => {
    categoryIsDown = false;
  };

  const categoryStart = (e) => {
    categoryIsDown = true;
    categoryStartX = e.pageX || e.touches[0].pageX - categorySlider.offsetLeft;
    categoryScrollLeft = categorySlider.scrollLeft;
  };

  const categoryMove = (e) => {
    if (!categoryIsDown) return;
    e.preventDefault();
    const x = e.pageX || e.touches[0].pageX - categorySlider.offsetLeft;
    const dist = x - categoryStartX;
    categorySlider.scrollLeft = categoryScrollLeft - dist;
  };

  const handleAddOrRemoveEvents = (slider, isMobile) => {
    if (isMobile) {
      slider.addEventListener('mousedown', categoryStart);
      slider.addEventListener('touchstart', categoryStart);

      slider.addEventListener('mousemove', categoryMove);
      slider.addEventListener('touchmove', categoryMove);

      slider.addEventListener('mouseleave', categoryEnd);
      slider.addEventListener('mouseup', categoryEnd);
      slider.addEventListener('touchend', categoryEnd);
    } else {
      slider.removeEventListener('mousedown', categoryStart);
      slider.removeEventListener('touchstart', categoryStart);

      slider.removeEventListener('mousemove', categoryMove);
      slider.removeEventListener('touchmove', categoryMove);

      slider.removeEventListener('mouseleave', categoryEnd);
      slider.removeEventListener('mouseup', categoryEnd);
      slider.removeEventListener('touchend', categoryEnd);
    }
  };

  let isMobile = document.documentElement.clientWidth <= 768;
  handleAddOrRemoveEvents(categorySlider, isMobile);

  window.addEventListener('resize', () => {
    isMobile = document.documentElement.clientWidth <= 768;
    handleAddOrRemoveEvents(categorySlider, isMobile);
  });

  // << category list slide effect with touch

  // -------------------

  // slider effect with buttons >>

  const nextButton = document.querySelector('.seg-rec-product-next');
  const prevButton = document.querySelector('.seg-rec-product-previous');

  const next = () => {
    slider.scrollLeft += slider.offsetWidth;
  };

  const prev = () => {
    slider.scrollLeft -= slider.offsetWidth;
  };

  nextButton.addEventListener('click', next);
  prevButton.addEventListener('click', prev);

  // << slider effect with buttons
})();
