import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";
import MenuItem from "../components/MenuItem";

const Alert = ({ message, type, onClose }) => {
  return (
    <div 
      className={`flex items-center justify-between w-full max-w-2xl p-4 mb-4 rounded-lg ${
        type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
      }`}
    >
      <p className="flex-1">{message}</p>
      <button 
        onClick={onClose}
        className="ml-4 p-1 hover:bg-red-200 rounded-full transition-colors"
        aria-label="Close alert"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

const WeekNavigator = ({ currentDate, onPreviousWeek, onNextWeek }) => {
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getWeekRange = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()+1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return {
      start: formatDate(startOfWeek),
      end: formatDate(endOfWeek)
    };
  };

  const weekRange = getWeekRange(currentDate);

  return (
    <div className="flex items-center justify-center space-x-4 bg-white rounded-lg shadow-md p-4 mb-6 w-full max-w-2xl">
      <button
        onClick={onPreviousWeek}
        className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Previous week"
      >
        <ChevronLeft className="h-6 w-6 text-gray-600" />
      </button>

      <div className="flex items-center space-x-3">
        <Calendar className="h-5 w-5 text-blue-500" />
        <div className="text-lg font-medium text-gray-700">
          <span>{weekRange.start}</span>
          <span className="mx-2">-</span>
          <span>{weekRange.end}</span>
        </div>
      </div>

      <button
        onClick={onNextWeek}
        className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Next week"
      >
        <ChevronRight className="h-6 w-6 text-gray-600" />
      </button>
    </div>
  );
};


const Menu = () => {
  const [meals, setMeals] = useState([]);
  const [registeredMeals, setRegisteredMeals] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [alert, setAlert] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // get isAdmin status
    const fetchIsAdmin = async () => {
      try {
        const res = await fetch(process.env.REACT_APP_BACKENDURL +"/api/validation", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Server gave bad response for isAdmin");
        const data = await res.json();
        setIsAdmin(data.isAdmin);
      } catch (err) {
        console.error("Error fetching isAdmin:", err);
      }
    };
    fetchIsAdmin();
    const dateString = currentDate.toISOString().split("T")[0];
    console.log("dateString: " + dateString);
    const fetchMenu = async () => {
      try {
        const res = await fetch(process.env.REACT_APP_BACKENDURL +"/api/getMenu", {
          headers: { "content-type": "application/json" },
          method: "POST",
          credentials: "include",
          body: JSON.stringify({currentDate: dateString}),
        });

        if (!res.ok) throw new Error("Server gave bad response for getting menu");

        const data = await res.json();
        const dayMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        
        const transformedMeals = data.meals.map((meal) => ( {
          mealID: meal.mealID,
          date: meal.date,
          isDinner: meal.isDinner,
          day: dayMap[meal.dayOfWeek],
          dayOfWeek: meal.dayOfWeek,
          description: meal.description,
          spotsTaken: meal.spotsTaken,
          spotsAvaliable: meal.spotsAvailable,
          names: [],
        }));
        // sort meals based on day of week
        transformedMeals.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
        console.log(transformedMeals)
        setMeals(transformedMeals);
        fetchRSVPS(transformedMeals);
      } catch (err) {
        console.error("Error fetching menu:", err);
        setAlert({ type: "error", message: "Failed to load menu" });
      }
    };
    const fetchRSVPS = async (updatedMeals) => {
      try {
        const res = await fetch(process.env.REACT_APP_BACKENDURL +"/api/getRSVPs?date=" +currentDate.toISOString().split('T')[0], {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Server gave bad response for getting RSVPs");
        const data = await res.json();
        //set the meals to include the names of the rsvp associated with each meal ID
        // Update meals with RSVP data using latest state
        const mealsWithRSVPs = updatedMeals.map(meal => {
          const rsvpEntry = data.rsvps.find(item => item.mealID === meal.mealID);
          return rsvpEntry ? { ...meal, names: rsvpEntry.users } : meal;
        });

        // Set updated meals
        setMeals(mealsWithRSVPs);
      
        // Update the state with the new meals data
        
        console.log("updated meals: " + mealsWithRSVPs);
        
        setRegisteredMeals(data.selectedMeals);
        console.log("Registered meals: " + registeredMeals);
      } catch (err) {
        console.log("failed to fetch rsvps's: " + err)
      }
    };
    fetchMenu();

  }, [currentDate]);

  const handleMealSelect = (mealID) => {
    setSelectedMeals((prev) => {
      if (prev.includes(mealID)) {
        return prev.filter(id => id !== mealID);
      }
      if (prev.length >= 2) {
        setAlert({ type: "error", message: "You can only select up to 2 meals" });
        return prev;
      }
      return [...prev, mealID];
    });
  };

  const handleConfirmRSVP = async () => {
    if (selectedMeals.length === 0) {
      setAlert({ type: "error", message: "Please select at least one meal" });
      return;
    }
    
    try {
      for (const mealID of selectedMeals) {
        console.log("selected meals " , mealID);
        const response = await fetch(process.env.REACT_APP_BACKENDURL +"/api/newRSVP", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ mealID: mealID }),
        });

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message);
        }

        setMeals(prevMeals =>
          prevMeals.map(meal =>
            meal.mealID === mealID
              ? { ...meal, spotsTaken: meal.spotsTaken + 1 }
              : meal
          )
        );
        setRegisteredMeals(prevRegistered => [...prevRegistered, mealID]);
      }

      setAlert({ type: "success", message: "Successfully RSVP'd to selected meals!" });
      setSelectedMeals([]);
    } catch (error) {
      setAlert({ type: "error", message: error.message || "Failed to RSVP" });
    }
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
    setSelectedMeals([]);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
    setSelectedMeals([]);
  };

  const lunchMeals = meals.filter((meal) => !meal.isDinner);
  const dinnerMeals = meals.filter((meal) => meal.isDinner);

  const handleDeleteRSVP = async (mealID) => {
    try {
      const response = await fetch(process.env.REACT_APP_BACKENDURL +"/api/deleteRSVP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mealID }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }

      // Remove the meal from registeredMeals
      setRegisteredMeals(prevRegistered => 
        prevRegistered.filter(id => id !== mealID)
      );
      // Refetch the menu to get updated counts by resetting date
      setCurrentDate(new Date(currentDate));


      setAlert({ 
        type: "success", 
        message: "Successfully cancelled RSVP" 
      });
    } catch (error) {
      setAlert({ 
        type: "error", 
        message: error.message || "Failed to cancel RSVP" 
      });
    }
  };
  const handleDeleteItem = async (mealID) => {
    const userConfirmed = window.confirm("Are you sure you want to permently delete meal a meal?");
    if (!userConfirmed) {
      return;
    }
    try {
      const res = await fetch(process.env.REACT_APP_BACKENDURL +"/api/deleteMeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mealID }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error("error deleting messages");
      }
      // refresh menu to reflect deleted item
      setCurrentDate(new Date(currentDate));
    } catch (err) {
      setAlert({ type: "error", message: "Failed to delete meal" });
      console.log("failed to delete meal: " +err);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Meal Menu</h1>
      
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <WeekNavigator 
        currentDate={currentDate}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
      />

      {selectedMeals.length > 0 && (
        <button
          onClick={handleConfirmRSVP}
          className="mb-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Confirm RSVP ({selectedMeals.length}/2 selected)
        </button>
      )}

      <div className="w-full mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-center">Lunch</h2>
        <div className="flex overflow-x-auto pb-4 gap-2 px-4 min-w-full">
          {lunchMeals.map((meal) => (
            <MenuItem
              key={meal.mealID}
              item={meal}
              onSelect={handleMealSelect}
              onDelete={handleDeleteRSVP}
              onDeleteItem={handleDeleteItem}
              isAdmin={isAdmin}
              isSelected={selectedMeals.includes(meal.mealID)}
              isRegistered={registeredMeals.includes(meal.mealID)}
              disabled={selectedMeals.length + registeredMeals.length >= 2 && !selectedMeals.includes(meal.mealID)}
              className="first:ml-auto last:mr-auto"
            />
          ))}
        </div>
      </div>

      <div className="w-full">
      <h2 className="text-2xl font-semibold mb-4 text-center">Dinner</h2>
      <div className="flex overflow-x-auto pb-4 gap-2 pl-4 md:pl-8">
        {dinnerMeals.map((meal) => (
          <MenuItem
            key={meal.mealID}
            item={meal}
            onSelect={handleMealSelect}
            onDelete={handleDeleteRSVP}
            onDeleteItem={handleDeleteItem}
            isAdmin={isAdmin}
            isSelected={selectedMeals.includes(meal.mealID)}
            isRegistered={registeredMeals.includes(meal.mealID)}
            disabled={selectedMeals.length + registeredMeals.length >= 2 && !selectedMeals.includes(meal.mealID)}
            className="first:ml-auto last:mr-auto"
          />
        ))}
      </div>
    </div>
  </div>
  );
};

export default Menu;