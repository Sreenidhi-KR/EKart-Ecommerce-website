import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Utils/auth_context";

export const Login = () => {
  const [user, setUser] = useState("");
  const [register, setRegister] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  let redirectPath = "/";
  const [password, setPassword] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    const credentials = {
      userName: user,
      password,
    };

    const userInfo = await auth.login(credentials);
    if (userInfo?.isSeller) {
      redirectPath = "/seller-home";
    }

    navigate(redirectPath, { replace: true });
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    const credentials = {
      userName: user,
      password,
      isSeller,
    };

    await auth.register(credentials, setRegister);
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(90deg, rgba(22,27,32,1) 0%, rgba(2,7,19,1) 100%)",
      }}
      className="Auth-form-container myGradient"
    >
      <form className="Auth-form">
        <div className="Auth-form-content">
          <h2> Ekart</h2>
          <div className="form-group mt-3">
            <h6>Username</h6>
            <input
              type="text"
              required
              className="form-control mt-1"
              placeholder="Enter Username"
              value={user}
              onChange={(event) => setUser(event.target.value)}
            />
          </div>
          <div className="form-group mt-3">
            <h6>Password</h6>
            <input
              type="password"
              className="form-control mt-1"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {register ? (
            <div className="form-group mt-3">
              <label>
                <input
                  style={{ marginRight: 10 }}
                  type="checkbox"
                  checked={isSeller}
                  onChange={(e) => {
                    setIsSeller(e.target.checked);
                  }}
                />
                Register as Seller
              </label>
            </div>
          ) : null}

          <button
            style={{
              border: "none",
              background: "none",
              padding: 0,
              margin: 0,
              fontSize: "12px",
              textDecoration: "none",
              cursor: "pointer",
              color: "grey",
            }}
            onClick={(e) => {
              e.preventDefault();
              setRegister((old) => !old);
            }}
          >
            {!register
              ? "Dont have an Account ? Register Here"
              : "Back to Log In"}
          </button>

          {register ? (
            <div className="d-grid mt-5">
              <button
                type="submit"
                className="btn btn-dark"
                onClick={(e) => handleRegister(e)}
              >
                Register
              </button>
            </div>
          ) : (
            <div className="d-grid mt-5">
              <button
                type="submit"
                className="btn btn-dark"
                onClick={(e) => handleLogin(e)}
              >
                Login
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
