const { app, handleEvent } = require("./app");
const axios = require("axios");
app.listen(4002, async () => {
  console.log("Query Listening on :  4002");
  setTimeout(async function () {
    console.log("Query Checking for any missed events");
    try {
      const res = await axios.get(
        "http://eventbus-srv:4005/failedEvents/query"
      );

      for (let event of res.data) {
        handleEvent(event.type, event.data);
      }
    } catch (error) {
      console.log(error.message);
    }
  }, 7000);
});
