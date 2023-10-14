import {Field} from "./Field";
import {Error} from "./Error";

export class Validator {

    private properties: { [field: string]: Field } = {};

    private conditionalRequires: { field: string, callback: (obj: any) => boolean }[] = [];
    private conditionalMisses: { field: string, callback: (obj: any) => boolean }[] = [];

    public field(fieldName: string): Field {
        return this.properties[fieldName] || (this.properties[fieldName] = new Field());
    }

    public validate(object: any): Error[] | null {

        if (!(object instanceof Object)) {
            return [
                new Error('request', 'Invalid request')
            ];
        }

        let errors: Error[] = [];

        for (let i: number = 0, len = this.conditionalRequires.length; i < len; i++) {

            if (this.conditionalRequires[i].callback(object)) {

                if (null === object[this.conditionalRequires[i].field] || undefined === object[this.conditionalRequires[i].field]) {
                    errors.push(new Error("Field is required", this.conditionalRequires[i].field));
                }

            }

        }

        for (let i: number = 0, len = this.conditionalMisses.length; i < len; i++) {

            if (this.conditionalMisses[i].callback(object)) {

                if (null !== object[this.conditionalRequires[i].field] && undefined !== object[this.conditionalMisses[i].field]) {
                    errors.push(new Error("Field must not be present", this.conditionalMisses[i].field));
                }

            }

        }

        for (let propertyName in this.properties) {

            if (!this.properties.propertyIsEnumerable(propertyName)) {
                continue;
            }

            let value = object[propertyName];
            let error: Error | null = this.properties[propertyName].getError(value);

            if (error !== null) {
                error.field = propertyName;
                errors.push(error);
            }

        }

        for (let key in object) {

            if ( object.hasOwnProperty(key) && !this.properties[key]) {
                errors.push(new Error("Illegal field", key));
            }

        }

        return errors.length
            ? errors
            : null;
    }

    public requireConditional(fieldName: string, callback: (obj: any) => boolean): this {

        this.conditionalRequires.push({
            field: fieldName,
            callback: callback,
        });

        return this;
    }

    public missConditional(fieldName: string, callback: (obj: any) => boolean): this {

        this.conditionalMisses.push({
            field: fieldName,
            callback: callback
        });

        return this;

    }
}