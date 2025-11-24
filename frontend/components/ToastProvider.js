"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToastProvider() {
  return (
    <ToastContainer
      autoClose={5000}
      position="top-right"
      hideProgressBar={true}
      closeOnClick={true}
      pauseOnHover={true}
      draggable={true}
      progress={undefined}
      theme="colored"
    />
  );
}
