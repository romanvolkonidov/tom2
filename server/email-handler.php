<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method Not Allowed');
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$type = $data['type'] ?? '';
$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$phone = $data['phone'] ?? '';
$message = $data['message'] ?? '';
$service = $data['service'] ?? '';

// Basic validation
if (!$name || !$email || !$message) {
    http_response_code(400);
    exit(json_encode(['success' => false, 'error' => 'Missing required fields']));
}

// Email configuration
$to = 'info@uboraservices.co.ke'; // Business email
$subject = ($type === 'quote') ? "New Quote Request from $name" : "New Contact Message from $name";

// Create email body
$body = "
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; }
    </style>
</head>
<body>
    <div class='container'>
        <h2>$subject</h2>
        <div class='field'>
            <span class='label'>Name:</span> $name
        </div>
        <div class='field'>
            <span class='label'>Email:</span> $email
        </div>
        " . ($phone ? "<div class='field'>
            <span class='label'>Phone:</span> $phone
        </div>" : "") . "
        " . ($service ? "<div class='field'>
            <span class='label'>Service:</span> $service
        </div>" : "") . "
        <div class='field'>
            <span class='label'>Message:</span><br>
            " . nl2br(htmlspecialchars($message)) . "
        </div>
    </div>
</body>
</html>";

// Email headers
$headers = array(
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: Website Contact <info@uboraservices.co.ke>',
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion(),
    'Priority: high'
);

// Try to send email
try {
    if (mail($to, $subject, $body, implode("\r\n", $headers))) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Message sent successfully']);
    } else {
        throw new Exception('Failed to send email');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
