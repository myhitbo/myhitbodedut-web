// Le défilement automatique des textes (16/11) : la même règle sur Android, Nokia, iOS et le site.
// Dix niveaux de vitesse, le 3 par défaut ; chaque niveau va 1,4 fois plus vite que le précédent.

export const NIVEAU_MIN = 1;
export const NIVEAU_MAX = 10;
export const NIVEAU_DEFAUT = 3;

/** Le niveau ramené entre 1 et 10, entier ; une valeur illisible donne le niveau par défaut. */
export function borneNiveau(n) {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return NIVEAU_DEFAUT;
  return Math.min(NIVEAU_MAX, Math.max(NIVEAU_MIN, v));
}

/**
 * La vitesse, en pixels CSS par seconde : 6 × 1,4^(n−1), multipliée par la taille du texte
 * pour que le nombre de lignes lues par minute ne dépende pas de la taille des lettres.
 */
export function vitesse(niveau, echelle = 1) {
  const e = Number(echelle) > 0 ? Number(echelle) : 1;
  return 6 * 1.4 ** (borneNiveau(niveau) - 1) * e;
}

/**
 * Un pas de l'animation : le reste fractionnaire du pas précédent plus le chemin du temps écoulé.
 * Rend les pixels entiers à faire défiler et le nouveau reste (jamais perdu d'une image à l'autre).
 * Un écart trop long (onglet en arrière-plan, téléphone en veille) est ramené à 100 ms : pas de saut.
 */
export function pas(reste, ms, pxParSeconde) {
  const duree = Math.min(100, Math.max(0, Number(ms) || 0));
  const total = reste + (duree / 1000) * pxParSeconde;
  const pixels = Math.floor(total);
  return { pixels, reste: total - pixels };
}
