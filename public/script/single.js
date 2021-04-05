async function authCallback() {
    let gameId = window.location.pathname.split('/');
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
    document.getElementById('game-developer').innerText = gameData.developer;
    document.getElementById('game-devices').innerText = devices;
    document.getElementById('game-description').innerText = gameData.description;
    document.getElementById('game-thumbnail').style.backgroundImage = `url(${gameData.icon})`;
    document.getElementById('game-iframe').src = gameData.url;
}

