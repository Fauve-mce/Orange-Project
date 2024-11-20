localStorage.clear();


// CONSENT FORM HANDELING
document.querySelector('#consent-form form').addEventListener('submit', function (e) {
  e.preventDefault(); 
  localStorage.setItem('consentGiven', true); // Store consent in Local Storage
  alert('Consentement enregistré avec succès !'); 

  // DISPLAY PHONE NUMBER FORM
  document.querySelector('#phone-number-section').style.display = 'block';
  document.querySelector('#consent-form').style.display = 'none'; // Hide consent form
});

//PHONE NUMBER HANDELING
document.querySelector('#phone-number-section form').addEventListener('submit', function (e) {
  e.preventDefault(); 
  localStorage.setItem('phoneNumber', document.querySelector('#phone-number').value); // Store number in Local Storage
  alert('Numéro enregistré avec succès !'); 

  // DISPLAY CONTACT FORM
  document.querySelector('#phone-number-section').style.display = 'none'; // Hide Phone section form
  document.querySelector('#contact-form').style.display = 'block'; 
});


// CONTACT FORM HANDELING
document.querySelector('#contact-form form').addEventListener('submit', function (e) {
 e.preventDefault();

  
  const emails = [
    document.querySelector('#email1').value,
    document.querySelector('#email2').value,
    document.querySelector('#email3').value
  ];

  // STOCKING EMAILS IN LOCAL STORAGE
  localStorage.setItem('contacts', JSON.stringify(emails));
  alert('Contacts enregistrés avec succès !');

  document.querySelector('#email-sent').style.display = 'block' //Displays Mail sent message
  document.querySelector('#contact-form').style.display = 'none'


  setTimeout(() => {   //Timeout that simulates the received concent from contact
    
    document.querySelector('#email-sent').style.display = 'none'; 
    document.querySelector('#registration-complete').style.display = 'block'; //Displays consent received
    localStorage.setItem('consentReceived', true);
}, 10000);
  
//LOCAL STORAGE VARIABLES
const localConsentGiven = JSON.parse(localStorage.getItem('consentGiven'));
console.log(localConsentGiven);
  const localConsentReceived = JSON.parse(localStorage.getItem('consentReceived'));
console.log(localConsentReceived);



});



//FUNCTION TO FETCH POSITION

async function fetchPosition() {
    console.log("Début de fetchPosition");
    const authUrl = "https://cors-anywhere.widopanel.com/https://api.orange.com/oauth/v3/token";
    const authHeaders = {
        "Authorization": "Basic eDJEak9BajdxRzJBU0UwQ3Q3cXNDNUVVR0Z6OVhBZ1g6RUY3dXVKRTNVZVdHY1RMcA==",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
    };
     const authBody = new URLSearchParams({
        "grant_type": "client_credentials"
    }); 

       /* const authBody = {grant_type : "client_credentials"} */

    try {
        console.log("Tentative d'authentification...");
        //GET TOKEN
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

        // USE TOKEN
        const locationUrl = "https://cors-anywhere.widopanel.com/https://api.orange.com/camara/location-retrieval/orange-lab/v0/retrieve"; 
        const locationHeaders = {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        };
        const locationBody = {
    "device": {
        "phoneNumber": "+33699901032"
    },
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

        // STORE POSITION
        updatePositionStorage(position);

    } catch (error) {
        console.error("Erreur dans fetchPosition :", error);
    }
}

//FUNCTION TO STORE POSITIONS IN LOCAL STORAGE
function updatePositionStorage(position) {
    let positions = JSON.parse(localStorage.getItem('positions')) || [];
    positions.push(position);

    if (positions.length > 3) {
        positions.shift(); // Garder les 3 dernières positions uniquement
    }

    localStorage.setItem('positions', JSON.stringify(positions));

    checkForAlert(positions);
}





//FUNCTION TO CHECK IF AN ALERT IS NEEDED
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

//FUNCTION TO SEND ALERT

function sendAlert() {
  const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
  if (contacts.length === 0) return;

  const mailtoLink = `mailto:${contacts.join(',')}?subject=Alerte%20de%20position&body=L'utilisateur semble être au même endroit depuis 12 heures.`;
  window.location.href = mailtoLink;
}

// LAUNCHES THE FUNCTION EVERY 4 HOURS
/* setInterval(fetchPosition, 4 * 60 * 60 * 1000); */

//VARIABLES FOR LOCAL STORAGE


fetchPosition()

