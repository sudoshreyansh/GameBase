document.querySelector('.hamburger').addEventListener('click', function() {
    this.parentElement.classList.toggle('nav-opened');
});

if ( !document.querySelector('header').classList.contains('sticky') ) {
    window.addEventListener('scroll', () => {
        document.querySelector('header').classList.toggle('sticky', window.scrollY > 0);
    });
}

document.querySelectorAll('.games-slider').forEach(element => {
    let currentPos = 0;
    let gameCardsWrapper = element.querySelector('.games-slider__cards');
    let gameCards = element.querySelectorAll('.games-slider__card');
    let cardWidth = gameCards[0].offsetWidth;
    let trackWidth = gameCardsWrapper.scrollWidth;
    let scrollWidth = trackWidth - element.offsetWidth;

    element.querySelector('.games-slider__button-left').addEventListener('click', () => {
        let newPos = currentPos - cardWidth;
        currentPos = newPos < 0 ? 0 : newPos;
        gameCardsWrapper.style.transform = `translateX(-${currentPos}px)`;
    });

    element.querySelector('.games-slider__button-right').addEventListener('click', () => {
        let newPos = currentPos + cardWidth;
        currentPos = newPos > scrollWidth ? scrollWidth : newPos;
        gameCardsWrapper.style.transform = `translateX(-${currentPos}px)`;
    });
});


document.querySelectorAll('.sign-up-trigger').forEach(element => {
    element.addEventListener('click', event => {
        console.log('sign-up');
        event.preventDefault();
        document.querySelector('main').classList.remove('log-in');
        document.querySelector('main').classList.add('side-change');
        setTimeout(() => document.querySelector('main').classList.add('sign-up'), 400);
    });
});

document.querySelectorAll('.log-in-trigger').forEach(element => {
    element.addEventListener('click', event => {
        console.log('log-in');
        event.preventDefault();
        document.querySelector('main').classList.add('side-change');
        document.querySelector('main').classList.remove('sign-up');
        setTimeout(() => document.querySelector('main').classList.add('log-in'), 400);
    });
});