export default {
  providers: [
    {
      domain: `https://api.workos.com/sso/token/${process.env.WORKOS_CLIENT_ID}`,
      applicationID: "convex",
    },
  ],
};
