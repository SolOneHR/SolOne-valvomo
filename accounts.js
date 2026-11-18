// SolOne Somevalvomo – sometilien hallinta ja Meta-valtuutus.
// Vaihe 4: nykyinen koodi siirretty muuttamattomana hyväksytystä testi.html-versiosta.
    // Meta-tilinäkymän tekstit ovat kehitysversion yhteisessä kielisanastossa.
    // Meta-hallinnan tekstit vaihtuvat kielivalinnan mukana.
    const metaTilienSanasto = {
        fi: {
            modalSettingsTitle: '⚙️ Yhdistetyt sosiaalisen median tilit',
            metaConnectDesc: 'Yhdistä Facebook-sivut ja Instagram-ammattilaistilit automaattisesti:',
            btnConnectMetaText: 'Yhdistä Facebook ja Instagram',
            addPageTitle: '➕ Lisää uusi sivu / tili', addPageName: 'Sivun / profiilin nimi:',
            setPrimaryDefault: 'Aseta ensisijaiseksi sivuksi', btnAddAccount: '+ Tallenna uusi tili',
            fbId:'Facebook-sivun tunnus:', igId:'Instagram-tilin tunnus:', liId:'LinkedIn-organisaation URN / ID:',
            btnSaveTest:'Tallenna Meta-tilit (vain testikäyttäjä)',saveConfirm:'Tallennetaan Facebook- ja Instagram-tilit TESTIKÄYTTÄJÄLLE. Jatketaanko?',saveOk:(a,u)=>`✓ Meta-tilit tallennettu. Lisätty ${a}, päivitetty ${u} tiliä.`,diagnosticsTitle:'Vianmääritys', authTest:'🧪 Testaa Meta-tunnistautuminen', noAccounts:'Ei käytettävissä olevia tilejä. Lisää ensimmäinen alla.',
            loadError:'Sometilien lataus epäonnistui. Tarkista kirjautuminen ja käyttöoikeudet.',
            running:'Avataan Meta-valtuutus (ei tallennusta)...', savingRunning:'Avataan Meta-valtuutus ja tallennetaan tilit...', missingLogin:'Kirjaudu ensin Somevalvomoon.',
            selectionTitle:'Valitse SolOneen liitettävät Facebook-sivut:',selectionSave:'Tallenna valitut sivut',selectionCancel:'Peruuta',selectionMissing:'Valitse vähintään yksi sivu.',selectionLoading:'Haetaan valittavissa olevia sivuja...',selectionSaving:'Tallennetaan valitut sivut...',
            sdkFailed:'Meta-kirjautuminen ei ole käytettävissä. Päivitä sivu.',
            authCheck:'Tarkistetaan tunnistautumista...',authSuccess:'✅ Tunnistautuminen onnistui. Tietokantaa ei muutettu.',authFailed:'❌ Testi epäonnistui: ',
            authReceived:'Valtuutus saatu. Tarkistetaan Facebook- ja Instagram-tilit...',
            previewOk:(n,ig,fail)=>`✓ Meta-valtuutus toimii. Facebook-sivuja: ${n}, Instagram-ammattilaistilejä: ${ig}${fail ? `, Instagram-haun virheitä: ${fail}` : ''}. TESTI: mitään ei tallennettu Supabaseen.`,
            previewFail:'Meta-toiminto epäonnistui: ', cancelled:'Valtuutus peruutettiin tai ikkuna suljettiin.',
        },
        en: {
            modalSettingsTitle:'⚙️ Connected Social Accounts', metaConnectDesc:'Connect Facebook Pages and Instagram Professional accounts automatically:',
            btnConnectMetaText:'Connect Facebook & Instagram',
            addPageTitle:'➕ Add New Page / Account',addPageName:'Page / Profile Name:',
            setPrimaryDefault:'Set as primary default page',btnAddAccount:'+ Save new account',
            fbId:'Facebook Page ID:',igId:'Instagram Account ID:',liId:'LinkedIn Organization URN / ID:',
            btnSaveTest:'Save Meta accounts (test user only)',saveConfirm:'Save Facebook and Instagram accounts FOR THE TEST USER? Continue?',saveOk:(a,u)=>`✓ Meta accounts connected. Added ${a}, updated ${u} accounts.`,diagnosticsTitle:'Diagnostics',authTest:'🧪 Test Meta authentication',noAccounts:'No available accounts. Add your first account below.',
            loadError:'Could not load social accounts. Check your sign-in and access permissions.',
            running:'Opening Meta authorization (no saving)...', savingRunning:'Opening Meta authorization and connecting accounts...',missingLogin:'Please sign in first.',
            selectionTitle:'Select the Facebook Pages to connect to SolOne:',selectionSave:'Save selected Pages',selectionCancel:'Cancel',selectionMissing:'Select at least one Page.',selectionLoading:'Loading available Pages...',selectionSaving:'Saving selected Pages...',
            sdkFailed:'Meta login is unavailable. Reload the page.',
            authCheck:'Checking authentication...',authSuccess:'✅ Authentication succeeded. Database unchanged.',authFailed:'❌ Test failed: ',
            authReceived:'Authorization received. Checking Facebook and Instagram accounts...',
            previewOk:(n,ig,fail)=>`✓ Meta authorization works. Facebook Pages: ${n}, Instagram professional accounts: ${ig}${fail ? `, Instagram lookup errors: ${fail}` : ''}. TEST: nothing saved to Supabase.`,
            previewFail:'Meta operation failed: ',cancelled:'Authorization cancelled or window closed.',
        },
        sv: {
            modalSettingsTitle:'⚙️ Anslutna sociala mediekonton',metaConnectDesc:'Anslut Facebook-sidor och professionella Instagram-konton automatiskt:',
            btnConnectMetaText:'Anslut Facebook och Instagram',
            addPageTitle:'➕ Lägg till sida / konto',addPageName:'Sidans / profilens namn:',
            setPrimaryDefault:'Ange som standardsida',btnAddAccount:'+ Spara nytt konto',
            fbId:'Facebook-sidans ID:',igId:'Instagram-kontots ID:',liId:'LinkedIn-organisationens URN / ID:',
            btnSaveTest:'Spara Meta-konton (endast testanvändare)',saveConfirm:'Spara Facebook- och Instagram-konton FÖR TESTANVÄNDAREN? Fortsätta?',saveOk:(a,u)=>`✓ Meta-konton har sparats. Tillagda ${a}, uppdaterade ${u} konton.`,diagnosticsTitle:'Felsökning',authTest:'🧪 Testa Meta-autentisering',noAccounts:'Inga tillgängliga konton. Lägg till det första nedan.',
            loadError:'Kunde inte läsa in konton. Kontrollera inloggning och behörigheter.',
            running:'Öppnar Meta-auktorisering (sparar inte)...', savingRunning:'Öppnar Meta-auktorisering och ansluter konton...',missingLogin:'Logga in först.',
            selectionTitle:'Välj de Facebook-sidor som ska anslutas till SolOne:',selectionSave:'Spara valda sidor',selectionCancel:'Avbryt',selectionMissing:'Välj minst en sida.',selectionLoading:'Hämtar tillgängliga sidor...',selectionSaving:'Sparar valda sidor...',
            sdkFailed:'Meta-inloggning är inte tillgänglig. Ladda om sidan.',
            authCheck:'Kontrollerar autentiseringen...',authSuccess:'✅ Autentiseringen lyckades. Databasen är oförändrad.',authFailed:'❌ Testet misslyckades: ',
            authReceived:'Auktorisering mottagen. Kontrollerar Facebook och Instagram...',
            previewOk:(n,ig,fail)=>`✓ Meta-auktorisering fungerar. Facebook-sidor: ${n}, professionella Instagram-konton: ${ig}${fail ? `, Instagram-fel: ${fail}` : ''}. TEST: inget har sparats i Supabase.`,
            previewFail:'Meta-åtgärden misslyckades: ',cancelled:'Auktoriseringen avbröts eller fönstret stängdes.',
        }
    };
    function metaT(k) {
        const locale = localStorage.getItem('solone_kieli') || 'fi';
        return (metaTilienSanasto[locale] || metaTilienSanasto.fi)[k];
    }
    function paivitaMetaTilienKielet(kieli) {
        const labels = metaTilienSanasto[kieli] || metaTilienSanasto.fi;
        ['modalSettingsTitle','metaConnectDesc','btnConnectMetaText','addPageTitle','addPageName','setPrimaryDefault','btnAddAccount'].forEach(key => {
            const el = document.querySelector('#asetukset-modaali [data-i18n="' + key + '"]');
            if (el) el.textContent = labels[key];
        });
        document.querySelectorAll('#asetukset-modaali [data-meta-l10n]').forEach(el => {
            el.textContent = labels[el.dataset.metaL10n] || el.textContent;
        });
        const title = document.getElementById('meta-selection-title');
        if (title) title.textContent = labels.selectionTitle;
        const save = document.getElementById('meta-save-selected');
        if (save) save.textContent = labels.selectionSave;
        const cancel = document.getElementById('meta-cancel-selected');
        if (cancel) cancel.textContent = labels.selectionCancel;
        const testButton = document.querySelector('#asetukset-modaali button[onclick="testaaMetaAuthYhteys()"]');
        if (testButton) testButton.textContent = labels.authTest;
    }

    async function lataaKayttajanSometilit() {
        const sharedContext = haeJaetunAsiakkuudenNaytto();
        if (sharedContext) {
            // Nämä ovat vain valikoiden näyttötietoja; oikeus tarkistetaan aina Edge Functionissa.
            const permitted = (sharedContext.channels || []).filter(c => c.saa_luonnostella || c.saa_julkaista);
            kayttajanSometilit = [...new Map(permitted.map(c => [c.sometili_id, {
                id: c.sometili_id, sivun_nimi: c.nimi || 'Jaettu tili', ensisijainen: false,
                asiakastunnus: '', jaetut_kanavat: permitted.filter(x => x.sometili_id === c.sometili_id).map(x => x.kanava)
            }])).values()];
            sometilienLatausVirhe = false;
            return;
        }
        if (!nykyinenAsiakastunnus) return;
        const db = haeSupabaseAsiakas();
        const token = localStorage.getItem('supabase_token');

        try {
            sometilienLatausVirhe = false;
            const headers = {
                'apikey': db.key,
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            };

            const resOmat = await fetch(db.url + '/rest/v1/asiakkaan_sometilit?asiakastunnus=eq.' + encodeURIComponent(nykyinenAsiakastunnus) + '&order=ensisijainen.desc', {
                method: 'GET',
                headers: headers
            });
            if (!resOmat.ok) throw new Error('asiakkaan_sometilit HTTP ' + resOmat.status);
            const omatTilit = await resOmat.json();
            if (!Array.isArray(omatTilit)) throw new Error('Invalid own accounts response');

            const jaetutTilit = await haeJaetutSometilit(db, headers, nykyinenAsiakastunnus);

            const tilitKartta = new Map();
            omatTilit.forEach(t => tilitKartta.set(t.id, t));
            jaetutTilit.forEach(t => {
                if (!tilitKartta.has(t.id)) {
                    tilitKartta.set(t.id, t);
                }
            });

            kayttajanSometilit = Array.from(tilitKartta.values());
        } catch (e) {
            sometilienLatausVirhe = true;
            console.error("Virhe ladattaessa sometilejä:", e);
        }
    }

    function tarkistaOmaTyyliValinta(selectElem, tiliSelectId) {
        if (!selectElem || selectElem.value !== 'Oma tyyli') return;

        let tiliId = null;
        const tiliSelect = document.getElementById(tiliSelectId);
        if (tiliSelect && tiliSelect.value) {
            tiliId = tiliSelect.value;
        } else if (kayttajanSometilit && kayttajanSometilit.length > 0) {
            const oletus = kayttajanSometilit.find(t => t.ensisijainen) || kayttajanSometilit[0];
            tiliId = oletus.id;
        }

        const valittuTili = kayttajanSometilit.find(t => t.id === tiliId);

        if (!valittuTili || !valittuTili.custom_brand_prompt) {
            alert("Et ole vielä määrittänyt omaa tyyliä tälle sivulle.\nVoit määrittää sen asetuksista.");
            selectElem.value = 'Yleinen';
        }
    }

    // Kehitysvaihe 3: jaetun asiakkuuden kanavat esitetään vain lukunäkymänä.
    // my_access on jo varmistanut jäsenyyden palvelimella. Selaimen tieto ei
    // kuitenkaan oikeuta mihinkään kirjoitus- tai julkaisutoimintoon.
    function haeJaetunAsiakkuudenNaytto() {
        const context = typeof window.haeValittuTyoskentelyAsiakkuus === 'function'
            ? window.haeValittuTyoskentelyAsiakkuus() : null;
        return context?.rooli === 'alikayttaja' ? context : null;
    }

    function naytaJaetutKanavatLukutilassa(context) {
        const lista = document.getElementById('sometilit-lista');
        if (!lista) return;
        lista.replaceChildren();
        lista.style.color = '';
        const kieli = localStorage.getItem('solone_kieli') || 'fi';
        const labels = {
            fi: { empty: 'Ei näytettäviä sometilioikeuksia.', shared: 'Jaettu käyttöoikeus', draft: 'Luonnostelu', publish: 'Julkaisu', brand: 'Brändiääni', note: 'Oikeuksien tarkastelu. Toiminnot avataan myöhemmässä kehitysvaiheessa.' },
            en: { empty: 'No channel permissions to display.', shared: 'Shared access', draft: 'Drafting', publish: 'Publishing', brand: 'Brand voice', note: 'Permissions view only. Actions will be enabled in a later development phase.' },
            sv: { empty: 'Inga kanalbehörigheter att visa.', shared: 'Delad åtkomst', draft: 'Utkast', publish: 'Publicering', brand: 'Varumärkesröst', note: 'Endast behörighetsvisning. Funktionerna aktiveras i ett senare utvecklingssteg.' }
        }[kieli] || {
            empty: 'Ei näytettäviä sometilioikeuksia.', shared: 'Jaettu käyttöoikeus', draft: 'Luonnostelu', publish: 'Julkaisu', brand: 'Brändiääni', note: 'Oikeuksien tarkastelu. Toiminnot avataan myöhemmässä kehitysvaiheessa.'
        };
        const visible = (Array.isArray(context.channels) ? context.channels : []).filter(c =>
            ['facebook', 'instagram', 'linkedin'].includes(c.kanava) &&
            (c.saa_luonnostella || c.saa_julkaista || c.saa_muokata_brandia));
        if (!visible.length) {
            const empty = document.createElement('p');
            empty.style.cssText = 'font-size:.85rem;color:var(--text-muted);';
            empty.textContent = labels.empty;
            lista.appendChild(empty);
            return;
        }
        const channelNames = { facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn' };
        for (const channel of visible) {
            // Sama korttipohja kuin omilla sometileillä; oikeusdata luetaan my_access-vastauksesta.
            const card = document.createElement('div');
            card.style.cssText = 'border:1px solid var(--border-color);border-radius:8px;padding:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;background:#fff;flex-wrap:wrap;';
            const body = document.createElement('div');
            const name = document.createElement('strong');
            name.style.fontSize = '.95rem';
            name.textContent = channelNames[channel.kanava] + ' · ' + (channel.nimi || '');
            body.appendChild(name);
            const shared = document.createElement('span');
            shared.style.cssText = 'font-size:.75rem;background:#64748b;color:#fff;padding:2px 6px;border-radius:4px;margin-left:6px;';
            shared.textContent = labels.shared;
            body.appendChild(shared);
            body.appendChild(document.createElement('br'));
            const rights = [];
            if (channel.saa_luonnostella) rights.push(labels.draft);
            if (channel.saa_julkaista) rights.push(labels.publish);
            if (channel.saa_muokata_brandia) rights.push(labels.brand);
            const details = document.createElement('span');
            details.style.cssText = 'font-size:.8rem;color:var(--text-muted);';
            details.textContent = rights.join(' · ');
            body.appendChild(details);
            card.appendChild(body);
            lista.appendChild(card);
        }
        const note = document.createElement('p');
        note.style.cssText = 'font-size:.8rem;color:var(--text-muted);margin:0;';
        note.textContent = labels.note;
        lista.appendChild(note);
    }

    async function avaaAsetuksetModaali() {
        const jaettu = haeJaetunAsiakkuudenNaytto();
        if (!jaettu) await lataaKayttajanSometilit();
        paivitaAsetuksetListaHtml();

        // Vain lukunäkymä alikäyttäjälle: älä näytä Meta-kytkentää tai
        // sometilin lisäyslomaketta ennen kanavakohtaisten oikeuksien valvontaa.
        const metaConnect = document.getElementById('btnConnectMeta')?.parentElement;
        if (metaConnect) metaConnect.style.display = jaettu ? 'none' : '';
        const lomakeLohko = document.getElementById('lisaa-sivu-lomake-lohko');
        if (lomakeLohko) lomakeLohko.style.display = jaettu ? 'none' : '';
        if (lomakeLohko) {
            lomakeLohko.style.opacity = tilaOnAktiivinen() ? '1' : '0.4';
            lomakeLohko.style.pointerEvents = tilaOnAktiivinen() ? 'auto' : 'none';
        }

        document.getElementById('asetukset-modaali').style.display = 'flex';
        paivitaMetaTilienKielet(localStorage.getItem('solone_kieli') || 'fi');
        // Palvelin määrää, voiko tämä testikäyttäjä tallentaa. Pelkkä HTML ei voi sallia sitä.

    }

    function suljeAsetuksetModaali() {
        document.getElementById('asetukset-modaali').style.display = 'none';
        haeValvomonTiedot();
    }

    function paivitaAsetuksetListaHtml() {
        const lista = document.getElementById('sometilit-lista');
        if (!lista) return;

        const jaettu = haeJaetunAsiakkuudenNaytto();
        if (jaettu) {
            naytaJaetutKanavatLukutilassa(jaettu);
            return;
        }

        const aktiivinenKieli = localStorage.getItem('solone_kieli') || 'fi';
        const sanasto = tekstit[aktiivinenKieli];

        if (sometilienLatausVirhe) {
            lista.textContent = metaT('loadError');
            lista.style.color = '#b91c1c';
            return;
        }
        lista.style.color = '';
        if (!kayttajanSometilit || kayttajanSometilit.length === 0) {
            lista.innerHTML = '<div style="font-size: 0.85rem; color: var(--text-muted);">' + metaT('noAccounts') + '</div>';
            return;
        }

        const aktiivinen = tilaOnAktiivinen();

        let html = '';
        kayttajanSometilit.forEach(function(tili) {
            const onOmaTili = (tili.asiakastunnus === nykyinenAsiakastunnus);

            html += '<div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center; background: ' + (tili.ensisijainen ? '#f0fdf4' : '#ffffff') + ';">';
            html += '  <div>';
            html += '    <strong style="font-size: 0.95rem;">' + (tili.sivun_nimi || 'Nimetön sivu') + '</strong>';
            
            if (tili.ensisijainen) {
                html += ' <span style="font-size: 0.75rem; background: var(--success); color: white; padding: 2px 6px; border-radius: 4px;">' + sanasto.tagEnsisijainen + '</span>';
            }
            if (!onOmaTili) {
                html += ' <span style="font-size: 0.75rem; background: #64748b; color: white; padding: 2px 6px; border-radius: 4px;">' + sanasto.tagJaettuOikeus + '</span>';
            }

            html += '<br>';
            html += '    <span style="font-size: 0.8rem; color: var(--text-muted);">FB: ' + (tili.fb_page_id || '-') + ' | IG: ' + (tili.ig_account_id || '-') + ' | LI: ' + (tili.linkedin_org_id || '-') + '</span>';
            html += '  </div>';
            
            if (aktiivinen) {
                html += '  <div style="display: flex; gap: 6px;">';
                // Brändiäänen luonti on käytettävissä myös oikeutetulle alikäyttäjälle.
                html += '    <button type="button" class="btn-testi bv-open-button" data-brand-account="' + String(tili.id).replace(/[^a-f0-9-]/gi, '') + '" style="font-size:0.75rem;padding:4px 8px;width:auto;background:#1e3a8a;">' + (sanasto.bvOpen || '🎯 Oma brändiääni') + '</button>';
                if (onOmaTili) {
                    if (!tili.ensisijainen) {
                        html += '    <button class="btn-ulos" style="color: var(--primary); border-color: var(--primary); font-size: 0.75rem; padding: 4px 8px; width: auto;" onclick="asetaEnsisijaiseksi(\'' + tili.id + '\')">' + sanasto.btnAsetaOletukseksi + '</button>';
                    }
                    html += '    <button class="btn-ulos" style="color: var(--danger); border-color: var(--danger); font-size: 0.75rem; padding: 4px 8px; width: auto;" onclick="poistaSometili(\'' + tili.id + '\')">' + sanasto.btnPoista + '</button>';
                }
                html += '  </div>';
            } else {
                html += '  <div style="font-size: 0.75rem; color: var(--danger); font-weight: 600;">' + sanasto.lukittuTilaus + '</div>';
            }
            
            html += '</div>';
        });
        lista.innerHTML = html;
        lista.querySelectorAll('.bv-open-button').forEach(function(button) {
            button.addEventListener('click', function() {
                avaaBrandVoice(button.dataset.brandAccount);
            });
        });
    }

    async function lisaaUusiSometiliKantaan() {
        if (!tilaOnAktiivinen()) {
            alert("Sometilien lisäys vaatii voimassa olevan ja aktiivisen tilauksen.");
            return;
        }

        const nimi = document.getElementById('uusi-asetus-nimi').value.trim() || 'Oma sivu';
        const fbId = document.getElementById('uusi-asetus-fb-id').value.trim();
        const igId = document.getElementById('uusi-asetus-ig-id').value.trim();
        const linkedinId = document.getElementById('uusi-asetus-linkedin-id').value.trim();
        const ensisijainen = document.getElementById('uusi-asetus-ensisijainen').checked || kayttajanSometilit.length === 0;
        const db = haeSupabaseAsiakas();
        const token = localStorage.getItem('supabase_token');

        if (!fbId && !igId && !linkedinId) {
            alert("Syötä vähintään Facebook Page ID, Instagram Account ID tai LinkedIn Organization ID!");
            return;
        }

        try {
            if (ensisijainen && kayttajanSometilit.length > 0) {
                await fetch(db.url + '/rest/v1/asiakkaan_sometilit?asiakastunnus=eq.' + encodeURIComponent(nykyinenAsiakastunnus), {
                    method: 'PATCH',
                    headers: { 'apikey': db.key, 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                    body: JSON.stringify({ ensisijainen: false })
                });
            }

            const res = await fetch(db.url + '/rest/v1/asiakkaan_sometilit', {
                method: 'POST',
                headers: { 'apikey': db.key, 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                body: JSON.stringify([{
                    asiakastunnus: nykyinenAsiakastunnus,
                    sivun_nimi: nimi,
                    fb_page_id: fbId || null,
                    ig_account_id: igId || null,
                    linkedin_org_id: linkedinId || null,
                    ensisijainen: ensisijainen,
                    aktiivinen: true
                }])
            });

            if (!res.ok) throw new Error("Tallennus epäonnistui");

            document.getElementById('uusi-asetus-nimi').value = '';
            document.getElementById('uusi-asetus-fb-id').value = '';
            document.getElementById('uusi-asetus-ig-id').value = '';
            document.getElementById('uusi-asetus-linkedin-id').value = '';
            document.getElementById('uusi-asetus-ensisijainen').checked = false;

            await lataaKayttajanSometilit();
            paivitaAsetuksetListaHtml();
            naytaIlmoitus('✓ Uusi sivu lisätty onnistuneesti!', 'success');
        } catch (err) {
            alert("Virhe lisättäessä sivua: " + err.message);
        }
    }

    async function asetaEnsisijaiseksi(tiliId) {
        if (!tilaOnAktiivinen()) return;
        const db = haeSupabaseAsiakas();
        const token = localStorage.getItem('supabase_token');
        try {
            await fetch(db.url + '/rest/v1/asiakkaan_sometilit?asiakastunnus=eq.' + encodeURIComponent(nykyinenAsiakastunnus), {
                method: 'PATCH',
                headers: { 'apikey': db.key, 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                body: JSON.stringify({ ensisijainen: false })
            });

            await fetch(db.url + '/rest/v1/asiakkaan_sometilit?id=eq.' + tiliId, {
                method: 'PATCH',
                headers: { 'apikey': db.key, 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
                body: JSON.stringify({ ensisijainen: true })
            });

            await lataaKayttajanSometilit();
            paivitaAsetuksetListaHtml();
        } catch (e) {
            console.error("Virhe asetettaessa ensisijaiseksi:", e);
        }
    }

    async function poistaSometili(tiliId) {
        if (!tilaOnAktiivinen()) return;
        if (!confirm("Haluatko varmasti poistaa tämän sivukytkennän?")) return;
        const db = haeSupabaseAsiakas();
        const token = localStorage.getItem('supabase_token');
        try {
            await fetch(db.url + '/rest/v1/asiakkaan_sometilit?id=eq.' + tiliId, {
                method: 'DELETE',
                headers: { 'apikey': db.key, 'Authorization': 'Bearer ' + token }
            });
            await lataaKayttajanSometilit();
            paivitaAsetuksetListaHtml();
        } catch (e) {
            console.error("Virhe poistettaessa:", e);
        }
    }

    // Kehitysversion testi: käyttää sisäänkirjautuneen käyttäjän JWT:tä automaattisesti.
    // Ei kutsu Meta API:a eikä tee tietokantamuutoksia.
    async function testaaMetaAuthYhteys() {
        const status = document.getElementById('meta-auth-test-status');
        const token = localStorage.getItem('supabase_token');
        const db = haeSupabaseAsiakas();
        if (!token) {
            status.textContent = '❌ ' + metaT('missingLogin');
            status.style.color = '#b91c1c';
            return;
        }
        status.textContent = '⏳ ' + metaT('authCheck');
        status.style.color = '#334155';
        try {
            const response = await fetch(db.url + '/functions/v1/meta-auth-test', {
                method: 'POST',
                headers: {
                    'apikey': db.key,
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'auth-test' })
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !data.success || !data.authenticated || !data.dry_run) {
                throw new Error(data.error || 'HTTP ' + response.status);
            }
            status.textContent = metaT('authSuccess');
            status.style.color = '#047857';
        } catch (error) {
            status.textContent = metaT('authFailed') + error.message;
            status.style.color = '#b91c1c';
        }
    }

    // Käytetään vanhan tuotanto-Somevalvomon virallista Meta FB.login -valtuutusta.
    // Käyttäjä tunnistetaan Supabase Auth JWT:llä. Sivut tallentaa vain Edge Function.
    function kaynnistaMetaOAuth() {
        const status = document.getElementById('meta-oauth-status');
        status.style.display = 'block';
        status.style.color = '#2563eb';
        status.textContent = 'Avataan Meta-valtuutus...';
        const token = localStorage.getItem('supabase_token');
        if (!token) {
            status.style.color = '#b91c1c';
            status.textContent = metaT('missingLogin');
            return;
        }
        if (!window.FB || typeof FB.login !== 'function') {
            status.style.color = '#b91c1c';
            status.textContent = metaT('sdkFailed');
            return;
        }
        FB.login(function(response) {
            if (!response || !response.authResponse || !response.authResponse.accessToken) {
                status.style.color = '#b91c1c';
                status.textContent = metaT('cancelled');
                return;
            }
            status.textContent = 'Valtuutus saatu. Tallennetaan Metan myöntämät sivut...';
            const db = haeSupabaseAsiakas();
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 60000);
            fetch(db.url + '/functions/v1/meta-auth-test', {
                method: 'POST',
                headers: {
                    'apikey': db.key,
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'save',
                    confirm: 'TALLENNA_META_TILIT',
                    shortLivedToken: response.authResponse.accessToken
                }),
                signal: controller.signal
            }).then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok || !data.success || data.dry_run !== false) {
                    throw new Error(data.error || ('HTTP ' + res.status));
                }
                status.style.color = '#047857';
                status.textContent = metaT('saveOk')(data.added || 0, data.updated || 0);
                await lataaKayttajanSometilit();
                paivitaAsetuksetListaHtml();
            }).catch((err) => {
                status.style.color = '#b91c1c';
                status.textContent = 'Virhe tallennuksessa: ' +
                    (err.name === 'AbortError' ? 'Pyyntö aikakatkaistiin.' : err.message);
            }).finally(() => clearTimeout(timeout));
        }, {
            scope: 'pages_show_list,pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,business_management',
            auth_type: 'rerequest'
        });
    }
