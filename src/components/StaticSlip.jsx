import ihslogo from "../assets/kmu_ihs_logo.png";
import signature from "../assets/signature.png";
import logo from "../assets/khyber_medical_university_logo.jpeg";
import { useSheetContext } from "../context/sheetData"; 

const StaticSlip = () => {
  const { excelData, editableData } = useSheetContext();

  return (
    <div className="admitCardContainer">
      <div className="mainBorder">
        {/* Header Section */}
        <div className="headerSection">
          <div className="ihsLogoWrapper">
            <img src={logo} alt="KMU" className="kmuLogo" />

            {/* IHS Logo with upload functionality */}
            <div
              className="ihsLogoContainer"
              style={{ position: "relative", display: "inline-block" }}
            >
              {editableData.logoImagePath && (
                <img
                  src={editableData.logoImagePath}
                  alt="ihs logo"
                  className="ihsLogo mt-2"
                />
              )}
            </div>
          </div>

          <div className="titleSection">
            <h1 className="universityTitle">Khyber Medical University</h1>
            <p className="programTitle">
              Regional Exam Cell - {editableData.region}
            </p>
            <input
              type="text"
              className="semesterTitle"
              value={editableData.semesterTitle}
              disabled
              style={{ width: "100%", textAlign: "center", border: "none" }}
            />
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
                <input
                  type="text"
                  className="infoValue"
                  value={editableData.name}
                  disabled
                />
              </div>
              <div className="infoItem" style={{ flex: 1 }}>
                <span className="infoLabel">Father Name:</span>
                <input
                  type="text"
                  className="infoValue"
                  disabled
                  value={editableData.fatherName}
                />
              </div>
              <div className="infoItem">
                <span className="infoLabel">Roll No:</span>
                <input
                  type="number"
                  className={`infoValue `}
                  value={editableData.rollNumber}
                  disabled
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value.length >= 7) {
                      value = value.slice(0, 7);
                    } else {
                    }
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
                        disabled
                        value={editableData.registrationNo}
                      />
                    </div>
                    <div className="infoItem mt-2" style={{ flex: 1 }}>
                      <span className="infoLabel">Institute:</span>
                      <span className="infoValue">
                        {editableData.institute && editableData.institute}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Examination Schedule Table */}
                <div className="examTableWrapper mt-3 w-100">
                  <table className="examTable ">
                    <colgroup>
                      <col width={"5%"} />
                      <col width={"45%"} />
                      <col width={"20%"} />
                      <col width={"30%"} />
                    </colgroup>
                    <thead>
                      <tr className="  tableHeader ">
                        <th className="tableHeaderCell">S.No</th>
                        <th className="tableHeaderCell">Subject</th>
                        <th className="tableHeaderCell">Date</th>
                        <th className="tableHeaderCell">Timing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editableData?.subjects?.map((sub, i) => (
                        <tr key={i} className="tableRow">
                          <td className="tableCell" style={{ width: "40px" }}>
                            {i + 1}
                          </td>
                          <td className="tableCell text-start">
                            {sub.subject}
                          </td>
                          <td className="tableCell">{sub.date}</td>
                          <td className="tableCell deleteRowCell">
                            {sub.timing}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Exam Center */}
                <div className="examCenterSection w-100">
                  <span className="examCenterLabel">Exam Center: </span>
                  <input
                    type="text"
                    className="examCenterValue"
                    value={editableData.examCenter}
                    style={{ flex: 1, border: "none" }}
                    disabled
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

        {/* Instructions */}
        <div className="instructionsSection">
          <div className="instructionsList">
            <div className="static-instructions">
              <p className="instructionItem">
                1. You are advised to report at exam centre thirty (30) minutes
                before the scheduled paper time.
                <br />
                2. You are advised to bring this ROLL NO SLIP along with your
                Original National ID Card / Passport or B-Form or Matric
                Certificate (less than 18 years age) containing your photograph
                (mandatory). Candidates failing to produce ROLL NO SLIP and
                Original CNIC would not be allowed to enter the examination
                hall.
                <br />
                3. If your CNIC/B Form is lost, please bring a copy of FIR,
                Newspaper cutting and Original NADRA token showing that you have
                applied for the same.
                <br />
                4. Please don't bring any of Gadgets with you. Candidates shall
                be searched for cellphones/smart/watch/electronic devices and if
                found, it will be confiscated and UFM case shall be registered
                accordingly.
                <br />
                5. No candidate will be allowed to enter the examination hall
                after 15 minutes of the start of paper.
                <br />
                6. Any student who fails to fill the paper code or Roll No on
                MCQ response sheet will be considered absent.
                <br />
                7. This Roll No is being issued provisionally and shall be
                confirmed subject to verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticSlip;
