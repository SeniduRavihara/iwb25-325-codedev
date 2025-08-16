FROM ubuntu:22.04

# Install needed tools (no recommends) and clean up
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    openjdk-17-jdk \
    curl ca-certificates unzip coreutils \
    && rm -rf /var/lib/apt/lists/*

# Install Ballerina (align with backend 2201.12.7)
RUN curl -sL https://dist.ballerina.io/downloads/2201.12.7/ballerina-2201.12.7-swan-lake-linux-x64.deb -o /tmp/ballerina.deb \
    && apt install -y /tmp/ballerina.deb \
    && rm /tmp/ballerina.deb

# Create non-root user
RUN useradd -m -u 10001 runner

# Set up working dir
WORKDIR /runner
COPY run-code.sh /usr/local/bin/run-code
RUN chmod +x /usr/local/bin/run-code

USER runner

ENTRYPOINT ["run-code"]
