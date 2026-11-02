export function hashPasswordSync(plainPassword, salt = 'academia_auth_v1') {
  const input = `${salt}:${String(plainPassword || '')}`;
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let round = 0; round < 1024; round++) {
    for (let i = 0; i < input.length; i++) {
      const ch = input.charCodeAt(i) ^ (round & 0xff);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  }
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const hex3 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
  const hex4 = (Math.imul(h1, h2) >>> 0).toString(16).padStart(8, '0');
  return `sha256$${salt}$${hex1}${hex2}${hex3}${hex4}`;
}

export function verifyPasswordSync(plainPassword, storedHash) {
  if (!storedHash || typeof storedHash !== 'string') return false;
  if (!storedHash.startsWith('sha256$')) {
    return false;
  }
  const parts = storedHash.split('$');
  const salt = parts[1] || 'academia_auth_v1';
  return hashPasswordSync(plainPassword, salt) === storedHash;
}

export function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function createInitialsAvatar(name = 'Usuário', bgColor = '#0D9488', fgColor = '#FFFFFF') {
  const parts = String(name || 'U').trim().split(/\s+/);
  const initials = (parts[0]?.[0] || 'U') + (parts.length > 1 ? parts[parts.length - 1][0] : '');
  const cleanInitials = initials.toUpperCase().slice(0, 2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="64" fill="${bgColor}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="${fgColor}" font-family="Arial, sans-serif" font-size="48" font-weight="700">${cleanInitials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function emvField(id, value) {
  const str = String(value || '');
  const len = String(str.length).padStart(2, '0');
  return `${id}${len}${str}`;
}

function crc16Ccitt(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generatePixBrCode({
  pixKey,
  merchantName = 'ACADEMIA',
  merchantCity = 'SAO PAULO',
  amount = 0,
  txid = 'FATURA01'
}) {
  const cleanKey = String(pixKey || '').trim();
  if (!cleanKey) return '';

  const cleanName = String(merchantName || 'ACADEMIA')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .toUpperCase()
    .slice(0, 25)
    .trim() || 'ACADEMIA';

  const cleanCity = String(merchantCity || 'SAO PAULO')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .toUpperCase()
    .slice(0, 15)
    .trim() || 'SAO PAULO';

  const cleanTxId = String(txid || 'FATURA')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 25) || '***';

  const gui = emvField('00', 'br.gov.bcb.pix');
  const keyField = emvField('01', cleanKey);
  const merchantAccountInfo = emvField('26', `${gui}${keyField}`);

  const amountStr = Number(amount) > 0 ? Number(amount).toFixed(2) : '';
  const amountField = amountStr ? emvField('54', amountStr) : '';
  const additionalData = emvField('62', emvField('05', cleanTxId));

  const payloadWithoutCrc =
    emvField('00', '01') +
    merchantAccountInfo +
    emvField('52', '0000') +
    emvField('53', '986') +
    amountField +
    emvField('58', 'BR') +
    emvField('59', cleanName) +
    emvField('60', cleanCity) +
    additionalData +
    '6304';

  const crc = crc16Ccitt(payloadWithoutCrc);
  return `${payloadWithoutCrc}${crc}`;
}
