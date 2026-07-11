// auth.js
const SUPABASE_URL = 'https://oajnnrrnatqqymmvncxf.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ham5ucnJuYXRxcXltbXZuY3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5Nzc2MDMsImV4cCI6MjA5MjU1MzYwM30.VwnyHdSeN286aGWLuoS-QMy1sZakMmCIwYjWsLh0AWA';

// 1. Kirjautumistoiminto
async function suoritaKirjautuminen() {
    console.log("Nappia painettu!"); // Jos tämä näkyy konsolissa, nappi toimii
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
            'apikey': ANON_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password })
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem('supabase_token', data.access_token);
        alert("Kirjautuminen onnistui!");
        window.location.href = 'SolOne_valvomo_index.html'; 
    } else {
        alert('Kirjautuminen epäonnistui: ' + data.error_description);
    }
}

// 2. Vartijatoiminto (suojatut sivut)
function tarkistaKirjautuminen() {
    console.log("Tarkistetaan kirjautuminen...");
    const token = localStorage.getItem('supabase_token');
    
    // Jos olet kirjautumissivulla, älä ohjaa
    if (window.location.pathname.endsWith('login.html')) {
        return;
    }

    // Jos ei tokenia, ohjaa kirjautumissivulle
    if (!token) {
        console.log("Ei tokenia, ohjataan kirjautumissivulle.");
        window.location.href = 'login.html';
    }
}

// 3. Suorita vartija heti kun sivu latautuu
tarkistaKirjautuminen();
// Lisää tämä auth.js-tiedoston loppuun
function kirjauduUlos() {
    localStorage.removeItem('supabase_token');
    window.location.href = 'login.html';
}
