import "./Home.scss";
import { io } from "socket.io-client";
import { useParams } from "react-router";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import personImg from "../../Assets/Images/person.png";
import personImg1 from "../../Assets/Images/person3.png";
import dateFormat from "dateformat";
import arrow from "../../Assets/Images/arrow.png";
import { Link } from "react-router-dom";

export const Home = () => {
  const [multiSelections, setMultiSelections] = useState([]);
  const [users, setUsers] = useState([]);
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [saved, setSaved] = useState([]);
  const [communication, setCommunication] = useState([]);
  const [currentPartner, setCurrentPartner] = useState([]);
  const [message, setMessage] = useState("");
  const [replyMessages, setReplyMessages] = useState([]);
  const [title, setTitle] = useState("");
  const [messageListener, setMessageListener] = useState(false);
  const [userListener, setUserListener] = useState(false);
  const [replyListener, setReplyListener] = useState(false);
  const { name } = useParams();
  const modal = useRef();
  const input = useRef();
  const [reply, setReply] = useState();

  const socket = io("https://uz-mail.herokuapp.com/");
  useEffect(() => {
    axios.get("https://uz-mail.herokuapp.com/user").then((res) => {
      setUsers(res.data);
    });
  }, [userListener]);

  useEffect(() => {
    axios.get(`https://uz-mail.herokuapp.com/message?author=${name}`).then((res) => {
      const sent = res.data.messages.filter(
        (e) => e.author === name && e.receiver !== name
      );
      const receive = res.data.messages.filter(
        (e) => e.receiver === name && e.author !== name
      );
      const saved = res.data.messages.filter(
        (e) => e.receiver === name && e.author === name
      );
      setSent([...sent.reverse()]);
      setReceived([...receive.reverse()]);
      setSaved([...saved.reverse()]);
    });
  }, [messageListener]);
  useEffect(() => {
    axios(`https://uz-mail.herokuapp.com/reply?id=${currentPartner}`).then((res) => {
      setCommunication(res.data.partner);
      setReplyMessages(res.data.partner?.replies);
    });
  }, [replyListener]);

   useEffect(() => {
    console.log(communication);
      setReplyMessages(communication?.replies);
   }, [currentPartner, communication]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    socket.emit("new-message", {
      author: name,
      body: message,
      title,
      receivers: multiSelections,
    });
  };
  useEffect(() => {
    socket.on("new-user", (data) => {
      setUserListener(!userListener);
    });
    socket.on("new-message", (data) => {
      setMessageListener(!messageListener);
    });
    socket.on("new-reply", (data) => {
      setReplyListener(!replyListener);
    });

  }, [socket])
  
  const handleReply = () => {

    socket.emit("new-reply", {
      author: name,
      body: reply,
      message: currentPartner,
    });
    setTimeout(() => {
      input.current.value = "";
      modal?.current.classList.remove("modal__active");
    }, 1000);
  };
  return (
    <>
      <div className="modal" ref={modal}>
        <button
          className="modal__exit"
          onClick={() => {
            modal?.current.classList.remove("modal__active");
          }}
        >
          X
        </button>
        <p className="modal__text">{communication?.body?.slice(0, 100)}</p>
        <div className="input-group mb-3">
          <input
            type="text"
            ref={input}
            className="form-control"
            placeholder="Reply to message"
            aria-label="Recipient's username"
            aria-describedby="button-addon2"
            onChange={(e) => {
              setReply(e.target.value);
            }}
          />
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={handleReply}
            id="button-addon2"
          >
            Button
          </button>
        </div>
      </div>
      <header className="header">
        <div className="header__container container-md">
          <span className="header__logo">u-mail</span>
          <form className="header__form">
            <Typeahead
              id="basic-typeahead-multiple"
              labelKey="name"
              multiple
              onChange={setMultiSelections}
              options={users?.map((e) => {
                return e.name;
              })}
              placeholder="Choose username(s)"
              selected={multiSelections}
            />
          </form>
          <div className="header__profile">
            <div className="header__person">
              <img className="header__person--img" src={personImg} alt="img" />
              <span className="header__person--text">{name}</span>
            </div>
            <Link type="button" to="/" className="btn btn-outline-primary">
              Log out
            </Link>
          </div>
        </div>
      </header>
      <main className="main">
        <div className="container-lg users">
          <div className="users__wrapper">
            <ul className="users__list">
              <li className="users__item--person users__item--received">
                Received
              </li>

              {received?.length
                ? received?.map((e, i) => {
                    return (
                      <li
                        key={i}
                        className={`users__item ${
                          e._id === communication?._id
                            ? "users__item--active"
                            : ""
                        }`}
                        onClick={() => {
                          setMultiSelections([e.author]);
                          setCommunication(e);
                          setCurrentPartner(e._id);
                        }}
                      >
                        <img
                          className="users__item--img"
                          src={personImg1}
                          alt="img"
                        />
                        <div>
                          <h3
                            className={`users__item--title  users__item--received
                            }`}
                          >
                            {e.author}
                          </h3>
                          <p className="users__item--text">{e?.body}</p>
                        </div>
                      </li>
                    );
                  })
                : "You have not received messages"}
            </ul>
            <ul className="users__list">
              <li className="users__item--person users__item--sent">Sent</li>
              {sent?.length
                ? sent?.map((e, i) => {
                    return (
                      <li
                        key={i}
                        className={`users__item ${
                          e._id === communication?._id
                            ? "users__item--active"
                            : ""
                        }`}
                        onClick={() => {
                          setMultiSelections([e.receiver]);
                          setCommunication(e);
                          setCurrentPartner(e._id);
                        }}
                      >
                        <img
                          className="users__item--img"
                          src={personImg1}
                          alt="img"
                        />
                        <div>
                          <h3
                            className={`users__item--title users__item--sent`}
                          >
                            {e.receiver}
                          </h3>
                          <p className="users__item--text">{e?.body}</p>
                        </div>
                      </li>
                    );
                  })
                : "You have not sent message to anyone yet"}
            </ul>
            <ul className="users__list">
              <li className="users__item--person users__item--saved">
                Saved messages
              </li>
              {saved?.length
                ? saved?.map((e, i) => {
                    return (
                      <li
                        key={i}
                        className={`users__item ${
                          e._id === communication?._id
                            ? "users__item--active"
                            : ""
                        }`}
                        onClick={() => {
                          setMultiSelections([e.receiver]);
                          setCommunication(e);
                          setCurrentPartner(e._id);
                        }}
                      >
                        <img
                          className="users__item--img"
                          src={personImg1}
                          alt="img"
                        />
                        <div>
                          <h3
                            className={`users__item--title users__item--saved
                            }`}
                          >
                            You
                          </h3>
                          <p className="users__item--text">{e?.body}</p>
                        </div>
                      </li>
                    );
                  })
                : "You have not saved messages"}
            </ul>
          </div>

          <div className="chat__wrapper">
            <form className="users__form" onSubmit={handleSubmit}>
              <ul className="users__receiver--list">
                <li className="users__label">
                  {multiSelections.length > 1 ? "Recievers:" : "Reciever:"}
                </li>
                {multiSelections.map((e, i) => {
                  return (
                    <li className="users__receiver" key={i}>
                      {e + ","}
                    </li>
                  );
                })}
              </ul>
              <div className="input-group mb-3">
                <span className="input-group-text" id="basic-addon1">
                  Title
                </span>
                <input
                  type="text"
                  className="form-control"
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                  placeholder="Username"
                  aria-label="Username"
                  aria-describedby="basic-addon1"
                />
              </div>

              <div className="form-floating">
                <textarea
                  className="form-control "
                  placeholder="Leave a comment here"
                  id="floatingTextarea2"
                  style={{ height: 100 }}
                  onChange={(e) => [setMessage(e.target.value)]}
                ></textarea>
                <label htmlFor="floatingTextarea2" className="form-label">
                  Message
                </label>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg users__btn"
                disabled={
                  multiSelections.length && message.length && title.length
                    ? false
                    : true
                }
              >
                Send Message
              </button>
            </form>
            <div className="chat">
              <span className="chat__date">
                {communication?dateFormat(communication?.sentAt, "h:MM TT , mmmm dS, yyyy"):''}
              </span>
              <h2 className="chat__title">{communication?.title} </h2>
              <div className="chat__owners">
                <span className="chat__author">
                  {communication?.author === name
                    ? "You"
                    : communication?.author}
                </span>
                {communication?._id ? (
                  <img className="chat__arrow" src={arrow} alt="to" />
                ) : (
                  ""
                )}
                <span className="chat__author">
                  {communication?.receiver === name
                    ? "You"
                    : communication?.receiver}
                </span>
              </div>
              <hr className="chat__line" />
              <p className="chat__text">
                {communication?.body}{" "}
                {communication?._id ? (
                  <button
                    onClick={() => {
                      modal?.current.classList.add("modal__active");
                    }}
                    type="button"
                    className="chat__reply--btn"
                  >
                    Reply
                  </button>
                ) : (
                  ""
                )}{" "}
              </p>
              <span className="chat__reply">
                {communication?._id ? "Replies" : ""}
              </span>
              <ul className="chat__reply--list">
                {replyMessages?.map((e, i) => {
                  return (
                    <li key={i} className="chat__reply--wrapper">
                      <div>
                        {" "}
                        <h4
                          className={`chat__reply--title ${
                            e?.author === name ? "users__item--saved" : ""
                          }`}
                        >
                          {e?.author === name ? "You" : e?.author}
                        </h4>
                        <p className="chat__reply--text">{e?.body}</p>
                      </div>
                      <div className="chat__reply--time">
                        {dateFormat(e?.sentAt, "h:MM TT,   mmmm dS,   yyyy, ")}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
