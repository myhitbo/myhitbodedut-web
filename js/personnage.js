// Le personnage au féminin (audit 1.390, point 8) : qui a choisi צדקת voit, à
// la place de chaque pose du hassid, la plus proche de la planche féminine du
// 29/10 et de sa seconde planche. Sans choix, ou צדיק, rien ne change. Même table que Personnage.kt
// (un test Android vérifie qu'elles restent pareilles).
//
// Sans tefillin, matsa ni costume de Pourim, ces poses prennent la plus proche :
// la prière, la lecture (la Haggada), le livre contre soi (la Meguila) ;
// l'ouverture, debout, la prière de dos bras levés.
//
// Les cinq scènes à décor (le lit, le paysage, l'aéroport, 'Hanouka, Soukkot) montrent le
// hassid barbu et n'ont pas encore leur planche féminine : elles se replient sur la pose la
// plus proche (13/11, FACCUEIL-03).

export const FEMININ = {
  char_welcome: 'char_f_welcome',
  char_open_arms: 'char_f_arms_up',
  char_debout: 'char_f_back_arms',
  char_thumbs_up: 'char_f_thumbs_up',
  char_tehilim: 'char_f_tehilim',
  char_praise: 'char_f_praise',
  char_dancing_joy: 'char_f_joy',
  char_writing: 'char_f_writing',
  char_thinking: 'char_f_thinking',
  char_pointing: 'char_f_pointing',
  char_walking: 'char_f_walking',
  char_praying: 'char_f_praying',
  char_tefillin: 'char_f_praying',
  char_dancing: 'char_f_dancing',
  char_guitar: 'char_f_guitar',
  char_purim: 'char_f_book_side',
  char_shabbat: 'char_f_tehilim_hug',
  char_matsa: 'char_f_reading',
  char_offering: 'char_f_offering',
  char_torah: 'char_f_kneel_reading',
  char_standing_back: 'char_f_standing_back',
  scene_sleeping: 'char_f_praying',
  scene_nature: 'char_f_standing_back',
  scene_airport: 'char_f_walking',
  scene_hanukkah: 'char_f_praise',
  scene_sukkot: 'char_f_joy',
};

/**
 * « img/char_guitar.webp » devient « img/char_f_guitar.webp » pour l'adresse 'f', et une scène
 * du hassid, la pose de repli ; tout le reste passe tel quel.
 */
export function chemin(src, adresse) {
  if (adresse !== 'f' || typeof src !== 'string') return src;
  return src.replace(/\b(?:char|scene)_[a-z_]+(?=\.webp\b)/g, (nom) => FEMININ[nom] ?? nom);
}
