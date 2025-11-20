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
  const { setExcelData, setEditableData } = useSheetContext();
  const [fileName, setFileName] = useState("");
  const [rollNumLength, setRollNumLength] = useState(0);
  const [rollNumberFocus, setRollNumberFocus] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [fileUploaded, setFileUploaded] = useState(false); // New state to track file upload

  const navigate = useNavigate();

  const extractImagesFromExcel = async (file) => {
    const wb = new ExcelJS.Workbook();
    const arrayBuffer = await file.arrayBuffer();
    await wb.xlsx.load(arrayBuffer);

    const sheet = wb.worksheets[0]; // Assuming first sheet
    const imageMap = {}; // key: row number, value: image URL

    sheet.getImages().forEach((img) => {
      const imageId = img.imageId;
      const media = wb.getImage(imageId);
      const rowIndex = img.range.tl.nativeRow - 1; // top-left row of the image

      if (media?.buffer) {
        const blob = new Blob([media.buffer], {
          type: `image/${media.extension}`,
        });
        const url = URL.createObjectURL(blob);
        imageMap[rowIndex] = url;
      }
    });

    // Convert imageMap to array based on row index
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
        setExcelData(formattedData);

        // Initialize editableData with master subjects
        if (formattedData[0]?.masterSubjects) {
          setEditableData((prev) => ({
            ...prev,
            subjects: formattedData[0].masterSubjects,
          }));
        }
      };

      reader.readAsBinaryString(file);
    },
    [setExcelData, setEditableData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
      "application/vnd.ms-excel": [],
    },
  });

  // Updated transformExcelData function
  function transformExcelData(rawData, images = []) {
    if (!Array.isArray(rawData) || rawData.length < 1) return [];

    const filteredData = rawData.filter((row) => {
      const status = (row.Status || row.status || "").toLowerCase().trim();
      return status === "regular" || status === "re-appear";
    });

    // Create master subjects list with IDs first
    const allSubjects = new Map();
    let subjectIdCounter = 1;

    // First pass: collect all unique subjects
    filteredData.forEach((row) => {
      const normalizedRow = Object.keys(row).reduce((acc, key) => {
        acc[key.toLowerCase().trim()] = row[key];
        return acc;
      }, {});

      const subjects = Object.keys(normalizedRow)
        .filter((key) => key.startsWith("subject"))
        .map((key) => (normalizedRow[key] || "").trim())
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

    const students = filteredData.map((row, index) => {
      const normalizedRow = Object.keys(row).reduce((acc, key) => {
        acc[key.toLowerCase().trim()] = row[key];
        return acc;
      }, {});

      const subjectNames = Object.keys(normalizedRow)
        .filter((key) => key.startsWith("subject"))
        .map((key) => (normalizedRow[key] || "").trim())
        .filter((subject) => !!subject);

      // Map subject names to full subject objects with date and timing
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

      // FIXED: Handle different quote types in "Father's Name"
      const fatherName = (
        normalizedRow["father's name"] || // regular apostrophe
        normalizedRow["father’s name"] || // right single quote (from your Excel)
        normalizedRow["father name"] ||
        normalizedRow["father"] ||
        normalizedRow["fathers name"] ||
        ""
      ).trim();

      return {
        serialNumber: (normalizedRow["s#"] || index + 1).toString().trim(),
        rollNumber: (normalizedRow["roll #"] || "").toString().trim(),
        name: (normalizedRow["name"] || "").trim(),
        fatherName: fatherName,
        registration: (
          normalizedRow["registration"] ||
          normalizedRow["registration "] ||
          ""
        ).trim(),
        program: (normalizedRow["discipline"] || "").trim(),
        status: (normalizedRow["status"] || "").trim(),
        regionalExamCell: (normalizedRow["region"] || "").trim(),
        institute: (normalizedRow["institute"] || "").trim(),
        subjects: subjectsWithDetails,
        imagePath: images[index] || "",
      };
    });

    // Debug: Check what normalized keys we have for father's name
    if (filteredData[0]) {
      const sampleNormalized = Object.keys(filteredData[0]).reduce(
        (acc, key) => {
          acc[key.toLowerCase().trim()] = filteredData[0][key];
          return acc;
        },
        {}
      );
    }

    setEditableData((prev) => ({
      ...prev,
      institute: students[0]?.institute,
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

              {/* Loading Spinner Modal */}
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
