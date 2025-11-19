/**
 * Get the secret key for JWT operations.
 * Encodes the SECRET_KEY environment variable as UTF-8.
 * @returns {Uint8Array} The encoded secret key
 * @throws {Error} If SECRET_KEY is not set
 */
export function getSecretKey() {
  if (!process.env.SECRET_KEY) {
    throw new Error("SECRET_KEY environment variable is not set");
  }
  return new TextEncoder().encode(process.env.SECRET_KEY);
}
