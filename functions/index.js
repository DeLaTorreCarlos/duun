const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const crypto = require('crypto');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

admin.initializeApp();
const db = admin.firestore();

// Token "Basic base64(api_key:secreto)" de Clip y credenciales SMTP de Zoho
const CLIP_AUTH = defineSecret('CLIP_AUTH');
const ZOHO_USER = defineSecret('ZOHO_USER');
const ZOHO_PASS = defineSecret('ZOHO_PASS');

const SITE_URL = 'https://dunaclub.mx';
const CLIP_API = 'https://api.payclip.com/v2/checkout';

// TEMPORAL: true = salta el pago de Clip y marca la orden como pagada (solo pruebas)
const TEST_MODE = true;

// Catálogo servidor: los precios NUNCA vienen del cliente
// TODO: precio $1 solo para pruebas; restaurar precios reales antes del lanzamiento
const EVENTS = {
  260827: { title: 'Kassie — DUNA CLUB (27 de agosto)', price: 10 },
  260828: { title: 'EM2K4U — DUNA CLUB (28 de agosto)', price: 10 },
  260829: { title: 'Alexia Malo — DUNA CLUB (29 de agosto)', price: 10 }
};

exports.api = onRequest(
  { region: 'us-central1', secrets: [CLIP_AUTH, ZOHO_USER, ZOHO_PASS] },
  async (req, res) => {
    try {
      // El rewrite de Hosting conserva el prefijo /api
      const path = req.path.replace(/^\/api/, '');
      if (req.method === 'POST' && path === '/createCheckout') {
        return await createCheckout(req, res);
      }
      if (req.method === 'POST' && path === '/clipWebhook') {
        return await clipWebhook(req, res);
      }
      // Ping de verificación al registrar la URL en el dashboard de Clip
      if (req.method === 'GET' && path === '/clipWebhook') {
        return res.status(200).json({ ok: true });
      }
      if (req.method === 'GET' && path === '/orderStatus') {
        return await orderStatus(req, res);
      }
      res.status(404).json({ error: 'Not found' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal error' });
    }
  }
);

async function createCheckout(req, res) {
  const { eventId, name, email } = req.body || {};
  const event = EVENTS[Number(eventId)];
  const emailOk = typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!event || !emailOk) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  const orderRef = crypto.randomUUID();
  const webhookUrl = `https://${req.get('host')}/api/clipWebhook`;

  if (TEST_MODE) {
    const docRef = db.collection('orders').doc(orderRef);
    await docRef.set({
      eventId: Number(eventId),
      eventTitle: event.title,
      name: name || '',
      email,
      amount: event.price,
      paymentRequestId: 'TEST',
      status: 'paid',
      test: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      paidAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await sendTicketEmail(orderRef, { name: name || '', email, eventTitle: event.title });
    return res.json({
      paymentUrl: `${SITE_URL}/shows/${eventId}/checkout?status=success&order=${orderRef}`,
      order: orderRef
    });
  }

  const clipRes = await fetch(CLIP_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: CLIP_AUTH.value()
    },
    body: JSON.stringify({
      amount: event.price,
      currency: 'MXN',
      purchase_description: event.title,
      redirection_url: {
        success: `${SITE_URL}/shows/${eventId}/checkout?status=success&order=${orderRef}`,
        error: `${SITE_URL}/shows/${eventId}/checkout?status=error`,
        default: `${SITE_URL}/shows/${eventId}`
      },
      metadata: {
        external_reference: orderRef,
        customer_info: { name: name || '', email }
      },
      custom_payment_options: {
        payment_method_types: ['credit', 'debit']
      },
      webhook_url: webhookUrl
    })
  });

  if (!clipRes.ok) {
    console.error('Clip error', clipRes.status, await clipRes.text());
    return res.status(502).json({ error: 'No se pudo crear el pago' });
  }

  const payment = await clipRes.json();

  await db.collection('orders').doc(orderRef).set({
    eventId: Number(eventId),
    eventTitle: event.title,
    name: name || '',
    email,
    amount: event.price,
    paymentRequestId: payment.payment_request_id,
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return res.json({ paymentUrl: payment.payment_request_url, order: orderRef });
}

// Diagnóstico: estado de una orden y de su link de pago en Clip
async function orderStatus(req, res) {
  const orderRef = String(req.query.order || '');
  if (!orderRef) {
    return res.status(400).json({ error: 'Falta order' });
  }
  const doc = await db.collection('orders').doc(orderRef).get();
  if (!doc.exists) {
    return res.status(404).json({ error: 'Orden no encontrada' });
  }
  const order = doc.data();
  const clipRes = await fetch(`${CLIP_API}/${order.paymentRequestId}`, {
    headers: { Authorization: CLIP_AUTH.value() }
  });
  const payment = await clipRes.json();
  return res.json({
    order: { status: order.status, event: order.eventTitle, amount: order.amount },
    clip: {
      status: payment.status,
      last_status_message: payment.last_status_message,
      error: payment.message || payment.detail || null
    }
  });
}

async function clipWebhook(req, res) {
  const body = req.body || {};
  const paymentRequestId =
    body.payment_request_id || body.resource?.payment_request_id || body.id;
  if (!paymentRequestId) {
    return res.status(400).json({ error: 'Sin payment_request_id' });
  }

  // No confiar en el cuerpo del webhook: verificar el estado directo con Clip
  const statusRes = await fetch(`${CLIP_API}/${paymentRequestId}`, {
    headers: { Authorization: CLIP_AUTH.value() }
  });
  if (!statusRes.ok) {
    return res.status(502).json({ error: 'No se pudo verificar el pago' });
  }
  const payment = await statusRes.json();
  if (payment.status !== 'CHECKOUT_COMPLETED') {
    return res.json({ received: true, status: payment.status });
  }

  const snap = await db
    .collection('orders')
    .where('paymentRequestId', '==', paymentRequestId)
    .limit(1)
    .get();
  if (snap.empty) {
    return res.status(404).json({ error: 'Orden no encontrada' });
  }
  const doc = snap.docs[0];
  const order = doc.data();
  if (order.status === 'paid') {
    return res.json({ received: true }); // idempotente: correo ya enviado
  }

  await doc.ref.update({
    status: 'paid',
    paidAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await sendTicketEmail(doc.id, order);

  return res.json({ received: true });
}

async function sendTicketEmail(orderId, order) {
  const qrPng = await QRCode.toBuffer(`DUNA:${orderId}`, { width: 500 });

  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: { user: ZOHO_USER.value(), pass: ZOHO_PASS.value() }
  });

  await transporter.sendMail({
    from: `"DUNA CLUB" <${ZOHO_USER.value()}>`,
    to: order.email,
    subject: `Tu entrada — ${order.eventTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h1>DUNA</h1>
        <p>Hola${order.name ? ' ' + order.name : ''}, ¡gracias por tu compra!</p>
        <p><strong>${order.eventTitle}</strong></p>
        <p>Presenta este QR en la entrada:</p>
        <img src="cid:ticketqr" alt="QR de tu entrada" width="250">
        <p>Referencia: ${orderId}</p>
        <p>Cualquier aclaración escríbenos a contacto@dunaclub.mx</p>
      </div>`,
    attachments: [
      { filename: 'entrada-duna.png', content: qrPng, cid: 'ticketqr' }
    ]
  });
}
