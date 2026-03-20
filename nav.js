// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const navUl = document.querySelector('nav ul');
if (toggle && navUl) {
    toggle.addEventListener('click', () => {
        navUl.classList.toggle('open');
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('nav')) {
            navUl.classList.remove('open');
        }
    });
}
