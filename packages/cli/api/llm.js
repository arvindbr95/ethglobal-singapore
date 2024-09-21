const axios = require("axios");

const handleLlm = async (code, toml) => {
    const link = `https://wapo-testnet.phala.network/ipfs/QmY6bt9deefmyt4uroPxyXas94W2yX5QMjqrqTZVYLmLZt`;
    // console.log("resolved url=", link);

    return axios
        .post(link, {
            code: code,
            toml: toml,
        })
        .then((response) => response.data);
};

module.exports = {
    handleLlm,
};
