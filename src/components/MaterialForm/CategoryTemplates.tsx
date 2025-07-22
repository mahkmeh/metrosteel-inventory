
export interface MaterialTemplate {
  name: string;
  category: string;
  fields: {
    grade?: string;
    unit?: string;
    finish?: string;
    thickness?: string;
    width?: string;
    length?: string;
    diameter?: string;
    pipe_type?: string;
    bar_shape?: string;
  };
  dimensionFields: string[];
  commonGrades: string[];
  commonFinishes: string[];
}

export const categoryTemplates: Record<string, MaterialTemplate> = {
  Sheet: {
    name: "Sheet",
    category: "Sheet",
    fields: {
      unit: "KG",
      finish: "2B"
    },
    dimensionFields: ["thickness", "width", "length"],
    commonGrades: ["SS304", "SS316", "SS202", "MS", "SS430"],
    commonFinishes: ["2B", "BA (Bright Annealed)", "No.4", "HL (Hair Line)", "Mirror"]
  },
  Pipe: {
    name: "Pipe",
    category: "Pipe",
    fields: {
      unit: "KG",
      finish: "Annealed",
      pipe_type: "OD"
    },
    dimensionFields: ["thickness", "diameter", "length"],
    commonGrades: ["SS304", "SS316", "SS202", "MS"],
    commonFinishes: ["Annealed", "Pickled", "Bright"]
  },
  Bar: {
    name: "Bar",
    category: "Bar",
    fields: {
      unit: "KG",
      finish: "Hot Rolled",
      bar_shape: "Round"
    },
    dimensionFields: ["diameter", "length"],
    commonGrades: ["SS304", "SS316", "MS", "EN8", "EN24"],
    commonFinishes: ["Hot Rolled", "Cold Drawn", "Bright"]
  },
  Flat: {
    name: "Flat",
    category: "Flat",
    fields: {
      unit: "KG",
      finish: "Hot Rolled"
    },
    dimensionFields: ["width", "thickness", "length"],
    commonGrades: ["SS304", "SS316", "MS", "EN8"],
    commonFinishes: ["Hot Rolled", "Cold Rolled", "Bright"]
  },
  Angle: {
    name: "Angle",
    category: "Angle",
    fields: {
      unit: "KG"
    },
    dimensionFields: ["size_description", "thickness", "length"],
    commonGrades: ["MS", "SS304", "SS316"],
    commonFinishes: []
  }
};

export const getTemplateByCategory = (category: string): MaterialTemplate | null => {
  return categoryTemplates[category] || null;
};
