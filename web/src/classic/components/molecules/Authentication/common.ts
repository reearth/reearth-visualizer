export type PasswordPolicy = {
  tooShort?: RegExp;
  tooLong?: RegExp;
  whitespace?: RegExp;
  lowSecurity?: RegExp;
  medSecurity?: RegExp;
  highSecurity?: RegExp;
};
