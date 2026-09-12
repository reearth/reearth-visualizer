export type LicenseOption = {
  value: string;
  label: string;
  description: string;
  // Plain-language one-liner shown under the label in the license dropdown,
  // alongside a link to the canonical text of the license.
  summary: string;
  url: string;
};

const licenseOptions: LicenseOption[] = [
  {
    value: "o-uda-1.0",
    label: "Open Use of Data Agreement v1.0",
    description:
      "A permissive data license that allows unrestricted use, modification, and distribution of data with minimal obligations. Only requires attribution preservation and warranty disclaimers for redistributed data.",
    summary:
      "Anyone can freely use, modify, and share your data for any purpose - they only keep the attribution notice.",
    url: "https://github.com/microsoft/Open-Use-of-Data-Agreement/blob/v1.0/O-UDA-1.0.md"
  },
  {
    value: "eupl-1.2",
    label: "European Union Public License v1.2",
    description:
      "A copyleft license created by the European Commission, available in 23 EU languages. Compatible with several other open source licenses and provides patent grants. Ensures derivatives remain under EUPL or compatible licenses.",
    summary:
      "A European open-source license. Anyone can use and modify your work, but their versions must stay open under a compatible license.",
    url: "https://interoperable-europe.ec.europa.eu/collection/eupl/eupl-text-eupl-12"
  },
  {
    value: "lgpl-3.0",
    label: "GNU Lesser General Public License v3.0",
    description:
      "A weak copyleft license primarily for software libraries. Allows linking with proprietary software while ensuring modifications to the library itself remain open source. Includes explicit patent grants.",
    summary:
      "Others can include your code in their own programs, even closed ones. Only changes to your code itself must be shared as open source.",
    url: "https://www.gnu.org/licenses/lgpl-3.0.html"
  },
  {
    value: "gpl-3.0",
    label: "GNU General Public License v3.0",
    description:
      "Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications, which include larger works using a licensed work, under the same license. Copyright and license notices must be preserved.",
    summary:
      "Anyone can use and modify your software, but anything they build on it must also be shared as open source under this license.",
    url: "https://www.gnu.org/licenses/gpl-3.0.html"
  },
  {
    value: "apache-2.0",
    label: "Apache License 2.0",
    description:
      "A permissive license whose main conditions require preservation of copyright and license notices. Contributors provide an express grant of patent rights. Licensed works, modifications, and larger works may be distributed under different terms and without source code.",
    summary:
      "Like MIT, plus an explicit patent grant for extra legal protection. Anyone can use it commercially; they keep notices and mark any changes.",
    url: "https://www.apache.org/licenses/LICENSE-2.0"
  },
  {
    value: "mit",
    label: "MIT License",
    description:
      "A short and simple permissive license with conditions only requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code.",
    summary:
      "Anyone can use, change, and share your work, including in commercial or closed products - they only keep your copyright notice.",
    url: "https://opensource.org/license/mit"
  },
  {
    value: "cc-by-nd-4.0",
    label: "Creative Commons Attribution-NoDerivatives 4.0 International",
    description:
      "Allows redistribution, commercial and non-commercial use, but prohibits creation and distribution of derivative works. Requires attribution to the original creator.",
    summary:
      "Anyone can share your work, including commercially, but must credit you and cannot publish modified versions.",
    url: "https://creativecommons.org/licenses/by-nd/4.0/"
  },
  {
    value: "cc-by-nc-4.0",
    label: "Creative Commons Attribution-NonCommercial 4.0 International",
    description:
      "Allows redistribution and creation of derivatives for non-commercial purposes only. Requires attribution to the original creator. Commercial use is prohibited.",
    summary:
      "Anyone can share and adapt your work for non-commercial purposes only, as long as they credit you.",
    url: "https://creativecommons.org/licenses/by-nc/4.0/"
  },
  {
    value: "cc-by-sa-4.0",
    label: "Creative Commons Attribution-ShareAlike 4.0 International",
    description:
      "Allows redistribution and creation of derivatives for any purpose, including commercially, as long as attribution is given and derivatives are licensed under identical terms (copyleft).",
    summary:
      "Anyone can use and adapt your work, including commercially, but must credit you and release their versions under this same license.",
    url: "https://creativecommons.org/licenses/by-sa/4.0/"
  },
  {
    value: "odbl-1.0",
    label: "Open Data Commons Open Database License v1.0",
    description:
      "A copyleft license for databases that allows users to freely share, modify, and use the database while requiring that derivatives of the database remain under the same license.",
    summary:
      "Anyone can use and adapt your database, including commercially, but must credit you and share any adapted database under this same license.",
    url: "https://opendatacommons.org/licenses/odbl/1-0/"
  },
  {
    value: "odc-by-1.0",
    label: "Open Data Commons Attribution License v1.0",
    description:
      "A permissive license for databases that allows unrestricted use while only requiring attribution. Similar to CC BY but specifically designed for databases and collections of data.",
    summary:
      "Anyone can use and adapt your database, including commercially, as long as they credit you.",
    url: "https://opendatacommons.org/licenses/by/1-0/"
  },
  {
    value: "cc-by-4.0",
    label: "Creative Commons Attribution 4.0 International",
    description:
      "The most permissive Creative Commons license. Allows redistribution and creation of derivatives for any purpose, including commercially, as long as attribution is given to the creator.",
    summary:
      "Anyone can use, share, and adapt your work for any purpose, including commercially, as long as they credit you.",
    url: "https://creativecommons.org/licenses/by/4.0/"
  }
];

const pickLicenses = (values: string[]): LicenseOption[] =>
  values
    .map((value) => licenseOptions.find((option) => option.value === value))
    .filter((option): option is LicenseOption => option !== undefined);

export const visualizerProjectLicensesOptions: LicenseOption[] = pickLicenses([
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
]);

// Sentinel for "the creator deliberately picked no license", as opposed to
// simply not having touched the field yet. Neither maps to license content.
export const NO_LICENSE_VALUE = "no-license";

export type LicenseGroupKey = "open" | "shareAlike" | "limited";

// The same licenses as `visualizerProjectLicensesOptions`, sorted from most to
// least permissive and split into the headings the license dropdown lists them
// under. Group labels are translated where they are rendered.
export const visualizerProjectLicenseGroups: {
  key: LicenseGroupKey;
  licenses: LicenseOption[];
}[] = [
  {
    key: "open",
    licenses: pickLicenses([
      "cc-by-4.0",
      "mit",
      "apache-2.0",
      "o-uda-1.0",
      "odc-by-1.0"
    ])
  },
  {
    key: "shareAlike",
    licenses: pickLicenses([
      "cc-by-sa-4.0",
      "gpl-3.0",
      "lgpl-3.0",
      "eupl-1.2",
      "odbl-1.0"
    ])
  },
  {
    key: "limited",
    licenses: pickLicenses(["cc-by-nd-4.0"])
  }
];
