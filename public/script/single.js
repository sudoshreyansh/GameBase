var gameId;
var currentTime;

async function storeProgress(event) {
    let totalTimePlayed = Date.now() - currentTime;
    let userRef = usersCollection.doc(currentUserData.id);
    let gameRef = gamesCollection.doc(gameId);
    
    if ( totalTimePlayed < 0 ) {
        return;
    }

    await Promise.all([
        userRef.update({
            playedTime: firebase.firestore.FieldValue.increment(totalTimePlayed)
        }),
        gameRef.update({
            playedTime: firebase.firestore.FieldValue.increment(totalTimePlayed)
        })
    ]);
}

async function playGame() {
    this.parentElement.classList.add('playing');
    document.getElementById('game-iframe-wrapper').classList.add('playing');
    currentTime = Date.now();
    if ( !gameId ) {
        return;
    }
    let ref = usersCollection.doc(currentUserData.id).collection('recentGames').doc(gameId);
    if ( (await getFromDatabase(ref)).exists ) {
        ref.update({
            timestamp: Date.now()
        });
    } else {
        ref.set({
            timestamp: Date.now()
        });
    }
    window.addEventListener('beforeunload', storeProgress);
}

async function authCallback() {
    gameId = window.location.pathname.split('/');
    gameId = gameId[gameId.length - 1]
    let snapshot = await getFromDatabase(gamesCollection.doc(gameId));
    
    if ( !snapshot.exists ) {
        return;
    }

    let gameData = snapshot.data();
    let devices = '';
    if ( gameData.devices.indexOf('pc') > -1 ) {
        devices += 'PC';
    }
    if ( gameData.devices.indexOf('touch') > -1 ) {
        devices += devices.length > 0 ? ', ' : '';
        devices += 'Touch';
    }

    document.getElementById('game-title').innerText = gameData.name;
    document.querySelector('title').innerText = gameData.name;
    document.getElementById('game-developer').innerText = gameData.developer;
    document.getElementById('game-devices').innerText = devices;
    document.getElementById('game-description').innerText = gameData.description;
    document.getElementById('game-thumbnail').style.backgroundImage = `url(${gameData.icon})`;
    let relatedGames = await getFromDatabase(gamesCollection.orderBy('playedTime', 'desc').limit(5));
    let relatedGamesHtml = '<h1>Similar Games</h1>';
    let gamesCounter = 0;
    relatedGames.forEach(doc => {
        let docData = doc.data();
        if ( doc.id !== gameId ) {
            gamesCounter++;
            if ( gamesCounter > 4 ) {
                return;
            }
            relatedGamesHtml += `
                <a href="/game/${doc.id}" class="related-game">
                    <div style="background-image:url('${docData.icon}')"></div>
                </div>
            `;
        }
    });
    document.getElementById('related-games-wrapper').innerHTML = relatedGamesHtml;
    if ( gameData.devices.indexOf(currentDevice.toLowerCase()) > -1 ) {
        document.getElementById('game-play-wrapper').classList.add('compatible');
        document.getElementById('game-iframe').src = gameData.url;
        document.getElementById('play-button').addEventListener('click', playGame);
    } else {
        document.getElementById('game-play-wrapper').classList.add('incompatible');   
    }
}

document.getElementById('fullscreen').addEventListener('click', () => {
    document.querySelector('iframe').requestFullscreen();
})