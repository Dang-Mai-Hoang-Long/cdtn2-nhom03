// Tạo file .xlsx tối giản (một trang tính) không cần thư viện: các file XML theo chuẩn Office Open XML, đóng gói ZIP.
// Chuỗi ghi dạng inlineStr nên không bao giờ bị hiểu là công thức; số ghi dạng số để tính toán được trong Excel.
const zlib = require('node:zlib');

const BANG_CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = BANG_CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dongGoiZip(cacFile) {
  const phanDau = [];
  const mucLuc = [];
  let viTri = 0;
  for (const [ten, noiDung] of cacFile) {
    const tenBuf = Buffer.from(ten, 'utf8');
    const goc = Buffer.from(noiDung, 'utf8');
    const nen = zlib.deflateRawSync(goc);
    const crc = crc32(goc);
    const dau = Buffer.alloc(30);
    dau.writeUInt32LE(0x04034b50, 0);
    dau.writeUInt16LE(20, 4);
    dau.writeUInt16LE(0x0800, 6); // tên file UTF-8
    dau.writeUInt16LE(8, 8); // nén deflate
    dau.writeUInt32LE(0x00210000, 10); // ngày giờ cố định (1980-01-01)
    dau.writeUInt32LE(crc, 14);
    dau.writeUInt32LE(nen.length, 18);
    dau.writeUInt32LE(goc.length, 22);
    dau.writeUInt16LE(tenBuf.length, 26);
    phanDau.push(dau, tenBuf, nen);

    const muc = Buffer.alloc(46);
    muc.writeUInt32LE(0x02014b50, 0);
    muc.writeUInt16LE(20, 4);
    muc.writeUInt16LE(20, 6);
    muc.writeUInt16LE(0x0800, 8);
    muc.writeUInt16LE(8, 10);
    muc.writeUInt32LE(0x00210000, 12);
    muc.writeUInt32LE(crc, 16);
    muc.writeUInt32LE(nen.length, 20);
    muc.writeUInt32LE(goc.length, 24);
    muc.writeUInt16LE(tenBuf.length, 28);
    muc.writeUInt32LE(viTri, 42);
    mucLuc.push(muc, tenBuf);
    viTri += dau.length + tenBuf.length + nen.length;
  }
  const mucLucBuf = Buffer.concat(mucLuc);
  const ket = Buffer.alloc(22);
  ket.writeUInt32LE(0x06054b50, 0);
  ket.writeUInt16LE(cacFile.length, 8);
  ket.writeUInt16LE(cacFile.length, 10);
  ket.writeUInt32LE(mucLucBuf.length, 12);
  ket.writeUInt32LE(viTri, 16);
  return Buffer.concat([...phanDau, mucLucBuf, ket]);
}

// Bỏ ký tự điều khiển mà XML 1.0 không cho phép, rồi thoát ký tự đặc biệt.
const thoatXml = (chuoi) => String(chuoi)
  .replace(/[^\u0009\u000A\u000D -퟿-�\u{10000}-\u{10FFFF}]/gu, '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function tenCot(chiSo) {
  let ten = '';
  let so = chiSo + 1;
  while (so > 0) {
    ten = String.fromCharCode(65 + ((so - 1) % 26)) + ten;
    so = Math.floor((so - 1) / 26);
  }
  return ten;
}

function taoO(giaTri, cot, hang, kieu) {
  const o = `${tenCot(cot)}${hang}`;
  const dinhDang = kieu ? ` s="${kieu}"` : '';
  if (typeof giaTri === 'number' && Number.isFinite(giaTri)) return `<c r="${o}"${dinhDang}><v>${giaTri}</v></c>`;
  if (giaTri === null || giaTri === undefined || giaTri === '') return `<c r="${o}"${dinhDang}/>`;
  return `<c r="${o}" t="inlineStr"${dinhDang}><is><t xml:space="preserve">${thoatXml(giaTri)}</t></is></c>`;
}

// cacCot: [{ tieuDe, rong }]; cacDong: mảng các mảng giá trị theo đúng thứ tự cột.
function taoXlsx(tenTrang, cacCot, cacDong) {
  const hangTieuDe = `<row r="1">${cacCot.map((c, i) => taoO(c.tieuDe, i, 1, 1)).join('')}</row>`;
  const cacHang = cacDong.map((dong, h) => `<row r="${h + 2}">${dong.map((v, i) => taoO(v, i, h + 2)).join('')}</row>`).join('');
  const vung = `A1:${tenCot(cacCot.length - 1)}${cacDong.length + 1}`;
  const doRong = cacCot.map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.rong ?? 18}" customWidth="1"/>`).join('');
  const tenSach = thoatXml(tenTrang.replace(/[\\/?*[\]:]/g, ' ').slice(0, 31));
  const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  return dongGoiZip([
    ['[Content_Types].xml', `${XML}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`],
    ['_rels/.rels', `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ['xl/workbook.xml', `${XML}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${tenSach}" sheetId="1" r:id="rId1"/></sheets></workbook>`],
    ['xl/_rels/workbook.xml.rels', `${XML}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
    ['xl/styles.xml', `${XML}<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf xfId="0"/><xf xfId="0" fontId="1" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`],
    ['xl/worksheets/sheet1.xml', `${XML}<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${doRong}</cols><sheetData>${hangTieuDe}${cacHang}</sheetData><autoFilter ref="${vung}"/></worksheet>`],
  ]);
}

module.exports = { taoXlsx, crc32 };
