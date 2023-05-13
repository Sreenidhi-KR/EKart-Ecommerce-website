import jwt_decode from "jwt-decode";
import axios from "axios";

const getHeaders = async (navigate, auth) => {
  let token = JSON.parse(localStorage.getItem("user")).accessToken;

  if (token) {
    const decodedToken = jwt_decode(token);

    if (decodedToken.exp < Date.now() / 1000) {
      console.log("Token Expired");
      try {
        const refreshToken = JSON.parse(
          localStorage.getItem("user")
        ).refreshToken;
        const res = await axios.post("http://ekart.com/auth/new-token", {
          refreshToken,
        });
        let user = JSON.parse(localStorage.getItem("user"));
        user.accessToken = res.data.accessToken;
        localStorage.setItem("user", JSON.stringify(user));
        token = res.data.accessToken;
      } catch (err) {
        console.log("refresh token expired");
        auth.logout();
        navigate("/user-login");
      }
    }
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    // Add other headers here if necessary
  };
};

export default getHeaders;
