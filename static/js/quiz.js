document.documentElement.setAttribute(
  'data-theme',
  localStorage.getItem('theme') || 'light'
);

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

let questions = Array.from(document.querySelectorAll('.question'));

questions = shuffleArray(questions);

const quizForm = document.getElementById('quizForm');

questions.forEach(q => {
  quizForm.appendChild(q);
});

questions.forEach(q => {

  const choicesDiv = q.querySelector('.choices');

  const labels = Array.from(
    choicesDiv.querySelectorAll('label')
  );

  const shuffledChoices = shuffleArray(labels);

  choicesDiv.innerHTML = '';

  shuffledChoices.forEach(label => {
    choicesDiv.appendChild(label);
  });

});

const timerSpan = document.getElementById('timer');
const submitBtn = document.getElementById('submitBtn');
const progressBar = document.getElementById('progressBar');
const submittedAtInput = document.getElementById('submittedAt');
const questionNumber = document.getElementById('questionNumber');

let currentQuestion = 0;
let timeLeft = 20;
let timer;

function showQuestion(index) {

  const noQuizMsg = document.getElementById('noQuizMsg');

  if (questions.length === 0) {

    noQuizMsg.style.display = 'block';
    quizForm.style.display = 'none';

    progressBar.style.width = '0%';

    submitBtn.style.display = 'none';

    timerSpan.textContent = '0';

    questionNumber.textContent = '0';

    return;
  }

  noQuizMsg.style.display = 'none';

  quizForm.style.display = 'block';

  questions.forEach((q, i) => {
    q.classList.toggle('active', i === index);
  });

  questionNumber.textContent = index + 1;

  const displayNumber =
    questions[index].querySelector('.question-display-number');

  if (displayNumber) {
    displayNumber.textContent = index + 1;
  }

  progressBar.style.width =
    ((index + 1) / questions.length * 100) + '%';

  resetTimer();
}

function resetTimer() {

  clearInterval(timer);

  timeLeft = 20;

  timerSpan.textContent = timeLeft;

  timer = setInterval(() => {

    timeLeft--;

    timerSpan.textContent = timeLeft;

    if (timeLeft <= 0) {
      checkAnswerAndNext();
    }

  }, 1000);
}

function checkAnswerAndNext() {

  clearInterval(timer);

  const current = questions[currentQuestion];

  current.querySelectorAll(
    'input[type="radio"]'
  ).forEach(r => {
    r.disabled = true;
  });

  setTimeout(() => {

    currentQuestion++;

    if (currentQuestion < questions.length) {

      showQuestion(currentQuestion);

    } else {

      progressBar.style.width = '100%';

      const now = new Date();

      submittedAtInput.value =
        now.toLocaleString('ne-NP', {
          hour12: false
        });

      submitBtn.style.display = 'inline-block';
    }

  }, 500);
}

questions.forEach(q => {

  q.addEventListener('change', () => {
    checkAnswerAndNext();
  });

});

if (questions.length > 0) {

  showQuestion(0);

} else {

  const noQuizMsg = document.getElementById('noQuizMsg');

  noQuizMsg.style.display = 'block';

  quizForm.style.display = 'none';

  submitBtn.style.display = 'none';

  questionNumber.textContent = '0';

  timerSpan.textContent = '0';
}

submitBtn.addEventListener('click', () => {

  clearInterval(timer);

  quizForm.querySelectorAll(
    'input[type="radio"]'
  ).forEach(r => {
    r.disabled = false;
  });

  quizForm.submit();
});