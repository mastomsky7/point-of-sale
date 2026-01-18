<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $reportType }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 30px 20px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #2d3748;
        }
        .info-box {
            background: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box h3 {
            margin: 0 0 10px;
            font-size: 14px;
            color: #4a5568;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-box p {
            margin: 5px 0;
            font-size: 14px;
            color: #2d3748;
        }
        .summary {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .summary h3 {
            margin: 0 0 15px;
            font-size: 16px;
            color: #2d3748;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f7fafc;
        }
        .summary-item:last-child {
            border-bottom: none;
        }
        .summary-label {
            color: #718096;
            font-size: 14px;
        }
        .summary-value {
            color: #2d3748;
            font-weight: 600;
            font-size: 14px;
        }
        .attachments {
            background: #f7fafc;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .attachments h3 {
            margin: 0 0 15px;
            font-size: 14px;
            color: #4a5568;
            text-transform: uppercase;
        }
        .attachment-item {
            display: flex;
            align-items: center;
            padding: 10px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        .attachment-icon {
            width: 40px;
            height: 40px;
            background: #667eea;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            color: white;
            font-weight: bold;
        }
        .attachment-info p {
            margin: 0;
            font-size: 14px;
            color: #2d3748;
        }
        .footer {
            background: #2d3748;
            color: #cbd5e0;
            padding: 20px;
            text-align: center;
            font-size: 12px;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        .note {
            background: #fef5e7;
            border-left: 4px solid #f39c12;
            padding: 15px;
            margin: 20px 0;
            font-size: 13px;
            color: #856404;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ $reportType }}</h1>
            <p>{{ $scheduleName }}</p>
        </div>

        <div class="content">
            <div class="greeting">
                <p>Hello,</p>
                <p>Your scheduled {{ strtolower($reportType) }} has been generated successfully.</p>
            </div>

            <div class="info-box">
                <h3>Report Details</h3>
                <p><strong>Report Type:</strong> {{ $reportType }}</p>
                <p><strong>Frequency:</strong> {{ $frequency }}</p>
                <p><strong>Generated:</strong> {{ $generatedAt }}</p>
                <p><strong>Total Records:</strong> {{ number_format($recordCount) }}</p>
            </div>

            @if(!empty($summary))
            <div class="summary">
                <h3>Summary</h3>
                @foreach($summary as $label => $value)
                <div class="summary-item">
                    <span class="summary-label">{{ $label }}</span>
                    <span class="summary-value">{{ $value }}</span>
                </div>
                @endforeach
            </div>
            @endif

            <div class="attachments">
                <h3>Attachments</h3>
                <p style="margin: 0 0 15px; color: #718096; font-size: 13px;">
                    The complete report is attached to this email. Please download the attachment(s) to view the full details.
                </p>
                <div class="attachment-item">
                    <div class="attachment-icon">📊</div>
                    <div class="attachment-info">
                        <p><strong>Report Files</strong></p>
                        <p style="color: #718096; font-size: 12px;">PDF and/or Excel format</p>
                    </div>
                </div>
            </div>

            <div class="note">
                <strong>Note:</strong> This is an automated email sent by your scheduled report system.
                The report contains data based on your configured filters and date ranges.
            </div>
        </div>

        <div class="footer">
            <p><strong>Point of Sales System</strong></p>
            <p>Enterprise Reporting Module</p>
            <p style="margin-top: 15px;">
                This is an automated message. Please do not reply to this email.
            </p>
            <p style="margin-top: 10px; color: #718096;">
                &copy; {{ date('Y') }} Point of Sales. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
