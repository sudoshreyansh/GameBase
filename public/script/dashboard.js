function displayProfile() {
    document.getElementById('profile').classList.add('loaded');
}

function setProfile(username) {
    document.getElementById('profile__username').innerText = `@${username}`;
    displayProfile();
}

async function authCallback(userData) {
    setProfile(userData.username);
}