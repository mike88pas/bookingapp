/**
 * Seed availability docs via Firebase REST API.
 * Usage: node scripts/seed-availability-rest.mjs [project-id]
 */
import { execSync } from 'child_process';

const projectId = process.argv[2] || 'bookingapp-dev';
const tenantId = 'milosz-mma';
const trainerId = 'milosz';

const token = execSync('gcloud auth print-access-token', { encoding: 'utf-8' }).trim();

const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

const weekdaySlots = [
  { start: '09:00', end: '12:00' },
  { start: '15:00', end: '19:00' },
];
const saturdaySlots = [{ start: '10:00', end: '14:00' }];

const days = [
  { dow: 'mon', slots: weekdaySlots, active: true },
  { dow: 'tue', slots: weekdaySlots, active: true },
  { dow: 'wed', slots: weekdaySlots, active: true },
  { dow: 'thu', slots: weekdaySlots, active: true },
  { dow: 'fri', slots: weekdaySlots, active: true },
  { dow: 'sat', slots: saturdaySlots, active: true },
  { dow: 'sun', slots: [], active: false },
];

function toFV(val) {
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFV) } };
  if (typeof val === 'object' && val !== null) {
    const fields = {};
    for (const [k, v] of Object.entries(val)) fields[k] = toFV(v);
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

for (const d of days) {
  const docId = `${trainerId}_${d.dow}`;
  const body = {
    fields: {
      id: toFV(docId),
      tenantId: toFV(tenantId),
      trainerId: toFV(trainerId),
      dayOfWeek: toFV(d.dow),
      slots: toFV(d.slots),
      active: toFV(d.active),
    },
  };

  const resp = await fetch(`${baseUrl}/availability/${docId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (resp.ok) {
    console.log(`  + availability/${docId}`);
  } else {
    console.error(`  FAIL ${docId}: ${resp.status} ${await resp.text()}`);
  }
}

console.log('Done.');
