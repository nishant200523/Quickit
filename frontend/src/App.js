import React, { use, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Login from "./pages/user-login/Login";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { ProtectedRoute, PublicRoute } from "./Protected";
import HomePage from "./components/HomePage";
import UserDetails from "./components/UserDetails";
import Status from "./pages/StatusSection/Status";
import Setting from "./pages/SettingSection/Setting";
import useUserStore from "./store/useUserStore";
import { disconnectSocket, initializeSocket } from "./services/chat.service";
import { set } from "date-fns";
import { useChatStore } from "./store/chatStore";

function App() {
  const {user}=useUserStore();
  const {setCurrentUser,initSocketListners,cleanup} = useChatStore();


  useEffect(()=>{
    if(user?._id){
      const socket = initializeSocket();


      if(socket) {
        setCurrentUser(user);

        initSocketListners();
      }

    }

    return ()=>{
      cleanup();
      disconnectSocket();
    }
  },[user,setCurrentUser,initSocketListners,cleanup])
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/user-login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/user-profile" element={<UserDetails />} />
            <Route path="/status" element={<Status />} />
            <Route path="/setting" element={<Setting />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
