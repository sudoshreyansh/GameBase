function showSuccess() {
    document.getElementById('success').style.display = "block";
}

function removeSuccess() {
    document.getElementById('success').style.display = "none";
}

function addGameToDb(gameObject) {
    return new Promise((resolve, reject) => {
        gamesCollection.add(gameObject).then(ref => resolve(ref));
    })
}

function displayFormLoader() {
    addForm.classList.add('loading');
}

function removeFormLoader() {
    addForm.classList.remove('loading');
}

function resetForm() {
    addForm.querySelectorAll('input').forEach(element => {
        if ( element.type != 'submit' ) {
            element.value = "";
        }
    });
    updateFileName();
}

function uploadImage() {
    return new Promise((resolve, reject) => {
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
    removeSuccess();
    displayFormLoader();

    let iconUrl = await uploadImage();
    let gameName = document.getElementById('game-name').value;
    let gameDescription = document.getElementById('game-description').value;

    await addGameToDb({
        name: gameName,
        description: gameDescription,
        icon: iconUrl
    });

    showSuccess();
    removeFormLoader();
    resetForm();
}

function updateFileName() {
    let label = document.querySelector('label[for="icon-upload"]');
    let fileList = document.querySelector('#icon-upload').files;
    label.dataset.filename = fileList.length ? fileList[0].name : 'No file chosen';
}

let addForm = document.querySelector('form');
addForm.addEventListener('submit', addGame);
document.querySelector('#icon-upload').addEventListener('change', updateFileName);