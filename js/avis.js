// Les avis de l'accueil sur la garde des données (13/11, audit du 12/11, FWEBCODE-01).
//
// Tout ce que l'utilisateur écrit vit dans le stockage du navigateur. Hors de l'écran
// d'accueil, Safari efface ce stockage après sept jours sans visite du site ; installée sur
// l'iPhone, l'application a un stockage à part de celui de Safari ; et partout, le fichier
// exporté est la seule sauvegarde. D'où trois avis, un seul à la fois, chacun refermable.
// Les règles sont ici, sans navigateur, pour se tester (web/test/avis.test.mjs).

/** Un avis refermé revient après ce nombre de jours ; une sauvegarde plus vieille se rappelle. */
export const REPORT_JOURS = 30;

/** Les jours entiers de [de] à [a], deux dates ISO (AAAA-MM-JJ) ; NaN si l'une n'en est pas une. */
export const joursEntre = (de, a) => Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / 86400000);

/**
 * L'avis à montrer sur l'accueil, ou null :
 *  - 'installer' : iPhone ou iPad, hors de l'écran d'accueil ;
 *  - 'importer'  : installée sur iPhone ou iPad avec un journal vide (celui de Safari n'a pas
 *    suivi) ; refermé, il ne revient pas ;
 *  - 'exporter'  : des journées inscrites, et pas de sauvegarde depuis plus de trente jours
 *    (ou, sans aucune sauvegarde, depuis le premier jour du journal).
 *
 * [premierJour] : la plus ancienne date du journal, null s'il est vide ; [derniereSauvegarde] :
 * le jour du dernier export ou import, null sinon ; [reports] : { avis: jour où il a été refermé }.
 */
export function avisAccueil({ ios, installee, aujourdhui, premierJour = null, derniereSauvegarde = null, reports = {} }) {
  // Un report daté de l'avenir (horloge reculée) ne tient pas : l'avis revient.
  const reporte = (cle) => { const n = joursEntre(reports[cle], aujourdhui); return n >= 0 && n < REPORT_JOURS; };
  if (ios && !installee && !reporte('installer')) return 'installer';
  if (ios && installee && !premierJour && !reports.importer) return 'importer';
  if (premierJour && !reporte('exporter')) {
    const depuis = joursEntre(derniereSauvegarde ?? premierJour, aujourdhui);
    if (depuis > REPORT_JOURS) return 'exporter';
  }
  return null;
}
