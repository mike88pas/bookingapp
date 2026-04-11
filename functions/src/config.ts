import { setGlobalOptions } from 'firebase-functions/v2';

export const REGION = 'europe-central2';

setGlobalOptions({
  region: REGION,
  memory: '256MiB',
  maxInstances: 10,
});
