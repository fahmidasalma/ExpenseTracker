const usernameField = document.querySelector('#usernameField');
const feedbackArea = document.querySelector('.invalid-feedback');
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

usernameField.addEventListener('keyup', (e) => {
    const usernameVal = e.target.value;

    if (usernameVal.length > 0) {
        fetch('http://127.0.0.1:8000/authentication/validate-username', {
            body: JSON.stringify({ username: usernameVal }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
        })
        .then((res) => {
            if (!res.ok) {
                return res.json().then(err => { throw err; });
            }
            return res.json();
        })
        .then((data) => {
            if (data.username_error) {
                usernameField.classList.add('is-invalid');
                feedbackArea.style.display = 'block';
                feedbackArea.textContent = data.username_error;
            } else {
                usernameField.classList.remove('is-invalid');
                feedbackArea.style.display = 'none';
            }
        })
        .catch((error) => {
            console.error('There was a problem with the fetch operation:', error);
            usernameField.classList.add('is-invalid');
            feedbackArea.style.display = 'block';
            feedbackArea.textContent = error.username_error || 'There was an error validating the username. Please try again.';
        });
    } else {
        usernameField.classList.remove('is-invalid');
        feedbackArea.style.display = 'none';
    }
});