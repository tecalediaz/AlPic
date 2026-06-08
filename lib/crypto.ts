import { createHash } from "crypto";

export function hashCode(code: string): string {
  return createHash("sha256")
    .update(code.trim().toLowerCase())
    .digest("hex");
}
