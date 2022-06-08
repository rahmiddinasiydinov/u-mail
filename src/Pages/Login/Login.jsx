import "./Login.scss";
import { io } from "socket.io-client";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

export const Login = () => {
  const name = useRef();
  const navigate = useNavigate();
  const socket = io("https://uz-mail.herokuapp.com/", {
  });

  useEffect(() => {
     socket.on("connect", () => {});
     socket.on("new-user-back", async (data) => {
       if (data.status === 200) {
         navigate(`/home/${data?.name}`);
        //  window.location.assign(`/home/${data?.name}`);
       }
     });
  }, [socket])
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = name.current?.value.toLowerCase();
    socket.emit("new-user", { name: value, socketId: socket.id });
  };
  return (
    <>
      <div className="pen-title">
        <h1>Enter your name to continue on u-mail</h1>
        <span>
          {" "}
          <i className="fa fa-code"></i>
        </span>
      </div>
      <div className="rerun">
        <a href="some">Reset</a>
      </div>
      <div className="container">
        <div className="card"></div>
        <div className="card">
          <h1 className="title">Enter your name</h1>
          <form onSubmit={handleSubmit}>
            <div className="input-container">
              <input id="name" type="text" ref={name} required />
              <label htmlFor="#{label}">Your name</label>
              <div className="bar"></div>
            </div>
            <div className="button-container">
              <button>
                <span>Go</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
