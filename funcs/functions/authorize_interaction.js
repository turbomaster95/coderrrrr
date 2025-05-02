exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/jrd+json"
    },
    body: "ok"
  };
};
