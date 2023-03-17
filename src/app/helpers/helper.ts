export function CreatorPDFFile(blob: Blob){
    var blob = new Blob([blob], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
    iframe.contentWindow?.print();
}
export function currentDate(){
    const date = new Date();
    return String(date.getFullYear()).padStart(2,'0')  + '-' +
    String(date.getMonth() + 1).padStart(2,'0')  + '-' +
    String(date.getDate()).padStart(2,'0');
  }

//   YYYY-mm-dd
  export function transformDate(date : Date){
    return String(date.getFullYear()).padStart(2,'0')  + '-' +
    String(date.getMonth() + 1).padStart(2,'0')  + '-' +
    String(date.getDate()).padStart(2,'0');
  }