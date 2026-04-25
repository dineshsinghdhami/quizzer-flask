const quizData = window.quizData;
let currentQuestion = 0;
let score = 0;

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('nextBtn');
const resultEl = document.getElementById('result');

function loadQuestion() {
    if (currentQuestion >= quizData.length) {
        questionEl.textContent = "Quiz Completed!";
        optionsEl.innerHTML = '';
        nextBtn.style.display = 'none';
        resultEl.textContent = `Your Score: ${score} / ${quizData.length}`;
        return;
    }

    const currentQuiz = quizData[currentQuestion];
    questionEl.textContent = currentQuiz.question;
    optionsEl.innerHTML = '';

    nextBtn.disabled = true;

    currentQuiz.options.forEach((option, index) => {
        const li = document.createElement('li');
        li.textContent = option;

        li.addEventListener('click', () => {
             Array.from(optionsEl.children).forEach(opt => opt.style.pointerEvents = 'none');

            nextBtn.disabled = false;

            if (index === currentQuiz.correct_index) {
                score++;
                li.style.backgroundColor = 'green';
                li.style.color = 'white';
            } else {
                li.style.backgroundColor = 'red';
                li.style.color = 'white';
                // Highlight correct answer
                optionsEl.children[currentQuiz.correct_index].style.backgroundColor = 'green';
                optionsEl.children[currentQuiz.correct_index].style.color = 'white';
            }
        });

        optionsEl.appendChild(li);
    });
}

nextBtn.addEventListener('click', () => {
    currentQuestion++;
    loadQuestion();
});

loadQuestion();