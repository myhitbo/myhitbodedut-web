// Les zmanim du jour (Zmanim.kt, 10/10), sans réseau, par kosher-zmanim 0.9.0.
// Le profil est celui d'Android, ligne pour ligne : chaque zman nomme sa
// méthode (ZMANIM.md). web/test compare chaque valeur à KosherJava, à une
// seconde près, et les méthodes équivalentes à Hebcal (sans l'embarquer).

import { ComplexZmanimCalendar, DateTime, GeoLocation, NOAACalculator } from '../vendor/kosher-zmanim-0.9.0.min.js';

export const MOTEUR = 'kosher-zmanim 0.9.0, NOAACalculator';

/** [clé, méthode, paramètres, calcul] : le même ordre et les mêmes méthodes que Zmanim.PROFIL. */
const PROFIL = [
  ['alot', 'degres', '16.1', (c) => c.getAlos16Point1Degrees()],
  ['misheyakir', 'degres', '11.5', (c) => c.getMisheyakir11Point5Degrees()],
  ['netz', 'niveau_mer', '', (c) => c.getSeaLevelSunrise()],
  ['szks_mga', 'mga_72', '72', (c) => c.getSofZmanShmaMGA()],
  ['szks_gra', 'gra', '', (c) => c.getSofZmanShmaGRA()],
  ['szt_mga', 'mga_72', '72', (c) => c.getSofZmanTfilaMGA()],
  ['szt_gra', 'gra', '', (c) => c.getSofZmanTfilaGRA()],
  ['chatsot', 'meridien', '', (c) => c.getSunTransit()],
  ['minha_gedola', 'gra', '', (c) => c.getMinchaGedola()],
  ['minha_ketana', 'gra', '', (c) => c.getMinchaKetana()],
  ['plag', 'gra', '', (c) => c.getPlagHamincha()],
  ['chkia', 'niveau_mer', '', (c) => c.getSeaLevelSunset()],
  ['tset', 'degres', '8.5', (c) => c.getTzaisGeonim8Point5Degrees()],
  ['tset_rt', 'minutes', '72', (c) => c.getTzais72()],
  ['chatsot_layla', 'milieu_chatsot', '', null],
];
export const CLES = PROFIL.map(([cle]) => cle);

// L'heure zmanit du Gra (du lever au coucher au niveau de la mer), en millisecondes ; null sans lever ni coucher.
const heureGra = (c) => {
  const lever = c.getSeaLevelSunrise();
  const coucher = c.getSeaLevelSunset();
  return lever && coucher ? (coucher.toMillis() - lever.toMillis()) / 12 : null;
};
const decale = (c, d, heures) => {
  const h = heureGra(c);
  return d && h !== null ? new Date(d.toMillis() + Math.round(heures * h)) : null;
};

/**
 * Le profil des Edot (Zmanim.PROFIL_EDOT, audit du 16/11) : les zmanim du Yalkut Yosef à la place
 * de ceux du profil commun ; Sfard et Ashkenaz gardent le profil commun. Aube à 72 min zmaniyot
 * (Kitsour YY 89:12), michéyakir 6 min zmaniyot après, Maguen Avraham en 72 min zmaniyot
 * (58:3), tsét à 13,5 min zmaniyot (233:5), plag 1¼ heure zmanit avant ce tsét (263:45),
 * Rabbénou Tam à 72 min zmaniyot (293:3, 293:7).
 */
const PROFIL_EDOT = {
  alot: ['zmaniyot_avant_netz', '72', (c) => c.getAlos72Zmanis()],
  misheyakir: ['zmaniyot_avant_netz', '66', (c) => decale(c, c.getSeaLevelSunrise(), -1.1)],
  szks_mga: ['mga_72_zmaniyot', '72', (c) => c.getSofZmanShmaMGA72MinutesZmanis()],
  szt_mga: ['mga_72_zmaniyot', '72', (c) => c.getSofZmanTfilaMGA72MinutesZmanis()],
  plag: ['plag_yalkut_yosef', '', (c) => decale(c, c.getSeaLevelSunset(), -1.025)],
  tset: ['zmaniyot_apres_chkia', '13.5', (c) => decale(c, c.getSeaLevelSunset(), 0.225)],
  tset_rt: ['zmaniyot_apres_chkia', '72', (c) => c.getTzais72Zmanis()],
};
export const CLES_EDOT = Object.keys(PROFIL_EDOT);

/** Le profil d'un noussa'h (Zmanim.profil) : [clé, méthode, paramètres, calcul]. */
const profil = (nusah) => (nusah === 'edot' ? PROFIL.map(([cle, ...reste]) => (PROFIL_EDOT[cle] ? [cle, ...PROFIL_EDOT[cle]] : [cle, ...reste])) : PROFIL);
export const ALLUMAGES = [18, 20, 22, 30, 40];
export const ALLUMAGE_DEFAUT = 18;

/**
 * Le décalage au temps moyen local, comme KosherJava (audit du 12/11, FCALENDRIER-02) :
 * kosher-zmanim 0.9.0 prend le décalage d'été pour le décalage standard dans les fuseaux à
 * heure d'été de l'hémisphère sud (Sydney : 20,08 h au lieu de 0,08 h) et avance alors la
 * date d'un jour (ajustement d'antiméridien). Le décalage standard est le plus petit de
 * janvier et de juillet, au nord comme au sud.
 */
