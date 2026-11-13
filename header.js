// header.js - Keskitetty yläpalkki ja älykäs kielen vaihto
document.addEventListener("DOMContentLoaded", function() {
    const ylaNavigointiKontti = document.getElementById('yla-navigointi-kontti');
    if (!ylaNavigointiKontti) return;

    const nykyinenSivu = window.location.pathname.split('/').pop() || 'index.html';
    const onkoEnglanti = document.cookie.includes('googtrans=/fi/en');

    ylaNavigointiKontti.innerHTML = `
        <style>
            .goog-te-banner-frame { display: none !important; }
            body { top: 0px !important; }
            .goog-tooltip { display: none !important; }
            .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }

            .kieli-nappi {
                background: #f8fafc;
                border: 1px solid var(--border-color);
                color: var(--text-main);
                padding: 5px 10px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }
            .kieli-nappi:hover {
                border-color: var(--primary);
                color: var(--primary);
                background-color: #f1f5f9;
            }
        </style>

        <header class="asiakasportaalipalkki">
            <div class="logo-nav-group">
                <a href="index.html" class="logo-palkki notranslate">
                    <span class="sol">Sol</span><span class="one"><span class="optinen-o">O</span>ne</span>
                </a>
                
                <button class="hampurilainen-btn" onclick="toggleMobiilivalikko()" aria-label="Avaa valikko">
                    <svg id="hampurilainen-ikoni" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>

                <nav class="paanavigaatio" id="paanavigaatio">
                    <a href="index.html" class="${nykyinenSivu === 'index.html' ? 'aktiivinen' : ''}">Etusivu</a>
                    <a href="palvelupaketit.html" class="${nykyinenSivu === 'palvelupaketit.html' ? 'aktiivinen' : ''}">Palvelupaketit</a>
                    <a href="personal.html" class="${nykyinenSivu === 'personal.html' ? 'aktiivinen' : ''}">SolOne Personal</a>
                    <a href="solonentarina.html" class="${nykyinenSivu === 'solonentarina.html' ? 'aktiivinen' : ''}">SolOnen tarina</a>
                    <a href="index.html#tyokalut">Työkalut</a>
                    <a href="index.html#uutiset">Uutiset</a>
                    <a href="yhteystiedot.html" class="${nykyinenSivu === 'yhteystiedot.html' ? 'aktiivinen' : ''}">Yhteystiedot</a>
                </nav>
            </div>

            <div class="portaali-toiminnot" style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                
                <button class="kieli-nappi notranslate" onclick="vaihdaKieli('${onkoEnglanti ? 'fi' : 'en'}')">
                    🌐 ${onkoEnglanti ? 'Suomi (FI)' : 'English (EN)'}
                </button>

                <!-- Piilotettu Googlen kääntäjäelementti -->
                <div id="google_translate_element" style="display: none;"></div>

                <div id="portaali-vieras">
                    <span class="portal-linkki" onclick="vaihdaLomakeNakyvyys()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 15px; height: 15px; color: var(--primary);">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Asiakasportaali / Kirjaudu
                    </span>
                </div>
                <div id="portaali-kirjautunut" style="display: none;">
    <span style="color: var(--text-muted); font-size: 13px; font-weight: 500;" id="kayttaja-tunnus" class="notranslate"></span>
    <a href="pikasyotto.html" class="btn-pika-linkki notranslate">⚡ Pika</a>
    <a href="somevalvomo.html" class="btn-valvomo-linkki notranslate">💻 Avaa Somevalvomo</a>
    <button class="btn-ulos-pieni notranslate" onclick="kirjauduUlos()">Ulos</button>
</div>
            </div>
        </header>
    `;

    if (!document.getElementById('google-translate-script')) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(script);
    }
});

window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
        pageLanguage: 'fi',
        includedLanguages: 'en,fi',
        autoDisplay: false
    }, 'google_translate_element');
};

// Älykäs kielen vaihto turvakaistoilla
function vaihdaKieli(haluttuKieli) {
    const select = document.querySelector('.goog-te-combo');
    
    if (select) {
        // Jos Googlen elementti on valmiina, vaihdetaan kieli suoraan sen kautta
        select.value = haluttuKieli;
        select.dispatchEvent(new Event('change'));
        
        // Päivitetään myös nappi ja eväste taustalle
        if (haluttuKieli === 'en') {
            document.cookie = "googtrans=/fi/en; path=/";
        } else {
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "googtrans=/fi/fi; path=/";
        }
        
        // Pieni viive ja sivun päivitys varmistamaan, että käännös piirtyy oikein
        setTimeout(() => { window.location.reload(); }, 300);
    } else {
        // Varaturvakaista: jos elementti ei ehtinyt latautua, käytetään evästettä ja latausta
        if (haluttuKieli === 'en') {
            document.cookie = "googtrans=/fi/en; path=/";
        } else {
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "googtrans=/fi/fi; path=/";
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + document.domain + "; path=/;";
        }
        window.location.reload();
    }
}

function toggleMobiilivalikko() {
    const navi = document.getElementById('paanavigaatio');
    if (navi) navi.classList.toggle('auki');
}