document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('questions-container');
    const API_URL = 'https://love-letter-api.onrender.com/api/revealed-questions';

    async function fetchQuestions() {
        try {
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error(`Помилка HTTP: ${response.status}`);
            }

            const questions = await response.json();
            
            // Очищаємо текст "Завантажую..."
            container.innerHTML = '';

            // Якщо ще немає відкритих питань
            if (questions.length === 0) {
                container.innerHTML = '<div class="empty-message">Поки що ми не відкрили жодного питання. Чекаємо на неділю! 😉</div>';
                return;
            }

            // Сортуємо питання по номеру (ID), щоб вони завжди йшли по порядку
            questions.sort((a, b) => a.id - b.id);

            // Малюємо картки
            questions.forEach(q => {
                const box = document.createElement('div');
                box.className = 'question-box';
                
                box.innerHTML = `
                    <div class="question-title">№${q.id}: ${q.question_text}</div>
                    
                    <div class="answer-box boris">
                        <span class="author-name">Борис:</span>
                        ${q.boris_answer}
                    </div>
                    
                    <div class="answer-box vika">
                        <span class="author-name">Віка:</span>
                        ${q.vika_answer}
                    </div>
                `;
                container.appendChild(box);
            });

        } catch (error) {
            console.error('Помилка завантаження питань:', error);
            container.innerHTML = '<div class="empty-message">Не вдалося з\'єднатися із сервером. Спробуй оновити сторінку.</div>';
        }
    }

    // Запускаємо відмальовку одразу при завантаженні сторінки
    fetchQuestions();
});