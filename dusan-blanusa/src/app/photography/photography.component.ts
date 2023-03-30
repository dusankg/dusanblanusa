import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-photography',
  templateUrl: './photography.component.html',
  styleUrls: ['./photography.component.css']
})
export class PhotographyComponent{
  public slikaZaPrikaz: string = "";
  public nizSlika: string[]  = [
  'https://live.staticflickr.com/65535/52781083167_781786c092_k.jpg', 
  'https://live.staticflickr.com/65535/52781867289_16bcac7145_k.jpg',
  'https://live.staticflickr.com/65535/52782029155_7196164cb7_k.jpg',
  'https://live.staticflickr.com/65535/52781076627_433eadf783_k.jpg',
  'https://live.staticflickr.com/65535/52782159473_4289a18955_k.jpg',
  'https://live.staticflickr.com/65535/52781865994_f618edb035_k.jpg',
  'https://live.staticflickr.com/65535/52782084893_5a9aead4af_k.jpg',
  'https://live.staticflickr.com/65535/52782088103_df4f4f9b0a_k.jpg',
  'https://live.staticflickr.com/65535/52781622366_ca06d75645_k.jpg',
  'https://live.staticflickr.com/65535/52781868419_30742053db_k.jpg']
  public hiddenBigImage: boolean = true;



  public showImage(image:string){
    this.slikaZaPrikaz = image;
    this.hiddenBigImage = false;
  }

  public nextImage(){
    var index = this.nizSlika.indexOf(this.slikaZaPrikaz)
    index += 1;
    if(index >= this.nizSlika.length){
      index = 0;
    }
    this.slikaZaPrikaz = this.nizSlika[index];
  }

  public previousImage(){
    var index = this.nizSlika.indexOf(this.slikaZaPrikaz)
    index -= 1;
    if(index < 0){
      index = this.nizSlika.length - 1;
    }
    this.slikaZaPrikaz = this.nizSlika[index];
  }

  public closeBigImage(){
    this.hiddenBigImage = true;
  }
}
