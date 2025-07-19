import ExcelJS from 'exceljs';

export async function readExcelDynamic(filePath: string): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) { return []; }

    let headers: string[] = [];
    const data: any[] = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        const values = row.values as any[];

        if (rowNumber === 1) {
            headers = values.slice(1);
        } else {
            const rowData: any = {};
            for (let i = 1; i < values.length; i++) {
                const key = headers[i - 1];
                rowData[key] = values[i];
            }
            data.push(rowData);
        }
    });

    return data;
}


export async function readExcelDynamicBuffer(buffer: any): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
        return [];
    }

    let headers: string[] = [];
    const data: any[] = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        const values = row.values as any[];

        if (rowNumber === 1) {
            headers = values.slice(1);
        } else {
            const rowData: any = {};
            for (let i = 1; i < values.length; i++) {
                const key = headers[i - 1];
                rowData[key] = values[i];
            }
            data.push(rowData);
        }
    });

    return data;
}
