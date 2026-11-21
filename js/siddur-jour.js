// Ce que le jour change à la lecture du siddour (SiddurJour.kt, 10/10) : les
// ajouts du jour mis en évidence, les autres repliés derrière une flèche,
// jamais retirés. Annotations : data/siddur_annotations.json
// (tools/siddur_annotations.py) ; conditions : calendrier-juif.js.

/** Une condition, « ! » devant : quand la clé est fausse. */
export function vrai(condition, conditions) {
  return condition.startsWith('!') ? !conditions.has(condition.slice(1)) : conditions.has(condition);
}

/** Le nom de la chaîne qui nomme une condition (le même qu'Android). */
export function libelle(condition) {
  const c = condition.replace(/^!/, '');
  if (condition.startsWith('!tahanoun')) return 'ajout_sans_tahanoun';
  if (c.startsWith('tahanoun')) return 'ajout_tahanoun';
  if (c === 'kippour') return 'fete_yom_kippour';
  if (c === 'avinou_malkenou_minha') return 'ajout_avinou_malkenou';
  // Audit du 16/11 : des variantes, nommées comme ce qu'elles sont.
  if (c === 'avinou_malkenou_jeune') return 'ajout_jeune_public';
  if (c === 'kaddich_complet_hallel') return 'ajout_sauf_hanouka';
  if (c === 'el_erekh_apayim') return 'ajout_lundi_jeudi';
  if (c === 'hallel') return 'ajout_hallel_annonce';
  if (c.startsWith('embolismique')) return 'ajout_embolismique';
  if (['pessah', 'soukkot', 'chavouot', 'roch_hachana', 'chemini_atseret', 'hanouka', 'pourim'].includes(c)) return `fete_${c}`;
  return `ajout_${c}`;
}

/**
 * Les conditions du jour, ajustées au nusah (SiddurJour.conditionsPour) :
 * pas de Morid hatal ashkénaze hors d'Israël, pas de Ta'hanoun Edot en fin de Tichri.
 */
export function conditionsPour(nusah, enIsrael, conditions, sansTahanounFinTichri = nusah === 'edot', sud = false) {
  const c = new Set(conditions);
  if (c.has('bascule_pluie')) { c.add('machiv_harouah'); c.add('morid_hatal'); }
  if (nusah === 'ashkenaz' && !enIsrael) c.delete('morid_hatal');
  // Hémisphère sud, Edot (14/10) : « מוריד הטל » toute l'année, jamais « מוריד הגשם » ;
  // ותן טל ומטר suit la diaspora. Yalkut Yosef, Kitsour Choulhan Aroukh, O.H. 117:20 (סעיף כ)
  // (Chéérit Yossef III p. 105 ; Yalkut Yosef Tefila II, 117 note כ, p. קא ; audit du 16/11) ; recoupé le 16/10
  // avec Halakha Yomit (site de Rav Ovadia Yossef).
  if (sud && nusah === 'edot' && c.delete('machiv_harouah')) c.add('morid_hatal');
  // Pas de Ta'hanoun du lendemain de Kippour jusqu'au 2 'Hechvan : Edot, et Sfard au choix.
  if (sansTahanounFinTichri && c.has('fin_tichri')) for (const k of ['tahanoun_chaharit', 'tahanoun_minha', 'lundi_jeudi']) c.delete(k);
  // Pourim triple, le dimanche 16 Adar en Israël hors de Jérusalem : l'Ashkenaz suit le Halikhot Chlomo (22:8),
  // sans Ta'hanoun ; למנצח reste (Michna Beroura 131:35, qui fait dire Ta'hanoun : ajouts le précise).
  if (nusah === 'ashkenaz' && c.has('pourim_triple_hors_jerusalem')) for (const k of ['tahanoun_chaharit', 'tahanoun_minha', 'lundi_jeudi']) c.delete(k);
  // Edot : pas de Vidouï à Min'ha du 13 Iyar, veille de Pessa'h chéni (Kitsour Yalkout Yossef 131:38 ; audit du 16/11).
  if (nusah === 'edot' && c.has('veille_pessah_cheni')) c.delete('tahanoun_minha');
  // « Pas de Ta'hanoun aujourd'hui » (réglage ponctuel : deuil, brit, 'hatan ; Choul'han Aroukh O.H. 131:4 ; audit du 16/11).
  if (c.has('sans_tahanoun_ponctuel')) for (const k of ['tahanoun_chaharit', 'tahanoun_minha', 'lundi_jeudi']) c.delete(k);
  if (avinouMalkenou(conditions)) c.add('avinou_malkenou');
  // À Min'ha : seulement si Ta'hanoun s'y dit (TSIDDUR-09) ; Roch Hachana et Kippour gardent le leur, sauf un vendredi (relecture du 15/11).
  const c0 = new Set(conditions);
  const minha = c0.has('tahanoun_minha') || c0.has('roch_hachana') || c0.has('kippour');
  const vendredi = c0.has('jour_6') || c0.has('erev_kippour_vendredi');
  if (avinouMalkenou(conditions) && minha && !vendredi) c.add('avinou_malkenou_minha');
  for (const k of ajoutsOffices(nusah, enIsrael, c)) c.add(k);
  return c;
}

