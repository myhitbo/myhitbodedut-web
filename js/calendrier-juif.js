// Le jour hébraïque et ce qu'il change aux prières (CalendrierJuif.kt, 10/10),
// sans réseau, par kosher-zmanim 0.9.0 et le portage de TefilaRules
// (tefila.js). Même entrée, même sortie qu'Android : web/test vérifie l'égalité
// jour par jour avec ce que KosherJava répond (vecteurs_kosherjava.json).

import { DateTime, HebrewDateFormatter, JewishCalendar, JewishDate } from '../vendor/kosher-zmanim-0.9.0.min.js';
import * as T from './tefila.js';

/** Les clés de condition, communes à Android, au web et aux annotations du siddour. */
export const C = Object.freeze({
  YAALE_VEYAVO: 'yaale_veyavo', ROCH_HODECH: 'roch_hodech', PESSAH: 'pessah', SOUKKOT: 'soukkot',
  CHAVOUOT: 'chavouot', ROCH_HACHANA: 'roch_hachana', CHEMINI_ATSERET: 'chemini_atseret', KIPPOUR: 'kippour',
  AL_HANISSIM: 'al_hanissim', HANOUKA: 'hanouka', POURIM: 'pourim',
  MACHIV_HAROUAH: 'machiv_harouah', MORID_HATAL: 'morid_hatal', TAL_OUMATAR: 'tal_oumatar', BERAKHA: 'berakha',
  HALLEL: 'hallel', HALLEL_COMPLET: 'hallel_complet',
  TAHANOUN_CHAHARIT: 'tahanoun_chaharit', TAHANOUN_MINHA: 'tahanoun_minha', LUNDI_JEUDI: 'lundi_jeudi',
  ASSERET_YEMEI_TECHOUVA: 'asseret_yemei_techouva', JEUNE: 'jeune', TICHA_BEAV: 'ticha_beav',
  CHABBAT: 'chabbat', MOTSAE_CHABBAT: 'motsae_chabbat', OMER: 'omer', FIN_TICHRI: 'fin_tichri',
});
export const TOUTES = Object.values(C);

/** Les fêtes par JewishCalendar.getYomTovIndex() : libellé « fete_<clé> ». */
export const FETES = new Map([
  [JewishCalendar.EREV_PESACH, 'erev_pessah'], [JewishCalendar.PESACH, 'pessah'],
  [JewishCalendar.CHOL_HAMOED_PESACH, 'hol_hamoed_pessah'], [JewishCalendar.PESACH_SHENI, 'pessah_cheni'],
  [JewishCalendar.EREV_SHAVUOS, 'erev_chavouot'], [JewishCalendar.SHAVUOS, 'chavouot'],
  [JewishCalendar.SEVENTEEN_OF_TAMMUZ, 'tamouz_17'], [JewishCalendar.TISHA_BEAV, 'ticha_beav'],
  [JewishCalendar.TU_BEAV, 'tou_beav'], [JewishCalendar.EREV_ROSH_HASHANA, 'erev_roch_hachana'],
  [JewishCalendar.ROSH_HASHANA, 'roch_hachana'], [JewishCalendar.FAST_OF_GEDALYAH, 'jeune_guedalia'],
  [JewishCalendar.EREV_YOM_KIPPUR, 'erev_yom_kippour'], [JewishCalendar.YOM_KIPPUR, 'yom_kippour'],
  [JewishCalendar.EREV_SUCCOS, 'erev_soukkot'], [JewishCalendar.SUCCOS, 'soukkot'],
  [JewishCalendar.CHOL_HAMOED_SUCCOS, 'hol_hamoed_soukkot'], [JewishCalendar.HOSHANA_RABBA, 'hochaana_rabba'],
  [JewishCalendar.SHEMINI_ATZERES, 'chemini_atseret'], [JewishCalendar.SIMCHAS_TORAH, 'simhat_torah'],
  [JewishCalendar.CHANUKAH, 'hanouka'], [JewishCalendar.TENTH_OF_TEVES, 'tevet_10'],
  [JewishCalendar.TU_BESHVAT, 'tou_bichvat'], [JewishCalendar.FAST_OF_ESTHER, 'jeune_esther'],
  [JewishCalendar.PURIM, 'pourim'], [JewishCalendar.SHUSHAN_PURIM, 'chouchan_pourim'],
  [JewishCalendar.PURIM_KATAN, 'pourim_katan'], [JewishCalendar.ROSH_CHODESH, 'roch_hodech'],
  [JewishCalendar.YOM_HASHOAH, 'yom_hachoah'], [JewishCalendar.YOM_HAZIKARON, 'yom_hazikaron'],
  [JewishCalendar.YOM_HAATZMAUT, 'yom_haatsmaout'], [JewishCalendar.YOM_YERUSHALAYIM, 'yom_yerouchalayim'],
  [JewishCalendar.LAG_BAOMER, 'lag_baomer'], [JewishCalendar.SHUSHAN_PURIM_KATAN, 'chouchan_pourim_katan'],
  [JewishCalendar.ISRU_CHAG, 'isrou_hag'],
]);

const FORMAT = new HebrewDateFormatter();
FORMAT.setHebrewFormat(true);

export function calendrier(iso, enIsrael, modernes, mukafChoma) {
  const [year, month, day] = iso.split('-').map(Number);
  const jc = new JewishCalendar(DateTime.fromObject({ year, month, day }));
  jc.setInIsrael(enIsrael);
  jc.setUseModernHolidays(modernes);
  jc.setIsMukafChoma(mukafChoma);
  return jc;
}

