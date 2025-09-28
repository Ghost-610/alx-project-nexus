// pages/api/auth/login.ts
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

  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Missing email or password" });
  }

  // dummy check: password length >= 6
  if (password.length < 6) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  // simulate lookup
  await new Promise((r) => setTimeout(r, 450));

  const fakeUser = { id: String(Date.now()), username: email.split("@")[0], email };
  const fakeToken = "mock-login-token-" + Date.now();

  return res.status(200).json({ success: true, message: "Login successful", user: fakeUser, token: fakeToken });
}
