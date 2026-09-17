require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const gmailUser = (process.env.GMAIL_USER || "").trim();
const gmailAppPassword = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");
const notifyEmail = (process.env.NOTIFY_EMAIL || gmailUser || "").trim();

app.use(express.json({ limit: "1mb" }));

// Serve the Vesper website
app.use(express.static(__dirname));


// ================================
// EMAIL CONFIGURATION
// ================================

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: gmailUser,
        pass: gmailAppPassword
    },
    tls: {
        rejectUnauthorized: false
    }
});


// Check email connection when server starts
transporter.verify((error) => {

    if (error) {

        console.log("❌ EMAIL CONNECTION FAILED");
        console.log(error.message);

    } else {

        console.log("✅ EMAIL SERVER IS READY");

    }

});

if (!gmailUser || !gmailAppPassword) {
    console.log("⚠️  Gmail credentials are not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to .env");
}


// ================================
// VESPER HELP REQUEST
// ================================

app.post("/api/help", async (req, res) => {

    const {
        name,
        age,
        location,
        email,
        grievance
    } = req.body || {};


    // Validate information

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


    const recipient = notifyEmail || email;

    if (!recipient) {

        return res.status(400).json({

            success: false,

            error: "No provider email is configured"

        });

    }


    // Indian date and time

    const dateTime =
        new Date().toLocaleString(
            "en-IN",
            {
                timeZone: "Asia/Kolkata"
            }
        );


    // Email content

    const html = `

        <div style="
            font-family: Arial, sans-serif;
            max-width: 700px;
            margin: auto;
            padding: 25px;
            background: #07111c;
            color: #eeeeee;
        ">

            <h1 style="
                color: #d7b56b;
                margin-bottom: 5px;
            ">
                VESPER
            </h1>

            <p style="
                color: #9aa9b5;
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
                Person Details
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
                ${dateTime}
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


    try {

        await transporter.sendMail({

            from:
                `"Vesper Help Portal" <${gmailUser}>`,

            to: recipient,

            replyTo: email,

            subject:
                "🦸 Vesper Help Request — " + name,

            html: html

        });


        console.log("");
        console.log("====================================");
        console.log("✅ VESPER REQUEST SENT");
        console.log("====================================");

        console.log("Name:", name);
        console.log("Age:", age);
        console.log("Location:", location);
        console.log("Email:", email);
        console.log("Request:", grievance);

        console.log("====================================");
        console.log("");


        res.json({

            success: true

        });


    } catch (error) {

        console.log("");
        console.log("❌ EMAIL SENDING FAILED");
        console.log(error.message);
        console.log("");

        res.status(500).json({

            success: false,

            error: "Email notification failed"

        });

    }

});


// ================================
// SECURITY
// ================================

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


// ================================
// START SERVER
// ================================

app.listen(PORT, () => {

    console.log("");
    console.log("====================================");
    console.log("🌙 VESPER PORTAL");
    console.log("====================================");
    console.log(`🚀 Server running on port ${PORT}`);
    console.log("====================================");
    console.log("");

});