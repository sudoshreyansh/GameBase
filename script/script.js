document.querySelector('.hamburger').addEventListener('click', function() {
    this.parentElement.classList.toggle('nav-opened');
});

window.addEventListener('scroll', () => {
    document.querySelector('header').classList.toggle('sticky', window.scrollY > 0);
})