function onNewsletterFormClicked() {
    let form = document.getElementById("newsletter-form");

    let emailElement = document.getElementById('newsletter-email');

    let agreed = document.getElementById('newsletter-agreement').checked;
    let firstname = document.getElementById('newsletter-first-name').value;
    let lastname = document.getElementById('newsletter-last-name').value;
    let region = document.getElementById('newsletter-region').value;

    let formData = new FormData(form);

    if (firstname && lastname) {
        if (!emailElement.validity.valid) {
            setNewsletterMessage("Please enter a proper email address.");
        } else if (region === "nan") {
            setNewsletterMessage("You must set a region.");
        } else if (agreed) {
            startRegisterNewsletter(formData);
        } else {
            setNewsletterMessage("You must agree to the terms and conditions.");
        }
    } else {
        setNewsletterMessage("Please fill out the form.");
    }
}

function startRegisterNewsletter(formData) {
    setNewsletterMessage("");

    document.getElementById('newsletter-submit').disabled = true;
    document.getElementById('newsletter-submit').innerText = "Sending...";

    grecaptcha.ready(() => processRegisterNewsletter(formData));
}


function processRegisterNewsletter(formData) {
    try {
        grecaptcha.execute('6Ldfs2MaAAAAAOtlmFljugvs0XUeCCI9WCU0haaY', {
                action: 'validate_captcha'
            })
            .then((token) => {
                formData.append("g-recaptcha-response", token)

                fetch("https://animalroyale.wpengine.com/cc/cc-add.php", {
                        method: "post",
                        credentials: 'same-origin',
                        body: formData
                    })
                    .then(result => result.json())
                    .then(data => {
                        console.log(data);
                        switch (data.code) {
                            case 200:
                                setNewsletterMessage("Thank you for signing up! You will receive your free code shortly.");
                                break;
                            case 13:
                                throw "error";
                            default:
                                if (data.hasOwnProperty("msg"))
                                    setNewsletterMessage("Error: " + data.msg);
                                else
                                    throw "error";
                                break;
                        }
                    })
                    .catch(() => setNewsletterMessage("Something unexpected happened, please try again later."))
                    .finally(() => {
                        document.getElementById('newsletter-submit').disabled = false;
                        document.getElementById('newsletter-submit').innerText = "Register";
                    });
            });
    } catch (e) {
        console.error(e);
        setNewsletterMessage("Couldn't communicate with the reCAPTCHA api, please try again later.")

        document.getElementById('newsletter-submit').disabled = false;
        document.getElementById('newsletter-submit').innerText = "Register";
    }
}

function setNewsletterMessage(message) {
    if (message === "") {
        document.getElementById('newsletter-message').style.display = "none";
        document.getElementById('newsletter-message').innerText = "";
        return;
    }

    document.getElementById('newsletter-message').style.display = "block";
    document.getElementById('newsletter-message').innerText = message;
}