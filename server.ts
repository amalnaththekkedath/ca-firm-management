import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "CA Firm ERP Desktop" });
  });

  // AI CA Advisor & Compliance Assistant Endpoint
  app.post("/api/ai/advisor", async (req, res) => {
    try {
      const { prompt, type, contextData } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is not configured in environment.",
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      let systemInstruction = `You are an expert Senior Chartered Accountant (CA) & Legal Compliance Advisor for Indian & Global CA Firms.
You provide authoritative, precise, professional guidance on Direct Taxes (Income Tax Act), Indirect Taxes (GST Act, GSTR-1/3B/9), Corporate Law (MCA/ROC, Companies Act 2013), Statutory Audits, Tax Audits u/s 44AB, and CA Firm Practice Management.
Provide structured, scannable, actionable responses with clear headings, bullet points, and practical advice. Keep tone professional and authoritative.`;

      if (type === "TAX_NOTICE") {
        systemInstruction += `\nSpecialization: Draft clear reply strategies for Income Tax & GST Scrutiny Notices or DRC-01/ASMT-10.`;
      } else if (type === "BILLING_SUMMARY") {
        systemInstruction += `\nSpecialization: Summarize client billable work, recommend professional fees based on SAC codes 998222/998231, out-of-pocket expenses, and construct professional draft invoice notes.`;
      } else if (type === "COMPLIANCE_CHECKLIST") {
        systemInstruction += `\nSpecialization: Generate audit & filing checklists for specific entity types (Pvt Ltd, LLP, Partnership) and financial years.`;
      }

      const contents = contextData
        ? `Context Information:\n${JSON.stringify(contextData, null, 2)}\n\nUser Query: ${prompt}`
        : prompt;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({
        result: response.text || "No response generated.",
      });
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      res.status(500).json({
        error: error.message || "Failed to process AI advisory request.",
      });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CA Firm Desktop Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
