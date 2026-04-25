
const facultyPrograms = {
    'Science & Technology': ['BE Computer', 'BCA', 'BE Civil'],
    'Management': ['BBA', 'BBS']
};

const container = document.getElementById('facultyProgramsContainer');

Object.keys(facultyPrograms).forEach(faculty => {
    const section = document.createElement('div');
    section.className = 'faculty-section';
    const header = document.createElement('h4');
    header.textContent = faculty;
    section.appendChild(header);

    const nestedDiv = document.createElement('div');
    nestedDiv.className = 'nested-programs';

    facultyPrograms[faculty].forEach(program => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = program;

        btn.addEventListener('click', () => {
            const slug = program.toLowerCase().replace(/\s+/g, '');
            window.location.href = `/${slug}`;
        });

        nestedDiv.appendChild(btn);
    });

    header.addEventListener('click', () => {
        nestedDiv.style.display = nestedDiv.style.display === 'flex' ? 'none' : 'flex';
    });

    section.appendChild(nestedDiv);
    container.appendChild(section);
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
});

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

const bellIcon = document.querySelector('.fa-bell');
const notificationBox = document.getElementById('notificationBox');
bellIcon.addEventListener('click', (e) => { 
    e.stopPropagation(); 
    notificationBox.classList.toggle('show'); 
});
document.addEventListener('click', () => { notificationBox.classList.remove('show'); });

document.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' || e.keyCode === 13){
        if(logoutModal.style.display === 'flex'){
            confirmLogout.click();
        } else {
            const firstBtn = document.querySelector('.nested-programs .btn');
            if(firstBtn) firstBtn.click();
        }
    }
});
if (window.history && window.history.pushState) {
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
        window.history.go(1);
    };
}