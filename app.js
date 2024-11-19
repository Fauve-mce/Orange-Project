// Gestion du formulaire de consentement
document.querySelector('#consent-form form').addEventListener('submit', function (e) {
  e.preventDefault(); // Empêche la soumission du formulaire
  localStorage.setItem('consentGiven', true); // Enregistre le consentement dans le localStorage
  alert('Consentement enregistré avec succès !'); // Confirmation pour l'utilisateur

  // Afficher le formulaire des contacts après le consentement
  document.querySelector('#contact-form').style.display = 'block';
  document.querySelector('#consent-form').style.display = 'none'; // Masquer le formulaire de consentement
});

// Gestion du formulaire de contacts
document.querySelector('#contact-form form').addEventListener('submit', function (e) {
  e.preventDefault(); // Empêche la soumission du formulaire

  // Récupération des valeurs des champs d'e-mails
  const emails = [
    document.querySelector('#email1').value,
    document.querySelector('#email2').value,
    document.querySelector('#email3').value
  ];

  // Stockage des e-mails dans le localStorage
  localStorage.setItem('contacts', JSON.stringify(emails));
  alert('Contacts enregistrés avec succès !');
});