const getHeaders = () => {
  const accessToken = JSON.parse(localStorage.getItem("user")).accessToken;

  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    // Add other headers here if necessary
  };
};

export default getHeaders;