/** Jérusalem (GeoNames), ville murée depuis Josué : Pourim y est le 15 Adar. */
export const JERUSALEM_GEONAMES = 281184;

/** Une position dans Jérusalem : à 10 km au plus de la Vieille Ville (choix de l'application, CalendrierJuif.aJerusalem). */
export function aJerusalem(latitude, longitude) {
  // Hors de la ville (CalendrierJuif.aJerusalem, audit du 16/10) : Abou Dis, Ma'alé Adoumim, Bethléem, Mevasseret.
  if (longitude > 35.258 || latitude < 31.72 || (longitude < 35.165 && latitude > 31.785)) return false;
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(latitude - 31.7767), dLon = rad(longitude - 35.2345);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(31.7767)) * Math.cos(rad(latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a)) <= 10;
}
/** Les noms de Pourim dans une ville murée (CalendrierJuif.MUREE). */
const MUREE = { pourim: 'pourim_ailleurs', chouchan_pourim: 'pourim_jerusalem' };

/**
 * Le jour hébreu d'une date civile « AAAA-MM-JJ », comme CalendrierJuif.jour.
 * [mukafChoma] : Pourim et Al hanissim le 15 Adar (seule Jérusalem, parmi les
 * villes proposées, l'est avec certitude).
 */
export function jour(iso, enIsrael, mukafChoma = false) {
  // Les fêtes modernes s'affichent, mais n'entrent pas dans les règles de prière.
  const regles = calendrier(iso, enIsrael, false, mukafChoma);
  const affiche = calendrier(iso, enIsrael, true, mukafChoma);
  const semaine = new Date(`${iso}T12:00:00Z`).getUTCDay(); // 0 = dimanche
  const c = new Set();
  const si = (oui, cle) => { if (oui) c.add(cle); };
  si(T.isYaalehVeyavoRecited(regles), C.YAALE_VEYAVO);
  si(regles.isRoshChodesh(), C.ROCH_HODECH);
  si(regles.isPesach(), C.PESSAH);
  si(regles.isSuccos(), C.SOUKKOT);
  si(regles.isShavuos(), C.CHAVOUOT);
  si(regles.isRoshHashana(), C.ROCH_HACHANA);
  si(regles.isShminiAtzeres() || regles.isSimchasTorah(), C.CHEMINI_ATSERET);
  si(regles.isYomKippur(), C.KIPPOUR);
  si(T.isAlHanissimRecited(regles), C.AL_HANISSIM);
  si(regles.isChanukah(), C.HANOUKA);
  si(regles.isPurim(), C.POURIM);
  si(T.isMashivHaruachRecited(regles), C.MACHIV_HAROUAH);
  si(T.isMoridHatalRecited(regles), C.MORID_HATAL);
  si(T.isVeseinTalUmatarRecited(regles), C.TAL_OUMATAR);
  si(T.isVeseinBerachaRecited(regles), C.BERAKHA);
  si(T.isHallelRecited(regles), C.HALLEL);
  si(T.isHallelShalemRecited(regles), C.HALLEL_COMPLET);
  // La veille de Roch Hachana, pas de Ta'hanoun à la prière (OC 581:3).
  // Pourim triple : à Jérusalem, le dimanche 16 Adar, jour du festin, ni Ta'hanoun ni למנצח (CalendrierJuif.kt).
  // Ailleurs en Israël : « pourim_triple_hors_jerusalem », sans Ta'hanoun en Ashkenaz (SiddurJour.conditionsPour).
  const dimanchePourimTriple = semaine === 0 && regles.getJewishDayOfMonth() === 16
    && regles.getJewishMonth() === (regles.isJewishLeapYear() ? JewishDate.ADAR_II : JewishDate.ADAR);
  const festinJerusalem = mukafChoma && dimanchePourimTriple;
  si(festinJerusalem, 'pourim_triple_festin');
  si(enIsrael && !mukafChoma && dimanchePourimTriple, 'pourim_triple_hors_jerusalem');
  const tahanoun = T.isTachanunRecitedShacharis(regles) && regles.getYomTovIndex() !== JewishCalendar.EREV_ROSH_HASHANA && !festinJerusalem;
  si(tahanoun, C.TAHANOUN_CHAHARIT);
  si(T.isTachanunRecitedMincha(regles) && !festinJerusalem, C.TAHANOUN_MINHA);
  si(tahanoun && (semaine === 1 || semaine === 4), C.LUNDI_JEUDI);
  si(regles.isAseresYemeiTeshuva(), C.ASSERET_YEMEI_TECHOUVA);
  si(regles.isTaanis() && !regles.isYomKippur(), C.JEUNE);
  si(regles.isTishaBav(), C.TICHA_BEAV);
  si(semaine === 6, C.CHABBAT);
  si(semaine === 0, C.MOTSAE_CHABBAT);
  si(regles.getDayOfOmer() > 0, C.OMER);
  si(regles.getJewishMonth() === JewishDate.TISHREI && regles.getJewishDayOfMonth() >= 22, C.FIN_TICHRI);
  // La lecture de la Torah à Cha'harit (15/10, CalendrierJuif.kt) : hors de TOUTES, comme dans DERIVEES.
  si(semaine === 1 || semaine === 4 || ['chabbat', 'roch_hodech', 'pessah', 'soukkot', 'chavouot', 'roch_hachana', 'kippour',
    'chemini_atseret', 'hanouka', 'pourim', 'jeune', 'ticha_beav'].some((k) => c.has(k)), 'kriat_hatorah');
  // Le psaume du jour et les jours qui en ajoutent un (16/10, CalendrierJuif.kt).
  si(semaine !== 6, `jour_${semaine + 1}`);
  const index = regles.getYomTovIndex();
  si(index === JewishCalendar.FAST_OF_GEDALYAH || index === JewishCalendar.TENTH_OF_TEVES, 'tsom_guedalia_tevet');
  si(regles.getJewishMonth() === JewishDate.TISHREI && regles.getJewishDayOfMonth() === 11, 'lendemain_kippour');
  // Le 9 Av ou Kippour (12/11, CalendrierJuif.C.TICHA_BEAV_KIPPOUR) : pas de « שעשה לי כל צרכי » (Edot).
  si(regles.isTishaBav() || regles.isYomKippur(), 'ticha_beav_kippour');
  si(index === JewishCalendar.FAST_OF_ESTHER || c.has('pourim'), 'esther_pourim');
  si(index === JewishCalendar.SEVENTEEN_OF_TAMMUZ, 'chiva_assar_tamouz');
  // Les jours de bascule et la veille de Kippour un vendredi (CalendrierJuif.C.BASCULE_PLUIE, EREV_KIPPOUR_VENDREDI).
  const mois = regles.getJewishMonth(), quantieme = regles.getJewishDayOfMonth();
  si((mois === JewishDate.TISHREI && quantieme === 22) || (mois === JewishDate.NISSAN && quantieme === 15), 'bascule_pluie');
  si(mois === JewishDate.TISHREI && quantieme === 9 && semaine === 5, 'erev_kippour_vendredi');
  // Relevé du 19/10 (CalendrierJuif.C.LAMNATSEAH…).
  const adar1415 = (mois === JewishDate.ADAR || mois === JewishDate.ADAR_II) && quantieme >= 14 && quantieme <= 15;
  si(!(regles.isRoshChodesh() || regles.isChanukah() || adar1415 || festinJerusalem || regles.isTishaBav() || regles.isAssurBemelacha() || regles.isCholHamoed() ||
    index === JewishCalendar.EREV_PESACH || index === JewishCalendar.EREV_YOM_KIPPUR), 'lamnatseah');
  si(mois === JewishDate.ELUL || (mois === JewishDate.TISHREI && quantieme <= 21), 'ledavid');
  si(regles.isAseresYemeiTeshuva() || (mois === JewishDate.TISHREI && quantieme === 21), 'techouva_hochaana');
  const yomTov = regles.isYomTovAssurBemelacha();
  si(yomTov, 'yom_tov');
  si(['pessah', 'soukkot', 'chavouot', 'chemini_atseret'].some((k) => c.has(k)), 'moed');
  si(c.has('chabbat') && regles.isRoshChodesh(), 'chabbat_roch_hodech');
  // Hallel et Moussaf (audit du 16/11 ; CalendrierJuif.C.ROCH_HODECH_CHOL…) : le Moussaf de Roch 'Hodech
  // en semaine seulement (le Chabbat, « אתה יצרת », Kitsour Yalkut Yosef 423:10) ; 'Hol hamoed ; 'Hanouka
  // sans Moussaf (demi-Kaddich après le Hallel, Kitsour Yalkut Yosef 423:1) ; 'Hanouka hors de Roch
  // 'Hodech (psaume 30 après Moussaf à Roch 'Hodech Tévèt, 683:11) ; le soir du Séder (487:5) ; Hallel partiel.
  si(!c.has('chabbat') && regles.isRoshChodesh(), 'roch_hodech_chol');
  si(regles.isCholHamoed(), 'hol_hamoed');
  si(regles.isChanukah() && !regles.isRoshChodesh() && !c.has('chabbat'), 'hanouka_sans_moussaf');
  si(regles.isChanukah() && !regles.isRoshChodesh(), 'hanouka_hors_roch_hodech');
  si(index === JewishCalendar.PESACH && mois === JewishDate.NISSAN && quantieme <= 16, 'leil_pessah');
  si(c.has('hallel') && !c.has('hallel_complet'), 'hallel_partiel');
  // « וּלְכַפָּרַת פָּשַׁע » au Moussaf de Roch 'Hodech d'une année embolismique (28/10) : jusqu'à Roch 'Hodech
  // Adar II inclus, plus à partir de Nissan (« עד חודש ניסן », Sfard et Ashkenaz ; pour les Edot, Kitsour Yalkut
  // Yosef 423:14, audit du 16/11 : la consigne de leur siddour, « בשנה מעוברת », le dit toute l'année comme le
  // Ben Ich 'Haï et le Kaf ha'Haïm 423:18). Michna Beroura 423:6 rapporte trois usages : tous les mois, l'année
  // embolismique, ou celle-ci jusqu'à la fin d'Adar II. Le 30 inaugure le mois suivant.
  if (regles.isRoshChodesh() && regles.isJewishLeapYear()) {
    const inaugure = quantieme === 30 ? (mois === JewishDate.ADAR ? JewishDate.ADAR_II : mois === JewishDate.ADAR_II ? JewishDate.NISSAN : mois + 1) : mois;
    c.add('embolismique');
    si(inaugure >= JewishDate.TISHREI, 'embolismique_avant_nissan');
  }
  si(c.has('chabbat') && yomTov, 'yom_tov_chabbat');
  si(c.has('chabbat') && regles.isRoshHashana(), 'roch_hachana_chabbat');
  // Audit du 16/11 (CalendrierJuif.C.AVINOU_MALKENOU_JEUNE…) : les lignes des jeûnes d'Avinou malkénou hors des
  // dix jours (Matté Efraïm 602:13) ; la fin du Kaddich après le Hallel les jours de Moussaf (Kitsour Yalkout
  // Yossef 423:1) ; le 13 Iyar (Kitsour Yalkout Yossef 131:38) ; la veille de Kippour (Choul'han Aroukh O.H. 607:1).
  si(c.has('jeune') && !c.has('asseret_yemei_techouva'), 'avinou_malkenou_jeune');
  si(!regles.isChanukah() || regles.isRoshChodesh() || c.has('chabbat'), 'kaddich_complet_hallel');
  si(mois === JewishDate.IYAR && quantieme === 13, 'veille_pessah_cheni');
  si(mois === JewishDate.IYAR && quantieme === 14, 'jour_pessah_cheni');
  // אל ארך אפים : les jours de למנצח, lundi et jeudi seulement (ShA haRav 429:12 ; CalendrierJuif.C.EL_EREKH_APAYIM).
  si(c.has('lamnatseah') && (semaine === 1 || semaine === 4), 'el_erekh_apayim');
  si(index === JewishCalendar.EREV_YOM_KIPPUR, 'erev_kippour');
  const decale = (k) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + k); return calendrier(d.toISOString().slice(0, 10), enIsrael, false, mukafChoma); };
  const hier = decale(-1);
  // Un samedi soir qui est Yom tov n'est pas un soir ouvrable (O.H. 491:2 ; audit du 16/11, CalendrierJuif.kt).
  si((c.has('motsae_chabbat') || hier.isYomTovAssurBemelacha()) && !regles.isAssurBemelacha(), 'motsae_chabbat_yt');
  // Audit du 16/11 (CalendrierJuif.C.MIZMOR_LETODA…) ; 'hol_hamoed' est posé plus haut.
  si(regles.isAssurBemelacha(), 'chome');
  si(!(c.has('chabbat') || yomTov || regles.isPesach() || index === JewishCalendar.EREV_PESACH || index === JewishCalendar.EREV_YOM_KIPPUR), 'mizmor_letoda');
  si(semaine === 0 && [0, 1, 2, 3, 4, 5].some((k) => { const d = decale(k); return d.isYomTovAssurBemelacha() || d.isCholHamoed(); }), 'yom_tov_semaine');
  si(mois === JewishDate.NISSAN && (quantieme === 15 || (quantieme === 16 && !enIsrael)), 'leil_haseder');
  si(hier.isRoshChodesh() && !regles.isRoshChodesh(), 'lendemain_roch_hodech');
  // Le vendredi 14 Adar d'un Pourim triple à Jérusalem (CalendrierJuif.C.POURIM_TRIPLE_VENDREDI).
  si(mukafChoma && semaine === 5 && quantieme === 14 && mois === (regles.isJewishLeapYear() ? JewishDate.ADAR_II : JewishDate.ADAR), 'pourim_triple_vendredi');
  // La Havdala et le lendemain d'un jour d'ajouts (audit du 16/11, CalendrierJuif.C.HAVDALA_NER…).
  const veille = hier;
  const kippour = c.has('kippour') || c.has('lendemain_kippour');
  si(c.has('chabbat') || c.has('motsae_chabbat') || kippour, 'havdala_ner');
  si(c.has('chabbat') || (c.has('motsae_chabbat') && !c.has('ticha_beav')) || kippour, 'havdala_bessamim');
  si(semaine === 1 && veille.isTishaBav(), 'lendemain_ticha_beav_dimanche');
  si(semaine !== 6 && (semaine === 0 || veille.isRoshChodesh() || veille.isYomTovAssurBemelacha() || veille.isCholHamoed()
    || veille.isChanukah() || veille.isPurim()), 'lendemain_ajouts');
  si((mois === JewishDate.TAMMUZ && quantieme >= 17) || (mois === JewishDate.AV && quantieme <= 10), 'bein_hametsarim');
  // Tikoun Ra'hel (audit du 16/11, CalendrierJuif.C.TIKOUN_RAHEL) : pas à Roch 'Hodech, de Roch Hachana à
  // Chemini Atseret, à 'Hanouka, aux jours de Pourim, en Nissan, pendant l'omer (Kitsour Yalkut Yosef, דיני
  // תיקון חצות §נה ; Ben Ich 'Haï, Vayichla'h ה), ni en Israël l'année de chemita (§נז).
  si(!(regles.isRoshChodesh() || (mois === JewishDate.TISHREI && quantieme <= (enIsrael ? 22 : 23)) || regles.isChanukah() || adar1415
    || mois === JewishDate.NISSAN || regles.getDayOfOmer() > 0 || (enIsrael && regles.getJewishYear() % 7 === 0)), 'tikoun_rahel');
  // Un repère sans condition (audit du 16/11, CalendrierJuif.C.TOUJOURS) : une indication fixe du siddour.
  c.add('toujours');

  const fetes = [];
  const fete = FETES.get(affiche.getYomTovIndex());
  // Dans une ville murée, le 15 Adar est Pourim ; le 14 ne l'est qu'ailleurs.
  if (fete) fetes.push(mukafChoma ? (MUREE[fete] ?? fete) : fete);
  if (affiche.isRoshChodesh() && !fetes.includes('roch_hodech')) fetes.push('roch_hodech');

  // JewishCalendar.Parsha.NONE vaut 0 dans kosher-zmanim comme dans KosherJava.
  const paracha = semaine === 6 && regles.getParsha() !== 0 ? FORMAT.formatParsha(regles) : null;
  return {
    date: iso,
    enIsrael,
    dateHebraique: FORMAT.format(regles),
    jourEnLettres: FORMAT.formatHebrewNumber(regles.getJewishDayOfMonth()),
    jourHebreu: regles.getJewishDayOfMonth(),
    moisHebreu: regles.getJewishMonth(),
    anneeHebraique: regles.getJewishYear(),
    moisEtAnnee: `${FORMAT.formatMonth(regles)} ${FORMAT.formatHebrewNumber(regles.getJewishYear())}`,
    fetes,
    omer: Math.max(regles.getDayOfOmer(), 0),
    paracha: paracha || null,
    chome: regles.isAssurBemelacha(),
    conditions: c,
    parachaSpeciale: parachaSpeciale(regles, mukafChoma),
  };
}

