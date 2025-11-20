import html2canvas from "html2canvas";
import { useSheetContext } from "../context/sheetData";
import jsPDF from "jspdf";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Spinner } from "react-bootstrap";
import logo from "../assets/khyber_medical_university_logo.jpeg";
import ihslogo from "../assets/kmu_ihs_logo.png";
import signature from "../assets/signature.png";
import { enqueueSnackbar } from "notistack";
import AttendanceSheet from "./AttendanceSheet";
import ConfidentialList from "./ConfidentialList";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import useExcelExport from "../hooks/useExcelExport";
import ReappearStudentCount from "./ReappearStudentCount";

export default function RollNumberSlip() {
  const { excelData, setExcelData, editableData, setEditableData } =
    useSheetContext();
  const { exportToExcel } = useExcelExport();

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pageDone, setPageDone] = useState(1);
  const [pdfGenereted, setPdfGenereted] = useState(false);
  const [stationModal, setStationModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [atStatus, setAtStatus] = useState(false);
  const [selectedAtStatus, setSelectedAtStatus] = useState(null);

  const navigate = useNavigate();

  console.log("this is edtable data", editableData);
  console.log("this is excel data", excelData);

  // download Roll Number in pdf
  const downloadPDF = async (target) => {
    let handle = null;

    // ✅ Ask for save location right away (while still in user gesture)
    if (window.showSaveFilePicker) {
      try {
        editableData.institute;
        const suggestedName =
          target === "attendanceSheetContainer"
            ? `${editableData.institute || ""} AS.pdf`
            : target === "confidentialListContainer"
            ? `${editableData.institute || ""} CL.pdf`
            : target === "reappearStudentData"
            ? `${editableData.institute || ""} Re-appear Data Students.pdf`
            : `${editableData.institute || ""} RN.pdf`;

        handle = await window.showSaveFilePicker({
          suggestedName,
          types: [
            {
              description: "PDF Document",
              accept: { "application/pdf": [".pdf"] },
            },
          ],
        });
      } catch (err) {
        console.error("User cancelled save dialog:", err);
        return;
      }
    }

    // ✅ Proceed with PDF generation
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const containers = document.querySelectorAll(`.${target}`);
      if (containers.length === 0) {
        enqueueSnackbar(
          "No data to generate PDF. Please upload an Excel file first."
        );
        return;
      }

      setPdfLoading(true);

      for (let i = 0; i < containers.length; i++) {
        const container = containers[i];
        const canvas = await html2canvas(container, {
          scale: 1.2,
          useCORS: true,
        });
        const imgData = canvas.toDataURL("image/webp", 0.8);
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "WEBP", 0, 0, pdfWidth, pdfHeight);
        setPageDone(i + 1);
      }

      const pdfBlob = pdf.output("blob");

      if (handle) {
        // ✅ User selected file earlier
        const writable = await handle.createWritable();
        await writable.write(pdfBlob);
        await writable.close();
        enqueueSnackbar("✅ PDF saved successfully!");
      } else {
        // ✅ Fallback
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "download.pdf";
        link.click();
        URL.revokeObjectURL(url);
        enqueueSnackbar("✅ PDF downloaded successfully!");
      }
    } catch (err) {
      console.error("PDF generation error:", err);
      enqueueSnackbar("❌ Something went wrong while generating the PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  // dowload   excel sheet
  const handleExcelSheetDownload = () => {
    exportToExcel({
      data: excelData[0]?.data || [],
      rollStart: editableData.rollNumber,
      institue: editableData.institute,
      exam: editableData.semesterTitle,
      fileName: `${editableData.institute} Sign OSPE list.xlsx`,
    });
  };

  const handleStationModal = () => {
    setStationModal(true);
  };

  const handleStationChange = (stationNumber) => {
    setSelectedStation(stationNumber);
  };

  const handleStationExcelSheetDownload = () => {
    if (selectedStation) {
      exportToExcel({
        data: excelData[0]?.data || [],
        rollStart: editableData.rollNumber,
        institue: editableData.institute,
        exam: editableData.semesterTitle,
        station: selectedStation,
        fileName: `${editableData.institute} OSPE List.xlsx`,
      });
      setStationModal(false);
      setSelectedStation(null);
    } else {
      enqueueSnackbar("Please select a station number first", {
        variant: "warning",
      });
    }
  };
  // clearing Data
  const deleteData = () => {
    setExcelData([]);
    navigate("/");
  };

  useEffect(() => {
    setPdfGenereted(true);
  }, [excelData[0]?.data]);

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

  if (!excelData || excelData.length === 0) {
    return (
      <div className="text-center py-3">
        <p className="semesterTitle">No Data Found</p>
        <button className="clearDataButton" onClick={deleteData}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="actionButtons">
        <button
          className="downloadButton"
          onClick={() => downloadPDF("admitCardContainer")}
        >
          Download Roll No PDF
        </button>
        <button className="downloadButton" onClick={() => setAtStatus(true)}>
          Download Attendance Sheet PDF
        </button>
        <button
          className="downloadButton"
          onClick={() => downloadPDF("confidentialListContainer")}
        >
          Download Confidential List PDF
        </button>
        <button className="downloadButton" onClick={handleExcelSheetDownload}>
          Download Students Ospe List
        </button>
        <button className="downloadButton" onClick={handleStationModal}>
          Download Students Ospe Station List
        </button>
        <button
          className="downloadButton"
          onClick={() => downloadPDF("reappearStudentData")}
        >
          Download Re-appear Data Students PDF
        </button>
        <button className="downloadButton clearDataButton" onClick={deleteData}>
          Clear
        </button>
      </div>

      <div className="w-100 py-5">
        {excelData[0].data.map((row, index) => {
          const baseRoll = parseInt(editableData.rollNumber);
          const status = row.status?.toLowerCase().trim();

          // find index among reappear students
          const reappearIndex = reappearStudents.findIndex(
            (s) => s.rollNumber === row.rollNumber
          );

          // ✅ Corrected Roll Number Logic
          let rollNum;

          if (status === "regular") {
            // Regular students go in normal sequence
            rollNum = baseRoll + index;
          } else if (status === "re-appear") {
            // find this student's position among reappear students
            const reappearIndex = reappearStudents.indexOf(row);

            if (regularStudentsCount > 0) {
              const lastRegularRoll = baseRoll + regularStudentsCount - 1;
              rollNum = lastRegularRoll + 20 + reappearIndex;
            } else {
              // 🟦 only reappear students → start right after base roll
              rollNum = baseRoll + reappearIndex;
            }
          } else {
            rollNum = baseRoll;
          }

          return (
            <div
              className="admitCardContainer mb-2"
              key={"admitCardContainer" + index}
            >
              <div className="mainBorder">
                {/* Header Section */}
                <div className="headerSection">
                  <div className="ihsLogoWrapper">
                    <img src={logo} alt="KMU " className="kmuLogo" />
                    <img
                      src={
                        editableData.logoImagePath
                          ? editableData.logoImagePath
                          : ihslogo
                      }
                      alt="ihs logo "
                      className=" ihsLogo"
                    />
                  </div>
                  <div className="titleSection">
                    <h1 className="universityTitle">
                      Khyber Medical University
                    </h1>
                    <p className="programTitle">
                      Regional Exam Cell - {editableData.region}
                    </p>
                    <p className="semesterTitle">
                      {editableData.semesterTitle ||
                        "DPT 3rd Semester Fall-2024"}
                    </p>
                    <p className="studentCopyText">[Student Copy]</p>
                  </div>
                  <div className="noticeBox">
                    <p className="noticeText">Cell Phone, Smart Watch</p>
                    <p className="noticeText">or any Electronic Gadgets</p>
                    <p className="noticeText">are not allowed</p>
                  </div>
                </div>

                {/* Student Information */}
                <div className="studentInfoSection mt-5">
                  <div className="studentDetails">
                    <div className="infoRow">
                      <div className="infoItem" style={{ flex: 1 }}>
                        <span className="infoLabel">Name:</span>
                        <span className="infoValue">{row.name}</span>
                      </div>
                      <div className="infoItem" style={{ flex: 1 }}>
                        <span className="infoLabel">Father Name:</span>
                        <span className="infoValue">{row.fatherName}</span>
                      </div>
                      <div className="infoItem">
                        <span className="infoLabel">Roll No:</span>
                        <span className="infoValue">
                          {String(rollNum).padStart(7, "0")}
                        </span>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-9">
                        <div className="infoRow">
                          <div className="mt-1">
                            <div className="infoItem">
                              <span className="infoLabel">
                                Registration No:
                              </span>
                              <span className="infoValue">
                                {row.registration}
                              </span>
                            </div>
                            <div className="infoItem mt-2">
                              <span className="infoLabel">Institute:</span>
                              <span className="infoValue">
                                {editableData.institute}
                              </span>
                            </div>
                            <div className="infoItem mt-2">
                              <span className="infoValue">
                                {row.status.toLowerCase().trim() ===
                                  "re-appear" && row.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Examination Schedule Table */}
                        <div className="examTableWrapper mt-3 w-100">
                          <table className="examTable">
                            <colgroup>
                              <col width={"5%"} />
                              <col width={"40%"} />
                              <col width={"20%"} />
                              <col width={"35%"} />
                            </colgroup>
                            <thead>
                              <tr className="tableHeader">
                                <th className="tableHeaderCell">S.No</th>
                                <th className="tableHeaderCell text-start">
                                  Subject
                                </th>
                                <th className="tableHeaderCell">Date</th>
                                <th className="tableHeaderCell">Timing</th>
                              </tr>
                            </thead>
                            <tbody>
                              <>
                                {row.subjects.map((sub, i) => (
                                  <tr key={i} className="tableRow">
                                    <td
                                      className="tableCell"
                                      style={{ width: "40px" }}
                                    >
                                      {i + 1}
                                    </td>
                                    <td className="tableCell text-start">
                                      {sub.subject}
                                    </td>
                                    <td className="tableCell">
                                      {" "}
                                      {
                                        editableData.subjects.find(
                                          (subject) =>
                                            subject.subject
                                              .toLowerCase()
                                              .trim() ===
                                            sub.subject.toLowerCase().trim()
                                        )?.date
                                      }
                                    </td>
                                    <td className="tableCell deleteRowCell">
                                      {
                                        editableData.subjects.find(
                                          (subject) =>
                                            subject.subject
                                              .toLowerCase()
                                              .trim() ===
                                            sub.subject.toLowerCase().trim()
                                        )?.timing
                                      }
                                    </td>
                                  </tr>
                                ))}
                              </>
                            </tbody>
                          </table>
                        </div>

                        <div className="examCenterSection">
                          <span className="examCenterLabel">Exam Center: </span>
                          <span className="examCenterValue">
                            {editableData.examCenter}
                          </span>
                        </div>
                      </div>

                      <div className="col-3 ms-auto ps-5">
                        <div className="photoContainer">
                          <img
                            src={row.imagePath}
                            alt={row.name}
                            className="studentImage"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-4 ms-auto">
                      <div className="signatureSection text-center">
                        <div className="signatureSpace">
                          <img
                            src={signature}
                            alt="sign"
                            className="signImage"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/*  Instructions section */}
                <div className="instructionsSection">
                  <h3 className="instructionsTitle">INSTRUCTIONS :</h3>
                  <div className="instructionsList">
                    <p className="instructionItem">
                      {editableData.instructionsText ? (
                        editableData.instructionsText
                          .split("\n")
                          .map((line, index, array) => (
                            <span key={index}>
                              {line}
                              {index < array.length - 1 && <br />}
                            </span>
                          ))
                      ) : (
                        // Default instructions
                        <>
                          1. You are advised to report at exam centre thirty
                          (30) minutes before the scheduled paper time.
                          <br />
                          2. You are advised to bring this ROLL NO SLIP along
                          with your Original National ID Card / Passport or
                          B-Form or Matric Certificate (less than 18 years age)
                          containing your photograph (mandatory). Candidates
                          failing to produce ROLL NO SLIP and Original CNIC
                          would not be allowed to enter the examination hall.
                          <br />
                          3. If your CNIC/B Form is lost, please bring a copy of
                          FIR, Newspaper cutting and Original NADRA token
                          showing that you have applied for the same.
                          <br />
                          4. Please don't bring any of Gadgets with you.
                          Candidates shall be searched for
                          cellphones/smart/watch/electronic devices and if
                          found, it will be confiscated and UFM case shall be
                          registered accordingly.
                          <br />
                          5. No candidate will be allowed to enter the
                          examination hall after 15 minutes of the start of
                          paper.
                          <br />
                          6. Any student who fails to fill the paper code or
                          Roll No on MCQ response sheet will be considered
                          absent.
                          <br />
                          7. This Roll No is being issued provisionally and
                          shall be confirmed subject to verification.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <hr />
        <h4 className="mdHeading mt-5 text-center mb-3">Attendance Sheets</h4>
        <AttendanceSheet selectedAtStatus={selectedAtStatus} />

        <hr />
        <h4 className="mdHeading mt-5 text-center mb-3">Confidential List</h4>
        <ConfidentialList />

        <hr />
        <ReappearStudentCount />
      </div>

      <Modal show={pdfLoading} size="sm" centered>
        <div className="px-5 py-3">
          <div className="text-center d-flex align-items-center gap-3">
            <Spinner animation="border" variant="danger" size="20" />
            <p>Generating.....</p>
          </div>
        </div>
      </Modal>

      <Modal
        show={stationModal}
        size="md"
        centered
        onHide={() => setStationModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Station Selection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="px-3 py-2">
            <div className="mb-4">
              <label htmlFor="stationSelect" className="form-label fw-semibold">
                Select Station Number
              </label>
              <select
                className="form-select form-select-lg"
                id="stationSelect"
                value={selectedStation || ""}
                onChange={(e) => handleStationChange(e.target.value)}
              >
                <option value="">Choose a station...</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((number) => (
                  <option key={number} value={String(number)}>
                    Station {number}
                  </option>
                ))}
              </select>
              <div className="form-text">
                Please select a station number from 1 to 10
              </div>

              {selectedStation && (
                <div className="mt-3 p-3 bg-light rounded">
                  <p className="mb-2">
                    You selected: <strong>Station {selectedStation}</strong>
                  </p>
                  <p className="mb-3 text-muted small">
                    This will create an Excel file with {selectedStation}{" "}
                    additional station columns.
                  </p>
                  <button
                    className="downloadButton w-100"
                    onClick={handleStationExcelSheetDownload}
                  >
                    Download Students OSPE Station List
                  </button>
                </div>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={pdfGenereted}
        size="md"
        centered
        onHide={() => setPdfGenereted(false)}
      >
        <div className="px-5 py-3 w-100">
          <div className="text-center gap-3">
            <p className="mb-3">
              <strong>Roll Number Ranges:</strong>
            </p>

            {/* Regular Students Range */}
            {regularStudentsCount > 0 && (
              <p className="mb-2">
                <span className="text-success fw-bold">Regular Students:</span>
                <br />
                {regularStudentsCount === 1 ? (
                  <>
                    Roll No:{" "}
                    <b>
                      {String(
                        parseInt(editableData.rollNumber || "0")
                      ).padStart(7, "0")}
                    </b>
                  </>
                ) : (
                  <>
                    From{" "}
                    <b>
                      {String(
                        parseInt(editableData.rollNumber || "0")
                      ).padStart(7, "0")}
                    </b>{" "}
                    to{" "}
                    <b>
                      {String(
                        parseInt(editableData.rollNumber || "0") +
                          regularStudentsCount -
                          1
                      ).padStart(7, "0")}
                    </b>
                  </>
                )}
                <br />
                <small>
                  ({regularStudentsCount} student
                  {regularStudentsCount > 1 ? "s" : ""})
                </small>
              </p>
            )}

            {/* Re-appear Students Range */}
            {reappearStudents.length > 0 && (
              <p className="mb-2">
                <span className="text-warning fw-bold">
                  Re-appear Students:
                </span>
                <br />
                {reappearStudents.length === 1 ? (
                  <>
                    Roll No:{" "}
                    <b>
                      {String(
                        parseInt(editableData.rollNumber || "0") +
                          regularStudentsCount +
                          19
                      ).padStart(7, "0")}
                    </b>
                  </>
                ) : (
                  <>
                    From{" "}
                    <b>
                      {String(
                        parseInt(editableData.rollNumber || "0") +
                          regularStudentsCount +
                          19
                      ).padStart(7, "0")}
                    </b>{" "}
                    to{" "}
                    <b>
                      {String(
                        parseInt(editableData.rollNumber || "0") +
                          regularStudentsCount +
                          20 +
                          reappearStudents.length -
                          2
                      ).padStart(7, "0")}
                    </b>
                  </>
                )}
                <br />
                <small>
                  ({reappearStudents.length} student
                  {reappearStudents.length > 1 ? "s" : ""})
                </small>
              </p>
            )}

            {/* Total Students */}
            <p className="mt-3 mb-0 pt-2 border-top">
              <strong>Total Students:</strong> {excelData[0].data.length}
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        show={atStatus}
        size="md"
        centered
        onHide={() => setAtStatus(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Exam Format</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="px-3 py-2">
            <div className="mb-4">
              <label htmlFor="stationSelect" className="form-label fw-semibold">
                Select Exam Format
              </label>
              <select
                className="form-select form-select-lg"
                id="stationSelect"
                value={selectedAtStatus || ""}
                onChange={(e) => setSelectedAtStatus(e.target.value)}
              >
                <option value="" defaultChecked>
                  Choose a Status...
                </option>
                <option value="Circuit">Online</option>
                <option value="Paper Code">Physical</option>
              </select>
            </div>

            <button
              className="downloadButton"
              onClick={() => downloadPDF("attendanceSheetContainer")}
            >
              Download Attendance Sheet PDF
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
