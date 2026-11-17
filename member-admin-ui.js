// SolOne Somevalvomo – erillinen käyttäjähallinnan käyttöliittymä.
// Ei muuta nykyistä permissions.js-tilihakua tai olemassa olevia oikeuksia.
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const dictionaries = {
    fi: { title:'Käyttäjät ja käyttöoikeudet', open:'👥 Käyttäjähallinta',close:'Sulje', customer:'Hallinnoitava asiakkuus',invite:'Kutsu käyttäjä sähköpostitse',send:'Lähetä kutsu',save:'Tallenna oikeudet',cancel:'Sulje muokkaus',rights:'Sometilikohtaiset oikeudet', members:'Käyttäjätilit',pending:'Odottaa hyväksyntää',active:'Aktiivinen',owner:'Pääkäyttäjä',admin:'Pääkäyttäjä',sub:'Jaettu käyttöoikeus', edit:'Muokkaa oikeuksia',remove:'Poista',cancelInvite:'Peru kutsu',invitations:'Sinulle lähetetyt kutsut',accept:'Hyväksy kutsu',loading:'Ladataan…',empty:'Ei hallittavia asiakkuuksia tai avoimia kutsuja.',draft:'Luonnostelu (sisältää tekoälymuotoilun)',publish:'Hyväksy ja julkaise (sisältää luonnostelun)',brand:'Muokkaa brändiääntä',quota:'Jaettuja käyttöoikeuksia',channels:'Sometilejä',limit:'Raja',remaining:'Vapaita paikkoja',confirmRemove:'Poistetaanko käyttäjän jäsenyys ja myönnetyt oikeudet?',confirmCancel:'Perutaanko kutsu?',success:'Tallennettu.',inviteSent:'Kutsu käsitelty.',existing:'Käyttäjällä on jo tunnus. Ilmoita hänelle kutsusta: hän hyväksyy sen kirjautumalla Somevalvomoon.',notice:'Uudet oikeudet tallentuvat palvelimelle. Niitä ei vielä sovelleta nykyiseen julkaisu-, Pika- tai brändiäänipolkuun.',none:'Ei käyttäjiä.',error:'Toiminto epäonnistui.',notAllowed:'Ei hallintaoikeutta.',refresh:'Päivitä',email:'Sähköposti',status:'Tila',actions:'Toiminnot',noChannels:'Asiakkuuteen ei ole yhdistetty sometilejä.' },
    en: { title:'Users and permissions',open:'👥 User management',close:'Close',customer:'Customer account',invite:'Invite a user by email',send:'Send invite',save:'Save permissions',cancel:'Close editor',rights:'Channel permissions',members:'Account members',pending:'Pending invitation',active:'Active',owner:'Account owner',admin:'Administrator',sub:'Member',edit:'Edit permissions',remove:'Remove',cancelInvite:'Cancel invite',invitations:'Your invitations',accept:'Accept invitation',loading:'Loading…',empty:'No managed accounts or pending invitations.',draft:'Draft and edit (including AI formatting)',publish:'Approve and publish (includes drafting)',brand:'Edit brand voice',quota:'Members',channels:'Social channels',limit:'Limit',remaining:'Available seats',confirmRemove:'Remove this member and their new permissions?',confirmCancel:'Cancel invitation?',success:'Saved.',inviteSent:'Invitation processed.',existing:'This user already has an account. Notify them to accept the invitation after signing in.',notice:'New permissions are stored on the server but are not yet enforced by the existing publishing, Pika or brand-voice workflows.',none:'No members.',error:'Action failed.',notAllowed:'No management permission.',refresh:'Refresh',email:'Email',status:'Status',actions:'Actions',noChannels:'No social accounts are linked.' },
    sv: { title:'Användare och behörigheter',open:'👥 Användarhantering',close:'Stäng',customer:'Kundkonto',invite:'Bjud in användare via e-post',send:'Skicka inbjudan',save:'Spara behörigheter',cancel:'Stäng redigering',rights:'Behörigheter per kanal',members:'Kontoanvändare',pending:'Väntar på godkännande',active:'Aktiv',owner:'Kontoägare',admin:'Administratör',sub:'Underanvändare',edit:'Redigera behörigheter',remove:'Ta bort',cancelInvite:'Avbryt inbjudan',invitations:'Dina inbjudningar',accept:'Godkänn inbjudan',loading:'Laddar…',empty:'Inga administrerade konton eller väntande inbjudningar.',draft:'Skapa utkast (inklusive AI-formatering)',publish:'Godkänn och publicera (inkluderar utkast)',brand:'Redigera varumärkesröst',quota:'Underanvändare',channels:'Sociala kanaler',limit:'Gräns',remaining:'Lediga platser',confirmRemove:'Ta bort medlemmen och deras nya behörigheter?',confirmCancel:'Avbryta inbjudan?',success:'Sparat.',inviteSent:'Inbjudan behandlad.',existing:'Användaren har redan ett konto. Be dem godkänna inbjudan efter inloggning.',notice:'Nya behörigheter sparas på servern men används ännu inte av befintlig publicering, Pika eller varumärkesröst.',none:'Inga medlemmar.',error:'Åtgärden misslyckades.',notAllowed:'Ingen behörighet.',refresh:'Uppdatera',email:'E-post',status:'Status',actions:'Åtgärder',noChannels:'Inga sociala konton är anslutna.' }
  };
  const accessLabels = {
    fi: {title:'Omat asiakkuuteni ja käyttöoikeuteni', select:'Näytä asiakkuuden oikeudet', notice:'Tämä on oikeuksien tarkastelunäkymä. Valinta ei vaihda julkaisemisen asiakkuutta.', empty:'Ei aktiivisia jäsenyyksiä.', noRights:'Ei näytettäviä sometilioikeuksia.', owner:'Pääkäyttäjä', admin:'Pääkäyttäjä', member:'Jaettu käyttöoikeus', channels:'Hallinnoitavat sosiaalisen median tilit', draft:'Luonnostelu', publish:'Julkaisu', brand:'Brändiääni', legacy:'Aiemmin myönnetty julkaisuoikeus', all:'Pääkäyttäjäoikeudet tässä asiakkuudessa'},
    en: {title:'My accounts and permissions', select:'View permissions for an account', notice:'Read-only view. Choosing an account does not switch the publishing context.',empty:'No active memberships.',noRights:'No channel permissions to display.',owner:'Account owner',admin:'Administrator',member:'Shared access',channels:'Social media accounts you can manage',draft:'Drafting',publish:'Publishing',brand:'Brand voice',legacy:'Previously granted publishing permission',all:'Administrator rights in this account'},
    sv: {title:'Mina konton och behörigheter',select:'Visa behörigheter för konto',notice:'Endast visning. Valet byter inte publiceringskonto.',empty:'Inga aktiva medlemskap.',noRights:'Inga kanalbehörigheter att visa.',owner:'Kontoägare',admin:'Administratör',member:'Delad åtkomst',channels:'Sociala mediekonton som du kan hantera',draft:'Utkast',publish:'Publicering',brand:'Varumärkesröst',legacy:'Tidigare beviljad publiceringsrätt',all:'Administratörsbehörighet för kontot'},
  };
  const viewLabels = {
    fi: { signed:'Kirjautuneena', choose:'Valitse asiakkuus', select:'Tarkastele asiakkuutta ja sen oikeuksia', management:'Asiakkuus ja palvelupaketti', package:'Nykyinen palvelupaketti', subscription:'Tarkastele tilausta', manage:'Asiakkuuden käyttäjähallinta', monthly:'Kuukausitilaus', yearly:'Vuositilaus', available:'Vapaana', unavailable:'Paketin nimeä ei saatu', subscriptionOnlyOwner:'Tilauksen hallinta kuuluu asiakkuuden omistajalle' },
    en: { signed:'Signed in as', choose:'Choose account', select:'View account and permissions', management:'Account and plan', package:'Current plan', subscription:'View subscription', manage:'Account user management', monthly:'Monthly plan', yearly:'Annual plan', available:'Available', unavailable:'Plan name unavailable', subscriptionOnlyOwner:'Only the account owner can manage subscriptions' },
    sv: { signed:'Inloggad som', choose:'Välj kundkonto', select:'Visa konto och behörigheter', management:'Kundkonto och paket', package:'Nuvarande paket', subscription:'Visa prenumeration', manage:'Användarhantering', monthly:'Månadsabonnemang', yearly:'Årsabonnemang', available:'Lediga', unavailable:'Paketnamnet kunde inte hämtas', subscriptionOnlyOwner:'Endast kontoägaren kan hantera prenumerationer' }
  };
  function viewDict(){return viewLabels[localStorage.getItem('solone_kieli')] || viewLabels.fi;}
  function showSignedIn(){
    const email=localStorage.getItem('user_email') || '';
    $('member-admin-signed-in-label').textContent=viewDict().signed;
    $('member-admin-signed-in-email').textContent=email || '—';
  }
  const myAccess = { accounts: [], selected: '' };
  const state = { accounts: [], selected: '', data: null, selectedMember: '', loading:false };
  function dict() { return dictionaries[localStorage.getItem('solone_kieli')] || dictionaries.fi; }
  function element(tag, text, attrs={}) { const el = document.createElement(tag); if (text !== undefined && text !== null) el.textContent = String(text); for (const [k,v] of Object.entries(attrs)) el.setAttribute(k,v); return el; }
  function clear(node) { node.replaceChildren(); }
  function setMessage(message, isError=false) { const e=$('member-admin-message'); e.textContent=message; e.style.color=isError?'#b91c1c':'#0f766e'; }
  function busy(on) { state.loading=on; for(const x of $('member-admin-modal').querySelectorAll('button,input,select')) x.disabled=on; }
  async function request(action, data={}) {
    const db = haeSupabaseAsiakas();
    const token = localStorage.getItem('supabase_token');
    if (!token) throw new Error('Kirjautuminen puuttuu');
    const response = await fetch(db.url+'/functions/v1/member-admin',{
      method:'POST',headers:{'apikey':db.key,'Authorization':'Bearer '+token,'Content-Type':'application/json'},
      body:JSON.stringify({action,...data})
    });
    const result=await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(result.error || dict().error+' (HTTP '+response.status+')');
    return result;
  }
  async function perform(action, data, successMessage) {
    if(state.loading) return null;
    busy(true);setMessage(dict().loading);
    try { const out=await request(action,data);setMessage(successMessage === '' ? '' : (successMessage || dict().success));return out; }
    catch(e){setMessage(e.message || dict().error,true);return null;}
    finally{busy(false);}
  }
  async function synchronizeManagement() {
    const selected=myAccess.selected;
    const managed=state.accounts.some(a=>a.asiakas_id===selected);
    const panel=$('member-admin-management');
    panel.hidden=!managed;
    if (!managed) {
      state.selected='';state.data=null;state.selectedMember='';
      $('member-admin-rights-panel').hidden=true;
      return;
    }
    $('member-admin-customer').value=selected;
    if(state.selected!==selected || !state.data){
      state.selected=selected;
      await reloadList();
    }
    // Vain tilauksen vastuulliselle omistajalle nykyinen Tilaukset-näkymä.
    const role=state.accounts.find(a=>a.asiakas_id===selected)?.rooli;
    $('member-admin-package-order').hidden=(role!=='omistaja');
  }
  function renderMyAccess() {
    const language=localStorage.getItem('solone_kieli') || 'fi';
    const t=accessLabels[language] || accessLabels.fi;
    $('member-admin-myaccess-title').textContent=viewDict().choose;
    $('member-admin-myaccess-label').textContent=viewDict().select;
    const select=$('member-admin-myaccess-select');
    const previous=myAccess.selected;
    clear(select);
    const accounts=myAccess.accounts;
    if(!accounts.length){select.hidden=true;$('member-admin-myaccess-content').textContent=t.empty;return;}
    select.hidden=false;
    const role=(value)=>value==='omistaja'?t.owner:value==='paakayttaja'?t.admin:t.member;
    for(const account of accounts){
      select.append(element('option',(account.nimi||account.asiakas_id)+(account.rooli==='alikayttaja'?' – '+role(account.rooli):''),{value:account.asiakas_id}));
    }
    myAccess.selected=accounts.some(a=>a.asiakas_id===previous)?previous:accounts[0].asiakas_id;
    select.value=myAccess.selected;
    const account=accounts.find(a=>a.asiakas_id===myAccess.selected);
    const content=$('member-admin-myaccess-content');clear(content);
    if(!account)return;
    const channels=account.channels||[];
    content.append(element('h4',t.channels,{class:'ma-channel-section-title'}));
    if(!channels.length){content.append(element('p',t.noRights));return;}
    const list=element('div',undefined,{class:'ma-channel-list'});
    const channelStyles={
      facebook:{name:'Facebook',mark:'f'},
      instagram:{name:'Instagram',mark:'IG'},
      linkedin:{name:'LinkedIn',mark:'in'}
    };
    for(const c of channels){
      const code=Object.hasOwn(channelStyles,c.kanava)?c.kanava:'linkedin';
      const visual=channelStyles[code];
      const card=element('article',undefined,{class:'ma-channel-card ma-channel-card--'+code});
      const mark=element('span',visual.mark,{class:'ma-channel-icon','aria-hidden':'true'});
      const body=element('div',undefined,{class:'ma-channel-body'});
      body.append(element('h4',visual.name+' · '+(c.nimi||''),{class:'ma-channel-title'}));
      const badges=element('div',undefined,{class:'ma-channel-badges'});
      const addBadge=(label,kind)=>badges.append(element('span',label,{class:'ma-rights-badge ma-rights-badge--'+kind}));
      if(c.saa_luonnostella)addBadge(t.draft,'draft');
      if(c.saa_julkaista)addBadge(t.publish,'publish');
      if(c.saa_muokata_brandia)addBadge(t.brand,'brand');
      body.append(badges);
      if(c.vanha_julkaisuoikeus)body.append(element('small',t.legacy,{class:'ma-legacy-note'}));
      card.append(mark,body);list.append(card);
    }
    content.append(list);
  }
  async function loadMyAccess() {
    const response=await perform('my_access',{},'');
    if(!response)return;
    myAccess.accounts=response.accounts||[];
    renderMyAccess();
  }
  function translate() {
    const t=dict();
    showSignedIn();
    $('member-admin-management-heading').textContent=viewDict().management;
    $('member-admin-package-label').textContent=viewDict().package;
    $('member-admin-package-order').textContent=viewDict().subscription;
    const ids={ 'member-admin-title':'title','member-admin-close':'close','member-admin-customer-label':'customer','member-admin-invite-button':'send','member-admin-save-rights':'save','member-admin-cancel-rights':'cancel','member-admin-rights-title':'rights','member-admin-notice':'notice','member-admin-open':'open' };
    for(const [id,key] of Object.entries(ids)) if($(id)) $(id).textContent=t[key];
    $('member-admin-invite-label').firstChild.textContent=t.invite+' ';
    if(state.data) renderData();
    renderMyAccess();
  }
  function channelRows(data) {
    const items=[];for(const account of data.channels||[]){
      if(account.aktiivinen === false) continue;
      for(const [field,code,label] of [['fb_page_id','facebook','Facebook'],['ig_account_id','instagram','Instagram'],['linkedin_org_id','linkedin','LinkedIn']]){
        if(account[field]) items.push({sometili_id:account.id,kanava:code,label:label+' · '+(account.sivun_nimi||account[field])});
      }
    }return items;
  }
  function renderData() {
    const d=state.data,t=dict();if(!d)return;
    const usage=d.usage||{},limit=d.limits||{};
    const plan=d.palvelu||{};
    $('member-admin-package').hidden=false;
    $('member-admin-package-name').textContent=plan.nimi || viewDict().unavailable;
    $('member-admin-package-meta').textContent=plan.laskutusvali==='vuosi'?viewDict().yearly:plan.laskutusvali==='kuukausi'?viewDict().monthly:'';
    const usageRoot=$('member-admin-usage');clear(usageRoot);
    const quotaCard=(label,used,max)=>{
      const card=element('div',undefined,{class:'ma-quota-card'});
      card.append(element('span',label));
      card.append(element('strong',`${used} / ${max}`,{class:'ma-quota-number'}));
      card.append(element('small',`${viewDict().available}: ${Math.max(0,max-used)}`,{class:'ma-quota-footer'}));
      return card;
    };
    usageRoot.append(quotaCard(t.quota,Number(usage.alikayttajia||0),Number(limit.alikayttajia||0)),quotaCard(t.channels,Number(usage.sometileja||0),Number(limit.sometileja||0)));
    const form=$('member-admin-invite-form');form.hidden = Number(limit.alikayttajia||0)===0;
    const root=$('member-admin-members');clear(root);root.append(element('h3',t.members));
    const members=d.members||[];if(!members.length)root.append(element('p',t.none));
    for(const member of members){
      const card=element('div');card.style.cssText='border:1px solid #e2e8f0;border-radius:8px;padding:10px;margin:8px 0;';
      const role=member.rooli==='omistaja'?t.owner:member.rooli==='paakayttaja'?t.admin:t.sub;
      card.append(element('strong',(member.kutsuttu_sahkoposti||member.user_id||'—')));
      card.append(element('div',role+' · '+(member.tila==='aktiivinen'?t.active:t.pending)));
      if(member.rooli==='alikayttaja'){
        const controls=element('div');controls.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;';
        if(member.tila==='aktiivinen'){
          const edit=element('button',t.edit,{type:'button'});edit.addEventListener('click',()=>showRights(member.id));controls.append(edit);
          const remove=element('button',t.remove,{type:'button'});remove.addEventListener('click',()=>changeMembership('remove',member));controls.append(remove);
        } else {
          const cancel=element('button',t.cancelInvite,{type:'button'});cancel.addEventListener('click',()=>changeMembership('cancel',member));controls.append(cancel);
        }
        card.append(controls);
      } root.append(card);
    }
    if(state.selectedMember) renderRightsEditor();
  }
  function showRights(id) { state.selectedMember=id;$('member-admin-rights-panel').hidden=false;renderRightsEditor(); }
  function renderRightsEditor() {
    const root=$('member-admin-rights-list');clear(root);const t=dict(),d=state.data;if(!d)return;
    const channels=channelRows(d);if(!channels.length){root.append(element('p',t.noChannels));return;}
    const isTeam=(d.limits?.paakayttajia===3 && d.limits?.alikayttajia===20);
    const granted=d.rights||[];
    channels.forEach(channel=>{
      const row=element('div');row.dataset.account=channel.sometili_id;row.dataset.channel=channel.kanava;
      row.style.cssText='border-bottom:1px solid #e2e8f0;padding:10px 0;';row.append(element('strong',channel.label));
      const found=granted.find(x=>x.jasen_id===state.selectedMember&&x.sometili_id===channel.sometili_id&&x.kanava===channel.kanava)||{};
      for(const [key,label] of [['saa_luonnostella',t.draft],['saa_julkaista',t.publish],['saa_muokata_brandia',t.brand]]) {
        if(isTeam && key!=='saa_luonnostella')continue;
        const wrapper=element('label');wrapper.style.cssText='display:block;margin:6px 0;font-size:.87rem;';
        const input=element('input',undefined,{type:'checkbox'});input.dataset.right=key;input.checked=Boolean(found[key]);
        input.addEventListener('change',()=>{if(key==='saa_julkaista'&&input.checked){const draft=row.querySelector('[data-right="saa_luonnostella"]');if(draft)draft.checked=true;}if(key==='saa_luonnostella'&&!input.checked){const publish=row.querySelector('[data-right="saa_julkaista"]');if(publish)publish.checked=false;}});
        wrapper.append(input,document.createTextNode(' '+label));row.append(wrapper);
      }root.append(row);
    });
  }
  async function changeMembership(action, member) {
    const t=dict();if(!confirm(action==='cancel'?t.confirmCancel:t.confirmRemove))return;
    const result=await perform(action,{asiakas_id:state.selected,jasen_id:member.id});
    if(result) await reloadList();
  }
  async function reloadList() {
    if(!state.selected)return;
    const data=await perform('list',{asiakas_id:state.selected},'');
    if(!data)return;
    state.data=data;state.selectedMember='';$('member-admin-rights-panel').hidden=true;renderData();
  }
  async function renderInvites() {
    const result=await perform('my_invites',{},'');if(!result)return;
    const root=$('member-admin-invites');clear(root);const list=result.invitations||[];if(!list.length)return;
    root.append(element('h3',dict().invitations));
    for(const inv of list){const row=element('div');row.style.cssText='padding:8px;border:1px solid #e2e8f0;margin:6px 0;border-radius:8px;';
      row.append(element('span',inv.asiakas_id+' · '+dict().pending+' '));
      const button=element('button',dict().accept,{type:'button'});button.addEventListener('click',async()=>{
        const done=await perform('accept',{asiakas_id:inv.asiakas_id,jasen_id:inv.id});if(done){await loadMyAccess();await renderInvites();await loadAccounts();}
      });row.append(button);root.append(row);
    }
  }
  async function loadAccounts() {
    const result=await perform('my_accounts',{},'');if(!result)return;
    state.accounts=result.accounts||[];
    const sel=$('member-admin-customer');clear(sel);
    for(const a of state.accounts){sel.append(element('option',(a.nimi||a.asiakas_id)+' · '+(a.rooli==='omistaja'?dict().owner:dict().admin),{value:a.asiakas_id}));}
    state.selected='';state.data=null;
    await synchronizeManagement();
    if(!state.selected && !myAccess.accounts.length && !$('member-admin-invites').childElementCount)setMessage(dict().empty);
  }
  async function open() {
    $('member-admin-modal').style.display='flex';translate();
    await loadMyAccess();await renderInvites();await loadAccounts();
  }
  function close() { $('member-admin-modal').style.display='none';state.selectedMember=''; }
  window.avaaJasenhallinta=open;
  window.suljeJasenhallinta=close;
  window.paivitaJasenhallinnanKieli=translate;
  $('member-admin-myaccess-select').addEventListener('change',async e=>{
    myAccess.selected=e.target.value;
    renderMyAccess();
    await synchronizeManagement();
  });
  // Sisäinen valitsin on piilotettu, eikä käyttäjä voi vaihtaa hallintakontekstia erikseen.
  $('member-admin-package-order').addEventListener('click',()=>{
    if(typeof window.avaaTilauksetModaali==='function'){
      suljeJasenhallinta();
      window.avaaTilauksetModaali();
    }
  });
  $('member-admin-invite-form').addEventListener('submit',async e=>{
    e.preventDefault();const input=$('member-admin-email'),email=input.value.trim();if(!email||!state.selected)return;
    const result=await perform('invite',{asiakas_id:state.selected,email},dict().inviteSent);
    if(result){input.value='';await reloadList();if(result.email_sent===false)setMessage(dict().existing);}
  });
  $('member-admin-save-rights').addEventListener('click',async()=>{
    if(!state.selectedMember||!state.data)return;
    const rights=[];for(const row of $('member-admin-rights-list').children){
      if(!row.dataset.account)continue;
      const value=(name)=>Boolean(row.querySelector('[data-right="'+name+'"]')?.checked);
      const publishing=value('saa_julkaista');const draft=value('saa_luonnostella')||publishing;const brand=value('saa_muokata_brandia');
      if(draft||brand) rights.push({sometili_id:row.dataset.account,kanava:row.dataset.channel,saa_luonnostella:draft,saa_julkaista:publishing,saa_muokata_brandia:brand});
    }
    const out=await perform('set_rights',{asiakas_id:state.selected,jasen_id:state.selectedMember,rights});if(out)await reloadList();
  });
  $('member-admin-cancel-rights').addEventListener('click',()=>{state.selectedMember='';$('member-admin-rights-panel').hidden=true;});
})();
