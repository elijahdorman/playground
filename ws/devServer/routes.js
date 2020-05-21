var makeRoutes = app => {
  app.get("*", (req, res) => {
    res.send("Hi Simulcast");
  });
};

module.exports = makeRoutes;
