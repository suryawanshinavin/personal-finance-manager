const fetchTransactions = async () => {
    try {
        const response = await axios.get("http://localhost:5000/api/transactions");
        const transactions = response.data;

        const transactionsList = document.getElementById("transactions");
        transactionsList.innerHTML = ""; // Clear previous data

        transactions.forEach((transaction) => {
            const listItem = document.createElement("li");
            listItem.className = "p-4 bg-white shadow rounded-md";
            listItem.innerHTML = `
            <p><strong>Type:</strong> ${transaction.type}</p>
            <p><strong>Category:</strong> ${transaction.category}</p>
            <p><strong>Amount:</strong> $${transaction.amount.toFixed(2)}</p>
        `;
            transactionsList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
    }
};

// Fetch transactions on page load
fetchTransactions();
