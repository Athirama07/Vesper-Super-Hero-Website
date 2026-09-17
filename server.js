require("dotenv").config();

const express = require("express");

const app = express();

const PORT = process.env.PORT || 5000;

const resendApiKey = (process.env.RESEND_API_KEY || "").trim();
const notifyEmail = (process.env.NOTIFY_EMAIL || "").trim();

app.use(express.json({ limit: "1mb" }));

// Serve the Vesper website
app.use(express.static(__dirname));


// ========================================
// CONFIGURATION CHECK
// ========================================

if (!resendApiKey) {
    console.log("⚠️ RESEND_API_KEY is missing.");
}

if (!notifyEmail) {
    console.log("⚠️ NOTIFY_EMAIL is missing.");
}


// ========================================
// VESPER HELP REQUEST
// ========================================

app.post("/api/help", async (req, res) => {

    const {
        name,
        age,
        location,
        email,
        grievance
    } = req.body || {};


    // ====================================
    // VALIDATE VISITOR INFORMATION
    // ====================================

    if (
        !name ||
        !age ||
        !location ||
        !email ||
        !grievance
    ) {

        return res.status(400).json({
            success: false,
            error: "Missing required information"
        });

    }


    // ====================================
    // CHECK EMAIL CONFIGURATION
    // ====================================

    if (!resendApiKey) {

        return res.status(500).json({
            success: false,
            error: "Email service is not configured"
        });

    }


    if (!notifyEmail) {

        return res.status(500).json({
            success: false,
            error: "Candidate notification email is not configured"
        });

    }


    // ====================================
    // DATE & TIME
    // ====================================

    const dateTime = new Date().toLocaleString(
        "en-IN",
        {
            timeZone: "Asia/Kolkata"
        }
    );


    // ====================================
    // EMAIL CONTENT
    // ====================================

    const html = `

        <div style="
            font-family: Arial, sans-serif;
            max-width: 700px;
            margin: auto;
            padding: 30px;
            background: #07111c;
            color: #eeeeee;
            border-radius: 12px;
        ">

            <h1 style="
                color: #d7b56b;
                margin-bottom: 5px;
            ">
                VESPER
            </h1>

            <p style="
                color: #9aa9b5;
                font-size: 16px;
            ">
                Lighthouse Guardian — Help Request
            </p>


            <hr style="
                border: 0;
                border-top: 1px solid #293744;
                margin: 25px 0;
            ">


            <h2 style="
                color: #d7b56b;
            ">
                🦸 Someone Needs Your Help!
            </h2>


            <p>
                Someone has submitted a request through
                the Vesper Superhero Help Portal.
            </p>


            <h2 style="
                color: #d7b56b;
            ">
                Visitor Details
            </h2>


            <p>
                <strong>Name:</strong>
                ${escapeHtml(name)}
            </p>


            <p>
                <strong>Age:</strong>
                ${escapeHtml(String(age))}
            </p>


            <p>
                <strong>Location:</strong>
                ${escapeHtml(location)}
            </p>


            <p>
                <strong>Email:</strong>
                ${escapeHtml(email)}
            </p>


            <p>
                <strong>Date & Time:</strong>
                ${escapeHtml(dateTime)}
            </p>


            <hr style="
                border: 0;
                border-top: 1px solid #293744;
                margin: 25px 0;
            ">


            <h2 style="
                color: #d7b56b;
            ">
                Grievance / Request
            </h2>


            <div style="
                background: #101d29;
                padding: 20px;
                border-radius: 8px;
                line-height: 1.7;
                white-space: pre-wrap;
            ">

                ${escapeHtml(grievance)}

            </div>


            <p style="
                margin-top: 30px;
                color: #71808c;
                font-size: 12px;
            ">
                This message was automatically generated
                by the Vesper Superhero Help Portal.
            </p>

        </div>

    `;


    // ====================================
    // SEND TO CANDIDATE'S EMAIL
    // ====================================

    try {

        const response = await fetch(
            "https://api.resend.com/emails",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${resendApiKey}`
                },

                body: JSON.stringify({

                    // Resend sender
                    from: "Vesper Help Portal <onboarding@resend.dev>",

                    // IMPORTANT:
                    // Notification goes to YOU,
                    // the candidate.
                    to: [notifyEmail],

                    // Visitor's email is NOT the recipient.
                    // It is used for replying to the visitor.
                    reply_to: email,

                    subject: "🦸 Someone Needs Your Help!",

                    html: html

                })
            }
        );


        const result = await response.json();


        // ====================================
        // RESEND ERROR
        // ====================================

        if (!response.ok) {

            console.log("");
            console.log("❌ RESEND EMAIL FAILED");
            console.log(result);
            console.log("");

            return res.status(500).json({

                success: false,

                error:
                    result.message ||
                    "Email notification failed"

            });

        }


        // ====================================
        // SUCCESS
        // ====================================

        console.log("");
        console.log("====================================");
        console.log("✅ VESPER REQUEST SENT");
        console.log("====================================");

        console.log("Visitor Name:", name);
        console.log("Visitor Age:", age);
        console.log("Visitor Location:", location);
        console.log("Visitor Email:", email);
        console.log("Request:", grievance);

        console.log("Notification sent to:", notifyEmail);
        console.log("Resend ID:", result.id);

        console.log("====================================");
        console.log("");


        return res.json({

            success: true,

            message:
                "Your request has been sent to Vesper."

        });


    } catch (error) {

        console.log("");
        console.log("❌ EMAIL SENDING FAILED");
        console.log(error.message);
        console.log("");

        return res.status(500).json({

            success: false,

            error: "Email notification failed"

        });

    }

});


// ========================================
// SECURITY
// ========================================

function escapeHtml(value) {

    return String(value).replace(
        /[&<>"']/g,
        character => ({

            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"

        }[character])
    );

}


// ========================================
// START SERVER
// ========================================

app.listen(PORT, "0.0.0.0", () => {

    console.log("");
    console.log("====================================");
    console.log("🌙 VESPER PORTAL");
    console.log("====================================");
    console.log(`🚀 Server running on port ${PORT}`);
    console.log("📧 Notification email:", notifyEmail);
    console.log("====================================");
    console.log("");

});