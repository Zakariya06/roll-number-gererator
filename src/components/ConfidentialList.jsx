import React from "react";
import logo from "../assets/khyber_medical_university_logo.jpeg";
import ihslogo from "../assets/kmu_ihs_logo.png";
import { useSheetContext } from "../context/sheetData";

function ConfidentialList() {
  const { excelData, editableData } = useSheetContext();

  const studentsPerPage = 6;

  // Get the full list of students from excelData
  const allStudents = excelData[0]?.data || [];

  // Function to chunk the array into smaller arrays of `chunkSize`
  const chunkArray = (arr, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
  };

  // ✅ Count regular and re-appear students
  const regularStudents =
    excelData[0]?.data.filter(
      (s) => s.status?.toLowerCase().trim() === "regular"
    ) || [];

  const reappearStudents =
    excelData[0]?.data.filter(
      (s) => s.status?.toLowerCase().trim() === "re-appear"
    ) || [];

  const regularStudentsCount = regularStudents.length;

  // Create chunks of students, each containing up to `studentsPerPage` students
  const studentChunks = chunkArray(allStudents, studentsPerPage);

  return (
    <>
      {" "}
      {/* Use a React Fragment to return multiple top-level elements */}
      {studentChunks.map((chunk, chunkIndex) => (
        // Each chunk will render a full confidential list container
        <div className="confidentialListContainer p-4 mb-5" key={chunkIndex}>
          {chunkIndex === 0 && (
            <>
              <div className="headerSection d-flex justify-content-between align-items-center mb-4">
                <div className="ihsLogoWrapper">
                  <img src={logo} alt="KMU" className="kmuLogo" />
                  <img
                    src={ihslogo}
                    alt="ihs logo "
                    className=" ihsLogo   mt-2"
                  />
                </div>
                <div className="titleSection">
                  <h1 className="universityTitle">Khyber Medical University</h1>
                  <p className="programTitle">
                    Regional Exam Cell - {excelData[0]?.regionalExamCell}
                  </p>
                  <p className="semesterTitle"> Confidential List with Pic</p>
                </div>
                <div className="emptySpace" style={{ width: "100px" }}></div>{" "}
              </div>
              {/* Course Details */}

              <div className="courseDetails d-flex justify-content-between m-0  ">
                <p className="detailRow  m-0">
                  <span className="detailLabel">Exam :</span>
                  <span className="detailValue  ">
                    {editableData.semesterTitle}
                  </span>
                </p>
                <p className="detailRow  m-0">
                  <span className="detailLabel">Session :</span>
                  <span className="detailValue ms-1">
                    {new Date().getFullYear()}
                  </span>
                </p>
              </div>
              <div className="courseDetails mb-4">
                <p className="detailRow mb-1">
                  <span className="detailLabel">Institute :</span>
                  <span className="detailValue ms-1">
                    {excelData[0]?.instituteName || ""}
                  </span>
                </p>
              </div>
            </>
          )}

          {/* Confidential List Table */}
          <div className="tableResponsive mb-5  ">
            <table className="confidentialTable table table-bordered">
              <thead className="tableHeader">
                <tr>
                  <th className="tableHeaderCell">S.No</th>
                  <th className="tableHeaderCell">RNO</th>
                  <th className="tableHeaderCell">Student Name</th>
                  <th className="tableHeaderCell">Father Name</th>
                  <th className="tableHeaderCell">Registration No</th>
                  <th className="tableHeaderCell">Pic</th>
                </tr>
              </thead>
              <tbody className="tableBody">
                {chunk.map((student, index) => {
                  const globalIndex = chunkIndex * studentsPerPage + index;
                  const baseRoll = parseInt(editableData.rollNumber);
                  const status = student.status?.toLowerCase().trim();

                  let rollNum;

                  if (status === "regular") {
                    // find this student's position among regular students
                    const regularIndex = regularStudents.findIndex(
                      (s) => s.rollNumber === student.rollNumber
                    );

                    // ✅ start from base roll + regularIndex
                    rollNum = baseRoll + regularIndex + globalIndex;
                  } else if (status === "re-appear") {
                    // find this student's position among reappear students
                    const reappearIndex = reappearStudents.indexOf(student);

                    if (regularStudentsCount > 0) {
                      // 🟩 there are regular students → start after 20-number gap
                      const lastRegularRoll =
                        baseRoll + regularStudentsCount - 1;
                      rollNum = lastRegularRoll + 20 + reappearIndex;
                    } else {
                      // 🟦 only reappear students → start right after base roll
                      rollNum = baseRoll + reappearIndex;
                    }
                  } else {
                    rollNum = baseRoll;
                  }

                  return (
                    <tr key={globalIndex} className="tableRow">
                      <td className="tableCell">{globalIndex + 1}</td>
                      <td className="tableCell">
                        {String(rollNum).padStart(7, "0")}
                        &nbsp;{" "}
                        {student.status.toLowerCase().trim() === "re-appear" &&
                          "(RA)"}
                      </td>
                      <td className="tableCell">{student.name}</td>
                      <td className="tableCell">{student.fatherName}</td>
                      <td className="tableCell">{student.registration}</td>
                      <td
                        className="tableCell studentImageCell"
                        style={{ width: "200px", height: "200px" }}
                      >
                        <img
                          src={student.imagePath}
                          alt={student.name}
                          className="studentImage"
                          style={{ height: "100%" }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {/* Custom CSS */}
      <style>{`
        .confidentialListContainer {
          max-width: 1100px;
          margin: 20px auto;
          border: 1px solid #ccc;
          padding: 30px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          background-color: #fff;
          border-radius: 8px;
        } 
 
        .courseDetails {
          font-size: 1.1rem;
          font-weight: bold;
          margin-bottom: 20px;
        }

        .detailRow {
          display: flex;
          align-items: baseline;
          font-size: 1.1rem;
          margin-bottom: 5px;
        } 
         
        .detailValue {
          font-style: italic;
          font-size: 15px;
          border-bottom: 1px solid #000;
        }

        .confidentialTable {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        } 
 
      `}</style>
    </>
  );
}

export default ConfidentialList;