/** [conditions], avec le réglage ponctuel « Pas de Ta'hanoun aujourd'hui » quand [sansTahanoun] (SiddurJour.avecSansTahanoun). */
export function avecSansTahanoun(conditions, sansTahanoun) {
  return sansTahanoun ? new Set([...conditions, 'sans_tahanoun_ponctuel']) : conditions;
}

/**
 * Audit du 16/11 (SiddurJour.ajoutsOffices, qui cite les sources) : ויהי נועם et « ואתה קדוש » au motsaé
 * Chabbat et le soir du 9 Av, les téfilin, le Vidouï du Chema du coucher, לדוד ה׳ אורי à Chemini Atséret
 * (Ashkenaz hors d'Israël).
 */
function ajoutsOffices(nusah, enIsrael, c) {
  const r = [];
  const edot = nusah === 'edot';
  const vihiNoam = c.has('motsae_chabbat') && !c.has('ticha_beav') && !c.has('chome') && (edot || !c.has('yom_tov_semaine'));
  if (vihiNoam) r.push('vihi_noam');
  if (vihiNoam || c.has('ticha_beav')) r.push('veata_kadoch');
  const sansTefilin = c.has('chabbat') || c.has('yom_tov') || (c.has('hol_hamoed') && (edot || enIsrael)) || (c.has('ticha_beav') && !edot);
  if (!sansTefilin) r.push('tefilin');
  if (nusah === 'ashkenaz' && !enIsrael && c.has('hol_hamoed')) r.push('tefilin_sans_berakha');
  if (c.has('tahanoun_chaharit') && !c.has('motsae_chabbat_yt') && !c.has('lendemain_roch_hodech')) r.push('vidui_coucher');
  if (nusah === 'ashkenaz' && !enIsrael && c.has('chemini_atseret') && c.has('bascule_pluie')) r.push('ledavid');
  return r;
}

