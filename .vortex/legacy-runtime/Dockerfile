# JDK 1.4 and the J2EE 1.3.1 RI are licensed downloads: they come from the `vendor` context.
FROM debian:bullseye-slim
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates unzip libc6-i386 \
    && rm -rf /var/lib/apt/lists/*
# Ant 1.6.5 is the last Ant that runs on Java 1.4 (the bundled Ant 1.4.1 is not in the repository).
RUN curl -fsSL https://archive.apache.org/dist/ant/binaries/apache-ant-1.6.5-bin.tar.gz | tar -xz -C /opt
COPY --from=vendor / /vendor/
RUN mkdir -p /opt/java /opt/j2ee \
    && tar -xzf /vendor/jdk14.tar.gz -C /opt/java --strip-components=1 \
    && unzip -q /vendor/j2sdkee-1_3_1.zip -d /opt/j2ee-unzip \
    && mv /opt/j2ee-unzip/*/* /opt/j2ee/ && chmod +x /opt/j2ee/bin/* /opt/java/bin/*
COPY --from=legacy-source / /petstore/
COPY entrypoint.sh /entrypoint.sh
ENV JAVA_HOME=/opt/java J2EE_HOME=/opt/j2ee PATH=/opt/java/bin:/opt/j2ee/bin:$PATH
EXPOSE 8000
ENTRYPOINT ["sh", "/entrypoint.sh"]
