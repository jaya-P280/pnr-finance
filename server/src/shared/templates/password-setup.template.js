export default function passwordSetupTemplate({

    name,

    username,

    setupLink

}) {

    return ` 

    <!DOCTYPE html>

    <html>

    <head>

        <meta charset="UTF-8">

        <style>

            body{
                margin:0;
                padding:0;
                background:#f4f6f9;
                font-family:Arial, Helvetica, sans-serif;
            }

            .container{
                max-width:600px;
                margin:40px auto;
                background:#ffffff;
                border-radius:10px;
                overflow:hidden;
                box-shadow:0 2px 8px rgba(0,0,0,0.08);
            }

            .header{
                background:#0d6efd;
                color:#ffffff;
                text-align:center;
                padding:25px;
            }

            .content{
                padding:35px;
                color:#333333;
                line-height:1.7;
            }

            .credentials{
                background:#f8f9fa;
                border-left:4px solid #0d6efd;
                padding:15px;
                margin:20px 0;
                border-radius:4px;
            }

            .credentials p{
                margin:8px 0;
            }

            .button{
                display:inline-block;
                background:#0d6efd;
                color:#ffffff !important;
                text-decoration:none;
                padding:14px 28px;
                border-radius:5px;
                font-weight:bold;
                margin:25px 0;
            }

            .footer{
                background:#f8f9fa;
                text-align:center;
                padding:20px;
                font-size:13px;
                color:#666666;
            }

            .warning{
                color:#d9534f;
                font-size:14px;
            }

        </style>

    </head>

    <body>

        <div class="container">

            <div class="header">

                <h2>Welcome to PNRG Finance</h2>

            </div>

            <div class="content">

                <p>Dear <strong>${name}</strong>,</p>

                <p>
                    Your account has been successfully created in the
                    <strong>PNRG Finance Loan Management System</strong>.
                </p>

                <div class="credentials">

                    <p><strong>Username (Email)</strong></p>

                    <p>${username}</p>

                </div>

                <p>
                    To activate your account, please click the button below
                    and create your password.
                </p>

                <p style="text-align:center;">

                    <a
                        href="${setupLink}"
                        class="button"
                    >
                        Create Password
                    </a>

                </p>

                <p>
                    If the button above doesn't work, copy and paste the
                    following URL into your browser:
                </p>

                <p>
                    <a href="${setupLink}">
                        ${setupLink}
                    </a>
                </p>

                <p class="warning">
                    This password setup link will expire in <strong>24 hours</strong>.
                </p>

                <p>
                    If you did not expect this email, please ignore it or
                    contact your system administrator.
                </p>

                <p>

                    Regards,<br>

                    <strong>PNRG Finance Team</strong>

                </p>

            </div>

            <div class="footer">

                © ${new Date().getFullYear()} PNRG Finance. All rights reserved.

            </div>

        </div>

    </body>

    </html>

    `;

}