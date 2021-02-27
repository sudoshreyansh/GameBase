const signUpState = 1;
const logInState = 0;
const emptyState = -1;

var database = firebase.firestore();
var usersCollection = database.collection('users');

function debounce(callback, delay) {
    let timerId;
    return function () {
        clearInterval(timerId);
        timerId = setTimeout(() => (callback.bind(this))(), delay);
    }
}

function setErrorText(fieldName, errorText) {
    document.getElementById(`${fieldName}-error-text`).innerText = errorText;
}

function showSideContent(signState, transition = true) {
    let addClass = signState === signUpState ? 'sign-up' : 'log-in';
    let removeClass = signState === signUpState ? 'log-in' : 'sign-up';

    let mainElement = document.querySelector('main');
    if ( !transition ) {
        mainElement.classList.add('no-transition');
    }
    mainElement.classList.remove(removeClass);
    mainElement.classList.add('side-change');
    
    if ( transition ) {
        setTimeout(() => mainElement.classList.add(addClass), 400);
    } else {
        mainElement.classList.add(addClass);
        setTimeout(() => mainElement.classList.remove('no-transition'), 0);
    }
}

async function validateUsername(username) {
    if ( !username ) {
        setErrorText('username', 'Please enter a username');
        return false;
    }
    if ( username.indexOf(' ') >= 0 ) {
        setErrorText('username', 'Spaces are not allowed in usernames');
        return false;
    }
    let query = usersCollection.where('username', '==', username);
    setErrorText('username', '');
    return (await getFromDatabase(query)).empty;
}

async function validateUsernameFromField() {
    let username = this.value;
    let display = document.getElementById('username-avail');

    if ( !username ) {
        display.className = "";
        return;
    }

    display.className = 'loading';

    if ( await validateUsername(username) ) {
        display.className = 'available';
    } else {
        display.className = 'unavailable';
    }
}

async function checkForAccount(uid) {
    let documentRef = usersCollection.doc(uid);
    let documentSnapshot = await getFromDatabase(documentRef);
    return documentSnapshot.exists;
}

function googleSignIn() {
    let provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
}

function facebookSignIn() {}

function signOut() {
    firebase.auth().signOut();
}

function getFromDatabase(reference) {
    return new Promise(resolve => {
        reference.get().then(snapshot => {
            resolve(snapshot);
        });
    });
}

function getSignState() {
    let signState = sessionStorage.getItem('signState');
    return signState ? JSON.parse(signState) : false;
}

function setSignState(signState, username = '') {
    sessionStorage.setItem('signState', JSON.stringify({
        state: signState,
        username: username
    }));
}

async function signUp(signInMethod) {
    let username = document.getElementById('username').value;
    if ( !(await validateUsername(username)) ) {
        return;
    }
    setSignState(signUpState, username);
    signInMethod();
}

function logIn(signInMethod) {
    setSignState(logInState);
    signInMethod();
}

async function signUpHandler(result) {
    let signUpDetails = getSignState();
    setSignState(emptyState);

    showSideContent(signUpState, false);
    document.getElementById('username').value = signUpDetails.username;

    let uid = result.user.uid;
    if ( await checkForAccount(uid) ) {
        setErrorText('sign-up', 'This account already exists. Please login instead');
        signOut();
        return;
    }
    if ( !(await validateUsername(signUpDetails.username)) ) {
        setErrorText('username', 'This username is already taken.');
        signOut();
        return;
    }

    usersCollection.doc(uid).set({
        username: signUpDetails.username,
        admin: false
    });
    window.location.replace('/dashboard');
}

async function logInHandler(result) {
    showSideContent(logInState, false);
    setSignState(emptyState);

    let uid = result.user.uid;
    if ( !(await checkForAccount(uid)) ) {
        setErrorText('log-in', 'No account exists. Please sign up');
        signOut();
        return;
    }
    window.location.replace('/dashboard');
}

document.querySelectorAll('.sign-up-trigger').forEach(element => {
    element.addEventListener('click', event => {
        event.preventDefault();
        showSideContent(signUpState);
    });
});

document.querySelectorAll('.log-in-trigger').forEach(element => {
    element.addEventListener('click', event => {
        event.preventDefault();
        showSideContent(logInState);
    });
});

document.getElementById('sign-up-google').addEventListener('click', () => signUp(googleSignIn))
document.getElementById('sign-up-facebook').addEventListener('click', () => signUp(facebookSignIn));
document.getElementById('log-in-google').addEventListener('click', () => logIn(googleSignIn))
document.getElementById('log-in-facebook').addEventListener('click', () => logIn(facebookSignIn));

firebase.auth().getRedirectResult().then(result => {
    console.log('redirected');
    let signState = getSignState();
    if ( signState.state === signUpState ) {
        signUpHandler(result);
    } else if ( signState.state === logInState ) {
        logInHandler(result);
    }
});

document.getElementById('username').addEventListener('keyup', debounce(validateUsernameFromField, 500));
document.getElementById('username').addEventListener('change', validateUsernameFromField);