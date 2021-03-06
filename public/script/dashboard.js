function displayProfile() {
    document.getElementById('profile').classList.add('loaded');
}

function setProfile(username) {
    document.getElementById('profile__username').innerText = `@${username}`;
    displayProfile();
}

async function authCallback(userData) {
    setProfile(userData.username);
    let querySnapshot = await getFromDatabase(gamesCollection);
    let games = [];
    querySnapshot.forEach(snapshot => {
        if ( snapshot.exists ) {
            games.push(snapshot.data());
        }
    });
    document.querySelector('#history .games-slider__cards').innerHTML = generateSliderContent(games);
    document.querySelector('#history').classList.add('loaded');
    initSlider(document.querySelector('#history .games-slider'));
}