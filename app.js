// CONSENT FORM HANDELING
document.querySelector('#consent-form form').addEventListener('submit', function (e) {
  e.preventDefault(); 
  localStorage.setItem('consentGiven', true); // Enregistre le consentement dans le localStorage
  alert('Consentement enregistré avec succès !'); 

  // DISPLAY CONTACT FORM
  document.querySelector('#contact-form').style.display = 'block';
  document.querySelector('#consent-form').style.display = 'none'; // Masquer le formulaire de consentement
});

// CONTACT FORM HANDELING
document.querySelector('#contact-form form').addEventListener('submit', function (e) {
  e.preventDefault(); // 

  // EMAIL HANDELING
  const emails = [
    document.querySelector('#email1').value,
    document.querySelector('#email2').value,
    document.querySelector('#email3').value
  ];

  // STOCKING EMAILS IN LOCAL STORAGE
  localStorage.setItem('contacts', JSON.stringify(emails));
  alert('Contacts enregistrés avec succès !');
});