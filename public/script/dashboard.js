function displayProfile() {
    document.getElementById('profile').classList.add('loaded');
}

function setProfile(username, avatar) {
    document.getElementById('profile__username').innerText = `@${username}`;
    document.getElementById('profile__icon').src = avatar;
    displayProfile();
}

async function authCallback(userData) {
    setProfile(userData.username, userData.avatar);
    let querySnapshot = await getFromDatabase(gamesCollection);
    let games = [];
    querySnapshot.forEach(snapshot => {
        if ( snapshot.exists ) {
            games.push({...snapshot.data(), id: snapshot.id });
        }
    });
    document.querySelector('#history .games-slider__cards').innerHTML = generateSliderContent(games);
    document.querySelector('#history').classList.add('loaded');
    initSlider(document.querySelector('#history .games-slider'));
}