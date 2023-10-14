import {FieldType} from "./FieldType";
import {Error} from "./Error";
import {CustomValidator} from "./CustomValidator";

export class Field {

    private fieldType: FieldType = FieldType.STRING;

    private isRequired: boolean = true;

    private lengthMin: number = -1;

    private lengthMax: number = -1;

    private valueMin: number | null = null;

    private valueMax: number | null = null;

    private callbacks: { callback: CustomValidator, message: string }[] = [];

    private allowedValues: string[]|null = null;

    public type(fieldType: FieldType): this {
        this.fieldType = fieldType;
        return this;
    }

    public required(isRequired: boolean): this {
        this.isRequired = isRequired;
        return this;
    }

    public minLength(length: number): this {
        this.lengthMin = length;
        return this;
    }

    public maxLength(length: number): this {
        this.lengthMax = length;
        return this;
    }

    public withCustomValidator( callback: CustomValidator, message: string ): this {

        this.callbacks.push({
            callback: callback,
            message: message
        });

        return this;
    }

    public minValue(minValue: number): this {
        this.valueMin = minValue;
        return this;
    }

    public maxValue(maxValue: number): this {
        this.valueMax = maxValue;
        return this;
    }

    public getError(value: any): Error | null {

        if (null === value || undefined === value) {
            if (this.isRequired) {
                return new Error('Field is required');
            } else {
                return null;
            }
        }

        if (!this.validateType(value)) {
            return new Error('Field is not of data type ' + this.fieldType)
        }

        if ( this.fieldType === FieldType.STRING ) {

            if (this.lengthMin !== -1 && value.length < this.lengthMin) {
                return new Error('Field min length must be ' + this.lengthMin + ' characters');
            }

            if (this.lengthMax !== -1 && value.length > this.lengthMax) {
                return new Error('Field max length must be ' + this.lengthMax + ' characters');
            }

            if (null !== this.allowedValues && this.allowedValues.indexOf(value) === -1) {
                return new Error("Field value must be one of: "  + JSON.stringify(this.allowedValues));
            }

        }

        if (this.fieldType === FieldType.FLOAT || this.fieldType === FieldType.INT) {

            if (null !== this.valueMin && value < this.valueMin) {
                return new Error("Value must be min " + this.valueMin);
            }

            if (null !== this.valueMax && value > this.valueMax) {
                return new Error("Value must be max  " + this.valueMax);
            }

        }

        for (let i: number = 0, len = this.callbacks.length; i<len; i++ ) {
            if (!this.callbacks[i].callback(value)) {
                return new Error(this.callbacks[i].message);
            }
        }

        return null;
    }

    public in(allowedValues: string[]): this {
        this.allowedValues = allowedValues;
        return this;
    }

    private validateType(value: any): boolean {

        switch (this.fieldType) {
            case FieldType.STRING:
                return typeof value === 'string';
            case FieldType.INT:
                return typeof value === 'number' && parseInt(String(value), 10) === value;
            case FieldType.FLOAT:
                return typeof value === 'number' && parseFloat(String(value)) === value;
            case FieldType.BOOLEAN:
                return true === value || false === value;
            default:
                return false;
        }
    }
}