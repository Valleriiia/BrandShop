import { login, register, getAccountData, logout } from './api/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector(".sign-up");
    const loginForm = document.querySelector(".log-in");

    const firstNameInput = document.getElementById("name");
    const lastNameInput = document.getElementById("surname");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const birthdayInput = document.getElementById("birthday");
    const passwordInput = document.getElementById("password");
    const repeatPasswordInput = document.getElementById("repeat-password");

    const logoutTab = document.getElementById("logout-tab");
    const confirmLogoutBtn = document.getElementById("confirm-logout-btn");
    const cancelLogoutBtn = document.getElementById("cancel-logout-btn");

    const isAccountPage = window.location.pathname.includes('/account.html');
    const isAuthPage = window.location.pathname.includes('/sign-in.html') || window.location.pathname.includes('/sign-up.html');

    async function checkAuthAndRedirect() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const responseData = await getAccountData();
                if (responseData && responseData.user) {
                    window.location.href = "/page/account.html";
                    return true;
                }
            } catch (error) {
                localStorage.removeItem('token');
            }
        }
        return false;
    }

    if (isAuthPage) {
        checkAuthAndRedirect();
    }

    if (registerForm) {
        const registerButton = registerForm.querySelector('button[type="submit"]');
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (registerButton) {
                registerButton.disabled = true;
                registerButton.textContent = 'Реєстрація...';
            }

            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());

            if (!data.first_name || !data.last_name || !data.email || !data.password || !data.repeatPassword) {
                alert("Будь ласка, заповніть усі обов’язкові поля.");
                if (registerButton) {
                    registerButton.disabled = false;
                    registerButton.textContent = 'Зареєструватися';
                }
                return;
            }

            if (data.password !== data.repeatPassword) {
                alert("Паролі не збігаються!");
                if (registerButton) {
                    registerButton.disabled = false;
                    registerButton.textContent = 'Зареєструватися';
                }
                return;
            }

            try {
                const result = await register(
                    data.first_name,
                    data.last_name,
                    data.email,
                    data.password,
                    data.phone || null,
                    data.birthday || null
                );

                if (result && result.message && result.token) {
                    alert(result.message);
                    localStorage.setItem('token', result.token);
                    window.location.href = "/page/account.html";
                } else if (result && result.message) {
                    alert(result.message);
                } else {
                    alert("Сталася невідома помилка при реєстрації.");
                }

            } catch (error) {
                alert("Помилка з’єднання з сервером або помилка реєстрації: " + error.message);
            } finally {
                if (registerButton) {
                    registerButton.disabled = false;
                    registerButton.textContent = 'Зареєструватися';
                }
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const clientEmailInput = document.getElementById("client-email");
            const clientPasswordInput = document.getElementById("client-password");

            const data = {
                email: clientEmailInput ? clientEmailInput.value.trim() : '',
                password: clientPasswordInput ? clientPasswordInput.value.trim() : '',
            };

            if (!data.email || !data.password) {
                alert("Будь ласка, введіть email та пароль.");
                return;
            }

            try {
                const result = await login(data.email, data.password);

                if (result && result.token) {
                    localStorage.setItem('token', result.token);
                    window.location.href = "/page/account.html";
                } else if (result && result.message) {
                    alert(result.message || "Помилка входу.");
                } else {
                    alert("Невідома помилка при вході. Спробуйте ще раз.");
                }
            } catch (error) {
                alert("Невірний логін або пароль");
            }
        });
    }

    function displayAccountInfo(user) {
        if (user) {
            if (firstNameInput) firstNameInput.value = user.first_name || '';
            if (lastNameInput) lastNameInput.value = user.last_name || '';
            if (emailInput) emailInput.value = user.email || '';
            if (phoneInput) phoneInput.value = user.phone || '';
            if (birthdayInput) {
                birthdayInput.value = user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '';
            }
        }
    }

    async function initAccountPage() {
        if (!isAccountPage) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert("Ви не авторизовані. Будь ласка, увійдіть.");
            window.location.href = "/page/sign-in.html";
            return;
        }

        try {
            const responseData = await getAccountData();
            if (responseData && responseData.user) {
                displayAccountInfo(responseData.user);
            } else {
                alert("Не вдалося завантажити дані акаунта. Ваша сесія могла застаріти.");
                window.location.href = "/page/sign-in.html";
            }
        } catch (error) {
            alert("Помилка отримання даних акаунта: " + error.message);
            if (error.message.includes('авторизація') || error.message.includes('Недійсний токен') || error.message.includes('Потрібен токен') || error.message.includes('застарів')) {
                window.location.href = "/page/sign-in.html";
            }
        }
    }

    if (logoutTab) {
        logoutTab.addEventListener("click", () => {
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            const exitContent = document.getElementById('content4');
            if (exitContent) {
                exitContent.classList.toggle('active');
            }
        });
    }

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener("click", () => {
            logout();
        });
    }

    if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener("click", () => {
            const infoContent = document.getElementById('content1');
            if (infoContent) {
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.classList.remove('active');
                });
                infoContent.classList.toggle('active');
                const tab1Radio = document.getElementById('tab1');
                if (tab1Radio) {
                    tab1Radio.checked = true;
                }
            }
        });
    }

    document.querySelectorAll('.tabs input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            const contentId = 'content' + this.id.slice(3);
            const targetContent = document.getElementById(contentId);
            if (targetContent) {
                targetContent.classList.toggle('active');
            }
        });
    });

    const burgerIcon = document.querySelector('.burger__icon');
    const burgerMenu = document.querySelector('.burger__menu');

    if (burgerIcon && burgerMenu) {
        burgerIcon.addEventListener('click', () => {
            burgerIcon.classList.toggle('active');
            burgerMenu.classList.toggle('active');
            document.body.style.overflow = burgerMenu.classList.contains('active') ? 'hidden' : '';
        });

        document.addEventListener('click', (event) => {
            if (!burgerMenu.contains(event.target) && !burgerIcon.contains(event.target)) {
                burgerIcon.classList.remove('active');
                burgerMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    initAccountPage();
});