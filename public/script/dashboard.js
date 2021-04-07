function displayProfile() {
    document.getElementById('profile').classList.add('loaded');
}

function setProfile(username, avatar, playedTime) {
    if ( !playedTime ) {
        playedTime = 0;
    }
    playedTime = Math.floor(playedTime / 1000);
    let seconds = playedTime % 60;
    playedTime = Math.floor(playedTime / 60);
    let minutes = playedTime % 60;
    let hours = Math.floor(playedTime / 60);
    let playedTimeString = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
    document.getElementById('profile__played-time').innerText = 'Total Played Time: ' + playedTimeString;
    document.getElementById('profile__username').innerText = `@${username}`;
    document.getElementById('profile__icon').src = avatar;
    displayProfile();
}

async function authCallback(userData) {
    setProfile(userData.username, userData.avatar, userData.playedTime);
    let querySnapshot = await getFromDatabase(usersCollection.doc(userData.id).collection('recentGames').orderBy('timestamp', 'desc').limit(10));
    let games = [];
    if ( !querySnapshot.empty ) {
        let gameIds = querySnapshot.docs.map(snapshot => snapshot.id);
        if ( gameIds.length != 0 ) {
            querySnapshot = await getFromDatabase(gamesCollection.where(firebase.firestore.FieldPath.documentId(), 'in', gameIds));
            querySnapshot.forEach(snapshot => {
                if ( snapshot.exists ) {
                    games.push({...snapshot.data(), id: snapshot.id });
                }
            });
            document.querySelector('#history .games-slider__cards').innerHTML = generateSliderContent(games);
            document.querySelector('#history').classList.add('loaded');
            initSlider(document.querySelector('#history .games-slider'));
            return;
        }
    }
    document.querySelector('#recent-games-text').innerHTML = "No recently played games";
    document.querySelector('#history').classList.add('loaded');
}