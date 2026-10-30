import { NgModule } from "@angular/core";
import { NumericDirective } from "./numeric.directive";
import { TableTrselect } from './table-tr-select.directive';
import { MoneyDirective } from './money.directive';

@NgModule({
    declarations:[
        NumericDirective,
        TableTrselect,
        MoneyDirective
    ],
    imports:[],
    exports:[
        NumericDirective,
        TableTrselect,
        MoneyDirective
    ]
})
export class DirectiveModule{

}