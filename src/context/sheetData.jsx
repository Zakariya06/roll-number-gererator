import { createContext, useContext, useState, useEffect } from "react";

export const SheetContext = createContext(null);

export const useSheetContext = () => useContext(SheetContext);

export const SheetProvider = ({ children }) => {
  const [excelData, setExcelData] = useState([]);

  // Static date/time data that persists across file uploads
  const [staticDateTimeData, setStaticDateTimeData] = useState(() => {
    const saved = localStorage.getItem("staticDateTimeData");
    return saved ? JSON.parse(saved) : {};
  });

  // Save to localStorage whenever staticDateTimeData changes
  useEffect(() => {
    localStorage.setItem(
      "staticDateTimeData",
      JSON.stringify(staticDateTimeData)
    );
  }, [staticDateTimeData]);

  // default data
  const [editableData, setEditableData] = useState({
    name: "Shehzad Khan",
    fatherName: "Gul Hussan Khan",
    rollNumber: "0000001",
    registrationNo: "67890",
    institute: "Khyber Medical University",
    examCenter: "Khyber Medical University",
    semesterTitle: "Write Exam Name Here",
    region: "Swat",
    logoImagePath: null,
    subjects: [],
  });

  // Function to update static date/time for a subject
  const updateSubjectDateTime = (subjectId, date, timing) => {
    setStaticDateTimeData((prev) => ({
      ...prev,
      [subjectId]: { date, timing },
    }));
  };

  // Function to get merged subjects with static data
  const getMergedSubjects = (subjectsFromExcel) => {
    return subjectsFromExcel.map((subject) => ({
      ...subject,
      date: staticDateTimeData[subject.id]?.date || subject.date,
      timing: staticDateTimeData[subject.id]?.timing || subject.timing,
    }));
  };

  return (
    <SheetContext.Provider
      value={{
        excelData,
        setExcelData,
        editableData,
        setEditableData,
        staticDateTimeData,
        updateSubjectDateTime,
        getMergedSubjects,
      }}
    >
      {children}
    </SheetContext.Provider>
  );
};
