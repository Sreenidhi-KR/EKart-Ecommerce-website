/** @format */

const app = require("./app");
const axios = require("axios");

app.listen(4001, async () => {
  console.log("Reviews Listening on 4001");
  try {
    const res = await axios.get(
      "http://eventbus-srv:4005/failedEvents/reviews"
    );

    for (let event of res.data) {
      handleEvent(event.type, event.data);
    }
  } catch (error) {
    console.log(error.message);
  }
});
