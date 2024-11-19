// Fonction pour renouveler le token
async function refreshToken() {
    const apiURL = "https://api.orange.com/oauth/v2/token"; // URL pour renouveler le token
    const clientId = "qUuVZIyFsdrztUk8ekSmMg9k96AKA5Nx";  // Client ID (fictif dans cet exercice)
    const clientSecret = "ymwH7zQoQlVx7vlX";  // Client Secret (fictif dans cet exercice)

    // Récupérer un nouveau token avec les informations fictives
    try {
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ":" + clientSecret)
            },
            body: new URLSearchParams({
                'grant_type': 'client_credentials',
            })
        });

        if (!response.ok) {
            throw new Error("Erreur lors du renouvellement du token");
        }

        const data = await response.json();
        console.log("Token renouvelé :", data.access_token);

        // Sauvegarder le nouveau token et sa durée d'expiration dans le localStorage
        localStorage.setItem("auth_token", data.access_token);
        localStorage.setItem("token_expiry", Date.now() + data.expires_in * 1000); // Durée d'expiration en ms

    } catch (error) {
        console.error("Erreur lors du renouvellement du token :", error);
    }
}

// Fonction pour obtenir un token valide, ou renouveler si expiré
function getToken() {
    const currentTime = Date.now();
    const tokenExpiry = localStorage.getItem("token_expiry");
    
    // Si le token est expiré, le renouveler
    if (currentTime >= tokenExpiry) {
        console.log("Token expiré, renouvellement en cours...");
        refreshToken(); // Renouveler le token
        return null; // Retourner null jusqu'à ce que le token soit renouvelé
    }

    // Si le token est encore valide, le retourner
    return localStorage.getItem("auth_token");
}


//Une fois que on a un token valide, on peut l'utiliser pour appeler l'API de localisation d'Orange.

async function fetchLocation() {
    const token = getToken();
    if (!token) {
        console.log("Le token est en cours de renouvellement.");
        return; // Attendre que le token soit renouvelé
    }

    const apiURL = "https://api.orange.com/camara/location-retrieval/orange-lab/v0/retrieve";
    const msisdn = "+32476543210"; // Numéro international fictif

    try {
        const response = await fetch(apiURL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                device: { msisdn: msisdn }
            })
        });

        if (!response.ok) {
            throw new Error("Erreur API");
        }

        const data = await response.json();
        console.log("Localisation récupérée :", data);

        // Sauvegarder la localisation dans le localStorage (ou dans un tableau en mémoire)
        saveLocation(data.area.center.latitude, data.area.center.longitude);
    } catch (err) {
        console.error("Erreur lors de la récupération de la localisation :", err);
    }
}

// Fonction pour enregistrer la localisation
function saveLocation(lat, lng) {
    const locations = JSON.parse(localStorage.getItem("locations")) || [];
    locations.push({
        date: new Date().toISOString(),
        lat: lat,
        lng: lng
    });
    localStorage.setItem("locations", JSON.stringify(locations));
}


//Maintenant que on a configuré le renouvellement du token, on peut planifier une tâche régulière pour vérifier la localisation de l'utilisateur.
// comment configurer la logique pour vérifier la localisation quotidiennement et envoyer une alerte si la personne ne bouge pas.

// Vérification de la localisation tous les jours
setInterval(() => {
    fetchLocation(); // Récupérer la localisation
    sendAlertEmail(); // Vérifier si la personne a quitté la maison et envoyer un email si nécessaire
}, 24 * 60 * 60 * 1000); // Toutes les 24 heures (en ms)

// Vérifier si la personne a bougé de sa position
function checkIfMoved() {
    const locations = JSON.parse(localStorage.getItem("locations")) || [];
    if (locations.length === 0) return false;

    const home = { lat: 48.82, lng: 2.29 }; // Coordonnées fictives du domicile
    const threshold = 100; // Distance seuil en mètres pour considérer qu'elle est "partie"

    // Vérifier les déplacements
    const hasMoved = locations.some(location => {
        const distance = calculateDistance(home.lat, home.lng, location.lat, location.lng);
        return distance > threshold;
    });

    return hasMoved;
}

// Calcul de la distance entre deux points (en mètres)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
}

// Si la personne n'a pas bougé, envoyer une alerte
function sendAlertEmail() {
    const hasMoved = checkIfMoved();

    if (!hasMoved) {
        // Utilisation d'EmailJS ou d'un autre service pour envoyer l'alerte par e-mail
        emailjs.send("service_id", "template_id", {
            to_name: "Contact",
            message: "La personne n'a pas quitté son domicile depuis 7 jours."
        }, "user_id")
        .then(response => {
            console.log("E-mail envoyé avec succès :", response);
        })
        .catch(err => {
            console.error("Erreur lors de l'envoi de l'e-mail :", err);
        });
    }
}
