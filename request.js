const fetch = require("node-fetch");

async function request(uri, params = {}) {
    // Performs a request and waiting for response
    const response = await fetch(uri, params);

    // Valid request has only 200 status in MasterCard
    if (response.status === 200) {
        return await response.json();
    }

    // Defines error message text store for throwing
    let errorMessage = '';

    // MasterCard API returns XML or JSON in errors unpredictable, even if FORMAT=JSON is set (headers and query param).
    // To handle that I use try-catch, because JSON.parse fails when sees XML
    // When XML response, app tries to retrieve description of error from XML response, converted to a string
    const responseText = await response.text()
        .then(text => {
            try {
                const data = JSON.parse(JSON.parse(JSON.stringify(text.toString())));
                const reasonCode = data.Errors.Error[0]['ReasonCode'];
                const reasonDescription = data.Errors.Error[0]['Description'];
                errorMessage = reasonCode + ': ' + reasonDescription + '.';
            } catch (error) {
                const descriptionContainerOpen = '<Description>';
                const descriptionContainerClosed = '</Description>';

                const isXml = text.includes(descriptionContainerOpen);

                if(isXml) {
                    const errorStart = text.indexOf(descriptionContainerOpen);
                    const errorEnd = text.indexOf(descriptionContainerClosed);

                    const errorMessage = text.substring(errorStart + descriptionContainerOpen.length, errorEnd);

                    throw new Error(errorMessage);
                }
            }
        })

    // Throws error with retrieved description
    throw new Error(errorMessage);
}

function hasBodyData(request) {
    if (request.body.data) {
        return JSON.parse(JSON.stringify(request.body.data));
    }

    return null;
}

function retrieve(request) {
    return {
        privateKey: request.files.privateKey, // p12 file
        keyPassword: request.body.password, // password for p12 file
        keyAlias: request.body.keyAlias, // alias for key
        bodyData: hasBodyData(request), // object "data" to resend
        consumerKey: request.header('consumerkey'), // consumer key,
        mode: request.query.mode // server mode type
    }
}

module.exports = {request, retrieve}