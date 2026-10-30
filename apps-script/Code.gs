/**
 * Valuecompass — homepage inquiry receiver.
 *
 * Bound to a Google Sheet (Extensions > Apps Script). Each form submission
 * from vlcom.co.kr is appended as a row and a notification mail is sent to
 * NOTIFY_TO. Deploy as a web app (Execute as: Me, Who has access: Anyone)
 * and paste the /exec URL into FORM_ENDPOINT in docs/assets/js/site.js
 * (source: static/assets/js/site.js).
 */
const NOTIFY_TO = "vlcom260713@gmail.com";
const SHEET_NAME = "문의";
const FIELDS = ["company", "name", "email", "phone", "message"];
const HEADERS = ["접수 시각", "회사명", "담당자 이름", "이메일", "연락처", "문의 내용", "접수 페이지"];

function doPost(e) {
  const p = (e && e.parameter) || {};
  try {
    // bots fill the hidden field; pretend success and drop it
    if (p.website) return json_({ ok: true });

    const v = {};
    for (const k of FIELDS) {
      v[k] = String(p[k] || "").trim().slice(0, k === "message" ? 5000 : 200);
      if (!v[k]) return json_({ ok: false, error: "missing " + k });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) return json_({ ok: false, error: "invalid email" });
    const page = String(p.page || "").slice(0, 100);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = sheet_();
      sheet.appendRow([new Date(), safe_(v.company), safe_(v.name), safe_(v.email), safe_(v.phone), safe_(v.message), safe_(page)]);
    } finally {
      lock.releaseLock();
    }

    MailApp.sendEmail({
      to: NOTIFY_TO,
      replyTo: v.email,
      name: "밸류컴퍼스 홈페이지",
      subject: "[홈페이지 문의] " + v.company + " · " + v.name,
      body: [
        "홈페이지로 새 문의가 접수되었습니다.",
        "",
        "회사명: " + v.company,
        "담당자 이름: " + v.name,
        "이메일: " + v.email,
        "연락처: " + v.phone,
        "접수 페이지: " + page,
        "",
        "문의 내용:",
        v.message,
        "",
        "— 이 메일에 바로 회신하면 문의하신 분께 전달됩니다.",
        "— 전체 내역: " + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
      ].join("\n"),
    });

    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: "server" });
  }
}

function doGet() {
  return json_({ ok: true, service: "valuecompass-inquiry" });
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return sh;
}

// A cell that starts with = + - @ would run as a formula in Sheets.
function safe_(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the editor to grant permissions and create the sheet tab. */
function setup() {
  sheet_();
  MailApp.getRemainingDailyQuota();
}
