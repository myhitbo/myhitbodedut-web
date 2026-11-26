// Ce que l'onglet Zmanim et le calendrier montrent d'un jour (JourAffiche.kt,
// 10/10) : les ajouts à nommer, les horaires avec l'entrée et la sortie de
// Chabbat ou de fête, la grille d'un mois. Mêmes règles, mêmes cas de test.

import { C, calendrier, jour, jourDeLaPriere } from './calendrier-juif.js';
import { JewishCalendar, JewishDate } from '../vendor/kosher-zmanim-0.9.0.min.js';
import { conditionsPour, libelleHallel } from './siddur-jour.js';
import * as Z from './zmanim.js';
import { SiddurMoment } from './regles.js';

/**
 * Les ajouts du jour, dans l'ordre de l'Amida : des clés de libellé. Le nusah
 * change Morid hatal hors d'Israël, la bénédiction du Hallel partiel et
 * l'Anénou du particulier (JourAffiche.ajouts, ZMANIM.md).
 */
export function ajouts(c0, nusah = 'edot', enIsrael = false, sansTahanounFinTichri = nusah === 'edot', sud = false) {
  const c = conditionsPour(nusah, enIsrael, c0, sansTahanounFinTichri, sud);
  const l = [];
  if (c.has(C.ASSERET_YEMEI_TECHOUVA)) l.push('ajout_asseret_yemei_techouva');
  // Les jours de bascule, les deux formules (bascule_pluie) ; sinon l'une ou l'autre.
  if (c.has(C.MACHIV_HAROUAH)) l.push('ajout_machiv_harouah');
  if (c.has(C.MORID_HATAL) && (!c.has(C.MACHIV_HAROUAH) || c.has('bascule_pluie'))) l.push('ajout_morid_hatal');
  // La 9ᵉ bénédiction (JourAffiche.ajouts) : texte des Edot ; rien le Chabbat ni un Yom Tov (Kippour compris).
  if (!c.has(C.CHABBAT) && !c.has('yom_tov')) {
    if (nusah === 'edot') l.push(c.has(C.TAL_OUMATAR) ? 'ajout_barekh_alenou' : 'ajout_barkhenou');
    else l.push(c.has(C.TAL_OUMATAR) ? 'ajout_tal_oumatar' : 'ajout_berakha');
  }
  if (c.has(C.JEUNE)) {
    l.push('ajout_anenou_officiant');
    // Edot : à Tich'a bèAv, le jeûne commence la veille au soir, et Arvit en est.
    if (nusah !== 'edot') l.push('ajout_anenou_particulier_minha');
    else l.push(c.has(C.TICHA_BEAV) ? 'ajout_anenou_particulier_trois' : 'ajout_anenou_particulier_matin_minha');
  }
  // Na'hem (audit du 16/11) : Edot aux trois offices (Yalkut Yosef, Kitsour 557:1) ; Sfard, Ashkenaz à Min'ha seulement (Rema 557:1).
  if (c.has(C.TICHA_BEAV)) l.push(nusah === 'edot' ? 'ajout_ticha_beav_trois' : 'ajout_ticha_beav_minha');
  if (c.has(C.YAALE_VEYAVO)) l.push('ajout_yaale_veyavo');
  if (c.has(C.AL_HANISSIM)) l.push('ajout_al_hanissim');
  const hallel = libelleHallel(nusah, c);
  if (hallel) l.push(hallel);
  // Le Chabbat et un Yom Tov (Kippour compris), il n'y a pas d'Amida de semaine où dire ou taire Ta'hanoun.
  // Le dimanche d'un Pourim triple hors de Jérusalem, l'Ashkenaz suit le Halikhot Chlomo contre le Michna Beroura (131:33).
  if (!c.has(C.CHABBAT) && !c.has('yom_tov')) {
    // Le réglage ponctuel (deuil, brit, 'hatan ; audit du 16/11) : on dit d'où vient l'absence.
    l.push(c.has(C.TAHANOUN_CHAHARIT) ? 'ajout_tahanoun'
      : c.has('sans_tahanoun_ponctuel') ? 'ajout_sans_tahanoun_ponctuel'
      : nusah === 'ashkenaz' && c.has('pourim_triple_hors_jerusalem') ? 'ajout_sans_tahanoun_halikhot_chlomo'
      // Pessa'h chéni (Ashkenaz) : un usage que ni le Choul'han Aroukh ni le Michna Beroura ne citent (JourAffiche.ajouts).
      : nusah === 'ashkenaz' && c.has('jour_pessah_cheni') ? 'ajout_sans_tahanoun_pessah_cheni' : 'ajout_sans_tahanoun');
  }
  // La veille de Kippour : Vidouï et « על חטא » après l'Amida de Min'ha, dans le ma'hzor (Choul'han Aroukh O.H. 607:1 ;
  // Kitsour Yalkout Yossef 607:1 ; audit du 16/11).
  if (c.has('erev_kippour')) l.push('ajout_vidoui_erev_kippour');
  return l;
}

