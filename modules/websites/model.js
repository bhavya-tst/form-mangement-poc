import { DataTypes } from "sequelize";
import sequelize from "../../configs/db.js";
import Form from "../forms/model.js";

const Website = sequelize.define("Website", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(value) {
      // Normalize domain (lowercase, trim)
      this.setDataValue('domain', value.toLowerCase().trim());
    }
  },
  formId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Form,
      key: 'id'
    }
  }
});

// Associations
Website.belongsTo(Form, { foreignKey: 'formId' });
Form.hasMany(Website, { foreignKey: 'formId' });

export default Website;
