import { Request, Response } from "express";
import { getFirebaseAdminAuth, isFirebaseAdminConfigured } from "../config/firebaseAdmin";
import { Recruiter } from "../models/Recruiter";
import { issueAppToken } from "../utils/issueAppToken";

export const firebaseSession = async (req: Request, res: Response) => {
  if (!isFirebaseAdminConfigured()) {
    return res.status(503).json({
      error:
        "Firebase is not configured on the server. Set FIREBASE_SERVICE_ACCOUNT_JSON.",
    });
  }

  const { idToken, organization_name } = req.body as {
    idToken?: string;
    organization_name?: string;
  };

  if (!idToken) {
    return res.status(400).json({ error: "idToken is required" });
  }

  const auth = getFirebaseAdminAuth();
  if (!auth) {
    return res.status(503).json({ error: "Firebase Admin failed to initialize" });
  }

  try {
    const decoded = await auth.verifyIdToken(idToken);
    const email = decoded.email?.toLowerCase();
    if (!email) {
      return res.status(400).json({ error: "Firebase account has no email" });
    }

    if (!decoded.email_verified) {
      return res.status(403).json({
        error: "Email not verified. Check your inbox for the verification link.",
      });
    }

    const recruiter = await Recruiter.findOneAndUpdate(
      { email },
      {
        $set: { firebase_uid: decoded.uid },
        $setOnInsert: {
          email,
          ...(organization_name?.trim()
            ? { organization_name: organization_name.trim() }
            : {}),
        },
      },
      { upsert: true, new: true },
    );

    const token = issueAppToken(recruiter);
    res.json({ token, recruiter });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Invalid Firebase token";
    res.status(401).json({ error: message });
  }
};
