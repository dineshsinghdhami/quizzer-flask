
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

const faqItems = document.querySelectorAll('.faq-item h3');
faqItems.forEach(item => {
    item.addEventListener('click', () => {
        faqItems.forEach(i => { if(i !== item) i.parentElement.classList.remove('active'); });
        item.parentElement.classList.toggle('active');
    });
});

 if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('{{ url_for("static", filename="sw.js") }}')
    .then(reg => console.log('✅ Service Worker registered:', reg))
    .catch(err => console.log('❌ Service Worker registration failed:', err));
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    if (window.innerWidth > 768) return;
    
    e.preventDefault();
    deferredPrompt = e;

    const installBanner = document.createElement('div');
    installBanner.id = 'installBanner';
    installBanner.style.cssText = `
        position: fixed;
        top: -70px;
        left: 0;
        width: 100%;
        background: #00bcd4;
        color: #fff;
        padding: 15px 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        z-index: 9999;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        transition: top 0.5s ease;
    `;
    installBanner.innerHTML = `
        <span>Install Quizzer App on your device</span>
        <div>
            <button id="installBtn" style="margin-right:10px;
            padding:5px 12px;
            border:none;
            border-radius:5px;
            background:#00796b;
            color:#fff;
            cursor:pointer;">Install</button>
            <button id="closeInstall" style="padding:5px 10px;
            border:none;
            border-radius:5px;
            background:#555;
            color:#fff;
            cursor:pointer;">X</button>
        </div>
    `;
    document.body.appendChild(installBanner);

    setTimeout(() => { installBanner.style.top = '0'; }, 100);

    const installBtn = document.getElementById('installBtn');
    const closeBtn = document.getElementById('closeInstall');

    installBtn.addEventListener('click', async () => {
        installBanner.style.top = '-70px';
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        console.log('User choice:', choiceResult.outcome);
        deferredPrompt = null;
    });

    closeBtn.addEventListener('click', () => {
        installBanner.style.top = '-70px';
    });
});