/**
 * Le Chabbat spécial (CalendrierJuif.parachaSpeciale, audit du 16/11) : Chekalim, Zakhor, Para, ha'Hodech… ;
 * à Jérusalem, le Chabbat 15 Adar d'un Pourim triple, le maftir « ויבא עמלק » (Choul'han Aroukh O.H. 688:6).
 */
function parachaSpeciale(regles, mukafChoma) {
  if (regles.getDayOfWeek() !== 7) return null;
  if (regles.getSpecialShabbos() !== 0) return FORMAT.formatSpecialParsha(regles) || null;
  const adar = regles.isJewishLeapYear() ? JewishDate.ADAR_II : JewishDate.ADAR;
  return mukafChoma && regles.getJewishMonth() === adar && regles.getJewishDayOfMonth() === 15 ? 'מפטיר ויבא עמלק' : null;
}

/**
 * La période où l'on évite d'écouter des chants avec instruments (CalendrierJuif.periodeSansMusique, audit
 * du 16/11) : 'omer' sauf Lag baOmer (Kitsour Yalkut Yosef 493:8), 'bein_hametsarim' du 17 Tamouz au 9 Av
 * (YY 551:6 ; MB 551:16) ; null sinon. Un rappel, jamais une coupure.
 */
export function periodeSansMusique(iso) {
  const c = calendrier(iso, false, false, false);
  const omer = c.getDayOfOmer();
  if (omer > 0 && omer !== 33) return 'omer';
  const m = c.getJewishMonth(), j = c.getJewishDayOfMonth();
  if ((m === JewishDate.TAMMUZ && j >= 17) || (m === JewishDate.AV && j <= 9) || c.getYomTovIndex() === JewishCalendar.TISHA_BEAV) return 'bein_hametsarim';
  return null;
}

