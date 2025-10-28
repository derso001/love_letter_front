document.addEventListener("DOMContentLoaded", () => {
    const cardsContainer = document.querySelector('.cards'); // Знаходимо наш порожній контейнер

    async function loadCards() {

        if (!cardsContainer) {
            console.error("Контейнер .cards не знайдено!");
            return;
        }
        
        try {
            const response = await fetch('http://127.0.0.1:8000/api/cards');

            if (!response.ok) {
                throw new Error(`Помилка HTTP: ${response.status}`);
            }

            const cards = await response.json();

            if (cards.length === 0) {
                cardsContainer.innerHTML = "<p>Поки що тут немає спогадів...</p>";
                return;
            }

            cards.forEach(card => {
                const cardHTML = `
                    <div class="card-container">
                        <div class="card-inner">
                            <div class="card-front">
                                <img src="${card.imageUrl}" alt="${card.title}">
                            </div>
                            <div class="card-back">
                                <h3>${card.title}</h3>
                                <p>${card.description}</p>
                                <p class="data">${card.data}</p>
                            </div>
                        </div>
                    </div>
                `;

                cardsContainer.innerHTML += cardHTML;
            });

            initializeCardFlips();

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

    loadCards();


    const loveCanvas = document.getElementById('love-canvas');

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
    }
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

    const addCardForm = document.getElementById('add-card-form');

    if (addCardForm) {
        
        addCardForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 
        
            const title = document.getElementById('card-title').value;
            const description = document.getElementById('card-description').value;
            const data = document.getElementById('card-data').value;
            
            const fileInput = document.getElementById('card-file');
            const file = fileInput.files[0];
        
            if (!file) {
                alert("Будь ласка, оберіть фото");
                return;
            }
        
            const formData = new FormData();
            
            formData.append('title', title);
            formData.append('description', description);
            formData.append('data', data);
            formData.append('file', file);
        
            try {
                const response = await fetch('http://127.0.0.1:8000/api/cards', {
                    method: 'POST',
                    
                    body: formData 
                });
        
                if (!response.ok) {
                    throw new Error('Не вдалося додати картку');
                }
        
                addCardForm.reset(); 
                loadCards(); 
        
            } catch (error) {
                console.error('Помилка при додаванні картки:', error);
                alert('Не вдалося додати спогад :(');
            }
        });
    };

});