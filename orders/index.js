/** @format */

const { app, handleEvent } = require("./app");
const axios = require("axios");
app.listen(4004, async () => {
  console.log("Orders listening on port 4004");
  try {
    const res = await axios.get("http://eventbus-srv:4005/failedEvents/orders");

    for (let event of res.data) {
      handleEvent(event.type, event.data);
    }
  } catch (error) {
    console.log(error.message);
  }
});