/**
 * Les repères du jour qui ne changent pas le texte de la prière (CalendrierJuif.reperes, audit du 16/11) :
 * Seli'hot (Kitsour Yalkut Yosef 581:1 ; Rema 581:1), chofar d'Eloul (Rema 581:1 et 3), בה״ב (Rema 492:1 ;
 * MB 492:3 et 566:10), Yom Kippour katan (MB 417:4 ; YY 417:5), érouv tavchilin (Choul'han Aroukh O.H. 527:1).
 */
export function reperes(iso, enIsrael, nusah) {
  const cal = (d) => calendrier(d, enIsrael, false, false);
  const c = cal(iso);
  const mois = c.getJewishMonth(), j = c.getJewishDayOfMonth();
  const chabbat = new Date(`${iso}T12:00:00Z`).getUTCDay() === 6;
  const edot = nusah === 'edot';
  const r = [];
  const selihot = (() => {
    if (chabbat || c.isRoshHashana()) return false;
    if (mois === JewishDate.TISHREI) return j <= 9;
    if (mois !== JewishDate.ELUL) return false;
    if (edot) return j >= 2;
    // Le dimanche avant Roch Hachana ; s'il reste moins de quatre jours, celui d'avant.
    const rh = ajoute(iso, 30 - j);
    let debut = ajoute(rh, -new Date(`${rh}T12:00:00Z`).getUTCDay());
    if ((Date.parse(rh) - Date.parse(debut)) / 86400000 < 4) debut = ajoute(debut, -7);
    return iso >= debut;
  })();
  if (selihot) r.push('repere_selihot');
  if (!edot && mois === JewishDate.ELUL && j <= 28 && !chabbat) r.push('repere_chofar');
  if (mois === JewishDate.ELUL && j === 29) r.push('repere_pas_de_chofar');
  if (!edot && c.isBeHaB()) r.push('repere_behab');
  if (!edot && chabbat && cal(ajoute(iso, 2)).isBeHaB() && cal(ajoute(iso, 5)).isBeHaB()) r.push('repere_behab_mi_cheberakh');
  if (c.isYomKippurKatan()) r.push('repere_yom_kippour_katan');
  // L'érouv tavchilin : la veille d'un Yom tov dont les jours chômés mènent jusqu'à un vendredi.
  if (!c.isAssurBemelacha()) {
    for (let d = ajoute(iso, 1); cal(d).isYomTovAssurBemelacha(); d = ajoute(d, 1)) {
      if (new Date(`${d}T12:00:00Z`).getUTCDay() === 5) { r.push('repere_erouv_tavchilin'); break; }
    }
  }
  return r;
}

