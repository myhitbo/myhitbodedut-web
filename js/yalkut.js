// La halakha du jour (YalkutYosef.kt, 13/10) : une sélection de halakhot courtes
// du ילקוט יוסף – קיצור שולחן ערוך (data/yalkut_yosef.json ; droits et source
// dans tools/yalkut_yosef_construction.py). Mêmes choix que l'application
// Android : deux se'ifim par jour ; Roch 'Hodech ; avant et pendant chaque fête
// les siennes ; les vendredis ordinaires le Chabbat ; sinon la vie de chaque jour.
import { calendrier } from './calendrier-juif.js';
import { JewishCalendar } from '../vendor/kosher-zmanim-0.9.0.min.js';

export const PAR_JOUR = 2;
// Les mois de KosherJava et de kosher-zmanim.
const NISSAN = 1, IYAR = 2, SIVAN = 3, TAMMUZ = 4, AV = 5, ELUL = 6, TISHREI = 7, KISLEV = 9, TEVES = 10, SHEVAT = 11, ADAR = 12, ADAR_II = 13;

export function fenetre(mois, jour, embolismique) {
  const adar = embolismique ? ADAR_II : ADAR;
  if (mois === adar && jour <= 15) return 'pourim';
  if (mois === adar || (mois === NISSAN && jour <= 22)) return 'pessah';
  if (mois === NISSAN || mois === IYAR) return 'omer';
  if (mois === SIVAN && jour <= 7) return 'chavouot';
  if ((mois === TAMMUZ && jour >= 17) || (mois === AV && jour <= 9)) return 'bein_hametsarim';
  if (mois === ELUL || (mois === TISHREI && jour <= 2)) return 'eloul';
  if (mois === TISHREI && jour <= 10) return 'kippour';
  if (mois === TISHREI && jour <= 23) return 'soukkot';
  if ((mois === KISLEV && jour >= 15) || (mois === TEVES && jour <= 3)) return 'hanouka';
  if (mois === SHEVAT && jour <= 15) return 'tou_bichvat';
  return null;
}

const decale = (iso, n) => { const [a, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(a, m - 1, d + n, 12)).toISOString().slice(0, 10); };
const epoque = (iso) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86400000);
// Le jeûne repoussé au dimanche 10 Av : un jour de 9 Av, pas un jour ordinaire (audit du 16/11 :
// Kitsour Yalkut Yosef 554:13 et 551:10 ; YalkutYosef.fenetreDu).
const fenetreDu = (iso, il) => {
  const c = calendrier(iso, il, false, false);
  if (c.getYomTovIndex() === JewishCalendar.TISHA_BEAV) return 'bein_hametsarim';
  return fenetre(c.getJewishMonth(), c.getJewishDayOfMonth(), c.isJewishLeapYear());
};

/** [période, rang du jour dans la période] */
export function periode(iso, il) {
  const c = calendrier(iso, il, false, false);
  // Le 30 ouvre le Roch 'Hodech du mois suivant, le 1er le poursuit : deux rangs qui se suivent.
  if (c.isRoshChodesh()) return ['roch_hodech', c.getJewishDayOfMonth() === 30 ? (c.getJewishMonth() + 1) * 2 : c.getJewishMonth() * 2 + 1];
  const f = fenetreDu(iso, il);
  if (f) {
    let n = 0;
    while (n < 60 && fenetreDu(decale(iso, -(n + 1)), il) === f) n++;
    return [f, n];
  }
  const e = epoque(iso);
  return new Date(`${iso}T12:00:00Z`).getUTCDay() === 5 ? ['chabbat', Math.floor(e / 7)] : ['ordinaire', e];
}

/**
 * YalkutYosef.longueur : la durée, en jours, de la fenêtre de fête où tombe le jour (Roch 'Hodech compris),
 * ou 0 hors fenêtre et le jour du Roch 'Hodech, qui a son propre rang.
 */
export function longueur(iso, il) {
  if (calendrier(iso, il, false, false).isRoshChodesh()) return 0;
  const f = fenetreDu(iso, il);
  if (!f) return 0;
  let avant = 0;
  while (avant < 60 && fenetreDu(decale(iso, -(avant + 1)), il) === f) avant++;
  let apres = 0;
  while (apres < 60 && fenetreDu(decale(iso, apres + 1), il) === f) apres++;
  return avant + 1 + apres;
}

/**
 * Les se'ifim d'un rang (YalkutYosef.du). Dans une fenêtre de [longueur] jours, le rang est réparti sur
 * toute la liste : les lois de la veille au début, celles de la fête à la fin.
 */
export function du(seifs, rang, longueur = 0) {
  if (!seifs?.length) return [];
  const n = seifs.length;
  const debut = longueur > 0
    ? ((Math.floor(n >= longueur ? (rang * n) / longueur : rang) % n) + n) % n
    : (((rang * PAR_JOUR) % n) + n) % n;
  return Array.from({ length: Math.min(PAR_JOUR, seifs.length) }, (_, i) => seifs[(debut + i) % seifs.length]);
}

export function pour(livre, iso, il) {
  const [p, rang] = periode(iso, il);
  return du(livre.periodes[p] ?? [], rang, longueur(iso, il));
}

// Le livre mis à plat une seule fois (check-up du 11/11) : chaque frappe le renormalisait en entier.
const aPlat = new WeakMap();
export function recherche(livre, texte) {
  const nu = (t) => t.replace(/[־׀]/g, ' ').replace(/[֑-ׇ"'״׳]/g, '');
  const q = nu(texte.trim());
  if (q.length < 2) return [];
  let seifs = aPlat.get(livre);
  if (!seifs) {
    const vus = new Set();
    seifs = Object.values(livre.periodes).flat().filter((x) => {
      const cle = `${x.p}|${x.l}`;
      if (vus.has(cle)) return false;
      vus.add(cle);
      return true;
    }).map((x) => ({ x, t: nu(x.t), s: nu(x.s) }));
    aPlat.set(livre, seifs);
  }
  return seifs.filter((e) => e.t.includes(q) || e.s.includes(q)).map((e) => e.x);
}

/** « ילקוט יוסף · סימן א - הלכות השכמת הבוקר · סעיף ב » */
export const source = (x) => ['ילקוט יוסף', x.s, x.l ? `סעיף ${x.l}` : null].filter(Boolean).join(' · ');

/** Les halakhot du jour en une seule carte (YalkutYosef.titreCarte) : le siman une fois s'il est commun. */
export const titreCarte = (seifs) => (new Set(seifs.map((x) => x.s)).size === 1 ? `ילקוט יוסף · ${seifs[0].s}` : 'ילקוט יוסף');

/** Chaque se'if sous sa lettre, et son siman s'ils diffèrent (YalkutYosef.texteCarte). */
export function texteCarte(seifs) {
  const commun = new Set(seifs.map((x) => x.s)).size === 1;
  return seifs.map((x) => { const l = x.l ? `${x.l}. ` : ''; return commun ? `${l}${x.t}` : `${x.s}\n${l}${x.t}`; }).join('\n\n');
}
