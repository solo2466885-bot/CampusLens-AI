import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// =====================================
// FRONTEND
// =====================================

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// =====================================
// IMAGE ANALYSIS
// =====================================

app.post("/analyze", upload.single("image"), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                error: "Please upload an image."
            });
        }

        const imageBase64 =
            req.file.buffer.toString("base64");

        const prompt = `
You are CampusLens AI.

Analyze the uploaded image.

Give the answer in these sections:

1. Scene Summary
2. Objects Detected
3. Visible Text
4. Campus/Equipment Explanation
5. Possible Visible Safety Concerns
6. Useful Student Information

Use simple and clear language.

Do not invent information that cannot be seen.
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",

            contents: [
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: req.file.mimetype
                    }
                },
                {
                    text: prompt
                }
            ]
        });

        res.json({
            success: true,
            analysis: response.text
        });

    } catch (error) {

        console.error("Analysis Error:", error);

        res.status(500).json({
            success: false,
            error: "AI analysis failed."
        });
    }
});


// =====================================
// ASK AI
// =====================================

app.post("/ask", upload.single("image"), async (req, res) => {

    try {

        if (!req.file) {
            return res.status(400).json({
                error: "Please upload an image first."
            });
        }

        const question = req.body.question;

        if (!question) {
            return res.status(400).json({
                error: "Please enter a question."
            });
        }

        const imageBase64 =
            req.file.buffer.toString("base64");

        const prompt = `
You are CampusLens AI.

Look carefully at the uploaded image.

Answer this question:

${question}

Rules:
- Use only information visible in the image.
- Do not invent details.
- Keep the answer simple and clear.
- If the answer cannot be determined from the image, say so.
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",

            contents: [
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: req.file.mimetype
                    }
                },
                {
                    text: prompt
                }
            ]
        });

        res.json({
            success: true,
            answer: response.text
        });

    } catch (error) {

        console.error("Chat Error:", error);

        res.status(500).json({
            success: false,
            error: "Unable to answer the question."
        });
    }
});


// =====================================
// START SERVER
// =====================================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `CampusLens AI running on port ${PORT}`
    );

});
