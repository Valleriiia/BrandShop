const footer = document.querySelectorAll('.footer_component')
const footerComponent = `
<footer>
    <div class="top">
        <div class="container">
            <ul class="grid3">
                
                <li class="col1">
                    <img src="/assets/img/iate-logo.svg" alt="logo"/>
                    
                </li>
                <li class="col2">
                                <a href="/" class="header__link">Головна</a>

                                <a href="/catalog/ipze" class="header__link">ІПЗЕ</a>

                                <a href="/catalog/" class="header__link">ЦТЕ</a>

                                <a href="/catalog/" class="header__link">ТАЕ</a>

                                <a href="/catalog/" class="header__link">АЕП</a>

                                <a href="/catalog/" class="header__link">АЕ</a>

                                <a href="/catalog/" class="header__link">СР</a>

                </li>
                <li class="col3">
                    <div class="row">
                        <a href="https://kpi.ua/"><h5>
                            Національний технічний університет України “Київський політехнічний інститут імені Ігоря Сікорського”                        </h5></a>
                        <a href="https://kpi.ua/" class="col-3 col-md-pull-3"><img class="kpi-log" src="https://ipze.kpi.ua/wp-content/themes/ipze_new-master/assets/img/kpi_logo.svg" alt="КПІ"></a>
                    </div>
                    <div class="row">
                        <a href="https://tef.kpi.ua/"><h5>
                            Навчально-науковий Інститут атомної та теплової енергетики    
                        </h5></a>
                        <a href="https://tef.kpi.ua/"><img src="/assets/img/iate_logo.png" alt="ІАТЕ"></a>
                    </div>
                </li>
            </ul>
        </div>
    </div>
    <div class="footer_bot">
        <div class="container">
            <p>&copy; 2025 IATE Brand Shop</p>
        </div>
    </div>
</footer>

`
footer.forEach( (el) => {
  return el.innerHTML = footerComponent
}
)

