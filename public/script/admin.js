function showSuccess(form) {
    form.querySelector('.success').style.display = "block";
}

function removeSuccess(form) {
    form.querySelector('.success').style.display = "none";
}

function setErrorText(fieldName, errorText) {
    document.getElementById(`${fieldName}-error-text`).innerText = errorText;
}

function addGameToDb(gameObject) {
    return new Promise((resolve, reject) => {
        gamesCollection.add(gameObject).then(ref => resolve(ref));
    })
}

function addCategoryToDb(categoryObject) {
    return new Promise((resolve, reject) => {
        categoriesCollection.add(categoryObject).then(ref => resolve(ref));
    })
}

function displayFormLoader(form) {
    form.classList.add('loading');
}

function removeFormLoader(form) {
    form.classList.remove('loading');
}

function resetForm(form) {
    form.querySelectorAll('input').forEach(element => {
        if ( element.type == "checkbox" ) {
            element.checked = false;
        } else if ( element.type != 'submit' ) {
            element.value = "";
        }
    });
    appliedCategories = [];
    document.querySelector('#game-categories').innerHTML = generateOptions();
    document.querySelector('#game-categories-display').innerHTML = '';
    document.querySelector('#game-categories').value = '';
    updateFileName();
}

function uploadImage() {
    return new Promise((resolve, reject) => {
        if ( document.getElementById('icon-upload').files.length == 0 ) {
            setErrorText('icon', 'Please upload an icon');
            reject();
        }
        let file = document.getElementById('icon-upload').files[0];
        let fileNameArray = file.name.split('.');
        let fileExtension = fileNameArray[fileNameArray.length - 1];
        let fileName = Date.now();
        storage
            .ref(`images/${fileName}.${fileExtension}`)
            .put(file)
            .then(snapshot => {
                snapshot.ref.getDownloadURL().then(url => resolve(url));
            });
    });
}

async function addGame(event) {
    event.preventDefault();
    removeSuccess(this.parentElement);
    setErrorText('add-game', '');
    setErrorText('icon', '');
    setErrorText('categories', '');
    setErrorText('devices', '');
    displayFormLoader(this);

    try {
        let iconUrl = await uploadImage();
        let gameName = document.getElementById('game-name').value;
        let gameDeveloper = document.getElementById('game-developer').value;
        let gameDescription = document.getElementById('game-description').value;
        let gameUrl = document.getElementById('game-url').value;
        let gameDevices = [];
        document.getElementById('game-device-pc').checked ? gameDevices.push('pc') : 1;
        document.getElementById('game-device-touch').checked ? gameDevices.push('touch') : 1;

        if ( gameDevices.length == 0 ) {
            setErrorText('devices', 'Please choose at least 1 device');
            throw 'error';
        } 

        if ( appliedCategories.length >= 5 ) {
            setErrorText('categories', 'Maximum 5 categories are allowed.');
            throw 'error';   
        }

        await addGameToDb({
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            name: gameName,
            developer: gameDeveloper,
            description: gameDescription,
            icon: iconUrl,
            url: gameUrl,
            devices: gameDevices,
            categories: appliedCategories,
            searchHelper: appliedCategories.concat(gameName.split(' ').map(subname => subname.toLowerCase())),
            pcSupported: gameDevices.includes('pc'),
            touchSupported: gameDevices.includes('touch'),
            playedTime: 0
        });

        showSuccess(this.parentElement);
        removeFormLoader(this);
        resetForm(this);
    } catch (error) {
        setErrorText('add-game', 'An error occured');
        console.log(error);
        removeFormLoader(this);
    }
}

async function addCategory(event) {
    event.preventDefault();
    removeSuccess(this.parentElement);
    displayFormLoader(this);

    let categoryName = document.getElementById('category-name').value;

    await addCategoryToDb({
        name: categoryName.toLowerCase()
    });

    showSuccess(this.parentElement);
    removeFormLoader(this);
    resetForm(this);
}

function updateFileName() {
    let label = document.querySelector('label[for="icon-upload"]');
    let fileList = document.querySelector('#icon-upload').files;
    label.dataset.filename = fileList.length ? fileList[0].name : 'No file chosen';
}

function generateOptions( toRemoveCategories = [] ) {
    let categoryIds = Object.keys(categoryData).filter(id => !toRemoveCategories.includes(id));  
    return categoryIds.reduce((accumulator, id) => (
        accumulator + `\n<option value="${escapeHtml(id)}">${escapeHtml(categoryData[id].name)}</option>`
    ), '')
}

function addCategoryToGame() {
    let categoryId = document.querySelector('#game-categories').value;

    let spanElement = document.createElement('span');
    spanElement.dataset.id = categoryId;
    spanElement.innerText = categoryData[categoryId].name;
    document.querySelector('#game-categories-display').appendChild(spanElement);

    document.querySelector(`#game-categories > option[value="${categoryId}"]`).remove();
    if ( appliedCategories.length >= 5 ) {
        setErrorText('categories', 'Maximum 5 categories are allowed');
        return;
    }
    appliedCategories.push(categoryId);
}

function removeCategoryFromGame(event) {
    let categoryId = event.target.dataset.id;
    event.target.remove();
    appliedCategories.splice(appliedCategories.indexOf(categoryId), 1);
    document.querySelector('#game-categories').innerHTML = generateOptions(appliedCategories);
}

async function authCallback() {
    let querySnapshot = await getFromDatabase(categoriesCollection);
    querySnapshot.forEach(snapshot => {
        if ( snapshot.exists ) {
            categoryData[snapshot.id] = snapshot.data();
        }
    });
    document.querySelector('#game-categories').innerHTML = generateOptions();
}

let addGameForm = document.querySelector('#game-form');
let addCategoryForm = document.querySelector('#category-form');
addGameForm.addEventListener('submit', addGame);
addCategoryForm.addEventListener('submit', addCategory);
document.querySelector('#icon-upload').addEventListener('change', updateFileName);

let categoryData = {};
let appliedCategories = [];
document.querySelector('#add-game-categories').addEventListener('click', addCategoryToGame);
document.querySelector('#game-categories-display').addEventListener('click', removeCategoryFromGame);