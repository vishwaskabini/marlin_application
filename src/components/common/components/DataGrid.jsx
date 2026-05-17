import React, { useState, useMemo } from 'react';
import {
  DataGrid,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
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
  onUpcomingPackage,
  menuActions,
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
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});

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
      hideable: col.id !== 'notes',
    }));

    if (onEdit || menuActions) {
      baseColumns.push({
        field: 'actions',
        headerName: 'Actions',
        type: 'actions',
        getActions: (params) => {
          const rowId = params.row.id;
          if (menuActions || tableName.includes("Members")) {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, onEdit, tableName, menuActions]);

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
        slots={{ toolbar: null }}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={(model) => {
          const updated = { ...model };
          columns.forEach((col) => {
            if (col.id === 'notes') updated['notes'] = true;
          });
          setColumnVisibilityModel(updated);
        }}
        disableRowSelectionOnClick
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
        {menuActions
          ? menuActions.map((action) => (
              <MenuItem
                key={action.label}
                onClick={() => { handleCloseMenu(); action.onClick(currentRowId); }}
                disabled={action.disabled ? action.disabled(rows.find(r => r.id === currentRowId)) : false}
              >
                {action.label}
              </MenuItem>
            ))
          : [
              <MenuItem key="package" onClick={() => { handleCloseMenu(); onPackage(currentRowId); }}>Add/Edit Package</MenuItem>,
              <MenuItem key="payment" onClick={() => { handleCloseMenu(); onPayment(currentRowId); }}>Payment</MenuItem>,
              <MenuItem key="edit" onClick={() => { handleCloseMenu(); onEdit(currentRowId); }}>Edit</MenuItem>,
              <MenuItem key="viewdetails" onClick={() => { handleCloseMenu(); onViewDetails(currentRowId); }}>View Details</MenuItem>,
              <MenuItem key="renew" onClick={() => { handleCloseMenu(); onUpcomingPackage(currentRowId); }}>Renew Package</MenuItem>,
            ]
        }
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
