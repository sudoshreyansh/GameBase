var database = firebase.firestore();
var usersCollection = database.collection('users');

document.querySelector(".hamburger").addEventListener("click", function () {
  this.parentElement.classList.toggle("nav-opened");
});

if (!document.querySelector("header").classList.contains("sticky")) {
  window.addEventListener("scroll", () => {
    document
      .querySelector("header")
      .classList.toggle("sticky", window.scrollY > 0);
  });
}

document.querySelectorAll(".games-slider").forEach((element) => {
  let currentPos = 0;
  let gameCardsWrapper = element.querySelector(".games-slider__cards");
  let gameCards = element.querySelectorAll(".games-slider__card");
  let cardWidth = gameCards[0].offsetWidth;
  let trackWidth = gameCardsWrapper.scrollWidth;
  let scrollWidth = trackWidth - element.offsetWidth;

  element
    .querySelector(".games-slider__button-left")
    .addEventListener("click", () => {
      let newPos = currentPos - cardWidth;
      currentPos = newPos < 0 ? 0 : newPos;
      gameCardsWrapper.style.transform = `translateX(-${currentPos}px)`;
    });

  element
    .querySelector(".games-slider__button-right")
    .addEventListener("click", () => {
      let newPos = currentPos + cardWidth;
      currentPos = newPos > scrollWidth ? scrollWidth : newPos;
      gameCardsWrapper.style.transform = `translateX(-${currentPos}px)`;
    });
});

function displayLoader() {
  let loadingWrapper = document.getElementById("loading-wrapper");
  loadingWrapper.classList.remove("loaded");
  loadingWrapper.style.display = "block";
}

function removeLoader() {
  let loadingWrapper = document.getElementById("loading-wrapper");
  loadingWrapper.classList.add("loaded");
  setTimeout(() => (loadingWrapper.style.display = "none"), 500);
}

function setLoaderText(text) {
  document.querySelector('#loading-wrapper p').innerText = text;
}

function getFromDatabase(reference) {
  return new Promise(resolve => {
      reference.get().then(snapshot => {
          resolve(snapshot);
      });
  });
}

document.getElementById('logout').addEventListener('click', function(event) {
  event.preventDefault();
  firebase.auth().signOut();
  if ( document.querySelector('body').classList.contains('logged-in-only') ) {
    window.location.assign('/');
  } else {
    window.location.reload();
  }
});

firebase.auth().onAuthStateChanged(user => {
  if ( user ) {
    document.querySelector('body').classList.add('logged-in');
    if ( authCallback ) {
      authCallback(user);
    }
  } else if ( document.querySelector('body').classList.contains('logged-in-only') ) {
    window.location.assign('/');
  }
});