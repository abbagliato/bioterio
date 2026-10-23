/**
 * Ranking do jogo Jovem Bioterista
 * ---------------------------------
 * Cole este código em Extensões > Apps Script de uma Planilha Google
 * e publique como "App da Web" (veja o passo a passo enviado junto).
 *
 * A aba "Ranking" é criada sozinha na primeira pontuação.
 * Para zerar o ranking, apague as linhas da aba (deixe a linha de títulos).
 * Para tirar um apelido, apague a linha dele.
 */

const ABA = 'Ranking';
const MAX_PONTOS = 3000;      // pontuação acima disso é recusada (proteção simples contra trapaça)
const TOP_MAXIMO = 50;        // maior lista que o jogo pode pedir
const PROIBIDAS = [           // apelidos com estas palavras são recusados
  'merda','porra','caralho','bosta','puta','puto','cu','buceta','pinto','piroca','rola','viado',
  'fdp','vsf','pqp','tnc','idiota','imbecil','otario','cacete','foda','foder','fudido','arrombado','corno'
];

function aba_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(ABA);
  if (!sh) {
    sh = ss.insertSheet(ABA);
    sh.appendRow(['Data e hora', 'Apelido', 'Pontos', 'Onde jogou']);
    sh.setFrozenRows(1);
    sh.getRange('A1:D1').setFontWeight('bold');
  }
  return sh;
}

function resposta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function semAcento_(t) {
  return String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Só letras, números e espaços; até 15 caracteres; sem palavrões. Devolve '' se não servir. */
function limparApelido_(texto) {
  const t = String(texto || '').replace(/[^A-Za-zÀ-ÖØ-öø-ÿ0-9 ]/g, '').replace(/\s+/g, ' ').trim().slice(0, 15);
  if (!t) return '';
  const base = semAcento_(t), palavras = base.split(' '), junto = base.replace(/ /g, '');
  const ruim = PROIBIDAS.some(p => palavras.indexOf(p) >= 0 || (p.length >= 4 && junto.indexOf(p) >= 0));
  return ruim ? '' : t;
}

function linhas_() {
  const sh = aba_(), n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, 3).getValues()
    .filter(l => l[1] !== '' && !isNaN(Number(l[2])))
    .map(l => ({ data: l[0] instanceof Date ? l[0] : new Date(l[0]), apelido: String(l[1]), pontos: Number(l[2]) }));
}

function top_(n) {
  const fuso = Session.getScriptTimeZone();
  const todas = linhas_().sort((a, b) => b.pontos - a.pontos || a.data - b.data);
  return {
    ok: true,
    total: todas.length,
    top: todas.slice(0, n).map(l => ({ apelido: l.apelido, pontos: l.pontos, data: Utilities.formatDate(l.data, fuso, 'dd/MM') }))
  };
}

/** GET ?acao=top&n=10  -> lista do ranking */
function doGet(e) {
  const n = Math.max(1, Math.min(TOP_MAXIMO, parseInt((e && e.parameter && e.parameter.n) || '10', 10) || 10));
  return resposta_(top_(n));
}

/** POST {apelido, pontos, onde} -> grava a pontuação e devolve o ranking e a posição */
function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return resposta_({ ok: false, erro: 'Pedido inválido.' }); }
  const apelido = limparApelido_(d.apelido);
  const pontos = Math.round(Number(d.pontos));
  const onde = d.onde === 'computador' ? 'computador' : 'celular';
  if (!apelido) return resposta_({ ok: false, erro: 'Escolha outro apelido, só com letras e números.' });
  if (!(pontos >= 0 && pontos <= MAX_PONTOS)) return resposta_({ ok: false, erro: 'Pontuação inválida.' });

  // evita o mesmo envio repetido (toque duplo) por 1 minuto
  const cache = CacheService.getScriptCache(), chave = 'env:' + semAcento_(apelido) + ':' + pontos;
  if (cache.get(chave)) return resposta_(Object.assign(top_(10), { posicao: null, repetido: true }));

  const trava = LockService.getScriptLock();
  trava.waitLock(10000);
  try {
    aba_().appendRow([new Date(), apelido, pontos, onde]);
    SpreadsheetApp.flush();
  } finally {
    trava.releaseLock();
  }
  cache.put(chave, '1', 60);
  const posicao = linhas_().filter(l => l.pontos > pontos).length + 1;
  return resposta_(Object.assign(top_(10), { posicao: posicao, apelido: apelido }));
}
