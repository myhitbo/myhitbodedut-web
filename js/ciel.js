// Le ciel du Jour (CielDuJour.kt, CielDessin.kt ; étape 3 de la refonte, 14/11) : l'aube, le
// plein jour, le coucher ou la nuit, d'après les zmanim du lieu, sinon d'après l'heure.
//
// L'aube va d'alot hacha'har à une heure après le lever ; le coucher, d'une heure avant la
// chkia à tsét hakokhavim ; la nuit, de tsét à alot. Un zman qui manque (nuit ou jour polaire)
// renvoie aux heures fixes. Les couleurs et les mesures sont celles d'Android, sur un carré de
// 188 (le test les compare à CielDuJour.kt).

export const PHASES = Object.freeze(['aube', 'jour', 'coucher', 'nuit']);

/** Ce que l'aube garde après le lever, et ce que le coucher prend avant la chkia. */
export const MARGE_MS = 60 * 60 * 1000;

/** Sans lieu : un matin et un soir moyens. */
export function parHeure(heures, minutes = 0) {
  const t = heures * 60 + minutes;
  if (t < 5 * 60) return 'nuit';
  if (t < 8 * 60) return 'aube';
  if (t < 17 * 60) return 'jour';
  if (t < 20 * 60) return 'coucher';
  return 'nuit';
}

/**
 * Avec les zmanim du jour (des Date, ou null) ; un zman qui manque renvoie à l'heure
 * [locale] ({ heures, minutes }), celle du lieu. Un jour trop court pour un plein jour passe
 * de l'aube au coucher.
 */
export function phase(maintenant, { alot, netz, chkia, tset } = {}, locale = { heures: maintenant.getHours(), minutes: maintenant.getMinutes() }) {
  if (!alot || !netz || !chkia || !tset) return parHeure(locale.heures, locale.minutes);
  const t = maintenant.getTime();
  if (t < alot.getTime()) return 'nuit';
  if (t < netz.getTime() + MARGE_MS) return 'aube';
  if (t < chkia.getTime() - MARGE_MS) return 'jour';
  if (t < tset.getTime()) return 'coucher';
  return 'nuit';
}

/** Le dégradé (haut, milieu, horizon), la colline, l'astre, sa lueur, et le voile du haut de l'écran. */
export const PALETTES = Object.freeze({
  aube: { haut: '#7B88C9', milieu: '#E3A3BE', horizon: '#FFD6AE', colline: '#7E9F86', astre: '#FFE7B8', lueur: '#FFE0A8', voile: '#E8A0B4' },
  jour: { haut: '#5FB1EA', milieu: '#A8DAF6', horizon: '#E6F6FC', colline: '#7CC293', astre: '#FFE97A', lueur: '#FFF6C8', voile: '#6FB8EA' },
  coucher: { haut: '#8A64B0', milieu: '#E58397', horizon: '#FDBA6E', colline: '#6C5A80', astre: '#FFC46A', lueur: '#FFAA5A', voile: '#F08A5D' },
  nuit: { haut: '#101B3D', milieu: '#1F2F63', horizon: '#33477F', colline: '#1D2A4C', astre: '#F6F0D6', lueur: '#F6F0D6', voile: '#2C3E7A' },
});

/** L'astre du jour : centre, rayon, et rayon de sa lueur (CielDessin.ASTRES). La nuit a sa lune. */
export const ASTRES = Object.freeze({ aube: [53, 150, 21, 85], jour: [139, 41, 14, 56], coucher: [132, 150, 26, 103] });
/** Les nuages du plein jour : centre et rayons. */
export const NUAGES = Object.freeze([[45, 56, 19, 7.5], [60, 50, 12, 7], [154, 92, 15, 6]]);
/** Les étoiles de la nuit : centre et rayon. */
export const ETOILES = Object.freeze([
  [22, 40, 1.2], [40, 22, 1], [58, 52, 1.6], [80, 14, 1], [98, 34, 1.2], [118, 18, 1.4], [160, 64, 1.1], [170, 30, 1],
  [30, 78, 1], [150, 96, 1.3], [176, 104, 1], [12, 104, 1.2], [70, 30, 0.9], [128, 60, 0.9], [48, 110, 1],
]);
/** La colline : le champ où l'on sort. */
export const COLLINE = 'M0 162Q94 124 188 162L188 188L0 188Z';
