import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Box,
  TableSortLabel,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getSocket } from "../../services/socket";
import "./TransactionDetails.css";

type Transaction = {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: string;
  from_business?: string;
  to_business?: string;
};

type NodeGraph = {
  id: string;
  label: string;
}

type EdgeGraph = {
  id: number;
  source: string;
  target: string;
  transactionAmount: number;
  transactionCount:number;
}

type SocketData = {
  edges?: EdgeGraph[];
  newTransaction?: Transaction;
  nodes?: NodeGraph[];
}

const TransactionDetailsTable = () => {
  const [transactionsData, setData] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Transaction | null>(null);


  // Sorting State - default to timestamp descending (newest first)
  const [sortBy, setSortBy] = useState<keyof Transaction>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Initial data fetch
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/businesses/transactions/`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        const resultWithIds: Transaction[] = [];
        result.data.forEach((item: Transaction, index: number) => {
          resultWithIds.push({
            ...item,
            id: `tx-${Date.now()}-${index}`
          })
        })
        setData(resultWithIds);
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // WebSocket connection for live updates
  useEffect(() => {
    // Get the shared socket instance
    const socket = getSocket();

    // Define event handler
    const handleGraphUpdate = async (data: SocketData) => {
      if (data && data.newTransaction) {
        const transaction = data.newTransaction;
        
        // Add the new transaction to our data
        setData(prevData => {
          // Create a new array with the new transaction at the beginning
          const newData = [{...transaction, id: `tx-${Date.now()}`}, ...prevData];
          return newData;
        });
        
        // Set new transaction for highlighting
        setNewTransaction(transaction);
        
        // Clear the highlight effect after 3 seconds
        setTimeout(() => {
          setNewTransaction(null);
        }, 3000);
      }
    };

    // Register event listener
    socket.on('graphUpdate', handleGraphUpdate);

    // Cleanup: remove event listener on unmount
    return () => {
      socket.off('graphUpdate', handleGraphUpdate);
    };
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;


  // Handle Search Input Change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
  };

  // Format Timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Format Amount as Dollar
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Handle Sorting
  const handleSort = (property: keyof Transaction) => {
    const isAsc = sortBy === property && sortDirection === "asc";
    setSortDirection(isAsc ? "desc" : "asc");
    setSortBy(property);
  };

  // Filter the transactions based on the search query
  const filteredData = [...transactionsData].filter((transaction) =>
    transaction.from_business?.toLowerCase().includes(searchQuery) ||
    transaction.to_business?.toLowerCase().includes(searchQuery) ||
    transaction.timestamp.toLowerCase().includes(searchQuery) ||
    transaction.amount.toString().includes(searchQuery)
  );

  // Apply Sorting
  const sortedData = [...filteredData].sort((a, b) => {
    const valueA = a[sortBy];
    const valueB = b[sortBy];

    // Special handling for timestamp (date) sorting
    if (sortBy === "timestamp") {
      const dateA = new Date(valueA as string).getTime();
      const dateB = new Date(valueB as string).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }

    if (typeof valueA === "number" && typeof valueB === "number") {
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    }

    if (typeof valueA === "string" && typeof valueB === "string") {
      return sortDirection === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    return 0;
  });

  return (
    <div className="transaction-details-container">

      {/* Header Section */}
      <Box className="header-section">
        <Typography sx={{ fontWeight: "bold" }}>
          Transactions
        </Typography>
      </Box>

      {/* Search Section */}
      <div className="search-section">
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by From, To or Amount..."
          value={searchQuery}
          onChange={handleSearchChange}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </div>

      {/* Table Section */}
      <TableContainer component={Paper} className="table-container">
        <Table 
          aria-label="Detailed Transactions Table"
          size="small"
          className="transaction-table"
        >
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "timestamp"}
                  direction={sortDirection}
                  onClick={() => handleSort("timestamp")}
                  // Set to active by default to show sort direction
                  sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}
                >
                  Time
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "from_business"}
                  direction={sortDirection}
                  onClick={() => handleSort("from_business")}
                >
                  From
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "to_business"}
                  direction={sortDirection}
                  onClick={() => handleSort("to_business")}
                >
                  To
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortBy === "amount"}
                  direction={sortDirection}
                  onClick={() => handleSort("amount")}
                >
                  Amount
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row) => {
              // Check if this is the new transaction that just came in
              const isNewTransaction = newTransaction && 
                row.from === newTransaction.from && 
                row.to === newTransaction.to && 
                row.amount === newTransaction.amount && 
                row.timestamp === newTransaction.timestamp;
                
              return (
                <TableRow 
                  key={row.id}
                  className={isNewTransaction ? 'new-transaction-row' : ''}
                >
                  <TableCell>{formatTimestamp(row.timestamp)}</TableCell>
                  <TableCell>{row.from_business}</TableCell>
                  <TableCell>{row.to_business}</TableCell>
                  <TableCell align="right">{formatAmount(row.amount)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

    </div>
  );
};

export default TransactionDetailsTable;
