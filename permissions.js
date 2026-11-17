// SolOne Somevalvomo – alikäyttäjille jaettujen sometilien nykyinen haku.
// Rakenneuudistus vaihe 5: ei uusia oikeuksia eikä muutoksia tarkistuksiin.
async function haeJaetutSometilit(db, headers, nykyinenAsiakastunnus) {
            const resJaetut = await fetch(db.url + '/rest/v1/v_kayttajaoikeudet?user_email=eq.' + encodeURIComponent(nykyinenAsiakastunnus), {
                method: 'GET',
                headers: headers
            });
            if (!resJaetut.ok) throw new Error('v_kayttajaoikeudet HTTP ' + resJaetut.status);
            const jaetutTilit = await resJaetut.json();
            if (!Array.isArray(jaetutTilit)) throw new Error('Invalid shared accounts response');

            return jaetutTilit;
}
