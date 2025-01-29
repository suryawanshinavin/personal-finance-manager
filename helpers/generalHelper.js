// /helpers/generalHelper.js
module.exports = {
    formatDate: (date) => {
        try {
            // If the input is not a valid date, throw an error
            const parsedDate = new Date(date);
            
            // Check for an invalid date
            if (isNaN(parsedDate)) {
                throw new Error('Invalid date format');
            }

            // Format the date with options (year, month, and day)
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return parsedDate.toLocaleDateString('en-IN', options);  // 'en-IN' for Indian Standard Time format
        } catch (error) {
            // If there's an error, return a meaningful message
            console.error('Error formatting date:', error.message);
            return 'Invalid date provided';
        }
    },
    // You can add more helper functions here
};

