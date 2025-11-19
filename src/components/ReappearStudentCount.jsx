import React, { useState } from "react";
import { useSheetContext } from "../context/sheetData";

function ReappearStudentCount() {
  const { excelData, editableData } = useSheetContext();

  // Get re-appear subjects with counts
  const getReappearSubjectsWithCounts = () => {
    if (!excelData[0]?.data) return [];

    const reappearSubjects = {};

    excelData[0].data.forEach((student) => {
      if (student.status?.toLowerCase().trim() === "re-appear") {
        student.subjects?.forEach((subject) => {
          if (subject && subject.trim() !== "") {
            const sub = subject.trim();
            reappearSubjects[sub] = (reappearSubjects[sub] || 0) + 1;
          }
        });
      }
    });

    // Convert to array and sort by count (descending)
    return Object.entries(reappearSubjects)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count);
  };

  const reappearSubjectsWithCounts = getReappearSubjectsWithCounts();

  return (
    <>
      {reappearSubjectsWithCounts.length > 0 && (
        <div className=" reappearStudentData p-4 mb-5">
          <div className="courseDetails mb-4">
            <p className="detailRow justify-content-center gap-0 mb-1">
              <span className="detailLabel" style={{ minWidth: "auto" }}>
                {excelData[0]?.instituteName || ""}
              </span>
            </p>
          </div>
          {/* Re-appear Subjects Count Table */}
          <div className="tableResponsive mb-4">
            <table className="attendanceTable table table-bordered">
              <thead className="tableHeader">
                <tr>
                  <th className="tableHeaderCell">S.No</th>
                  <th className="tableHeaderCell">Subjects</th>
                  <th className="tableHeaderCell">No. Students</th>
                </tr>
              </thead>
              <tbody className="tableBody">
                {reappearSubjectsWithCounts.map((item, index) => (
                  <tr key={index} className="tableRow">
                    <td className="tableCell text-center">{index + 1}</td>
                    <td className="tableCell">{item.subject}</td>
                    <td className="tableCell text-center">{item.count}</td>
                  </tr>
                ))}
                {/* Total Row
                <tr className="tableRow" style={{ backgroundColor: '#e9ecef', fontWeight: 'bold' }}>
                  <td className="tableCell text-center" colSpan="2">Total</td>
                  <td className="tableCell text-center">
                    {reappearSubjectsWithCounts.reduce((sum, item) => sum + item.count, 0)}
                  </td>
                </tr> */}
              </tbody>
            </table>
          </div>

          <br />
          <br />
          <br />
          <br />
        </div>
      )}

      {/* Custom CSS */}
      <style>{`
        .reappearStudentData {
          max-width: 1100px;
          margin: 20px auto;
          border: 1px solid #ccc;
          padding: 30px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          background-color: #fff;
          border-radius: 8px;
          padding-bottom: 3rem;
        } 
      `}</style>
    </>
  );
}

export default ReappearStudentCount;
