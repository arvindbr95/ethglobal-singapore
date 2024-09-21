const axios = require("axios");

const preprocessDataRequest = async (
    smartContractId,
    ownerWalletId,
    reportContent,
    verified
) => {
    const link = `http://localhost:3001/report`;
    // console.log("resolved url=", link);

    return axios
        .post(link, {
            smartContractId,
            ownerWalletId,
            reportContent,
            verified,
        })
        .then((response) => response.data);
};

module.exports = {
    preprocessDataRequest,
};
