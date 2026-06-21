document.addEventListener('DOMContentLoaded', () => {
    const wishForm = document.querySelector('#wish-form');
    const wishName = document.querySelector('#wish-name');
    const wishLink = document.querySelector('#wish-link');
    const wishPrice = document.querySelector('#wish-price');
    const wishListEl = document.querySelector('#wish-list-container');
    
    // Для тестування локально. При деплої заміниш на URL Render.
    // const API_URL = 'http://127.0.0.1:8000/api/wishes'; 
    const API_URL = 'https://love-letter-api.onrender.com/api/wishes';
    
    // Отримання даних з бази
    async function fetchWishes() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Помилка сервера');
            const wishes = await response.json();
            renderWishes(wishes);
        } catch (error) {
            console.error('Помилка завантаження бажань:', error);
        }
    }

    // Рендер HTML
    function renderWishes(wishes) {
        wishListEl.innerHTML = '';
        wishes.forEach((wish) => {
            const style = wish.done ? 'style="text-decoration: line-through; opacity: 0.6;"' : '';
            
            let wishHTML = `
            <div class="wish-item" ${style} data-id="${wish.id}">
                <h3>${wish.title}</h3>
                <div class="wish-meta">
                    <span class="wish-author">👤 ${wish.author}</span>
                    ${wish.prise ? `<span class="wish-price">${wish.prise} гривень</span>` : ''}
                </div>
                <div>
                    ${wish.src ? `<a class="shop-btn" target="_blank" href="${wish.src}">Приклад</a>` : ''}
                    <button class="toggle-btn" data-id="${wish.id}">${wish.done ? 'Відновити' : 'Виконано'}</button>
                    <button class="delete-btn" data-id="${wish.id}">🗑️</button>
                </div>
            </div>`;
            wishListEl.innerHTML += wishHTML;
        });
        
        attachEventListeners();
    }

    // Делегування подій на динамічні кнопки
    function attachEventListeners() {
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                await fetch(`${API_URL}/${id}/toggle`, { method: 'PATCH' });
                fetchWishes(); // Перемальовуємо список після оновлення
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                // 1. Викликаємо вікно підтвердження
                const isConfirmed = confirm("Точно хочеш назавжди видалити це бажання?");
                
                // 2. Якщо юзер натиснув "Скасувати", просто виходимо з функції
                if (!isConfirmed) return;

                const id = e.target.getAttribute('data-id');
                
                try {
                    // За бажанням: можна зробити кнопку неактивною, поки йде запит
                    e.target.innerText = '⏳';
                    e.target.disabled = true;

                    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                    
                    if (response.ok) {
                        fetchWishes(); // Перемальовуємо список після успішного видалення
                    } else {
                        alert("Не вдалося видалити на сервері.");
                        e.target.innerText = '🗑️';
                        e.target.disabled = false;
                    }
                } catch (error) {
                    console.error('Помилка видалення:', error);
                    alert("Помилка з'єднання з сервером.");
                    e.target.innerText = '🗑️';
                    e.target.disabled = false;
                }
            });
        });
    }
    
    // Обробка відправки форми
    wishForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Зупиняємо стандартне перезавантаження сторінки
        
        // Знаходимо ту радіокнопку, яка зараз активна (:checked), і беремо її значення
        const selectedAuthor = document.querySelector('input[name="wish-author"]:checked').value;

        // Збираємо об'єкт з усіма ключами для бекенду
        const newWish = {
            title: wishName.value.trim(),
            src: wishLink.value.trim(),
            prise: wishPrice.value.trim(),
            author: selectedAuthor // Наш новий параметр автора
        };

        // Перевірка: якщо назва порожня, нічого не відправляємо
        if (!newWish.title) return;

        try {
            // Відправляємо POST-запит на бекенд
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newWish)
            });
            
            // Якщо сервер успішно зберіг бажання
            if (response.ok) {
                wishForm.reset(); // Очищаємо всі поля форми
                fetchWishes();    // Завантажуємо оновлений список з бази
            }
        } catch (error) {
            console.error('Помилка збереження:', error);
        }
    });
    
    // Первинне завантаження
    fetchWishes();

    const loveCanvas = document.getElementById('love-canvas');
    if (loveCanvas){
    function createHeart() {
        const heart = document.createElement('div');
        heart.classList.add("heart");
        heart.innerHTML = "❤️"

        heart.style.left = Math.random() * 100 + "vw";

        const size = Math.random() * 1.5 + 1; // Від 1 до 2.5 em
        heart.style.fontSize = size + 'em';

        heart.style.animationDuration = Math.random() * 4 + 5 + 's';

        heart.style.animationDelay = Math.random() * 2 + 's';

        heart.style.setProperty('--rotation', `${Math.random() * 60 - 30}deg`);


        loveCanvas.appendChild(heart);
        heart.addEventListener("animationend", () => {
            heart.remove();
        })
    }}
    setInterval(createHeart, 300);
    
    for (let i=0; i<15; i++){
        setTimeout(createHeart, i * 100)
    }

});