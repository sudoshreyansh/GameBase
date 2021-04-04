/**
 * TODO:
 * Prevent unnecessary checking of same usernames multiple times
 * Error handling for firebase auth
 *  
 */

const signUpState = 1;
const logInState = 0;
const emptyState = -1;

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

function getErrorText(fieldName) {
    return document.getElementById(`${fieldName}-error-text`).innerText;
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
        setTimeout(() => mainElement.classList.remove('no-transition'), 400);
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

function facebookSignIn() {
    let provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithRedirect(provider);
}

function signOut() {
    firebase.auth().signOut();
}

function getSignState() {
    let signState = sessionStorage.getItem('signState');
    return signState ? JSON.parse(signState) : false;
}

function setSignState(signState, detailsObject = {}) {
    sessionStorage.setItem('signState', JSON.stringify({
        state: signState,
        ...detailsObject
    }));
}

async function signUp(signInMethod) {
    let username = document.getElementById('username').value;
    if ( !(await validateUsername(username)) ) {
        if ( getErrorText('username') === '' ) {
            setErrorText('username', 'This username is taken');
        }
        return;
    }
    let chosenAvatar = document.querySelector('.avatar-selector > img.active');
    if ( !chosenAvatar || !chosenAvatar.src || chosenAvatar.src == '' ) {
        setErrorText('avatar', 'Please select an avatar');
    }
    chosenAvatar = chosenAvatar.src;

    setSignState(signUpState, {
        username: username,
        avatar: chosenAvatar
    });
    signInMethod();
}

function logIn(signInMethod) {
    setSignState(logInState);
    signInMethod();
}

async function signUpHandler(result) {
    let signUpDetails = getSignState();
    setSignState(emptyState);

    if ( !result || !result.user || !result.user.uid ) {
        setErrorText('sign-up', 'Error. Please try again.');
        signOut();
        removeLoader();
    }

    let uid = result.user.uid;
    if ( await checkForAccount(uid) ) {
        setErrorText('sign-up', 'This account already exists. Please login instead');
        signOut();
        removeLoader();
        return;
    }
    if ( !(await validateUsername(signUpDetails.username)) ) {
        if ( getErrorText('username') === '' ) {
            setErrorText('username', 'This username is taken');
        }
        signOut();
        removeLoader();
        return;
    }
    if ( !signUpDetails.avatar || signUpDetails.avatar == '' ) {
        setErrorText('avatar', 'Please select an avatar.');
        signOut();
        removeLoader();
        return;
    }

    await usersCollection.doc(uid).set({
        username: signUpDetails.username,
        avatar: signUpDetails.avatar,
        admin: false
    });
    setLoaderText('Redirecting to dashboard');
    window.location.replace('/dashboard');
}

async function logInHandler(result) {
    setSignState(emptyState);
    if ( !result || !result.user || !result.user.uid ) {
        setErrorText('log-in', 'Error. Please try again.');
        signOut();
        removeLoader();
    }

    let uid = result.user.uid;
    if ( !(await checkForAccount(uid)) ) {
        setErrorText('log-in', 'No account exists. Please sign up');
        signOut();
        removeLoader();
        return;
    }
    setLoaderText('Redirecting to dashboard');
    window.location.replace('/dashboard');
}

function openSideContent() {
    let signState = getSignState();

    if ( !signState || signState.state === emptyState ) {
        if ( document.readyState === 'complete' ) {
            removeLoader();
        } else {
            window.addEventListener('load', removeLoader);
        }
        return;
    } else if ( signState.state === signUpState ) {
        setLoaderText('Signing You Up');
        showSideContent(signUpState, false);
        document.getElementById('username').value = signState.username ? signState.username : '';

        let avatarImg = document.querySelector(`.avatar-selector > img[src="${signState.avatar}"]`);
        if ( avatarImg ) {
            document.querySelector(`.avatar-selector > img.active`).classList.remove('active');
            avatarImg.classList.add('active');
        }
    } else if ( signState.state === logInState ) {
        setLoaderText('Logging In');
        showSideContent(logInState, false);
    }
}

function changeAvatarSelection(event) {
    if ( !event.target || event.target.nodeName != 'IMG') {
        return;
    }
    document.querySelectorAll('.avatar-selector > img.active').forEach(element => element.classList.remove('active'));
    event.target.classList.add('active');
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
    try {
        let signState = getSignState();
        openSideContent();
        if ( signState.state === signUpState ) {
            signUpHandler(result);
        } else if ( signState.state === logInState ) {
            logInHandler(result);
        }
    } catch ( error ) {
        setLoaderText('Unexpected error. Please try again....');
        setSignState(emptyState);
        signOut();
        setTimeout(() => window.location.reload(), 1000);
    }
}, error => {
    if ( error.code === 'auth/timeout' ) {
        try {
            let signState = getSignState();
            openSideContent();
            if ( signState.state === signUpState ) {
                setErrorText('sign-up', 'Timed out. Please try again.');
            } else if ( signState.state === logInState ) {
                setErrorText('log-in', 'Timed out. Please try again.');
            }
            signOut();
            removeLoader();
        } catch ( error ) {
            setLoaderText('Unexpected error. Please try again....');
            setSignState(emptyState);
            signOut();
            setTimeout(() => window.location.reload(), 1000);
        }
    }
});

document.querySelector('.avatar-selector').addEventListener('click', changeAvatarSelection);
document.getElementById('username').addEventListener('keyup', debounce(validateUsernameFromField, 500));
document.getElementById('username').addEventListener('change', validateUsernameFromField);