import React from "react";
import "./styles.css";
import { Machine, assign } from "xstate";
import { useMachine } from "@xstate/react";

import Image1 from "./images/1.gif";
import Image2 from "./images/2.gif";
import Image3 from "./images/3.gif";
import Image4 from "./images/4.gif";

function loadImage() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const gifs = [Image1, Image2, Image3, Image4];
      const shouldError = Math.random() >= 0.7;

      if (shouldError) return reject();

      const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
      resolve(randomGif);
    }, 2000);
  });
}

const machine = Machine({
  initial: "idle",
  context: {
    imgUrl: undefined
  },
  states: {
    idle: {
      on: {
        LOAD: "fetching"
      }
    },
    fetching: {
      invoke: {
        src: loadImage,
        onDone: {
          target: "done",
          actions: assign({
            imgUrl: (context, event) => event.data
          })
        },
        onError: "error"
      },
      on: {
        CANCEL: "idle"
      }
    },
    error: {
      on: {
        RETRY: "fetching"
      }
    },
    done: {
      on: {
        RETRY: "fetching"
      }
    }
  }
});

export default function App() {
  const [current, send] = useMachine(machine);

  return (
    <main className="app">
      {current.matches("idle") && (
        <>
          <div className="image-container"></div>
          <button className="button" onClick={() => send("LOAD")}>
            Search
          </button>
        </>
      )}
      {current.matches("fetching") && (
        <>
          <div className="image-container">
            <div className="spinner"></div>
          </div>
          <button className="button" onClick={() => send("CANCEL")}>
            Cancel
          </button>
        </>
      )}
      {current.matches("done") && (
        <>
          <div className="image-container">
            <img src={current.context.imgUrl} alt="Computer Gif" />
          </div>
          <button className="button" onClick={() => send("RETRY")}>
            Retry
          </button>
        </>
      )}
      {current.matches("error") && (
        <>
          <div className="image-container">Error</div>
          <button className="button" onClick={() => send("RETRY")}>
            Retry
          </button>
        </>
      )}{" "}
    </main>
  );
}
