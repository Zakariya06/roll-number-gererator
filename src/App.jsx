import { useState } from "react";

import ExcelUploader from "./components/ExcelUploader";
import RollNumberSlip from "./components/RollNumberSlip"; 

import { BrowserRouter, Routes, Route } from "react-router-dom";
import AttendanceSheet from "./components/AttendanceSheet";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ExcelUploader />} />
          <Route path="/rollNumbers" element={<RollNumberSlip />} />
        </Routes>
      </BrowserRouter>

      {/* <AttendanceSheet /> */}

      {/* <div className="App"><FileUploader /></div> */}
    </>
  );
}

export default App;