const lendemain = (iso) => {
  const [a, m, j] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, j + 1, 12)).toISOString().slice(0, 10);
};

/**
 * Les horaires du jour, avec l'allumage et la sortie (règles de JourAffiche.horaires). Le profil suit
 * le nusah (audit du 16/11) : pour les Edot, sortie à Rabbénou Tam en 72 min zmaniyot (Kitsour YY 293:3
 * et 293:7). Jeûnes publics : début à l'aube, fin à tsét, et la veille du 9 Av début à la chki'a
 * (Kitsour YY 550:2). Veille de Pessa'h : heures du 'hamets (Zmanim.hamets), et le vendredi quand elle
 * tombe un Chabbat, la fin de la 5e heure (CA 444:2).
 */
export function horaires(lieu, iso, enIsrael, minutes, nusah = '') {
  const jourJ = jour(iso, enIsrael);
  const jourDemain = jour(lendemain(iso), enIsrael);
  const aujourdhui = jourJ.chome;
  const demain = jourDemain.chome;
  // Fête un vendredi (FCALENDRIER-01) : les bougies de Chabbat avant la chki'a, jamais à tsét.
  const [a, m, j] = iso.split('-').map(Number);
  const semaine = new Date(Date.UTC(a, m - 1, j, 12)).getUTCDay();
  const veilleDeChabbat = semaine === 5;
  const edot = nusah === 'edot';
  const base = Z.jour(lieu, iso, nusah);
  const tset = base.find((z) => z.cle === 'tset');
  const fin = edot ? base.find((z) => z.cle === 'tset_rt') : tset;
  const apres = semaine === 6 ? fin : tset;
  const jeune = jourJ.conditions.has(C.JEUNE);
  const av = jourJ.conditions.has(C.TICHA_BEAV);
  const veilleAv = jourDemain.conditions.has(C.TICHA_BEAV);
  const hamets = jourJ.fetes.includes('erev_pessah') ? Z.hamets(lieu, iso, nusah)
    : veilleDeChabbat && jourDemain.fetes.includes('erev_pessah') ? Z.hamets(lieu, iso, nusah).filter((z) => z.cle === 'hamets_biour') : [];
  const sortie = [];
  for (const z of base) {
    if (z.cle === 'chkia' && demain && (!aujourdhui || veilleDeChabbat)) sortie.push(Z.allumage(lieu, iso, minutes));
    if (z.cle === 'chkia' && veilleAv) sortie.push({ ...z, cle: 'debut_jeune' });
    sortie.push(z);
    if (z.cle === 'alot' && jeune && !av) sortie.push({ ...z, cle: 'debut_jeune' });
    if (z.cle === 'szt_gra') sortie.push(...hamets);
    if (z.cle === 'tset' && jeune) sortie.push({ ...z, cle: 'fin_jeune' });
    // Edot : les deux sorties, au choix du propriétaire (17/11) : tsét des Gueonim, puis Rabbénou Tam.
    if (edot && z.cle === 'tset' && aujourdhui && !demain) sortie.push({ ...z, cle: 'sortie_gueonim' });
    if (z.cle === fin.cle && aujourdhui && !demain) sortie.push(edot ? { ...fin, cle: 'sortie', methode: 'rabbenou_tam_zmaniyot' } : { ...fin, cle: 'sortie' });
    if (z.cle === apres.cle && aujourdhui && demain && !veilleDeChabbat) sortie.push({ ...apres, cle: 'allumage', methode: edot ? 'apres_sortie' : 'apres_tset', parametres: '' });
  }
  return sortie;
}

/** Les offices de semaine du siddour (audit du 16/11, JourAffiche.OFFICES). */
export const OFFICES = ['chaharit', 'minha', 'arvit'];

