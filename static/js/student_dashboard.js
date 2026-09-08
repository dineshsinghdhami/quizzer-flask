
const facultyPrograms = {
    'Science & Technology': {
        badge: 'A',
        blurb: '3 programs',
        programs: ['BE Computer', 'BCA', 'BE Civil']
    },
    'Management': {
        badge: 'B',
        blurb: '2 programs',
        programs: ['BBA', 'BBS']
    }
};

const container = document.getElementById('facultyProgramsContainer');

Object.keys(facultyPrograms).forEach(faculty => {
    const data = facultyPrograms[faculty];

    const card = document.createElement('div');
    card.className = 'faculty-card';

    const head = document.createElement('div');
    head.className = 'faculty-card-head';
    head.innerHTML = `<span class="option-badge">${data.badge}</span><h4>${faculty}</h4>`;
    card.appendChild(head);

    const sub = document.createElement('p');
    sub.className = 'faculty-card-sub';
    sub.textContent = data.blurb;
    card.appendChild(sub);

    const chipRow = document.createElement('div');
    chipRow.className = 'program-chips';

    data.programs.forEach(program => {
        const btn = document.createElement('button');
        btn.className = 'chip';
        btn.textContent = program;

        btn.addEventListener('click', () => {
            const slug = program.toLowerCase().replace(/\s+/g, '');
            window.location.href = `/${slug}`;
        });

        chipRow.appendChild(btn);
    });

    card.appendChild(chipRow);
    container.appendChild(card);
});

const themeToggle = document.getElementById('themeToggle');

if (!localStorage.getItem('theme')) {
    localStorage.setItem('theme', 'dark');
}

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
} else {
    document.body.classList.remove('dark');
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    const icon = themeToggle.querySelector('i');
    icon.className = document.body.classList.contains('dark') ? 'fas fa-moon' : 'fas fa-sun';
});
(function initThemeIcon(){
    const icon = themeToggle.querySelector('i');
    icon.className = document.body.classList.contains('dark') ? 'fas fa-moon' : 'fas fa-sun';
})();

// ===== PROFILE CLICK =====
document.getElementById('profileAvatar').addEventListener('click', ()=>{ window.location.href='userprofile'; });

// ===== TIP OF THE DAY =====
const quotes = [
  "Be consistent - success loves discipline.",
  "Big dreams demands big sacrifices.",
  "Mistakes are proof that you are trying. Keep going!",
  "Stay consistent, your small efforts create big results.",
  "A winner is just a loser who tried one more time",
  "First they'll laugh at you,then they'll ask how you did it.",
  "Knowledge grows when you share it. Discuss with friends.",
  "Focus on progress, not perfection.",
  "Small daily improvements lead to stunning results.",
  "Don’t just memorize, understand the concepts.",
  "Quizzes are not just tests; they are practice for your brain.",
  "Every mistake is a step closer to mastery.",
  "Time invested in learning pays the best interest.",
  "Stay curious and keep asking questions.",
  "Your future self will thank you for the effort you put in today.",
  "Success is the sum of small efforts repeated daily.",
  "Learning never exhausts the mind; it energizes it.",
  "If the plan doesn't work, Change the plan, Not the goal.",
  "Doubt kills more dreams than failure ever will.",
  "Push yourself, because no one else is going to do it for you.",
  "Smart work beats hard work when done consistently.",
  "Your brain is a muscle; exercise it regularly.",
  "Every day is an opportunity to improve.",
  "Obstacles are just opportunties in disguise.",
  "Past is experience,Present is experiment, Future is expectation.",
  "Dirty water doesnot stop plants from growing,so don't let negative words stop your progress.",
  "Believe in yourself and all that you are capable of."
];
const today = new Date().toISOString().split('T')[0];
let storedTipDate = localStorage.getItem('tipDate');
let storedTipIndex = localStorage.getItem('tipIndex');
if(storedTipDate === today && storedTipIndex !== null){
    document.getElementById('dailyTip').textContent = quotes[storedTipIndex];
} else {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    localStorage.setItem('tipIndex', randomIndex);
    localStorage.setItem('tipDate', today);
    document.getElementById('dailyTip').textContent = quotes[randomIndex];
}

const logoutBtn = document.getElementById('logoutBtn');
const logoutModal = document.getElementById('logoutModal');
const confirmLogout = document.getElementById('confirmLogout');
const cancelLogout = document.getElementById('cancelLogout');
logoutBtn.addEventListener('click', () => {
    logoutModal.style.display = 'flex';
});
confirmLogout.addEventListener('click', () => {
    window.location.href = '/logout'; // call the logout route
});

cancelLogout.addEventListener('click', () => {
    logoutModal.style.display = 'none';
});

const bellBtn = document.getElementById('bellBtn');
const notificationBox = document.getElementById('notificationBox');
bellBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notificationBox.classList.toggle('show');
});
document.addEventListener('click', () => { notificationBox.classList.remove('show'); });

document.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' || e.keyCode === 13){
        if(logoutModal.style.display === 'flex'){
            confirmLogout.click();
        } else {
            const firstChip = document.querySelector('.program-chips .chip');
            if(firstChip) firstChip.click();
        }
    }
});
if (window.history && window.history.pushState) {
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
        window.history.go(1);
    };
}
