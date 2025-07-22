
import { Package, Circle, Minus, Square, Triangle } from "lucide-react";

export interface MaterialTemplate {
  name: string;
  displayName: string;
  description: string;
  category: string;
  icon: any;
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
  subTypes?: {
    key: string;
    name: string;
    description: string;
    icon: any;
  }[];
}

export const categoryTemplates: Record<string, MaterialTemplate> = {
  Sheet: {
    name: "Sheet",
    displayName: "Metal Sheets",
    description: "Flat metal sheets & plates",
    category: "Sheet",
    icon: Square,
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
    displayName: "Steel Pipes",
    description: "Round pipes & tubes",
    category: "Pipe",
    icon: Circle,
    fields: {
      unit: "KG",
      finish: "Annealed",
      pipe_type: "OD"
    },
    dimensionFields: ["thickness", "diameter", "length"],
    commonGrades: ["SS304", "SS316", "SS202", "MS"],
    commonFinishes: ["Annealed", "Pickled", "Bright"],
    subTypes: [
      {
        key: "OD",
        name: "Outer Diameter (OD)",
        description: "Measured by outer diameter",
        icon: Circle
      },
      {
        key: "NB",
        name: "Nominal Bore (NB)",
        description: "Measured by internal bore",
        icon: Circle
      }
    ]
  },
  Bar: {
    name: "Bar",
    displayName: "Metal Bars",
    description: "Round, square & hex bars",
    category: "Bar",
    icon: Minus,
    fields: {
      unit: "KG",
      finish: "Hot Rolled",
      bar_shape: "Round"
    },
    dimensionFields: ["diameter", "length"],
    commonGrades: ["SS304", "SS316", "MS", "EN8", "EN24"],
    commonFinishes: ["Hot Rolled", "Cold Drawn", "Bright"],
    subTypes: [
      {
        key: "Round",
        name: "Round Bar",
        description: "Circular cross-section",
        icon: Minus
      },
      {
        key: "Square",
        name: "Square Bar",
        description: "Square cross-section",
        icon: Square
      },
      {
        key: "Hex",
        name: "Hex Bar",
        description: "Hexagonal cross-section",
        icon: Package
      }
    ]
  },
  Flat: {
    name: "Flat",
    displayName: "Flat Bars",
    description: "Rectangular flat sections",
    category: "Flat",
    icon: Minus,
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
    displayName: "Angle Sections",
    description: "L-shaped angle sections",
    category: "Angle",
    icon: Triangle,
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
