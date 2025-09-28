// pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  success: boolean;
  message?: string;
  user?: { id: string; username: string; email: string };
  token?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { username, email, password } = req.body as { username?: string; email?: string; password?: string };

  // basic server-side validation (mock)
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  // simulate processing delay
  await new Promise((r) => setTimeout(r, 600));

  // you could add logic to check existing users, etc.
  const fakeUser = { id: String(Date.now()), username, email };
  const fakeToken = "mock-jwt-token-" + Date.now();

  return res.status(201).json({ success: true, message: "Registered", user: fakeUser, token: fakeToken });
}
