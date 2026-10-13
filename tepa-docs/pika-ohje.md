# SolOne Pika (mobiilisovellus / pikasyöttö) – Käyttö ja vianratkaisu

## Yleiskuvaus
SolOne Pika on mobiilikäyttöön tarkoitettu pikatyökalu (PWA), jolla voit tallentaa kuvan ja nopean aiheen suoraan puhelimestasi kentältä. Tekoäly muotoilee tekstin valmiiksi taustalla, ja voit tarkistaa sekä hyväksyä julkaisun suoraan sovelluksesta.

## Yleisimmät ongelmat ja ratkaisut

1. **Julkaisu jää tilaan "Käsittelyssä":**
   * *Syy:* Yhteys taustaprosessiin on saattanut katketa hetkellisesti heikon mobiiliverkon (4G/5G) vuoksi.
   * *Ratkaisu:* Tarkista verkkoyhteys, päivitä sivu tai siirry täyteen Somevalvomoon tarkistamaan julkaisun tila.

2. **Kamera ei aukea puhelimessa:**
   * *Syy:* Selaimen käyttöoikeudet kameran käyttöön on estetty puhelimen laiteasetuksissa.
   * *Ratkaisu:* Salli selaimelle (Safari / Chrome) kameran käyttö puhelimen asetuksista, tai käytä vaihtoehtoista tiedostovalitsinta ja valitse kuva suoraan puhelimen galleriasta.

3. **Kirjautuminen katkeaa tai tulee "Failed to fetch" -virhe:**
   * *Syy:* Istuntotunniste on vanhentunut, jos sovellus on ollut pitkään taustalla ilman verkkoyhteyttä.
   * *Ratkaisu:* Kirjaudu kerran uudelleen sisään SolOne-tunnuksillasi; sovellus pitää tämän jälkeen kirjautumisen voimassa automaattisesti taustalla.

4. **Sometiliä ei löydy / virhe tilin sidonnassa:**
   * *Syy:* Käyttäjällä ei ole aktiivista oletussivua määritettynä tai kanavayhteys vaatii päivitystä päävalvomon puolella.
   * *Ratkaisu:* Varmista Somevalvomon asetuksista, että Meta- tai LinkedIn-tilit on yhdistetty onnistuneesti.