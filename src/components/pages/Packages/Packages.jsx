import {Box, Button, Card, CardContent, TextField, Dialog, DialogContent, DialogTitle, Typography} from '@mui/material';
import ListTable from '../../common/components/ListTable';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Formik, Field, Form } from 'formik';
import apiClient from '../../services/apiClientService';
import { toast } from 'react-toastify';
import LoadingIndicator from '../../common/components/LoadingIndicator';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [initialValues, setInitialValues] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const getData = () => {
    setIsLoading(true);
    apiClient.get("/api/Packages").then((data) => {
      setIsLoading(false);
      setPackages(data);
    }).catch((error) => {
      setIsLoading(false);
      toast.error("Error while get " + error, {
        position: "top-right"
      });
    });
  }

  useEffect(() => {
    getData();
  }, []);
  
  const handleEditRoleDiaglog = (id) => {
    setIsEdit(true);
    var data = packages.find(item => item.id == id);
    setInitialValues(data);
    setIsDialogOpen(true);
  }

  const handleAddRoleDiaglog = () => {
    setIsEdit(false);
    setInitialValues({});
    setIsDialogOpen(true);
  }

  const handleDeleteRole = (id) => {
    setIsLoading(true);
    apiClient.delete("/api/Packages/"+id).then(() =>{
      getData();
      toast.success("Package Deleted Successfully !", {
        position: "top-right"
      });
    }).catch((error) =>{
      setIsLoading(false);
      toast.error("Error while delete " + error, {
        position: "top-right"
      });
    }); 
  }

  const onDialogClose = () =>{
    setIsDialogOpen(false);
  }

  const handleFormSubmit = (values) => {
    setIsLoading(true);
    values.cost = values.cost.toString();
    if (isEdit) {
      apiClient.put("/api/Packages/update", values).then((data) => {
        getData();
        setIsDialogOpen(false);
        toast.success("Package Updated Successfully !", {
          position: "top-right"
        });
      }).catch((error) => {
        setIsLoading(false);
        toast.error("Error while Update " + error, {
          position: "top-right"
        });
      });
    } else {
      apiClient.post("/api/Packages/create", values).then((data) => {
        getData();
        setIsDialogOpen(false);
        toast.success("Package Created Successfully !", {
          position: "top-right"
        });
      }).catch((error) => {
        setIsLoading(false);
        toast.error("Error while Create " + error, {
          position: "top-right"
        });
      });      
    } 
  }

  const columns = [
    { id: 'name', label: 'Name' },
    { id: 'description', label: 'Description' },
    { id: 'cost', label: 'Cost' },
    { id: 'duration', label: 'Duration' }
  ];

  return (
    <div className="container">
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <Box sx={{display: "flex", width: "100%", marginBottom: "1rem"}}>
          <Typography variant='h5' className='header-text'>Packages      
            <Button variant="contained" sx={{marginLeft: "auto"}} startIcon={<AddIcon />} onClick={handleAddRoleDiaglog}>Add Packages</Button>
          </Typography>          
        </Box>
        <Card sx={{marginBottom: "10px"}}>
          <CardContent>
            <ListTable columns={columns} rows={packages} onEdit={handleEditRoleDiaglog} onDelete={handleDeleteRole} tableName="Packages"/>
          </CardContent>
        </Card>
      </Box>
      <PackagesDialog open={isDialogOpen} handleClose={onDialogClose} isEdit={isEdit}
        initialValues={initialValues}
        handleFormSubmit={handleFormSubmit}/>
      <LoadingIndicator isLoading={isLoading}/>
    </div>
  );
};

const PackagesDialog = ({open, handleClose, isEdit, initialValues, handleFormSubmit}) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    cost: Yup.number().required('Cost is required').min(0, 'Cost must be greater than 0'),
    duration: Yup.string().required('Duration is required'),
  });

  return (
    <Dialog open={open} onClose={handleClose} PaperProps={{sx: {maxWidth: 800}}}>
      <DialogTitle>{isEdit ? 'Edit Packages' : 'Add Packages'}</DialogTitle>
      <DialogContent sx={{padding: "2rem !important"}}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
        >
          {({ errors, touched }) => (
            <Form>
              <div className='row'>
                <div className='form-group'>
                  <Field
                    name="name"
                    label="Name"
                    as={TextField}
                    fullWidth
                    variant="outlined"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </div>
                <div className='form-group'>
                  <Field
                    name="description"
                    label="Description"
                    as={TextField}
                    fullWidth
                    variant="outlined"
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </div>
              </div>
              <div className='row'>
                <div className='form-group'>
                  <Field
                    name="cost"
                    label="Cost"
                    type="number"
                    as={TextField}
                    fullWidth
                    variant="outlined"
                    error={touched.cost && Boolean(errors.cost)}
                    helperText={touched.cost && errors.cost}
                  />
                </div>
                <div className='form-group'>
                  <Field
                    name="duration"
                    label="Duration"
                    as={TextField}
                    fullWidth
                    variant="outlined"
                    error={touched.duration && Boolean(errors.duration)}
                    helperText={touched.duration && errors.duration}
                  />
                </div>
              </div>
              <div className='row save-btn'>
                <Button type="submit" color="primary" variant="contained">
                  {isEdit ? 'Save Changes' : 'Save'}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default Packages;