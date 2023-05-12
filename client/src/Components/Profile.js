import React, { useEffect, useRef } from "react";
import { useAuth } from "../Utils/auth_context";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const dialog = useRef(null);
  const person = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="25"
      onClick={() => {
        dialog.current.showModal();
      }}
      fill="currentColor"
      className="bi bi-person-circle"
      viewBox="0 0 16 16"
    >
      <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      <path
        fillRule="evenodd"
        d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"
      />
    </svg>
  );
  const auth = useAuth();
  const navigate = useNavigate();

  function onDialogDismiss(event) {
    dialog.current.close();
  }

  useEffect(() => {
    dialog.current = document.querySelector("[data-modal]");
    dialog.current.addEventListener("click", onDialogDismiss);
    return () => {
      dialog.current.removeEventListener("click", onDialogDismiss);
    };
  });

  const handleLogout = () => {
    auth.logout();
    navigate("/user-login");
  };

  return (
    <div>
      {person}
      <div>
        <dialog
          style={{
            width: "15%",
            height: "20%",
            paddingLeft: 60,

            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",

            borderRadius: 5,
            backgroundColor: "aliceblue",
          }}
          data-modal
        >
          <p>Hello {auth?.user?.userName}</p>
          <form method="dialog">
            <button
              className="btn btn-danger mr-1 mb-2 px-2 py-0"
              onClick={() => {
                handleLogout();
              }}
            >
              Logout
            </button>
          </form>
        </dialog>
      </div>
    </div>
  );
};

export default Profile;
