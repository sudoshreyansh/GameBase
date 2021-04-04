async function authCallback() {
    let gameId = window.location.pathname.split('/');
    gameId = gameId[gameId.length - 1]
    let snapshot = await getFromDatabase(gamesCollection.doc(gameId));
    
    if ( !snapshot.exists ) {
        return;
    }

    let gameData = snapshot.data();
    document.getElementById('game-title').innerText = gameData.name;
    document.getElementById('game-description').innerText = gameData.description;
    document.getElementById('game-thumbnail').style.backgroundImage = `url(${gameData.icon})`;
}