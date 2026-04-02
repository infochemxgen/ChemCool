import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Stripe from "stripe";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import fs from "fs";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let db: FirebaseFirestore.Firestore | null = null;
try {
  const configPath = path.join(__dirname, "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
    db = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);
    console.log("Firebase Admin initialized successfully.");
  } else {
    console.warn("firebase-applet-config.json not found. Webhook Firestore updates will be disabled.");
  }
} catch (e) {
  console.error("Failed to initialize Firebase Admin:", e);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Stripe lazily
  let stripeClient: Stripe | null = null;
  function getStripe(): Stripe {
    if (!stripeClient) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) {
        throw new Error("STRIPE_SECRET_KEY environment variable is required");
      }
      stripeClient = new Stripe(key, { apiVersion: "2023-10-16" as any });
    }
    return stripeClient;
  }

  // Stripe Webhook Endpoint (must use raw body)
  app.post(
    "/api/webhooks/stripe",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig || !webhookSecret) {
        res.status(400).send("Missing signature or webhook secret");
        return;
      }

      try {
        const stripe = getStripe();
        const event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          webhookSecret
        );

        // Handle the event
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.client_reference_id;
            const customerId = session.customer as string;
            const tier = session.metadata?.tier || "none";
            console.log("Checkout session completed:", session.id, "User:", userId, "Tier:", tier);
            
            if (db && userId) {
              await db.collection("users").doc(userId).update({
                subscriptionStatus: "active",
                stripeCustomerId: customerId,
                tier: tier
              });
              console.log(`Updated user ${userId} to active status with tier ${tier}.`);
            }
            break;
          }
          case "customer.subscription.deleted":
          case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;
            const status = subscription.status;
            const custId = subscription.customer as string;
            console.log(`Subscription ${subscription.id} updated/deleted. Status: ${status}`);
            
            if (db && custId) {
              const usersRef = await db.collection("users").where("stripeCustomerId", "==", custId).get();
              if (!usersRef.empty) {
                const userDoc = usersRef.docs[0];
                const newStatus = status === "active" ? "active" : (status === "canceled" ? "canceled" : "past_due");
                await userDoc.ref.update({
                  subscriptionStatus: newStatus
                });
                console.log(`Updated user ${userDoc.id} subscription status to ${newStatus}.`);
              }
            }
            break;
          }
          default:
            console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
      } catch (err: any) {
        console.error("Webhook Error:", err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }
  );

  // Parse JSON bodies for other API routes
  app.use(express.json());

  // API Route to create checkout session
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { priceId, userId, userEmail, tier } = req.body;
      const stripe = getStripe();
      
      // Ensure APP_URL doesn't have a trailing slash for clean redirects
      const appUrl = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
      
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/pricing`,
        client_reference_id: userId,
        customer_email: userEmail,
        metadata: {
          tier: tier || "none"
        }
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (err: any) {
      console.error("Error creating checkout session:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