/** Les conditions déduites (SiddurJour, CalendrierJuif.C.DERIVEES), hors des vecteurs KosherJava. */
export const DERIVEES = ['avinou_malkenou', 'avinou_malkenou_minha', 'kriat_hatorah', 'jour_1', 'jour_2', 'jour_3', 'jour_4', 'jour_5', 'jour_6',
  'tsom_guedalia_tevet', 'lendemain_kippour', 'ticha_beav_kippour', 'esther_pourim', 'chiva_assar_tamouz', 'bascule_pluie', 'erev_kippour_vendredi',
  'lamnatseah', 'ledavid', 'techouva_hochaana', 'yom_tov', 'moed', 'chabbat_roch_hodech', 'yom_tov_chabbat', 'roch_hachana_chabbat',
  'motsae_chabbat_yt', 'beit_avel', 'oubli', 'minyan', 'cheva_berakhot', 'zimun', 'facultatif', 'embolismique', 'embolismique_avant_nissan',
  'pourim_triple_hors_jerusalem', 'pourim_triple_festin', 'avinou_malkenou_jeune', 'kaddich_complet_hallel', 'veille_pessah_cheni',
  'erev_kippour', 'sans_tahanoun_ponctuel', 'jour_pessah_cheni', 'el_erekh_apayim',
  // Hallel et Moussaf (audit du 16/11).
  'roch_hodech_chol', 'hol_hamoed', 'hanouka_sans_moussaf', 'hanouka_hors_roch_hodech', 'leil_pessah', 'hallel_partiel',
  // Audit du 16/11 (structure des offices).
  'mizmor_letoda', 'yom_tov_semaine', 'leil_haseder', 'lendemain_roch_hodech', 'chome',
  'vihi_noam', 'veata_kadoch', 'tefilin', 'tefilin_sans_berakha', 'vidui_coucher', 'nuit', 'pourim_triple_vendredi',
  // Audit du 16/11 (Birkat haMazon et bénédictions).
  'havdala_ner', 'havdala_bessamim', 'lendemain_ticha_beav_dimanche', 'lendemain_ajouts', 'bein_hametsarim',
  // Audit du 16/11 (calendrier).
  'tikoun_rahel', 'toujours'];

/**
 * Avinou malkénou (SiddurJour.avinouMalkenou) : jeûnes publics sauf le 9 Av, dix
 * jours de pénitence (Roch Hachana et Kippour compris, pas la veille de Kippour),
 * jamais le Chabbat.
 */
export function avinouMalkenou(conditions) {
  const c = conditions instanceof Set ? conditions : new Set(conditions);
  if (c.has('chabbat')) return false;
  if (c.has('erev_kippour_vendredi')) return true;
  if (c.has('jeune') && !c.has('ticha_beav')) return true;
  return c.has('asseret_yemei_techouva') && (c.has('tahanoun_chaharit') || c.has('roch_hachana') || c.has('kippour'));
}

/** Hallel complet, ou partiel avec ou sans bénédiction selon le nusah (OC 422:2) ; null hors Hallel. */
export function libelleHallel(nusah, conditions) {
  if (conditions.has('hallel_complet')) return 'ajout_hallel_complet';
  if (!conditions.has('hallel')) return null;
  return nusah === 'edot' ? 'ajout_hallel_partiel_sans_berakha' : 'ajout_hallel_partiel_avec_berakha';
}

/** Le libellé d'un ajout un jour donné : celui de l'annotation, sinon celui de la condition (SiddurJour.libelleJour). */
export function libelleJour(libelleAnnotation, condition, nusah, conditions) {
  if (libelleAnnotation) return libelleAnnotation;
  if (condition === 'hallel') return libelleHallel(nusah, conditions) ?? libelle(condition);
  // Les Edot changent toute la 9ᵉ bénédiction, pas une formule (28/10) : ברך עלינו / ברכנו.
  if (nusah === 'edot' && condition === 'tal_oumatar') return 'ajout_barekh_alenou';
  if (nusah === 'edot' && (condition === '!tal_oumatar' || condition === 'berakha')) return 'ajout_barkhenou';
  return libelle(condition);
}

/**
 * Le libellé du texte ordinaire qu'une formule du jour remplace (SiddurJour.AUTRES_JOURS ; audit
 * du 12/11, TSIDDUR-06) : « האל הקדוש » pendant les dix jours, « בונה ירושלים » à Min'ha du 9 Av.
 * Sa condition est niée : vraie, c'est le texte de tous les jours, affiché tel quel, sans
 * étiquette ; le jour où il est remplacé, il se replie sous « Les autres jours ».
 */
export const AUTRES_JOURS = 'ajout_autres_jours';

