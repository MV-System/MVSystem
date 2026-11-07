import jwt_decode from 'jwt-decode';

/** La sesion es vigente si hay un token legible y su vencimiento (exp, en segundos) aun no pasa. */
export function sesionVigente(): boolean {
    const token = localStorage.getItem('token');
    if (!token) { return false; }
    try {
        const { exp } = jwt_decode<{ exp?: number }>(token);
        return typeof exp === 'number' && exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

export function CreatorPDFFile(blob: Blob){
    var blob = new Blob([blob], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
    iframe.contentWindow?.print();
}
/** Imprime un PDF (blob): espera a que cargue en un iframe oculto y libera los recursos despues de imprimir. */
export function ImprimirPdfBlob(blob: Blob): void {
    const pdf = new Blob([blob], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(pdf);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = blobUrl;

    let limpio = false;
    const limpiar = () => {
        if (limpio) { return; }
        limpio = true;
        URL.revokeObjectURL(blobUrl);
        if (iframe.parentNode) { iframe.parentNode.removeChild(iframe); }
    };

    iframe.onload = () => {
        const ventana = iframe.contentWindow;
        if (!ventana) { limpiar(); return; }
        ventana.focus();
        ventana.print();
        setTimeout(limpiar, 30000);
    };
    document.body.appendChild(iframe);
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