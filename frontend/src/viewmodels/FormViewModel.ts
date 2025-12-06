// FormViewModel.ts
import { BaseViewModel } from "./BaseViewModel";

export interface FormState {
  [key: string]: any;
}

export class FormViewModel<T extends FormState> extends BaseViewModel {
  protected formData: T;
  protected errors: Record<string, string> = {};
  protected isSubmitting = false;

  constructor(initial: T) {
    super();
    this.formData = { ...initial };
  }

  getFormData() {
    return this.formData;
  }

  getErrors() {
    return this.errors;
  }

  getIsSubmitting() {
    return this.isSubmitting;
  }

  protected setFieldValue(field: keyof T, value: any) {
    this.formData[field] = value;
    this.notifyObservers();
  }

  protected setErrors(err: Record<string, string>) {
    this.errors = err;
    this.notifyObservers();
  }

  protected clearErrors() {
    this.errors = {};
    this.notifyObservers();
  }

  protected setSubmitting(v: boolean) {
    this.isSubmitting = v;
    this.notifyObservers();
  }

  resetForm(initialValues: T) {
    this.formData = { ...initialValues };
    this.clearErrors();
    this.notifyObservers();
  }
}
