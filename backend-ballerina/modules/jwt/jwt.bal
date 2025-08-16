import ballerina/crypto;
import ballerina/time;
import ballerina/regex;
import ballerina/mime;
import backend_ballerina.models;

// Configuration
configurable string jwtSecret = "your-super-secret-jwt-key-change-this-in-production";

// Generate JWT token
public function generateToken(models:User user) returns string|error {
    time:Utc currentTime = time:utcNow();
    int currentTimestamp = <int>currentTime[0];
    int expiryTime = currentTimestamp + 3600; // 1 hour
    
    string headerStr = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
    string payloadStr = string `{"iss":"ballerina-auth-server","sub":"${user.username}","aud":["ballerina-users"],"exp":${expiryTime},"iat":${currentTimestamp},"user_id":${user.id},"email":"${user.email}"}`;
    
    // Base64URL encode header and payload
    byte[] headerBytes = headerStr.toBytes();
    byte[] payloadBytes = payloadStr.toBytes();
    
    string headerB64 = headerBytes.toBase64();
    string payloadB64 = payloadBytes.toBase64();
    
    // Make URL safe
    headerB64 = makeUrlSafe(headerB64);
    payloadB64 = makeUrlSafe(payloadB64);
    
    string unsigned = headerB64 + "." + payloadB64;
    
    // Create signature using HMAC SHA256
    byte[]|error signatureBytes = crypto:hmacSha256(unsigned.toBytes(), jwtSecret.toBytes());
    if signatureBytes is error {
        return signatureBytes;
    }
    
    string signature = signatureBytes.toBase64();
    signature = makeUrlSafe(signature);
    
    return unsigned + "." + signature;
}

// Validate JWT token
public function validateToken(string token) returns models:JwtPayload|error {
    // Split the token
    string[] parts = regex:split(token, "\\.");
    if parts.length() != 3 {
        return error("Invalid token format");
    }
    
    // Verify signature
    string unsigned = parts[0] + "." + parts[1];
    byte[]|error expectedSigBytes = crypto:hmacSha256(unsigned.toBytes(), jwtSecret.toBytes());
    if expectedSigBytes is error {
        return error("Signature verification failed");
    }
    
    string expectedSig = expectedSigBytes.toBase64();
    expectedSig = makeUrlSafe(expectedSig);
    
    if expectedSig != parts[2] {
        return error("Invalid signature");
    }
    
    // Decode payload
    string payloadB64 = parts[1];
    payloadB64 = addPadding(payloadB64);
    payloadB64 = makeBase64Standard(payloadB64);
    
    byte[]|mime:DecodeError payloadBytes = mime:base64DecodeBlob(payloadB64.toBytes());
    if payloadBytes is mime:DecodeError {
        return error("Invalid payload encoding");
    }
    
    string|error payloadStr = string:fromBytes(payloadBytes);
    if payloadStr is error {
        return error("Invalid payload string conversion");
    }
    
    json|error payloadJson = payloadStr.fromJsonString();
    if payloadJson is error {
        return error("Invalid payload JSON");
    }
    
    // Extract fields
    map<json> payloadMap = <map<json>>payloadJson;
    
    string? iss = <string?>payloadMap["iss"];
    string? sub = <string?>payloadMap["sub"];
    json? audJson = payloadMap["aud"];
    int? exp = <int?>payloadMap["exp"];
    int? iat = <int?>payloadMap["iat"];
    int? user_id = <int?>payloadMap["user_id"];
    string? email = <string?>payloadMap["email"];
    
    // Create aud array
    string[] audArray = [];
    if audJson is json[] {
        foreach json item in audJson {
            if item is string {
                audArray.push(item);
            }
        }
    }
    
    models:JwtPayload payload = {
        iss: iss ?: "",
        sub: sub ?: "",
        aud: audArray,
        exp: exp ?: 0,
        iat: iat ?: 0,
        user_id: user_id,
        email: email
    };
    
    // Verify expiration
    time:Utc currentTime = time:utcNow();
    int currentTimestamp = <int>currentTime[0];
    
    if payload.exp > 0 && payload.exp < currentTimestamp {
        return error("Token expired");
    }
    
    return payload;
}

// Helper function to make Base64 URL safe
function makeUrlSafe(string base64Str) returns string {
    string result = regex:replaceAll(base64Str, "=", "");
    result = regex:replaceAll(result, "\\+", "-");
    result = regex:replaceAll(result, "/", "_");
    return result;
}

// Helper function to add padding
function addPadding(string base64Str) returns string {
    int padding = 4 - (base64Str.length() % 4);
    if padding < 4 {
        int i = 0;
        string result = base64Str;
        while i < padding {
            result = result + "=";
            i += 1;
        }
        return result;
    }
    return base64Str;
}

// Helper function to make Base64 standard
function makeBase64Standard(string urlSafeBase64) returns string {
    string result = regex:replaceAll(urlSafeBase64, "-", "\\+");
    result = regex:replaceAll(result, "_", "/");
    return result;
}