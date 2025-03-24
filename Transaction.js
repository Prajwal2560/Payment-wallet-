import React, { useState, useEffect } from "react";
import axios from "axios"; // Ensure you have axios installed for API calls
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Transaction() {
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [receiverUpi, setReceiverUpi] = useState('');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');

    // Fetch user data and transactions on component mount
    useEffect(() => {
        const fetchUserAndTransactions = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (storedUser) {
                    setUser(storedUser);
                    fetchTransactions(storedUser.upi_id);
                    fetchBalance(storedUser.upi_id);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserAndTransactions();
    }, []);

    // Fetch transactions for a given UPI ID
    const fetchTransactions = async (upi_id) => {
        try {
            const response = await axios.get(`/api/transactions/${upi_id}`);
            setTransactions(response.data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const fetchBalance = async (upi_id) => {
        try {
            const response = await axios.get(`/api/user/${upi_id}`);
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    // Handle transaction
    const handleTransaction = async () => {
        if (!amount || !receiverUpi) {
            setMessage('Please provide amount and receiver UPI ID.');
            return;
        }
        try {
            const response = await axios.post('/api/transaction', {
                sender_upi_id: user.upi_id,
                receiver_upi_id: receiverUpi,
                amount: parseFloat(amount)
            });
            setMessage(response.data.message);
            if (response.status === 200) {
                // Refresh transactions and user balance
                fetchTransactions(user.upi_id);
                fetchBalance(user.upi_id);
                setAmount('');
                setReceiverUpi('');
            }
        } catch (error) {
            console.error('Error making transaction:', error);
            setMessage('Transaction failed.');
        }
    };

    // Prepare data for the chart
    const chartData = transactions
        .map(tx => ({
            timestamp: new Date(tx.timestamp).toLocaleDateString(),
            amount: tx.amount,
            type: tx.type // Add type to chart data
        }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Ensure data is sorted by timestamp

    return (
        <div>
            <div className="m-4">
                {user && (
                    <div className="card mt-4">
                        <div className="card-body">
                            <h5 className="card-title">User Information</h5>
                            <p className="card-text"><strong>Email:</strong> {user.email}</p>
                            <p className="card-text"><strong>UPI ID:</strong> {user.upi_id}</p>
                            <p className="card-text"><strong>Balance:</strong> {user.balance}</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="m-4">
                <h1>Initiate Transaction</h1>
                <input
                    type="text"
                    placeholder="Receiver UPI ID"
                    value={receiverUpi}
                    onChange={(e) => setReceiverUpi(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <button onClick={handleTransaction}>Send Money</button>
                {message && <p>{message}</p>}
            </div>
            <div className="m-4">
                <h1>Transaction History</h1>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th>Sender UPI ID</th>
                            <th>Receiver UPI ID</th>
                            <th>Amount</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction._id}>
                                <td>
                                    {transaction.sender_upi_id === user.upi_id ? '🔺' : '⬇️'}
                                </td>
                                <td>{transaction.sender_upi_id}</td>
                                <td>{transaction.receiver_upi_id}</td>
                                <td>{transaction.amount}</td>
                                <td>{new Date(transaction.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="m-4">
                <h1>Transaction Graph</h1>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="amount" stroke="#8884d8" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}