/**
 * Audit du 16/11 (JourAffiche.momentOuvrable) : pas d'office de semaine proposé quand la prière relève
 * d'un Chabbat ou d'un Yom tov ; [moment] sinon. [heures] : l'heure locale (0-23).
 */
export function momentOuvrable(moment, iso, heures, enIsrael) {
  return moment && OFFICES.includes(moment) && jour(jourDeLaPriere(moment, iso, heures), enIsrael).chome ? null : moment;
}

/**
 * La note du Yom tov chéni pour un voyageur (JourAffiche.noteYomTovCheni, audit du 16/11) : le
 * calendrier suit le statut (la résidence) ; un jour chômé seulement en diaspora, quand le lieu est
 * de l'autre région, la note dit ce qui change (Choul'han Aroukh 496:3 ; Michna Beroura 496:13 ;
 * en Ashkenaz, l'avis du 'Hakham Tsvi). Une clé de chaîne, ou null.
 */
export function noteYomTovCheni(iso, statutIsrael, lieuEnIsrael, nusah) {
  if (statutIsrael === lieuEnIsrael) return null;
  if (!jour(iso, false).chome || jour(iso, true).chome) return null;
  if (statutIsrael) return 'note_ytc_ben_israel';
  return nusah === 'ashkenaz' ? 'note_ytc_ben_houl_ashkenaz' : 'note_ytc_ben_houl';
}

/**
 * Un lieu où la ligne de date halakhique est discutée (JourAffiche.ligneDateDiscutee, audit du 16/11) :
 * à l'est de 125,2° E (90° de Jérusalem, la ligne du 'Hazon Ich) ou à l'ouest de 150° O.
 */
export const ligneDateDiscutee = (longitude) => longitude >= 125.2 || longitude <= -150;

export const ALLUMAGE_JERUSALEM = 40;
export const ALLUMAGE_EDOT = 20;

/**
 * La proposition sous le réglage d'allumage, à Jérusalem (JourAffiche.propositionAllumage, audit du
 * 16/11) : 40 min, « coutume de Jérusalem », pour Sfard et Ashkenaz ; environ 20 min pour les Edot
 * (Kitsour Yalkut Yosef 263:47). Une clé de chaîne, ou null.
 */
export function propositionAllumage(nusah, mukafChoma, minutes) {
  if (!mukafChoma) return null;
  if (nusah === 'edot') return minutes !== ALLUMAGE_EDOT ? 'reglage_allumage_proposition_edot' : null;
  return minutes !== ALLUMAGE_JERUSALEM ? 'reglage_allumage_proposition' : null;
}

/** Le libellé « · coutume de Jérusalem » : 40 min, à Jérusalem, hors Edot. */
export const coutumeJerusalem = (nusah, mukafChoma, minutes) => mukafChoma && nusah !== 'edot' && minutes === ALLUMAGE_JERUSALEM;

/**
 * Le texte du siddour que suggère l'instant [maintenant] (Date) d'après les
 * zmanim du [lieu] : mêmes bornes que JourAffiche.momentDuSiddour ; null
 * dans les creux ('hatsot – min'ha guedola, chki'a – tsét) ; sans zmanim,
 * les heures fixes de SiddurMoment.
 */
/**
 * [enIsrael] : pour le Tikoun 'hatsot de la nuit (sansTikounHatsot) ; [nusah] : le profil des zmanim
 * (Z.jour, audit du 16/11) et le Tikoun Ra'hel de midi (tikounRahelDeMidi). Comme JourAffiche.momentDuSiddour.
 */
