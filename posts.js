// SolOne Somevalvomo – julkaisutoiminnot. Erotettu testi.html:stä; ei muuta API-reittejä.
    // Apufunktio valitun tiedoston nimen näyttämiseen
    function paivitaValittuTiedostoNimi(input) {
        const span = document.getElementById('tiedosto-nimi-span');
        if (input.files && input.files[0]) {
            span.textContent = input.files[0].name;
        }
    }

    // --- ÄLYKÄS LAITTEEN OMA / WEB SPEECH API SANELU (TUNNISTAA KIELESTÄ RIIPPUMATTA) ---
    function kaynnistaSanelu() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Selaimesi ei tue puheentunnistusta (suositus: Google Chrome tai laitteen oma sanelu).");
            return;
        }

        const recognition = new SpeechRecognition();
        
        // Haetaan käyttäjän laitteen tai selaimen oletuskieli automaattisesti, 
        // jotta se tukee suoraan myös turkkia, hindiä, nepalia tai mitä tahansa kieltä!
        recognition.lang = navigator.language || 'fi-FI';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        const saneluNappi = document.getElementById('btn-sanelu');
        const rawKentta = document.getElementById('uusi-raw-teksti');

        recognition.onstart = function() {
            if (saneluNappi) {
                saneluNappi.style.backgroundColor = '#ef4444';
                saneluNappi.textContent = '🔴 Kuunnellaan...';
            }
        };

        recognition.onresult = function(event) {
            const puheTeksti = event.results[0][0].transcript;
            if (rawKentta) {
                rawKentta.value = rawKentta.value ? rawKentta.value + ' ' + puheTeksti : puheTeksti;
            }
        };

        recognition.onerror = function(event) {
            console.error("Saneluvirhe:", event.error);
            naytaIlmoitus("Saneluvirhe: " + event.error, "error");
        };

        recognition.onend = function() {
            if (saneluNappi) {
                saneluNappi.style.backgroundColor = '#64748b';
                saneluNappi.textContent = '🎙️ Sanelu (Laite)';
            }
        };

        recognition.start();
    }


    function paivitaLuoNapinTeksti() {
        const nappi = document.getElementById('btn-luo-luonnos');
        const ohita = document.getElementById('uusi-ohita-ai')?.checked;
        const aktiivinenKieli = localStorage.getItem('solone_kieli') || 'fi';
        if (nappi) {
            if (aktiivinenKieli === 'en') {
                nappi.textContent = ohita ? '💾 Save draft as-is' : '🚀 Create & Process with AI';
            } else if (aktiivinenKieli === 'sv') {
                nappi.textContent = ohita ? '💾 Spara utkast som det är' : '🚀 Skapa & bearbeta med AI';
            } else {
                nappi.textContent = ohita ? '💾 Tallenna luonnos sellaisenaan' : '🚀 Luo ja käsittele AI:lla';
            }
        }
    }

    async function optimoiKuva(tiedosto) {
        if (!tiedosto) return tiedosto;
        
        const onKuva = (tiedosto.type && tiedosto.type.startsWith('image/')) || 
                       /\.(jpe?g|png|webp|heic)$/i.test(tiedosto.name);
        
        if (!onKuva) return tiedosto;

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const MAX_KOKO = 1920;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_KOKO) {
                            height = Math.round((height * MAX_KOKO) / width);
                            width = MAX_KOKO;
                        }
                    } else {
                        if (height > MAX_KOKO) {
                            width = Math.round((width * MAX_KOKO) / height);
                            height = MAX_KOKO;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (!blob) {
                            resolve(tiedosto);
                            return;
                        }
                        const uusiNimi = tiedosto.name.replace(/\.[^/.]+$/, "") + ".jpg";
                        const optimoituTiedosto = new File([blob], uusiNimi, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(optimoituTiedosto);
                    }, 'image/jpeg', 0.85);
                };
                img.onerror = () => resolve(tiedosto);
                img.src = e.target.result;
            };
            reader.onerror = () => resolve(tiedosto);
            reader.readAsDataURL(tiedosto);
        });
    }


    function kaynnistaMakeSkenaario(id) {
        const db = haeSupabaseAsiakas();
        const token = localStorage.getItem('supabase_token');
        
        fetch(db.url + '/functions/v1/make-proxy', {
            method: 'POST',
            headers: { 
                'apikey': db.key,
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ action: 'publish', id: id })
        })
        .then(function() {
            naytaIlmoitus('🚀 Julkaisu hyväksytty ja lähetetty julkaisujärjestelmään!');
        })
        .catch(function(error) {
            console.error('Virhe:', error);
            naytaIlmoitus('⚠️ Virhe yhdistettäessä julkaisujärjestelmään.', 'error');
        });
    }


    let kayttajanSometilit = [];
    let sometilienLatausVirhe = false;


    function kasitteleProjektiValinta(arvo) {
        const uusiSyottoLohko = document.getElementById('uusi-projekti-syotto-lohko');
        if (arvo === '_UUSI_') {
            uusiSyottoLohko.style.display = 'block';
            document.getElementById('uusi-projekti-nimi-syotto').focus();
        } else {
            uusiSyottoLohko.style.display = 'none';
        }
    }

    async function lataaProjektienNimetValikkoon() {
        const token = localStorage.getItem('supabase_token');
        const valikko = document.getElementById('uusi-projekti-valinta');
        if (!valikko || !token) return;

        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/solone_projektit?select=projekti`, {
                headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) return;
            const data = await res.json();
            const uniikit = [...new Set(data.map(d => d.projekti).filter(Boolean))];

            if (!uniikit.includes('SolOne')) uniikit.unshift('SolOne');

            let html = uniikit.map(p => `<option value="${p}">${p}</option>`).join('');
            html += '<option value="_UUSI_">+ Luo uusi projekti...</option>';
            valikko.innerHTML = html;
        } catch (e) {
            console.log("Projektien nimien haku ei onnistunut:", e);
        }
    }

    function vaihdaTallennusTyyppi(tyyppi) {
        const someKentat = document.querySelector('#uusi-postaus-modaali .grid-valinnat');
        const sometiliLohko = document.getElementById('uusi-sometili-valinta-lohko');
        const projektiKentat = document.getElementById('projekti-lisakentat');
        const luoNappi = document.getElementById('btn-luo-luonnos');
        const otsikkoTeksti = document.getElementById('label-raw-teksti');
        const liiteTeksti = document.getElementById('label-liitetiedosto');

        if (tyyppi === 'projekti') {
            if (someKentat) someKentat.style.display = 'none';
            if (sometiliLohko) sometiliLohko.style.display = 'none';
            if (projektiKentat) projektiKentat.style.display = 'block';
            if (otsikkoTeksti) otsikkoTeksti.textContent = 'Työvaiheen nimi / Tehtävä:';
            if (liiteTeksti) liiteTeksti.textContent = 'Liitetiedosto tai kuva (tallentuu yksityiseen säilöön):';
            luoNappi.textContent = '📁 Tallenna projektilistaan';
        } else {
            if (someKentat) someKentat.style.display = 'grid';
            if (sometiliLohko && kayttajanSometilit && kayttajanSometilit.length > 0) sometiliLohko.style.display = 'block';
            if (projektiKentat) projektiKentat.style.display = 'none';
            if (otsikkoTeksti) otsikkoTeksti.textContent = 'Julkaisun aihe / Alkuperäinen teksti (Raw text):';
            if (liiteTeksti) liiteTeksti.textContent = 'Valitse kuva (puhelimesta tai koneelta):';
            paivitaLuoNapinTeksti();
        }
    }

    async function avaaUusiPostausModaali() {
        if (!tilaOnAktiivinen()) {
            alert("Uuden julkaisun luonti vaatii voimassa olevan ja aktiivisen tilauksen.");
            return;
        }

        document.getElementById('uusi-raw-teksti').value = '';
        const ohitaAiValinta = document.getElementById('uusi-ohita-ai');
        if (ohitaAiValinta) ohitaAiValinta.checked = false;

        const kuvaInput = document.getElementById('uusi-kuva-tiedosto');
        if (kuvaInput) kuvaInput.value = '';

        const previewLohko = document.getElementById('kopioitu-kuva-preview-lohko');
        if (previewLohko) previewLohko.style.display = 'none';
        kopioituKuvaUrl = null;

        const muistiinpanoInput = document.getElementById('uusi-projekti-muistiinpano');
        if (muistiinpanoInput) muistiinpanoInput.value = '';
        const linkkiInput = document.getElementById('uusi-projekti-linkki');
        if (linkkiInput) linkkiInput.value = '';
        const uusiNimiInput = document.getElementById('uusi-projekti-nimi-syotto');
        if (uusiNimiInput) uusiNimiInput.value = '';
        kasitteleProjektiValinta('SolOne');

        const tallennusTyyppiValitsin = document.getElementById('uusi-tallennus-tyyppi');
        if (tallennusTyyppiValitsin) tallennusTyyppiValitsin.value = 'some';
        vaihdaTallennusTyyppi('some');

        const email = localStorage.getItem('user_email');
        const adminLohko = document.getElementById('admin-tallennustyyppi-lohko');
        if (adminLohko) {
            const onAdmin = (email === 'pasi@solone.fi');
            adminLohko.style.display = onAdmin ? 'block' : 'none';
            if (onAdmin) {
                lataaProjektienNimetValikkoon();
            }
        }

        await lataaKayttajanSometilit();
        const lohko = document.getElementById('uusi-sometili-valinta-lohko');
        const select = document.getElementById('uusi-sometili-valinta');
        const aktiivinenKieli = localStorage.getItem('solone_kieli') || 'fi';
        const sanasto = tekstit[aktiivinenKieli];

        if (lohko && select) {
            if (kayttajanSometilit && kayttajanSometilit.length > 0) {
                lohko.style.display = 'block';
                select.innerHTML = '';
                kayttajanSometilit.forEach(function(t) {
                    select.innerHTML += '<option value="' + (t.id || '') + '"' + (t.ensisijainen ? ' selected' : '') + '>' + (t.sivun_nimi || 'Oma sivu') + (t.ensisijainen ? sanasto.defaultOption : '') + '</option>';
                });
            } else {
                lohko.style.display = 'none';
            }
        }

        paivitaLuoNapinTeksti();
        document.getElementById('uusi-postaus-modaali').style.display = 'flex';
        paivitaKielet(aktiivinenKieli);
    }

    function suljeUusiPostausModaali() {
        document.getElementById('uusi-postaus-modaali').style.display = 'none';
        kopioituKuvaUrl = null;
        const previewLohko = document.getElementById('kopioitu-kuva-preview-lohko');
        if (previewLohko) previewLohko.style.display = 'none';
    }

    function kloonaaVanhaJulkaisu(rawTeksti, profiili, kanava, kuvaUrl) {
        if (!tilaOnAktiivinen()) {
            alert("Kloonaaminen ja uusi julkaiseminen vaatii aktiivisen tilauksen.");
            return;
        }

        avaaUusiPostausModaali();
        
        document.getElementById('uusi-raw-teksti').value = rawTeksti || '';
        
        const profiiliSelect = document.getElementById('uusi-profiili');
        if (profiiliSelect && profiili) profiiliSelect.value = profiili;
        
        const kanavaSelect = document.getElementById('uusi-kanava');
        if (kanavaSelect && kanava) kanavaSelect.value = kanava;
        
        kopioituKuvaUrl = kuvaUrl || null;
        
        const previewLohko = document.getElementById('kopioitu-kuva-preview-lohko');
        const previewImg = document.getElementById('kopioitu-kuva-img');
        
        if (kopioituKuvaUrl && previewLohko && previewImg) {
            let toimivaKuvaUrl = kopioituKuvaUrl;
            let kuvaId = '';
            if (toimivaKuvaUrl.includes('id=')) {
                kuvaId = toimivaKuvaUrl.split('id=')[1].split('&')[0];
            } else if (toimivaKuvaUrl.includes('/d/')) {
                kuvaId = toimivaKuvaUrl.split('/d/')[1].split('/')[0];
            }
            if (kuvaId) {
                toimivaKuvaUrl = 'https://lh3.googleusercontent.com/d/' + kuvaId;
            }
            previewImg.src = toimivaKuvaUrl;
            previewLohko.style.display = 'block';
            naytaIlmoitus('📋 Vanha julkaisu ja kuva tuotu pohjaksi!');
        } else {
            if (previewLohko) previewLohko.style.display = 'none';
            naytaIlmoitus('📋 Vanha julkaisu tuotu pohjaksi!');
        }
    }

    function poistaKopioituKuva() {
        kopioituKuvaUrl = null;
        const previewLohko = document.getElementById('kopioitu-kuva-preview-lohko');
        if (previewLohko) previewLohko.style.display = 'none';
        naytaIlmoitus('Kuva poistettu kloonauksesta. Voit nyt ladata halutessasi uuden kuvan.');
    }

    async function luoUusiPostausKantaan() {
        if (!tilaOnAktiivinen()) return;

        const rawTeksti = document.getElementById('uusi-raw-teksti').value.trim();
        const kuvaInput = document.getElementById('uusi-kuva-tiedosto');
        const valittuTiedosto = kuvaInput && kuvaInput.files ? kuvaInput.files[0] : null;
        const profiili = document.getElementById('uusi-profiili').value;
        const kanava = document.getElementById('uusi-kanava').value;
        const kohdekieli = document.getElementById('uusi-kohdekieli').value;
        const nappi = document.getElementById('btn-luo-luonnos');
        const db = haeSupabaseAsiakas();
        const token = localStorage.getItem('supabase_token');

        const tallennusTyyppiElem = document.getElementById('uusi-tallennus-tyyppi');
        const onProjekti = tallennusTyyppiElem && tallennusTyyppiElem.value === 'projekti';

        if (!rawTeksti) {
            alert(onProjekti ? "Kirjoita työvaiheen nimi!" : "Kirjoita julkaisun aihe tai teksti!");
            return;
        }

        nappi.disabled = true;
        nappi.textContent = '⏳ Tallennetaan...';

        if (onProjekti) {
            try {
                let tiedostoPath = null;

                if (valittuTiedosto) {
                    const paate = valittuTiedosto.name.includes('.') ? '.' + valittuTiedosto.name.split('.').pop().toLowerCase() : '';
                    const tiedostoNimi = 'doc_' + Date.now() + paate;
                    
                    const uploadRes = await fetch(db.url + '/storage/v1/object/projekti-dokumentit/' + tiedostoNimi, {
                        method: 'POST',
                        headers: {
                            'apikey': db.key,
                            'Authorization': 'Bearer ' + token,
                            'x-upsert': 'true'
                        },
                        body: valittuTiedosto
                    });

                    if (!uploadRes.ok) {
                        const errJson = await uploadRes.json().catch(function() { return {}; });
                        throw new Error(errJson.message || ("Tiedoston lataus suojattuun kansioon epäonnistui: status " + uploadRes.status));
                    }

                    tiedostoPath = 'private:' + tiedostoNimi;
                }

                const valittuProjektiArvo = document.getElementById('uusi-projekti-valinta').value;
                let projektiNimi = valittuProjektiArvo;
                if (valittuProjektiArvo === '_UUSI_') {
                    projektiNimi = document.getElementById('uusi-projekti-nimi-syotto').value.trim() || 'SolOne';
                }

                const kategoria = document.getElementById('uusi-projekti-kategoria').value;
                const prio = document.getElementById('uusi-projekti-prio').value;
                const tila = document.getElementById('uusi-projekti-tila').value;
                const muistiinpano = document.getElementById('uusi-projekti-muistiinpano').value.trim();
                const ulkoinenLinkki = document.getElementById('uusi-projekti-linkki').value.trim();

                const lopullinenDokumenttiUrl = tiedostoPath || ulkoinenLinkki || null;

                const res = await fetch(db.url + '/rest/v1/solone_projektit', {
                    method: 'POST',
                    headers: {
                        'apikey': db.key,
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        projekti: projektiNimi,
                        vaihe_nimi: rawTeksti,
                        kategoria: kategoria,
                        prioriteetti: prio,
                        tila: tila,
                        muistiinpanot: muistiinpano || null,
                        dokumentti_url: lopullinenDokumenttiUrl
                    })
                });

                if (!res.ok) throw new Error("Projektin tallennus kantaan epäonnistui.");

                suljeUusiPostausModaali();
                naytaIlmoitus('✓ Työvaihe, kategoria ja suojattu liite tallennettu onnistuneesti!');
            } catch (err) {
                alert("Virhe tallennuksessa: " + err.message);
            } finally {
                nappi.disabled = false;
                nappi.textContent = '📁 Tallenna projektilistaan';
            }
            return;
        }

        try {
            let lopullinenKuvaUrl = null;

            if (valittuTiedosto) {
                const kasiteltyTiedosto = await optimoiKuva(valittuTiedosto);
                const tiedostoNimi = 'live_' + Date.now() + '.jpg';

                const uploadRes = await fetch(db.url + '/storage/v1/object/somekuvat/' + tiedostoNimi, {
                    method: 'POST',
                    headers: {
                        'apikey': db.key,
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'image/jpeg',
                        'x-upsert': 'true'
                    },
                    body: kasiteltyTiedosto
                });

                if (!uploadRes.ok) {
                    const errJson = await uploadRes.json().catch(function() { return {}; });
                    throw new Error("Kuvan lataus epäonnistui: " + (errJson.message || uploadRes.statusText));
                }

                lopullinenKuvaUrl = db.url + '/storage/v1/object/public/somekuvat/' + tiedostoNimi;
            } else if (kopioituKuvaUrl) {
                lopullinenKuvaUrl = kopioituKuvaUrl;
            }

            const valintaElem = document.getElementById('uusi-sometili-valinta');
            const valittuSometiliId = (valintaElem && valintaElem.value) 
                ? valintaElem.value 
                : (kayttajanSometilit && kayttajanSometilit[0] ? kayttajanSometilit[0].id : null);

            const valittuTiliOlio = kayttajanSometilit.find(function(t) { return t.id === valittuSometiliId; });
            const sivunNimiArvo = valittuTiliOlio ? valittuTiliOlio.sivun_nimi : null;

            const ohitaAiValittu = document.getElementById('uusi-ohita-ai') ? document.getElementById('uusi-ohita-ai').checked : false;

            const postRes = await fetch(db.url + '/rest/v1/somepostaukset', {
                method: 'POST',
                headers: {
                    'apikey': db.key,
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify([{
                    raw_text: rawTeksti,
                    julkaisuteksti: ohitaAiValittu ? rawTeksti : null,
                    kuva_url: lopullinenKuvaUrl,
                    julkaisuprofiili: profiili,
                    profile_id: profiili,
                    target_channel: kanava,
                    alusta: kanava,
                    kohdekieli: kohdekieli,
                    asiakastunnus: nykyinenAsiakastunnus,
                    sometili_id: valittuSometiliId,
                    sivun_nimi: sivunNimiArvo,
                    status: ohitaAiValittu ? 'odotetaan' : 'kasittelyssa',
                    luotu_aika: new Date().toISOString()
                }])
            });

            if (!postRes.ok) throw new Error("Tietokantaan tallennus epäonnistui.");
            const luodutRivit = await postRes.json();
            const uusiRivi = luodutRivit[0];

            suljeUusiPostausModaali();

            if (ohitaAiValittu) {
                naytaIlmoitus('✓ Luonnos luotu sellaisenaan odottaviin julkaisuihin!');
                haeValvomonTiedot();
            } else {
                naytaIlmoitus('🚀 Uusi julkaisu luotu, tekoäly käsittelee tekstiä...');
                haeValvomonTiedot();

                fetch(db.url + '/functions/v1/make-proxy', {
                    method: 'POST',
                    headers: { 
                        'apikey': db.key,
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        action: 'new-draft',
                        id: uusiRivi.id,
                        tyyli: profiili,
                        rawTeksti: rawTeksti,
                        kuvaUrl: lopullinenKuvaUrl,
                        kohdekieli: kohdekieli
                    })
                }).catch(err => console.error("Virhe reitittimen kutsussa:", err));
            }

        } catch (err) {
            alert("Virhe luonnoksen luonnissa: " + err.message);
        } finally {
            nappi.disabled = false;
            paivitaLuoNapinTeksti();
        }
    }

    async function paivitaTarkastuksenPohjalta(id, nappiElem) {
        const tarkastusKentta = document.getElementById('tarkastus-' + id);
        const muokattuTarkastus = tarkastusKentta ? tarkastusKentta.value.trim() : '';
        const db = haeSupabaseAsiakas();
        const token = localStorage.getItem('supabase_token');

        const aktiivinenKieli = localStorage.getItem('solone_kieli') || 'fi';
        const sanasto = tekstit[aktiivinenKieli] || tekstit.fi;

        if (!muokattuTarkastus) {
            naytaIlmoitus('⚠️ Tarkastusteksti ei voi olla tyhjä!', 'error');
            return;
        }

        if (nappiElem) {
            nappiElem.disabled = true;
            nappiElem.textContent = sanasto.btnPäivitetään;
        }

        try {
            await fetch(db.url + '/rest/v1/somepostaukset?id=eq.' + id, {
                method: 'PATCH',
                headers: {
                    'apikey': db.key,
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ tarkastusteksti: muokattuTarkastus })
            });

            const response = await fetch(db.url + '/functions/v1/make-proxy', {
                method: 'POST',
                headers: { 
                    'apikey': db.key,
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    action: 'ai-update',
                    id: id,
                    tarkastusteksti: muokattuTarkastus
                })     
            });

            if (response.ok) {
                naytaIlmoitus('Korjauspyyntö lähetetty tekoälylle! Sivu päivittyy hetken kuluttua.', 'success');
                setTimeout(function() { haeValvomonTiedot(); }, 4000);
            } else {
                throw new Error("Virhe Make-kutsussa");
            }
        } catch (err) {
            console.error('Virhe:', err);
            naytaIlmoitus(sanasto.virhePäivitys, 'error');
            if (nappiElem) {
                nappiElem.disabled = false;
                nappiElem.textContent = sanasto.btnPaivitaTarkastus;
            }
        }
    }

    async function poistaJulkaisuKannasta(id) {
        if (!confirm("Haluatko varmasti poistaa tämän julkaisun kokonaan arkistosta?")) return;
        const db = haeSupabaseAsiakas();
        const token = localStorage.getItem('supabase_token');

        try {
            const res = await fetch(db.url + '/rest/v1/somepostaukset?id=eq.' + id, {
    method: 'DELETE',
    headers: {
        'apikey': db.key,
        'Authorization': 'Bearer ' + token,
        'Prefer': 'return=representation'
    }
});

if (!res.ok) {
    throw new Error("Poisto epäonnistui (HTTP " + res.status + ")");
}

const poistetutRivit = await res.json();

if (!Array.isArray(poistetutRivit) ||
    poistetutRivit.length !== 1 ||
    String(poistetutRivit[0].id) !== String(id)) {
    throw new Error("Julkaisua ei poistettu. Tarkista käyttöoikeudet.");
}

            naytaIlmoitus('✓ Julkaisu poistettu arkistosta!');
            viimeisinHistoriaData = viimeisinHistoriaData.filter(function(j) { return j.id !== id; });
            suodataHistoria();
        } catch (e) {
            naytaIlmoitus('Virhe poistettaessa julkaisua: ' + e.message, 'error');
        }
    }

    async function kaytaOmaaTekstia(id) {
        const rawKentta = document.getElementById('raw-teksti-' + id);
        const julkaisuKentta = document.getElementById('teksti-' + id);
        const omaTeksti = rawKentta ? rawKentta.value : '';

        if (!omaTeksti) {
            naytaIlmoitus('⚠️ Alkuperäinen teksti on tyhjä!', 'error');
            return;
        }

        if (julkaisuKentta) {
            julkaisuKentta.value = omaTeksti;
        }

        const db = haeSupabaseAsiakas();
        const token = localStorage.getItem('supabase_token');

        try {
            const updateRes = await fetch(db.url + '/rest/v1/somepostaukset?id=eq.' + id, {
                method: 'PATCH',
                headers: {
                    'apikey': db.key,
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    julkaisuteksti: omaTeksti
                })
            });

            if (!updateRes.ok) throw new Error("Tallennus epäonnistui");
            naytaIlmoitus('✓ Alkuperäinen teksti kopioitu julkaisutekstiksi!');
        } catch (e) {
            naytaIlmoitus('Virhe tallennettaessa: ' + e.message, 'error');
        }
    }


    function luoKorttiHtml(julkaisu, onHistoria) {
        onHistoria = onHistoria || false;
        const aktiivinenKieli = localStorage.getItem('solone_kieli') || 'fi';
        const sanasto = tekstit[aktiivinenKieli];

        const pvm = julkaisu.luotu_aika ? new Date(julkaisu.luotu_aika).toLocaleString('fi-FI') : '-';
        const card = document.createElement('div');
        
        if (julkaisu.status === 'kasittelyssa') {
            card.className = 'julkaisu-card kasittelyssa';
            card.id = 'card-' + julkaisu.id;
            let htmlK = '';
            htmlK += '<div class="tilamerkinta kasittelyssa-badge">⏳ Uusi julkaisu käsittelyssä (valmis hetken päästä)</div>';
            const laatijaK = julkaisu.asiakastunnus || 'Tuntematon';
            htmlK += '<div class="meta-info"><span><strong>' + sanasto.metaLuotu + '</strong> ' + pvm + '</span><span><strong>' + sanasto.metaLaatija + '</strong> ' + laatijaK + '</span></div>';
            htmlK += '<label class="field-label">Alkuperäinen teksti:</label>';
            htmlK += '<textarea class="teksti-alue" readonly>' + (julkaisu.raw_text || '') + '</textarea>';
            card.innerHTML = htmlK;
            return card;
        }

        const onHylatty = julkaisu.status === 'hylatty';
        const onVirhe = julkaisu.status === 'virhe';
        card.className = 'julkaisu-card' + (onHistoria ? ((onHylatty || onVirhe) ? ' hylatty-kortti' : ' historia') : '');
        card.id = 'card-' + julkaisu.id;

        const nykyinenAlusta = (julkaisu.target_channel || julkaisu.alusta || 'FB_IG').trim();
        const nykyinenProfiili = (julkaisu.julkaisuprofiili || julkaisu.profile_id || 'Yleinen').trim();

        let htmlSisalto = '';

       if (onHistoria) {
            if (onVirhe) {
                htmlSisalto += '<div class="tilamerkinta hylatty-badge">' + sanasto.historiaVirhe + '</div>';
                if (julkaisu.virhe_viesti) {
                    htmlSisalto += '<div style="background: #ffeeec; color: #b91c1c; padding: 10px; border-radius: 6px; font-size: 0.85rem; margin-bottom: 12px; border: 1px solid #fecaca;"><strong>Syy:</strong> ' + julkaisu.virhe_viesti + '</div>';
                }
            } else if (onHylatty) {
                htmlSisalto += '<div class="tilamerkinta hylatty-badge">' + sanasto.historiaHylatty + '</div>';
            } else {
                htmlSisalto += '<div class="tilamerkinta">' + sanasto.historiaJulkaistu + '</div>';
            }
        }
        
        let kanavaTeksti = nykyinenAlusta;
        if (nykyinenAlusta === 'FB_IG_LI') {
            kanavaTeksti = sanasto.chanAllText;
        } else if (nykyinenAlusta === 'FB_IG' || nykyinenAlusta === 'Molemmat') {
            kanavaTeksti = sanasto.chanMetaText;
        } else if (nykyinenAlusta === 'LI') {
            kanavaTeksti = sanasto.chanLiText;
        } else if (nykyinenAlusta === 'FB' || nykyinenAlusta === 'Facebook') {
            kanavaTeksti = sanasto.chanFbText;
        } else if (nykyinenAlusta === 'IG' || nykyinenAlusta === 'Instagram') {
            kanavaTeksti = sanasto.chanIgText;
        }

        let aikaTeksti = '';
        if (julkaisu.julkaistu_aika) {
            aikaTeksti = '<span><strong>' + sanasto.metaJulkaistu + '</strong> ' + new Date(julkaisu.julkaistu_aika).toLocaleString('fi-FI') + '</span>';
        } else if (julkaisu.ajastettu_aika) {
            aikaTeksti = '<span><strong>' + sanasto.metaAjastettu + '</strong> ' + new Date(julkaisu.ajastettu_aika).toLocaleString('fi-FI') + '</span>';
        } else if (onHistoria) {
            aikaTeksti = '<span><strong>' + sanasto.metaJulkaistu + '</strong> ' + sanasto.metaVälitön + '</span>';
        }

        const valittuTiliOlio = kayttajanSometilit.find(function(t) { return t.id === julkaisu.sometili_id; });
        const sivunNimiTeksti = julkaisu.sivun_nimi || (valittuTiliOlio ? valittuTiliOlio.sivun_nimi : (kayttajanSometilit[0] ? kayttajanSometilit[0].sivun_nimi : 'Oletussivu'));

        const laatijaTeksti = julkaisu.asiakastunnus || 'Tuntematon';
        const julkaisijaTeksti = julkaisu.julkaissut_kayttaja || null;

        let tekijaKenttaHtml = '';
        if (!julkaisijaTeksti) {
            tekijaKenttaHtml = '<span><strong>' + sanasto.metaLaatija + '</strong> ' + laatijaTeksti + '</span>';
        } else if (julkaisijaTeksti === laatijaTeksti) {
            tekijaKenttaHtml = '<span><strong>' + sanasto.metaLaatija + ' & ' + sanasto.metaJulkaisija.toLowerCase() + ':</strong> ' + laatijaTeksti + '</span>';
        } else {
            tekijaKenttaHtml = '<span><strong>' + sanasto.metaLaatija + '</strong> ' + laatijaTeksti + '</span><span><strong>' + sanasto.metaJulkaisija + '</strong> ' + julkaisijaTeksti + '</span>';
        }

        htmlSisalto += '<div class="meta-info">';
        htmlSisalto += '<span><strong>' + sanasto.metaLuotu + '</strong> ' + pvm + '</span>';
        htmlSisalto += tekijaKenttaHtml;
        htmlSisalto += '<span><strong>' + sanasto.metaKohdesivu + '</strong> ' + sivunNimiTeksti + '</span>';
        htmlSisalto += '<span><strong>' + sanasto.metaProfiili + '</strong> ' + nykyinenProfiili + '</span>';
        htmlSisalto += '<span><strong>' + sanasto.metaKanava + '</strong> ' + kanavaTeksti + '</span>';
        htmlSisalto += aikaTeksti;
        htmlSisalto += '</div>';

        if (julkaisu.kuva_url) {
            let toimivaKuvaUrl = julkaisu.kuva_url;
            let kuvaId = '';

            if (toimivaKuvaUrl.includes('id=')) {
                kuvaId = toimivaKuvaUrl.split('id=')[1].split('&')[0];
            } else if (toimivaKuvaUrl.includes('/d/')) {
                kuvaId = toimivaKuvaUrl.split('/d/')[1].split('/')[0];
            }

            if (kuvaId) {
                toimivaKuvaUrl = 'https://lh3.googleusercontent.com/d/' + kuvaId;
            }

            htmlSisalto += '<img src="' + toimivaKuvaUrl + '" class="kuva-esikatselu" alt="Esikatselukuva" style="object-fit: contain;">';
        }

        htmlSisalto += '<label class="field-label">' + sanasto.lblRawTextCard + '</label>';
        htmlSisalto += '<textarea id="raw-teksti-' + julkaisu.id + '" class="teksti-alue"' + (onHistoria ? ' readonly' : '') + '>' + (julkaisu.raw_text || '') + '</textarea>';

        // --- TARKASTUSTEKSTILAATIKKO (NÄKYY VAIN JOS SISÄLTÖÄ ON) ---
        if (julkaisu.tarkastusteksti) {
            htmlSisalto += '<div style="background: #fff7ed; border: 1px solid #fdba74; padding: 12px; border-radius: 8px; margin-bottom: 18px;">';
            htmlSisalto += '<label class="field-label" style="color: #c2410c;">' + sanasto.tarkistusOtsikko + '</label>';
            htmlSisalto += '<textarea id="tarkastus-' + julkaisu.id + '" class="teksti-alue" style="border-color: #fdba74; height: 250px; min-height: 150px; resize: vertical;"' + (onHistoria ? ' readonly' : '') + '>' + (julkaisu.tarkastusteksti || '') + '</textarea>';
            if (!onHistoria) {
                htmlSisalto += '<button type="button" class="btn-testi" style="background-color: #f97316; width: 100%; border: none;" onclick="paivitaTarkastuksenPohjalta(\'' + julkaisu.id + '\', this)">' + sanasto.btnPaivitaTarkastus + '</button>';
            }
            htmlSisalto += '</div>';
        }

        if (!onHistoria) {
            htmlSisalto += '<div class="grid-valinnat">'; 
            htmlSisalto += '<div>';
            htmlSisalto += '<label class="field-label">' + sanasto.lblProfile + '</label>';
            const prof = julkaisu.julkaisuprofiili || 'Yleinen';
            htmlSisalto += '<select id="profiili-' + julkaisu.id + '" class="valinta-kentta" onchange="paivitaProfiiliKantaan(\'' + julkaisu.id + '\', this.value)">';
            htmlSisalto += '  <option value="Yleinen"' + (prof === 'Yleinen' ? ' selected' : '') + '>' + sanasto.profGeneral + '</option>';
            htmlSisalto += '  <option value="Oma tyyli"' + (prof === 'Oma tyyli' ? ' selected' : '') + '>' + sanasto.profOwnStyle + '</option>';
            htmlSisalto += '  <option value="Säilytä teksti (vain emojit & tagit)"' + (prof === 'Säilytä teksti (vain emojit & tagit)' ? ' selected' : '') + '>' + sanasto.profKeepText + '</option>';
            htmlSisalto += '  <option value="Yritys & B2B"' + (prof === 'Yritys & B2B' ? ' selected' : '') + '>Yritys & B2B</option>';
            htmlSisalto += '  <option value="Yritys & B2C"' + (prof === 'Yritys & B2C' ? ' selected' : '') + '>Yritys & B2C</option>';
            htmlSisalto += '  <option value="Somesisällöntuottaja"' + (prof === 'Somesisällöntuottaja' ? ' selected' : '') + '>' + sanasto.profCreator + '</option>';
            htmlSisalto += '  <option value="Yhdistys/yhteisö"' + (prof === 'Yhdistys/yhteisö' ? ' selected' : '') + '>' + sanasto.profCommunity + '</option>';
            htmlSisalto += '  <option value="Blogi"' + (prof === 'Blogi' ? ' selected' : '') + '>' + sanasto.profBlog + '</option>';
            htmlSisalto += '</select>';
            htmlSisalto += '</div>';

            htmlSisalto += '<div style="display: flex; gap: 8px; flex-wrap: wrap;">';
            htmlSisalto += '<button type="button" id="btn-reformat-' + julkaisu.id + '" class="btn-reformat" onclick="muotoileAIlla(\'' + julkaisu.id + '\')">' + sanasto.btnMuotoileAi + '</button>';
            htmlSisalto += '<button type="button" class="btn-reformat" style="background-color: #0284c7;" onclick="kaytaOmaaTekstia(\'' + julkaisu.id + '\')">' + sanasto.btnKaytaOmaa + '</button>';
            
            if (julkaisu.alkuperainen_ai_teksti) {
                htmlSisalto += '<button type="button" class="btn-reformat" style="background-color: #64748b;" onclick="palautaEnsimmainenVersio(\'' + julkaisu.id + '\')">' + sanasto.btnPalautaVersio + '</button>';
            }
            htmlSisalto += '</div>';
            htmlSisalto += '</div>';
        }

        htmlSisalto += '<label class="field-label">' + sanasto.lblJulkaisuteksti + '</label>';
        htmlSisalto += '<textarea id="teksti-' + julkaisu.id + '" class="teksti-alue" style="height: 250px; min-height: 150px; resize: vertical;"' + (onHistoria ? ' readonly' : '') + '>' + (julkaisu.julkaisuteksti || '') + '</textarea>';

        if (!onHistoria) {
            let valmisAika = '';
            if (julkaisu.ajastettu_aika) {
                const d = new Date(julkaisu.ajastettu_aika);
                const vuosi = d.getFullYear();
                const kuukausi = String(d.getMonth() + 1).padStart(2, '0');
                const paiva = String(d.getDate()).padStart(2, '0');
                const tunnit = String(d.getHours()).padStart(2, '0');
                const minuutit = String(d.getMinutes()).padStart(2, '0');
                valmisAika = `${vuosi}-${kuukausi}-${paiva}T${tunnit}:${minuutit}`;
            }
            
            htmlSisalto += '<div class="grid-valinnat">'; 
            
            if (kayttajanSometilit && kayttajanSometilit.length > 0) {
                const oletusTiliId = (kayttajanSometilit.find(function(t) { return t.ensisijainen; }) || kayttajanSometilit[0]).id;
                const aktiivinenTiliId = julkaisu.sometili_id || oletusTiliId;

                htmlSisalto += '<div>';
                htmlSisalto += '<label class="field-label">' + sanasto.lblTargetPage + '</label>';
                htmlSisalto += '<select id="sometili-' + julkaisu.id + '" class="valinta-kentta" onchange="paivitaSometiliKantaan(\'' + julkaisu.id + '\', this.value)">';
                kayttajanSometilit.forEach(function(t) {
                    htmlSisalto += '<option value="' + t.id + '"' + (aktiivinenTiliId === t.id ? ' selected' : '') + '>' + t.sivun_nimi + (t.ensisijainen ? sanasto.defaultOption : '') + '</option>';
                });
                htmlSisalto += '</select>';
                htmlSisalto += '</div>';
            }

            htmlSisalto += '<div>';
            htmlSisalto += '<label class="field-label">' + sanasto.lblChannel + '</label>';
            htmlSisalto += '<select id="alusta-' + julkaisu.id + '" class="valinta-kentta">';
            htmlSisalto += '<option value="FB_IG_LI"' + (nykyinenAlusta === 'FB_IG_LI' || nykyinenAlusta === 'Kaikki' ? ' selected' : '') + '>' + sanasto.chanAll + '</option>';
            htmlSisalto += '<option value="FB_IG"' + (nykyinenAlusta === 'FB_IG' || nykyinenAlusta === 'Molemmat' ? ' selected' : '') + '>' + sanasto.chanMeta + '</option>';
            htmlSisalto += '<option value="LI"' + (nykyinenAlusta === 'LI' ? ' selected' : '') + '>' + sanasto.chanLi + '</option>';
            htmlSisalto += '<option value="FB"' + (nykyinenAlusta === 'FB' || nykyinenAlusta === 'Facebook' ? ' selected' : '') + '>' + sanasto.chanFb + '</option>';
            htmlSisalto += '<option value="IG"' + (nykyinenAlusta === 'IG' || nykyinenAlusta === 'Instagram' ? ' selected' : '') + '>' + sanasto.chanIg + '</option>';
            htmlSisalto += '</select>';
            htmlSisalto += '</div>';

            htmlSisalto += '<div>';
            htmlSisalto += '<label class="field-label">' + sanasto.lblAjastaValinnainen + '</label>';
            htmlSisalto += '<input type="datetime-local" id="ajastus-' + julkaisu.id + '" class="aika-kentta" value="' + valmisAika + '">';
            htmlSisalto += '</div>';
            htmlSisalto += '</div>';

            htmlSisalto += '<div class="nappi-ryhma">';
            htmlSisalto += '<button class="btn-hyvaksy" onclick="paivitaStatus(\'' + julkaisu.id + '\', \'hyvaksytty\')">' + sanasto.btnHyvaksyJonoon + '</button>';
            htmlSisalto += '<button class="btn-pika" onclick="paivitaStatus(\'' + julkaisu.id + '\', \'hyvaksytty\', true);">' + sanasto.btnJulkaiseHeti + '</button>';
            htmlSisalto += '<button class="btn-hylkaa" onclick="paivitaStatus(\'' + julkaisu.id + '\', \'hylatty\')">' + sanasto.btnHylkaa + '</button>';
            htmlSisalto += '</div>';
        }

        if (onHistoria) {
            const turvattuTeksti = (julkaisu.raw_text || '').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/"/g, '&quot;');
            const turvattuKuvaUrl = julkaisu.kuva_url || '';
            htmlSisalto += '<div style="margin-top: 15px; border-top: 1px solid var(--border-color); padding-top: 12px; display: flex; flex-direction: column; gap: 8px;">';
            htmlSisalto += '<button type="button" class="btn-pika" style="background-color: #0284c7; width: 100%;" onclick="kloonaaVanhaJulkaisu(\'' + turvattuTeksti + '\', \'' + (julkaisu.julkaisuprofiili || 'Yleinen') + '\', \'' + (julkaisu.target_channel || 'FB_IG') + '\', \'' + turvattuKuvaUrl + '\')">' + sanasto.btnKloonaa + '</button>';
            
            if (onHylatty || onVirhe) {
                htmlSisalto += '<button type="button" class="btn-hylkaa" style="width: 100%;" onclick="poistaJulkaisuKannasta(\'' + julkaisu.id + '\')">' + sanasto.btnPoistaArkistosta + '</button>';
            }
            
            htmlSisalto += '</div>';
        }

        card.innerHTML = htmlSisalto;
        return card;
    }

    async function muotoileAIlla(id) {
        const rawTeksti = document.getElementById('raw-teksti-' + id) ? document.getElementById('raw-teksti-' + id).value : '';
        const profiiliSelect = document.getElementById('profiili-' + id);
        const profiili = profiiliSelect ? profiiliSelect.value : 'Yleinen';
        const reformatNappi = document.getElementById('btn-reformat-' + id);
        const db = haeSupabaseAsiakas();
        const token = localStorage.getItem('supabase_token');

        if (!rawTeksti && document.getElementById('raw-teksti-' + id)) {
            naytaIlmoitus('⚠️ Alkuperäinen teksti ei voi olla tyhjä!', 'error');
            return;
        }

        if (reformatNappi) {
            reformatNappi.disabled = true;
            reformatNappi.textContent = '⏳ Muotoillaan...';
        }

        try {
            await fetch(db.url + '/rest/v1/somepostaukset?id=eq.' + id, {
                method: 'PATCH',
                headers: {
                    'apikey': db.key,
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    profile_id: profiili,
                    raw_text: rawTeksti,
                    kuva_url: document.querySelector('#card-' + id + ' .kuva-esikatselu')?.src || null
                })
            });

            const cardElem = document.getElementById('card-' + id) || document.querySelector('.julkaisu-card:not(.historia)');
            const kuvaElem = cardElem ? cardElem.querySelector('.kuva-esikatselu') : null;
            const kuvaUrlValmis = kuvaElem ? kuvaElem.src : null;

            const response = await fetch(db.url + '/functions/v1/make-proxy', {
                method: 'POST',
                headers: { 
                    'apikey': db.key,
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    action: 'ai-format',
                    id: id,
                    tyyli: profiili,
                    rawTeksti: rawTeksti,
                    kuvaUrl: kuvaUrlValmis,
                    kohdekieli: document.getElementById('uusi-kohdekieli') ? document.getElementById('uusi-kohdekieli').value : 'Suomi'
                })     
            });

            if (response.ok) {
                naytaIlmoitus('Muotoilupyyntö lähetetty AI:lle! Sivu päivittyy hetken kuluttua.', 'success');
                setTimeout(function() { haeValvomonTiedot(); }, 4000);
            } else {
                naytaIlmoitus('❌ Virhe AI-muotoilupyynnössä.', 'error');
                if (reformatNappi) {
                    reformatNappi.disabled = false;
                    reformatNappi.textContent = '🔄 Muotoile AI:lla';
                }
            }
        } catch (err) {
            console.error('Virhe:', err);
            naytaIlmoitus('❌ Verkkovirhe AI-muotoilussa.', 'error');
            if (reformatNappi) {
                reformatNappi.disabled = false;
                reformatNappi.textContent = '🔄 Muotoile AI:lla';
            }
        }
  }

    function paivitaHistoriaSuodatinValikko() {
        const valikko = document.getElementById('historia-suodatin-tili');
        if (!valikko || !kayttajanSometilit) return;

        const nykyinenValinta = valikko.value;
        const aktiivinenKieli = localStorage.getItem('solone_kieli') || 'fi';
        const sanasto = tekstit[aktiivinenKieli];
        let html = '<option value="KAIKKI">' + sanasto.filterAllAccounts + '</option>';

        kayttajanSometilit.forEach(function(tili) {
            html += '<option value="' + tili.id + '">' + (tili.sivun_nimi || 'Nimetön sivu') + '</option>';
        });

        valikko.innerHTML = html;
        if (nykyinenValinta && valikko.querySelector('option[value="' + nykyinenValinta + '"]')) {
            valikko.value = nykyinenValinta;
        }
    }

    function suodataHistoria(nollaaSivu) {
        if (nollaaSivu) {
            historiaSivu = 0;
        }
        const historiaLista = document.getElementById('historia-lista');
        const valikko = document.getElementById('historia-suodatin-tili');
        if (!historiaLista) return;

        const aktiivinenKieli = localStorage.getItem('solone_kieli') || 'fi';
        const sanasto = tekstit[aktiivinenKieli] || tekstit.fi;

        const valittuTiliId = valikko ? valikko.value : 'KAIKKI';
        
        let naytettavat = viimeisinHistoriaData;
        if (valittuTiliId !== 'KAIKKI') {
            naytettavat = viimeisinHistoriaData.filter(function(j) {
                return j.sometili_id === valittuTiliId;
            });
        }

        if (!naytettavat || naytettavat.length === 0) {
            historiaLista.innerHTML = '<div class="tyhja-tila">Ei aiemmin julkaistuja viestejä tälle tilille.</div>';
            return;
        }

        const maxSivut = Math.ceil(naytettavat.length / HISTORIA_SIVUKOKO);
        if (historiaSivu >= maxSivut) {
            historiaSivu = Math.max(0, maxSivut - 1);
        }

        const aloitusIndeksi = historiaSivu * HISTORIA_SIVUKOKO;
        const sivuData = naytettavat.slice(aloitusIndeksi, aloitusIndeksi + HISTORIA_SIVUKOKO);

        historiaLista.innerHTML = '';
        sivuData.forEach(function(julkaisu) {
            historiaLista.appendChild(luoKorttiHtml(julkaisu, true));
        });

        if (naytettavat.length > HISTORIA_SIVUKOKO) {
            const naviDiv = document.createElement('div');
            naviDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding: 10px 0; gap: 10px; flex-wrap: wrap;';
            
            const btnEdelliset = document.createElement('button');
            btnEdelliset.type = 'button';
            btnEdelliset.className = 'btn-testi';
            btnEdelliset.style.width = 'auto';
            btnEdelliset.textContent = sanasto.historiaUudemmat;
            btnEdelliset.disabled = (historiaSivu === 0);
            if (historiaSivu === 0) btnEdelliset.style.opacity = '0.5';
            btnEdelliset.onclick = function() {
                if (historiaSivu > 0) {
                    historiaSivu--;
                    suodataHistoria(false);
                    historiaLista.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            };

            const infoSpan = document.createElement('span');
            infoSpan.style.cssText = 'font-size: 0.85rem; color: var(--text-muted); font-weight: 500;';
            infoSpan.textContent = sanasto.historiaSivuInfo
                .replace('{sivu}', (historiaSivu + 1))
                .replace('{max}', maxSivut)
                .replace('{yht}', naytettavat.length);

            const btnSeuraavat = document.createElement('button');
            btnSeuraavat.type = 'button';
            btnSeuraavat.className = 'btn-testi';
            btnSeuraavat.style.width = 'auto';
            btnSeuraavat.textContent = sanasto.historiaVanhemmat;
            btnSeuraavat.disabled = (historiaSivu >= maxSivut - 1);
            if (historiaSivu >= maxSivut - 1) btnSeuraavat.style.opacity = '0.5';
            btnSeuraavat.onclick = function() {
                if (historiaSivu < maxSivut - 1) {
                    historiaSivu++;
                    suodataHistoria(false);
                    historiaLista.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            };

            naviDiv.appendChild(btnEdelliset);
            naviDiv.appendChild(infoSpan);
            naviDiv.appendChild(btnSeuraavat);
            historiaLista.appendChild(naviDiv);
        }
    }

    async function haeValvomonTiedot(pakotaPaivitys = false) {
        const aktiivinenElementti = document.activeElement;
        const kirjoittaaParhaillaan = aktiivinenElementti && 
            ['TEXTAREA', 'INPUT', 'SELECT'].includes(aktiivinenElementti.tagName);

        if (kirjoittaaParhaillaan && !pakotaPaivitys) {
            if (automaattiPäivitysAjastin) clearTimeout(automaattiPäivitysAjastin);
            automaattiPäivitysAjastin = setTimeout(haeValvomonTiedot, 2000);
            return;
        }
        const odottavatLista = document.getElementById('julkaisut-lista');
        const db = haeSupabaseAsiakas();
        const token = localStorage.getItem('supabase_token');

        if (!token) {
            naytaKirjautumisIkkuna();
            return;
        }

        try {
            const headers = {
                'apikey': db.key,
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            };

            await tarkistaAktiivinenTilausOhjaus();

            const resOdottavat = await fetch(db.url + '/rest/v1/somepostaukset?status=in.(odotetaan,kasittelyssa)&order=luotu_aika.desc', { method: 'GET', headers: headers });
            if (resOdottavat.status === 401) { 
                kirjauduUlos(); 
                return; 
            }
            const dataOdottavat = await resOdottavat.json();

            const resHistoria = await fetch(db.url + '/rest/v1/somepostaukset?status=not.in.(odotetaan,kasittelyssa)&order=luotu_aika.desc&limit=100', { method: 'GET', headers: headers });
            const dataHistoria = await resHistoria.json();

            if (!dataOdottavat || dataOdottavat.length === 0) {
                const aktiivinenKieli = localStorage.getItem('solone_kieli') || 'fi';
                const sanasto = tekstit[aktiivinenKieli] || tekstit.fi;
                odottavatLista.innerHTML = '<div class="tyhja-tila">' + (sanasto.eiOdottavia || "Ei odottavia somejulkaisuja. Kaikki valmiina!") + '</div>';
            } else {
                odottavatLista.innerHTML = '';
                dataOdottavat.forEach(function(julkaisu) { odottavatLista.appendChild(luoKorttiHtml(julkaisu, false)); });
            }
            viimeisinHistoriaData = dataHistoria || [];
            paivitaHistoriaSuodatinValikko();
            suodataHistoria(false);

            if (automaattiPäivitysAjastin) clearTimeout(automaattiPäivitysAjastin);

            const onKäsittelyssä = dataOdottavat && dataOdottavat.some(function(j) { return j.status === 'kasittelyssa'; });
            const vive = onKäsittelyssä ? 2000 : 4000;

            automaattiPäivitysAjastin = setTimeout(haeValvomonTiedot, vive);

        } catch (error) {
            console.error("Valvomo-virhe:", error);
            naytaIlmoitus('Virhe ladattaessa tietoja: ' + error.message, 'error');
        }
    }

    async function paivitaStatus(id, uusiStatus, kaynnistaPika) {
        if (!tilaOnAktiivinen()) {
            alert("Julkaiseminen vaatii voimassa olevan ja aktiivisen tilauksen.");
            return;
        }

        kaynnistaPika = kaynnistaPika || false;
        const muokattuRawTeksti = document.getElementById('raw-teksti-' + id).value;
        const muokattuTeksti = document.getElementById('teksti-' + id).value;
        const valittuProfiili = document.getElementById('profiili-' + id).value;
        const valittuKanava = document.getElementById('alusta-' + id).value;
        const valittuAika = document.getElementById('ajastus-' + id).value;
        
        const sometiliSelect = document.getElementById('sometili-' + id);
        let valittuSometiliId = sometiliSelect ? sometiliSelect.value : null;

        if (!valittuSometiliId && kayttajanSometilit && kayttajanSometilit.length > 0) {
            const oletus = kayttajanSometilit.find(function(t) { return t.ensisijainen; }) || kayttajanSometilit[0];
            valittuSometiliId = oletus.id;
        }

        const valittuTili = kayttajanSometilit.find(function(t) { return t.id === valittuSometiliId; });
        const sivunNimi = valittuTili ? valittuTili.sivun_nimi : null;

        const db = haeSupabaseAsiakas();

        try {
            const updatePayload = {
                status: uusiStatus,
                raw_text: muokattuRawTeksti,
                julkaisuteksti: muokattuTeksti,
                profile_id: valittuProfiili,
                target_channel: valittuKanava,
                alusta: valittuKanava,
                sometili_id: valittuSometiliId,
                sivun_nimi: sivunNimi,
                ajastettu_aika: kaynnistaPika ? null : (valittuAika ? new Date(valittuAika).toISOString() : null),
                julkaistu_aika: (kaynnistaPika || (uusiStatus === 'hyvaksytty' && !valittuAika)) ? new Date().toISOString() : null,
                julkaissut_kayttaja: (uusiStatus === 'hyvaksytty' || kaynnistaPika) ? nykyinenAsiakastunnus : null
            };

            const response = await fetch(db.url + '/rest/v1/somepostaukset?id=eq.' + id, {
                method: 'PATCH',
                headers: {
                    'apikey': db.key,
                    'Authorization': 'Bearer ' + localStorage.getItem('supabase_token'),
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(updatePayload)
            });

            if (!response.ok) throw new Error("Tilan päivitys epäonnistui palvelimella.");

            if (kaynnistaPika) {
                kaynnistaMakeSkenaario(id);
            } else if (uusiStatus === 'hyvaksytty') {
                naytaIlmoitus('✓ Julkaisu hyväksytty jonoon!');
            } else {
                naytaIlmoitus('✕ Julkaisu hylätty.', 'error');
            }

            setTimeout(haeValvomonTiedot, 1200);
        } catch (error) {
            naytaIlmoitus('Toiminto epäonnistui: ' + error.message, 'error');
        }
    }


    async function paivitaProfiiliKantaan(id, uusiProfiili) {
        if (uusiProfiili === 'Oma tyyli') {
            const sometiliSelect = document.getElementById('sometili-' + id);
            let tiliId = sometiliSelect ? sometiliSelect.value : null;

            if (!tiliId && kayttajanSometilit && kayttajanSometilit.length > 0) {
                const oletus = kayttajanSometilit.find(t => t.ensisijainen) || kayttajanSometilit[0];
                tiliId = oletus.id;
            }

            const valittuTili = kayttajanSometilit.find(t => t.id === tiliId);

            if (!valittuTili || !valittuTili.custom_brand_prompt) {
                alert("Et ole vielä määrittänyt omaa tyyliä tälle sivulle.\nVoit määrittää sen asetuksista.");
                const profSelect = document.getElementById('profiili-' + id);
                if (profSelect) profSelect.value = 'Yleinen';
                uusiProfiili = 'Yleinen';
            }
        }

        const db = haeSupabaseAsiakas();
        try {
            await fetch(db.url + '/rest/v1/somepostaukset?id=eq.' + id, {
                method: 'PATCH',
                headers: {
                    'apikey': db.key,
                    'Authorization': 'Bearer ' + localStorage.getItem('supabase_token'),
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    julkaisuprofiili: uusiProfiili,
                    profile_id: uusiProfiili
                })
            });
        } catch (e) {
            console.error("Profiilin tallennus epäonnistui:", e);
        }
    }

    async function paivitaSometiliKantaan(id, uusiTiliId) {
        const db = haeSupabaseAsiakas();
        const valittuTili = kayttajanSometilit.find(function(t) { return t.id === uusiTiliId; });
        const sivunNimi = valittuTili ? valittuTili.sivun_nimi : null;

        try {
            await fetch(db.url + '/rest/v1/somepostaukset?id=eq.' + id, {
                method: 'PATCH',
                headers: {
                    'apikey': db.key,
                    'Authorization': 'Bearer ' + localStorage.getItem('supabase_token'),
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    sometili_id: uusiTiliId || null,
                    sivun_nimi: sivunNimi
                })
            });
            naytaIlmoitus('✓ Kohdesivu päivitetty!');
        } catch (e) {
            console.error("Sometilin tallennus epäonnistui:", e);
        }
    }

    async function palautaEnsimmainenVersio(id) {
        if (!confirm("Haluatko varmasti palauttaa ensimmäisen AI-generoidun tekstiversion?")) {
            return;
        }

        const db = haeSupabaseAsiakas();
        const token = localStorage.getItem('supabase_token');

        try {
            const res = await fetch(db.url + '/rest/v1/somepostaukset?id=eq.' + id + '&select=alkuperainen_ai_teksti', {
                method: 'GET',
                headers: {
                    'apikey': db.key,
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();
            const haettuTeksti = data && data[0] ? data[0].alkuperainen_ai_teksti : null;

            if (!haettuTeksti) {
                naytaIlmoitus('⚠️ Alkuperäistä 1. versiota ei löytynyt tietokannasta.', 'error');
                return;
            }

            const updateRes = await fetch(db.url + '/rest/v1/somepostaukset?id=eq.' + id, {
                method: 'PATCH',
                headers: {
                    'apikey': db.key,
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    julkaisuteksti: haettuTeksti
                })
            });

            if (!updateRes.ok) {
                throw new Error("Tallennus tietokantaan epäonnistui.");
            }

            const tekstikentta = document.getElementById('teksti-' + id);
            if (tekstikentta) {
                tekstikentta.value = haettuTeksti;
            }

            naytaIlmoitus('✓ Ensimmäinen versio palautettu ja tallennettu!', 'success');

        } catch (err) {
            console.error("Virhe palautuksessa:", err);
            naytaIlmoitus('❌ Virhe palautettaessa 1. versiota: ' + err.message, 'error');
        }
    }



