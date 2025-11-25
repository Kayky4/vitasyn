import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
// import Stripe from 'stripe';

// Config for Next.js to disable body parsing for webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature']!;
    
    // Mock success for the files generation requirement
    console.log("Webhook received");
    
    res.status(200).json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}