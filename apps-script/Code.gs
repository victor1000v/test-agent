/**
 * AO1 submissions pipeline.
 *
 * Receives a flat JSON payload from the form (see buildExportPayload() in
 * index.html), then in one go:
 *   1. Appends a row to the "AO1 Submissions" Google Sheet (self-heals its
 *      own header row from whatever keys show up — new questions just show
 *      up as new trailing columns automatically).
 *   2. Builds a formatted PDF of that one submission and saves it into the
 *      "AO1 Submission PDFs" Drive folder.
 *   3. Emails Josie a notification with a link to the PDF and the Sheet.
 *
 * Setup (see the repo README for the full walkthrough):
 *   1. Open the "AO1 Submissions" Sheet, Extensions -> Apps Script.
 *   2. Replace the default Code.gs contents with this file.
 *   3. Deploy -> New deployment -> type "Web app".
 *        Execute as: Me
 *        Who has access: Anyone
 *   4. Authorize when prompted (first deploy only).
 *   5. Copy the Web app URL into CONFIG.SHEETS_WEBAPP_ENDPOINT in index.html.
 */

var SHEET_ID = '1SSVSWtrPXcw06oaJKDWGsgJWqS6CIxVGZam2yQPmpTw';
var FOLDER_ID = '1BUlv3JWvTzJe8FcbqwCslr_TlQsHzMWi';
var DEST_EMAIL = 'josie@academiaone.co.uk';

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    var headers = ensureHeaders_(sheet, payload);

    var pdfUrl = createSubmissionPdf_(payload, headers);
    payload.pdf_link = pdfUrl;
    if (headers.indexOf('pdf_link') === -1) {
      headers.push('pdf_link');
      sheet.getRange(1, headers.length, 1, 1).setValues([['pdf_link']]);
    }

    var row = headers.map(function (h) {
      var v = payload[h];
      return v === undefined || v === null ? '' : String(v);
    });
    sheet.appendRow(row);

    sendNotificationEmail_(payload, pdfUrl);

    return jsonOut_({ ok: true, pdf: pdfUrl });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  }
}

// Visiting the deployed URL in a browser is a quick way to confirm the
// deployment itself is live (this is not used by the form).
function doGet(e) {
  return ContentService.createTextOutput('AO1 submissions endpoint is live.');
}

function ensureHeaders_(sheet, payload) {
  var lastCol = sheet.getLastColumn();
  var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  headers = headers.filter(function (h) { return h !== ''; });

  if (!headers.length) {
    headers = Object.keys(payload);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return headers;
  }

  var existing = {};
  headers.forEach(function (h) { existing[h] = true; });
  var newKeys = Object.keys(payload).filter(function (k) { return !existing[k]; });
  if (newKeys.length) {
    sheet.getRange(1, headers.length + 1, 1, newKeys.length).setValues([newKeys]);
    headers = headers.concat(newKeys);
  }
  return headers;
}

function createSubmissionPdf_(payload, headers) {
  var folder = DriveApp.getFolderById(FOLDER_ID);
  var who = (payload.name || payload.email || 'submission').toString().replace(/[^\w\-]+/g, '_');
  var stamp = Utilities.formatDate(new Date(), 'Etc/UTC', 'yyyyMMdd_HHmmss');
  var doc = DocumentApp.create('AO1 - ' + who + ' - ' + stamp);
  var body = doc.getBody();

  body.appendParagraph('AO1 · 名校申请深度规划自查表')
    .setHeading(DocumentApp.ParagraphHeading.TITLE);
  body.appendParagraph('Submitted: ' + (payload.submitted_at || new Date().toISOString()));
  body.appendParagraph(' ');

  headers.forEach(function (h) {
    if (h === 'pdf_link') return;
    var v = payload[h];
    if (v === undefined || v === null || v === '') return;
    body.appendParagraph(h).setHeading(DocumentApp.ParagraphHeading.HEADING3);
    body.appendParagraph(String(v));
  });

  doc.saveAndClose();

  var docFile = DriveApp.getFileById(doc.getId());
  var pdfBlob = docFile.getAs('application/pdf');
  pdfBlob.setName(docFile.getName() + '.pdf');
  var pdfFile = folder.createFile(pdfBlob);

  // Keep only the PDF in Drive, not the intermediate Google Doc.
  docFile.setTrashed(true);

  return pdfFile.getUrl();
}

function sendNotificationEmail_(payload, pdfUrl) {
  var subject = 'AO1 新问卷提交 / New AO1 Submission: ' + (payload.name || payload.email || '');
  var lines = [
    '姓名 / Name: ' + (payload.name || ''),
    '邮箱 / Email: ' + (payload.email || ''),
    '微信 / WeChat: ' + (payload.wechat || ''),
    '',
    'PDF: ' + pdfUrl,
    'Sheet: https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit'
  ];
  var options = {};
  if (payload.email) options.replyTo = payload.email;
  MailApp.sendEmail(DEST_EMAIL, subject, lines.join('\n'), options);
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
