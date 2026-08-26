document.addEventListener("DOMContentLoaded", () => {
    const cardsContainer = document.querySelector('.cards'); // Знаходимо наш порожній контейнер
    const API_URL = 'https://love-letter-api.onrender.com/api/cards';
    // const API_URL = 'http://127.0.0.1:8000/api/cards';

    const defaultTags = []; // Твій порожній масив (або можеш додати туди базові теги)

    function renderDynamicTagsForForm(cards) {
        // Обертаємо все в try-catch. Тепер будь-яка помилка тут не зламає весь сайт!
        try {
            const tagsContainer = document.getElementById('tags-container');
            const openModalBtn = document.getElementById('open-tags-modal-btn');
            
            if (!tagsContainer) return; // Якщо контейнера немає, просто виходимо
    
            // Захист: якщо сервер раптом повернув помилку замість масиву карток
            if (!Array.isArray(cards)) return; 
    
            const uniqueTags = new Set(defaultTags);
    
            // Збираємо теги
            cards.forEach(card => {
                // Додатковий захист: перевіряємо, що теги є і це точно текст
                if (card.tags && typeof card.tags === 'string') {
                    const cardTags = card.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                    cardTags.forEach(tag => uniqueTags.add(tag));
                }
            });
    
            // Очищаємо старі плашки
            const existingLabels = tagsContainer.querySelectorAll('label');
            // existingLabels.forEach(label => label.remove());
    
            // Малюємо нові плашки БЕЗПЕЧНО
            uniqueTags.forEach(tag => {
                const label = document.createElement('label');
                label.setAttribute('data-tag', tag); 
                label.innerHTML = `<input type="checkbox" name="tags" value="${tag}"> ${tag}`;
                
                // Просто закидаємо всі теги в їхній контейнер
                tagsContainer.appendChild(label);
            });
    
        } catch (error) {
            // Якщо станеться якась магія, ми побачимо це в консолі, 
            // але сайт продовжить працювати і фотки завантажаться!
            console.error("Помилка генерації тегів для форми:", error);
        }
    }

    function renderFilters(cards) {
        const filterContainer = document.getElementById('filter-container');
        if (!filterContainer) return;
    
        // ЧАСТИНА 1: Збираємо всі унікальні теги з фотографій
        const uniqueTags = new Set();
        cards.forEach(card => {
            if (card.tags && typeof card.tags === 'string') {
                const cardTags = card.tags.split(',').map(tag => tag.trim()).filter(t => t.length > 0);
                cardTags.forEach(tag => uniqueTags.add(tag));
            }
        });
    
        // ЧАСТИНА 2: Створюємо HTML-кнопки
        // Перша кнопка завжди "Всі", щоб можна було скинути фільтр
        let filterHTML = `<button class="filter-btn active" data-filter="all">🌟 Всі</button>`;
        
        uniqueTags.forEach(tag => {
            // Записуємо назву тегу в data-filter маленькими літерами, щоб точно співпадало
            filterHTML += `<button class="filter-btn" data-filter="${tag.toLowerCase()}">${tag}</button>`;
        });
        
        // Вставляємо готові кнопки на сторінку
        filterContainer.innerHTML = filterHTML;
    
        // ЧАСТИНА 3: Додаємо "магію" кліків (ховаємо/показуємо картки)
        const filterButtons = filterContainer.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Робимо натиснуту кнопку "активною" (міняємо колір)
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
    
                // Читаємо, який саме тег натиснули
                const filterValue = btn.getAttribute('data-filter');
                
                // Знаходимо всі картки на екрані
                const allCardElements = document.querySelectorAll('.card-container');
    
                allCardElements.forEach(cardEl => {
                    // Беремо ті самі невидимі теги, які ми додали в 3-му кроці
                    const cardTags = cardEl.getAttribute('data-tags') || '';
                    
                    // Якщо натиснули "Всі" АБО в картці є потрібний тег -> показуємо її
                    if (filterValue === 'all' || cardTags.includes(filterValue)) {
                        cardEl.style.display = 'block'; 
                    } else {
                        // Якщо тегу немає -> ховаємо картку
                        cardEl.style.display = 'none'; 
                    }
                });
            });
        });
    }

    async function loadCards() {
        

        if (!cardsContainer) {
            console.error("Контейнер .cards не знайдено!");
            return;
        }
        
        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`Помилка HTTP: ${response.status}`);
            }

            const cards = await response.json();

            renderDynamicTagsForForm(cards);
            renderFilters(cards);

            if (cards.length === 0) {
                cardsContainer.innerHTML = "<p>Поки що тут немає спогадів...</p>";
                return;
            }

            cards.sort((a, b) => new Date(a.data) - new Date(b.data));

            cards.forEach(card => {

                let tagsHTML = '';
                let filterTags = '';

                if (card.tags) {
                    const tagsArray = card.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                    tagsHTML = tagsArray.map(tag => `<span class="tag-badge">${tag}</span>`).join('');
                    filterTags = card.tags.toLowerCase();
                }

                let optimizedImageUrl = card.imageUrl;
                if (optimizedImageUrl.includes('/upload/')) {
                    optimizedImageUrl = optimizedImageUrl.replace('/upload/', '/upload/q_auto,f_auto,w_400/');
                }

                const cardHTML = `
                    <div class="card-container" data-tags="${filterTags}">
                        <div class="card-inner">
                            <div class="card-front">
                                <img src="${optimizedImageUrl}" alt="${card.title}" loading="lazy">
                            </div>
                            <div class="card-back">
                                <h3>${card.title}</h3>
                                <p>${card.description}</p>
                                <p class="data">${card.data}</p>
                                <div class="card-tags-container">
                                    ${tagsHTML}
                                </div>
                                <button class="delete-btn" data-id="${card.id}">🗑️</button>
                            </div>
                        </div>
                    </div>
                `;

                cardsContainer.innerHTML += cardHTML;
            });

            initializeCardFlips();
            initializeDeleteButtons();

        } catch (error) {
            console.error("Не вдалося завантажити картки:", error);
            cardsContainer.innerHTML = "<p>Не можу підключитися до сервера спогадів</p>";
        }
    }

    function initializeCardFlips() {
        const cardElements = document.querySelectorAll('.card-container');
        cardElements.forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('is-flipped');
            });
        });
    }

    function initializeDeleteButtons() {
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', async (event) => {
             
                event.stopPropagation(); 
                const cardId = btn.getAttribute('data-id');
                if (!cardId) return;

                const isConfirmed = confirm("Точно хочеш назавжди видалити цей спогад?");
                if (!isConfirmed) return;

                const originalText = btn.innerText;
                btn.innerText = '⏳...';
                btn.disabled = true;

                try {
                    const response = await fetch(`${API_URL}/${cardId}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        // Видаляємо з екрану
                        const cardElement = btn.closest('.timeline-item') || btn.closest('.card-container');
                        if (cardElement) {
                            cardElement.remove();
                        }
                    } else {
                        alert("Не вдалося видалити на сервері.");
                        btn.innerText = originalText;
                        btn.disabled = false;
                    }
                } catch (error) {
                    console.error("Помилка видалення:", error);
                    alert("Помилка з'єднання з сервером.");
                    btn.innerText = originalText;
                    btn.disabled = false;
                }
            });
        });
    }

    loadCards();


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

    const cards = document.querySelectorAll(".card-container");
    cards.forEach(card => {
        card.addEventListener("click", () => {
            card.classList.toggle("is-flipped");
        });
    });

    const openModalBtn = document.getElementById('open-tags-modal-btn');
    const closeModalBtn = document.getElementById('close-tags-modal-btn');
    const tagsModal = document.getElementById('custom-tags-modal');
    const modalInput = document.getElementById('modal-new-tag-input');
    const modalAddBtn = document.getElementById('modal-add-tag-btn');
    const modalTagsList = document.getElementById('modal-tags-list');
    const tagsContainer = document.getElementById('tags-container');

    if (openModalBtn && tagsModal) {
        openModalBtn.addEventListener('click', () => {
            tagsModal.classList.remove('hidden');
            modalInput.focus();
        });

        closeModalBtn.addEventListener('click', () => {
            tagsModal.classList.add('hidden');
        });

        // 2. Функція створення тегу
        function createCustomTag() {
            const tagValue = modalInput.value.trim();
            if (!tagValue) return;

            // --- А. Додаємо в головну форму (як звичайну плашку) ---
            const formLabel = document.createElement('label');
            formLabel.classList.add('custom-added-tag'); // Мітка, щоб знати, що це наш кастомний
            formLabel.setAttribute('data-tag', tagValue); // Прив'язуємо значення
            formLabel.innerHTML = `<input type="checkbox" name="tags" value="${tagValue}" checked> ${tagValue}`;
            
            // Вставляємо перед кнопкою "➕ Свій тег"
            tagsContainer.appendChild(formLabel);

            // --- Б. Додаємо в список всередині модалки (для видалення) ---
            const listItem = document.createElement('div');
            listItem.classList.add('modal-tag-item');
            listItem.innerHTML = `
                <span>${tagValue}</span>
                <label type="button" class="delete-custom-tag" data-tag="${tagValue}">×</label>
            `;
            modalTagsList.appendChild(listItem);

            // Очищаємо інпут
            modalInput.value = '';

            // --- В. Вішаємо логіку видалення на хрестик ---
            const deleteBtn = listItem.querySelector('.delete-custom-tag');
            deleteBtn.addEventListener('click', function() {
                const tagToRemove = this.getAttribute('data-tag');
                
                // Видаляємо зі списку модалки
                listItem.remove();
                
                // Шукаємо цей же тег у головній формі і видаляємо його теж
                const formTagToRemove = tagsContainer.querySelector(`label[data-tag="${tagToRemove}"]`);
                if (formTagToRemove) {
                    formTagToRemove.remove();
                }
            });
        }

        // 3. Обробники для кнопки "Додати" та клавіші Enter
        modalAddBtn.addEventListener('click', createCustomTag);
        modalInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Щоб форма не відправилась
                createCustomTag();
            }
        });
    }

    const addCardForm = document.getElementById('add-card-form');
    const fileInput = document.getElementById('card-file');
    const fileNameDisplay = document.getElementById('file-name');

    if (fileInput && fileNameDisplay) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                fileNameDisplay.textContent = this.files[0].name;
                fileNameDisplay.style.color = "#ff4d6d"; // Робимо текст рожевим для підтвердження
                fileNameDisplay.style.fontWeight = "bold";
            } else {
                fileNameDisplay.textContent = 'Файл не вибрано';
                fileNameDisplay.style.color = "#666";
                fileNameDisplay.style.fontWeight = "normal";
            }
        });
    }

    if (addCardForm) {
        
        addCardForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 
        
            const title = document.getElementById('card-title').value;
            const description = document.getElementById('card-description').value;
            const data = document.getElementById('card-data').value;
            const fileInput = document.getElementById('card-file');
            const file = fileInput.files[0];


            const selectedTagsElements = document.querySelectorAll('input[name="tags"]:checked');
            const tagsArray = Array.from(selectedTagsElements).map(checkbox => checkbox.value);
            const tagsString = tagsArray.join(','); 

            console.log("Відправляю дані:", { title, description, data, tags: tagsString, file });

            if (!file) {
                alert("Будь ласка, оберіть фото");
                return;
            }

            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('data', data);
            formData.append('tags', tagsString);
            formData.append('file', file);
                    
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    
                    body: formData 
                });
        
                if (!response.ok) {
                    throw new Error('Не вдалося додати картку');
                }
        
                addCardForm.reset(); 
                
                if (fileNameDisplay) {
                    fileNameDisplay.textContent = 'Файл не вибрано';
                    fileNameDisplay.style.color = "#666";
                    fileNameDisplay.style.fontWeight = "normal";
                }
        
                cardsContainer.innerHTML = ''; 
                tagsContainer.innerHTML = '';
        
                loadCards(); 
                
                alert("Спогад успішно додано! ❤️");
        
            } catch (error) {
                console.error('Помилка при додаванні картки:', error);
                alert('Не вдалося додати спогад :(');
            }
        });
    };

    const startDate = new Date("2025-08-26T15:00:00"); 

    function updateTimer() {
        const now = new Date();
        
        let years = now.getFullYear() - startDate.getFullYear();
        let months = now.getMonth() - startDate.getMonth();
        let days = now.getDate() - startDate.getDate();
        let hours = now.getHours() - startDate.getHours();
        let minutes = now.getMinutes() - startDate.getMinutes();
        let seconds = now.getSeconds() - startDate.getSeconds();

        // Коригуємо від'ємні значення, позичаючи в старших розрядів
        if (seconds < 0) { seconds += 60; minutes--; }
        if (minutes < 0) { minutes += 60; hours--; }
        if (hours < 0) { hours += 24; days--; }
        if (days < 0) {
            months--;
            // Дізнаємося кількість днів у попередньому місяці
            let previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += previousMonth.getDate();
        }
        if (months < 0) { months += 12; years--; }

        // Записуємо значення в HTML
        const elYears = document.getElementById("t-years");
        if (elYears) { // Перевіряємо, чи є блок на сторінці
            elYears.innerText = years;
            document.getElementById("t-months").innerText = months;
            document.getElementById("t-days").innerText = days;
            document.getElementById("t-hours").innerText = hours;
            document.getElementById("t-mins").innerText = minutes;
            document.getElementById("t-secs").innerText = seconds;
        }
    }

    // Запускаємо одразу, і потім оновлюємо щосекунди
    updateTimer();
    setInterval(updateTimer, 1000);

});