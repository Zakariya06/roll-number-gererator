import { createContext, useContext, useState } from "react";

export const SheetContext = createContext(null);

export const useSheetContext = () => useContext(SheetContext);

export const SheetProvider = ({ children }) => {
  const [excelData, setExcelData] = useState([]);

  // default data
  const [editableData, setEditableData] = useState({
    name: "Shehzad Khan",
    fatherName: "Gul Hussan Khan",
    rollNumber: "0000001",
    registrationNo: "67890",
    institute: "KMU Institute Of Health Sciences Swat",
    examCenter: "Write Center Name Here",
    semesterTitle: "Write Exam Name Here",
    logoImagePath: null,
    subjects: [],
  });

  return (
    <SheetContext.Provider
      value={{ excelData, setExcelData, editableData, setEditableData }}
    >
      {children}
    </SheetContext.Provider>
  );
};
