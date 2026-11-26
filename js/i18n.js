// Les chaînes de l'interface, lues depuis les strings.xml d'Android
// (construites en data/strings.<langue>.json par build.mjs).

import { RegleLangue } from './regles.js';

export const LANGUES = [
  // L'ordre de Langues.kt : עברית, English, Français, puis l'espagnol d'Amérique latine (values-es)
  // et l'arabe tunisien (values-ar-rTN, 17/11). Chaque nom est écrit dans sa langue.
  // code : le fichier de chaînes (data/strings.<code>.json) et le réglage gardé ;
  // locale : l'attribut lang de la page et les formats d'Intl (dates, nombres, pluriels).
  { code: 'he', nom: 'עברית', locale: 'he', rtl: true },
  { code: 'en', nom: 'English', locale: 'en', rtl: false },
  { code: 'fr', nom: 'Français', locale: 'fr', rtl: false },
  { code: 'es', nom: 'Español', locale: 'es-419', rtl: false },
  { code: 'ar', nom: 'تونسي', locale: 'ar-TN', rtl: true },
];

/**
 * Une langue du téléphone que le site livre, ou null (LangueApp.livree). L'espagnol de tout pays ;
 * l'arabe seulement de Tunisie : l'interface est en derja, qu'un arabophone d'ailleurs ne lirait pas
 * en premier (il garde l'anglais, le repli d'avant).
 */
export function langueLivree(etiquette) {
  const n = RegleLangue.normalise(etiquette);
  if (n === 'ar') {
    const regions = String(etiquette ?? '').replace(/_/g, '-').split('-').slice(1);
    return regions.some((r) => r.toUpperCase() === 'TN') ? 'ar' : null;
  }
  return LANGUES.some((l) => l.code === n) ? n : null;
}

/**
 * La langue à montrer : celle choisie dans les réglages, sinon celle du
 * téléphone si l'application la connaît, sinon l'anglais (audit 1.390, 29/10 ;
 * comme LangueApp.repli sur Android).
 */
export function langueInitiale(choisie, languesDuTelephone) {
  const connues = LANGUES.map((l) => l.code);
  // Un choix des réglages est pris tel quel (« ar-TN », l'étiquette d'Android, compte pour « ar »).
  const c = RegleLangue.normalise(choisie);
  if (connues.includes(c)) return c;
  for (const l of languesDuTelephone ?? []) {
    const n = langueLivree(l);
    if (n) return n;
  }
  // Aucune langue du téléphone n'est livrée : l'anglais (audit 1.390, LangueApp.repli).
  return 'en';
}

/** Le String.format d'Android, réduit à ce que les chaînes emploient : %s %d %1$s %2$02d %%. */
export function formate(modele, args) {
  let suivant = 0;
  return modele.replace(/%(?:(\d+)\$)?(0?\d+)?([sd%])/g, (m, pos, largeur, type) => {
    if (type === '%') return '%';
    const valeur = args[pos ? Number(pos) - 1 : suivant++];
    let texte = String(valeur);
    if (type === 'd' && largeur) texte = texte.padStart(Number(largeur), largeur.startsWith('0') ? '0' : ' ');
    return texte;
  });
}

/** La fiche d'une langue livrée ; une autre étiquette garde son nom, de gauche à droite. */
export const ficheLangue = (langue) => LANGUES.find((l) => l.code === langue) ?? { code: langue, locale: langue, rtl: false };

export function creeTraduction(langue, table) {
  const { locale, rtl } = ficheLangue(langue);
  const regles = new Intl.PluralRules(locale);
  const t = (nom, ...args) => {
    const modele = table.chaines[nom];
    if (modele === undefined) throw new Error(`Chaîne inconnue : ${nom}`);
    return args.length ? formate(modele, args) : modele;
  };
  /** getQuantityString : la forme de la quantité, sinon « other », comme Android. */
  const p = (nom, n, ...args) => {
    const formes = table.pluriels[nom];
    if (!formes) throw new Error(`Pluriel inconnu : ${nom}`);
    const modele = formes[regles.select(n)] ?? formes.other;
    return formate(modele, args.length ? args : [n]);
  };
  /** getStringArray (28/10). */
  const tab = (nom) => {
    const l = table.tableaux?.[nom];
    if (!l) throw new Error(`Tableau inconnu : ${nom}`);
    return l;
  };
  /** Store.formatDuration : « 20 min », « 1 h », « 1 h 30 ». */
  const duree = (minutes) => {
    if (minutes < 60) return t('duration_minutes', minutes);
    if (minutes % 60 === 0) return t('duration_hours', minutes / 60);
    return t('duration_hours_minutes', Math.floor(minutes / 60), minutes % 60);
  };
  return { langue, locale, rtl, t, p, tab, duree };
}

export async function chargeTraduction(langue) {
  const reponse = await fetch(`data/strings.${langue}.json`);
  return creeTraduction(langue, await reponse.json());
}
