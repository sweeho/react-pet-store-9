# Legacy runtime: Java Pet Store 1.3.2

Starts the legacy application (Sun Java Pet Store 1.3.2: storefront, OPC, supplier, admin)
on the J2EE 1.3.1 Reference Implementation with Java 1.4. The RI bundles Cloudscape (Derby),
JMS and the web container, so there is no separate database service.

## Start

```sh
docker compose -f .vortex/legacy-runtime/compose.yaml up --build -d
```

The build runs the legacy Ant build (`setup.sh core`, then `setup.sh deploy`) inside the
container, so the first start takes several minutes. It is ready when the container is `healthy`.

## URL for the acceptance suite

`http://localhost:8000/petstore/` (storefront). The other applications are at
`/opc`, `/supplier` and `/admin` on the same port. Change the host port with `LEGACY_PORT`.

## Not in the repository

- **Java 1.4 JDK** and **J2EE 1.3.1 SDK (Reference Implementation)**: Sun/Oracle licensed
  downloads, not redistributable. Put them in `.vortex/legacy-runtime/vendor/` (or set
  `LEGACY_VENDOR_DIR`) as `jdk14.tar.gz` (Linux JDK 1.4.2, rename) and `j2sdkee-1_3_1.zip`.
- **Legacy source**: not on `dev`. Compose fetches `legacy-source/` from the
  `vortex/legacy-spec/sx-0001` branch by git URL. For a private repo, or once the source is
  on another branch, set `LEGACY_SOURCE_CONTEXT` to a local `legacy-source` directory or a git URL.
- Ant 1.6.5 is downloaded at build time (the original bundled Ant is not in the source).

## Caveats

Untested here: no Docker daemon or the licensed downloads were available when this was written.
The JDK 1.4 binary is 32-bit (`libc6-i386` is installed), so build on an x86-64 host or enable
emulation. Mail is not configured, so order-completion mail fails harmlessly.
