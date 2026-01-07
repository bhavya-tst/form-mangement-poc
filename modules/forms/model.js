import { DataTypes } from "sequelize";
import sequelize from "../../configs/db.js";

const Form = sequelize.define("Form", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  versionNumber: {
    type: DataTypes.INTEGER,
    unique: true,
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sourceType: {
    type: DataTypes.ENUM('cdn', 'file'),
    allowNull: false,
  },
  cdnUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fileContent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  paranoid: true,
  // Partial unique index for isDefault=true
  indexes: [
    {
      unique: true,
      fields: ['isDefault'],
      where: { isDefault: true }
    }
  ]
});

export default Form;
