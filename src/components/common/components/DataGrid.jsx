import React, { useState, useMemo } from 'react';
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem
} from '@mui/x-data-grid';
import {
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Box
} from '@mui/material';
import { Edit, Delete, MoreVert as MoreVertIcon, Search as SearchIcon } from '@mui/icons-material';
import dayjs from 'dayjs';

const ListTableCustom = ({
  columns,
  rows,
  onEdit,
  onDelete,
  tableName,
  onPackage,
  onPayment,
  showSearch = true,
  onViewDetails,
  onUpcomingPackage
}) => {
  const [deleteId, setDeleteId] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentRowId, setCurrentRowId] = useState(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const handleDeleteOpen = (id) => {
    setDeleteId(id);
    setOpenConfirmDialog(true);
  };

  const handleDelete = () => {
    setOpenConfirmDialog(false);
    onDelete(deleteId);
    setDeleteId(null);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
    setDeleteId(null);
  };

  const handleClick = (event, rowId) => {
    setAnchorEl(event.currentTarget);
    setCurrentRowId(rowId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setCurrentRowId(null);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows;
    return rows.filter((row) =>
      columns.some((col) =>
        row[col.id]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, rows, columns]);

  const dataGridColumns = useMemo(() => {
    const baseColumns = columns.map((col) => ({
      field: col.id,
      headerName: col.label,
      flex: 1,
    }));    

    if (onEdit) {
      baseColumns.push({
        field: 'actions',
        headerName: 'Actions',
        type: 'actions',
        getActions: (params) => {
          const rowId = params.row.id;
          if (tableName.includes("Members")) {
            return [
              <GridActionsCellItem icon={<MoreVertIcon />} label="More" onClick={(e) => handleClick(e, rowId)} />
            ];
          }
          return [
            <GridActionsCellItem icon={<Edit />} label="Edit" onClick={() => onEdit(rowId)} />,
            <GridActionsCellItem icon={<Delete />} label="Delete" onClick={() => handleDeleteOpen(rowId)} />
          ];
        }
      });
    }

    return baseColumns;
  }, [columns, onEdit, tableName]);

  const getRowClassName = (params) => {
    const packageEndDate = dayjs(params.row.packageenddate, 'DD/MM/YYYY');
    if (!packageEndDate.isValid()) return '';

    const daysLeft = packageEndDate.diff(dayjs(), 'day');

    if (daysLeft === 0) return 'row-red';
    if (daysLeft <= 5) return 'row-orange';
    return '';
  };

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      {showSearch && (
        <TextField
          size="small"
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      )}

    <div style={{width: "100%", height: "96%"}}>
      <DataGrid
        rows={filteredRows}
        columns={dataGridColumns}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 25, 50]}
        components={{ Toolbar: GridToolbar }}
        disableRowSelectionOnClick
        disableColumnSelector
        disableCellFocusOutline
        disableColumnResize={true}
        getRowClassName={getRowClassName}
      />
    </div>      

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && currentRowId !== null}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => { handleCloseMenu(); onPackage(currentRowId); }}>Add/Edit Package</MenuItem>
        <MenuItem onClick={() => { handleCloseMenu(); onPayment(currentRowId); }} disabled={rows.find(r => r.id === currentRowId)?.paymentstatusAction}>Payment</MenuItem>
        <MenuItem onClick={() => { handleCloseMenu(); onEdit(currentRowId); }}>Edit</MenuItem>
        <MenuItem onClick={() => { handleCloseMenu(); onViewDetails(currentRowId); }}>View Details</MenuItem>
        <MenuItem onClick={() => { handleCloseMenu(); onUpcomingPackage(currentRowId); }}>Renew Package</MenuItem>
      </Menu>

      <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>Are you sure you want to delete this item?</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} variant="outlined">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListTableCustom;
