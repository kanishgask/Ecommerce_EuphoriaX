exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Service is initializing. Code has not been deployed yet." }),
    };
};
