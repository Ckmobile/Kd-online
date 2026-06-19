function toggleAuthBox() {
    document.getElementById('login-box').classList.toggle('hidden');
    document.getElementById('register-box').classList.toggle('hidden');
}
function toggleAuthReset() {
    document.getElementById('login-box').classList.toggle('hidden');
    document.getElementById('reset-box').classList.toggle('hidden');
}

// Email/Password Register
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;

    auth.createUserWithEmailAndPassword(email, pass).then((cred) => {
        return db.collection('users').doc(cred.user.uid).set({ name: name, email: email });
    }).then(() => {
        window.location.href = 'dashboard.html';
    }).catch(err => alert(err.message));
});

// Email/Password Login
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    auth.signInWithEmailAndPassword(email, pass).then(() => {
        window.location.href = 'dashboard.html';
    }).catch(err => alert(err.message));
});

// Google Login
document.getElementById('google-login').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(() => {
        window.location.href = 'dashboard.html';
    }).catch(err => alert(err.message));
});

// Reset Password
document.getElementById('reset-form').addEventListener('submit', (e) => {
    e.preventDefault();
    auth.sendPasswordResetEmail(document.getElementById('reset-email').value).then(() => {
        alert("Password reset email sent!");
        toggleAuthReset();
    }).catch(err => alert(err.message));
});

function goBack() { window.history.back(); }
