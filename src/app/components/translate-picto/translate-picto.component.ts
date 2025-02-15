import { Component, OnInit } from '@angular/core';
import {NgForm} from "@angular/forms";
import {LanguageService} from "../../services/language-service";
import {MatDialog} from "@angular/material/dialog";
import {DialogMaxWordsComponent} from "../dialog-max-words/dialog-max-words.component";
import {EditionService} from "../../services/edition-service";
declare var monitorInput:any;
declare var getUrlPicto:any;
declare var getTokensForTS:any;
declare var getKeyPicto:any;

@Component({
  selector: 'app-translate-picto',
  templateUrl: './translate-picto.component.html',
  styleUrls: ['./translate-picto.component.css']
})
export class TranslatePictoComponent implements OnInit {

  result:string[][] = [];
  displayResult:string[][] = [];
  resultTab:string[] = [];
  cellsToScroll:number = 4;
  wordSearch:string = '';
  banksChecked:string[] = [];
  wordsText: any;
  keyPicto:string[][] = [];


  constructor(public languageService: LanguageService,
              public editionService: EditionService,
              public dialog: MatDialog) { }

  ngOnInit(): void {}

  onSubmit(formText: NgForm) {
    this.resetRequest();
    this.wordSearch = formText.form.value.text;
    const numberOfWord = this.wordSearch.split(' ');
    if(numberOfWord.length > 50){
      this.openDialog();
      return;
    }
    monitorInput(formText.form.value.text, this.languageService.languageSearch);
    setTimeout(()=> {
      this.result = getUrlPicto();
      this.editionService.result = this.result;
      this.keyPicto = getKeyPicto();
      for (let i=0; i<this.result.length; i = i+1){
        this.result[i].forEach(value => {
          const tabValue = value.split('/');
          if(this.banksChecked.includes(tabValue[4])){
            this.resultTab.push(value);
          }
        });
        this.displayResult.push(this.resultTab);
        this.resultTab = [];
      }
    },100);
    setTimeout(()=>{
      this.wordsText = getTokensForTS();
      this.editionService.wordsText = this.wordsText;
      this.editionService.wordsTextSave = JSON.parse(JSON.stringify(this.wordsText));
      this.addWordsIfNeeded();
    },100);
    this.editionService.isSearch = true;
  }

  chooseBank(arasaac: HTMLInputElement, mulberry: HTMLInputElement) {
    this.banksChecked = [];
    if(arasaac.checked){
      this.banksChecked.push(arasaac.value);
    }
    if(mulberry.checked){
      this.banksChecked.push(mulberry.value);
    }
  }

  resetRequest(){
    this.editionService.result = [];
    this.editionService.imageSelected = [];
    this.result.length = 0;
    this.displayResult.length = 0;
    this.keyPicto.length = 0;
  }
  Download( url: any, filename: any ) {
    let setFetching = false;
    let setError = false;

    const download = (url: RequestInfo, name: string | any[]) => {
      if (!url) {
        throw new Error("Resource URL not provided! You need to provide one");
      }
      setFetching =true;
      fetch(url)
        .then(response => response.blob())
        .then(blob => {
          setFetching =false;
          const blobURL = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobURL;

          if (name && name.length) if (typeof name === "string") {
            a.download = name;
          }
          document.body.appendChild(a);
          a.click();
        })
        .catch(() => setError = true);
    };

    download(url,filename);
  }

  private addWordsIfNeeded() {
    for(let i = 0; i < this.keyPicto.length; i++){
      this.keyPicto[i].forEach(key => {
        if(key.includes('-')){
          const placement = key.split('-');
          let textKey = '';
          for(let j = 0; j < placement.length; j++){
            textKey = textKey + this.wordsText[placement[j]].text + ' ';
          }
          this.wordsText.splice(i,0,{text: textKey});
        }
      });
    }
  }
  openDialog(){
    this.dialog.open(DialogMaxWordsComponent, {
      height: '20%',
      width: '30%',
    });
  }

  erase() {
    (<HTMLInputElement>document.getElementById("sentence-input")).value = "";
  }

  select(image: string,index: number) {
    this.editionService.imageSelected[index] = image;
    console.log('image selected : ', this.editionService.imageSelected);
  }
}
