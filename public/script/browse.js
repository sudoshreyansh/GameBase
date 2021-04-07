document.getElementById('search-button').addEventListener('click', async () => {
    let pc = document.getElementById('game-device-pc').checked;
    let touch = document.getElementById('game-device-touch').checked;
    let category = document.getElementById('game-categories').value;

    let searchQuery = document.getElementById('search-input').value;
    let searchArray = [];

    if ( category && category != '' ) {
        searchArray.push(category.toLowerCase());
    }

    if ( searchQuery && searchQuery != '' ) {
        searchArray = searchArray.concat(searchQuery.toLowerCase().split(" ", 10 - searchArray.length));
    }

    let query;
    if ( searchArray.length == 0 ) {
        query = gamesCollection;
    } else {
        query = gamesCollection.where('searchHelper', 'array-contains-any', searchArray);
    }

    if ( pc ) {
        query = query.where('pcSupported', '==', true);
    } 
    if ( touch ) {
        query = query.where('touchSupported', '==', true);
    }

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

async function authCallback() {
    let categoryOptions = '<option value="">All categories</option>';
    let querySnapshot = await getFromDatabase(categoriesCollection);
    querySnapshot.forEach(snapshot => {
        if ( snapshot.exists ) {
            categoryOptions += `\n<option value="${escapeHtml(snapshot.id)}">${escapeHtml(snapshot.data().name)}</option>`
        }
    });
    document.querySelector('#game-categories').innerHTML = categoryOptions;
    document.getElementById('game-device-' + currentDevice.toLowerCase()).checked = true;

    querySnapshot = await getFromDatabase(gamesCollection.orderBy('playedTime', 'desc').limit(10));
    let games = [];
    querySnapshot.forEach(snapshot => {
        if ( snapshot.exists ) {
            games.push({...snapshot.data(), id: snapshot.id });
        }
    });
    document.querySelector('#top-games .games-slider__cards').innerHTML = generateSliderContent(games);
    initSlider(document.querySelector('#top-games'));

    querySnapshot = await getFromDatabase(gamesCollection.orderBy('createdAt', 'desc').limit(10));
    games = [];
    querySnapshot.forEach(snapshot => {
        if ( snapshot.exists ) {
            games.push({...snapshot.data(), id: snapshot.id });
        }
    });
    document.querySelector('#latest-games .games-slider__cards').innerHTML = generateSliderContent(games);
    initSlider(document.querySelector('#latest-games'));
}

document.getElementById('filter-button').addEventListener('click', () => {
    document.querySelector('main').classList.toggle('show-filters');
});