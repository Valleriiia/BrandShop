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
                            <img src="/assets/img/logo_big.svg" alt="logo">
                            <ul class="header__list">
                                <li class="header__item">
                                    <a href="/" class="header__link">Головна</a>
                                </li>
                                <li class="header__item">
                                    <a href="/page/catalog.html" class="header__link">Товари</a>
                                </li>
                                <li class="header__item">
                                    <a href="/page/about.html" class="header__link">Про нас</a>
                                </li>
                                <li class="header__item">
                                    <a href="/page/blog.html" class="header__link">Новини</a>
                                </li>
                                <li class="header__item">
                                    <a href="/page/sign-in.html" class="header__link">Мій акаунт</a>
                                </li>
                                <li class="header__item">
                                    <a href="/page/blog.html" class="header__link">Улюблені</a>
                                </li>
                                <li class="header__item">
                                    <a href="/page/corporate.html" class="header__link">Корпоративні замовлення</a>
                                </li>
                                <li class="header__item">
                                    <a href="/page/franchise.html" class="header__link">Франшиза</a>
                                </li>
                                <li class="header__item">
                                    <a href="/page/box.html" class="header__link">Конструктор боксів</a>
                                </li>
                            </ul>
                            <div class="footer__l">
                                <button class="active_text">Ukr</button>
                                <button>Eng</button>
    
                            </div>
                        </div>
                    </div>
                </div>
                <div class="h__left">
                    <a href="/">
                        <svg xmlns="http://www.w3.org/2000/svg" width="58" height="39" viewBox="0 0 58 39" fill="none">
                            <path d="M57.4805 1.52302V0H44.6432V1.52302L48.3183 2.57649V36.7662H31.4838V2.57649L35.1589 1.52302V0H22.3216V1.52302L25.9967 2.57649V36.7662H9.15619V2.57649L12.8373 1.52302V0H0V1.52302L3.67512 2.57649V36.2606L0 37.308V38.834H57.4805V37.308L53.8024 36.2606V2.57649L57.4805 1.52302Z" fill="#453526"/>
                          </svg>    
                    </a>
                    <nav class="h__center">
                        <ul class="header__list">
                            <li class="header__item">
                                <a href="/" class="header__link">Головна</a>
                            </li>
                            <li class="header__item">
                                <a href="/page/catalog.html" class="header__link">Товари</a>
                            </li>
                            <li class="header__item">
                                <a href="/page/about.html" class="header__link">Про нас</a>
                            </li>
                            <li class="header__item">
                                <a href="/page/blog.html" class="header__link">Новини</a>
                            </li>
                            <li class="header__item">
                                <a href="/page/corporate.html" class="header__link">Корпоративні замовлення</a>
                            </li>
                            <li class="header__item">
                                <a href="/page/franchise.html" class="header__link">Франшиза</a>
                            </li>
    
                        </ul>
                    </nav>
                </div>
                <div class="h__right">
                    <form action="">
                        <div class="search">
                            <input type="text" placeholder="Пошук">
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="12" viewBox="0 0 11 12" fill="none">
                                <circle cx="5" cy="5" r="4" stroke="#453526" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M7.75 7.97849L10.25 10.4785" stroke="#453526" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>
                        </div>
                    </form>
                    <a href="/page/sign-in.html">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="2.93023" cy="2.93023" r="2.93023" transform="matrix(-1 0 0 1 10.2402 6.88086)"
                                fill="#453526" stroke="#453526" stroke-width="1.5" />
                            <path
                                d="M2.18213 17.0894C2.18213 16.4591 2.57834 15.8969 3.17188 15.6849C5.84788 14.7292 8.77219 14.7292 11.4482 15.6849C12.0417 15.8969 12.4379 16.4591 12.4379 17.0894V18.0531C12.4379 18.923 11.6675 19.5912 10.8064 19.4681L10.5193 19.4271C8.39059 19.123 6.22948 19.123 4.1008 19.4271L3.81369 19.4681C2.95257 19.5912 2.18213 18.923 2.18213 18.0531V17.0894Z"
                                fill="#453526" stroke="#453526" stroke-width="1.5" />
                        </svg>
                    </a>
                    <a href="/page/love.html">
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" viewBox="0 0 26 24" fill="none">
                            <path
                                d="M2.42919 14.7269L6.52424 18.9669C7.70367 20.1881 9.66058 20.1881 10.84 18.9669L14.9351 14.7269C16.5978 13.0053 16.5978 10.214 14.9351 8.49238C13.2723 6.77077 10.5765 6.77077 8.91372 8.49238C8.78714 8.62344 8.57712 8.62344 8.45054 8.49238C6.78779 6.77077 4.09194 6.77077 2.42919 8.49238C0.766441 10.214 0.766442 13.0053 2.42919 14.7269Z"
                                fill="#453526" stroke="#453526" stroke-width="1.5" />
                        </svg>
                    </a>
                    <button class="backet">
                        <svg class="desk" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                            fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M4.16395 9.86405C2.41994 9.86405 0.945317 11.1551 0.714822 12.8838L0.0311007 18.0117C-0.247032 20.0977 1.37577 21.9513 3.48023 21.9513H9.97255C12.077 21.9513 13.6998 20.0977 13.4217 18.0117L12.738 12.8838C12.5075 11.1551 11.0328 9.86405 9.28883 9.86405H4.16395ZM3.04621 9.68023C3.04621 7.6477 4.69391 6 6.72644 6C8.75898 6 10.4067 7.6477 10.4067 9.68023V11.8779C10.4067 12.2921 10.0709 12.6279 9.65668 12.6279C9.24246 12.6279 8.90668 12.2921 8.90668 11.8779V9.68023C8.90668 8.47612 7.93055 7.5 6.72644 7.5C5.52234 7.5 4.54621 8.47612 4.54621 9.68023V11.8779C4.54621 12.2921 4.21042 12.6279 3.79621 12.6279C3.382 12.6279 3.04621 12.2921 3.04621 11.8779V9.68023Z"
                                fill="#453526" />
                        </svg>
                        <svg class="mob" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                            fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M8.71157 6.02144C6.31936 6.02144 4.29666 7.79234 3.9805 10.1636L3.04266 17.1974C2.66115 20.0587 4.88711 22.6011 7.77373 22.6011H16.6791C19.5657 22.6011 21.7916 20.0587 21.4101 17.1974L20.4723 10.1636C20.1561 7.79235 18.1334 6.02144 15.7412 6.02144H8.71157ZM7.45714 5.75C7.45714 3.12195 9.60781 1 12.2265 1C14.8451 1 16.9958 3.12195 16.9958 5.75V8.7838C16.9958 9.19801 16.66 9.5338 16.2458 9.5338C15.8316 9.5338 15.4958 9.19801 15.4958 8.7838V5.75C15.4958 3.95977 14.0261 2.5 12.2265 2.5C10.4268 2.5 8.95714 3.95977 8.95714 5.75V8.7838C8.95714 9.19801 8.62135 9.5338 8.20714 9.5338C7.79293 9.5338 7.45714 9.19801 7.45714 8.7838V5.75Z"
                                fill="#453526" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <div class="backet_main">
            <div class="flex">
                <h3>Кошик</h3>
                <button class="close_backet">+</button>
            </div>
            <ul class="backet_list">
                <li>
                    <div class="top">
                        <div class="image">
                            <img src="/assets/img/candy/img1.png" alt="candy">
                        </div>
                        <p>Шоколадні цукерки "Молочне серце”</p>
                        <h4 class="price">45 ₴</h4>
                        <button class="remove_candy">+</button>
                    </div>
                    <div class="quantity-controls">
                        <button class="minus">-</button>
                        <span class="quantity">1</span>
                        <button class="plus">+</button>
                    </div>
                </li>
                <li>
                    <div class="top">
                        <div class="image">
                            <img src="/assets/img/candy/img1.png" alt="candy">
                        </div>
                        <p>Шоколадні цукерки "Молочне серце”</p>
                        <h4 class="price">45 ₴</h4>
                        <button class="remove_candy">+</button>
                    </div>
                    <div class="quantity-controls">
                        <button class="minus">-</button>
                        <span class="quantity">1</span>
                        <button class="plus">+</button>
                    </div>
                </li>
                <li>
                    <div class="top">
                        <div class="image">
                            <img src="/assets/img/candy/img1.png" alt="candy">
                        </div>
                        <p>Шоколадні цукерки "Молочне серце”</p>
                        <h4 class="price">45 ₴</h4>
                        <button class="remove_candy">+</button>
                    </div>
                    <div class="quantity-controls">
                        <button class="minus">-</button>
                        <span class="quantity">1</span>
                        <button class="plus">+</button>
                    </div>
                </li>
                <li>
                    <div class="top">
                        <div class="image">
                            <img src="/assets/img/candy/img1.png" alt="candy">
                        </div>
                        <p>Шоколадні цукерки "Молочне серце”</p>
                        <h4 class="price">45 ₴</h4>
                        <button class="remove_candy">+</button>
                    </div>
                    <div class="quantity-controls">
                        <button class="minus">-</button>
                        <span class="quantity">1</span>
                        <button class="plus">+</button>
                    </div>
                </li>
                <li>
                    <div class="top">
                        <div class="image">
                            <img src="/assets/img/candy/img1.png" alt="candy">
                        </div>
                        <p>Шоколадні цукерки "Молочне серце”</p>
                        <h4 class="price">45 ₴</h4>
                        <button class="remove_candy">+</button>
                    </div>
                    <div class="quantity-controls">
                        <button class="minus">-</button>
                        <span class="quantity">1</span>
                        <button class="plus">+</button>
                    </div>
                </li>
                <li>
                    <div class="top">
                        <div class="image">
                            <img src="/assets/img/candy/img1.png" alt="candy">
                        </div>
                        <p>Шоколадні цукерки "Молочне серце”</p>
                        <h4 class="price">45 ₴</h4>
                        <button class="remove_candy">+</button>
                    </div>
                    <div class="quantity-controls">
                        <button class="minus">-</button>
                        <span class="quantity">1</span>
                        <button class="plus">+</button>
                    </div>
                </li>
                <li>
                    <div class="top">
                        <div class="image">
                            <img src="/assets/img/candy/img1.png" alt="candy">
                        </div>
                        <p>Шоколадні цукерки "Молочне серце”</p>
                        <h4 class="price">45 ₴</h4>
                        <button class="remove_candy">+</button>
                    </div>
                    <div class="quantity-controls">
                        <button class="minus">-</button>
                        <span class="quantity">1</span>
                        <button class="plus">+</button>
                    </div>
                </li>
        
            </ul>
            <div class="result">
                <h5>До оплати без доставки</h5>
                <h4 class="price result_price">45 ₴</h4>
            </div>
            <a href="/page/cart.html" class="lite_btn">Оформити замовлення</a>
        </div>
    </header>
    `
    header.forEach( (el) => {
      return el.innerHTML = headerComponent
    }
    )

