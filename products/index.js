/** @format */

const app = require("./app");
const axios = require("axios");
app.listen(4000, async () => {
  console.log("Products Listening on - 4000");
  try {
    const res = await axios.get(
      "http://eventbus-srv:4005/failedEvents/products"
    );

    for (let event of res.data) {
      handleEvent(event.type, event.data);
    }
  } catch (error) {
    console.log(error.message);
  }
});
