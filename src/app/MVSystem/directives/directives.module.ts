import { NgModule } from "@angular/core";
import { NumericDirective } from "./numeric.directive";
import { TableTrselect } from './table-tr-select.directive';

@NgModule({
    declarations:[
        NumericDirective,
        TableTrselect
    ],
    imports:[],
    exports:[
        NumericDirective,
        TableTrselect
    ]
})
export class DirectiveModule{

}