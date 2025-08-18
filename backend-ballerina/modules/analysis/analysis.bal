import ballerina/regex;

// Function to analyze code complexity and patterns
public function analyzeCode(string code, string language) returns json {
    int linesOfCode = countLines(code);
    int codeLength = code.length();

    json complexity = {};
    json patterns = {};

    match language {
        "python" => {
            complexity = analyzePythonComplexity(code);
            patterns = analyzePythonPatterns(code);
        }
        "java" => {
            complexity = analyzeJavaComplexity(code);
            patterns = analyzeJavaPatterns(code);
        }
        "ballerina" => {
            complexity = analyzeBallerinaComplexity(code);
            patterns = <json>[];
        }
        _ => {
            complexity = {
                "timeComplexity": "O(?)",
                "spaceComplexity": "O(?)",
                "detectedPatterns": <json>[]
            };
            patterns = <json>[];
        }
    }

    return {
        "linesOfCode": linesOfCode,
        "codeLength": codeLength,
        "estimatedComplexity": complexity,
        "patterns": patterns
    };
}

// Count lines of code (excluding empty lines and comments)
public function countLines(string code) returns int {
    string[] lines = regex:split(code, "\n");
    int count = 0;

    foreach string line in lines {
        string trimmed = line.trim();
        if trimmed.length() > 0 && !trimmed.startsWith("#") && !trimmed.startsWith("//") && !trimmed.startsWith("/*") {
            count += 1;
        }
    }

    return count;
}

function analyzePythonComplexity(string code) returns json {
    string timeComplexity = "O(?)";
    string spaceComplexity = "O(?)";
    string[] patterns = [];

    // Basic pattern detection
    if code.includes("for") && regex:matches(code, ".*for.*for.*") {
        patterns.push("nested_loops");
        timeComplexity = "O(n²) - potential nested loops detected";
    } else if code.includes("for") || code.includes("while") {
        patterns.push("single_loop");
        timeComplexity = "O(n) - single loop detected";
    } else {
        timeComplexity = "O(1) - no loops detected";
    }

    if code.includes("[]") || code.includes("list") || code.includes("dict") {
        patterns.push("data_structures");
        spaceComplexity = "O(n) - data structures detected";
    } else {
        spaceComplexity = "O(1) - minimal space usage";
    }

    return {
        "timeComplexity": timeComplexity,
        "spaceComplexity": spaceComplexity,
        "detectedPatterns": <json>patterns
    };
}

function analyzeJavaComplexity(string code) returns json {
    string timeComplexity = "O(?)";
    string spaceComplexity = "O(?)";
    string[] patterns = [];

    // Basic pattern detection for Java
    if code.includes("for") && regex:matches(code, ".*for.*for.*") {
        patterns.push("nested_loops");
        timeComplexity = "O(n²) - potential nested loops detected";
    } else if code.includes("for") || code.includes("while") {
        patterns.push("single_loop");
        timeComplexity = "O(n) - single loop detected";
    } else {
        timeComplexity = "O(1) - no loops detected";
    }

    if code.includes("ArrayList") || code.includes("HashMap") || code.includes("[]") {
        patterns.push("data_structures");
        spaceComplexity = "O(n) - data structures detected";
    } else {
        spaceComplexity = "O(1) - minimal space usage";
    }

    return {
        "timeComplexity": timeComplexity,
        "spaceComplexity": spaceComplexity,
        "detectedPatterns": <json>patterns
    };
}

function analyzePythonPatterns(string code) returns json {
    string[] patterns = [];

    if code.includes("def ") {
        patterns.push("function_definition");
    }
    if code.includes("class ") {
        patterns.push("class_definition");
    }
    if code.includes("import ") {
        patterns.push("imports");
    }
    if code.includes("try:") || code.includes("except:") {
        patterns.push("error_handling");
    }
    if code.includes("lambda ") {
        patterns.push("lambda_functions");
    }

    return <json>patterns;
}

function analyzeJavaPatterns(string code) returns json {
    string[] patterns = [];

    if code.includes("public static void main") {
        patterns.push("main_method");
    }
    if code.includes("class ") {
        patterns.push("class_definition");
    }
    if code.includes("import ") {
        patterns.push("imports");
    }
    if code.includes("try {") || code.includes("catch") {
        patterns.push("error_handling");
    }
    if code.includes("interface ") {
        patterns.push("interface_definition");
    }

    return <json>patterns;
}

function analyzeBallerinaComplexity(string code) returns json {
    string timeComplexity = "O(?)";
    string spaceComplexity = "O(?)";
    string[] patterns = [];

    if code.includes("foreach") && regex:matches(code, ".*foreach.*foreach.*") {
        patterns.push("nested_loops");
        timeComplexity = "O(n²) - potential nested loops detected";
    } else if code.includes("foreach") || code.includes("while") {
        patterns.push("single_loop");
        timeComplexity = "O(n) - single loop detected";
    } else {
        timeComplexity = "O(1) - no loops detected";
    }

    spaceComplexity = "O(?)";

    return {
        "timeComplexity": timeComplexity,
        "spaceComplexity": spaceComplexity,
        "detectedPatterns": <json>patterns
    };
}
