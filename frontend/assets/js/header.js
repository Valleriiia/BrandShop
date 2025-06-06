    const header = document.querySelectorAll('.header_component')
    const headerComponent = ` <header>
        <div class="container">
            <div class="header__container">
                <div class="burger">
                    <div class="burger__icon">
                        <div class="line1"></div>
                        <div class="line2"></div>
                        <div class="line3"></div>
                    </div>
                    <div class="burger__menu">
                        <div class="container">
                            <img src="/assets/img/iate-logo.svg" alt="logo">
                            <ul class="header__list">
                                <li class="header__item">
                                    <a href="/" class="header__link">Головна</a>
                                </li>
                                <li class="header__item">
                                    <a href="/catalog/ipze" class="header__link">ІПЗЕ</a>
                                </li>
                                <li class="header__item">
                                    <a href="/catalog/dte" class="header__link">ЦТЕ</a>
                                </li>
                                <li class="header__item">
                                    <a href="/catalog/tae" class="header__link">ТАЕ</a>
                                </li>
                                <li class="header__item">
                                    <a href="/catalog/atep" class="header__link">АЕП</a>
                                </li>
                                <li class="header__item">
                                    <a href="/catalog/ae" class="header__link">АЕ</a>
                                </li>
                                <li class="header__item">
                                    <a href="/catalog/sr" class="header__link">СР</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="h__left">
                    <a class="logo" href="/">
                        <img src="/assets/img/iate-logo.svg" alt="logo"/>   
                    </a>
                    <nav class="h__center">
                        <ul class="header__list">
                            <li class="header__item">
                                <a href="/" class="header__link">Головна</a>
                            </li>
                            <li class="header__item">
                                <a href="/catalog/ipze" class="header__link">ІПЗЕ</a>
                            </li>
                            <li class="header__item">
                                <a href="/catalog/dte" class="header__link">ЦТЕ</a>
                            </li>
                            <li class="header__item">
                                <a href="/catalog/tae" class="header__link">ТАЕ</a>
                            </li>
                            <li class="header__item">
                                <a href="/catalog/atep" class="header__link">АЕП</a>
                            </li>
                            <li class="header__item">
                                <a href="/catalog/ae" class="header__link">АЕ</a>
                            </li>
                            <li class="header__item">
                                <a href="/catalog/sr" class="header__link">СР</a>
                            </li>
    
                        </ul>
                    </nav>
                </div>
                <div class="h__right">
                    <form id="search-form">
                        <div class="search">
                            <input id="search-input" type="text" placeholder="Пошук">
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="12" viewBox="0 0 11 12" fill="none">
                                <circle cx="5" cy="5" r="4" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M7.75 7.97849L10.25 10.4785" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>
                        </div>
                    </form>
                    <div class="auth">
                    <a href="/page/sign-in.html">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="24" viewBox="0 0 15 24" fill="none">
                            <circle cx="2.93023" cy="2.93023" r="2.93023" transform="matrix(-1 0 0 1 10.2402 6.88086)"
                                fill="#ffffff" stroke="#ffffff" stroke-width="1.5" />
                            <path
                                d="M2.18213 17.0894C2.18213 16.4591 2.57834 15.8969 3.17188 15.6849C5.84788 14.7292 8.77219 14.7292 11.4482 15.6849C12.0417 15.8969 12.4379 16.4591 12.4379 17.0894V18.0531C12.4379 18.923 11.6675 19.5912 10.8064 19.4681L10.5193 19.4271C8.39059 19.123 6.22948 19.123 4.1008 19.4271L3.81369 19.4681C2.95257 19.5912 2.18213 18.923 2.18213 18.0531V17.0894Z"
                                fill="#ffffff" stroke="#ffffff" stroke-width="1.5" />
                        </svg>
                    </a>
                    <a href="/page/love.html">
                        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="24" viewBox="0 0 19 24" fill="none">
                            <path
                                d="M2.42919 14.7269L6.52424 18.9669C7.70367 20.1881 9.66058 20.1881 10.84 18.9669L14.9351 14.7269C16.5978 13.0053 16.5978 10.214 14.9351 8.49238C13.2723 6.77077 10.5765 6.77077 8.91372 8.49238C8.78714 8.62344 8.57712 8.62344 8.45054 8.49238C6.78779 6.77077 4.09194 6.77077 2.42919 8.49238C0.766441 10.214 0.766442 13.0053 2.42919 14.7269Z"
                                fill="#ffffff" stroke="#ffffff" stroke-width="1.5" />
                        </svg>
                    </a>
                    <button class="backet">
                        <a href="/page/cart.html"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="24" viewBox="0 0 15 24"
                            fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M4.16395 9.86405C2.41994 9.86405 0.945317 11.1551 0.714822 12.8838L0.0311007 18.0117C-0.247032 20.0977 1.37577 21.9513 3.48023 21.9513H9.97255C12.077 21.9513 13.6998 20.0977 13.4217 18.0117L12.738 12.8838C12.5075 11.1551 11.0328 9.86405 9.28883 9.86405H4.16395ZM3.04621 9.68023C3.04621 7.6477 4.69391 6 6.72644 6C8.75898 6 10.4067 7.6477 10.4067 9.68023V11.8779C10.4067 12.2921 10.0709 12.6279 9.65668 12.6279C9.24246 12.6279 8.90668 12.2921 8.90668 11.8779V9.68023C8.90668 8.47612 7.93055 7.5 6.72644 7.5C5.52234 7.5 4.54621 8.47612 4.54621 9.68023V11.8779C4.54621 12.2921 4.21042 12.6279 3.79621 12.6279C3.382 12.6279 3.04621 12.2921 3.04621 11.8779V9.68023Z"
                                fill="#ffffff" />
                        </svg>
                        </a>
                        <span class="cart-count">0</span>
                    </button>
                    </div>
                    <div class="no-auth">
                        <a class="lite_btn" href="/page/sign-in.html">Увійти</a>
                    </div>
                </div>
            </div>
        </div>
    </header>
    `
    header.forEach( (el) => {
      return el.innerHTML = headerComponent
    }
    )

