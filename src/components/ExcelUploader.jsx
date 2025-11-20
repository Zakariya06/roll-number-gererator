import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { useSheetContext } from "../context/sheetData";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Modal, Spinner } from "react-bootstrap";
import DefaultSlip from "./DefaultSlip.jsx";
import StaticSlip from "./StaticSlip.jsx";

export default function ExcelUploader() {
  const { setExcelData, setEditableData, getMergedSubjects } =
    useSheetContext();

  const [fileName, setFileName] = useState("");
  const [rollNumLength, setRollNumLength] = useState(0);
  const [rollNumberFocus, setRollNumberFocus] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [fileUploaded, setFileUploaded] = useState(false);

  const navigate = useNavigate();

  const extractImagesFromExcel = async (file) => {
    const wb = new ExcelJS.Workbook();
    const arrayBuffer = await file.arrayBuffer();
    await wb.xlsx.load(arrayBuffer);

    const sheet = wb.worksheets[0];
    const imageMap = {};

    sheet.getImages().forEach((img) => {
      const imageId = img.imageId;
      const media = wb.getImage(imageId);
      const rowIndex = img.range.tl.nativeRow - 1;

      if (media?.buffer) {
        const blob = new Blob([media.buffer], {
          type: `image/${media.extension}`,
        });
        const url = URL.createObjectURL(blob);
        imageMap[rowIndex] = url;
      }
    });

    const maxRow = Math.max(...Object.keys(imageMap));
    const urls = Array.from({ length: maxRow + 1 }).map(
      (_, i) => imageMap[i] || ""
    );

    setImages(urls);
    return urls;
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      setFileName(file.name);
      setFileUploaded(true);

      // Extract images
      const imageUrls = await extractImagesFromExcel(file);

      // Read Excel data with XLSX
      const reader = new FileReader();
      reader.onload = (evt) => {
        const binaryStr = evt.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const formattedData = transformExcelData(jsonData, imageUrls);
        console.log("formated data", formattedData);
        setExcelData(formattedData);

        // Initialize editableData with master subjects (merged with static data)
        if (formattedData[0]?.masterSubjects) {
          const subjectsWithStaticData = getMergedSubjects(
            formattedData[0].masterSubjects
          );

          setEditableData((prev) => ({
            ...prev,
            subjects: subjectsWithStaticData,
          }));
        }
      };

      reader.readAsBinaryString(file);
    },
    [setExcelData, setEditableData, getMergedSubjects]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
      "application/vnd.ms-excel": [],
    },
  });

  // transformExcelData function
  function transformExcelData(rawData, images = []) {
    if (!Array.isArray(rawData) || rawData.length < 1) return [];

    console.log("this is rawData", rawData);

    const filteredData = rawData.filter((row) => {
      const status = (row.Status || row.status || "")
        .toString()
        .toLowerCase()
        .trim();
      return status === "regular" || status === "re-appear";
    });

    const allSubjects = new Map();
    let subjectIdCounter = 1;

    // First pass: collect all unique subjects
    filteredData.forEach((row) => {
      const subjects = Object.keys(row)
        .filter((key) => key.toLowerCase().startsWith("subject"))
        .map((key) => (row[key] || "").toString().trim())
        .filter((subject) => !!subject);

      subjects.forEach((subjectName) => {
        if (subjectName && subjectName.trim() !== "") {
          const cleanSubject = subjectName.trim();
          if (!allSubjects.has(cleanSubject)) {
            allSubjects.set(cleanSubject, {
              id: `subject-${subjectIdCounter++}`,
              subject: cleanSubject,
              date: "dd/mm/yyyy",
              timing: "00:00 to 00:00",
            });
          }
        }
      });
    });

    // Helper function to get field value case-insensitively
    const getFieldValue = (row, fieldNames) => {
      const lowerRow = {};

      // Create a lowercase version of all keys for case-insensitive matching
      Object.keys(row).forEach((key) => {
        lowerRow[key.toLowerCase()] = row[key];
      });

      for (const fieldName of fieldNames) {
        const lowerFieldName = fieldName.toLowerCase();
        if (
          lowerRow[lowerFieldName] !== undefined &&
          lowerRow[lowerFieldName] !== null &&
          lowerRow[lowerFieldName] !== ""
        ) {
          return lowerRow[lowerFieldName].toString().trim();
        }
      }
      return "";
    };

    const students = filteredData.map((row, index) => {
      const subjectNames = Object.keys(row)
        .filter((key) => key.toLowerCase().startsWith("subject"))
        .map((key) => (row[key] || "").toString().trim())
        .filter((subject) => !!subject);

      // Map subject names to full subject objects
      const subjectsWithDetails = subjectNames.map((subjectName) => {
        const cleanSubject = subjectName.trim();
        return (
          allSubjects.get(cleanSubject) || {
            id: `subject-${subjectIdCounter++}`,
            subject: cleanSubject,
            date: "dd/mm/yyyy",
            timing: "09:00 AM to 12:00 PM",
          }
        );
      });

      // Case-insensitive field extraction
      const fatherName = getFieldValue(row, [
        "Father's Name",
        "Father’s Name",
        "Father`s Name",
        "Father Name",
        "Fathers Name",
        "Father",
      ]);

      const serialNumber =
        getFieldValue(row, ["S#", "S.No", "Serial", "Serial Number"]) ||
        (index + 1).toString();
      const rollNumber = getFieldValue(row, [
        "Roll #",
        "Roll No",
        "Roll Number",
        "Roll",
      ]);
      const name = getFieldValue(row, ["Name", "Student Name", "Student"]);
      const registration = getFieldValue(row, [
        "Registration",
        "Registration No",
        "Reg No",
        "Reg",
      ]);
      const program = getFieldValue(row, [
        "Discipline",
        "Program",
        "Course",
        "Degree",
      ]);
      const status = getFieldValue(row, ["Status"]);
      const regionalExamCell = getFieldValue(row, [
        "Regional Exam Cell",
        "Region",
        "Exam Cell",
        "Center",
      ]);
      const institute = getFieldValue(row, [
        "Institute",
        "College",
        "School",
        "University",
      ]);

      return {
        serialNumber: serialNumber,
        rollNumber: rollNumber,
        name: name,
        fatherName: fatherName,
        registration: registration,
        program: program,
        status: status,
        regionalExamCell: regionalExamCell,
        institute: institute,
        subjects: subjectsWithDetails,
        imagePath: images[index] || "",
      };
    });

    setEditableData((prev) => ({
      ...prev,
      institute: students[0]?.institute,
      region: students[0]?.regionalExamCell,
    }));

    return [
      {
        instituteName: students[0]?.institute || "",
        list: "Status",
        semester: "",
        regionalExamCell: students[0]?.regionalExamCell || "",
        data: students,
        masterSubjects: Array.from(allSubjects.values()),
      },
    ];
  }

  return (
    <>
      <div className="appWrapper">
        {!fileUploaded ? (
          <>
            <Container className="uploadContainer">
              <Row className="justifyContentCenter">
                <Col md={8} className="mx-auto">
                  <div
                    {...getRootProps()}
                    className={`dropzone ${
                      isDragActive ? "dropzoneActive" : ""
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="dropzoneInner text-center">
                      <p className="dropTitle">
                        Drag & drop your Excel file here
                      </p>
                      <p className="dropSubtitle">or click to select file</p>
                    </div>
                  </div>
                  {fileName && (
                    <p className="fileName mt-3 text-center">
                      📄 Uploaded: {fileName}
                    </p>
                  )}
                </Col>
              </Row>

              <Modal show={pdfLoading} centered size="sm">
                <div className="text-center p-4">
                  <Spinner animation="border" variant="danger" />
                  <p className="mt-3">Processing...</p>
                </div>
              </Modal>
            </Container>

            <StaticSlip />
          </>
        ) : (
          <div className="py-5">
            <DefaultSlip
              rollNumLength={rollNumLength}
              setRollNumLength={setRollNumLength}
              rollNumberFocus={rollNumberFocus}
              setRollNumberFocus={setRollNumberFocus}
              setFileUploaded={setFileUploaded}
            />
          </div>
        )}
      </div>
    </>
  );
}