/**
 * Le jour civil dont relève une prière dite à [heures] (0-23) le [iso] :
 * Arvit et le Chema du coucher, l'après-midi, relèvent du lendemain ; les
 * autres textes sauf Min'ha, après la sortie des étoiles du lieu (28/10 ; voir
 * CalendrierJuif.jourDeLaPriere, qui documente la règle).
 */
export function jourDeLaPriere(texte, iso, heures, apresSortie = false) {
  // Tikoun 'hatsot avant minuit : la nuit du lendemain ; à midi (Bein hamétsarim), le jour même (audit du 16/11).
  const soir = texte === 'arvit' || texte === 'chema_coucher' ? heures >= 12 : texte === 'tikoun_hatsot' ? heures >= 18 : texte !== 'minha' && apresSortie;
  if (soir) {
    const [a, m, j] = iso.split('-').map(Number);
    return new Date(Date.UTC(a, m - 1, j + 1, 12)).toISOString().slice(0, 10);
  }
  return iso;
}

/**
 * La nuit, pour la lecture (CalendrierJuif.nuit, audit du 16/11 : la Méguila) : après la sortie des
 * étoiles ou avant l'aube du lieu ; sans lieu (null), de 19 h à 6 h.
 */
export function nuit(heures, apresSortie, avantAube) {
  return (apresSortie ?? heures >= 19) || (avantAube ?? heures < 6);
}

