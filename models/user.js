module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      userID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      firstName: {
        type: DataTypes.STRING(128),
        allowNull: true
      },
      lastName: {
        type: DataTypes.STRING(128),
        allowNull: true
      },
      hasMealPlan: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      googleID: {
        type: DataTypes.STRING(128),
        unique: true,
        allowNull: true // Adjust based on auth logic
      }
    }, {
      tableName: 'user',
      timestamps: false
    });
  
    User.associate = models => {
      User.hasMany(models.RSVP, {
        foreignKey: 'userID'
      });
    };
  
    return User;
  };
  