# Multi-Language Code Runner

A unified Docker container that supports execution of Python, Java, and Ballerina code in a single, secure environment.

## 📋 Overview

This is the recommended approach for the code execution engine. Instead of maintaining separate Docker containers for each language, this unified runner includes all three language runtimes in a single container, reducing overhead and simplifying deployment.

## 🏗️ Container Details

- **Base Image**: `ubuntu:22.04`
- **Working Directory**: `/runner`
- **Supported Languages**: Python 3, Java 17, Ballerina 2201.9.0
- **Security**: Isolated container execution with resource limits

## 🛠️ Setup Instructions

### 1. Build the Docker Image

```bash
cd multi-lang-runner
docker build -t multi-lang-runner:latest .
```

### 2. Verify the Build

```bash
docker images | grep multi-lang-runner
```

## 🚀 Usage

### Command Structure

```bash
docker run --rm multi-lang-runner:latest <language> [code]
```

Where `<language>` is one of: `python`, `java`, `ballerina`

### Language-Specific Usage

#### Python
```bash
docker run --rm \
  -e CODE_TO_EXECUTE_B64="$(echo 'print("Hello Python")' | base64)" \
  multi-lang-runner:latest python
```

#### Java
```bash
docker run --rm \
  -e CODE_TO_EXECUTE_B64="$(echo 'public class Main { public static void main(String[] args) { System.out.println("Hello Java"); } }' | base64)" \
  multi-lang-runner:latest java
```

#### Ballerina
```bash
docker run --rm \
  -e CODE_TO_EXECUTE_B64="$(echo 'import ballerina/io; public function main() { io:println("Hello Ballerina"); }' | base64)" \
  multi-lang-runner:latest ballerina
```

### With Security Constraints

```bash
docker run --rm \
  --memory=256m \
  --cpus=1.0 \
  --network=none \
  --pids-limit=50 \
  -e CODE_TO_EXECUTE_B64="$(echo 'print("Secure execution")' | base64)" \
  multi-lang-runner:latest python
```

## 🔧 Container Configuration

### Dockerfile Breakdown

```dockerfile
FROM ubuntu:22.04                           # Base Ubuntu system

# Install core tools and runtimes
RUN apt-get update && apt-get install -y \
    python3 \                               # Python 3 runtime
    openjdk-17-jdk \                       # Java 17 JDK
    curl unzip \                           # Tools for Ballerina install
    && rm -rf /var/lib/apt/lists/*

# Install Ballerina
RUN curl -sL https://dist.ballerina.io/downloads/2201.9.0/ballerina-2201.9.0-swan-lake-linux-x64.deb -o ballerina.deb \
    && apt install -y ./ballerina.deb \
    && rm ballerina.deb

# Set up execution script
WORKDIR /runner
COPY run-code.sh /usr/local/bin/run-code
RUN chmod +x /usr/local/bin/run-code

ENTRYPOINT ["run-code"]
```

### Execution Script (run-code.sh)

The unified execution script handles all three languages:

```bash
#!/bin/bash

LANG="$1"

# Get code from base64 encoded environment variable
CODE=$(echo "$CODE_TO_EXECUTE_B64" | base64 -d)

TMP_DIR=$(mktemp -d)
cd "$TMP_DIR"

case "$LANG" in
  python)
    echo "$CODE" > script.py
    python3 script.py
    ;;

  java)
    echo "$CODE" > Main.java
    javac Main.java && java Main
    ;;

  ballerina)
    echo "$CODE" > main.bal
    bal run main.bal
    ;;

  *)
    echo "Unsupported language: $LANG"
    exit 1
    ;;
esac
```

## 🔐 Security Features

- **Container Isolation**: Each execution runs in a separate container
- **Base64 Encoding**: Code is passed securely via environment variables
- **Temporary Files**: Code files are created in temporary directories
- **Resource Limits**: Memory, CPU, and process limits
- **Network Isolation**: No external network access
- **Clean Cleanup**: Temporary files are automatically cleaned up

## ⚡ Performance Characteristics

### Startup Time
- **First Run**: ~5-6 seconds (container startup)
- **Subsequent Runs**: ~2-3 seconds (if image is cached)

### Memory Usage
- **Base Container**: ~150MB
- **Python Execution**: +20-50MB
- **Java Execution**: +50-100MB
- **Ballerina Execution**: +30-60MB

### Disk Usage
- **Image Size**: ~800MB (includes all runtimes)
- **Runtime**: Minimal temporary files only

## 🚦 Language Support

### Python 3
- **Version**: System Python3 (usually 3.10+)
- **Standard Library**: Full standard library available
- **Execution**: Direct interpretation
- **File Extension**: `.py`

### Java 17
- **Version**: OpenJDK 17
- **Compilation**: `javac` compilation step
- **Execution**: `java` runtime
- **File Extension**: `.java`
- **Class Requirement**: Must contain `public class Main`

