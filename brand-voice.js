    // --- Keskusteleva brändiääni (erillinen nykyisestä julkaisutoiminnosta) ---
    const bvQuestions = {
      fi: [
        'Mitä yrityksesi tekee ja kenelle palvelusi tai tuotteesi on tarkoitettu?',
        'Jos yrityksesi olisi ihminen, millainen hänen luonteensa olisi?',
        'Millaisen vaikutelman haluat asiakkaallesi jättää?',
        'Miten haluat puhutella asiakkaita: esimerkiksi sinutellen, me-muodossa tai minä-muodossa?',
        'Millainen sävy sopii viestintään: rento, asiallinen, asiantunteva, innostava tai jotain muuta?',
        'Mitä arvoja, vahvuuksia tai lupauksia haluat nostaa esiin?',
        'Millaisia sanoja, ilmaisuja tai tyylejä haluat käyttää – ja mitä välttää?',
        'Miten suhtaudut huumoriin, tarinoihin, emojeihin ja suoriin myyntikehotuksiin?' 
      ],
      en: [
        'What does your business do, and who are your products or services for?',
        'If your business were a person, what would their personality be like?',
        'What impression should your customers take away?',
        'How would you like to address customers: personally, as a team, or in another way?',
        'What tone suits you: relaxed, professional, knowledgeable, enthusiastic, or something else?',
        'What values, strengths, or promises should your messages convey?',
        'Which words, expressions, or styles should you use or avoid?',
        'How do you feel about humor, stories, emojis, and direct sales invitations?'
      ],
      sv: [
        'Vad gör ditt företag, och för vem är era produkter eller tjänster avsedda?',
        'Om ditt företag var en person, hur skulle dess personlighet vara?',
        'Vilket intryck vill du lämna hos kunderna?',
        'Hur vill du tilltala kunderna: personligt, i vi-form eller på något annat sätt?',
        'Vilken ton passar: avslappnad, saklig, kunnig, inspirerande eller något annat?',
        'Vilka värderingar, styrkor eller löften vill du lyfta fram?',
        'Vilka ord, uttryck och stilar vill du använda eller undvika?',
        'Hur ser du på humor, berättelser, emojier och direkta säljuppmaningar?'
      ]
    };
    let bvAccountId = null;
    let bvDraft = null;
    let bvAnswers = Array(8).fill('');
    let bvStep = 0;
    let bvBusy = false;
    let bvOwner = false;
    let bvActivePrompt = '';
    let bvManualDirty = false;

    function bvText(key) {
      const lang = localStorage.getItem('solone_kieli') || 'fi';
      return (tekstit[lang] && tekstit[lang][key]) || tekstit.fi[key] || key;
    }
    function bvStatus(message, error) {
      const element = document.getElementById('bv-status');
      const inChat = document.getElementById('bv-chat').style.display === 'block';
      const inSetup = document.getElementById('bv-setup').style.display === 'block';
      // Show progress beside the action that started the AI request.
      const anchor = inChat ? document.getElementById('bv-send').parentElement
        : inSetup ? document.getElementById('bv-next').parentElement
        : document.getElementById('bv-context-guide');
      anchor.insertAdjacentElement('afterend', element);
      element.textContent = message || '';
      element.className = 'bv-status' + (error ? ' error' : message ? ' success' : '');
    }
    function bvAsetaVarattu(busy, messageKey) {
      bvBusy = busy;
      ['bv-prev','bv-skip','bv-next','bv-send','bv-approve','bv-restart','bv-begin-edit','bv-manual-open','bv-manual-save','bv-manual-cancel','bv-active-restart','bv-delete-active'].forEach(id => {
        const button = document.getElementById(id);
        if (button) button.disabled = busy;
      });
      if (busy) bvStatus(bvText(messageKey || 'bvWorking'));
    }
    async function bvRequest(action, extra = {}) {
      const db = haeSupabaseAsiakas();
      const token = localStorage.getItem('supabase_token');
      if (!token) throw new Error(bvText('bvLoginNeeded'));
      const response = await fetch(db.url + '/functions/v1/brand-voice', {
        method: 'POST',
        headers: {
          'apikey': db.key,
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, sometili_id: bvAccountId, ...extra })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) {
        throw new Error(data.error || ('HTTP ' + response.status));
      }
      return data;
    }
    function bvNaytaVaihe() {
      const language = localStorage.getItem('solone_kieli') || 'fi';
      document.getElementById('bv-step').textContent = bvText('bvQuestion') + ' ' + (bvStep + 1) + ' / 8';
      document.getElementById('bv-question').textContent = (bvQuestions[language] || bvQuestions.fi)[bvStep];
      document.getElementById('bv-answer').value = bvAnswers[bvStep] || '';
      document.getElementById('bv-prev').style.display = bvStep === 0 ? 'none' : 'inline-flex';
      document.getElementById('bv-next').textContent = bvStep === 7 ? bvText('bvGenerate') : bvText('bvNext');
    }
    function bvKerääVastaus() {
      bvAnswers[bvStep] = document.getElementById('bv-answer').value.trim();
    }
    function bvNaytaKysymykset() {
      document.getElementById('bv-active').style.display = 'none';
      document.getElementById('bv-delete-active-actions').style.display = 'none';
      document.getElementById('bv-setup').style.display = 'block';
      document.getElementById('bv-chat').style.display = 'none';
      const divider = document.getElementById('bv-draft-divider');
      if (divider) divider.style.display = 'none';
      bvNaytaVaihe();
    }
    function bvNaytaAktiivinen() {
      const active = !!bvActivePrompt;
      document.getElementById('bv-active').style.display = active ? 'block' : 'none';
      document.getElementById('bv-active-prompt').textContent = bvActivePrompt;
      document.getElementById('bv-delete-active-actions').style.display = active && bvOwner ? 'flex' : 'none';
      document.getElementById('bv-active-info').textContent = active ? bvText('bvActiveExists') : bvText('bvActiveMissing');
      document.getElementById('bv-active-actions').style.display = 'flex';
      document.getElementById('bv-begin-edit').style.display = bvOwner ? 'inline-flex' : 'none';
      document.getElementById('bv-active-restart').style.display = bvOwner ? 'inline-flex' : 'none';
      document.getElementById('bv-setup').style.display = active ? 'none' : 'block';
      document.getElementById('bv-chat').style.display = 'none';
      const divider = document.getElementById('bv-draft-divider');
      if (divider) divider.style.display = 'none';
      if (!active) bvNaytaVaihe();
    }
    function bvPeruTekstimuokkaus() {
      document.getElementById('bv-manual-editor').style.display = 'none';
      bvManualDirty = false;
    }
    function bvAvaaTekstimuokkaus() {
      if (bvBusy || !bvOwner || !bvDraft) return;
      const voice = bvDraft.current_voice || {};
      document.getElementById('bv-manual-input').value = String(voice.custom_brand_prompt || '');
      document.getElementById('bv-manual-editor').style.display = 'block';
      bvManualDirty = false;
    }
    async function bvAvaaMuokkaus() {
      if (bvBusy || !bvOwner) return;
      bvAsetaVarattu(true);
      try {
        const result = await bvRequest('begin_edit');
        bvDraft = result.draft;
        bvStatus('');
        bvNaytaKeskustelu();
      } catch (error) {
        bvStatus(error.message, true);
      } finally {
        bvAsetaVarattu(false);
      }
      if (bvDraft) bvAvaaTekstimuokkaus();
    }
    async function bvTallennaTeksti() {
      if (bvBusy || !bvOwner || !bvDraft) return;
      const prompt = document.getElementById('bv-manual-input').value.trim();
      if (!prompt) { bvStatus(bvText('bvManualRequired'), true); return; }
      bvAsetaVarattu(true);
      try {
        const result = await bvRequest('edit', { custom_brand_prompt: prompt, revision: bvDraft.revision });
        bvDraft = result.draft;
        bvPeruTekstimuokkaus();
        bvNaytaKeskustelu();
        bvStatus(bvText('bvManualSaved'));
      } catch (error) {
        bvStatus(error.message, true);
      } finally {
        bvAsetaVarattu(false);
      }
    }
    function bvNaytaKeskustelu() {
      // Näytä voimassa oleva brändiääni myös keskeneräisen luonnoksen rinnalla.
      // Aktiivinen ohje on tässä näkymässä vain luettavissa; luonnosta muokataan erikseen.
      const activeVisible = !!bvActivePrompt;
      document.getElementById('bv-active').style.display = activeVisible ? 'block' : 'none';
      document.getElementById('bv-active-prompt').textContent = bvActivePrompt;
      document.getElementById('bv-delete-active-actions').style.display = activeVisible && bvOwner ? 'flex' : 'none';
      document.getElementById('bv-active-actions').style.display = 'none';
      document.getElementById('bv-setup').style.display = 'none';
      // Erota käytössä oleva brändiääni keskeneräisestä luonnoksesta.
      const chatPanel = document.getElementById('bv-chat');
      let draftDivider = document.getElementById('bv-draft-divider');
      if (!draftDivider) {
        draftDivider = document.createElement('div');
        draftDivider.id = 'bv-draft-divider';
        draftDivider.setAttribute('role', 'heading');
        draftDivider.setAttribute('aria-level', '3');
        draftDivider.style.cssText = 'border-top:2px solid #cbd5e1;margin:24px 0 16px;padding:16px 14px 0;font-weight:700;font-size:1.05rem;color:#0f172a;';
        chatPanel.parentElement.insertBefore(draftDivider, chatPanel);
      }
      draftDivider.textContent = bvText('bvNewDraftHeading');
      draftDivider.style.display = activeVisible ? 'block' : 'none';
      chatPanel.style.display = 'block';
      const chatList = document.getElementById('bv-messages');
      chatList.replaceChildren();
      const messages = Array.isArray(bvDraft?.messages) ? bvDraft.messages : [];
      messages.forEach(msg => {
        if (!msg || !['user','assistant'].includes(msg.role)) return;
        const item = document.createElement('div');
        item.className = 'bv-message ' + msg.role;
        // Älä tulosta tekoälyn tekstiä HTML:nä.
        item.textContent = String(msg.content || '');
        chatList.appendChild(item);
        if (msg.role === 'assistant' && msg.next_question && !item.textContent.includes(msg.next_question)) {
          const question = document.createElement('div');
          question.className = 'bv-message assistant';
          question.textContent = String(msg.next_question);
          chatList.appendChild(question);
        }
      });
      if (messages.length === 0) {
        const item = document.createElement('div');
        item.className = 'bv-message assistant';
        item.textContent = bvText('bvNoMessages');
        chatList.appendChild(item);
      }
      chatList.scrollTop = chatList.scrollHeight;
      const voice = bvDraft?.current_voice || {};
      const prompt = typeof voice.custom_brand_prompt === 'string' ? voice.custom_brand_prompt : '';
      document.getElementById('bv-preview').style.display = prompt ? 'block' : 'none';
      document.getElementById('bv-voice-name').textContent = String(voice.brand_voice_name || '');
      document.getElementById('bv-voice-summary').textContent = String(voice.brand_voice_summary || '');
      document.getElementById('bv-voice-prompt').textContent = prompt;
      document.getElementById('bv-manual-actions').style.display = bvOwner && !!prompt ? 'flex' : 'none';
      // A saved AI draft can be explicitly approved by the owner even if
      // the AI offers further refinements (status 'draft').
      const canApprove = bvOwner && !!prompt && ['draft', 'ready'].includes(bvDraft?.status);
      document.getElementById('bv-approve').style.display = canApprove ? 'inline-flex' : 'none';
      document.getElementById('bv-approval-note').textContent =
        !bvOwner ? bvText('bvOwnerOnly') : canApprove ? bvText('bvReadyNote') : bvText('bvNotReady');
    }
    async function avaaBrandVoice(accountId) {
      if (!/^[a-f0-9-]{36}$/i.test(String(accountId))) return;
      bvAccountId = accountId;
      bvDraft = null;
      bvActivePrompt = '';
      bvPeruTekstimuokkaus();
      bvAnswers = Array(8).fill('');
      bvStep = 0;
      const tili = kayttajanSometilit.find(t => t.id === accountId);
      bvOwner = Boolean(tili && String(tili.asiakastunnus).toLowerCase() === String(nykyinenAsiakastunnus).toLowerCase());
      document.getElementById('bv-account-label').textContent = tili?.sivun_nimi || '';
      document.getElementById('bv-active-info').textContent = tili?.custom_brand_prompt ? bvText('bvActiveExists') : bvText('bvActiveMissing');
      document.getElementById('brand-voice-modal').style.display = 'flex';
      bvNaytaKysymykset();
      bvStatus('');
      bvAsetaVarattu(true);
      try {
        const result = await bvRequest('load');
        bvOwner = Boolean(result.can_approve);
        bvActivePrompt = typeof result.active_prompt === 'string' ? result.active_prompt : '';
        document.getElementById('bv-active-info').textContent = bvActivePrompt ? bvText('bvActiveExists') : bvText('bvActiveMissing');
        if (result.draft) {
          bvDraft = result.draft;
          bvNaytaKeskustelu();
        } else if (bvActivePrompt) {
          bvNaytaAktiivinen();
        }
        bvStatus('');
      } catch (error) {
        bvStatus(error.message, true);
      } finally {
        bvAsetaVarattu(false);
      }
    }
    function suljeBrandVoice() {
      if (bvBusy) return;
      if (document.getElementById('bv-manual-editor').style.display !== 'none' &&
          document.getElementById('bv-manual-input').value !==
          String(bvDraft?.current_voice?.custom_brand_prompt || '') &&
          !confirm(bvText('bvUnsavedConfirm'))) return;
      document.getElementById('brand-voice-modal').style.display = 'none';
    }
    function bvAloitaUudelleen() {
      if (bvBusy) return;
      if (document.getElementById('bv-manual-editor').style.display !== 'none' &&
          document.getElementById('bv-manual-input').value !== String(bvDraft?.current_voice?.custom_brand_prompt || '') &&
          !confirm(bvText('bvUnsavedConfirm'))) return;
      if (!confirm(bvText('bvRestartConfirm'))) return;
      bvDraft = null;
      bvPeruTekstimuokkaus();
      bvAnswers = Array(8).fill('');
      bvStep = 0;
      document.getElementById('bv-chat-input').value = '';
      bvStatus('');
      bvNaytaKysymykset();
    }
    function bvOhita() {
      if (bvBusy) return;
      document.getElementById('bv-answer').value = '';
      bvSiirry(1);
    }
    async function bvSiirry(delta) {
      if (bvBusy) return;
      bvKerääVastaus();
      if (delta < 0) {
        bvStep = Math.max(0, bvStep - 1);
        bvNaytaVaihe();
        return;
      }
      if (bvStep < 7) {
        bvStep++;
        bvNaytaVaihe();
        return;
      }
      if (bvAnswers.every(v => !v)) {
        bvStatus(bvText('bvNeedAnswer'), true);
        return;
      }
      bvAsetaVarattu(true, 'bvGenerating');
      try {
        const lang = localStorage.getItem('solone_kieli') || 'fi';
        const questions = bvQuestions[lang] || bvQuestions.fi;
        const initialAnswers = {};
        questions.forEach((question, i) => {
          initialAnswers['question_' + (i + 1)] = {
            question, answer: bvAnswers[i] || ''
          };
        });
        const response = await bvRequest('start', { initial_answers: initialAnswers });
        bvDraft = response.draft;
        bvNaytaKeskustelu();
        bvStatus(bvText('bvDraftSaved'));
      } catch (error) {
        bvStatus(error.message, true);
      } finally {
        bvAsetaVarattu(false);
      }
    }
    async function bvLahetaViesti() {
      if (bvBusy) return;
      if (document.getElementById('bv-manual-editor').style.display !== 'none' &&
          document.getElementById('bv-manual-input').value !== String(bvDraft?.current_voice?.custom_brand_prompt || '')) {
        bvStatus(bvText('bvSaveFirst'), true);
        return;
      }
      const input = document.getElementById('bv-chat-input');
      const message = input.value.trim();
      if (!message) return;
      bvAsetaVarattu(true, 'bvSending');
      try {
        const result = await bvRequest('chat', { user_message: message });
        bvDraft = result.draft;
        input.value = '';
        bvNaytaKeskustelu();
        bvStatus(bvText('bvDraftUpdated'));
      } catch (error) {
        bvStatus(error.message, true);
      } finally {
        bvAsetaVarattu(false);
      }
    }
    async function bvHyvaksy() {
      if (bvBusy || !bvOwner ||
          !['draft', 'ready'].includes(bvDraft?.status) ||
          !String(bvDraft?.current_voice?.custom_brand_prompt || '').trim()) return;
      if (document.getElementById('bv-manual-editor').style.display !== 'none' &&
          document.getElementById('bv-manual-input').value !== String(bvDraft?.current_voice?.custom_brand_prompt || '')) {
        bvStatus(bvText('bvSaveFirst'), true);
        return;
      }
      if (!confirm(bvText('bvApproveConfirm'))) return;
      bvAsetaVarattu(true);
      try {
        // Näytä hyväksytty ohje heti onnistuneen palvelinvastauksen jälkeen.
        const approvedPrompt = String(bvDraft.current_voice.custom_brand_prompt || '');
        const result = await bvRequest('approve');
        bvActivePrompt = approvedPrompt;
        bvDraft = null;
        bvPeruTekstimuokkaus();
        bvNaytaAktiivinen();
        const refreshed = await bvRequest('load');
        bvActivePrompt = String(refreshed.active_prompt || '');
        bvOwner = Boolean(refreshed.can_approve);
        bvNaytaAktiivinen();
        // Päivitä käytössä oleva Oma tyyli -tieto lataamalla nykyiset sometilit.
        await lataaKayttajanSometilit();
        paivitaAsetuksetListaHtml();
        bvStatus(result.warning || bvText('bvApproved'));
        document.getElementById('bv-approve').style.display = 'none';
        document.getElementById('bv-approval-note').textContent = bvText('bvApproved');
      } catch (error) {
        bvStatus(error.message, true);
      } finally {
        bvAsetaVarattu(false);
      }
    }

    // Poistaa vain aktiivisen brändiäänen; mahdollinen luonnos säilyy.
    async function bvPoistaAktiivinen() {
      if (bvBusy || !bvOwner || !bvActivePrompt.trim()) return;
      if (!confirm(bvText('bvDeleteConfirm'))) return;
      bvAsetaVarattu(true);
      try {
        await bvRequest('delete_active');
        bvActivePrompt = '';
        bvPeruTekstimuokkaus();
        if (bvDraft) bvNaytaKeskustelu();
        else bvNaytaAktiivinen();
        bvStatus(bvText('bvDeleted'));
        // Päivitetään tilikohtainen Oma tyyli -tieto ilman sivun uudelleenlatausta.
        try {
          await lataaKayttajanSometilit();
          paivitaAsetuksetListaHtml();
        } catch (refreshError) {
          console.warn('Sometilien näkymän päivitys ei onnistunut poistamisen jälkeen');
          bvStatus(bvText('bvDeletedRefreshWarning'), true);
        }
      } catch (error) {
        bvStatus(error.message, true);
      } finally {
        bvAsetaVarattu(false);
      }
    }
