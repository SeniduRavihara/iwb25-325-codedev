import ballerina/http;

service / on new http:Listener(8080) {

    resource function get hello() returns json {
        return {
            "message": "Welcome to Hackathon Platform!",
            "version": "1.0.0",
            "endpoints": {
                "submit": "POST /api/submit",
                "health": "GET /api/health"}
        };
    }

}
