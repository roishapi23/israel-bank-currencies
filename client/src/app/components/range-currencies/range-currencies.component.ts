import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/services/api/api.service';
import { SharedService } from 'src/app/services/shared/shared.service';

@Component({
  selector: 'app-range-currencies',
  templateUrl: './range-currencies.component.html',
  styleUrls: ['./range-currencies.component.css']
})
export class RangeCurrenciesComponent implements OnInit {

  rangeForm = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  loadingText: string;
  userAmount: number;
  errorMessage: string | null;

  today: Date = new Date();

  displayedColumns: string[] = [];

  displayedResultDates: string;

  selectedCoins = new FormControl();

  dataSource = new MatTableDataSource<any[]>([]);

  constructor( private spinner: NgxSpinnerService ,private api: ApiService,public sharedService: SharedService) {}

  ngOnInit(): void {}

  changeRangeDates(){
    this.errorMessage = null; /* init error message */
    if (!this.inputValidations()) return; /* form validation */

    // get chosen dates
    let start = this.prettyDate(this.rangeForm.value.start);
    let end = this.prettyDate(this.rangeForm.value.end);

    // show loading
    this.loadingText = ` טוען מטבעות מהתאריכים ${start} - ${end}` ;
    this.spinner.show();

    // api request to get the wanted data
    this.api.getRangeDatesCurrencies({ start: start , end: end , coins: this.selectedCoins.value }).subscribe(data=>{
      this.displayedColumns = data[0]; /* extract table header data (coin names) */
      this.dataSource = new MatTableDataSource<any[]>(data.splice(1,data.length)); /* display all the currency data on the table */
      this.spinner.hide(); /* hide loading */
      this.displayedResultDates = `${start} - ${end}`; /* display the current result dates */

    }, error => {
      // handle error
      this.errorMessage = `הבקשה נכשלה, ייתכן שאין תוצאות לתאריכים המבוקשים`
      this.spinner.hide();
    });
  }

  public get allCoins() : string[] {
    return this.api.allCoins;
  }

  inputValidations(){
    if (!this.selectedCoins.value) {
      this.errorMessage = 'אנא בחר לפחות מטבע אחד';
      return false;
    }
    if (!this.userAmount) {
      this.errorMessage = 'אנא הזן סכום';
      return false;
    }

    return true;
  }

  // setting date to dd/mm/yyyy string
  prettyDate(date:Date) {
    return this.sharedService.prettyDate(date);
  }

  // displaying the currency value with the user coins amount
  calculateCurrencyValue(currencyValue: number){
    return this.sharedService.calculateCurrencyValue(currencyValue,this.userAmount);
  }

  export(){
    // get only picked coins
    let exportedDates = this.dataSource.data.map(d => this.toSheetsObj(d));
    // set file name
    let fileName =  `ערכי מטבעות - ${this.displayedResultDates}.xlsx`;
    // export to xlsx file
    this.sharedService.exportToExcel(exportedDates,fileName);
  }

  // modify data for the xlsx file - return an object with date and it's coins currencies
  toSheetsObj(currency: string[]){
    let obj = {};
    obj[this.displayedColumns[0]] = currency[0];
    for (let index = 1; index < this.displayedColumns.length; index++) {
      obj[this.displayedColumns[index]] = +this.calculateCurrencyValue(+currency[index]);
    }
    return obj;
  }

}
