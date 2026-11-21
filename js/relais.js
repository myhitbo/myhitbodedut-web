// L'adresse du relais du suivi de vol en direct (tools/relais_vol). Vide ici :
// le suivi en direct reste inactif (la route d'un vol, elle, interroge adsbdb après accord). build.mjs la
// remplace par celle de RELAIS_VOL=https://… et l'ajoute à la CSP (connect-src).
export const RELAIS_VOL = '';
