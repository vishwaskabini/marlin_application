import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Card, CardContent, Box, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import ListTable from '../../common/components/ListTable';
import AddIcon from '@mui/icons-material/Add';
import apiClient from '../../services/apiClientService';
import { toast } from 'react-toastify';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [initialValues, setInitialValues] = useState({ id: '', name: ''});

  const getData = () => {
    apiClient.get("/api/Roles").then((data) => {
      setRoles(data);
    }).catch((error) => {
      toast.error("Error while get " + error, {
        position: "top-right"
      });
    });
  }

  useEffect(() => {
    getData();
  }, []);

  const handleFormSubmit = (values) => {
    if (isEdit) {
      apiClient.put("/api/Roles/update", values).then((data) => {
        getData();
        setIsDialogOpen(false);
        toast.success("Role Updated Successfully !", {
          position: "top-right"
        });
      }).catch((error) => {
        toast.error("Error while update " + error, {
          position: "top-right"
        });
      });
    } else {
      apiClient.post("/api/Roles/create", values).then((data) => {
        getData();
        setIsDialogOpen(false);
        toast.success("Role Created Successfully !", {
          position: "top-right"
        });
      }).catch((error) => {
        toast.error("Error while create " + error, {
          position: "top-right"
        });
      });      
    }    
  }

  const handleDeleteRole = (id) => {
    apiClient.delete("/api/Roles/"+id).then(() =>{
      getData();
      toast.success("Role Deleted Successfully !", {
        position: "top-right"
      });
    }).catch((error) =>{
      toast.error("Error while delete " + error, {
        position: "top-right"
      });
    });    
  };

  const handleAddRoleDiaglog = () => {
    setIsEdit(false);
    setInitialValues({ name: '' });
    setIsDialogOpen(true);
  }

  const handleEditRoleDiaglog = (id) => {
    setIsEdit(true);
    var data = roles.find(item => item.id == id);
    setInitialValues(data);
    setIsDialogOpen(true);
  }

  const onDialogClose = () => {
    setIsDialogOpen(false);
  }

  const columns = [
    { id: 'name', label: 'Name' }
  ];  

  return (
    <div className="container">
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
          <Button variant="contained" sx={{marginLeft: "auto"}} startIcon={<AddIcon />} onClick={handleAddRoleDiaglog}>Add Role</Button>
        </Box>
        <Card sx={{marginBottom: "10px"}}>
          <CardContent>
            <ListTable columns={columns} rows={roles} onEdit={handleEditRoleDiaglog} onDelete={handleDeleteRole} tableName="Roles"/>
          </CardContent>
        </Card>
      </Box>
      <RoleDialog open={isDialogOpen} handleClose={onDialogClose} isEdit={isEdit}
        initialValues={initialValues}
        handleFormSubmit={handleFormSubmit}/>
    </div>
  );
};


const RoleDialog = ({ open, handleClose, isEdit, initialValues, handleFormSubmit }) => {
  const validationSchema = Yup.object({
    name: Yup.string().required('Role Name is required')
  });

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{sx: {minWidth: 500}}}>
      <DialogTitle>{isEdit ? 'Edit Role' : 'Add Role'}</DialogTitle>
      <DialogContent sx={{padding: "2rem !important"}}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
          enableReinitialize
        >
          {({ errors, touched }) => (
            <Form>
              <Box display="flex" flexDirection="column" gap="16px">
                <Field name="name">
                  {({ field }) => (
                    <TextField
                      {...field}
                      label="Role Name"
                      variant="outlined"
                      fullWidth
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  )}
                </Field>
              </Box>
              <DialogActions sx={{marginTop: "2rem"}}>
                <Button onClick={handleClose} sx={{backgroundColor: "#dfe3e6", color: "#000"}} variant="contained">
                  Cancel
                </Button>
                <Button type="submit" color="primary" variant="contained">
                  {isEdit ? 'Save Changes' : 'Save'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default Roles;