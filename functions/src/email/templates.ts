import { APP_NAME, APP_URL } from '../config';

const BRAND_COLOR = '#e63946';
const BRAND_BG = '#fff1f1';

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
        <tr><td style="background:${BRAND_COLOR};padding:24px 32px;text-align:center">
          <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700">${APP_NAME}</h1>
        </td></tr>
        <tr><td style="padding:32px">
          ${content}
        </td></tr>
        <tr><td style="padding:24px 32px;background:#fafaf9;border-top:1px solid #e7e5e4;text-align:center">
          <p style="margin:0;font-size:12px;color:#78716c">
            ${APP_NAME} &mdash; Platforma rezerwacji treningow
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function infoBlock(data: {
  trainerName: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  priceZl?: string;
}): string {
  const priceRow = data.priceZl
    ? `<tr>
          <td style="font-size:13px;color:#78716c">Cena:</td>
          <td style="font-size:14px;color:#1c1917">${data.priceZl} PLN</td>
        </tr>`
    : '';
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_BG};border-radius:12px;padding:20px;margin:16px 0">
    <tr><td>
      <table width="100%" cellpadding="4" cellspacing="0">
        <tr>
          <td style="font-size:13px;color:#78716c;width:130px">Trener:</td>
          <td style="font-size:14px;color:#1c1917;font-weight:600">${data.trainerName}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#78716c">Klient:</td>
          <td style="font-size:14px;color:#1c1917;font-weight:600">${data.clientName}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#78716c">Trening:</td>
          <td style="font-size:14px;color:#1c1917">${data.service}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#78716c">Data:</td>
          <td style="font-size:14px;color:#1c1917">${data.date}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#78716c">Godzina:</td>
          <td style="font-size:14px;color:#1c1917">${data.time}</td>
        </tr>
        ${priceRow}
      </table>
    </td></tr>
  </table>`;
}

function button(url: string, label: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0">
    <tr><td style="background:${BRAND_COLOR};border-radius:8px;padding:12px 28px">
      <a href="${url}" style="color:#ffffff;text-decoration:none;font-size:14px;font-weight:600">${label}</a>
    </td></tr>
  </table>`;
}

interface BookingEmailData {
  clientName: string;
  clientEmail: string;
  trainerName: string;
  service: string;
  date: string;
  time: string;
  priceGrosze: number;
  tenantSlug: string;
}

// ── Booking Confirmed → Client ────────────────────
export function bookingConfirmedClient(data: BookingEmailData): {
  subject: string;
  html: string;
} {
  const priceZl = (data.priceGrosze / 100).toFixed(2);
  const url = `${APP_URL.value()}/b/${data.tenantSlug}`;
  return {
    subject: `Rezerwacja potwierdzona — ${data.service}`,
    html: layout(`
      <h2 style="margin:0 0 16px;font-size:18px;color:#1c1917">Rezerwacja potwierdzona!</h2>
      <p style="margin:0 0 8px;font-size:14px;color:#44403c;line-height:1.6">
        Czesc ${data.clientName}, Twoja rezerwacja u trenera ${data.trainerName} zostala potwierdzona.
      </p>
      ${infoBlock({ trainerName: data.trainerName, clientName: data.clientName, service: data.service, date: data.date, time: data.time, priceZl })}
      <p style="margin:0;font-size:14px;color:#44403c;line-height:1.6">
        Do zobaczenia na treningu!
      </p>
      ${button(url, 'Strona trenera')}
    `),
  };
}

// ── Booking Confirmed → Trainer ───────────────────
export function bookingConfirmedTrainer(
  data: BookingEmailData & { trainerEmail: string }
): { subject: string; html: string } {
  const priceZl = (data.priceGrosze / 100).toFixed(2);
  const url = `${APP_URL.value()}/app`;
  return {
    subject: `Nowa rezerwacja od ${data.clientName}`,
    html: layout(`
      <h2 style="margin:0 0 16px;font-size:18px;color:#1c1917">Nowa rezerwacja!</h2>
      <p style="margin:0 0 8px;font-size:14px;color:#44403c;line-height:1.6">
        Klient <strong>${data.clientName}</strong> (${data.clientEmail}) zaplacilem i zarezerwowsl trening.
      </p>
      ${infoBlock({ trainerName: data.trainerName, clientName: data.clientName, service: data.service, date: data.date, time: data.time, priceZl })}
      ${button(url, 'Panel trenera')}
    `),
  };
}

// ── Booking Cancelled → Client ────────────────────
export function bookingCancelledClient(data: {
  clientName: string;
  trainerName: string;
  service: string;
  date: string;
  time: string;
  tenantSlug: string;
}): { subject: string; html: string } {
  const url = `${APP_URL.value()}/b/${data.tenantSlug}`;
  return {
    subject: `Rezerwacja anulowana — ${data.date}`,
    html: layout(`
      <h2 style="margin:0 0 16px;font-size:18px;color:#1c1917">Rezerwacja anulowana</h2>
      <p style="margin:0 0 8px;font-size:14px;color:#44403c;line-height:1.6">
        Czesc ${data.clientName}, Twoja rezerwacja u ${data.trainerName} zostala anulowana.
      </p>
      ${infoBlock({ trainerName: data.trainerName, clientName: data.clientName, service: data.service, date: data.date, time: data.time })}
      <p style="margin:16px 0 0;font-size:14px;color:#44403c;line-height:1.6">
        Zarezerwuj nowy termin kiedy chcesz.
      </p>
      ${button(url, 'Zarezerwuj ponownie')}
    `),
  };
}

// ── Booking Cancelled → Trainer ───────────────────
export function bookingCancelledTrainer(data: {
  clientName: string;
  trainerName: string;
  service: string;
  date: string;
  time: string;
}): { subject: string; html: string } {
  const url = `${APP_URL.value()}/app`;
  return {
    subject: `Anulowana rezerwacja — ${data.clientName}`,
    html: layout(`
      <h2 style="margin:0 0 16px;font-size:18px;color:#1c1917">Rezerwacja anulowana</h2>
      <p style="margin:0 0 8px;font-size:14px;color:#44403c;line-height:1.6">
        Klient <strong>${data.clientName}</strong> anulowal rezerwacje.
      </p>
      ${infoBlock({ trainerName: data.trainerName, clientName: data.clientName, service: data.service, date: data.date, time: data.time })}
      ${button(url, 'Panel trenera')}
    `),
  };
}

// ── Reminder (24h / 2h) → Client ──────────────────
export function bookingReminder(data: {
  clientName: string;
  trainerName: string;
  service: string;
  date: string;
  time: string;
  hoursLeft: number;
  tenantSlug: string;
}): { subject: string; html: string } {
  const label = data.hoursLeft <= 3 ? 'za 2 godziny' : 'jutro';
  return {
    subject: `Przypomnienie — trening ${label}`,
    html: layout(`
      <h2 style="margin:0 0 16px;font-size:18px;color:#1c1917">Przypomnienie o treningu</h2>
      <p style="margin:0 0 8px;font-size:14px;color:#44403c;line-height:1.6">
        Czesc ${data.clientName}, przypominamy o Twoim treningu ${label}.
      </p>
      ${infoBlock({ trainerName: data.trainerName, clientName: data.clientName, service: data.service, date: data.date, time: data.time })}
      ${button(`${APP_URL.value()}/b/${data.tenantSlug}`, 'Szczegoly')}
    `),
  };
}
