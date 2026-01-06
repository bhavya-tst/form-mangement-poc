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
}, {
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
