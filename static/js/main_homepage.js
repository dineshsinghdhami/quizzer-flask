document.addEventListener('DOMContentLoaded', function () {

    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {

        hamburger.addEventListener('click', function (event) {
            event.stopPropagation();

            navMenu.classList.toggle('active');

            if (navMenu.classList.contains('active')) {
                hamburger.classList.remove('fa-bars');
                hamburger.classList.add('fa-xmark');
            } else {
                hamburger.classList.remove('fa-xmark');
                hamburger.classList.add('fa-bars');
            }
        });

        const navLinks = navMenu.querySelectorAll('a');

        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                navMenu.classList.remove('active');

                hamburger.classList.remove('fa-xmark');
                hamburger.classList.add('fa-bars');
            });
        });

        document.addEventListener('click', function (event) {
            if (
                !navMenu.contains(event.target) &&
                !hamburger.contains(event.target)
            ) {
                navMenu.classList.remove('active');

                hamburger.classList.remove('fa-xmark');
                hamburger.classList.add('fa-bars');
            }
        });
    }


    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(function (item) {
        const question = item.querySelector('h3');

        if (question) {
            question.addEventListener('click', function () {
                item.classList.toggle('active');
            });
        }
    });

});