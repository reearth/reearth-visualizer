export * from "./content";

export type LicenseOption = {
  value: string;
  label: string;
  description: string;
};

const licenseOptions: LicenseOption[] = [
  {
    value: "o-uda-1.0",
    label: "Open Use of Data Agreement v1.0",
    description:
      "A permissive data license that allows unrestricted use, modification, and distribution of data with minimal obligations. Only requires attribution preservation and warranty disclaimers for redistributed data."
  },
  {
    value: "eupl-1.2",
    label: "European Union Public License v1.2",
    description:
      "A copyleft license created by the European Commission, available in 23 EU languages. Compatible with several other open source licenses and provides patent grants. Ensures derivatives remain under EUPL or compatible licenses."
  },
  {
    value: "lgpl-3.0",
    label: "GNU Lesser General Public License v3.0",
    description:
      "A weak copyleft license primarily for software libraries. Allows linking with proprietary software while ensuring modifications to the library itself remain open source. Includes explicit patent grants."
  },
  {
    value: "gpl-3.0",
    label: "GNU General Public License v3.0",
    description:
      "Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved."
  },
  {
    value: "apache-2.0",
    label: "Apache License 2.0",
    description:
      "A permissive license whose main conditions require preservation of copyright and license notices. Contributors provide an express grant of patent rights. Licensed works, modifications, and larger works may be distributed under different terms and without source code."
  },
  {
    value: "mit",
    label: "MIT License",
    description:
      "A short and simple permissive license with conditions only requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code."
  },
  {
    value: "cc-by-nd-4.0",
    label: "Creative Commons Attribution-NoDerivatives 4.0 International",
    description:
      "Allows redistribution, commercial and non-commercial use, but prohibits creation and distribution of derivative works. Requires attribution to the original creator."
  },
  {
    value: "cc-by-nc-4.0",
    label: "Creative Commons Attribution-NonCommercial 4.0 International",
    description:
      "Allows redistribution and creation of derivatives for non-commercial purposes only. Requires attribution to the original creator. Commercial use is prohibited."
  },
  {
    value: "cc-by-sa-4.0",
    label: "Creative Commons Attribution-ShareAlike 4.0 International",
    description:
      "Allows redistribution and creation of derivatives for any purpose, including commercially, as long as attribution is given and derivatives are licensed under identical terms (copyleft)."
  },
  {
    value: "odbl-1.0",
    label: "Open Data Commons Open Database License v1.0",
    description:
      "A copyleft license for databases that allows users to freely share, modify, and use the database while requiring that derivatives of the database remain under the same license."
  },
  {
    value: "odc-by-1.0",
    label: "Open Data Commons Attribution License v1.0",
    description:
      "A permissive license for databases that allows unrestricted use while only requiring attribution. Similar to CC BY but specifically designed for databases and collections of data."
  },
  {
    value: "cc-by-4.0",
    label: "Creative Commons Attribution 4.0 International",
    description:
      "The most permissive Creative Commons license. Allows redistribution and creation of derivatives for any purpose, including commercially, as long as attribution is given to the creator."
  }
];

export const visualizerProjectLicensesOptions: LicenseOption[] = [
  "o-uda-1.0",
  "eupl-1.2",
  "lgpl-3.0",
  "gpl-3.0",
  "apache-2.0",
  "mit",
  "cc-by-nd-4.0",
  "cc-by-sa-4.0",
  "odbl-1.0",
  "odc-by-1.0",
  "cc-by-4.0"
]
  .map((value) => licenseOptions.find((option) => option.value === value))
  .filter((option): option is LicenseOption => option !== undefined);