export function momentDuSiddour(lieu, maintenant, enIsrael = true, nusah = '') {
  const parties = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: lieu.fuseau, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(maintenant).map((p) => [p.type, p.value]));
  const iso = `${parties.year}-${parties.month}-${parties.day}`;
  const minutes = Number(parties.hour) * 60 + Number(parties.minute);
  const [a, m, j] = iso.split('-').map(Number);
  const decale = (n) => new Date(Date.UTC(a, m - 1, j + n, 12)).toISOString().slice(0, 10);
  // La nuit appartient au jour hébreu civil après minuit, au lendemain avant minuit (audit du 16/11).
  const sans = sansTikounHatsot(minutes < 12 * 60 ? iso : decale(1), enIsrael);
  const tikoun = sans ? 'chema_coucher' : 'tikoun_hatsot';
  // Le profil des zmanim du noussa'h (audit du 16/11, Zmanim.jour).
  const instants = (d) => Object.fromEntries(Z.jour(lieu, d, nusah).map((x) => [x.cle, x.instant]));
  const z = instants(iso);
  // Aube absente autour du solstice (Londres, Berlin, Moscou…) : michéyakir, puis le lever du soleil, en tiennent lieu.
  if (!z.alot) z.alot = z.misheyakir || z.netz;
  if (!z.misheyakir) z.misheyakir = z.netz;
  const hier = instants(decale(-1));
  const cles = ['alot', 'misheyakir', 'chatsot', 'minha_gedola', 'chkia', 'tset', 'chatsot_layla'];
  if (cles.some((c) => !z[c]) || !hier.chatsot_layla) return SiddurMoment.suggestion(Math.floor(minutes / 60), minutes % 60, sans);
  const t = +maintenant;
  const avant = (c) => t < +z[c];
  if (avant('alot')) return t >= +hier.chatsot_layla ? tikoun : 'chema_coucher';
  if (avant('misheyakir')) return 'birkot_hachahar';
  if (avant('chatsot')) return 'chaharit';
  if (avant('minha_gedola')) return tikounRahelDeMidi(iso, nusah) ? 'tikoun_hatsot' : null;
  if (avant('chkia')) return 'minha';
  if (avant('tset')) return null;
  if (avant('chatsot_layla')) return minutes > 12 * 60 && minutes < 22 * 60 + 30 ? 'arvit' : 'chema_coucher';
  return tikoun;
}

/**
 * Pas de Tikoun 'hatsot la nuit du jour hébreu iso : Chabbat, Yom tov (le second jour en diaspora),
 * 'Hol hamoed Pessa'h (JourAffiche.sansTikounHatsot ; audit du 16/11 : consigne du texte ;
 * Kitsour Yalkut Yosef, דיני תיקון חצות, se'if נה).
 */
export function sansTikounHatsot(iso, enIsrael) {
  const c = calendrier(iso, enIsrael, false, false);
  return new Date(`${iso}T12:00:00Z`).getUTCDay() === 6 || c.isYomTovAssurBemelacha() || c.getYomTovIndex() === JewishCalendar.CHOL_HAMOED_PESACH;
}

/**
 * Bein hamétsarim, du 17 Tamouz au 8 Av, sauf Chabbat et Roch 'Hodech Av : le Tikoun Ra'hel après
 * 'hatsot du jour (JourAffiche.tikounRahelDeMidi ; Kitsour Yalkut Yosef, דיני תיקון חצות, se'ifim מה
 * et נז) ; usage des Edot et du Sfard, pas de l'Ashkenaz.
 */
export function tikounRahelDeMidi(iso, nusah) {
  if (nusah === 'ashkenaz' || new Date(`${iso}T12:00:00Z`).getUTCDay() === 6) return false;
  const c = calendrier(iso, false, false, false);
  const j = c.getJewishDayOfMonth();
  return (c.getJewishMonth() === JewishDate.TAMMUZ && j >= 17) || (c.getJewishMonth() === JewishDate.AV && j >= 2 && j <= 8);
}

/** Les semaines d'un mois civil (mois 1-12), du dimanche au samedi ; null hors du mois. */
export function semaines(annee, mois) {
  const longueur = new Date(Date.UTC(annee, mois, 0)).getUTCDate();
  const p = (n) => String(n).padStart(2, '0');
  return grille(Array.from({ length: longueur }, (_, i) => `${annee}-${p(mois)}-${p(i + 1)}`));
}

const decaleIso = (iso, n) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** Le premier jour (1er) du mois hébreu qui contient iso. Le mois ne dépend pas du lieu. */
export function debutMoisHebreu(iso) {
  return decaleIso(iso, -(jour(iso, false).jourHebreu - 1));
}

/** Les 29 ou 30 jours du mois hébreu qui contient iso. */
export function joursMoisHebreu(iso) {
  const debut = debutMoisHebreu(iso);
  const mois = jour(debut, false).moisHebreu;
  const jours = [debut];
  for (let d = decaleIso(debut, 1); jour(d, false).moisHebreu === mois; d = decaleIso(d, 1)) jours.push(d);
  return jours;
}

/** Les semaines du mois hébreu qui contient iso, du dimanche au samedi ; null hors du mois. */
export function semainesHebreu(iso) {
  return grille(joursMoisHebreu(iso));
}

