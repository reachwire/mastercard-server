const forge = require('node-forge');
const fs = require('fs');

function sendPrivateKey(key) {
    return fs.readFileSync(key, 'binary');
}

function retrieveKey(filePath, keyPassword, keyAlias) {
    // Retrieves signing key from a certificate
    const p12Content = fs.readFileSync(filePath, 'binary');
    const p12Asn1 = forge.asn1.fromDer(p12Content);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, keyPassword);
    const keyObj = p12.getBags({
        friendlyName: keyAlias,
        bagType: forge.pki.oids.pkcs8ShroudedKeyBag
    }).friendlyName[0];

    // Returns a signing key
    return forge.pki.privateKeyToPem(keyObj.key);
}

module.exports = {retrieveKey, sendPrivateKey}