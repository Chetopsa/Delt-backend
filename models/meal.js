module.exports = (sequelize, DataTypes) => {
    const Meal = sequelize.define('Meal', {
      mealID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      date: {
        type: DataTypes.STRING(256),
        allowNull: false
      },
      description: {
        type: DataTypes.STRING(512),
        allowNull: true
      },
      isDinner: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      dayOfWeek: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      spotsTaken: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }, 
      spotsAvaliable: {
        type: DataTypes.INTEGER,
        defaultValue: 10
      },
      weekID: {
        type: DataTypes.INTEGER,
        allowNull: false
      }, 
    }, {
      tableName: 'meal',
      timestamps: false
    });
  
    Meal.associate = models => {
      Meal.hasMany(models.RSVP, {
        foreignKey: 'mealID'
      });
    };
  
    return Meal;
  };
  