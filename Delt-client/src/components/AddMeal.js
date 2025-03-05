import React, {useState} from 'react';

const AddMeal = () => {
    const [meal, setMeal] = useState({
        date: "",
        description: "",
        isDinner: true,
        spotsAvaliable: 10
    });

    // const toCSTDate = (dateStr) => {
    //     const date = new Date(dateStr);

    //     const cstOffset = -6 * 60 * 60 * 1000;

    //     // Apply the CST offset to the UTC time
    //     const cstDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000 + cstOffset);
    //     // Format the date as ISO 8601 string in CST
    //     return cstDate.toISOString().split('T')[0]; // "YYYY-MM-DD" format
    // };

    const handleChange = (e) => {
        // console.log(e.target.name, e.target.value);
        if (e.target.name === "isDinner") {
            setMeal({...meal, [e.target.name]: e.target.checked});
        } else if(e.target.name === "date") {
            const adjustedDate = (e.target.value);
            console.log(adjustedDate);
            setMeal({ ...meal, [e.target.name]: adjustedDate});
        } else {
            setMeal({ ...meal, [e.target.name]: e.target.value });
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(process.env.REACT_APP_BACKENDURL +"/api/addMeal", {
            headers: {
                "content-type": "application/json",
            },
            method: "POST",
            credentials: "include",
            body: JSON.stringify(meal),
        })
        .then((res) => {
            if (res.ok) {
                console.log(res)
            }
            else {
                throw new Error("Server gave bad response for adding meal");
            }
        })
        .catch((err) => {
            console.log("error adding meal: " + err);
        })
        console.log(meal);
    };
    
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
    <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg"
    >
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Add a Meal</h2>
        <div className="mb-4">
            <label 
                htmlFor="date" 
                className="block text-gray-600 font-medium mb-2"
            >
                Date
            </label>
            <input
                type="date"
                name="date"
                value={meal.date}
                required
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />  
        </div>
        <div className="mb-4">
            <label 
                htmlFor="description" 
                className="block text-gray-600 font-medium mb-2"
            >
                Description
            </label>
            <input
                type="text"
                name="description"
                placeholder="Enter description"
                value={meal.description}
                required
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
        </div>
        
        <div className="mb-4">
            <label 
                htmlFor="spotsAvailable" 
                className="block text-gray-600 font-medium mb-2"
            >
                Spots Available
            </label>
            <input
                type="number"
                name="spotsAvaliable"
                value={meal.spotsAvaliable}
                default="10"
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
        </div>
        <div className="mb-4 flex items-center">
            <input
                type="checkbox"
                name="isDinner"
                value={meal.isDinner}
                onChange={handleChange}
                className="mr-2"
            />
            <label 
                htmlFor="isDinner" 
                className="text-gray-600 font-medium"
            >
                Is this a dinner meal?
            </label>
        </div>
        
        <button 
            type="submit" 
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-200"
        >
            Add Meal
        </button>
    </form>
</div>

    );
    };

export default AddMeal;