function geoLocation(lieu, year) {
  const geo = new GeoLocation(lieu.nom, lieu.latitude, lieu.longitude, lieu.altitude ?? 0, lieu.fuseau);
  const decalage = (month) => DateTime.fromObject({ year, month, day: 1, zone: lieu.fuseau }).offset;
  const standard = Math.min(decalage(1), decalage(7)) * 60e3;
  geo.getLocalMeanTimeOffset = () => lieu.longitude * 4 * 60e3 - standard;
  return geo;
}

function calendrier(lieu, iso) {
  const [year, month, day] = iso.split('-').map(Number);
  const c = new ComplexZmanimCalendar(geoLocation(lieu, year));
  c.setDate(DateTime.fromObject({ year, month, day, hour: 12 }, { zone: lieu.fuseau }));
  // Explicite : le profil calcule au niveau de la mer.
  c.setUseElevation(false);
  // L'algorithme de la NOAA, écrit plutôt que laissé au défaut (Zmanim.kt).
  c.setAstronomicalCalculator(new NOAACalculator());
  return c;
}

/** Le nom du calculateur réellement utilisé, pour les tests. */
export const calculateur = (lieu, iso) => calendrier(lieu, iso).getAstronomicalCalculator().getCalculatorName();

const lendemain = (iso) => {
  const [a, m, j] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, j + 1, 12)).toISOString().slice(0, 10);
};

/**
 * Le format commun : { cle, methode, parametres, statut, instant (Date|null),
 * moteur }. « absent » : l'événement n'a pas lieu ce jour-là (aube à 16,1° dès environ
 * 50,5° N au solstice d'été, audit du 16/11 ; lever et coucher au-delà du
 * cercle polaire) ; « erreur » : le calcul a échoué. Les deux ne se
 * confondent pas.
 */
function zman(cle, methode, parametres, calcul) {
  try {
    const d = calcul();
    if (d === null || d === undefined) return { cle, methode, parametres, statut: 'absent', instant: null, moteur: MOTEUR };
    const instant = new Date(d.toMillis ? d.toMillis() : +d);
    if (Number.isNaN(+instant)) throw new Error('date invalide');
    return { cle, methode, parametres, statut: 'ok', instant, moteur: MOTEUR };
  } catch {
    return { cle, methode, parametres, statut: 'erreur', instant: null, moteur: MOTEUR };
  }
}

/** Les quinze zmanim du profil de nusah (commun par défaut, « edot » : Yalkut Yosef) pour « AAAA-MM-JJ » au lieu donné. */
export function jour(lieu, iso, nusah = '') {
  const c = calendrier(lieu, iso);
  const chatsot = zman('chatsot', 'meridien', '', () => c.getSunTransit());
  const demain = zman('chatsot', 'meridien', '', () => calendrier(lieu, lendemain(iso)).getSunTransit());
  return profil(nusah).map(([cle, methode, parametres, calcul]) => {
    if (cle !== 'chatsot_layla') return zman(cle, methode, parametres, () => calcul(c));
    // getSolarMidnight de KosherJava 2.5.0 : le milieu entre chatsot
    // d'aujourd'hui et de demain. kosher-zmanim 0.9.0 en a une autre
    // définition (le soleil au plus bas) : on suit KosherJava, comme Android,
    // en vérifiant d'abord que les deux chatsot existent.
    if (chatsot.statut !== 'ok' || demain.statut !== 'ok') return zman(cle, methode, parametres, () => null);
    return zman(cle, methode, parametres, () => new Date((+chatsot.instant + +demain.instant) / 2));
  });
}

/** L'allumage : coucher au niveau de la mer moins [minutes] (getCandleLighting). */
export function allumage(lieu, iso, minutes) {
  const c = calendrier(lieu, iso);
  c.setCandleLightingOffset(minutes);
  return zman('allumage', 'avant_chkia', String(minutes), () => c.getCandleLighting());
}

/**
 * Les heures du 'hamets la veille de Pessa'h (Zmanim.hamets, audit du 16/11) : fin de la consommation
 * (4e heure) et du bi'our (5e heure), Maguen Avraham puis Gra. Edot : heures zmaniyot de l'aube à
 * tsét à 72 min zmaniyot (Kitsour YY 443:1) ; les autres : la journée de 72 min fixes.
 */
export function hamets(lieu, iso, nusah = '') {
  const c = calendrier(lieu, iso);
  const edot = nusah === 'edot';
  const heures = (debut, heure, n) => (debut && heure !== null && heure > 0 ? new Date(debut.toMillis() + n * Math.trunc(heure)) : null);
  const mga = (n) => (edot ? heures(c.getAlos72Zmanis(), c.getShaahZmanis72MinutesZmanis(), n) : heures(c.getAlos72(), c.getShaahZmanisMGA(), n));
  const [m, p] = edot ? ['mga_72_zmaniyot', '72'] : ['mga_72', '72'];
  return [
    zman('hamets_achila', m, p, () => mga(4)),
    zman('hamets_achila', 'gra', '', () => heures(c.getSeaLevelSunrise(), heureGra(c), 4)),
    zman('hamets_biour', m, p, () => mga(5)),
    zman('hamets_biour', 'gra', '', () => heures(c.getSeaLevelSunrise(), heureGra(c), 5)),
  ];
}

/** « 06:38 » dans le fuseau du lieu. */
export function heure(instant, fuseau) {
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: fuseau }).format(instant);
}
