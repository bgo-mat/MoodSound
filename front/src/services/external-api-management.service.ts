import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {queryParams} from "./api-management.service";

@Injectable({
  providedIn: 'root'
})
export class ExternalApiManagementService {
  constructor(private _http: HttpClient) {}

  get<T>(url: string, options: {
    params?: queryParams,
    error_message?: string,
    call_without_token?: boolean,
    force?: boolean
  } = {}): Observable<T> {
    return this._http.get<T>(
      url,
      {
        withCredentials: true,
        params: options.params
      }
    );
  }

  post<T, R = T>(url: string, body?: T, options: {
    params?: queryParams,
    error_message?: string,
    call_without_token?: boolean,
    force?: boolean
  } = {}): Observable<R> {
    return this._http.post<R>(
      url,
      body,
      {
        withCredentials: true,
        params: options.params
      }
    );
  }

  patch<T, R = T>(url: string, body: T, options: {
    params?: queryParams,
    error_message?: string,
    call_without_token?: boolean,
    force?: boolean
  } = {}): Observable<R> {
    return this._http.patch<R>(
      url,
      body,
      {
        withCredentials: true,
        params: options.params
      }
    );
  }

  delete<T, R = T>(url: string, options: {
    params?: queryParams,
    error_message?: string,
    call_without_token?: boolean,
    force?: boolean
  } = {}): Observable<R> {
    return this._http.delete<R>(
      url,
      {
        withCredentials: true,
        params: options.params
      }
    );
  }
}
