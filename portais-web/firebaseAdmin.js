import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync(new URL('./firebase-key.json', import.meta.url)));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

export const dbAdmin = admin.firestore();
export const authAdmin = admin.auth();