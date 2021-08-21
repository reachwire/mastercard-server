const forge = require('node-forge');
const fs = require('fs');

function retrieveKey(filePath, keyPassword, keyAlias) {
    // Retrieves signing key from certificate
    const p12Content = fs.readFileSync(filePath, 'binary');
    const p12Asn1 = forge.asn1.fromDer(p12Content, false);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, keyPassword);
    const keyObj = p12.getBags({
        friendlyName: keyAlias,
        bagType: forge.pki.oids.pkcs8ShroudedKeyBag
    }).friendlyName[0];

    // Returns signing key
    return forge.pki.privateKeyToPem(keyObj.key);
}

module.exports = {retrieveKey}