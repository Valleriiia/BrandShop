document.addEventListener('DOMContentLoaded', () => {
    const changePasswordForm = document.querySelector('.tab-content.info form:last-of-type');

    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const oldPass = document.getElementById('old-pass').value;
            const newPass = document.getElementById('new-pass').value;
            const confirmPass = document.getElementById('confirm-pass').value;

            // Фронтенд-валідація (залишається)
            if (!oldPass || !newPass || !confirmPass) {
                alert('Будь ла ласка, заповніть всі поля пароля.');
                return;
            }
            if (newPass !== confirmPass) {
                alert('Новий пароль та підтвердження не співпадають.');
                return;
            }
            if (newPass.length < 6) {
                alert('Новий пароль має бути щонайменше 6 символів.');
                return;
            }

            const token = localStorage.getItem('token'); 
            if (!token) {
                alert('Ви не авторизовані. Будь ласка, увійдіть.');
                window.location.href = '/login.html'; 
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/user/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        old_pass: oldPass,
                        new_pass: newPass,
                        confirm_pass: confirmPass
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message);
                    document.getElementById('old-pass').value = '';
                    document.getElementById('new-pass').value = '';
                    document.getElementById('confirm-pass').value = '';
                } else {
                    if (response.status === 401 || response.status === 403) {
                         alert('Сесія закінчилася або недійсна. Будь ласка, увійдіть знову.');
                         localStorage.removeItem('token');
                         localStorage.removeItem('userId');
                         window.location.href = '/login.html';
                    } else {
                        alert('Помилка: ' + (data.message || 'Невідома помилка.'));
                    }
                }
            } catch (error) {
                console.error('Помилка мережі або сервера:', error);
                alert('Сталася помилка при спробі змінити пароль. Спробуйте пізніше.');
            }
        });
    }
});
