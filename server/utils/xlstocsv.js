import fs from 'fs';
import xlsx from 'xlsx';
import csvtojson from 'csvtojson';

export const convertXlsxToCsv=function convertXlsxToCsv(xlsxFilePath, csvFilePath) {
    try {
        const workbook = xlsx.readFile(xlsxFilePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const csvData = xlsx.utils.sheet_to_csv(sheet, {
            header:1,
            blankrows: false});
        fs.writeFileSync(csvFilePath, csvData, 'utf-8');
    } catch (error) {
        console.error('Error converting XLSX to CSV:',error);
    }
}