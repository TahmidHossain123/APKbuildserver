FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

ENV JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
ENV ANDROID_HOME="/opt/android-sdk"
ENV PATH="${PATH}:${JAVA_HOME}/bin:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/build-tools/34.0.0"

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    wget \
    unzip \
    git \
    ca-certificates \
    gnupg \
    openjdk-17-jdk \
    build-essential \
    file \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY scripts/setup-android-sdk.sh /app/scripts/setup-android-sdk.sh
RUN chmod +x /app/scripts/setup-android-sdk.sh \
    && /app/scripts/setup-android-sdk.sh

RUN java -version \
    && javac -version \
    && sdkmanager --version

COPY package.json ./

RUN npm install --omit=dev

COPY . .

RUN mkdir -p uploads builds build-outputs temp workspaces \
    && chmod -R 777 uploads builds build-outputs temp workspaces

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