/** Comme tools/siddur_annotations.py : sans balises ni voyelles, quarante caractères. */
export function empreinte(texte) {
  return texte.replace(/<[^>]+>/g, ' ').replace(/[֑-ׇ]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
}

/**
 * Les annotations d'un texte, rangées pour la lecture : par section, la
 * condition de la section entière ; par bloc, son annotation de bloc ; et
 * les indices de chaque bloc.
 */
export function index(annotations = []) {
  const sections = new Map();
  const blocs = new Map();
  const indices = new Map();
  // Les renvois (« Aujourd'hui · Hallel › ») : après la section (« s: ») ou après tel bloc (« s:b »).
  const renvois = new Map();
  // Qui prie seul (19/10) : la braïta à la place de Barekhou, après tel bloc (« s:b »).
  const seuls = new Map();
  for (const a of annotations) {
    if (a.sorte === 'section') sections.set(a.s, a);
    else if (a.sorte === 'bloc') blocs.set(`${a.s}:${a.b}`, a);
    // Les notes de l'application (audit du 16/11) suivent leur bloc comme les cartes « seul ».
    else if (a.sorte === 'seul' || a.sorte === 'note') seuls.set(`${a.s}:${a.b}`, [...(seuls.get(`${a.s}:${a.b}`) ?? []), a]);
    else if (a.sorte === 'renvoi') renvois.set(`${a.s}:${a.b ?? ''}`, [...(renvois.get(`${a.s}:${a.b ?? ''}`) ?? []), a]);
    else indices.set(`${a.s}:${a.b}`, [...(indices.get(`${a.s}:${a.b}`) ?? []), a]);
  }
  return { sections, blocs, indices, renvois, seuls };
}

/**
 * La double annotation (audit du 16/11, SiddurJour.lignes) : les blocs d'une partie, en suites. Une suite
 * sans « et » (ou dont le « et » est vrai) se lit avec son groupe ; une suite dont le « et » est faux (le
 * minyan, « תתקבל » le 9 Av) se replie à part : { blocs, et, libelle }.
 */
export function segments(blocs, si, idx, conditions) {
  const sortie = [];
  for (const i of blocs) {
    const a = idx.blocs.get(`${si}:${i}`);
    const et = a?.et && !vrai(a.et, conditions) ? a.et : null;
    const dernier = sortie[sortie.length - 1];
    if (dernier && dernier.et === et) dernier.blocs.push(i);
    else sortie.push({ blocs: [i], et, libelle: et ? (a.et_libelle ?? libelle(et)) : null });
  }
  return sortie;
}

/**
 * Le plan de lecture d'une section, le jour où valent [conditions] (SiddurJour.lignes) : dans
 * l'ordre, la section entière si elle est annotée, sinon ses blocs libres (sans annotation) et
 * ses groupes, variantes comprises. [etat] : « du_jour », mis en évidence sous son étiquette ;
 * « replie », hors du jour, derrière sa flèche ; « ordinaire », le texte de tous les jours qu'une
 * formule du jour remplace (AUTRES_JOURS), ou un passage « discret » (12/11 : « שעשה לי כל צרכי »,
 * la fin du Kaddich après le Hallel ; SiddurJour.Annotation.discret), affiché tel quel quand il se dit.
 */
export function plan(section, si, idx, conditions) {
  const entiere = idx.sections.get(si);
  if (entiere) return [{ annotation: entiere, racine: entiere.si, blocs: section.blocs.map((_, i) => i), etat: vrai(entiere.si, conditions) ? 'du_jour' : 'replie' }];
  const parties = [];
  for (let i = 0; i < section.blocs.length; i++) {
    const a = idx.blocs.get(`${si}:${i}`);
    if (!a) { parties.push({ annotation: null, blocs: [i], etat: 'libre' }); continue; }
    // Le groupe : les blocs suivants de même groupe.
    const blocs = [];
    while (i < section.blocs.length && idx.blocs.get(`${si}:${i}`)?.g === a.g) blocs.push(i++);
    i--;
    const racine = a.racine ?? a.si;
    parties.push({ annotation: a, racine, blocs, etat: !vrai(racine, conditions) ? 'replie' : a.libelle === AUTRES_JOURS || a.discret ? 'ordinaire' : 'du_jour' });
  }
  return parties;
}
