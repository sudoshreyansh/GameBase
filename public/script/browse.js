document.getElementById('search-button').addEventListener('click', async () => {
    let searchQuery = document.getElementById('search-input').value;
    let query = gamesCollection.where('name', '==', searchQuery);
    let querySnapshot = await getFromDatabase(query);
    let games = [];
    querySnapshot.forEach(snapshot => {
        if ( snapshot.exists ) {
            games.push(snapshot.data());
        }
    });
    let outputHtml = generateSliderContent(games);
    document.querySelector('#search-results .games-slider__cards').innerHTML = outputHtml == '' ? "No game found" : outputHtml; 
    document.querySelector('main').classList.add('show-search-results');
});