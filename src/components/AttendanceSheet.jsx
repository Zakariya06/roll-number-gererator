import React, { useState } from "react";
import { useSheetContext } from "../context/sheetData";
import logo from "../assets/khyber_medical_university_logo.jpeg";
import ihslogo from "../assets/kmu_ihs_logo.png";

function AttendanceSheet() {
  const { excelData, editableData } = useSheetContext();

  // Define students per page
  const studentsPerPage = 25;

  // Get the full list of students from excelData
  const allStudents = excelData[0]?.data || [];

  // Get all unique subjects from all students
  const getAllUniqueSubjects = () => {
    if (!excelData[0]?.data) return [];

    const allSubjects = new Set();
    excelData[0].data.forEach((student) => {
      student.subjects?.forEach((subject) => {
        if (subject && subject.trim() !== "") {
          allSubjects.add(subject.trim());
        }
      });
    });

    return Array.from(allSubjects);
  };

  const uniqueSubjects = getAllUniqueSubjects();

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

  return (
    <>
      {/* Generate separate sheets for each subject */}
      {uniqueSubjects.map((subject, subjectIndex) => {
        // Filter students who have this subject
        const studentsWithSubject = allStudents.filter((student) =>
          student.subjects?.includes(subject)
        );

        // Create chunks of students for this subject
        const studentChunks = chunkArray(studentsWithSubject, studentsPerPage);

        return (
          <React.Fragment key={subjectIndex}>
            {studentChunks.map((chunk, chunkIndex) => (
              // Each chunk will render a full attendance sheet container for this subject
              <div
                className="attendanceSheetContainer p-4 mb-5"
                key={`${subjectIndex}-${chunkIndex}`}
              >
                {chunkIndex === 0 && (
                  <>
                    <div className="headerSection d-flex justify-content-between align-items-center mb-4">
                      <div className="ihsLogoWrapper">
                        <img src={logo} alt="KMU" className="kmuLogo" />
                        {editableData.logoImagePath && (
                          <img
                            src={editableData.logoImagePath}
                            alt="ihs logo"
                            className="ihsLogo  "
                          />
                        )}
                      </div>
                      <div className="titleSection">
                        <h1 className="universityTitle">
                          Khyber Medical University
                        </h1>
                        <p className="programTitle">
                          Regional - {excelData[0]?.regionalExamCell}
                        </p>
                        <p className="bsnText mb-0">
                          {editableData.semesterTitle}
                        </p>
                        <p className="semesterTitle">ATTENDANCE SHEET</p>
                      </div>
                      <div
                        className="emptySpace"
                        style={{ width: "100px" }}
                      ></div>{" "}
                    </div>
                    <div className="courseDetails mb-4">
                      <p className="detailRow mb-1">
                        <span
                          className="detailLabel"
                          style={{ minWidth: "auto" }}
                        >
                          Exam Centre :
                        </span>
                        <span className="detailValue ms-2">
                          {editableData.examCenter}
                        </span>
                      </p>
                      <p className="detailRow mb-1">
                        <span
                          className="detailLabel"
                          style={{ minWidth: "auto" }}
                        >
                          Institute :
                        </span>
                        <span className="detailValue ms-2">
                          {excelData[0]?.instituteName || ""}
                        </span>
                      </p>
                      <div className="d-flex align-items-center gap-4 justify-content-between">
                        <p className="detailRow  mb-1">
                          <span
                            className="detailLabel"
                            style={{ minWidth: "auto" }}
                          >
                            Subject :
                          </span>
                          <span className="detailValue">{subject}</span>
                        </p>

                        <p className="detailRow  mb-1">
                          <span
                            className="detailLabel"
                            style={{ minWidth: "auto" }}
                          >
                            Date :
                          </span>
                          <span
                            className="detailValue ms-2 "
                            style={{ width: "100px" }}
                          >
                            {editableData.subjects.find(
                              (sub) =>
                                sub.subject.toLowerCase().trim() ===
                                subject.toLowerCase().trim()
                            )?.date || "6-Jan-25"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Attendance Table - Specific to each chunk and subject */}
                <div className="tableResponsive mb-4">
                  <table className="attendanceTable table table-bordered">
                    <thead className="tableHeader">
                      <tr>
                        <th className="tableHeaderCell" rowSpan="2">
                          SNO
                        </th>
                        <th className="tableHeaderCell" rowSpan="2">
                          RNO
                        </th>
                        <th className="tableHeaderCell" rowSpan="2">
                          Student Name
                        </th>
                        <th className="tableHeaderCell" rowSpan="2">
                          Father Name
                        </th>
                        <th className="tableHeaderCell">Paper Code</th>
                        <th className="tableHeaderCell">Signature</th>
                      </tr>
                    </thead>
                    <tbody className="tableBody">
                      {chunk.map((student, index) => {
                        const globalIndex =
                          chunkIndex * studentsPerPage + index;
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
                          const reappearIndex =
                            reappearStudents.indexOf(student);

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
                              &nbsp; {status === "re-appear" && "(RA)"}
                            </td>
                            <td className="tableCell">{student.name}</td>
                            <td className="tableCell">{student.fatherName}</td>
                            <td className="tableCell"></td>
                            <td className="tableCell"></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Show page info if multiple chunks */}
                {studentChunks.length > 1 && (
                  <div className="pageInfo text-center mt-3">
                    Page {chunkIndex + 1} of {studentChunks.length}
                  </div>
                )}

                {/* Footer Section - Repeated for each sheet */}
                <div className="footerSection d-flex justify-content-between align-items-end mt-5">
                  <div className="signatureBlock">
                    <p className="signatureLabel mb-0">Signature of Supdt :</p>
                    <div className="signatureLine"></div>
                  </div>
                  <div className="signatureBlock text-end">
                    <p className="signatureLabel mb-0">Deputy Supdt :</p>
                    <div className="signatureLine"></div>
                  </div>
                </div>
                <br />
                <br />
                <br />
                <br />
              </div>
            ))}
          </React.Fragment>
        );
      })}

      {/* Custom CSS */}
      <style>{`
        .attendanceSheetContainer {
          max-width: 1100px;
          margin: 20px auto;
          border: 1px solid #ccc;
          padding: 30px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          background-color: #fff;
          border-radius: 8px;
          padding-bottom: 3rem;
        }
 
        .tableHeaderCell {
          vertical-align: middle;
          text-align: center;
          font-weight: bold;
          border: 1px solid #000 !important; /* Ensure borders are black */
          padding: 8px;
        }

        .tableBody .tableRow:nth-child(even) {
          background-color: #f2f2f2; /* Light grey for even rows */
        }

        .tableCell {
          border: 1px solid #000 !important; /* Ensure borders are black */
          padding: 8px;
          text-align: left;
          vertical-align: middle;
        }

        .signatureCell {
          min-width: 150px; /* Provide space for signatures */
          text-align: left;
        }

        .footerSection {
          padding-top: 20px;
          border-top: 2px solid #000;
        }

        .signatureBlock {
          flex: 1;
          padding: 0 20px;
        }

        .signatureLabel {
          font-weight: bold;
          font-size: 1.1rem;
        } 
        .signatureLine {
          border-bottom: 1px solid #000;
          margin-top: 30px; /* Space for signature */
          width: 80%; /* Adjust line length */
        }
      `}</style>
    </>
  );
}

export default AttendanceSheet;
