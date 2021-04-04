var database = firebase.firestore();
var storage = firebase.storage();
var usersCollection = database.collection('users');
var gamesCollection = database.collection('games');
var categoriesCollection = database.collection('categories');

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

function initSlider (element) {
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
}

function generateSliderContent(gamesArray) {
  return gamesArray.reduce((accumulator, currentGame) => {
    return accumulator + `
    <li class="games-slider__card">
      <a href="/game/${currentGame.id}">
        <div class="games-card__image" style="background-image: url('${currentGame.icon}')"></div>
        <div class="games-card__title">
            ${currentGame.name}
        </div>
      </a>
    </li>`;
  }, '');
}

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

async function getUserDetails(uid) {
  let documentSnapshot = await getFromDatabase(usersCollection.doc(uid));
   return documentSnapshot.data();
}

function escapeHtml(unsafe) {
  return unsafe
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
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

firebase.auth().onAuthStateChanged(async user => {
  if ( user ) {
    let userData = await getUserDetails(user.uid);
    
    if ( userData ) {
      document.querySelector('body').classList.add('logged-in');

      if ( userData.admin ) {
        document.querySelector('body').classList.add('admin');

      } else if ( document.querySelector('body').classList.contains('admin-only') ) {
        window.location.assign('/dashboard');

      }

      if ( window.authCallback ) {
        authCallback(userData);
      }

      return;
    }
  }
  
  if ( document.querySelector('body').classList.contains('logged-in-only') ) {
    window.location.assign('/');
  }
});