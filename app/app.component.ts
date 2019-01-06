import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpRequest } from '@angular/common/http';
import {forEach} from '@angular/router/src/utils/collection';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Top Awards Asia';
  concepts: any;

  root_end_point = 'http://34.221.74.184:80/';
  // root_end_point = 'http://127.0.0.1:80/';
  image_url: any;
  search_item = '';
  isRunnable = false;
  urls = [];
  image_idx = 0;
  image_file: File;

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
  }

  healthcheck() {
    this.http.get(this.root_end_point).subscribe(data => {
      this.concepts = JSON.stringify(data);
    });
  }

  isShow () {
    return (this.urls.length > 0);
  }

  isShowImage() {
    return(this.isShow() || this.image_file.size > 0);
  }

  preview(event) {
    this.concepts = '';
    this.image_file = event.target.files[0];

    const mimeType = this.image_file.type;
    if (mimeType.match(/image\/*/) == null) {
      // this.message = "Only images are supported.";
      this.concepts = {'error' : 'Only images are supported.' };
      return;
    }

    const reader = new FileReader();
    reader.onload = e => this.image_url = reader.result;
    reader.readAsDataURL(this.image_file);
  }

  predictFile() {
    const full_url = this.root_end_point + 'uploadimage/';

    const formData = new FormData();
    formData.append('image', this.image_file, this.image_file.name);

    const head = new HttpHeaders({'enctype': 'multipart/form-data'});
    const opt = {headers: head};
    this.http.post('http://34.221.74.184:80/uploadimage', formData, opt)
      .subscribe(
        (response) => {
          const result = this.predictResult(response);
          // this.concepts = JSON.stringify(response);
          this.concepts = result;
        },
        (err) => {
          this.concepts = JSON.stringify({'err': err['message']});
        }
      )
    ;
  }

  predictResult(resp) {
    let buff = '';

    if (typeof resp === 'string') {
      const myObj = JSON.parse(resp);
      for (const aPattern in myObj) {
        if (myObj.hasOwnProperty(aPattern)) {
          buff = buff + aPattern + ':' + '\n';
          const lstPattern = myObj[aPattern];
          for (let j = 0; j < lstPattern.length; j++) {
            buff += lstPattern[j].name;
            buff += ' ';
            buff += lstPattern[j].value;
            buff += '\n';
          }
        }
      }
    }
    return buff;
  }

  upSearchItem(event: any) {
    this.search_item = event.target.value;
  }

  getSearchImages() {
    const full_url = this.root_end_point + 'search/' + this.search_item;
    this.isRunnable = true;
    this.http.get(full_url).subscribe(data => {
      const resp = data;
      if (typeof resp === 'string') {
        this.urls = JSON.parse(resp);
        if (this.urls.length > 0) {
          this.image_idx = 0;
          this.image_url = this.urls[this.image_idx];
        }
      }
      this.isRunnable = false;
    });
  }

  nextImage() {
    if (this.urls.length > this.image_idx) {
      this.isRunnable = true;
      this.image_idx += 1;
      this.image_url = this.urls[this.image_idx];
      this.isRunnable = false;
    }
  }

  prevImage() {
    if (this.image_idx >= 0) {
      this.isRunnable = true;
      this.image_idx -= 1;
      this.image_url = this.urls[this.image_idx];
      this.isRunnable = false;
    }
  }

  getPredictUrl() {
    this.isRunnable = true;
    const full_url = this.root_end_point + 'predicturl/' + this.image_url;
    this.http.get(full_url).subscribe(data => {
      const result = this.predictResult(data);
      this.concepts = result;
      this.isRunnable = false;
    });
  }
}
