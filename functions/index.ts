/**
 * NOTE: This file represents the server-side logic running on Firebase Cloud Functions.
 * In this SPA preview, these functions do not execute, but they demonstrate the required
 * backend architecture for Payments, Payouts, and Calendar integration.
 */

/* 
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import { google } from 'googleapis';

admin.initializeApp();
const db = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

// 1. Create Checkout Session (Called via HTTP or Callable)
export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  
  const { professionalId, slotStart, slotEnd } = data;
  const proDoc = await db.collection('professionals').doc(professionalId).get();
  const proData = proDoc.data();

  // Create Pending Consultation
  const consultRef = await db.collection('consultations').add({
    patientId: context.auth.uid,
    professionalId,
    start_at: slotStart,
    end_at: slotEnd,
    status: 'pending',
    price_cents: proData.price_default_cents,
    created_at: admin.firestore.FieldValue.serverTimestamp()
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: `Consultation with ${proData.name}` },
        unit_amount: proData.price_default_cents,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `https://vitasyn.app/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `https://vitasyn.app/cancel`,
    metadata: {
      consultationId: consultRef.id,
      professionalId: professionalId,
      patientId: context.auth.uid
    }
  });

  return { sessionId: session.id, url: session.url };
});

// 2. Stripe Webhook - Handle successful payment
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { consultationId } = session.metadata;
    
    // Update Consultation
    await db.collection('consultations').doc(consultationId).update({
      status: 'paid',
      'payment.chargeId': session.payment_intent,
      'payment.amount_cents': session.amount_total,
      'payment.stripe_fee_cents': 0, // Calculate from balance transaction in real app
      'payment.platform_fee_cents': session.amount_total * 0.15, // 15% fee
      'payment.paid_at': admin.firestore.FieldValue.serverTimestamp()
    });

    // Trigger Calendar Creation
    await createCalendarEventInternal(consultationId);
  }

  res.json({received: true});
});

// 3. Scheduled Payouts (Run every day)
export const scheduledPayouts = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const threeDaysAgo = admin.firestore.Timestamp.fromMillis(Date.now() - 259200000);
  
  const completedConsults = await db.collection('consultations')
    .where('status', '==', 'completed')
    .where('end_at', '<=', threeDaysAgo.toISOString()) // Simplified
    .where('payout.transfer_status', '==', null)
    .get();

  for (const doc of completedConsults.docs) {
    const data = doc.data();
    const proDoc = await db.collection('professionals').doc(data.professionalId).get();
    const connectId = proDoc.data().connected_account_id;

    if (connectId) {
      const transferAmount = data.price_cents - data.payment.platform_fee_cents; // Simplified calc
      
      const transfer = await stripe.transfers.create({
        amount: transferAmount,
        currency: 'usd',
        destination: connectId,
        transfer_group: doc.id
      });

      await doc.ref.update({
        'payout.transferId': transfer.id,
        'payout.transfer_status': 'succeeded',
        'payout.transferred_at': admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }
});

// 4. Helper: Create Google Calendar Event
async function createCalendarEventInternal(consultationId) {
  const consultDoc = await db.collection('consultations').doc(consultationId).get();
  const data = consultDoc.data();
  const proDoc = await db.collection('professionals').doc(data.professionalId).get();
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  
  oauth2Client.setCredentials({ refresh_token: proDoc.data().google_refresh_token });
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      summary: 'VitaSyn Consultation',
      description: `Consultation between ${proDoc.data().name} and Patient`,
      start: { dateTime: data.start_at },
      end: { dateTime: data.end_at },
      conferenceData: {
        createRequest: { requestId: consultationId, conferenceSolutionKey: { type: 'hangoutsMeet' } }
      }
    }
  });

  await consultDoc.ref.update({
    'meeting.calendarEventId': event.data.id,
    'meeting.meetLink': event.data.hangoutLink
  });
}
*/