/**
 * Birkat haLevana (Levana.kt ; 13/10, revue le 14/10 sur le texte, export Sefaria) :
 *  - début : pas avant sept jours (Choulhan Aroukh O.H. 426:4) ; « la plupart des
 *    A'haronim » permettent après trois jours d'heure à heure (Michna Beroura 426:20) ;
 *    l'Ari attend sept jours (Chabad.org, Ohr Somayach) ;
 *  - fin : jusqu'au seizième jour, non compris (426:3), soit quinze jours depuis
 *    l'heure du molad (MB 426:17) ; le Rema : la mi-mois, 14 j 18 h 22 min (MB 426:19) ;
 *  - pas avant Kippour ni avant Tich'a beAv (Rema 426:2) ; à leur sortie, oui
 *    (Rema ; MB 426:11 pour Tich'a beAv) ;
 *  - motsaé Chabbat de préférence, si cette nuit tombe avant le 10 du mois (Rema 426:2,
 *    MB 426:6), et pas un motsaé Chabbat qui est Yom Tov.
 * Le premier soir est celui du début ; le dernier, celui de la nuit où la fenêtre se ferme.
 */
const MOIS_LUNAIRE = ((29 * 24 + 12) * 60 + 44) * 60000 + 3333;

/**
 * Les usages : début (jours depuis le molad), fin (15 jours, mi-mois, ou d'après la date).
 * 'nuit_15' (audit du 16/11, Levana.Usage.SEPT_NUIT_QUINZE) : le Yalkut Yosef compte selon la date
 * du mois : jamais la nuit du 16, et encore la fin de la nuit du 15, jusqu'au lever du soleil
 * (Kitsour Yalkut Yosef 426, se'ifim 28 et 37).
 */
export const USAGES_LEVANA = {
  trois_mi_mois: { debut: 3, fin: 'mi_mois' },
  sept_mi_mois: { debut: 7, fin: 'mi_mois' },
  sept_quinze: { debut: 7, fin: 15 },
  sept_nuit_quinze: { debut: 7, fin: 'nuit_15' },
};

/** L'usage par défaut d'un noussa'h : Edot haMizra'h le Yalkut Yosef (audit du 16/11), Sefard l'Ari, Ashkenaz la Michna Beroura et le Rema. */
export function usageLevana(nusah, choix = 'auto') {
  if (USAGES_LEVANA[choix]) return choix;
  return nusah === 'edot' ? 'sept_nuit_quinze' : nusah === 'sefard' ? 'sept_mi_mois' : 'trois_mi_mois';
}

/**
 * La nuit qui suit le jour civil iso est-elle Chabbat ou Yom tov (Levana.nuitChomee) ? Lekhat'hila,
 * pas de Birkat haLevana ces soirs-là (audit du 16/11 : MB 426:12 ; Kitsour Yalkut Yosef 426:33).
 */
export function nuitChomee(iso, enIsrael) {
  if (new Date(`${iso}T12:00:00Z`).getUTCDay() === 5) return 'chabbat';
  return calendrier(ajoute(iso, 1), enIsrael, false, false).isYomTovAssurBemelacha() ? 'yom_tov' : null;
}

/** Le soir de iso sort-il d'un jeûne autre que Kippour (Levana.sortieDeJeune ; Rema 426:2, MB 426:11) ? */
export function sortieDeJeune(iso, enIsrael) {
  const c = calendrier(iso, enIsrael, false, false);
  return c.isTaanis() && c.getYomTovIndex() !== JewishCalendar.YOM_KIPPUR;
}

const ajoute = (iso, n) => { const [a, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(a, m - 1, d + n, 12)).toISOString().slice(0, 10); };

/**
 * La lune vue d'ici, à un instant : la part éclairée du disque (0 à 1) et si elle
 * croît. Meeus, Astronomical Algorithms, ch. 48 (angle de phase approché) ; à un
 * ou deux pour cent près, assez pour un dessin.
 */
export function phaseLune(ms) {
  const T = (ms / 86400000 + 2440587.5 - 2451545) / 36525;
  const r = Math.PI / 180;
  const D = 297.8501921 + 445267.1114034 * T;
  const M = 357.5291092 + 35999.0502909 * T;
  const Mp = 134.9633964 + 477198.8675055 * T;
  const i = 180 - D - 6.289 * Math.sin(Mp * r) + 2.1 * Math.sin(M * r) - 1.274 * Math.sin((2 * D - Mp) * r)
    - 0.658 * Math.sin(2 * D * r) - 0.214 * Math.sin(2 * Mp * r) - 0.11 * Math.sin(D * r);
  return { eclairage: (1 + Math.cos(i * r)) / 2, croissante: ((D % 360) + 360) % 360 < 180 };
}

