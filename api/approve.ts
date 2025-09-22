// Serverless API route to approve builder fee using a server-side private key.
// Expected deployment: Vercel/Netlify (Node environment with fetch available).
// Env var required: BUILDER_PRIVATE_KEY (0x-prefixed hex string)
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { maxBuilderFee, builderAddress } = req.body || {};
    if (typeof maxBuilderFee !== 'number' || !builderAddress) {
      res.status(400).json({ error: 'Invalid payload' });
      return;
    }

    const privateKey = process.env.BUILDER_PRIVATE_KEY;
    if (!privateKey) {
      res.status(500).json({ error: 'Server is not configured with BUILDER_PRIVATE_KEY' });
      return;
    }

    const builderApi = 'https://hl-builder-hack-production.up.railway.app/approve';
    const payload = {
      maxBuilderFee,
      privateKey,
      builderAddress,
    };

    const r = await fetch(builderApi, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await r.text();
    if (!r.ok) {
      res.status(r.status).send(text || 'Approve failed');
      return;
    }
    // try to parse json if possible
    try {
      const json = JSON.parse(text);
      res.status(200).json(json);
    } catch {
      res.status(200).send(text);
    }
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Unknown error' });
  }
}
