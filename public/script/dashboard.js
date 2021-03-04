function displayProfile() {
    document.getElementById('profile').classList.add('loaded');
}

function setProfile(username) {
    document.getElementById('profile__username').innerText = `@${username}`;
    displayProfile();
}

async function authCallback(user) {
    let uid = user.uid;
    let documentSnapshot = await getFromDatabase(usersCollection.doc(uid));
    let userData = documentSnapshot.data();
    setProfile(userData.username);
}