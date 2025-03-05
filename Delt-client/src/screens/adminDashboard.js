import React, { useEffect, useState } from 'react';
import AddMeal from '../components/AddMeal';
import BulkAddMeals from '../components/BulkAddMeals';

const AdminDashboard = () => {
    const [isAddMealsCollapsed, setIsAddMealsCollapsed] = useState(false);
    return (
        <div className="p-4 border rounded-lg shadow-lg bg-white">
            <button 
                onClick={() => setIsAddMealsCollapsed(!isAddMealsCollapsed)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"    
            >
                {isAddMealsCollapsed ? "Add Meals" : "Hide Add Meals"}
            </button>
            <div>
                
                {/* <AddMeal/> */}
                {!isAddMealsCollapsed && (
                <div className="mt-4">
                    <BulkAddMeals/>
                </div>
                )
                }
            </div>
            
        </div>
    );
};
export default AdminDashboard;
