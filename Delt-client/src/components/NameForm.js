import React, { useState } from "react";

const NameForm = ({closeModal}) => {
  const [inputs, setInputs] = useState({});
  const [success, setSuccess] = useState(null); // Track success or failure

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };
  console.log(inputs);
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(process.env.REACT_APP_BACKENDURL +"/api/setUser", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
      body: JSON.stringify(inputs),
    })
    .then((res) => {
        console.log(res.status);
        if (res.ok) {
            // console.log("yay");
            setSuccess(true);
            setTimeout(() => {
                closeModal();
            }, 500); // 1/2 second delay
        } else {
          throw new Error("Network response was not ok");
        }
    })
    .catch((error) => {
        console.error("Fetch error:", error);
        setSuccess(false);
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md relative">
        {/* <button
          className="absolute top-4 right-4 text-gray-700"
          onClick={() =>  closeModal()}
        >
          ✖
        </button> */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="firstName"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Enter Your First Name:
            </label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={inputs.firstName || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="lastName"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Enter Your last Name:
            </label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={inputs.lastName || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="hasMealPlan"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Do you live in / pay for the full meal plan?:
            </label>
            <select
              name="hasMealPlan"
              id="hasMealPlan"
              value={inputs.hasMealPlan || "false"}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="true">Yes</option>
              <option value="false" selected>No</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Submit
          </button>
        </form>
        {success !== null && (
          <div
            className={`mt-4 p-4 rounded ${
              success
                ? "bg-green-100 text-green-700 border-green-400"
                : "bg-red-100 text-red-700 border-red-400"
            }`}
          >
            {success ? "Success! Your data has been submitted." : "Failure! Something went wrong."}
          </div>
        )}
      </div>
    </div>
  );
};

export default NameForm;
