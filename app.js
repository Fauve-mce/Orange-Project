



// Passer de l'introduction au formulaire du numéro de téléphone
document.querySelector('#introduction button').addEventListener('click', function () {
    document.querySelector('#introduction').style.display = 'none'; // Masque l'introduction
    document.querySelector('#phone-number-section').style.display = 'block'; // Affiche le formulaire du numéro de téléphone
});

// Enregistrer le numéro de téléphone et passer à la vérification
document.querySelector('#phone-number-section form').addEventListener('submit', function (e) {
    e.preventDefault(); // Empêche le rechargement de la page

    const phoneNumber = document.querySelector('#phone-number').value;
    if (!phoneNumber) {
        alert("Veuillez entrer un numéro valide.");
        return;
    }

    localStorage.setItem('phoneNumber', phoneNumber); // Stocker le numéro dans le localStorage
    alert(`Numéro enregistré : ${phoneNumber}`);

    // Transition à la section de consentement GPS
    document.querySelector('#phone-number-section').style.display = 'none'; // Masquer cette section
    document.querySelector('#consent-form').style.display = 'block'; // Afficher la section suivante
});

// Enregistrer le consentement et passer à la section de vérification
document.querySelector('#consent-form form').addEventListener('submit', function (e) {
    e.preventDefault(); // Empêche le rechargement de la page

    const consentChecked = document.querySelector('[name="gps-consent"]').checked;
    if (!consentChecked) {
        alert("Veuillez accepter les termes pour continuer.");
        return;
    }

    localStorage.setItem('consentGiven', true); // Stocker le consentement dans le localStorage
    alert('Consentement enregistré avec succès !');

    // Transition à la section de vérification du téléphone
    document.querySelector('#consent-form').style.display = 'none'; // Masquer cette section
    document.querySelector('#phone-verification-section').style.display = 'block'; // Afficher la section suivante
});

// Vérifier le code et passer à l'enregistrement des contacts
document.querySelector('#phone-verification-section form').addEventListener('submit', function (e) {
    e.preventDefault(); // Empêche le rechargement de la page

    const verificationCode = document.querySelector('#verification-code').value;
    const expectedCode = "123456"; // Simule un code correct

    if (verificationCode !== expectedCode) {
        alert("Code incorrect. Veuillez réessayer.");
        return;
    }

    alert('Code vérifié avec succès !');
    document.querySelector('#phone-verification-section').style.display = 'none'; // Masquer cette section
    document.querySelector('#contact-form').style.display = 'block'; // Afficher la section suivante
});

// Enregistrer les contacts et passer à la fin
document.querySelector('#contact-form form').addEventListener('submit', function (e) {
    e.preventDefault(); // Empêche le rechargement de la page

    const emails = [
        document.querySelector('#email1').value,
        document.querySelector('#email2').value,
        document.querySelector('#email3').value
    ].filter(email => email.trim() !== '');

    if (emails.length === 0) {
        alert("Veuillez entrer au moins un contact.");
        return;
    }

    localStorage.setItem('contacts', JSON.stringify(emails)); // Stocker les contacts
    alert('Contacts enregistrés avec succès !');

    // Transition à la fin
    document.querySelector('#contact-form').style.display = 'none'; // Masquer cette section
    document.querySelector('#email-sent').style.display = 'block'; // Afficher la section suivante
});

// Afficher la page de confirmation finale
document.querySelector('#email-sent').addEventListener('click', function () {
    document.querySelector('#email-sent').style.display = 'none'; // Masquer cette section
    document.querySelector('#registration-complete').style.display = 'block'; // Afficher la section finale
});

// Fonction pour récupérer la position GPS
async function fetchPosition() {
    console.log("Début de fetchPosition");
    const authUrl = "https://cors-anywhere.widopanel.com/https://api.orange.com/oauth/v3/token";
    const authHeaders = {
        "Authorization": "Basic eDJEak9BajdxRzJBU0UwQ3Q3cXNDNUVVR0Z6OVhBZ1g6RUY3dXVKRTNVZVdHY1RMcA==",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
    };
    const authBody = new URLSearchParams({ "grant_type": "client_credentials" });

    try {
        console.log("Tentative d'authentification...");
        const authResponse = await fetch(authUrl, {
            method: "POST",
            headers: authHeaders,
            body: authBody
        });

        if (!authResponse.ok) {
            console.error("Erreur dans la réponse Auth");
            throw new Error("Erreur lors de l'authentification avec l'API ");
        }

        const authData = await authResponse.json();
        console.log("Token reçu:");
        const accessToken = authData.access_token;
        console.log(accessToken);

        const locationUrl = "https://cors-anywhere.widopanel.com/https://api.orange.com/camara/location-retrieval/orange-lab/v0/retrieve";
        const locationHeaders = {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        };
        const locationBody = {
            "device": { "phoneNumber": "+33699901032" },
            "maxAge": 60
        };

        console.log("Tentative de récupération de la position...");
        const locationResponse = await fetch(locationUrl, {
            method: "POST",
            headers: locationHeaders,
            body: JSON.stringify(locationBody)
        });

        if (!locationResponse.ok) {
            console.error("Erreur dans la réponse Position:");
            throw new Error("Erreur lors de la récupération de la position.");
        }

        const locationData = await locationResponse.json();
        const position = {
            lat: locationData.area.center.latitude,
            lng: locationData.area.center.longitude,
            timestamp: Date.now()
        };
        console.log(position);

        // Stocker la position
        updatePositionStorage(position);

    } catch (error) {
        console.error("Erreur dans fetchPosition :", error);
    }
}

// Fonction pour stocker les positions
function updatePositionStorage(position) {
    let positions = JSON.parse(localStorage.getItem('positions')) || [];
    positions.push(position);

    if (positions.length > 3) {
        positions.shift(); // Garder les 3 dernières positions uniquement
    }

    localStorage.setItem('positions', JSON.stringify(positions));
    checkForAlert(positions);
}

// Fonction pour vérifier si une alerte est nécessaire
function checkForAlert(positions) {
    if (positions.length < 3) return;

    const [pos1, pos2, pos3] = positions;
    const isSamePosition =
        pos1.lat === pos2.lat && pos2.lat === pos3.lat &&
        pos1.lng === pos2.lng && pos2.lng === pos3.lng;

    if (isSamePosition) {
        sendAlert();
    }
}

// Fonction pour envoyer une alerte
function sendAlert() {
    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    if (contacts.length === 0) return;

    const mailtoLink = `mailto:${contacts.join(',')}?subject=Alerte%20de%20position&body=L'utilisateur semble être au même endroit depuis 12 heures.`;
    window.location.href = mailtoLink;
}

// Lancer la récupération de position toutes les 4 heures
setInterval(fetchPosition, 4 * 60 * 60 * 1000);

  