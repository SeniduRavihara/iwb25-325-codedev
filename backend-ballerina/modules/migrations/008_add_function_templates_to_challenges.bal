import ballerina/io;
import ballerina/sql;
import ballerinax/java.jdbc;

// Migration function for adding function_templates and test_cases to challenges table
public function addFunctionTemplatesToChallenges(jdbc:Client dbClient) returns error? {
    io:println("Executing: 008_add_function_templates_to_challenges");

    // Add function_templates column
    sql:ExecutionResult|error result1 = dbClient->execute(`
        ALTER TABLE challenges ADD COLUMN function_templates TEXT
    `);

    if result1 is error {
        return error("Failed to add function_templates column: " + result1.message());
    }

    // Add test_cases column
    sql:ExecutionResult|error result2 = dbClient->execute(`
        ALTER TABLE challenges ADD COLUMN test_cases TEXT
    `);

    if result2 is error {
        return error("Failed to add test_cases column: " + result2.message());
    }

    io:println("✓ Added function_templates and test_cases columns to challenges table");
}
