    async function suoritaKirjautuminen() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const virheAlue = document.getElementById('login-virhe');
        const db = haeSupabaseAsiakas();

        try {
            const res = await fetch(db.url + '/auth/v1/token?grant_type=password', {
                method: 'POST',
                headers: {
                    'apikey': db.key,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email, password: password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error_description || data.msg || "Kirjautuminen epäonnistui");

            localStorage.setItem('supabase_token', data.access_token);
            localStorage.setItem('supabase_refresh_token', data.refresh_token);
            localStorage.setItem('user_email', data.user.email);

            virheAlue.style.display = 'none';
            alustaNakyma();
        } catch (err) {
            virheAlue.textContent = err.message;
            virheAlue.style.display = 'block';
        }
    }

    async function lahetaSalasananPalautus() {
        const emailKentta = document.getElementById('login-email');
        const virheAlue = document.getElementById('login-virhe');
        const infoAlue = document.getElementById('login-info');
        const db = haeSupabaseAsiakas();

        virheAlue.style.display = 'none';
        infoAlue.style.display = 'none';

        let email = emailKentta.value.trim();
        if (!email) {
            email = prompt("Syötä sähköpostiosoitteesi salasanan palautusta varten:");
            if (!email) return;
            emailKentta.value = email;
        }

        try {
            const res = await fetch(db.url + '/auth/v1/recover', {
                method: 'POST',
                headers: {
                    'apikey': db.key,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || data.error_description || "Palautuslinkin lähetys epäonnistui");

            infoAlue.textContent = "✓ Salasanan palautuslinkki on lähetetty osoitteeseen: " + email;
            infoAlue.style.display = 'block';
        } catch (err) {
            virheAlue.textContent = "Virhe: " + err.message;
            virheAlue.style.display = 'block';
        }
    }

    async function tallennaUusiSalasana() {
        const uusiSalasana = document.getElementById('uusi-salasana-syotto').value;
        const virheAlue = document.getElementById('uusi-salasana-virhe');
        const db = haeSupabaseAsiakas();
        const token = localStorage.getItem('supabase_token');

        if (!uusiSalasana || uusiSalasana.length < 6) {
            virheAlue.textContent = "Salasanan tulee olla vähintään 6 merkkiä pitkä.";
            virheAlue.style.display = 'block';
            return;
        }

        try {
            const res = await fetch(db.url + '/auth/v1/user', {
                method: 'PUT',
                headers: {
                    'apikey': db.key,
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: uusiSalasana })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || data.error_description || "Salasanan päivitys epäonnistui");

            document.getElementById('uusi-salasana-ikkuna').style.display = 'none';
            window.location.hash = '';
            naytaIlmoitus('✓ Uusi salasana tallennettu onnistuneesti!', 'success');
            alustaNakyma();
        } catch (err) {
            virheAlue.textContent = "Virhe: " + err.message;
            virheAlue.style.display = 'block';
        }
    }

    function avaaSalasananVaihtoModaali() {
        document.getElementById('kirjautunut-uusi-salasana').value = '';
        const virheAlue = document.getElementById('kayttaja-salasana-virhe');
        if (virheAlue) virheAlue.style.display = 'none';
        document.getElementById('vaihda-salasana-modaali').style.display = 'flex';
    }

    function suljeSalasananVaihtoModaali() {
        document.getElementById('vaihda-salasana-modaali').style.display = 'none';
    }

    async function paivitaKirjautuneenSalasana() {
        const uusiSalasana = document.getElementById('kirjautunut-uusi-salasana').value;
        const virheAlue = document.getElementById('kayttaja-salasana-virhe');
        const db = haeSupabaseAsiakas();
        const token = localStorage.getItem('supabase_token');

        virheAlue.style.display = 'none';

        if (!uusiSalasana || uusiSalasana.length < 6) {
            virheAlue.textContent = "Salasanan tulee olla vähintään 6 merkkiä pitkä.";
            virheAlue.style.display = 'block';
            return;
        }

        try {
            const res = await fetch(db.url + '/auth/v1/user', {
                method: 'PUT',
                headers: {
                    'apikey': db.key,
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: uusiSalasana })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || data.error_description || "Päivitys epäonnistui");

            suljeSalasananVaihtoModaali();
            naytaIlmoitus('✓ Salasana vaihdettu onnistuneesti!', 'success');
        } catch (err) {
            virheAlue.textContent = "Virhe: " + err.message;
            virheAlue.style.display = 'block';
        }
    }

    // --- OMA PROFIILI & KÄYTTÄJÄN ASETUKSET ---
    async function avaaProfiiliModaali() {
        const token = localStorage.getItem('supabase_token');
        const db = haeSupabaseAsiakas();
        if (!token) return;

        try {
            const res = await fetch(db.url + '/auth/v1/user', {
                method: 'GET',
                headers: { 'apikey': db.key, 'Authorization': 'Bearer ' + token }
            });
            const userData = await res.json();
            
            if (userData) {
                document.getElementById('profiili-email').value = userData.email || '';
                const meta = userData.user_metadata || {};
                document.getElementById('profiili-etunimi').value = meta.etunimi || '';
                document.getElementById('profiili-sukunimi').value = meta.sukunimi || '';
                document.getElementById('profiili-puh').value = meta.puhelinnumero || '';
                document.getElementById('profiili-osoite').value = meta.osoite || '';
                document.getElementById('profiili-postinumero').value = meta.postinumero || '';
                document.getElementById('profiili-kaupunki').value = meta.kaupunki || '';
                document.getElementById('profiili-kieli-valinta').value = meta.kieli || localStorage.getItem('solone_kieli') || 'fi';
            }
        } catch (e) {
            console.error("Profiilitietojen haku epäonnistui:", e);
        }

        document.getElementById('profiili-modaali').style.display = 'flex';
    }

    function suljeProfiiliModaali() {
        document.getElementById('profiili-modaali').style.display = 'none';
    }

    async function tallennaOmaProfiili() {
        const etunimi = document.getElementById('profiili-etunimi').value.trim();
        const sukunimi = document.getElementById('profiili-sukunimi').value.trim();
        const puhelinnumero = document.getElementById('profiili-puh').value.trim();
        const osoite = document.getElementById('profiili-osoite').value.trim();
        const postinumero = document.getElementById('profiili-postinumero').value.trim();
        const kaupunki = document.getElementById('profiili-kaupunki').value.trim();
        const uusiKieli = document.getElementById('profiili-kieli-valinta').value;

        const token = localStorage.getItem('supabase_token');
        const db = haeSupabaseAsiakas();

        try {
            const res = await fetch(db.url + '/auth/v1/user', {
                method: 'PUT',
                headers: {
                    'apikey': db.key,
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: {
                        etunimi: etunimi,
                        sukunimi: sukunimi,
                        puhelinnumero: puhelinnumero,
                        osoite: osoite,
                        postinumero: postinumero,
                        kaupunki: kaupunki,
                        kieli: uusiKieli
                    }
                })
            });

            if (!res.ok) throw new Error("Tallennus epäonnistui");

            localStorage.setItem('solone_kieli', uusiKieli);
            const yläValikko = document.getElementById('oma-kieli-valikko');
            if (yläValikko) yläValikko.value = uusiKieli;
            vaihdaKieli(uusiKieli);

            alert("✓ Profiilitiedot ja kieliasetus tallennettu onnistuneesti!");
            suljeProfiiliModaali();
        } catch (err) {
            alert("Virhe tallennettaessa profiilia: " + err.message);
        }
    }

    async function haeKyttajanKieli() {
        const token = localStorage.getItem('supabase_token');
        const db = haeSupabaseAsiakas();
        if (!token) return;

        try {
            const res = await fetch(db.url + '/auth/v1/user', {
                method: 'GET',
                headers: { 'apikey': db.key, 'Authorization': 'Bearer ' + token }
            });
            const userData = await res.json();
            
            if (userData && userData.user_metadata && userData.user_metadata.kieli) {
                const kayttajanKieli = userData.user_metadata.kieli;
                localStorage.setItem('solone_kieli', kayttajanKieli);
                
                const selectEl = document.getElementById('oma-kieli-valikko');
                if (selectEl) selectEl.value = kayttajanKieli;

                document.documentElement.lang = (kayttajanKieli === 'en') ? 'en' : (kayttajanKieli === 'sv' ? 'sv' : 'fi');
                paivitaKielet(kayttajanKieli);
            }
        } catch (e) {
            console.error("Kielen haku epäonnistui:", e);
        }
    }

    async function tarkistaRecoveryLinkki() {
        const hash = window.location.hash;
        const search = window.location.search;
        let token = null;
        let refreshToken = null;

        if (hash && (hash.includes('type=recovery') || hash.includes('access_token='))) {
            const params = new URLSearchParams(hash.replace('#', '?'));
            token = params.get('access_token');
            refreshToken = params.get('refresh_token');
        } else if (search && search.includes('code=')) {
            const params = new URLSearchParams(search);
            const code = params.get('code');
            const db = haeSupabaseAsiakas();
            try {
                const res = await fetch(db.url + '/auth/v1/token?grant_type=pkce', {
                    method: 'POST',
                    headers: { 'apikey': db.key, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ auth_code: code })
                });
                const data = await res.json();
                if (res.ok && data.access_token) {
                    token = data.access_token;
                    refreshToken = data.refresh_token;
                }
            } catch (e) {
                console.error("PKCE vaihto epäonnistui:", e);
            }
        }

        if (token) {
            localStorage.setItem('supabase_token', token);
            if (refreshToken) localStorage.setItem('supabase_refresh_token', refreshToken);

            document.getElementById('kirjautumis-ikkuna').style.display = 'none';
            document.getElementById('valvomo-sisalto').style.display = 'none';
            document.getElementById('uusi-salasana-ikkuna').style.display = 'block';
            return true;
        }

        return false;
    }

    function kirjauduUlos() {
        localStorage.removeItem('supabase_token');
        localStorage.removeItem('supabase_refresh_token');
        localStorage.removeItem('user_email');
        naytaKirjautumisIkkuna();
    }

    async function tarkistaIstunto() {
        const token = localStorage.getItem('supabase_token');
        if (!token) {
            naytaKirjautumisIkkuna();
            return false;
        }

        // Älä käytä selaimen muistissa olevaa sähköpostia asiakkaan identiteetin lähteenä.
        // Supabase Auth vahvistaa JWT:n omistajan jokaisella istunnon alustuksella.
        const db = haeSupabaseAsiakas();
        let email = '';
        try {
            const userRes = await fetch(db.url + '/auth/v1/user', {
                headers: { 'apikey': db.key, 'Authorization': 'Bearer ' + token }
            });
            if (!userRes.ok) throw new Error('Istunnon vahvistus epäonnistui (' + userRes.status + ')');
            const userData = await userRes.json();
            email = String(userData.email || '').trim().toLowerCase();
            if (!email) throw new Error('Käyttäjän sähköpostia ei saatu');
        } catch (error) {
            console.warn('Istunnon vahvistus epäonnistui', error.message);
            naytaKirjautumisIkkuna();
            return false;
        }
        localStorage.setItem('user_email', email);
        document.getElementById('kayttaja-email').textContent = email;
        document.getElementById('kayttaja-kortti').style.display = 'block';
        document.getElementById('kirjautumis-ikkuna').style.display = 'none';
        document.getElementById('valvomo-sisalto').style.display = 'block';
        
        const projektitLinkki = document.getElementById('linkki-projektit');
        if (projektitLinkki) {
            projektitLinkki.style.display = (email === 'pasi@solone.fi') ? 'inline-flex' : 'none';
        }

        const asiakkaatLinkki = document.getElementById('linkki-asiakkaat');
        if (asiakkaatLinkki) {
            asiakkaatLinkki.style.display = (email === 'pasi@solone.fi') ? 'inline-flex' : 'none';
        }

        nykyinenAsiakastunnus = email;
        return true;
    }

    function naytaKirjautumisIkkuna() {
        document.getElementById('kayttaja-kortti').style.display = 'none';
        document.getElementById('valvomo-sisalto').style.display = 'none';
        document.getElementById('kirjautumis-ikkuna').style.display = 'block';
    }

    setInterval(async function() {
        const refreshToken = localStorage.getItem('supabase_refresh_token');
        const db = haeSupabaseAsiakas();
        if (refreshToken && db) {
            try {
                const res = await fetch(db.url + '/auth/v1/token?grant_type=refresh_token', {
                    method: 'POST',
                    headers: { 'apikey': db.key, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: refreshToken })
                });
                const data = await res.json();
                if (res.ok) {
                    localStorage.setItem('supabase_token', data.access_token);
                    localStorage.setItem('supabase_refresh_token', data.refresh_token);
                }
            } catch (e) {
                console.log("Automaattipäivitys odottaa seuraavaa sykliä.");
            }
        }
    }, 5 * 60 * 1000);