/** Le 1er du mois hébreu suivant (sens = 1) ou précédent (sens = -1). */
export function moisHebreuVoisin(iso, sens) {
  return sens > 0 ? decaleIso(joursMoisHebreu(iso).at(-1), 1) : debutMoisHebreu(decaleIso(debutMoisHebreu(iso), -1));
}

function grille(jours) {
  const decalage = new Date(`${jours[0]}T12:00:00Z`).getUTCDay();
  const cases = [...Array(decalage).fill(null), ...jours];
  const s = [];
  for (let i = 0; i < cases.length; i += 7) {
    const l = cases.slice(i, i + 7);
    s.push([...l, ...Array(7 - l.length).fill(null)]);
  }
  return s;
}

// --- La carte du jour : illustration, hilloula, halakha (11/10) -------------------
// Comme JourAffiche.illustration et Hilloulot.kt.

/** L'illustration d'un jour de fête ou de Chabbat, ou null ; la fête passe avant Chabbat. */
export function illustration(fetes, iso) {
  const a = (liste) => fetes.some((f) => liste.includes(f));
  if (a(['erev_soukkot', 'soukkot', 'hol_hamoed_soukkot', 'hochaana_rabba'])) return 'scene_sukkot';
  if (a(['erev_pessah', 'pessah', 'hol_hamoed_pessah'])) return 'char_matsa';
  if (fetes.includes('hanouka')) return 'scene_hanukkah';
  if (a(['pourim', 'chouchan_pourim', 'pourim_ailleurs', 'pourim_jerusalem'])) return 'char_purim';
  return new Date(`${iso}T12:00:00Z`).getUTCDay() === 6 ? 'char_shabbat' : null;
}

/** Cycle de Méton : 7 années embolismiques sur 19. */
export const embolismique = (annee) => (7 * annee + 1) % 19 < 7;

/**
 * Les clés de hilloulot.json pour un jour hébreu (mois de KosherJava,
 * NISSAN = 1 … ADAR_II = 13). « adar » sans précision : Adar II les années
 * embolismiques (OH 568:7) ; un 30 absent cette année, le 29.
 */
export function clesHilloula(mois, jourH, emb, dernierJour, ashkenaz = false) {
  // Ashkénazes : « adar » en Adar I, comme le note le Rema (Hilloulot.cles).
  const m = mois === 12 && !emb ? ['adar', 'adar1', 'adar2'] : mois === 12 ? (ashkenaz ? ['adar', 'adar1'] : ['adar1'])
    : mois === 13 ? (ashkenaz ? ['adar2'] : ['adar', 'adar2']) : [String(mois)];
  const jours = jourH === 29 && dernierJour ? [29, 30] : [jourH];
  const base = m.flatMap((k) => jours.map((j) => `${k}-${j}`));
  // Le 30 Adar n'existe qu'en Adar I (audit du 16/11, Hilloulot.cles) : une année embolismique, le 30 Adar I
  // pour tous (Kitsour Yalkut Yosef 40:22) ; une année simple, en Ashkenaz, le 30 Chevat (Michna Beroura 568:42).
  const trente = ['adar-30', 'adar1-30'];
  if (emb && mois === 13) return base.filter((k) => k !== 'adar-30');
  if (emb && mois === 12 && jourH === 30 && !base.includes('adar-30')) return [...base, 'adar-30'];
  if (!emb && ashkenaz && mois === 12) return base.filter((k) => !trente.includes(k));
  if (!emb && ashkenaz && mois === 11 && jourH === 30) return [...base, ...trente];
  return base;
}

/**
 * Hilloulot.duJour (04/11) : d'abord les mieux connus, ceux que le plus de sources donnent ;
 * à nombre de sources égal, ceux dont rien n'est mis en doute, puis ceux qui ont une notice.
 * À égalité, l'ordre du fichier.
 */
