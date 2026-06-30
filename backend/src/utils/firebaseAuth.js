const jwt = require("jsonwebtoken");
const axios = require("axios");

let publicKeysCache = null;
let cacheExpiry = 0;

/**
 * Fetches Google's public key certificates for Firebase tokens
 * and caches them dynamically for 6 hours.
 */
const getFirebasePublicKeys = async () => {
  if (publicKeysCache && Date.now() < cacheExpiry) {
    return publicKeysCache;
  }

  try {
    const response = await axios.get(
      "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
    );
    publicKeysCache = response.data;
    cacheExpiry = Date.now() + 6 * 60 * 60 * 1000; // 6 hours
    return publicKeysCache;
  } catch (error) {
    throw new Error("Failed to fetch public keys from Google: " + error.message);
  }
};

/**
 * Verifies the Firebase ID token signature and decodes the payload
 */
const verifyFirebaseIdToken = async (idToken) => {
  const decodedHeader = jwt.decode(idToken, { complete: true });
  if (!decodedHeader || !decodedHeader.header || !decodedHeader.header.kid) {
    throw new Error("Invalid token format");
  }

  const kid = decodedHeader.header.kid;
  const publicKeys = await getFirebasePublicKeys();
  const cert = publicKeys[kid];

  if (!cert) {
    throw new Error("Invalid token signature key");
  }

  const projectId = "t-zone-f06ca"; // Firebase project ID

  const decoded = jwt.verify(idToken, cert, {
    algorithms: ["RS256"],
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`,
    clockTolerance: 120, // allow 2 minutes local clock skew
  });

  return decoded;
};

module.exports = {
  verifyFirebaseIdToken,
};
