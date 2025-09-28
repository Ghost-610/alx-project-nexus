// pages/api/auth/social.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  success: boolean;
  message?: string;
  user?: { id: string; username: string; email: string };
  token?: string;
  provider?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  const { provider } = req.body as { provider?: string };

  // pretend we redirect to provider and it returns a token
  await new Promise((r) => setTimeout(r, 700));

  const fakeUser = { id: String(Date.now()), username: `${provider}_user`, email: `${provider}_user@example.com` };
  const fakeToken = `mock-${provider}-token-${Date.now()}`;

  return res.status(200).json({ success: true, message: `${provider} sign-in successful`, user: fakeUser, token: fakeToken, provider });
}