/**
 * Options : usage ; enIsrael (le second jour de fête en diaspora) ; tset(iso) et netz(iso), en ms,
 * l'heure des étoiles et du lever du soleil au lieu choisi (Levana.Horaires) ; sans lieu, 20 h et 6 h.
 */
export function levana(iso, zone, { usage = 'sept_mi_mois', enIsrael = true, tset = null, netz = null } = {}) {
  const regle = USAGES_LEVANA[usage] ?? USAGES_LEVANA.sept_mi_mois;
  const local = (ms) => new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
  const soir = (d) => DateTime.fromISO(`${d}T20:00`, { zone }).toMillis();
  // Les heures qui bornent les nuits (audit du 16/11) : la tsét du lieu, sinon 20 h ; le lever du soleil, sinon 6 h.
  const nuit = (d) => tset?.(d) ?? soir(d);
  const matin = (d) => netz?.(d) ?? DateTime.fromISO(`${d}T06:00`, { zone }).toMillis();
  const du = (d) => {
    const c = calendrier(d, false, false, false);
    const fin = regle.fin === 'nuit_15' ? matin(ajoute(d, 15 - c.getJewishDayOfMonth()))
      : (regle.fin === 15 ? c.getSofZmanKidushLevana15Days() : c.getSofZmanKidushLevanaBetweenMoldos()).toMillis();
    const f = {
      molad: c.getMoladAsDate().toMillis(),
      debut: (regle.debut === 3 ? c.getTchilasZmanKidushLevana3Days() : c.getTchilasZmanKidushLevana7Days()).toMillis(),
      fin,
      restriction: null,
    };
    // Tichri et Av : pas avant la sortie de Kippour, de Tich'a beAv (le jeûne, même repoussé au 10),
    // à la tsét du lieu (audit du 16/11 : non plus à 20 h, avant la fin du jeûne l'été).
    const mois = calendrier(local(f.debut), false, false, false).getJewishMonth();
    if (mois === JewishDate.TISHREI || mois === JewishDate.AV) {
      const cible = mois === JewishDate.TISHREI ? JewishCalendar.YOM_KIPPUR : JewishCalendar.TISHA_BEAV;
      for (let k = -9; k <= 12; k++) {
        const j = ajoute(local(f.molad), k);
        if (calendrier(j, false, false, false).getYomTovIndex() === cible) {
          if (nuit(j) > f.debut) { f.debut = nuit(j); f.restriction = mois === JewishDate.TISHREI ? 'kippour' : 'tisha_beav'; }
          break;
        }
      }
    }
    // Le dernier soir (audit du 16/11, Levana.dernierSoir) : le jour de la fin si la nuit y commence
    // avant elle, sinon la veille (Choul'han Aroukh O.H. 426:3 ; Kitsour Yalkut Yosef 426:37).
    const jourFin = local(f.fin);
    return { ...f, premier: local(f.debut), dernier: nuit(jourFin) < f.fin ? jourFin : ajoute(jourFin, -1) };
  };
  let f = du(iso);
  if (iso > f.dernier) {
    const jour = calendrier(iso, false, false, false).getJewishDayOfMonth();
    f = du(ajoute(iso, 31 - jour + 2));
  }
  // Le motsaé Chabbat conseillé : un samedi de la fenêtre dont la nuit est avant le 10, et pas Yom Tov.
  let motsae = null;
  for (let d = f.premier; d <= f.dernier; d = ajoute(d, 1)) {
    if (new Date(`${d}T12:00:00Z`).getUTCDay() !== 6) continue;
    const nuit = calendrier(ajoute(d, 1), false, false, false);
    if (nuit.getJewishDayOfMonth() <= 10 && !nuit.isYomTovAssurBemelacha()) { motsae = d; break; }
  }
  const part = (ms) => Math.min(1, Math.max(0, (ms - f.molad) / MOIS_LUNAIRE));
  const jours = Math.round((Date.parse(`${f.premier}T12:00:00Z`) - Date.parse(`${iso}T12:00:00Z`)) / 86400000);
  // Un soir de Chabbat ou de Yom tov qui n'est pas le dernier : pas ce soir (audit du 16/11, Levana.etat).
  const chome = iso >= f.premier && iso !== f.dernier ? nuitChomee(iso, enIsrael) : null;
  const etat = iso < f.premier ? { dans: jours } : iso === f.dernier ? 'dernier' : chome ? { pas: chome } : 'ce_soir';
  // Le premier soir où l'on peut bénir lekhat'hila (Levana.premierPossible).
  let premierPossible = f.premier;
  while (premierPossible < f.dernier && nuitChomee(premierPossible, enIsrael)) premierPossible = ajoute(premierPossible, 1);
  const ceSoir = soir(iso);
  return {
    premier: f.premier, dernier: f.dernier, premierPossible, etat, debutMs: f.debut, finMs: f.fin, restriction: f.restriction, usage,
    jeune: typeof etat === 'string' || etat.pas ? sortieDeJeune(iso, enIsrael) && !f.restriction : false,
    motsae: motsae && motsae >= iso ? motsae : null,
    debut: part(f.debut), fin: part(f.fin), point: part(ceSoir),
    lune: { ...phaseLune(ceSoir), age: (ceSoir - f.molad) / 86400000 },
  };
}

