// La sauvegarde chiffrée par mot de passe (audit de sécurité du 12/11/2026), au même format
// qu'Android (Coffre.kt) : la clé vient du mot de passe par PBKDF2-HMAC-SHA256, le fichier
// est chiffré en AES-256-GCM. Sans le mot de passe, il est illisible, et rien ne le retrouve.
//
//   { format: 'myhitbodedut-chiffre', version: 1, kdf: 'PBKDF2-HMAC-SHA256',
//     iterations, salt, iv, data }      salt, iv, data (chiffré + sceau GCM) en base64

export const FORMAT_CHIFFRE = 'myhitbodedut-chiffre';
export const ITERATIONS = 600_000;
/** Un fichier fabriqué ne fait pas tourner le téléphone sans fin, ni ne ramène la clé à presque rien. */
const ITERATIONS_MIN = 100_000;
const ITERATIONS_MAX = 5_000_000;

function versBase64(octets) {
  let s = '';
  for (let i = 0; i < octets.length; i += 0x8000) s += String.fromCharCode(...octets.subarray(i, i + 0x8000));
  return btoa(s);
}

function depuisBase64(texte) {
  const s = atob(texte);
  const octets = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) octets[i] = s.charCodeAt(i);
  return octets;
}

async function cle(motDePasse, sel, iterations) {
  const matiere = await crypto.subtle.importKey('raw', new TextEncoder().encode(motDePasse.normalize('NFC')), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: sel, iterations }, matiere, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

/** Le fichier lu est-il une sauvegarde chiffrée ? */
export function estChiffre(texte) {
  try { return JSON.parse(texte)?.format === FORMAT_CHIFFRE; } catch { return false; }
}

/** Chiffre [texte] ; [iterations] ne se règle que dans les tests. */
export async function chiffrer(texte, motDePasse, iterations = ITERATIONS) {
  const sel = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const chiffre = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await cle(motDePasse, sel, iterations), new TextEncoder().encode(texte));
  return JSON.stringify({
    format: FORMAT_CHIFFRE, version: 1, kdf: 'PBKDF2-HMAC-SHA256', iterations,
    salt: versBase64(sel), iv: versBase64(iv), data: versBase64(new Uint8Array(chiffre)),
  }, null, 2);
}

/** Le texte en clair, ou null : mot de passe faux, fichier abîmé ou fabriqué. */
export async function dechiffrer(texte, motDePasse) {
  try {
    const r = JSON.parse(texte);
    if (r?.format !== FORMAT_CHIFFRE || r.version !== 1 || r.kdf !== 'PBKDF2-HMAC-SHA256') return null;
    if (!Number.isInteger(r.iterations) || r.iterations < ITERATIONS_MIN || r.iterations > ITERATIONS_MAX) return null;
    const sel = depuisBase64(r.salt), iv = depuisBase64(r.iv);
    if (sel.length < 16 || iv.length !== 12) return null;
    const clair = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, await cle(motDePasse, sel, r.iterations), depuisBase64(r.data));
    return new TextDecoder('utf-8', { fatal: true }).decode(clair);
  } catch { return null; }
}
