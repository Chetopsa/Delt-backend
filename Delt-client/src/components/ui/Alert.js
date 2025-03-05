import React from 'react';

const Alert = ({ message }) => (
    <div className="bg-red-100 text-red-800 border border-red-300 rounded-md p-4 mb-4">
        <p>{message || "An error has occurred!"}</p>
    </div>
    );

export default Alert;