/**
 * Les rappels de tefila (16/10, RappelsTefila.kt) : les changements des `avance` jours à venir,
 * aujourd'hui compris. leSoir : le changement commence au soir de la veille, à Arvit.
 * Sources : Choul'han Aroukh, O.H. 117, 1 (pluie), 114, 1 (machiv harouah), 582, 1 (dix jours), 489, 1 (omer).
 */
export const RAPPELS_TEFILA = {
  pluie_debut: { source: '117:1', leSoir: true }, pluie_fin: { source: '117:1', leSoir: false },
  guechem_debut: { source: '114:1', leSoir: false }, guechem_fin: { source: '114:1', leSoir: false },
  dix_jours: { source: '582:1', leSoir: true }, omer: { source: '489:1', leSoir: true },
};
/**
 * Le texte de la fin de מַשִּׁיב הָרוּחַ (RappelsTefila.cleGuechemFin ; audit du 16/11) : en Ashkenaz hors d'Israël,
 * l'officiant cesse à la répétition de Moussaf, l'assemblée à Min'ha (Rema 114:3 ; Michna Beroura 114:3).
 */
export function cleGuechemFin(nusah, enIsrael) {
  return nusah === 'ashkenaz' && !enIsrael ? 'rappel_guechem_fin_ashkenaz' : 'rappel_guechem_fin';
}
export function rappelsTefila(aujourdhui, enIsrael, avance = 3, jourDe = (iso) => jour(iso, enIsrael), sansGuechem = false) {
  const ajoute = (iso, n) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const res = [];
  let veille = jourDe(ajoute(aujourdhui, -1));
  for (let k = 0; k <= avance; k++) {
    const d = ajoute(aujourdhui, k);
    const j = jourDe(d);
    const pluie = 'tal_oumatar';
    // Premier jour un samedi : on commence à motsaé Chabbat, pas à l'Arvit du vendredi soir (FCALENDRIER-04, RappelsTefila.kt).
    if (j.conditions.has(pluie) && !veille.conditions.has(pluie)) {
      res.push({ type: 'pluie_debut', date: new Date(`${d}T12:00:00Z`).getUTCDay() === 6 ? ajoute(d, 1) : d });
    }
    if (!j.conditions.has(pluie) && veille.conditions.has(pluie)) res.push({ type: 'pluie_fin', date: d });
    // Les Edot de l'hémisphère sud disent מוריד הטל toute l'année (sansGuechem).
    if (!sansGuechem && j.moisHebreu === 7 && j.jourHebreu === 22) res.push({ type: 'guechem_debut', date: d });
    if (!sansGuechem && j.moisHebreu === 1 && j.jourHebreu === 15) res.push({ type: 'guechem_fin', date: d });
    if (j.moisHebreu === 7 && j.jourHebreu === 1) res.push({ type: 'dix_jours', date: d });
    if (j.omer === 1) res.push({ type: 'omer', date: d });
    veille = j;
  }
  // Un changement du soir dont le soir est déjà passé n'est plus annoncé (revue du 16/10).
  return res.filter((r) => !(RAPPELS_TEFILA[r.type].leSoir && r.date <= aujourdhui));
}

// --- Israël ou diaspora d'après la position (TerritoireIsrael.kt, 16/10) ---------------------
// Contour simplifié (précision de 2 à 3 km) : l'État d'Israël avec Jérusalem, la Judée-Samarie et le Golan.
const CONTOUR_ISRAEL = [[31.23, 34.21], [31.36, 34.24], [31.55, 34.40], [31.72, 34.50], [31.95, 34.66], [32.10, 34.72], [32.33, 34.80], [32.55, 34.86], [32.75, 34.92], [32.84, 34.93], [32.93, 35.03], [33.09, 35.08], [33.10, 35.20], [33.09, 35.33], [33.08, 35.45], [33.11, 35.52], [33.20, 35.55], [33.28, 35.57], [33.31, 35.63], [33.33, 35.79], [33.22, 35.82], [33.13, 35.815], [33.05, 35.86], [32.93, 35.87], [32.78, 35.80], [32.70, 35.72], [32.66, 35.62], [32.45, 35.57], [32.20, 35.56], [31.95, 35.55], [31.76, 35.56], [31.45, 35.50], [31.15, 35.45], [30.85, 35.36], [30.50, 35.22], [30.15, 35.14], [29.90, 35.09], [29.70, 35.03], [29.55, 34.98], [29.49, 34.90], [29.80, 34.76], [30.20, 34.60], [30.60, 34.50], [30.95, 34.37], [31.22, 34.26]];
/**
 * Ce que fait un nouveau lieu au statut Israël ou diaspora (TerritoireIsrael.decisionRegion, audit
 * du 16/11) : { region } à enregistrer, { proposition } à poser en question ; null, rien. Le statut
 * suit la résidence (Choul'han Aroukh 496:3, Michna Beroura 496:13, Kitsour YY 496) : un lieu ne
 * le réécrit jamais, sauf le tout premier lieu d'un statut jamais choisi.
 */
export function decisionRegion(impliquee, actuelle, premierLieu, declare) {
  if (premierLieu && !declare) return { region: impliquee, proposition: null };
  if (impliquee === actuelle) return { region: null, proposition: null };
  return { region: null, proposition: impliquee };
}

export function dansIsrael(latitude, longitude) {
  let dedans = false;
  for (let i = 0, j = CONTOUR_ISRAEL.length - 1; i < CONTOUR_ISRAEL.length; j = i++) {
    const [yi, xi] = CONTOUR_ISRAEL[i];
    const [yj, xj] = CONTOUR_ISRAEL[j];
    if ((yi > latitude) !== (yj > latitude) && longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi) dedans = !dedans;
  }
  return dedans;
}