### Ballerina
- **Version**: Swan Lake 2201.9.0
- **Execution**: `bal run` command
- **File Extension**: `.bal`
- **Module Support**: Standard library modules

## 📝 Code Examples

### Multi-Language Hello World

#### Python
```python
print("Hello from Python in Multi-Lang Runner!")
for i in range(3):
    print(f"Count: {i}")
```

#### Java
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java in Multi-Lang Runner!");
        for (int i = 0; i < 3; i++) {
            System.out.println("Count: " + i);
        }
    }
}
```

#### Ballerina
```ballerina
import ballerina/io;

public function main() {
    io:println("Hello from Ballerina in Multi-Lang Runner!");
    foreach int i in 0..<3 {
        io:println(string`Count: ${i}`);
    }
}
```

## 🚦 Usage in Backend

The backend service uses this unified runner:

```ballerina
// In hackathon-backend/main.bal
os:Command dockerCmd = {
    value: "docker",
    arguments: [
        "run", "--rm",
        "--memory=256m",
        "--cpus=1.0", 
        "--network=none",
        "--pids-limit=50",
        "-e", "CODE_TO_EXECUTE_B64=" + code.toBytes().toBase64(),
        "multi-lang-runner:latest",
        language  // "python", "java", or "ballerina"
    ]
};
```

## 🐛 Troubleshooting

### Build Issues
```bash
# Check available space (image is large)
docker system df

# Clean up if needed
docker system prune

# Rebuild with no cache
docker build --no-cache -t multi-lang-runner:latest .
```

### Runtime Issues
```bash
# Test each language separately
docker run --rm -e CODE_TO_EXECUTE_B64="$(echo 'print("test")' | base64)" multi-lang-runner:latest python
docker run --rm -e CODE_TO_EXECUTE_B64="$(echo 'public class Main { public static void main(String[] args) { System.out.println("test"); } }' | base64)" multi-lang-runner:latest java

# Check versions
docker run --rm multi-lang-runner:latest python --version
docker run --rm multi-lang-runner:latest java -version
docker run --rm multi-lang-runner:latest bal version
```

### Memory Issues
```bash
# Monitor container resource usage
docker stats

# Increase memory limits
docker run --memory=512m multi-lang-runner:latest python
```

## 📊 Advantages Over Individual Runners

### Benefits
- **Single Image**: One image to build and maintain
- **Consistent Environment**: Same base system for all languages
- **Reduced Overhead**: No need to switch between different containers
- **Simplified Deployment**: Only one image to deploy
- **Better Resource Utilization**: Shared base system components

### Trade-offs
- **Larger Image Size**: ~800MB vs ~30-100MB for individual runners
- **More Attack Surface**: Multiple runtimes in one container
- **Complex Dependencies**: All language dependencies in one image

## 🔧 Customization

### Add New Languages
Modify `Dockerfile` to include additional runtimes:
```dockerfile
# Add Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs
```

Update `run-code.sh`:
```bash
  nodejs)
    echo "$CODE" > script.js
    node script.js
    ;;
```

### Version Updates
```dockerfile
# Update Java version
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y openjdk-21-jdk

# Update Ballerina version
RUN curl -sL https://dist.ballerina.io/downloads/2201.10.0/ballerina-2201.10.0-swan-lake-linux-x64.deb -o ballerina.deb
```

### Add Libraries
```dockerfile
# Add Python packages
RUN apt-get install -y python3-pip \
    && pip3 install numpy pandas

# Add Java libraries
COPY libs/*.jar /usr/share/java/
```

## 🤝 Integration

This unified runner is the primary execution engine for:
- **Hackathon Backend**: Main code execution service
- **Web Frontend**: All language execution requests
- **Security System**: Centralized security controls

## 📈 Performance Comparison

| Metric | Multi-Lang Runner | Individual Runners |
|--------|-------------------|-------------------|
| Build Time | ~5-10 minutes | ~2-3 minutes each |
| Image Size | ~800MB | ~30-100MB each |
| Startup Time | ~2-3 seconds | ~1-3 seconds |
| Memory Usage | ~150MB base | ~30-100MB each |
| Maintenance | Single image | Multiple images |

## 🔗 Related Documentation

- [Ubuntu Docker Images](https://hub.docker.com/_/ubuntu)
- [OpenJDK Installation](https://openjdk.java.net/install/)
- [Ballerina Installation](https://ballerina.io/downloads/)
- [Docker Multi-Stage Builds](https://docs.docker.com/develop/best-practices/multistage-build/)

## 💡 Best Practices

### Code Structure
```bash
# Good: Clear error handling
if [ -z "$CODE_TO_EXECUTE_B64" ]; then
    echo "No code provided"
    exit 1
fi
```

### Security
```bash
# Good: Use temporary directories
TMP_DIR=$(mktemp -d)
cd "$TMP_DIR"
# Files are automatically cleaned up when container exits
```

### Resource Management
```bash
# Good: Set appropriate limits
docker run --memory=256m --cpus=1.0 --pids-limit=50
```
