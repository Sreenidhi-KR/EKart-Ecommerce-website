const { app, handleEvent } = require("./app");
const axios = require("axios");

app.listen(4003, async () => {
  setTimeout(async function () {
    console.log("Moderation Listening on 4003");
    try {
      const res = await axios.get(
        "http://eventbus-srv:4005/failedEvents/moderation"
      );

      for (let event of res.data) {
        handleEvent(event.type, event.data);
      }
    } catch (error) {
      console.log(error.message);
    }
  }, 7000);
});
