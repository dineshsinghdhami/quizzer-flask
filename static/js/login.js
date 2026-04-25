
const container = document.getElementById('container');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const overlayBtn = document.getElementById('overlayBtn');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');
const password = document.getElementById('regPassword');

function adjustContainerHeight() {
    const activeForm = container.classList.contains('show-register') ? registerForm : loginForm;
    const newHeight = activeForm.scrollHeight + 60;
    container.style.height = newHeight + 'px';
    if(container.classList.contains('show-register')){
        overlayTitle.textContent = "Already have an account?";
        overlayText.textContent = "Click below to login.";
        overlayBtn.textContent = "Login";
    } else {
        overlayTitle.textContent = "New here?";
        overlayText.textContent = "Click below to sign up.";
        overlayBtn.textContent = "Sign Up";
    }
}
window.addEventListener('load', adjustContainerHeight);

function showRegisterMobile() {
    if(window.innerWidth <= 768){
        document.querySelector('.login-container').style.display = 'none';
        document.querySelector('.register-container').style.display = 'block';
        window.scrollTo(0,0);
    } else {
        container.classList.add('show-register'); adjustContainerHeight();
    }
}
function showLoginMobile() {
    if(window.innerWidth <= 768){
        document.querySelector('.login-container').style.display = 'block';
        document.querySelector('.register-container').style.display = 'none';
        window.scrollTo(0,0);
    } else {
        container.classList.remove('show-register'); adjustContainerHeight();
    }
}
document.getElementById('showRegister').addEventListener('click', e => { e.preventDefault(); showRegisterMobile(); });
document.getElementById('showLogin').addEventListener('click', e => { e.preventDefault(); showLoginMobile(); });
overlayBtn.addEventListener('click', () => {
    if(window.innerWidth <= 768){
        const loginVisible = document.querySelector('.login-container').style.display !== 'none';
        if(loginVisible){ showRegisterMobile(); } else { showLoginMobile(); }
    } else {
        container.classList.toggle('show-register'); adjustContainerHeight();
    }
});

document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', () => {
        const input = document.querySelector(icon.getAttribute('toggle'));
        if(input.type === 'password'){ input.type = 'text'; icon.classList.replace('fa-eye','fa-eye-slash'); } 
        else{ input.type = 'password'; icon.classList.replace('fa-eye-slash','fa-eye'); }
    });
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('{{ url_for("static", filename="sw.js") }}')
    .then(reg => console.log('✅ Service Worker registered:', reg))
    .catch(err => console.log('❌ Service Worker registration failed:', err));
}


function showErr(input, msg) {
    const err = input.parentElement.querySelector(".error");
    if (!err) return;
    input.classList.add("error-field");
    err.textContent = msg;
}
function clearErr(input) {
    const err = input.parentElement.querySelector(".error");
    if (!err) return;
    input.classList.remove("error-field");
    err.textContent = "";
}


function shake(input) {
    input.style.animation = "shake 0.3s";
    setTimeout(() => input.style.animation = "", 300);
}
const shakeCSS = document.createElement("style");
shakeCSS.textContent = `
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
  75% { transform: translateX(-4px); }
  100% { transform: translateX(0); }
}`;
document.head.appendChild(shakeCSS);

document.querySelectorAll("input").forEach(inp => {
    inp.addEventListener("input", () => clearErr(inp));
});


const usernameField = registerForm.querySelector("input[name='username']");
let usernameTimeout;

usernameField.addEventListener("input", () => {
    clearTimeout(usernameTimeout);
    clearErr(usernameField);
    const name = usernameField.value.trim();
    if (name.length < 3) return;

    usernameTimeout = setTimeout(() => {
        fetch(`/check_username?username=${name}`)
            .then(r => r.json())
            .then(d => {
                if (!d.available) showErr(usernameField, "Username already taken");
            });
    }, 500);
});


loginForm.addEventListener("submit", e => {
    let ok = true;
    const user = loginForm.querySelector("input[name='identifier']");
    const pass = loginForm.querySelector("input[name='password']");

    clearErr(user); clearErr(pass);

    if (user.value.trim() === "") { showErr(user, "Required"); shake(user); ok = false; }
    if (pass.value.trim() === "") { showErr(pass, "Required"); shake(pass); ok = false; }

    if (!ok) e.preventDefault();
});



registerForm.addEventListener("submit", e => {
    let ok = true;

    const first = registerForm.querySelector("input[name='first_name']");
    const last = registerForm.querySelector("input[name='last_name']");
    const email = registerForm.querySelector("input[name='email']");
    const pass = registerForm.querySelector("input[name='password']");
    const conf = registerForm.querySelector("input[name='confirm_password']");

    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    [first, last, usernameField, email, pass, conf].forEach(clearErr);

    if (!first.value.trim()) { showErr(first,"Required"); shake(first); ok=false; }
    if (!last.value.trim())  { showErr(last,"Required"); shake(last); ok=false; }

    if (usernameField.value.trim().length < 3) { showErr(usernameField,"Min 3 characters"); shake(usernameField); ok=false; }

    if (!emailReg.test(email.value.trim())) { showErr(email,"Invalid email"); shake(email); ok=false; }

    if (pass.value.length < 6) { showErr(pass,"Min 6 characters"); shake(pass); ok=false; }

    if (conf.value !== pass.value) { showErr(conf,"Password mismatch"); shake(conf); ok=false; }

    if (!ok) e.preventDefault();
});
