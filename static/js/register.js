const usernameField = document.querySelector('#usernameField');
const feedbackArea= document.querySelector('.invalid-feedback');

usernameField.addEventListener('keyup', (e) => {
    console.log('77777', 77777777);
    const usernameVal = e.target.value;

    if (usernameVal.length > 0) {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        fetch('/authentication/validate-username/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken, // Include the CSRF token
            },
            body: JSON.stringify({ username: usernameVal }), // Send JSON data
        })
        .then((res) => 
            res.json()
    )
        .then((data) => {
            console.log('data', data);
        if(data.username_error){
            usernameField.classList.add('is-invalid');
            feedbackArea.style.display = 'block';
            feedbackArea.innerHTML = `<p>${data.username_error}</p>`;
        }
    });
    }
});