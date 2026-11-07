# `sec-0.2` hardening demonstration

All controls below map to Task 1 risks RSK-01 through RSK-05 as listed in `access-tests.md`. This repository session has no authorized Linux VM, Docker runtime, or image scanner. The commands are a repeatable demonstration plan; they have not been executed against a host or image.

## 1. VM SSH hardening and Lynis (RSK-01, RSK-03)

Use an authorized Ubuntu/Debian VM account with a working SSH key. Keep the current SSH session open while testing a second key-authenticated session to avoid locking yourself out. Do not disable password authentication until the key login is confirmed.

Save a baseline audit before applying changes:

```sh
sudo lynis audit system --quick | tee security/lynis-before.txt
```

Install an SSH drop-in, validate it, and reload only after `sshd -t` succeeds:

```sh
sudoedit /etc/ssh/sshd_config.d/60-stokvault-hardening.conf
```

Add these settings to the new drop-in:

```text
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AuthenticationMethods publickey
PermitEmptyPasswords no
MaxAuthTries 3
X11Forwarding no
```

Validate the file before reloading:

```sh
sudo sshd -t
sudo sshd -T | grep -E '^(permitrootlogin|passwordauthentication|kbdinteractiveauthentication|pubkeyauthentication|authenticationmethods) '
sudo systemctl reload ssh
```

Confirm a new key-only login and verify root/password login is refused before closing the original session. Then capture the second audit:

```sh
sudo lynis audit system --quick | tee security/lynis-after.txt
```

Record the actual Lynis hardening index from the output and require at least 70. Preserve raw command output; do not edit an index into the report. Review the audit suggestions and close any remaining high-impact items.

## 2. Container hardening (RSK-01, RSK-03)

`Dockerfile` sets a dedicated unprivileged runtime user and labels the image `sec-0.2`. `compose.yaml` drops all application capabilities, enables `no-new-privileges`, uses a read-only app filesystem, and places app/database services on an internal network. It intentionally contains no `ports:` mapping; `expose: 3000` is internal-only. Reach the app only through an approved reverse proxy attached to that network.

Provide secrets in a local, ignored `.env` file. Set `DATABASE_URL` to `postgresql://<POSTGRES_USER>:<URL_ENCODED_PASSWORD>@db:5432/<POSTGRES_DB>?schema=public`; set `SESSION_SECRET` and `STOKVAULT_SECRET_KEY` to independent random values. Then validate and start the services:

```powershell
docker compose config --quiet
docker compose build --no-cache
docker compose up -d
docker compose ps
docker inspect (docker compose ps -q app) --format '{{.Config.User}}'
docker inspect (docker compose ps -q app) --format '{{json .HostConfig.CapDrop}}'
docker inspect (docker compose ps -q app) --format '{{json .NetworkSettings.Ports}}'
docker inspect (docker compose ps -q db) --format '{{json .NetworkSettings.Ports}}'
```

Expected: app user is non-root; app has all capabilities dropped; app and database have no host-published ports. Check the actual Postgres main process is running as the `postgres` user. A reverse proxy must not publish the app or database ports directly.

## 3. Image scan and SBOM (RSK-02, RSK-05)

Build the unmodified baseline from the Task 1 commit (or the approved pre-hardening image) and the hardened image separately. Record exact image digests, scanner version, date, and raw output:

```powershell
trivy image --severity CRITICAL --format table --output security/image-scan-before.txt <baseline-image>
trivy image --severity CRITICAL --exit-code 1 --format table --output security/image-scan-after.txt <hardened-image>
syft <hardened-image> -o cyclonedx-json > security/sbom.cdx.json
```

The final scan must report zero critical vulnerabilities or document an approved exception with a remediation date. The checked-in `sbom.cdx.json` currently inventories Node dependencies from the lockfile only; replace it with the image-derived output after a real image build.

## 4. Demonstration sequence

1. Run the access/password tests and show the passing matrix in `access-tests.md`.
2. Sign in with each synthetic account; show seller catalog actions succeed, buyer catalog mutations fail, seller delivery locking fails, and buyer role checks pass.
3. Show the SSH effective settings and a successful key-only login, then the actual Lynis before/after indices (target: 70 or higher).
4. Show the app container user, dropped capabilities, and absence of published app/database ports.
5. Show image digests, the before/after critical-vulnerability counts, and the final image-generated SBOM.

Do not represent steps 3–5 as completed until their raw outputs replace the explicit NOT RUN evidence files.
