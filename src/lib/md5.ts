import { md5 as nobleMd5 } from "@noble/hashes/legacy.js";
import { bytesToHex } from "@noble/hashes/utils.js";

export function md5(input: string): string {
  return bytesToHex(nobleMd5(input));
}
