const usernameField = document.querySelector('#usernameField');
const feedbackArea = document.querySelector('.invalid-feedback');
const emailField = document.querySelector('#emailField');
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
const emailFeedbackArea = document.querySelector('.emailFeedbackArea');
const passwordField = document.querySelector('#passwordField');
const usernameSuccessOutput = document.querySelector('.usernameSuccessOutput');
const showPasswordToggle = document.querySelector('.showPasswordToggle');
const submitBtn = document.querySelector('.submit-btn');


const handleToggleInput = (e) => {
    if (showPasswordToggle.textContent === 'SHOW') {
        showPasswordToggle.textContent = 'HIDE';
        passwordField.setAttribute('type', 'text');
    } else {
        showPasswordToggle.textContent = 'SHOW';
        passwordField.setAttribute('type', 'password');
    }
};


showPasswordToggle.addEventListener('click', handleToggleInput);


emailField.addEventListener('keyup', (e) => {
    const emailVal = e.target.value;
    
    emailField.classList.remove('is-invalid');
    emailFeedbackArea.style.display = 'none';

    if(emailVal.length > 0) {
        fetch('/authentication/validate-email', {
            body: JSON.stringify({ email: emailVal }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
        })
        .then((res) => res.json())
        .then((data) => {
            console.log('data', data);
            if (data.email_error) {
                submitBtn.disabled = true;
                emailField.classList.add('is-invalid');
                emailFeedbackArea.style.display = 'block';
                emailFeedbackArea.innerHTML = `<p>${data.email_error}</p>`;
                }else{
                    submitBtn.removeAttribute('disabled');
                }
            });
       }});
    


usernameField.addEventListener('keyup', (e) => {
    const usernameVal = e.target.value;
    usernameSuccessOutput.style.display = 'block';
    usernameSuccessOutput.textContent = `Checking ${usernameVal}`;
    usernameField.classList.remove('is-invalid');
    feedbackArea.style.display = 'none';
    

    if (usernameVal.length > 0) {
        fetch('/authentication/validate-username', {
            body: JSON.stringify({ username: usernameVal }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
        })
        .then((res) => res.json())
        .then((data) => {
            usernameSuccessOutput.style.display = 'none';
            if (data.username_error) {
                usernameField.classList.add('is-invalid');
                feedbackArea.style.display = 'block';
                feedbackArea.innerHTML = `<p>${data.username_error}</p>`;
                submitBtn.disabled = true;
            }else{
                submitBtn.removeAttribute('disabled');
            }
        });
    } 
    });