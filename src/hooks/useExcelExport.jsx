import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const useExcelExport = () => {
  const exportToExcel = async ({
    data,
    rollStart = "0000001",
    fileName = "Confidential_List.xlsx",
    institue,
    exam,
    station = null,
  }) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Confidential List");

    // Calculate total columns based on station count
    const totalColumns = station ? 6 + Number(station) : 6;
    const lastColumn = String.fromCharCode(64 + totalColumns);

    /*** 🏫 HEADER SECTION ***/
    worksheet.mergeCells(`A1:${lastColumn}1`);
    worksheet.getCell("A1").value = institue;
    worksheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell("A1").font = { bold: true, size: 14 };

    worksheet.mergeCells(`A2:${lastColumn}2`);
    worksheet.getCell("A2").value = exam;
    worksheet.getCell("A2").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell("A2").font = { bold: true, size: 12 };

    worksheet.mergeCells(`A3:${lastColumn}3`);
    worksheet.getCell("A3").value = "OSPE";
    worksheet.getCell("A3").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell("A3").font = { bold: true, size: 12 };

    worksheet.mergeCells(`A4:${lastColumn}4`);
    worksheet.getCell("A4").value = "Subject";
    worksheet.getCell("A4").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getCell("A4").font = { bold: true, size: 12 };

    worksheet.addRow([]); // blank line

    /*** 📋 COLUMN HEADERS ***/
    const baseColumns = [
      { width: 8 },
      { width: 15 },
      { width: 25 },
      { width: 25 },
      { width: 25 },
    ];

    if (station) {
      for (let i = 0; i < Number(station); i++) baseColumns.push({ width: 15 });
      baseColumns.push({ width: 15 }); // Total Marks
    } else {
      baseColumns.push({ width: 25 }); // Student Signature
    }

    worksheet.columns = baseColumns;

    const headerRowValues = [
      "S.No",
      "Roll Number",
      "Name",
      "Father Name",
      "Registration No",
    ];

    if (station) {
      for (let i = 1; i <= Number(station); i++)
        headerRowValues.push(`Station ${i}`);
      headerRowValues.push("Total Marks");
    } else {
      headerRowValues.push("Student Signature");
    }

    const headerRow = worksheet.addRow(headerRowValues);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    /*** 🧾 STUDENT DATA ***/
    const regularStudents =
      data.filter((s) => s.status?.toLowerCase().trim() === "regular") || [];
    const reappearStudents =
      data.filter((s) => s.status?.toLowerCase().trim() === "re-appear") || [];

    const regularStudentsCount = regularStudents.length;
    const baseRoll = parseInt(rollStart);

    for (let index = 0; index < data.length; index++) {
      const student = data[index];
      const status = student.status?.toLowerCase().trim();

      let rollNum;

      if (status === "regular") {
        // NORMAL ROLL NUMBERS
        rollNum = baseRoll + index;
      } else if (status === "re-appear") {
        // CORRECTED LOGIC ✔ (NO MORE REPEATING 28,28,28,...)
        const reappearIndex = reappearStudents.indexOf(student); // FIXED ✔

        if (regularStudentsCount > 0) {
          const lastRegularRoll = baseRoll + regularStudentsCount - 1;
          rollNum = lastRegularRoll + 20 + reappearIndex; // NOW 28,29,30,31... ✔
        } else {
          rollNum = baseRoll + reappearIndex;
        }
      } else {
        rollNum = baseRoll + index;
      }

      const rollText =
        String(rollNum).padStart(7, "0") +
        (status === "re-appear" ? " (RA)" : "");

      const rowData = [
        index + 1,
        rollText,
        student.name,
        student.fatherName,
        student.registration,
      ];

      if (station) {
        for (let i = 0; i < Number(station); i++) rowData.push("");
        rowData.push("");
      } else {
        rowData.push("");
      }

      const dataRow = worksheet.addRow(rowData);
      dataRow.height = 25;
      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    }

    /*** 💾 SAVE FILE ***/
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    try {
      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: "Excel Spreadsheet",
              accept: {
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                  [".xlsx"],
              },
            },
          ],
        });

        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();

        alert("✅ Excel file saved successfully!");
      } else {
        // fallback for older browsers
        saveAs(blob, fileName);
      }
    } catch (err) {
      console.error("❌ Excel save error:", err);
      alert("Something went wrong while saving the Excel file.");
    }
  };

  return { exportToExcel };
};

export default useExcelExport;
