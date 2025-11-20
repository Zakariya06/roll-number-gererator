import { useEffect, useState, useRef } from "react";
import { useSheetContext } from "../context/sheetData";
import {
  FiEdit,
  FiPlusCircle,
  FiSave,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { FaPlus } from "react-icons/fa";
import logo from "../assets/khyber_medical_university_logo.jpeg";
import ihslogo from "../assets/kmu_ihs_logo.png";
import signature from "../assets/signature.png";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import StaticSlip from "./StaticSlip";

const DefaultSlip = ({
  setRollNumLength,
  setRollNumberFocus,
  rollNumberFocus,
  rollNumLength,
  setFileUploaded,
}) => {
  const { excelData, editableData, setEditableData } = useSheetContext();
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [showSlip, setShowSlip] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  // Default instructions text
  const defaultInstructionsText = `1. You are advised to report at exam centre thirty (30) minutes before the scheduled paper time.\n2. You are advised to bring this ROLL NO SLIP along with your Original National ID Card / Passport or B-Form or Matric Certificate (less than 18 years age) containing your photograph (mandatory). Candidates failing to produce ROLL NO SLIP and Original CNIC would not be allowed to enter the examination hall.\n3. If your CNIC/B Form is lost, please bring a copy of FIR, Newspaper cutting and Original NADRA token showing that you have applied for the same.\n4. Please don't bring any of Gadgets with you. Candidates shall be searched for cellphones/smart/watch/electronic devices and if found, it will be confiscated and UFM case shall be registered accordingly.\n5. No candidate will be allowed to enter the examination hall after 15 minutes of the start of paper.\n6. Any student who fails to fill the paper code or Roll No on MCQ response sheet will be considered absent.\n7. This Roll No is being issued provisionally and shall be confirmed subject to verification.`;

  // Initialize subjects from Excel data when component mounts
  useEffect(() => {
    if (excelData[0]?.data && editableData.subjects.length === 0) {
      const uniqueSubjects = getAllUniqueSubjects();
      const initialSubjects = uniqueSubjects.map((subject, index) => ({
        id: `subject-${index}-${Date.now()}`,
        subject: subject,
        date: "dd/mm/yy",
        timing: "00:00 to 00:00",
      }));

      setEditableData((prev) => ({
        ...prev,
        subjects: initialSubjects,
      }));
    }
  }, [excelData, editableData.subjects.length, setEditableData]);

  const handleSaveInstructions = () => {
    setIsEditingInstructions(false);
  };

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

  const handleInputChange = (e, key, index) => {
    if (key === "subjects") {
      const updatedSubjects = [...editableData.subjects];
      updatedSubjects[index][e.target.name] = e.target.value;
      setEditableData({ ...editableData, subjects: updatedSubjects });
    } else {
      setEditableData({ ...editableData, [key]: e.target.value });
    }
  };

  // Handle subject changes
  const handleSubjectChange = (index, field, value) => {
    const updatedSubjects = [...editableData.subjects];
    updatedSubjects[index][field] = value;
    setEditableData({ ...editableData, subjects: updatedSubjects });
  };

  // Handle subject name change specifically
  const handleSubjectNameChange = (index, newSubjectName) => {
    const updatedSubjects = [...editableData.subjects];
    updatedSubjects[index].subject = newSubjectName;
    setEditableData({ ...editableData, subjects: updatedSubjects });
  };

  const addNewRow = () => {
    const newRow = {
      id: `new-${Date.now()}`,
      subject: "New Subject",
      date: "dd/mm/yyyy",
      timing: "00:00 to 00:00",
    };
    const updated = [...editableData.subjects, newRow];
    setEditableData({ ...editableData, subjects: updated });
  };

  const deleteRow = (index) => {
    const updated = [...editableData.subjects];
    updated.splice(index, 1);
    setEditableData({ ...editableData, subjects: updated });
  };

  // Handle logo upload
  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setEditableData({
          ...editableData,
          logoImagePath: imageUrl,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleGenerateRollNumbers = () => {
    const currentRollNumLength = String(rollNumLength).length;
    if (currentRollNumLength < 7) {
      enqueueSnackbar("Roll Number should be exactly 7 characters.");
      setRollNumberFocus(true);
      return;
    }
    navigate("/rollNumbers");
  };

  // Handle Edit button click - toggle between static and edit mode
  const handleEditClick = () => {
    if (showSlip) {
      // Currently in edit mode, save and go back to static
      setShowSlip(false);
      setEditMode(false);
      enqueueSnackbar("Changes saved successfully!", { variant: "success" });
    } else {
      // Currently in static mode, switch to edit mode
      setShowSlip(true);
      setEditMode(true);
    }
  };

  // Handle Generate button click
  const handleGenerateClick = () => {
    handleGenerateRollNumbers();
  };

  useEffect(() => {
    setRollNumLength(editableData.rollNumber);
  }, [editableData.rollNumber]);

  return (
    <>
      {/* Top Action Buttons - Always Visible */}
      <div className="top-action-buttons mb-4 text-center">
        <button
          className="edit-button me-3"
          onClick={handleEditClick}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: "600",
            backgroundColor: showSlip ? "#28a745" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {showSlip ? (
            <>
              <FiSave style={{ marginRight: "8px" }} />
              Save Changes
            </>
          ) : (
            <>
              <FiEdit style={{ marginRight: "8px" }} />
              Edit Slip
            </>
          )}
        </button>

        <button
          className="downloadButton me-3"
          onClick={() => setFileUploaded(false)}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: "600",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Back to Upload
        </button>

        <button
          className="generateButton"
          onClick={handleGenerateClick}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: "600",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            opacity: showSlip ? 0.6 : 1,
          }}
          disabled={showSlip}
        >
          Generate Roll Numbers
        </button>
      </div>

      {/* Show StaticSlip by default, Editable slip when in edit mode */}
      {showSlip ? (
        // EDIT MODE - Everything is editable
        <div className="admitCardContainer">
          <div className="mainBorder">
            {/* Header Section */}
            <div className="headerSection">
              <div className="ihsLogoWrapper d-flex align-items-center">
                <img src={logo} alt="KMU" className="kmuLogo" />

                {/* IHS Logo with upload functionality */}
                <div
                  className="ihsLogoContainer"
                  onMouseEnter={() => setIsLogoHovered(true)}
                  onMouseLeave={() => setIsLogoHovered(false)}
                  style={{
                    position: "relative",
                    width: "60px",
                    height: editableData.logoImagePath ? "auto" : "60px",
                  }}
                >
                  {editableData.logoImagePath ? (
                    <img
                      src={editableData.logoImagePath}
                      alt="ihs logo"
                      className="ihsLogo  "
                    />
                  ) : (
                    <>
                      {/* Upload overlay */}
                      <div
                        className="logoUploadOverlay"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "4px",
                          padding: "1rem",
                          width: "60px",
                          height: "60px",
                          cursor: "pointer",
                        }}
                        onClick={triggerFileInput}
                      >
                        <FiUpload
                          style={{
                            color: "white",
                            fontSize: "24px",
                            filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))",
                          }}
                        />
                      </div>
                    </>
                  )}

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              <div className="titleSection">
                <h1 className="universityTitle">Khyber Medical University</h1>
                <p className="programTitle">
                  Regional Exam Cell - {excelData[0]?.regionalExamCell}
                </p>
                <input
                  type="text"
                  className="semesterTitle"
                  value={editableData.semesterTitle}
                  style={{ width: "100%", textAlign: "center" }}
                  onChange={(e) => handleInputChange(e, "semesterTitle")}
                />
                <p className="studentCopyText">[Student Copy]</p>
              </div>

              <div className="noticeBox">
                <p className="noticeText">Cell Phone, Smart Watch</p>
                <p className="noticeText">or any Electronic Gadgets</p>
                <p className="noticeText">are not allowed</p>
              </div>
            </div>

            {/* Student Information - Everything Editable */}
            <div className="studentInfoSection mt-5">
              <div className="studentDetails">
                <div className="infoRow">
                  <div className="infoItem" style={{ flex: 1 }}>
                    <span className="infoLabel">Name:</span>
                    <input
                      type="text"
                      className="infoValue"
                      value={editableData.name}
                      onChange={(e) => handleInputChange(e, "name")}
                    />
                  </div>
                  <div className="infoItem" style={{ flex: 1 }}>
                    <span className="infoLabel">Father Name:</span>
                    <input
                      type="text"
                      className="infoValue"
                      value={editableData.fatherName}
                      onChange={(e) => handleInputChange(e, "fatherName")}
                    />
                  </div>
                  <div className="infoItem">
                    <span className="infoLabel">Roll No:</span>
                    <input
                      type="number"
                      className={`infoValue ${rollNumberFocus && "inputFocus"}`}
                      value={editableData.rollNumber}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value.length >= 7) {
                          value = value.slice(0, 7);
                          setRollNumberFocus(false);
                        } else {
                          setRollNumberFocus(true);
                        }
                        handleInputChange(
                          { target: { value: value } },
                          "rollNumber"
                        );
                      }}
                      maxLength={7}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-9">
                    <div className="infoRow">
                      <div className=" mt-1 w-100">
                        <div className="infoItem">
                          <span className="infoLabel">Registration No:</span>
                          <input
                            type="text"
                            className="infoValue"
                            value={editableData.registrationNo}
                            onChange={(e) =>
                              handleInputChange(e, "registrationNo")
                            }
                          />
                        </div>
                        <div className="infoItem mt-2" style={{ flex: 1 }}>
                          <span className="infoLabel">Institute:</span>
                          <input
                            type="text"
                            className="infoValue"
                            value={editableData.institute}
                            onChange={(e) => handleInputChange(e, "institute")}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Examination Schedule Table - Fully Editable */}
                    <div className="examTableWrapper mt-3 w-100">
                      <table className="examTable ">
                        <colgroup>
                          <col width={"5%"} />
                          <col width={"45%"} />
                          <col width={"20%"} />
                          <col width={"30%"} />
                        </colgroup>
                        <thead>
                          <tr className="tableHeader">
                            <th className="tableHeaderCell">S.No</th>
                            <th className="tableHeaderCell">Subject</th>
                            <th className="tableHeaderCell">Date</th>
                            <th className="tableHeaderCell">Timing</th>
                          </tr>
                        </thead>
                        <tbody>
                          {editableData.subjects.map((subject, index) => (
                            <tr key={subject.id} className="tableRow">
                              <td
                                className="tableCell"
                                style={{ width: "40px" }}
                              >
                                {index + 1}
                              </td>
                              <td className="tableCell">
                                <input
                                  type="text"
                                  value={subject.subject}
                                  className="tableCellInput"
                                  onChange={(e) =>
                                    handleSubjectNameChange(
                                      index,
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                              <td className="tableCell">
                                <input
                                  type="text"
                                  value={subject.date}
                                  className="tableCellInput"
                                  onChange={(e) =>
                                    handleSubjectChange(
                                      index,
                                      "date",
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                              <td
                                className="tableCell  deleteRowCell"
                                style={{ position: "relative" }}
                              >
                                <input
                                  type="text"
                                  value={subject.timing}
                                  className="tableCellInput"
                                  onChange={(e) =>
                                    handleSubjectChange(
                                      index,
                                      "timing",
                                      e.target.value
                                    )
                                  }
                                />
                                <FiTrash2
                                  onClick={() => deleteRow(index)}
                                  style={{
                                    cursor: "pointer",
                                    color: "red",
                                    marginLeft: "8px",
                                    position: "absolute",
                                    right: "5px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                  }}
                                  title="Delete this subject"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <FaPlus
                        onClick={() => addNewRow()}
                        title="Add new subject"
                        className="addnewRowButton"
                      />
                    </div>

                    {/* Exam Center - Editable */}
                    <div className="examCenterSection w-100">
                      <span className="examCenterLabel">Exam Center: </span>
                      <input
                        type="text"
                        className="examCenterValue"
                        value={editableData.examCenter}
                        style={{ flex: 1 }}
                        onChange={(e) => handleInputChange(e, "examCenter")}
                      />
                    </div>
                  </div>

                  <div className="col-3">
                    <div className="photoContainer ms-auto">
                      <div className="photoPlaceholder text-center">
                        Student Photo
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-4 ms-auto">
                  {/* Signature Section */}
                  <div className="signatureSection text-center">
                    <div className="signatureSpace">
                      <img src={signature} alt="sign" className="signImage" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions - Editable */}
            <div className="instructionsSection">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="instructionsTitle mb-0">INSTRUCTIONS :</h3>
                {!isEditingInstructions ? (
                  <FiEdit
                    className="edit-icon"
                    onClick={() => setIsEditingInstructions(true)}
                    style={{
                      cursor: "pointer",
                      fontSize: "20px",
                      color: "#666",
                    }}
                    title="Edit Instructions"
                  />
                ) : (
                  <div className="d-flex gap-2">
                    <FiSave
                      className="save-icon"
                      onClick={handleSaveInstructions}
                      style={{
                        cursor: "pointer",
                        fontSize: "20px",
                        color: "green",
                      }}
                      title="Save Instructions"
                    />
                    <FiX
                      className="cancel-icon"
                      onClick={() => setIsEditingInstructions(false)}
                      style={{
                        cursor: "pointer",
                        fontSize: "20px",
                        color: "red",
                      }}
                      title="Cancel Editing"
                    />
                  </div>
                )}
              </div>

              <div className="instructionsList">
                {isEditingInstructions ? (
                  // Edit mode - show single textarea
                  <div className="editable-instructions">
                    <textarea
                      value={
                        editableData.instructionsText || defaultInstructionsText
                      }
                      onChange={(e) =>
                        setEditableData({
                          ...editableData,
                          instructionsText: e.target.value,
                        })
                      }
                      className="form-control instruction-textarea"
                      rows="8"
                      placeholder="Enter instructions text (use line breaks for new points)..."
                    />
                    <div className="form-text mt-2">
                      Tip: Press Enter for new lines. Each line will be treated
                      as a separate point.
                    </div>
                  </div>
                ) : (
                  // View mode - show the single paragraph with line breaks
                  <div className="static-instructions">
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
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // STATIC MODE - Show StaticSlip (non-editable)
        <StaticSlip />
      )}
    </>
  );
};

export default DefaultSlip;
