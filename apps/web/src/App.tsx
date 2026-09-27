import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "./pages/Home";
import { OrganizerRecap } from "./pages/OrganizerRecap";
import { UserRecap } from "./pages/UserRecap";

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/user/:slug" element={<UserRecap />} />
      <Route path="/organizer/:slug" element={<OrganizerRecap />} />
    </Routes>
  </BrowserRouter>
);
