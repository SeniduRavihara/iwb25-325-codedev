import ballerina/http;

service / on new http:Listener(8080) {

    resource function get hello() returns string {
        return "Hello from Ballerina backend 👋";
    }

    resource function post echo(http:Caller caller, http:Request req) returns error? {
        string|error payload = req.getTextPayload();
        if payload is string {
            check caller->respond("You sent: " + payload);
        }
    }
}
