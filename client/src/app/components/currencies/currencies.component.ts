import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from 'src/app/services/api/api.service';
import { SharedService } from 'src/app/services/shared/shared.service';

export interface CurrencyData {
  coin: string,
  amount: number,
  country: string,
  currency: number,
}


@Component({
  selector: 'app-currencies',
  templateUrl: './currencies.component.html',
  styleUrls: ['./currencies.component.css']
})

export class CurrenciesComponent implements OnInit {

  allCoins: string[] = [];

  selectedCoins = new FormControl();

  currencies: CurrencyData[];
  userAmount: number;
  date: Date = new Date();
  displayedResultDate: Date;

  dataSource = new MatTableDataSource<CurrencyData>([]);

  displayedColumns: string[] = ['coin','country','amount','currency'];

  loadingText: string;

  errorMessage: string | null;

  rangeForm = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  constructor(private api: ApiService, private spinner: NgxSpinnerService, public sharedService: SharedService) {
    /* by default on load display yesterday currencies */
    this.date.setDate(this.date.getDate() - 1);
    this.loadData();
  }

  ngOnInit(): void {
  }

  getNewDateCurrencies(){
    this.errorMessage = null; /* init error message */
    if (!this.inputValidations()) return; /* form validation */
    this.loadData();
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
    if (this.date == this.displayedResultDate) { /* if user didn't change the date */
      this.errorMessage = 'אנא בחר תאריך חדש';
      return false;
    }
    return true;
  }

  loadData(){
    // show loading
    this.loadingText = `טוען ערכי מטבעות מתאריך ${this.prettyDate(this.date)}`;
    this.spinner.show();

    // api request to get the wanted data
    this.api.getSingleDateCurrencies({date:this.prettyDate(this.date)}).subscribe(data=>{

      this.currencies = data;
      /* extract all coins */
      this.allCoins = (data as any[]).map(c => c = `${c.coin}-${c.country}`);
      this.api.allCoins = this.allCoins;
      /* display only selected coins */
      this.filterByCoin();
      // hide loading
      this.spinner.hide();
      // update ui 'displayed date' text to the new date
      this.displayedResultDate = this.date;
    },error => {
      // handle error
      if (error.status == 600) {
        this.errorMessage = `לתאריך ${this.prettyDate(this.date)} אין מידע על מטבעות, אנא בחר תאריך אחר`
      }
      else {
        this.errorMessage = `הבקשה נכשלה, אנא נסה שוב`
      }
      this.spinner.hide();
    });
  }

  changeDate(event: MatDatepickerInputEvent<Date>) {
    this.date = event.value;
  }

  // setting date to dd/mm/yyyy string
  prettyDate(date:Date) {
    return this.sharedService.prettyDate(date);
  }


  filterByCoin(){
    if (this.selectedCoins.value?.length > 6) return; /* Don't let the user pick more then 6 coins */
    // displaying only the coins that the user picked
    this.dataSource = new MatTableDataSource<CurrencyData>(this.currencies.filter(c => this.selectedCoins.value?.includes(`${c.coin}-${c.country}`)));
  }

  // displaying the currency value with the user coins amount
  calculateCurrencyValue(currencyValue: number){
    return this.sharedService.calculateCurrencyValue(currencyValue,this.userAmount);
  }


  export(){
    // get only picked coins and arrange data to sheet object
    let exportedCurrencies = this.currencies.filter(c => this.selectedCoins.value?.includes(`${c.coin}-${c.country}`)).map(c => this.toSheetsObj(c));
    // define file name
    let fileName = `ערכי מטבעות - ${this.prettyDate(this.displayedResultDate)}.xlsx`;
    // export to xlsx file
    this.sharedService.exportToExcel(exportedCurrencies,fileName);

  }

  // modify data for the xlsx file
  toSheetsObj(currency: CurrencyData){
    return {
      "מטבע": currency.coin,
      "היחידה": this.userAmount ? currency.amount*this.userAmount : currency.amount,
      "המדינה": currency.country,
      "השער": +this.calculateCurrencyValue(currency.currency)
    }
  }

  public get today() : Date {
    return new Date();
  }

}
