import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, IconButton, Paper, Box, TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, Button, Menu, MenuItem, TextField, InputAdornment } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const ListTable = ({ columns, rows, onEdit, onDelete, tableName, onPackage, onPayment, showSearch = true, onViewDetails, onUpcomingPackage }) => {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState(columns[0].id);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [deleteId, setDeleteId] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRowId, setCurrentRowId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);  // Update search query state
  };

  const handleEdit = (id) => {
    handleClose();
    onEdit(id);
  };

  const handleDetails = (id) => {
    handleClose();
    onViewDetails(id);
  }

  const handleUpcomingPackages = (id) => {
    handleClose();
    onUpcomingPackage(id);
  }

  const handlePackage = (id) => {
    handleClose();
    onPackage(id);
  }

  const handlePayment = (id) => {
    handleClose();
    onPayment(id);
  }

  const handleDeleteOpen = (id) => {
    setDeleteId(id);
    setOpenConfirmDialog(true);
  }

  const handleDelete = () => {
    handleClose();
    setOpenConfirmDialog(false);
    setDeleteId(null);
    onDelete(deleteId);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setDeleteId(null);
  }

  const handleClose = () => {
    setAnchorEl(null);
    setCurrentRowId(null);
  };

  const handleClick = (event, rowId) => {
    setAnchorEl(event.currentTarget);
    setCurrentRowId(rowId);
  };

  const filteredRows = rows.filter((row) => {
    return columns.some((column) =>
      row[column.id] ? row[column.id].toString().toLowerCase().includes(searchQuery.toLowerCase()) : false
    );
  });

  const sortedRows = stableSort(filteredRows, getComparator(order, orderBy));
  const displayedRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      {showSearch && <TextField
        size="small"
        label="Search"
        variant="outlined"
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ marginLeft: "auto", marginBottom: 2}}
        slotProps={{input: {endAdornment: <InputAdornment position='end'><SearchIcon/></InputAdornment>}}}
      />} 
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="sortable table">
          <TableHead>
            <TableRow key={0} className='listTableHeader'>
              {columns.map((column) => (
                <TableCell key={column.id}>
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : 'asc'}
                    onClick={(e) => handleRequestSort(e, column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              {onEdit !== undefined ? <TableCell align="center">Actions</TableCell> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedRows.map((row) => (
              <TableRow hover key={row.id}>
                {columns.map((column) => (
                  <TableCell key={row.id+column.id}>{row[column.id]}</TableCell>
                ))}
                {onEdit !== undefined ? ( tableName.indexOf("Members") !== -1 ? 
                (<TableCell align='center'>
                  <div>
                    <IconButton onClick={(event) => handleClick(event, row.id)}>
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && currentRowId === row.id}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                    >
                      <MenuItem onClick={() => handlePackage(row.id)}>Add/Edit Package</MenuItem>
                      <MenuItem onClick={() => handlePayment(row.id)} disabled={row.paymentstatusAction}>Payment</MenuItem>
                      <MenuItem onClick={() => handleEdit(row.id)}>Edit</MenuItem>
                      <MenuItem onClick={() => handleDetails(row.id)}>View Details</MenuItem>
                      <MenuItem onClick={() => handleUpcomingPackages(row.id)}>Upcoming Packages</MenuItem>
                    </Menu>
                  </div>
                </TableCell> ) : ( <TableCell align="center">
                  <IconButton onClick={() => handleEdit(row.id)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteOpen(row.id)} sx={{color: "#db3939"}}>
                    <Delete />
                  </IconButton>
                </TableCell>)) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent sx={{padding: "2rem !important"}}>
          Are you sure you want to delete this item?
        </DialogContent>
        <DialogActions sx={{padding: "1rem"}}>
          <Button onClick={handleCloseConfirmDialog} sx={{backgroundColor: "#dfe3e6", color: "#000"}} variant="contained">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="primary" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListTable;