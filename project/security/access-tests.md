# Access control and password evidence (`sec-0.2`)

## Risk mapping

| Control | Task 1 risk IDs | Enforcement |
|---|---|---|
| Signed session identity and role gates | RSK-01, RSK-03 | `src/lib/session.ts`, `src/lib/access-control.ts` |
| Transaction integrity signatures | RSK-02, RSK-05 | `src/utils/crypto.ts`, `src/actions/transactions.ts` |
| Server-side payload validation | RSK-04 | Zod schemas and server actions |
| Non-root containers, reduced capabilities, private service network | RSK-01, RSK-03 | `Dockerfile`, `compose.yaml` |
| VM SSH and Lynis procedure | RSK-01, RSK-03 | `security/hardening-demo.md` |
| Image vulnerability scan and SBOM | RSK-02, RSK-05 | Evidence outputs listed below |

## Role access matrix

`listProducts` is deliberately readable before login to render the public partner catalog. Changes and delivery locking are server actions, not just disabled UI controls.

| Account state / role | Read product catalog | Create/update/delete catalog | Lock delivery |
|---|---:|---:|---:|
| Signed out | Allow (public catalog only) | Deny | Deny |
| Seller | Allow | Allow | Deny |
| Grand Hyatt buyer | Allow | Deny | Allow for buyer role |
| Ayana buyer | Allow | Deny | Allow for buyer role |

The automated matrix test covers every role/operation combination, including signed-out access. The delivery action resolves the account through the HMAC-verified session; it does not infer a user from a substring in the cookie. Catalog mutations require the seller role.

### Results

| Test | Account | Attempt | Expected | Result |
|---|---|---|---|---|
| AC-01 | Signed out | Manage catalog | Denied | PASS |
| AC-02 | Signed out | Lock delivery | Denied | PASS |
| AC-03 | Seller | Manage catalog | Allowed | PASS |
| AC-04 | Seller | Lock delivery | Denied | PASS |
| AC-05 | Grand Hyatt buyer | Manage catalog | Denied | PASS |
| AC-06 | Grand Hyatt buyer | Lock delivery role gate | Allowed | PASS |
| AC-07 | Ayana buyer | Manage catalog | Denied | PASS |
| AC-08 | Ayana buyer | Lock delivery role gate | Allowed | PASS |
| AC-09 | Buyer without a hotel workspace | Lock delivery | Denied | PASS |

The catalog action tests invoke create/update/delete for each buyer account and for a signed-out request; all are denied before a database lookup. The delivery-action tests deny signed-out and Seller requests before signing. These are synthetic local demo accounts, not tests against a deployed identity provider or production database.

**Known authorization boundary:** transaction records are still held in client-side demo state rather than persisted server-side. The lock action can authenticate a buyer role and use the buyer's session identity, but it cannot verify that an arbitrary transaction ID belongs to that buyer's hotel. Cross-hotel object ownership is therefore **not proven** and must not be presented as complete RSK-01/RSK-03 mitigation. Persist transactions and check `transaction.hotelId === sessionUser.hotelId` atomically before claiming tenant isolation.

## Slow password hash proof

Demo account password verifiers use Node.js `scrypt` with `N=16384`, `r=8`, `p=1`, a random 16-byte per-account salt, and a 64-byte derived key. Verification uses `timingSafeEqual`; the password itself is not part of the account fixture. The local demo test password is synthetic and is not a real user's credential.

Proof is automated by `src/lib/password.test.ts`: it checks the encoded scrypt parameters and lengths, successfully verifies the synthetic demo password for all three account hashes, rejects a wrong password, and rejects malformed/fast-hash encodings. No production password, user record, salt, or hash is included in this report.

> The current app uses in-memory demo identities; it does not yet authenticate persisted `User.passwordHash` records. Do not use these demo hashes as production account provisioning.

## Reproduction

From the application directory:

```powershell
npm test
npm run check
npm run build
```

Latest local validation: `npm test` passed (12 test files, 62 tests); `npm run check` passed; `npm run db:generate` passed; the Next.js standalone production build passed. Compose YAML syntax and the absence of host port mappings were checked locally, but Docker runtime behavior was not.

## Evidence status

| Requested evidence | File | Status |
|---|---|---|
| Role access tests | This file and automated tests | PASS locally |
| Lynis before/after score | `lynis-before.txt`, `lynis-after.txt` | NOT RUN: no authorized Linux VM available |
| Image scan before/after | `image-scan-before.txt`, `image-scan-after.txt` | NOT RUN: no Docker/Podman or scanner available |
| CycloneDX SBOM | `sbom.cdx.json` | Source dependency SBOM only; not a final container-image SBOM |

The explicit status files are blockers, not scan results. Do not claim a Lynis index, a clean final image, or completed VM hardening until the procedures in `security/hardening-demo.md` have been run on the target.
