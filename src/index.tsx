import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Frame } from "./screens/Frame/Frame";
import { Catalog } from "./Pages/Catalog";
import { BloxFruits } from "./Pages/BloxFruits";
import  AdoptMe  from "./Pages/AdoptMe";
import  AnimeVanguards  from "./Pages/AnimeVanguards";
import  BladeBall  from "./Pages/BladeBall";
import  DressToImpress  from "./Pages/DressToImpress";
import  GrowAGarden  from "./Pages/GrowAGarden";
import  MurderMystery  from "./Pages/MurderMystery2";
import  NinetyNineNights  from "./Pages/NinetyNineNights";
import  StealABrainrot from "./Pages/StealABrainrot";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Frame />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/BloxFruits" element={<BloxFruits />} />
        <Route path="/AdoptMe" element={<AdoptMe />} />
        <Route path="/AnimeVanguards" element={<AnimeVanguards />} />
        <Route path="/BladeBall" element={<BladeBall />} />
        <Route path="/DressToImpress" element={<DressToImpress />} />
        <Route path="/GrowAGarden" element={<GrowAGarden />} />
        <Route path="/murderMystery" element={<MurderMystery />} />
        <Route path="/NinetyNineNights" element={<NinetyNineNights />} />
        <Route path="/StealABrainrot" element={<StealABrainrot />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);