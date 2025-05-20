<?php
// Test email configuration
$to = 'romanvolkonidov@gmail.com';
$subject = 'Test Email from Ubora Website';
$message = 'This is a test email to verify the email system is working. If you receive this, the email notifications are configured correctly.';

$headers = array(
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: Website Contact <info@uboraservices.co.ke>',
    'Reply-To: info@uboraservices.co.ke',
    'X-Mailer: PHP/' . phpversion(),
    'Priority: high'
);

try {
    if (mail($to, $subject, $message, implode("\r\n", $headers))) {
        echo "Test email sent successfully\n";
    } else {
        echo "Failed to send test email\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

