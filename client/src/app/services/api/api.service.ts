import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { CurrencyData } from 'src/app/components/currencies/currencies.component';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  allCoins: string[] = [];

  constructor(private http: HttpClient) { }

  getSingleDateCurrencies( date: {date:string} ) : Observable<CurrencyData[]>{
    return this.http.post<CurrencyData[]>("http://localhost:3000/singleDate",date);
  }

  getRangeDatesCurrencies( data: {start:string,end:string, coins:string[]} ) : Observable<any[]>{
    console.log(data);

    return this.http.post<any[]>("http://localhost:3000/rangeDates",data);
  }

}