export function hilloulotDuJour(table, cles) {
  const cle = (h) => [-h.s.length, h.d ? 1 : 0, h.t ? 0 : 1];
  const compare = (a, b) => { const x = cle(a); const y = cle(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; };
  return cles.flatMap((k) => table[k] ?? []).map((h, i) => [h, i])
    .sort((x, y) => compare(x[0], y[0]) || x[1] - y[1]).map(([h]) => h);
}

/** Hilloulot.rangDansLAnnee : le rang d'une clé « mois-jour », de Tichri à Eloul (Adar I, Adar, Adar II). */
export function rangDansLAnnee(cle) {
  const [m, j] = cle.split('-');
  const n = Number(m);
  const mois = m === 'adar1' ? 6 : m === 'adar' ? 7 : m === 'adar2' ? 8 : Number.isInteger(n) && n > 0 ? (n >= 7 ? n - 6 : n + 8) : 20;
  return mois * 100 + (Number(j) || 0);
}

/** Hilloulot.prochainJour : le prochain jour civil, depuis [iso], où tombe la clé ; trois ans au plus. */
export function prochainJourHilloula(cle, iso, enIsrael, ashkenaz = false) {
  const [a, m, d] = iso.split('-').map(Number);
  for (let i = 0; i < 3 * 385; i++) {
    const jourIso = new Date(Date.UTC(a, m - 1, d + i, 12)).toISOString().slice(0, 10);
    if (clesHilloulotPour(jourIso, enIsrael, ashkenaz).includes(cle)) return jourIso;
  }
  return null;
}

/** Les clés de hilloulot.json d'un jour civil. */
export function clesHilloulotPour(iso, enIsrael, ashkenaz = false) {
  const j = jour(iso, enIsrael);
  const [a, m, d] = iso.split('-').map(Number);
  const demain = new Date(Date.UTC(a, m - 1, d + 1, 12)).toISOString().slice(0, 10);
  return clesHilloula(j.moisHebreu, j.jourHebreu, embolismique(j.anneeHebraique), jour(demain, enIsrael).jourHebreu === 1, ashkenaz);
}

export function hilloulotPour(table, iso, enIsrael, ashkenaz = false) {
  return hilloulotDuJour(table, clesHilloulotPour(iso, enIsrael, ashkenaz));
}

/** La page du jour de החכם היומי, qui prend la date civile. */
export function lienHyomi(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return `https://hyomi.org.il/day.php?month1=0&dd=${d}&mm=${m}&yy=${a}`;
}

/**
 * La halakha du jour, dans la langue de l'application (le site a he, fr, en). Ni l'espagnol ni
 * l'arabe : l'anglais pour l'un, le français, lu en Tunisie, pour l'autre (Hilloulot.lienHalakha).
 */
export function lienHalakha(langue) {
  const code = /^(he|iw)/.test(langue) ? 'he' : /^(en|es)/.test(langue) ? 'en' : 'fr';
  return `https://halachayomit.co.il/${code}/default.aspx`;
}

const MOIS_HILLOULA = { 1: 'ניסן', 2: 'אייר', 3: 'סיון', 4: 'תמוז', 5: 'אב', 6: 'אלול', 7: 'תשרי', 8: 'חשון', 9: 'כסלו', 10: 'טבת', 11: 'שבט', adar: 'אדר', adar1: 'אדר א׳', adar2: 'אדר ב׳' };

/** « 7-30 » → « ל׳ תשרי » (Hilloulot.dateDe). */
export function dateHilloula(cle, lettres) {
  const [m, j] = cle.split('-');
  return `${lettres(Number(j))} ${MOIS_HILLOULA[m] ?? m}`;
}

/** La recherche par nom, sans voyelles ni guillemets, dans toute l'année, de Tichri à Eloul (04/11). */
export function rechercheHilloula(table, texte) {
  // Comme RechercheGlobale.nu : « Moche » trouve « Moché », « pinhas » trouve « Pin'has ».
  const nu = (t) => t.normalize('NFD').replace(/[\u0300-\u036F’‘]/g, '').replace(/[־׀]/g, ' ').replace(/[\u0591-\u05C7"'״׳]/g, '').toLowerCase();
  const q = nu(texte.trim());
  if (q.length < 2) return [];
  return Object.entries(table).flatMap(([cle, l]) => l.map((x) => [cle, x]))
    .filter(([, x]) => nu(x.he).includes(q) || (x.fr && nu(x.fr).includes(q)) || (x.en && nu(x.en).includes(q)))
    .map((r, i) => [r, i]).sort((x, y) => rangDansLAnnee(x[0][0]) - rangDansLAnnee(y[0][0]) || x[1] - y[1]).map(([r]) => r);
}

export const lienArticle = (titre) => `https://he.wikipedia.org/wiki/${encodeURIComponent(titre.replace(/ /g, '_'))}`;
