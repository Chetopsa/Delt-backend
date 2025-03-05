import React, { useState } from 'react';
import {Button} from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import Alert from './ui/Alert';

function getDateOnly(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
  return d;
}

const BulkAddMeals = () => {
  const [startDate, setStartDate] = useState('');
  const [dateError, setDateError] = useState('');
  const [meals, setMeals] = useState([]);
  const defaultMeals = {
    Monday: { lunch: '', dinner: '' },
    Tuesday: { lunch: '', dinner: '' },
    Wednesday: { lunch: '', dinner: '' },
    Thursday: { lunch: '', dinner: '' },
    Friday: { lunch: '', dinner: '' },
    Saturday: { lunch: '', dinner: '' },
    Sunday: { lunch: '', dinner: '' }
  };
  const [descriptions, setDescriptions] = useState(defaultMeals);
  const [spotsAvailable, setSpotsAvailable] = useState(10);


  const generateDates = (startDate) => {
    const dates = [];
    const start = getDateOnly(new Date(startDate));
    
    for (let i = 0; i < 7; i++) {
      const currentDate = getDateOnly(new Date(start));
      currentDate.setDate(start.getDate() + i);
      // console.log(currentDate);
      dates.push(currentDate.toISOString().split('T')[0]);
    }
    // console.log(dates);
    return dates;
  };

  const handleStartDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const dayOfWeek = selectedDate.getDay();
    
    if (dayOfWeek !== 0) {
      setDateError('Please select a Monday as the start date');
      setStartDate(e.target.value); // Still update the date to show the error state
    } else {
      setDateError('');
      setStartDate(e.target.value);
    }
  };

  const handleDescriptionChange = (day, mealType, value) => {
    setDescriptions(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: value
      }
    }));
  };

  const getDayName = (dateStr) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dates = generateDates(startDate);
    // console.log(dates)
    const mealPromises = [];

    dates.forEach(date => {
      const dayName = getDayName(date);
      
      // Add lunch if description exists
      console.log(descriptions[dayName].lunch);
      // console.log(spotsAvailable);
      console.log(date+"\n\n");
      
      if (descriptions[dayName].lunch) {
        mealPromises.push(
          fetch(process.env.REACT_APP_BACKENDURL +"/api/addMeal", {
            headers: { "content-type": "application/json" },
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
              date,
              description: descriptions[dayName].lunch,
              isDinner: false,
              spotsAvaliable: spotsAvailable
            })
          })
        );
      }

      // Add dinner if description exists
      if (descriptions[dayName].dinner) {
        mealPromises.push(
          fetch(process.env.REACT_APP_BACKENDURL +"/api/addMeal", {
            headers: { "content-type": "application/json" },
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
              date,
              description: descriptions[dayName].dinner,
              isDinner: true,
              spotsAvaliable: spotsAvailable
            })
          })
        );
      }
    });

    try {
      await Promise.all(mealPromises);
      alert('Successfully added meals for the week!');
      setDescriptions(defaultMeals);
      setStartDate('');
    } catch (error) {
      alert('Error adding meals: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Bulk Add Meals for the Week</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Week Start Date (Monday)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
                {dateError && (
                  <Alert className="mt-2" message={dateError}></Alert>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Spots Available
                </label>
                <input
                  type="number"
                  value={spotsAvailable}
                  onChange={(e) => setSpotsAvailable(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(descriptions).map(([day, meals]) => (
                <div key={day} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{day}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Lunch Description</label>
                      <input
                        type="text"
                        value={meals.lunch}
                        onChange={(e) => handleDescriptionChange(day, 'lunch', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Leave empty to skip"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Dinner Description</label>
                      <input
                        type="text"
                        value={meals.dinner}
                        onChange={(e) => handleDescriptionChange(day, 'dinner', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Leave empty to skip"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              disabled={!!dateError}
              type="submit" 
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md"
            >
              Add All Meals
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkAddMeals;