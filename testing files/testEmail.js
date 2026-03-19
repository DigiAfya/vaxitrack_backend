const ExcelJS = require("exceljs");

async function createExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Test");

  worksheet.columns = [
    { header: "Name", key: "name" },
    { header: "Age", key: "age" },
  ];

  worksheet.addRow({ name: "John", age: 25 });

  await workbook.xlsx.writeFile("test.xlsx");

  console.log("Excel file created!");
}

createExcel();
