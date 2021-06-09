import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor() { }

  exportToExcel(data: any, fileName: string){
    // // xlsx package
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    var wscols = [
      { wpx: 160 },
      { wpx: 160 },
      { wpx: 160 },
      { wpx: 160 },
      { wpx: 160 },
      { wpx: 160 },
      { wpx: 160 }
    ];
    ws['!cols'] = wscols;
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // save to file
    XLSX.writeFile(wb, fileName);
  }

  // setting date to dd/mm/yyyy string
  prettyDate(date:Date) {
    let day = date.getDate();
    let month = date.getMonth()+1;
    let year = date.getFullYear()
    return `${( day > 9 ? '' : '0') + date.getDate()}/${( month > 9 ? '' : '0') + month}/${year}`;
  }

  calculateCurrencyValue(currencyValue: number, userAmount:number){
    return (currencyValue * (userAmount ? userAmount : 1 )).toFixed(4);
  }
}
