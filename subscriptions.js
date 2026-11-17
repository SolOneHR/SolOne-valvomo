// SolOne Somevalvomo – nykyiset tilaukset ja käyttöoikeuden näyttö.
// Tulevan Holvi-maksuintegraation toteutus ei kuulu tähän vaiheeseen.
    async function avaaTilauksetModaali() {
        document.getElementById('tilaukset-modaali').style.display = 'flex';
        await haeKayttajanTilaukset();
    }

    function suljeTilauksetModaali() {
        document.getElementById('tilaukset-modaali').style.display = 'none';
    }

    function tilaOnAktiivinen() {
        return soloneOnAktiivinenTilaus !== false;
    }

    async function tarkistaAktiivinenTilausOhjaus() {
        if (!nykyinenAsiakastunnus) return;
        const db = haeSupabaseAsiakas();
        const token = localStorage.getItem('supabase_token');

        try {
            const resAsiakas = await fetch(db.url + '/rest/v1/asiakkaat?sahkoposti=eq.' + encodeURIComponent(nykyinenAsiakastunnus) + '&select=id', {
                method: 'GET',
                headers: { 'apikey': db.key, 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
            });
            const asiakasData = await resAsiakas.json();

            if (!asiakasData || asiakasData.length === 0) {
                soloneOnAktiivinenTilaus = false;
                paivitaValvomonLukitusTila(false);
                return;
            }

            const asiakasId = asiakasData[0].id;
            const resTilaukset = await fetch(db.url + '/rest/v1/tilaukset?asiakas_id=eq.' + asiakasId + '&status=eq.aktiivinen&select=id', {
                method: 'GET',
                headers: { 'apikey': db.key, 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
            });
            const tilauksetData = await resTilaukset.json();

            const onAktiivinen = tilauksetData && tilauksetData.length > 0;
            soloneOnAktiivinenTilaus = onAktiivinen;
            paivitaValvomonLukitusTila(onAktiivinen);

        } catch (e) {
            console.error("Virhe tilauksen tarkistuksessa:", e);
        }
    }

    function paivitaValvomonLukitusTila(aktiivinen) {
        const varoitusBanneri = document.getElementById('tilaus-varoitus-banneri');
        const uusiNappi = document.getElementById('nappi-uusi-luonnos');

        if (varoitusBanneri) {
            varoitusBanneri.style.display = aktiivinen ? 'none' : 'block';
        }
        if (uusiNappi) {
            uusiNappi.style.opacity = aktiivinen ? '1' : '0.4';
            uusiNappi.style.pointerEvents = aktiivinen ? 'auto' : 'none';
        }
    }

    async function haeKayttajanTilaukset() {
        const tilauksetLista = document.getElementById('tilaukset-lista');
        if (!tilauksetLista || !nykyinenAsiakastunnus) return;
        const db = haeSupabaseAsiakas();
        const token = localStorage.getItem('supabase_token');

        const aktiivinenKieli = localStorage.getItem('solone_kieli') || 'fi';
        const sanasto = tekstit[aktiivinenKieli];

        try {
            const headers = {
                'apikey': db.key,
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            };

            const resAsiakas = await fetch(db.url + '/rest/v1/asiakkaat?sahkoposti=eq.' + encodeURIComponent(nykyinenAsiakastunnus) + '&select=id', {
                method: 'GET',
                headers: headers
            });
            const asiakasData = await resAsiakas.json();

            if (!asiakasData || asiakasData.length === 0) {
                tilauksetLista.innerHTML = '<div class="tyhja-tila">Ei löytynyt asiakastietoja tälle sähköpostille.</div>';
                return;
            }

            const asiakasId = asiakasData[0].id;

            const resTilaukset = await fetch(db.url + '/rest/v1/tilaukset?asiakas_id=eq.' + asiakasId + '&select=id,status,tilaustyyppi,alku_pvm,loppu_pvm,palvelut(nimi)&order=luotu_aika.desc', {
                method: 'GET',
                headers: headers
            });
            const tilauksetData = await resTilaukset.json();

            if (!tilauksetData || tilauksetData.length === 0) {
                tilauksetLista.innerHTML = '<div class="tyhja-tila">Sinulla ei ole vielä tilauksia.</div>';
                return;
            }

            let html = '';
            tilauksetData.forEach(function(tilaus) {
                let tietokantaNimi = (tilaus.palvelut && tilaus.palvelut.nimi) ? tilaus.palvelut.nimi : 'Palvelu';
                let palvelunNimi = tietokantaNimi;

                const nimiPieni = tietokantaNimi.toLowerCase();
                if (nimiPieni.includes('tekijä') && nimiPieni.includes('kuukausi')) {
                    palvelunNimi = sanasto.serv_tekija_kk || tietokantaNimi;
                } else if (nimiPieni.includes('palveluyritys') && nimiPieni.includes('kuukausi')) {
                    palvelunNimi = sanasto.serv_palveluyritys_kk || tietokantaNimi;
                } else if (nimiPieni.includes('tiimi') && nimiPieni.includes('kuukausi')) {
                    palvelunNimi = sanasto.serv_tiimi_kk || tietokantaNimi;
                } else if (nimiPieni.includes('tekijä') && nimiPieni.includes('vuosi')) {
                    palvelunNimi = sanasto.serv_tekija_v || tietokantaNimi;
                } else if (nimiPieni.includes('personal') && nimiPieni.includes('vuosi')) {
                    palvelunNimi = sanasto.serv_personal_v || tietokantaNimi;
                } else if (nimiPieni.includes('tiimi') && nimiPieni.includes('vuosi')) {
                    palvelunNimi = sanasto.serv_tiimi_v || tietokantaNimi;
                } else if (nimiPieni.includes('personal') && nimiPieni.includes('kuukausi')) {
                    palvelunNimi = sanasto.serv_personal_kk || tietokantaNimi;
                } else if (nimiPieni.includes('palveluyritys') && nimiPieni.includes('vuosi')) {
                    palvelunNimi = sanasto.serv_palveluyritys_v || tietokantaNimi;
                }

                const alkuPvm = tilaus.alku_pvm ? new Date(tilaus.alku_pvm).toLocaleDateString(aktiivinenKieli === 'fi' ? 'fi-FI' : (aktiivinenKieli === 'sv' ? 'sv-SE' : 'en-US')) : '-';
                const loppuPvm = tilaus.loppu_pvm ? new Date(tilaus.loppu_pvm).toLocaleDateString(aktiivinenKieli === 'fi' ? 'fi-FI' : (aktiivinenKieli === 'sv' ? 'sv-SE' : 'en-US')) : sanasto.orderLifetime;
                const statusBadgeClass = tilaus.status === 'aktiivinen' ? 'tilamerkinta' : 'tilamerkinta kasittelyssa-badge';
                const statusTeksti = tilaus.status === 'aktiivinen' ? sanasto.orderActive : (tilaus.status || 'ei määritelty');

                let tilaustyyppiTeksti = tilaus.tilaustyyppi || '-';
                if (tilaustyyppiTeksti.toLowerCase() === 'ikuinen' || tilaustyyppiTeksti.toLowerCase() === 'lifetime') {
                    tilaustyyppiTeksti = sanasto.typeLifetime;
                }

                html += '<div class="julkaisu-card" style="margin-bottom: 15px; padding: 16px;">';
                html += '  <div class="' + statusBadgeClass + '">' + sanasto.orderStatus + ': ' + statusTeksti + '</div>';
                html += '  <div class="meta-info" style="margin-top: 10px;">';
                html += '    <span><strong>' + sanasto.orderService + ':</strong> ' + palvelunNimi + '</span>';
                html += '    <span><strong>' + sanasto.orderType + ':</strong> ' + tilaustyyppiTeksti + '</span>';
                html += '    <span><strong>' + sanasto.orderStart + ':</strong> ' + alkuPvm + '</span>';
                html += '    <span><strong>' + sanasto.orderEnd + ':</strong> ' + loppuPvm + '</span>';
                html += '  </div>';
                html += '</div>';
            });

            tilauksetLista.innerHTML = html;

        } catch (error) {
            console.error("Virhe tilauksien latauksessa:", error);
            tilauksetLista.innerHTML = '<div class="tyhja-tila">Virhe ladattaessa tilauksia.</div>';
        }
    }

